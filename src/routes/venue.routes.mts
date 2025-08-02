import  express  from "express";
import { addVenue, deleteVenue, getAllVenues, getVenueById, updateVenue } from "../controllers/venue.controller.mjs";

const router = express.Router();

router.get('/venues', async (req, res) => {
    res.status(200);
    return getAllVenues(req,res);

});

router.post('/venues/addvenue', addVenue);
router.get('/venues/getvenuebyid/:id', getVenueById);
router.put('/venues/updatevenue/:id', updateVenue);
router.delete('/venues/deletevenue/:id', deleteVenue)

export default router;

