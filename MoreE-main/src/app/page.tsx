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
      </div>
    </div>
  );
}
