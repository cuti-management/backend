import { prisma } from '../../infrastructure/database/prisma.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../shared/errors/index.js';
import { getLeaveTypeLabel, type LeaveType, type LeaveStatus } from '../../domain/entities/index.js';

// Type for leave request records from Prisma
type LeaveRecord = Awaited<ReturnType<typeof prisma.leaveRequest.findMany>>[number];

export interface CreateLeaveInput {
    userId: number;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
}

export interface LeaveQueryParams {
    userId?: number;
    status?: LeaveStatus;
    page?: number;
    limit?: number;
}

export class LeaveService {
    async createLeave(input: CreateLeaveInput) {
        const leave = await prisma.leaveRequest.create({
            data: {
                userId: input.userId,
                leaveType: input.leaveType,
                startDate: new Date(input.startDate),
                endDate: new Date(input.endDate),
                days: input.days,
                reason: input.reason,
                status: 'pending',
            },
        });

        return this.formatLeave(leave);
    }

    async getLeavesByUser(userId: number, params: LeaveQueryParams = {}) {
        const { status, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        const where = {
            userId,
            ...(status && { status }),
        };

        const [leaves, total] = await Promise.all([
            prisma.leaveRequest.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.leaveRequest.count({ where }),
        ]);

        return {
            leaves: leaves.map(this.formatLeave),
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async getLeaveById(id: number, userId?: number) {
        const leave = await prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, department: true } },
                approver: { select: { id: true, name: true } },
            },
        });

        if (!leave) {
            throw new NotFoundError('Pengajuan cuti tidak ditemukan');
        }

        if (userId && leave.userId !== userId) {
            throw new ForbiddenError('Anda tidak memiliki akses');
        }

        return {
            ...this.formatLeave(leave),
            user: leave.user,
            approved_by_user: leave.approver,
        };
    }

    async deleteLeave(id: number, userId: number) {
        const leave = await prisma.leaveRequest.findUnique({ where: { id } });

        if (!leave) {
            throw new NotFoundError('Pengajuan cuti tidak ditemukan');
        }

        if (leave.userId !== userId) {
            throw new ForbiddenError('Anda tidak memiliki akses');
        }

        if (leave.status !== 'pending') {
            throw new BadRequestError('Hanya pengajuan pending yang dapat dihapus');
        }

        await prisma.leaveRequest.delete({ where: { id } });
    }

    async getUserStats(userId: number) {
        const leaves = await prisma.leaveRequest.findMany({
            where: { userId },
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { annualLeaveQuota: true },
        });

        const approved = leaves.filter((l: LeaveRecord) => l.status === 'approved');
        const usedQuota = approved.reduce((sum: number, l: LeaveRecord) => sum + l.days, 0);

        return {
            total_requests: leaves.length,
            pending: leaves.filter((l: LeaveRecord) => l.status === 'pending').length,
            approved: approved.length,
            rejected: leaves.filter((l: LeaveRecord) => l.status === 'rejected').length,
            annual_quota: user?.annualLeaveQuota || 12,
            used_quota: usedQuota,
            remaining_quota: (user?.annualLeaveQuota || 12) - usedQuota,
        };
    }

    async getAllLeaves(params: LeaveQueryParams = {}) {
        const { userId, status, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        const where = {
            ...(userId && { userId }),
            ...(status && { status }),
        };

        const [leaves, total] = await Promise.all([
            prisma.leaveRequest.findMany({
                where,
                include: { user: { select: { id: true, name: true, department: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.leaveRequest.count({ where }),
        ]);

        return {
            leaves: leaves.map((l: LeaveRecord & { user: { id: number; name: string; department: string | null } }) => ({
                ...this.formatLeave(l),
                user: l.user,
            })),
            pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
        };
    }

    async approveLeave(id: number, approvedBy: number) {
        const leave = await prisma.leaveRequest.findUnique({ where: { id } });

        if (!leave) throw new NotFoundError('Pengajuan cuti tidak ditemukan');
        if (leave.status !== 'pending') throw new BadRequestError('Pengajuan sudah diproses');

        const updated = await prisma.leaveRequest.update({
            where: { id },
            data: { status: 'approved', approvedBy, approvedAt: new Date() },
        });

        return this.formatLeave(updated);
    }

    async rejectLeave(id: number, approvedBy: number, rejectionReason: string) {
        const leave = await prisma.leaveRequest.findUnique({ where: { id } });

        if (!leave) throw new NotFoundError('Pengajuan cuti tidak ditemukan');
        if (leave.status !== 'pending') throw new BadRequestError('Pengajuan sudah diproses');

        const updated = await prisma.leaveRequest.update({
            where: { id },
            data: { status: 'rejected', approvedBy, approvedAt: new Date(), rejectionReason },
        });

        return this.formatLeave(updated);
    }

    async getAdminStats() {
        const [total, pending, approved, rejected, totalUsers, thisMonth] = await Promise.all([
            prisma.leaveRequest.count(),
            prisma.leaveRequest.count({ where: { status: 'pending' } }),
            prisma.leaveRequest.count({ where: { status: 'approved' } }),
            prisma.leaveRequest.count({ where: { status: 'rejected' } }),
            prisma.user.count({ where: { role: 'user' } }),
            prisma.leaveRequest.count({
                where: {
                    createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
                },
            }),
        ]);

        return { total_requests: total, pending, approved, rejected, total_users: totalUsers, this_month_requests: thisMonth };
    }

    private formatLeave(leave: any) {
        return {
            id: leave.id,
            leave_type: leave.leaveType,
            leave_type_label: getLeaveTypeLabel(leave.leaveType as LeaveType),
            start_date: leave.startDate.toISOString().split('T')[0],
            end_date: leave.endDate.toISOString().split('T')[0],
            days: leave.days,
            reason: leave.reason,
            status: leave.status,
            approved_by: leave.approvedBy,
            approved_at: leave.approvedAt?.toISOString() || null,
            rejection_reason: leave.rejectionReason,
            created_at: leave.createdAt?.toISOString() || new Date().toISOString(),
        };
    }
}

export const leaveService = new LeaveService();
