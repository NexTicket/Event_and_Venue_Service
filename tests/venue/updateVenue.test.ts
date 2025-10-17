import request from 'supertest';
import app from '../../src';

describe('PUT /api/venues/updatevenue/:id', () => {
<<<<<<< HEAD
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should update a venue successfully', async () => {
    const token = 'test-token-123';
    const venueId = 1;
    const updateData = {
      name: 'Updated Venue Name',
      seatMap: { rows: 15, columns: 20 }
    };

    // Mock existing venue
    const existingVenue = {
      id: venueId,
      name: 'Original Venue',
      location: 'Test Location',
      capacity: 100,
      seatMap: { rows: 10, columns: 10 },
      tenantId: 1,
    };

    // Mock updated venue
    const updatedVenue = {
      ...existingVenue,
      ...updateData
    };

    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.venue.findUnique = jest.fn().mockResolvedValue(existingVenue);
    mockPrisma.venue.update = jest.fn().mockResolvedValue(updatedVenue);

=======
  it('should update a venue successfully', async () => {
    const token = 'venue-owner-token-123';
    const venueId = 1;
    const updateData = {
      name: 'Updated Venue Name',
      capacity: 150,
      seatMap: { rows: 15, columns: 20 }
    };

>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const res = await request(app)
      .put(`/api/venues/updatevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
<<<<<<< HEAD
    expect(res.body.data.name).toBe(updateData.name);
    expect(res.body.data.seatMap).toEqual(updateData.seatMap);
=======
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    expect(res.body.message).toBe('Venue updated successfully');
  });

  it('should return 404 when trying to update non-existent venue', async () => {
<<<<<<< HEAD
    const token = 'test-token-123';
=======
    const token = 'venue-owner-token-123';
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const venueId = 999;
    const updateData = {
      name: 'Updated Venue Name',
      seatMap: { rows: 15, columns: 20 }
    };

<<<<<<< HEAD
    // Mock venue not found
    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.venue.findUnique = jest.fn().mockResolvedValue(null);

=======
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
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
<<<<<<< HEAD
    const token = 'test-token-123';
=======
    const token = 'venue-owner-token-123';
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const venueId = 1;
    const updateData = {
      name: 'Updated Name Only'
      // seatMap is not provided
    };

<<<<<<< HEAD
    const existingVenue = {
      id: venueId,
      name: 'Original Venue',
      location: 'Test Location',
      capacity: 100,
      seatMap: { rows: 10, columns: 10 },
      tenantId: 1,
    };

    const updatedVenue = {
      ...existingVenue,
      name: updateData.name
    };

    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.venue.findUnique = jest.fn().mockResolvedValue(existingVenue);
    mockPrisma.venue.update = jest.fn().mockResolvedValue(updatedVenue);

=======
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
    const res = await request(app)
      .put(`/api/venues/updatevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(200);
<<<<<<< HEAD
    expect(res.body.data.name).toBe(updateData.name);
  });

  it('should handle database errors gracefully', async () => {
    const token = 'test-token-123';
    const venueId = 1;
    const updateData = {
      name: 'Updated Venue Name',
      seatMap: { rows: 15, columns: 20 }
    };

    const existingVenue = {
      id: venueId,
      name: 'Original Venue',
      location: 'Test Location',
      capacity: 100,
      seatMap: { rows: 10, columns: 10 },
      tenantId: 1,
    };

    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.venue.findUnique = jest.fn().mockResolvedValue(existingVenue);
    mockPrisma.venue.update = jest.fn().mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .put(`/api/venues/updatevenue/${venueId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
=======
    expect(res.body.data).toBeDefined();
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
  });
});
