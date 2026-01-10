import Express, { Router } from 'express';
import { buyCharacter, buyDecoration, equipCharacter, getAllUserCharacters, getAllUserDecorations, getCurrentCharacter, getUser } from '../controllers/userCharacterController.ts';
import { getPlacedDecorations, placeDecoration } from '../controllers/userDecorationController.ts';
import { getTourStatus, finishTour } from '../controllers/userTourController.ts';
const router: Router = Express.Router();

router.get('/status', getTourStatus);
router.patch('/finish-tour', finishTour);

router.get('/:id', getUser);

router.get('/:id/characters', getAllUserCharacters);
router.post('/:id/characters', buyCharacter);

router.get('/:id/decorations', getAllUserDecorations);
router.post('/:id/decorations', buyDecoration);
router.get('/:id/decorations/placed', getPlacedDecorations);
router.put('/:id/decorations/placed', placeDecoration);

router.get('/:id/characters/current', getCurrentCharacter);
router.put('/:id/characters/current', equipCharacter);

export default router;
