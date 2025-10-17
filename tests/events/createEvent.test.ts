import request from 'supertest';
import app from '../../src';

describe('POST /api/events', () => {
<<<<<<< HEAD
  beforeEach(() => {
    jest.clearAllMocks();
  });

=======
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
  it('should create an event successfully', async () => {
    const token = 'organizer-token-123'; // Use organizer token

    const eventData = {
      title: 'Tech Conference 2025',
      description: 'A conference about latest tech trends',
      category: 'Technology',
      type: 'EVENT',
      startDate: '2025-10-01',
      endDate: '2025-10-02',
      startTime: '09:00',
      endTime: '17:00',
      venueId: 1,
      image: 'https://example.com/image.jpg'
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventData);

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Tech Conference 2025');
    expect(res.body.data.category).toBe('Technology');
    expect(res.body.message).toBe('Event created successfully');
  });

  it('should return 400 for missing required fields', async () => {
    const token = 'organizer-token-123';

    const incompleteData = {
      title: 'Incomplete Event'
      // Missing description, category, type, startDate
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(incompleteData);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing required fields');
  });

  it('should return 403 for unauthorized role', async () => {
    const token = 'venue-owner-token-123'; // venue_owner is not allowed for events

    const eventData = {
      title: 'Test Event',
      description: 'Test Description',
      category: 'Test',
      type: 'EVENT',
      startDate: '2025-10-01'
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventData);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only registered organizers can add events');
  });

  it('should return 401 without authorization token', async () => {
    const eventData = {
      title: 'No Auth Event',
      description: 'This should fail',
      category: 'Test',
      type: 'EVENT',
      startDate: '2025-10-01'
    };

    const res = await request(app)
      .post('/api/events')
      .send(eventData);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('should handle invalid venueId', async () => {
    const token = 'organizer-token-123';

    const eventData = {
      title: 'Invalid Venue Event',
      description: 'Test invalid venue',
      category: 'Test',
      type: 'EVENT',
      startDate: '2025-10-01',
      venueId: 'invalid'
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventData);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid venueId - must be a number');
  });
});
