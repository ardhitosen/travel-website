"use client"
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp, FaChevronRight, FaArrowLeft } from "react-icons/fa";
// using native <img> to avoid Next image optimizer for same-origin uploads
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

  const [countryData, setCountryData] = useState<{
    name: string;
    description?: string;
    image?: string;
    itineraries: CountryItinerary[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      if (!countryName) { setLoading(false); return; }
      const tryFetch = async (param: string) => {
        try {
          const res = await fetch(`/api/destinations/${encodeURIComponent(param)}`);
          if (!res.ok) return null;
          const d = await res.json();
          return d;
        } catch {
          return null;
        }
      };

      // Try raw param, then a few fallbacks (capitalized, hyphen -> space, title-case)
      let dest = await tryFetch(countryName);
      if (!dest) {
        const cap = countryName.charAt(0).toUpperCase() + countryName.slice(1);
        dest = await tryFetch(cap);
      }

      if (!dest) {
        // replace hyphens with spaces (e.g. `south-korea` -> `south korea`)
        const spaced = countryName.replace(/-/g, ' ');
        if (spaced !== countryName) {
          dest = await tryFetch(spaced);
        }
      }

      if (!dest) {
        // Title-case each word (e.g. `south korea` -> `South Korea`)
        const spaced = countryName.replace(/-/g, ' ');
        const title = spaced.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (title && title !== countryName) {
          dest = await tryFetch(title);
        }
      }

      if (!dest) {
        setError('Destination not found');
        setCountryData(null);
        setLoading(false);
        return;
      }
  // debug: log fetched destination shape (helps diagnose empty itineraries)
  console.debug('Fetched destination:', dest);
  // helpful quick debug: how many itineraries were returned
  console.debug('Itineraries count:', Array.isArray(dest?.itineraries) ? dest.itineraries.length : (dest && dest.itineraries ? 1 : 0));

  // Ensure we treat itineraries as an array even if the API returned a single object
  const rawItineraries = Array.isArray(dest.itineraries) ? dest.itineraries : (dest.itineraries ? [dest.itineraries] : []);

      // Normalize itineraries shape to CountryItinerary[] expected by UI
  const its = (rawItineraries || []).map((it: unknown) => {
        const item = it as Record<string, unknown>;
        const days = Array.isArray(item.days) ? (item.days as unknown[]).map((d: unknown) => {
          const dd = d as Record<string, unknown>;
          return { day: Number(dd.dayNumber ?? dd.day ?? 0), activities: Array.isArray(dd.activities) ? (dd.activities as unknown[]).map(String) : [] };
        }) : [];
        const highlights = item.highlights && Array.isArray(item.highlights) ? (item.highlights as unknown[]).map(String) : (typeof item.highlights === 'string' ? String(item.highlights).split(',').map((s:string)=>s.trim()).filter(Boolean) : []);
        const duration = (item.duration as string) ? (item.duration as string) : (Array.isArray(item.days) && (item.days as unknown[]).length ? `${(item.days as unknown[]).length} days` : '');
        const price = (item.price as string) || '$0';
        return {
          id: (item.slug as string) || String(item.id),
          name: (item.name as string) || (item.title as string) || (item.slug as string) || String(item.id),
          city: (item.city as string) || (item.name as string) || (item.slug as string) || String(item.id),
          duration,
          price,
          image: (item.imageUrl as string) || (item.image as string) || '',
          description: (item.description as string) || (item.title as string) || '',
          activities: days,
          highlights,
          slug: (item.slug as string) || undefined,
        } as CountryItinerary;
      });

      setCountryData({ name: dest.name || countryName, description: dest.description || '', image: dest.imageUrl || '', itineraries: its });
      setLoading(false);
    };
    load();
  }, [countryName]);

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
    const destName = countryData?.name || countryName;
    const message = `Hello, I want to book a trip to ${itinerary.city} in ${destName}.`;
    const whatsappUrl = `https://wa.me/6281553548899?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleBackToHome = () => {
    router.push('/');
  };


  const handleViewItinerary = (itinerary: CountryItinerary) => {
    const idOrSlug = ((itinerary as unknown) as Record<string, unknown>).slug || itinerary.id;
    router.push(`/itinerary/${countryName}/${encodeURIComponent(String(idOrSlug))}`);
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
                {/* Safe banner values */}
                <img
                  src={countryData?.image || '/file.svg'}
                  alt={`${countryData?.name || countryName} banner`}
                  className="w-full h-full object-cover"
                  loading="eager"
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
                  {countryData?.name || countryName}
                </motion.h1>
                
                <motion.p
                  className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto leading-relaxed text-white drop-shadow-lg"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  {countryData?.description || ''}
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Dev debug: show fetched countryData JSON when not in production */}
          {process.env.NODE_ENV !== 'production' && countryData && (
            <div className="max-w-6xl mx-auto px-4 mb-6">
              <details className="bg-gray-100 p-4 rounded">
                <summary className="cursor-pointer text-sm text-gray-700">Debug: countryData (click to expand)</summary>
                <pre className="text-xs text-gray-700 overflow-auto mt-2">{JSON.stringify(countryData, null, 2)}</pre>
              </details>
            </div>
          )}

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
                  Choose from our carefully curated itineraries to explore the best of {countryData?.name || countryName}.
                </motion.p>
              </motion.div>

              {/* No itineraries message */}
              {(!loading && (!countryData || !countryData.itineraries || countryData.itineraries.length === 0)) && (
                <div className="text-center text-gray-500 mt-8">No itineraries available for {countryData?.name || countryName}.</div>
              )}

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
                {(countryData?.itineraries || []).map((itinerary) => (
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
                          <img
                          src={itinerary.image || '/file.svg'}
                          alt={itinerary.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-4 sm:p-8 flex flex-col flex-1 bg-white">
                          <h3 className="text-lg sm:text-2xl font-bold text-[#3b76ad] mb-2 sm:mb-3">
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
                              className="bg-blue-50 text-[#3b76ad] text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-blue-200"
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
                          className="bg-[#3b76ad] hover:bg-blue-700 text-white px-3 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl flex-1 flex items-center justify-center gap-1 sm:gap-2 font-semibold shadow-lg text-sm sm:text-base md:text-lg transition-all min-w-0 whitespace-nowrap"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            // route using slug if available, otherwise city or id
                            const slug = (((itinerary as unknown) as Record<string, unknown>).slug as string) || itinerary.city || itinerary.id;
                            handleViewItinerary({ ...itinerary, id: slug });
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
                          className="border-2 border-[#3b76ad] text-[#3b76ad]  hover:bg-blue-50 px-3 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl flex-1 flex items-center justify-center gap-1 sm:gap-2 font-semibold shadow-lg text-sm sm:text-base md:text-lg transition-all bg-white min-w-0 whitespace-nowrap"
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