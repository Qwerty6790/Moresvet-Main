'use client';

import React from 'react';
import { Analytics } from "@vercel/analytics/react";
import KinkLight from './cardproducts/KinkLight/page';
import LightStar from './cardproducts/LightStar/page';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b  relative overflow-hidden">
      <Analytics />

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b z-0" />

      {/* Background Products with Motion */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="relative flex justify-center gap-10 opacity-60">
          {/* Animated KinkLight Component */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}  // Начальное состояние: непрозрачность 0, сдвиг по оси Y вниз
            animate={{ opacity: 1, y: 0 }}    // Конечное состояние: непрозрачность 1, сдвиг по оси Y = 0
            transition={{
              duration: 1.5,                // Длительность анимации
              ease: "easeOut",               // Тип перехода: плавное завершение
            }}
            className="w-full h-full"
          >
            <KinkLight />
          </motion.div>

          {/* Animated LightStar Component */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}  // Начальное состояние: непрозрачность 0, сдвиг по оси Y вниз
            animate={{ opacity: 1, y: 0 }}    // Конечное состояние: непрозрачность 1, сдвиг по оси Y = 0
            transition={{
              duration: 1.5,                // Длительность анимации
              ease: "easeOut",               // Тип перехода: плавное завершение
            }}
            className="w-full h-full"
          >
            <LightStar />
          </motion.div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative w-full flex flex-col items-center px-6 lg:px-16 z-10 text-center">
        {/* Hero Section */}
        <div className="mt-40 space-y-5 relative">
          

          <p className="mt-4 font-bold text-4xl md:text-6xl text-black">
           MoreElectriki
          </p>

          {/* Hero Button */}
          <div className="mt-10">
            <button className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-bold text-3xl rounded-full transition duration-300">
              Перейти в каталог
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
