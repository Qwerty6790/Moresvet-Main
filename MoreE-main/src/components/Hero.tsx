'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import Maytoni from '@/app/cardproducts/page';

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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, []);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.currentTime >= 4) {
      v.pause();
      v.currentTime = 4;
    }
  };

  // Данные для баннера
  const bannerData = {
    title: 'Выбирай свой свет',
    subtitle: 'Сделай дизайн своим выбором',
    textColor: 'white',
    videoUrl: '/images/dzx1j_8hlzu.mp4'
  };

  // Популярные категории для каталога
  const popularCategories = [
    { id: 1, title: 'ЛЮСТРЫ', image: '/images/Lustracategpory.png', link: '/osveheny?category=Люстра' },
    { id: 2, title: 'СВЕТИЛЬНИКИ', image: '/images/svetilnikicategory.png', link: '/osveheny?category=Светильник' },
    { id: 3, title: 'БРА И ПОДСВЕТКИ', image: '/images/bracategory.png', link: '/osveheny?category=Бра' },
    { id: 4, title: 'НАСТОЛЬНЫЕ ЛАМПЫ', image: '/images/nastolnycategory.png', link: '/osveheny?category=Настольная%20лампа' },
    { id: 5, title: 'ТОРШЕРЫ', image: '/images/torhernaplonacategory.png', link: '/osveheny?category=Торшер' },
    { id: 6, title: 'УЛИЧНОЕ ОСВЕЩЕНИЕ', image: '/images/ylihnoecategory.png', link: '/osveheny?category=Уличный%20светильник' },
  ];

  return (
    <div className="w-full">
      {/* Видео баннер */}
      <div className="absolute top-0 left-0 right-0 h-screen -z-10">
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover"
          >
            <source src={bannerData.videoUrl} type="video/mp4" />
          </video>
        </div>
      </div>
      
      {/* Контент баннера */}
      <div className="relative pt-36 w-full h-screen">
        <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-112px)] flex items-center">
          <div className="w-1/2">
            <h1 className={`text-7xl font-bold mb-2 ${bannerData.textColor === 'white' ? 'text-white' : 'text-black'}`}>
              {bannerData.title}
            </h1>
            <h2 className={`text-7xl font-bold mb-8 ${bannerData.textColor === 'white' ? 'text-white' : 'text-black'}`}>
              {bannerData.subtitle}
            </h2>
          </div>
        </div>
      </div>

      {/* Контент под баннером */}
      <div className="bg-white py-12 relative">
        <div className="max-w-7xl mx-auto px-4">
         
          {/* Категории товаров */}
          <div className="mb-12 relative">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gray-100 -z-10"></div>
            <div className="mx-auto">
              <h2 className="text-3xl text-black font-bold mb-8">Популярные категории</h2>
              <div className="grid grid-cols-6 gap-4 relative">
                {popularCategories.map((category, index) => (
                  <div
                    key={category.id}
                    className="transform transition-transform duration-200 hover:scale-105"
                  >
                    <a href={category.link} className="group block text-center h-full">
                      <div className="relative rounded-md overflow-hidden h-[200px]">
                        <img 
                          src={category.image} 
                          alt={category.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out p-2"
                        />
                        <div className="absolute right-0 w-1/2 h-full bg-gradient-to-t  transition-all duration-300"></div>
                      </div>
                      <p className="font-bold text-black mt-3 group-hover:text-yellow-300 transition-colors duration-200">{category.title}</p>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Новая секция с тезисами и фотографией */}
          <div className="mb-24">
            <div className="flex gap-12">
              {/* Левая часть с тезисами */}
              <div className="w-1/2 space-y-8 py-8">
                <h2 className="text-4xl font-bold text-gray-900">
                  Твой свет для комфорта:<br/>
                  новинки от производителей
                </h2>
                <p className="text-lg text-black mb-8">
                  Новые функциональные светильники от производителей, которые придадут вашему интерьеру элегантность.
                </p>
                <div className="relative h-[300px] mt-8 group">
                  <div className="absolute inset-0 bg-[url('/images/photo.webp')] bg-cover bg-center rounded-2xl overflow-hidden transition-opacity duration-500 ease-in-out ">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent "></div>
                  </div>
                </div>
              </div>

              {/* Правая часть с фотографией */}
              <div className="w-1/2 relative h-[600px] group">
                <h2 className='text-4xl py-8 font-bold text-gray-900'>
                  Открывай для себя новые возможности каждый день
                </h2>
                <span className='text-2xl text-black'>
                  Мы предлагаем широкий ассортимент светильников, люстр и электротехнических товаров от лучших мировых производителей.
                  У нас вы можете найти все, что вам нужно для освещения вашего дома или офиса. Так же предлагаем не только продажу, но и полный комплекс услуг по проектированию и монтажу.Плюсом является то, что мы работаем с любыми покупателями, как физическими, так и юридическими лицами.
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-center">О компании MoreElecktriki</h2>
              <div className="gap-12 items-center">
                {/* Левая часть - текст о компании */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-4xl font-bold text-black">Освещаем вашу жизнь</h3>
                    <p className="text-black text-2xl leading-relaxed">
                      MoreElecktriki — ведущий поставщик качественного освещения в России. 
                      Мы специализируемся на продаже премиальных светильников, люстр и 
                      электротехнических товаров от лучших мировых производителей.
                    </p>
                    <p className="text-black text-2xl leading-relaxed">
                      Наша команда профессионалов поможет вам создать идеальное освещение 
                      для дома, офиса или коммерческого объекта. Мы предлагаем не только 
                      продажу, но и полный комплекс услуг по проектированию и монтажу.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

