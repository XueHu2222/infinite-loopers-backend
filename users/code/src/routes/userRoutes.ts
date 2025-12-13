import Express, { Router } from 'express';
import { buyCharacter, getAllUserCharacters, getCurrentCharacter, getUser } from '../controllers/userCharacterController.ts';
const router: Router = Express.Router();

router.get('/:id', getUser);
router.get('/:id/characters', getAllUserCharacters);
router.post('/:id/characters', buyCharacter);
router.get('/:id/characters/current', getCurrentCharacter);
export default router;
