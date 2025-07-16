import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import Org from '../models/OrgModel.js';
import { mongoConnect, mongoDisconnect } from '../utils/db.js';


describe('Organization API', () => {
  beforeAll(async () => {
    await mongoConnect(process.env.MONGO_URL || 'mongodb://localhost:27017/testdb');
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  afterEach(async () => {
    await Org.deleteMany();
  });

  describe('POST /api/orgs', () => {
    it('should register an organization successfully', async () => {
      const res = await request(app).post('/api/orgs').send({
        email: 'org@example.com',
        username: 'org1',
        password: 'Password1',
        phone: '1234567890',
        indirizzo: 'Some address',
        descrizione: 'Descrizione ente'
      });
      expect(res.statusCode).toBe(201);
    });

    it('should fail with existing username', async () => {
      await Org.create({
        email: 'already@org.com',
        username: 'org1',
        password: 'Password1',
        phone: '1234567890',
        indirizzo: 'Some address',
        descrizione: 'Descrizione ente'
      });

      const res = await request(app).post('/api/orgs').send({
        email: 'new@org.com',
        username: 'org1',
        password: 'Password1',
        phone: '999999999',
        indirizzo: 'New address',
        descrizione: 'Descrizione ente'
      });
      expect(res.statusCode).toBe(400);
    });

    it('should fail with invalid password', async () => {
      const res = await request(app).post('/api/orgs').send({
        email: 'org@example.com',
        username: 'org2',
        password: '123',
        phone: '1234567890',
        indirizzo: 'Another address',
        descrizione: 'Descrizione ente'
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/orgs/session', () => {
    beforeEach(async () => {
      await request(app).post('/api/orgs').send({
        email: 'org@login.com',
        username: 'orglogin',
        password: 'Password1',
        phone: '0000000000',
        indirizzo: 'HQ',
        descrizione: 'Descrizione ente'
      });
    });

    it('should login successfully', async () => {
      const res = await request(app).post('/api/orgs/session').send({
        email: 'org@login.com',
        password: 'Password1'
      });
      expect(res.statusCode).toBe(200);
    });

    it('should fail with wrong credentials', async () => {
      const res = await request(app).post('/api/orgs/session').send({
        email: 'org@login.com',
        password: 'WrongPassword'
      });
      expect(res.statusCode).toBe(400);
    });
  });
});