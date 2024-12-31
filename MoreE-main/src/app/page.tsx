'use client';

import React from 'react';
import { Analytics } from "@vercel/analytics/react";
import KinkLight from './cardproducts/KinkLight/page';
import LightStar from './cardproducts/LightStar/page';
import { motion } from 'framer-motion';
import ImageHoverEffect from '@/components/Banner';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b  relative overflow-hidden">
      <Analytics />
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b z-0" />

      {/* Background Products with Motion */}
     <ImageHoverEffect />
      {/* Content Container */}
      <div className="relative w-full flex flex-col items-center px-6 lg:px-16 z-10 text-center">
        {/* Hero Section */}
        <div className="mt-40 space-y-5 relative">
          <p className="mt-4 font-bold text-4xl md:text-6xl text-black">
           10 000+ товаров
          </p>    
        </div>
      </div>
    </div>
  );
}
