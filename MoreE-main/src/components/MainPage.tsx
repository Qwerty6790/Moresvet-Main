'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BrandSlider from './BrandSlider';
import Maytoni from '@/app/cardproducts/page';

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
    bgImage: "/images/assets_task_01jrdh7qpqf7ftcpemen2q4j7c_img_0.webp", // Синий фон с оранжевыми брызгами как на изображении
    alt: "Серия R98 Trendy Colors",
    title1: "Серия R98",
    title2: "Trendy Colors",
    buttonText: "Подробности скоро...",
    subText: "24 трендовых оттенка стандарта NCS"
  }
];

// Данные для боковых баннеров
const sideBannerSlides: SideBannerSlide[] = [
 {
    id: 1,
    image: "/images/assets_task_01jrdh7qpqf7ftcpemen2q4j7c_img_0.webp",
    alt: "Специальное предложение",
    title1: "СПЕЦИАЛЬНОЕ",
    title2: "ПРЕДЛОЖЕНИЕ",
    description: "Скидка 20% на всю серию VOLTUM",
    buttonText: "подробнее",
 },
 {
    id: 2,
    image: "/images/image.png",
    alt: "О нас",
    title1: "Рассказать?",
    title2: "О нас",
    description: "",
    buttonText: "подробнее",
 },
];
// --- КОНЕЦ ДАННЫХ ДЛЯ СЛАЙДЕРОВ ---

export default function Banner() {
  // Популярные категории для каталога
  const popularCategories = [
    { id: 1, title: 'ЛЮСТРЫ', image: '/images/ЛюстраME.webp', link: '/catalog?category=Люстра&page=1' },
    { id: 2, title: 'СВЕТИЛЬНИКИ', image: '/images/светильникME.webp', link: '/catalog/Светильник' },
    { id: 3, title: 'БРА И ПОДСВЕТКИ', image: '/images/БраME.webp', link: '/catalog/Бра' },
    { id: 4, title: 'Лампочки', image: '/images/светоидоднаялампаME.webp', link: '/catalog/Лампочка' },
    { id: 5, title: 'НАСТОЛЬНЫЕ ЛАМПЫ', image: '/images/настольнаялампаME.webp', link: '/catalog/Настольная лампа' },
    { id: 6, title: 'ТОРШЕРЫ', image: '/images/ТоршерME.webp', link: '/catalog/Торшер' },
    { id: 7, title: 'УЛИЧНОЕ ОСВЕЩЕНИЕ', image: '/images/УличныйСветME.png', link: '/catalog/Уличный светильник' }
  ];

  // Слайды для основного баннера
  const mainBannerSlides: MainBannerSlide[] = [
    {
      id: 1,
      bgImage: "/images/assets_task_01jrdh7qpqf7ftcpemen2q4j7c_img_0.webp", // Синий фон с оранжевыми брызгами как на изображении
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
  // Получаем данные для двух боковых баннеров
  const sideBannerTop = sideBannerSlides[0]; // Первый элемент для верхнего
  const sideBannerBottom = sideBannerSlides[1]; // Второй элемент для нижнего

  return (
    <div className="relative pt-28">
      {/* Фоновое изображение для всей страницы */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/assets_task_01jrdh7qpqf7ftcpemen2q4j7c_img_0.webp" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Главный баннер */}
      <div className="relative z-10 w-full h-[calc(100vh-112px)] overflow-hidden">
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
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
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

      {/* Контент под баннером */}
      <div className="relative z-10 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Слайдер брендов с автоматической прокруткой */}
          <div className="mb-12">
            <div className="container mx-auto">
              <BrandSlider />
            </div>
          </div>

          {/* Категории товаров */}
          <div className="mb-12">
            <div className="mx-auto">
              <h2 className="text-3xl font-bold mb-8">Популярные категории</h2>
              <div className="grid grid-cols-8 gap-4 relative">
                {popularCategories.map((category, index) => (
                  <div
                    key={category.id}
                    className={`transform transition-transform duration-200 hover:scale-105 ${
                      index === 0 ? 'col-span-3 row-span-2' : 
                      index === 1 ? 'col-span-1 row-span-1' : 
                      index === 2 ? 'col-span-2 row-span-1' : 
                      index === 3 ? 'col-span-2 row-span-1' : 
                      index === 4 ? 'col-span-2 row-span-0' : 
                      index === 5 ? 'col-span-1 row-span-1' : 
                      'col-span-2 row-span-1'
                    }`}
                  >
                    <Link href={category.link} className="group block text-center h-full">
                      <div className={`relative rounded-md overflow-hidden ${
                        index === 0 || index === 4 ? 'h-full' : 'h-96'
                      } mb-2`}>
                        <img 
                          src={category.image} 
                          alt={category.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out p-2"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/20 transition-all duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <p className="font-bold group-hover:text-yellow-300 transition-colors duration-200">{category.title}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

