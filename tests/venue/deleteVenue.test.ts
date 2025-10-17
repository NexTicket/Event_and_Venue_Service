import request from 'supertest';
import app from '../../src';

describe('DELETE /api/venues/deletevenue/:id', () => {
<<<<<<< HEAD
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should delete a venue successfully', async () => {
    const token = 'test-token-123';
    const venueId = 1;

    // Mock existing venue
    const existingVenue = {
      id: venueId,
      name: 'Venue to Delete',
      location: 'Test Location',
      capacity: 100,
      seatMap: { rows: 10, columns: 10 },
      tenantId: 1,
    };

    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.venue.findUnique = jest.fn().mockResolvedValue(existingVenue);
    mockPrisma.venue.delete = jest.fn().mockResolvedValue(existingVenue);

=======
  it('should delete a venue successfully', async () => {
    const token = 'venue-owner-token-123';
    const venueId = 1;

>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const res = await request(app)
      .delete(`/api/venues/deletevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Venue deleted successfully');
<<<<<<< HEAD
    expect(mockPrisma.venue.delete).toHaveBeenCalledWith({
      where: { id: venueId }
    });
  });

  it('should return 404 when trying to delete non-existent venue', async () => {
    const token = 'test-token-123';
    const venueId = 999;

    // Mock venue not found
    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.venue.findUnique = jest.fn().mockResolvedValue(null);

=======
  });

  it('should return 404 when trying to delete non-existent venue', async () => {
    const token = 'venue-owner-token-123';
    const venueId = 999;

>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const res = await request(app)
      .delete(`/api/venues/deletevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Venue not found');
<<<<<<< HEAD
    expect(mockPrisma.venue.delete).not.toHaveBeenCalled();
=======
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
  });

  it('should return 401 without authorization token', async () => {
    const venueId = 1;

    const res = await request(app)
      .delete(`/api/venues/deletevenue/${venueId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('should handle invalid venue ID parameter', async () => {
<<<<<<< HEAD
    const token = 'test-token-123';
=======
    const token = 'venue-owner-token-123'; // Use valid venue owner token
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const invalidVenueId = 'invalid';

    const res = await request(app)
      .delete(`/api/venues/deletevenue/${invalidVenueId}`)
      .set('Authorization', `Bearer ${token}`);

    // The parseInt will return NaN, which should be handled gracefully
    expect(res.status).toBe(404);
<<<<<<< HEAD
  });

  it('should handle database errors during deletion', async () => {
    const token = 'test-token-123';
    const venueId = 1;

    const existingVenue = {
      id: venueId,
      name: 'Venue to Delete',
      location: 'Test Location',
      capacity: 100,
      seatMap: { rows: 10, columns: 10 },
      tenantId: 1,
    };

    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.venue.findUnique = jest.fn().mockResolvedValue(existingVenue);
    mockPrisma.venue.delete = jest.fn().mockRejectedValue(new Error('Database constraint violation'));

    const res = await request(app)
      .delete(`/api/venues/deletevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });

  it('should ensure venue exists before attempting deletion', async () => {
    const token = 'test-token-123';
    const venueId = 1;

    const existingVenue = {
      id: venueId,
      name: 'Venue to Delete',
      location: 'Test Location',
      capacity: 100,
      seatMap: { rows: 10, columns: 10 },
      tenantId: 1,
    };

    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.venue.findUnique = jest.fn().mockResolvedValue(existingVenue);
    mockPrisma.venue.delete = jest.fn().mockResolvedValue(existingVenue);

=======
    expect(res.body.error).toBe('Venue not found');
  });

  it('should ensure venue exists before attempting deletion', async () => {
    const token = 'venue-owner-token-123';
    const venueId = 1;

>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const res = await request(app)
      .delete(`/api/venues/deletevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`);

<<<<<<< HEAD
    expect(mockPrisma.venue.findUnique).toHaveBeenCalledWith({
      where: { id: venueId },
      include: { tenant: true }
    });
    expect(mockPrisma.venue.delete).toHaveBeenCalledWith({
      where: { id: venueId }
    });
=======
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    expect(res.status).toBe(200);
  });
});
