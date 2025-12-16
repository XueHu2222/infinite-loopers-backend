import Express, { Router } from 'express';
import { addTask, getTasks, completeTask, updateTask } from '../controllers/taskController.ts';
import { getProgress } from '../controllers/progressController.ts';
import Cors from 'cors';

const router: Router = Express.Router();

router.get('/progress/:userId', getProgress);

router.get('/:userId', getTasks);
router.post('/:userId', addTask);

// Update task details (notes, suggestions, subtasks, etc.)
router.put('/:taskId', updateTask);

router.put('/:taskId/complete', completeTask);

export default router;
