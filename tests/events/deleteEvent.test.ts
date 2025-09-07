import request from 'supertest';
import app from '../../src';

describe('DELETE /api/events/delete-event/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete an event successfully', async () => {
    const token = 'test-token-123';
    const eventId = 1;

    // Mock existing event
    const existingEvent = {
      id: eventId,
      title: 'Event to Delete',
      description: 'Test Description',
      category: 'Test',
      type: 'EVENT',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-02'),
      startTime: '09:00',
      endTime: '17:00',
      status: 'active',
      image: 'https://example.com/image.jpg',
      venueId: 1,
      tenantId: 1,
    };

    const res = await request(app)
      .delete(`/api/events/delete-event/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Event deleted successfully');
  });

  it('should return 404 when trying to delete non-existent event', async () => {
    const token = 'test-token-123';
    const eventId = 999;

    const res = await request(app)
      .delete(`/api/events/delete-event/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });

  it('should return 401 without authorization token', async () => {
    const eventId = 1;

    const res = await request(app)
      .delete(`/api/events/delete-event/${eventId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('should handle invalid event ID parameter', async () => {
    const token = 'test-token-123';
    const invalidEventId = 'invalid';

    const res = await request(app)
      .delete(`/api/events/delete-event/${invalidEventId}`)
      .set('Authorization', `Bearer ${token}`);

    // The parseInt will return NaN, which should be handled gracefully
    expect(res.status).toBe(404);
  });

  it('should handle database errors during deletion', async () => {
    const token = 'test-token-123';
    const eventId = 1;

    const existingEvent = {
      id: eventId,
      title: 'Event to Delete',
      description: 'Test Description',
      category: 'Test',
      type: 'EVENT',
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
    mockPrisma.events.delete.mockRejectedValueOnce(new Error('Database delete failed'));

    const res = await request(app)
      .delete(`/api/events/delete-event/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });
});
