import { Router } from 'express';
import { adminController } from '../controllers/index.js';
import { authenticate, requireAdmin, validate } from '../middlewares/index.js';
import { rejectLeaveSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/leaves', (req, res, next) => {
    adminController.getAllLeaves(req, res).catch(next);
});

router.put('/leaves/:id/approve', (req, res, next) => {
    adminController.approveLeave(req, res).catch(next);
});

router.put('/leaves/:id/reject', validate(rejectLeaveSchema), (req, res, next) => {
    adminController.rejectLeave(req, res).catch(next);
});

router.get('/stats', (req, res, next) => {
    adminController.getAdminStats(req, res).catch(next);
});

export { router as adminRoutes };
