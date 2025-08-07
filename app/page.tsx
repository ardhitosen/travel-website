"use client"
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaChevronRight } from "react-icons/fa";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface TravelOption {
  id: number;
  name: string;
  image: string;
  description: string;
  itineraries: CountryItinerary[];
  gallery: string[];
  highlights?: string[];
  badge?: string;
}

interface CountryItinerary {
  id: string;
  name: string;
  city: string;
  duration: string;
  price: string;
  image: string;
  description: string;
  activities: ItineraryDay[];
  highlights: string[];
}

interface ItineraryDay {
  day: number;
  activities: string[];
}

const TravelApp = () => {
  // Fallback component for failed images
  const ImageFallback = ({ className }: { className?: string }) => (
    <div className={`bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-sm">Image unavailable</p>
      </div>
    </div>
  );

  const [currentSlide, setCurrentSlide] = useState(0);
const [showItinerary, setShowItinerary] = useState(false);
const [selectedDestination, setSelectedDestination] = useState<TravelOption | null>(null);
const [galleryOpen, setGalleryOpen] = useState(false);
const [galleryImages, setGalleryImages] = useState<string[]>([]);
const [galleryIndex, setGalleryIndex] = useState(0);
const [scrollY, setScrollY] = useState(0);
const [isVideoPlaying, setIsVideoPlaying] = useState(false);
const [isVideoLoading, setIsVideoLoading] = useState(true);
const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
const [videoError, setVideoError] = useState(false);
const router = useRouter();

const travelOptions: TravelOption[] = [
{
id: 1,
name: "Korea",
image:
"https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Explore the vibrant city of Seoul.",
itineraries: [
{
id: "seoul",
name: "Seoul",
city: "Seoul",
duration: "1 Week",
price: "$280",
image: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Experience the vibrant city life of Seoul.",
  activities: [
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
  highlights: ["Palaces & Temples", "Modern City Life", "Street Food"],
},
],
gallery: [
"https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1526199119161-4be1e3368d52?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1525762867061-21c9fb70b15a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
],
},
{
id: 2,
name: "Japan",
image:
"https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Experience the mix of tradition and modernity in Tokyo.",
itineraries: [
{
id: "tokyo",
name: "Tokyo",
city: "Tokyo",
duration: "1 Week",
price: "$280",
image: "https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Experience the mix of tradition and modernity in Tokyo.",
activities: [
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
highlights: ["Cherry Blossoms", "Historic Shrines", "Vibrant Nightlife"],
},
],
gallery: [
"https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
],
},
{
id: 3,
name: "Dubai",
image:
"https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Discover the luxury and opulence of Dubai.",
itineraries: [
{
id: "dubai",
name: "Dubai",
city: "Dubai",
duration: "1 Week",
price: "$280",
image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Discover the luxury and opulence of Dubai.",
activities: [
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
        highlights: ["Luxury Shopping", "Modern Architecture", "Desert Adventures"],
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
id: "bangkok",
name: "Bangkok",
city: "Bangkok",
duration: "1 Week",
price: "$280",
image: "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Enjoy the beautiful beaches and temples of Bangkok.",
activities: [
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
        highlights: ["Temples & Palaces", "Street Food", "Floating Markets"],
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
id: "hanoi",
name: "Hanoi",
city: "Hanoi",
duration: "1 Week",
price: "$280",
image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Explore the stunning landscapes and rich culture of Hanoi.",
activities: [
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
        highlights: ["Historical Sites", "Street Food", "Cultural Heritage"],
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
id: "jakarta",
name: "Jakarta",
city: "Jakarta",
duration: "1 Week",
price: "$280",
image: "https://images.unsplash.com/photo-1593994603115-deaa40043bae?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Discover the islands of Bali and Jakarta.",
activities: [
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
        highlights: ["Island Adventures", "Cultural Diversity", "Natural Beauty"],
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
id: "manila",
name: "Manila",
city: "Manila",
duration: "1 Week",
price: "$280",
image: "https://images.unsplash.com/photo-1583685133115-90748ccbe274?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Enjoy the beautiful beaches of Boracay and Manila.",
activities: [
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
        highlights: ["Beach Paradise", "Island Hopping", "Cultural Heritage"],
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
id: "kuala-lumpur",
name: "Kuala Lumpur",
city: "Kuala Lumpur",
duration: "1 Week",
price: "$280",
image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1164&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
description: "Experience the mix of cultures in Kuala Lumpur.",
activities: [
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
        highlights: ["Cultural Fusion", "Modern City Life", "Natural Wonders"],
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

// Parallax scroll effect
useEffect(() => {
  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }
}, []);

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
    </Head>
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Subtle background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gray-50"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-gray-300 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-gray-300 rounded-full"></div>
          <div className="absolute bottom-32 left-1/3 w-20 h-20 border border-gray-300 rounded-full"></div>
        </div>
      </div>
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="mx-3 py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3 min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image 
              src="/img/JOS.png" 
              alt="JOS Overseas Logo" 
              width={200} 
              height={100} 
              className="flex-shrink-0"
            />              
          </motion.div>
          
          {/* Contact and Email Info */}
          <motion.div 
            className="flex items-center gap-4 text-sm md:text-base ml-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92V19a2 2 0 01-2 2A19.72 19.72 0 013 5a2 2 0 012-2h2.09a2 2 0 012 1.72c.13.81.36 1.6.68 2.35a2 2 0 01-.45 2.11l-.27.27a16 16 0 006.29 6.29l.27-.27a2 2 0 012.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0122 16.92z" />
              </svg>
              <span className="hidden sm:inline">+1 234 567 8901</span>
              <span className="sm:hidden">+1 234 567 8901</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6" />
              </svg>
              <span className="hidden sm:inline">hello@jos.com</span>
              <span className="sm:hidden">hello@jos.com</span>
            </div>
          </motion.div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Banner Section */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
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
                      transform: `translateY(${scrollY * 0.5}px)`,
                    }}
                  >
                                          {imageError[slide.image] ? (
                        <ImageFallback className="w-full h-full" />
                      ) : (
                        <Image
                          src={slide.image}
                          alt={`Travel banner ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          priority={index === 0}
                          onError={() => setImageError(prev => ({ ...prev, [slide.image]: true }))}
                        />
                      )}
                    <div className="absolute inset-0 bg-black/40" />
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>
          
          {/* Banner Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            {/* Text content removed */}
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
        <section className="relative py-20 px-4 bg-white" id="welcome-destinations">
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
                <span className="inline-block bg-blue-600 text-white font-extrabold text-3xl md:text-5xl px-10 py-4 rounded-full shadow-lg tracking-wide">
                  Welcome to Jalan Overseas
                </span>
              </motion.div>
              
              <motion.h2 
                className="text-3xl md:text-5xl font-bold mb-6 text-gray-800"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                viewport={{ once: true }}
              >
                Your Journey Begins Here
              </motion.h2>
              
                              <motion.p
                  className="text-xl md:text-2xl text-gray-600 font-light mb-12 max-w-4xl mx-auto leading-relaxed"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Experience the world like never before with our carefully curated travel packages. 
                  From bustling cities to serene landscapes, we bring you the best destinations across Asia.
                </motion.p>
              
              {/* Company Profile Video Section */}
              <motion.div 
                className="relative max-w-6xl mx-auto mb-16"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                viewport={{ once: true }}
              >
                {/* Video Container with Aesthetic Design */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-white/50 backdrop-blur-sm">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
                  <div className="absolute top-4 right-4 w-20 h-20 border border-blue-200/30 rounded-full opacity-60"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 border border-purple-200/30 rounded-full opacity-60"></div>
                  
                  {/* Video Player */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden rounded-t-3xl">
                    {/* Sample Video */}
                    {videoError ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium">Video unavailable</p>
                          <p className="text-gray-400 text-sm mt-2">Please check your internet connection</p>
                        </div>
                      </div>
                    ) : (
                      <video 
                        className="w-full h-full object-cover"
                        controls
                        poster="/img/JOS.png"
                        preload="metadata"
                        onPlay={() => setIsVideoPlaying(true)}
                        onPause={() => setIsVideoPlaying(false)}
                        onEnded={() => setIsVideoPlaying(false)}
                        onLoadedData={() => setIsVideoLoading(false)}
                        onLoadStart={() => setIsVideoLoading(true)}
                        onError={() => {
                          setIsVideoLoading(false);
                          setVideoError(true);
                        }}
                        onCanPlay={() => setIsVideoLoading(false)}
                      >
                        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                        <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
                        <p className="text-white text-center p-8">Your browser does not support the video tag.</p>
                      </video>
                    )}
                    
                    {/* Video Overlay with Play Button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    {/* Loading Indicator */}
                    <AnimatePresence>
                      {isVideoLoading && (
                        <motion.div 
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Custom Play Button (shown when video is paused) */}
                    <AnimatePresence>
                      {!isVideoPlaying && !isVideoLoading && (
                        <motion.div 
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-8 bg-white/80 backdrop-blur-sm">
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                      viewport={{ once: true }}
                    >
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Our Journey Begins Here
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                        Experience the passion and dedication behind Jalan Overseas. From our humble beginnings to becoming your trusted travel partner, 
                        discover how we&apos;ve been crafting unforgettable journeys across Asia for travelers worldwide. Watch our sample video to learn more about our services.
                      </p>
                      
                      {/* Video Stats */}
                      <div className="flex justify-center gap-8 mt-8">
                        <motion.div 
                          className="text-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.4, duration: 0.6 }}
                          viewport={{ once: true }}
                        >
                          <div className="text-3xl font-bold text-blue-600">500+</div>
                          <div className="text-gray-600">Happy Travelers</div>
                        </motion.div>
                        <motion.div 
                          className="text-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.6, duration: 0.6 }}
                          viewport={{ once: true }}
                        >
                          <div className="text-3xl font-bold text-purple-600">50+</div>
                          <div className="text-gray-600">Destinations</div>
                        </motion.div>
                        <motion.div 
                          className="text-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.8, duration: 0.6 }}
                          viewport={{ once: true }}
                        >
                          <div className="text-3xl font-bold text-pink-600">5+</div>
                          <div className="text-gray-600">Years Experience</div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Action Buttons Grid */}
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
                  icon: "📋",
                  title: "VISA",
                  description: "Check available visa requirements and application procedures.",
                  action: () => router.push('/visa'),
                  color: "from-blue-600 to-blue-700"
                },
                {
                  icon: "✈️",
                  title: "Book Flight",
                  description: "Find and book the best flights to your dream destinations.",
                  action: () => router.push('/flights'),
                  color: "from-green-600 to-green-700"
                },
                {
                  icon: "🏨",
                  title: "Hotels",
                  description: "Discover and reserve premium accommodations worldwide.",
                  action: () => router.push('/hotels'),
                  color: "from-purple-600 to-purple-700"
                }
              ].map((button, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-500 cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={button.action}
                >
                  <div className="text-6xl mb-6">{button.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{button.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">{button.description}</p>
                  <motion.button
                    className={`w-full bg-gradient-to-r ${button.color} text-white font-bold py-4 px-6 rounded-2xl shadow-lg text-lg transition-all duration-300 hover:shadow-xl`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View {button.title}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>

            {/* Destinations Title, Grid, etc. - add spacing above */}
            <motion.h2 
              className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-16 text-center mt-32"
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
                  className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col border border-gray-200 overflow-hidden"
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
                    <motion.div
                      className="relative w-full h-48 sm:h-80 md:h-[400px] overflow-hidden"
                      onClick={() => handleOpenGallery(option.gallery, 0)}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {imageError[option.image] ? (
                        <ImageFallback className="w-full h-full" />
                      ) : (
                        <Image
                          src={option.image}
                          alt={option.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          loading="lazy"
                          onError={() => setImageError(prev => ({ ...prev, [option.image]: true }))}
                        />
                      )}
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4 sm:p-8 flex flex-col flex-1 bg-white">
                    <h3 className="text-lg sm:text-2xl font-bold text-blue-600 mb-2 sm:mb-3">
                      {option.name}
                    </h3>
                    <p className="text-gray-600 mb-3 sm:mb-4 flex-1 text-sm sm:text-lg font-light">
                      {option.description}
                    </p>
                    {option.highlights && (
                      <ul className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                        {option.highlights.map((h, i) => (
                          <motion.li 
                            key={i} 
                            className="bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-blue-200"
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl flex-1 flex items-center justify-center gap-1 sm:gap-2 font-semibold shadow-lg text-sm sm:text-base md:text-lg transition-all min-w-0 whitespace-nowrap"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          router.push(`/country/${option.name.toLowerCase()}`);
                        }}
                        aria-label={`View details for ${option.name}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="shrink-0 flex items-center"><FaChevronRight /></span>
                        <span className="truncate text-xs sm:text-sm">Detail</span>
                      </motion.button>
                      <motion.button
                        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-3 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl flex-1 flex items-center justify-center gap-1 sm:gap-2 font-semibold shadow-lg text-sm sm:text-base md:text-lg transition-all bg-white min-w-0 whitespace-nowrap"
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
      {/* Simple Footer */}
     
      <AnimatePresence>
        {showItinerary && selectedDestination && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-black/20 via-[#1679b1]/10 to-[#f05b2d]/20 backdrop-blur-md flex items-center justify-center p-4 z-50"
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
                className="absolute top-4 right-4 text-[#1679b1] hover:text-[#f05b2d] text-3xl font-bold z-10 bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-white/30"
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
                {imageError[selectedDestination.image] ? (
                  <ImageFallback className="w-full h-full" />
                ) : (
                  <Image
                    src={selectedDestination.image}
                    alt={selectedDestination.name}
                    fill
                    className="object-cover object-center blur-sm scale-105"
                    sizes="100vw"
                    onError={() => setImageError(prev => ({ ...prev, [selectedDestination.image]: true }))}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1679b1]/80 via-[#1679b1]/40 to-transparent" />
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
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#1679b1]/20 to-[#f05b2d]/20 text-[#1679b1] shadow-lg border border-[#1679b1]/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                  </span>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Duration</div>
                    <div className="font-bold text-[#1679b1]">1 Week</div>
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
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-[#1679b1] to-[#f05b2d] bg-clip-text text-transparent mb-6">Enjoy the Adventure</h3>
                  <p className="text-gray-700 mb-8 text-lg font-light leading-relaxed">{selectedDestination.description}</p>
                  {selectedDestination.highlights && (
                    <ul className="flex flex-wrap gap-3 mb-8">
                      {selectedDestination.highlights.map((h, i) => (
                        <motion.li 
                          key={i} 
                          className="bg-gradient-to-r from-[#1679b1]/20 to-[#f05b2d]/20 text-[#1679b1] text-base font-medium px-5 py-3 rounded-full border border-[#1679b1]/30 backdrop-blur-sm shadow-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                        >
                          {h}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-[#1679b1] to-[#f05b2d] bg-clip-text text-transparent mb-6">Itinerary</h4>
                  <div className="space-y-6">
                    {selectedDestination.itineraries.map((itinerary, idx) => (
                      <motion.div 
                        key={itinerary.id} 
                        className="border border-white/30 rounded-2xl p-6 bg-white/50 backdrop-blur-sm shadow-lg"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.4 + idx * 0.2, duration: 0.6 }}
                      >
                        <h5 className="text-xl font-bold text-[#1679b1] mb-4">{itinerary.name}</h5>
                        <p className="text-gray-600 mb-4">{itinerary.description}</p>
                        <ul className="space-y-3 mb-4">
                          {itinerary.activities.map((activity, activityIdx) => (
                            <motion.li 
                              key={activityIdx} 
                              className="flex items-start text-gray-700"
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 1.6 + activityIdx * 0.1, duration: 0.4 }}
                            >
                              <svg className="h-5 w-5 text-[#1679b1] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              <span className="font-medium">{activity.activities[0]}</span>
                            </motion.li>
                          ))}
                        </ul>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">City</div>
                            <div className="font-bold text-[#1679b1]">{itinerary.city}</div>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">Duration</div>
                            <div className="font-bold text-[#1679b1]">{itinerary.duration}</div>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">Price</div>
                            <div className="font-bold text-[#1679b1]">{itinerary.price}</div>
                          </div>
                        </div>
                        {itinerary.highlights && (
                          <ul className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                            {itinerary.highlights.map((h, i) => (
                              <motion.li 
                                key={i} 
                                className="bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-blue-200"
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
                    <svg className="w-5 h-5 text-[#1679b1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" /></svg>
                    Starting from
                  </div>
                  <div className="mb-6">
                    <span className="inline-block bg-gradient-to-r from-[#1679b1] to-[#f05b2d] text-white font-extrabold text-4xl px-8 py-3 rounded-full shadow-xl tracking-wide">
                      $280
                    </span>
                  </div>
                  <motion.button
                    className="w-full bg-gradient-to-r from-[#1679b1] to-[#f05b2d] hover:from-[#1679b1]/90 hover:to-[#f05b2d]/90 text-white font-bold py-4 rounded-2xl shadow-xl text-xl transition-all mt-2 backdrop-blur-sm border border-white/20"
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
          className="fixed inset-0 z-[50] flex items-center justify-center bg-gradient-to-br from-black/30 via-[#1679b1]/20 to-[#f05b2d]/30 backdrop-blur-md"
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
              className="absolute top-4 right-4 text-[#1679b1] hover:text-[#f05b2d] text-3xl font-bold z-10 bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-white/30"
              onClick={() => setGalleryOpen(false)}
              aria-label="Close gallery"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              ×
            </motion.button>
            <div className="flex items-center justify-center w-full h-[500px] bg-gradient-to-br from-[#1679b1]/10 to-[#f05b2d]/10">
              <motion.div
                key={galleryImages[galleryIndex]}
                className="relative w-full max-h-[480px] h-[480px]"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {imageError[galleryImages[galleryIndex]] ? (
                  <ImageFallback className="w-full h-full rounded-2xl" />
                ) : (
                  <Image
                    src={galleryImages[galleryIndex]}
                    alt="Gallery image"
                    fill
                    className="object-contain rounded-2xl shadow-2xl"
                    sizes="(max-width: 768px) 100vw, 80vw"
                    onError={() => setImageError(prev => ({ ...prev, [galleryImages[galleryIndex]]: true }))}
                  />
                )}
              </motion.div>
            </div>
            <div className="flex justify-between items-center w-full px-8 py-6 bg-white/80 backdrop-blur-xl border-t border-white/30">
              <motion.button
                className="text-[#1679b1] hover:text-[#f05b2d] text-3xl font-bold px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-lg border border-white/30"
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
                        ? 'bg-gradient-to-r from-[#1679b1] to-[#f05b2d] border-[#1679b1] shadow-lg' 
                        : 'bg-white/60 border-[#1679b1]/30 hover:border-[#1679b1]'
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
                className="text-[#1679b1] hover:text-[#f05b2d] text-3xl font-bold px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-lg border border-white/30"
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
      
      {/* Simple Footer */}
      <footer className="w-full bg-gradient-to-br from-gray-900 to-blue-900 text-white py-8 relative z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Company Info */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Image 
                src="/img/JOS.png" 
                alt="Jalan Overseas Logo" 
                width={40} 
                height={40} 
                className="rounded-lg shadow-lg"
              />
              <div>
                <h3 className="text-xl font-bold text-white">Jalan Overseas</h3>
                <p className="text-blue-200 text-sm">Your Travel Expert</p>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 text-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                +1 234 567 8901
              </span>
              <span className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                hello@jos.com
              </span>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              className="flex space-x-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.a 
                href="#" 
                className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </motion.a>
              <motion.a 
                href="#" 
                className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </motion.a>
            </motion.div>
          </div>

          {/* Copyright */}
          <motion.div 
            className="mt-6 pt-4 border-t border-gray-700 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Jalan Overseas. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  </>
);
};

export default TravelApp;