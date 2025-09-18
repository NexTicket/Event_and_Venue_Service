import request from 'supertest';
import app from '../../src/index';

describe('Tenant Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/tenants', () => {
    it('should create a new tenant when valid data is provided', async () => {
      const token = 'admin-token-123';
      const tenantData = {
        firebaseUid: 'test-firebase-uid-123',
        name: 'Test Venue Owner',
        email: 'owner@test.com',
        role: 'venue_owner'
      };

      const { PrismaClient } = await import('@prisma/client');
      const mockPrisma = new PrismaClient();
      
      // Mock tenant doesn't exist initially
      mockPrisma.tenant.findUnique = jest.fn().mockResolvedValue(null);
      
      // Mock tenant creation
      const createdTenant = {
        id: 1,
        firebaseUid: tenantData.firebaseUid,
        name: tenantData.name,
        createdAt: new Date()
      };
      mockPrisma.tenant.create = jest.fn().mockResolvedValue(createdTenant);

      const res = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${token}`)
        .send(tenantData);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.firebaseUid).toBe(tenantData.firebaseUid);
      expect(res.body.message).toBe('Tenant created successfully');
    });

    it('should return existing tenant if already exists', async () => {
      const token = 'admin-token-123';
      const tenantData = {
        firebaseUid: 'existing-firebase-uid',
        name: 'Existing Owner',
        email: 'existing@test.com',
        role: 'venue_owner'
      };

      const existingTenant = {
        id: 1,
        firebaseUid: tenantData.firebaseUid,
        name: tenantData.name,
        createdAt: new Date()
      };

      const { PrismaClient } = await import('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.tenant.findUnique = jest.fn().mockResolvedValue(existingTenant);

      const res = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${token}`)
        .send(tenantData);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(existingTenant);
      expect(res.body.message).toBe('Tenant already exists');
    });

    it('should reject invalid role', async () => {
      const token = 'admin-token-123';
      const tenantData = {
        firebaseUid: 'test-firebase-uid',
        name: 'Test User',
        email: 'user@test.com',
        role: 'customer' // Invalid role for tenant creation
      };

      const res = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${token}`)
        .send(tenantData);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid role. Only venue_owner and organizer roles can create tenants');
    });

    it('should require all mandatory fields', async () => {
      const token = 'admin-token-123';
      const incompleteData = {
        firebaseUid: 'test-uid'
        // Missing name and role
      };

      const res = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${token}`)
        .send(incompleteData);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields: firebaseUid, name, and role are required');
    });
  });

  describe('GET /api/tenants/firebase/:firebaseUid', () => {
    it('should fetch tenant by Firebase UID', async () => {
      const token = 'test-token-123';
      const firebaseUid = 'test-firebase-uid';
      
      const tenant = {
        id: 1,
        firebaseUid,
        name: 'Test Tenant',
        createdAt: new Date(),
        venues: []
      };

      const { PrismaClient } = await import('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.tenant.findUnique = jest.fn().mockResolvedValue(tenant);

      const res = await request(app)
        .get(`/api/tenants/firebase/${firebaseUid}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(tenant);
      expect(res.body.message).toBe('Tenant fetched successfully');
    });

    it('should return 404 when tenant not found', async () => {
      const token = 'test-token-123';
      const firebaseUid = 'non-existent-uid';

      const { PrismaClient } = await import('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.tenant.findUnique = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/tenants/firebase/${firebaseUid}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Tenant not found');
    });
  });
});
