import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User, IUser } from '../models/User';
import { Project } from '../models/Project';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Fetch user from DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

// Check if user has access to a project
export const authorizeProjectAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const userIdStr = req.user._id.toString();
    const isOwner = project.owner.toString() === userIdStr;
    const isMember = project.members.some((m) => m.user.toString() === userIdStr);

    if (!isOwner && !isMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this project',
      });
    }

    // Attach project to request for downstream handlers
    (req as any).project = project;
    next();
  } catch (error) {
    next(error);
  }
};
