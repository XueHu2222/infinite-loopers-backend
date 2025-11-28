import Express, { Router } from 'express';
import { addTask, getTasks } from '../controllers/taskController.ts';
import Cors from 'cors';


const router: Router = Express.Router();


router.get('/tasks/:userId', getTasks);
router.post('/tasks/:userId', addTask);

export default router;
