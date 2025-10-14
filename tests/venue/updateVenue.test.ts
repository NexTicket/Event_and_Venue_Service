import request from 'supertest';
import app from '../../src';

describe('PUT /api/venues/updatevenue/:id', () => {
  it('should update a venue successfully', async () => {
    const token = 'venue-owner-token-123';
    const venueId = 1;
    const updateData = {
      name: 'Updated Venue Name',
      capacity: 150,
      seatMap: { rows: 15, columns: 20 }
    };

    const res = await request(app)
      .put(`/api/venues/updatevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.message).toBe('Venue updated successfully');
  });

  it('should return 404 when trying to update non-existent venue', async () => {
    const token = 'venue-owner-token-123';
    const venueId = 999;
    const updateData = {
      name: 'Updated Venue Name',
      seatMap: { rows: 15, columns: 20 }
    };

    const res = await request(app)
      .put(`/api/venues/updatevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Venue not found');
  });

  it('should return 401 without authorization token', async () => {
    const venueId = 1;
    const updateData = {
      name: 'Updated Venue Name',
      seatMap: { rows: 15, columns: 20 }
    };

    const res = await request(app)
      .put(`/api/venues/updatevenue/${venueId}`)
      .send(updateData);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('should handle partial updates', async () => {
    const token = 'venue-owner-token-123';
    const venueId = 1;
    const updateData = {
      name: 'Updated Name Only'
      // seatMap is not provided
    };

    const res = await request(app)
      .put(`/api/venues/updatevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});
