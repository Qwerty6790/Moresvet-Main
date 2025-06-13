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

  return (
    <div className="w-full pt-screen">
      {/* Контент под баннером */}
      <div className="bg-white py-12">
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

