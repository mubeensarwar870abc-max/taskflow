import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  task: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [3000, 'Comment cannot exceed 3000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

export const Comment: Model<IComment> = mongoose.model<IComment>('Comment', CommentSchema);
