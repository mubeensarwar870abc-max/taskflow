import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:notificationId/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
