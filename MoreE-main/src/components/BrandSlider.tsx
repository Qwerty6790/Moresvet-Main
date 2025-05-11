'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isPaused, setIsPaused] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Сохраняем текущее положение слайдера перед изменением анимации
    let currentPosition = 0;
    if (slider.style.animation !== 'none') {
      const computedStyle = window.getComputedStyle(slider);
      const matrix = new DOMMatrix(computedStyle.transform);
      currentPosition = matrix.m41; // получаем текущее смещение по X
    }

    // Устанавливаем начальное положение для новой анимации
    slider.style.transition = 'none';
    slider.style.transform = `translateX(${currentPosition}px)`;
    
    // Удаляем предыдущую анимацию и добавляем новую с задержкой
    slider.style.animation = 'none';
    
    // Небольшая задержка для применения стилей
    setTimeout(() => {
      slider.style.transition = 'transform 0.5s ease-in-out';
      slider.style.transform = '';
      
      requestAnimationFrame(() => {
        if (isReversed) {
          slider.style.animation = 'slideReverse 90s linear infinite';
        } else {
          slider.style.animation = 'slide 30s linear infinite';
        }
      });
    }, 50);

    return () => {
      if (slider) {
        slider.style.animation = 'none';
      }
    };
  }, [isReversed]);

  return (
    <div className="w-full mb-12 py-8 overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Популярные бренды</h2>
      
      <div className="relative mx-auto max-w-7xl overflow-hidden">
        <div 
          className="flex overflow-hidden"
          onMouseEnter={() => setIsReversed(true)}
          onMouseLeave={() => setIsReversed(false)}
        >
          <div 
            ref={sliderRef}
            className="flex space-x-8 py-4 min-w-max"
          >
            {/* Первый набор брендов */}
            {brands.map((brand) => (
              <Link 
                key={brand.id} 
                href={brand.link}
                className="flex-shrink-0 transition-transform duration-300 hover:scale-110"
              >
                <div className="w-32 h-24 flex items-center justify-center bg-black p-2 rounded-lg">
                  <img 
                    src={brand.image}
                    alt={`${brand.name} logo`}
                    className="max-h-full max-w-full object-contain "
                  />
                </div>
              </Link>
            ))}
            
            {/* Дублируем бренды для бесконечной прокрутки */}
            {brands.map((brand) => (
              <Link 
                key={`duplicate-${brand.id}`} 
                href={brand.link}
                className="flex-shrink-0 transition-transform duration-300 hover:scale-110"
              >
                <div className="w-32 h-24 flex items-center justify-center bg-black p-2 rounded-lg">
                  <img 
                    src={brand.image}
                    alt={`${brand.name} logo`}
                    className="max-h-full max-w-full object-contain "
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* CSS для анимации */}
      <style jsx global>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes slideReverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
} 