import request from 'supertest';
import app from '../../src';

describe('Unauthorized Access Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Authentication Tests', () => {
    it('should deny access without authorization header', async () => {
      const endpoints = [
        { method: 'post' as const, path: '/api/venues' },
        { method: 'get' as const, path: '/api/venues/getvenuebyid/1' },
        { method: 'put' as const, path: '/api/venues/updatevenue/1' },
        { method: 'delete' as const, path: '/api/venues/deletevenue/1' },
      ];

      for (const endpoint of endpoints) {
        const res = await (request(app) as any)[endpoint.method](endpoint.path);
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('No token provided');
      }
    });

    it('should deny access with malformed authorization header', async () => {
      const malformedHeaders = [
        'InvalidToken',
        'Basic sometoken',
        'Bearer',
        'Bearer ',
        'Token sometoken'
      ];

      for (const header of malformedHeaders) {
        const res = await request(app)
          .post('/api/venues')
          .set('Authorization', header);
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('No token provided');
      }
    });

    it('should deny access with invalid token', async () => {
      // Mock Firebase to reject invalid tokens
      const { getAuth } = await import('firebase-admin/auth');
      const mockAuth = getAuth();
      mockAuth.verifyIdToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });

    it('should deny access with expired token', async () => {
      // Mock Firebase to reject expired tokens
      const { getAuth } = await import('firebase-admin/auth');
      const mockAuth = getAuth();
      mockAuth.verifyIdToken = jest.fn().mockRejectedValue(new Error('Firebase ID token has expired'));

      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer expired-token');
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });
  });

  describe('Role-Based Access Control Tests', () => {
    it('should deny venue creation for non-venue-owner users', async () => {
      const venueData = {
        name: 'Test Venue',
        location: 'Test Location',
        capacity: 100,
        seatMap: { rows: 10, columns: 10 }
      };

      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer customer-token')
        .send(venueData);
      
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Only venue owners can add venues');
    });

    it('should deny venue creation for users without role', async () => {
      const venueData = {
        name: 'Test Venue',
        location: 'Test Location',
        capacity: 100,
        seatMap: { rows: 10, columns: 10 }
      };

      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer no-role-token')
        .send(venueData);
      
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Only venue owners can add venues');
    });

    it('should allow venue creation for venue owners', async () => {
      const venueData = {
        name: 'Test Venue',
        location: 'Test Location',
        capacity: 100,
        seatMap: { rows: 10, columns: 10 }
      };

      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer venue-owner-token')
        .send(venueData);
      
      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('Token Verification Edge Cases', () => {
    it('should handle malformed authorization headers', async () => {
      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'InvalidHeaderFormat');
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should handle empty authorization tokens', async () => {
      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer ');
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });
  });

  describe('Tenant Association Tests', () => {
    it('should handle venue creation when tenant does not exist', async () => {
      // The global setup already handles this scenario for venue-owner-token
      const venueData = {
        name: 'Test Venue',
        location: 'Test Location',
        capacity: 100,
        seatMap: { rows: 10, columns: 10 }
      };

      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer venue-owner-token')
        .send(venueData);
      
      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
    });
  });
});
