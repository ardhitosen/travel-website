// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Helper to check if a table exists in the SQLite DB
  const tableExists = async (tableName: string) => {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
      return Array.isArray(rows) && rows.length > 0;
    } catch (err) {
      console.warn('Could not check table existence for', tableName, err);
      return false;
    }
  };

  // Clear all data only for tables that exist to avoid P2021 errors
  const tryDeleteIfExists = async (modelName: string, fn: () => Promise<any>) => {
    const exists = await tableExists(modelName);
    if (!exists) {
      console.warn(`Skipping clear for ${modelName}: table does not exist`);
      return;
    }
    try {
      await fn();
    } catch (err) {
      console.warn(`Could not clear ${modelName}:`, (err as Error).message || err);
    }
  };

  await tryDeleteIfExists('VisaApplication', () => prisma.visaApplication.deleteMany());
  await tryDeleteIfExists('VisaType', () => prisma.visaType.deleteMany());
  await tryDeleteIfExists('BannerSlide', () => prisma.bannerSlide.deleteMany());
  await tryDeleteIfExists('GalleryImage', () => prisma.galleryImage.deleteMany());
  await tryDeleteIfExists('ItineraryDay', () => prisma.itineraryDay.deleteMany());
  await tryDeleteIfExists('Itinerary', () => prisma.itinerary.deleteMany());
  await tryDeleteIfExists('Destination', () => prisma.destination.deleteMany());

  const passwordHash = await bcrypt.hash("jalanramerame", 10);
  if (await tableExists('User')) {
    await prisma.user.upsert({
      where: { email: "info@jalanoverseas.com" },
      create: { email: "info@jalanoverseas.com", passwordHash, role: "admin" },
      update: { passwordHash },
    });
  } else {
    console.warn('Skipping user upsert: User table missing');
  }

  // Create banner slides if table exists
  if (await tableExists('BannerSlide')) {
    // Determine actual columns on BannerSlide so we can include title/description
    // only when present. Use raw INSERT fallback if createMany would fail.
    const cols: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('BannerSlide')");
    const existingCols = Array.isArray(cols) ? cols.map(c => String(c.name)) : [];
    const includeTitle = existingCols.includes('title');
    const includeDescription = existingCols.includes('description');

    const bannerData = [
    {
      imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1170&auto=format&fit=crop",
      fact: "Japan: Tokyo is the world's most populous metropolis!",
      destination: "Japan",
      position: 0,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop",
      fact: "Dubai: Home of the 828m tall Burj Khalifa.",
      destination: "Dubai",
      position: 1,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170&auto=format&fit=crop",
      fact: "Thailand: Bangkok has over 400 Buddhist temples!",
      destination: "Thailand",
      position: 2,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1525625293386-3f9f99389edd?q=80&w=1170&auto=format&fit=crop",
      fact: "Singapore: One of the world's most expensive cities to live in.",
      destination: "Singapore",
      position: 3,
    },
    ];

    // Add title/description placeholders when columns exist
    if (includeTitle || includeDescription) {
      for (const b of bannerData) {
        if (includeTitle && !('title' in b)) b.title = null;
        if (includeDescription && !('description' in b)) b.description = null;
      }
    }

    try {
      // Prefer createMany via Prisma when safe
      await prisma.bannerSlide.createMany({ data: bannerData as any[] });
    } catch (err) {
      console.warn('Prisma createMany for BannerSlide failed, falling back to raw INSERTs:', err?.message || err);
      // Fallback: insert each row with raw SQL including only columns that exist
      const allowedCols = ['imageUrl','fact','destination','position'];
      if (includeTitle) allowedCols.push('title');
      if (includeDescription) allowedCols.push('description');
      for (const b of bannerData) {
        const colsToInsert = allowedCols.filter(c => c in b || c === 'title' || c === 'description');
        const quoted = colsToInsert.map(c => `"${c}"`).join(', ');
        const vals = colsToInsert.map(c => JSON.stringify(b[c] ?? null)).join(', ');
        const sql = `INSERT INTO "BannerSlide" (${quoted}) VALUES (${vals})`;
        try { await prisma.$executeRawUnsafe(sql); } catch (e) { console.warn('Raw insert failed for banner row:', e); }
      }
    }
  } else {
    console.warn('Skipping banner slides: BannerSlide table missing');
  }

  // Create Korea destination if Destination table exists
  let korea: any = null;
  if (await tableExists('Destination')) {
    // Upsert so seed is idempotent and won't error if run multiple times
    korea = await prisma.destination.upsert({
      where: { name: 'Korea' },
      create: {
        name: "Korea",
        description: "Explore the vibrant city of Seoul and experience the perfect blend of ancient traditions and modern innovation.",
        imageUrl: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop",
        highlights: ["Palaces & Temples", "Modern City Life", "Street Food", "K-Pop Culture", "Traditional Markets"] as any,
        badge: "Popular",
        gallery: {
          create: [
            { imageUrl: "https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?q=80&w=1631&auto=format&fit=crop", position: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1526199119161-4be1e3368d52?q=80&w=1074&auto=format&fit=crop", position: 1 },
            { imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1170&auto=format&fit=crop", position: 2 },
          ],
        },
        itineraries: {
          create: [
            {
              slug: "seoul",
              name: "Seoul Adventure",
              city: "Seoul",
              duration: "1 Week",
              price: "$280",
              imageUrl: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop",
              description: "Experience the vibrant city life of Seoul with its palaces, street food, and modern attractions.",
              highlights: ["Palaces", "Street Food", "Shopping", "K-Pop"] as any,
              days: {
                create: [
                  { dayNumber: 1, activities: ["Arrive in Seoul", "Visit Gyeongbokgung Palace", "Explore Bukchon Hanok Village", "Dinner in Myeong-dong"] as any, title: null, description: null, imageUrl: null },
                  { dayNumber: 2, activities: ["Visit N Seoul Tower", "Lunch in Hongdae", "Shopping in Gangnam", "Dinner in Itaewon"] as any, title: null, description: null, imageUrl: null },
                  { dayNumber: 3, activities: ["DMZ Tour", "Korean War Memorial", "Insadong Cultural Street", "Traditional Tea Ceremony"] as any, title: null, description: null, imageUrl: null },
                ],
              },
            },
            {
              slug: "busan",
              name: "Busan Coastal Escape",
              city: "Busan",
              duration: "4 Days",
              price: "$180",
              imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1170&auto=format&fit=crop",
              description: "Discover Busan's beautiful beaches, temples, and fresh seafood.",
              highlights: ["Beaches", "Temples", "Seafood", "Markets"] as any,
              days: {
                create: [
                  { dayNumber: 1, activities: ["Arrive in Busan", "Haeundae Beach", "Dongbaekseom Island", "Seafood dinner"] as any, title: null, description: null, imageUrl: null },
                  { dayNumber: 2, activities: ["Haedong Yonggungsa Temple", "Gamcheon Culture Village", "Jagalchi Fish Market"] as any, title: null, description: null, imageUrl: null },
                ],
              },
            },
          ],
        }
      },
      update: {
        description: "Explore the vibrant city of Seoul and experience the perfect blend of ancient traditions and modern innovation.",
        imageUrl: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop",
        highlights: ["Palaces & Temples", "Modern City Life", "Street Food", "K-Pop Culture", "Traditional Markets"] as any,
        badge: "Popular",
      }
    });
  } else {
    console.warn('Skipping creating Destination entries: Destination table missing');
  }

  // Create visas for Korea (destination stored as plain string now)
  if (await tableExists('VisaType')) {
    await prisma.visaType.create({ data: {
    name: "Tourist Visa",
    description: "For leisure travel and sightseeing in South Korea",
    duration: "90 days",
    processingTime: "5-7 business days",
    price: "$30",
    requirements: [
      "Valid passport with at least 6 months validity",
      "Completed visa application form",
      "Recent passport-sized photograph",
      "Proof of financial means",
      "Travel itinerary or hotel booking"
    ],
    documents: ["Passport","Visa application form","Passport photo","Bank statements","Travel insurance"],
    validity: "Single entry",
    destination: korea.name,
    }});
    await prisma.visaType.create({ data: {
    name: "Business Visa",
    description: "For business meetings, conferences, and work-related travel",
    duration: "30 days",
    processingTime: "7-10 business days",
    price: "$50",
    requirements: ["Valid passport with at least 6 months validity","Business invitation letter","Company registration documents","Proof of business relationship","Financial statements"],
    documents: ["Passport","Visa application form","Business invitation","Company documents","Financial proof"],
    validity: "Multiple entry",
    destination: korea.name,
    }});
  } else {
    console.warn('Skipping visaType creation: VisaType table missing');
  }
  // Student Visa for Korea is created only when VisaType table exists
  if (await tableExists('VisaType')) {
    await prisma.visaType.create({ data: {
      name: "Student Visa",
      description: "For educational purposes and language learning",
      duration: "1 year",
      processingTime: "2-3 weeks",
      price: "$80",
      requirements: ["Valid passport with at least 6 months validity","Acceptance letter from Korean institution","Financial proof for tuition and living expenses","Health certificate","Academic transcripts"],
      documents: ["Passport","Visa application form","Acceptance letter","Financial statements","Health certificate"],
      validity: "Multiple entry",
      destination: korea ? korea.name : null,
    }});
  }

  // Create Japan destination
  const japan = await prisma.destination.upsert({
    where: { name: 'Japan' },
    create: {
      name: "Japan",
      description: "Experience the perfect harmony of ancient traditions and cutting-edge technology in the Land of the Rising Sun.",
      imageUrl: "https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop",
      highlights: ["Cherry Blossoms", "Historic Shrines", "Modern Technology", "Traditional Culture", "Amazing Cuisine"] as any,
      badge: "Trending",
      gallery: {
        create: [
          { imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1170&auto=format&fit=crop", position: 0 },
          { imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1170&auto=format&fit=crop", position: 1 },
          { imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1170&auto=format&fit=crop", position: 2 },
        ],
      },
      itineraries: {
        create: [
          {
            slug: "tokyo",
            name: "Tokyo Discovery",
            city: "Tokyo",
            duration: "1 Week",
            price: "$320",
            imageUrl: "https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop",
            description: "Experience the mix of tradition and modernity in Tokyo.",
            highlights: ["Shrines", "Fashion", "Technology", "Food"] as any,
            days: {
              create: [
                { dayNumber: 1, activities: ["Arrive in Tokyo", "Visit Tokyo Tower", "Lunch in Shibuya", "Explore Harajuku", "Dinner in Shinjuku"] as any, title: null, description: null, imageUrl: null },
                { dayNumber: 2, activities: ["Visit Asakusa", "Lunch in Tsukiji", "Visit Meiji Shrine", "Dinner in Roppongi"] as any, title: null, description: null, imageUrl: null },
                { dayNumber: 3, activities: ["Disneyland Tokyo", "Evening in Odaiba", "Tokyo Skytree"] as any, title: null, description: null, imageUrl: null },
              ],
            },
          },
          {
            slug: "kyoto",
            name: "Kyoto Cultural Journey",
            city: "Kyoto",
            duration: "5 Days",
            price: "$250",
            imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1170&auto=format&fit=crop",
            description: "Immerse yourself in traditional Japanese culture and history.",
            highlights: ["Temples", "Gardens", "Geisha", "Traditional Crafts"] as any,
            days: {
              create: [
                { dayNumber: 1, activities: ["Arrive in Kyoto", "Kinkaku-ji Temple", "Ryoan-ji Temple", "Traditional tea ceremony"] as any, title: null, description: null, imageUrl: null },
                { dayNumber: 2, activities: ["Fushimi Inari Shrine", "Gion District", "Geisha performance", "Kaiseki dinner"] as any, title: null, description: null, imageUrl: null },
              ],
            },
          },
        ],
      },
    },
    update: {
      description: "Experience the perfect harmony of ancient traditions and cutting-edge technology in the Land of the Rising Sun.",
      imageUrl: "https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop",
      highlights: ["Cherry Blossoms", "Historic Shrines", "Modern Technology", "Traditional Culture", "Amazing Cuisine"] as any,
      badge: "Trending",
    }
  });

  // Japan visa types (created separately because VisaType.destination is a string)
  if (await tableExists('VisaType')) {
    await prisma.visaType.create({ data: {
        name: "Tourist Visa",
        description: "For sightseeing and leisure travel in Japan",
        duration: "90 days",
        processingTime: "3-5 business days",
        price: "$25",
        requirements: ["Valid passport with at least 6 months validity","Completed visa application form","Recent passport-sized photograph","Proof of financial means","Detailed travel itinerary"],
        documents: ["Passport","Visa application form","Passport photo","Bank statements","Flight itinerary"],
        validity: "Single entry",
        destination: japan.name,
  }});
  await prisma.visaType.create({ data: {
        name: "Work Visa",
        description: "For employment and work-related activities in Japan",
        duration: "1 year",
        processingTime: "2-4 weeks",
        price: "$100",
        requirements: ["Valid passport with at least 6 months validity","Employment contract","Company sponsorship letter","Educational certificates","Health certificate"],
        documents: ["Passport","Visa application form","Employment contract","Sponsorship letter","Educational documents"],
        validity: "Multiple entry",
        destination: japan.name,
      }});
  } else {
    console.warn('Skipping Japan visa types: VisaType table missing');
  }
  

  // Create Thailand destination
  const thailand = await prisma.destination.upsert({
    where: { name: 'Thailand' },
    create: {
      name: "Thailand",
      description: "Discover the land of smiles with its stunning beaches, ancient temples, and vibrant street food culture.",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170&auto=format&fit=crop",
      highlights: ["Beautiful Beaches", "Ancient Temples", "Street Food", "Islands", "Buddhist Culture"] as any,
      badge: "Budget Friendly",
      gallery: {
        create: [
          { imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170&auto=format&fit=crop", position: 0 },
          { imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1170&auto=format&fit=crop", position: 1 },
          { imageUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1170&auto=format&fit=crop", position: 2 },
        ],
      },
      itineraries: {
        create: [
          {
            slug: "bangkok",
            name: "Bangkok Adventure",
            city: "Bangkok",
            duration: "5 Days",
            price: "$150",
            imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170&auto=format&fit=crop",
            description: "Explore the vibrant capital with its temples, markets, and street food.",
            highlights: ["Temples", "Markets", "Street Food", "Nightlife"] as any,
            days: {
              create: [
                { dayNumber: 1, activities: ["Arrive in Bangkok", "Grand Palace", "Wat Pho Temple", "Chinatown dinner"] as any, title: null, description: null, imageUrl: null },
                { dayNumber: 2, activities: ["Floating market tour", "Chatuchak Weekend Market", "Khao San Road"] as any, title: null, description: null, imageUrl: null },
              ],
            },
          },
          {
            slug: "phuket",
            name: "Phuket Beach Paradise",
            city: "Phuket",
            duration: "7 Days",
            price: "$200",
            imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1170&auto=format&fit=crop",
            description: "Relax on pristine beaches and enjoy water activities.",
            highlights: ["Beaches", "Islands", "Water Sports", "Nightlife"] as any,
            days: {
              create: [
                { dayNumber: 1, activities: ["Arrive in Phuket", "Patong Beach", "Big Buddha", "Sunset dinner"] as any, title: null, description: null, imageUrl: null },
                { dayNumber: 2, activities: ["Phi Phi Islands tour", "Snorkeling", "Beach relaxation"] as any, title: null, description: null, imageUrl: null },
              ],
            },
          },
        ],
      },
    },
    update: {
      description: "Discover the land of smiles with its stunning beaches, ancient temples, and vibrant street food culture.",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170&auto=format&fit=crop",
      highlights: ["Beautiful Beaches", "Ancient Temples", "Street Food", "Islands", "Buddhist Culture"] as any,
      badge: "Budget Friendly",
    }
  });

  // Thailand visa types (created separately)
  if (await tableExists('VisaType')) {
    await prisma.visaType.create({ data: {
    name: "Tourist Visa",
    description: "For leisure travel and sightseeing in Thailand",
    duration: "60 days",
    processingTime: "2-3 business days",
    price: "$40",
    requirements: ["Valid passport with at least 6 months validity","Completed visa application form","Recent passport-sized photograph","Proof of financial means","Return flight ticket"],
    documents: ["Passport","Visa application form","Passport photo","Bank statements","Flight tickets"],
    validity: "Single entry",
    destination: thailand.name,
  }});
    await prisma.visaType.create({ data: {
    name: "Visa on Arrival",
    description: "Available for certain nationalities upon arrival",
    duration: "30 days",
    processingTime: "Immediate",
    price: "$30",
    requirements: ["Valid passport with at least 6 months validity","Return flight ticket","Proof of accommodation","Sufficient funds"],
    documents: ["Passport","Flight tickets","Hotel booking","Cash or credit card"],
    validity: "Single entry",
    destination: thailand.name,
    }});
  } else {
    console.warn('Skipping Thailand visa types: VisaType table missing');
  }

  // Create Singapore destination
  const singapore = await prisma.destination.upsert({
    where: { name: 'Singapore' },
    create: {
      name: "Singapore",
      description: "Experience the perfect fusion of cultures in this modern city-state with world-class attractions.",
      imageUrl: "https://images.unsplash.com/photo-1525625293386-3f9f99389edd?q=80&w=1170&auto=format&fit=crop",
      highlights: ["Modern Architecture", "Cultural Diversity", "World-Class Food", "Gardens", "Shopping"] as any,
      badge: "Luxury",
      gallery: {
        create: [
          { imageUrl: "https://images.unsplash.com/photo-1525625293386-3f9f99389edd?q=80&w=1170&auto=format&fit=crop", position: 0 },
          { imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1170&auto=format&fit=crop", position: 1 },
          { imageUrl: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop", position: 2 },
        ],
      },
      itineraries: {
        create: [
          {
            slug: "singapore-city",
            name: "Singapore City Tour",
            city: "Singapore",
            duration: "4 Days",
            price: "$300",
            imageUrl: "https://images.unsplash.com/photo-1525625293386-3f9f99389edd?q=80&w=1170&auto=format&fit=crop",
            description: "Explore the modern marvels and cultural gems of Singapore.",
            highlights: ["Marina Bay", "Gardens", "Food", "Shopping"] as any,
            days: {
              create: [
                { dayNumber: 1, activities: ["Arrive in Singapore", "Marina Bay Sands", "Gardens by the Bay", "Chinatown dinner"] as any, title: null, description: null, imageUrl: null },
                { dayNumber: 2, activities: ["Sentosa Island", "Universal Studios", "Clarke Quay"] as any, title: null, description: null, imageUrl: null },
              ],
            },
          },
        ],
      },
    },
    update: {
      description: "Experience the perfect fusion of cultures in this modern city-state with world-class attractions.",
      imageUrl: "https://images.unsplash.com/photo-1525625293386-3f9f99389edd?q=80&w=1170&auto=format&fit=crop",
      highlights: ["Modern Architecture", "Cultural Diversity", "World-Class Food", "Gardens", "Shopping"] as any,
      badge: "Luxury",
    }
  });

  // Singapore visa types
  if (await tableExists('VisaType')) {
    await prisma.visaType.create({ data: {
    name: "Tourist Visa",
    description: "For leisure travel and sightseeing in Singapore",
    duration: "30 days",
    processingTime: "1-2 business days",
    price: "$20",
    requirements: ["Valid passport with at least 6 months validity","Completed visa application form","Recent passport-sized photograph","Proof of financial means","Return flight ticket"],
    documents: ["Passport","Visa application form","Passport photo","Bank statements","Flight tickets"],
    validity: "Single entry",
    destination: singapore.name,
    }});
  } else {
    console.warn('Skipping Singapore visa types: VisaType table missing');
  }

  // Create Dubai destination
  const dubai = await prisma.destination.upsert({
    where: { name: 'Dubai' },
    create: {
      name: "Dubai",
      description: "Experience the ultimate luxury and modern marvels in the heart of the Middle East.",
      imageUrl: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop",
      highlights: ["Burj Khalifa", "Luxury Shopping", "Desert Safari", "Modern Architecture", "Gold Souks"] as any,
      badge: "Luxury",
      gallery: {
        create: [
          { imageUrl: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop", position: 0 },
          { imageUrl: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop", position: 1 },
          { imageUrl: "https://images.unsplash.com/photo-1525625293386-3f9f99389edd?q=80&w=1170&auto=format&fit=crop", position: 2 },
        ],
      },
      itineraries: {
        create: [
          {
            slug: "dubai-luxury",
            name: "Dubai Luxury Experience",
            city: "Dubai",
            duration: "5 Days",
            price: "$500",
            imageUrl: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop",
            description: "Indulge in the ultimate luxury experience in Dubai.",
            highlights: ["Burj Khalifa", "Shopping", "Desert", "Luxury Hotels"] as any,
            days: {
              create: [
                { dayNumber: 1, activities: ["Arrive in Dubai", "Burj Khalifa", "Dubai Mall", "Luxury dinner"] as any, title: null, description: null, imageUrl: null },
                { dayNumber: 2, activities: ["Desert safari", "Camel riding", "Traditional dinner", "Stargazing"] as any, title: null, description: null, imageUrl: null },
              ],
            },
          },
        ],
      },
    },
    update: {
      description: "Experience the ultimate luxury and modern marvels in the heart of the Middle East.",
      imageUrl: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop",
      highlights: ["Burj Khalifa", "Luxury Shopping", "Desert Safari", "Modern Architecture", "Gold Souks"] as any,
      badge: "Luxury",
    }
  });

  // Dubai visa types
  if (await tableExists('VisaType')) {
    await prisma.visaType.create({ data: {
    name: "Tourist Visa",
    description: "For leisure travel and sightseeing in Dubai",
    duration: "30 days",
    processingTime: "3-5 business days",
    price: "$60",
    requirements: ["Valid passport with at least 6 months validity","Completed visa application form","Recent passport-sized photograph","Proof of financial means","Hotel booking confirmation"],
    documents: ["Passport","Visa application form","Passport photo","Bank statements","Hotel booking"],
    validity: "Single entry",
    destination: dubai.name,
    }});
  } else {
    console.warn('Skipping Dubai visa types: VisaType table missing');
  }

  // Create sample visa applications
  // destination is now stored as a plain string, so no relation include here
  let visaTypes: any[] = [];
  if (await tableExists('VisaType')) {
    visaTypes = await prisma.visaType.findMany();
  } else {
    console.warn('Skipping visa applications: VisaType table missing');
  }

  const sampleApplications = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      passportNumber: "A12345678",
      nationality: "American",
      dateOfBirth: new Date("1990-05-15"),
      passportExpiry: new Date("2025-12-31"),
      travelPurpose: "Tourism and sightseeing",
      intendedArrival: new Date("2024-06-01"),
      status: "approved",
      notes: "Application processed successfully"
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "+1-555-0456",
      passportNumber: "B87654321",
      nationality: "Canadian",
      dateOfBirth: new Date("1985-08-22"),
      passportExpiry: new Date("2026-03-15"),
      travelPurpose: "Business meeting",
      intendedArrival: new Date("2024-07-15"),
      status: "processing",
      notes: "Additional documents requested"
    },
    {
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.johnson@example.com",
      phone: "+1-555-0789",
      passportNumber: "C11223344",
      nationality: "British",
      dateOfBirth: new Date("1992-11-10"),
      passportExpiry: new Date("2025-08-20"),
      travelPurpose: "Cultural exploration",
      intendedArrival: new Date("2024-08-01"),
      status: "pending"
    },
    {
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah.wilson@example.com",
      phone: "+1-555-0321",
      passportNumber: "D99887766",
      nationality: "Australian",
      dateOfBirth: new Date("1988-03-12"),
      passportExpiry: new Date("2026-09-30"),
      travelPurpose: "Honeymoon",
      intendedArrival: new Date("2024-09-15"),
      status: "approved",
      notes: "Congratulations on your marriage!"
    },
    {
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@example.com",
      phone: "+1-555-0654",
      passportNumber: "E55443322",
      nationality: "German",
      dateOfBirth: new Date("1995-07-08"),
      passportExpiry: new Date("2025-11-25"),
      travelPurpose: "Language learning",
      intendedArrival: new Date("2024-10-01"),
      status: "rejected",
      notes: "Insufficient financial documentation"
    },
    {
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria.garcia@example.com",
      phone: "+1-555-0987",
      passportNumber: "F77665544",
      nationality: "Spanish",
      dateOfBirth: new Date("1991-12-03"),
      passportExpiry: new Date("2026-06-18"),
      travelPurpose: "Work assignment",
      intendedArrival: new Date("2024-11-01"),
      status: "processing",
      notes: "Employment verification in progress"
    }
  ];

  // Create visa applications for different visa types
  if (await tableExists('VisaApplication') && visaTypes.length > 0) {
    for (let i = 0; i < sampleApplications.length; i++) {
      const application = sampleApplications[i];
      const visaType = visaTypes[i % visaTypes.length]; // Cycle through available visa types
      
      await prisma.visaApplication.create({
        data: {
          ...application,
          visaTypeId: visaType.id
        }
      });
    }
  } else {
    console.warn('Skipping creating visa applications: VisaApplication table missing or no visa types');
  }

  console.log("Database seeded successfully!");
  const createdDestinations = [korea, japan, thailand, singapore, dubai].filter(Boolean).map((d: any) => d.name);
  console.log("Created destinations:", createdDestinations);
  console.log("Created visa types:", visaTypes.length);
  console.log("Created visa applications:", visaTypes.length > 0 ? sampleApplications.length : 0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 