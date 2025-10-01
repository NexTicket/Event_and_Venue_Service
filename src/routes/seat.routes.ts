import { Router } from 'express';
import {
  getVenueSeatMap,
  getEventSeatAvailability
} from '../controllers/seat.controller.js';

const router = Router();

// Test route
router.get('/seats/test', (req, res) => {
  res.json({ message: 'Seat routes are working!', timestamp: new Date().toISOString() });
});

// Venue seat map routes
router.get('/venues/:venueId/seatmap', getVenueSeatMap);

// Event seat availability routes
router.get('/events/:eventId/seats/availability', getEventSeatAvailability);

// Note: Seat reservation routes have been moved to Ticket_and_Order_Service
// The Event_and_Venue_Service now only handles seat maps and availability

export default router;