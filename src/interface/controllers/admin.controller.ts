import type { Request, Response } from 'express';
import { leaveService } from '../../application/services/index.js';
import type { LeaveStatus } from '../../domain/entities/index.js';

export class AdminController {
    async getAllLeaves(req: Request, res: Response): Promise<void> {
        const { status, user_id, page, limit } = req.query;

        const result = await leaveService.getAllLeaves({
            status: status as LeaveStatus,
            userId: user_id ? parseInt(user_id as string) : undefined,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
        });

        res.json({ success: true, data: result });
    }

    async approveLeave(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        const approvedBy = req.user!.userId;

        const leave = await leaveService.approveLeave(id, approvedBy);
        res.json({
            success: true,
            message: 'Pengajuan cuti berhasil disetujui',
            data: leave,
        });
    }

    async rejectLeave(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        const approvedBy = req.user!.userId;
        const { rejection_reason } = req.body;

        const leave = await leaveService.rejectLeave(id, approvedBy, rejection_reason);
        res.json({
            success: true,
            message: 'Pengajuan cuti ditolak',
            data: leave,
        });
    }

    async getAdminStats(_req: Request, res: Response): Promise<void> {
        const stats = await leaveService.getAdminStats();
        res.json({ success: true, data: stats });
    }
}

export const adminController = new AdminController();
