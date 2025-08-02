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
