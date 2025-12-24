import { Router } from 'express';
import { leaveController } from '../controllers/index.js';
import { authenticate, requireUser } from '../middlewares/index.js';

const router = Router();

router.use(authenticate, requireUser);

router.get('/stats', (req, res, next) => {
    leaveController.getUserStats(req, res).catch(next);
});

export { router as userRoutes };
