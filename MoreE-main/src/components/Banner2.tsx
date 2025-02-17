'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ImageHoverEffect2() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [{ image: './images/17.jpg' },{ image: './images/20.jpg' }];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row w-full h-[450px] lg:h-[600px] bg-white relative">
        {/* Left Block: Slider */}
        <div className="w-full h-full relative overflow-hidden flex justify-center items-center">
          {slides.map((slide, index) => (
            <motion.img
              key={index}
              src={slide.image}
              alt={`Slide ${index}`}
              className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentSlide === index ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            />
          ))}

          {/* Text Overlay */}
          <motion.div
            className="absolute text-white text-4xl sm:text-5xl md:text-6xl lg:text-9xl font-bold px-4 sm:px-8 md:px-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            Выбирай свой свет
          </motion.div>
        </div>
      </div>
    </div>
  );
}
