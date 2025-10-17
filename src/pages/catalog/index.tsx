
'use client'

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import Link from 'next/link';
import Header from '@/components/Header';
import 'tailwindcss/tailwind.css';
import Footer from '@/components/Footer';
import { ProductI } from '@/types/interfaces';
import Pagination from '@/components/PaginationComponents';
import SEO from '@/components/SEO';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import LoadingSpinner from '@/components/LoadingSpinner';

// Импортируем типы для категорий и брендов
export type Category = {
    label: string;
    searchName: string;
    href?: string;
    aliases?: string[];
    subcategories?: Category[]; // Добавляем подкатегории
    isOpen?: boolean; // Для состояния аккордеона
    isHeatingCategory?: boolean; // Флаг для категорий отопления
    id?: string; // ID категории, если есть
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
        label: 'Люстра',
        searchName: 'Люстра',
        subcategories: [
            {
                label: 'Люстра подвесная',
                searchName: 'Подвесная люстра',
                aliases: ['Люстра подвесная', 'Подвесная люстра', 'Подвесной светильник', 'Светильник подвесной']
            },
            {
                label: 'Люстра потолочная',
                searchName: 'Потолочная люстра',
                aliases: ['Люстра потолочная', 'Потолочная люстра', 'Потолочный светильник']
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
            {
                label: 'Люстра хрустальная',
                searchName: 'хрусталь Люстра',
                aliases: ['Люстра хрустальная', 'Хрустальная люстра', 'Хрустальный светильник']
            },
            {
                label: 'Люстра с латунью',
                searchName: 'латунь Люстра',
                aliases: ['латунь Люстра', 'латунь Люстра', 'латунь Люстра']
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
                searchName: 'Трековый светильник',
                aliases: ['Трековый светильник', 'трековый светильник', 'светильник трековый', 'Трек светильник', 'Светильник для шинопровода']
            },
            {
                label: 'Точечный светильник',
                searchName: 'Точечный светильник',
                aliases: ['Точечный светильник', 'Спот', 'Светильник точечный', 'Даунлайты']
            },
        ],
        isOpen: false
    },

    {
        id: 'bra',
        label: 'Бра',
        searchName: 'Настенный светильник',
        aliases: ['Настенный светильник', "7"],
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
        id: 'lampa',
        label: 'Светодиодная лампа',
        searchName: 'Светодиодная лампа',
        aliases: ['Светодиодная лампа', 'LED лампа', 'Лампа светодиодная',  'Светодиодная лампа'],
        isOpen: false
    },
    {
        id: 'ulichni',
        label: 'Уличный светильник',
        searchName: 'Уличный светильник',
        subcategories: [
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
        aliases: ['Комплектующие', 'Комплектующие для светильников', 'Комплектующие для освещения', 'Запчасти для светильников'],
        subcategories: [
            {
                label: 'Коннекторы',
                searchName: 'Коннектор',
                aliases: ['Коннектор', 'Коннекторы для светильников', 'Коннекторы для освещения', 'Соединители']
            },
            {
                label: 'Шнуры',
                searchName: 'Шнур',
                aliases: ['Шнур', 'Шнуры для светильников', 'Провода для светильников', 'Кабели питания']
            },
            {
                label: 'Блок питания',
                searchName: 'Блок питания',
                aliases: ['Блок питания', 'Трансформатор', 'Драйвер', 'Источник питания для светильников']
            },
            {
                label: 'Патроны',
                searchName: 'Патрон',
                aliases: ['Патрон', 'Патроны для ламп', 'Цоколи', 'Держатели ламп']
            },
            {
                label: 'Крепления',
                searchName: 'Крепление для светильников',
                aliases: ['Крепление для светильников', 'Монтажные элементы', 'Фурнитура для светильников', 'Планки крепежные']
            },
            {
                label: 'Плафоны',
                searchName: 'Плафон',
                aliases: ['Плафон', 'Абажур', 'Стеклянный плафон', 'Рассеиватель света']
            },
            {
                label: 'Профили для ленты',
                searchName: 'Профиль для ленты',
                aliases: ['Профиль для ленты', 'Профиль для светодиодной ленты', 'Алюминиевый профиль', 'LED профиль']
            },
            {
                label: 'Контроллеры',
                searchName: 'Контроллер для светодиодной ленты',
                aliases: ['Контроллер для светодиодной ленты', 'LED контроллер', 'RGB контроллер', 'Диммер']
            }
        ],
        isOpen: false
    },
];

// Функция проверки, является ли текущий контекст каталогом освещения
const isLightingContext = (selectedCategory: Category | null, source: string | undefined): boolean => {
    // Проверяем по категории
    if (selectedCategory) {
        const lightingCategories = [
            'Люстра', 'Светильник', 'Бра', 'Торшер', 'Спот', 'Подвесной',
            'Подвесная', 'Потолочный', 'Настенный', 'Настольный', 'Лампа',
            'Комплектующие', 'Коннектор', 'Шнур', 'Блок питания', 'Патрон',
            'Крепление', 'Плафон', 'Профиль для ленты', 'Контроллер'
        ];

        return lightingCategories.some(lightingCategory =>
            selectedCategory.label.includes(lightingCategory) ||
            selectedCategory.searchName?.includes(lightingCategory)
        );
    }

    // Проверяем по source (если это не heating)
    return source !== 'heating';
};

// Функция фильтрации брендов для каталога освещения
const filterBrandsForLighting = (brands: Brand[], isLighting: boolean): Brand[] => {
    if (!isLighting) return brands;

    // В каталоге освещения скрываем эти бренды
    const hiddenBrands = ['Donel', 'Werkel', 'Voltum'];
    return brands.filter(brand => !hiddenBrands.includes(brand.name));
};

// Массив брендов с категориями
const brands: Brand[] = [
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
            { label: 'Комплектующие', searchName: 'Комплектующие' },
            { label: 'Коннекторы', searchName: 'Коннектор' },
            { label: 'Патроны', searchName: 'Патрон' },
            { label: 'Крепления', searchName: 'Крепление для светильников' },
            { label: 'Плафоны', searchName: 'Плафон' },
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
            { label: 'Комплектующие', searchName: 'Комплектующие' },
            { label: 'Патроны', searchName: 'Патрон' },
            { label: 'Плафоны', searchName: 'Плафон' },
        ],
    },
    {
        name: 'Lumion',
        categories: [
            { label: 'Все товары', searchName: 'Все товары' },
            { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
            { label: 'Потолочный Светильник', searchName: 'Потолочный Светильник' },
            { label: 'Подвесное крепление', searchName: 'Подвесное крепление' },
            { label: 'Настольная лампа', searchName: 'Интерьерная настольная лампа' },
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
            { label: 'Комплектующие', searchName: 'Комплектующие' },
            { label: 'Коннекторы', searchName: 'Коннектор' },
            { label: 'Крепления', searchName: 'Крепление для светильников' },
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
            { label: 'Комплектующие', searchName: 'Комплектующие' },
            { label: 'Патроны', searchName: 'Патрон' },
            { label: 'Крепления', searchName: 'Крепление для светильников' },
            { label: 'Плафоны', searchName: 'Плафон' },
            { label: 'Блок питания', searchName: 'Блок питания' },
            { label: 'Профили для ленты', searchName: 'Профиль для ленты' },
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
        name: 'StLuce',
        categories: [
            { label: 'Все товары', searchName: 'Все товары' },
            { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
            { label: 'Торшеры', searchName: 'Торшер' },
            { label: 'Люстра потолочная', searchName: 'Люстра потолочная' },
            { label: 'Бра', searchName: 'Бра' },
            { label: 'Настенно-потолочный светильник', searchName: 'Настенно-потолочный светильник' },
            { label: 'Настольный Светильник', searchName: 'Настольный Светильник' },
            { label: 'Подвесной светильник', searchName: 'Подвесной светильник' },
        ],
    },
];

// Добавляем глобальные категории для всех брендов
brands.unshift({
    name: 'Все товары',
    categories: [
        { label: 'Все товары', searchName: 'Все товары' },
        ...productCategories.map(cat => ({
            label: cat.label,
            searchName: cat.searchName,
            aliases: cat.aliases || [],
            subcategories: cat.subcategories
        }))
    ]
});

interface CatalogIndexProps {
    initialProducts: ProductI[];
    initialTotalPages: number;
    initialTotalProducts: number;
    source?: string;
}

// Функция для получения продуктов с сортировкой
const fetchProductsWithSorting = async (
    brandStr: string,
    params: Record<string, any> = {},
    signal?: AbortSignal
) => {
    try {
        // Добавляем проверку для категорий освещения
        let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/products/${encodeURIComponent(brandStr)}`;

        // Защитная проверка для категорий освещения
        if (params.name && typeof params.name === 'string') {
            const lightingCategories = [
                'Люстра', 'Светильник', 'Бра', 'Торшер', 'Спот', 'Подвесной',
                'Подвесная', 'Потолочный', 'Настенный', 'Настольный', 'Лампа',
                'Комплектующие', 'Коннектор', 'Шнур', 'Блок питания', 'Патрон',
                'Крепление', 'Плафон', 'Профиль для ленты', 'Контроллер'
            ];

            const isLightingCategory = lightingCategories.some(lightingCategory =>
                params.name.includes(lightingCategory)
            );

            // Если это категория освещения и бренд, используем обычный API без бренда
            if (isLightingCategory && brandStr === 'heating') {
                console.log('Обнаружена категория освещения с брендом, исправляем запрос');
                apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/products/Все товары`;
            }
        }

        // Отладочное логирование параметров запроса для отслеживания сортировки
        console.log('🔍 ПАРАМЕТРЫ ЗАПРОСА ТОВАРОВ:', params);
        console.log('📊 URL ЗАПРОСА:', apiUrl);
        console.log('🎯 КЛЮЧЕВЫЕ ПАРАМЕТРЫ:', {
            name: params.name || '❌ НЕ УКАЗАНО',
            outOfStock: params.outOfStock || false,
            inStock: params.inStock || false,
            excludeBrands: params.excludeBrands || []
        });

        const { data } = await axios.get(
            apiUrl,
            {
                params,
                signal,
                timeout: 30000, // Увеличиваем таймаут до 30 секунд
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        );

        // Логирование полученных данных для отладки сортировки
        if (data && data.products && data.products.length > 0) {
            console.log('📋 Получено товаров:', data.products.length);

            // Проверяем общую статистику товаров
            const stockStats = data.products.reduce((acc: any, product: any) => {
                const stock = Number(product.stock) || 0;
                if (stock > 0) acc.inStock++;
                else acc.outOfStock++;
                return acc;
            }, { inStock: 0, outOfStock: 0 });

            console.log(`📊 СТАТИСТИКА товаров в категории "${params.name || 'все товары'}": В наличии: ${stockStats.inStock}, : ${stockStats.outOfStock}`);

            if (stockStats.outOfStock > 0) {
                // Выводим первые 3 товара для проверки сортировки
                console.log('🏆 Первые 3 товара (цены):');
                data.products.slice(0, 3).forEach((product: any, index: number) => {
                    console.log(`  ${index + 1}. ${product.name} - ${product.price} руб.`);
                });
            }

            // Проверяем сортировку
            if (params.sortBy === 'price') {
                const sortedPrices = [...data.products].sort((a: any, b: any) =>
                    params.sortOrder === 'asc' ? a.price - b.price : b.price - a.price
                );

                console.log('🔄 Проверка сортировки:');
                console.log('  Первая цена в полученных данных:', data.products[0].price);
                console.log('  Первая цена после ручной сортировки:', sortedPrices[0].price);

                // Если сортировка не соответствует ожидаемой, применяем её вручную
                if (data.products[0].price !== sortedPrices[0].price) {
                    console.warn('⚠️ Сортировка на сервере работает некорректно, применяем ручную сортировку');
                    data.products = sortedPrices;
                }
            }
        }

        return data;
    } catch (error: any) {
        // Проверяем, является ли ошибка таймаутом
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error('Ошибка таймаута при запросе продуктов:', error.message);
            // Создаем более информативное сообщение об ошибке
            throw new Error(`Превышено время ожидания запроса (таймаут). Попробуйте позже или уточните параметры поиска.`);
        }

        // Проверяем, был ли запрос отменен
        if (axios.isCancel(error)) {
            console.log('Запрос был отменен пользователем');
            throw error; // Пробрасываем ошибку отмены дальше
        }

        // Обрабатываем ошибку 500 для категорий освещения
        if (axios.isAxiosError(error) && error.response?.status === 500) {
            console.error('Ошибка 500 при запросе продуктов:', error.message);

            // Проверяем, связана ли ошибка с категорией освещения
            if (params.name && typeof params.name === 'string') {
                const lightingCategories = [
                    'Люстра', 'Светильник', 'Бра', 'Торшер', 'Спот', 'Подвесной',
                    'Подвесная', 'Потолочный', 'Настенный', 'Настольный', 'Лампа',
                    'Комплектующие', 'Коннектор', 'Шнур', 'Блок питания', 'Патрон',
                    'Крепление', 'Плафон', 'Профиль для ленты', 'Контроллер'
                ];

                const isLightingCategory = lightingCategories.some(lightingCategory =>
                    params.name.includes(lightingCategory)
                );

                if (isLightingCategory) {
                    // Для категорий освещения возвращаем пустой результат вместо ошибки
                    console.log('Обнаружена ошибка 500 для категории освещения, возвращаем пустой результат');
                    return {
                        products: [],
                        totalPages: 1,
                        totalProducts: 0
                    };
                }
            }

            throw new Error(`Ошибка загрузки данных: ${error.message}`);
        }

        // Обрабатываем другие ошибки axios
        if (axios.isAxiosError(error)) {
            console.error('Ошибка сетевого запроса:', error.message);
            throw new Error(`Ошибка загрузки данных: ${error.message}`);
        }

        // Обрабатываем все остальные ошибки
        console.error('Непредвиденная ошибка при запросе продуктов:', error);
        throw error;
    }
};

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
        // Фильтры наличия теперь контролируются через availabilityFilter в основном коде
    };

    // Массив для всех загруженных товаров
    let allProducts: ProductI[] = [];

    // Текущая страница запроса
    let currentPage = initialPage;
    let originalTotalPages = 0;
    let originalTotalProducts = 0;

    // Максимальное количество страниц для загрузки (защита от бесконечного цикла)
    const MAX_PAGES_TO_LOAD = 3; // Уменьшаем для предотвращения таймаутов

    // Количество попыток для повторного запроса при ошибке
    const MAX_RETRY_ATTEMPTS = 2;

    // Минимальное количество товаров, которое мы хотим получить
    const MIN_PRODUCTS_COUNT = limit;

    console.log('Начинаем загрузку товаров для страницы', initialPage);

    // Преобразуем sourceName в строку для fetchProductsWithSorting
    const brand = sourceName || 'Все товары';
    const brandStr = typeof brand === 'string' ? brand : Array.isArray(brand) ? brand[0] : 'Все товары';

    // Вспомогательная функция для выполнения запроса с повторными попытками
    const fetchWithRetry = async (fetchFn: Function, retryCount = 0): Promise<any> => {
        try {
            return await fetchFn();
        } catch (error: any) { // Указываем тип 'any' для error
            // Если запрос был отменен, не выполняем повторные попытки
            if (signal?.aborted ||
                error instanceof DOMException && error.name === 'AbortError' ||
                axios.isCancel(error)) {
                throw error;
            }

            // Если это ошибка таймаута и у нас остались попытки, пробуем еще раз
            if (retryCount < MAX_RETRY_ATTEMPTS &&
                ((axios.isAxiosError(error) && error.code === 'ECONNABORTED') ||
                    error.message?.includes('timeout'))) {
                console.log(`Таймаут запроса, повторная попытка ${retryCount + 1}/${MAX_RETRY_ATTEMPTS}`);
                // Добавляем небольшую задержку перед повторной попыткой
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchWithRetry(fetchFn, retryCount + 1);
            }

            // Для других ошибок не выполняем повторные попытки
            throw error;
        }
    };

    try {
        // Проверяем, не отменен ли запрос
        if (signal?.aborted) {
            throw new DOMException('Запрос был отменен', 'AbortError');
        }

        // Получаем данные для первой страницы, чтобы узнать общее количество товаров и страниц
        const firstPageParams = { ...baseParams, page: initialPage };
        console.log(`Загружаем первую страницу для получения мета-информации`);

        // Получаем данные для текущей страницы с повторными попытками
        const initialData = await fetchWithRetry(() =>
            fetchProductsWithSorting(brandStr, firstPageParams, signal)
        );

        // Проверяем, не отменен ли запрос после запроса первой страницы
        if (signal?.aborted) {
            throw new DOMException('Запрос был отменен', 'AbortError');
        }

        // Сохраняем оригинальную информацию о количестве страниц и товаров
        originalTotalPages = initialData.totalPages || 0;
        originalTotalProducts = initialData.totalProducts || 0;

        console.log(`Оригинальная информация: всего товаров - ${originalTotalProducts}, всего страниц - ${originalTotalPages}`);

        // Добавляем товары первой страницы без дополнительной клиентской фильтрации по наличию
        const pageProductsRaw = Array.isArray(initialData.products) ? initialData.products : [];
        console.log(`Страница ${initialPage}: получено ${pageProductsRaw.length} товаров`);
        allProducts = [...allProducts, ...pageProductsRaw];
    } catch (error) {
        // Если запрос был отменен, пробрасываем ошибку дальше
        if (error instanceof DOMException && error.name === 'AbortError' ||
            axios.isCancel(error) ||
            signal?.aborted) {
            console.log('Запрос первой страницы был отменен');
            throw new DOMException('Запрос был отменен', 'AbortError');
        }

        // Выводим ошибку и возвращаем пустой результат вместо прерывания
        console.error('Ошибка при загрузке первой страницы:', error);
        return {
            products: [],
            totalPages: 1,
            totalProducts: 0
        };
    }

    // Загружаем дополнительные страницы при необходимости
    // Отключаем добор с соседних страниц для стабильной пагинации
    if (false && allProducts.length < MIN_PRODUCTS_COUNT && currentPage < originalTotalPages) {
        currentPage++; // Начинаем со следующей страницы

        // Загружаем страницы до тех пор, пока не соберем нужное количество товаров или не достигнем ограничения
        for (let i = 0; i < MAX_PAGES_TO_LOAD - 1 && currentPage <= originalTotalPages; i++) {
            // Проверяем, не отменен ли запрос перед загрузкой следующей страницы
            if (signal?.aborted) {
                throw new DOMException('Запрос был отменен', 'AbortError');
            }

            const pageParams = { ...baseParams, page: currentPage };
            console.log(`Загружаем дополнительную страницу ${currentPage} из ${originalTotalPages}`);

            try {
                // Получаем данные для текущей страницы с повторными попытками
                const data = await fetchWithRetry(() =>
                    fetchProductsWithSorting(brandStr, pageParams, signal)
                );

                // Проверяем, не отменен ли запрос после загрузки страницы
                if (signal?.aborted) {
                    throw new DOMException('Запрос был отменен', 'AbortError');
                }

                // Проверяем, есть ли товары в ответе
                if (!data.products || data.products.length === 0) {
                    console.log(`Страница ${currentPage} не содержит товаров, прекращаем загрузку`);
                    break;
                }

                // Добавляем товары текущей страницы как есть (без доп. фильтрации)
                console.log(`Страница ${currentPage}: получено ${data.products.length} товаров`);
                allProducts = [...allProducts, ...data.products];

                // Если собрали достаточное количество товаров, выходим
                if (allProducts.length >= MIN_PRODUCTS_COUNT) {
                    console.log(`Достигнуто нужное количество товаров (${allProducts.length}), завершаем загрузку`);
                    break;
                }

                // Переходим к следующей странице
                currentPage++;
            } catch (error: any) {
                // Если запрос был отменен, пробрасываем ошибку дальше
                if (error instanceof DOMException && error.name === 'AbortError' ||
                    axios.isCancel(error) ||
                    signal?.aborted) {
                    console.log(`Запрос страницы ${currentPage} был отменен`);
                    throw new DOMException('Запрос был отменен', 'AbortError');
                }

                // Выводим ошибку и продолжаем с тем, что уже есть, вместо полного прерывания
                console.error(`Ошибка при загрузке страницы ${currentPage}:`, error);
                // Прекращаем загрузку дополнительных страниц, но используем уже загруженные товары
                break;
            }
        }
    }

    // Если запрос был отменен в процессе, прерываем дальнейшую обработку
    if (signal?.aborted) {
        throw new DOMException('Запрос был отменен', 'AbortError');
    }

    // Даже если у нас нет товаров (из-за ошибок), возвращаем пустой массив вместо ошибки
    if (allProducts.length === 0) {
        console.log('Не удалось загрузить товары, возвращаем пустой результат');
        return {
            products: [],
            totalPages: originalTotalPages > 0 ? originalTotalPages : 1,
            totalProducts: originalTotalProducts
        };
    }

    // Выбираем товары для запрошенной страницы
    const startIndex = 0; // Всегда начинаем с первого элемента текущей страницы
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

