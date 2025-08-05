// Test individual controller functions
import { 
  addVenue, 
  getAllVenues, 
  getVenueById, 
  updateVenue, 
  deleteVenue 
} from '../../src/controllers/venue.controller';

describe('Venue Controller Functions', () => {
  describe('Function Exports', () => {
    it('should export addVenue function', () => {
      expect(typeof addVenue).toBe('function');
    });

    it('should export getAllVenues function', () => {
      expect(typeof getAllVenues).toBe('function');
    });

    it('should export getVenueById function', () => {
      expect(typeof getVenueById).toBe('function');
    });

    it('should export updateVenue function', () => {
      expect(typeof updateVenue).toBe('function');
    });

    it('should export deleteVenue function', () => {
      expect(typeof deleteVenue).toBe('function');
    });
  });

  describe('Controller Function Structure', () => {
    it('should have correct parameter signature for addVenue', () => {
      expect(addVenue.length).toBe(2); // req, res parameters
    });

    it('should have correct parameter signature for getAllVenues', () => {
      expect(getAllVenues.length).toBe(2); // req, res parameters
    });

    it('should have correct parameter signature for getVenueById', () => {
      expect(getVenueById.length).toBe(2); // req, res parameters
    });

    it('should have correct parameter signature for updateVenue', () => {
      expect(updateVenue.length).toBe(2); // req, res parameters
    });

    it('should have correct parameter signature for deleteVenue', () => {
      expect(deleteVenue.length).toBe(2); // req, res parameters
    });
  });
});
