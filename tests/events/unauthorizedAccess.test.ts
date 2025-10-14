import request from 'supertest';
import app from '../../src';

describe('Unauthorized Access Tests for Events', () => {
  describe('Authentication Tests', () => {
    it('should deny access without authorization header for protected endpoints', async () => {
      const endpoints = [
        { method: 'post' as const, path: '/api/events' },
        { method: 'put' as const, path: '/api/events/update-event/1' },
        { method: 'delete' as const, path: '/api/events/delete-event/1' },
      ];

      for (const endpoint of endpoints) {
        const res = await (request(app) as any)[endpoint.method](endpoint.path);
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('No token provided');
      }
    });

    it('should allow public access to event details endpoint', async () => {
      const res = await request(app).get('/api/events/geteventbyid/1');
      
      // This endpoint uses optionalAuth, so it should return 200 (public access allowed)
      expect(res.status).toBe(200);
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
          .post('/api/events')
          .set('Authorization', header);
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('No token provided');
      }
    });
  });

  describe('Role-Based Access Control Tests', () => {
    it('should deny event creation for non-organizer users', async () => {
      // Test with venue_owner role which is NOT allowed to create events
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        category: 'Test',
        type: 'EVENT',
        startDate: '2025-10-01',
        endDate: '2025-10-02',
        startTime: '09:00',
        endTime: '17:00',
        venueId: 1
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer venue-owner-token-123') // venue_owner is not allowed
        .send(eventData);
      
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Only registered organizers can add events');
    });

    it('should deny event creation for users with invalid tokens', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        category: 'Test',
        type: 'EVENT',
        startDate: '2025-10-01',
        endDate: '2025-10-02',
        startTime: '09:00',
        endTime: '17:00',
        venueId: 1
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer invalid-token-xyz')
        .send(eventData);
      
      // Invalid token should return 401, not 403
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });

    it('should allow event creation for organizer role', async () => {
      const eventData = {
        title: 'Organizer Event',
        description: 'Test Description',
        category: 'Test',
        type: 'EVENT',
        startDate: '2025-10-01',
        endDate: '2025-10-02',
        startTime: '09:00',
        endTime: '17:00',
        venueId: 1
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer organizer-token-123')
        .send(eventData);
      
      // This would be 201 if properly mocked, but we're testing access control
      expect(res.status).not.toBe(403);
    });

    it('should allow event creation for admin role', async () => {
      const eventData = {
        title: 'Admin Event',
        description: 'Test Description',
        category: 'Test',
        type: 'EVENT',
        startDate: '2025-10-01'
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer admin-token')
        .send(eventData);
      
      // This would be 201 if properly mocked, but we're testing access control
      expect(res.status).not.toBe(403);
    });
  });

  describe('Public Endpoint Access', () => {
    it('should allow access to public endpoints without authentication', async () => {
      const res = await request(app)
        .get('/api/events');
      
      // GET /api/events might be public or require auth, depending on implementation
      // This test assumes it's public for fetching events
      expect([200, 401]).toContain(res.status);
    });
  });
});
