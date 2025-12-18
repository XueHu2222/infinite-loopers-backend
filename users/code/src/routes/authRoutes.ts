import Express, { Router } from 'express';
import {login, logout, register } from '../controllers/authController.ts';
const router: Router = Express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

export default router;
