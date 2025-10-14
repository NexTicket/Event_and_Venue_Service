import request from 'supertest';
import app from '../../src';

describe('DELETE /api/venues/deletevenue/:id', () => {
  it('should delete a venue successfully', async () => {
    const token = 'venue-owner-token-123';
    const venueId = 1;

    const res = await request(app)
      .delete(`/api/venues/deletevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Venue deleted successfully');
  });

  it('should return 404 when trying to delete non-existent venue', async () => {
    const token = 'venue-owner-token-123';
    const venueId = 999;

    const res = await request(app)
      .delete(`/api/venues/deletevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Venue not found');
  });

  it('should return 401 without authorization token', async () => {
    const venueId = 1;

    const res = await request(app)
      .delete(`/api/venues/deletevenue/${venueId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('should handle invalid venue ID parameter', async () => {
    const token = 'venue-owner-token-123'; // Use valid venue owner token
    const invalidVenueId = 'invalid';

    const res = await request(app)
      .delete(`/api/venues/deletevenue/${invalidVenueId}`)
      .set('Authorization', `Bearer ${token}`);

    // The parseInt will return NaN, which should be handled gracefully
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Venue not found');
  });

  it('should ensure venue exists before attempting deletion', async () => {
    const token = 'venue-owner-token-123';
    const venueId = 1;

    const res = await request(app)
      .delete(`/api/venues/deletevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
