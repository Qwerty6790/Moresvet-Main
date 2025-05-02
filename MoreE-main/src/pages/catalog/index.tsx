'use client'
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image'; // Добавляем оптимизированный компонент для изображений
import Header from '@/components/Header';
import 'tailwindcss/tailwind.css';
import Footer from '@/components/Footer';
import { ProductI } from '@/types/interfaces';
import { BASE_URL } from '@/utils/constants';
import { ClipLoader } from 'react-spinners';
import SEO from '@/components/SEO';
import { fetchProductsWithSorting } from '@/utils/api';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion'; // Добавляем анимации

// Обновленный тип для категории с улучшенными полями
export type Category = {
  id?: string;
  label: string;
  searchName: string;
  href?: string;
  image?: string; // Добавляем поле для изображения категории
  description?: string; // Добавляем поле для описания
  aliases?: string[];
  subcategories?: Category[];
  isOpen?: boolean;
  featured?: boolean; // Отмечаем особые категории
};

export type Brand = {
  name: string;
  categories: Category[];
  logo?: string; // Добавляем поле для логотипа бренда
  description?: string; // Добавляем поле для описания бренда
};

export type PopularSearch = {
  text: string;
  queryParam: string;
  forCategories?: string[];
  forBrands?: string[];
};

// Новый тип для фильтров
export type ExtractedFilters = {
  colors: string[];
  materials: string[];
  features: string[];
  styles: string[];
  places: string[];
  priceRange: {
    min: number;
    max: number;
  };
};

// Новый тип для настроек сортировки
export type SortOption = 'asc' | 'desc' | 'popularity' | 'newest' | 'random' | null;

// Обновленный интерфейс для props страницы
interface CatalogIndexProps {
  initialProducts: ProductI[];
  initialTotalPages: number;
  initialTotalProducts: number;
  source?: string;
  lcpImageUrls: string[];
}

// Добавляем категории из ProductCategory.tsx
const productCategories = [
  { 
    id: 'lyustra', 
    label: 'Люстры', 
    searchName: 'Люстры',
    subcategories: [
      { 
        label: 'Люстра подвесная', 
        searchName: 'Подвесная люстра',
        aliases: ['Люстра подвесная', 'Подвесная люстра', 'Подвесной светильник', 'Светильник подвесной']
      },
      { 
        label: 'Люстра потолочная', 
        searchName: 'потолочная',
        aliases: ['Потолочная люстра', 'Потолочный светильник']
      },
      { 
        label: 'Люстра на штанге', 
        searchName: 'Люстра на штанге',
        aliases: ['Люстра на штанге', 'Светильник на штанге']
      },
      { 
        label: 'Люстра каскадная', 
        searchName: 'Люстра каскадная',
        aliases: ['Люстра каскадная', 'Каскадная люстра', 'Каскадный светильник']
      },
    ],
    isOpen: false
  },
  { 
    id: 'svetilnik', 
    label: 'Светильники', 
    searchName: 'Светильники',
    aliases: ['Светильники', 'Светильник', 'Светильники для дома', 'Осветительные приборы'],
    subcategories: [
      { 
        label: 'Потолочный светильник', 
        searchName: 'Потолочный светильник',
        aliases: ['Потолочный светильник', 'Светильник потолочный', 'Накладной потолочный', 'Потолочное освещение']
      },
      { 
        label: 'Подвесной светильник', 
        searchName: 'Подвесной светильник',
        aliases: ['Подвесной светильник', 'Светильник подвесной', 'Подвесной', 'Подвес']
      },
      { 
        label: 'Настенный светильник', 
        searchName: 'Настенный светильник',
        aliases: ['Настенный светильник', 'Светильник настенный', 'Настенный', 'Настенный светильник']
      },
      { 
        label: 'Встраиваемый светильник', 
        searchName: 'Светильник встраиваемый',
        aliases: ['Встраиваемый светильник', 'Светильник встраиваемый', 'Встроенный светильник', 'Точечный встраиваемый']
      },
      { 
        label: 'Накладной светильник', 
        searchName: 'Светильник накладной',
        aliases: ['Накладной светильник', 'Светильник накладной', 'Накладной', 'Светильник наружный']
      },
      { 
        label: 'Трековый светильник', 
        searchName: 'трековый светильник',
        aliases: ['Трековый светильник', 'Светильник трековый', 'Трек светильник', 'Светильник для шинопровода']
      },
      { 
        label: 'Точечный светильник', 
        searchName: 'Точечный светильник',
        aliases: ['Точечный светильник', 'Спот',  'Светильник точечный', 'Даунлайты']
      },
    ],
    isOpen: false
  },
  { 
    id: 'bra', 
    label: 'Бра', 
    searchName: 'Бра',
    aliases: ['Бра',],
    isOpen: false
  },
  { 
    id: 'torsher', 
    label: 'Торшер', 
    searchName: 'Торшер',
    aliases: ['Торшер', 'Напольный светильник', 'Светильник напольный', 'Напольная лампа', 'Торшерный светильник'],
    isOpen: false
  },
  { 
    id: 'nastolnaya', 
    label: 'Настольная лампа', 
    searchName: 'Настольная лампа',
    aliases: ['Настольная лампа', 'Лампа настольная', 'Настольный светильник', 'Светильник настольный', 'Лампа для стола'],
    isOpen: false
  },
 
  { 
    id: 'smart', 
    label: 'Умный свет', 
    searchName: 'Умный свет',
    aliases: ['Умный свет', 'Smart освещение', 'Умное освещение', 'Смарт светильники', 'Светильники с управлением'],
    isOpen: false
  },
  { 
    id: 'profil', 
    label: 'Профиль для ленты', 
    searchName: 'Профиль для ленты',
    aliases: ['Профиль для ленты', 'Алюминиевый профиль', 'Профиль для светодиодной ленты', 'LED профиль'],
    isOpen: false
  },
  { 
    id: 'lenta', 
    label: 'Светодиодная лента', 
    searchName: 'Светодиодная лента',
    aliases: ['Светодиодная лента', 'LED лента', 'Лента светодиодная', 'LED подсветка', 'Светодиодная подсветка'],
    isOpen: false
  },
  { 
    id: 'ulichni', 
    label: 'Уличный светильник', 
    searchName: 'Уличные светильник',
    subcategories: [
      { label: 'Уличный светильник', searchName: 'Уличный светильник' },
      { label: 'Настенный уличный светильник', searchName: 'Настенный уличный светильник' },
      { label: 'Грунтовый светильник', searchName: 'Грунтовый светильник' },
      { label: 'Ландшафтный светильник', searchName: 'Ландшафтный светильник' },
      { label: 'Парковый светильник', searchName: 'Парковый светильник' },
    ],
    isOpen: false
  },
];

