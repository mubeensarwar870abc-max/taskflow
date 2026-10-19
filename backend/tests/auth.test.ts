import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Workspace } from '../src/models/Workspace';
import { config } from '../src/config/env';

const app = createApp();

beforeAll(async () => {
  // Connect to test database
  const testUri = 'mongodb://127.0.0.1:27017/taskflow_test';
  await mongoose.connect(testUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Workspace.deleteMany({});
});

describe('Authentication & User Management APIs', () => {
  const testUser = {
    name: 'Sarah Connor',
    email: 'sarah@taskflow.dev',
    password: 'Password123!',
  };

  test('1. Should register a new user successfully and create default workspace', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.name).toBe(testUser.name);
    // Password hash should NEVER be in response
    expect(res.body.user.password).toBeUndefined();

    // Verify workspace was automatically created
    const workspace = await Workspace.findOne({ owner: res.body.user.id });
    expect(workspace).not.toBeNull();
  });

  test('2. Should reject registration with duplicate email', async () => {
    // Register first
    await request(app).post('/api/auth/register').send(testUser);

    // Register again
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('3. Should reject registration with short password (< 6 chars)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob',
      email: 'bob@test.com',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('4. Should log in existing user with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('5. Should reject login with invalid password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('6. Should fetch authenticated user profile with valid Bearer token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(testUser);
    const token = registerRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('7. Should reject unauthenticated requests to protected routes', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
