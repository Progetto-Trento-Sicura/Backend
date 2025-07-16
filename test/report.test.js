import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import Report from '../models/ReportModel.js';
import { mongoConnect, mongoDisconnect } from '../utils/db.js';

let token;
let userId;

describe('Report API', () => {
  beforeAll(async () => {
    await mongoConnect(process.env.MONGO_URL || 'mongodb://localhost:27017/testdb');

    // Clean up any existing test data
    await User.deleteMany({ email: 'report@test.com' });
    await Report.deleteMany();

    // Register user
    const res = await request(app).post('/api/users').send({
      email: 'report@test.com',
      username: 'reporter',
      password: 'Password1'
    });

    // Login user
    const loginRes = await request(app).post('/api/users/session').send({
      email: 'report@test.com',
      password: 'Password1'
    });

    // Extract token from cookie
    token = loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
    const user = await User.findOne({ email: 'report@test.com' });
    userId = user._id;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'report@test.com' });
    await Report.deleteMany();
    await mongoDisconnect();
  });

  afterEach(async () => {
    // Clean reports after each test but keep the user
    await Report.deleteMany();
  });

  it('should create a report', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Cookie', [`token=${token}`])
      .send({
        reportData: {
          title: 'Test Report',        
          description: 'Description here', 
        }
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Report created successfully');
    expect(res.body).toHaveProperty('report');
  });

  it('should fail when title is missing', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Cookie', [`token=${token}`])
      .send({
        reportData: {
          description: 'Description here', 
        }
      });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('should fail when coordinates are invalid', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Cookie', [`token=${token}`])
      .send({
        reportData: {
          title: 'Test Report',        
          description: 'Description here',
          location: {
          lat: 'invalid',
          lng: null       
        }
        }
      });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('should get all reports (empty)', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 404 for non-existing report', async () => {
    // Use a valid ObjectId format
    const res = await request(app)
      .get('/api/reports/64ac123456789012345678ab')
      .set('Cookie', [`token=${token}`]); // Add authentication
    expect(res.statusCode).toBe(404);
  });
});