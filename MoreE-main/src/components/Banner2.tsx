'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ImageHoverEffect2() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { type: 'video', src: './images/voltum.mp4' },
 // Добавлено видео
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="flex cona flex-col mt-32 lg:flex-row w-full h-[450px] lg:h-screen bg-white relative">
        {/* Left Block: Slider */}
        <div className="w-full h-full relative overflow-hidden flex justify-center items-center">
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              className={`absolute w-full h-full transition-opacity duration-1000 ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentSlide === index ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              {slide.type === 'image' ? (
                <img src={slide.src} alt={`Slide ${index}`} className="w-full h-full object-cover" />
              ) : (
                <video autoPlay loop muted className="w-full h-full object-cover">
                  <source src={slide.src} type="video/mp4" />
                  Ваш браузер не поддерживает видео.
                </video>
              )}
            </motion.div>
          ))}

          {/* Text Overlay */}
          <motion.div
            className="absolute text-white text-4xl sm:text-5xl md:text-6xl lg:text-9xl font-bold px-4 sm:px-8 md:px-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <span className='text-[7px]'>Выбирай</span> свой свет вместе с <span className='text-[#0a0c34]'>Voltum</span><span className='text-[7px]'>Maytoni</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
