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
} from '../controllers/event.controller';
import { verifyToken} from '../middlewares/verifyToken';
import upload from '../middlewares/upload';

const router = express.Router();

router.get('/events', getAllEvents);
router.get('/events/geteventbyid/:id', getEventById); // Made public for viewing
router.get('/events/venue/:venueId', getEventsByVenueId); // New route for events by venue
router.get('/events/organizer/:organizerId', getEventsByOrganizer); // New route for events by organizer
router.get('/events/my-assigned-events', verifyToken, getEventsByEventAdmin); // For event admins
router.get('/events/my-checkin-events', verifyToken, getEventsByCheckinOfficer); // For checkin officers
router.post('/events',verifyToken, addEvent);
router.put('/events/update-event/:id',verifyToken, updateEvent);
router.delete('/events/delete-event/:id', verifyToken, deleteEvent);

// Image upload route for events
router.post('/events/:eventId/image', 
  verifyToken, 
  upload.single('image'), 
  uploadEventImage
);

router.post('/events/:eventId/approve', verifyToken, approveEvent);
router.post('/events/:eventId/reject', verifyToken, rejectEvent);

export default router;

