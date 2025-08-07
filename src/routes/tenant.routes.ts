import express from "express";
import { createTenant, getTenantByFirebaseUid, updateTenant, getAllTenants } from "../controllers/tenant.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

// Test route without authentication
router.get('/tenants/health', (req, res) => {
  res.json({ status: 'Tenant routes working!', timestamp: new Date().toISOString() });
});

// Test route with simple auth bypass for testing
router.post('/tenants/test', (req, res) => {
  res.json({ 
    message: 'Tenant POST endpoint working!', 
    body: req.body,
    timestamp: new Date().toISOString() 
  });
});

// Create a new tenant (when admin approves role request)
router.post('/tenants', verifyToken, createTenant);

// Get tenant by Firebase UID
router.get('/tenants/firebase/:firebaseUid', verifyToken, getTenantByFirebaseUid);

// Update tenant information
router.put('/tenants/:id', verifyToken, updateTenant);

// Get all tenants (admin only)
router.get('/tenants', verifyToken, getAllTenants);

export default router;
