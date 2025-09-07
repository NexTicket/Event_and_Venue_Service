import express from 'express';
import {
    getAllEvents,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent,
    uploadEventImage
} from '../controllers/event.controller';
import { verifyToken} from '../middlewares/verifyToken';
import upload from '../middlewares/upload';

const router = express.Router();

router.get('/events', getAllEvents);
router.get('/events/geteventbyid/:id', getEventById);
router.post('/events',verifyToken, addEvent);
router.put('/events/update-event/:id',verifyToken, updateEvent);
router.delete('/events/delete-event/:id', verifyToken, deleteEvent);

// Image upload route for events
router.post('/events/:eventId/image', 
  verifyToken, 
  upload.single('image'), 
  uploadEventImage
);

export default router;

