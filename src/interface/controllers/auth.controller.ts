import type { Request, Response } from 'express';
import { authService } from '../../application/services/index.js';

export class AuthController {
    async login(req: Request, res: Response): Promise<void> {
        const result = await authService.login(req.body);
        res.json({
            success: true,
            data: result,
        });
    }

    async logout(_req: Request, res: Response): Promise<void> {
        res.json({
            success: true,
            message: 'Logout berhasil',
        });
    }
}

export const authController = new AuthController();
