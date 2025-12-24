import type { Request, Response } from 'express';
import { leaveService } from '../../application/services/index.js';
import type { LeaveStatus } from '../../domain/entities/index.js';

export class LeaveController {
    async getLeaves(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const { status, page, limit } = req.query;

        const result = await leaveService.getLeavesByUser(userId, {
            status: status as LeaveStatus,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
        });

        res.json({ success: true, data: result });
    }

    async createLeave(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const { leave_type, start_date, end_date, days, reason } = req.body;

        const leave = await leaveService.createLeave({
            userId,
            leaveType: leave_type,
            startDate: start_date,
            endDate: end_date,
            days,
            reason,
        });

        res.status(201).json({
            success: true,
            message: 'Pengajuan cuti berhasil dibuat',
            data: leave,
        });
    }

    async getLeaveById(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const id = parseInt(req.params.id);

        const leave = await leaveService.getLeaveById(id, userId);
        res.json({ success: true, data: leave });
    }

    async deleteLeave(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const id = parseInt(req.params.id);

        await leaveService.deleteLeave(id, userId);
        res.json({ success: true, message: 'Pengajuan cuti berhasil dihapus' });
    }

    async getUserStats(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const stats = await leaveService.getUserStats(userId);
        res.json({ success: true, data: stats });
    }
}

export const leaveController = new LeaveController();