/**
 * Проверяет, является ли товар новинкой (создан в последние 30 дней)
 */
const isProductNew = (product: ProductI): boolean => {
    if (!product.createdAt) return false;

    const createDate = new Date(product.createdAt as string);
    const currentDate = new Date();
    // Продукт считается новым, если он создан не более 30 дней назад
    const diffTime = Math.abs(currentDate.getTime() - createDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 30;
};

/**
 * Форматирует цену с разделителями тысяч
 */
const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Функция для форматирования артикула, показывая первые 5-6 слов
const formatArticle = (article: string): string => {
    if (!article) return '';

    // Разделяем строку на слова по пробелам и специальным символам
    const words = article.split(/[\s\-_.,\/\\]/);
    // Берем первые 5-6 слов в зависимости от длины
    const wordCount = words.length <= 5 ? words.length : 6;
    const result = words.slice(0, wordCount).join(' ');

    return result.length < article.length ? result + '...' : result;
};

const CatalogIndex: React.FunctionComponent<CatalogIndexProps> = ({
    initialProducts,
    initialTotalPages,
    initialTotalProducts,
    source
}) => {
    const router = useRouter();
    const [products, setProducts] = useState<ProductI[]>(initialProducts);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFullscreenLoading, setIsFullscreenLoading] = useState<boolean>(false); // Состояние для полноэкранного спиннера
    const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
    const [totalProducts, setTotalProducts] = useState<number>(initialTotalProducts);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const limit = 40;



    // Безопасный путь для router.push, чтобы избежать /catalog/[...slug] без slug
    const getSafePathname = useCallback(() => {
        try {
            const hasSlug = Boolean((router.query as any)?.slug);
            if (hasSlug && typeof router.asPath === 'string') {
                return router.asPath.split('?')[0];
            }
            return '/catalog'; // Возвращаем базовый путь каталога
        } catch {
            return '/catalog';
        }
    }, [router.asPath, router.query]);

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
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
    const [openCategories, setOpenCategories] = useState<string[]>([]);

    // Новые состояния для фильтров
    const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all');
    const [showOnlyNewItems, setShowOnlyNewItems] = useState<boolean>(false);


    const spinnerTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Для хранения таймера спиннера
    const [selectedPower, setSelectedPower] = useState<string | null>(null);

    // Состояния для новых фильтров светильников
    const [selectedSocketType, setSelectedSocketType] = useState<string | null>(null);
    const [selectedLampCount, setSelectedLampCount] = useState<number | null>(null);
    const [selectedShadeColor, setSelectedShadeColor] = useState<string | null>(null);
    const [selectedFrameColor, setSelectedFrameColor] = useState<string | null>(null);

    // Состояния аккордеонов для новых фильтров
    const [isSocketTypeOpen, setIsSocketTypeOpen] = useState(false);
    const [isLampCountOpen, setIsLampCountOpen] = useState(false);
    const [isShadeColorOpen, setIsShadeColorOpen] = useState(false);
    const [isFrameColorOpen, setIsFrameColorOpen] = useState(false);
    // Аккордеоны: цена и общие фильтры
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isFiltersOpen, setIsFiltersOpen] = useState(true);
    const [isRangesOpen, setIsRangesOpen] = useState(true);

    // Унифицированные классы для аккордеонов (шапка и контент)
    const accordionHeaderClass = "flex items-center justify-between cursor-pointer py-2 px-3 backdrop-blur-sm rounded-lg border border-white/10  transition-all duration-200 relative z-10";
    const accordionContentClass = "relative z-0 mt-3 space-y-2 overflow-visible bg-transparent p-0";

    // Функция для капитализации первой буквы
    const capitalizeFirst = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Инициализация фильтров светильников из URL
    useEffect(() => {
        if (typeof window !== 'undefined' && router.isReady) {
            const { socketType, lampCount, shadeColor, frameColor, availability, newItems } = router.query;

            if (socketType && typeof socketType === 'string') {
                setSelectedSocketType(decodeURIComponent(socketType));
            }

            if (lampCount && typeof lampCount === 'string') {
                const parsedLampCount = parseInt(lampCount, 10);
                if (!isNaN(parsedLampCount)) {
                    setSelectedLampCount(parsedLampCount);
                }
            }

            if (shadeColor && typeof shadeColor === 'string') {
                setSelectedShadeColor(decodeURIComponent(shadeColor));
            }

            if (frameColor && typeof frameColor === 'string') {
                setSelectedFrameColor(decodeURIComponent(frameColor));
            }

            // Инициализация новых фильтров
            if (availability && typeof availability === 'string') {
                setAvailabilityFilter(availability as 'all' | 'inStock' | 'outOfStock');
            }

            if (newItems === 'true') {
                setShowOnlyNewItems(true);
            }
        }
    }, [router.isReady, router.query.socketType, router.query.lampCount, router.query.shadeColor, router.query.frameColor, router.query.availability, router.query.newItems]);

    // Состояние для категорий с аккордеоном
    const [productCategoriesState, setProductCategoriesState] = useState(() => {
        // Проверяем URL при инициализации
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const source = urlParams.get('source');
            const category = urlParams.get('category');

            // Декодируем параметр category, если он существует
            const decodedCategory = category ? decodeURIComponent(category) : '';

            return productCategories;
        }

        return productCategories;
    });

    // Состояние для извлеченных фильтров
    const [extractedFilters, setExtractedFilters] = useState<{
        colors: string[];
        materials: string[];
        features: string[];
        styles: string[];
        places: string[];
        socketTypes: string[];
        lampCounts: number[];
        shadeColors: string[];
        frameColors: string[];
    }>({
        colors: [],
        materials: [],
        features: [],
        styles: [],
        places: [],
        socketTypes: [],
        lampCounts: [],
        shadeColors: [],
        frameColors: []
    });

    // Создаем ref для хранения текущего AbortController
    const fetchAbortController = useRef<AbortController | null>(null);


    // При загрузке: не трогаем авто-выбор, если пришли по ЧПУ (slug)
    useEffect(() => {
        if ((router.query as any).slug) return;
        // Проверяем, есть ли параметр category в URL
        const hasCategory = router.isReady && router.query.category;

        // Если есть категория, проверяем, не является ли она категорией освещения
        if (hasCategory && router.query.category) {
            const categoryName = router.query.category as string;

            // Список категорий освещения
            const lightingCategories = [
                'Люстра', 'Светильник', 'Бра', 'Торшер', 'Спот', 'Подвесной',
                'Подвесная', 'Потолочный', 'Настенный', 'Настольный', 'Лампа',
                'Комплектующие', 'Коннектор', 'Шнур', 'Блок питания', 'Патрон',
                'Крепление', 'Плафон', 'Профиль для ленты', 'Контроллер'
            ];

            // Проверяем, содержит ли название категории ключевые слова освещения
            const isLightingCategory = lightingCategories.some(lightingWord =>
                categoryName.includes(lightingWord)
            );

            // Если это категория освещения и установлен source=, удаляем его
            if (isLightingCategory && router.query.source === 'heating') {
                console.log('Обнаружена категория освещения с source=, удаляем source');

                const { source, ...queryWithoutSource } = router.query;

                router.push({ pathname: getSafePathname(), query: queryWithoutSource }, undefined, { shallow: true });

                return;
            }
        }



        // Если есть параметр source но нет category, показываем все товары бренда
        if (router.isReady && router.query.source && !hasCategory) {
            const sourceName = router.query.source as string;

            // Специальная обработка для OdeonLight
            let brandToSearch = sourceName;
            if (sourceName.toLowerCase() === 'odeonlight') {
                brandToSearch = 'OdeonLight';
            }
            // Применяем фильтрацию брендов для каталога освещения
            const isLighting = isLightingContext(selectedCategory, source);
            const filteredBrands = filterBrandsForLighting(brands, isLighting);
            const foundBrand = filteredBrands.find(b => b.name.toLowerCase() === sourceName.toLowerCase());

            if (foundBrand) {
                setSelectedBrand(foundBrand);

                // Ищем категорию "Все товары" в списке категорий бренда
                const allProductsCategory = foundBrand.categories.find(cat => cat.label === 'Все товары');

                if (allProductsCategory) {
                    // Если есть категория "Все товары", используем её
                    setSelectedCategory(allProductsCategory);

                    // Обновляем URL с добавлением категории "Все товары"
                    router.push({ pathname: getSafePathname(), query: { ...router.query, category: allProductsCategory.searchName || allProductsCategory.label, page: 1 } }, undefined, { shallow: true });

                    // Запускаем загрузку всех товаров бренда
                    fetchProducts(sourceName, 1);
                } else if (foundBrand.categories.length > 0) {
                    // Если нет категории "Все товары", используем первую категорию
                    const firstCategory = foundBrand.categories[0];
                    setSelectedCategory(firstCategory);

                    // Обновляем URL с добавлением категории
                    router.push({ pathname: getSafePathname(), query: { ...router.query, category: firstCategory.searchName || firstCategory.label, page: 1 } }, undefined, { shallow: true });

                    // Запускаем загрузку с выбранной категорией
                    fetchProducts(sourceName, 1);
                }
            }
        }
        // Если нет категории в URL и нет source, не выбираем бренд и категорию по умолчанию
        else if (!hasCategory && !router.query.source) {
            setSelectedBrand(null);
            setSelectedCategory(null);
        }
    }, [source, router.isReady, router.query, (router.query as any).slug]);

    // Получение товаров при изменении параметров
    useEffect(() => {
        if (router.isReady) {
            // Если находимся на красивом ЧПУ без query, не выполняем клиентский рефетч,
            // оставляем SSR-результат, чтобы не затирать точную категорию широким поиском
            const usingPrettyUrl = typeof router.asPath === 'string' && router.asPath.startsWith('/catalog/') && !router.asPath.includes('?');
            if (usingPrettyUrl) return;

            const { source: urlSource, page, category, sort, name } = router.query;
            
            // <<< ИСПРАВЛЕНО ЗДЕСЬ
            // Убрали fallback на `source` из props. Теперь компонент всегда полагается
            // на актуальный URL. Если `urlSource` не определён (бренд сброшен),
            // `sourceName` станет пустой строкой, что правильно.
            const sourceName = (urlSource as string) || '';
            
            const pageNumber = page ? parseInt(page as string, 10) : 1;
            const categoryName = category ? (Array.isArray(category) ? category[0] : category) : '';
            const productName = name ? (Array.isArray(name) ? name[0] : name as string) : '';
            const sortValue = sort ? (Array.isArray(sort) ? sort[0] : sort) : 'newest';

            // Проверяем, является ли категория категорией освещения
            
            // Устанавливаем параметры сортировки
            if (sortValue === 'asc' || sortValue === 'desc' || sortValue === 'popularity' || sortValue === 'newest' || sortValue === 'random') {
                setSortOrder(sortValue);
            }

            // Запускаем загрузку товаров
            fetchProducts(sourceName, pageNumber);
        }
    }, [router.isReady, router.query]);

    // Устанавливаем активную главную категорию: учитываем и slug ЧПУ
    useEffect(() => {
        if (!router.isReady) return;
        const slugParam = (router.query as any).slug;
        let categoryName: string | null = null;
        if (router.query.category) {
            categoryName = router.query.category as string;
        } else if (slugParam) {
            const slugArray = Array.isArray(slugParam) ? slugParam as string[] : [slugParam as string];
            const first = slugArray[0];
            const brandFromSlug = brandSlugToName[first];
            if (brandFromSlug) {
                const rest = slugArray.slice(1).join('/');
                if (rest) categoryName = categoryPathToName[rest] || null;
            } else {
                const joined = slugArray.join('/');
                categoryName = categoryPathToName[joined] || categoryPathToName[first] || null;
            }
        }
        if (categoryName) {



            const matchedMainCategory = mainCategories.find(mc =>
                categoryName!.toLowerCase().includes(mc.toLowerCase())
            );

            if (matchedMainCategory) {
                // Если это главная категория, устанавливаем её как активную
                setActiveMainCategory(matchedMainCategory);
                setShowAllCategories(false);
            } else {
                // Проверяем, является ли категория подкатегорией одной из главных
                for (const mainCat of mainCategories) {
                    // Создаем временную категорию объект для проверки
                    const tempCategory: Category = {
                        label: categoryName,
                        searchName: categoryName
                    };

                    // Устанавливаем временно активную категорию для проверки
                    const prevActiveCategory = activeMainCategory;
                    setActiveMainCategory(mainCat);

                    // Проверяем, связана ли категория с текущей главной категорией
                    if (isRelatedToMainCategory(tempCategory)) {
                        setShowAllCategories(false);
                        break;
                    } else {
                        // Если не связана, восстанавливаем предыдущую активную категорию
                        setActiveMainCategory(prevActiveCategory);
                    }
                }
            }
        } else if (!router.query.category && !slugParam) {
            // Если нет параметра category, сбрасываем фильтрацию
            setActiveMainCategory(null);
            setShowAllCategories(true);

            // Проверяем, являемся ли мы в контексте
            const isHeatingPage = router.query.source === 'heating';
            setIsHeatingContext(isHeatingPage);
        }
    }, [router.isReady, router.query.category, router.query.source, (router.query as any).slug]);

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
                    (category.searchName && category.searchName.toLowerCase() === lowerName) ||
                    (category.aliases && category.aliases.some(alias => alias.toLowerCase() === lowerName))
                ) {
                    // Возвращаем найденную категорию с оригинальным label и searchName
                    return {
                        ...category,
                        label: category.label,
                        searchName: category.searchName || category.label
                    };
                }

                // Также ищем в подкатегориях, если они есть
                if (category.subcategories) {
                    for (const subcategory of category.subcategories) {
                        if (
                            subcategory.label.toLowerCase() === lowerName ||
                            (subcategory.searchName && subcategory.searchName.toLowerCase() === lowerName) ||
                            (subcategory.aliases && subcategory.aliases.some(alias => alias.toLowerCase() === lowerName))
                        ) {
                            // Возвращаем найденную подкатегорию с оригинальным label и searchName
                            return {
                                ...subcategory,
                                label: subcategory.label,
                                searchName: subcategory.searchName || subcategory.label
                            };
                        }
                    }
                }
            }
        }

        // Если категория не найдена по точному совпадению, пробуем найти частичное совпадение по алиасам
        for (const brand of brands) {
            for (const category of brand.categories) {
                if (category.aliases && category.aliases.some(alias => alias.toLowerCase().includes(lowerName) || lowerName.includes(alias.toLowerCase()))) {
                    // Возвращаем найденную категорию с оригинальным label и searchName
                    return {
                        ...category,
                        label: category.label,
                        searchName: category.searchName || category.label
                    };
                }

                // Проверяем в подкатегориях по частичному совпадению
                if (category.subcategories) {
                    for (const subcategory of category.subcategories) {
                        if (subcategory.aliases && subcategory.aliases.some(alias => alias.toLowerCase().includes(lowerName) || lowerName.includes(alias.toLowerCase()))) {
                            // Возвращаем найденную подкатегорию с оригинальным label и searchName
                            return {
                                ...subcategory,
                                label: subcategory.label,
                                searchName: subcategory.searchName || subcategory.label
                            };
                        }
                    }
                }
            }
        }

        return null;
    };

    // Функция для генерации красивого URL из русского названия категории
    const generatePrettyUrl = (category: Category, brandName?: string): string => {
        console.log('🔗 Generating pretty URL for category:', {
            label: category.label,
            searchName: category.searchName,
            aliases: category.aliases,
            brandName: brandName
        });

        // Сначала создаем мапинг для английских названий брендов
        const brandMap: Record<string, string> = {
            'LightStar': 'lightstar',
            'Maytoni': 'maytoni',
            'Novotech': 'novotech',
            'Lumion': 'lumion',
            'Artelamp': 'artelamp',
            'Denkirs': 'denkirs',
            'Stluce': 'stluce',
            'StLuce': 'stluce',
            'KinkLight': 'kinklight',
            'Sonex': 'sonex',
            'OdeonLight': 'odeonlight',
            'Elektrostandart': 'elektrostandart',
            'ElektroStandard': 'elektrostandart',
            'Favourite': 'favourite'
        };

        const categoryMap: Record<string, string> = {
            // Люстры
            'Люстра': '/chandeliers',
            'Подвесная люстра': '/chandeliers/pendant-chandeliers',
            'Люстра подвесная': '/chandeliers/pendant-chandeliers',
            'Потолочная люстра': '/chandeliers/ceiling-chandeliers',
            'Люстра потолочная': '/chandeliers/ceiling-chandeliers',
            'Люстра на штанге': '/chandeliers/rod-chandeliers',
            'Люстра каскадная': '/chandeliers/cascade-chandeliers',
            'хрусталь Люстра': '/chandeliers/crystal-chandeliers',
            'Люстра хрустальная': '/chandeliers/crystal-chandeliers',

            // Люстры-вентиляторы
            'Люстра вентилятор': '/ceiling-fans',

            // Светильники
            'Светильники': '/lights',
            'Потолочный светильник': '/lights/ceiling-lights',
            'Подвесной светильник': '/lights/pendant-lights',
            'Настенный светильник': '/lights/wall-lights',
            'Светильник встраиваемый': '/lights/recessed-lights',
            'Встраиваемый светильник': '/lights/recessed-lights',
            'Светильник накладной': '/lights/surface-mounted-lights',
            'Накладной светильник': '/lights/surface-mounted-lights',
            'трековый светильник': '/lights/track-lights',
            'Трековый светильник': '/lights/track-lights',
            'Точечный светильник': '/lights/spot-lights',
            'Спот': '/lights/spot-lights',

            // Бра
            'Бра': '/wall-sconces',

            // Торшеры
            'Торшер': '/floor-lamps',

            // Настольные лампы
            'Настольная лампа': '/table-lamps',

            // LED
            'Профиль для ленты': '/led-strip-profiles',
            'Светодиодная лента': '/led-strips',

            // Уличные светильники
            'Уличный светильник': '/outdoor-lights',
            'Настенный уличный светильник': '/outdoor-lights/outdoor-wall-lights',
            'Грунтовый светильник': '/outdoor-lights/ground-lights',
            'Ландшафтный светильник': '/outdoor-lights/landscape-lights',
            'Парковый светильник': '/outdoor-lights/park-lights',

            // Комплектующие
            'Комплектующие': '/accessories',
            'Коннектор': '/accessories/connectors',
            'Коннекторы': '/accessories/connectors',
            'Шнур': '/accessories/cords',
            'Шнуры': '/accessories/cords',
            'Блок питания': '/accessories/power-supplies',
            'Патрон': '/accessories/lamp-holders',
            'Патроны': '/accessories/lamp-holders',
            'Крепление для светильников': '/accessories/mounting',
            'Крепления': '/accessories/mounting',
            'Плафон': '/accessories/lampshades',
            'Плафоны': '/accessories/lampshades',
            'Контроллер для светодиодной ленты': '/accessories/controllers',
            'Контроллеры': '/accessories/controllers'
        };

        // Ищем по основному названию
        const searchName = category.searchName || category.label;

        // Создаем базовый URL для категории
        let categoryUrl = '';
        if (categoryMap[searchName]) {
            categoryUrl = categoryMap[searchName];
        } else if (categoryMap[category.label]) {
            categoryUrl = categoryMap[category.label];
        } else if (category.aliases) {
            // Ищем по алиасам
            for (const alias of category.aliases) {
                if (categoryMap[alias]) {
                    categoryUrl = categoryMap[alias];
                    break;
                }
            }
        }

        // Если есть бренд, добавляем его в URL
        if (brandName && brandMap[brandName] && categoryUrl) {
            const brandUrl = brandMap[brandName];
            const finalUrl = `/catalog/${brandUrl}${categoryUrl}`;
            console.log('✅ Found brand + category URL:', brandName, searchName, '->', finalUrl);
            return finalUrl;
        }

        // Если есть только бренд без конкретной категории
        if (brandName && brandMap[brandName] && (searchName === 'Все товары' || !categoryUrl)) {
            const brandUrl = brandMap[brandName];
            const finalUrl = `/catalog/${brandUrl}`;
            console.log('✅ Found brand URL:', brandName, '->', finalUrl);
            return finalUrl;
        }

        // Если есть только категория без бренда
        if (categoryUrl) {
            const finalUrl = `/catalog${categoryUrl}`;
            console.log('✅ Found category URL:', searchName, '->', finalUrl);
            return finalUrl;
        }

        // Fallback на старый URL
        console.log('❌ No pretty URL found, using fallback for:', searchName, 'brand:', brandName);
        if (brandName) {
            return `/catalog?source=${encodeURIComponent(brandName)}&category=${encodeURIComponent(searchName)}`;
        }
        return `/catalog?category=${encodeURIComponent(searchName)}`;
    };

    // Поддержка ЧПУ: маппинг slug → бренд/категория
    const brandSlugToName: Record<string, string> = {
        lightstar: 'LightStar',
        maytoni: 'Maytoni',
        novotech: 'Novotech',
        lumion: 'Lumion',
        artelamp: 'Artelamp',
        denkirs: 'Denkirs',
        stluce: 'StLuce',
        kinklight: 'KinkLight',
        sonex: 'Sonex',
        odeonlight: 'OdeonLight',
        elektrostandart: 'ElektroStandard',
        favourite: 'Favourite'
    };

    const categoryPathToName: Record<string, string> = {
        'chandeliers': 'Люстра',
        'chandeliers/pendant-chandeliers': 'Подвесная люстра',
        'chandeliers/ceiling-chandeliers': 'Потолочная люстра',
        'chandeliers/rod-chandeliers': 'Люстра на штанге',
        'chandeliers/cascade-chandeliers': 'Люстра каскадная',
        'chandeliers/crystal-chandeliers': 'хрусталь Люстра',
        'ceiling-fans': 'Люстра вентилятор',
        'lights': 'Светильники',
        'lights/ceiling-lights': 'Потолочный светильник',
        'lights/pendant-lights': 'Подвесной светильник',
        'lights/wall-lights': 'Настенный светильник',
        'lights/recessed-lights': 'Светильник встраиваемый',
        'lights/surface-mounted-lights': 'Светильник накладной',
        'lights/track-lights': 'трековый светильник',
        'lights/spot-lights': 'Точечный светильник',
        'wall-sconces': 'Настенный светильник',
        'floor-lamps': 'Торшер',
        'table-lamps': 'Настольная лампа',
        'led-strip-profiles': 'Профиль для ленты',
        'led-strips': 'Светодиодная лента',
        'outdoor-lights': 'Уличный светильник',
        'outdoor-lights/outdoor-wall-lights': 'Настенный уличный светильник',
        'outdoor-lights/ground-lights': 'Грунтовый светильник',
        'outdoor-lights/landscape-lights': 'Ландшафтный светильник',
        'outdoor-lights/park-lights': 'Парковый светильник',
        'accessories': 'Комплектующие',
        'accessories/connectors': 'Коннектор',
        'accessories/cords': 'Шнур',
        'accessories/power-supplies': 'Блок питания',
        'accessories/lamp-holders': 'Патрон',
        'accessories/mounting': 'Крепление для светильников',
        'accessories/lampshades': 'Плафон',
        'accessories/controllers': 'Контроллер для светодиодной ленты'
    };

    // При заходе по ЧПУ восстанавливаем бренд/категорию в состоянии, чтобы пагинация не сбрасывала выбор
    React.useEffect(() => {
        const slugParam = (router.query as any).slug;
        if (!slugParam) return;
        const slugArray = Array.isArray(slugParam) ? slugParam as string[] : [slugParam as string];

        let detectedSource: string | undefined;
        let detectedCategory: string | undefined;

        const first = slugArray[0];
        const brandFromSlug = brandSlugToName[first];
        if (brandFromSlug) {
            detectedSource = brandFromSlug;
            const rest = slugArray.slice(1).join('/');
            if (rest) detectedCategory = categoryPathToName[rest];
        } else {
            const joined = slugArray.join('/');
            detectedCategory = categoryPathToName[joined] || categoryPathToName[first];
        }

        if (detectedSource && (!selectedBrand || selectedBrand.name !== detectedSource)) {
            // Применяем фильтрацию брендов для каталога освещения
            const isLighting = isLightingContext(selectedCategory, source);
            const filteredBrands = filterBrandsForLighting(brands, isLighting);
            const brandObj = filteredBrands.find(b => b.name === detectedSource);
            if (brandObj) setSelectedBrand(brandObj);
        }

        if (detectedCategory) {
            const catObj = findCategoryByName(detectedCategory);
            if (catObj && (!selectedCategory || selectedCategory.label !== catObj.label)) {
                setSelectedCategory(catObj);
            }
        }
    }, [router.query.slug]);

    // Функция для обработки изменения категории
    const handleCategoryChange = (category: Category & { isHeatingCategory?: boolean }) => {
        // Проверяем, является ли выбранная категория одной из главных категорий
        const isHeatingPage = router.query.source === 'heating';
        setIsHeatingContext(isHeatingPage);

        if (isHeatingPage) {
            // Проверяем, является ли это одной из главных категорий
            const isMainHeatingCategory = mainHeatingCategories.some(mc =>
                category.label.toLowerCase().includes(mc.toLowerCase())
            );

            if (isMainHeatingCategory) {
                // Если это главная категория , устанавливаем её как активную и включаем фильтрацию
                const mainHeatingCategory = mainHeatingCategories.find(mc =>
                    category.label.toLowerCase().includes(mc.toLowerCase())
                );

                if (mainHeatingCategory) {
                    setActiveMainCategory(mainHeatingCategory);
                    setShowAllCategories(false);
                }
            }
        } else {
            // Стандартная логика для категорий освещения
            const isMainLightingCategory = mainCategories.some(mc =>
                category.label.toLowerCase().includes(mc.toLowerCase())
            );

            // Если это главная категория, устанавливаем её как активную и включаем фильтрацию
            if (isMainLightingCategory) {
                // Определяем, какая именно главная категория
                const mainCategory = mainCategories.find(mc =>
                    category.label.toLowerCase().includes(mc.toLowerCase())
                );

                if (mainCategory) {
                    setActiveMainCategory(mainCategory);
                    setShowAllCategories(false);
                }
            }
        }

        // Продолжаем существующую логику обработчика
        // Показываем спиннер с минимальной длительностью
        showSpinnerWithMinDuration();

        // Защищаемся от undefined
        const categoryAliases = category.aliases || [];

        // Проверяем, является ли категория категорией освещения
        const lightingCategories = [
            'Люстра', 'Светильник', 'Бра', 'Торшер', 'Спот', 'Подвесной',
            'Подвесная', 'Потолочный', 'Настенный', 'Настольный', 'Лампа',
            'Комплектующие', 'Коннектор', 'Шнур', 'Блок питания', 'Патрон',
            'Крепление', 'Плафон', 'Профиль для ленты', 'Контроллер'
        ];

        const isLightingCategory = lightingCategories.some(lightingCategory =>
            category.label.includes(lightingCategory) ||
            (category.searchName && category.searchName.includes(lightingCategory))
        );

        // Если выбран бренд и это не категория освещения, применяем фильтр по категории и бренду
        if (selectedBrand && selectedBrand.name !== 'Все товары' && !isLightingCategory) {
            return handleBrandCategoryChange(category);
        }

        // Если это категория освещения, всегда обрабатываем ее как НЕ отопительную
        if (isLightingCategory) {
            console.log(`Категория "${category.label}" определена как категория освещения`);

            setSelectedCategory(category);
            setCurrentPage(1);

            // Генерируем красивый URL
            const prettyUrl = generatePrettyUrl(category, selectedBrand && selectedBrand.name !== 'Все товары' ? selectedBrand.name : undefined);

            if (prettyUrl.startsWith('/catalog/') && !prettyUrl.includes('?')) {
                // Если это красивый URL, добавляем остальные параметры как query
                const url = new URLSearchParams();
                Object.keys(router.query).forEach(key => {
                    if (key !== 'category' && key !== 'page' && key !== 'source') {
                        url.set(key, router.query[key] as string);
                    }
                });

                url.set('page', '1');

                const finalUrl = url.toString() ? `${prettyUrl}?${url.toString()}` : prettyUrl;
                router.push(finalUrl, undefined, { shallow: true });

                // Вызываем fetchProducts
                fetchProducts(selectedBrand && selectedBrand.name !== 'Все товары' ? selectedBrand.name : '', 1);
            } else {
                // Fallback на старый URL
                if (selectedBrand && selectedBrand.name !== 'Все товары') {
                    // Если есть бренд, сохраняем его в URL
                    router.push({ pathname: getSafePathname(), query: { ...router.query, source: selectedBrand.name, category: category.searchName || category.label, page: '1' } }, undefined, { shallow: true });

                    fetchProducts(selectedBrand.name, 1);
                } else {
                    // Если бренд не выбран, удаляем source из URL
                    const { source, ...queryWithoutSource } = router.query;

                    router.push({ pathname: getSafePathname(), query: { ...queryWithoutSource, category: category.searchName || category.label, page: '1' } }, undefined, { shallow: true });

                    fetchProducts('', 1);
                }
            }
            return;
        }



        // Стандартное поведение для обычных категорий
        if (!selectedCategory || selectedCategory.label !== category.label) {
            setSelectedCategory(category);
            setCurrentPage(1);

            // Формируем запрос без source
            const { source, ...queryWithoutSource } = router.query;

            // Генерируем красивый URL
            const prettyUrl = generatePrettyUrl(category);

            if (prettyUrl.startsWith('/catalog/') && !prettyUrl.includes('?')) {
                // Если это красивый URL, добавляем остальные параметры как query
                const url = new URLSearchParams();
                Object.keys(queryWithoutSource).forEach(key => {
                    if (key !== 'category' && key !== 'page') {
                        url.set(key, queryWithoutSource[key] as string);
                    }
                });
                url.set('page', '1');

                const finalUrl = url.toString() ? `${prettyUrl}?${url.toString()}` : prettyUrl;
                router.push(finalUrl, undefined, { shallow: true });
            } else {
                // Fallback на старый URL
                router.push({
                    pathname: router.pathname,
                    query: {
                        ...queryWithoutSource,
                        category: category.searchName || category.label,
                        page: '1'
                    },
                }, undefined, { shallow: true });
            }
        }

        // Вызываем fetchProducts без source
        fetchProducts('', 1);
    };

    // Новая функция для обработки выбора категории из панели категорий бренда
    const handleBrandCategoryChange = (category: Category) => {
        // Показываем спиннер с минимальной длительностью
        showSpinnerWithMinDuration();

        // Проверяем, есть ли выбранный бренд
        const sourceName = selectedBrand?.name || '';

        // Проверяем, является ли выбранная категория одной из главных категорий
        const isSelectedMainCategory = mainCategories.some(mc =>
            category.label.toLowerCase().includes(mc.toLowerCase())
        );

        // Если выбрана главная категория, устанавливаем её как активную и включаем фильтрацию
        if (isSelectedMainCategory) {
            // Определяем, какая именно главная категория
            const mainCategory = mainCategories.find(mc =>
                category.label.toLowerCase().includes(mc.toLowerCase())
            );

            if (mainCategory) {
                setActiveMainCategory(mainCategory);
                setShowAllCategories(false);
            }
        }

        // Если выбрана категория "Все товары", не добавляем параметр category в URL
        if (category.label === 'Все товары' || (category.searchName && category.searchName.toLowerCase() === 'все товары')) {
            setSelectedCategory(null);

            // Обновляем URL, убирая категорию, но сохраняя бренд
            const { category, ...restQuery } = router.query;
            router.push({ pathname: getSafePathname(), query: { ...restQuery, source: sourceName || undefined, page: 1 } }, undefined, { shallow: true });

        } else {
            setSelectedCategory(category);

            // Генерируем красивый URL
            const prettyUrl = generatePrettyUrl(category, sourceName);

            if (prettyUrl.startsWith('/catalog/') && !prettyUrl.includes('?')) {
                // Если это красивый URL, добавляем остальные параметры как query
                const url = new URLSearchParams();
                Object.keys(router.query).forEach(key => {
                    if (key !== 'category' && key !== 'page' && key !== 'source') {
                        url.set(key, router.query[key] as string);
                    }
                });
                url.set('page', '1');

                const finalUrl = url.toString() ? `${prettyUrl}?${url.toString()}` : prettyUrl;
                router.push(finalUrl, undefined, { shallow: true });
            } else {
                // Fallback на старый URL
                router.push({ pathname: getSafePathname(), query: { ...router.query, category: category.searchName || category.label, source: sourceName || undefined, page: 1 } }, undefined, { shallow: true });
            }
        }

        // Обновляем товары с учетом бренда и категории
        fetchProducts(sourceName, 1);
    };

    // <<< ИЗМЕНЕННАЯ ФУНКЦИЯ >>>
    // Новая функция для сброса выбранного бренда
    const handleBrandReset = () => {
        showSpinnerWithMinDuration();
        setSelectedBrand(null);
    
        const { source, ...restQuery } = router.query;
        const currentBrandSlug = Object.entries(brandSlugToName).find(([slug, name]) => name === selectedBrand?.name)?.[0];
    
        // Если мы на ЧПУ-странице бренда, нужно перейти на страницу категории или общий каталог
        if (router.asPath.includes(`/catalog/${currentBrandSlug}`)) {
            const newPath = selectedCategory 
                ? generatePrettyUrl(selectedCategory) 
                : '/catalog';
            router.push({ pathname: newPath, query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        } else {
            router.push({ pathname: getSafePathname(), query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        }
    
        fetchProducts('', 1);
    };
    
    // <<< ИЗМЕНЕННАЯ ФУНКЦИЯ >>>
    // Новая функция для сброса выбранной категории
    const handleCategoryReset = () => {
        showSpinnerWithMinDuration();
        setSelectedCategory(null);
        setCurrentPage(1);
    
        const { category, slug, ...restQuery } = router.query;
    
        // Сохраняем бренд, если он был
        const brandName = selectedBrand?.name || (restQuery.source as string);
        const brandSlug = Object.entries(brandSlugToName).find(([slug, name]) => name === brandName)?.[0];
    
        // Если был ЧПУ-slug, переходим на страницу бренда или общий каталог
        if (slug) {
            const newPath = brandSlug ? `/catalog/${brandSlug}` : '/catalog';
            router.push({ pathname: newPath, query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        } else {
            router.push({ pathname: getSafePathname(), query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        }
    
        fetchProducts(brandName || '', 1);
    };
    
    // <<< НОВЫЕ ФУНКЦИИ ДЛЯ СБРОСА ОСТАЛЬНЫХ ФИЛЬТРОВ >>>
    const handlePriceReset = () => {
        showSpinnerWithMinDuration();
        setMinPrice(10);
        setMaxPrice(1000000);
        const { minPrice, maxPrice, ...restQuery } = router.query;
        router.push({ pathname: getSafePathname(), query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        fetchProducts(selectedBrand?.name || (router.query.source as string) || '', 1);
    };
    
    const handleColorReset = () => {
        showSpinnerWithMinDuration();
        setSelectedColor(null);
        const { color, ...restQuery } = router.query;
        router.push({ pathname: getSafePathname(), query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        fetchProducts(selectedBrand?.name || (router.query.source as string) || '', 1);
    };
    
    const handleMaterialReset = () => {
        showSpinnerWithMinDuration();
        setSelectedMaterial(null);
        const { material, ...restQuery } = router.query;
        router.push({ pathname: getSafePathname(), query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        fetchProducts(selectedBrand?.name || (router.query.source as string) || '', 1);
    };
    
    const handleSocketTypeReset = () => {
        showSpinnerWithMinDuration();
        setSelectedSocketType(null);
        const { socketType, ...restQuery } = router.query;
        router.push({ pathname: getSafePathname(), query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        fetchProducts(selectedBrand?.name || (router.query.source as string) || '', 1);
    };
    
    const handleLampCountReset = () => {
        showSpinnerWithMinDuration();
        setSelectedLampCount(null);
        const { lampCount, ...restQuery } = router.query;
        router.push({ pathname: getSafePathname(), query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        fetchProducts(selectedBrand?.name || (router.query.source as string) || '', 1);
    };
    
    const handleAvailabilityReset = () => {
        showSpinnerWithMinDuration();
        setAvailabilityFilter('all');
        const { availability, ...restQuery } = router.query;
        router.push({ pathname: getSafePathname(), query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        fetchProducts(selectedBrand?.name || (router.query.source as string) || '', 1);
    };
    
    const handleNewItemsReset = () => {
        showSpinnerWithMinDuration();
        setShowOnlyNewItems(false);
        const { newItems, ...restQuery } = router.query;
        router.push({ pathname: getSafePathname(), query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        fetchProducts(selectedBrand?.name || (router.query.source as string) || '', 1);
    };

    // Функция для получения товаров
    const fetchProducts = async (sourceName: string, page: number = 1) => {
        // Создаем уникальный идентификатор для этого запроса
        // Не используем Date.now() для предотвращения ошибок гидратации
        const effectiveSourceName = sourceName || (selectedBrand?.name || '');
        const requestId = `req_${page}_${effectiveSourceName}_${selectedCategory?.searchName || 'none'}`;

        // Сохраняем текущий requestId как последний активный
        const currentRequestId = requestId;

        // Сохраняем идентификатор текущего запроса
        (fetchProducts as any).lastRequestId = currentRequestId;

        // Отменяем предыдущий запрос через AbortController, если возможно
        if (fetchAbortController.current) {
            try {
                // Проверяем, что сигнал не был отменен ранее
                if (!fetchAbortController.current.signal.aborted) {
                    try {
                        // Пробуем новый способ с reason, но заворачиваем в try-catch
                        // так как не все браузеры поддерживают параметр
                        fetchAbortController.current.abort('Отмена из-за нового запроса');
                    } catch (abortError) {
                        // Для старых браузеров без поддержки параметра reason
                        try {
                            // Даже простой abort может вызвать ошибку в некоторых браузерах
                            fetchAbortController.current.abort();
                        } catch (e) {
                            console.log('Не удалось отменить предыдущий запрос:', e);
                            // Просто продолжаем выполнение, не пытаясь отменить
                        }
                    }
                }
            } catch (error) {
                console.log('Ошибка при отмене предыдущего запроса:', error);
            }
        }

        // Пытаемся создать новый AbortController, но не критично если не получится
        try {
            fetchAbortController.current = new AbortController();
        } catch (error) {
            console.log('Ошибка при создании AbortController:', error);
            fetchAbortController.current = null;
        }

        // Безопасно получаем сигнал или undefined, если контроллер не создан
        const signal = fetchAbortController.current?.signal;

        console.log('🚀 fetchProducts запущен с параметрами:', {
            requestId,
            sourceName: effectiveSourceName,
            page,
            selectedCategory: selectedCategory?.label || 'не выбрана',
            selectedCategorySearchName: selectedCategory?.searchName || 'не указано',
            availabilityFilter,
            routerQuery: router.query
        });

        setIsLoading(true);
        try {
            // Параметры для запроса
            const params: Record<string, any> = {};
            // Определяем, используется ли ЧПУ-маршрут каталога (catch-all [...slug])
            const usingSlugRouting = Boolean((router.query as any)?.slug);
            // И красивый путь без query
            const usingPrettyUrl = typeof router.asPath === 'string' && router.asPath.startsWith('/catalog/') && !router.asPath.includes('?');

            // Добавляем категорию, используя параметр name для API
            if (selectedCategory && selectedCategory.label !== 'Все товары') {
                // Безопасно получаем алиасы
                const aliases = selectedCategory.aliases || [];
                // Используем точное имя категории
                params.name = selectedCategory.searchName || selectedCategory.label;
                console.log(`📂 Используем категорию из состояния: "${params.name}" (из selectedCategory: "${selectedCategory.label}")`);
                // На ЧПУ-страницах не расширяем запрос алиасами, чтобы не подтягивались лишние товары
                if (!usingSlugRouting && !usingPrettyUrl && aliases.length > 0) {
                    params.aliases = aliases;
                }
            } else {
                // Пытаемся восстановить категорию из localStorage если она не установлена
                try {
                    const savedCategory = localStorage.getItem('currentCategory');
                    if (savedCategory) {
                        const categoryData = JSON.parse(savedCategory);
                        params.name = categoryData.searchName || categoryData.label;
                        console.log(`📂 Восстановили категорию из localStorage: "${params.name}"`);
                    }
                } catch (error) {
                    console.log('❌ Ошибка при восстановлении категории из localStorage:', error);
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
                if (categoryFromDB) {
                    // Сохраняем searchName из найденной категории
                    params.name = categoryFromDB.searchName || categoryFromDB.label;
                    console.log(`📂 Переопределяем категорию из URL: "${params.name}" (найдена в базе: "${categoryFromDB.label}")`);
                    // На ЧПУ-страницах не расширяем запрос алиасами, чтобы не подтягивались лишние товары
                    if (!usingSlugRouting && !usingPrettyUrl && categoryFromDB.aliases && categoryFromDB.aliases.length > 0) {
                        params.aliases = categoryFromDB.aliases;
                    }
                } else {
                    params.name = decodedCategory;
                    console.log(`📂 Используем категорию из URL напрямую: "${params.name}"`);
                }


            }

            // Если имя категории ещё не определено, восстанавливаем его из slug ЧПУ
            if (!params.name) {
                const slugParam = (router.query as any).slug;
                if (slugParam) {
                    const slugArray = Array.isArray(slugParam) ? slugParam as string[] : [slugParam as string];
                    const first = slugArray[0];
                    const brandFromSlug = brandSlugToName[first];
                    if (brandFromSlug) {
                        const rest = slugArray.slice(1).join('/');
                        if (rest && categoryPathToName[rest]) {
                            params.name = categoryPathToName[rest];
                        }
                    } else {
                        const joined = slugArray.join('/');
                        const resolved = categoryPathToName[joined] || categoryPathToName[first];
                        if (resolved) params.name = resolved;
                    }
                }
            }

            // Добавляем остальные фильтры
            if (selectedColor) params.color = selectedColor;
            if (selectedMaterial) params.material = selectedMaterial;
            if (minPrice !== 10) params.minPrice = minPrice;
            if (maxPrice !== 1000000) params.maxPrice = maxPrice;
            if (searchQuery) params.search = searchQuery;
            // Добавляем фильтр по мощности, если он выбран
            if (selectedPower) params.power = selectedPower;

            // Новые фильтры для светильников - передаем в API для серверной фильтрации
            if (selectedSocketType) params.socketType = selectedSocketType;
            if (selectedLampCount) params.lampCount = selectedLampCount;
            if (selectedShadeColor) params.shadeColor = selectedShadeColor;
            if (selectedFrameColor) params.frameColor = selectedFrameColor;

            // Добавляем фильтр по включению части имени (например, для поиска товаров по коду/артикулу)
            const includeNameFromURL = router.query.includeName;
            if (includeNameFromURL && typeof includeNameFromURL === 'string') {
                params.includeName = decodeURIComponent(includeNameFromURL);
            }

            // Проверяем наличие параметра коллекции в URL
            const collectionFromURL = router.query.collection;
            if (collectionFromURL && typeof collectionFromURL === 'string') {
                params.collection = decodeURIComponent(collectionFromURL);
            }

            // Добавляем фильтры наличия для сервера
            const availabilityFromURL = router.query.availability;
            const currentAvailability = availabilityFromURL || availabilityFilter;

            // Фильтр "В наличии" отправляем на сервер
            if (currentAvailability === 'inStock') {
                params.inStock = true;
                console.log('🟢 Установлен серверный фильтр inStock: true для категории:', params.name || 'все товары');
            }
            // Фильтр "" применяется ТОЛЬКО на клиенте, сервер загружает ВСЕ товары категории
            else if (currentAvailability === 'outOfStock') {
                console.log('📦 Фильтр "" будет применён на КЛИЕНТЕ для категории:', params.name || 'все товары');
                // НЕ добавляем params.outOfStock = true, чтобы сервер вернул все товары
            }
            // Если фильтр "Все", не устанавливаем никаких ограничений по наличию
            else {
                console.log('🔄 Загружаем все товары (в наличии и ) для категории:', params.name || 'все товары');
            }

            // Исключаем скрытые бренды из результатов
            params.excludeBrands = ['Voltum', 'Werkel', 'Donel'];
            console.log('🚫 Исключаем бренды:', params.excludeBrands);

            // Финальное логирование всех параметров запроса
            console.log('📋 ФИНАЛЬНЫЕ ПАРАМЕТРЫ ЗАПРОСА:', {
                name: params.name || 'НЕ УКАЗАНА',
                availabilityFilter: availabilityFilter + ' (outOfStock только на клиенте)',
                inStock: params.inStock || false,
                excludeBrands: params.excludeBrands,
                sourceName: effectiveSourceName || 'НЕ УКАЗАН',
                allParams: params
            });

            const newItemsFromURL = router.query.newItems;
            if (newItemsFromURL === 'true' || showOnlyNewItems) {
                params.newItems = 'true';
            }

            // Получаем параметр сортировки из URL
            const sortFromURL = router.query.sort;
            let currentSortOrder = sortOrder;

            // Если в URL есть параметр сортировки, используем его
            if (sortFromURL && typeof sortFromURL === 'string') {
                // Приводим к типу сортировки
                const validSort = sortFromURL as 'asc' | 'desc' | 'popularity' | 'newest' | 'random';
                currentSortOrder = validSort;
            }

            // Установка параметров сортировки на основе текущего состояния или URL
            if (currentSortOrder) {
                if (currentSortOrder === 'asc') {
                    params.sortBy = 'price';
                    params.sortOrder = 'asc';
                } else if (currentSortOrder === 'desc') {
                    params.sortBy = 'price';
                    params.sortOrder = 'desc';
                } else if (currentSortOrder === 'popularity') {
                    params.sortBy = 'popularity';
                    params.sortOrder = 'desc';
                } else if (currentSortOrder === 'newest') {
                    params.sortBy = 'date';
                    params.sortOrder = 'desc';
                } else if (currentSortOrder === 'random') {
                    params.sortBy = 'random';
                    params.sortOrder = 'asc';
                    params.randomize = 'true'; // Добавляем параметр randomize для случайной сортировки
                }
            } else {
                // По умолчанию используем сортировку по дате по убыванию, чтобы показывать сначала новые товары
                params.sortBy = 'date';
                params.sortOrder = 'desc';
            }

            console.log('Применяемая сортировка:', {
                sortOrder: currentSortOrder,
                sortBy: params.sortBy,
                sortDirection: params.sortOrder
            });

            // Важный параметр - принудительное применение сортировки
            params.forceSort = 'true';

            // Добавляем обработку ошибок и таймаут для запроса
            const timeoutPromise = new Promise<{ products: ProductI[], totalPages: number, totalProducts: number }>((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Превышено время ожидания запроса'));
                }, 30000); // Увеличиваем до 30 секунд для соответствия таймауту в fetchProductsWithSorting
            });

            try {
                // Для фильтра "" загружаем ВСЕ товары категории для правильной клиентской фильтрации
                let adjustedPage = page;
                let adjustedLimit = limit;

                if (currentAvailability === 'outOfStock') {
                    console.log('🔄 Фильтр "" - загружаем ВСЕ товары категории для клиентской фильтрации');
                    adjustedPage = 1; // Начинаем с первой страницы
                    adjustedLimit = 2000; // Увеличиваем лимит чтобы получить все товары
                }

                // Используем нашу новую функцию для получения товаров
                const resultPromise = combineProductsFromMultiplePages(
                    effectiveSourceName,
                    adjustedPage,
                    adjustedLimit,
                    params,
                    signal
                );

                // Запускаем запрос с таймаутом
                const result = await Promise.race([resultPromise, timeoutPromise]).catch(error => {
                    console.error('Ошибка при выполнении Promise.race:', error);
                    // В случае ошибки возвращаем объект с пустым массивом продуктов
                    hideSpinner();
                    return { products: [], totalPages: 1, totalProducts: 0 };
                });

                // Если результат получен успешно, присваиваем его переменным состояния
                if (result) {
                    // Проверяем необходимость ручной сортировки по цене
                    if (params.sortBy === 'price' && result.products && result.products.length > 1) {
                        // Применяем сортировку вручную
                        const sortedProducts = [...result.products].sort((a, b) => {
                            const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
                            const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
                            return params.sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
                        });

                        // Проверяем, отличается ли после сортировки
                        if (sortedProducts[0]._id !== result.products[0]._id) {
                            console.warn('⚠️ Применена ручная сортировка по цене, так как серверная не сработала');
                            result.products = sortedProducts;
                        }
                    }

                    if ((fetchProducts as any).lastRequestId === currentRequestId || !signal?.aborted) {
                        hideSpinner();

                        // Дополнительная клиентская фильтрация
                        let filteredProducts = result.products;

                        // Исключаем скрытые бренды (дополнительная защита)
                        const hiddenBrands = ['Voltum', 'Werkel', 'Donel'];
                        const beforeBrandFilter = filteredProducts.length;
                        // FIX: Provide a fallback for product.source to satisfy .includes() which expects a string.
                        filteredProducts = filteredProducts.filter((product: ProductI) => {
                            return !hiddenBrands.includes(product.source || '');
                        });
                        if (beforeBrandFilter !== filteredProducts.length) {
                            console.log(`🚫 Клиентская фильтрация брендов: ${beforeBrandFilter} → ${filteredProducts.length} товаров`);
                        }

                        // КЛИЕНТСКАЯ фильтрация по наличию
                        const beforeAvailabilityFilter = filteredProducts.length;

                        if (availabilityFilter === 'outOfStock') {
                            // Фильтруем товары  ТОЛЬКО на клиенте
                            filteredProducts = filteredProducts.filter((product: ProductI) => {
                                const stock = Number(product.stock) || 0;
                                return stock <= 0; // Показываем только товары 
                            });

                            console.log(`🎯 КЛИЕНТСКАЯ фильтрация "" для категории: "${params.name || selectedCategory?.searchName || selectedCategory?.label}"`);
                            console.log(`📦 Результат фильтрации: ${beforeAvailabilityFilter} → ${filteredProducts.length} товаров`);

                            // Показываем примеры для отладки
                            if (filteredProducts.length > 0) {
                                console.log('🏆 Товары "" в категории:',
                                    filteredProducts.slice(0, 3).map(p => ({
                                        name: p.name,
                                        category: p.category,
                                        stock: p.stock,
                                        source: p.source
                                    }))
                                );
                            } else {
                                console.log('❌ Нет товаров в данной категории');
                            }
                        } else if (availabilityFilter === 'inStock') {
                            // Для фильтра "в наличии" сервер уже отфильтровал, но добавляем проверку на всякий случай
                            filteredProducts = filteredProducts.filter((product: ProductI) => {
                                const stock = Number(product.stock) || 0;
                                return stock > 0; // Показываем только товары в наличии
                            });

                            console.log(`🟢 КЛИЕНТСКАЯ проверка "в наличии" для категории: "${params.name || selectedCategory?.searchName || selectedCategory?.label}"`);
                            console.log(`📦 Результат проверки: ${beforeAvailabilityFilter} → ${filteredProducts.length} товаров`);
                        } else {
                            console.log(`🔄 Показываем ВСЕ товары для категории: "${params.name || selectedCategory?.searchName || selectedCategory?.label}"`);
                            console.log(`📦 Общее количество товаров: ${filteredProducts.length}`);
                        }

                        // Для фильтра "" пересчитываем пагинацию для отфильтрованных товаров
                        if (currentAvailability === 'outOfStock') {
                            // Применяем клиентскую пагинацию к отфильтрованным товарам
                            const startIndex = (page - 1) * limit;
                            const endIndex = startIndex + limit;
                            const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

                            // Пересчитываем общее количество страниц
                            const newTotalPages = Math.ceil(filteredProducts.length / limit);

                            console.log(`📄 КЛИЕНТСКАЯ ПАГИНАЦИЯ: Показываем ${paginatedProducts.length} из ${filteredProducts.length} товаров (страница ${page}/${newTotalPages})`);

                            setProducts(paginatedProducts);
                            setTotalPages(newTotalPages);
                            setTotalProducts(filteredProducts.length);
                        } else {
                            // Для остальных фильтров используем серверную пагинацию
                            setProducts(filteredProducts);
                            setTotalPages(result.totalPages);
                            setTotalProducts(result.totalProducts); // Use total from server before client-side filtering
                        }

                        setIsLoading(false);

                        // Обновляем информацию о доступных фильтрах
                        extractFiltersFromProducts(result.products);
                    } else {
                        hideSpinner();
                        console.log(`Запрос #${currentRequestId} был заменен новым запросом или отменен`);
                    }
                }

                // Проверяем, не был ли запрос отменен
                if (signal?.aborted) {
                    console.log(`Запрос #${currentRequestId} был отменен`, signal.reason);
                    hideSpinner();
                }
            } catch (timeoutError) {
                // Обрабатываем ошибку таймаута Promise.race
                console.error('Неожиданная ошибка после Promise.race:', timeoutError);
                hideSpinner(); // Скрываем спиннер при ошибке
            }
        } catch (error) {
            console.error('Ошибка при получении товаров:', error);
            hideSpinner(); // Скрываем спиннер при ошибке
        } finally {
            // В finally уже не нужно отключать загрузку, так как это делают функции
            // hideSpinner в try, catch и обработчиках ошибок
        }
    };

    // Добавляем статическое свойство для отслеживания последнего requestId
    fetchProducts.lastRequestId = '';

    // =================================================================================
    // ====================== УЛУЧШЕННАЯ ФУНКЦИЯ НОРМАЛИЗАЦИИ =========================
    // =================================================================================
    const normalizeFilterValue = (value: string): string => {
        if (typeof value !== 'string' || !value) {
            return '';
        }

        // 1. Начальная очистка: нижний регистр, удаление пробелов и всей пунктуации.
        let cleanValue = value.toLowerCase().trim().replace(/[;,.]/g, '');

        // 2. Карта для исправления и дополнения терминов ("дописать").
        // Ключи - это то, что мы ищем (часто неполные слова). Значения - на что меняем.
        const termFixes: Record<string, string> = {
            'мат': 'матовый',
            'глянец': 'глянцевый',
            'глян': 'глянцевый',
            'прозр': 'прозрачный',
            'дымч': 'дымчатый',
            'бронз': 'бронза',
        };

        // 3. Разделяем строку на слова, чтобы применить исправления к каждому слову.
        // Это более надежно, чем простая замена. "черный мат" -> ["черный", "мат"] -> ["черный", "матовый"]
        const words = cleanValue.split(' ').filter(Boolean); // filter(Boolean) удаляет пустые строки
        const fixedWords = words.map(word => termFixes[word] || word);
        cleanValue = fixedWords.join(' ');


        // 4. Логика для объединения основных цветов (как и было, но работает с уже очищенной строкой).
        if (cleanValue.includes('золот') || cleanValue.includes('gold')) {
            if (cleanValue.includes('матов')) return 'Золото матовое';
            if (cleanValue.includes('глянц')) return 'Золото глянцевое';
            return 'Золото';
        }
        if (cleanValue.includes('серебр') || cleanValue.includes('silver') || cleanValue.includes('хром')) {
            if (cleanValue.includes('матов')) return 'Хром матовый';
            if (cleanValue.includes('глянц')) return 'Хром глянцевый';
            return 'Хром / Серебро'; // Объединяем похожие
        }
        if (cleanValue.includes('бел')) {
            if (cleanValue.includes('матов')) return 'Белый матовый';
            if (cleanValue.includes('глянц')) return 'Белый глянцевый';
            return 'Белый';
        }
        if (cleanValue.includes('черн')) {
            if (cleanValue.includes('матов')) return 'Черный матовый';
            if (cleanValue.includes('глянц')) return 'Черный глянцевый';
            return 'Черный';
        }
        if (cleanValue.includes('бронза')) { // Проверяем уже исправленное слово "бронза"
            return 'Бронза';
        }

        // 5. Финальная капитализация для всех остальных значений, которые не попали под правила выше.
        return cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1);
    };
    // =================================================================================
    // =================== КОНЕЦ УЛУЧШЕННОЙ ФУНКЦИИ НОРМАЛИЗАЦИИ =====================
    // =================================================================================


    // Извлечение фильтров из полученных товаров
    const extractFiltersFromProducts = (products: ProductI[]) => {
        const colorsMap = new Map<string, string>();
        const materialsMap = new Map<string, string>();
        const features = new Set<string>();
        const styles = new Set<string>();
        const places = new Set<string>();
        const socketTypes = new Set<string>();
        const lampCounts = new Set<number>();
        const shadeColorsMap = new Map<string, string>();
        const frameColorsMap = new Map<string, string>();

        products.forEach(product => {
            // Извлекаем и нормализуем цвета
            if (product.color) {
                const normalizedColor = normalizeFilterValue(String(product.color));
                if (normalizedColor) colorsMap.set(normalizedColor, normalizedColor);
            }

            // Извлекаем и нормализуем материалы
            if (product.material) {
                const normalizedMaterial = normalizeFilterValue(String(product.material));
                if (normalizedMaterial) materialsMap.set(normalizedMaterial, normalizedMaterial);
            }

            // Извлекаем новые поля для светильников
            if (product.socketType) {
                const normalizedSocket = normalizeFilterValue(String(product.socketType));
                if (normalizedSocket) socketTypes.add(normalizedSocket);
            }

            if (product.lampCount && typeof product.lampCount === 'number') {
                lampCounts.add(product.lampCount);
            }

            if (product.shadeColor) {
                const normalizedShadeColor = normalizeFilterValue(String(product.shadeColor));
                if (normalizedShadeColor) shadeColorsMap.set(normalizedShadeColor, normalizedShadeColor);
            }

            if (product.frameColor) {
                const normalizedFrameColor = normalizeFilterValue(String(product.frameColor));
                if (normalizedFrameColor) frameColorsMap.set(normalizedFrameColor, normalizedFrameColor);
            }

            // Можно добавить извлечение других параметров, если они есть
        });

        setExtractedFilters({
            colors: Array.from(colorsMap.values()).sort(),
            materials: Array.from(materialsMap.values()).sort(),
            features: Array.from(features),
            styles: Array.from(styles),
            places: Array.from(places),
            socketTypes: Array.from(socketTypes),
            lampCounts: Array.from(lampCounts).sort((a, b) => a - b),
            shadeColors: Array.from(shadeColorsMap.values()).sort(),
            frameColors: Array.from(frameColorsMap.values()).sort()
        });
    };

    // Переключение мобильного фильтра
    const toggleMobileFilter = () => {
        setIsMobileFilterOpen(!isMobileFilterOpen);
    };

    // Обработчики для новых фильтров светильников
    const handleSocketTypeChange = (socketType: string | null) => {
        if (selectedSocketType === socketType) {
            handleSocketTypeReset();
        } else {
            showSpinnerWithMinDuration();
            setSelectedSocketType(socketType);
            router.push({
                pathname: getSafePathname(),
                query: { ...router.query, socketType, page: 1 },
            }, undefined, { shallow: true });
            setCurrentPage(1);
            fetchProducts(router.query.source as string || '', 1);
        }
    };
    
    const handleLampCountChange = (lampCount: number | null) => {
        if (selectedLampCount === lampCount) {
            handleLampCountReset();
        } else {
            showSpinnerWithMinDuration();
            setSelectedLampCount(lampCount);
            router.push({
                pathname: getSafePathname(),
                query: { ...router.query, lampCount: lampCount?.toString(), page: 1 },
            }, undefined, { shallow: true });
            setCurrentPage(1);
            fetchProducts(router.query.source as string || '', 1);
        }
    };

    const handleShadeColorChange = (shadeColor: string | null) => {
        if (selectedShadeColor === shadeColor) {
            // Сброс фильтра
            const { shadeColor: removed, ...restQuery } = router.query;
            router.push({
                pathname: getSafePathname(),
                query: { ...restQuery, page: 1 },
            }, undefined, { shallow: true });
            setSelectedShadeColor(null);
        } else {
            // Нормализуем и применяем фильтр
            const normalizedShadeColor = shadeColor ? normalizeFilterValue(shadeColor) : null;
            router.push({
                pathname: getSafePathname(),
                query: { ...router.query, shadeColor: normalizedShadeColor, page: 1 },
            }, undefined, { shallow: true });
            setSelectedShadeColor(normalizedShadeColor);
        }
        showSpinnerWithMinDuration();
        setCurrentPage(1);
        fetchProducts(router.query.source as string || '', 1);
    };
    
    const handleFrameColorChange = (frameColor: string | null) => {
        if (selectedFrameColor === frameColor) {
            // Сброс фильтра
            const { frameColor: removed, ...restQuery } = router.query;
            router.push({
                pathname: getSafePathname(),
                query: { ...restQuery, page: 1 },
            }, undefined, { shallow: true });
            setSelectedFrameColor(null);
        } else {
            // Нормализуем и применяем фильтр
            const normalizedFrameColor = frameColor ? normalizeFilterValue(frameColor) : null;
            router.push({
                pathname: getSafePathname(),
                query: { ...router.query, frameColor: normalizedFrameColor, page: 1 },
            }, undefined, { shallow: true });
            setSelectedFrameColor(normalizedFrameColor);
        }
        showSpinnerWithMinDuration();
        setCurrentPage(1);
        fetchProducts(router.query.source as string || '', 1);
    };
    
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
            <div className="mb-6 bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Похожие категории</h3>
                    <span className="text-xs text-gray-500 mt-1 sm:mt-0">Возможно, вам понравится</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {relatedCategories.map((category, index) => (
                        <button
                            key={`${category.label}-${index}`}
                            onClick={() => handleCategoryChange(category)}
                            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm rounded-full transition-colors border border-gray-200 hover:border-gray-300 flex items-center space-x-1"
                        >
                            <span className="w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
                            <span>{category.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Функция для переключения состояния аккордеона категории
    const toggleCategoryAccordion = (categoryId: string) => {
        setOpenCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };



    // New state for the active subcategory panel
    const [activeSubcategory, setActiveSubcategory] = useState<Category | null>(null);

    const renderCategories = () => {
        const categoriesToShow = productCategoriesState.filter(c => c.label !== 'Все товары');

        // Main category selection panel
        const mainCategoryPanel = (
            <div className="space-y-2">
                {categoriesToShow.map((category) => {
                    const isActive = activeSubcategory?.id === category.id;
                    return (
                        <div key={category.id} className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? 'bg-gray-100 shadow-inner' : 'hover:bg-gray-50'}`}
                            onClick={() => setActiveSubcategory(category)}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800">{category.label}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    );
                })}
            </div>
        );

        // Subcategory selection panel
        const subCategoryPanel = (
            <div>
                <button className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-4" onClick={() => setActiveSubcategory(null)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Назад ко всем категориям
                </button>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{activeSubcategory?.label}</h3>
                <div className="space-y-2">
                    {/* "All products in category" button */}
                    <button
                        onClick={() => handleCategoryChange(activeSubcategory!)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${selectedCategory?.label === activeSubcategory?.label ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        {activeSubcategory?.label}
                    </button>

                    {/* Subcategory buttons */}
                    {activeSubcategory?.subcategories?.map(sub => {
                        const isSubActive = selectedCategory?.label === sub.label;
                        return (
                            <button
                                key={sub.searchName}
                                onClick={() => handleCategoryChange(sub)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isSubActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                            >
                                {sub.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        );

        return activeSubcategory ? subCategoryPanel : mainCategoryPanel;
    };


    const handleBrandChange = (brand: Brand) => {
        // Показываем спиннер с минимальной длительностью
        showSpinnerWithMinDuration();

        setSelectedBrand(brand);

        // Если это не "Все товары" бренд
        if (brand.name !== 'Все товары') {
            // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Сохраняем текущую выбранную категорию
            const currentCategory = selectedCategory;
            const currentlyUsingPrettyUrls = router.asPath.startsWith('/catalog/') && !router.asPath.includes('?category=');

            if (currentCategory && currentlyUsingPrettyUrls) {
                // Если используем красивые URL и есть текущая категория, генерируем красивый URL
                const prettyUrl = generatePrettyUrl(currentCategory, brand.name);

                if (prettyUrl.startsWith('/catalog/') && !prettyUrl.includes('?')) {
                    // Сохраняем остальные параметры
                    const url = new URLSearchParams();
                    Object.keys(router.query).forEach(key => {
                        if (key !== 'category' && key !== 'page' && key !== 'source') {
                            url.set(key, router.query[key] as string);
                        }
                    });
                    url.set('page', '1');

                    const finalUrl = url.toString() ? `${prettyUrl}?${url.toString()}` : prettyUrl;
                    router.push(finalUrl, undefined, { shallow: true });
                } else {
                    // Fallback на старый URL
                    router.push({
                        pathname: getSafePathname(),
                        query: {
                            ...router.query,
                            source: brand.name,
                            category: currentCategory.searchName || currentCategory.label,
                            page: 1
                        },
                    }, undefined, { shallow: true });
                }
            } else {
                // Обычный URL без категории или не красивый URL
                router.push({ pathname: getSafePathname(), query: { ...router.query, source: brand.name, category: currentCategory ? (currentCategory.searchName || currentCategory.label) : undefined, page: 1 } }, undefined, { shallow: true });
            }

            // Загружаем товары с учетом бренда и текущей категории
            fetchProducts(brand.name, 1);
        } else {
            // Для "Все товары" сбрасываем только бренд, но сохраняем категорию
            const currentCategory = selectedCategory;
            const currentlyUsingPrettyUrls = router.asPath.startsWith('/catalog/') && !router.asPath.includes('?category=');

            if (currentCategory && currentlyUsingPrettyUrls) {
                // Если используем красивые URL и есть текущая категория, генерируем красивый URL без source
                const prettyUrl = generatePrettyUrl(currentCategory);

                if (prettyUrl.startsWith('/catalog/') && !prettyUrl.includes('?')) {
                    // Сохраняем остальные параметры кроме source
                    const url = new URLSearchParams();
                    Object.keys(router.query).forEach(key => {
                        if (key !== 'category' && key !== 'page' && key !== 'source') {
                            url.set(key, router.query[key] as string);
                        }
                    });
                    url.set('page', '1');

                    const finalUrl = url.toString() ? `${prettyUrl}?${url.toString()}` : prettyUrl;
                    router.push(finalUrl, undefined, { shallow: true });
                } else {
                    // Fallback на старый URL
                    router.push({ pathname: getSafePathname(), query: { ...router.query, source: undefined, category: currentCategory.searchName || currentCategory.label, page: 1 } }, undefined, { shallow: true });
                }
            } else {
                // Обычный URL
                router.push({ pathname: getSafePathname(), query: { ...router.query, source: undefined, category: currentCategory ? (currentCategory.searchName || currentCategory.label) : undefined, page: 1 } }, undefined, { shallow: true });
            }

            fetchProducts('', 1);
        }
    };

    const handleColorChange = (color: string | null) => {
        if (selectedColor === color) {
            handleColorReset();
            return;
        }

        showSpinnerWithMinDuration();
        const normalizedColor = color ? normalizeFilterValue(color) : null;
        setSelectedColor(normalizedColor);
        router.push({ pathname: getSafePathname(), query: { ...router.query, color: normalizedColor, page: 1 } }, undefined, { shallow: true });
        setCurrentPage(1);
        fetchProducts(router.query.source as string || '', 1);
    };

    const handleMaterialChange = (material: string | null) => {
        if (selectedMaterial === material) {
            handleMaterialReset();
            return;
        }

        showSpinnerWithMinDuration();
        const normalizedMaterial = material ? normalizeFilterValue(material) : null;
        setSelectedMaterial(normalizedMaterial);
        router.push({ pathname: getSafePathname(), query: { ...router.query, material: normalizedMaterial, page: 1 } }, undefined, { shallow: true });
        setCurrentPage(1);
        fetchProducts(router.query.source as string || '', 1);
    };

    const handlePriceRangeChange = (min: number, max: number) => {
        // Показываем спиннер с минимальной длительностью
        showSpinnerWithMinDuration();

        setMinPrice(min);
        setMaxPrice(max);

        router.push({ pathname: getSafePathname(), query: { ...router.query, minPrice: min.toString(), maxPrice: max.toString(), page: 1 } }, undefined, { shallow: true });

        setCurrentPage(1);
        fetchProducts(router.query.source as string || '', 1);
    };

    const handleSortOrderChange = (order: 'asc' | 'desc' | 'popularity' | 'newest' | 'random' | null) => {
        // Показываем спиннер с минимальной длительностью
        showSpinnerWithMinDuration();

        setSortOrder(order);

        if (order) {
            router.push({ pathname: getSafePathname(), query: { ...router.query, sort: order, page: 1 } }, undefined, { shallow: true });
        } else {
            const { sort, ...restQuery } = router.query;
            router.push({ pathname: getSafePathname(), query: { ...restQuery, page: 1 } }, undefined, { shallow: true });
        }

        setCurrentPage(1);
        fetchProducts(router.query.source as string || '', 1);
    };

    const handleResetFilters = () => {
        showSpinnerWithMinDuration();
        setSelectedBrand(null);
        setSelectedCategory(null);
        setMinPrice(10);
        setMaxPrice(1000000);
        setSelectedColor(null);
        setSelectedMaterial(null);
        setSelectedPower(null);
        setSelectedRating(null);
        setSortOrder(null);
        setSearchQuery('');
        setCurrentPage(1);

        // Сбрасываем новые фильтры
        setAvailabilityFilter('all');
        setShowOnlyNewItems(false);

        // Сбрасываем фильтры светильников
        setSelectedSocketType(null);
        setSelectedLampCount(null);
        setSelectedShadeColor(null);
        setSelectedFrameColor(null);

        // Сбрасываем фильтр по категориям
        setActiveMainCategory(null);
        setShowAllCategories(true);

        // Полный сброс URL-параметров: убираем source, category и прочие фильтры
        router.push({ pathname: getSafePathname(), query: { page: 1 } }, undefined, { shallow: true });

        fetchProducts('', 1);
    };

    // Обработчик смены страницы
    const handlePageChange = (page: number) => {
        // Показываем спиннер с минимальной длительностью
        showSpinnerWithMinDuration();

        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);

        // Если уже используем ЧПУ — формируем красивый URL и сохраняем остальные фильтры.
        try {
            const usingPrettyUrl = typeof router.asPath === 'string' && router.asPath.startsWith('/catalog/') && !router.asPath.includes('?');
            const brandName = (selectedBrand && selectedBrand.name !== 'Все товары')
                ? selectedBrand.name
                : (typeof router.query.source === 'string' && router.query.source) || (source || undefined) || undefined;

            const categoryForUrl = selectedCategory || { label: 'Все товары', searchName: 'Все товары' } as any;
            const prettyUrl = generatePrettyUrl(categoryForUrl as Category, brandName);

            if (usingPrettyUrl && prettyUrl.startsWith('/catalog/') && !prettyUrl.includes('?')) {
                const url = new URLSearchParams();
                Object.keys(router.query).forEach(key => {
                    if (key !== 'page' && key !== 'source' && key !== 'category') {
                        const value = router.query[key];
                        if (typeof value === 'string') url.set(key, value);
                    }
                });
                url.set('page', String(page));
                const finalUrl = url.toString() ? `${prettyUrl}?${url.toString()}` : prettyUrl;
                router.push(finalUrl, undefined, { shallow: true });
            } else {
                // Остаёмся в query-роутинге и явно сохраняем категорию/бренд и прочие фильтры
                const newQuery: Record<string, any> = { ...router.query, page };
                if (selectedCategory) {
                    newQuery.category = selectedCategory.searchName || selectedCategory.label;
                }
                if (brandName) {
                    newQuery.source = brandName;
                }
                router.push({ pathname: getSafePathname(), query: newQuery }, undefined, { shallow: true });
            }
        } catch {
            const fallbackQuery = { ...router.query, page };
            router.push({ pathname: getSafePathname(), query: fallbackQuery }, undefined, { shallow: true });
        }

        // Убираем автоматический скролл вверх при смене страницы
        // window.scrollTo({
        //   top: 0,
        //   behavior: 'smooth'
        // });

        // Для фильтра "" не делаем новый запрос, так как все товары уже загружены
        if (availabilityFilter === 'outOfStock') {
            console.log('🔄 Фильтр "" активен - применяем клиентскую пагинацию без запроса к серверу');
            // Товары уже загружены и отфильтрованы, просто обновляем отображение
            // fetchProducts сам обработает пагинацию на клиенте
        }

        const sourceName = router.query.source || source || '';
        fetchProducts(sourceName as string, page);
    };

    // Функция для вычисления заголовка H1
    const getSourceTitle = (): JSX.Element | string => {
        const brandName = selectedBrand?.name;
        const categoryLabel = selectedCategory?.label;

        if (brandName === 'Все товары' || !brandName) {
            if (categoryLabel && categoryLabel !== 'Все товары') {
                return `Каталог товаров - ${categoryLabel}`;
            }
            return 'Каталог'; // Default for "Все товары" brand and category, or when brand/category is not set yet
        }

        // Specific brand selected
        if (categoryLabel && categoryLabel !== 'Все товары') {
            return (
                <div className="flex gap-2  items-center">
                    <span>Товары бренда </span>
                    <span className='text-6xl text-black'>{brandName}</span>
                    <span> - {categoryLabel}</span>
                </div>
            );
        }

        return (
            <div className="flex gap-4 items-center">
                <span>Товары бренда </span>
                <span className='text-4xl text-black'>{brandName}</span>
            </div>
        );
    };

    const sourceTitle = getSourceTitle(); // Используем новую функцию для вычисления заголовка

    // Функция для рендера пагинации с эллипсисами
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const currentPage = parseInt(router.query.page as string) || 1;

        // Определяем, какие страницы показывать в пагинации
        let pages = [];
        const maxVisiblePages = 5; // Максимальное количество страниц в пагинации

        if (totalPages <= maxVisiblePages) {
            // Если всего страниц меньше или равно максимальному количеству, показываем все
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            // Иначе определяем, какие страницы показывать
            if (currentPage <= 3) {
                // Если текущая страница близко к началу
                pages = [1, 2, 3, 4, '...', totalPages];
            } else if (currentPage >= totalPages - 2) {
                // Если текущая страница близко к концу
                pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                // Если текущая страница где-то в середине
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
            }
        }

        return (
            <div className="flex items-center justify-center space-x-1">
                {/* Кнопка "Назад" */}
                <button
                    className={`${currentPage === 1
                        ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        } px-3 py-2 rounded-md text-sm font-medium`}
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Номера страниц */}
                {pages.map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-3 py-2 text-gray-400">...</span>
                        ) : (
                            <button
                                className={`${currentPage === page
                                    ? 'bg-black text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    } px-3 py-2 rounded-md text-sm font-medium min-w-[40px]`}
                                onClick={() => handlePageChange(page as number)}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                {/* Кнопка "Вперед" */}
                <button
                    className={`${currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        } px-3 py-2 rounded-md text-sm font-medium`}
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        );
    };

    // Функция для группировки товаров по коллекциям
    const groupProductsByCollection = (products: ProductI[]) => {
        // Если входные данные не определены или пусты, возвращаем объект с одной категорией "Other Products"
        if (!products || products.length === 0) {
            return { 'Other Products': [] };
        }

        const collectionsTemp: Record<string, ProductI[]> = {};


        // Создаем набор для поиска похожих частей названий
        const productNameParts: Record<string, number> = {};

        // Добавляем набор для хранения префиксов артикулов
        const articlePrefixes: Record<string, number> = {};

        // Первый проход - собираем части имен и префиксы артикулов для определения общих шаблонов
        products.forEach(product => {
            // Обработка имени продукта
            if (typeof product.name === 'string' && product.name.trim()) {
                const productName = product.name.trim();

                // 1. Разбиваем имя на слова и добавляем в набор
                const words = productName.split(/\s+/).filter(word => word.length > 3);
                words.forEach(word => {
                    productNameParts[word] = (productNameParts[word] || 0) + 1;
                });

                // 2. Ищем слова в ВЕРХНЕМ РЕГИСТРЕ (часто названия коллекций)
                const uppercaseWords = productName.match(/\b([A-Z]{3,})\b/g);
                if (uppercaseWords) {
                    uppercaseWords.forEach(word => {
                        // Даем больший вес словам в верхнем регистре (считаем их за 2)
                        productNameParts[word] = (productNameParts[word] || 0) + 2;
                    });
                }

                // 3. Ищем слова после предлогов с англоязычными вариантами
                const collectionMarkers = [
                    /collection\s+([A-Za-z0-9]+)/i,
                    /series\s+([A-Za-z0-9]+)/i,
                    /model\s+([A-Za-z0-9]+)/i
                ];

                collectionMarkers.forEach(marker => {
                    const match = productName.match(marker);
                    if (match && match[1]) {
                        // Даем наибольший вес словам после маркеров коллекций (считаем их за 3)
                        productNameParts[match[1]] = (productNameParts[match[1]] || 0) + 3;
                    }
                });
            }

            // Обработка артикула продукта для поиска общих префиксов
            if (product.article) {
                const article = String(product.article).trim();

                // Ищем префиксы артикулов (буквенно-цифровые комбинации)
                // Например, для артикула "FR5171PL-08BS" будет префикс "FR"
                const prefixMatch = article.match(/^([A-Za-z]+)\d+/);
                if (prefixMatch && prefixMatch[1]) {
                    const prefix = prefixMatch[1].toUpperCase();
                    articlePrefixes[prefix] = (articlePrefixes[prefix] || 0) + 1;
                }

                // Ищем еще и более сложные префиксы с цифрами, но до первого разделителя
                // Например, для "FR5171PL-08BS" будет префикс "FR5171PL"
                const complexPrefixMatch = article.match(/^([A-Za-z0-9]+)[-_\.]/);
                if (complexPrefixMatch && complexPrefixMatch[1]) {
                    const complexPrefix = complexPrefixMatch[1].toUpperCase();
                    articlePrefixes[complexPrefix] = (articlePrefixes[complexPrefix] || 0) + 2; // Даем больший вес
                }

                // Также ищем серийные номера - группы цифр в артикуле
                const seriesMatch = article.match(/(\d{2,4})/);
                if (seriesMatch && seriesMatch[1]) {
                    const series = "Series " + seriesMatch[1];
                    articlePrefixes[series] = (articlePrefixes[series] || 0) + 1;
                }
            }
        });

        // Выбираем наиболее частые слова как коллекции (с порогом минимум 2 товара)
        const commonNameParts = Object.entries(productNameParts)
            .filter(([_, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .map(([word]) => word);

        // Выбираем наиболее частые префиксы артикулов (с порогом минимум 2 товара)
        const commonArticlePrefixes = Object.entries(articlePrefixes)
            .filter(([_, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .map(([prefix]) => prefix);



        // Второй проход - группируем на основе собранной информации
        products.forEach(product => {
            // Определяем коллекцию по разным полям и алгоритмам с приоритетами
            let collectionName = 'No Collection';
            let foundCollection = false;

            // 1. Используем явное поле collection, если оно есть
            if (product.collection) {
                collectionName = String(product.collection);
                foundCollection = true;
            }
            // 2. Ищем коллекцию в названии товара
            else if (typeof product.name === 'string' && product.name.trim() && !foundCollection) {
                const productName = product.name.trim();

                // Сначала проверяем явные маркеры коллекций
                const collectionMarkers = [
                    /collection\s+([A-Za-z0-9]+)/i,
                    /series\s+([A-Za-z0-9]+)/i,
                    /model\s+([A-Za-z0-9]+)/i
                ];

                for (const marker of collectionMarkers) {
                    const match = productName.match(marker);
                    if (match && match[1]) {
                        collectionName = match[1];
                        foundCollection = true;
                        break;
                    }
                }

                // Если явных маркеров нет, ищем слова в ВЕРХНЕМ РЕГИСТРЕ
                if (!foundCollection) {
                    const uppercaseWords = productName.match(/\b([A-Z]{3,})\b/g);
                    if (uppercaseWords && uppercaseWords.length > 0) {
                        collectionName = uppercaseWords[0];
                        foundCollection = true;
                    }
                }


            }

            // 3. Если не нашли коллекцию по имени, пробуем найти по артикулу
            if (!foundCollection && product.article) {
                const article = String(product.article).trim();

                // Проверяем наличие префикса артикула в общих префиксах
                for (const prefix of commonArticlePrefixes) {
                    // Проверяем, начинается ли артикул с данного префикса
                    // или содержит ли "Series NNN", если префикс начинается со слова "Series"
                    if (article.toUpperCase().startsWith(prefix) ||
                        (prefix.startsWith("Series ") && article.includes(prefix.replace("Series ", "")))) {
                        collectionName = prefix;
                        foundCollection = true;
                        break;
                    }
                }
            }

            // 4. Используем бренд товара как последний вариант
            if (!foundCollection && product.source && typeof product.source === 'string') {
                collectionName = String(product.source);
                foundCollection = true;
            }

            // Проверяем, содержит ли название коллекции кириллические символы
            const containsCyrillic = (text: string): boolean => {
                return /[а-яА-ЯёЁ]/.test(text);
            };

            // Проверяем, содержит ли название коллекции слово "Люстра" или другие русские слова
            if (!containsCyrillic(collectionName)) {
                // Добавляем товар в соответствующую коллекцию только если название не содержит кириллицу
                if (!collectionsTemp[collectionName]) {
                    collectionsTemp[collectionName] = [];
                }
                collectionsTemp[collectionName].push(product);
            } else {
                // Дополнительная попытка группировки по артикулу
                if (product.article) {
                    const article = String(product.article).trim();

                    // 1. Разделяем артикул на части по разделителям (дефис, подчеркивание, точка)
                    const articleParts = article.split(/[-_.]/);

                    if (articleParts.length >= 2) {
                        // Если артикул состоит из нескольких частей, создаем группы по комбинации частей

                        // 1.1 Группа по первым двум частям
                        if (articleParts.length >= 2) {
                            const firstTwoParts = articleParts.slice(0, 2).join('-');
                            if (firstTwoParts.length >= 3) {
                                const groupName = `Series ${firstTwoParts}`;
                                if (!collectionsTemp[groupName]) {
                                    collectionsTemp[groupName] = [];
                                }
                                collectionsTemp[groupName].push(product);
                            }
                        }

                        // 1.2 Группа по первой и последней части
                        if (articleParts.length >= 2) {
                            const firstAndLastParts = articleParts[0] + '-' + articleParts[articleParts.length - 1];
                            if (firstAndLastParts.length >= 3) {
                                const groupName = `Type ${firstAndLastParts}`;
                                if (!collectionsTemp[groupName]) {
                                    collectionsTemp[groupName] = [];
                                }
                                collectionsTemp[groupName].push(product);
                            }
                        }

                        // 1.3 Если есть как минимум 3 части, создаем группу "начало-середина-конец"
                        if (articleParts.length >= 3) {
                            const middlePartIndex = Math.floor(articleParts.length / 2);
                            const startMiddleEndParts = [
                                articleParts[0],
                                articleParts[middlePartIndex],
                                articleParts[articleParts.length - 1]
                            ].join('-');

                            if (startMiddleEndParts.length >= 3) {
                                const groupName = `Series ${startMiddleEndParts}`;
                                if (!collectionsTemp[groupName]) {
                                    collectionsTemp[groupName] = [];
                                }
                                collectionsTemp[groupName].push(product);
                            }
                        }
                    } else {
                        // Если артикул не содержит разделителей, используем другую стратегию

                        // 2.1 Группируем по первым 3-4 символам (обычно серия)
                        if (article.length >= 4) {
                            const prefix = article.substring(0, Math.min(4, article.length));
                            const groupName = `Series ${prefix}`;
                            if (!collectionsTemp[groupName]) {
                                collectionsTemp[groupName] = [];
                            }
                            collectionsTemp[groupName].push(product);
                        }

                        // 2.2 Если артикул достаточно длинный, группируем по начальным + конечным символам
                        if (article.length >= 6) {
                            const pattern = article.substring(0, 3) + '...' + article.substring(article.length - 2);
                            const groupName = `Pattern ${pattern}`;
                            if (!collectionsTemp[groupName]) {
                                collectionsTemp[groupName] = [];
                            }
                            collectionsTemp[groupName].push(product);
                        }
                    }

                    // 3. Анализ цифровых последовательностей
                    // Ищем числовые группы для определения серии
                    const numMatches = article.match(/\d+/g);
                    if (numMatches && numMatches.length > 0) {
                        // 3.1 Группируем по первой числовой последовательности
                        const firstNumber = numMatches[0];
                        if (firstNumber.length >= 3) {
                            // Для чисел оставляем все кроме последней цифры для группировки
                            const baseNum = firstNumber.substring(0, firstNumber.length - 1);
                            const groupName = `Series ${baseNum}X`;
                            if (!collectionsTemp[groupName]) {
                                collectionsTemp[groupName] = [];
                            }
                            collectionsTemp[groupName].push(product);
                        }

                        // 3.2 Если есть несколько чисел, создаем группу по комбинации (первое-последнее)
                        if (numMatches.length >= 2) {
                            const firstAndLastNum = `${numMatches[0]}-${numMatches[numMatches.length - 1]}`;
                            const groupName = `Type ${firstAndLastNum}`;
                            if (!collectionsTemp[groupName]) {
                                collectionsTemp[groupName] = [];
                            }
                            collectionsTemp[groupName].push(product);
                        }
                    }

                    // 4. Анализ буквенных последовательностей
                    const letterMatches = article.match(/[A-Za-z]{2,}/g);
                    if (letterMatches && letterMatches.length > 0) {
                        // 4.1 Группируем по самой длинной буквенной последовательности
                        const longestLetters = letterMatches.sort((a, b) => b.length - a.length)[0].toUpperCase();
                        const groupName = `Series ${longestLetters}`;
                        if (!collectionsTemp[groupName]) {
                            collectionsTemp[groupName] = [];
                        }
                        collectionsTemp[groupName].push(product);

                        // 4.2 Если есть несколько буквенных групп, объединяем их
                        if (letterMatches.length >= 2) {
                            const allLetters = letterMatches.join('-').toUpperCase();
                            const groupName = `Pattern ${allLetters}`;
                            if (!collectionsTemp[groupName]) {
                                collectionsTemp[groupName] = [];
                            }
                            collectionsTemp[groupName].push(product);
                        }
                    }

                    // 5. Анализ смешанных буквенно-цифровых шаблонов
                    // Например: для "ABC123DEF456" создадим шаблон "ABC-DEF"
                    const fullParsingRegex = /([A-Za-z]+)(\d+)([A-Za-z]+)?(\d+)?/;
                    const fullMatches = article.match(fullParsingRegex);
                    if (fullMatches && fullMatches.length >= 4) {
                        if (fullMatches[1] && fullMatches[3]) {
                            // Создаем группу по буквенным частям с цифрами между ними
                            const letterPattern = `${fullMatches[1]}-${fullMatches[3]}`;
                            const groupName = `Pattern ${letterPattern}`;
                            if (!collectionsTemp[groupName]) {
                                collectionsTemp[groupName] = [];
                            }
                            collectionsTemp[groupName].push(product);
                        }
                    }
                }
            }
        });

        // Финальные коллекции после обработки
        const collections: Record<string, ProductI[]> = {};

        // Обрабатываем временные коллекции
        Object.entries(collectionsTemp)
            // Сортируем коллекции по количеству товаров для лучшей группировки
            .sort((a: [string, ProductI[]], b: [string, ProductI[]]): number => {
                // Если есть параметр collection в URL, ставим эту коллекцию на первое место
                const collectionFromURL = router.query.collection;
                if (collectionFromURL && typeof collectionFromURL === 'string') {
                    const decodedCollection = decodeURIComponent(collectionFromURL);
                    if (a[0] === decodedCollection) return -1;
                    if (b[0] === decodedCollection) return 1;
                }

                return b[1].length - a[1].length;
            })
            .forEach(([name, items]) => {
                // Пропускаем коллекции Other Products и All Products
                if (name === 'Other Products' || name === 'All Products') return;

                // Если в коллекции больше 1 товара, сохраняем её
                if (items.length > 1) {
                    collections[name] = items;
                }
            });

        // Убедимся, что есть хотя бы одна коллекция
        if (Object.keys(collections).length === 0) {
            // Возвращаем пустой объект вместо All Products
            return {};
        }

        return collections;
    };

    // Очистка контроллера при размонтировании компонента
    useEffect(() => {
        // Возвращаем функцию очистки
        return () => {
            // Проверяем существование fetchAbortController
            if (fetchAbortController && fetchAbortController.current) {
                console.log('Очистка контроллера при размонтировании компонента');
                // Просто обнуляем ссылку без вызова abort
                fetchAbortController.current = null;
            }
        };
    }, []);

    // Формируем SEO метаданные на основе выбранных категорий и фильтров
    const getPageTitle = (): string => {
        if (selectedBrand && selectedBrand.name !== 'All Products') {
            if (selectedCategory && selectedCategory.label !== 'All Products') {
                return `${selectedCategory.label} ${selectedBrand.name} - купить в интернет-магазине MoreElektriki`;
            }
            return `${selectedBrand.name} - купить товары от производителя в интернет-магазине MoreElektriki`;
        }

        if (selectedCategory && selectedCategory.label !== 'All Products') {
            return `${selectedCategory.label} - купить по выгодной цене в интернет-магазине MoreElektriki`;
        }

        return 'Каталог товаров - MoreElektriki: освещение и электротовары';
    };

    const getPageDescription = (): string => {
        if (selectedBrand && selectedBrand.name !== 'All Products') {
            if (selectedCategory && selectedCategory.label !== 'All Products') {
                return `${selectedCategory.label} ${selectedBrand.name} по выгодным ценам. Быстрая доставка ✓ Гарантия от производителя ✓ Большой выбор моделей. Заказывайте на сайте MoreElektriki!`;
            }
            return `Товары ${selectedBrand.name} в официальном интернет-магазине MoreElektrikis. Большой выбор моделей, выгодные цены, быстрая доставка, гарантия производителя.`;
        }

        if (selectedCategory && selectedCategory.label !== 'All Products') {
            return `${selectedCategory.label} в интернет-магазине MoreElektriki. Широкий ассортимент, качественные товары, выгодные цены, быстрая доставка, гарантия.`;
        }

        return 'Каталог интернет-магазина MoreElektriki: светильники, люстры, бра, розетки, выключатели и другие товары для освещения и электрики. Выгодные цены, большой выбор, быстрая доставка по всей России.';
    };

    // Компонент для отображения списка брендов и категорий


    // Обновляем состояние категорий при изменении URL
    useEffect(() => {
        if (router.isReady) {
            const { source: urlSource, category } = router.query;

            // Декодируем category из URL
            const decodedCategory = category ? decodeURIComponent(category as string) : '';

            // Проверяем, является ли текущий URL одним из указанных путей с
            const isHeatingSpecialPage = urlSource === 'heating' &&
                (decodedCategory === '' ||
                    decodedCategory === '' ||
                    decodedCategory === '' || // Добавляем обе возможные версии написания
                    decodedCategory === '' ||
                    decodedCategory === 'Терморегулятор');

            // Устанавливаем обычные категории
            setProductCategoriesState(productCategories);
        }
    }, [router.isReady, router.query]);



    // Функция для проверки, является ли текущая страница страницей нагревательных товаров
    const isHeatingPageCheck = (category: string, source: string): boolean => {
        if (!category || !source) return false;

        const heatingCategoriesList = [
            '',
            '',
            '',
            'Т'
        ];

        return (
            (source === 'heating' && heatingCategoriesList.includes(category)) ||
            (heatingCategoriesList.some(c => c === category))
        );
    };

    // Функция для включения спиннера с минимальным временем отображения
    const showSpinnerWithMinDuration = useCallback(() => {
        // Очищаем предыдущий таймер, если он был
        if (spinnerTimeoutRef.current) {
            clearTimeout(spinnerTimeoutRef.current);
            spinnerTimeoutRef.current = null;
        }

        // Сразу показываем спиннер и устанавливаем флаг загрузки
        setIsLoading(true);
        setIsFullscreenLoading(true);

        // Устанавливаем минимальное время отображения спиннера (уменьшаем до 1.5 секунд)
        spinnerTimeoutRef.current = setTimeout(() => {
            // Этот код выполнится через 1.5 секунды
            // Если загрузка уже завершилась, выключаем спиннер
            if (!isLoading) {
                setIsFullscreenLoading(false);
            }
            spinnerTimeoutRef.current = null;
        }, 1500);
    }, [isLoading]);

    // Обновляем функцию для безопасного отключения спиннера
    const hideSpinner = useCallback(() => {
        // Отмечаем, что загрузка завершена
        setIsLoading(false);

        // Если таймер минимальной длительности еще активен
        if (!spinnerTimeoutRef.current) {
            // Если таймер уже завершился, скрываем спиннер сразу
            setIsFullscreenLoading(false);
        } else {
            // Планируем скрытие спиннера через небольшую задержку
            setTimeout(() => {
                setIsFullscreenLoading(false);
            }, 100);
        }
    }, []);

    // Очищаем таймер при размонтировании компонента
    useEffect(() => {
        return () => {
            if (spinnerTimeoutRef.current) {
                clearTimeout(spinnerTimeoutRef.current);
            }
        };
    }, []);

    // Функция для обработки изменения фильтра мощности
    const handlePowerChange = (power: string | null) => {
        // Показываем спиннер с минимальной длительностью
        showSpinnerWithMinDuration();

        if (selectedPower === power) {
            setSelectedPower(null);

            const { power, ...restQuery } = router.query;
            router.push({
                pathname: getSafePathname(),
                query: { ...restQuery, page: 1 },
            }, undefined, { shallow: true });
        } else {
            setSelectedPower(power);

            router.push({
                pathname: getSafePathname(),
                query: { ...router.query, power, page: 1 },
            }, undefined, { shallow: true });
        }

        setCurrentPage(1);
        fetchProducts(router.query.source as string || '', 1);
    };

    // Обработчик фильтра по наличию
    const handleAvailabilityFilter = (filter: 'all' | 'inStock' | 'outOfStock') => {
        console.log(`🔄 Изменен фильтр доступности на: ${filter} для категории: ${selectedCategory?.label || 'все товары'}`);
        console.log(`🔍 selectedCategory:`, selectedCategory);
        console.log(`🔍 router.query.category:`, router.query.category);
        console.log(`🔍 router.asPath:`, router.asPath);

        // Определяем категорию для обновления URL
        let categoryForFilter = selectedCategory;

        // Если категория не определена, пытаемся восстановить её из URL
        if (!categoryForFilter || categoryForFilter.label === 'Все товары') {
            // Проверяем router.query.category (из URL параметров)
            if (router.query.category && typeof router.query.category === 'string') {
                const categoryFromQuery = decodeURIComponent(router.query.category);
                categoryForFilter = {
                    label: categoryFromQuery,
                    searchName: categoryFromQuery
                } as Category;
                console.log(`🎯 Используем категорию из URL для фильтра: "${categoryForFilter.label}"`);
            }
            // Извлекаем из красивого URL
            else {
                const pathParts = router.asPath.split('?')[0].split('/').filter(Boolean);
                if (pathParts.length >= 2 && pathParts[0] === 'catalog') {
                    const categoryPath = pathParts.slice(1).join('/');
                    const categoryFromPath = categoryPathToName[categoryPath];

                    if (categoryFromPath) {
                        categoryForFilter = {
                            label: categoryFromPath,
                            searchName: categoryFromPath
                        } as Category;
                        console.log(`🎯 Используем категорию из пути для фильтра: "${categoryForFilter.label}"`);
                    }
                }
            }
        }

        // Принудительно сохраняем текущую категорию в localStorage
        if (categoryForFilter && categoryForFilter.label !== 'Все товары') {
            const categoryToSave = {
                label: categoryForFilter.label,
                searchName: categoryForFilter.searchName || categoryForFilter.label
            };
            localStorage.setItem('currentCategory', JSON.stringify(categoryToSave));
            console.log(`💾 Сохранили категорию в localStorage:`, categoryToSave);
        }

        showSpinnerWithMinDuration();
        setAvailabilityFilter(filter);
        setCurrentPage(1);

        const newQuery: Record<string, any> = { ...router.query, page: 1 };

        if (filter === 'all') {
            delete newQuery.availability;
        } else {
            newQuery.availability = filter;
        }

        if (categoryForFilter && categoryForFilter.label !== 'Все товары') {
            newQuery.category = categoryForFilter.searchName || categoryForFilter.label;
        }

        router.push({
            pathname: getSafePathname(),
            query: newQuery,
        }, undefined, { shallow: true });

        fetchProducts(router.query.source as string || '', 1);
    };

    // Обработчик фильтра новинок
    const handleNewItemsFilter = (showNew: boolean) => {
        showSpinnerWithMinDuration();
        setShowOnlyNewItems(showNew);
        setCurrentPage(1);

        if (!showNew) {
            const { newItems, ...restQuery } = router.query;
            router.push({
                pathname: getSafePathname(),
                query: { ...restQuery, page: 1 },
            }, undefined, { shallow: true });
        } else {
            router.push({
                pathname: getSafePathname(),
                query: { ...router.query, newItems: 'true', page: 1 },
            }, undefined, { shallow: true });
        }

        fetchProducts(router.query.source as string || '', 1);
    };


    const PowerFilter = () => {

        const isHeatingBrand = selectedBrand?.name === 'heating';

        if (!isHeatingBrand) return null;



        return (
            <div></div>
        );
    };

    // Новое состояние для главных категорий
    const [mainCategories] = useState<string[]>([
        'Люстра', 'Светильник', 'Бра', 'Торшер', 'Уличный светильник', 'Комплектующие'
    ]);

    // Добавляем категории , которые нужно считать "главными"
    const [mainHeatingCategories] = useState<string[]>([
        'Мат нагревательный', 'Обогрев кровли и площадок', 'Специальный греющий кабель', 'Терморегулятор'
    ]);

    // Новое состояние для отслеживания активной главной категории
    const [activeMainCategory, setActiveMainCategory] = useState<string | null>(null);

    // Новый флаг для отображения всех категорий
    const [showAllCategories, setShowAllCategories] = useState<boolean>(true);

    // Флаг для отслеживания, являемся ли мы в контексте
    const [isHeatingContext, setIsHeatingContext] = useState<boolean>(false);

    // Новая функция для определения, является ли категория подкатегорией активной главной категории
    const isRelatedToMainCategory = (category: Category): boolean => {
        if (!activeMainCategory) return true;

        // Проверяем, содержит ли название категории ключевые слова активной главной категории
        const categoryNameLower = category.label.toLowerCase();
        const mainCategoryLower = activeMainCategory.toLowerCase();

        // Проверяем прямое соответствие или содержание подстроки
        if (categoryNameLower.includes(mainCategoryLower)) return true;

        // Проверяем, являемся ли мы в контексте
        const isHeatingPage = router.query.source === 'heating';

        // Если мы в контексте  и активная категория одна из главных -категорий
        if (isHeatingPage && mainHeatingCategories.some(c => c.toLowerCase() === mainCategoryLower)) {
            // Специальные правила для категорий
            switch (mainCategoryLower) {
                case 'мат нагревательный':
                    return categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('');
                case '':
                    return categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('');
                case '':
                    return categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('');
                case '':
                    return categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('');
                case '':
                    return categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('') ||
                        categoryNameLower.includes('');
                default:
                    return false;
            }
        }

        // Стандартные правила для категорий освещения
        switch (mainCategoryLower) {
            case 'люстра':
                return categoryNameLower.includes('подвес') ||
                    categoryNameLower.includes('потолочн') ||
                    categoryNameLower.includes('лампа') && categoryNameLower.includes('потолок');
            case 'светильник':
                return categoryNameLower.includes('точечн') ||
                    categoryNameLower.includes('встраиваем') ||
                    categoryNameLower.includes('трековый') ||
                    categoryNameLower.includes('спот');
            case 'бра':
                return categoryNameLower.includes('настен') ||
                    categoryNameLower.includes('стен');
            case 'торшер':
                return categoryNameLower.includes('напольн') ||
                    categoryNameLower.includes('пол') && categoryNameLower.includes('свет');
            case 'уличный светильник':
                return categoryNameLower.includes('улиц') ||
                    categoryNameLower.includes('фасад') ||
                    categoryNameLower.includes('ландшафт') ||
                    categoryNameLower.includes('наруж');
            default:
                return false;
        }
    };

    // Новая функция для определения, является ли категория одной из главных категорий
    const isMainCategory = (category: Category): boolean => {
        if (!category) return false;

        // Проверяем, является ли текущая страница страницей
        const isHeatingPage = router.query.source === 'heating';

        if (isHeatingPage) {
            // Если это страница , проверяем по списку главных категорий
            return mainHeatingCategories.some(mc =>
                category.label.toLowerCase().includes(mc.toLowerCase())
            );
        } else {
            // В остальных случаях проверяем по основному списку категорий освещения
            return mainCategories.some(mc =>
                category.label.toLowerCase().includes(mc.toLowerCase())
            );
        }
    };
    
    // =================================================================================
    // ================== ИЗМЕНЕННЫЙ КОМПОНЕНТ АКТИВНЫХ ФИЛЬТРОВ =====================
    // =================================================================================
    const ActiveFilters = () => {
        const hasActiveFilters =
            (selectedBrand && selectedBrand.name !== 'Все товары') ||
            selectedCategory ||
            selectedColor ||
            selectedMaterial ||
            (minPrice !== 10 || maxPrice !== 1000000) ||
            selectedPower ||
            selectedSocketType ||
            selectedLampCount ||
            selectedShadeColor ||
            selectedFrameColor ||
            availabilityFilter !== 'all' ||
            showOnlyNewItems;
    
        if (!hasActiveFilters) return null;
    
        // Вспомогательный компонент для каждого тега фильтра
        const FilterTag = ({ label, onRemove }: { label: string, onRemove: () => void }) => (
            <div className="flex items-center bg-gray-100 text-gray-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                <span>{label}</span>
                <button 
                    onClick={onRemove} 
                    className="ml-2 -mr-1 flex-shrink-0 h-5 w-5 rounded-full inline-flex items-center justify-center text-gray-500 hover:bg-gray-300 hover:text-gray-600 focus:outline-none"
                    aria-label={`Удалить фильтр ${label}`}
                >
                    <svg className="h-3 w-3" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                </button>
            </div>
        );
    
        return (
            <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-gray-700 text-sm">Активные фильтры:</span>
                    
                    {selectedBrand && selectedBrand.name !== 'Все товары' && (
                        <FilterTag label={selectedBrand.name} onRemove={handleBrandReset} />
                    )}
    
                    {selectedCategory && (
                        <FilterTag label={selectedCategory.label} onRemove={handleCategoryReset} />
                    )}
    
                    {selectedColor && (
                        <FilterTag label={selectedColor} onRemove={handleColorReset} />
                    )}
    
                    {selectedMaterial && (
                        <FilterTag label={`Материал: ${selectedMaterial}`} onRemove={handleMaterialReset} />
                    )}
    
                    {(minPrice !== 10 || maxPrice !== 1000000) && (
                        <FilterTag 
                            label={`Цена: ${formatPrice(minPrice)} - ${formatPrice(maxPrice)} ₽`} 
                            onRemove={handlePriceReset} 
                        />
                    )}
    
                    {selectedSocketType && (
                        <FilterTag label={`Цоколь: ${selectedSocketType.toUpperCase()}`} onRemove={handleSocketTypeReset} />
                    )}
    
                    {selectedLampCount && (
                        <FilterTag label={`Кол-во ламп: ${selectedLampCount}`} onRemove={handleLampCountReset} />
                    )}
    
                    {availabilityFilter !== 'all' && (
                        <FilterTag 
                            label={availabilityFilter === 'inStock' ? 'В наличии' : ''} 
                            onRemove={handleAvailabilityReset} 
                        />
                    )}
    
                    {showOnlyNewItems && (
                        <FilterTag label="Новинки" onRemove={handleNewItemsReset} />
                    )}
    
                    <button
                        onClick={handleResetFilters}
                        className="ml-auto text-sm text-gray-500 hover:text-black hover:underline transition-colors font-medium"
                    >
                        Сбросить все
                    </button>
                </div>
            </div>
        );
    };


    // =================================================================================
    // ============================ NEW SIDEBAR COMPONENT ============================
    // =================================================================================
    const FilterSidebar = () => {
        const [brandSearch, setBrandSearch] = useState('');
        const hasActivePrice = minPrice !== 10 || maxPrice !== 1000000;
        const hasActiveLightingFilters = !!(selectedSocketType || selectedLampCount || selectedShadeColor || selectedFrameColor);
        const hasActiveAvailability = availabilityFilter !== 'all' || showOnlyNewItems;
        const [isBrandOpen, setIsBrandOpen] = useState(true);
        // NEW STATE for brand categories accordion
        const [isBrandCategoriesOpen, setIsBrandCategoriesOpen] = useState(true);

        const Accordion = ({ title, isOpen, setIsOpen, children, hasActiveFilter = false }: { title: string, isOpen: boolean, setIsOpen: (isOpen: boolean) => void, children: React.ReactNode, hasActiveFilter?: boolean }) => (
            <div className="border-b border-gray-200 py-6">
                <h3 className="-my-3 flow-root">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500"
                    >
                        <span className={`font-semibold text-gray-900 flex items-center`}>
                            {title}
                            {hasActiveFilter && <span className="ml-2 w-2 h-2 rounded-full bg-black"></span>}
                        </span>
                        <span className="ml-6 flex items-center">
                            <svg className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </button>
                </h3>
                {isOpen && (
                    <div className="pt-6">
                        <div className="space-y-4">
                            {children}
                        </div>
                    </div>
                )}
            </div>
        );

        // Map for color swatches
        const colorMap: Record<string, string> = {
            'белый': '#FFFFFF',
            'черный': '#000000',
            'золото': 'gold',
            'хром / серебро': '#C0C0C0',
            'бронза': '#CD7F32',
            'серый': 'grey',
            'бежевый': 'beige',
            'прозрачный': 'transparent',
            // Add more colors as needed
        };

        const getColorHex = (colorName: string) => {
            const lowerColor = colorName.toLowerCase();
            for (const key in colorMap) {
                if (lowerColor.includes(key)) {
                    return colorMap[key];
                }
            }
            return '#E5E7EB'; // Default gray for unknown colors
        };

        const CheckIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
        );

        const filteredBrandsList = brands
            .filter(brand => brand.name !== 'Все товары' && brand.name.toLowerCase().includes(brandSearch.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));

        return (
            <div className='relative'>
                {/* Mobile Header */}
                <div className="lg:hidden flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-gray-900">Фильтры</h2>
                    <button onClick={toggleMobileFilter} className="p-2 text-gray-500 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 lg:p-0">
                    {/* Categories */}
                    <div className="border-b border-gray-200 py-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Категории</h3>
                        {renderCategories()}
                    </div>

                    {selectedBrand?.name === 'heating' && <PowerFilter />}

                    {/* NEW Brand Filter */}
                    <Accordion title="Производитель" isOpen={isBrandOpen} setIsOpen={setIsBrandOpen} hasActiveFilter={!!selectedBrand && selectedBrand.name !== 'Все товары'}>
                        <div className="relative mb-4">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Поиск бренда..."
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                                className="w-full text-sm pl-10 pr-4 py-2 bg-gray-100 rounded-md border-transparent focus:ring-2 focus:ring-black focus:bg-white transition"
                            />
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            <button
                                onClick={handleBrandReset}
                                className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${!selectedBrand || selectedBrand.name === 'Все товары'
                                    ? 'bg-gray-100 font-semibold text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span>Все производители</span>
                                {(!selectedBrand || selectedBrand.name === 'Все товары') && <CheckIcon />}
                            </button>
                            {filteredBrandsList.map((brand) => (
                                <button
                                    key={brand.name}
                                    onClick={() => handleBrandChange(brand)}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${selectedBrand?.name === brand.name
                                        ? 'bg-gray-100 font-semibold text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{brand.name}</span>
                                    {selectedBrand?.name === brand.name && <CheckIcon />}
                                </button>
                            ))}
                        </div>
                    </Accordion>

                    {/* NEW: BRAND-SPECIFIC CATEGORIES */}
                    {selectedBrand && selectedBrand.name !== 'Все товары' && selectedBrand.categories.length > 1 && (
                         <Accordion title={`Категории ${selectedBrand.name}`} isOpen={isBrandCategoriesOpen} setIsOpen={setIsBrandCategoriesOpen} hasActiveFilter={!!selectedCategory}>
                             <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                 {selectedBrand.categories.map((category) => (
                                     <button
                                         key={category.searchName}
                                         onClick={() => handleBrandCategoryChange(category)}
                                         className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${
                                             selectedCategory?.searchName === category.searchName
                                             ? 'bg-gray-100 font-semibold text-gray-900'
                                             : 'text-gray-600 hover:bg-gray-50'
                                         }`}
                                     >
                                         <span>{category.label}</span>
                                         {selectedCategory?.searchName === category.searchName && <CheckIcon />}
                                     </button>
                                 ))}
                             </div>
                         </Accordion>
                    )}

                    {/* NEW Price Filter */}
                    <Accordion title="Цена" isOpen={isPriceOpen} setIsOpen={setIsPriceOpen} hasActiveFilter={hasActivePrice}>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">От</span>
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full pl-8 pr-2 py-2 bg-gray-100 text-black placeholder-gray-500 rounded-md border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">До</span>
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                                    placeholder="1000000"
                                    className="w-full pl-8 pr-2 py-2 bg-gray-100 text-black placeholder-gray-500 rounded-md border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>
                        <button onClick={() => handlePriceRangeChange(minPrice, maxPrice)} className="w-full mt-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
                            Применить
                        </button>
                    </Accordion>


                    {/* NEW Lighting Specific Filters */}
                    {(extractedFilters.socketTypes.length > 0 || extractedFilters.lampCounts.length > 0 || extractedFilters.shadeColors.length > 0 || extractedFilters.frameColors.length > 0) && (
                        <Accordion title="Характеристики" isOpen={isSocketTypeOpen} setIsOpen={setIsSocketTypeOpen} hasActiveFilter={hasActiveLightingFilters}>
                            {extractedFilters.frameColors.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Цвет арматуры</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {extractedFilters.frameColors.map(color => (
                                            <button
                                                key={color}
                                                title={color}
                                                onClick={() => handleFrameColorChange(color)}
                                                className={`w-8 h-8 rounded-full border border-gray-200 transition-all duration-200 ${selectedFrameColor === color ? 'ring-2 ring-offset-2 ring-black' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: getColorHex(color) }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {extractedFilters.shadeColors.length > 0 && (
                                <div className='pt-6'>
                                    <h4 className="font-medium text-gray-900 mb-3">Цвет плафона</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {extractedFilters.shadeColors.map(color => (
                                            <button
                                                key={color}
                                                title={color}
                                                onClick={() => handleShadeColorChange(color)}
                                                className={`w-8 h-8 rounded-full border border-gray-200 transition-all duration-200 ${selectedShadeColor === color ? 'ring-2 ring-offset-2 ring-black' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: getColorHex(color) }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {extractedFilters.socketTypes.length > 0 && (
                                <div className='pt-6'>
                                    <h4 className="font-medium text-gray-900 mb-2">Тип цоколя</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {extractedFilters.socketTypes.map(item => (
                                            <button key={item} onClick={() => handleSocketTypeChange(item)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedSocketType === item ? 'bg-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                                                {item.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {extractedFilters.lampCounts.length > 0 && (
                                <div className='pt-4'>
                                    <h4 className="font-medium text-gray-900 mb-2">Количество ламп</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {extractedFilters.lampCounts.map(item => (
                                            <button key={item} onClick={() => handleLampCountChange(item)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedLampCount === item ? 'bg-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Accordion>
                    )}

                    {/* NEW Availability and New Items */}
                    <Accordion title="Наличие" isOpen={isFiltersOpen} setIsOpen={setIsFiltersOpen} hasActiveFilter={hasActiveAvailability}>
                        <div className="space-y-3">
                            <button onClick={() => handleAvailabilityFilter('all')} className={`w-full flex items-center justify-between p-3 rounded-lg border transition ${availabilityFilter === 'all' ? 'bg-gray-100 border-gray-300' : 'border-gray-200 hover:border-gray-300'}`}>
                                <span className="font-medium text-sm text-gray-800">Все товары</span>
                            </button>
                            <button onClick={() => handleAvailabilityFilter('inStock')} className={`w-full flex items-center justify-between p-3 rounded-lg border transition ${availabilityFilter === 'inStock' ? 'bg-gray-100 border-gray-300' : 'border-gray-200 hover:border-gray-300'}`}>
                                <span className="font-medium text-sm text-gray-800">В наличии</span>
                            </button> 
                        </div>
                       
                    </Accordion>
                </div>

                {/* Mobile Footer with actions */}
                <div className="lg:hidden sticky bottom-0 bg-white border-t border-gray-200 p-4 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleResetFilters}
                            className="w-1/2 text-center py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        >
                            Сбросить
                        </button>
                        <button
                            onClick={toggleMobileFilter}
                            className="w-1/2 text-center py-3 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800"
                        >
                            Показать товары
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    // =================================================================================
    // ======================== END OF NEW SIDEBAR COMPONENT =========================
    // =================================================================================

    return (
        <div className="min-h-screen  flex flex-col text-white overflow-hidden max-w-[100vw]">
            <SEO
                title={getPageTitle()}
                description={getPageDescription()}
                keywords={`купить ${selectedCategory?.label?.toLowerCase() || 'светильники'} moreelektriki, ${selectedCategory?.label?.toLowerCase() || 'светильники'}, ${selectedBrand?.name || ''}, электроустановочные изделия, теплые полы, люстры потолочные, люстры подвесные, настенные светильники, торшеры, настольные лампы, розетки, выключатели, LightStar, Maytoni, Novotech, Artelamp, Lumion`}
                url={`/catalog${router.asPath.includes('?') ? router.asPath : ''}`}
                image="/images/logo.webp"
            />
            <Header />

            {/* Слайдер на всю ширину экрана */}



            {/* Полноэкранный спиннер загрузки */}
            {isFullscreenLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-[9999] flex justify-center items-center transition-opacity duration-300">
                    <LoadingSpinner size="xl" text="Загрузка товаров..." />
                </div>
            )}

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 mt-40 overflow-hidden">
                {/* Убираем дублирующий спиннер из основного контента */}

                <div className="max-w-9xl mx-auto overflow-hidden">


                    {/* === MODIFIED BLOCK START === */}
                    {/* Заголовок страницы */}
                    <div className="flex justify-between items-end flex-wrap gap-4 mt-10 mb-6">
                        <h1 className="text-5xl font-bold text-black">
                            {selectedCategory ? selectedCategory.label : (selectedBrand && selectedBrand.name !== 'Все товары' ? selectedBrand.name : 'Каталог товаров')}
                        </h1>
                        {totalProducts > 0 && (
                            <span className="text-base text-gray-600 font-medium whitespace-nowrap">
                                Найдено {totalProducts} {totalProducts === 1 ? 'товар' :
                                    (totalProducts >= 2 && totalProducts <= 4) ? 'товара' : 'товаров'}
                            </span>
                        )}
                    </div>
                    {/* === MODIFIED BLOCK END === */}
                    
                    {/* NEW: Render Active Filters */}
                    <ActiveFilters />

                    {/* Mobile Filter Button */}
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={toggleMobileFilter}
                            className="w-52 py-3 px-4 bg-white border border-black/30 rounded-xl  flex items-center justify-between"
                            aria-label="Открыть фильтры"
                        >
                            <span className="font-medium  text-black">Фильтры все</span>
                        </button>
                    </div>

                    <div className="flex flex-col  lg:flex-row gap-6 lg:gap-8 overflow-hidden">
                        {/* Left Sidebar - Hidden on mobile unless toggled */}
                        <aside className={`${isMobileFilterOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:block lg:relative lg:z-auto lg:w-[270px] lg:flex-shrink-0`}>
                            {/* Backdrop for mobile */}
                            {isMobileFilterOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={toggleMobileFilter} />}

                            {/* Mobile Filter Container */}
                            <div className={`fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white text-black overflow-y-auto shadow-xl z-50 transform transition-transform duration-300 ${isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'} lg:transform-none lg:static lg:w-full lg:max-w-none lg:shadow-none lg:bg-transparent`}>
                                <FilterSidebar />
                            </div>
                        </aside>

                        {/* Right Content Area */}
                        <div className="flex-1 ">    {/* Product List */}
                            <div id="products-section" className="overflow-hidden">
                                {/* Products */}
                                {isLoading ? (
                                    <div className="flex justify-center items-center ">
                                        <LoadingSpinner size="lg" text="Загрузка товаров..." />
                                    </div>
                                ) : products.length > 0 ? (
                                    <>
                                        {/* Заменяем стандартную пагинацию на новую фиксированную */}
                                        {totalPages > 1 && (
                                            <div className="text-black text-sm whitespace-nowrap px-3 py-2 rounded-lg border border-white/10">
                                                Страница {currentPage} из {totalPages}
                                            </div>
                                        )}
                                        {products.length > 0 && !isLoading && (
                                            <div className="mb-6">
                                                <CatalogOfProductSearch
                                                    products={products}
                                                    viewMode={'grid'}
                                                    isLoading={isLoading}
                                                />
                                            </div>
                                        )}
                                        {/* Пагинация */}
                                        <Pagination
                                            totalPages={totalPages}
                                            currentPage={currentPage}
                                            onPageChange={handlePageChange}
                                        />
                                    </>
                                ) : (
                                    <div className="p-20 text-center">
                                        {showOnlyNewItems ? (
                                            // Специальная заглушка для новинок
                                            <div className="text-center max-w-md mx-auto">
                                                <div className="mb-8">
                                                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br   flex items-center justify-center">
                                                        <p className='text-5xl'>MOREELEKTRIKI</p>
                                                    </div>
                                                    <h2 className="text-3xl font-bold text-white mb-4">
                                                        Скоро здесь будут новинки!
                                                    </h2>
                                                    <p className="text-gray-400 text-lg mb-6">
                                                        Мы готовим для вас самые лучшие новые товары.
                                                        Совсем скоро они появятся с яркими бейджами "Новинка".
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                        <button
                                                            onClick={() => handleNewItemsFilter(false)}
                                                            className="px-6 py-3 bg-[#000000]/80 backdrop-blur-sm border border-[#000000]/30 text-white rounded-xl hover:bg-[#000000]/90 transition-all duration-200 font-medium shadow-lg"
                                                        >
                                                            Посмотреть все товары
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Обычная заглушка для других случаев
                                            <div className="text-center">


                                                <div className="flex justify-center">
                                                    <LoadingSpinner size="lg" text="Обновление каталога..." />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Глобальные стили */}
            <style jsx global>{`
        html, body {
          overflow-x: hidden !important;
          max-width: 100vw !important;
          margin: 0;
          padding: 0;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Исправление для отображения товаров */
        .grid {
          width: 100% !important;
          overflow: hidden !important;
        }
        
        /* Контейнер продуктов */
        .product-container {
          max-width: 100%;
          overflow-x: hidden;
        }
        
        /* Исправление для мобильных устройств */
        @media (max-width: 640px) {
          .container {
            padding-left: 12px;
            padding-right: 12px;
            width: 100%;
            max-width: 100vw;
            overflow: hidden;
          }
          
          h1.text-2xl {
            font-size: 1.5rem;
            line-height: 1.75rem;
          }
          
          h1 span.ml-3 {
            display: block;
            margin-left: 0;
            margin-top: 0.5rem;
          }
        }
        
        /* Улучшения для различных размеров экрана */
        @media (max-width: 768px) {
          .space-x-2 > * {
            margin-right: 0.25rem !important;
          }
          
          .mt-31 {
            margin-top: 6rem;
          }
          
          /* Улучшение отображения товаров в сетке */
          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.5rem !important;
          }
          
          /* Уменьшение размера карточек товаров */
          .product-card {
            padding: 0.5rem !important;
          }
          
          .product-card h3 {
            font-size: 0.875rem !important;
          }
          
          .product-card .price {
            font-size: 0.875rem !important;
          }
        }
        
        /* Фикс для контейнера каталога */
        .catalog-container {
          max-width: 100vw;
          overflow-x: hidden;
        }
      `}</style>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const sourceName = query.source || '';
    const pageNumber = query.page ? parseInt(query.page as string, 10) : 1;

    // Создаем таймаут для запроса в 10 секунд
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('Превышено время запроса данных'));
        }, 10000); // 10 секунд таймаут
    });

    try {
        // Собираем все параметры запроса из URL
        const params: Record<string, any> = {};

        // Добавляем категорию, если она есть
        if (query.category && query.category !== 'Все товары' && query.category !== 'все-товары') {
            params.name = query.category;

            // Проверяем, является ли категория категорией освещения
            if (typeof params.name === 'string') {
                const lightingCategories = [
                    'Люстра', 'Светильник', 'Бра', 'Торшер', 'Спот', 'Подвесной',
                    'Подвесная', 'Потолочный', 'Настенный', 'Настольный', 'Лампа',
                    'Комплектующие', 'Коннектор', 'Шнур', 'Блок питания', 'Патрон',
                    'Крепление', 'Плафон', 'Профиль для ленты', 'Контроллер'
                ];

                const isLightingCategory = lightingCategories.some(lightingCategory =>
                    params.name.includes(lightingCategory)
                );


                // Проверяем скрытые бренды в каталоге освещения
                const hiddenBrands = ['Donel', 'Werkel', 'Voltum'];
                const isHiddenBrand = hiddenBrands.includes(sourceName as string);

                if (isLightingCategory && (sourceName === 'heating' || isHiddenBrand)) {
                    console.log('Серверная сторона: обнаружена категория освещения со скрытым брендом, исправляем');

                    const safeSourceName = '';
                    return {
                        props: {
                            initialProducts: [],
                            initialTotalPages: 1,
                            initialTotalProducts: 0,
                            source: safeSourceName,
                        }
                    };
                }
            }
        }

        // Добавляем остальные параметры фильтрации
        if (query.minPrice) params.minPrice = query.minPrice;
        if (query.maxPrice) params.maxPrice = query.maxPrice;
        if (query.color) params.color = query.color;
        if (query.material) params.material = query.material;
        if (query.search) params.search = query.search;

        if (query.power) params.power = query.power;

        // Добавляем параметр includeName для точной фильтрации по частям имени
        if (query.includeName) params.includeName = query.includeName;

        // Добавляем параметр коллекции, если он указан в URL
        if (query.collection) {
            params.collection = query.collection;
        }

        // Исключаем скрытые бренды из результатов (серверная сторона)
        params.excludeBrands = ['Voltum', 'Werkel', 'Donel'];

        // Добавляем параметры сортировки
        if (query.sort) {
            const sortOrder = query.sort as string;
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
            // Сортировка по умолчанию
            params.sortBy = 'date';
            params.sortOrder = 'desc';
        }

        console.log('Server-side params:', params);

        // Используем Promise.race для ограничения времени выполнения запроса
        const dataPromise = combineProductsFromMultiplePages(
            sourceName as string,
            pageNumber,
            40, // Лимит товаров на странице
            params
        );

        try {
            // Выполняем запрос с таймаутом
            const data = await Promise.race([dataPromise, timeoutPromise]) as {
                products: ProductI[],
                totalPages: number,
                totalProducts: number
            };

            // Возвращаем данные только внутри объекта props
            return {
                props: {
                    initialProducts: data.products || [],
                    initialTotalPages: data.totalPages || 1,
                    initialTotalProducts: data.totalProducts || 0,
                    source: sourceName as string || null,
                }
            };
        } catch (error) {
            console.error('Ошибка при получении товаров с сервера', error);

            // Проверяем, связана ли ошибка с категорией освещения
            if (params.name && typeof params.name === 'string') {
                const lightingCategories = [
                    'Люстра', 'Светильник', 'Бра', 'Торшер', 'Спот', 'Подвесной',
                    'Подвесная', 'Потолочный', 'Настенный', 'Настольный', 'Лампа',
                    'Комплектующие', 'Коннектор', 'Шнур', 'Блок питания', 'Патрон',
                    'Крепление', 'Плафон', 'Профиль для ленты', 'Контроллер'
                ];

                const isLightingCategory = lightingCategories.some(lightingCategory =>
                    params.name.includes(lightingCategory)
                );

                if (isLightingCategory) {
                    // Для категорий освещения с ошибкой меняем source с  на пустую строку
                    const safeSourceName = sourceName === 'heating' ? '' : sourceName;

                    // В случае ошибки в категории освещения возвращаем пустые данные с исправленным source
                    return {
                        props: {
                            initialProducts: [],
                            initialTotalPages: 1,
                            initialTotalProducts: 0,
                            source: safeSourceName as string || null,
                        }
                    };
                }
            }

            // В случае других ошибок возвращаем пустые данные
            return {
                props: {
                    initialProducts: [],
                    initialTotalPages: 1,
                    initialTotalProducts: 0,
                    source: sourceName as string || null,
                }
            };
        }
    } catch (error) {
        console.error('Ошибка при получении товаров с сервера', error);

        // В случае ошибки возвращаем пустые данные
        return {
            props: {
                initialProducts: [],
                initialTotalPages: 1,
                initialTotalProducts: 0,
                source: sourceName as string || null,
            }
        };
    }
};

export default CatalogIndex;
