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
  isVideo: boolean;
  videoUrl: string;
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
      image: '/images/1-3-scaled111.webp',
      title: 'Выбирай свой свет',
      subtitle: 'Делай дизайн своим выбором',
      textColor: 'white',
      isVideo: true,
      videoUrl: '/images/dzx1j_8hlzu.mp4'
    },
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
    { id: 1, title: 'ЛЮСТРЫ', image: '/images/Lustracategpory.png', link: '/osveheny?category=Люстра&page=1' },
    { id: 2, title: 'СВЕТИЛЬНИКИ', image: '/images/svetilnikicategory.png', link: '/osveheny/Светильник' },
    { id: 3, title: 'БРА И ПОДСВЕТКИ', image: '/images/bracategory.png', link: '/osveheny/Бра' },
    { id: 4, title: 'НАСТОЛЬНЫЕ ЛАМПЫ', image: '/images/nastolnycategory.png', link: '/osveheny/Настольная лампа' },
    { id: 5, title: 'ТОРШЕРЫ', image: '/images/torhernaplonacategory.png', link: '/osveheny/Торшер' },
    { id: 6, title: 'УЛИЧНОЕ ОСВЕЩЕНИЕ', image: '/images/ylihnoecategory.png', link: '/osveheny/Уличный светильник' },
  ];

  return (
    <div className="w-full">
      {/* Фоновое изображение для слайдера */}
      <div className="absolute top-0 left-0 right-0 h-screen -z-10">
        {sliderData.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
          >
            {slide.isVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={slide.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${slide.image}')`,
                }}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Баннер-слайдер */}
      <div className="relative pt-36 w-full h-screen">
        <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-112px)] flex items-center">
          {sliderData.map((slide, index) => (
            <div 
              key={index} 
              className={`w-1/2 transition-opacity  duration-1000 ease-in-out absolute ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
            >
              <h1 className={`text-7xl font-bold mb-2 ${slide.textColor === 'white' ? 'text-white' : 'text-black'}`}>
                {slide.title}
              </h1>
              <h2 className={`text-7xl font-bold mb-8 ${slide.textColor === 'white' ? 'text-white' : 'text-black'}`}>
                {slide.subtitle}
              </h2>
              
          
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
                    <Link href={category.link} className="group block text-center h-full">
                      <div className="relative rounded-md overflow-hidden h-[200px]">
                        <img 
                          src={category.image} 
                          alt={category.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out p-2"
                        />
                        <div className="absolute right-0 w-1/2 h-full bg-gradient-to-t  transition-all duration-300"></div>
                      </div>
                      <p className="font-bold text-black mt-3 group-hover:text-yellow-300 transition-colors duration-200">{category.title}</p>
                    </Link>
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
                <p className="text-lg text-gray-600 mb-8">
                  Новые функциональные светильники от производителей, которые придадут вашему интерьеру элегантность.
                </p>
                <div className="relative h-[300px] mt-8 group">
                  <div className="absolute inset-0 bg-[url('/images/Дизайн_без_названия__11__308fc32673a6c219bff706661f135e79.webp')] bg-cover bg-center rounded-2xl overflow-hidden transition-opacity duration-500 ease-in-out ">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent "></div>
                  </div>
          
                </div>
              </div>

              {/* Правая часть с фотографией */}
              <div className="w-1/2 relative h-[600px] group">
                <h2 className='text-4xl py-8 font-bold text-gray-900'>
                  Открывай для себя новые возможности каждый день
                </h2>
                <span className='text-2xl text-gray-600'>
                  Мы предлагаем широкий ассортимент светильников, люстр и электротехнических товаров от лучших мировых производителей.
                  У нас вы можете найти все, что вам нужно для освещения вашего дома или офиса. Так же предлагаем не только продажу, но и полный комплекс услуг по проектированию и монтажу.Плюсом является то, что мы работаем с любыми покупателями, как физическими, так и юридическими лицами.
                </span>
              </div>
            </div>
            <div>
            <h2 className="text-3xl font-bold  text-center">О компании MoreElecktriki</h2>
            <div className=" gap-12 items-center">
              {/* Левая часть - текст о компании */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-black">Освещаем вашу жизнь</h3>
                  <p className="text-black leading-relaxed">
                    MoreElecktriki — ведущий поставщик качественного освещения в России. 
                    Мы специализируемся на продаже премиальных светильников, люстр и 
                    электротехнических товаров от лучших мировых производителей.
                  </p>
                  <p className="text-black leading-relaxed">
                    Наша команда профессионалов поможет вам создать идеальное освещение 
                    для дома, офиса или коммерческого объекта. Мы предлагаем не только 
                    продажу, но и полный комплекс услуг по проектированию и монтажу.
                  </p>
                </div>
              </div>


          

            </div>
          </div>
          </div>

          {/* О компании MoreElecktriki */}
       
        </div>
      </div>
    </div>
  );
}

