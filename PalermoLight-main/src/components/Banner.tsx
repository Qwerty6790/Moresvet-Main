'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageHoverEffect() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);
  const [showOverlayText, setShowOverlayText] = useState(false);

  const slides = [
    { beforeImage: './images/105.png' },
    { beforeImage: './images/106.png' },
    { beforeImage: './images/107.png' },
    { beforeImage: './images/108.png' },
    { beforeImage: './images/109.png' },
  ];
  
 

  return (
    <div className="relative  w-full h-[690px] flex flex-col items-center justify-center overflow-hidden">
      {/* Slides Row */}
      <div className="flex justify-center space-x-6 w-full  px-10">
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            className={`relative hover:scale-110 w-1/4 max-w-[300px] aspect-square overflow-hidden rounded-xl shadow-lg transition-transform duration-700 ease-in-out ${
              fade ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
          >
            <img
              src={slide.beforeImage}
              alt={`Slide ${index}`}
              className="w-full h-full object-cover rounded-xl"
            />
          </motion.div>
        ))}
      </div>

      

      {/* Overlay Text */}
      <AnimatePresence>
        {showOverlayText && (
          <motion.div
            className="absolute bottom-16 right-16 flex items-center justify-center z-30"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '50%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            {/* Add your overlay text here */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centered Button */}
    
    </div>
  );
}
