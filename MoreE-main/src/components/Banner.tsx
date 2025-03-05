'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CategoryGrid from './GridCategory';
import Maytoni from '@/app/cardproducts/page';

export default function Banner() {
  // Массив преимуществ для отображения
  const benefits = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: 'Гарантия качества',
      description: 'Все товары проходят строгий контроль качества'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Быстрая доставка',
      description: 'Доставляем заказы в кратчайшие сроки'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Удобная оплата',
      description: 'Различные способы оплаты для вашего удобства'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Техническая поддержка',
      description: 'Наши специалисты всегда готовы помочь с выбором'
    }
  ];

  // Массив брендов для отображения
  const brands = [
    { name: 'Maytoni', logo: '/images/brands/maytoni.png' },
    { name: 'Voltum', logo: '/images/brands/voltum.png' },
    { name: 'Lightstar', logo: '/images/brands/lightstar.png' },
    { name: 'Odeon Light', logo: '/images/brands/odeon.png' },
    { name: 'Elektrostandard', logo: '/images/brands/elektrostandard.png' },
    { name: 'Novotech', logo: '/images/brands/novotech.png' }
  ];

  // Массив специальных предложений
  const specialOffers = [
    {
      title: 'Скидка 20%',
      description: 'на все подвесные светильники',
      image: '/images/special-offer-1.jpg',
      link: '/catalog/pendant'
    },
    {
      title: 'Комплект светильников',
      description: 'для ванной комнаты со скидкой 15%',
      image: '/images/special-offer-2.jpg',
      link: '/catalog/bathroom'
    }
  ];

  return (
    <div className="w-full ">
      {/* Секция с товарами */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-64 z-0"></div>
        <div className="relative z-10">
          <Maytoni />  
        </div>    
      </div>
      {/* Секция с категориями */}
      <CategoryGrid />
    </div>
  );
}