export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  preferences?: {
    theme: 'light' | 'dark';
    emailNotifications: boolean;
  };
  createdAt?: string;
}

export interface ProjectMember {
  user: User;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  color: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'archived';
  owner: User;
  members: ProjectMember[];
  startDate?: string;
  dueDate?: string;
  totalTasks?: number;
  completedTasks?: number;
  progress?: number;
  daysLeft?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string | Project;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: User[];
  creator: User;
  dueDate?: string;
  position: number;
  labels: string[];
  checklist: ChecklistItem[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  author: User;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  type: 'task_assigned' | 'project_added' | 'task_comment' | 'task_status_changed' | 'system';
  title: string;
  message: string;
  entityType?: 'project' | 'task';
  entityId?: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityItem {
  _id: string;
  actor: User;
  action: string;
  project: { _id: string; name: string; color: string };
  task?: { _id: string; title: string; status: string };
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DashboardData {
  summary: {
    totalProjects: number;
    activeProjects: number;
    myPendingTasks: number;
    completedTasks: number;
    totalTasks: number;
  };
  projects: Array<{
    _id: string;
    name: string;
    description: string;
    color: string;
    status: string;
    totalTasks: number;
    completedTasks: number;
    progress: number;
    dueDate?: string;
    daysLeft?: number | null;
    members: ProjectMember[];
  }>;
  recentTasks: Task[];
  myTasks: Task[];
  recentActivity: ActivityItem[];
  analytics: {
    velocityChartData: Array<{ month: string; completed: number; target: number }>;
    statusDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
  };
}
