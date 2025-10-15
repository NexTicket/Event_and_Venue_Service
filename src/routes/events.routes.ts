import express from 'express';
import {
    getAllEvents,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent,
    uploadEventImage,
    approveEvent,
    rejectEvent,
    getEventsByVenueId,
    getEventsByOrganizer,
    getEventsByEventAdmin,
    getEventsByCheckinOfficer
} from '../controllers/event.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { optionalAuth } from '../middlewares/optionalAuth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// List all events - use optionalAuth to support both public and authenticated access
router.get('/events', optionalAuth, getAllEvents);

// Specific routes MUST come before parameterized routes
router.get('/events/my-assigned-events', verifyToken, getEventsByEventAdmin); // For event admins
router.get('/events/my-checkin-events', verifyToken, getEventsByCheckinOfficer); // For checkin officers
router.get('/events/venue/:venueId', optionalAuth, getEventsByVenueId); // New route for events by venue
router.get('/events/organizer/:organizerId', verifyToken, getEventsByOrganizer); // New route for events by organizer

// Get single event by ID - MUST be last among GET routes to avoid matching other patterns
router.get('/events/:id', optionalAuth, getEventById); // Uses optional auth - works for public and authenticated users

// Create, update, delete
router.post('/events', verifyToken, addEvent);
router.put('/events/:id', verifyToken, updateEvent);
router.delete('/events/:id', verifyToken, deleteEvent);

// Image upload route for events
router.post('/events/:eventId/image', 
  verifyToken, 
  upload.single('image'), 
  uploadEventImage
);

// Approval/rejection routes
router.post('/events/:eventId/approve', verifyToken, approveEvent);
router.post('/events/:eventId/reject', verifyToken, rejectEvent);

export default router;

