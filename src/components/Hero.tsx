'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  media: string;
  mobileMedia: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

const slides: Slide[] = [
  {
    id: 1,
    media: '/images/banners/BannersOsveheny1.jpg',
    mobileMedia: '/images/banners/BannersOsveheny1.jpg',
    title: 'ИЩИ НА MORESVET',
    subtitle: 'СВЕТОЧНЫЕ РЕШЕНИЯ ДЛЯ ВАШЕГО ДОМА',
    buttonText: 'ПОДРОБНЕЕ',
    buttonLink: '/catalog/track-lights'
  },
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Hero Slider */}
      <div className="relative w-screen left-[50%] right-[50%] mx-[-50vw] h-screen max-h-[900px]">
        <div className="absolute inset-0 overflow-hidden bg-black">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.media}
                alt={slide.title}
                className="w-full h-full object-cover opacity-70"
              />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6 max-w-4xl">
                  <h1 
                    className={`text-white text-5xl md:text-7xl lg:text-8xl font-light tracking-wider mb-6 transition-all duration-1000 ${
                      index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                  >
                    {slide.title}
                  </h1>
                  <p 
                    className={`text-white/90 text-lg md:text-xl lg:text-2xl font-light tracking-wide mb-12 transition-all duration-1000 delay-200 ${
                      index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                  >
                    {slide.subtitle}
                  </p>
                  <a
                    href={slide.buttonLink}
                    className={`inline-flex items-center gap-3 px-10 py-4 bg-transparent border border-white text-white text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-500 ${
                      index === currentSlide ? 'opacity-100 translate-y-0 delay-400' : 'opacity-0 translate-y-8'
                    }`}
                  >
                    {slide.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-8 top-1/2 -translate-y-1/2 z-30 p-3 text-white/60 hover:text-white transition-colors duration-300"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-8 top-1/2 -translate-y-1/2 z-30 p-3 text-white/60 hover:text-white transition-colors duration-300"
                aria-label="Next slide"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {slides.length > 1 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-12 h-0.5 transition-all duration-500 ${
                    index === currentSlide ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
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
         {/* К родительскому блоку добавлен отступ p-4, чтобы уменьшить внутренний блок */}
<div className="order-2 md:order-1 p-2">
  <div className="relative aspect-[4/5] overflow-hidden">
    <img
      src="/images/banners/Bannerstorher.webp"
      alt="Интерьер"
      className="w-full h-full object-cover rounded-lg" // Опционально: можно скруглить углы у картинки
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
                MORESVET — это не просто магазин светильников, а команда специалистов, которые помогают каждому клиенту подобрать оптимальное решение. Мы учитываем особенности интерьера, стиль помещения, ваши пожелания и бюджет, чтобы создать гармоничное освещение для любой задачи.
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