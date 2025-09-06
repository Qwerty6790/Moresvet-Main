'use client';

import React from 'react';
import { Analytics } from "@vercel/analytics/react";
import ImageHoverEffect, { ExtraSections } from '@/components/Hero';


export default function Home() {
  return (
    <div>

    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b  relative overflow-hidden">
      <Analytics />
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b z-0" />
      <ImageHoverEffect />
      {/* Extra sections внизу главной */}
      <ExtraSections />
    </div>
    </div>
  );
}
