import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { name, avatar, preferences } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.emailNotifications !== undefined) {
        user.preferences.emailNotifications = preferences.emailNotifications;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string) || '';
    const filter: any = {};

    if (query.trim()) {
      filter.$or = [
        { name: { $regex: query.trim(), $options: 'i' } },
        { email: { $regex: query.trim(), $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('name email avatar role')
      .limit(20);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find()
      .select('name email avatar role createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};
