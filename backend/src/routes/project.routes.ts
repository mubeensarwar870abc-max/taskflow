import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectAnalytics,
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from '../validators/project.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createProjectSchema), createProject);
router.get('/', getProjects);
router.get('/:projectId', getProjectById);
router.patch('/:projectId', validate(updateProjectSchema), updateProject);
router.delete('/:projectId', deleteProject);
router.post('/:projectId/members', validate(addMemberSchema), addMember);
router.delete('/:projectId/members/:userId', removeMember);
router.get('/:projectId/analytics', getProjectAnalytics);

export default router;
