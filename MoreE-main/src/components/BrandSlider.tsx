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

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Создаем CSS анимацию с правильной остановкой
    slider.style.animation = 'none';
    requestAnimationFrame(() => {
      slider.style.animation = 'slide 30s linear infinite';
    });

    return () => {
      if (slider) {
        slider.style.animation = 'none';
      }
    };
  }, []);

  return (
    <div className="w-full mb-12 py-8 overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Популярные бренды</h2>
      
      <div className="relative mx-auto max-w-7xl overflow-hidden">
        <div 
          className="flex overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            ref={sliderRef}
            className="flex space-x-8 py-4 min-w-max"
            style={{
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
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
      `}</style>
    </div>
  );
} 