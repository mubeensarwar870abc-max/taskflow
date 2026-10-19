import { Router } from 'express';
import {
  updateProfile,
  changePassword,
  searchUsers,
  getAllUsers,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

router.use(authenticate);

router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.patch('/password', validate(changePasswordSchema), changePassword);

export default router;
