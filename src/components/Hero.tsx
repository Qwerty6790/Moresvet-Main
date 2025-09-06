'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight } from 'lucide-react';





interface Slide {
  id: number;
  media: string;
  mobileMedia: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

interface Category {
  id: number;
  title: string;
  image: string;
  link: string;
}

const slides: Slide[] = [
  {
    id: 1,
    media: '/images/banners/Evolution Изображение особенности серии продуктов (1).jpg',
    mobileMedia: '/images/banners/8538 Интерьерное изображение квадрат для серии продуктов.jpg',
    title: 'ИЩИ НА MORESVET',
    subtitle: 'СВЕТОЧНЫЕ РЕШЕНИЯ ДЛЯ ВАШЕГО ДОМА',
    buttonText: 'ПОДРОБНЕЕ',
    buttonLink: '/catalog/track-lights'
  },
  {
    id: 2,
    media: '/images/banners/Toys Изображение особенности серии продуктов.jpg',
    mobileMedia: '/images/banners/Toys Изображение особенности серии продуктов.jpg',
    title: 'ИЩИ НА MORESVET',
    subtitle: 'РЕШЕНИЯ ДЛЯ ВАШЕГО ДОМА',
    buttonText: 'ПОДРОБНЕЕ',
    buttonLink: '/catalog/track-lights'
  },
];

const popularCategories: Category[] = [
  {
    id: 1,
    title: 'Люстры',
    image: '/images/categories/Снимок экрана 2025-08-28 103635.png',
    link: '/catalog/chandeliers'
  },
  {
    id: 2,
    title: 'Настольные лампы',
    image: '/images/categories/Снимок экрана 2025-08-28 103752.png',
    link: '/catalog/table-lamps'
  },
  {
    id: 3,
    title: 'Бра',
    image: '/images/categories/Снимок экрана 2025-08-28 103841.png',
    link: '/catalog/wall-lights'
  },
  {
    id: 4,
    title: 'Торшеры',
    image: '/images/categories/image.png',
    link: '/catalog/floor-lamps'
  },
  {
    id: 5,
    title: 'Светильники',
    image: '/images/categories/Jelly Изображение особенности серии продуктов.jpg',
    link: '/catalog/track-lights'
  },
  {
    id: 6,
    title: 'Уличные светильники',
    image: '/images/categories/O488DL-L12GF3K Интерьерное изображение квадрат для серии продуктов.jpeg',
    link: '/catalog/outdoor-lights'
  },
  {
    id: 7,
    title: 'Розетки,выключатели',
    image: '/images/categories/elektroustnovohneIzdelycategoriy.jpg',
    link: '/ElektroustnovohneIzdely'
  },
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  // Простые функции для навигации
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Автоматическая смена слайдов
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollCategories = (direction: 'left' | 'right') => {
    const el = categoriesRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.7) || 200;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const SCROLL_STEP = 24;
  const SCROLL_INTERVAL_MS = 16;

  const startContinuousScroll = (direction: 'left' | 'right') => {
    stopContinuousScroll();
    const el = categoriesRef.current;
    if (!el) return;
    scrollIntervalRef.current = window.setInterval(() => {
      el.scrollBy({ left: direction === 'left' ? -SCROLL_STEP : SCROLL_STEP, behavior: 'smooth' });
    }, SCROLL_INTERVAL_MS) as unknown as number;
  };

  const stopContinuousScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  // dragging removed: only programmatic scrolling via arrows remains
  return (
    <div className="relative ">
      {/* Slider */}
      <div className="relative w-screen   left-[50%] right-[50%] mx-[-50vw]  h-[70vh] sm:h-[60vh] md:mt-0 md:h-[650px] lg:h-[1000px]">
        <div className="absolute inset-0 overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="block w-full h-full">
                <Image src={slide.media} alt={slide.title} fill sizes="100vw" className="object-cover object-center" priority={index === 0} quality={100} unoptimized />
              </div>

              <div className="absolute inset-0 z-20">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                  <div className="absolute z-30 p-4 md:p-8 max-w-md md:max-w-lg lg:max-w-xl top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <h1 className={`text-white text-xl md:text-3xl lg:text-6xl font-bold tracking-tight drop-shadow-sm mb-2 transform transition-all duration-700 ${index === currentSlide ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 translate-y-6'}`}>{slide.title}</h1>
                    <h2 className={`text-white text-base md:text-2xl lg:text-6xl font-bold drop-shadow-sm mb-4 transform transition-all duration-800 ${index === currentSlide ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 translate-y-6'}`}>{slide.subtitle}</h2>
                    <Link href={slide.buttonLink} className={`inline-flex items-center px-4 py-2 md:px-6 md:py-2.5 border-2 border-white text-white text-xs md:text-sm hover:bg-white hover:text-black transition-all duration-900 ${index === currentSlide ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-6'}`}>
                      {slide.buttonText}
                      <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Arrows */}
          <div className="absolute inset-y-0 left-0 z-20 flex items-center opacity-100 ml-2 md:ml-4">
            <button onClick={prevSlide} className={"bg-transparent hover:bg-white/40 backdrop-blur-sm p-1 md:p-2 rounded-r-lg transition-all duration-300"}>
              <ChevronRight className="h-4 w-4 md:h-6 md:w-6 text-white transform rotate-180" />
            </button>
          </div>

          <div className="absolute inset-y-0 right-0 z-20 flex items-center opacity-100 mr-2 md:mr-4">
            <button onClick={nextSlide} className="bg-transparent hover:bg-white/40 backdrop-blur-sm p-1 md:p-2 rounded-l-lg transition-all duration-300">
              <ChevronRight className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </button>
          </div>

          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-30 opacity-100">
            {slides.map((_, index) => (
              <button key={index} className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'}`} onClick={() => setCurrentSlide(index)} />
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white py-8 md:py-12 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 md:mb-12 relative">
            <h2 className="text-2xl md:text-3xl text-black font-bold mb-6 md:mb-8 text-center md:text-left">Популярные категории</h2>

            {/* md+ horizontal scroll with arrows */}
            <div className="hidden md:block relative">
              <div className="-mx-4 px-4 md:mx-0 md:px-0 relative">
                {/* Left arrow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex items-center">
                  <button onMouseDown={() => startContinuousScroll('left')} onMouseUp={stopContinuousScroll} onMouseLeave={stopContinuousScroll} onClick={() => scrollCategories('left')} className="bg-white/90 backdrop-blur-sm p-2 rounded-r-lg shadow-md hover:bg-white transition-colors duration-200">
                    <ChevronRight className="h-5 w-5 text-gray-700 rotate-180" />
                  </button>
                </div>
                {/* Right arrow */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex items-center">
                  <button onMouseDown={() => startContinuousScroll('right')} onMouseUp={stopContinuousScroll} onMouseLeave={stopContinuousScroll} onClick={() => scrollCategories('right')} className="bg-white/90 backdrop-blur-sm p-2 rounded-l-lg shadow-md hover:bg-white transition-colors duration-200">
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                </div>

                <div ref={categoriesRef} className={`flex gap-3 items-center py-4 overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory pl-4 md:pl-0`} style={{ WebkitOverflowScrolling: 'touch' }}>
                  {popularCategories.map((category) => (
                    <div key={category.id} className="flex-shrink-0 min-w-[110px] w-[110px] sm:min-w-[140px] sm:w-[140px] md:w-[200px] transform transition-transform duration-200 hover:scale-105 snap-center sm:snap-start">
                      <a href={category.link} className="group block text-center">
                        <div className="relative rounded-md h-[100px] sm:h-[120px] md:h-[330px] overflow-visible">
                          <img src={category.image} alt={category.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out p-1" />
                        </div>
                        <p className="font-bold text-xs sm:text-sm md:text-base text-black mt-2 group-hover:text-yellow-300 transition-colors duration-200 text-center">{category.title}</p>
                      </a>
                    </div>
                  ))}

                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 -translate-x-6 bg-gradient-to-r from-white/95 to-transparent" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 translate-x-6 bg-gradient-to-l from-white/95 to-transparent" />
                </div>
              </div>
            </div>

            {/* Mobile: grid 2 columns */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {popularCategories.map((category) => (
                <a key={category.id} href={category.link} className="group block text-center">
                  <div className="relative rounded-md h-[190px] overflow-hidden">
                    <img src={category.image} alt={category.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" />
                  </div>
                  <p className="font-bold text-sm text-black mt-2 group-hover:text-yellow-300 transition-colors duration-200 text-center">{category.title}</p>
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export function ExtraSections() {
  return (
    <>
      <div className=" py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <img src="/images/banners/MOD407PL-L12G3K1 Интерьерное изображение квадрат для серии продуктов.jpg" alt="Интерьер" className="w-full h-[540px] object-cover rounded-lg shadow-md" />
            </div>
            <div className="w-full md:w-1/2">
  <h3 className="text-4xl font-bold text-black mb-4">Почему выбирают нас</h3>
  <p className="text-2xl text-black">
    MORESVET — это не просто магазин светильников, а команда специалистов, которые помогают каждому клиенту подобрать оптимальное решение. Мы учитываем особенности интерьера, стиль помещения, ваши пожелания и бюджет, чтобы создать гармоничное освещение для любой задачи. В нашем каталоге представлены как практичные модели для повседневного использования, так и эксклюзивные дизайнерские коллекции для тех, кто ценит индивидуальность.
  </p>
  <p className="mt-4 text-sm text-gray-600">
    Мы предлагаем широкий выбор светильников для дома, офиса, кафе и ресторанов: от современных минималистичных решений до классических люстр и профессиональных систем освещения. Благодаря прямому сотрудничеству с ведущими брендами вы получаете выгодные цены и оригинальную продукцию с гарантией качества. MORESVET — это надежный партнер, который помогает превратить освещение в важный элемент уюта и стиля.
  </p>
</div>

            <div>
            <div>
              <div>
                <img src="/images/banners/P097PL-L45BS3K Интерьерное изображение квадрат для серии продуктов.jpg" alt="Фото 1" className="w-full h-[540px]  object-cover rounded-lg  shadow-sm" />
              </div> 
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}