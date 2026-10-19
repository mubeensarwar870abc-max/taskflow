import { Request, Response, NextFunction } from 'express';
import { Activity } from '../models/Activity';

export const getProjectActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;

    const activities = await Activity.find({ project: projectId })
      .populate('actor', 'name email avatar')
      .populate('task', 'title status')
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    next(error);
  }
};
