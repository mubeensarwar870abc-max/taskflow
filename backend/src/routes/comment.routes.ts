import { Router } from 'express';
import {
  getTaskComments,
  createComment,
  deleteComment,
} from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema } from '../validators/comment.validator';

const router = Router();

router.use(authenticate);

router.get('/task/:taskId', getTaskComments);
router.post('/task/:taskId', validate(createCommentSchema), createComment);
router.delete('/:commentId', deleteComment);

export default router;
