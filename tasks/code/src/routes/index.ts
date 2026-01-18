import Express, { Router } from 'express';
import { getProgress } from '../controllers/progressController.ts';
import { addTask, getTasks, completeTask, updateTask, deleteTask } from '../controllers/taskController.ts';


const router: Router = Express.Router();

router.get('/progress/:userId', getProgress);

router.get('/:userId', getTasks);
router.post('/:userId', addTask);

// Update task details (notes, suggestions, subtasks, etc.)
router.put('/:taskId', updateTask);

router.put('/:taskId/complete', completeTask);
router.delete('/:taskId', deleteTask);

export default router;
