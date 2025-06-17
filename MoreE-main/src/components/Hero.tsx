'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

// --- КОНЕЦ ДАННЫХ ДЛЯ СЛАЙДЕРОВ ---

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Данные для слайдера баннера
  const sliderData = [
    {
      image: '/images/Снимок экрана 2025-06-17 121935.png',
      title: 'Специальное предложение',
      subtitle: 'Скидки до 30%',
      description: 'На избранные модели светильников',
      buttonText: 'Узнать больше'
    },
    {
      image: '/images/Дизайн_без_названия__11__308fc32673a6c219bff706661f135e79.webp',
      title: 'Специальное предложение',
      subtitle: 'Скидки до 30%',
      description: 'На избранные модели светильников',
      buttonText: 'Узнать больше'
    }
  ];

  // Автоматическое переключение слайдов
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sliderData.length]);

  // Функция для переключения на конкретный слайд
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Популярные категории для каталога
  const popularCategories = [
    { id: 1, title: 'ЛЮСТРЫ', image: '/images/lustry.jpg', link: '/catalog?category=Люстра&page=1' },
    { id: 2, title: 'СВЕТИЛЬНИКИ', image: '/images/svetilniki.jpeg', link: '/catalog/Светильник' },
    { id: 3, title: 'БРА И ПОДСВЕТКИ', image: '/images/bra.jpeg', link: '/catalog/Бра' },
    { id: 4, title: 'НАСТОЛЬНЫЕ ЛАМПЫ', image: '/images/nastolny.jpg', link: '/catalog/Настольная лампа' },
    { id: 5, title: 'ТОРШЕРЫ', image: '/images/torher.jpg', link: '/catalog/Торшер' },
    { id: 6, title: 'УЛИЧНОЕ ОСВЕЩЕНИЕ', image: '/images/ylihnoe.jpg', link: '/catalog/Уличный светильник' }
  ];

  return (
    <div className="w-full">
      {/* Фоновое изображение для слайдера */}
      <div className="absolute top-0 left-0 right-0 h-screen -z-10">
        {sliderData.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url('${slide.image}')`,
            }}
          />
        ))}
      </div>
      
      {/* Баннер-слайдер */}
      <div className="relative pt-36 w-full h-screen">
        <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-112px)] flex items-center">
          {sliderData.map((slide, index) => (
            <div 
              key={index} 
              className={`w-1/2 transition-opacity duration-1000 ease-in-out absolute ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
            >
              <h1 className="text-black text-7xl font-bold mb-2">{slide.title}</h1>
              <h2 className="text-black text-7xl font-bold mb-8">{slide.subtitle}</h2>
              <p className="text-black text-xl mb-8">{slide.description}</p>
              
              <button className="bg-white text-black font-medium px-8 py-4 rounded-md hover:bg-opacity-90 transition-colors">
                {slide.buttonText}
              </button>
            </div>
          ))}
          
          {/* Индикаторы слайдера */}
          <div className="absolute bottom-10 left-4 flex space-x-2">
            {sliderData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Контент под баннером */}
      <div className="bg-white py-16 relative">
        <div className="max-w-7xl mx-auto px-4">
          {/* Популярные категории */}
          <div className="grid grid-cols-7 gap-8 justify-items-center">
            {popularCategories.map((category) => (
              <Link 
                key={category.id} 
                href={category.link}
                className="flex flex-col items-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-full h-full mb-4 flex items-center justify-center bg-gray-100 transition-colors">
                  <Image
                    src={category.image}
                    alt={category.title}
                    width={140}
                    height={140}
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-gray-800 text-center leading-tight">
                  {category.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

