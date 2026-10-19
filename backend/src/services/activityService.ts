import mongoose from 'mongoose';
import { Activity } from '../models/Activity';
import { emitToProject } from './socketService';

interface LogActivityParams {
  actor: mongoose.Types.ObjectId | string;
  action: string;
  project: mongoose.Types.ObjectId | string;
  task?: mongoose.Types.ObjectId | string;
  metadata?: Record<string, any>;
}

export const logActivity = async (params: LogActivityParams) => {
  try {
    const activity = await Activity.create({
      actor: params.actor,
      action: params.action,
      project: params.project,
      task: params.task,
      metadata: params.metadata || {},
    });

    const populated = await Activity.findById(activity._id).populate('actor', 'name email avatar');

    // Broadcast to project room
    emitToProject(params.project.toString(), 'activity:new', populated);

    return populated;
  } catch (error) {
    console.error('[ActivityService] Error logging activity:', error);
  }
};
