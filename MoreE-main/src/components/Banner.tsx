'use client';
import Link from 'next/link';
import CategoryGrid from './GridCategory';

const categories = [
  {
    title: 'Люстры',
    image: '/images/11.jpg',
    link: '/catalog/Люстры',
    size: 'large'
  },
  {
    title: 'Торшер',
    image: '/images/14.jpg',
    link: '/catalog/Люстры',
    size: 'low'
  },
  {
    title: 'Трековые светильники',
    image: '/images/12.jpg',
    link: '/catalog/Трековые светильники',
    size: 'medium'
  },
  
  {
    title: 'Розетки и выключатели',
    image: '/images/13.jpg',
    link: '/catalog/Розетки и выключатели',
    size: 'small'
  },
  {
    title: 'Точечные светильники',
    image: '/images/15.jpg',
    link: '/catalog/Точечные светильники',
    size: 'small'
  },
  {
    title: 'Умный дом',
    image: '/images/16.jpg',
    link: '/catalog/Умный дом',
    size: 'small'
  },
  {
    title: 'Настенные светильники',
    image: '/images/17.jpg',
    link: '/catalog/Настенные светильники',
    size: 'large'
  }
];

const products = [
  {
    title: 'Блок питания 100W 24V',
    price: '5 250₽',
    image: '/images/products/power.jpg',
    link: '/products/1',
    isNew: true
  },
  {
    title: 'Настольная лампа белая',
    price: '10 100₽',
    image: '/images/products/lamp.jpg',
    link: '/products/2'
  },
  {
    title: 'Люстра VARESE',
    price: '25 600₽',
    image: '/images/products/chandelier.jpg',
    link: '/products/3'
  },
  {
    title: 'Подвесной светильник',
    price: '29 800₽',
    image: '/images/products/pendant.jpg',
    link: '/products/4'
  },
  {
    title: 'Подвесной светильник медный',
    price: '30 400₽',
    image: '/images/products/copper.jpg',
    link: '/products/5'
  }
];

const features = [
  {
    title: 'РАБОТАЕМ 24/7',
    description: 'консультация и поддержка'
  },
  {
    title: 'БЕСПЛАТНАЯ ДОСТАВКА',
    description: 'на заказ свыше 5 000₽ по всей России'
  },
  {
    title: '+2 ГОДА ГАРАНТИИ',
    description: 'от партнёра на все светильники'
  }
];

export default function Banner() {
  return (
    <div className="w-full bg-white">
      {/* Popular Categories */}
     <CategoryGrid />

      {/* New Products and Bestsellers */}
      
    </div>
  );
}