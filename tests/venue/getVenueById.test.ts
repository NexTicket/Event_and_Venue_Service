import request from 'supertest';
import app from '../../src';

describe('GET /api/venues/:id', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should get a venue by ID successfully', async () => {
    const token = 'test-token-123';
    const venueId = 1;

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

    const res = await request(app)
      .get(`/api/venues/getvenuebyid/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe(venueId);
    expect(res.body.data.name).toBe('Test Venue');
    expect(res.body.message).toBe('Venue fetched successfully');
  });

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
    const venueId = 1;

    const res = await request(app)
      .get(`/api/venues/getvenuebyid/${venueId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('should handle invalid venue ID parameter', async () => {
    const token = 'test-token-123';
    const invalidVenueId = 'invalid';

    const res = await request(app)
      .get(`/api/venues/getvenuebyid/${invalidVenueId}`)
      .set('Authorization', `Bearer ${token}`);

    // The parseInt will return NaN, which should be handled gracefully
    expect(res.status).toBe(404);
  });
});
