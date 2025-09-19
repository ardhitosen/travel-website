"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.bannerSlide.deleteMany();
    await prisma.galleryImage.deleteMany();
    await prisma.itineraryDay.deleteMany();
    await prisma.itinerary.deleteMany();
    await prisma.destination.deleteMany();
    const passwordHash = await bcryptjs_1.default.hash("admin123", 10);
    await prisma.user.upsert({
        where: { email: "admin@jos.com" },
        create: { email: "admin@jos.com", passwordHash, role: "admin" },
        update: { passwordHash },
    });
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
        ] });
    const korea = await prisma.destination.create({
        data: {
            name: "Korea",
            description: "Explore the vibrant city of Seoul.",
            imageUrl: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop",
            highlights: ["Palaces & Temples", "Modern City Life", "Street Food"],
            gallery: {
                create: [
                    { imageUrl: "https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?q=80&w=1631&auto=format&fit=crop", position: 0 },
                    { imageUrl: "https://images.unsplash.com/photo-1526199119161-4be1e3368d52?q=80&w=1074&auto=format&fit=crop", position: 1 },
                ],
            },
            itineraries: {
                create: [
                    {
                        slug: "seoul",
                        name: "Seoul",
                        city: "Seoul",
                        duration: "1 Week",
                        price: "$280",
                        imageUrl: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop",
                        description: "Experience the vibrant city life of Seoul.",
                        highlights: ["Palaces", "Street Food"],
                        days: {
                            create: [
                                { dayNumber: 1, activities: ["Arrive in Seoul", "Visit Gyeongbokgung Palace", "Explore Bukchon Hanok Village", "Dinner in Myeong-dong"] },
                                { dayNumber: 2, activities: ["Visit N Seoul Tower", "Lunch in Hongdae", "Shopping in Gangnam", "Dinner in Itaewon"] },
                            ],
                        },
                    },
                ],
            },
        },
    });
    const japan = await prisma.destination.create({
        data: {
            name: "Japan",
            description: "Experience the mix of tradition and modernity in Tokyo.",
            imageUrl: "https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop",
            highlights: ["Cherry Blossoms", "Historic Shrines", "Nightlife"],
            gallery: {
                create: [
                    { imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1170&auto=format&fit=crop", position: 0 },
                    { imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1170&auto=format&fit=crop", position: 1 },
                ],
            },
            itineraries: {
                create: [
                    {
                        slug: "tokyo",
                        name: "Tokyo",
                        city: "Tokyo",
                        duration: "1 Week",
                        price: "$280",
                        imageUrl: "https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop",
                        description: "Experience the mix of tradition and modernity in Tokyo.",
                        highlights: ["Shrines", "Fashion"],
                        days: {
                            create: [
                                { dayNumber: 1, activities: ["Arrive in Tokyo", "Visit Tokyo Tower", "Lunch in Shibuya", "Explore Harajuku", "Dinner in Shinjuku"] },
                                { dayNumber: 2, activities: ["Visit Asakusa", "Lunch in Tsukiji", "Visit Meiji Shrine", "Dinner in Roppongi"] },
                            ],
                        },
                    },
                ],
            },
        },
    });
    console.log({ korea: korea.id, japan: japan.id });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
