import request from 'supertest';
import app from '../../src';

describe('POST /api/venues', () => {
  it('should create a venue successfully', async () => {
    const token = 'venue-owner-token-123'; // Use venue owner token

    const res = await request(app)
      .post('/api/venues')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cinnamon Grand Hall',
        location: 'Colombo',
        capacity: 300,
        seatMap: {
          rows: 10,
          columns: 30,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Cinnamon Grand Hall');
    expect(res.body.data.seatMap.columns).toBe(30);
  });
});
