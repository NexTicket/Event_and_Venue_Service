import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Seed data definitions
const tenantData = [
  {
    name: "Savoy Cinemas Ltd",
    firebaseUid: "savoy-cinemas-uid-001"
  },
  {
    name: "Colombo Entertainment Group",
    firebaseUid: "colombo-entertainment-uid-002"
  },
  {
    name: "Liberty Plaza Events",
    firebaseUid: "liberty-plaza-uid-003"
  },
  {
    name: "Kandy Cultural Center",
    firebaseUid: "kandy-cultural-uid-004"
  },
  {
    name: "Galle Theatre Company",
    firebaseUid: "galle-theatre-uid-005"
  }
];

const venueData = [
  // Existing venues with correct types from database
  {
    name: "Colombo City Center - Conference Hall",
    location: "Slave Island, Colombo 02",
    latitude: 6.9271,
    longitude: 79.8612,
    capacity: 200,
    type: "Conference Centers",
    amenities: ["WiFi", "Air Conditioning", "Projection Screen", "Sound System", "Parking", "Wheelchair Accessible", "Catering"],
    seatMap: {
      rows: 12,
      columns: 18,
      sections: [
        { name: "Front", rows: 4, columns: 18, price_multiplier: 1.1 },
        { name: "Middle", rows: 4, columns: 18, price_multiplier: 1.0 },
        { name: "Back", rows: 4, columns: 18, price_multiplier: 0.9 }
      ],
      aisles: [4, 8],
      wheelchair_accessible: [1, 12],
      special_features: ["Projection_Screen", "Sound_System", "WiFi"]
    },
    tenantName: "Colombo Entertainment Group"
  },

  // Liberty Plaza Events venues
  {
    name: "Liberty Plaza - Exhibition Hall",
    location: "Kollupitiya, Colombo 03",
    latitude: 6.9094,
    longitude: 79.8528,
    capacity: 300,
    type: "Conference Centers",
    amenities: ["WiFi", "Air Conditioning", "Projection Screen", "Sound System", "Parking", "Wheelchair Accessible", "Catering"],
    seatMap: {
      rows: 15,
      columns: 20,
      sections: [
        { name: "General", rows: 15, columns: 20, price_multiplier: 1.0 }
      ],
      aisles: [5, 10],
      wheelchair_accessible: [1, 15],
      layout_type: "flexible_seating"
    },
    tenantName: "Liberty Plaza Events"
  },
  {
    name: "Liberty Plaza - Rooftop Venue",
    location: "Kollupitiya, Colombo 03",
    latitude: 6.9094,
    longitude: 79.8528,
    capacity: 150,
    type: "Rooftop Venues",
    amenities: ["WiFi", "Open Air", "City View", "Bar Service", "Parking", "Wheelchair Accessible"],
    seatMap: {
      rows: 10,
      columns: 15,
      sections: [
        { name: "VIP", rows: 3, columns: 10, price_multiplier: 1.5 },
        { name: "Standard", rows: 7, columns: 15, price_multiplier: 1.0 }
      ],
      aisles: [3, 7],
      wheelchair_accessible: [1],
      special_features: ["Open_Air", "City_View", "Bar_Service"]
    },
    tenantName: "Liberty Plaza Events"
  },

  // Kandy Cultural Center venues
  {
    name: "Kandy Cultural Center - Main Theater",
    location: "Kandy City Center, Kandy",
    latitude: 7.2906,
    longitude: 80.6337,
    capacity: 400,
    type: "Theatres",
    amenities: ["WiFi", "Air Conditioning", "Stage Lighting", "Sound System", "Parking", "Wheelchair Accessible"],
    seatMap: {
      rows: 20,
      columns: 20,
      sections: [
        { name: "Orchestra", rows: 8, columns: 20, price_multiplier: 1.2 },
        { name: "Mezzanine", rows: 6, columns: 20, price_multiplier: 1.0 },
        { name: "Balcony", rows: 6, columns: 20, price_multiplier: 0.8 }
      ],
      aisles: [4, 8, 12, 16],
      wheelchair_accessible: [1, 20],
      special_features: ["Stage_Lighting", "Sound_System", "Orchestra_Pit"]
    },
    tenantName: "Kandy Cultural Center"
  },
  {
    name: "Kandy Lake View Banquet Hall",
    location: "Peradeniya Road, Kandy",
    latitude: 7.2675,
    longitude: 80.6067,
    capacity: 250,
    type: "Banquet Halls",
    amenities: ["WiFi", "Air Conditioning", "Catering", "Sound System", "Parking", "Wheelchair Accessible", "Lake View"],
    seatMap: {
      rows: 12,
      columns: 21,
      sections: [
        { name: "VIP", rows: 4, columns: 21, price_multiplier: 1.3 },
        { name: "Standard", rows: 8, columns: 21, price_multiplier: 1.0 }
      ],
      aisles: [7, 14],
      wheelchair_accessible: [1, 12],
      special_features: ["Lake_View", "Catering_Kitchen", "Dance_Floor"]
    },
    tenantName: "Kandy Cultural Center"
  },

  // Galle Theatre Company venues
  {
    name: "Galle Dutch Fort Theater",
    location: "Galle Fort, Galle",
    latitude: 6.0329,
    longitude: 80.2168,
    capacity: 180,
    type: "Theatres",
    amenities: ["WiFi", "Air Conditioning", "Stage Lighting", "Sound System", "Parking", "Wheelchair Accessible", "Historic Setting"],
    seatMap: {
      rows: 12,
      columns: 15,
      sections: [
        { name: "Premium", rows: 4, columns: 15, price_multiplier: 1.4 },
        { name: "Standard", rows: 8, columns: 15, price_multiplier: 1.0 }
      ],
      aisles: [5, 10],
      wheelchair_accessible: [1, 12],
      special_features: ["Historic_Architecture", "Stage_Lighting", "Intimate_Setting"]
    },
    tenantName: "Galle Theatre Company"
  },
  {
    name: "Galle Municipal Gardens",
    location: "Galle City Center, Galle",
    latitude: 6.0367,
    longitude: 80.2170,
    capacity: 500,
    type: "Parks and Gardens",
    amenities: ["WiFi", "Open Air", "Parking", "Wheelchair Accessible", "Public Transport Access"],
    seatMap: {
      rows: 25,
      columns: 20,
      sections: [
        { name: "Front Lawn", rows: 10, columns: 20, price_multiplier: 1.1 },
        { name: "Garden Area", rows: 15, columns: 20, price_multiplier: 1.0 }
      ],
      aisles: [5, 10, 15],
      wheelchair_accessible: [1, 25],
      special_features: ["Open_Air", "Garden_Setting", "Natural_Lighting"]
    },
    tenantName: "Galle Theatre Company"
  },

  // Savoy Cinemas venues
  {
    name: "Savoy 3D Cinema Colombo",
    location: "Wellawatta, Colombo 06",
    latitude: 6.8758,
    longitude: 79.8600,
    capacity: 350,
    type: "Theatres",
    amenities: ["WiFi", "Air Conditioning", "3D Projection", "Surround Sound", "Concession Stand", "Parking"],
    seatMap: {
      rows: 14,
      columns: 25,
      sections: [
        { name: "Premium", rows: 4, columns: 25, price_multiplier: 1.5 },
        { name: "Standard", rows: 10, columns: 25, price_multiplier: 1.0 }
      ],
      aisles: [8, 17],
      wheelchair_accessible: [1, 14],
      special_features: ["3D_Projection", "Surround_Sound", "Reclining_Seats"]
    },
    tenantName: "Savoy Cinemas Ltd"
  },
  {
    name: "Savoy Premiere Theater",
    location: "Bambalapitiya, Colombo 04",
    latitude: 6.8915,
    longitude: 79.8528,
    capacity: 280,
    type: "Theatres",
    amenities: ["WiFi", "Air Conditioning", "4K Projection", "Dolby Atmos", "VIP Lounge", "Parking"],
    seatMap: {
      rows: 12,
      columns: 23,
      sections: [
        { name: "VIP", rows: 3, columns: 23, price_multiplier: 2.0 },
        { name: "Premium", rows: 4, columns: 23, price_multiplier: 1.3 },
        { name: "Standard", rows: 5, columns: 23, price_multiplier: 1.0 }
      ],
      aisles: [7, 16],
      wheelchair_accessible: [1, 12],
      special_features: ["4K_Projection", "Dolby_Atmos", "VIP_Lounge"]
    },
    tenantName: "Savoy Cinemas Ltd"
  },

  // University venues
  {
    name: "University of Colombo - Senate Hall",
    location: "University of Colombo, Colombo 03",
    latitude: 6.9000,
    longitude: 79.8588,
    capacity: 600,
    type: "Universities and University Halls",
    amenities: ["WiFi", "Air Conditioning", "Projection Screen", "Sound System", "Parking", "Wheelchair Accessible", "Catering"],
    seatMap: {
      rows: 20,
      columns: 30,
      sections: [
        { name: "Front", rows: 8, columns: 30, price_multiplier: 1.2 },
        { name: "Middle", rows: 8, columns: 30, price_multiplier: 1.0 },
        { name: "Back", rows: 4, columns: 30, price_multiplier: 0.8 }
      ],
      aisles: [10, 20],
      wheelchair_accessible: [1, 20],
      special_features: ["Grand_Architecture", "High_Ceilings", "Academic_Setting"]
    },
    tenantName: "Colombo Entertainment Group"
  },
  {
    name: "University of Peradeniya - Open Theater",
    location: "University of Peradeniya, Kandy",
    latitude: 7.2549,
    longitude: 80.5974,
    capacity: 800,
    type: "Universities and University Halls",
    amenities: ["WiFi", "Open Air", "Parking", "Wheelchair Accessible", "Natural Setting"],
    seatMap: {
      rows: 25,
      columns: 32,
      sections: [
        { name: "Orchestra", rows: 10, columns: 32, price_multiplier: 1.1 },
        { name: "Terrace", rows: 15, columns: 32, price_multiplier: 1.0 }
      ],
      aisles: [8, 16, 24],
      wheelchair_accessible: [1, 25],
      special_features: ["Open_Air", "Natural_Setting", "University_Campus"]
    },
    tenantName: "Kandy Cultural Center"
  }
];

