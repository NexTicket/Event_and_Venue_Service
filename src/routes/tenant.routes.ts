import express from 'express';
import {
  createTenant,
  getTenantByFirebaseUid,
  getTenantById,
  getAllTenants,
  updateTenant,
  deleteTenant,
  ensureTenantExists
} from '../controllers/tenant.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

// Health check route
router.get('/tenants/health', (req, res) => {
  res.json({ status: 'Tenant routes working!', timestamp: new Date().toISOString() });
});

// Ensure tenant exists (used by User-Service) - no auth required for service-to-service
router.post('/tenants/ensure', ensureTenantExists);

// Get tenant by Firebase UID (used by User-Service) - no auth required for service-to-service
router.get('/tenants/firebase/:firebaseUid', getTenantByFirebaseUid);

// Create a new tenant
router.post('/tenants', createTenant);

// Get tenant by ID
router.get('/tenants/:id', getTenantById);

// Get all tenants (admin only)
router.get('/tenants', getAllTenants);

// Update tenant
router.put('/tenants/:id', updateTenant);

// Delete tenant (admin only - be careful)
router.delete('/tenants/:id', verifyToken, deleteTenant);

export default router;
