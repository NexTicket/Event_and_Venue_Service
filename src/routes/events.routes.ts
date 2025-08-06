import express from 'express';
import {
    getAllEvents,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent
} from '../controllers/event.controller.ts';
import { verifyToken} from '../middlewares/verifyToken.ts';

const router = express.Router();

router.get('/events', getAllEvents);
router.get('/events/geteventbyid/:id', verifyToken , getEventById);
router.post('/events',verifyToken, addEvent);
router.put('/events/update-event/:id',verifyToken, updateEvent);
router.delete('/events/delete-event/:id', verifyToken, deleteEvent);

export default router;