// Массив брендов с категориями
const brands: Brand[] = [
  {
    name: 'Все товары',
    categories: [
      { label: 'Люстра', searchName: 'Люстра' },
      { label: 'Автоматический выключатель', searchName: 'Автоматический выключатель' },
      ...productCategories.map(cat => ({ label: cat.label, searchName: cat.searchName, aliases: [] }))
    ],
  },
  {
    name: 'Artelamp',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Люстра подвесная', searchName: 'Подвесная люстра' },
      { label: 'Люстра на штанге', searchName: 'Люстра на штанге' },
      { label: 'Каскадная люстра', searchName: 'Каскадная люстра' },
      {
        label: 'Люстра потолочная',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Бра', searchName: 'Бра' },
      { label: 'Торшеры', searchName: 'Торшер' },
      { label: 'Потолочный Светильник', searchName: 'Потолочный Светильник' },
      { label: 'Трековый светильник', searchName: 'трековый светильник' },
      { label: 'Врезной Светильник', searchName: 'Врезной Светильник' },
      { label: 'Споты', searchName: 'Спот' },
      { label: 'Уличный настенный светильник', searchName: 'Уличный настенный светильник' },
      { label: 'Настольный Светильник', searchName: 'Настольный Светильник' },
      { label: 'Подвесной светильник', searchName: 'Подвес' },
      { label: 'Уличный светильник', searchName: 'Уличный светильник' },
    ],
  },
  {
    name: 'KinkLight',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Каскадная люстра', searchName: 'Люстра каскадная' },
      { label: 'Шнур', searchName: 'Шнур' },
      {
        label: 'Люстра потолочная',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Бра', searchName: 'Бра' },
      { label: 'Торшеры', searchName: 'Торшер' },
      { label: 'Трековый светильник', searchName: 'трековый светильник' },
      { label: 'Подвесной светильник', searchName: 'Подвес' },
    ],
  },
  {
    name: 'Favourite',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
      { label: 'Потолочный Светильник', searchName: 'Потолочный Светильник' },
      { label: 'Трековый светильник', searchName: 'трековый светильник' },
      { label: 'Врезной Светильник', searchName: 'Врезной Светильник' },
      { label: 'Споты', searchName: 'Спот' },
      { label: 'Настенный Светильник', searchName: 'Настенный Светильник' },
      {
        label: 'Люстра потолочные',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Напольный Светильник', searchName: 'Напольный Светильник' },
      { label: 'Настольный Светильник', searchName: 'Настольный Светильник' },
      { label: 'Подвесной светильник', searchName: 'Подвес' },
      { label: 'Уличный светильник', searchName: 'Уличный светильник' },
    ],
  },
  {
    name: 'Lumion',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
      { label: 'Потолочный Светильник', searchName: 'Потолочный Светильник' },
      { label: 'Подвесное крепление', searchName: 'Подвесное крепление' },
      { label: 'Интерьерная настольная лампа', searchName: 'Интерьерная настольная лампа' },
      { label: 'Споты', searchName: 'Спот' },
      {
        label: 'Люстры потолочная',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Настенный светильник', searchName: 'Настенный светильник' },
      { label: 'Бра', searchName: 'Бра' },
      { label: 'Торшеры', searchName: 'Торшер' },
      { label: 'Подвесной светильник', searchName: 'Подвесной светильник' },
    ],
  },
  {
    name: 'LightStar',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
      {
        label: 'Люстра потолочная',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Бра RAMO', searchName: 'Бра RAMO' },
      { label: 'Бра STREGARO', searchName: 'Бра STREGARO' },
      { label: 'Бра RAGNO', searchName: 'Бра RAGNO' },
      { label: 'Бра CILINO', searchName: 'Бра CILINO' },
      { label: 'Бра ZETA', searchName: 'Бра ZETA' },            
      { label: 'Бра TUBO', searchName: 'Бра TUBO' },
      { label: 'Бра FAVO', searchName: 'Бра FAVO' },
      { label: 'Бра EXTRA', searchName: 'Бра EXTRA' },
      { label: 'Бра SIENA', searchName: 'Бра SIENA' },
      { label: 'Бра PALLA', searchName: 'Бра PALLA' },
      { label: 'Настольная лампа', searchName: 'Настольная лампа' },
      { label: 'Светильник точечный', searchName: 'Светильник точечный ' },
      { label: 'Встраиваемый светильник', searchName: 'Встраиваемый светильник' },
      { label: 'Трековый светильник', searchName: 'Трековый светильник' },
      { label: 'Подвесной светильник', searchName: 'Светильник подвесной' },
      { label: 'Соединитель', searchName: 'Соединитель' },
    ],
  },
  {
    name: 'OdeonLight',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Люстра каскадная', searchName: 'Люстра каскадная' },
      { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
      { label: 'Потолочный Светильник', searchName: 'Потолочный Светильник' },
      { label: 'Споты', searchName: 'Спот' },
      { label: 'Настенный Светильник', searchName: 'Настенный Светильник' },
      {
        label: 'Люстра потолочная',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Напольный Светильник', searchName: 'Напольный Светильник' },
      { label: 'Настольный Светильник', searchName: 'Настольный Светильник' },
      { label: 'Подвесной светильник', searchName: 'Подвес' },
      { label: 'Уличный светильник', searchName: 'Уличный светильник' },
    ],
  },
  {
    name: 'Maytoni',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Подвесной светильник', searchName: 'Подвесной светильник' },
      { label: 'Трековый светильник', searchName: 'Трековый светильник' },
      { label: 'Встраиваемый светильник', searchName: 'Встраиваемый светильник' },
      { label: 'Потолочный светильник', searchName: 'Потолочный светильник' },
      { label: 'Настенный светильник', searchName: 'Настенный светильник' },
      { label: 'Ландшафтный светильник', searchName: 'Ландшафтный светильник' },
      { label: 'Светодиодная лента', searchName: 'Светодиодная лента' },
      {
        label: 'Люстра потолочная',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Торшеры', searchName: 'Торшер' },
      { label: 'Парковый светильник', searchName: 'Парковый светильник' },
    ],
  },
  {
    name: 'Sonex',
    categories: [
      {
        label: 'Люстра-вентилятор',
        searchName: 'Люстра-вентилятор',
        aliases: ['Люстра-вентилятор'],
      },
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Подвесное крепление', searchName: 'Подвесное крепление' },
      { label: 'Светильники MERTO', searchName: 'MERTO' }, 
      { label: 'Светильники LASSA', searchName: 'LASSA' },
      { label: 'Светильники PIN', searchName: 'PIN' },
      { label: 'Светильники MITRA', searchName: 'MITRA' },
      { label: 'Светильники PALE', searchName: 'PALE' },
      { label: 'Светильники VAKA', searchName: 'VAKA' },
      { label: 'Светильники MINI', searchName: 'MINI' },
      { label: 'Светильники COLOR', searchName: 'COLOR' },   
      { label: 'Светильники SNOK', searchName: 'SNOK' },
      { label: 'Светильники BASICA', searchName: 'BASICA' },
      { label: 'Светильники MARON', searchName: 'MARON' },
      { label: 'Светильники AVRA', searchName: 'AVRA' },
      { label: 'Светильники TAN', searchName: 'TAN' },
      { label: 'Светильники PICO', searchName: 'PICO' },
      { label: 'Бра', searchName: 'Бра' },
    ],
  },
  {
    name: 'ElektroStandard',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Встраиваемый точечный светильник', searchName: 'Встраиваемый точечный светильник' },
      { label: 'Светильник встраиваемый', searchName: 'Светильник встраиваемый' },
      { label: 'Накладной точечный светильник', searchName: 'Накладной точечный светильник' },
      { label: 'Накладной светильник', searchName: 'Накладной светильник' },
      { label: 'Накладной акцентный светильник', searchName: 'Накладной акцентный светильник' },
      { label: 'Встраиваемый поворотный светодиодный светильник', searchName: 'Встраиваемый поворотный светодиодный светильник' },
      { label: 'Накладной поворотный светодиодный светильник ', searchName: 'Накладной поворотный светодиодный светильник ' },
      { label: 'Трековая система Line Magnetic', searchName: 'Line Magnetic' },
      { label: 'Трековая система Mini Magnetic', searchName: 'Mini Magnetic' },
      { label: 'Трековая система Module System', searchName: 'Module System' },
      { label: 'Магнитная система Esthetic Magnetic', searchName: 'Esthetic Magnetic' },
      { label: 'Магнитная система Flat Magnetic', searchName: 'Flat Magnetic' },
      { label: 'Магнитная система Flat Magnetic', searchName: 'Flat Magnetic' },
      { label: 'Маг­нитная сис­те­ма Slim Magnetic', searchName: 'Slim Magnetic' },
      { label: 'Подвесной светодиодный светильник', searchName: 'Подвесной светодиодный светильник' },
      { label: 'Подвесной линейный светодиодный светильник', searchName: 'Подвесной линейный светодиодный светильник' },
      { label: 'Трековый поворотный светильник ', searchName: 'Трековый поворотный светильник ' },
      { label: 'Накладной линейный светодиодный светильник', searchName: 'Накладной линейный светодиодный светильник' },
      { label: 'Настенный светодиодный светильник', searchName: 'Настенный светодиодный светильник' },
      { label: 'Линейный светодиодный светильник', searchName: 'Линейный светодиодный светильник' },
      { label: 'Шинопроводы', searchName: 'Шинопровод' },
      { label: 'Настенный уличный светильник', searchName: 'Настенный уличный светильник' },
      { label: 'Линейный светодиодный подвесной двусторонний светильник', searchName: 'Линейный светодиодный подвесной двусторонний светильник' },
      { label: 'Светильник садово-парковый', searchName: 'Светильник садово-парковый' },
      { label: 'Уличный светильник на столбе', searchName: 'Уличный светильник на столбе' },
      { label: 'Светильник поворотный садово-парковый', searchName: 'Светильник поворотный садово-парковый' },
      { label: 'Ландшафтный светодиодный светильник', searchName: 'Ландшафтный светодиодный светильник' },
      { label: 'Трековый светильник', searchName: 'Трековый светильник' },
      { label: 'Настольный светильник', searchName: 'Настольный светильник' },
      { label: 'Коннекторы', searchName: 'Коннектор' },
      { label: 'Лампа галогенная G4', searchName: 'Лампа галогенная G4' },
      { label: 'Ретро лампа Эдисона', searchName: 'Ретро лампа Эдисона' },
      { label: 'Лампа накаливания', searchName: 'Лампа накаливания' },
      { label: 'Светодиодная лампа Classic', searchName: 'Светодиодная лампа Classic' },
      { label: 'Светодиодная лампа "Свеча на ветру"', searchName: 'Светодиодная лампа "Свеча на ветру"' },
      { label: 'Светодиодная лампа "Свеча"', searchName: 'Светодиодная лампа "Свеча"' },
      { label: 'Светодиодная лампа G45', searchName: 'Светодиодная лампа G45' },
      { label: 'Филаментная светодиодная лампа', searchName: 'Филаментная светодиодная лампа' },
      { label: 'Светодиодная лампа G9', searchName: 'Светодиодная лампа G9' },
      { label: 'Светодиодная лампа', searchName: 'Светодиодная лампа' },
      { label: 'Лампа накаливания T32', searchName: 'Лампа накаливания T32' },          
      { label: 'Светодиодная лампа G4', searchName: 'Светодиодная лампа G4' },
    ],
  },
  {
    name: 'Novotech',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Трековый светодиодный светильник', searchName: 'Трековый светодиодный светильник' },
      { label: 'Светильник трековый однофазный трехжильный', searchName: 'Светильник трековый однофазный трехжильный' },
      { label: 'Светильник накладной', searchName: 'Светильник накладной' },
      { label: 'Стандартный встраиваемый светильник', searchName: 'Встраивамый стандартный светильник' },
      { label: 'Светильник встраиваемый', searchName: 'Светильник встраиваемый' },
      { label: 'Ландшафтный настенный светильник', searchName: 'Ландшафтный настенный светильник' },
      { label: 'Подвес для светильников', searchName: 'подвес для светильников' },
      { label: 'Светильник подвесной диммируемый', searchName: 'Светильник подвесной диммируемый' },
      { label: 'Светильник подвесной', searchName: 'Светильник подвесной' },
      { label: 'Светильник без драйвера ', searchName: 'Светильник без драйвера ' },
      { label: 'Трековый светильник', searchName: 'Трековый светильник' },
    ],
  },
  {
    name: 'Denkirs',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Встраиваемый светильник', searchName: 'Встраиваемый светильник' },
      { label: 'Светильник встраиваемый в стену', searchName: 'Светильник встраиваемый в стену' },
      { label: 'Линейный светильник', searchName: 'Линейный светильник' },
      { label: 'Грунтовый светильник', searchName: 'Грунтовый светильник' },
      { label: 'Настенный уличный светильник', searchName: 'Настенный уличный светильник' },
      { label: 'Повортный встраиваемый светильник', searchName: 'Повортный встраиваемый светильник' },
      { label: 'Светильник на магните', searchName: 'Светильник на магните' },
      { label: 'Светильник для трека ремня', searchName: 'DK55' },
      { label: 'Светильник для трека', searchName: 'Светильник для трека' },
      { label: 'Накладной светильник', searchName: 'Светильник накладной' },
      { label: 'Акцентный светильник', searchName: 'Акцентный светильник' },
      { label: 'Повортный светильник для трека', searchName: 'Повортный светильник для трека' },
      { label: 'Трековый светильник', searchName: 'Трековый светильник' },
      { label: 'Подвесной светильник', searchName: 'Подвесной светильник' },
      { label: 'Угловой светильник', searchName: 'Угловой светильник' },
      { label: 'Ландшафтный светильник', searchName: 'Ландшафтный светильник' },
      { label: 'Коннектор соединитель гибкий наконечник', searchName: 'TR' },
      { label: 'Бра', searchName: 'DK50' },
    ],
  },
  {
    name: 'Werkel',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      {
        label: 'Автоматический выключатель',
        searchName: 'Автоматический выключатель',
        aliases: ['Автоматический выключатель'],
      },
      { label: 'Умный автоматический выключатель', searchName: 'Умный автоматический выключатель' },
      { label: 'Выключатель одноклавишный', searchName: 'Выключатель одноклавишный' },
      { label: 'Выключатель двухклавишный', searchName: 'Выключатель двухклавишный' },
      { label: 'Электронный карточный выключатель', searchName: 'Электронный карточный выключатель' },
      { label: 'Перекрестный выключатель', searchName: 'Перекрестный выключатель' },
      { label: 'Выключатель жалюзи', searchName: 'Выключатель жалюзи' },
      { label: 'Модульная розетка', searchName: 'Модульная розетка' },
      { label: 'Cенсорный выключатель', searchName: 'Cенсорный выключатель' },
      { label: 'Умный сенсорный выключатель', searchName: 'Умный сенсорный выключатель' },
      { label: 'Переключатель/выключатель', searchName: 'Переключатель/выключатель' },
      { label: 'Датчик движения', searchName: 'Датчик движения' },
      { label: 'Выключатель на 4 положения', searchName: 'Выключатель на 4 положения' },
      { label: 'Розетка с заземлением', searchName: 'Розетка с заземлением' },
      { label: 'Розетка двойная с заземлением', searchName: 'Розетка двойная с заземлением' },
      { label: 'Розетка тройная с заземлением', searchName: 'Розетка тройная с заземлением' },
      { label: 'Розетка для электроплиты', searchName: 'Розетка для электроплиты' },
      { label: 'Розетка Ethernet', searchName: 'Розетка Ethernet' },
      { label: 'Акустическая розетка', searchName: 'Акустическая розетка' },
      { label: 'Розетка со встроенной подсветкой', searchName: 'Розетка со встроенной подсветкой' },
      { label: 'Розетка с подсветкой', searchName: 'Розетка с подсветкой' },
      { label: 'Розетка ТВ+Ethernet', searchName: 'Розетка ТВ+Ethernet' },
      { label: 'Умная встраиваемая розетка с заземлением', searchName: 'Умная встраиваемая розетка с заземлением' },
      { label: 'Розетка с быстрой зарядкой', searchName: 'Розетка с быстрой зарядкой' },
      { label: 'Телефонная розетка', searchName: 'Телефонная розетка' },   
      { label: 'ТВ-розетка', searchName: 'ТВ-розетка' },
      { label: 'Розетка влагозащищенная', searchName: 'Розетка влагозащ.' },    
      { label: 'Терморегулятор', searchName: 'Терморегулятор' }, 
      { label: 'Умный сенсорный терморегулятор', searchName: 'Умный сенсорный терморегулятор' }, 
      { label: 'Автоматический выключатель', searchName: 'Автоматический выключатель' },
      { label: 'Рамка на 1 пост', searchName: 'Рамка на 1 пост' },
      { label: 'Рамка на 2 поста', searchName: 'Рамка на 2 поста' },
      { label: 'Рамка на 3 поста', searchName: 'Рамка на 3 поста' },
      { label: 'Рамка на 4 поста', searchName: 'Рамка на 4 поста' },
      { label: 'Рамка для двойной розетки', searchName: 'Рамка для двойной розетки' },
      { label: 'Рамка на 5 поста', searchName: 'Рамка на 5 поста' },
      
    ],
  },
  {
    name: 'Voltum',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Выключатель Встраиваемый', searchName: 'Выключатель Встраиваемый' },
      { label: 'Выключатель с самовозвратом', searchName: 'Выключатель с самовозвратом' },
      { label: 'Розетка Встраиваемая', searchName: 'Розетка Встраиваемая' },
      { label: 'Розетка Телевизионная', searchName: 'Розетка Телевизионная' },
      { label: 'Проходной переключатель встраиваемый ', searchName: 'Проходной переключатель встраиваемый ' },
      { label: 'Светорегулятор встраиваемый', searchName: 'Светорегулятор встраиваемый' },
      { label: 'Терморегулятор электронный', searchName: 'Терморегулятор электронный' },
      { label: 'Подсветка светодиодная встраиваемая', searchName: 'Подсветка светодиодная встраиваемая' },
      { label: 'Датчик движения встраиваемый', searchName: 'Датчик движения встраиваемый' },
      { label: 'Вывод кабеля VOLTUM', searchName: 'Вывод кабеля VOLTUM' },
      { label: 'Заглушка VOLTUM', searchName: 'Заглушка VOLTUM' },
      { label: 'Розетка акустическая встраиваемая', searchName: 'Розетка акустическая встраиваемая' },
      { label: 'Розетка компьютерная встраиваемая', searchName: 'Розетка компьютерная встраиваемая' },
      { label: 'Рамка стеклянная VOLTUM S70 на 1 пост', searchName: 'Рамка стеклянная VOLTUM S70 на 1 пост' },
      { label: 'Рамка стеклянная VOLTUM S70 на 2 поста', searchName: 'Рамка стеклянная VOLTUM S70 на 2 поста' },
      { label: 'Рамка стеклянная VOLTUM S70 на 3 поста', searchName: 'Рамка стеклянная VOLTUM S70 на 3 поста' },
      { label: 'Рамка стеклянная VOLTUM S70 на 4 поста', searchName: 'Рамка стеклянная VOLTUM S70 на 4 поста' },
      { label: 'Рамка стеклянная VOLTUM S70 на 5 поста', searchName: 'Рамка стеклянная VOLTUM S70 на 5 поста' },
      { label: 'Рамка пластиковая VOLTUM S70 на 1 пост', searchName: 'Рамка пластиковая VOLTUM S70 на 1 пост' },
      { label: 'Рамка пластиковая VOLTUM S70 на 2 поста', searchName: 'Рамка пластиковая VOLTUM S70 на 2 поста' },
      { label: 'Рамка пластиковая VOLTUM S70 на 3 поста', searchName: 'Рамка пластиковая VOLTUM S70 на 3 поста' },
      { label: 'Рамка пластиковая VOLTUM S70 на 4 поста', searchName: 'Рамка пластиковая VOLTUM S70 на 4 поста' },
      { label: 'Рамка пластиковая VOLTUM S70 на 5 поста', searchName: 'Рамка пластиковая VOLTUM S70 на 5 поста' },     
    ],
  },
  {
    name: 'LightStar',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
    ],
  },
  {
    name: 'KinkLight',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Настольная лампа', searchName: 'Настольная лампа' },
      { label: 'Люстра', searchName: 'Люстра' },
      { label: 'Торшер', searchName: 'Торшер' },
      {
        label: 'Люстра потолочная',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Настенный Светильник', searchName: 'Настенный Светильник' },
      { label: 'Светильник уличный', searchName: 'Светильник уличный' },
      { label: 'Подвес', searchName: 'Подвес' },
      { label: 'Бра', searchName: 'Бра' },
      { label: 'Трековый светильник', searchName: 'трековый светильник' },
    ],
  },
  {
    name: 'Stluce',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Магнитный трековый светильник', searchName: 'Магнитный трековый светильник' },
      {
        label: 'Люстра потолочная',
        
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Подвесной светильник', searchName: 'Подвесной светильник' },
      { label: 'Потолочный светильник', searchName: 'Потолочный светильник' },
      { label: 'Коннектор', searchName: 'Коннектор' },
      { label: 'Бра', searchName: 'Бра ST' },
      { label: 'Настольная лампа', searchName: 'Настольная лампа' },
      { label: 'Торшер', searchName: 'Торшер' },
    ],
  },
];

