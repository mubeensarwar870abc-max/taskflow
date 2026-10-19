import mongoose from 'mongoose';
import { User } from '../models/User';
import { Workspace } from '../models/Workspace';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { Activity } from '../models/Activity';
import { Notification } from '../models/Notification';
import { config } from '../config/env';

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data');

    // 1. Create Users (inspired by the friendly faces on the reference dashboard)
    const demoUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex@taskflow.dev',
      password: 'password123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      preferences: { theme: 'light', emailNotifications: true },
    });

    const maxStone = await User.create({
      name: 'Max Stone',
      email: 'max@taskflow.dev',
      password: 'password123',
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      preferences: { theme: 'light', emailNotifications: true },
    });

    const grishaJack = await User.create({
      name: 'Grisha Jack',
      email: 'grisha@taskflow.dev',
      password: 'password123',
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      preferences: { theme: 'light', emailNotifications: true },
    });

    const leviPatrick = await User.create({
      name: 'Levi Patrick',
      email: 'levi@taskflow.dev',
      password: 'password123',
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      preferences: { theme: 'light', emailNotifications: true },
    });

    const codyBryan = await User.create({
      name: 'Cody Bryan',
      email: 'cody@taskflow.dev',
      password: 'password123',
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      preferences: { theme: 'light', emailNotifications: true },
    });

    console.log('[Seed] Created 5 users');

    // 2. Create Workspace
    const workspace = await Workspace.create({
      name: "Acme Tech Workspace",
      description: "Primary engineering and product collaborative hub",
      owner: demoUser._id,
      members: [
        { user: demoUser._id, role: 'owner', joinedAt: new Date() },
        { user: maxStone._id, role: 'admin', joinedAt: new Date() },
        { user: grishaJack._id, role: 'member', joinedAt: new Date() },
        { user: leviPatrick._id, role: 'member', joinedAt: new Date() },
        { user: codyBryan._id, role: 'member', joinedAt: new Date() },
      ],
    });

    // 3. Create 3 primary projects matching the reference dashboard widgets
    // Card 1: Bicycle Drill -> Mobile App Redesign (45% progress, 2 days left)
    const project1 = await Project.create({
      name: 'Mobile App Redesign',
      description: 'Next generation iOS and Android customer experience with native fluid components.',
      color: '#6D5BD0',
      status: 'in_progress',
      workspace: workspace._id,
      owner: demoUser._id,
      members: [
        { user: demoUser._id, role: 'owner', joinedAt: new Date() },
        { user: maxStone._id, role: 'admin', joinedAt: new Date() },
        { user: grishaJack._id, role: 'member', joinedAt: new Date() },
      ],
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });

    // Card 2: Jogging Hero -> Cloud Infrastructure Migration (13% progress, 17 days left)
    const project2 = await Project.create({
      name: 'Cloud Infrastructure',
      description: 'Migrating microservices and databases to scalable multi-region clusters.',
      color: '#3B82F6',
      status: 'in_progress',
      workspace: workspace._id,
      owner: demoUser._id,
      members: [
        { user: demoUser._id, role: 'owner', joinedAt: new Date() },
        { user: leviPatrick._id, role: 'member', joinedAt: new Date() },
        { user: codyBryan._id, role: 'member', joinedAt: new Date() },
      ],
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    });

    // Card 3: Healthy Busy -> Design System & UI Kit (90% progress, 2 days left)
    const project3 = await Project.create({
      name: 'Design System & UI Kit',
      description: 'Unified React component library, design tokens, and accessibility guidelines.',
      color: '#EC4899',
      status: 'in_progress',
      workspace: workspace._id,
      owner: demoUser._id,
      members: [
        { user: demoUser._id, role: 'owner', joinedAt: new Date() },
        { user: grishaJack._id, role: 'member', joinedAt: new Date() },
        { user: maxStone._id, role: 'member', joinedAt: new Date() },
      ],
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });

    // 4. Create Tasks for Project 1 (Mobile App Redesign)
    const task1 = await Task.create({
      title: 'Design onboarding flow wireframes',
      description: 'Create low and high fidelity Figma screens for the onboarding carousel and signup.',
      project: project1._id,
      status: 'done',
      priority: 'high',
      assignees: [demoUser._id, grishaJack._id],
      creator: demoUser._id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      position: 1000,
      labels: ['Design', 'UX'],
      checklist: [
        { id: '1', text: 'Define user personas', completed: true },
        { id: '2', text: 'Build Figma prototypes', completed: true },
      ],
      completedAt: new Date(),
    });

    const task2 = await Task.create({
      title: 'Implement Dark & Light mode theme toggle',
      description: 'Support Tailwind darkMode class with local storage persistence and smooth transition.',
      project: project1._id,
      status: 'in_progress',
      priority: 'urgent',
      assignees: [demoUser._id],
      creator: demoUser._id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      position: 2000,
      labels: ['Frontend', 'UI'],
      checklist: [
        { id: '1', text: 'Add Tailwind theme configuration', completed: true },
        { id: '2', text: 'Build header toggle button', completed: true },
        { id: '3', text: 'Test contrast in dark mode', completed: false },
      ],
    });

    const task3 = await Task.create({
      title: 'Integrate real-time Socket.IO board updates',
      description: 'Ensure Kanban status changes and comments sync immediately across all connected tabs.',
      project: project1._id,
      status: 'todo',
      priority: 'high',
      assignees: [maxStone._id],
      creator: demoUser._id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      position: 3000,
      labels: ['Backend', 'WebSockets'],
      checklist: [
        { id: '1', text: 'Set up room access controls', completed: true },
        { id: '2', text: 'Broadcast events to project members', completed: false },
      ],
    });

    const task4 = await Task.create({
      title: 'Audit accessibility and keyboard navigation',
      description: 'Verify focus rings, ARIA labels, and WCAG 2.1 compliance across cards.',
      project: project1._id,
      status: 'backlog',
      priority: 'medium',
      assignees: [grishaJack._id],
      creator: demoUser._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      position: 4000,
      labels: ['A11y', 'Quality'],
      checklist: [],
    });

    // 5. Create Tasks for Project 3 (Design System & UI Kit)
    await Task.create({
      title: 'Publish Button & Badge tokens',
      description: 'Core reusable primitives with variant states and icons.',
      project: project3._id,
      status: 'done',
      priority: 'medium',
      assignees: [demoUser._id, grishaJack._id],
      creator: demoUser._id,
      position: 1000,
      labels: ['Components'],
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    await Task.create({
      title: 'Build Modal and Dropdown accessibility primitives',
      description: 'Focus trapping and ESC key triggers.',
      project: project3._id,
      status: 'done',
      priority: 'high',
      assignees: [maxStone._id],
      creator: demoUser._id,
      position: 2000,
      labels: ['Components'],
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    await Task.create({
      title: 'Document Storybook guidelines',
      description: 'Write developer docs with code examples.',
      project: project3._id,
      status: 'in_review',
      priority: 'low',
      assignees: [grishaJack._id],
      creator: demoUser._id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      position: 3000,
      labels: ['Documentation'],
    });

    // 6. Create Comments on task2
    await Comment.create({
      task: task2._id,
      author: maxStone._id,
      text: 'The purple accents in dark mode look super sharp! Checked on Retina display.',
    });

    await Comment.create({
      task: task2._id,
      author: demoUser._id,
      text: 'Thanks Max! Hooked up the smooth transition effect so switching themes is instant.',
    });

    // 7. Create Activities
    await Activity.create({
      actor: demoUser._id,
      action: 'created_project',
      project: project1._id,
      metadata: { projectName: project1.name },
    });

    await Activity.create({
      actor: maxStone._id,
      action: 'added_comment',
      project: project1._id,
      task: task2._id,
      metadata: { taskTitle: task2.title },
    });

    await Activity.create({
      actor: demoUser._id,
      action: 'task_status_changed',
      project: project1._id,
      task: task1._id,
      metadata: { taskTitle: task1.title, oldStatus: 'in_progress', newStatus: 'done' },
    });

    // 8. Create Notifications for demoUser
    await Notification.create({
      recipient: demoUser._id,
      type: 'task_comment',
      title: 'New Comment on Task',
      message: 'Max Stone commented on "Implement Dark & Light mode theme toggle"',
      entityType: 'task',
      entityId: task2._id,
      read: false,
    });

    await Notification.create({
      recipient: demoUser._id,
      type: 'task_assigned',
      title: 'Task Assigned',
      message: 'You were assigned to "Design onboarding flow wireframes"',
      entityType: 'task',
      entityId: task1._id,
      read: true,
    });

    console.log('[Seed] Database successfully seeded with demo users, projects, tasks, and comments!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
