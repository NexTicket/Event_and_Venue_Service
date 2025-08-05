import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

export class VenueService {
  // Get all venues
  async getAllVenues() {
    try {
      return await prisma.venue.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch venues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get venue by ID
  async getVenueById(id: number) {
    try {
      return await prisma.venue.findUnique({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Failed to fetch venue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create new venue
  async createVenue(venueData: {
    name: string;
    location: string;
    capacity: number;
    description?: string;
  }) {
    try {
      return await prisma.venue.create({
        data: venueData
      });
    } catch (error) {
      throw new Error(`Failed to create venue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update venue
  async updateVenue(id: number, venueData: {
    name?: string;
    location?: string;
    capacity?: number;
    description?: string;
  }) {
    try {
      return await prisma.venue.update({
        where: { id },
        data: venueData
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return null;
      }
      throw new Error(`Failed to update venue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete venue
  async deleteVenue(id: number) {
    try {
      await prisma.venue.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return false;
      }
      throw new Error(`Failed to delete venue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
