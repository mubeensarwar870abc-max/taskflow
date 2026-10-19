import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  project: mongoose.Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: mongoose.Types.ObjectId[];
  creator: mongoose.Types.ObjectId;
  dueDate?: Date;
  position: number;
  labels: string[];
  checklist: IChecklistItem[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IChecklistItem>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'in_review', 'done'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    checklist: [ChecklistItemSchema],
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
TaskSchema.index({ project: 1, status: 1, position: 1 });
TaskSchema.index({ assignees: 1 });

// Automatically manage completedAt when status is changed to done
TaskSchema.pre<ITask>('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = undefined;
    }
  }
  next();
});

export const Task: Model<ITask> = mongoose.model<ITask>('Task', TaskSchema);
