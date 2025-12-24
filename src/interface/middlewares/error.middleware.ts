import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError, ValidationError } from '../../shared/errors/index.js';
import { logger } from '../../shared/utils/logger.js';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logger.error(err);

    if (err instanceof ValidationError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan',
    });
};

export const validate = (schema: ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors: Record<string, string[]> = {};
            result.error.errors.forEach((e) => {
                const path = e.path.join('.');
                if (!errors[path]) errors[path] = [];
                errors[path].push(e.message);
            });
            throw new ValidationError('Validasi gagal', errors);
        }
        req.body = result.data;
        next();
    };
};