async function main() {
  try {
    console.log('🌱 Starting database seeding...');

    // Test database connection
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check existing data and add new data intelligently
    console.log('🔍 Checking existing data...');
    const existingTenants = await prisma.tenant.findMany();
    const existingVenues = await prisma.venue.findMany();
    
    console.log(`📊 Current database state: ${existingTenants.length} tenants, ${existingVenues.length} venues`);

    // Create new tenants that don't exist
    console.log('👥 Creating new tenants...');
    const createdTenants = [];
    const allTenants = [...existingTenants]; // Start with existing tenants
    
    for (const tenantInfo of tenantData) {
      // Check if tenant already exists by name
      const existingTenant = existingTenants.find(t => t.name === tenantInfo.name);
      if (existingTenant) {
        console.log(`  ⏭️  Tenant already exists: ${existingTenant.name}`);
        createdTenants.push(existingTenant);
      } else {
        const tenant = await prisma.tenant.create({
          data: tenantInfo
        });
        createdTenants.push(tenant);
        allTenants.push(tenant);
        console.log(`  ✓ Created new tenant: ${tenant.name}`);
      }
    }

    // Create a map for easy tenant lookup (including existing ones)
    const tenantMap = new Map(
      allTenants.map(tenant => [tenant.name, tenant.id])
    );

    // Create new venues that don't exist
    console.log('🏛️  Creating new venues...');
    let newVenueCount = 0;
    
    for (const venue of venueData) {
      const tenantId = tenantMap.get(venue.tenantName);
      if (!tenantId) {
        console.error(`❌ Tenant not found: ${venue.tenantName}`);
        continue;
      }

      // Check if venue already exists by name and tenant
      const existingVenue = existingVenues.find(v => 
        v.name === venue.name && v.tenantId === tenantId
      );
      
      if (existingVenue) {
        console.log(`  ⏭️  Venue already exists: ${venue.name}`);
      } else {
        await prisma.venue.create({
          data: {
            name: venue.name,
            location: venue.location,
            capacity: venue.capacity,
            seatMap: venue.seatMap,
            type: venue.type,
            amenities: venue.amenities,
            tenantId: tenantId
          }
        });
        newVenueCount++;
        console.log(`  ✓ Created new venue: ${venue.name}`);
      }
    }

    // Get final counts
    const totalTenants = await prisma.tenant.count();
    const totalVenues = await prisma.venue.count();

    console.log('🎉 Database seeding completed!');
    console.log(`📊 Final counts: ${totalTenants} tenants, ${totalVenues} venues`);
    console.log(`🆕 Added: ${newVenueCount} new venues`);
    
    // Display summary by tenant
    console.log('\n📋 Database Summary:');
    const finalTenants = await prisma.tenant.findMany({
      include: {
        venues: true
      }
    });
    
    for (const tenant of finalTenants) {
      console.log(`  • ${tenant.name}: ${tenant.venues.length} venues`);
    }

    // Add sample events if none exist
    console.log('\n🎭 Adding sample events...');
    const existingEvents = await prisma.events.findMany();
    
    if (existingEvents.length === 0 && finalTenants.length > 0) {
      const sampleEvents = [
        {
          tenantId: finalTenants[0].id,
          title: "Sample Concert",
          description: "A sample concert event for testing",
          category: "MUSIC",
          type: "EVENT" as const,
          startDate: new Date("2024-12-31T20:00:00Z"),
          endDate: new Date("2024-12-31T23:00:00Z"),
          created_at: new Date()
        },
        {
          tenantId: finalTenants[0].id,
          title: "Tech Conference 2024",
          description: "Annual technology conference",
          category: "CONFERENCE",
          type: "EVENT" as const,
          startDate: new Date("2024-11-15T09:00:00Z"),
          endDate: new Date("2024-11-15T17:00:00Z"),
          created_at: new Date()
        },
        {
          tenantId: finalTenants[0].id,
          title: "Movie Night: Avengers",
          description: "Special screening of Avengers movie",
          category: "ENTERTAINMENT",
          type: "MOVIE" as const,
          startDate: new Date("2024-10-20T19:00:00Z"),
          endDate: new Date("2024-10-20T22:00:00Z"),
          created_at: new Date()
        }
      ];

      await prisma.events.createMany({
        data: sampleEvents
      });
      
      console.log(`✅ Added ${sampleEvents.length} sample events`);
    } else {
      console.log(`⏭️  ${existingEvents.length} events already exist`);
    }

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
