import { Router } from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  addWorkspaceMember,
} from '../controllers/workspace.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:workspaceId', getWorkspaceById);
router.patch('/:workspaceId', updateWorkspace);
router.post('/:workspaceId/members', addWorkspaceMember);

export default router;
