import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";

// Lazy-load Prisma client
let prisma: PrismaClient;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

// Create a new tenant
export const createTenant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, firebaseUid } = req.body;

    if (!name || !firebaseUid) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'firebaseUid']
      });
    }

    // Check if tenant with this firebaseUid already exists
    const existingTenant = await getPrisma().tenant.findUnique({
      where: { firebaseUid }
    });

    if (existingTenant) {
      return res.status(200).json({
        message: 'Tenant already exists',
        tenant: existingTenant
      });
    }

    // Create new tenant
    const tenant = await getPrisma().tenant.create({
      data: {
        name,
        firebaseUid
      }
    });

    return res.status(201).json({
      message: 'Tenant created successfully',
      tenant
    });

  } catch (error) {
    console.error('Error creating tenant:', error);
    return res.status(500).json({
      error: 'Failed to create tenant',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get tenant by Firebase UID
export const getTenantByFirebaseUid = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { firebaseUid } = req.params;

    if (!firebaseUid) {
      return res.status(400).json({
        error: 'firebaseUid parameter is required'
      });
    }

    const tenant = await getPrisma().tenant.findUnique({
      where: { firebaseUid },
      include: {
        venues: true,
        events: true
      }
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        firebaseUid
      });
    }

    return res.status(200).json({
      tenant
    });

  } catch (error) {
    console.error('Error fetching tenant:', error);
    return res.status(500).json({
      error: 'Failed to fetch tenant',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get tenant by ID
export const getTenantById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const tenantId = parseInt(id);

    if (isNaN(tenantId)) {
      return res.status(400).json({
        error: 'Invalid tenant ID'
      });
    }

    const tenant = await getPrisma().tenant.findUnique({
      where: { id: tenantId },
      include: {
        venues: true,
        events: true
      }
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        id: tenantId
      });
    }

    return res.status(200).json({
      tenant
    });

  } catch (error) {
    console.error('Error fetching tenant:', error);
    return res.status(500).json({
      error: 'Failed to fetch tenant',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all tenants (admin only)
export const getAllTenants = async (req: Request, res: Response): Promise<Response> => {
  try {
    const tenants = await getPrisma().tenant.findMany({
      include: {
        venues: true,
        events: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      tenants,
      count: tenants.length
    });

  } catch (error) {
    console.error('Error fetching tenants:', error);
    return res.status(500).json({
      error: 'Failed to fetch tenants',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update tenant
export const updateTenant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const tenantId = parseInt(id);
    const { name } = req.body;

    if (isNaN(tenantId)) {
      return res.status(400).json({
        error: 'Invalid tenant ID'
      });
    }

    if (!name) {
      return res.status(400).json({
        error: 'Name is required for update'
      });
    }

    const tenant = await getPrisma().tenant.update({
      where: { id: tenantId },
      data: { name },
      include: {
        venues: true,
        events: true
      }
    });

    return res.status(200).json({
      message: 'Tenant updated successfully',
      tenant
    });

  } catch (error) {
    console.error('Error updating tenant:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({
        error: 'Tenant not found'
      });
    }

    return res.status(500).json({
      error: 'Failed to update tenant',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete tenant (admin only - be careful with this)
export const deleteTenant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const tenantId = parseInt(id);

    if (isNaN(tenantId)) {
      return res.status(400).json({
        error: 'Invalid tenant ID'
      });
    }

    // Check if tenant has associated venues or events
    const tenant = await getPrisma().tenant.findUnique({
      where: { id: tenantId },
      include: {
        venues: true,
        events: true
      }
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found'
      });
    }

    if (tenant.venues.length > 0 || tenant.events.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete tenant with associated venues or events',
        venueCount: tenant.venues.length,
        eventCount: tenant.events.length
      });
    }

    await getPrisma().tenant.delete({
      where: { id: tenantId }
    });

    return res.status(200).json({
      message: 'Tenant deleted successfully',
      deletedTenant: {
        id: tenantId,
        name: tenant.name
      }
    });

  } catch (error) {
    console.error('Error deleting tenant:', error);
    return res.status(500).json({
      error: 'Failed to delete tenant',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Ensure tenant exists (used by User-Service)
export const ensureTenantExists = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { firebaseUid, name } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({
        error: 'firebaseUid is required'
      });
    }

    // Try to find existing tenant
    let tenant = await getPrisma().tenant.findUnique({
      where: { firebaseUid }
    });

    // If tenant doesn't exist, create it
    if (!tenant) {
      if (!name) {
        return res.status(400).json({
          error: 'name is required when creating a new tenant'
        });
      }

      tenant = await getPrisma().tenant.create({
        data: {
          name,
          firebaseUid
        }
      });

      return res.status(201).json({
        message: 'Tenant created successfully',
        tenant,
        created: true
      });
    }

    return res.status(200).json({
      message: 'Tenant already exists',
      tenant,
      created: false
    });

  } catch (error) {
    console.error('Error ensuring tenant exists:', error);
    return res.status(500).json({
      error: 'Failed to ensure tenant exists',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
