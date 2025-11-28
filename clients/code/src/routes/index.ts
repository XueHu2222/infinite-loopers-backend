import Express, { Router } from 'express';
import { getUserIdByEmail, login, register } from '../controllers/authController.ts';
const router: Router = Express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/userid', getUserIdByEmail);

export default router;
