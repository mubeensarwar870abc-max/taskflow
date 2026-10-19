const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('taskflow_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'omit',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', response.status, data);
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),

  // Users & Team
  getUsers: () => request<any>('/users'),
  getTeamMembers: () => request<any>('/users'),
  searchUsers: (query: string) => request<any>(`/users/search?q=${encodeURIComponent(query)}`),
  updateProfile: (body: any) => request<any>('/users/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body: any) => request<any>('/users/password', { method: 'PATCH', body: JSON.stringify(body) }),

  // Dashboard
  getDashboardOverview: () => request<any>('/dashboard/overview'),

  // Projects
  getProjects: () => request<any>('/projects'),
  getProjectById: (id: string) => request<any>(`/projects/${id}`),
  createProject: (body: any) => request<any>('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id: string, body: any) => request<any>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteProject: (id: string) => request<any>(`/projects/${id}`, { method: 'DELETE' }),
  addProjectMember: (projectId: string, body: { userId: string; role?: string }) =>
    request<any>(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify(body) }),
  removeProjectMember: (projectId: string, userId: string) =>
    request<any>(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),
  getProjectAnalytics: (projectId: string) => request<any>(`/projects/${projectId}/analytics`),

  // Tasks
  getProjectTasks: (projectId: string, query?: Record<string, string>) => {
    const q = query ? '?' + new URLSearchParams(query).toString() : '';
    return request<any>(`/tasks/project/${projectId}${q}`);
  },
  getTaskById: (taskId: string) => request<any>(`/tasks/${taskId}`),
  createTask: (projectId: string, body: any) =>
    request<any>(`/tasks/project/${projectId}`, { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (taskId: string, body: any) =>
    request<any>(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updateTaskStatus: (taskId: string, body: { status: string; position?: number }) =>
    request<any>(`/tasks/${taskId}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTask: (taskId: string) => request<any>(`/tasks/${taskId}`, { method: 'DELETE' }),
  getMyTasks: (query?: Record<string, string>) => {
    const q = query ? '?' + new URLSearchParams(query).toString() : '';
    return request<any>(`/tasks/my${q}`);
  },

  // Comments
  getTaskComments: (taskId: string) => request<any>(`/comments/task/${taskId}`),
  createComment: (taskId: string, text: string) =>
    request<any>(`/comments/task/${taskId}`, { method: 'POST', body: JSON.stringify({ text }) }),
  deleteComment: (commentId: string) => request<any>(`/comments/${commentId}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request<any>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),

  // Activity
  getProjectActivity: (projectId: string) => request<any>(`/activity/project/${projectId}`),
};
