"use client"
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaCheckCircle, FaClock, FaFileAlt, FaGlobe } from "react-icons/fa";
// removed unused useRouter import
import Image from "next/image";

interface VisaService {
  id: string;
  name: string;
  country: string;
  category: string;
  processingTime: string;
  validity: string;
  requirements: string[];
  documents: string[];
  price: string;
  description: string;
  image: string;
  isPopular?: boolean;
  isExpress?: boolean;
}

const VisaPage = () => {
  // router not used here; removed
  const [searchTerm, setSearchTerm] = useState("");
  

  const [visaServices, setVisaServices] = useState<VisaService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/visa')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        // Normalize returned data to the VisaService shape
        const toStr = (x: unknown) => (typeof x === 'string' ? x : (typeof x === 'number' ? String(x) : ''));
        const toStrArr = (x: unknown) => {
          if (Array.isArray(x)) return x.filter((s) => typeof s === 'string') as string[];
          if (typeof x === 'string') return x.split(',').map(s => s.trim()).filter(Boolean);
          return [] as string[];
        };

        const normalized: VisaService[] = (data || []).map((v: unknown) => {
          const obj = v as Record<string, unknown>;
          const id = toStr(obj.id ?? obj.slug ?? obj.name) || String(Math.random());
          const countryVal = obj.country ?? obj.destination ?? obj.location;
          let country = '';
          if (typeof countryVal === 'string') country = countryVal;
          else if (countryVal && typeof countryVal === 'object') {
            const cv = countryVal as Record<string, unknown>;
            country = typeof cv.country === 'string' ? cv.country : (typeof cv.name === 'string' ? cv.name : '');
          }
          return {
            id: id,
            name: toStr(obj.name ?? obj.title),
            country,
            category: toStr(obj.category ?? obj.type) || 'General',
            processingTime: toStr(obj.processingTime ?? obj.processing ?? obj.processing_time),
            validity: toStr(obj.validity),
            requirements: toStrArr(obj.requirements),
            documents: toStrArr(obj.documents),
            price: obj.price ? String(obj.price) : (obj.fee ? String(obj.fee) : ''),
            description: toStr(obj.description ?? obj.summary),
            image: toStr(obj.imageUrl ?? obj.image),
            isPopular: !!obj.isPopular,
            isExpress: !!obj.isExpress
          } as VisaService;
        });

        setVisaServices(normalized);
      })
      .catch((err) => {
        console.error('Failed to load visas from /api/visa', err);
        setVisaServices([]);
      })
      .finally(() => setLoading(false));

    return () => { mounted = false };
  }, []);

  

  const filteredVisaServices = visaServices.filter(service => {
    const term = searchTerm.trim().toLowerCase();
    return term === '' || service.name.toLowerCase().includes(term) || service.country.toLowerCase().includes(term);
  });

  const handleBookVisa = (visa: VisaService) => {
    const message = `Hello, I want to apply for ${visa.name} for ${visa.country}.`;
    const whatsappUrl = `https://wa.me/6281553548899?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">Loading visa services…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Visa Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Visa & Document Submission Assistance
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900" />
              <input
                type="text"
                placeholder="Search visa services or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Visa Services Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {filteredVisaServices.map((visa) => (
            <motion.div
              key={visa.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              {/* Visa Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={visa.image}
                  alt={visa.name}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {visa.isPopular && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                  {visa.isExpress && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Express
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 font-bold px-3 py-1 rounded-full text-sm">
                    {visa.price}
                  </span>
                </div>
              </div>

              {/* Visa Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{visa.name}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {visa.category}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{visa.description}</p>

                {/* Country */}
                <div className="flex items-center gap-2 mb-4">
                  <FaGlobe className="text-blue-500" />
                  <span className="text-gray-700 font-medium">{visa.country || '—'}</span>
                </div>

                {/* Processing Time */}
                <div className="flex items-center gap-2 mb-4">
                  <FaClock className="text-green-500" />
                  <span className="text-gray-700 text-sm">
                    Processing: {visa.processingTime}
                  </span>
                </div>

                {/* Validity */}
                <div className="flex items-center gap-2 mb-4">
                  <FaFileAlt className="text-purple-500" />
                  <span className="text-gray-700 text-sm">
                    Validity: {visa.validity}
                  </span>
                </div>

                {/* Requirements Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Requirements:</h4>
                  <div className="flex flex-wrap gap-1">
                    {visa.requirements.slice(0, 3).map((req, idx) => (
                      <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        {req}
                      </span>
                    ))}
                    {visa.requirements.length > 3 && (
                      <span className="text-xs text-gray-500">+{visa.requirements.length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  className="w-full mt-auto bg-gradient-to-r from-[#3b76ad] to-blue-400 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => handleBookVisa(visa)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaCheckCircle />
                  Apply Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredVisaServices.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No visa services found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
          </motion.div>
        )}

        {/* Contact Section */}
        <motion.div 
          className="mt-16 bg-gradient-to-r from-[#3b76ad] to-blue-400 rounded-3xl p-8 text-white text-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-4">Need advice to complete your trip?</h2>
          <motion.button
            className="bg-white text-[#3b76ad] font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => {
              const message = "Hello, I need assistance.";
              const whatsappUrl = `https://wa.me/6281553548899?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, "_blank");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CONTACT US
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
};

export default VisaPage; 