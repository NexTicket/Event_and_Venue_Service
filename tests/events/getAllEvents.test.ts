import request from 'supertest';
import app from '../../src';

describe('GET /api/events', () => {
  it('should return a list of events', async () => {
    const token = 'test-token-123';

    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.message).toBe('Events fetched successfully');
  });

  it('should return events with correct structure', async () => {
    const token = 'test-token-123';

    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    if (res.body.data.length > 0) {
      const event = res.body.data[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('startDate');
      expect(event).toHaveProperty('category');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('status');
      expect(event).toHaveProperty('venueId');
      expect(event).toHaveProperty('Tenant');
      expect(event).toHaveProperty('venue');
    }
  });
});
