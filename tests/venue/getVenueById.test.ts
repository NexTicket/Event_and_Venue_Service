import request from 'supertest';
import app from '../../src';

describe('GET /api/venues/:id', () => {
<<<<<<< HEAD
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

=======
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
  it('should get a venue by ID successfully', async () => {
    const token = 'test-token-123';
    const venueId = 1;

<<<<<<< HEAD
    // Mock the venue.findUnique to return a specific venue
    const mockVenue = {
      id: venueId,
      name: 'Test Venue',
      location: 'Test Location',
      capacity: 100,
      seatMap: { rows: 10, columns: 10 },
      tenantId: 1,
      tenant: {
        id: 1,
        name: 'Test Tenant',
        firebaseUid: 'test-venue-owner-uid',
        createdAt: new Date(),
      }
    };

    // Import the PrismaClient mock
    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.venue.findUnique = jest.fn().mockResolvedValue(mockVenue);

=======
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const res = await request(app)
      .get(`/api/venues/getvenuebyid/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe(venueId);
    expect(res.body.data.name).toBe('Test Venue');
    expect(res.body.message).toBe('Venue fetched successfully');
  });

<<<<<<< HEAD
  it('should return 404 when venue is not found', async () => {
    const token = 'test-token-123';
    const venueId = 999;

    // Mock the venue.findUnique to return null
    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.venue.findUnique = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/venues/getvenuebyid/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Venue not found');
  });

  it('should return 401 without authorization token', async () => {
=======
  it('should return venue data even without token (public access)', async () => {
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const venueId = 1;

    const res = await request(app)
      .get(`/api/venues/getvenuebyid/${venueId}`);

<<<<<<< HEAD
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
=======
    // Optional auth allows public access - should return 200
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
  });

  it('should handle invalid venue ID parameter', async () => {
    const token = 'test-token-123';
    const invalidVenueId = 'invalid';

    const res = await request(app)
      .get(`/api/venues/getvenuebyid/${invalidVenueId}`)
      .set('Authorization', `Bearer ${token}`);

<<<<<<< HEAD
    // The parseInt will return NaN, which should be handled gracefully
    expect(res.status).toBe(404);
=======
    // The parseInt will return NaN, and the mock returns null for invalid IDs
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Venue not found');
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
  });
});
