'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Maytoni from '@/app/cardproducts/page';
import BrandSlider from './BrandSlider';

// --- ТИПЫ ДАННЫХ ---
interface MainBannerSlide {
  id: number;
  bgImage: string;
  alt: string;
  title1: string;
  title2: string;
  date: string;
  buttonText: string;
  subText1: string;
  subText2: string;
  subText3: string;
  bgPosition: string;
  earthImage?: string | null; // Делаем необязательным
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

// --- ДАННЫЕ ДЛЯ СЛАЙДЕРОВ ---
const mainBannerSlides: MainBannerSlide[] = [
  {
    id: 1,
    bgImage: "/images/assets_task_01jrdh7qpqf7ftcpemen2q4j7c_img_0.webp",
    alt: "",
    title1: "КОСМИЧЕСКИЕ",
    title2: "НОВИНКИ VOLTUM",
    date: "",
    buttonText: "ПОЛЕТЕЛИ",
    subText1: "",
    subText2: "VOLTUM встраиваемые выключатели и регуляторы",
    subText3: "",
    bgPosition: "object-top",
  },
  {
    id: 2,
    bgImage: "/images/assets_task_01jrdr96hce8gvc3yrrapknvq8_img_0.webp",
    alt: "",
    title1: "Сакуры цветут?",
    title2: "Трековые системы PRO здесь",
    date: "",
    buttonText: "ПОЛЕТЕЛИ",
    subText1: "",
    subText2: "PRO трековые системы",
    subText3: "",
    bgPosition: "object-top",
  },
  {
    id: 3,
    bgImage: "/images/assets_task_01jrdpq6eef67argn1c1279zna_img_0.webp",
    alt: "",
    title1: "Не мерзни",
    title2: "Давай утеплим комнату ?",
    date: "",
    buttonText: "ПОЛЕТЕЛИ",
    subText1: "",
    subText2: "",
    subText3: "",
    bgPosition: "object-top",
  },
];

const sideBannerSlides: SideBannerSlide[] = [
 {
    id: 1,
    image: "/images/assets_task_01jrdm30zaf5cvz42m590jpvgj_img_0.webp",
    alt: "Специальное предложение",
    title1: "СПЕЦИАЛЬНОЕ",
    title2: "ПРЕДЛОЖЕНИЕ",
    description: "Скидка 20% на всю серию VOLTUM",
    buttonText: "подробнее",
 },
 {
    id: 2, // Добавляем ТРЕТИЙ баннер
    image: "/images/image.png", // Пример изображения
    alt: "О нас",
    title1: "Рассказать?",
    title2: "О нас",
    description: "",
    buttonText: "подробнее",
 },
 
];
// --- КОНЕЦ ДАННЫХ ДЛЯ СЛАЙДЕРОВ ---

export default function Banner() {
  // Популярные категории для каталога
  const popularCategories = [
    { id: 1, title: 'ЛЮСТРЫ', image: '/images/ЛюстраME.webp', link: '/catalog?category=Люстра&page=1' },
    { id: 2, title: 'СВЕТИЛЬНИКИ', image: '/images/светильникME.webp', link: '/catalog/Светильник' },
    { id: 3, title: 'БРА И ПОДСВЕТКИ', image: '/images/БраME.webp', link: '/catalog/Бра' },
    { id: 3, title: 'Лампочки', image: '/images/светоидоднаялампаME.webp', link: '/catalog/Лампочка' },
    { id: 5, title: 'НАСТОЛЬНЫЕ ЛАМПЫ', image: '/images/настольнаялампаME.webp', link: '/catalog/Настольная лампа' },
    { id: 6, title: 'ТОРШЕРЫ', image: '/images/ТоршерME.webp', link: '/catalog/Торшер' },
    { id: 7, title: 'УЛИЧНОЕ ОСВЕЩЕНИЕ', image: '/images/УличноееME.png', link: '/catalog/Уличный светильник' }
    
  ];

 


  // Товар дня
 
  // Состояния для индексов текущих слайдов
  const [currentMainSlideIndex, setCurrentMainSlideIndex] = useState(0);

  // Автоматическая смена слайдов для основного баннера
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMainSlideIndex((prevIndex) =>
        prevIndex === mainBannerSlides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Смена каждые 5 секунд
    return () => clearInterval(timer); // Очистка интервала
  }, []);
  
