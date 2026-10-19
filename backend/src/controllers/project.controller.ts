import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { logActivity } from '../services/activityService';
import { createNotification } from '../services/notificationService';
import { emitToProject, emitToUser } from '../services/socketService';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { name, description, color, status, startDate, dueDate, workspaceId } = req.body;

    const project = await Project.create({
      name,
      description: description || '',
      color: color || '#6D5BD0',
      status: status || 'in_progress',
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      workspace: workspaceId ? new mongoose.Types.ObjectId(workspaceId) : undefined,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    await logActivity({
      actor: req.user._id,
      action: 'created_project',
      project: project._id,
      metadata: { projectName: project.name },
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userId = req.user._id;

    // Find projects where user is owner or member
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Calculate live task stats for each project
    const projectIds = projects.map((p) => p._id);
    const taskStats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = new Map();
    taskStats.forEach((s) => {
      statsMap.set(s._id.toString(), {
        totalTasks: s.totalTasks,
        completedTasks: s.completedTasks,
        progress: s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 0,
      });
    });

    const enriched = projects.map((p) => {
      const pObj = p.toObject();
      const st = statsMap.get(p._id.toString()) || { totalTasks: 0, completedTasks: 0, progress: 0 };
      return {
        ...pObj,
        totalTasks: st.totalTasks,
        completedTasks: st.completedTasks,
        progress: st.progress,
      };
    });

    return res.status(200).json({
      success: true,
      projects: enriched,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check authorization
    const userIdStr = req.user!._id.toString();
    const hasAccess =
      project.owner._id.toString() === userIdStr ||
      project.members.some((m) => m.user._id.toString() === userIdStr) ||
      req.user!.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You do not have access to this project' });
    }

    // Get project stats
    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({ project: project._id, status: 'done' });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        totalTasks,
        completedTasks,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const { name, description, color, status, startDate, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check authorization: owner or project admin
    const userIdStr = req.user!._id.toString();
    const isOwner = project.owner.toString() === userIdStr;
    const isAdmin = project.members.some(
      (m) => m.user.toString() === userIdStr && (m.role === 'admin' || m.role === 'owner')
    );

    if (!isOwner && !isAdmin && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only project owner or admin can update settings' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (status) project.status = status;
    if (startDate !== undefined) project.startDate = startDate ? new Date(startDate) : undefined;
    if (dueDate !== undefined) project.dueDate = dueDate ? new Date(dueDate) : undefined;

    await project.save();

    const populated = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    emitToProject(projectId, 'project:updated', populated);

    await logActivity({
      actor: req.user!._id,
      action: 'updated_project',
      project: project._id,
      metadata: { projectName: project.name },
    });

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the project owner can delete this project' });
    }

    // Clean up associated tasks
    await Task.deleteMany({ project: projectId });
    await Project.findByIdAndDelete(projectId);

    emitToProject(projectId, 'project:deleted', { projectId });

    return res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check authorization to invite
    const currentUserIdStr = req.user!._id.toString();
    const canManage =
      project.owner.toString() === currentUserIdStr ||
      project.members.some(
        (m) => m.user.toString() === currentUserIdStr && (m.role === 'admin' || m.role === 'owner')
      ) ||
      req.user!.role === 'admin';

    if (!canManage) {
      return res.status(403).json({ success: false, message: 'Only project owner or admin can add members' });
    }

    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const alreadyMember = project.members.some((m) => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this project' });
    }

    project.members.push({
      user: new mongoose.Types.ObjectId(userId),
      role: role || 'member',
      joinedAt: new Date(),
    });

    await project.save();

    const populated = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    // Notify user
    await createNotification({
      recipient: userId,
      type: 'project_added',
      title: 'Added to Project',
      message: `${req.user!.name} added you to project "${project.name}"`,
      entityType: 'project',
      entityId: project._id,
    });

    await logActivity({
      actor: req.user!._id,
      action: 'added_member',
      project: project._id,
      metadata: { memberName: userToAdd.name, role: role || 'member' },
    });

    emitToProject(projectId, 'project:member_added', {
      project: populated,
      newMember: { id: userToAdd._id, name: userToAdd.name, role: role || 'member' },
    });

    return res.status(200).json({
      success: true,
      message: 'Member added to project',
      project: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const currentUserIdStr = req.user!._id.toString();
    const isOwner = project.owner.toString() === currentUserIdStr;

    // Cannot remove owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project owner' });
    }

    // User can remove themselves or owner/admin can remove them
    const canRemove =
      isOwner ||
      currentUserIdStr === userId ||
      project.members.some(
        (m) => m.user.toString() === currentUserIdStr && m.role === 'admin'
      );

    if (!canRemove) {
      return res.status(403).json({ success: false, message: 'Permission denied to remove member' });
    }

    project.members = project.members.filter((m) => m.user.toString() !== userId);
    await project.save();

    const populated = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    emitToProject(projectId, 'project:member_removed', { projectId, userId });

    return res.status(200).json({
      success: true,
      message: 'Member removed from project',
      project: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ project: projectId });

    const statusCounts = {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      in_review: 0,
      done: 0,
    };

    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    let overdueCount = 0;
    const now = new Date();

    tasks.forEach((t) => {
      if (statusCounts[t.status] !== undefined) {
        statusCounts[t.status]++;
      }
      if (priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      }
      if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'done') {
        overdueCount++;
      }
    });

    const totalTasks = tasks.length;
    const completedTasks = statusCounts.done;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        totalTasks,
        completedTasks,
        progress,
        overdueCount,
        statusCounts,
        priorityCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};
