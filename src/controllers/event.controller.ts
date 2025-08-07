import { PrismaClient } from "../../generated/prisma";
import { Request,Response } from 'express';
import cloudinary from '../utils/cloudinary';

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
        const events = await getPrisma().events.findMany({
            select: {
                // select all event fields
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                category: true,
                type: true,
                status: true,
                image: true,
                venueId: true,
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
                
            }
        });
        res.status(200).json({
            data: events,
            message: "Events fetched successfully"
        });
    } catch (error) {
        console.error('Failed to fetch events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addEvent = async (req: Request, res: Response) => {
    console.log('=== ADD EVENT REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    console.log('User object:', req.user);

    const user = req.user;
    
    // For development: Allow admin and customer roles in addition to organizer
    console.log('User role check:', user?.role);
    if (!user || !['organizer', 'admin', 'customer'].includes(user.role)) {
        console.log('❌ Authorization failed - invalid role:', user?.role);
        return res.status(403).json({
            error: 'Only registered organizers can add events',
            userRole: user?.role,
            allowedRoles: ['organizer', 'admin', 'customer']
        });
    }
    
    const { title, description, category, type, startDate, endDate, venueId, image } = req.body;
    
    console.log('Extracted fields:', { title, description, category, type, startDate, endDate, venueId, image });
    
    if(!title || !description || !category || !type || !startDate) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['title', 'description', 'category', 'type', 'startDate'],
            received: { title: !!title, description: !!description, category: !!category, type: !!type, startDate: !!startDate }
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
        console.log('Looking for tenant with Firebase UID:', user.uid);
        let tenant = await getPrisma().tenant.findUnique({
            where: { firebaseUid: user.uid }
        });
    
        if(!tenant){
            console.log('Tenant not found, creating new tenant...');
            tenant = await getPrisma().tenant.create({
                data: {
                    firebaseUid: user.uid,
                    name: user.name || 'Unnamed Organizer'
                }
            });
            console.log('✅ New tenant created:', tenant);
        } else {
            console.log('✅ Existing tenant found:', tenant);
        }

        console.log('Creating event with data:', {
            title,
            description,
            category,
            type,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            tenantId: tenant.id,
            venueId: venueId || null,
            image: image || null
        });

        const newEvent = await getPrisma().events.create({
            data: {
                title,
                description,
                category,
                type,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                tenantId: tenant.id,
                venueId: venueId || null,
                image: image || null
            }
        });

        console.log('✅ Event created successfully:', newEvent);

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
    const { role, uid } = req.user;
    const eventId = parseInt(req.params.id);

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

        if(role === 'admin'|| role === 'customer' || role === 'venue_owner'|| (role === 'event_admin'|| role === 'organizer') && event.Tenant?.firebaseUid === uid) {
            return res.status(200).json({
                data: event,
                message: 'Event fetched successfully'
            });
        }else {
            return res.status(403).json({ error: 'Not Authorized to view this event' });
        }

    }catch (error) {
        console.error('Failed to fetch event:',error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 

export const updateEvent = async (req: Request, res: Response) => {
    const { uid , role} = req.user;
    const eventId = parseInt(req.params.id);
    const { endDate } = req.body;

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

        const updated = await getPrisma().events.update({
            where : { id: eventId },
            data: { endDate },
        })

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

        res.status(200).json({error:'Event deleted successfully'})
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

        console.log('✅ Event image updated successfully:', updatedEvent.id);

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
