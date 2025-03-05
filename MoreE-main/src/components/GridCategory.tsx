import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  title: string;
  image: string;
  name: string;
}

// Вынесем категории за пределы компонента, чтобы они не пересоздавались при каждом рендере
const categories: Category[] = [
  {
    id: 1,
    title: 'Люстры',
    image: '/images/11.jpg',
    name: 'Люстра',
  },
  {
    id: 2,
    title: 'Торшеры',
    image: '/images/12.jpg',
    name: 'Торшер',
  },
  {
    id: 3,
    title: 'Настенные светильники',
    image: '/images/14.jpg',
    name: 'Настенный светильник',
  },
  {
    id: 4,
    title: 'Настольные лампы',
    image: '/images/16.jpg',
    name: 'Настольная лампа',
  },
  {
    id: 5,
    title: 'Точечные светильники',
    image: '/images/15.jpg',
    name: 'Точечный светильник',
  },
  {
    id: 6,
    title: 'Уличное освещение',
    image: '/images/13.jpg',
    name: 'Уличный светильник',
  },
];

const CategoryGrid: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const itemsPerView = 4; // Количество видимых элементов на десктопе
  const autoplayInterval = 5000; // Интервал автоматического переключения в миллисекундах
  
  // Функции для навигации по слайдеру
  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % categories.length);
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Автоматическое переключение слайдов
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, autoplayInterval);
    
    return () => clearInterval(interval);
  }, [currentIndex, isAnimating, isPaused]);

  // Получаем видимые категории
  const getVisibleCategories = () => {
    const result = [];
    for (let i = 0; i < itemsPerView; i++) {
      const index = (currentIndex + i) % categories.length;
      result.push(categories[index]);
    }
    return result;
  };

  const visibleCategories = getVisibleCategories();

  return (
    <div className="w-full py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Заголовок с кнопками навигации */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-normal text-black">Популярные категории</h2>
          
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={prevSlide}
              className="w-10 h-10 flex items-center justify-center border border-gray-200 text-black hover:bg-gray-100"
              disabled={isAnimating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              className="w-10 h-10 flex items-center justify-center border border-gray-200 text-black hover:bg-gray-100"
              disabled={isAnimating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Слайдер категорий */}
        <div 
          className="relative overflow-hidden"
          ref={sliderRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-70' : 'opacity-100'}`}
            style={{ transform: `translateX(0)` }}
          >
            {visibleCategories.map((category, index) => (
              <Link 
                key={`${category.id}-${index}`}
                href={`/catalog/${encodeURIComponent(category.name)}`}
                className="block relative"
              >
                <div className="aspect-square bg-[#E5E5E5] relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-black text-xl font-normal">{category.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Индикатор автопрокрутки */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-black transition-all duration-100 ease-linear"
              style={{ 
                width: isPaused ? '0%' : '100%', 
                transitionDuration: isPaused ? '0ms' : `${autoplayInterval}ms`,
                transitionProperty: 'width'
              }}
            />
          </div>
        </div>
        
        {/* Мобильные кнопки навигации */}
        <div className="flex justify-center mt-6 md:hidden">
          <div className="flex items-center space-x-3">
            <button 
              onClick={prevSlide}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 text-black rounded-full"
              disabled={isAnimating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {Array.from({ length: Math.min(categories.length, 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating) return;
                  setIsAnimating(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex % categories.length ? 'bg-black' : 'bg-gray-300'
                }`}
                aria-label={`Слайд ${index + 1}`}
              />
            ))}
            
            <button 
              onClick={nextSlide}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 text-black rounded-full"
              disabled={isAnimating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;
