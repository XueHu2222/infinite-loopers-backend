import Express, { Router } from 'express';
import { getAllCharacters, getCharacter } from '../controllers/characterController.ts';
import { getAllDecorations, getDecoration } from '../controllers/decorationController.ts';
const router: Router = Express.Router();

router.get('/characters', getAllCharacters);
router.get('/characters/:id', getCharacter);
router.get('/decorations', getAllDecorations);
router.get('/decorations/:id', getDecoration);

export default router;
