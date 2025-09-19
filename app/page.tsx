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
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
const [galleryOpen, setGalleryOpen] = useState(false);
const [galleryImages, setGalleryImages] = useState<string[]>([]);
const [galleryIndex, setGalleryIndex] = useState(0);
const [scrollY, setScrollY] = useState(0);
const [isVideoPlaying, setIsVideoPlaying] = useState(false);
const [isVideoLoading, setIsVideoLoading] = useState(true);
const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
const [videoError, setVideoError] = useState(false);
const router = useRouter();
  const [fetchedBanners, setFetchedBanners] = useState<any[] | null>(null);
  const [fetchedDestinations, setFetchedDestinations] = useState<any[] | null>(null);

  // Derived data from backend
  const bannerSlides = (fetchedBanners || []).map((s: any) => ({ image: s.imageUrl, fact: s.fact, destination: s.destination }));
  const destinations = fetchedDestinations || [];

  useEffect(() => {
    const load = async () => {
      try {
        const [b, d] = await Promise.all([
          fetch('/api/banners').then(r => r.ok ? r.json() : []),
          fetch('/api/destinations').then(r => r.ok ? r.json() : [])
        ]);
        if (Array.isArray(b)) setFetchedBanners(b);
        if (Array.isArray(d)) setFetchedDestinations(d);
      } catch (e) {}
    };
    load();
  }, []);

useEffect(() => {
    if (!bannerSlides.length) return;
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

  const handleBookTrip = (destination: any) => {
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
      
        {/* Header is global */}
      <main className="flex-1">
        {/* Hero Banner Section */}
        <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <AnimatePresence initial={false}>
                {bannerSlides.length > 0 && bannerSlides.map((slide, index) =>
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
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs sm:text-sm font-medium">Scroll to explore</span>
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

          {/* Welcome Title */}
        <section className="relative px-4 bg-white py-6 sm:py-8 mt-2 sm:mt-4">
          <div className="w-full">
            <motion.div 
              className="text-center mb-2 px-5"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block bg-blue-600 text-white font-extrabold text-2xl sm:text-4xl md:text-5xl px-6 sm:px-10 py-3 sm:py-6 md:py-8 rounded-full shadow-lg tracking-wide">
                Welcome to Jalan Overseas
              </span>
            </motion.div>
          </div>
        </section>

        {/* Welcome Section */}
        <section className="relative min-h-[100svh] px-4 bg-white flex items-center pt-6 md:pt-0" id="welcome-destinations">
          <div className="w-full">
            <motion.div
              className="text-center mb-16"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                viewport={{ once: true }}
              >
                Experience the world like never before with our carefully curated travel packages. 
                From bustling cities to serene landscapes, we bring you the best destinations across Asia.
              </motion.p>
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
           </div>
         </section>

          {/* Destinations */}
         <section className="relative py-20 px-4 bg-white">
           <div className="w-full">
             <motion.h2 
               className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-12 sm:mb-16 text-center mt-16 sm:mt-32"
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
                {destinations.map((option: any, idx: number) => {
                  const highlights: string[] = Array.isArray(option.highlights)
                    ? option.highlights
                    : (option.highlights?.values || []);
                  const galleryUrls: string[] = (option.gallery || []).map((g: any) => g.imageUrl);
                  return (
                 <motion.div
                   key={option.id}
                   className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col border border-gray-200 overflow-hidden"
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
                          onClick={() => handleOpenGallery(galleryUrls, 0)}
                       whileHover={{ scale: 1.1 }}
                       transition={{ duration: 0.6 }}
                     >
                          {imageError[option.imageUrl] ? (
                         <ImageFallback className="w-full h-full" />
                       ) : (
                         <Image
                              src={option.imageUrl}
                           alt={option.name}
                           fill
                           className="object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
                           sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                           loading="lazy"
                              onError={() => setImageError(prev => ({ ...prev, [option.imageUrl]: true }))}
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
                        {highlights && highlights.length > 0 && (
                       <ul className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                            {highlights.map((h, i) => (
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
                  );
                })}
             </motion.div>
           </div>
         </section>
      </main>
     
        {/* Itinerary Modal */}
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
                  {imageError[selectedDestination.imageUrl] ? (
                  <ImageFallback className="w-full h-full" />
                ) : (
                  <Image
                      src={selectedDestination.imageUrl}
                    alt={selectedDestination.name}
                    fill
                    className="object-cover object-center blur-sm scale-105"
                    sizes="100vw"
                      onError={() => setImageError(prev => ({ ...prev, [selectedDestination.imageUrl]: true }))}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1679b1]/80 via-[#1679b1]/40 to-transparent" />
                  <div className="absolute inset-0 flex items:end md:items-center md:justify-center px-6 md:px-0 pb-6 md:pb-0">
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
                        <span className="text-lg font-medium">{selectedDestination.name}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
                {/* Info & Content */}
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
                        {(Array.isArray(selectedDestination.highlights) ? selectedDestination.highlights : (selectedDestination.highlights?.values || [])).map((h: string, i: number) => (
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
                      {(selectedDestination.itineraries || []).map((itinerary: any, idx: number) => (
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
                            {(itinerary.days || []).map((day: any, activityIdx: number) => (
                            <motion.li 
                              key={activityIdx} 
                              className="flex items-start text-gray-700"
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 1.6 + activityIdx * 0.1, duration: 0.4 }}
                            >
                              <svg className="h-5 w-5 text-[#1679b1] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span className="font-medium">{(Array.isArray(day.activities) ? day.activities : (day.activities?.values || []))[0]}</span>
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
                              {(Array.isArray(itinerary.highlights) ? itinerary.highlights : (itinerary.highlights?.values || [])).map((h: string, i: number) => (
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
                        {selectedDestination.itineraries?.[0]?.price || "$0"}
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

        {/* Gallery Lightbox */}
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
            <div className="flex items-center justify-center w-full h-[60vh] sm:h-[500px] bg-gradient-to-br from-[#1679b1]/10 to-[#f05b2d]/10">
              <motion.div
                key={galleryImages[galleryIndex]}
                className="relative w-full h-full max-h-[480px]"
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
      
        {/* Footer */}
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