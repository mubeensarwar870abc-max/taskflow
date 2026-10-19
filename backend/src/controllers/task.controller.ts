import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { Comment } from '../models/Comment';
import { logActivity } from '../services/activityService';
import { createNotification } from '../services/notificationService';
import { emitToProject } from '../services/socketService';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assignees, dueDate, labels, checklist } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Get highest position in the selected column
    const highestTask = await Task.findOne({ project: projectId, status: status || 'todo' })
      .sort({ position: -1 })
      .select('position');
    const position = highestTask ? highestTask.position + 1000 : 1000;

    // If no assignees provided, default to creator so it is assigned to the creator
    const effectiveAssignees =
      assignees && assignees.length > 0
        ? assignees.map((id: string) => new mongoose.Types.ObjectId(id))
        : [req.user!._id];

    const task = await Task.create({
      title,
      description: description || '',
      project: projectId,
      status: status || 'todo',
      priority: priority || 'medium',
      assignees: effectiveAssignees,
      creator: req.user!._id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      position,
      labels: labels || [],
      checklist: checklist || [],
    });

    const populated = await Task.findById(task._id)
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar');

    // Notify assignees (except creator if they assigned themselves)
    if (assignees && assignees.length > 0) {
      for (const assigneeId of assignees) {
        if (assigneeId.toString() !== req.user!._id.toString()) {
          await createNotification({
            recipient: assigneeId,
            type: 'task_assigned',
            title: 'Task Assigned',
            message: `${req.user!.name} assigned you to task "${task.title}" in project "${project.name}"`,
            entityType: 'task',
            entityId: task._id,
          });
        }
      }
    }

    await logActivity({
      actor: req.user!._id,
      action: 'created_task',
      project: project._id,
      task: task._id,
      metadata: { taskTitle: task.title, status: task.status },
    });

    emitToProject(projectId, 'task:created', populated);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const { status, priority, search } = req.query;

    const filter: any = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: (search as string).trim(), $options: 'i' } },
        { description: { $regex: (search as string).trim(), $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar')
      .sort({ position: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar')
      .populate('project', 'name color owner');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignees, dueDate, labels, checklist, position } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const previousAssignees = task.assignees.map((a) => a.toString());
    const previousStatus = task.status;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (labels !== undefined) task.labels = labels;
    if (checklist !== undefined) task.checklist = checklist;
    if (position !== undefined) task.position = position;

    if (assignees !== undefined) {
      task.assignees = assignees.map((id: string) => new mongoose.Types.ObjectId(id));
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar')
      .populate('project', 'name color');

    // Notify newly assigned members
    if (assignees) {
      const newlyAssigned = assignees.filter(
        (id: string) => !previousAssignees.includes(id) && id !== req.user!._id.toString()
      );
      for (const newUserId of newlyAssigned) {
        await createNotification({
          recipient: newUserId,
          type: 'task_assigned',
          title: 'Task Assigned',
          message: `${req.user!.name} assigned you to task "${task.title}"`,
          entityType: 'task',
          entityId: task._id,
        });
      }
    }

    // Log activity if status changed
    if (status && status !== previousStatus) {
      await logActivity({
        actor: req.user!._id,
        action: 'task_status_changed',
        project: task.project,
        task: task._id,
        metadata: { taskTitle: task.title, oldStatus: previousStatus, newStatus: status },
      });
    } else {
      await logActivity({
        actor: req.user!._id,
        action: 'task_updated',
        project: task.project,
        task: task._id,
        metadata: { taskTitle: task.title },
      });
    }

    emitToProject(task.project.toString(), 'task:updated', populated);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const { status, position } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const oldStatus = task.status;
    task.status = status;
    if (position !== undefined) {
      task.position = position;
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar');

    await logActivity({
      actor: req.user!._id,
      action: 'task_status_changed',
      project: task.project,
      task: task._id,
      metadata: { taskTitle: task.title, oldStatus, newStatus: status },
    });

    emitToProject(task.project.toString(), 'task:status_changed', {
      taskId: task._id,
      status,
      position: task.position,
      task: populated,
    });

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      task: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const projectId = task.project.toString();
    const taskTitle = task.title;

    await Comment.deleteMany({ task: taskId });
    await Task.findByIdAndDelete(taskId);

    await logActivity({
      actor: req.user!._id,
      action: 'task_deleted',
      project: task.project,
      metadata: { taskTitle },
    });

    emitToProject(projectId, 'task:deleted', { taskId });

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { status, priority, filter } = req.query;
    const query: any = {
      $or: [
        { assignees: req.user._id },
        { creator: req.user._id },
      ],
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (filter === 'overdue') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'done' };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar')
      .sort({ dueDate: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};
