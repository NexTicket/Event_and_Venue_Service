import { Router } from 'express';
import { VenueController } from '../controllers/venue.controller.mjs';

const router = Router();
const venueController = new VenueController();

// GET /api/venues - Get all venues
router.get('/', venueController.getAllVenues);

// GET /api/venues/:id - Get venue by ID
router.get('/:id', venueController.getVenueById);

// POST /api/venues - Create new venue
router.post('/', venueController.createVenue);

// PUT /api/venues/:id - Update venue
router.put('/:id', venueController.updateVenue);

// DELETE /api/venues/:id - Delete venue
router.delete('/:id', venueController.deleteVenue);

export default router;
