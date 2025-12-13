import Express, { Router } from 'express';
import { getAllCharacters, getCharacter } from '../controllers/characterController.ts';
const router: Router = Express.Router();

router.get('/characters', getAllCharacters);
router.get('/characters/:id', getCharacter);
export default router;
