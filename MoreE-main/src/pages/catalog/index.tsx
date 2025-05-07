'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import Link from 'next/link';
import Header from '@/components/Header';
import 'tailwindcss/tailwind.css';
import Footer from '@/components/Footer';
import { ProductI } from '@/types/interfaces';
import { BASE_URL } from '@/utils/constants';
import { ClipLoader } from 'react-spinners';
import SEO from '@/components/SEO';
import { fetchProductsWithSorting } from '@/utils/api';

import CatalogOfProductSearch from '@/components/Catalogofsearch';
import Head from 'next/head'; // Добавляем импорт Head

// Импортируем типы для категорий и брендов
export type Category = {
  label: string;
  searchName: string;
  href?: string;
  aliases?: string[];
  subcategories?: Category[]; // Добавляем подкатегории
  isOpen?: boolean; // Для состояния аккордеона
  id?: string; // Добавляем id для идентификации категории
};

export type Brand = {
  name: string;
  categories: Category[];
};

// Добавляем новый тип для популярных поисковых запросов
export type PopularSearch = {
  text: string;
  queryParam: string;
  forCategories?: string[];
  forBrands?: string[];
};

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
    searchName: 'Настенный светильник',
    aliases: ['Бра', 'Настенный светильник', 'Настенные светильники'],
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
  { 
    id: 'komplektuyushie', 
    label: 'Комплектующие', 
    searchName: 'Комплектующие',
    aliases: ['Комплектующие', 'Комплектующие для светильников', 'Комплектующие для освещения'],
    subcategories: [
      { 
        label: 'Коннекторы', 
        searchName: 'Коннекторы',
        aliases: ['Коннекторы', 'Коннектор', 'Коннекторы для светильников', 'Коннекторы для освещения']
      },
      { 
        label: 'Шнуры', 
        searchName: 'Шнуры',
        aliases: ['Шнуры', 'Шнур', 'Шнуры для светильников', 'Шнуры для освещения']
      },
      { 
        label: 'Блок питания', 
        searchName: 'Блок питания',
        aliases: ['Блок питания', 'Блок питания для светильников', 'Блок питания для освещения']
      },
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
  'Люстра': '/images/lustry.jpg', 
  'Светильник': '/images/svetilniki.jpeg',
  'Бра': '/images/bra.jpeg', 
  'Торшер': '/images/torher.jpg', 
  'Настольная лампа': '/images/nastolny.jpg', 
  'Трековый светильник': '/images/s9.png', 
  'Точечные светильники': '/images/s8.png', 
  'Уличные освещение': '/images/ylihnoe.jpg',
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
    <div className="mb-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {filteredCategories.slice(0, 6).map((category, index) => {
          // Определяем URL изображения для категории
          const imageUrl = categoryImageMap[category.label] || '/images/s1.png';
          
          // Сопоставляем метки с изображения
          let displayLabel = category.label;
          if (category.label.includes('Люстра')) displayLabel = 'Люстры';
          else if (category.label.includes('Светильник')) displayLabel = 'Светильники';
          else if (category.label.includes('Бра')) displayLabel = 'Бра';
          else if (category.label.includes('Настольная')) displayLabel = 'Настольные светильники';
          else if (category.label.includes('Торшер') || category.label.includes('Торшеры')) displayLabel = 'Напольные светильники';
          else if (category.label.includes('Уличный светильник')) displayLabel = 'Уличное освещение';
          
          return (
            <div
              key={index}
              onClick={() => onCategoryClick(category)}
              className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
            >
              <div className="relative w-full aspect-square mb-4 overflow-hidden bg-white border border-gray-200">
                <img 
                  src={imageUrl} 
                  alt={category.label}
                  className="w-full h-full object-contain p-4"
                />
              </div>
              <div className="text-center text-sm font-medium">{displayLabel}</div>
            </div>
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

  // Компонент для отображения связанных категорий
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
    
    // Вместо раннего возврата null, рендерим пустой фрагмент, если не нужно отображать
    if (!shouldRender) {
      return <></>; // Пустой фрагмент вместо null
    }
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Похожие категории</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {relatedCategories.map((category, index) => (
            <div 
              key={`related-${index}`}
              onClick={() => handleCategoryChange(category)}
              className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center"
            >
              <div className="text-sm font-medium">{category.label}</div>
            </div>
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

  // Функция для рендеринга категорий
  const renderCategories = () => {
    // Всегда показываем основные категории с аккордеоном, независимо от выбранного бренда
    return (
      <div>
        <div className="space-y-1 pl-2 text-sm">
          {productCategoriesState.map((category, index) => {
            if (category.label === 'Все товары') return null;
            
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;
            
            return (
              <div key={`${category.label}-${index}`} className="mb-1">
                <div 
                  className={`flex items-center justify-between px-2 py-1.5 rounded transition-colors duration-200 ${
                    (selectedCategory?.label === category.label || 
                    selectedCategory?.searchName === category.searchName) && 
                    !hasSubcategories
                      ? 'font-bold text-black bg-gray-100' 
                      : 'text-gray-600 hover:text-black hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={() => hasSubcategories 
                    ? toggleCategoryAccordion(category.id) 
                    : handleCategoryChange(category)
                  }
                >
                  <span>{category.label}</span>
                  {hasSubcategories && (
                    <span className="transform transition-transform duration-200 text-gray-400">
                      {category.isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                      )}
                    </span>
                  )}
                </div>
                
                {/* Подкатегории в аккордеоне */}
                {hasSubcategories && category.isOpen && (
                  <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-100 ml-2">
                    {category.subcategories.map((subcat, subIndex) => (
                      <div 
                        key={`${subcat.label}-${subIndex}`}
                        className={`flex items-center px-2 py-1 rounded transition-colors duration-200 ${
                          selectedCategory?.label === subcat.label || 
                          selectedCategory?.searchName === subcat.searchName
                            ? 'font-bold text-black bg-gray-100' 
                            : 'text-gray-600 hover:text-black hover:bg-gray-50 cursor-pointer'
                        }`}
                        onClick={() => handleCategoryChange(subcat)}
                      >
                        {subcat.label}
                      </div>
                    ))}
                  </div>
                )}
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
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0L10.586 10l-4.879-4.879a1 1 0 00-1.414 1.414L8.172 10l-3.88 3.88a1 1 0 000 1.414z" clipRule="evenodd" />
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Head>
        {/* Рендерим preload теги для LCP изображений с приоритетной загрузкой */}
        {lcpImageUrls.map((url) => (
          <link
            key={url}
            rel="preload"
            href={url}
            as="image"
          />
        ))}
        {/* SEO компонент и другие теги <head> */}
        <SEO
          title={sourceTitle}
          description={`Каталог товаров ${selectedBrand?.name || ''} ${selectedCategory?.label || ''}. Большой выбор светильников и люстр.`}
          keywords={seoKeywords}
          url={canonicalUrl}
        />
      </Head>
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 lg:px-8 pt-4 sm:pt-6 pb-12 max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Хлебные крошки - скрываем на самых маленьких экранах */}
          <div className="hidden sm:flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-900 transition-colors">Назад</Link>
            <span className="mx-2">/</span>
            <Link href="/" className="hover:text-gray-900 transition-colors">Главная</Link>
            <span className="mx-2">/</span>
            <Link href="/catalog" className="hover:text-gray-900 transition-colors">Каталог</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">ДЕКОРАТИВНЫЙ СВЕТ</span>
          </div>
          
          {/* Заголовок с переключателем режима просмотра */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 sm:mb-12 gap-3">
            <h1 className="text-4xl md:text-5xl font-bold text-center w-full">
              ДЕКОРАТИВНЫЙ СВЕТ
            </h1>
          </div>
          
          {/* Добавляем компонент ImageCategories здесь */}
          {isClient && (
            <ImageCategories 
              categories={[
                { id: 'podvesnye', label: 'Люстра', searchName: 'Люстры' },
                { id: 'potolochnye', label: 'Светильник', searchName: 'Светильники' },
                { id: 'nastennye', label: 'Бра', searchName: 'Настенные светильники' },
                { id: 'nastolnye', label: 'Настольная лампа', searchName: 'Настольные светильники' },
                { id: 'napolnye', label: 'Торшер', searchName: 'Напольные светильники' },
                { id: 'komplektuyuschie', label: 'Уличное освещение', searchName: 'Уличный светильник' }
              ]} 
              onCategoryClick={handleCategoryChange}
            />
          )}
          
          {/* Mobile Filter Button - улучшенный вид */}
          <div className="lg:hidden mb-4">
            <button 
              onClick={toggleMobileFilter}
              className="w-full py-2.5 px-4 bg-white rounded-md shadow-sm flex items-center justify-between border border-gray-200"
            >
              <span className="font-medium flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Фильтры
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
                {totalProducts} товаров
              </span>
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Left Sidebar - Улучшенный мобильный фильтр */}
            <div className={`
              ${isMobileFilterOpen ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-4' : 'hidden'} 
              lg:block lg:relative lg:z-auto lg:w-[220px] lg:flex-shrink-0
            `}>
              {/* Mobile Filter Header с кнопкой закрытия */}
              {isMobileFilterOpen && (
                <div className="lg:hidden flex justify-between items-center mb-4 pb-3 border-b sticky top-0 bg-white z-10">
                  <h2 className="font-bold text-lg">Фильтры</h2>
                  <button 
                    onClick={toggleMobileFilter} 
                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Кнопка фильтров */}
              <div className="bg-white rounded-md p-3 shadow-sm mb-4 border border-gray-200">
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="font-medium text-sm uppercase">Фильтры</span>
                </div>
                <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-1">
                  {/* Опции фильтра "Показывать только" */}
                  <div className="py-2">
                    <div className="text-sm font-medium mb-2">Показывать только</div>
                    <div className="flex flex-col gap-2 ml-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-black rounded-sm border-gray-300" />
                        <span className="text-sm text-gray-700">В наличии</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-black rounded-sm border-gray-300" />
                        <span className="text-sm text-gray-700">Популярные</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-black rounded-sm border-gray-300" />
                        <span className="text-sm text-gray-700">3D</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-black rounded-sm border-gray-300" />
                        <span className="text-sm text-gray-700">Новинка</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Категории в боковой панели */}
                  <div className="py-2 border-t border-gray-100 mt-2">
                    <div className="text-sm font-medium mb-2">Категории</div>
                    <div className="space-y-1">
                      {productCategoriesState.map((category) => (
                        <div key={category.id} className="mb-1">
                          <div 
                            className={`flex items-center justify-between px-2 py-1.5 rounded transition-colors duration-200 ${
                              (selectedCategory?.label === category.label || 
                              selectedCategory?.searchName === category.searchName) 
                                ? 'font-bold text-black bg-gray-100' 
                                : 'text-gray-600 hover:text-black hover:bg-gray-50 cursor-pointer'
                            }`}
                            onClick={() => category.subcategories && category.subcategories.length > 0
                              ? toggleCategoryAccordion(category.id)
                              : handleCategoryChange(category)
                            }
                          >
                            <span className="text-sm">{category.label}</span>
                            {category.subcategories && category.subcategories.length > 0 && (
                              <span className="transform transition-transform duration-200 text-gray-400">
                                {category.isOpen ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                          
                          {/* Подкатегории в аккордеоне */}
                          {category.subcategories && category.subcategories.length > 0 && category.isOpen && (
                            <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-100 ml-2">
                              {category.subcategories.map((subcat, subIndex) => (
                                <div 
                                  key={`${subcat.label}-${subIndex}`}
                                  className={`flex items-center px-2 py-1 rounded transition-colors duration-200 ${
                                    selectedCategory?.label === subcat.label || 
                                    selectedCategory?.searchName === subcat.searchName
                                      ? 'font-bold text-black bg-gray-100' 
                                      : 'text-gray-600 hover:text-black hover:bg-gray-50 cursor-pointer'
                                  }`}
                                  onClick={() => handleCategoryChange(subcat)}
                                >
                                  <span className="text-sm">{subcat.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Filters button */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                <button
                  className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm text-gray-700 transition-colors font-medium flex items-center justify-center"
                  onClick={handleResetFilters}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Сбросить все фильтры
                </button>
              </div>
              
              {/* Закрыть фильтр на мобильных */}
              {isMobileFilterOpen && (
                <div className="lg:hidden sticky bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200 mt-auto">
                  <button
                    onClick={toggleMobileFilter}
                    className="w-full py-2.5 bg-black text-white font-medium rounded-md"
                  >
                    Показать результаты ({totalProducts})
                  </button>
                </div>
              )}

              {/* Добавляем блок брендов в мобильный фильтр */}
              {isMobileFilterOpen && (
                <div className="lg:hidden">
                  {/* Блок категорий для мобильного фильтра */}
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4 border border-gray-100">
                    <h2 className="font-bold mb-3 text-gray-900 uppercase text-sm">Категории</h2>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {productCategoriesState.map((category) => (
                        <div key={category.id} className="mb-1">
                          <div 
                            className={`flex items-center justify-between px-2 py-1.5 rounded transition-colors duration-200 ${
                              (selectedCategory?.label === category.label || 
                              selectedCategory?.searchName === category.searchName) 
                                ? 'font-bold text-black bg-gray-100' 
                                : 'text-gray-600 hover:text-black hover:bg-gray-50 cursor-pointer'
                            }`}
                            onClick={() => category.subcategories && category.subcategories.length > 0
                              ? toggleCategoryAccordion(category.id)
                              : handleCategoryChange(category)
                            }
                          >
                            <span className="text-sm">{category.label}</span>
                            {category.subcategories && category.subcategories.length > 0 && (
                              <span className="transform transition-transform duration-200 text-gray-400">
                                {category.isOpen ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                          
                          {/* Подкатегории в аккордеоне для мобильного фильтра */}
                          {category.subcategories && category.subcategories.length > 0 && category.isOpen && (
                            <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-100 ml-2">
                              {category.subcategories.map((subcat, subIndex) => (
                                <div 
                                  key={`${subcat.label}-${subIndex}`}
                                  className={`flex items-center px-2 py-1 rounded transition-colors duration-200 ${
                                    selectedCategory?.label === subcat.label || 
                                    selectedCategory?.searchName === subcat.searchName
                                      ? 'font-bold text-black bg-gray-100' 
                                      : 'text-gray-600 hover:text-black hover:bg-gray-50 cursor-pointer'
                                  }`}
                                  onClick={() => handleCategoryChange(subcat)}
                                >
                                  <span className="text-sm">{subcat.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4 border border-gray-100">
                    <h2 className="font-bold mb-3 text-gray-900 uppercase text-sm">Бренды</h2>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {/* Если есть source, показываем только выбранный бренд */}
                      {router.query.source && selectedBrand ? (
                        <div
                          className="flex items-center px-2 py-1.5 rounded transition-colors duration-200 font-bold text-black bg-gray-100"
                        >
                          {selectedBrand.name}
                        </div>
                      ) : (
                        // Иначе показываем все бренды
                        brands.map((brand, index) => (
                          <div
                            key={index}
                            className={`flex items-center px-2 py-1.5 rounded transition-colors duration-200 ${
                              selectedBrand?.name === brand.name
                                ? 'font-bold text-black bg-gray-100' 
                                : 'text-gray-600 hover:text-black hover:bg-gray-50 cursor-pointer'
                            }`}
                            onClick={() => handleBrandChange(brand)}
                          >
                            {brand.name}
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Показываем категории выбранного бренда в мобильном фильтре */}
                    {selectedBrand && selectedBrand.name !== 'Все товары' && selectedBrand.categories.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="font-medium text-sm text-gray-700 mb-2">Категории {selectedBrand.name}</h3>
                        <div className="space-y-1.5">
                          {selectedBrand.categories
                            .filter(category => category.label !== 'Все товары')
                            .map((category, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  // При клике на категорию бренда мы меняем только выбранную категорию
                                  setSelectedCategory(category);
                                  
                                  // Обновляем URL с сохранением источника (бренда)
                                  router.push({
                                    pathname: router.pathname,
                                    query: {
                                      ...router.query,
                                      source: selectedBrand.name === 'Все товары' ? undefined : selectedBrand.name,
                                      category: category.searchName,
                                      page: 1
                                    },
                                  }, undefined, { shallow: true });
                                  
                                  // Загружаем товары и закрываем мобильный фильтр
                                  fetchProducts(selectedBrand.name === 'Все товары' ? '' : selectedBrand.name, 1);
                                  setIsMobileFilterOpen(false);
                                }}
                                className={`px-3 py-2 rounded-md text-sm ${
                                  selectedCategory?.label === category.label
                                    ? 'bg-gray-800 text-white font-medium'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                {category.label}
                              </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content Area */}
            <div className="flex-1">
              {/* Filter and Sort controls с улучшенной адаптивностью */}
              <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-sm text-gray-700 font-medium w-full sm:w-auto text-center sm:text-left">
                  Найдено: <span className="text-black font-semibold">{totalProducts}</span> товаров
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Переключатель режима отображения для десктопа */}
                  <div className="hidden sm:flex bg-gray-100 rounded-full px-1 py-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-full transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-black text-white' 
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Сетка"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-full transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-black text-white' 
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Список"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-full transition-colors ${
                        viewMode === 'table' 
                          ? 'bg-black text-white' 
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Таблица"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Переключатель отображения продукт/коллекция */}
                  <div className="flex bg-white rounded-full border border-gray-200 p-1 shadow-sm">
                    <button 
                      onClick={() => setDisplayMode('product')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                        displayMode === 'product' 
                          ? 'bg-black text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Товар
                    </button>
                    <button
                      onClick={() => setDisplayMode('collection')}
                      className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                        displayMode === 'collection'
                          ? 'bg-black text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Коллекции
                    </button>
                  </div>
                  
                  {/* Мобильный переключатель режимов отображения */}
                  <div className="sm:hidden flex bg-gray-100 rounded-full px-1 py-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-full transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-black text-white' 
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Сетка"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-full transition-colors ${
                        viewMode === 'table' 
                          ? 'bg-black text-white' 
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Таблица"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18" />
                      </svg>
                    </button>
                  </div>
                  
                  <select
                    className="text-xs sm:text-sm border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 sm:py-1.5 bg-white focus:ring-2 focus:ring-gray-200 outline-none flex-1 sm:flex-none"
                    value={sortOrder || 'popularity'}
                    onChange={(e) => handleSortOrderChange(e.target.value as any)}
                  >
                    <option value="popularity">По популярности</option>
                    <option value="newest">Сначала новые</option>
                    <option value="asc">Цена ↑</option>
                    <option value="desc">Цена ↓</option>
                  </select>
                </div>
              </div>

              {/* Активные фильтры, если есть */}
              {(selectedBrand?.name !== 'Все товары' || 
                selectedCategory?.label !== 'Все товары' || 
                minPrice !== 10 || 
                maxPrice !== 1000000 || 
                selectedColor ||
                selectedMaterial ||
                searchQuery) && (
                <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-100">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Активные фильтры:</span>
                    
                    {selectedCategory?.label !== 'Все товары' && (
                      <div className="bg-gray-100 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 border border-gray-200">
                        <span className="text-gray-700">Категория: {selectedCategory?.label}</span>
                        <button 
                          onClick={() => handleCategoryChange({ label: 'Все товары', searchName: 'Все товары' })} 
                          className="text-gray-500 hover:text-black p-0.5 ml-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {selectedBrand && selectedBrand.name !== 'Все товары' && (
                      <div className="bg-gray-100 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 border border-gray-200">
                        {/* <span className="text-gray-700">Бренд: {selectedBrand.name}</span> */}
                        <button 
                          onClick={() => {
                            const globalBrand = brands.find(b => b.name === 'Все товары');
                            if (globalBrand) handleBrandChange(globalBrand);
                          }}
                          className="text-gray-500 hover:text-black p-0.5 ml-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {(minPrice !== 10 || maxPrice !== 1000000) && (
                      <div className="bg-gray-100 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 border border-gray-200">
                        <span className="text-gray-700">Цена: {minPrice} - {maxPrice} ₽</span>
                        <button 
                          onClick={() => {
                            setMinPrice(10);
                            setMaxPrice(1000000);
                            handlePriceRangeChange(10, 1000000);
                          }} 
                          className="text-gray-500 hover:text-black p-0.5 ml-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {selectedColor && (
                      <div className="bg-gray-100 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 border border-gray-200">
                        <span className="text-gray-700 flex items-center">
                          <span className="w-3 h-3 rounded-full mr-1 border border-gray-300" style={{ backgroundColor: selectedColor.toLowerCase() }}></span>
                          Цвет: {selectedColor}
                        </span>
                        <button 
                          onClick={() => handleColorChange(selectedColor)} 
                          className="text-gray-500 hover:text-black p-0.5 ml-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {selectedMaterial && (
                      <div className="bg-gray-100 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 border border-gray-200">
                        <span className="text-gray-700">Материал: {selectedMaterial}</span>
                        <button 
                          onClick={() => handleMaterialChange(selectedMaterial)} 
                          className="text-gray-500 hover:text-black p-0.5 ml-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {searchQuery && (
                      <div className="bg-gray-100 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 border border-gray-200">
                        <span className="text-gray-700">Поиск: {searchQuery}</span>
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            fetchProducts(selectedBrand?.name || '');
                          }} 
                          className="text-gray-500 hover:text-black p-0.5 ml-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={handleResetFilters}
                      className="text-xs sm:text-sm text-gray-700 hover:text-black hover:underline font-medium"
                    >
                      Сбросить все
                    </button>
                  </div>
                </div>
              )}

              {/* Удаляем дублированный компонент ImageCategories */}
              
              {/* Отображаем связанные категории - убираем условный рендеринг */}
              <RelatedCategories />

              {/* Блок брендов: показываем только если есть source в URL */}
              {router.query.source ? (
                <div className="flex-1 bg-white rounded-lg p-3 sm:p-4 mb-4 shadow-sm border border-gray-100">
                  <h2 className="font-medium text-lg mb-3">Бренд</h2>
                  <div className="flex items-center">
                    {selectedBrand && (
                      <div className="flex-shrink-0">
                        <div className="whitespace-nowrap px-4 py-2 rounded-md text-sm bg-black text-white font-medium">
                          {selectedBrand.name}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Показываем категории выбранного бренда - всегда раскрыты */}
                  {selectedBrand && selectedBrand.name !== 'Все товары' && selectedBrand.categories.length > 0 && (
                    <div className="mt-4 pt-2">
                      <h3 className="font-medium text-sm text-gray-700 mb-3">Категории {selectedBrand.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedBrand.categories.map((category, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              // При клике на категорию бренда меняем только выбранную категорию
                              setSelectedCategory(category);
                              
                              // Обновляем URL с сохранением источника (бренда)
                              router.push({
                                pathname: router.pathname,
                                query: {
                                  ...router.query,
                                  source: selectedBrand.name === 'Все товары' ? undefined : selectedBrand.name,
                                  category: category.searchName,
                                  page: 1
                                },
                              }, undefined, { shallow: true });
                              
                              // Загружаем товары
                              fetchProducts(selectedBrand.name === 'Все товары' ? '' : selectedBrand.name, 1);
                            }}
                            className={`px-3 py-1.5 rounded-md text-xs ${
                              selectedCategory?.label === category.label
                                ? 'bg-gray-800 text-white font-medium'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Products Grid */}
              <div className="flex-1 bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-gray-100 overflow-hidden">
                {/* --- Измененный блок загрузки --- */}
                {(isLoading || !isClient) ? (
                  // Всегда рендерим скелетон сетки, чтобы избежать CLS=null
                  <div className="grid auto-rows-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-4 xl:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={`skeleton-${i}`} className="bg-white rounded-lg border border-gray-100 flex flex-col h-full">
                        <div className="relative aspect-square bg-gray-100 animate-pulse rounded-t-lg min-h-[150px] sm:min-h-[180px]"></div>
                        <div className="p-2 sm:p-4 flex flex-col flex-grow">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                          <div className="mt-auto flex items-center justify-between gap-2">
                            <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                            <div className="h-8 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  // Рендер реальных товаров
                  <>
                    {displayMode === 'product' ? (
                      <CatalogOfProductSearch
                        products={products}
                        viewMode={viewMode}
                        isLoading={isLoading} // Передаем isLoading, хотя он уже false здесь
                      />
                      // ... (остальной код для product mode)
                     ) : (
                      // Режим коллекций
                      <div className="space-y-10">
                        {Object.entries(groupProductsByCollection(products))
                          // Сортируем коллекции: сначала по количеству товаров (по убыванию), 
                          // но "Прочие товары" всегда внизу
                          .sort((a, b) => {
                            if (a[0] === 'Прочие товары') return 1;
                            if (b[0] === 'Прочие товары') return -1;
                            return b[1].length - a[1].length;
                          })
                          .map(([collectionName, collectionProducts]) => (
                            <div key={collectionName} className={`mb-12 ${collectionName === 'Прочие товары' ? 'mt-8 pt-8 border-t border-gray-200' : ''}`}>
                              <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-xl font-bold text-gray-900">{collectionName}</h3>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {collectionProducts.length} {collectionProducts.length === 1 ? 'товар' : 
                                    (collectionProducts.length >= 2 && collectionProducts.length <= 4) ? 'товара' : 'товаров'}
                                </span>
                              </div>
                              <div className="border-b border-gray-200 mb-4"></div>
                              <CatalogOfProductSearch
                                products={collectionProducts} 
                                viewMode={viewMode}
                                isLoading={isLoading}                      
                              />
                            </div>
                          ))
                        }
                      </div>
                    )}
                     {/* Пагинация */}
                     <div className={`mt-8 ${displayMode === 'collection' ? 'hidden sm:hidden' : ''}`}>
                       {renderPagination()}
                     </div>
                  </>
                ) : (
                   // Товары не найдены
                  <div className="p-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14a2 2 0 100-4 2 2 0 000 4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 12a10 10 0 11-20 0 10 10 0 0120 0z" />
                    </svg>
                    <p className="mt-4 text-gray-500 text-lg">Товары не найдены</p>
                    <p className="text-gray-400 mt-2">Попробуйте изменить параметры фильтрации</p>
                    <button 
                      onClick={handleResetFilters} 
                      className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Сбросить все фильтры
                    </button>
                  </div>
                )}
              </div> {/* Конец Products Area */}
            </div> {/* Конец Right Content Area */}
          </div> {/* Конец flex-col lg:flex-row */}
        </div> {/* Конец max-w-9xl */}
      </main>
      <Footer />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { source, page, category, color, material, minPrice, maxPrice, sort } = query;
  const sourceName = source || '';
  const pageNumber = page ? parseInt(page as string, 10) : 1;
  const limit = 40; // Лимит на странице

  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 5000); // 5 сек таймаут
    });

    const params: Record<string, any> = { limit, page: pageNumber }; // Передаем limit и page в params

    // ... (логика установки sortBy, sortOrder, name, color, material, minPrice, maxPrice в params) ...
     // Установка параметров сортировки
     if (sort) {
       if (sort === 'asc') { params.sortBy = 'price'; params.sortOrder = 'asc'; }
       else if (sort === 'desc') { params.sortBy = 'price'; params.sortOrder = 'desc'; }
       else if (sort === 'popularity') { params.sortBy = 'popularity'; params.sortOrder = 'desc'; }
       else if (sort === 'newest') { params.sortBy = 'date'; params.sortOrder = 'desc'; }
     } else {
       params.sortBy = 'popularity'; params.sortOrder = 'desc'; // По умолчанию - популярность
     }
     // Обработка категории
     if (category && typeof category === 'string' && category.toLowerCase() !== 'все товары' /*...*/) {
        const decodedCategory = decodeURIComponent(category);
        if (decodedCategory.toLowerCase().includes('настольн')) {
            params.name = 'Настольная лампа';
        } else {
            params.name = decodedCategory;
        }
     }
     if (color) params.color = color;
     if (material) params.material = material;
     if (minPrice && !isNaN(Number(minPrice))) params.minPrice = Number(minPrice);
     if (maxPrice && !isNaN(Number(maxPrice))) params.maxPrice = Number(maxPrice);


    // Запрашиваем *только первую страницу* на сервере
    const dataPromise = fetchProductsWithSorting(sourceName as string, params); // Используем fetchProductsWithSorting напрямую

    const initialData = await Promise.race([dataPromise, timeoutPromise]) as {
      products: ProductI[],
      totalPages: number,
      totalProducts: number
    };

    // Получаем URL для LCP кандидатов (первые 3 товара)
    const lcpImageUrls = (initialData.products || [])
      .slice(0, 3) // Берем первые 3
      .map(product => {
        let originalUrl: string | null = null;
         if (typeof product.imageAddresses === 'string') originalUrl = product.imageAddresses;
         else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) originalUrl = product.imageAddresses[0];
         else if (typeof product.imageAddress === 'string') originalUrl = product.imageAddress;
         else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) originalUrl = product.imageAddress[0];

        if (!originalUrl) return null;
        // Используем серверно-безопасную нормализацию
        return normalizeUrlServerSafe(originalUrl, true); // true = isLCP
      })
      .filter(url => url !== null) as string[];

    return {
      props: {
        initialProducts: initialData.products || [],
        initialTotalPages: initialData.totalPages || 1,
        initialTotalProducts: initialData.totalProducts || 0,
        source: sourceName || null,
        lcpImageUrls: lcpImageUrls, // Передаем URL
      }
    };
  } catch (error) {
    console.error('Ошибка при получении товаров с сервера (getServerSideProps):', error);
    return {
      props: {
        initialProducts: [],
        initialTotalPages: 0,
        initialTotalProducts: 0,
        source: sourceName || null,
        lcpImageUrls: [], // Пустой массив в случае ошибки
      }
    };
  }
};

export default CatalogIndex;