// Добавляем глобальные категории для всех брендов
brands[0].categories = [
  { label: 'Все товары', searchName: 'Все товары' },
  ...productCategories.map(cat => ({ label: cat.label, searchName: cat.searchName, aliases: [] }))
];

// Карта для сопоставления названий категорий с URL изображений
// ЗАМЕНИТЕ ЭТИ URL НА ВАШИ РЕАЛЬНЫЕ ИЗОБРАЖЕНИЯ
const categoryImageMap: Record<string, string> = {
  'Люстра': '/images/s1.png', 
  'Люстры': '/images/s1.png',
  'Светильник': '/images/s2.png',
  'Светильники': '/images/s2.png', 
  'Бра': '/images/s4.png', 
  'Торшер': '/images/s5.png', 
  'Настольная лампа': '/images/s6.png', 
  'Трековый светильник': '/images/s9.png', 
  'Точечные светильники': '/images/s8.png', 
  'Точечный светильник': '/images/s8.png',
  'Уличные светильники': '/images/s3.png',
  'Уличный светильник': '/images/s3.png', 
  'Светодиодная лента': '/images/s7.png',
  'Умный свет': '/images/smart-light.png',
  'Профиль для ленты': '/images/profile.png',
  // Добавьте другие категории по необходимости
};

// Обновленный компонент для отображения категорий с изображениями
const ImageCategories: React.FC<{ 
  categories: Category[]; 
  onCategoryClick: (category: Category) => void; 
}> = ({ categories, onCategoryClick }) => {
  // Фильтруем категории, исключая "Розетки и выключатели"
  const filteredCategories = categories.filter(
    (category) => category.label !== 'Розетки и выключатели' && category.label !== 'Все товары'
  );

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {filteredCategories.map((category, index) => {
          // Получаем URL изображения для категории
          const imageUrl = categoryImageMap[category.label] || '/images/placeholder.png';
          
          return (
            <motion.div
              key={`${category.label}-${index}`}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => onCategoryClick(category)}
              className="cursor-pointer group overflow-hidden"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full hover:shadow-md transition-shadow duration-300 flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <Image
                    src={imageUrl}
                    alt={category.label}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    priority={index < 5}
                  />
                </div>
                <div className="p-3 text-center bg-white">
                  <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate group-hover:text-black">
                    {category.label}
                  </h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// --- Вспомогательные константы (перемещаем ВЫШЕ normalizeUrlServerSafe) ---
const IMAGE_SIZES = { THUMBNAIL: 20, SMALL: 100, MEDIUM: 300, LARGE: 600 }; // Увеличил размеры для лучшего качества изображений
const QUALITY_LEVELS = { LOW: 5, MEDIUM: 30, HIGH: 50, VERY_HIGH: 75 }; // Повысил качество для лучшего визуального восприятия
const IMAGE_FORMATS = { AVIF: 'avif', WEBP: 'webp', JPG: 'jpg', PNG: 'png' }; // Форматы изображений

// Улучшенная функция для преобразования URL для оптимизации LCP
const normalizeUrlServerSafe = (originalUrl: string, isLCP: boolean = false): string | null => {
  if (!originalUrl) return null;
  const url = originalUrl.trim();

  // --- Оптимизированная логика выбора формата/качества для LCP ---
  let format: string;
  let quality: number;
  let size: number;
  
  if (isLCP) { 
    // Для LCP используем WebP с высоким качеством и средним размером
    // Это обеспечит хороший баланс между скоростью загрузки и качеством
    format = IMAGE_FORMATS.WEBP;
    quality = QUALITY_LEVELS.HIGH; 
    size = IMAGE_SIZES.MEDIUM; // Используем средний размер для LCP изображений
  } else {
    // Для обычных изображений используем JPG с очень высоким качеством
    format = IMAGE_FORMATS.JPG;
    quality = QUALITY_LEVELS.VERY_HIGH;
    size = IMAGE_SIZES.SMALL; // Меньший размер для остальных изображений
  }

  // Для разных доменов применяем специальную оптимизацию
  const isAllowedDomain = url.includes('lightstar.ru') || url.includes('moresvet.ru') || url.includes('divinare.ru');

  if (isAllowedDomain) {
    const baseUrl = url.split('?')[0];
    let optimizedUrl = `${baseUrl}?format=${format}&quality=${quality}&width=${size}`;
    
    // Дополнительные параметры оптимизации для разных форматов
    if (format === 'jpg') {
      optimizedUrl += '&progressive=true'; // Прогрессивный JPG для быстрого отображения
    }
    
    // Всегда удаляем метаданные для уменьшения размера
    optimizedUrl += '&strip=true';
    
    // Для LCP не добавляем cacheBust, чтобы не препятствовать кешированию
    if (!isLCP) {
      optimizedUrl += `&cacheBust=${Math.floor(Date.now() / 3600000)}`;
    }
    
    return optimizedUrl;
  }

  // Возвращаем исходный URL, если специальная оптимизация не применяется
  return url;
};

interface CatalogIndexProps {
  initialProducts: ProductI[];
  initialTotalPages: number;
  initialTotalProducts: number;
  source?: string;
  lcpImageUrls: string[]; // Добавляем проп для LCP URL
}

// Функция для объединения товаров с нескольких страниц
const combineProductsFromMultiplePages = async (
  sourceName: string, 
  initialPage: number = 1, 
  limit: number = 40,
  params: Record<string, any> = {},
  signal?: AbortSignal
): Promise<{
  products: ProductI[],
  totalPages: number,
  totalProducts: number
}> => {
  // Базовые параметры для запроса
  const baseParams = {
    ...params,
    limit,
    source: sourceName || '',
    inStock: 'true',  // Всегда запрашиваем только товары в наличии
  };
  
  // Массив для всех загруженных товаров
  let allProducts: ProductI[] = [];
  
  // Текущая страница запроса
  let currentPage = initialPage;
  let originalTotalPages = 0;
  let originalTotalProducts = 0;
  
  // Максимальное количество страниц для загрузки (защита от бесконечного цикла)
  const MAX_PAGES_TO_LOAD = 5;
  
  // Минимальное количество товаров, которое мы хотим получить
  const MIN_PRODUCTS_COUNT = limit; 
  
  console.log('Начинаем загрузку товаров для страницы', initialPage);
  
  // Преобразуем sourceName в строку для fetchProductsWithSorting
  const brand = sourceName || 'Все товары';
  const brandStr = typeof brand === 'string' ? brand : Array.isArray(brand) ? brand[0] : 'Все товары';
  
  try {
    // Получаем данные для первой страницы, чтобы узнать общее количество товаров и страниц
    const firstPageParams = { ...baseParams, page: initialPage };
    console.log(`Загружаем первую страницу для получения мета-информации`);
    
    // Получаем данные для текущей страницы
    const initialData = await fetchProductsWithSorting(brandStr, firstPageParams, signal);
    
    // Сохраняем оригинальную информацию о количестве страниц и товаров
    originalTotalPages = initialData.totalPages || 0;
    originalTotalProducts = initialData.totalProducts || 0;
    
    console.log(`Оригинальная информация: всего товаров - ${originalTotalProducts}, всего страниц - ${originalTotalPages}`);
    
    // Добавляем товары в наличии из первой страницы
    const inStockProducts = initialData.products ? initialData.products.filter((product: ProductI) => 
      parseInt(product.stock as string, 10) > 0
    ) : [];
    
    console.log(`Страница ${initialPage}: ${inStockProducts.length} из ${initialData.products?.length || 0} товаров в наличии`);
    
    // Добавляем товары в общий массив
    allProducts = [...allProducts, ...inStockProducts];
  } catch (error) {
    console.error('Ошибка при загрузке первой страницы:', error);
  }
  
  // Загружаем дополнительные страницы при необходимости
  if (allProducts.length < MIN_PRODUCTS_COUNT && currentPage < originalTotalPages) {
    currentPage++; // Начинаем со следующей страницы
    
    // Загружаем страницы до тех пор, пока не соберем нужное количество товаров или не достигнем ограничения
    for (let i = 0; i < MAX_PAGES_TO_LOAD - 1 && currentPage <= originalTotalPages; i++) {
      const pageParams = { ...baseParams, page: currentPage };
      console.log(`Загружаем дополнительную страницу ${currentPage} из ${originalTotalPages}`);
      
      try {
        // Получаем данные для текущей страницы
        const data = await fetchProductsWithSorting(brandStr, pageParams, signal);
        
        // Проверяем, есть ли товары в ответе
        if (!data.products || data.products.length === 0) {
          console.log(`Страница ${currentPage} не содержит товаров, прекращаем загрузку`);
          break;
        }
        
        // Добавляем только товары в наличии
        const inStockProducts = data.products.filter((product: ProductI) => 
          parseInt(product.stock as string, 10) > 0
        );
        
        console.log(`Страница ${currentPage}: ${inStockProducts.length} из ${data.products.length} товаров в наличии`);
        
        // Добавляем товары в общий массив
        allProducts = [...allProducts, ...inStockProducts];
        
        // Если собрали достаточное количество товаров, выходим
        if (allProducts.length >= MIN_PRODUCTS_COUNT) {
          console.log(`Достигнуто нужное количество товаров (${allProducts.length}), завершаем загрузку`);
          break;
        }
        
        // Переходим к следующей странице
        currentPage++;
      } catch (error) {
        console.error('Ошибка при загрузке страницы:', error);
        break;
      }
    }
  }
  
  // Выбираем товары для запрошенной страницы
  const startIndex = 0; // Всегда начинаем с первого элемента в собранном массиве
  const endIndex = Math.min(limit, allProducts.length);
  const pageProducts = allProducts.slice(startIndex, endIndex);
  
  console.log(`Итоговый результат: возвращаем ${pageProducts.length} товаров`);
  console.log(`Оригинальное количество страниц: ${originalTotalPages}, товаров: ${originalTotalProducts}`);
  console.log(`Собрано товаров в наличии: ${allProducts.length}`);
  
  // Возвращаем результаты с оригинальным количеством страниц и общего числа товаров
  return {
    products: pageProducts,
    totalPages: originalTotalPages > 0 ? originalTotalPages : 1,
    totalProducts: originalTotalProducts
  };
};

const CatalogIndex: React.FC<CatalogIndexProps> = ({
  initialProducts,
  initialTotalPages,
  initialTotalProducts,
  source,
  lcpImageUrls // Принимаем LCP URL
}) => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductI[]>(initialProducts.slice().reverse());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [totalProducts, setTotalProducts] = useState<number>(initialTotalProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Новое состояние для переключения между обычным и коллекционным режимом просмотра
  const [displayMode, setDisplayMode] = useState<'product' | 'collection'>('product');
  const limit = 40;
  
  
  
  // Добавляем состояния для фильтрации, аналогичные [name].tsx
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  // Инициализируем без значения по умолчанию, чтобы предотвратить сброс на "Люстра"
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [minPrice, setMinPrice] = useState<number>(10);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'popularity' | 'newest' | 'random' | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Состояние для категорий с аккордеоном
  const [productCategoriesState, setProductCategoriesState] = useState(productCategories);
  
  // Состояние для извлеченных фильтров
  const [extractedFilters, setExtractedFilters] = useState<{
    colors: string[];
    materials: string[];
    features: string[];
    styles: string[];
    places: string[];
  }>({
    colors: [],
    materials: [],
    features: [],
    styles: [],
    places: []
  });

  // Создаем ref для хранения текущего AbortController
  const fetchAbortController = useRef<AbortController | null>(null);

  // --- Добавляем недостающее состояние isClient ---
  const [isClient, setIsClient] = useState(false);
  // -------------------------------------------

  // При загрузке страницы устанавливаем выбранный бренд только если нет параметра category в URL
  useEffect(() => {
    // Проверяем, есть ли параметр category в URL
    const hasCategory = router.isReady && router.query.category;
    
    // Если есть параметр source но нет category, показываем все товары бренда
    if (router.isReady && router.query.source && !hasCategory) {
      const sourceName = router.query.source as string;
      
      // Специальная обработка для OdeonLight
      let brandToSearch = sourceName;
      if (sourceName.toLowerCase() === 'odeonlight') {
        brandToSearch = 'OdeonLight';
      }
      const foundBrand = brands.find(b => b.name.toLowerCase() === sourceName.toLowerCase());
      
      if (foundBrand) {
        setSelectedBrand(foundBrand);
        
        // Ищем категорию "Все товары" в списке категорий бренда
        const allProductsCategory = foundBrand.categories.find(cat => cat.label === 'Все товары');
        
        if (allProductsCategory) {
          // Если есть категория "Все товары", используем её
          setSelectedCategory(allProductsCategory);
          
          // Обновляем URL с добавлением категории "Все товары"
          router.push({
            pathname: router.pathname,
            query: { 
              ...router.query, 
              category: allProductsCategory.searchName || allProductsCategory.label,
              page: 1 
            },
          }, undefined, { shallow: true });
          
          // Запускаем загрузку всех товаров бренда
          fetchProducts(sourceName, 1);
        } else if (foundBrand.categories.length > 0) {
          // Если нет категории "Все товары", используем первую категорию
          const firstCategory = foundBrand.categories[0];
          setSelectedCategory(firstCategory);
          
          // Обновляем URL с добавлением категории
          router.push({
            pathname: router.pathname,
            query: { 
              ...router.query, 
              category: firstCategory.searchName || firstCategory.label,
              page: 1 
            },
          }, undefined, { shallow: true });
          
          // Запускаем загрузку с выбранной категорией
          fetchProducts(sourceName, 1);
        }
      }
    }
    // Если нет категории в URL и нет source, устанавливаем значения по умолчанию
    else if (!hasCategory && !router.query.source) {
      // Бренд "Все товары" по умолчанию
      setSelectedBrand(brands[0]);
      
      // Устанавливаем первую реальную категорию из списка
      if (brands[0].categories.length > 0) {
        const firstRealCategory = brands[0].categories.find(cat => cat.label !== 'Все товары') || brands[0].categories[0];
        setSelectedCategory(firstRealCategory);
      }
    }
  }, [source, router.isReady, router.query]);

  // --- Добавляем useEffect для установки isClient ---
  useEffect(() => {
    setIsClient(true);
  }, []);
  // -------------------------------------------

  // Получение товаров при изменении параметров
  useEffect(() => {
    if (router.isReady) {
      const { source: urlSource, page, category, sort, name } = router.query;
      const sourceName = urlSource || source || '';
      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const categoryName = category ? (Array.isArray(category) ? category[0] : category) : '';
      const productName = name ? (Array.isArray(name) ? name[0] : name as string) : '';
      const sortValue = sort ? (Array.isArray(sort) ? sort[0] : sort) : 'newest';
      
      // Проверяем, является ли текущая категория "Люстра" без подкатегории
      if (categoryName === 'Люстра' && !router.query.subcategory) {
        // Находим категорию "Люстра" в массиве категорий
        const lustraCategory = productCategories.find(cat => cat.label === 'Люстра' || cat.searchName === 'Люстра');
        
        // Если нашли категорию и у неё есть подкатегории
        if (lustraCategory && lustraCategory.subcategories && lustraCategory.subcategories.length > 0) {
          // Получаем первую подкатегорию
          const firstSubcategory = lustraCategory.subcategories[0];
          
          console.log('Перенаправляем с "Люстра" на первую подкатегорию:', firstSubcategory.label);
          
          // Перенаправляем на первую подкатегорию
          router.push({
            pathname: router.pathname,
            query: { 
              ...router.query,
              category: firstSubcategory.searchName,
              subcategory: firstSubcategory.label,
              page: '1'
            },
          }, undefined, { shallow: true });
          
          // Останавливаем дальнейшее выполнение useEffect
          return;
        }
      }
      
      // Находим соответствующую категорию из списка, чтобы правильно установить объект категории
      const matchedCategory = findCategoryByName(categoryName);
      
      if (matchedCategory) {
        setSelectedCategory(matchedCategory);
      } else if (categoryName) {
        // Если категория не найдена, но указана, создаем новый объект категории
        setSelectedCategory({
          label: categoryName,
          searchName: categoryName
        });
      } else {
        setSelectedCategory(null);
      }
      
      // Устанавливаем параметры сортировки
      if (sortValue === 'asc' || sortValue === 'desc' || sortValue === 'popularity' || sortValue === 'newest' || sortValue === 'random') {
        setSortOrder(sortValue);
      }
      
      // Запускаем загрузку товаров
      fetchProducts(sourceName as string, pageNumber);
    }
  }, [router.isReady, router.query]);

  // Вспомогательная функция для поиска категории по имени
  const findCategoryByName = (name: string): Category | null => {
    if (!name) return null;
    
    // Преобразуем имя к нижнему регистру для сравнения
    const lowerName = name.toLowerCase();
    
    // Ищем во всех категориях всех брендов
    for (const brand of brands) {
      for (const category of brand.categories) {
        if (
          category.label.toLowerCase() === lowerName ||
          category.searchName.toLowerCase() === lowerName ||
          (category.aliases && category.aliases.some(alias => alias.toLowerCase() === lowerName))
        ) {
          return category;
        }
        
        // Также ищем в подкатегориях, если они есть
        if (category.subcategories) {
          for (const subcategory of category.subcategories) {
            if (
              subcategory.label.toLowerCase() === lowerName ||
              subcategory.searchName.toLowerCase() === lowerName ||
              (subcategory.aliases && subcategory.aliases.some(alias => alias.toLowerCase() === lowerName))
            ) {
              return subcategory;
            }
          }
        }
      }
    }
    
    return null;
  };

  // Функция для обработки изменения категории
  const handleCategoryChange = (category: Category) => {
    // Если выбрана категория "Люстра" и у неё есть подкатегории
    if ((category.label === 'Люстра' || category.searchName === 'Люстра') && 
        category.subcategories && 
        category.subcategories.length > 0) {
      
      // Получаем первую подкатегорию
      const firstSubcategory = category.subcategories[0];
      
      console.log(`Выбрана категория ${category.label}. Перенаправляем на подкатегорию:`, firstSubcategory.label);
      
      // Переходим на первую подкатегорию
      router.push({
        pathname: router.pathname,
        query: { 
          ...router.query, 
          category: firstSubcategory.searchName,
          subcategory: firstSubcategory.label,
          page: '1'
        },
      }, undefined, { shallow: true });
    } else {
      // Обычное поведение для других категорий
      if (!selectedCategory || selectedCategory.label !== category.label) {
        setSelectedCategory(category);
        setCurrentPage(1);
        
        router.push({
          pathname: router.pathname,
          query: { 
            ...router.query, 
            category: category.searchName || category.label,
            page: '1',
            // Удаляем subcategory, если есть
            subcategory: undefined
          },
        }, undefined, { shallow: true });
      }
    }
  };

  // Функция для получения товаров
  const fetchProducts = async (sourceName: string, page: number = 1) => {
    // Отменяем предыдущий запрос, если он есть
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
    }
    
    // Создаем новый AbortController для текущего запроса
    fetchAbortController.current = new AbortController();
    
    console.log('fetchProducts запущен с параметрами:', { 
      sourceName, 
      page, 
      category: selectedCategory?.label || 'не выбрана',
      searchName: selectedCategory?.searchName || 'не указано'
    });
    
    setIsLoading(true);
    try {
      // Параметры для запроса
      const params: Record<string, any> = {};
      
      // Добавляем категорию, используя параметр name для API
      if (selectedCategory && selectedCategory.label !== 'Все товары') {
        // Проверяем наличие aliases и используем их для формирования более полного поискового запроса
        if (selectedCategory.aliases && selectedCategory.aliases.length > 0) {
          // Используем первый элемент из aliases как основной запрос
          params.name = selectedCategory.searchName || selectedCategory.label;
          
          // Добавляем aliases как дополнительные параметры поиска (опционально)
          params.aliases = selectedCategory.aliases;
        } else {
          params.name = selectedCategory.searchName || selectedCategory.label;
        }
      }
      
      // Проверяем URL-параметры, чтобы приоритезировать их над состоянием
      const categoryFromURL = router.query.category;
      if (categoryFromURL && typeof categoryFromURL === 'string' 
          && categoryFromURL.toLowerCase() !== 'все товары'
          && categoryFromURL.toLowerCase() !== 'все-товары'
          && categoryFromURL.toLowerCase() !== 'all products') {
        // Приоритет у параметра из URL
        const decodedCategory = decodeURIComponent(categoryFromURL);
        
        // Ищем категорию по URL-параметру для получения aliases
        const categoryFromDB = findCategoryByName(decodedCategory);
        if (categoryFromDB && categoryFromDB.aliases && categoryFromDB.aliases.length > 0) {
          params.name = categoryFromDB.searchName || categoryFromDB.label;
          params.aliases = categoryFromDB.aliases;
        } else {
          params.name = decodedCategory;
        }
      }
      
      // Добавляем остальные фильтры
      if (selectedColor) params.color = selectedColor;
      if (selectedMaterial) params.material = selectedMaterial;
      if (minPrice !== 10) params.minPrice = minPrice;
      if (maxPrice !== 1000000) params.maxPrice = maxPrice;
      if (searchQuery) params.search = searchQuery;
      
      // Установка параметров сортировки
      if (sortOrder) {
        if (sortOrder === 'asc') {
          params.sortBy = 'price';
          params.sortOrder = 'asc';
        } else if (sortOrder === 'desc') {
          params.sortBy = 'price';
          params.sortOrder = 'desc';
        } else if (sortOrder === 'popularity') {
          params.sortBy = 'popularity';
          params.sortOrder = 'desc';
        } else if (sortOrder === 'newest') {
          params.sortBy = 'date';
          params.sortOrder = 'desc';
        }
      } else {
        // По умолчанию используем сортировку по цене по убыванию
        params.sortBy = 'price';
        params.sortOrder = 'desc';
      }
      
      // Используем нашу новую функцию для получения товаров
      const result = await combineProductsFromMultiplePages(
        sourceName, 
        page, 
        limit, 
        params,
        fetchAbortController.current.signal
      );
      
      // Обновляем состояние компонента
      setProducts(result.products);
      setTotalPages(result.totalPages);
      setTotalProducts(result.totalProducts);
      
      // Извлекаем фильтры из всех найденных товаров
      extractFiltersFromProducts(result.products);
      
      // Выводим информацию о загруженных товарах
      console.log(`Загружено ${result.products.length} товаров в наличии из ${result.totalProducts}`);
      console.log(`Страница ${page} из ${result.totalPages}`);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Извлечение фильтров из полученных товаров
  const extractFiltersFromProducts = (products: ProductI[]) => {
    const colors = new Set<string>();
    const materials = new Set<string>();
    const features = new Set<string>();
    const styles = new Set<string>();
    const places = new Set<string>();

    products.forEach(product => {
      // Извлекаем цвета
      if (product.color) {
        colors.add(String(product.color));
      }
      
      // Извлекаем материалы
      if (product.material) {
        materials.add(String(product.material));
      }
      
      // Можно добавить извлечение других параметров, если они есть
    });

    setExtractedFilters({
      colors: Array.from(colors),
      materials: Array.from(materials),
      features: Array.from(features),
      styles: Array.from(styles),
      places: Array.from(places)
    });
  };

  // Переключение мобильного фильтра
  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };
  
  // Функция для фильтрации популярных поисковых запросов в зависимости от категории и бренда - УДАЛЕНА
  // const getRelevantPopularSearches = () => { ... };

  // Функция для обработки клика по популярному поисковому запросу - УДАЛЕНА
  // const handlePopularSearchClick = (queryParam: string) => { ... };

  // Компонент для отображения популярных запросов - УДАЛЕН
  // const PopularSearches = () => { ... };

  // Функция для поиска связанных категорий
  const findRelatedCategories = (currentCategory: Category): Category[] => {
    // Словарь связанных терминов для категорий
    const relatedTerms: Record<string, string[]> = {
      'люстра': ['подвес', 'светильник потолочный', 'свет', 'лампа', 'торшер', 'бра', 'споты', 'подсветка'],
      'светильник': ['люстра', 'подвес', 'бра', 'лампа', 'торшер', 'ночник', 'споты', 'подсветка'],
      'бра': ['настенный светильник', 'люстр', 'свет', 'лампа', 'подсветка', 'споты'],
      'лампа': ['светильник', 'люстр', 'торшер', 'бра', 'ночник', 'настольная'],
      'торшер': ['напольный светильник', 'лампа', 'свет', 'люстр', 'настольная'],
      'подвес': ['люстр', 'светильник', 'свет', 'подвесной'],
      'спот': ['точечный светильник', 'свет', 'бра', 'подсветка', 'встраиваемый'],
      'ночник': ['светильник', 'лампа', 'свет', 'детский', 'настольная'],
      'настольн': ['лампа', 'светильник', 'ночник', 'рабочий'],
      'подсветка': ['светодиодная', 'лента', 'профиль', 'свет', 'споты'],
    };
    
    // Популярные категории для показа, если не найдем связанных
    const popularCategories = ['Люстры', 'Светильники', 'Бра', 'Торшеры', 'Лампы'];
    
    if (currentCategory.label === 'Все товары' || !selectedBrand) {
      return [];
    }
    
    const relatedCategories: Category[] = [];
    const categoryName = currentCategory.label.toLowerCase();
    
    // Ищем ключевые слова в текущей категории, которые могут быть связаны с другими категориями
    const matchingTerms: string[] = [];
    
    Object.keys(relatedTerms).forEach(term => {
      if (categoryName.includes(term)) {
        matchingTerms.push(term);
      }
    });
    
    // Если не нашли ни одного ключевого слова, пробуем разбить название категории на слова
    // и искать соответствие для каждого слова
    if (matchingTerms.length === 0) {
      const words = categoryName.split(/\s+/);
      words.forEach(word => {
        Object.keys(relatedTerms).forEach(term => {
          if (word.includes(term) || term.includes(word)) {
            matchingTerms.push(term);
          }
        });
      });
    }
    
    // Собираем потенциально связанные термины
    const potentiallyRelatedTerms: string[] = [];
    
    matchingTerms.forEach(term => {
      if (relatedTerms[term]) {
        relatedTerms[term].forEach(relatedTerm => {
          if (!potentiallyRelatedTerms.includes(relatedTerm)) {
            potentiallyRelatedTerms.push(relatedTerm);
          }
        });
      }
    });
    
    // Проходим по всем категориям бренда и находим те, которые могут быть связаны
    selectedBrand.categories.forEach(category => {
      // Пропускаем текущую категорию и "Все товары"
      if (category.label === currentCategory.label || category.label === 'Все товары') {
        return;
      }
      
      const catName = category.label.toLowerCase();
      
      // Проверяем, есть ли в названии категории связанные термины
      const isRelated = potentiallyRelatedTerms.some(term => {
        // Проверяем как точное вхождение, так и наличие корней слов
        return catName.includes(term) || 
               term.includes(catName) || 
               catName.split(/\s+/).some(word => term.includes(word) || word.includes(term));
      });
      
      if (isRelated) {
        relatedCategories.push(category);
      }
    });
    
    // Если нашли слишком мало связанных категорий, добавляем несколько популярных
    if (relatedCategories.length < 3) {
      selectedBrand.categories.forEach(category => {
        if (category.label === currentCategory.label || category.label === 'Все товары' ||
            relatedCategories.some(c => c.label === category.label)) {
          return;
        }
        
        const isPopular = popularCategories.some(popular => 
          category.label.toLowerCase().includes(popular.toLowerCase())
        );
        
        if (isPopular && relatedCategories.length < 5) {
          relatedCategories.push(category);
        }
      });
    }
    
    // Если все еще недостаточно категорий, добавляем случайные категории
    if (relatedCategories.length < 3) {
      const availableCategories = selectedBrand.categories.filter(category => 
        category.label !== currentCategory.label && 
        category.label !== 'Все товары' && 
        !relatedCategories.some(c => c.label === category.label)
      );
      
      // Используем стабильную сортировку вместо случайной
      const sortedCategories = [...availableCategories].sort((a, b) => 
        a.label.localeCompare(b.label)
      );
      
      // Добавляем отсортированные категории до достижения минимального количества
      for (const category of sortedCategories) {
        if (relatedCategories.length >= 5) break;
        relatedCategories.push(category);
      }
    }
    
    // Ограничиваем количество связанных категорий
    return relatedCategories.slice(0, 5);
  };

  // Компонент для отображения связанных категорий с улучшенным дизайном
  const RelatedCategories = () => {
    let relatedCategories: Category[] = [];
    let shouldRender = false;

    // Проверяем условия для рендеринга
    if (selectedCategory && selectedCategory.label !== 'Все товары' && selectedBrand) {
      // Найдем связанные категории на основе текущей категории
      relatedCategories = findRelatedCategories(selectedCategory);
      
      // Если есть связанные категории, показываем блок
      shouldRender = relatedCategories.length > 0;
    }
    
    if (!shouldRender) {
      return <></>; 
    }
    
    return (
      <div className="mb-6 bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium mb-3 text-gray-900">
          Похожие категории
          <span className="block h-1 w-12 bg-black mt-1"></span>
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {relatedCategories.map((category, index) => (
            <motion.button
              key={`related-${index}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCategoryChange(category)}
              className="px-4 py-2 bg-white text-sm text-gray-700 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all"
            >
              {category.label}
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  // Функция для переключения состояния аккордеона категории
  const toggleCategoryAccordion = (categoryId: string) => {
    setProductCategoriesState(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, isOpen: !cat.isOpen } : cat
      )
    );
  };

  // Функция для рендеринга категорий с улучшенным дизайном
  const renderCategories = () => {
    // Всегда показываем основные категории с аккордеоном, независимо от выбранного бренда
    return (
      <div>
        <div className="space-y-1 pl-2 text-sm">
          {productCategoriesState.map((category, index) => {
            if (category.label === 'Все товары') return null;
            
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;
            const isSelected = selectedCategory?.label === category.label || 
                              selectedCategory?.searchName === category.searchName;
            
            return (
              <div key={`${category.label}-${index}`} className="mb-2">
                <div 
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                    isSelected && !hasSubcategories
                      ? 'font-medium text-white bg-gray-800 shadow-sm' 
                      : 'text-gray-700 hover:text-black hover:bg-gray-100 cursor-pointer'
                  }`}
                  onClick={() => hasSubcategories 
                    ? toggleCategoryAccordion(category.id) 
                    : handleCategoryChange(category)
                  }
                >
                  <span className="flex items-center gap-2">
                    {/* Иконка категории - можно добавить разные иконки для разных категорий */}
                    <span className="text-sm">
                      {category.label === 'Люстры' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                      )}
                      {category.label === 'Светильники' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L10 6.477 6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                        </svg>
                      )}
                      {category.label === 'Бра' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
                        </svg>
                      )}
                    </span>
                    <span>{category.label}</span>
                  </span>
                  {hasSubcategories && (
                    <span className={`transform transition-transform duration-200 text-gray-400 ${category.isOpen ? 'rotate-180' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </span>
                  )}
                </div>
                
                {/* Подкатегории в аккордеоне с анимацией */}
                <AnimatePresence>
                  {hasSubcategories && category.isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-100 ml-3">
                        {category.subcategories.map((subcat, subIndex) => {
                          const isSubSelected = selectedCategory?.label === subcat.label || 
                                             selectedCategory?.searchName === subcat.searchName;
                          
                          return (
                            <div 
                              key={`${subcat.label}-${subIndex}`}
                              className={`flex items-center px-3 py-1.5 rounded-md transition-all duration-200 ${
                                isSubSelected
                                  ? 'font-medium text-white bg-gray-800 shadow-sm' 
                                  : 'text-gray-600 hover:text-black hover:bg-gray-100 cursor-pointer'
                              }`}
                              onClick={() => handleCategoryChange(subcat)}
                            >
                              {subcat.label}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleBrandChange = (brand: Brand) => {
    setSelectedBrand(brand);
    
    // Если это не "Все товары" бренд
    if (brand.name !== 'Все товары') {
      // Проверяем наличие категории "Все товары" в списке категорий бренда
      const allProductsCategory = brand.categories.find(cat => cat.label === 'Все товары');
      
      // Если категория "Все товары" существует, выбираем её
      if (allProductsCategory) {
        setSelectedCategory(allProductsCategory);
        
        router.push({
          pathname: router.pathname,
          query: {
            ...router.query,
            source: brand.name,
            category: allProductsCategory.searchName,
            page: 1
          },
        }, undefined, { shallow: true });
        
        fetchProducts(brand.name, 1);
      } 
      // Если категории "Все товары" нет, но есть другие категории
      else if (brand.categories.length > 0) {
        // Используем первую доступную категорию
        const firstCategory = brand.categories[0];
        setSelectedCategory(firstCategory);
        
        router.push({
          pathname: router.pathname,
          query: {
            ...router.query,
            source: brand.name,
            category: firstCategory.searchName,
            page: 1
          },
        }, undefined, { shallow: true });
        
        fetchProducts(brand.name, 1);
      }
      // Если категорий вообще нет, просто переходим на бренд без категории
      else {
        setSelectedCategory(null);
        
        router.push({
          pathname: router.pathname,
          query: {
            ...router.query,
            source: brand.name,
            category: undefined,
            page: 1
          },
        }, undefined, { shallow: true });
        
        fetchProducts(brand.name, 1);
      }
    } else {
      // Для "Все товары" сбрасываем категорию
      setSelectedCategory({ label: 'Все товары', searchName: 'Все товары' });
      
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          source: undefined,
          category: undefined,
          page: 1
        },
      }, undefined, { shallow: true });
      
      fetchProducts('', 1);
    }
  };
  
  const handleColorChange = (color: string | null) => {
    // Если фильтр уже активен, снимаем его
    if (selectedColor === color) {
      setSelectedColor(null);
      
      const { color, ...restQuery } = router.query;
      router.push({
        pathname: router.pathname,
        query: { ...restQuery, page: 1 },
      }, undefined, { shallow: true });
          } else {
      setSelectedColor(color);
      
      router.push({
        pathname: router.pathname,
        query: { ...router.query, color, page: 1 },
      }, undefined, { shallow: true });
    }
    
    setCurrentPage(1);
    const sourceName = source || '';
    fetchProducts(sourceName, 1);
  };

  const handleMaterialChange = (material: string | null) => {
    if (selectedMaterial === material) {
      setSelectedMaterial(null);
      
      const { material, ...restQuery } = router.query;
      router.push({
        pathname: router.pathname,
        query: { ...restQuery, page: 1 },
      }, undefined, { shallow: true });
        } else {
      setSelectedMaterial(material);
      
      router.push({
        pathname: router.pathname,
        query: { ...router.query, material, page: 1 },
      }, undefined, { shallow: true });
    }
    
    setCurrentPage(1);
    const sourceName = source || '';
    fetchProducts(sourceName, 1);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    
    router.push({
      pathname: router.pathname,
      query: { ...router.query, minPrice: min.toString(), maxPrice: max.toString(), page: 1 },
    }, undefined, { shallow: true });
    
    setCurrentPage(1);
    const sourceName = source || '';
    fetchProducts(sourceName, 1);
  };

  const handleSortOrderChange = (order: 'asc' | 'desc' | 'popularity' | 'newest' | 'random' | null) => {
    setSortOrder(order);
    
    if (order) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, sort: order, page: 1 },
      }, undefined, { shallow: true });
    } else {
      const { sort, ...restQuery } = router.query;
      router.push({
        pathname: router.pathname,
        query: { ...restQuery, page: 1 },
      }, undefined, { shallow: true });
    }
    
    setCurrentPage(1);
    const sourceName = source || '';
    fetchProducts(sourceName, 1);
  };
  
  const handleResetFilters = () => {
    setSelectedCategory({ label: 'Все товары', searchName: 'Все товары' });
    setMinPrice(10);
    setMaxPrice(1000000);
    setSelectedColor(null);
    setSelectedMaterial(null);
    setSelectedRating(null);
    setSortOrder(null);
    setSearchQuery('');
    setCurrentPage(1);
    
    // Сбрасываем параметры в URL, оставляя только source если он есть
    const sourceName = source || '';
    router.push({
      pathname: router.pathname,
      query: sourceName ? { source: sourceName } : {},
    }, undefined, { shallow: true });
    
    fetchProducts(sourceName, 1);
  };

  // Обработчик смены страницы
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    setCurrentPage(page);
    
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page },
    }, undefined, { shallow: true });
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    const sourceName = router.query.source || source || '';
    fetchProducts(sourceName as string, page);
  };

  // --- Генерация данных для SEO ---
  const sourceTitle = selectedBrand
    ? `Товары бренда ${selectedBrand.name}${selectedCategory?.label !== 'Все товары' ? ` - ${selectedCategory?.label}` : ''}`
    : 'Каталог товаров';

  const seoKeywords = [
    sourceTitle,
    selectedBrand?.name,
    selectedCategory?.label,
    'купить',
    'интернет-магазин',
    'светильники',
    'люстры',
    // Добавьте другие релевантные ключевые слова
  ].filter(Boolean).join(', '); // Удаляем пустые значения и объединяем

  // Замените 'https://yourdomain.com' на ваш реальный домен
  const canonicalUrl = `https://moresvet.vercel.app${router.asPath}`;

  // Функция для рендера пагинации с эллипсисами
  const renderPagination = () => {
    const pageNumbers: (number | string)[] = [];
    
    // Показываем пагинацию, даже если totalPages == 1
    if (totalPages <= 0) return null;
    
    pageNumbers.push(1);
    
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    if (currentPage <= 3) {
      endPage = Math.min(totalPages - 1, 5);
    }
    
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 4);
    }
    
    if (startPage > 2) {
      pageNumbers.push('ellipsis-start');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    if (endPage < totalPages - 1) {
      pageNumbers.push('ellipsis-end');
    }
    
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return (
      <div className="flex justify-center items-center mt-8 space-x-1">
        {currentPage > 1 && (
          <button
            onClick={() => handlePageChange(1)}
            className="px-3 py-2 border rounded-md border-gray-300 hover:bg-gray-50 text-gray-700"
            aria-label="Первая страница"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0L9.414 10l4.879-4.879a1 1 0 011.414 1.414L11.828 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M9.707 15.707a1 1 0 01-1.414 0L3.414 10l4.879-4.879a1 1 0 011.414 1.414L5.828 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 border rounded-md ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
          aria-label="Предыдущая страница"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <span key={`${page}-${index}`} className="px-4 py-2 text-gray-500">
                ...
              </span>
            );
          }
          
          const pageNum = Number(page);
          return (
            <button
              key={`page-${page}-${index}`}
              onClick={() => handlePageChange(pageNum)}
              className={`min-w-[40px] px-4 py-2 border rounded-md ${
                currentPage === pageNum
                  ? 'bg-black text-white border-black hover:bg-gray-800'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              } transition-colors`}
            >
              {page}
            </button>
          );
        })}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 border rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
          aria-label="Следующая страница"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {currentPage < totalPages - 1 && (
          <button
            onClick={() => handlePageChange(totalPages)}
            className="px-3 py-2 border rounded-md border-gray-300 hover:bg-gray-50 text-gray-700"
            aria-label="Последняя страница"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0L10.586 10 5.707 5.707a1 1 0 00-1.414 1.414L8.172 10l-3.88 3.88a1 1 0 000 1.414z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 001.414 0L16.586 10l-4.879-4.879a1 1 0 00-1.414 1.414L14.172 10l-3.88 3.88a1 1 0 000 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  // Функция для группировки товаров по коллекциям
  const groupProductsByCollection = (products: ProductI[]) => {
    // Если входные данные не определены или пусты, возвращаем объект с одной категорией "Прочие товары"
    if (!products || products.length === 0) {
      return { 'Прочие товары': [] };
    }
    
    const collectionsTemp: Record<string, ProductI[]> = {};
    
    // Создаем набор известных шаблонов коллекций
    const knownCollectionPatterns = [
      // Светильники по типам
      'Люстра', 'Бра', 'Торшер', 'Светильник', 'Лампа', 'Подвес', 'Спот', 
      // Популярные коллекции из каталога
      'Werkel', 'Voltum', 'Maytoni', 'Sonex', 'Denkirs', 'Favourite', 'OdeonLight',
      'Artelamp', 'KinkLight', 'LightStar', 'Lumion', 'Novotech', 'Stluce',
      'ElektroStandard',
      // Добавляем известные названия коллекций
      'BOLLA', 'YUKA', 'OSCA', 'ZETA', 'TUBO', 'CILINO', 'RAMO', 'RAGNO', 'STREGARO',
      'FAVO', 'EXTRA', 'SIENA', 'PALLA', 'LASSA', 'MERTO', 'PIN', 'MITRA', 'PALE',
      'VAKA', 'MINI', 'COLOR', 'SNOK', 'BASICA', 'MARON', 'AVRA', 'TAN', 'PICO',
      'LINE', 'FLAT', 'SLIM', 'ESTHETIC'
    ];
    
    // Создаем набор для поиска похожих частей названий
    const productNameParts: Record<string, number> = {};
    
    // Первый проход - собираем части имен для определения общих слов и паттернов
    products.forEach(product => {
      if (typeof product.name === 'string' && product.name.trim()) {
        const productName = product.name.trim();
        
        // 1. Разбиваем имя на слова и добавляем в набор
        const words = productName.split(/\s+/).filter(word => word.length > 3);
        words.forEach(word => {
          productNameParts[word] = (productNameParts[word] || 0) + 1;
        });
        
        // 2. Ищем слова в ВЕРХНЕМ РЕГИСТРЕ (часто названия коллекций)
        const uppercaseWords = productName.match(/\b([A-ZА-Я]{3,})\b/g);
        if (uppercaseWords) {
          uppercaseWords.forEach(word => {
            // Даем больший вес словам в верхнем регистре (считаем их за 2)
            productNameParts[word] = (productNameParts[word] || 0) + 2;
          });
        }
        
        // 3. Ищем слова после предлогов "коллекция", "серия", "модель" и т.д.
        const collectionMarkers = [
          /коллекция\s+([A-Za-zА-Яа-я0-9]+)/i,
          /серия\s+([A-Za-zА-Яа-я0-9]+)/i,
          /модель\s+([A-Za-zА-Яа-я0-9]+)/i,
          /collection\s+([A-Za-zА-Яа-я0-9]+)/i,
          /серии\s+([A-Za-zА-Яа-я0-9]+)/i
        ];
        
        collectionMarkers.forEach(marker => {
          const match = productName.match(marker);
          if (match && match[1]) {
            // Даем наибольший вес словам после маркеров коллекций (считаем их за 3)
            productNameParts[match[1]] = (productNameParts[match[1]] || 0) + 3;
          }
        });
      }
    });
    
    // Выбираем наиболее частые слова как коллекции (с порогом минимум 2 товара)
    const commonNameParts = Object.entries(productNameParts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
    
    // Объединяем common parts с известными паттернами, отдавая приоритет common
    const allCollectionPatterns = [...commonNameParts, ...knownCollectionPatterns];
    
    // Второй проход - группируем на основе собранной информации
    products.forEach(product => {
      // Определяем коллекцию по разным полям и алгоритмам с приоритетами
      let collectionName = 'Без коллекции';
      
      // 1. Используем явное поле collection, если оно есть
      if (product.collection) {
        collectionName = String(product.collection);
      } 
      // 2. Ищем коллекцию в названии товара
      else if (typeof product.name === 'string' && product.name.trim()) {
        const productName = product.name.trim();
        
        // Сначала проверяем явные маркеры коллекций
        let foundCollectionMarker = false;
        const collectionMarkers = [
          /коллекция\s+([A-Za-zА-Яа-я0-9]+)/i,
          /серия\s+([A-Za-zА-Яа-я0-9]+)/i,
          /модель\s+([A-Za-zА-Яа-я0-9]+)/i,
          /collection\s+([A-Za-zА-Яа-я0-9]+)/i,
          /серии\s+([A-Za-zА-Яа-я0-9]+)/i
        ];
        
        for (const marker of collectionMarkers) {
          const match = productName.match(marker);
          if (match && match[1]) {
            collectionName = match[1];
            foundCollectionMarker = true;
            break;
          }
        }
        
        // Если явных маркеров нет, ищем слова в ВЕРХНЕМ РЕГИСТРЕ
        if (!foundCollectionMarker) {
          const uppercaseWords = productName.match(/\b([A-ZА-Я]{3,})\b/g);
          if (uppercaseWords && uppercaseWords.length > 0) {
            collectionName = uppercaseWords[0];
            foundCollectionMarker = true;
          }
        }
        
        // Если и этого нет, ищем совпадения с паттернами коллекций
        if (!foundCollectionMarker) {
          for (const pattern of allCollectionPatterns) {
            if (productName.includes(pattern)) {
              collectionName = pattern;
              foundCollectionMarker = true;
              break;
            }
          }
        }
        
        // Если ничего не нашли, используем первое слово названия
        if (!foundCollectionMarker) {
          const nameMatch = productName.match(/([А-Яа-яA-Za-z0-9]{3,})/);
          if (nameMatch && nameMatch[1]) {
            collectionName = nameMatch[1];
          }
        }
      } 
      // 3. Используем бренд товара как последний вариант
      else if (product.source && typeof product.source === 'string') {
        collectionName = String(product.source);
      }
      
      // Добавляем товар в соответствующую коллекцию
      if (!collectionsTemp[collectionName]) {
        collectionsTemp[collectionName] = [];
      }
      collectionsTemp[collectionName].push(product);
    });
    
    // Финальные коллекции после обработки
    const collections: Record<string, ProductI[]> = {};
    
    // Создаем категорию для разрозненных товаров (всегда должна существовать)
    collections['Прочие товары'] = [];
    
    // Обрабатываем временные коллекции
    Object.entries(collectionsTemp)
      // Сортируем коллекции по количеству товаров для лучшей группировки
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([name, items]) => {
        // Если в коллекции больше 1 товара, сохраняем её
        if (items.length > 1) {
          collections[name] = items;
        } else {
          // Иначе добавляем товар в "Прочие товары"
          collections['Прочие товары'].push(...items);
        }
      });
    
    // Убедимся, что есть хотя бы одна коллекция, даже если все товары в "Прочие товары"
    if (Object.keys(collections).length === 0 || 
       (Object.keys(collections).length === 1 && collections['Прочие товары'].length === 0)) {
      return { 'Все товары': products };
    }
    
    return collections;
  };

  // Новое состояние для отслеживания ширины экрана
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Эффект для определения мобильного устройства
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Установить начальное состояние
    handleResize();
    
    // Добавить обработчик события resize
    window.addEventListener('resize', handleResize);
    
    // Очистка при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Фильтр цены с улучшенной адаптивностью
  // ... existing code ...

  // Компонент для стилизованного отображения фильтра цены
  const PriceFilter = () => {
    // Локальные состояния для ввода цен
    const [tempMinPrice, setTempMinPrice] = useState<string>(minPrice === 10 ? '' : minPrice.toString());
    const [tempMaxPrice, setTempMaxPrice] = useState<string>(maxPrice === 1000000 ? '' : maxPrice.toString());
    
    // Обработчик применения фильтра
    const applyPriceFilter = () => {
      const min = tempMinPrice === '' ? 10 : parseInt(tempMinPrice);
      const max = tempMaxPrice === '' ? 1000000 : parseInt(tempMaxPrice);
      handlePriceRangeChange(min, max);
    };
    
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h2 className="font-bold mb-3 text-gray-900 uppercase text-sm">Цена, ₽</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center gap-3">
            <div className="flex-1 relative group">
              <input
                type="number"
                min="0"
                placeholder="От"
                value={tempMinPrice}
                onChange={(e) => setTempMinPrice(e.target.value)}
                className="w-full p-2.5 border border-gray-200 group-hover:border-gray-400 rounded-lg text-sm transition-colors bg-gray-50 group-hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white"
              />
              <span className="absolute top-2.5 right-3 text-gray-400 pointer-events-none">₽</span>
            </div>
            <span className="text-gray-400">—</span>
            <div className="flex-1 relative group">
              <input
                type="number"
                min="0"
                placeholder="До"
                value={tempMaxPrice}
                onChange={(e) => setTempMaxPrice(e.target.value)}
                className="w-full p-2.5 border border-gray-200 group-hover:border-gray-400 rounded-lg text-sm transition-colors bg-gray-50 group-hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white"
              />
              <span className="absolute top-2.5 right-3 text-gray-400 pointer-events-none">₽</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={applyPriceFilter}
            className="bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Применить
          </motion.button>
        </div>
      </div>
    );
  };

  // Компонент для отображения цветов с улучшенным стилем
  const ColorFilter = () => {
    if (extractedFilters.colors.length === 0) return null;
    
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-gray-100">
        <h2 className="font-bold mb-3 text-gray-900 uppercase text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Цвет
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {extractedFilters.colors.map((color) => (
            <motion.div
              key={color}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedColor === color 
                  ? 'bg-gray-800 text-white shadow-sm' 
                  : 'hover:bg-gray-50 border border-gray-100'
              }`}
              onClick={() => handleColorChange(color)}
            >
              <div 
                className={`w-5 h-5 rounded-full mr-2 flex-shrink-0 ${selectedColor === color ? 'ring-2 ring-white' : 'border border-gray-300'}`} 
                style={{ backgroundColor: color.toLowerCase() }}
              />
              <span className={`${selectedColor === color ? 'text-white font-medium' : 'text-gray-700'} text-sm truncate`}>
                {color}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Компонент для отображения материалов
  const MaterialFilter = () => {
    if (extractedFilters.materials.length === 0) return null;
    
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-gray-100">
        <h2 className="font-bold mb-3 text-gray-900 uppercase text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Материал
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {extractedFilters.materials.map((material) => (
            <motion.div
              key={material}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedMaterial === material 
                  ? 'bg-gray-800 text-white shadow-sm' 
                  : 'hover:bg-gray-50 border border-gray-100'
              }`}
              onClick={() => handleMaterialChange(material)}
            >
              <span 
                className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mr-2 ${
                  selectedMaterial === material 
                    ? 'bg-white text-gray-800' 
                    : 'border border-gray-300 bg-gray-50'
                }`}
              >
                {selectedMaterial === material && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className={`${selectedMaterial === material ? 'text-white font-medium' : 'text-gray-700'} text-sm truncate`}>
                {material}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Компонент для отображения активных фильтров
  const ActiveFilters = () => {
    if (
      !(selectedBrand?.name !== 'Все товары' || 
      selectedCategory?.label !== 'Все товары' || 
      minPrice !== 10 || 
      maxPrice !== 1000000 || 
      selectedColor ||
      selectedMaterial ||
      searchQuery)
    ) {
      return null;
    }
    
    return (
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Активные фильтры</h3>
          <button
            onClick={handleResetFilters}
            className="text-xs text-gray-600 hover:text-black hover:underline font-medium flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Сбросить все
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center mt-2">
          {selectedCategory?.label !== 'Все товары' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-gray-800 to-gray-700 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 text-white shadow-sm"
            >
              <span>Категория: {selectedCategory?.label}</span>
              <button 
                onClick={() => handleCategoryChange({ label: 'Все товары', searchName: 'Все товары' })} 
                className="text-gray-200 hover:text-white p-0.5 ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          )}
          
          {selectedBrand && selectedBrand.name !== 'Все товары' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-gray-800 to-gray-700 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 text-white shadow-sm"
            >
              <span>Бренд: {selectedBrand.name}</span>
              <button 
                onClick={() => {
                  const globalBrand = brands.find(b => b.name === 'Все товары');
                  if (globalBrand) handleBrandChange(globalBrand);
                }}
                className="text-gray-200 hover:text-white p-0.5 ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          )}
          
          {(minPrice !== 10 || maxPrice !== 1000000) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 text-white shadow-sm"
            >
              <span>Цена: {minPrice} - {maxPrice} ₽</span>
              <button 
                onClick={() => {
                  setMinPrice(10);
                  setMaxPrice(1000000);
                  handlePriceRangeChange(10, 1000000);
                }} 
                className="text-blue-100 hover:text-white p-0.5 ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          )}
          
          {selectedColor && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-purple-600 to-purple-500 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 text-white shadow-sm"
            >
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-1.5 border border-white" style={{ backgroundColor: selectedColor.toLowerCase() }}></span>
                Цвет: {selectedColor}
              </span>
              <button 
                onClick={() => handleColorChange(selectedColor)} 
                className="text-purple-100 hover:text-white p-0.5 ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          )}
          
          {selectedMaterial && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-green-600 to-green-500 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 text-white shadow-sm"
            >
              <span>Материал: {selectedMaterial}</span>
              <button 
                onClick={() => handleMaterialChange(selectedMaterial)} 
                className="text-green-100 hover:text-white p-0.5 ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          )}
          
          {searchQuery && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-amber-600 to-amber-500 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 text-white shadow-sm"
            >
              <span>Поиск: {searchQuery}</span>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  fetchProducts(selectedBrand?.name || '');
                }} 
                className="text-amber-100 hover:text-white p-0.5 ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  // Компонент для кнопки сброса фильтров
  const ResetFiltersButton = () => {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-all font-medium flex items-center justify-center group"
          onClick={handleResetFilters}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Сбросить все фильтры
        </motion.button>
      </div>
    );
  };

  // Улучшенный компонент с красивым заголовком
  const CatalogHeading = () => {
    return (
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 relative inline-block">
          {sourceTitle}
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="block h-1.5 bg-gradient-to-r from-gray-800 to-gray-500 mt-2"
          />
        </h1>
        <p className="text-gray-600 mt-2 max-w-3xl">
          Выберите из широкого ассортимента {selectedCategory?.label || 'светотехники'} 
          {selectedBrand?.name !== 'Все товары' && ` от бренда ${selectedBrand?.name}`}. Мы поможем создать идеальное 
          световое решение для вашего пространства.
        </p>
      </div>
    );
  };

  // Компонент для улучшенной сортировки товаров
  const EnhancedSortControl = () => {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-gray-700 font-medium w-full sm:w-auto text-center sm:text-left flex items-center">
            Найдено: <span className="text-black font-semibold ml-1">{totalProducts}</span> товаров
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Переключатель режима отображения */}
            <div className="bg-gray-100 rounded-full p-1 flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-gray-800 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Сетка"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'list' 
                    ? 'bg-gray-800 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Список"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
            
            {/* Переключатель товар/коллекции */}
            <div className="hidden sm:flex bg-white border border-gray-200 rounded-full px-1 py-1 shadow-sm">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDisplayMode('product')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  displayMode === 'product' 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Товары
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDisplayMode('collection')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  displayMode === 'collection'
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Коллекции
              </motion.button>
            </div>
            
            {/* Выпадающий список сортировки */}
            <div className="relative group">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent group-hover:border-gray-400 transition-colors"
                value={sortOrder || 'popularity'}
                onChange={(e) => handleSortOrderChange(e.target.value as any)}
              >
                <option value="popularity">По популярности</option>
                <option value="newest">Сначала новые</option>
                <option value="asc">Цена ↑</option>
                <option value="desc">Цена ↓</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Компонент для красивых хлебных крошек
  const EnhancedBreadcrumbs = () => {
    return (
      <div className="mb-4 py-3 hidden sm:block">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/">
                <a className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Главная
                </a>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link href="/catalog">
                  <a className="ml-1 text-sm font-medium text-gray-600 hover:text-gray-900 md:ml-2 transition-colors">Каталог</a>
                </Link>
              </div>
            </li>
            
            {selectedBrand && selectedBrand.name !== 'Все товары' && (
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-600 md:ml-2">{selectedBrand.name}</span>
                </div>
              </li>
            )}
            
            {selectedCategory && selectedCategory.label !== 'Все товары' && (
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-900 md:ml-2">{selectedCategory.label}</span>
                </div>
              </li>
            )}
          </ol>
        </nav>
      </div>
    );
  };

  // Компонент для красивого заголовка каталога
  const CatalogPageHeader = () => {
    return (
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 inline-block relative"
        >
          {sourceTitle}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-gray-800 to-gray-500"
          />
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-600 mt-4 max-w-3xl text-sm md:text-base"
        >
          {selectedCategory?.label !== 'Все товары' 
            ? `${selectedCategory?.label} - это современное и практичное световое решение для вашего интерьера. ${selectedBrand?.name !== 'Все товары' ? `Бренд ${selectedBrand?.name} предлагает качественные и надёжные модели. ` : ''}Выбирайте из широкого ассортимента и создавайте уютную атмосферу в вашем пространстве.`
            : `Освещение играет важную роль в создании атмосферы в любом помещении. ${selectedBrand?.name !== 'Все товары' ? `Бренд ${selectedBrand?.name} предлагает широкий ассортимент светотехники от классики до современных моделей. ` : ''}Выбирайте из нашей коллекции и преобразите ваш интерьер.`
          }
        </motion.p>
        
        <div className="flex flex-wrap gap-4 mt-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Быстрая доставка</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Гарантия качества</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Профессиональная поддержка</span>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>{sourceTitle}</title>
        <meta name="description" content={seoKeywords} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>
      <Header />
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4">
          <ImageCategories categories={productCategories} onCategoryClick={handleCategoryChange} />
        </div>
        <div className="md:w-3/4">
          <CatalogHeading />
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3">
              <RelatedCategories />
            </div>
            <div className="md:w-2/3">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  {renderCategories()}
                </div>
                <div className="md:w-2/3">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2">
                      <PriceFilter />
                    </div>
                    <div className="md:w-1/2">
                      <ColorFilter />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2">
                      <MaterialFilter />
                    </div>
                    <div className="md:w-1/2">
                      <ActiveFilters />
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <ResetFiltersButton />
                  </div>
                  <div className="md:w-1/2">
                    <CatalogOfProductSearch products={products} viewMode={viewMode === 'table' ? 'grid' : viewMode} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            {isLoading ? (
              <div className="flex justify-center">
                <ClipLoader color="#36d7b7" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product, index) => (
                  <div key={product._id || `product-${index}`} className="bg-white rounded-lg shadow-md p-4">
                    <Link href={`/product/${product._id}`}>
                      <a>
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={typeof product.image === 'string' ? product.image : '/images/placeholder.png'}
                            alt={typeof product.name === 'string' ? product.name : 'Product image'}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <h3 className="mt-2 text-lg font-medium">{product.name}</h3>
                        <p className="text-gray-600">{product.description}</p>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-gray-800 font-medium">₽{product.price}</span>
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">Купить</button>
                        </div>
                      </a>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-8">
                {renderPagination()}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CatalogIndex;