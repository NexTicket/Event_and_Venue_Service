import  express  from "express";
import { addVenue, deleteVenue, getAllVenues, getSeatMap, getVenueById, updateSeatMap, updateVenue, uploadVenueImage, getMyVenues, getVenuesByType, getFilteredVenues, getVenueAvailability } from "../controllers/venue.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { optionalAuth } from "../middlewares/optionalAuth";
import upload from "../middlewares/upload";

const router = express.Router();

// Public endpoint that works with or without authentication
router.get('/venues', optionalAuth, async (req, res) => {
    res.status(200);
    return getAllVenues(req,res);
});

router.post('/venues', verifyToken, addVenue);
router.get('/venues/getvenuebyid/:id', optionalAuth, getVenueById);
router.put('/venues/updatevenue/:id', verifyToken, updateVenue);
router.delete('/venues/deletevenue/:id', verifyToken, deleteVenue);
router.get('/:id/seats', verifyToken, getSeatMap);
router.patch('/:id/seats', verifyToken, updateSeatMap);
router.get('/venues/myvenues', verifyToken, getMyVenues);
router.get('/venues/type/:type', optionalAuth, getVenuesByType);
router.get('/venues/filter', optionalAuth, getFilteredVenues);
router.get('/venues/:venueId/availability', optionalAuth, getVenueAvailability);

router.post('/venues/:id/image', (req, res, next) => {
  console.log('🛣️ Image upload route hit:', req.params.id);
  console.log('🛣️ Content-Type:', req.headers['content-type']);
  console.log('🛣️ User:', req.user?.uid);
  next();
}, verifyToken, (req, res, next) => {
  console.log('🛡️ After auth, user role:', req.user?.role);
  next();
}, upload.single('image'), (req, res, next) => {
  console.log('📁 After multer, file received:', !!req.file);
  if (req.file) {
    console.log('📁 Multer file details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path ? 'Has path' : 'No path'
    });
  } else {
    console.log('📁 Multer error or no file');
    console.log('📁 req.body:', req.body);
    console.log('📁 req.files:', req.files);
  }
  next();
}, uploadVenueImage);

// Temporary endpoint to set user roles - REMOVE IN PRODUCTION
// router.post('/admin/set-role', setRole);


export default router;

