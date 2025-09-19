const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting minimal database seed...');
  
  try {
    // Create admin user
    const passwordHash = await bcrypt.hash("admin123", 10);
    const user = await prisma.user.upsert({
      where: { email: "info@jalanoverseas.com" },
      create: { email: "info@jalanoverseas.com", passwordHash, role: "admin" },
      update: { passwordHash },
    });
    console.log('✅ Created admin user');

    // Create banner slides
    const banners = await prisma.bannerSlide.createMany({ 
      data: [
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
      ]
    });
    console.log('✅ Created banner slides');

    // Create Korea destination
    const korea = await prisma.destination.create({
      data: {
        name: "Korea",
        description: "Explore the vibrant city of Seoul and experience the perfect blend of ancient traditions and modern innovation.",
        imageUrl: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop",
        highlights: ["Palaces & Temples", "Modern City Life", "Street Food", "K-Pop Culture", "Traditional Markets"],
        badge: "Popular",
      },
    });
    console.log('✅ Created Korea destination');

    // Create Japan destination
    const japan = await prisma.destination.create({
      data: {
        name: "Japan",
        description: "Experience the perfect harmony of ancient traditions and cutting-edge technology in the Land of the Rising Sun.",
        imageUrl: "https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop",
        highlights: ["Cherry Blossoms", "Historic Shrines", "Modern Technology", "Traditional Culture", "Amazing Cuisine"],
        badge: "Trending",
      },
    });
    console.log('✅ Created Japan destination');

    console.log("🎉 Database seeded successfully!");
    console.log("Created destinations:", [korea.name, japan.name]);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
