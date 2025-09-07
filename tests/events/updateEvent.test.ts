import request from 'supertest';
import app from '../../src';

describe('PUT /api/events/update-event/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update an event successfully', async () => {
    const token = 'test-token-123';
    const eventId = 1;
    const updateData = {
      title: 'Updated Event Title',
      description: 'Updated description',
      category: 'Updated Category'
    };

    // Mock existing event
    const existingEvent = {
      id: eventId,
      title: 'Original Event',
      description: 'Original Description',
      category: 'Original Category',
      type: 'Conference',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-02'),
      startTime: '09:00',
      endTime: '17:00',
      status: 'active',
      image: 'https://example.com/image.jpg',
      venueId: 1,
      tenantId: 1,
    };

    // Mock updated event
    const updatedEvent = {
      ...existingEvent,
      ...updateData
    };

    
    
    
    

    const res = await request(app)
      .put(`/api/events/update-event/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.title).toBe(updateData.title);
    expect(res.body.data.description).toBe(updateData.description);
    expect(res.body.data.category).toBe(updateData.category);
    expect(res.body.message).toBe('Event updated successfully');
  });

  it('should return 404 when trying to update non-existent event', async () => {
    const token = 'test-token-123';
    const eventId = 999;
    const updateData = {
      title: 'Updated Event Title',
      description: 'Updated description'
    };

    // Mock event not found
    
    
    

    const res = await request(app)
      .put(`/api/events/update-event/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });

  it('should return 401 without authorization token', async () => {
    const eventId = 1;
    const updateData = {
      title: 'Updated Event Title'
    };

    const res = await request(app)
      .put(`/api/events/update-event/${eventId}`)
      .send(updateData);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('should handle partial updates', async () => {
    const token = 'test-token-123';
    const eventId = 1;
    const updateData = {
      title: 'Updated Title Only'
      // Other fields not provided
    };

    const existingEvent = {
      id: eventId,
      title: 'Original Event',
      description: 'Original Description',
      category: 'Original Category',
      type: 'Conference',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-02'),
      startTime: '09:00',
      endTime: '17:00',
      status: 'active',
      image: 'https://example.com/image.jpg',
      venueId: 1,
      tenantId: 1,
    };

    const updatedEvent = {
      ...existingEvent,
      ...updateData
    };

    
    
    
    

    const res = await request(app)
      .put(`/api/events/update-event/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe(updateData.title);
    expect(res.body.data.description).toBe(existingEvent.description); // Unchanged
  });

  it('should handle invalid event ID parameter', async () => {
    const token = 'test-token-123';
    const invalidEventId = 'invalid';
    const updateData = {
      title: 'Updated Title'
    };

    const res = await request(app)
      .put(`/api/events/update-event/${invalidEventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(404);
  });

  it('should handle database errors during update', async () => {
    const token = 'test-token-123';
    const eventId = 1;
    const updateData = {
      title: 'Updated Title'
    };

    const existingEvent = {
      id: eventId,
      title: 'Original Event',
      description: 'Original Description',
      category: 'Original Category',
      type: 'Conference',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-02'),
      startTime: '09:00',
      endTime: '17:00',
      status: 'active',
      image: 'https://example.com/image.jpg',
      venueId: 1,
      tenantId: 1,
    };

    // Configure mock to throw an error
    const mockPrisma = (global as any).mockPrismaClient;
    mockPrisma.events.update.mockRejectedValueOnce(new Error('Database update failed'));

    const res = await request(app)
      .put(`/api/events/update-event/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });
});
