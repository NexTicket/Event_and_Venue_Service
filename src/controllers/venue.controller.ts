import { PrismaClient } from "../../generated/prisma/index.js";
import {Request, Response} from 'express';
import { setUserRole } from "../utils/userRoles";
import { ensureTenantExists } from '../utils/autoCreateTenant.js';


// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Lazy-load Prisma client
let prisma: PrismaClient;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}


export const getAllVenues = async (req: Request, res: Response) => {
    try {
        // This endpoint works for both authenticated and unauthenticated users
        const user = req.user; // Will be undefined if not authenticated
        console.log('👤 GetAllVenues - User:', user ? `${user.email} (${user.role})` : 'Public request');
        
        const venues = await(getPrisma().venue.findMany({
            include: {tenant: true}
        }));
        
        console.log(`📍 Found ${venues.length} venues`);
        
        res.status(200).json({
            data : venues,
            message : "Venues fetched successfully",
        })

    } catch(error) {
        console.error('Failed to fetch venues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export const addVenue = async (req: Request, res: Response) => {
  const user = req.user;
  console.log('User from venue controller code:', user);

  if (!user || user.role !== 'venue_owner') {
    return res.status(403).json({ error: 'Only venue owners can add venues' });
  }

  const { name, seatMap, location, capacity, type } = req.body;

  if (!name || !seatMap || !location || !capacity || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate venue type
  const validVenueTypes = ['STADIUM_INDOOR', 'STADIUM_OUTDOOR', 'THEATRE', 'CONFERENCE_HALL', 'MUSIC_VENUE', 'MOVIE_THEATER', 'OPEN_AREA'];
  if (!validVenueTypes.includes(type)) {
    return res.status(400).json({ 
      error: 'Invalid venue type',
      allowedTypes: validVenueTypes,
      received: type
    });
  }

  try {
    // Ensure user has a tenant record
    const tenant = await ensureTenantExists(user);
    
    if (!tenant) {
      return res.status(400).json({
        error: 'Unable to create tenant for user',
        userRole: user.role
      });
    }

    const newVenue = await getPrisma().venue.create({
      data: {
        name,
        location,
        capacity,
        seatMap,
        tenantId: tenant.id,
        ownerUid: user.uid,
        type
      }
    });

    res.status(201).json({
      data: newVenue,
      message: 'Venue added successfully',
    });

  } catch (error) {
    console.error('Failed to add venue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const getVenueById = async (req: Request, res: Response) => {
  const user = req.user; // May be undefined for public requests
  const venueId = parseInt(req.params.id);

  console.log('👤 GetVenueById - User:', user ? `${user.email} (${user.role})` : 'Public request');
  console.log('📍 Requested venue ID:', venueId);

  try {
    const venue = await getPrisma().venue.findUnique({
      where: { id: venueId },
      include: { tenant: true },
    });

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    // If no user (public request), return basic venue info
    if (!user) {
      console.log('🌐 Public access - returning basic venue info');
      return res.status(200).json({
        data: venue,
        message: "Venue fetched successfully",
      });
    }

    // If authenticated user, apply role-based access control
    const { role, uid } = user;
    
    if (
      role === 'admin' ||
      role === 'event_admin' ||
      role === 'organizer' ||
      role === 'customer' ||
      (role === 'venue_owner' && venue.tenant?.firebaseUid === uid)
    ) {
      console.log('✅ Authenticated access granted');
      return res.status(200).json({
        data: venue,
        message: "Venue fetched successfully",
      });
    } else {
      console.log('❌ Authenticated but not authorized');
      return res.status(403).json({ error: "Not authorized to view this venue" });
    }
  } catch (error) {
    console.error('Failed to fetch venue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateVenue = async (req: Request, res: Response) => {
  const { role, uid } = req.user;
  const venueId = parseInt(req.params.id);
  const { name, seatMap, location, capacity, type } = req.body;

  // Validate venue type if provided
  if (type !== undefined) {
    const validVenueTypes = ['STADIUM_INDOOR', 'STADIUM_OUTDOOR', 'THEATRE', 'CONFERENCE_HALL', 'MUSIC_VENUE', 'MOVIE_THEATER', 'OPEN_AREA'];
    if (!validVenueTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid venue type',
        allowedTypes: validVenueTypes,
        received: type
      });
    }
  }

  try {
    const existing = await getPrisma().venue.findUnique({
      where: { id: venueId },
      include: { tenant: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Venue not found" });
    }

    if (role === 'venue_owner' && 
      existing.tenant?.firebaseUid !== uid
    ) {
      return res.status(403).json({ error: "You are not authorized to update this venue" });
    }

    const updated = await getPrisma().venue.update({
      where: { id: venueId },
      data: { name, seatMap, location, capacity, type },
    });

    res.status(200).json({
      data: updated,
      message: "Venue updated successfully",
    });
  } catch (error) {
    console.error('Failed to update venue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deleteVenue = async (req: Request, res: Response) => {
  const { role, uid } = req.user;
  const venueId = parseInt(req.params.id);

  try {
    const existing = await getPrisma().venue.findUnique({
      where: { id: venueId },
      include: { tenant: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Venue not found" });
    }

    if (
      role === 'venue_owner' && 
      existing.tenant?.firebaseUid !== uid
    ) {
      return res.status(403).json({ error: "Not authorized to delete this venue" });
    }

    await getPrisma().venue.delete({
      where: { id: venueId },
    });

    res.status(200).json({ message: "Venue deleted successfully" });
  } catch (error) {
    console.error('Failed to delete venue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /venues/:id/seats - View Seat Map
export const getSeatMap = async (req: Request, res: Response) => {
  const venueId = parseInt(req.params.id);
  const { role } = req.user;

  try {
    const venue = await getPrisma().venue.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        name: true,
        seatMap: true,
      },
    });

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    return res.status(200).json({
      data: venue,
      message: "Seat map retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching seat map:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /venues/:id/seats - Update Seat Map
export const updateSeatMap = async (req: Request, res: Response) => {
  const venueId = parseInt(req.params.id);
  const { seatMap } = req.body;
  const { role, uid } = req.user;

  try {
    const venue = await getPrisma().venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    // Only the venue owner or admin can update
    if (role !== 'venue_owner' || venue.tenantId !== uid) {
      return res.status(403).json({ error: "You are not authorized to update seat map" });
    }

    const updatedVenue = await getPrisma().venue.update({
      where: { id: venueId },
      data: { seatMap },
    });

    return res.status(200).json({
      data: updatedVenue,
      message: "Seat map updated successfully",
    });

  } catch (error) {
    console.error("Error updating seat map:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get the capacity of a venue


//upload image to venue
export const uploadVenueImage = async (req: Request, res: Response) => {
  const venueId = parseInt(req.params.id);
  const user = req.user;

  console.log(`📸 Single image upload request for venue ID ${venueId}`);
  console.log(`👤 User: ${user?.uid} (${user?.role})`);

  // 🛡️ Role check (only venue_owner or admin can upload)
  if (!user || (user.role !== 'venue_owner' && user.role !== 'admin')) {
    console.log(`❌ Access denied: User role is ${user?.role}, expected venue_owner or admin`);
    return res.status(403).json({ error: 'Only venue owners or admins can upload images' });
  }

  // Check content type
  const contentType = req.headers['content-type'] || '';
  console.log(`📋 Content-Type: ${contentType}`);
  
  if (!contentType.includes('multipart/form-data')) {
    console.log(`❌ Invalid content type: ${contentType}`);
    return res.status(400).json({
      error: 'Invalid content type. Expected multipart/form-data',
      received: contentType,
    });
  }

  // Check if file was received
  const file = req.file;
  console.log(`� File received:`, {
    hasFile: !!file,
    fieldname: file?.fieldname,
    originalname: file?.originalname,
    mimetype: file?.mimetype,
    size: file?.size,
    path: file?.path ? 'Yes' : 'No'
  });

  if (!file) {
    console.log(`❌ No file received`);
    return res.status(400).json({
      error: 'No image file provided. Use form field name "image"',
      debug: {
        hasFile: !!req.file,
        contentType,
        files: req.files
      },
    });
  }

  // Check if Cloudinary upload was successful
  const imageUrl = (file as any).path;
  console.log(`☁️ Cloudinary URL: ${imageUrl}`);

  if (!imageUrl || !imageUrl.includes('cloudinary')) {
    console.log(`❌ Invalid Cloudinary URL: ${imageUrl}`);
    return res.status(500).json({
      error: 'Cloudinary upload failed or missing URL',
      imageUrl
    });
  }

  try {
    console.log(`💾 Saving image URL to database for venue ${venueId}...`);
    
    const updatedVenue = await getPrisma().venue.update({
      where: { id: venueId },
      data: { image: imageUrl },
    });

    console.log(`✅ Image successfully saved to database`);
    console.log(`✅ Updated venue:`, {
      id: updatedVenue.id,
      name: updatedVenue.name,
      image: updatedVenue.image
    });

    return res.status(200).json({
      message: 'Image uploaded and saved successfully',
      imageUrl,
      venueId,
      venue: {
        id: updatedVenue.id,
        name: updatedVenue.name,
        image: updatedVenue.image,
      },
    });
  } catch (error) {
    console.error('❌ Database update failed:', error);
    return res.status(500).json({
      error: 'Failed to save image URL to database',
      details: error,
      imageUrl, // Return the Cloudinary URL even if DB fails
    });
  }
};


//get my venues
export const getMyVenues = async (req: Request, res: Response) => {
  const user = req.user;
  console.log('User:', user);

  if (!user || user.role !== 'venue_owner') {
    return res.status(403).json({ error: 'Only venue owners can view their venues' });
  }

  try {
    const venues = await getPrisma().venue.findMany({
      where: { tenant: { firebaseUid: user.uid } },
      include: { tenant: true }
    });

    res.status(200).json({
      data: venues,
      message: 'My venues fetched successfully',
    });

  } catch (error) {
    console.error('Failed to fetch my venues:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /venues/type/:type - Get venues by type
export const getVenuesByType = async (req: Request, res: Response) => {
    try {
        const venueType = req.params.type;
        
        if (!venueType) {
            return res.status(400).json({ error: 'Venue type is required' });
        }

        // Validate venue type
        const validVenueTypes = ['STADIUM_INDOOR', 'STADIUM_OUTDOOR', 'THEATRE', 'CONFERENCE_HALL', 'MUSIC_VENUE', 'MOVIE_THEATER', 'OPEN_AREA'];
        if (!validVenueTypes.includes(venueType)) {
            return res.status(400).json({ 
              error: 'Invalid venue type',
              allowedTypes: validVenueTypes,
              received: venueType
            });
        }

        console.log('🔍 getVenuesByType called with type:', venueType);

        const venues = await getPrisma().venue.findMany({
            where: { 
                type: venueType as any,
                // Optionally, only approved or public venues
            },
            include: { tenant: true },
            orderBy: {
                name: 'asc'
            }
        });

        console.log(`📊 Found ${venues.length} venues of type: ${venueType}`);
        res.status(200).json({
            data: venues,
            message: `Venues of type ${venueType} fetched successfully`
        });
    } catch (error) {
        console.error('Failed to fetch venues by type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};