import { PrismaClient } from "../../generated/prisma/index";
import {Request, Response} from 'express';
import { setUserRole } from "../utils/userRoles";
// Removed: import { ensureTenantExists } from '../utils/autoCreateTenant.js';
// Now using User-Service API for tenant operations

// Helper function to ensure tenant exists locally
const ensureTenant = async (user: any) => {
  try {
    // Try to find existing tenant
    let tenant = await getPrisma().tenant.findUnique({
      where: { firebaseUid: user.uid }
    });

    // If tenant doesn't exist, create it
    if (!tenant) {
      const name = user.name || user.email || `${user.role} User`;
      
      tenant = await getPrisma().tenant.create({
        data: {
          name,
          firebaseUid: user.uid
        }
      });

      console.log(`✅ Auto-created tenant for ${user.role}: ${user.email} (${user.uid}) - ID: ${tenant.id}`);
    } else {
      console.log(`✅ Found existing tenant for ${user.role}: ${user.email} (${user.uid}) - ID: ${tenant.id}`);
    }

    return tenant;
  } catch (error) {
    console.error('Error ensuring tenant exists:', error);
    return null;
  }
};


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

  if (!user || (user.role !== 'venue_owner' && user.role !== 'organizer')) {
    return res.status(403).json({ error: 'Only venue owners and organizers can add venues' });
  }

  const { name, seatMap, location, capacity, type, latitude, longitude, description, contact, amenities, availability } = req.body;

  if (!name || !seatMap || !location || !capacity || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Ensure user has a tenant record
    const tenant = await ensureTenant(user);
    
    if (!tenant) {
      return res.status(400).json({
        error: 'Unable to create tenant for user',
        userRole: user.role
      });
    }

    console.log(`🏢 Using tenant ID ${tenant.id} for venue creation`);

    const newVenue = await getPrisma().venue.create({
      data: {
        name,
        location,
        capacity,
        seatMap,
        tenantId: tenant.id,
        ownerUid: user.uid,
        type,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        description: description || null,
        availability: availability || null,
        amenities: amenities || null
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

  // 🛡️ Role check (only venue_owner, organizer or admin can upload)
  if (!user || (user.role !== 'venue_owner' && user.role !== 'organizer' && user.role !== 'admin')) {
    console.log(`❌ Access denied: User role is ${user?.role}, expected venue_owner, organizer or admin`);
    return res.status(403).json({ error: 'Only venue owners, organizers or admins can upload images' });
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

  if (!user || (user.role !== 'venue_owner' && user.role !== 'organizer')) {
    return res.status(403).json({ error: 'Only venue owners and organizers can view their venues' });
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

// PUT /venues/updatevenue/:id - Update Venue
export const updateVenue = async (req: Request, res: Response) => {
  const user = req.user;
  const venueId = parseInt(req.params.id);

  console.log('👤 UpdateVenue - User:', user ? `${user.email} (${user.role})` : 'No user');
  console.log('📍 Updating venue ID:', venueId);

  if (!user || (user.role !== 'venue_owner' && user.role !== 'organizer')) {
    return res.status(403).json({ error: 'Only venue owners and organizers can update venues' });
  }

  const { name, seatMap, location, capacity, type, latitude, longitude, description, contact, amenities, availability } = req.body;

  try {
    // Check if venue exists and user owns it
    const existingVenue = await getPrisma().venue.findUnique({
      where: { id: venueId },
      include: { tenant: true },
    });

    if (!existingVenue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    if (existingVenue.tenant?.firebaseUid !== user.uid) {
      return res.status(403).json({ error: 'Not authorized to update this venue' });
    }

    // Update the venue
    const updatedVenue = await getPrisma().venue.update({
      where: { id: venueId },
      data: {
        ...(name && { name }),
        ...(seatMap && { seatMap }),
        ...(location && { location }),
        ...(capacity && { capacity }),
        ...(type && { type }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(description !== undefined && { description }),
        ...(contact && { contact }),
        ...(amenities && { amenities }),
        ...(availability && { availability })
      },
    });

    console.log('✅ Venue updated successfully:', updatedVenue.id);

    res.status(200).json({
      data: updatedVenue,
      message: 'Venue updated successfully',
    });

  } catch (error) {
    console.error('Failed to update venue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /venues/type/:type - Get venues by type
export const getVenuesByType = async (req: Request, res: Response) => {
    try {
        const venueType = req.params.type;
        
        if (!venueType) {
            return res.status(400).json({ error: 'Venue type is required' });
        }

        console.log('🔍 getVenuesByType called with type:', venueType);

        const venues = await getPrisma().venue.findMany({
            where: { 
                type: venueType,
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

// New function to filter venues by type, location, and amenities
export const getFilteredVenues = async (req: Request, res: Response) => {
    try {
        const { type, latitude, longitude, radius = 10, amenities } = req.query; // radius in km, default 10km
        
        console.log('🔍 getFilteredVenues called with filters:', { type, latitude, longitude, radius, amenities });

        // Build where clause dynamically
        const whereClause: any = {};

        // Filter by venue type if provided
        if (type && type !== 'all') {
            whereClause.type = type;
        }

        // Filter by location if provided (latitude, longitude, radius)
        if (latitude && longitude && radius) {
            // Note: This assumes venues have latitude and longitude fields in the database
            // For now, we'll use a simple location-based filtering if coordinates are available
            // In a real implementation, you'd use PostGIS or similar for proper geospatial queries
            const lat = parseFloat(latitude as string);
            const lng = parseFloat(longitude as string);
            const rad = parseFloat(radius as string);
            
            // Simple bounding box approximation (not accurate for large distances)
            // For proper geospatial queries, you'd need PostGIS or similar
            const latDelta = (rad / 111.32); // Approximate degrees per km latitude
            const lngDelta = (rad / (111.32 * Math.cos(lat * Math.PI / 180))); // Approximate degrees per km longitude
            
            whereClause.latitude = {
                gte: lat - latDelta,
                lte: lat + latDelta
            };
            whereClause.longitude = {
                gte: lng - lngDelta,
                lte: lng + lngDelta
            };
        }

        // Filter by amenities if provided
        if (amenities) {
            const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
            // Check if venue has any of the specified amenities
            whereClause.amenities = {
                not: null
            };
        }

        const venues = await getPrisma().venue.findMany({
            where: whereClause,
            include: { tenant: true },
            orderBy: {
                name: 'asc'
            }
        });

        // If amenities filter is specified, filter in JavaScript since amenities is JSON
        let filteredVenues = venues;
        if (amenities) {
            const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
            filteredVenues = venues.filter(venue => {
                if (!venue.amenities) return false;
                
                const venueAmenities = Array.isArray(venue.amenities) 
                    ? venue.amenities 
                    : typeof venue.amenities === 'object' 
                        ? Object.values(venue.amenities).flat() 
                        : [];
                
                return amenitiesArray.some(amenity => {
                    const amenityStr = String(amenity).toLowerCase();
                    return venueAmenities.some((va: any) => {
                        if (!va) return false;
                        const vaStr = String(va).toLowerCase();
                        return vaStr.includes(amenityStr);
                    });
                });
            });
        }

        console.log(`📊 Found ${filteredVenues.length} venues matching filters:`, { type, latitude, longitude, radius, amenities });
        res.status(200).json({
            data: filteredVenues,
            message: `Filtered venues fetched successfully`
        });
    } catch (error) {
        console.error('Failed to fetch filtered venues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// New function to check venue availability for a specific date and time slot
export const getVenueAvailability = async (req: Request, res: Response) => {
    try {
        const { venueId } = req.params;
        const { date, startTime, endTime } = req.query;

        if (!venueId || !date) {
            return res.status(400).json({
                error: 'venueId and date are required'
            });
        }

        console.log('📅 getVenueAvailability called:', { venueId, date, startTime, endTime });

        // Parse the date
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Build where clause for events on the specified date
        const whereClause: any = {
            venueId: parseInt(venueId as string),
            startDate: {
                gte: targetDate,
                lt: nextDay
            },
            status: {
                not: 'CANCELLED' // Exclude cancelled events
            }
        };

        // Get all events for this venue on this date
        const events = await getPrisma().events.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
                startDate: true,
                endDate: true,
                status: true
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        console.log(`📊 Found ${events.length} events for venue ${venueId} on ${date}`);

        // If checking for specific time slot
        if (startTime && endTime) {
            const hasConflict = events.some(event => {
                if (!event.startTime || !event.endTime) return false;

                const eventStart = new Date(`${date}T${event.startTime}`);
                const eventEnd = new Date(`${date}T${event.endTime}`);
                const requestedStart = new Date(`${date}T${startTime}`);
                const requestedEnd = new Date(`${date}T${endTime}`);

                // Check for overlap: event starts before requested ends AND event ends after requested starts
                return eventStart < requestedEnd && eventEnd > requestedStart;
            });

            return res.status(200).json({
                data: {
                    venueId: parseInt(venueId as string),
                    date,
                    requestedTime: { startTime, endTime },
                    isAvailable: !hasConflict,
                    conflictingEvents: hasConflict ? events.filter(event => {
                        if (!event.startTime || !event.endTime) return false;
                        const eventStart = new Date(`${date}T${event.startTime}`);
                        const eventEnd = new Date(`${date}T${event.endTime}`);
                        const requestedStart = new Date(`${date}T${startTime}`);
                        const requestedEnd = new Date(`${date}T${endTime}`);
                        return eventStart < requestedEnd && eventEnd > requestedStart;
                    }) : []
                },
                message: hasConflict ? 'Time slot is not available' : 'Time slot is available'
            });
        }

        // Return all events for the day (for showing availability)
        return res.status(200).json({
            data: {
                venueId: parseInt(venueId as string),
                date,
                events: events.map(event => ({
                    id: event.id,
                    title: event.title,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    status: event.status
                }))
            },
            message: `Venue availability fetched successfully`
        });

    } catch (error) {
        console.error('Failed to fetch venue availability:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};