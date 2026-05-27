import express from 'express';
import * as taskController from '../controllers/taskController.js';
import { authMiddleware } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;