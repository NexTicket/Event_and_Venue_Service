import request from 'supertest';
import app from '../../src';

describe('POST /api/events/:eventId/image', () => {
  it('should return 401 without authorization token', async () => {
    const eventId = 1;

    const res = await request(app)
      .post(`/api/events/${eventId}/image`)
      .attach('image', Buffer.from('fake-image-data'), 'test-image.jpg');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('should return 400 when no image file is provided', async () => {
    const token = 'organizer-token-123';
    const eventId = 1;

    const existingEvent = {
      id: eventId,
      title: 'Test Event',
      description: 'Test Description',
      category: 'Test',
      type: 'EVENT',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-02'),
      startTime: '09:00',
      endTime: '17:00',
      status: 'active',
      image: null,
      venueId: 1,
      tenantId: 1,
    };

    const res = await request(app)
      .post(`/api/events/${eventId}/image`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No image file provided');
  });
});
