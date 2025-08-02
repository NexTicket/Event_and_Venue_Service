import { PrismaClient } from "@prisma/client";
import {Request, Response} from 'express';

const prisma = new PrismaClient();


export const getAllVenues = async (req: Request, res: Response) => {
    try{
        const venues = await(prisma.venue.findMany({
            include: {tenant: true}
        }));
        res.status(200).json({
            data : venues,
            message : "Venues fetched successfully",
        })

    }catch(error){
        console.error('Failed to fetch venues:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

export const addVenue = async (req: Request, res: Response) => {
    const {name, seatMap, tenantId} = req.body;
    try{
        const newVenue = await prisma.venue.create({
            data: {name, seatMap, tenantId},
        });
        res.status(201).json({
            data: newVenue,
            message: "Venue added successfully",
        });

    }catch(error){
        console.error('Failed to add venue:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

export const getVenueById = async (req: Request, res: Response) => {
    const venueId = parseInt(req.params.id);
    try{
        const venue = await prisma.venue.findUnique({
            where: {id:venueId},
            include: {tenant:true}
            
        })

        if (!venue){
            return res.status(404).json({error: "venue not found"});
        }
        res.status(200).json({data:venue, message: "Venue fetched successfully"});

    }catch(error){
        console.error('Failed to fetch venue:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

export const updateVenue = async (req: Request, res: Response) => {
    const venueId = parseInt(req.params.id);
    const {name, seatMap} = req.body;

    

    try{

        const existing = await prisma.venue.findUnique({
        where: {id:venueId},

    })

    if (!existing){
        res.status(404).json({
            error: "venue not found"
        })
    }
        
        const newVenue = await prisma.venue.update({
            where: {id:venueId},
            data: {name, seatMap},
        })
        res.status(200).json({
            data:newVenue,
            message: "Venue updated successfully",
        })

    }catch(error){
        console.error('Failed to update venue:', error);
        res.status(500).json({ error: 'Internal server error' });

    }

}

export const deleteVenue = async (req: Request, res: Response) => {
    const venueId = parseInt(req.params.id);
    try{
        const existing = await prisma.venue.findUnique({
            where: {id:venueId},
        })

        if (!existing){
            return res.status(404).json({error: "Venue not found"});
        }

        await prisma.venue.delete({
            where: {id:venueId},
        });

        res.status(200).json({message: "Venue deleted successfully"});

    }catch(error){
        console.error('Failed to delete venue:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}
