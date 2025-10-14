import request from 'supertest';
import app from '../../src';

describe('GET /api/venues/:id', () => {
  it('should get a venue by ID successfully', async () => {
    const token = 'test-token-123';
    const venueId = 1;

    const res = await request(app)
      .get(`/api/venues/getvenuebyid/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe(venueId);
    expect(res.body.data.name).toBe('Test Venue');
    expect(res.body.message).toBe('Venue fetched successfully');
  });

  it('should return venue data even without token (public access)', async () => {
    const venueId = 1;

    const res = await request(app)
      .get(`/api/venues/getvenuebyid/${venueId}`);

    // Optional auth allows public access - should return 200
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('should handle invalid venue ID parameter', async () => {
    const token = 'test-token-123';
    const invalidVenueId = 'invalid';

    const res = await request(app)
      .get(`/api/venues/getvenuebyid/${invalidVenueId}`)
      .set('Authorization', `Bearer ${token}`);

    // The parseInt will return NaN, and the mock returns null for invalid IDs
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Venue not found');
  });
});
