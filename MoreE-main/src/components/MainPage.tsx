'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BrandSlider from './BrandSlider';

// --- ТИПЫ ДАННЫХ ---
interface MainBannerSlide {
  id: number;
  bgImage: string;
  alt: string;
  title1: string;
  title2: string;
  buttonText: string;
  subText: string;
}

interface SideBannerSlide {
   id: number;
   image: string;
   alt: string;
   title1: string;
   title2: string;
   description: string;
   buttonText: string;
}

// --- ДАННЫЕ ДЛЯ СЛАЙДЕРОВ ---
const mainBannerSlides: MainBannerSlide[] = [
  {
    id: 1,
    bgImage: "/images/blue-orange-paint.jpg", // Синий фон с оранжевыми брызгами как на изображении
    alt: "Серия R98 Trendy Colors",
    title1: "Серия R98",
    title2: "Trendy Colors",
    buttonText: "Подробности скоро...",
    subText: "24 трендовых оттенка стандарта NCS"
  }
];

const sideBannerSlides: SideBannerSlide[] = [
 {
    id: 1,
    image: "/images/assets_task_01jrdm30zaf5cvz42m590jpvgj_img_0.webp",
    alt: "Специальное предложение",
    title1: "СПЕЦИАЛЬНОЕ",
    title2: "ПРЕДЛОЖЕНИЕ",
    description: "Скидка 20% на всю серию VOLTUM",
    buttonText: "подробнее",
 },
 {
    id: 2, // Добавляем ТРЕТИЙ баннер
    image: "/images/image.png", // Пример изображения
    alt: "О нас",
    title1: "Рассказать?",
    title2: "О нас",
    description: "",
    buttonText: "подробнее",
 },
 
];
// --- КОНЕЦ ДАННЫХ ДЛЯ СЛАЙДЕРОВ ---

export default function Banner() {
  // Слайды для основного баннера
  const mainBannerSlides: MainBannerSlide[] = [
    {
      id: 1,
      bgImage: "/images/blue-orange-paint.jpg", // Синий фон с оранжевыми брызгами как на изображении
      alt: "Серия R98 Trendy Colors",
      title1: "Серия R98",
      title2: "Trendy Colors",
      buttonText: "Подробности скоро...",
      subText: "24 трендовых оттенка стандарта NCS"
    }
  ];

  // Состояния для индексов текущих слайдов
  const [currentMainSlideIndex, setCurrentMainSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Функции для ручного переключения
  const nextMainSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentMainSlideIndex((prevIndex) =>
      prevIndex === mainBannerSlides.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsTransitioning(false), 800);
  };
  
  const prevMainSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentMainSlideIndex((prevIndex) =>
      prevIndex === 0 ? mainBannerSlides.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 800);
  };

  // Получаем данные текущего слайда для основного баннера
  const currentMainSlide = mainBannerSlides[currentMainSlideIndex];

  return (
    <div className="w-full bg-[#0a1f38] pt-28">
      {/* Главный баннер */}
      <div className="relative w-full h-[calc(100vh-112px)] overflow-hidden">
        {/* Фоновое изображение */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={currentMainSlide.bgImage} 
            alt={currentMainSlide.alt} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        
        {/* Контент поверх фона */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="w-1/2">
            <h1 className="text-white text-7xl font-bold mb-2">{currentMainSlide.title1}</h1>
            <h2 className="text-white text-7xl font-bold mb-8">{currentMainSlide.title2}</h2>
            <p className="text-white text-xl mb-8">{currentMainSlide.subText}</p>
            
            <button className="bg-white text-black font-medium px-8 py-4 rounded-md hover:bg-opacity-90 transition-colors">
              {currentMainSlide.buttonText}
            </button>
          </div>
          
          {/* Правая часть с изображением устройства */}
          <div className="w-1/2 relative">
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
              <div className="relative w-96 h-96 bg-[#0a1f38] border-4 border-[#0a1f38] rounded-lg overflow-hidden">
                {/* Здесь можно добавить изображение устройства, если нужно */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Кнопки навигации */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <button 
            onClick={prevMainSlide}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button 
            onClick={nextMainSlide}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

