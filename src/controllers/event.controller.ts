import { PrismaClient } from "../../generated/prisma";
import { Request,Response } from 'express';

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
                Tenant:{
                    select: {
                        id: true, 
                        name: true 
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
    const user = req.user;
    if (!user|| user.role !== 'organizer'){
            return res.status(403).json({error:' Only registered organizers can add events'});
        }
    
    const { title, description, category, type, startDate, endDate } = req.body;
    
    if(!title || !description || !category || !type || !startDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if endDate is required for non-movie events
    if (type !== 'movie' && !endDate) {
        return res.status(400).json({ error: 'End date is required for non-movie events' });
    }

    try {
        let tenant = await getPrisma().tenant.findUnique({
            where: { firebaseUid: user.uid }
        });
    
        if(!tenant){
        tenant = await getPrisma().tenant.create({
            data: {
                firebaseUid: user.uid,
                name: user.name || 'Unnamed Organizer'
            }
        })
        }
        const newEvent = await getPrisma().events.create({
            data: {
                title,
                description,
                category,
                type,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                tenantId: tenant.id
            }
        });

        res.status(201).json({
            data: newEvent,
            message: 'Event created successfully',
        });

    } catch (error) {
        console.error('Failed to create event:', error);
        res.status(500).json({ error: 'Internal server error' });
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