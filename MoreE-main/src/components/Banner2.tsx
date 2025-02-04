'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LightStar from '@/app/cardproducts/LightStar/page';
import Maytoni from '@/app/cardproducts/LightStar2/page';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SmartLightingBot from './ChatBot';
import LightStar2 from '@/app/cardproducts/LightStar2/page';

export default function ImageHoverEffect2() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { image: './images/2.png' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="flex flex-col  max-md:mt-32 lg:flex-row w-full h-auto lg:h-[600px] bg-white">
        {/* Left Block: Slider */}
        <div className="w-full max-md:hidden h-screen lg:h-full relative overflow-hidden">
          {slides.map((slide, index) => (
            <motion.img
              key={index}
              src={slide.image}
              alt={`Slide ${index}`}
              className={`absolute w-full h-full object-cover lg:object-contain ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: currentSlide === index ? 1 : 0,
              }}
              transition={{ duration: 0.8 }}
            />
            
          ))}

          {/* Left Arrow */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2  p-3 rounded-full shadow-md "
          >
            <ChevronLeft color='black' size={40} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2  p-3 rounded-full shadow-md "
          >
            <ChevronRight color='black' size={40} />
          </button>

          {/* Pagination Dots */}
        
        </div>
      </div>

    
      {/* Additional Section: Chandeliers */}
      <div className=" px-6 lg:px-20">
      </div>
      <div className="px-6 lg:px-20 mt-10">
        <LightStar />
      </div>
    </div>
  );
}