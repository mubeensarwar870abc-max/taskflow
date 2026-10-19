import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Workspace } from '../models/Workspace';
import { User } from '../models/User';

export const createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    const populated = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      workspace: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userId = req.user._id;

    const workspaces = await Workspace.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      workspaces,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    return res.status(200).json({
      success: true,
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (workspace.owner.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only workspace owner can update it' });
    }

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;

    await workspace.save();

    return res.status(200).json({
      success: true,
      message: 'Workspace updated successfully',
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const addWorkspaceMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId } = req.params;
    const { userId, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'User to add not found' });
    }

    const alreadyMember = workspace.members.some((m) => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    workspace.members.push({
      user: new mongoose.Types.ObjectId(userId),
      role: role || 'member',
      joinedAt: new Date(),
    });

    await workspace.save();

    const populated = await Workspace.findById(workspaceId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    return res.status(200).json({
      success: true,
      message: 'Member added to workspace',
      workspace: populated,
    });
  } catch (error) {
    next(error);
  }
};
