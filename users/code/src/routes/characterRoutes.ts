import Express, { Router } from 'express';
import { getAllCharacters } from '../controllers/characterController.ts';
const router: Router = Express.Router();

router.get('/', getAllCharacters);
export default router;
