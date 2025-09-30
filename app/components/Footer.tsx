"use client";

import React from "react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
  <footer className="mt-auto border-t border-gray-200 bg-white relative z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-700"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">Jalan Overseas</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a href="mailto:info@jalanoverseas.com" className="hover:text-blue-600 transition-colors">info@jalanoverseas.com</a>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a href="tel:+6281553548899" className="hover:text-blue-600 transition-colors">+62 815-5354-8899</a>
          </div>
          <div className="text-gray-500">© {year} Jalan Overseas. All rights reserved.</div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
