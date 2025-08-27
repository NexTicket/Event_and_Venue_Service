import { PrismaClient } from "../../generated/prisma/index.js";
import { Request, Response } from 'express';

// Lazy-load Prisma client
let prisma: PrismaClient;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

// Create a new tenant when user role is approved
export const createTenant = async (req: Request, res: Response) => {
  const { firebaseUid, name, email, role } = req.body;
  const user = req.user; // This comes from verifyToken middleware
  
  // Log the request for debugging
  console.log('CreateTenant request:', { firebaseUid, name, email, role });
  console.log('Authenticated user:', user);
  
  // Validate required fields
  if (!firebaseUid || !name || !role) {
    return res.status(400).json({ 
      error: 'Missing required fields: firebaseUid, name, and role are required' 
    });
  }

  // Validate role
  if (!['venue_owner', 'organizer'].includes(role)) {
    return res.status(400).json({ 
      error: 'Invalid role. Only venue_owner and organizer roles can create tenants' 
    });
  }

  try {
    // Check if tenant already exists
    const existingTenant = await getPrisma().tenant.findUnique({
      where: { firebaseUid }
    });

    if (existingTenant) {
      console.log(`✅ Tenant already exists for ${firebaseUid}: ${existingTenant.id}`);
      return res.status(200).json({
        data: existingTenant,
        message: 'Tenant already exists'
      });
    }

    // Create new tenant
    const tenant = await getPrisma().tenant.create({
      data: {
        firebaseUid,
        name,
        createdAt: new Date()
      }
    });

    console.log(`✅ Tenant created for ${role}: ${email} (${firebaseUid}) - ID: ${tenant.id}`);

    res.status(201).json({
      data: tenant,
      message: 'Tenant created successfully'
    });

  } catch (error) {
    console.error('Failed to create tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get tenant by Firebase UID
export const getTenantByFirebaseUid = async (req: Request, res: Response) => {
  const { firebaseUid } = req.params;
  
  if (!firebaseUid) {
    return res.status(400).json({ error: 'Firebase UID is required' });
  }

  try {
    const tenant = await getPrisma().tenant.findUnique({
      where: { firebaseUid },
      include: { venues: true }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.status(200).json({
      data: tenant,
      message: 'Tenant fetched successfully'
    });

  } catch (error) {
    console.error('Failed to fetch tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update tenant information
export const updateTenant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!id || !name) {
    return res.status(400).json({ error: 'ID and name are required' });
  }

  try {
    const tenant = await getPrisma().tenant.update({
      where: { id: parseInt(id) },
      data: { name }
    });

    res.status(200).json({
      data: tenant,
      message: 'Tenant updated successfully'
    });

  } catch (error) {
    console.error('Failed to update tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all tenants (admin only)
export const getAllTenants = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view all tenants' });
  }

  try {
    const tenants = await getPrisma().tenant.findMany({
      include: { venues: true }
    });

    res.status(200).json({
      data: tenants,
      message: 'All tenants fetched successfully'
    });

  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
