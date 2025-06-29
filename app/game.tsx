'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Crop {
  id: string;
  name: string;
  growthTime: number;
  baseYield: number;
  basePrice: number;
  seedCost: number;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

interface FarmPlot {
  id: number;
  cropId: string | null;
  plantedAt: number | null;
  isWatered: boolean;
  isFertilized: boolean;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  purchased: boolean;
  category: 'farm' | 'crops' | 'automation';
}

interface Notification {
  id: number;
  type: 'success' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

// Game Data
const CROPS: Crop[] = [
  { id: 'wheat', name: 'Wheat', growthTime: 30, baseYield: 2, basePrice: 5, seedCost: 2, icon: '🌾', rarity: 'common' },
  { id: 'corn', name: 'Corn', growthTime: 60, baseYield: 4, basePrice: 12, seedCost: 5, icon: '🌽', rarity: 'common' },
  { id: 'tomato', name: 'Tomato', growthTime: 90, baseYield: 6, basePrice: 20, seedCost: 8, icon: '🍅', rarity: 'uncommon' },
  { id: 'strawberry', name: 'Strawberry', growthTime: 120, baseYield: 8, basePrice: 35, seedCost: 15, icon: '🍓', rarity: 'uncommon' },
  { id: 'pumpkin', name: 'Pumpkin', growthTime: 180, baseYield: 12, basePrice: 50, seedCost: 25, icon: '🎃', rarity: 'rare' },
  { id: 'dragonfruit', name: 'Dragon Fruit', growthTime: 300, baseYield: 20, basePrice: 100, seedCost: 50, icon: '🐉', rarity: 'epic' },
];

const UPGRADES: Upgrade[] = [
  { id: 'water_can', name: 'Watering Can', description: 'Water crops 50% faster', cost: 100, effect: 'watering_speed', purchased: false, category: 'farm' },
  { id: 'fertilizer', name: 'Fertilizer', description: 'Crops grow 25% faster', cost: 250, effect: 'growth_speed', purchased: false, category: 'crops' },
  { id: 'auto_water', name: 'Auto Waterer', description: 'Automatically water crops', cost: 500, effect: 'auto_water', purchased: false, category: 'automation' },
  { id: 'greenhouse', name: 'Greenhouse', description: 'Protect crops from weather', cost: 1000, effect: 'weather_protection', purchased: false, category: 'farm' },
  { id: 'harvester', name: 'Auto Harvester', description: 'Automatically harvest ripe crops', cost: 2000, effect: 'auto_harvest', purchased: false, category: 'automation' },
];

const WEATHER_CONDITIONS = [
  { name: 'Sunny', icon: '☀️', effect: 'growth_boost', multiplier: 1.2 },
  { name: 'Cloudy', icon: '☁️', effect: 'normal', multiplier: 1.0 },
  { name: 'Rainy', icon: '🌧️', effect: 'water_boost', multiplier: 1.1 },
  { name: 'Stormy', icon: '⛈️', effect: 'damage_risk', multiplier: 0.8 },
];

const IdleFarmGame = () => {
  // Game State
  const [currency, setCurrency] = useState(50);
  const [plots, setPlots] = useState<FarmPlot[]>([
    { id: 1, cropId: null, plantedAt: null, isWatered: false, isFertilized: false },
    { id: 2, cropId: null, plantedAt: null, isWatered: false, isFertilized: false },
    { id: 3, cropId: null, plantedAt: null, isWatered: false, isFertilized: false },
    { id: 4, cropId: null, plantedAt: null, isWatered: false, isFertilized: false },
  ]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [upgrades, setUpgrades] = useState(UPGRADES);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentWeather, setCurrentWeather] = useState(WEATHER_CONDITIONS[0]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'farm' | 'shop' | 'upgrades'>('farm');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      // Update crop growth
      setPlots((currentPlots: FarmPlot[]) => 
        currentPlots.map((plot: FarmPlot) => {
          if (plot.cropId && plot.plantedAt) {
            const crop = CROPS.find((c: Crop) => c.id === plot.cropId);
            if (crop) {
              const growthTime = plot.isFertilized ? crop.growthTime * 0.75 : crop.growthTime;
              const timeElapsed = Date.now() - plot.plantedAt;
              
              if (timeElapsed >= growthTime * 1000) {
                // Crop is ready to harvest
                return { ...plot, cropId: null, plantedAt: null, isWatered: false, isFertilized: false };
              }
            }
          }
          return plot;
        })
      );

      // Auto water if upgrade is purchased
      const autoWaterUpgrade = upgrades.find((u: Upgrade) => u.id === 'auto_water' && u.purchased);
      if (autoWaterUpgrade) {
        setPlots((currentPlots: FarmPlot[]) => 
          currentPlots.map((plot: FarmPlot) => ({ ...plot, isWatered: true }))
        );
      }

      // Change weather every 30 seconds
      if (Math.random() < 0.02) { // 2% chance per second
        setCurrentWeather(WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)]);
      }
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [upgrades]);

  // Helper functions
  const addNotification = (type: Notification['type'], message: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      type,
      message,
      timestamp: Date.now()
    };
    setNotifications((prev: Notification[]) => [newNotification, ...prev.slice(0, 4)]);
  };

  const plantCrop = (plotId: number, cropId: string) => {
    const crop = CROPS.find((c: Crop) => c.id === cropId);
    if (!crop) return;

    if (currency < crop.seedCost) {
      addNotification('warning', 'Not enough coins to buy seeds!');
      return;
    }

    setCurrency((prev: number) => prev - crop.seedCost);
    setPlots((prev: FarmPlot[]) => 
      prev.map((plot: FarmPlot) => 
        plot.id === plotId 
          ? { ...plot, cropId, plantedAt: Date.now(), isWatered: false, isFertilized: false }
          : plot
      )
    );
    addNotification('success', `Planted ${crop.name}!`);
  };

  const harvestCrop = (plotId: number) => {
    const plot = plots.find((p: FarmPlot) => p.id === plotId);
    if (!plot || !plot.cropId) return;

    const crop = CROPS.find((c: Crop) => c.id === plot.cropId);
    if (!crop) return;

    let cropYield = crop.baseYield;
    if (plot.isWatered) cropYield *= 1.2;
    if (plot.isFertilized) cropYield *= 1.3;
    if (currentWeather.effect === 'growth_boost') cropYield *= 1.2;

    setInventory((prev: Record<string, number>) => ({
      ...prev,
      [crop.id]: (prev[crop.id] || 0) + Math.floor(cropYield)
    }));

    setPlots((prev: FarmPlot[]) => 
      prev.map((p: FarmPlot) => 
        p.id === plotId 
          ? { ...p, cropId: null, plantedAt: null, isWatered: false, isFertilized: false }
          : p
      )
    );

    addNotification('success', `Harvested ${Math.floor(cropYield)} ${crop.name}!`);
  };

  const waterPlot = (plotId: number) => {
    setPlots((prev: FarmPlot[]) => 
      prev.map((plot: FarmPlot) => 
        plot.id === plotId 
          ? { ...plot, isWatered: true }
          : plot
      )
    );
    addNotification('info', 'Plot watered!');
  };

  const fertilizePlot = (plotId: number) => {
    if (currency < 10) {
      addNotification('warning', 'Not enough coins for fertilizer!');
      return;
    }
    
    setCurrency((prev: number) => prev - 10);
    setPlots((prev: FarmPlot[]) => 
      prev.map((plot: FarmPlot) => 
        plot.id === plotId 
          ? { ...plot, isFertilized: true }
          : plot
      )
    );
    addNotification('info', 'Plot fertilized!');
  };

  const sellCrop = (cropId: string) => {
    const amount = inventory[cropId] || 0;
    if (amount === 0) return;

    const crop = CROPS.find((c: Crop) => c.id === cropId);
    if (!crop) return;

    const totalValue = amount * crop.basePrice;
    setCurrency((prev: number) => prev + totalValue);
    setInventory((prev: Record<string, number>) => ({ ...prev, [cropId]: 0 }));
    addNotification('success', `Sold ${amount} ${crop.name} for ${totalValue} coins!`);
  };

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find((u: Upgrade) => u.id === upgradeId);
    if (!upgrade || upgrade.purchased) return;

    if (currency < upgrade.cost) {
      addNotification('warning', 'Not enough coins for this upgrade!');
      return;
    }

    setCurrency((prev: number) => prev - upgrade.cost);
    setUpgrades((prev: Upgrade[]) => 
      prev.map((u: Upgrade) => 
        u.id === upgradeId 
          ? { ...u, purchased: true }
          : u
      )
    );
    addNotification('success', `Purchased ${upgrade.name}!`);
  };

  const getCropProgress = (plot: FarmPlot) => {
    if (!plot.cropId || !plot.plantedAt) return 0;
    const crop = CROPS.find((c: Crop) => c.id === plot.cropId);
    if (!crop) return 0;
    
    const growthTime = plot.isFertilized ? crop.growthTime * 0.75 : crop.growthTime;
    const timeElapsed = Date.now() - plot.plantedAt;
    return Math.min(timeElapsed / (growthTime * 1000), 1);
  };

  const getCropStatus = (plot: FarmPlot) => {
    if (!plot.cropId) return 'empty';
    const progress = getCropProgress(plot);
    if (progress >= 1) return 'ready';
    if (progress > 0.5) return 'growing';
    return 'seeding';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-amber-400/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-40 right-20 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-blue-400/10 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="text-4xl"
            >
              🌾
            </motion.div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
                Idle Farm
              </h1>
              <p className="text-slate-400 text-sm">Grow, harvest, and prosper!</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Weather Display */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700"
            >
              <span className="text-2xl">{currentWeather.icon}</span>
              <div>
                <p className="text-sm font-medium">{currentWeather.name}</p>
                <p className="text-xs text-slate-400">
                  {currentWeather.effect === 'growth_boost' && 'Growth Boost'}
                  {currentWeather.effect === 'water_boost' && 'Water Boost'}
                  {currentWeather.effect === 'damage_risk' && 'Damage Risk'}
                  {currentWeather.effect === 'normal' && 'Normal'}
                </p>
              </div>
            </motion.div>

            {/* Currency */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-amber-500/30"
            >
              <span className="text-2xl">🪙</span>
              <span className="font-bold text-amber-400">{currency.toLocaleString()}</span>
            </motion.div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700 hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-xl">🔔</span>
              {notifications.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {notifications.length}
                </motion.div>
              )}
            </motion.button>
          </div>
        </motion.header>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-6 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Notifications</h3>
                <button
                  onClick={() => setNotifications([])}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-sm">No notifications</p>
                ) : (
                  notifications.map((notification: Notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 rounded text-sm ${
                        notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
                        notification.type === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {notification.message}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 border border-slate-700">
            {(['farm', 'shop', 'upgrades'] as const).map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-amber-500 text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'farm' && '🌾 Farm'}
                {tab === 'shop' && '🛒 Shop'}
                {tab === 'upgrades' && '⚡ Upgrades'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Farm Section */}
          {activeTab === 'farm' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-2xl font-bold mb-6 text-amber-400"
              >
                Your Farm
              </motion.h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {plots.map((plot: FarmPlot, index: number) => (
                  <motion.div
                    key={plot.id}
                    variants={cardVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-4 min-h-[120px] flex flex-col justify-between"
                  >
                    {/* Plot Status */}
                    <div className="text-center">
                      {plot.cropId ? (
                        <div className="space-y-2">
                          <div className="text-3xl">
                            {CROPS.find((c: Crop) => c.id === plot.cropId)?.icon}
                          </div>
                          <div className="text-xs text-slate-400">
                            {CROPS.find((c: Crop) => c.id === plot.cropId)?.name}
                          </div>
                          
                          {/* Growth Progress */}
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${getCropProgress(plot) * 100}%` }}
                              className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full"
                            />
                          </div>
                          
                          {/* Status Indicators */}
                          <div className="flex justify-center gap-1">
                            {plot.isWatered && <span className="text-blue-400">💧</span>}
                            {plot.isFertilized && <span className="text-green-400">🌱</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="text-4xl text-slate-600">⬜</div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plot.cropId ? (
                        getCropStatus(plot) === 'ready' ? (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => harvestCrop(plot.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-2 rounded"
                          >
                            Harvest
                          </motion.button>
                        ) : (
                          <>
                            {!plot.isWatered && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => waterPlot(plot.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                              >
                                💧
                              </motion.button>
                            )}
                            {!plot.isFertilized && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => fertilizePlot(plot.id)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
                              >
                                🌱
                              </motion.button>
                            )}
                          </>
                        )
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedCrop(plot.id.toString())}
                          className="w-full bg-slate-600 hover:bg-slate-700 text-white text-xs py-1 px-2 rounded"
                        >
                          Plant
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Shop Section */}
          {activeTab === 'shop' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-2xl font-bold mb-6 text-amber-400"
              >
                Crop Shop
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CROPS.map((crop: Crop) => (
                  <motion.div
                    key={crop.id}
                    variants={cardVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-4"
                  >
                    <div className="text-center space-y-3">
                      <div className="text-4xl">{crop.icon}</div>
                      <h3 className="font-semibold">{crop.name}</h3>
                      <div className="text-sm text-slate-400 space-y-1">
                        <p>Growth: {crop.growthTime}s</p>
                        <p>Yield: {crop.baseYield}</p>
                        <p>Price: {crop.basePrice} coins</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (currency >= crop.seedCost) {
                            setCurrency((prev: number) => prev - crop.seedCost);
                            setInventory((prev: Record<string, number>) => ({
                              ...prev,
                              [crop.id]: (prev[crop.id] || 0) + 1
                            }));
                            addNotification('success', `Bought ${crop.name} seeds!`);
                          } else {
                            addNotification('warning', 'Not enough coins!');
                          }
                        }}
                        className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                          currency >= crop.seedCost
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Buy Seeds ({crop.seedCost} 🪙)
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upgrades Section */}
          {activeTab === 'upgrades' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-2xl font-bold mb-6 text-amber-400"
              >
                Farm Upgrades
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upgrades.map((upgrade: Upgrade) => (
                  <motion.div
                    key={upgrade.id}
                    variants={cardVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`bg-slate-800/50 backdrop-blur-sm rounded-lg border p-4 ${
                      upgrade.purchased 
                        ? 'border-emerald-500/50 bg-emerald-500/10' 
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{upgrade.name}</h3>
                        {upgrade.purchased && (
                          <span className="text-emerald-400 text-sm">✓ Owned</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{upgrade.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-400 font-medium">{upgrade.cost} 🪙</span>
                        {!upgrade.purchased && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => buyUpgrade(upgrade.id)}
                            className={`px-4 py-2 rounded font-medium transition-colors ${
                              currency >= upgrade.cost
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            Buy
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Sidebar */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Inventory */}
            <motion.div
              variants={cardVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-4"
            >
              <h3 className="text-lg font-semibold mb-4 text-amber-400">Inventory</h3>
              <div className="space-y-2">
                {Object.entries(inventory).map(([cropId, amount]) => {
                  const crop = CROPS.find((c: Crop) => c.id === cropId);
                  if (!crop || amount === 0) return null;
                  
                  return (
                    <motion.div
                      key={cropId}
                      whileHover={{ scale: 1.02 }}
                      className="flex justify-between items-center p-2 bg-slate-700/50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{crop.icon}</span>
                        <span className="text-sm">{amount}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sellCrop(cropId)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-2 rounded"
                      >
                        Sell
                      </motion.button>
                    </motion.div>
                  );
                })}
                {Object.keys(inventory).length === 0 || Object.values(inventory).every((v: number) => v === 0) && (
                  <p className="text-slate-400 text-sm text-center">No crops in inventory</p>
                )}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={cardVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-4"
            >
              <h3 className="text-lg font-semibold mb-4 text-amber-400">Farm Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Plots Owned:</span>
                  <span className="text-emerald-400">{plots.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Crops Growing:</span>
                  <span className="text-blue-400">
                    {plots.filter((p: FarmPlot) => p.cropId && getCropStatus(p) !== 'ready').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ready to Harvest:</span>
                  <span className="text-amber-400">
                    {plots.filter((p: FarmPlot) => getCropStatus(p) === 'ready').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Upgrades Owned:</span>
                  <span className="text-purple-400">
                    {upgrades.filter((u: Upgrade) => u.purchased).length}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Crop Selection Modal */}
        <AnimatePresence>
          {selectedCrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedCrop(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold mb-4 text-amber-400">Plant Crop</h3>
                <div className="grid grid-cols-2 gap-3">
                  {CROPS.map((crop: Crop) => (
                    <motion.button
                      key={crop.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        plantCrop(parseInt(selectedCrop), crop.id);
                        setSelectedCrop(null);
                      }}
                      className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{crop.icon}</div>
                        <div className="text-sm font-medium">{crop.name}</div>
                        <div className="text-xs text-slate-400">{crop.seedCost} 🪙</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCrop(null)}
                  className="w-full mt-4 py-2 bg-slate-600 hover:bg-slate-700 rounded font-medium transition-colors"
                >
                  Cancel
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IdleFarmGame;
