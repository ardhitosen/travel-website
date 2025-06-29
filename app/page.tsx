"use client"
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaChevronRight } from "react-icons/fa";
import Head from "next/head";

interface TravelOption {
id: number;
name: string;
image: string;
description: string;
itineraries: Itinerary[];
gallery: string[];
highlights?: string[];
badge?: string;
}

interface Itinerary {
day: number;
activities: string[];
}

const TravelApp = () => {
const [currentSlide, setCurrentSlide] = useState(0);
const [showItinerary, setShowItinerary] = useState(false);
const [selectedDestination, setSelectedDestination] = useState<TravelOption | null>(null);
const [galleryOpen, setGalleryOpen] = useState(false);
const [galleryImages, setGalleryImages] = useState<string[]>([]);
const [galleryIndex, setGalleryIndex] = useState(0);

const travelOptions: TravelOption[] = [
{
id: 1,
name: "Korea",
image:
"https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Explore the vibrant city of Seoul.",
itineraries: [
{
day: 1,
activities: [
"Arrive in Seoul",
"Visit Gyeongbokgung Palace",
"Explore Bukchon Hanok Village",
"Dinner in Myeong-dong",
],
},
{
day: 2,
activities: [
"Visit N Seoul Tower",
"Lunch in Hongdae",
"Shopping in Gangnam",
"Dinner in Itaewon",
],
},
],
gallery: [
"https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1526199119161-4be1e3368d52?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1525762867061-21c9fb70b15a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
],
highlights: ["Palaces & Temples", "Modern City Life", "Street Food"],
},
{
id: 2,
name: "Japan",
image:
"https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Experience the mix of tradition and modernity in Tokyo.",
itineraries: [
{
day: 1,
activities: [
"Arrive in Tokyo",
"Visit Tokyo Tower",
"Lunch in Shibuya",
"Explore Harajuku",
"Dinner in Shinjuku",
],
},
{
day: 2,
activities: [
"Visit Asakusa",
"Lunch in Tsukiji",
"Visit Meiji Shrine",
"Dinner in Roppongi",
],
},
],
gallery: [
"https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
],
highlights: ["Cherry Blossoms", "Historic Shrines", "Vibrant Nightlife"],
},
{
id: 3,
name: "Dubai",
image:
"https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Discover the luxury and opulence of Dubai.",
itineraries: [
{
day: 1,
activities: [
"Arrive in Dubai",
"Visit Burj Khalifa",
"Lunch in Downtown Dubai",
"Explore Dubai Mall",
"Dinner in Dubai Marina",
],
},
{
day: 2,
activities: [
"Visit Desert Safari",
"Lunch in Al Ain",
"Visit Sheikh Zayed Mosque",
"Dinner in Deira",
],
},
],
gallery: [
"https://plus.unsplash.com/premium_photo-1697729914552-368899dc4757?q=80&w=1112&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1528702748617-c64d49f918af?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://plus.unsplash.com/premium_photo-1661943659036-aa040d92ee64?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
],
},
{
id: 4,
name: "Thailand",
image:
"https://plus.unsplash.com/premium_photo-1661962958462-9e52fda9954d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Enjoy the beautiful beaches and temples of Bangkok.",
itineraries: [
{
day: 1,
activities: [
"Arrive in Bangkok",
"Visit Grand Palace",
"Lunch in Chinatown",
"Explore Wat Arun",
"Dinner in Sukhumvit",
],
},
{
day: 2,
activities: [
"Visit Floating Markets",
"Lunch in Siam Paragon",
"Visit Wat Pho",
"Dinner in Khao San Road",
],
},
],
gallery: [
"https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1512553353614-82a7370096dc?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
],
},
{
id: 5,
name: "Vietnam",
image:
"https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Explore the stunning landscapes and rich culture of Hanoi.",
itineraries: [
{
day: 1,
activities: [
"Arrive in Hanoi",
"Visit Hoan Kiem Lake",
"Lunch in Old Quarter",
"Explore Dong Xuan Market",
"Dinner in Ta Hien Street",
],
},
{
day: 2,
activities: [
"Visit Ho Chi Minh Mausoleum",
"Lunch in Ba Dinh District",
"Visit Temple of Literature",
"Dinner in Hang Be District",
],
},
],
gallery: [
"https://images.unsplash.com/photo-1480996408299-fc0e830b5db1?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1521993117367-b7f70ccd029d?q=80&w=1140&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1603852452378-a4e8d84324a2?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
],
},
{
id: 6,
name: "Indonesia",
image:
"https://plus.unsplash.com/premium_photo-1677829177642-30def98b0963?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Discover the islands of Bali and Jakarta.",
itineraries: [
{
day: 1,
activities: [
"Arrive in Jakarta",
"Visit National Monument",
"Lunch in Glodok",
"Explore Old Town",
"Dinner in Menteng",
],
},
{
day: 2,
activities: [
"Visit Istiqlal Mosque",
"Lunch in Senayan",
"Visit Jakarta Aquarium",
"Dinner in Kemang",
],
},
],
gallery: [
"https://images.unsplash.com/photo-1476158085676-e67f57ed9ed7?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1480996408299-fc0e830b5db1?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
],
},
{
id: 7,
name: "Philippines",
image:
"https://images.unsplash.com/photo-1593994603115-deaa40043bae?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Enjoy the beautiful beaches of Boracay and Manila.",
itineraries: [
{
day: 1,
activities: [
"Arrive in Manila",
"Visit Intramuros",
"Lunch in Binondo",
"Explore Rizal Park",
"Dinner in Makati",
],
},
{
day: 2,
activities: [
"Visit Boracay Island",
"Lunch in Station 2",
"Visit White Beach",
"Dinner in D'Talipapa Market",
],
},
],
gallery: [
"https://images.unsplash.com/photo-1583685133115-90748ccbe274?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1553323855-cc1abf1930d2?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1565340076637-825894a74ca6?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
],
},
{
id: 8,
name: "Malaysia",
image:
"https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1164&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Experience the mix of cultures in Kuala Lumpur.",
itineraries: [
{
day: 1,
activities: [
"Arrive in Kuala Lumpur",
"Visit Petronas Twin Towers",
"Lunch in Bukit Bintang",
"Explore Chinatown",
"Dinner in Jalan Alor",
],
},
{
day: 2,
activities: [
"Visit Batu Caves",
"Lunch in Damansara",
"Visit Merdeka Square",
"Dinner in Bangsar",
],
},
],
gallery: [
"https://images.unsplash.com/photo-1520919177397-8c965d4b4fa6?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1580496297468-1e05179cfd81?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://plus.unsplash.com/premium_photo-1700955286569-2563f1d99576?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
],
},
];

const bannerSlides = [
  {
    image: travelOptions[1].image, // Japan
    fact: "Japan: Did you know? Tokyo is the world's most populous metropolis and cherry blossoms bloom every spring!",
    destination: "Japan"
  },
  {
    image: travelOptions[2].image, // Dubai
    fact: "Dubai: The Burj Khalifa is the tallest building in the world, standing at 828 meters!",
    destination: "Dubai"
  },
  {
    image: travelOptions[0].image, // Korea
    fact: "Korea: Seoul is home to five grand palaces built during the Joseon Dynasty.",
    destination: "Korea"
  },
  {
    image: travelOptions[3].image, // Thailand
    fact: "Thailand: Bangkok's real name is one of the longest place names in the world!",
    destination: "Thailand"
  },
  {
    image: travelOptions[4].image, // Vietnam
    fact: "Vietnam: Ha Long Bay is a UNESCO World Heritage Site with over 1,600 islands and islets!",
    destination: "Vietnam"
  },
  {
    image: travelOptions[5].image, // Indonesia
    fact: "Indonesia: The country is made up of over 17,000 islands, the largest archipelago in the world!",
    destination: "Indonesia"
  },
  {
    image: travelOptions[6].image, // Philippines
    fact: "Philippines: The country has more than 7,000 islands and is famous for its white sand beaches!",
    destination: "Philippines"
  },
  {
    image: travelOptions[7].image, // Malaysia
    fact: "Malaysia: The Petronas Towers in Kuala Lumpur were once the tallest buildings in the world!",
    destination: "Malaysia"
  },
];

useEffect(() => {
const intervalId = setInterval(() => {
setCurrentSlide((prevSlide: number) => (prevSlide + 1) % bannerSlides.length);
}, 3000);
return () => clearInterval(intervalId);
}, [bannerSlides.length]);

const handleBookTrip = (destination: TravelOption) => {
const message = `Hello, I want to book a trip to ${destination.name}.`;
const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
window.open(whatsappUrl, "_blank");
};

const handleOpenGallery = (images: string[], index: number = 0) => {
setGalleryImages(images);
setGalleryIndex(index);
setGalleryOpen(true);
};

useEffect(() => {
if (!galleryOpen) return;
const handleKey = (e: KeyboardEvent) => {
if (e.key === "Escape") setGalleryOpen(false);
if (e.key === "ArrowRight") setGalleryIndex((i: number) => (i + 1) % galleryImages.length);
if (e.key === "ArrowLeft") setGalleryIndex((i: number) => (i - 1 + galleryImages.length) % galleryImages.length);
};
window.addEventListener("keydown", handleKey);
return () => window.removeEventListener("keydown", handleKey);
}, [galleryOpen, galleryImages.length]);

return (
  <>
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <title>Lorem Ipsum - Your Adventure Awaits</title>
    </Head>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans relative overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Header with glassmorphism */}
      <header className="bg-white/10 backdrop-blur-xl shadow-lg sticky top-0 z-30 border-b border-white/20">
        <div className="max-w-7xl mx-3 py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3 min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <svg className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 flex-shrink-0 shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="font-bold text-2xl md:text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">Lorem Ipsum</span>      
          </motion.div>
        </div>
      </header>
      <main>
        {/* Hero Banner Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <AnimatePresence initial={false}>
              {bannerSlides.map((slide, index) =>
                index === currentSlide ? (
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    style={{
                      transform: `translateY(${window.scrollY * 0.5}px)`,
                    }}
                  >
                    <img
                      src={slide.image}
                      alt={`Travel banner ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-blue-800/40 to-indigo-900/50" />
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>
          
          {/* Banner Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <motion.div
              className="text-white"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-4xl md:text-7xl font-bold mb-6 drop-shadow-2xl leading-tight inline-block px-8 py-4 rounded-2xl"
                style={{ color: '#22223B', background: 'rgba(253, 251, 212, 0.85)' }}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                {bannerSlides[currentSlide].destination}
              </motion.h1>
              
              <motion.p
                className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto leading-relaxed inline-block px-6 py-3 rounded-xl"
                style={{ color: '#fff', background: 'rgba(34, 34, 59, 0.7)' }}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                {bannerSlides[currentSlide].fact}
              </motion.p>
                            
            </motion.div>
          </div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium">Scroll to explore</span>
              <motion.div
                className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Welcome Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-xl" id="welcome-destinations">
          <div className="w-full">
            <motion.div
              className="text-center mb-16"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="mb-8 px-5"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <span className="inline-block bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white font-extrabold text-3xl md:text-5xl px-10 py-4 rounded-full shadow-2xl tracking-wide backdrop-blur-sm border border-white/20">
                  Welcome to Lorem Ipsum
                </span>
              </motion.div>
              
              <motion.h2 
                className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                viewport={{ once: true }}
              >
                Your Journey Begins Here
              </motion.h2>
              
              <motion.p
                className="text-xl md:text-2xl text-gray-700 font-light mb-12 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                viewport={{ once: true }}
              >
                Experience the world like never before with our carefully curated travel packages. 
                From bustling cities to serene landscapes, we bring you the best destinations across Asia.
              </motion.p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ 
                visible: { 
                  transition: { 
                    staggerChildren: 0.2,
                    delayChildren: 0.3
                  } 
                } 
              }}
            >
              {[
                {
                  icon: "✈️",
                  title: "Expert Planning",
                  description: "Our travel experts craft perfect itineraries tailored to your preferences and budget."
                },
                {
                  icon: "🏨",
                  title: "Premium Accommodations",
                  description: "Stay in handpicked hotels and resorts that offer comfort and authentic local experiences."
                },
                {
                  icon: "🎯",
                  title: "Unique Experiences",
                  description: "Discover hidden gems and create memories that last a lifetime with our exclusive tours."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 text-center hover:shadow-2xl transition-all duration-500"
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="text-6xl mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-blue-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Destinations Title, Grid, etc. - add spacing above */}
            <motion.h2 
              className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-16 text-center mt-32"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Popular Destinations
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 px-3 sm:px-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ 
                visible: { 
                  transition: { 
                    staggerChildren: 0.15,
                    delayChildren: 0.2
                  } 
                } 
              }}
            >
              {travelOptions.map((option, idx) => (
                <motion.div
                  key={option.id}
                  className="group bg-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col border border-white/30 overflow-hidden"
                  onClick={() => { setSelectedDestination(option); setShowItinerary(true); }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -8,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: idx * 0.1,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true }}
                >
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={option.image}
                      alt={option.name}
                      className="w-full h-48 sm:h-80 md:h-[400px] object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
                      loading="lazy"
                      onClick={() => handleOpenGallery(option.gallery, 0)}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4 sm:p-8 flex flex-col flex-1 bg-white/10 backdrop-blur-sm">
                    <h3 className="text-lg sm:text-2xl font-bold text-blue-800 mb-2 sm:mb-3">
                      {option.name}
                    </h3>
                    <p className="text-gray-700 mb-3 sm:mb-4 flex-1 text-sm sm:text-lg font-light">
                      {option.description}
                    </p>
                    {option.highlights && (
                      <ul className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                        {option.highlights.map((h, i) => (
                          <motion.li 
                            key={i} 
                            className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-blue-200/50 backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            viewport={{ once: true }}
                          >
                            {h}
                          </motion.li>
                        ))}
                      </ul>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-auto flex-nowrap w-full">
                      <motion.button
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl flex-1 flex items-center justify-center gap-1 sm:gap-2 font-semibold shadow-lg text-sm sm:text-base md:text-lg transition-all min-w-0 whitespace-nowrap backdrop-blur-sm border border-white/20"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setSelectedDestination(option);
                          setShowItinerary(true);
                        }}
                        aria-label={`View itinerary for ${option.name}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="shrink-0 flex items-center"><FaChevronRight /></span>
                        <span className="truncate text-xs sm:text-sm"> Itinerary</span>
                      </motion.button>
                      <motion.button
                        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-3 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl flex-1 flex items-center justify-center gap-1 sm:gap-2 font-semibold shadow-lg text-sm sm:text-base md:text-lg transition-all bg-white/80 backdrop-blur-sm min-w-0 whitespace-nowrap"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleBookTrip(option);
                        }}
                        aria-label={`Book trip to ${option.name}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="shrink-0 flex items-center"><FaWhatsapp /></span>
                        <span className="truncate text-xs sm:text-sm">Book</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="w-full bg-white/20 backdrop-blur-xl border-t border-white/30 text-blue-600 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <motion.div 
            className="flex items-center gap-2 mb-2 md:mb-0 min-w-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <svg className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-1 flex-shrink-0 shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="font-bold truncate bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lorem Ipsum</span>
            <span className="text-xs font-normal text-blue-500/70 ml-2 truncate">travel expert</span>
          </motion.div>
          <motion.div 
            className="flex flex-col md:flex-row gap-2 md:gap-6 text-xs md:text-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span className="flex items-center gap-1"><svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 01-2 2A19.72 19.72 0 013 5a2 2 0 012-2h2.09a2 2 0 012 1.72c.13.81.36 1.6.68 2.35a2 2 0 01-.45 2.11l-.27.27a16 16 0 006.29 6.29l.27-.27a2 2 0 012.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" /></svg>+1 234 567 8901</span>
            <span className="flex items-center gap-1"><svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" /></svg>hello@lorem.com</span>
          </motion.div>
          <motion.div 
            className="text-xs text-blue-500/70 mt-2 md:mt-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            &copy; {new Date().getFullYear()} Lorem. All rights reserved.
          </motion.div>
        </div>
      </footer>
      <AnimatePresence>
        {showItinerary && selectedDestination && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-black/20 via-blue-900/10 to-indigo-900/20 backdrop-blur-md flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowItinerary(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] border border-white/30"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                className="absolute top-4 right-4 text-blue-600 hover:text-orange-500 text-3xl font-bold z-10 bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-white/30"
                onClick={() => setShowItinerary(false)}
                aria-label="Close itinerary"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                ×
              </motion.button>
              {/* Banner */}
              <div className="relative h-56 md:h-80 w-full overflow-hidden rounded-t-3xl">
                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover object-center blur-sm scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-800/40 to-transparent" />
                <div className="absolute inset-0 flex items-end md:items-center md:justify-center px-6 md:px-0 pb-6 md:pb-0">
                  <div className="max-w-3xl w-full mx-auto">
                    <motion.h2 
                      className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-2xl mb-3"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      {selectedDestination.name}
                    </motion.h2>
                    <motion.div 
                      className="flex items-center gap-2 text-white/90 mb-2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-lg font-medium">{selectedDestination.name === "Korea" ? "South Korea" : selectedDestination.name}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
              {/* Info Bar */}
              <div className="w-full bg-white/80 backdrop-blur-xl py-6 px-6 flex flex-col md:flex-row items-center justify-center gap-8 shadow-lg border-b border-white/30">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 shadow-lg border border-blue-200/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                  </span>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Duration</div>
                    <div className="font-bold text-blue-600">1 Week</div>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 shadow-lg border border-green-200/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v10l6 3" /></svg>
                  </span>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Difficulty</div>
                    <div className="font-bold text-green-600">Easy</div>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 shadow-lg border border-purple-200/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                  </span>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Min Age</div>
                    <div className="font-bold text-purple-600">0+</div>
                  </div>
                </motion.div>
              </div>
              {/* Main Content */}
              <div className="max-w-4xl mx-auto flex flex-col gap-8 mt-8 px-6 pb-8">
                <motion.div 
                  className="w-full"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                >
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">Enjoy the Adventure</h3>
                  <p className="text-gray-700 mb-8 text-lg font-light leading-relaxed">{selectedDestination.description}</p>
                  {selectedDestination.highlights && (
                    <ul className="flex flex-wrap gap-3 mb-8">
                      {selectedDestination.highlights.map((h, i) => (
                        <motion.li 
                          key={i} 
                          className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-base font-medium px-5 py-3 rounded-full border border-blue-200/50 backdrop-blur-sm shadow-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                        >
                          {h}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">Itinerary</h4>
                  <div className="space-y-6">
                    {selectedDestination.itineraries.map((itinerary, idx) => (
                      <motion.div 
                        key={itinerary.day} 
                        className="border border-white/30 rounded-2xl p-6 bg-white/50 backdrop-blur-sm shadow-lg"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.4 + idx * 0.2, duration: 0.6 }}
                      >
                        <h5 className="text-xl font-bold text-blue-700 mb-4">Day {itinerary.day}</h5>
                        <ul className="space-y-3">
                          {itinerary.activities.map((activity, activityIdx) => (
                            <motion.li 
                              key={activityIdx} 
                              className="flex items-start text-gray-700"
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 1.6 + idx * 0.2 + activityIdx * 0.1, duration: 0.4 }}
                            >
                              <svg className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              <span className="font-medium">{activity}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                {/* Booking Card */}
                <motion.div 
                  className="w-full bg-gradient-to-br from-white/80 to-blue-50/80 rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-white/30 backdrop-blur-xl mt-8"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 2.0, duration: 0.8 }}
                >
                  <div className="text-sm text-gray-500 mb-3 flex items-center gap-2 font-medium">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" /></svg>
                    Starting from
                  </div>
                  <div className="mb-6">
                    <span className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-4xl px-8 py-3 rounded-full shadow-xl tracking-wide">
                      $280
                    </span>
                  </div>
                  <motion.button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl text-xl transition-all mt-2 backdrop-blur-sm border border-white/20"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleBookTrip(selectedDestination);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    Book Now
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {galleryOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-black/30 via-blue-900/20 to-indigo-900/30 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setGalleryOpen(false)}
        >
          <motion.div
            className="relative max-w-4xl w-full mx-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center border-2 border-white/30"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <motion.button
              className="absolute top-4 right-4 text-blue-600 hover:text-orange-500 text-3xl font-bold z-10 bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-white/30"
              onClick={() => setGalleryOpen(false)}
              aria-label="Close gallery"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              ×
            </motion.button>
            <div className="flex items-center justify-center w-full h-[500px] bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
              <motion.img
                key={galleryImages[galleryIndex]}
                src={galleryImages[galleryIndex]}
                alt="Gallery image"
                className="object-contain max-h-[480px] w-full rounded-2xl shadow-2xl"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>
            <div className="flex justify-between items-center w-full px-8 py-6 bg-white/80 backdrop-blur-xl border-t border-white/30">
              <motion.button
                className="text-blue-600 hover:text-orange-500 text-3xl font-bold px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-lg border border-white/30"
                onClick={() => setGalleryIndex((galleryIndex - 1 + galleryImages.length) % galleryImages.length)}
                aria-label="Previous image"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                ‹
              </motion.button>
              <div className="flex gap-3">
                {galleryImages.map((img, idx) => (
                  <motion.button
                    key={img}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      idx === galleryIndex 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 shadow-lg' 
                        : 'bg-white/60 border-blue-300 hover:border-blue-500'
                    }`}
                    onClick={() => setGalleryIndex(idx)}
                    aria-label={`Go to image ${idx + 1}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
              <motion.button
                className="text-blue-600 hover:text-orange-500 text-3xl font-bold px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-lg border border-white/30"
                onClick={() => setGalleryIndex((galleryIndex + 1) % galleryImages.length)}
                aria-label="Next image"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                ›
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  </>
);
};

export default TravelApp;