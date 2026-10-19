import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProjectMember {
  user: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  workspace?: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  members: IProjectMember[];
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'archived';
  color: string;
  startDate?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [ProjectMemberSchema],
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'completed', 'on_hold', 'archived'],
      default: 'in_progress',
      index: true,
    },
    color: {
      type: String,
      default: '#6D5BD0',
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly find projects for a given user
ProjectSchema.index({ 'members.user': 1 });

export const Project: Model<IProject> = mongoose.model<IProject>('Project', ProjectSchema);
