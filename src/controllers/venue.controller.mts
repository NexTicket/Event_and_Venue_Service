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


