import express from 'express';
import { setUserClaims, bootstrapAdmin } from '../controllers/user.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

// Bootstrap admin role (no auth required - only for initial setup)
router.post('/users/bootstrap-admin', bootstrapAdmin);

// Set custom claims for a user (admin only)
router.post('/users/set-claims', verifyToken, setUserClaims);

export default router;
