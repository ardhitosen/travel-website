"use client"
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
// using native <img> to avoid Next image optimizer for same-origin uploads
import { useRouter } from "next/navigation";

interface ItineraryDay {
  day: number;
  activities: string[];
  title?: string;
  description?: string;
  imageUrl?: string;
  date?: string;
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

interface ItineraryClientProps {
  params: { country: string; city: string };
}

const ItineraryClient = ({ params }: ItineraryClientProps) => {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const cityName = params.city;
  const countryName = params.country;
  const [itineraryData, setItineraryData] = useState<CountryItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      if (!countryName || !cityName) { setLoading(false); return; }

      // Try to load destination then find itinerary by slug or city or id
      // Treat params.country as destination slug. Try fetching by slug, then
      // fall back to loading all destinations and matching by slug/name.
      // param could be encoded by the router; decode then encode once for API
      const tryDecode = (s: string) => {
        try { return decodeURIComponent(s); } catch { return s; }
      };
      const slugParam = tryDecode(String(countryName));
      let dest = null;
      try {
        const res = await fetch(`/api/destinations/${encodeURIComponent(slugParam)}`);
        if (res.ok) dest = await res.json();
      } catch (err) {
        // ignore and fallback
      }

      if (!dest) {
        try {
          const allRes = await fetch('/api/destinations');
          if (allRes.ok) {
            const all = await allRes.json();
            if (Array.isArray(all)) {
              dest = all.find((d: any) => String(d.slug || '').toLowerCase() === String(countryName).toLowerCase() || String(d.name || '').toLowerCase() === String(countryName).toLowerCase()) || null;
            }
          }
        } catch (err) {
          // ignore
        }
      }

      if (!dest) {
        setError('Destination not found');
        setItineraryData(null);
        setLoading(false);
        return;
      }

      const itineraries = Array.isArray(dest.itineraries) ? dest.itineraries : [];
      // Normalize incoming param for robust matching
      const cityParamRaw = decodeURIComponent(String(cityName || '')).trim();
      const cityParam = cityParamRaw.toLowerCase();

      // Debug: log available itineraries to assist diagnosing mismatches
      console.debug('Available itineraries for destination:', itineraries.map((it: unknown) => {
        const item = it as Record<string, unknown>;
        return { id: item.id, slug: item.slug, city: item.city };
      }));

      // Match by slug (case-insensitive), numeric id, or normalized city name
      const normalize = (s: string) => s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      const match = itineraries.find((it: unknown) => {
        const item = it as Record<string, unknown>;
        const slug = String(item.slug || '').toLowerCase();
        const idStr = item.id !== undefined && item.id !== null ? String(item.id).toLowerCase() : '';
        const city = String(item.city || '').toLowerCase();

        if (slug && slug === cityParam) return true;
        if (idStr && (idStr === cityParam || idStr === cityParamRaw)) return true;
        if (!Number.isNaN(Number(cityParam)) && Number(item.id as unknown as number) === Number(cityParam)) return true;
        if (normalize(city) === normalize(cityParam)) return true;
        return false;
      });
      if (!match) {
        setError('Itinerary not found');
        setItineraryData(null);
        setLoading(false);
        return;
      }

      const days = Array.isArray(match.days) ? match.days.map((d: unknown) => {
        const dd = d as Record<string, unknown>;
        const dayNum = (dd.dayNumber ?? dd.day ?? 0) as number | undefined;
        const activities = Array.isArray(dd.activities) ? (dd.activities as unknown[]).map(String) : [];
        const title = typeof dd.title === 'string' ? dd.title : undefined;
        const description = typeof dd.description === 'string' ? dd.description : undefined;
        const imageUrl = typeof dd.imageUrl === 'string' ? dd.imageUrl : undefined;
        const date = dd.date ? (typeof dd.date === 'string' ? dd.date : String(dd.date)) : undefined;
        return { day: Number(dayNum || 0), activities, title, description, imageUrl, date };
      }) : [];

      const highlights = match.highlights && Array.isArray(match.highlights)
        ? (match.highlights as unknown[]).map(String)
        : (typeof match.highlights === 'string' ? match.highlights.split(',').map((s:string)=>s.trim()).filter(Boolean) : []);

      setItineraryData({
        id: match.slug || String(match.id),
        name: match.name || match.title || match.slug || String(match.id),
        city: match.city || match.name || match.slug || String(match.id),
        duration: match.duration || (Array.isArray(days) ? `${days.length} days` : ''),
        price: match.price || '$0',
        image: match.imageUrl || match.image || '',
        description: match.description || match.title || '',
        activities: days,
        highlights,
      });

      setLoading(false);
    };

