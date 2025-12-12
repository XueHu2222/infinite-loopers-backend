import Express, { Router } from 'express';
import { getUserIdByEmail, login, logout, register } from '../controllers/authController.ts';
const router: Router = Express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/userId', getUserIdByEmail);

export default router;
