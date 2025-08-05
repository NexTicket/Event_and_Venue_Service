import { Request, Response } from 'express';
import { VenueService } from '../services/venue.service.mjs';

export class VenueController {
  private venueService: VenueService;

  constructor() {
    this.venueService = new VenueService();
  }

  // Get all venues
  getAllVenues = async (req: Request, res: Response): Promise<void> => {
    try {
      const venues = await this.venueService.getAllVenues();
      res.status(200).json({
        success: true,
        data: venues,
        message: 'Venues retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve venues',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get venue by ID
  getVenueById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const venue = await this.venueService.getVenueById(parseInt(id));
      
      if (!venue) {
        res.status(404).json({
          success: false,
          message: 'Venue not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: venue,
        message: 'Venue retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve venue',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Create new venue
  createVenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const venueData = req.body;
      const newVenue = await this.venueService.createVenue(venueData);
      
      res.status(201).json({
        success: true,
        data: newVenue,
        message: 'Venue created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create venue',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Update venue
  updateVenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const venueData = req.body;
      const updatedVenue = await this.venueService.updateVenue(parseInt(id), venueData);
      
      if (!updatedVenue) {
        res.status(404).json({
          success: false,
          message: 'Venue not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedVenue,
        message: 'Venue updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update venue',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Delete venue
  deleteVenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.venueService.deleteVenue(parseInt(id));
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Venue not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Venue deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete venue',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
