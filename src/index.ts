import express from 'express';
import cors from 'cors';
import { config } from './infrastructure/config/index.js';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/prisma.js';
import { authRoutes, leaveRoutes, userRoutes, adminRoutes } from './interface/routes/index.js';
import { errorHandler, notFoundHandler } from './interface/middlewares/index.js';
import { logger } from './shared/utils/logger.js';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    await disconnectDatabase();
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const start = async (): Promise<void> => {
    try {
        await connectDatabase();

        app.listen(config.port, () => {
            logger.info(`Server running on http://localhost:${config.port}`);
            logger.info(`Environment: ${config.env}`);
        });
    } catch (error) {
        logger.error(error, 'Failed to start server');
        process.exit(1);
    }
};

start();

export { app };
