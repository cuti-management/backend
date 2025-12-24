import { Router } from 'express';
import { leaveController } from '../controllers/index.js';
import { authenticate, requireUser, validate } from '../middlewares/index.js';
import { createLeaveSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate, requireUser);

router.get('/', (req, res, next) => {
    leaveController.getLeaves(req, res).catch(next);
});

router.post('/', validate(createLeaveSchema), (req, res, next) => {
    leaveController.createLeave(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
    leaveController.getLeaveById(req, res).catch(next);
});

router.delete('/:id', (req, res, next) => {
    leaveController.deleteLeave(req, res).catch(next);
});

export { router as leaveRoutes };
