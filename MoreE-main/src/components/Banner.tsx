'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LightStar from '@/app/cardproducts/LightStar/page';
import KinkLight from '@/app/cardproducts/KinkLight/page';
import Maytoni from '@/app/cardproducts/Maytoni/page';

export default function ImageHoverEffect() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { image: './images/1.png' },
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
      <div className="flex flex-col lg:flex-row w-full mt-10 lg:mt-32 h-auto lg:h-[600px] bg-white">
        {/* Left Block: Slider */}
        <div className="w-full h-[300px] lg:h-[510px] relative overflow-hidden">
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



</div>

</div>
<LightStar />
      {/* Additional Section: Chandeliers */}
      <div className="mt-16 px-6 lg:px-20">
        <h2 className="text-black text-2xl sm:text-4xl lg:text-5xl font-bold mb-8">
          Популярные люстры
        </h2>
       <Maytoni />
      </div>
    </div>
  );
}
