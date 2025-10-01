import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

// Get venue seat map with optional event-specific availability
export const getVenueSeatMap = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const { eventId } = req.query;

    console.log('🎭 Getting seat map for venue:', venueId, eventId ? `and event: ${eventId}` : '');

    // Get venue with seat map
    const venue = await prisma.venue.findUnique({
      where: { id: parseInt(venueId) },
      include: {
        bulkTickets: eventId ? {
          where: { eventId: parseInt(eventId as string) }
        } : false
      }
    });

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    let seatMap = venue.seatMap as any;
    
    // If no seat map exists, generate a basic one based on capacity
    if (!seatMap) {
      seatMap = generateBasicSeatMap(venue.capacity || 100, venue.name);
    }

    // If eventId is provided, get sold seats separately
    if (eventId) {
      const soldTickets = await prisma.userTicket.findMany({
        where: {
          bulkTicket: {
            eventId: parseInt(eventId as string)
          },
          status: 'SOLD'
        }
      });

      const soldSeats = soldTickets.map(ticket => ticket.seatId);

      // Update seat availability in seat map
      if (seatMap.sections) {
        seatMap.sections.forEach((section: any) => {
          section.rows?.forEach((row: any) => {
            row.seats?.forEach((seat: any) => {
              seat.isAvailable = !soldSeats.includes(seat.id);
              seat.isReserved = false; // TODO: Add reservation logic
            });
          });
        });
      }
    }

    res.json({
      venueId: venue.id,
      sections: seatMap.sections || [],
      metadata: {
        totalSeats: venue.capacity,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching venue seat map:', error);
    res.status(500).json({ error: 'Failed to fetch venue seat map' });
  }
};

// Get event-specific seat availability
export const getEventSeatAvailability = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    console.log('🎫 Getting seat availability for event:', eventId);

    // First check if any events exist and show some debug info
    try {
      const eventCount = await prisma.events.count();
      console.log('📊 Total events in database:', eventCount);
      
      if (eventCount > 0) {
        const firstEvent = await prisma.events.findFirst({
          select: { id: true, title: true }
        });
        console.log('🔍 First event in database:', firstEvent);
      }
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: dbError instanceof Error ? dbError.message : String(dbError)
      });
    }

    // Get event with venue and tickets
    const event = await prisma.events.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        venue: true,
        bulkTickets: {
          include: {
            userTickets: true
          }
        }
      }
    });

    console.log('🎭 Event found:', event ? `${event.title} (ID: ${event.id})` : 'null');

    if (!event) {
      // If event doesn't exist, let's create a demo response for testing
      console.log('⚠️ Event not found, creating demo response');
      
      try {
        const demoSeatMap = generateBasicSeatMap(100, 'Demo Venue');
        
        return res.json({
          seatMap: {
            venueId: 999,
            sections: demoSeatMap.sections || [],
            metadata: {
              totalSeats: 100,
              lastUpdated: new Date().toISOString(),
              isDemo: true
            }
          },
          soldSeats: [],
          reservedSeats: [],
          message: 'Demo data - event not found'
        });
      } catch (demoError) {
        console.error('❌ Error creating demo response:', demoError);
        return res.status(500).json({ 
          error: 'Failed to generate demo seat map',
          details: demoError instanceof Error ? demoError.message : String(demoError)
        });
      }
    }

    if (!event.venue) {
      return res.status(404).json({ error: 'Venue not found for event' });
    }

    let seatMap = event.venue.seatMap as any;
    
    // If no seat map exists, generate a basic one
    if (!seatMap) {
      seatMap = generateBasicSeatMap(event.venue.capacity || 100, event.venue.name);
    }

    // Get sold and reserved seats
    const soldSeats: string[] = [];
    const reservedSeatsData: { seatId: string; reservedBy: string; expiresAt: string }[] = [];

    // Check sold tickets from bulk tickets
    event.bulkTickets.forEach(bulkTicket => {
      bulkTicket.userTickets?.forEach(ticket => {
        if (ticket.status === 'SOLD') {
          soldSeats.push(ticket.seatId);
        }
      });
    });

    // Check individual ticket reservations and sales
    const individualTickets = await prisma.userTicket.findMany({
      where: {
        eventId: parseInt(eventId),
        status: {
          in: ['SOLD', 'RESERVED']
        }
      },
      select: {
        seatId: true,
        status: true
      }
    });

    individualTickets.forEach(ticket => {
      if (ticket.status === 'SOLD') {
        soldSeats.push(ticket.seatId);
      }
    });

    // Check active seat reservations (not expired)
    const activeReservations = await prisma.seatReservation.findMany({
      where: {
        eventId: parseInt(eventId),
        status: {
          in: ['RESERVED', 'CONFIRMED', 'SOLD']
        },
        expiresAt: {
          gt: new Date() // Only non-expired reservations
        }
      },
      select: {
        seatId: true,
        status: true,
        firebaseUid: true,
        expiresAt: true
      }
    });

    activeReservations.forEach(reservation => {
      if (reservation.status === 'SOLD' && !soldSeats.includes(reservation.seatId)) {
        soldSeats.push(reservation.seatId);
      } else if ((reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED') && 
                 !soldSeats.includes(reservation.seatId)) {
        reservedSeatsData.push({
          seatId: reservation.seatId,
          reservedBy: reservation.firebaseUid,
          expiresAt: reservation.expiresAt.toISOString()
        });
      }
    });

    console.log('🎫 Seat availability check:', {
      eventId,
      soldSeats: soldSeats.length,
      reservedSeats: reservedSeatsData.length,
      activeReservations: activeReservations.length
    });

    // Update seat map with availability
    if (seatMap.sections) {
      seatMap.sections.forEach((section: any) => {
        console.log('🔍 Processing section:', section.name || section.id);
        console.log('🔍 Section structure:', JSON.stringify(section, null, 2));
        
        // Check if this section has rows array or if we need to generate seats
        if (section.rows && Array.isArray(section.rows)) {
          section.rows.forEach((row: any) => {
            if (row.seats && Array.isArray(row.seats)) {
              row.seats.forEach((seat: any) => {
                const isReserved = reservedSeatsData.some(r => r.seatId === seat.id);
                seat.isAvailable = !soldSeats.includes(seat.id) && !isReserved;
                seat.isReserved = isReserved;
              });
            }
          });
        } else {
          // If no detailed seat structure, create basic availability info
          console.log('⚠️ Section has no rows array, using basic structure');
        }
      });
    }

    res.json({
      seatMap: {
        venueId: event.venue.id,
        sections: seatMap.sections || [],
        metadata: {
          totalSeats: event.venue.capacity,
          lastUpdated: new Date().toISOString()
        }
      },
      soldSeats,
      reservedSeats: reservedSeatsData
    });
  } catch (error) {
    console.error('❌ Unexpected error in getEventSeatAvailability:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    res.status(500).json({ 
      error: 'Failed to fetch event seat availability',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
};

// Reserve seats temporarily
export const reserveSeats = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { seatIds, firebaseUid, duration = 300 } = req.body;

    console.log('🔒 Reserving seats:', { eventId, seatIds, firebaseUid, duration });

    // TODO: Implement seat reservation logic with Redis or database
    // For now, return success
    const reservationId = `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const expiresAt = new Date(Date.now() + duration * 1000).toISOString();

    res.json({
      success: true,
      reservationId,
      expiresAt
    });
  } catch (error) {
    console.error('Error reserving seats:', error);
    res.status(500).json({ error: 'Failed to reserve seats' });
  }
};

// Release seat reservations
export const releaseSeats = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;

    console.log('🔓 Releasing reservation:', reservationId);

    // TODO: Implement reservation release logic
    res.json({ success: true });
  } catch (error) {
    console.error('Error releasing seat reservations:', error);
    res.status(500).json({ error: 'Failed to release seat reservations' });
  }
};

// Helper function to generate basic seat map if none exists
function generateBasicSeatMap(capacity: number, venueName: string): any {
  const sections: any[] = [];
  const seatsPerRow = 10;
  
  // Create Orchestra section
  const orchestraSeats = Math.ceil(capacity * 0.7); // 70% orchestra
  const orchestraRows = Math.ceil(orchestraSeats / seatsPerRow);
  
  const orchestraSection: any = {
    id: 'orchestra',
    name: 'Orchestra',
    rows: []
  };

  for (let r = 0; r < orchestraRows; r++) {
    const rowName = String.fromCharCode(65 + r); // A, B, C, etc.
    const row: any = {
      id: `orchestra-${rowName}`,
      name: rowName,
      seats: []
    };

    const seatsInThisRow = Math.min(seatsPerRow, orchestraSeats - (r * seatsPerRow));
    for (let s = 1; s <= seatsInThisRow; s++) {
      row.seats.push({
        id: `orchestra-${rowName}${s}`,
        row: rowName,
        number: s,
        section: 'Orchestra',
        seatType: 'REGULAR',
        price: 75,
        isAvailable: true,
        isReserved: false
      });
    }
    
    orchestraSection.rows.push(row);
  }

  // Create Balcony section
  const balconySeats = capacity - orchestraSeats;
  const balconyRows = Math.ceil(balconySeats / seatsPerRow);
  
  const balconySection: any = {
    id: 'balcony',
    name: 'Balcony',
    rows: []
  };

  for (let r = 0; r < balconyRows; r++) {
    const rowName = String.fromCharCode(65 + r);
    const row: any = {
      id: `balcony-${rowName}`,
      name: rowName,
      seats: []
    };

    const seatsInThisRow = Math.min(seatsPerRow, balconySeats - (r * seatsPerRow));
    for (let s = 1; s <= seatsInThisRow; s++) {
      row.seats.push({
        id: `balcony-${rowName}${s}`,
        row: rowName,
        number: s,
        section: 'Balcony',
        seatType: 'REGULAR',
        price: 50,
        isAvailable: true,
        isReserved: false
      });
    }
    
    balconySection.rows.push(row);
  }

  sections.push(orchestraSection);
  if (balconySeats > 0) {
    sections.push(balconySection);
  }

  return { sections };
}