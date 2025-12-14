import Express, { Router } from 'express';
import {login, register } from '../controllers/authController.ts';
const router: Router = Express.Router();

router.post('/register', register);
router.post('/login', login);

export default router;
