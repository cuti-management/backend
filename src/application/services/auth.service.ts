import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../infrastructure/database/prisma.js';
import { config } from '../../infrastructure/config/index.js';
import { UnauthorizedError } from '../../shared/errors/index.js';
import { toUserPublic, type UserPublic } from '../../domain/entities/index.js';

export interface LoginInput {
    username: string;
    password: string;
}

export interface LoginResult {
    token: string;
    user: UserPublic;
}

export interface JwtPayload {
    userId: number;
    username: string;
    role: string;
}

export class AuthService {
    async login(input: LoginInput): Promise<LoginResult> {
        const user = await prisma.user.findUnique({
            where: { username: input.username },
        });

        if (!user) {
            throw new UnauthorizedError('Username atau password salah');
        }

        const isValidPassword = await bcrypt.compare(input.password, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedError('Username atau password salah');
        }

        const payload: JwtPayload = {
            userId: user.id,
            username: user.username,
            role: user.role || 'user',
        };

        const token = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        } as jwt.SignOptions);

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: (user.role || 'user') as 'admin' | 'user',
                department: user.department,
                annualLeaveQuota: user.annualLeaveQuota || 12,
            },
        };
    }

    verifyToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, config.jwt.secret) as JwtPayload;
        } catch {
            throw new UnauthorizedError('Token tidak valid');
        }
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }
}

export const authService = new AuthService();
