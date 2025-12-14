import Express, { Router } from 'express';
import { addTask, getTasks, completeTask } from '../controllers/taskController.ts';
import Cors from 'cors';


const router: Router = Express.Router();


router.get('/:userId', getTasks);
router.post('/:userId', addTask);
router.put('/:taskId/complete', completeTask);

export default router;
