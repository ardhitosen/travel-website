"use client"
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ItineraryDay {
  day: number;
  activities: string[];
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

const ItineraryPage = ({ params }: { params: { country: string; city: string } }) => {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [cityName, setCityName] = useState(params.city);
  const [countryName, setCountryName] = useState(params.country);

  // Sample data - in real app this would come from API or database
  const itineraryData: CountryItinerary = {
    id: cityName,
    name: cityName ? cityName.charAt(0).toUpperCase() + cityName.slice(1) : "Loading...",
    city: cityName ? cityName.charAt(0).toUpperCase() + cityName.slice(1) : "Loading...",
    duration: "1 Week",
    price: "$280",
    image: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: cityName ? `Experience the vibrant city life of ${cityName.charAt(0).toUpperCase() + cityName.slice(1)}.` : "Loading...",
    activities: [
      {
        day: 1,
        activities: [
          cityName ? `Arrive in ${cityName.charAt(0).toUpperCase() + cityName.slice(1)}` : "Arrive in city",
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

  const handleBookTrip = () => {
    const message = `Hello, I want to book a trip to ${itineraryData.city}.`;
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleBackToHome = () => {
    router.push('/');
  };

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
            
            {/* Back Button */}
            <motion.button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </motion.button>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Banner Section */}
          <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
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
                  src={itineraryData.image}
                  alt={`${itineraryData.city} banner`}
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
                  {itineraryData.city}
                </motion.h1>
                
                <motion.p
                  className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto leading-relaxed text-white drop-shadow-lg"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  {itineraryData.description}
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Itinerary Details Section */}
          <section className="relative py-20 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
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
                  Your {itineraryData.city} Adventure
                </motion.h2>
                
                <motion.p
                  className="text-xl md:text-2xl text-gray-600 font-light mb-12 max-w-4xl mx-auto leading-relaxed"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Discover the best of {itineraryData.city} with our carefully curated itinerary.
                </motion.p>
              </motion.div>

              {/* Itinerary Info Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
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
                    icon: "🏙️",
                    title: "City",
                    value: itineraryData.city
                  },
                  {
                    icon: "⏱️",
                    title: "Duration",
                    value: itineraryData.duration
                  },
                  {
                    icon: "💰",
                    title: "Price",
                    value: itineraryData.price
                  }
                ].map((info, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-500"
                    variants={{
                      hidden: { opacity: 0, y: 50 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ y: -10, scale: 1.02 }}
                  >
                    <div className="text-6xl mb-6">{info.icon}</div>
                    <h3 className="text-2xl font-bold text-blue-600 mb-4">{info.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{info.value}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Daily Itinerary */}
              <motion.div
                className="space-y-8"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">Daily Itinerary</h3>
                
                {itineraryData.activities.map((day, idx) => (
                  <motion.div 
                    key={day.day} 
                    className="border border-gray-200 rounded-3xl p-8 bg-white shadow-lg"
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + idx * 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <h4 className="text-2xl font-bold text-blue-600 mb-6">Day {day.day}</h4>
                    <ul className="space-y-4">
                      {day.activities.map((activity, activityIdx) => (
                        <motion.li 
                          key={activityIdx} 
                          className="flex items-start text-gray-700"
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ delay: 1.0 + idx * 0.2 + activityIdx * 0.1, duration: 0.4 }}
                          viewport={{ once: true }}
                        >
                          <svg className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">{activity}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </motion.div>

              {/* Highlights */}
              {itineraryData.highlights && (
                <motion.div
                  className="mt-16"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-bold text-gray-800 text-center mb-8">Highlights</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {itineraryData.highlights.map((highlight, i) => (
                      <motion.div 
                        key={i} 
                        className="bg-blue-50 text-blue-600 text-lg font-medium px-6 py-3 rounded-full border border-blue-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4 + i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        {highlight}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Booking Card */}
              <motion.div 
                className="w-full bg-gradient-to-br from-white/80 to-blue-50/80 rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-white/30 backdrop-blur-xl mt-16"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="text-sm text-gray-500 mb-3 flex items-center gap-2 font-medium">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" />
                  </svg>
                  Starting from
                </div>
                <div className="mb-6">
                  <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-4xl px-8 py-3 rounded-full shadow-xl tracking-wide">
                    {itineraryData.price}
                  </span>
                </div>
                <motion.button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-xl text-xl transition-all mt-2 backdrop-blur-sm border border-white/20"
                  onClick={handleBookTrip}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  Book Now
                </motion.button>
              </motion.div>
            </div>
          </section>
        </main>

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

export default ItineraryPage; 