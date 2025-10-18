'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Banner() {
  return (
    <div className="relative">
      {/* Hero Video Section */}
      <div className="relative w-screen left-1/2 right-1/2 mx-[-50vw] h-screen max-h-[900px] overflow-hidden">
        <video
          autoPlay
          muted
          playsInline
          className="absolute z-0 w-full h-full object-cover"
        >
          <source src="/images/banners/steel.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-black opacity-30"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6 max-w-4xl">
            <h1 className="text-white  text-5xl md:text-7xl lg:text-8xl font-light tracking-widest mb-6">
             Воплощения света в твоем доме
            </h1>
            <p className="text-white/90 text-lg md:text-xl lg:text-2xl font-light tracking-wide mb-12">
             Искусство света в наших руках
            </p>
           
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExtraSections() {
  return (
    <div className="bg-white">
      {/* About Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="order-2 md:order-1 p-2">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src="/images/banners/Bannerstorher.webp"
                alt="Интерьер"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="order-1 md:order-2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-light tracking-wide text-black">
              Почему выбирают нас
            </h2>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
 это не просто магазин светильников, а команда специалистов, которые помогают каждому клиенту подобрать оптимальное решение. Мы учитываем особенности интерьера, стиль помещения, ваши пожелания и бюджет, чтобы создать гармоничное освещение для любой задачи.
              </p>
              
              <p>
                В нашем каталоге представлены как практичные модели для повседневного использования, так и эксклюзивные дизайнерские коллекции для тех, кто ценит индивидуальность.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}