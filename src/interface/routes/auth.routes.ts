import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { validate } from '../middlewares/index.js';
import { loginSchema } from '../validators/schemas.js';

const router = Router();

router.post('/login', validate(loginSchema), (req, res, next) => {
    authController.login(req, res).catch(next);
});

router.post('/logout', (req, res, next) => {
    authController.logout(req, res).catch(next);
});

export { router as authRoutes };
