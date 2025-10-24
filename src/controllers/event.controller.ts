import { PrismaClient } from "@prisma/client";
import { Request,Response } from 'express';
import cloudinary from '../utils/cloudinary.js';
import { cache, CacheKeys, CacheTTL, invalidateEventCache } from '../utils/cache.js';
// Removed: import { ensureTenantExists } from '../utils/autoCreateTenant.js';
// Now using User-Service API for tenant operations

// Helper function to call User-Service for tenant operations
const ensureTenantViaUserService = async (user: any, authToken: string) => {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:4001';
    console.log('📞 Calling User Service ensure-tenant for user:', user.uid);
    
    const response = await fetch(`${userServiceUrl}/api/users/ensure-tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ User Service ensure-tenant failed:', response.status, errorText);
      return null;
    }

        const result = await response.json();
        console.log('📦 User Service response:', JSON.stringify(result, null, 2));

        // Try several possible response shapes from User-Service / Event-Service
        // 1) { data: { tenantId: number, ... } }
        // 2) { data: { tenant: { id: number, ... } } }
        // 3) { tenant: { id: number, ... } }
        // 4) { tenantId: number }
        // 5) { data: { requiresTenant: false } } -> fall back to local tenant creation

        // Normalize tenant when possible
        let tenant: any = null;

        if (result && typeof result === 'object') {
            if (result.data && result.data.tenantId) {
                tenant = { id: result.data.tenantId };
            } else if (result.data && result.data.tenant && result.data.tenant.id) {
                tenant = result.data.tenant;
            } else if (result.tenant && result.tenant.id) {
                tenant = result.tenant;
            } else if (result.tenantId) {
                tenant = { id: result.tenantId };
            }
        }

        if (tenant && tenant.id) {
            console.log('✅ Tenant extracted from User Service response:', tenant.id);
            return tenant;
        }

        // If User-Service explicitly says no tenant required, return null so caller can decide
        if (result && result.data && result.data.requiresTenant === false) {
            console.log('ℹ️ User-Service indicates tenant not required for this role');
            return null;
        }

        // As a last-resort fallback: try to find/create tenant locally in Event Service DB
        try {
            console.log('🔁 Falling back to local tenant lookup/create for user:', user.uid);
            const prisma = getPrisma();

            // Try to find existing tenant by firebaseUid
            let localTenant = await prisma.tenant.findUnique({ where: { firebaseUid: user.uid } });

            if (!localTenant) {
                const tenantName = user.name || user.email || `${user.role} User`;
                localTenant = await prisma.tenant.create({ data: { name: tenantName, firebaseUid: user.uid } });
                console.log('✅ Created local tenant as fallback:', localTenant.id);
            } else {
                console.log('✅ Found local tenant as fallback:', localTenant.id);
            }

            return localTenant;
        } catch (fallbackError) {
            console.error('❌ Fallback local tenant creation failed:', fallbackError);
            return null;
        }
  } catch (error) {
    console.error('❌ Error calling User-Service for tenant:', error);
    return null;
  }
};


// Extend the Express Request interface - this allows us to attach user data to the request object
declare global {
    namespace Express {
        interface Request {
            user? : any; // Optional user object to hold authenticated user data - not every request will have user.req.role
        }
    }
}

// Lazy-load Prisma client to avoid issues with multiple instances in prisma client - Singleton pattern
let prisma : PrismaClient;

function getPrisma() {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

export const getAllEvents = async (req: Request , res: Response) => {
    try {
        // Get status from query parameter
        const status = req.query.status as string;
        const category = req.query.category as string;
        const user = req.user;
        const { role } = user || {};
        
        // PERFORMANCE: Only log in development or on errors
        const isDev = process.env.NODE_ENV === 'development';
        
        // Check cache first
        const cacheKey = CacheKeys.allEvents(status, category);
        const cachedEvents = await cache.get(cacheKey);
        
        if (cachedEvents) {
            if (isDev) console.log('✅ Cache HIT:', cacheKey);
            return res.status(200).json({
                data: cachedEvents,
                message: "Events fetched successfully (cached)",
                cached: true
            });
        }
        
        if (isDev) console.log('❌ Cache MISS:', cacheKey);
        
        // Build where clause based on status parameter and user role
        const whereClause: any = {};
        
        if (status) {
            // If status is explicitly requested
            if (status.toUpperCase() === 'PENDING' && role !== 'admin') {
                // Only admins can request PENDING events
                if (isDev) console.log('❌ 403 Forbidden - role is not admin:', role);
                return res.status(403).json({ 
                    error: 'Not authorized to view pending events'
                });
            }
            whereClause.status = status.toUpperCase();
        } else {
            // No status specified - default behavior
            if (role === 'admin') {
                // Admins see all events by default
                // Don't filter by status
            } else {
                // Public users and other roles see only APPROVED events
                whereClause.status = 'APPROVED';
            }
        }

        if (category) {
            whereClause.category = category;
        }

        const events = await getPrisma().events.findMany({
            where: whereClause,
            select: {
                // select all event fields
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                startTime: true,
                endTime: true,
                category: true,
                type: true,
                status: true,
                image: true,
                venueId: true,
                eventAdminUid: true,
                checkinOfficerUids: true,
                Tenant:{
                    select: {
                        id: true, 
                        name: true 
                    }
                },
                venue: {
                    select: {
                        id: true,
                        name: true,
                        location: true
                    }
                }
                
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        // Cache the results for 5 minutes
        await cache.set(cacheKey, events, CacheTTL.MEDIUM);
        
        res.status(200).json({
            data: events,
            message: "Events fetched successfully",
            cached: false
        });
    } catch (error) {
        console.error('Failed to fetch events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getEventsByVenueId = async (req: Request, res: Response) => {
    try {
        const venueId = parseInt(req.params.venueId);
        
        if (!venueId || isNaN(venueId)) {
            return res.status(400).json({ 
                error: 'Invalid venue ID provided',
                received: req.params.venueId
            });
        }

        // Fetch events for the specific venue
        const events = await getPrisma().events.findMany({
            where: { 
                venueId: venueId,
                status: 'APPROVED' // Only show approved events to public
            },
            select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                startTime: true,
                endTime: true,
                category: true,
                type: true,
                status: true,
                image: true,
                venueId: true,
                Tenant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                venue: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        capacity: true
                    }
                }
            },
            orderBy: {
                startDate: 'asc' // Order by event start date
            }
        });

        res.status(200).json({
            data: events,
            message: `Events for venue ${venueId} fetched successfully`,
            count: events.length
        });
    } catch (error) {
        console.error('Failed to fetch events by venue ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get events assigned to a specific event admin
export const getEventsByEventAdmin = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        
        if (!user || user.role !== 'event_admin') {
            return res.status(403).json({ error: 'Only event admins can access this endpoint' });
        }

        console.log('🎯 Fetching events for event admin:', user.uid);

        const events = await getPrisma().events.findMany({
            where: {
                eventAdminUid: user.uid,
                status: 'APPROVED' // Only show approved events
            },
            select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                startTime: true,
                endTime: true,
                category: true,
                type: true,
                status: true,
                image: true,
                venueId: true,
                eventAdminUid: true,
                checkinOfficerUids: true,
                Tenant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                venue: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        capacity: true
                    }
                }
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        console.log(`📊 Found ${events.length} events assigned to event admin: ${user.uid}`);

        // Transform the data to match frontend expectations (title -> name)
        const transformedEvents = events.map((event: any) => ({
            ...event,
            name: event.title, // Map title to name for frontend compatibility
            capacity: event.venue?.capacity || 0
        }));

        res.status(200).json({
            data: transformedEvents,
            message: "Assigned events fetched successfully",
            count: transformedEvents.length
        });
    } catch (error) {
        console.error('❌ Failed to fetch events for event admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get events assigned to a specific checkin officer
export const getEventsByCheckinOfficer = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        
        if (!user || user.role !== 'checkin_officer') {
            return res.status(403).json({ error: 'Only checkin officers can access this endpoint' });
        }

        console.log('🎯 Fetching events for checkin officer:', user.uid);

        const events = await getPrisma().events.findMany({
            where: {
                checkinOfficerUids: {
                    has: user.uid // Check if the user's UID is in the array
                },
                status: 'APPROVED' // Only show approved events
            },
            select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                startTime: true,
                endTime: true,
                category: true,
                type: true,
                status: true,
                image: true,
                venueId: true,
                eventAdminUid: true,
                checkinOfficerUids: true,
                Tenant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                venue: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        capacity: true
                    }
                }
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        console.log(`📊 Found ${events.length} events assigned to checkin officer: ${user.uid}`);

        // Transform the data to match frontend expectations (title -> name)
        const transformedEvents = events.map((event: any) => ({
            ...event,
            name: event.title, // Map title to name for frontend compatibility
            capacity: event.venue?.capacity || 0
        }));

        res.status(200).json({
            data: transformedEvents,
            message: "Assigned events fetched successfully",
            count: transformedEvents.length
        });
    } catch (error) {
        console.error('❌ Failed to fetch events for checkin officer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addEvent = async (req: Request, res: Response) => {

    const user = req.user;
    
    console.log('🎫 AddEvent - User details:', {
        exists: !!user,
        uid: user?.uid,
        email: user?.email,
        role: user?.role,
        name: user?.name
    });
    
    // For development: Allow admin and customer roles in addition to organizer
    if (!user || !['organizer', 'admin', 'customer'].includes(user.role)) {
        console.log('❌ Authorization failed - invalid role:', user?.role);
        return res.status(403).json({
            error: 'Only registered organizers can add events',
            userRole: user?.role,
            allowedRoles: ['organizer']
        });
    }
    
    const { title, description, category, type, startDate, endDate, startTime, endTime, venueId, image } = req.body;
    
    
    if(!title || !description || !category || !type || !startDate) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['title', 'description', 'category', 'type', 'startDate'],
            received: { title: !!title, description: !!description, category: !!category, type: !!type, startDate: !!startDate }
        });
    }

    // Convert venueId to number if provided
    const parsedVenueId = venueId ? parseInt(venueId, 10) : null;
    if (venueId && (parsedVenueId === null || isNaN(parsedVenueId))) {
        console.log('❌ Invalid venueId format:', venueId);
        return res.status(400).json({ 
            error: 'Invalid venueId - must be a number',
            received: venueId
        });
    }

    // Validate EventType enum
    if (!['MOVIE', 'EVENT'].includes(type)) {
        console.log('❌ Invalid event type:', type);
        return res.status(400).json({ 
            error: 'Invalid event type',
            allowedTypes: ['MOVIE', 'EVENT'],
            received: type
        });
    }

    try {
        console.log('🏢 Ensuring tenant exists for user:', user.uid);
        
        // Ensure user has a tenant record - create locally if needed
        let tenant = await getPrisma().tenant.findUnique({
            where: { firebaseUid: user.uid }
        });

        if (!tenant) {
            // Create tenant locally
            const tenantName = user.name || user.email || `${user.role} User`;
            console.log('🏢 Creating new tenant for user:', user.uid, 'with name:', tenantName);
            
            tenant = await getPrisma().tenant.create({
                data: {
                    name: tenantName,
                    firebaseUid: user.uid
                }
            });
            
            console.log('✅ Created new tenant:', tenant.id);
        } else {
            console.log('✅ Found existing tenant:', tenant.id);
        }
        
        if (!tenant || !tenant.id) {
            console.log('❌ Failed to create/find tenant for user:', user.uid);
            return res.status(400).json({
                error: 'Unable to create tenant for user',
                userRole: user.role,
                details: 'Tenant ID is missing or invalid'
            });
        } 
        
        // Parse dates properly - handle both date-only and full datetime strings
        const parseEventDate = (dateString: string) => {
            // If it's a date-only format (YYYY-MM-DD), append time
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return new Date(`${dateString}T00:00:00Z`);
            }
            return new Date(dateString);
        };

        const eventStartDate = parseEventDate(startDate);
        const eventEndDate = endDate ? parseEventDate(endDate) : null;


        const newEvent = await getPrisma().events.create({
            data: {
                title,
                description,
                category,
                type,
                startDate: eventStartDate,
                endDate: eventEndDate,
                startTime: startTime ?? null,
                endTime: endTime ?? null,
                tenantId: tenant.id,
                venueId: parsedVenueId,
                image: image || null
            }
        });

        res.status(201).json({
            data: newEvent,
            message: 'Event created successfully',
        });

    } catch (error) {
        console.error('❌ Failed to create event:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.id);
    
    // For public access, user might not exist
    const user = req.user;
    const { role, uid } = user || {};

    try {
        const event = await getPrisma().events.findUnique({
            where: { id: eventId },
            include: {
                Tenant: {
                    select: {
                        id: true,
                        name: true,
                        firebaseUid: true
                    }
                },
                venue: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        capacity: true
                    }
                }
            }
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // For public access, only show approved events
        // For authenticated users, apply the original logic
        if (!user) {
            // Public access - only show approved events
            if (event.status !== 'APPROVED') {
                return res.status(404).json({ error: 'Event not found' });
            }
            return res.status(200).json({
                data: event,
                message: 'Event fetched successfully'
            });
        }

        // Authenticated access - apply original authorization logic
        // Admin can see ALL events (including PENDING for review)
        // Customers and venue owners can see APPROVED events
        // Organizers and event admins can see their own events
        if (role === 'admin') {
            return res.status(200).json({
                data: event,
                message: 'Event fetched successfully'
            });
        }
        
        if (role === 'customer' || role === 'venue_owner') {
            // Only show approved events to customers and venue owners
            if (event.status !== 'APPROVED') {
                return res.status(404).json({ error: 'Event not found' });
            }
            return res.status(200).json({
                data: event,
                message: 'Event fetched successfully'
            });
        }
        
        if ((role === 'event_admin' || role === 'organizer') && event.Tenant?.firebaseUid === uid) {
            // Organizers and event admins can see their own events regardless of status
            return res.status(200).json({
                data: event,
                message: 'Event fetched successfully'
            });
        }
        
        return res.status(403).json({ error: 'Not Authorized to view this event' });

    } catch (error) {
        console.error('Failed to fetch event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 

export const updateEvent = async (req: Request, res: Response) => {
    const { uid , role} = req.user;
    const eventId = parseInt(req.params.id);
    const { 
        title, 
        description, 
        startDate, 
        endDate, 
        startTime, 
        endTime, 
        capacity, 
        checkinOfficerUids 
    } = req.body;

    try{
        const existing = await getPrisma().events.findUnique({
            where: { id: eventId },
            include: { Tenant: true }
        })

        if(!existing){
            return res.status(404).json({error: 'Event not found'});
        }

        if((role === 'event_admin'|| role === 'organizer') && existing.Tenant?.firebaseUid !== uid){
            return res.status(403).json({error: 'You are not authorized to update this event'})
        }

        // Build update data object, only including fields that are provided
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = new Date(endDate);
        if (startTime !== undefined) updateData.startTime = startTime;
        if (endTime !== undefined) updateData.endTime = endTime;
        if (capacity !== undefined) updateData.capacity = parseInt(capacity);
        if (checkinOfficerUids !== undefined) {
            // Clean and validate checkinOfficerUids
            const cleanUids = Array.isArray(checkinOfficerUids) 
                ? checkinOfficerUids.filter((uid: any) => uid && uid.trim()) 
                : [];
            updateData.checkinOfficerUids = cleanUids;
        }

        console.log('🔄 Updating event with data:', updateData);

        const updated = await getPrisma().events.update({
            where : { id: eventId },
            data: updateData,
            include: {
                Tenant: true,
                venue: true
            }
        })

        // Invalidate cache
        await invalidateEventCache(eventId.toString(), updated.venueId?.toString(), updated.Tenant?.id.toString());

        res.status(200).json({
            data: updated,
            message: 'Event updated successfully'
        })
    }catch(error){
        console.error('Failed to update events',error),
        res.status(500).json({error:'Internal server error'})
    }
}

export const deleteEvent = async ( req: Request , res: Response ) => {
    const { uid , role } = req.user;
    const eventId = parseInt(req.params.id);

    try{
        const existing = await getPrisma().events.findUnique({
            where: { id : eventId },
            include: {Tenant : true }
        })

        if(!existing){
            return res.status(404).json({error:'Event not found'})
        }

        if(role==='organizer' && existing.Tenant?.firebaseUid !== uid ){
            return res.status(403).json({error:'You are not authorized to delete the event'});
        }

        await getPrisma().events.delete({
            where : { id : eventId}
        })

        // Invalidate cache
        await invalidateEventCache(eventId.toString(), existing.venueId?.toString(), existing.Tenant?.id.toString());

        res.status(200).json({message:'Event deleted successfully'})
    }catch(error){
        console.error('Failed to delete event',error);
        return res.status(500).json({error:'Internal server error'});
    }
}

// Upload event image to Cloudinary
export const uploadEventImage = async (req: Request, res: Response) => {
    console.log('🖼️ Event image upload request received');
    console.log('🖼️ Files:', req.files);
    console.log('🖼️ File:', req.file);
    console.log('🖼️ Body:', req.body);

    try {
        const { eventId } = req.params;
        const user = req.user;

        console.log('🖼️ Event ID:', eventId);
        console.log('🖼️ User:', user);

        if (!eventId) {
            return res.status(400).json({ error: 'Event ID is required' });
        }

        if (!req.file) {
            console.log('❌ No file received in upload request');
            return res.status(400).json({ 
                error: 'No image file provided',
                received: {
                    file: !!req.file,
                    files: !!req.files,
                    fileKeys: req.files ? Object.keys(req.files) : []
                }
            });
        }

        // Check if event exists and user has permission
        const event = await getPrisma().events.findUnique({
            where: { id: parseInt(eventId) },
            include: { Tenant: true }
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check authorization
        if (user.role !== 'admin' && event.Tenant?.firebaseUid !== user.uid) {
            return res.status(403).json({ error: 'Not authorized to upload image for this event' });
        }

        console.log('🖼️ File uploaded to Cloudinary:', req.file);
        
        // Get the uploaded file URL from Cloudinary
        const imageUrl = (req.file as any).path;
        
        console.log('🖼️ Image URL from Cloudinary:', imageUrl);

        // Update the event with the image URL
        const updatedEvent = await getPrisma().events.update({
            where: { id: parseInt(eventId) },
            data: { image: imageUrl }
        });

        res.status(200).json({
            message: 'Event image uploaded successfully',
            data: {
                eventId: updatedEvent.id,
                imageUrl: imageUrl,
                event: updatedEvent
            }
        });

    } catch (error) {
        console.error('❌ Error uploading event image:', error);
        res.status(500).json({ 
            error: 'Failed to upload image',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};


// Approve event controller
export const approveEvent = async (req: Request, res: Response) => {
    const user = req.user;
    const eventId = parseInt(req.params.eventId);
    const { venueId, eventAdminUid, checkinOfficerUids } = req.body;
    
    console.log('🔍 Approve event request:', { eventId, venueId, eventAdminUid, checkinOfficerUids });
    
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can approve events' });
    }
    
    try {
        const event = await getPrisma().events.findUnique({ where: { id: eventId } });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Clean and validate checkinOfficerUids - remove any null/undefined values
        let cleanCheckinOfficerUids: string[] = [];
        if (Array.isArray(checkinOfficerUids)) {
            cleanCheckinOfficerUids = checkinOfficerUids.filter((uid: any) => uid !== null && uid !== undefined && uid !== '');
        }
        
        console.log('✅ Cleaned checkinOfficerUids:', cleanCheckinOfficerUids);
        
        // Update event status and assign staff
        const updatedEvent = await getPrisma().events.update({
            where: { id: eventId },
            data: { 
                status: 'APPROVED', 
                venueId: venueId ? parseInt(venueId) : null,
                eventAdminUid: eventAdminUid || null,
                checkinOfficerUids: cleanCheckinOfficerUids
            },
            include: {
                venue: true,
                Tenant: true
            }
        });

        console.log('✅ Event approved successfully:', updatedEvent.id);

        res.status(200).json({
            message: 'Event approved successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('❌ Failed to approve event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reject event controller
export const rejectEvent = async (req: Request, res: Response) => {
    const user = req.user;
    const eventId = parseInt(req.params.eventId);
    
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can reject events' });
    }
    
    try {
        const event = await getPrisma().events.findUnique({ where: { id: eventId } });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const updatedEvent = await getPrisma().events.update({
            where: { id: eventId },
            data: { status: 'REJECTED' }
        });

        res.status(200).json({
            message: 'Event rejected successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('Failed to reject event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get events by organizer (firebaseUid)
export const getEventsByOrganizer = async (req: Request, res: Response) => {
    try {
        const { organizerId } = req.params;
        
        if (!organizerId) {
            return res.status(400).json({ 
                error: 'Organizer ID is required',
                received: organizerId
            });
        }

        // First find the tenant with this firebaseUid
        const tenant = await getPrisma().tenant.findUnique({
            where: { firebaseUid: organizerId }
        });

        if (!tenant) {
            return res.status(404).json({ 
                error: 'Organizer not found',
                organizerId: organizerId
            });
        }

        console.log('📋 Fetching events for organizer:', {
            organizerId,
            tenantId: tenant.id,
            tenantName: tenant.name
        });

        // Fetch events for this tenant/organizer
        const events = await getPrisma().events.findMany({
            where: { 
                tenantId: tenant.id
                // Note: Not filtering by status here so organizers can see all their events
            },
            select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                startTime: true,
                endTime: true,
                category: true,
                type: true,
                status: true,
                image: true,
                venueId: true,
                Tenant: {
                    select: {
                        id: true,
                        name: true,
                        firebaseUid: true
                    }
                },
                venue: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        capacity: true
                    }
                }
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        res.status(200).json({
            data: events,
            message: `Events for organizer ${organizerId} fetched successfully`,
            count: events.length,
            organizerName: tenant.name
        });
    } catch (error) {
        console.error('Failed to fetch events by organizer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

