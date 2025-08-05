import  express  from "express";
import { addVenue, deleteVenue, getAllVenues, getSeatMap, getVenueById, updateSeatMap, updateVenue } from "../controllers/venue.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.get('/venues', async (req, res) => {
    res.status(200);
    return getAllVenues(req,res);

});

router.post('/venues', verifyToken, addVenue);
router.get('/venues/getvenuebyid/:id', verifyToken, getVenueById);
router.put('/venues/updatevenue/:id', verifyToken, updateVenue);
router.delete('/venues/deletevenue/:id', verifyToken, deleteVenue);
router.get('/:id/seats', verifyToken, getSeatMap);
router.patch('/:id/seats', verifyToken, updateSeatMap);


export default router;

