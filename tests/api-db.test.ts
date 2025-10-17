import request from 'supertest';
import app from '../src'; // Assuming app is exported from src/index.ts

describe('API Database Integration Tests', () => {
  it('should create a tenant via API', async () => {
    const res = await request(app)
      .post('/api/tenants')
      .send({ name: 'Test Tenant', firebaseUid: 'test-uid-123' });

    expect(res.status).toBe(201);
    expect(res.body.tenant.name).toBe('Test Tenant');
  });

  // Add more API tests that interact with DB
});
