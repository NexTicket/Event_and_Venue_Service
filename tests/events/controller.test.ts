// Test individual controller functions
import {
  getAllEvents,
  addEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  uploadEventImage
} from '../../src/controllers/event.controller';

describe('Event Controller Functions', () => {
  describe('Function Exports', () => {
    it('should export getAllEvents function', () => {
      expect(typeof getAllEvents).toBe('function');
    });

    it('should export addEvent function', () => {
      expect(typeof addEvent).toBe('function');
    });

    it('should export getEventById function', () => {
      expect(typeof getEventById).toBe('function');
    });

    it('should export updateEvent function', () => {
      expect(typeof updateEvent).toBe('function');
    });

    it('should export deleteEvent function', () => {
      expect(typeof deleteEvent).toBe('function');
    });

    it('should export uploadEventImage function', () => {
      expect(typeof uploadEventImage).toBe('function');
    });
  });

  describe('Controller Function Structure', () => {
    it('should have correct parameter signature for getAllEvents', () => {
      expect(getAllEvents.length).toBe(2); // req, res parameters
    });

    it('should have correct parameter signature for addEvent', () => {
      expect(addEvent.length).toBe(2); // req, res parameters
    });

    it('should have correct parameter signature for getEventById', () => {
      expect(getEventById.length).toBe(2); // req, res parameters
    });

    it('should have correct parameter signature for updateEvent', () => {
      expect(updateEvent.length).toBe(2); // req, res parameters
    });

    it('should have correct parameter signature for deleteEvent', () => {
      expect(deleteEvent.length).toBe(2); // req, res parameters
    });

    it('should have correct parameter signature for uploadEventImage', () => {
      expect(uploadEventImage.length).toBe(2); // req, res parameters
    });
  });
});
