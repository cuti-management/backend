import type { Request, Response, NextFunction } from 'express';
import { authService, type JwtPayload } from '../../application/services/index.js';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors/index.js';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Token tidak ditemukan');
    }

    const token = authHeader.split(' ')[1];
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'admin') {
        throw new ForbiddenError('Akses ditolak. Hanya admin yang diizinkan.');
    }
    next();
};

export const requireUser = (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
        throw new UnauthorizedError('Autentikasi diperlukan');
    }
    next();
};
