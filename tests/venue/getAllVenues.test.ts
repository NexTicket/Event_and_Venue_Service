import request from 'supertest';
import app from '../../src/index';

describe('GET /api/venues', () => {
  it('should return a list of venues', async () => {
    const token = 'test-token-123';

    const res = await request(app)
      .get('/api/venues')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.message).toBe('Venues fetched successfully');
  });
});
