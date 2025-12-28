"use client"
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaChevronRight } from "react-icons/fa";
// removed Head since we rely on global fonts
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
  days: ItineraryDay[]; // API shape uses `days` containing activities
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

const [showItinerary, setShowItinerary] = useState(false);
  const [selectedDestination] = useState<TravelOption | null>(null);
const [galleryOpen, setGalleryOpen] = useState(false);
const [galleryImages, setGalleryImages] = useState<string[]>([]);
const [galleryIndex, setGalleryIndex] = useState(0);
const [scrollY] = useState(0);
const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fetchedBanners, setFetchedBanners] = useState<Record<string, unknown>[] | null>(null);
  const [fetchedDestinations, setFetchedDestinations] = useState<TravelOption[] | null>(null);
  const [fetchedPromotions, setFetchedPromotions] = useState<Record<string, unknown>[] | null>(null);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [selectedPromoImage, setSelectedPromoImage] = useState<string>("");

  // Derived data from backend
  const bannerSlides = (fetchedBanners || []).map((s) => {
    const src = s as Record<string, unknown>;
    const image = typeof src["imageUrl"] === "string" ? (src["imageUrl"] as string) : "";
    const fact = typeof src["fact"] === "string" ? (src["fact"] as string) : "";
    const destination = typeof src["destination"] === "string" ? (src["destination"] as string) : "";
    return { image, fact, destination };
  });
  const destinations: TravelOption[] = (fetchedDestinations || []).map((d: unknown) => {
    const obj = d as Record<string, unknown>;
    return {
      ...(obj as object),
      image: typeof obj.image === 'string' ? obj.image : (typeof obj.imageUrl === 'string' ? obj.imageUrl : '')
    } as TravelOption;
  });

  // Build promo items from the Promotion table (via /api/promotions), limit to 2.
  // Fall back to static promos if none available.
  const promoItems = (fetchedPromotions && fetchedPromotions.length)
    ? fetchedPromotions.slice(0, 2).map((p, i) => {
        const img = (p.imageUrl || p.image || '') as string;
        const title = (p.title && String(p.title).length) ? String(p.title) : (p.fact && String(p.fact).length ? String(p.fact) : (p.destination || `Promotion ${i + 1}`));
        const description = (p.description || p.destination || '') as string;
        return { id: p.id ?? `cms-${i}`, image: img, title, description, destination: p.destination || undefined };
      })
    : [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1000&auto=format&fit=crop",
        title: "Summer Escape",
        description: "Up to 30% off on summer destinations"
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop",
        title: "Family Packages",
        description: "Special rates for family vacations"
      }
    ];

  // helper to normalize legacy/list objects that may have `.values` or be arrays
  const normalizeToArray = (val: unknown): string[] => {
    if (Array.isArray(val)) return val as string[];
    if (val && typeof val === 'object') {
      const v = val as { values?: unknown };
      if (Array.isArray(v.values)) return v.values as string[];
    }
    return [];
  };

  useEffect(() => {
    const load = async () => {
      try {
          const [b, d, p] = await Promise.all([
            fetch('/api/banners').then(r => r.ok ? r.json() : []),
            fetch('/api/destinations').then(r => r.ok ? r.json() : []),
            fetch('/api/promotions').then(r => r.ok ? r.json() : [])
          ]);
        if (Array.isArray(b)) setFetchedBanners(b);
        if (Array.isArray(d)) setFetchedDestinations(d);
        // promotions should come from the Promotion table via the promotions API
        if (Array.isArray(p)) setFetchedPromotions(p);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

    useEffect(() => {
      if (!bannerSlides.length) return;
      const t = setInterval(() => {
        setCurrentSlide((s) => (s + 1) % bannerSlides.length);
      }, 6000);
      return () => clearInterval(t);
    }, [bannerSlides.length]);

  const handleBookTrip = (destination: { name?: string }) => {
    const message = `Hello, I want to book a trip to ${destination.name || 'your selection'}.`;
const whatsappUrl = `https://wa.me/6281553548899?text=${encodeURIComponent(message)}`;
window.open(whatsappUrl, "_blank");
};

const handleOpenGallery = (images: string[], index: number = 0) => {
setGalleryImages(images);
setGalleryIndex(index);
setGalleryOpen(true);
};

const handleOpenPromoModal = (image: string) => {
setSelectedPromoImage(image);
setPromoModalOpen(true);
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
                      <img
                        src={slide.image}
                        alt={`Travel banner ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading={index === 0 ? 'eager' : 'lazy'}
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
  <section className="relative px-2 bg-white py-3 sm:py-2 mt-1 sm:mt-2">
          <div className="w-full">
            <motion.div 
              className="text-center mb-1 px-3"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block font-extrabold text-4xl py-5 sm:text-5xl md:text-6xl lg:text-7xl px-4 sm:px-6 tracking-wide">
                <span className="block md:inline text-[#e0663e]">Welcome To</span>
                <span className="block md:inline md:ml-6 text-[#3b76ad]">Jalan Overseas</span>
              </span>
            </motion.div>
          </div>
        </section>

        {/* Welcome Section */}
        <section className="relative min-h-[70svh] px-4 bg-white flex items-center pt-6 md:pt-0" id="welcome-destinations">
          <div className="w-full">
            <motion.div
              className="text-center mb-16"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
        <motion.p
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-600 font-light mb-2 max-w-5xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                viewport={{ once: true }}
              >
               Eyes to see the World<br/>Your Trusted Partner for Overseas Travel
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
                   title: "Visa",
                   description: "Check available visa requirements and applications.",
                  action: () => router.push('/visa'),
                  icon: null,
                   color: "from-[#3b76ad] to-blue-500"
                 },
                 {
                   title: "Hotels",
                   description: "Discover and reserve premium accommodations worldwide.",
                  // Open WhatsApp for hotels inquiries
                  action: () => handleBookTrip({ name: 'Hotels' }),
                  icon: null,
                   color: "from-purple-600 to-purple-700"
                 },
                 {
                   title: "Custom Order",
                   description: "Request a tailored itinerary — we design a package just for you.",
                  // Open WhatsApp for custom order requests
                  action: () => handleBookTrip({ name: 'Custom Order' }),
                  icon: null,
                   color: "from-yellow-500 to-orange-500"
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
                   <h3 className="text-3xl font-bold text-gray-800 mb-4">{button.title}</h3>
                   <p className="text-gray-600 text-xl leading-relaxed mb-6">{button.description}</p>
                   <motion.button
                     className={`w-full bg-gradient-to-r ${button.color} text-white font-bold py-4 px-6 rounded-2xl shadow-lg text-xl transition-all duration-300 hover:shadow-xl`}
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
         <section className="relative py-14 px-4 bg-white">
           <div className="w-full">
             {/* Promotional Images Section */}
             <motion.div
               className="mb-8 sm:mb-10"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
             >
               <motion.h3
                 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-4 sm:mb-6 text-center"
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.6, delay: 0.2 }}
                 viewport={{ once: true }}
               >
                 Special Promotions
               </motion.h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl py-3 mx-auto">
                 {promoItems.map((promo, idx) => (
                   <motion.div
                     key={promo.id}
                     className="group relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer"
                     whileHover={{ scale: 1.02, y: -5 }}
                     initial={{ opacity: 0, y: 50 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: idx * 0.2 }}
                     viewport={{ once: true }}
                      onClick={() => {
                        const promoObj = promo as Record<string, unknown>;
                        if (promoObj.destination && typeof promoObj.destination === 'string') {
                          // promotion.destination should be a slug when coming from CMS; encode and navigate
                          router.push(`/country/${encodeURIComponent(String(promoObj.destination).toLowerCase())}`);
                        } else {
                          handleOpenPromoModal(promo.image);
                        }
                      }}
                   >
                     <div className="relative h-48 sm:h-64 overflow-hidden">
                       {imageError[promo.image] ? (
                         <ImageFallback className="w-full h-full" />
                       ) : (
                         <img
                           src={promo.image}
                           alt={promo.title}
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                           loading="lazy"
                           onError={() => setImageError(prev => ({ ...prev, [promo.image]: true }))}
                         />
                       )}
                       {/* Stronger permanent gradient to guarantee contrast for white text */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-100 transition-opacity duration-300" />
                       <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                         {/* semi-opaque blurred background to improve contrast on busy images */}
                         <div className="bg-black/40 backdrop-blur-sm rounded-md px-3 py-2">
                           <h4 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-white" style={{ textShadow: '0 6px 18px rgba(0,0,0,0.6)' }}>{promo.title}</h4>
                           <p className="text-base sm:text-lg md:text-xl opacity-90 text-white" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.45)' }}>{promo.description}</p>
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </motion.div>

             <motion.h2 
               className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-8 sm:mb-12 text-center"
               initial={{ y: 30, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
             >
               Popular Destinations
             </motion.h2>
             <motion.div
               className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-4"
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
            {destinations.map((option, idx: number) => {
              const highlights: string[] = normalizeToArray(option.highlights || []);
              const galleryUrls: string[] = Array.isArray(option.gallery) ? option.gallery : [];
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
                       className="relative w-full h-44 sm:h-48 md:h-40 lg:h-44 overflow-hidden"
                          onClick={() => handleOpenGallery(galleryUrls, 0)}
                       whileHover={{ scale: 1.1 }}
                       transition={{ duration: 0.6 }}
                     >
                          {imageError[option.image] ? (
                         <ImageFallback className="w-full h-full" />
                       ) : (
                         <img
                              src={option.image}
                           alt={option.name}
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
                           loading="lazy"
                              onError={() => setImageError(prev => ({ ...prev, [option.image]: true }))}
                         />
                       )}
                     </motion.div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                   </div>
                   <div className="p-2 sm:p-4 flex flex-col flex-1 bg-white">
                     <h3 className="text-sm sm:text-base md:text-base font-extrabold mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1679b1] to-[#f05b2d] tracking-tight">
                       {option.name}
                     </h3>
                     <p className="text-gray-600 mb-2 sm:mb-3 flex-1 text-xs sm:text-sm md:text-sm font-normal">
                       {option.description}
                     </p>
                        {highlights && highlights.length > 0 && (
                       // show up to 4 tags and a "+N more" indicator when there are extras
                       (() => {
                         const displayed = highlights.slice(0, 4);
                         const extra = Math.max(0, highlights.length - displayed.length);
                         return (
                           <ul className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 items-center">
                             {displayed.map((h, i) => (
                               <motion.li
                                 key={i}
                                 className="bg-blue-50 text-[#3b76ad] text-[11px] sm:text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-blue-200"
                                 initial={{ opacity: 0, scale: 0.8 }}
                                 whileInView={{ opacity: 1, scale: 1 }}
                                 transition={{ delay: 0.15 + i * 0.08 }}
                                 viewport={{ once: true }}
                               >
                                 {h}
                               </motion.li>
                             ))}
                             {extra > 0 && (
                               <li className="bg-gray-100 text-gray-600 text-[11px] sm:text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-gray-200">
                                 +{extra} more
                               </li>
                             )}
                           </ul>
                         );
                       })()
                     )}
                     <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-auto flex-nowrap w-full">
                       <motion.button
                         className="bg-[#3b76ad] hover:bg-blue-700 text-white px-2 sm:px-3 md:px-4 py-2 sm:py-2 rounded-lg sm:rounded-xl flex-1 flex items-center justify-center gap-1 sm:gap-2 font-semibold shadow-lg text-xs sm:text-sm md:text-sm transition-all min-w-0 whitespace-nowrap"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            // prefer slug property when provided by API, otherwise fallback to name
                            const destSlug = (option as any).slug || option.name;
                            router.push(`/country/${encodeURIComponent(String(destSlug).toLowerCase())}`);
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
                         className="border-2 border-[#3b76ad] text-[#3b76ad] hover:bg-blue-50 px-2 sm:px-3 md:px-4 py-2 sm:py-2 rounded-lg sm:rounded-xl flex-1 flex items-center justify-center gap-1 sm:gap-2 font-semibold shadow-lg text-xs sm:text-sm md:text-sm transition-all bg-white min-w-0 whitespace-nowrap"
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
                  {imageError[selectedDestination.image] ? (
                    <ImageFallback className="w-full h-full" />
                  ) : (
                    <img
                        src={selectedDestination.image}
                      alt={selectedDestination.name}
                      className="w-full h-full object-cover object-center blur-sm scale-105"
                        onError={() => setImageError(prev => ({ ...prev, [selectedDestination.image]: true }))}
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
                        {normalizeToArray(selectedDestination.highlights || []).map((h: string, i: number) => (
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
                      {(selectedDestination.itineraries || []).map((itinerary: CountryItinerary, idx: number) => (
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
                            {(itinerary.days || []).map((day: ItineraryDay, activityIdx: number) => {
                              const activities: string[] = Array.isArray(day.activities) ? day.activities : normalizeToArray(day.activities as unknown);
                              return (
                                <motion.li 
                                  key={activityIdx} 
                                  className="flex items-start text-gray-700"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 1.6 + activityIdx * 0.1, duration: 0.4 }}
                                >
                                  <svg className="h-5 w-5 text-[#1679b1] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  <span className="font-medium">{activities[0] || ''}</span>
                                </motion.li>
                              );
                            })}
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
                              {normalizeToArray(itinerary.highlights || []).map((h: string, i: number) => (
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
                  <img
                    src={galleryImages[galleryIndex]}
                    alt="Gallery image"
                    className="w-full h-full object-contain rounded-2xl shadow-2xl"
                    loading="lazy"
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

      {/* Promo Modal */}
      {promoModalOpen && (
        <motion.div
          className="fixed inset-0 z-[50] flex items-center justify-center bg-gradient-to-br from-black/30 via-[#1679b1]/20 to-[#f05b2d]/30 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPromoModalOpen(false)}
        >
          <motion.div
            className="relative max-w-5xl w-full mx-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center border-2 border-white/30"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <motion.button
              className="absolute top-4 right-4 text-[#1679b1] hover:text-[#f05b2d] text-3xl font-bold z-10 bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-white/30"
              onClick={() => setPromoModalOpen(false)}
              aria-label="Close promo modal"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              ×
            </motion.button>
            <div className="flex items-center justify-center w-full h-[70vh] sm:h-[600px] bg-gradient-to-br from-[#1679b1]/10 to-[#f05b2d]/10">
              <motion.div
                key={selectedPromoImage}
                className="relative w-full h-full max-h-[580px]"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {imageError[selectedPromoImage] ? (
                  <ImageFallback className="w-full h-full rounded-2xl" />
                ) : (
                  <img
                    src={selectedPromoImage}
                    alt="Promotion image"
                    className="w-full h-full object-contain rounded-2xl shadow-2xl"
                    loading="lazy"
                    onError={() => setImageError(prev => ({ ...prev, [selectedPromoImage]: true }))}
                  />
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  </>
);
};
export default TravelApp;