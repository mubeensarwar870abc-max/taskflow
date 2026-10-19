import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/Comment';
import { Task } from '../models/Task';
import { createNotification } from '../services/notificationService';
import { emitToProject } from '../services/socketService';

export const getTaskComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      task: taskId,
      author: req.user!._id,
      text,
    });

    const populated = await Comment.findById(comment._id).populate('author', 'name email avatar');

    // Notify task creator and assignees (if not the author)
    const authorIdStr = req.user!._id.toString();
    const recipientsToNotify = new Set<string>();

    if (task.creator.toString() !== authorIdStr) {
      recipientsToNotify.add(task.creator.toString());
    }

    task.assignees.forEach((assigneeId) => {
      if (assigneeId.toString() !== authorIdStr) {
        recipientsToNotify.add(assigneeId.toString());
      }
    });

    for (const recipientId of recipientsToNotify) {
      await createNotification({
        recipient: recipientId,
        type: 'task_comment',
        title: 'New Comment',
        message: `${req.user!.name} commented on "${task.title}": "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
        entityType: 'task',
        entityId: task._id,
      });
    }

    // Broadcast to project room so all active board & task viewers get real-time comment updates
    emitToProject(task.project.toString(), 'comment:new', {
      taskId: task._id,
      comment: populated,
    });

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only comment author can delete it' });
    }

    const task = await Task.findById(comment.task);
    await Comment.findByIdAndDelete(commentId);

    if (task) {
      emitToProject(task.project.toString(), 'comment:deleted', {
        taskId: task._id,
        commentId,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
