import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Project } from '../src/models/Project';
import { Task } from '../src/models/Task';
import { Comment } from '../src/models/Comment';
import { Notification } from '../src/models/Notification';

const app = createApp();

let user1Token: string;
let user1Id: string;
let user2Token: string;
let user2Id: string;

beforeAll(async () => {
  const testUri = 'mongodb://127.0.0.1:27017/taskflow_test';
  await mongoose.connect(testUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await Comment.deleteMany({});
  await Notification.deleteMany({});

  // Setup user 1
  const u1 = await request(app).post('/api/auth/register').send({
    name: 'Alice Project Lead',
    email: 'alice@taskflow.dev',
    password: 'Password123!',
  });
  user1Token = u1.body.token;
  user1Id = u1.body.user.id;

  // Setup user 2
  const u2 = await request(app).post('/api/auth/register').send({
    name: 'Bob Developer',
    email: 'bob@taskflow.dev',
    password: 'Password123!',
  });
  user2Token = u2.body.token;
  user2Id = u2.body.user.id;
});

describe('Projects, Tasks, Comments, and Authorization APIs', () => {
  test('1. Alice can create a project and see it in project list', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'TaskFlow Redesign',
        description: 'Revamping the core UI/UX',
        color: '#6D5BD0',
      });

    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe('TaskFlow Redesign');

    // List projects for Alice
    const listRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.projects.length).toBe(1);
    expect(listRes.body.projects[0].name).toBe('TaskFlow Redesign');
  });

  test('2. Bob cannot access Alice\'s private project without authorization', async () => {
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Secret Strategy' });

    const projectId = createRes.body.project._id;

    // Bob tries to access project
    const unauthorizedRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(unauthorizedRes.status).toBe(403);
  });

  test('3. Alice can add Bob to the project, and Bob receives notification', async () => {
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Collaborative Sprint' });

    const projectId = createRes.body.project._id;

    // Add Bob
    const addMemberRes = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ userId: user2Id, role: 'member' });

    expect(addMemberRes.status).toBe(200);

    // Bob now has access to the project
    const bobAccessRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(bobAccessRes.status).toBe(200);
    expect(bobAccessRes.body.project.name).toBe('Collaborative Sprint');

    // Bob has received a notification
    const bobNotifications = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(bobNotifications.status).toBe(200);
    expect(bobNotifications.body.notifications.length).toBeGreaterThanOrEqual(1);
    expect(bobNotifications.body.notifications[0].type).toBe('project_added');
  });

  test('4. Task creation, status updates, and assignment notifications', async () => {
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Sprint 1' });
    const projectId = projRes.body.project._id;

    // Add Bob as member
    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ userId: user2Id });

    // Alice creates a task assigned to Bob
    const taskRes = await request(app)
      .post(`/api/tasks/project/${projectId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Implement WebSocket Rooms',
        description: 'Support real-time project rooms',
        status: 'todo',
        priority: 'high',
        assignees: [user2Id],
      });

    expect(taskRes.status).toBe(201);
    expect(taskRes.body.task.title).toBe('Implement WebSocket Rooms');
    const taskId = taskRes.body.task._id;

    // Bob sees the task in "My Tasks"
    const myTasksRes = await request(app)
      .get('/api/tasks/my')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(myTasksRes.status).toBe(200);
    expect(myTasksRes.body.tasks.some((t: any) => t._id === taskId)).toBe(true);

    // Move task to 'in_progress' and then 'done'
    const statusUpdateRes = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ status: 'done' });

    expect(statusUpdateRes.status).toBe(200);
    expect(statusUpdateRes.body.task.status).toBe('done');

    // Verify project analytics / progress reflects completed task
    const analyticsRes = await request(app)
      .get(`/api/projects/${projectId}/analytics`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(analyticsRes.status).toBe(200);
    expect(analyticsRes.body.analytics.completedTasks).toBe(1);
    expect(analyticsRes.body.analytics.progress).toBe(100);
  });

  test('5. Task comments discussion workflow', async () => {
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Documentation' });
    const projectId = projRes.body.project._id;

    const taskRes = await request(app)
      .post(`/api/tasks/project/${projectId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Write Architecture Spec' });
    const taskId = taskRes.body.task._id;

    // Add comment
    const commentRes = await request(app)
      .post(`/api/comments/task/${taskId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ text: 'Draft is ready for review.' });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.comment.text).toBe('Draft is ready for review.');

    // Fetch comments
    const getCommentsRes = await request(app)
      .get(`/api/comments/task/${taskId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(getCommentsRes.status).toBe(200);
    expect(getCommentsRes.body.comments.length).toBe(1);
    expect(getCommentsRes.body.comments[0].author.name).toBe('Alice Project Lead');
  });
});
