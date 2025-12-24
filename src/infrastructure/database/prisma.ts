import { PrismaClient } from '@prisma/client';
import { logger } from '../../shared/utils/logger.js';

const prisma = new PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
    ],
});

prisma.$on('query' as never, (e: { query: string; duration: number }) => {
    logger.debug({ query: e.query, duration: `${e.duration}ms` }, 'Database query');
});

export const connectDatabase = async (): Promise<void> => {
    try {
        await prisma.$connect();
        logger.info('Database connected successfully');
    } catch (error) {
        logger.error(error, 'Failed to connect to database');
        process.exit(1);
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    await prisma.$disconnect();
    logger.info('Database disconnected');
};

export { prisma };
