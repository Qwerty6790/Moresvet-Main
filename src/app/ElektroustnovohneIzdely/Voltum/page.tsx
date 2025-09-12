'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';

interface Color {
  id: string;
  name: string;
  image: string;
  url: string;
  description?: string;
}

interface Frame {
  id: string;
  name: string;
  image: string;
  url: string;
}

interface WerkelSeries {
  id: string;
  name: string;
  image: string;
  url?: string;
  colors: Color[];
  frames?: Frame[];
}

// Все серии Werkel из name.tsx
const werkelSeriesData: WerkelSeries[] = [
 
  {
    id: 's70',
    name: 'Серия S70',
    image: '/images/series/s70.jpg',
    colors: [
      { id: 'white-matte', name: 'Белое матовое', image: '/images/colors/белыйматовыйVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/white-matte', description: 'Белое матовое покрытие — современно и практично.' },
      { id: 'black-matte', name: 'Черный матовый', image: '/images/colors/черныйматовыйVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/black-matte', description: 'Матовый черный для контрастных интерьеров.' },
      { id: 'cashmere', name: 'Кашемир', image: '/images/colors/кашемирVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/cashmere', description: 'Кашемир для контрастных интерьеров.' },
      { id: 'graphite', name: 'Графит', image: '/images/colors/графитVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/graphite', description: 'Графит для контрастных интерьеров.' },
      { id: 'shelk', name: 'Шелк', image: '/images/colors/шелкVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/shelk', description: 'Шелк для контрастных интерьеров.' },
      { id: 'steel', name: 'Сталь', image: '/images/colors/стальVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/steel', description: 'Сталь для контрастных интерьеров.' },
      { id: 'white-gloss', name: 'Белый глянцевый', image: '/images/colors/белыйглянцевыйVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/white-gloss', description: 'Белый глянцевый для контрастных интерьеров.' },
      { id: 'titan', name: 'Титан', image: '/images/colors/титанVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/titan', description: 'Титан для контрастных интерьеров.' },
    ],
    
  },
];

const WerkelPage: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState<WerkelSeries | null>(null);
  const [showFrames, setShowFrames] = useState(false);
  
  // Добавляем ref для слайдера
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const slideCount = 3; // Количество слайдов в слайдере
  
  // Простая и надежная функция для переключения слайдов
  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };
  
  // Функция для перехода к следующему слайду
  const nextSlide = useCallback(() => {
    const newSlide = (currentSlide + 1) % slideCount;
    setCurrentSlide(newSlide);
  }, [currentSlide, slideCount]);
  
  // Функция для перехода к предыдущему слайду
  const prevSlide = useCallback(() => {
    const newSlide = (currentSlide - 1 + slideCount) % slideCount;
    setCurrentSlide(newSlide);
  }, [currentSlide, slideCount]);

  // Автоматическое перелистывание слайдов
  useEffect(() => {
    if (!autoplayEnabled) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Интервал между сменой слайдов - 5 секунд
    
    return () => clearInterval(interval);
  }, [nextSlide, autoplayEnabled]);
  
  // Пауза автопрокрутки при наведении мыши
  const pauseAutoplay = () => setAutoplayEnabled(false);
  const resumeAutoplay = () => setAutoplayEnabled(true);

  const handleSeriesClick = (series: WerkelSeries) => {
    if (series.url) {
      window.location.href = series.url;
    } else {
      setSelectedSeries(series);
      setShowFrames(false);
    }
  };

  const handleBackToSeries = () => {
    setSelectedSeries(null);
    setShowFrames(false);
  };

  const handleFramesClick = () => {
    setShowFrames(true);
  };

  const handleBackFromFrames = () => {
    setShowFrames(false);
  };

  

  return (
    <>
      <Head>
        <title>Werkel - Коллекции электроустановочных изделий | Elektromos</title>
        <meta name="description" content="Изучите коллекции Werkel - от классического винтажа до современных матовых серий. Качественные электроустановочные изделия для вашего интерьера." />
      </Head>

      {/* Full-width banner */}
     

      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4">
     
          {!selectedSeries ? (
            <div className="max-w-7xl mx-auto">
              {/* Desktop complex grid using CSS grid areas */}
              <h2 className="text-4xl  font-bold text-black mb-4">VOLTUM</h2>
               {/* Mobile / tablet fallback grid */}
               <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                {werkelSeriesData.map((series) => (
                  <div key={series.id} onClick={() => handleSeriesClick(series)} className="relative overflow-hidden rounded-lg cursor-pointer">
                    <img src={series.image} alt={series.name} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h2 className="text-2xl text-black font-bold">{series.name}</h2>
                      <p className="text-sm text-black">Перейти к цветам</p>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="hidden lg:block"
                style={{
                  display: 'grid',
                  // 4 main columns so tile1 (retro) and tile2 (vintage) can span 2 cols each
                  gridTemplateColumns: 'repeat(4, minmax(0,1fr)) 620px',
                  gridTemplateRows: '420px 300px',
                  gridTemplateAreas: '"hero hero hero hero side" "tile1 tile1 tile2 tile2 side"',
                  gap: '24px',
                }}
              >
                {werkelSeriesData.map((series, idx) => {
                  const area = idx === 0 ? 'hero' : idx === 1 ? 'side' : idx === 2 ? 'tile1' : idx === 3 ? 'tile2' : 'tile3';
                  return (
                    <div
                      key={series.id}
                      onClick={() => handleSeriesClick(series)}
                      style={{ gridArea: area }}
                      className="relative cursor-pointer max-lg:hidden  overflow-hidden rounded-lg group"
                    >
                      <img
                        src={series.image}
                        alt={`Серия ${series.name}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-start p-8">
                        <div>
                          <h2 className="text-white text-4xl lg:text-5xl font-bold">{series.name}</h2>
                          <p className="text-white/90 mt-2">Перейти к цветам</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

          
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">    
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12">
                {selectedSeries.colors.map((color, idx) => (
                  <Link
                    key={color.id ?? `${color.name}-${idx}`}
                    href={color.url}
                    className="space-y-4 block transition-transform duration-300 hover:scale-105"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={color.image}
                        alt={`Цвет ${color.name}`}
                        className="w-[300px] h-[300px] object-contain mx-auto"
                      />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-4xl font-semibold text-black">{color.name}</h3>
                      {color.description && (
                        <p className="text-base text-gray-600 max-w-xl mx-auto mt-2">{color.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WerkelPage;
