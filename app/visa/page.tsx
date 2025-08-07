"use client"
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSearch, FaFilter, FaCheckCircle, FaClock, FaFileAlt, FaGlobe } from "react-icons/fa";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");

  const visaServices: VisaService[] = [
    {
      id: "tourist-visa-japan",
      name: "Tourist Visa",
      country: "Japan",
      category: "Tourist",
      processingTime: "5-7 working days",
      validity: "90 days",
      requirements: ["Valid passport", "Completed application form", "Recent photos", "Travel itinerary"],
      documents: ["Passport with 6 months validity", "Visa application form", "2 recent photos", "Flight itinerary", "Hotel bookings"],
      price: "$50",
      description: "Standard tourist visa for Japan with multiple entry options.",
      image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      isPopular: true
    },
    {
      id: "business-visa-japan",
      name: "Business Visa",
      country: "Japan",
      category: "Business",
      processingTime: "7-10 working days",
      validity: "1 year",
      requirements: ["Business invitation letter", "Company registration", "Financial statements"],
      documents: ["Business invitation letter", "Company registration documents", "Financial statements", "Passport", "Application form"],
      price: "$80",
      description: "Business visa for commercial activities and meetings in Japan.",
      image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: "tourist-visa-korea",
      name: "Tourist Visa",
      country: "South Korea",
      category: "Tourist",
      processingTime: "3-5 working days",
      validity: "90 days",
      requirements: ["Valid passport", "Application form", "Financial proof"],
      documents: ["Passport", "Visa application form", "Bank statements", "Travel itinerary"],
      price: "$45",
      description: "Tourist visa for South Korea with single or multiple entry options.",
      image: "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      isPopular: true
    },
    {
      id: "student-visa-korea",
      name: "Student Visa",
      country: "South Korea",
      category: "Student",
      processingTime: "10-15 working days",
      validity: "Duration of study",
      requirements: ["University acceptance letter", "Financial proof", "Academic records"],
      documents: ["University acceptance letter", "Financial statements", "Academic transcripts", "Passport", "Application form"],
      price: "$60",
      description: "Student visa for academic studies in South Korea.",
      image: "https://images.unsplash.com/photo-1526199119161-4be1e3368d52?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: "tourist-visa-dubai",
      name: "Tourist Visa",
      country: "Dubai",
      category: "Tourist",
      processingTime: "2-3 working days",
      validity: "30 days",
      requirements: ["Valid passport", "Application form", "Travel insurance"],
      documents: ["Passport", "Visa application form", "Travel insurance", "Flight itinerary"],
      price: "$35",
      description: "Quick tourist visa for Dubai with express processing available.",
      image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      isExpress: true
    },
    {
      id: "business-visa-dubai",
      name: "Business Visa",
      country: "Dubai",
      category: "Business",
      processingTime: "5-7 working days",
      validity: "90 days",
      requirements: ["Business invitation", "Company documents", "Financial proof"],
      documents: ["Business invitation letter", "Company registration", "Financial statements", "Passport"],
      price: "$70",
      description: "Business visa for commercial activities in Dubai.",
      image: "https://plus.unsplash.com/premium_photo-1697729914552-368899dc4757?q=80&w=1112&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: "tourist-visa-thailand",
      name: "Tourist Visa",
      country: "Thailand",
      category: "Tourist",
      processingTime: "3-5 working days",
      validity: "60 days",
      requirements: ["Valid passport", "Application form", "Financial proof"],
      documents: ["Passport", "Visa application form", "Bank statements", "Travel itinerary"],
      price: "$40",
      description: "Tourist visa for Thailand with easy application process.",
      image: "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: "work-visa-thailand",
      name: "Work Visa",
      country: "Thailand",
      category: "Work",
      processingTime: "15-20 working days",
      validity: "1 year",
      requirements: ["Job offer letter", "Work permit", "Company documents"],
      documents: ["Job offer letter", "Work permit", "Company registration", "Passport", "Application form"],
      price: "$120",
      description: "Work visa for employment in Thailand.",
      image: "https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: "tourist-visa-vietnam",
      name: "Tourist Visa",
      country: "Vietnam",
      category: "Tourist",
      processingTime: "3-5 working days",
      validity: "30 days",
      requirements: ["Valid passport", "Application form", "Travel itinerary"],
      documents: ["Passport", "Visa application form", "Travel itinerary", "Hotel bookings"],
      price: "$30",
      description: "Tourist visa for Vietnam with online application available.",
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: "business-visa-vietnam",
      name: "Business Visa",
      country: "Vietnam",
      category: "Business",
      processingTime: "7-10 working days",
      validity: "90 days",
      requirements: ["Business invitation", "Company documents", "Financial proof"],
      documents: ["Business invitation letter", "Company registration", "Financial statements", "Passport"],
      price: "$65",
      description: "Business visa for commercial activities in Vietnam.",
      image: "https://images.unsplash.com/photo-1480996408299-fc0e830b5db1?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: "tourist-visa-indonesia",
      name: "Tourist Visa",
      country: "Indonesia",
      category: "Tourist",
      processingTime: "2-3 working days",
      validity: "30 days",
      requirements: ["Valid passport", "Application form", "Travel insurance"],
      documents: ["Passport", "Visa application form", "Travel insurance", "Flight itinerary"],
      price: "$25",
      description: "Tourist visa for Indonesia with visa on arrival option.",
      image: "https://images.unsplash.com/photo-1476158085676-e67f57ed9ed7?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      isExpress: true
    },
    {
      id: "tourist-visa-philippines",
      name: "Tourist Visa",
      country: "Philippines",
      category: "Tourist",
      processingTime: "5-7 working days",
      validity: "59 days",
      requirements: ["Valid passport", "Application form", "Financial proof"],
      documents: ["Passport", "Visa application form", "Bank statements", "Travel itinerary"],
      price: "$35",
      description: "Tourist visa for Philippines with multiple entry options.",
      image: "https://images.unsplash.com/photo-1583685133115-90748ccbe274?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: "tourist-visa-malaysia",
      name: "Tourist Visa",
      country: "Malaysia",
      category: "Tourist",
      processingTime: "3-5 working days",
      validity: "90 days",
      requirements: ["Valid passport", "Application form", "Travel itinerary"],
      documents: ["Passport", "Visa application form", "Travel itinerary", "Hotel bookings"],
      price: "$30",
      description: "Tourist visa for Malaysia with easy online application.",
      image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1164&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ];

  const categories = ["all", "Tourist", "Business", "Student", "Work"];
  const countries = ["all", "Japan", "South Korea", "Dubai", "Thailand", "Vietnam", "Indonesia", "Philippines", "Malaysia"];

  const filteredVisaServices = visaServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesCountry = selectedCountry === "all" || service.country === selectedCountry;
    
    return matchesSearch && matchesCategory && matchesCountry;
  });

  const handleBookVisa = (visa: VisaService) => {
    const message = `Hello, I want to apply for ${visa.name} for ${visa.country}.`;
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="mx-3 py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <Image 
              src="/img/JOS.png" 
              alt="JOS Overseas Logo" 
              width={150} 
              height={75} 
              className="flex-shrink-0"
            />
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-4 text-sm md:text-base"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92V19a2 2 0 01-2 2A19.72 19.72 0 013 5a2 2 0 012-2h2.09a2 2 0 012 1.72c.13.81.36 1.6.68 2.35a2 2 0 01-.45 2.11l-.27.27a16 16 0 006.29 6.29l.27-.27a2 2 0 012.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0122 16.92z" />
              </svg>
              <span className="hidden sm:inline">+1 234 567 8901</span>
            </div>
          </motion.div>
        </div>
      </header>

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
            We provide comprehensive visa services for destinations across Asia. 
            From tourist visas to business permits, we handle all your visa requirements with expertise and efficiency.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search visa services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              <FaFilter className="text-gray-400 mt-3" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div className="flex gap-2">
              <FaGlobe className="text-gray-400 mt-3" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country === "all" ? "All Countries" : country}
                  </option>
                ))}
              </select>
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
          {filteredVisaServices.map((visa, index) => (
            <motion.div
              key={visa.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              {/* Visa Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={visa.image}
                  alt={visa.name}
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
              <div className="p-6">
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
                  <span className="text-gray-700 font-medium">{visa.country}</span>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
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
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white text-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-4">Need Custom Visa Assistance?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our visa experts are here to help you with any special requirements or complex visa applications. 
            Contact us for personalized assistance.
          </p>
          <motion.button
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => {
              const message = "Hello, I need custom visa assistance.";
              const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, "_blank");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Visa Expert
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
};

export default VisaPage; 