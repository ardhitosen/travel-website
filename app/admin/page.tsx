"use client"
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface BannerSlide {
  id: string;
  image: string;
  fact: string;
  destination: string;
}

interface Destination {
  id: number;
  name: string;
  image: string;
  description: string;
  highlights?: string[];
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'banners' | 'destinations'>('banners');
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedBanners = localStorage.getItem('bannerSlides');
    const savedDestinations = localStorage.getItem('travelOptions');
    
    if (savedBanners) {
      setBanners(JSON.parse(savedBanners));
    }
    if (savedDestinations) {
      setDestinations(JSON.parse(savedDestinations));
    }
  }, []);

  const saveBanners = (newBanners: BannerSlide[]) => {
    setBanners(newBanners);
    localStorage.setItem('bannerSlides', JSON.stringify(newBanners));
  };

  const saveDestinations = (newDestinations: Destination[]) => {
    setDestinations(newDestinations);
    localStorage.setItem('travelOptions', JSON.stringify(newDestinations));
  };

  const addBanner = () => {
    const newBanner: BannerSlide = {
      id: Date.now().toString(),
      image: '',
      fact: '',
      destination: ''
    };
    saveBanners([...banners, newBanner]);
  };

  const updateBanner = (id: string, field: keyof BannerSlide, value: string) => {
    const updatedBanners = banners.map(banner => 
      banner.id === id ? { ...banner, [field]: value } : banner
    );
    saveBanners(updatedBanners);
  };

  const deleteBanner = (id: string) => {
    const updatedBanners = banners.filter(banner => banner.id !== id);
    saveBanners(updatedBanners);
  };

  const addDestination = () => {
    const newDestination: Destination = {
      id: Date.now(),
      name: '',
      image: '',
      description: '',
      highlights: []
    };
    saveDestinations([...destinations, newDestination]);
  };

  const updateDestination = (id: number, field: keyof Destination, value: any) => {
    const updatedDestinations = destinations.map(dest => 
      dest.id === id ? { ...dest, [field]: value } : dest
    );
    saveDestinations(updatedDestinations);
  };

  const deleteDestination = (id: number) => {
    const updatedDestinations = destinations.filter(dest => dest.id !== id);
    saveDestinations(updatedDestinations);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Lorem Ipsum Admin Panel
          </h1>
          <p className="text-gray-600">Manage your travel website content</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg">
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'banners'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Banner Management
            </button>
            <button
              onClick={() => setActiveTab('destinations')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'destinations'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Destination Management
            </button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'banners' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Banner Slides</h2>
                <button
                  onClick={addBanner}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  + Add Banner
                </button>
              </div>

              <div className="space-y-6">
                {banners.map((banner, index) => (
                  <motion.div
                    key={banner.id}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={banner.image}
                          onChange={(e) => updateBanner(banner.id, 'image', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter image URL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Destination Name
                        </label>
                        <input
                          type="text"
                          value={banner.destination}
                          onChange={(e) => updateBanner(banner.id, 'destination', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter destination name"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fun Fact
                      </label>
                      <textarea
                        value={banner.fact}
                        onChange={(e) => updateBanner(banner.id, 'fact', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                        placeholder="Enter fun fact about the destination"
                      />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'destinations' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Destinations</h2>
                <button
                  onClick={addDestination}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  + Add Destination
                </button>
              </div>

              <div className="space-y-6">
                {destinations.map((destination, index) => (
                  <motion.div
                    key={destination.id}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Destination Name
                        </label>
                        <input
                          type="text"
                          value={destination.name}
                          onChange={(e) => updateDestination(destination.id, 'name', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter destination name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={destination.image}
                          onChange={(e) => updateDestination(destination.id, 'image', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter image URL"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={destination.description}
                        onChange={(e) => updateDestination(destination.id, 'description', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                        placeholder="Enter destination description"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Highlights (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={destination.highlights?.join(', ') || ''}
                        onChange={(e) => updateDestination(destination.id, 'highlights', e.target.value.split(',').map(h => h.trim()))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter highlights separated by commas"
                      />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => deleteDestination(destination.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Save Status */}
        <motion.div 
          className="text-center mt-8 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Changes are automatically saved to your browser's local storage
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel; 