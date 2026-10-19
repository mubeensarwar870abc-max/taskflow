import mongoose, { Document, Schema, Model } from 'mongoose';

export type NotificationType =
  | 'task_assigned'
  | 'project_added'
  | 'task_comment'
  | 'task_status_changed'
  | 'system';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: 'project' | 'task';
  entityId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['task_assigned', 'project_added', 'task_comment', 'task_status_changed', 'system'],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['project', 'task'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);
