import  express  from "express";
import { addVenue, getAllVenues, getVenueById } from "../controllers/venue.controller.mjs";

const router = express.Router();

router.get('/venues', async (req, res) => {
    res.status(200);
    return getAllVenues(req,res);

});

router.post('/venues/addvenue', addVenue);
router.get('/venues/getvenuebyid/:id', getVenueById);

export default router;

