'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LightStar from '@/app/cardproducts/LightStar/page';
import KinkLight from '@/app/cardproducts/KinkLight/page';
import Maytoni from '@/app/cardproducts/Maytoni/page';

export default function ImageHoverEffect() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { image: './images/105.png' },
    { image: './images/106.png' },
    { image: './images/107.png' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row w-full mt-20 lg:mt-44 h-auto lg:h-[600px] bg-white">
        {/* Left Block: Slider */}
        <div className="w-full lg:w-1/2 h-[300px] lg:h-full p-4">
          <div className="w-full h-full bg-white rounded-lg overflow-hidden relative shadow-lg">
            {slides.map((slide, index) => (
              <motion.img
                key={index}
                src={slide.image}
                alt={`Slide ${index}`}
                className={`absolute w-full h-full object-cover ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: currentSlide === index ? 1 : 0,
                }}
                transition={{ duration: 0.8 }}
              />
            ))}

            {/* Banner Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="absolute top-2/3 left-2/3 transform -translate-x-1/2 text-neutral-950 text-2xl sm:text-4xl lg:text-6xl backdrop-blur-sm bg-transparent font-bold text-center"
            >
              Подробнее
            </motion.div>
          </div>
        </div>

        {/* Right Block: Products */}
         <div className="w-full lg:w-1/2 max-md:hidden h-auto lg:h-full flex flex-col justify-between p-4 overflow-y-scroll">
          <h2 className="text-black  font-bold text-2xl sm:text-3xl lg:text-5xl">
            Подборка товаров
          </h2>
          <div className="flex flex-col  gap-6">
            {/* KinkLight */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="w-full bg-white text-black rounded-lg p-4 "
            >
              <LightStar />
       
            </motion.div>
            
          </div>
        </div>
      </div>

      {/* Additional Section: Chandeliers */}
      <div className="mt-16 px-6 lg:px-20">
        <h2 className="text-black text-2xl sm:text-4xl lg:text-5xl font-bold mb-8">
          Популярные люстры
        </h2>
       <Maytoni />
      </div>

      {/* Additional Section: Other Categories */}
      <div className="mt-16 px-6 lg:px-20">
        <h2 className="text-black text-2xl sm:text-4xl lg:text-5xl font-bold mb-8">
          Рекомендуемые категории
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Placeholder for other categories */}
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center"
            >
              <div className="w-32 h-32 bg-gray-200 rounded-full mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">
                Категория {index + 1}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
