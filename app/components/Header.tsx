"use client"

import React from "react";
import { motion } from "framer-motion";
// use native <img> to avoid Next image optimizer for local assets

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
      <div className="mx-3 py-3 sm:py-1 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <motion.div 
          className="flex items-center gap-3 min-w-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="/img/JOS.png"
            alt="Jalan Overseas Logo"
            className="flex-shrink-0 w-[140px] h-[70px] sm:w-[160px] sm:h-[80px] lg:w-[180px] lg:h-[90px] object-contain"
            loading="eager"
          />
        </motion.div>
        
        {/* Contact and Email Info - Desktop/Tablet */}
        <motion.div 
          className="hidden sm:flex items-center gap-6 text-sm md:text-base ml-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-[#3b76ad] hover:text-blue-700 transition-colors whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92V19a2 2 0 01-2 2A19.72 19.72 0 013 5a2 2 0 012-2h2.09a2 2 0 012 1.72c.13.81.36 1.6.68 2.35a2 2 0 01-.45 2.11l-.27.27a16 16 0 006.29 6.29l.27-.27a2 2 0 012.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0122 16.92z" />
            </svg>
            <a href="tel:+6281553548899" className="whitespace-nowrap hover:text-blue-700">+62 815-5354-8899</a>
          </div>
          <div className="flex items-center gap-2 text-[#3b76ad] hover:text-blue-700 transition-colors whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6" />
            </svg>
            <a href="mailto:info@jalanoverseas.com" className="whitespace-nowrap hover:text-blue-700">info@jalanoverseas.com</a>
          </div>
        </motion.div>

        {/* Compact Contact - Mobile */}
        <motion.div
          className="flex sm:hidden items-center gap-4 ml-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <a href="tel:+6281553548899" className="text-[#3b76ad] hover:text-blue-700 p-2 rounded-full bg-blue-50 border border-blue-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92V19a2 2 0 01-2 2A19.72 19.72 0 013 5a2 2 0 012-2h2.09a2 2 0 012 1.72c.13.81.36 1.6.68 2.35a2 2 0 01-.45 2.11l-.27.27a16 16 0 006.29 6.29l.27-.27a2 2 0 012.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0122 16.92z" />
            </svg>
          </a>
          <a href="mailto:info@jalanoverseas.com" className="text-[#3b76ad] hover:text-blue-700 p-2 rounded-full bg-blue-50 border border-blue-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6" />
            </svg>
          </a>
        </motion.div>
      </div>
    </header>
  );
};

export default Header; 