  // Функции для ручного переключения
  const nextMainSlide = () => {
     setCurrentMainSlideIndex((prevIndex) =>
        prevIndex === mainBannerSlides.length - 1 ? 0 : prevIndex + 1
      );
  };
   const prevMainSlide = () => {
     setCurrentMainSlideIndex((prevIndex) =>
        prevIndex === 0 ? mainBannerSlides.length - 1 : prevIndex - 1
      );
  };

  // Получаем данные текущего слайда для основного баннера
  const currentMainSlide = mainBannerSlides[currentMainSlideIndex];
  // Получаем данные для двух боковых баннеров
  const sideBannerTop = sideBannerSlides[0]; // Первый элемент для верхнего
  const sideBannerBottom = sideBannerSlides[1]; // Второй элемент для нижнего

  return (
    <div className="w-full max-w-7xl mt-40 mx-auto px-4">
       {/* Главный баннер и ДВА дополнительных мини-баннера */} 
       <div 
         className="flex gap-4 mb-4"
       >
         {/* Левый баннер - Космические скидки (с фоновым изображением) */}
         <div className="w-3/4 h-[450px] relative rounded-lg overflow-hidden">
           <img 
             src={currentMainSlide.bgImage} 
             alt={currentMainSlide.alt} 
             className={`absolute inset-0 w-full h-full object-cover z-0 ${currentMainSlide.bgPosition || 'object-center'}`}
           />
           
           {/* Кнопка навигации влево */} 
           <div 
             onClick={prevMainSlide}
             className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full flex items-center justify-center z-20 text-gray-700 cursor-pointer transition-colors duration-200"
           >
             {/* Шеврон влево SVG */} 
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
             </svg>
           </div>
           
           {/* Контент поверх фона */} 
           <div 
             className="relative z-10 flex h-full"
           >
               {/* Левый блок с текстом */} 
               <div className="w-5/12 p-8 flex flex-col justify-center">
                 <h2 className="text-6xl font-bold text-white mb-1">{currentMainSlide.title1}</h2>
                 <h2 className="text-3xl font-bold text-white mb-4">{currentMainSlide.title2}</h2>
                 <p className="text-white text-sm mb-6">{currentMainSlide.date}</p>
                 
                 <button 
                   className="bg-black text-white font-bold px-6 py-3 rounded w-32 text-sm"
                 >
                   {currentMainSlide.buttonText}
                 </button>
                 
                 <div className="mt-4">
                   <p className="text-white text-xs">{currentMainSlide.subText1}</p>
                   <p className="text-white text-xs">{currentMainSlide.subText2}</p>
                   <p className="text-white text-xs">{currentMainSlide.subText3}</p>
                 </div>
               </div>
               
               {/* Правый блок (для Земли/иконки) */} 
               <div className="w-7/12 relative">
                 {/* Проверяем наличие earthImage в currentMainSlide */} 
                 {currentMainSlide.earthImage && (
                   <div 
                     className="absolute right-12 bottom-8 bg-white rounded-full p-2 shadow-lg"
                   >
                     <img 
                       src={currentMainSlide.earthImage}
                       alt="Иконка баннера" 
                       className="w-20 h-20 rounded-full object-cover"
                     />
                   </div>
                 )}
               </div>
            </div>
           
           {/* Кнопка навигации вправо */} 
           <div 
             onClick={nextMainSlide}
             className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full flex items-center justify-center z-20 text-gray-700 cursor-pointer transition-colors duration-200"
           >
             {/* Шеврон вправо SVG */} 
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
           </div>
           
           {/* Индикаторы слайдера */} 
           <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-10">
             {mainBannerSlides.map((_, index) => (
               <button
                 key={index}
                 onClick={() => setCurrentMainSlideIndex(index)}
                 className={`h-1 rounded-sm transition-all duration-300 cursor-pointer ${ 
                   index === currentMainSlideIndex ? 'w-12 bg-blue-400' : 'w-6 bg-white bg-opacity-30 hover:bg-opacity-50'
                 }`}
                 aria-label={`Перейти к слайду ${index + 1}`}
               />
             ))}
           </div>
         </div>
         
         {/* Правый блок - ДВА Мини-баннера */} 
         <div className="w-1/4 flex flex-col gap-4"> {/* Контейнер для двух баннеров */} 
           {/* Верхний мини-баннер */} 
           {sideBannerTop && (
             <div
               className="h-[calc(50%-0.5rem)] relative rounded-lg overflow-hidden group cursor-pointer"
             >
               <img
                 src={sideBannerTop.image} 
                 alt={sideBannerTop.alt} 
                 className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
               />
               {/* Оверлей с текстом и кнопкой */}
               <div className="absolute z-10 inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                 <h3 className="text-white text-sm font-bold">{sideBannerTop.title1}</h3>
                 <h3 className="text-white text-3xl font-bold mb-1">{sideBannerTop.title2}</h3>
                 {sideBannerTop.description && <p className="text-white text-xs mb-2">{sideBannerTop.description}</p>}
                 {sideBannerTop.buttonText && (
                   <button className="bg-black text-white text-xs font-bold px-3 py-1 rounded mt-1 self-start hover:bg-yellow-500 transition-colors duration-200">
                     {sideBannerTop.buttonText}
                   </button>
                 )}
               </div>
             </div>
           )}
           
           {/* Нижний мини-баннер */} 
           {sideBannerBottom && (
             <div 
                className="h-[calc(50%-0.5rem)] relative rounded-lg overflow-hidden group cursor-pointer"
             >
               <img 
                 src={sideBannerBottom.image} 
                 alt={sideBannerBottom.alt} 
                 className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
               />
               {/* Оверлей с текстом и кнопкой */}
               <div className="absolute z-10 inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                 <h3 className="text-white text-sm font-bold">{sideBannerBottom.title1}</h3>
                 <h3 className="text-white text-3xl font-bold mb-1">{sideBannerBottom.title2}</h3>
                 {sideBannerBottom.description && <p className="text-white text-xs mb-2">{sideBannerBottom.description}</p>}
                  {sideBannerBottom.buttonText && (
                    <button className="bg-black text-white text-xs font-bold px-3 py-1 rounded mt-1 self-start hover:bg-yellow-500 transition-colors duration-200">
                      {sideBannerBottom.buttonText}
                    </button>
                  )}
               </div>
             </div>
           )}
         </div>
       </div>
       
       {/* Слайдер брендов с автоматической прокруткой */}
      <div className="mb-12">
        <div className="container mx-auto">
          <BrandSlider />
        </div>
        <div className="mb-12">
        <div className=" mx-auto">
          <div className="grid grid-cols-7 gap-4 relative">
            {popularCategories.map((category) => (
              <div
                key={category.id}
                className="transform transition-transform duration-200 hover:scale-105"
              >
                <Link href={category.link} className="group block text-center">
                  <div className="relative rounded-md overflow-hidden h-28 mb-2">
                    <img 
                      src={category.image} 
                      alt={category.title} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                  </div>
                  <p className="text-center text-gray-700 text-xs font-semibold group-hover:text-blue-600 transition-colors duration-200">{category.title}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
         {/* Секция с Maytoni */}
     <div className="mb-12">
        <div className="container mx-auto">
            <Maytoni />
        </div>
     </div>
    
     
      </div>

      
    

      

    </div>
  );
}

