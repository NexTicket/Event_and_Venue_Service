import express from 'express';
import { setUserClaims, bootstrapAdmin, fetchFirebaseUsers, ensureUserTenant } from '../controllers/user.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

// Bootstrap admin role (no auth required - only for initial setup)
router.post('/users/bootstrap-admin', bootstrapAdmin);

// Set custom claims for a user (admin only)
router.post('/users/set-claims', verifyToken, setUserClaims);

// Fetch Firebase users by role (admin only)
router.post('/users/firebase-users', verifyToken, fetchFirebaseUsers);

// Ensure user has tenant record (authenticated users)
router.post('/users/ensure-tenant', verifyToken, ensureUserTenant);

// Fix: Use named export instead of default export for ESM compatibility
export const userRoutes = router;
