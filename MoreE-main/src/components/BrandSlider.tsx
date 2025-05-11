'use client';

import { useState, useEffect, useRef } from 'react';

// Интерфейс для брендов
interface Brand {
  id: number;
  name: string;
  image: string;
  link: string;
}

// Данные брендов (используя найденные изображения логотипов)
const brands: Brand[] = [
  { id: 1, name: 'Maytoni', image: '/images/maytonilogo.png', link: '/catalog?source=Maytoni&category=Все+товары&page=1' },
  { id: 2, name: 'LightStar', image: '/images/lightstarlogo.png', link: '/catalog?source=LightStar&category=Все+товары&page=1' },
  { id: 3, name: 'Sonex', image: '/images/sonexlogo1.png', link: '/catalog?source=Sonex&category=Все+товары&page=1' },
  { id: 4, name: 'Kink Light', image: '/images/kinklightlogo.png', link: '/catalog?source=Kink Light&category=Все+товары&page=1' },
  { id: 5, name: 'Arte Lamp', image: '/images/artelamplogo.png', link: '/catalog?source=Arte Lamp&category=Все+товары&page=1' },
  { id: 6, name: 'Elektrostandart', image: '/images/elektrostandartlogo.png', link: '/catalog?source=Elektrostandart&category=Все+товары&page=1' },
  { id: 7, name: 'Lumion', image: '/images/lumionlogo.png', link: '/catalog/index2?source=Lumion' },
  { id: 8, name: 'Odeon Light', image: '/images/odeonlightlogo.png', link: '/catalog/index2?source=Odeon Light' },
  { id: 9, name: 'Werkel', image: '/images/werkellogo.png', link: '/catalog?source=Werkel&category=Все+товары&page=1' },
  { id: 10, name: 'Denkirs', image: '/images/denkirslogo1.png', link: '/catalog?source=Denkirs&category=Все+товары&page=1' },
  { id: 11, name: 'Novotech', image: '/images/novotechlogo.png', link: '/catalog?source=Novotech&category=Все+товары&page=1' },
  { id: 12, name: 'Voltum', image: '/images/voltumlogo.png', link: '/catalog?source=Voltum&category=Все+товары&page=1' },
  { id: 13, name: 'Stluc', image: '/images/stlucelogo.png', link: '/catalog?source=Stluc&category=Все+товары&page=1' },
  { id: 14, name: 'Favourite', image: '/images/favouritelogo.png', link: '/catalog?source=Favourite&category=Все+товары&page=1' },
];

export default function BrandSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [hovering, setHovering] = useState(false);
  const animationRef = useRef<number | null>(null);
  
  // Функция для анимации слайдера
  const animate = () => {
    if (!sliderRef.current) return;
    
    // Получаем ширину контента
    const contentWidth = sliderRef.current.scrollWidth / 2;
    
    // Обновляем позицию
    setPosition(prev => {
      let newPos;
      if (hovering) {
        // При наведении двигаемся назад медленно (1px за кадр)
        newPos = prev + 0.2;
        if (newPos > 0) newPos = -contentWidth;
      } else {
        // Обычная скорость (2px за кадр)
        newPos = prev - 0.4;
        if (newPos < -contentWidth) newPos = 0;
      }
      return newPos;
    });
    
    // Продолжаем анимацию
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Запускаем и останавливаем анимацию
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hovering]);
  
  const handleMouseEnter = () => {
    setHovering(true);
  };
  
  const handleMouseLeave = () => {
    setHovering(false);
  };

  return (
    <div className="w-full mb-12 py-8 overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Популярные бренды</h2>
      
      <div className="relative mx-auto max-w-7xl overflow-hidden">
        <div 
          className="flex overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            ref={sliderRef}
            className="flex space-x-8 py-4 min-w-max"
            style={{
              transform: `translateX(${position}px)`,
              transition: hovering ? 'transform 0.5s ease-out' : 'none'
            }}
          >
            {/* Первый набор брендов */}
            {brands.map((brand) => (
              <a 
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
              </a>
            ))}
            
            {/* Дублируем бренды для бесконечной прокрутки */}
            {brands.map((brand) => (
              <a 
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
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 