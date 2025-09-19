"use client"
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp, FaChevronRight, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

interface CountryClientProps {
  params: { country: string };
}

const CountryClient = ({ params }: CountryClientProps) => {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const countryName = params.country;

  // Sample data - in real app this would come from API or database
  const countryData = {
    name: countryName ? countryName.charAt(0).toUpperCase() + countryName.slice(1) : "Loading...",
    description: countryName ? `Discover the amazing destinations in ${countryName.charAt(0).toUpperCase() + countryName.slice(1)}.` : "Loading...",
    image: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    itineraries: [
      {
        id: "city1",
        name: "City 1",
        city: "City 1",
        duration: "1 Week",
        price: "$280",
        image: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Experience the vibrant city life.",
        activities: [
          {
            day: 1,
            activities: [
              "Arrive in City",
              "Visit local attractions",
              "Explore the city center",
              "Dinner at local restaurant",
            ],
          },
          {
            day: 2,
            activities: [
              "Visit famous landmarks",
              "Lunch at popular spots",
              "Shopping and sightseeing",
              "Dinner with local cuisine",
            ],
          },
        ],
        highlights: ["Local Culture", "Modern City Life", "Street Food"],
      },
      {
        id: "city2",
        name: "City 2",
        city: "City 2",
        duration: "1 Week",
        price: "$320",
        image: "https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Discover the rich history and culture.",
        activities: [
          {
            day: 1,
            activities: [
              "Arrive in City 2",
              "Visit historical sites",
              "Cultural experience",
              "Traditional dinner",
            ],
          },
          {
            day: 2,
            activities: [
              "Explore museums",
              "Local market visit",
              "Cultural workshop",
              "Authentic cuisine",
            ],
          },
        ],
        highlights: ["Historical Sites", "Cultural Experience", "Traditional Food"],
      },
      {
        id: "city3",
        name: "City 3",
        city: "City 3",
        duration: "1 Week",
        price: "$350",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Enjoy the beautiful landscapes and nature.",
        activities: [
          {
            day: 1,
            activities: [
              "Arrive in City 3",
              "Nature exploration",
              "Scenic views",
              "Outdoor activities",
            ],
          },
          {
            day: 2,
            activities: [
              "Hiking adventure",
              "Wildlife watching",
              "Nature photography",
              "Camping experience",
            ],
          },
        ],
        highlights: ["Natural Beauty", "Adventure", "Wildlife"],
      },
    ] as CountryItinerary[],
  };

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

  const handleBookTrip = (itinerary: CountryItinerary) => {
    const message = `Hello, I want to book a trip to ${itinerary.city} in ${countryData.name}.`;
  const whatsappUrl = `https://wa.me/6281553548899?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleBackToHome = () => {
    router.push('/');
  };


  const handleViewItinerary = (itinerary: CountryItinerary) => {
    router.push(`/itinerary/${countryName}/${itinerary.id}`);
  };

  return (
    <>
  <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
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

        <main className="flex-1">
          {/* Hero Banner Section */}
          <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
            {/* Back button - uses FaArrowLeft and handleBackToHome to satisfy linters */}
            <button
              aria-label="Back to home"
              onClick={handleBackToHome}
              className="absolute top-6 left-6 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md"
            >
              <FaArrowLeft />
            </button>
            <div className="absolute inset-0">
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{
                  transform: `translateY(${scrollY * 0.5}px)`,
                }}
              >
                <Image
                  src={countryData.image}
                  alt={`${countryData.name} banner`}
                  width={1200}
                  height={800}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
              </motion.div>
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
                  className="text-4xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl leading-tight"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                >
                  {countryData.name}
                </motion.h1>
                
                <motion.p
                  className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto leading-relaxed text-white drop-shadow-lg"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  {countryData.description}
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Itineraries Section */}
          <section className="relative py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <motion.h2 
                  className="text-3xl md:text-5xl font-bold mb-6 text-gray-800"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Available Itineraries
                </motion.h2>
                
                <motion.p
                  className="text-xl md:text-2xl text-gray-600 font-light mb-12 max-w-4xl mx-auto leading-relaxed"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Choose from our carefully curated itineraries to explore the best of {countryData.name}.
                </motion.p>
              </motion.div>

              {/* Itineraries Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                {countryData.itineraries.map((itinerary) => (
                  <motion.div
                    key={itinerary.id}
                    className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col border border-gray-200 overflow-hidden"
                    variants={{
                      hidden: { opacity: 0, y: 50, scale: 0.9 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -8,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                  >
                    <div className="relative overflow-hidden">
                      <motion.div
                        className="w-full h-48 sm:h-80 md:h-[400px] overflow-hidden"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Image
                          src={itinerary.image}
                          alt={itinerary.name}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-4 sm:p-8 flex flex-col flex-1 bg-white">
                      <h3 className="text-lg sm:text-2xl font-bold text-blue-600 mb-2 sm:mb-3">
                        {itinerary.name}
                      </h3>
                      <p className="text-gray-600 mb-3 sm:mb-4 flex-1 text-sm sm:text-lg font-light">
                        {itinerary.description}
                      </p>
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
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-auto flex-nowrap w-full">
                        <motion.button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl flex-1 flex items-center justify-center gap-1 sm:gap-2 font-semibold shadow-lg text-sm sm:text-base md:text-lg transition-all min-w-0 whitespace-nowrap"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleViewItinerary(itinerary);
                          }}
                          aria-label={`View itinerary for ${itinerary.name}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="shrink-0 flex items-center"><FaChevronRight /></span>
                          <span className="truncate text-xs sm:text-sm">View</span>
                        </motion.button>
                        <motion.button
                          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-3 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl flex-1 flex items-center justify-center gap-1 sm:gap-2 font-semibold shadow-lg text-sm sm:text-base md:text-lg transition-all bg-white min-w-0 whitespace-nowrap"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleBookTrip(itinerary);
                          }}
                          aria-label={`Book trip to ${itinerary.name}`}
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
      </div>
    </>
  );
};

export default CountryClient; 