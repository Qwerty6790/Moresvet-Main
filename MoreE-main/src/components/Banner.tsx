'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Gem } from 'lucide-react';
import LightStar from '@/app/cardproducts/LightStar/page';

export default function ChandelierSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = [
    { 
      image: './images/1.png', 
      title: 'Люстра LODI',
      description: '43W 723227 ДЕРЕВО',
      details: '34162 ₽'
    },
    { 
      image: './images/5.png', 
      title: 'Люстра VARESE',
      description: '731403 ЗОЛОТО',
      details: '68848 ₽'
    },
  
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        type: "spring",
        stiffness: 50
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.8,
        type: "spring",
        stiffness: 50
      }
    })
  };

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 overflow-hidden relative">
      {/* Slider Container */}
      <div className="relative w-full h-screen flex items-center justify-center">
        {/* Animated Slide */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute w-full h-full flex items-center justify-center"
          >
            {/* Subtle Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br  opacity-50" />
            
            {/* Image Container */}
            <div className="relative w-full max-w-5xl px-10 flex items-center justify-between">
              {/* Chandelier Details */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-1/3 space-y-6 pr-10"
              >
                <div className="flex items-center space-x-3">
                  <Gem className="text-gold-500 w-full h-10" />
                  <h2 className="text-7xl max-md:text-5xl font-thin tracking-wider text-gray-800">
                    {slides[currentSlide].title}
                  </h2>
                </div>
                <p className="text-7xl max-md:text-4xl  font-light text-gray-600">
                  {slides[currentSlide].description}
                </p>
                <div className=" rounded-xl p-2 max-md:border-hidden  border border-gray-200 shadow-sm">
                  <p className="text-2xl  font-medium uppercase tracking-widest">
                    {slides[currentSlide].details}
                  </p>
                </div>
              </motion.div>

              {/* Chandelier Image */}
              <motion.img
                src={slides[currentSlide].image}
                alt={`Chandelier ${currentSlide + 1}`}
                className="w-1/2 object-contain z-10 transform hover:scale-105 transition-transform duration-500 ease-in-out  rounded-2xl"
                initial={{ rotate: -3, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-10 top-1/2 transform -translate-y-1/2 z-20 
            hover:shadow-xl p-4 rounded-full 
            transition duration-300 group"
        >
          <ChevronLeft className="text-gray-700 group-hover:text-gray-900" size={40} />
        </button>
        
        <button
          onClick={handleNextSlide}
          className="absolute right-10 top-1/2 transform -translate-y-1/2 z-20 
             hover:shadow-xl p-4 rounded-full 
            transition duration-300 group"
        >
          <ChevronRight className="text-gray-700 group-hover:text-gray-900" size={40} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 
                ${currentSlide === index ? 'bg-gray-800 w-8' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Additional Section */}
     
    </div>
  );
}