import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId;
  action: string;
  project: mongoose.Types.ObjectId;
  task?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

ActivitySchema.index({ project: 1, createdAt: -1 });

export const Activity: Model<IActivity> = mongoose.model<IActivity>('Activity', ActivitySchema);
