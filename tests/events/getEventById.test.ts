import request from 'supertest';
import app from '../../src';

describe('GET /api/events/geteventbyid/:id', () => {
<<<<<<< HEAD
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get an event by ID successfully', async () => {
    const token = 'test-token-123';
=======
  it('should get an event by ID successfully', async () => {
    const token = 'customer-token-123'; // Use valid customer token
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const eventId = 1;

    // Mock the event.findUnique to return a specific event
    const mockEvent = {
      id: eventId,
      title: 'Test Event',
      description: 'Test Description',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-02'),
      startTime: '09:00',
      endTime: '17:00',
      category: 'Technology',
      type: 'Conference',
      status: 'active',
      image: 'https://example.com/image.jpg',
      venueId: 1,
      tenantId: 1,
      Tenant: {
        id: 1,
        name: 'Test Tenant',
        firebaseUid: 'test-organizer-uid',
        createdAt: new Date(),
      },
      venue: {
        id: 1,
        name: 'Test Venue',
        location: 'Test Location'
      }
    };

    // Mock is handled globally in setup.ts

    const res = await request(app)
      .get(`/api/events/geteventbyid/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe(eventId);
    expect(res.body.data.title).toBe('Test Event');
    expect(res.body.message).toBe('Event fetched successfully');
  });

  it('should return 404 when event is not found', async () => {
<<<<<<< HEAD
    const token = 'test-token-123';
=======
    const token = 'customer-token-123'; // Use valid customer token
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const eventId = 999;

    // Mock is handled globally in setup.ts

    const res = await request(app)
      .get(`/api/events/geteventbyid/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });

<<<<<<< HEAD
  it('should return 401 without authorization token', async () => {
=======
  it('should return event even without authorization token (public endpoint)', async () => {
    // This endpoint is public, so no token is required
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const eventId = 1;

    const res = await request(app)
      .get(`/api/events/geteventbyid/${eventId}`);

<<<<<<< HEAD
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('should handle invalid event ID parameter', async () => {
    const token = 'test-token-123';
=======
    expect(res.status).toBe(200); // Changed from 401 to 200 since it's public
    expect(res.body.data).toBeDefined();
  });

  it('should handle invalid event ID parameter', async () => {
    const token = 'customer-token-123'; // Use valid customer token
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const invalidEventId = 'invalid';

    const res = await request(app)
      .get(`/api/events/geteventbyid/${invalidEventId}`)
      .set('Authorization', `Bearer ${token}`);

    // The parseInt will return NaN, which should be handled gracefully
    expect(res.status).toBe(404);
  });
<<<<<<< HEAD

  it('should handle database errors during fetch', async () => {
    const token = 'test-token-123';
    const eventId = 1;

    // Temporarily mock the events.findUnique to throw an error
    const mockPrisma = (global as any).mockPrismaClient;
    const originalFindUnique = mockPrisma.events.findUnique;
    mockPrisma.events.findUnique = jest.fn().mockRejectedValue(new Error('Database connection failed'));

    const res = await request(app)
      .get(`/api/events/geteventbyid/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');

    // Restore the original mock
    mockPrisma.events.findUnique = originalFindUnique;
  });
=======
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
});
