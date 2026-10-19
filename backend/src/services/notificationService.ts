import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';
import { emitToUser } from './socketService';

interface CreateNotificationParams {
  recipient: mongoose.Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: 'project' | 'task';
  entityId?: mongoose.Types.ObjectId | string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await Notification.create({
      recipient: params.recipient,
      type: params.type,
      title: params.title,
      message: params.message,
      entityType: params.entityType,
      entityId: params.entityId,
      read: false,
    });

    // Send real-time notification to the recipient's personal room
    emitToUser(params.recipient.toString(), 'notification:new', notification);

    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error);
  }
};
