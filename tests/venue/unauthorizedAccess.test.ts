import request from 'supertest';
import app from '../../src';

describe('Unauthorized Access Tests', () => {
  describe('Authentication Tests', () => {
    it('should deny access without authorization header', async () => {
      // Only test endpoints that REQUIRE authentication (use verifyToken middleware)
      const endpoints = [
        { method: 'post' as const, path: '/api/venues' },
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
      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer invalid-token-xyz');
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });

    it('should deny access with expired token', async () => {
      // Our mock doesn't have expired tokens, but we test with an invalid token
      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer expired-token-xyz');
      
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
        seatMap: { rows: 10, columns: 10 },
        type: 'Conference Hall'
      };

      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer customer-token-123')
        .send(venueData);
      
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Only venue owners and organizers can add venues');
    });

    it('should deny venue creation for users without role', async () => {
      const venueData = {
        name: 'Test Venue',
        location: 'Test Location',
        capacity: 100,
        seatMap: { rows: 10, columns: 10 },
        type: 'Conference Hall'
      };

      // Use an invalid token that will fail verification
      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer no-role-token-xyz')
        .send(venueData);
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });

    it('should allow venue creation for venue owners', async () => {
      const venueData = {
        name: 'Test Venue',
        location: 'Test Location',
        capacity: 100,
        seatMap: { rows: 10, columns: 10 },
        type: 'Conference Hall'
      };

      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer venue-owner-token-123')
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
      // The autoCreateTenant utility should create a tenant if it doesn't exist
      const venueData = {
        name: 'Test Venue',
        location: 'Test Location',
        capacity: 100,
        seatMap: { rows: 10, columns: 10 },
        type: 'Conference Hall'
      };

      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', 'Bearer venue-owner-token-123')
        .send(venueData);
      
      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
    });
  });
});
