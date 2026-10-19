import { Router } from 'express';
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMyTasks,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validator';

const router = Router();

router.use(authenticate);

// Dedicated "My Tasks" across projects
router.get('/my', getMyTasks);

// Project-scoped task routes
router.post('/project/:projectId', validate(createTaskSchema), createTask);
router.get('/project/:projectId', getProjectTasks);

// Individual task routes
router.get('/:taskId', getTaskById);
router.patch('/:taskId', validate(updateTaskSchema), updateTask);
router.patch('/:taskId/status', validate(updateTaskStatusSchema), updateTaskStatus);
router.delete('/:taskId', deleteTask);

export default router;
