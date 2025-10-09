import { PrismaClient } from '../generated/prisma';

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
  // Savoy Cinemas Ltd venues
  {
    name: "Savoy Cinema - Premium Hall",
    location: "Wellawatte, Colombo 06",
    capacity: 180,
    type: "MOVIE_THEATER",
    amenities: ["WiFi", "Air Conditioning", "Sound System", "Wheelchair Accessible"],
    seatMap: {
      rows: 12,
      columns: 15,
      sections: [
        { name: "Premium", rows: 3, columns: 15, price_multiplier: 1.5 },
        { name: "Standard", rows: 6, columns: 15, price_multiplier: 1.0 },
        { name: "Economy", rows: 3, columns: 15, price_multiplier: 0.8 }
      ],
      aisles: [3, 9],
      wheelchair_accessible: [1, 12]
    },
    tenantName: "Savoy Cinemas Ltd"
  },
  {
    name: "Savoy Cinema - IMAX Theater",
    location: "Wellawatte, Colombo 06",
    capacity: 250,
    type: "MOVIE_THEATER",
    amenities: ["WiFi", "Air Conditioning", "IMAX", "Dolby Atmos", "Reclining Seats", "Wheelchair Accessible"],
    seatMap: {
      rows: 15,
      columns: 18,
      sections: [
        { name: "VIP", rows: 2, columns: 12, price_multiplier: 2.0 },
        { name: "Premium", rows: 5, columns: 18, price_multiplier: 1.3 },
        { name: "Standard", rows: 8, columns: 18, price_multiplier: 1.0 }
      ],
      aisles: [2, 7, 12],
      wheelchair_accessible: [1, 15],
      special_features: ["IMAX", "Dolby_Atmos", "Reclining_Seats"]
    },
    tenantName: "Savoy Cinemas Ltd"
  },
  {
    name: "Savoy Cinema - Hall C",
    location: "Wellawatte, Colombo 06",
    capacity: 120,
    type: "MOVIE_THEATER",
    amenities: ["WiFi", "Air Conditioning", "Sound System", "Wheelchair Accessible"],
    seatMap: {
      rows: 10,
      columns: 12,
      sections: [
        { name: "Standard", rows: 10, columns: 12, price_multiplier: 1.0 }
      ],
      aisles: [5],
      wheelchair_accessible: [1, 10]
    },
    tenantName: "Savoy Cinemas Ltd"
  },

  // Colombo Entertainment Group venues
  {
    name: "Colombo City Center - Grand Auditorium",
    location: "Slave Island, Colombo 02",
    capacity: 500,
    type: "THEATRE",
    amenities: ["WiFi", "Air Conditioning", "Orchestra Pit", "Stage Lighting", "Sound System", "Wheelchair Accessible", "Parking"],
    seatMap: {
      rows: 25,
      columns: 20,
      sections: [
        { name: "Orchestra", rows: 10, columns: 20, price_multiplier: 1.2 },
        { name: "Mezzanine", rows: 8, columns: 20, price_multiplier: 1.0 },
        { name: "Balcony", rows: 7, columns: 20, price_multiplier: 0.8 }
      ],
      aisles: [5, 10, 18],
      wheelchair_accessible: [1, 25],
      special_features: ["Orchestra_Pit", "Stage_Lighting", "Sound_System"]
    },
    tenantName: "Colombo Entertainment Group"
  },
  {
    name: "Colombo City Center - Conference Hall",
    location: "Slave Island, Colombo 02",
    capacity: 200,
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
    capacity: 300,
    type: "CONFERENCE_HALL",
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
    capacity: 150,
    type: "OPEN_AREA",
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
    capacity: 400,
    seatMap: {
      rows: 20,
      columns: 20,
      sections: [
        { name: "VIP_Box", rows: 2, columns: 8, price_multiplier: 2.5 },
        { name: "Premium", rows: 6, columns: 20, price_multiplier: 1.4 },
        { name: "Standard", rows: 8, columns: 20, price_multiplier: 1.0 },
        { name: "Student", rows: 4, columns: 20, price_multiplier: 0.6 }
      ],
      aisles: [2, 8, 16],
      wheelchair_accessible: [1, 20],
      special_features: ["Traditional_Stage", "Cultural_Decor", "Heritage_Building"]
    },
    tenantName: "Kandy Cultural Center"
  },
  {
    name: "Kandy Cultural Center - Studio Theater",
    location: "Kandy City Center, Kandy",
    capacity: 80,
    seatMap: {
      rows: 8,
      columns: 10,
      sections: [
        { name: "Intimate", rows: 8, columns: 10, price_multiplier: 1.0 }
      ],
      aisles: [4],
      wheelchair_accessible: [1, 8],
      layout_type: "intimate_setting"
    },
    tenantName: "Kandy Cultural Center"
  },

  // Galle Theatre Company venues
  {
    name: "Galle Fort Theater - Historic Hall",
    location: "Galle Fort, Galle",
    capacity: 180,
    seatMap: {
      rows: 12,
      columns: 15,
      sections: [
        { name: "Royal_Box", rows: 1, columns: 6, price_multiplier: 3.0 },
        { name: "Premium", rows: 4, columns: 15, price_multiplier: 1.3 },
        { name: "Standard", rows: 7, columns: 15, price_multiplier: 1.0 }
      ],
      aisles: [1, 5, 9],
      wheelchair_accessible: [12],
      special_features: ["Historic_Architecture", "Ocean_View", "Colonial_Decor"]
    },
    tenantName: "Galle Theatre Company"
  },
  {
    name: "Galle Fort Theater - Garden Amphitheater",
    location: "Galle Fort, Galle",
    capacity: 120,
    seatMap: {
      rows: 8,
      columns: 15,
      sections: [
        { name: "Front_Garden", rows: 3, columns: 15, price_multiplier: 1.2 },
        { name: "Mid_Garden", rows: 3, columns: 15, price_multiplier: 1.0 },
        { name: "Back_Garden", rows: 2, columns: 15, price_multiplier: 0.8 }
      ],
      aisles: [3, 6],
      wheelchair_accessible: [1],
      special_features: ["Open_Air", "Garden_Setting", "Natural_Acoustics"],
      layout_type: "amphitheater"
    },
    tenantName: "Galle Theatre Company"
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
