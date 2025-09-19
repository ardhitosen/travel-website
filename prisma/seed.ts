import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear all data
  await prisma.visaApplication.deleteMany();
  await prisma.visaType.deleteMany();
  await prisma.bannerSlide.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.itineraryDay.deleteMany();
  await prisma.itinerary.deleteMany();
  await prisma.destination.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "info@jalanoverseas.com" },
    create: { email: "info@jalanoverseas.com", passwordHash, role: "admin" },
    update: { passwordHash },
  });

  // Create banner slides
  await prisma.bannerSlide.createMany({ data: [
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
  ]});

  // Create Korea destination
  const korea = await prisma.destination.create({
    data: {
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
                { dayNumber: 1, activities: ["Arrive in Seoul", "Visit Gyeongbokgung Palace", "Explore Bukchon Hanok Village", "Dinner in Myeong-dong"] as any },
                { dayNumber: 2, activities: ["Visit N Seoul Tower", "Lunch in Hongdae", "Shopping in Gangnam", "Dinner in Itaewon"] as any },
                { dayNumber: 3, activities: ["DMZ Tour", "Korean War Memorial", "Insadong Cultural Street", "Traditional Tea Ceremony"] as any },
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
                { dayNumber: 1, activities: ["Arrive in Busan", "Haeundae Beach", "Dongbaekseom Island", "Seafood dinner"] as any },
                { dayNumber: 2, activities: ["Haedong Yonggungsa Temple", "Gamcheon Culture Village", "Jagalchi Fish Market"] as any },
              ],
            },
          },
        ],
      },
      visas: {
        create: [
          {
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
            ] as any,
            documents: [
              "Passport",
              "Visa application form",
              "Passport photo",
              "Bank statements",
              "Travel insurance"
            ] as any,
            validity: "Single entry"
          },
          {
            name: "Business Visa",
            description: "For business meetings, conferences, and work-related travel",
            duration: "30 days",
            processingTime: "7-10 business days",
            price: "$50",
            requirements: [
              "Valid passport with at least 6 months validity",
              "Business invitation letter",
              "Company registration documents",
              "Proof of business relationship",
              "Financial statements"
            ] as any,
            documents: [
              "Passport",
              "Visa application form",
              "Business invitation",
              "Company documents",
              "Financial proof"
            ] as any,
            validity: "Multiple entry"
          },
          {
            name: "Student Visa",
            description: "For educational purposes and language learning",
            duration: "1 year",
            processingTime: "2-3 weeks",
            price: "$80",
            requirements: [
              "Valid passport with at least 6 months validity",
              "Acceptance letter from Korean institution",
              "Financial proof for tuition and living expenses",
              "Health certificate",
              "Academic transcripts"
            ] as any,
            documents: [
              "Passport",
              "Visa application form",
              "Acceptance letter",
              "Financial statements",
              "Health certificate"
            ] as any,
            validity: "Multiple entry"
          }
        ]
      }
    },
  });

  // Create Japan destination
  const japan = await prisma.destination.create({
    data: {
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
                { dayNumber: 1, activities: ["Arrive in Tokyo", "Visit Tokyo Tower", "Lunch in Shibuya", "Explore Harajuku", "Dinner in Shinjuku"] as any },
                { dayNumber: 2, activities: ["Visit Asakusa", "Lunch in Tsukiji", "Visit Meiji Shrine", "Dinner in Roppongi"] as any },
                { dayNumber: 3, activities: ["Disneyland Tokyo", "Evening in Odaiba", "Tokyo Skytree"] as any },
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
                { dayNumber: 1, activities: ["Arrive in Kyoto", "Kinkaku-ji Temple", "Ryoan-ji Temple", "Traditional tea ceremony"] as any },
                { dayNumber: 2, activities: ["Fushimi Inari Shrine", "Gion District", "Geisha performance", "Kaiseki dinner"] as any },
              ],
            },
          },
        ],
      },
      visas: {
        create: [
          {
            name: "Tourist Visa",
            description: "For sightseeing and leisure travel in Japan",
            duration: "90 days",
            processingTime: "3-5 business days",
            price: "$25",
            requirements: [
              "Valid passport with at least 6 months validity",
              "Completed visa application form",
              "Recent passport-sized photograph",
              "Proof of financial means",
              "Detailed travel itinerary"
            ] as any,
            documents: [
              "Passport",
              "Visa application form",
              "Passport photo",
              "Bank statements",
              "Flight itinerary"
            ] as any,
            validity: "Single entry"
          },
          {
            name: "Work Visa",
            description: "For employment and work-related activities in Japan",
            duration: "1 year",
            processingTime: "2-4 weeks",
            price: "$100",
            requirements: [
              "Valid passport with at least 6 months validity",
              "Employment contract",
              "Company sponsorship letter",
              "Educational certificates",
              "Health certificate"
            ] as any,
            documents: [
              "Passport",
              "Visa application form",
              "Employment contract",
              "Sponsorship letter",
              "Educational documents"
            ] as any,
            validity: "Multiple entry"
          }
        ]
      }
    },
  });

  // Create Thailand destination
  const thailand = await prisma.destination.create({
    data: {
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
                { dayNumber: 1, activities: ["Arrive in Bangkok", "Grand Palace", "Wat Pho Temple", "Chinatown dinner"] as any },
                { dayNumber: 2, activities: ["Floating market tour", "Chatuchak Weekend Market", "Khao San Road"] as any },
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
                { dayNumber: 1, activities: ["Arrive in Phuket", "Patong Beach", "Big Buddha", "Sunset dinner"] as any },
                { dayNumber: 2, activities: ["Phi Phi Islands tour", "Snorkeling", "Beach relaxation"] as any },
              ],
            },
          },
        ],
      },
      visas: {
        create: [
          {
            name: "Tourist Visa",
            description: "For leisure travel and sightseeing in Thailand",
            duration: "60 days",
            processingTime: "2-3 business days",
            price: "$40",
            requirements: [
              "Valid passport with at least 6 months validity",
              "Completed visa application form",
              "Recent passport-sized photograph",
              "Proof of financial means",
              "Return flight ticket"
            ] as any,
            documents: [
              "Passport",
              "Visa application form",
              "Passport photo",
              "Bank statements",
              "Flight tickets"
            ] as any,
            validity: "Single entry"
          },
          {
            name: "Visa on Arrival",
            description: "Available for certain nationalities upon arrival",
            duration: "30 days",
            processingTime: "Immediate",
            price: "$30",
            requirements: [
              "Valid passport with at least 6 months validity",
              "Return flight ticket",
              "Proof of accommodation",
              "Sufficient funds"
            ] as any,
            documents: [
              "Passport",
              "Flight tickets",
              "Hotel booking",
              "Cash or credit card"
            ] as any,
            validity: "Single entry"
          }
        ]
      }
    },
  });

  // Create Singapore destination
  const singapore = await prisma.destination.create({
    data: {
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
                { dayNumber: 1, activities: ["Arrive in Singapore", "Marina Bay Sands", "Gardens by the Bay", "Chinatown dinner"] as any },
                { dayNumber: 2, activities: ["Sentosa Island", "Universal Studios", "Clarke Quay"] as any },
              ],
            },
          },
        ],
      },
      visas: {
        create: [
          {
            name: "Tourist Visa",
            description: "For leisure travel and sightseeing in Singapore",
            duration: "30 days",
            processingTime: "1-2 business days",
            price: "$20",
            requirements: [
              "Valid passport with at least 6 months validity",
              "Completed visa application form",
              "Recent passport-sized photograph",
              "Proof of financial means",
              "Return flight ticket"
            ] as any,
            documents: [
              "Passport",
              "Visa application form",
              "Passport photo",
              "Bank statements",
              "Flight tickets"
            ] as any,
            validity: "Single entry"
          }
        ]
      }
    },
  });

  // Create Dubai destination
  const dubai = await prisma.destination.create({
    data: {
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
                { dayNumber: 1, activities: ["Arrive in Dubai", "Burj Khalifa", "Dubai Mall", "Luxury dinner"] as any },
                { dayNumber: 2, activities: ["Desert safari", "Camel riding", "Traditional dinner", "Stargazing"] as any },
              ],
            },
          },
        ],
      },
      visas: {
        create: [
          {
            name: "Tourist Visa",
            description: "For leisure travel and sightseeing in Dubai",
            duration: "30 days",
            processingTime: "3-5 business days",
            price: "$60",
            requirements: [
              "Valid passport with at least 6 months validity",
              "Completed visa application form",
              "Recent passport-sized photograph",
              "Proof of financial means",
              "Hotel booking confirmation"
            ] as any,
            documents: [
              "Passport",
              "Visa application form",
              "Passport photo",
              "Bank statements",
              "Hotel booking"
            ] as any,
            validity: "Single entry"
          }
        ]
      }
    },
  });

  // Create sample visa applications
  const visaTypes = await prisma.visaType.findMany({
    include: { destination: true }
  });

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

  console.log("Database seeded successfully!");
  console.log("Created destinations:", [korea.name, japan.name, thailand.name, singapore.name, dubai.name]);
  console.log("Created visa types:", visaTypes.length);
  console.log("Created visa applications:", sampleApplications.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 