    load();
  }, [countryName, cityName]);

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
  const whatsappUrl = `https://wa.me/6281553548899?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleBackToHome = () => {
    router.push('/');
  };
  const formatDate = (v?: string) => {
    if (!v) return '';
    try {
      const d = new Date(v);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(v);
    }
  };
  // Avoid rendering when data is not ready to prevent runtime errors
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-xl font-medium text-gray-700">Loading itinerary…</p>
        </div>
      </div>
    );
  }

  if (error || !itineraryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-8">
          <p className="text-xl font-medium text-gray-700 mb-4">{error || 'Itinerary not available'}</p>
          <button
            onClick={handleBackToHome}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

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
                <img
                  src={itineraryData.image || '/file.svg'}
                  alt={`${itineraryData.city} banner`}
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
                    <h3 className="text-2xl font-bold text-[#3b76ad] mb-4">{info.title}</h3>
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
                <div className="relative">
                  {/* single vertical line connecting all day nodes */}
                  <div className="hidden md:block absolute left-28 top-0 bottom-0 w-px" style={{ backgroundColor: 'rgba(59,118,173,0.12)' }} />

                  <div className="space-y-10">
                    {itineraryData.activities.map((day, idx) => (
                      <motion.div
                        key={day.day}
                        className="relative md:flex md:items-start md:gap-6 md:pl-36"
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 + idx * 0.12, duration: 0.6 }}
                        viewport={{ once: true }}
                      >
                        {/* dot that sits on the central line */}
                        {/* timeline dot (desktop only) */}
                        <div className="hidden md:block absolute md:left-24 left-8 md:top-6 top-0 w-3 h-3 rounded-full border-2 border-white z-10" style={{ backgroundColor: '#3b76ad' }} />

                        {/* mobile header: show date pill inline above card on small screens */}
                        <div className="md:hidden mb-3 flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b76ad' }} />
                          <div className="text-white px-4 py-1 rounded-xl text-sm font-semibold shadow-md" style={{ backgroundColor: '#3b76ad' }}>Day {day.day}{day.date ? `: ${formatDate(day.date)}` : ''}</div>
                        </div>

                        {/* date pill (desktop) */}
                        <div className="hidden md:block absolute md:left-0 left-0 md:top-0 top-6">
                          <div className="text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md" style={{ backgroundColor: '#3b76ad' }}>Day {day.day}{day.date ? `: ${formatDate(day.date)}` : ''}</div>
                        </div>

                        {/* content card: stack on mobile, row on desktop */}
                        <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start gap-6 md:ml-8">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#6b7280]">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="9" r="2.5" stroke="#6b7280" strokeWidth="1.2"/>
                              </svg>
                              <h4 className="text-2xl font-bold text-[#3b76ad] mb-0">{day.title || `Day ${day.day}`}</h4>
                            </div>
                            <div className="text-gray-700 mb-4 text-base leading-relaxed">
                              {day.description ? (
                                <p>{day.description}</p>
                              ) : (
                                <p>{(day.activities || []).join('. ')}</p>
                              )}
                            </div>
                          </div>
                          {day.imageUrl && (
                            <div className="w-full md:w-56 flex-shrink-0">
                              <img src={day.imageUrl} alt={`Day ${day.day} image`} className="w-full h-40 object-cover rounded-lg shadow-inner mt-4 md:mt-0" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
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
                        className="bg-blue-50 text-[#3b76ad] text-lg font-medium px-6 py-3 rounded-full border border-blue-200"
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
      </div>
    </>
  );
};

export default ItineraryClient; 