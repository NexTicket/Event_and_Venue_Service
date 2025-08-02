import  express  from "express";
import { getAllVenues } from "../controllers/venue.controller.mjs";

const router = express.Router();

router.get('/venues', async (req, res) => {
    res.status(200);
    return getAllVenues(req,res);

});

export default router;

