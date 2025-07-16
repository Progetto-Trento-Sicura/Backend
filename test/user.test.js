import request from 'supertest';
import app from '../app.js'; 
import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import { mongoConnect, mongoDisconnect } from '../utils/db.js';


describe('User API', () => {
  beforeAll(async () => {
    await mongoConnect(process.env.MONGO_URL || 'mongodb://localhost:27017/testdb');
});

  afterAll(async () => {
    await mongoDisconnect();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  describe('POST /api/users', () => {
    it('should register a user successfully', async () => {
      const res = await request(app).post('/api/users').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password1'
      });
      expect(res.statusCode).toBe(201);
    });

    it('should fail with existing email', async () => {
      await User.create({ email: 'test@example.com', username: 'existing', password: 'Password1' });

      const res = await request(app).post('/api/users').send({
        email: 'test@example.com',
        username: 'newuser',
        password: 'Password1'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should fail with no email', async () => {
      const res = await request(app).post('/api/users').send({
        username: 'newuser',
        password: 'Password1'
      });
      expect(res.statusCode).toBe(500);
    });

    it('should fail with weak password', async () => {
      const res = await request(app).post('/api/users').send({
        email: 'new@example.com',
        username: 'weakpass',
        password: 'ciao00'
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/users/session', () => {
    beforeEach(async () => {
      await request(app).post('/api/users').send({
        email: 'login@example.com',
        username: 'loginuser',
        password: 'Password1'
      });
    });

    it('should login successfully', async () => {
      const res = await request(app).post('/api/users/session').send({
        email: 'login@example.com',
        password: 'Password1'
      });
      expect(res.statusCode).toBe(200);
    });

    it('should fail with wrong password', async () => {
      const res = await request(app).post('/api/users/session').send({
        email: 'login@example.com',
        password: 'WrongPass'
      });
      expect(res.statusCode).toBe(400);
    });

    it('should fail with nonexistent email', async () => {
      const res = await request(app).post('/api/users/session').send({
        email: 'noexist@example.com',
        password: 'Password1'
      });
      expect(res.statusCode).toBe(400);
    });
  });
});