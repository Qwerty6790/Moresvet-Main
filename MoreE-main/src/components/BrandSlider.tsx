'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Интерфейс для брендов
interface Brand {
  id: number;
  name: string;
  image: string;
  link: string;
}

// Данные брендов (используя найденные изображения логотипов)
const brands: Brand[] = [
  { id: 1, name: 'Maytoni', image: '/images/maytonilogo.png', link: '/brands/maytoni' },
  { id: 2, name: 'LightStar', image: '/images/lightstarlogo.png', link: '/brands/lightstar' },
  { id: 3, name: 'Sonex', image: '/images/sonexlogo1.png', link: '/brands/sonex' },
  { id: 4, name: 'Kink Light', image: '/images/kinklightlogo.png', link: '/brands/kinklight' },
  { id: 5, name: 'Arte Lamp', image: '/images/artelamplogo.png', link: '/brands/artelamp' },
  { id: 6, name: 'Elektrostandart', image: '/images/elektrostandartlogo.png', link: '/brands/elektrostandart' },
  { id: 7, name: 'Lumion', image: '/images/lumionlogo.png', link: '/brands/lumion' },
  { id: 8, name: 'Odeon Light', image: '/images/odeonlightlogo.png', link: '/brands/odeonlight' },
  { id: 9, name: 'Werkel', image: '/images/werkellogo.png', link: '/brands/werkel' },
  { id: 10, name: 'Denkirs', image: '/images/denkirslogo1.png', link: '/brands/denkirs' },
  { id: 11, name: 'Novotech', image: '/images/novotechlogo.png', link: '/brands/novotech' },
  { id: 12, name: 'Voltum', image: '/images/Voltumlogo.png', link: '/brands/voltum' },
  { id: 13, name: 'Stluc', image: '/images/stlucelogo.png', link: '/brands/stluce' },
  { id: 14, name: 'Favourite', image: '/images/favouritelogo.png', link: '/brands/favourite' },
];

export default function BrandSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollSpeed = 1; // пикселей в миллисекунду

  // Эффект для автоматической прокрутки
  useEffect(() => {
    if (!autoScroll || !sliderRef.current) return;
    
    const sliderWidth = sliderRef.current.scrollWidth;
    const containerWidth = sliderRef.current.clientWidth;
    
    const animate = () => {
      if (!sliderRef.current) return;
      
      // Увеличиваем позицию прокрутки
      let newPosition = scrollPosition + scrollSpeed;
      
      // Если дошли до конца, начинаем сначала
      if (newPosition >= sliderWidth - containerWidth) {
        newPosition = 0;
      }
      
      // Обновляем состояние и прокручиваем слайдер
      setScrollPosition(newPosition);
      sliderRef.current.scrollLeft = newPosition;
    };
    
    const timer = setInterval(animate, 20); // Обновляем каждые 20 мс для плавности
    
    return () => clearInterval(timer);
  }, [scrollPosition, autoScroll]);

  // Обработчики событий для остановки и возобновления прокрутки при наведении
  const handleMouseEnter = () => setAutoScroll(false);
  const handleMouseLeave = () => setAutoScroll(true);

  return (
    <div className="w-full mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Популярные бренды</h2>
      
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
     
       
        
        {/* Контейнер для слайдера */}
        <div 
          ref={sliderRef}
          className="flex overflow-hidden px-10"
        >
          <div className="flex items-center space-x-8 py-4">
            {brands.map((brand) => (
              <Link 
                key={brand.id} 
                href={brand.link}
                className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
              >
                <div className="w-32 h-20 flex items-center justify-center bg-black p-2 rounded-lg shadow-sm">
                  <img 
                    src={brand.image}
                    alt={`${brand.name} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </Link>
            ))}
            
            {/* Дублируем бренды для бесконечной прокрутки */}
            {brands.map((brand) => (
              <Link 
                key={`duplicate-${brand.id}`} 
                href={brand.link}
                className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
              >
                <div className="w-32 h-20 flex items-center justify-center bg-white p-2 rounded-lg shadow-sm">
                  <img 
                    src={brand.image}
                    alt={`${brand.name} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
        
       
      </div>
    </div>
  );
} 