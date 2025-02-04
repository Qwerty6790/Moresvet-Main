'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Toaster } from 'sonner';
import { ChevronDown, Search, SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ProductI } from '../../types/interfaces';
import { CatalogOfProducts } from '../../components/CatalogOfProducts';
import Pagination from '../../components/PaginationComponents';
import { ClipLoader } from 'react-spinners';
import Skeleton from 'react-loading-skeleton';
import Link from 'next/link';

// Type definitions
interface Category {
  label: string;
  href?: string;
  searchName: string;
}

interface Brand {
  name: string;
  categories: Category[];
  collection?: string;
}

// Brands and categories data
const brands: Brand[] = [
  {
    name: 'LightStar',
    categories: [
      { label: 'Люстры подвесные', searchName: 'Люстра подвесная' },
      { label: 'Люстры потолочные', searchName: 'Люстра' },
      { label: 'Бра', searchName: 'Бра ' },
      { label: 'Светильники', searchName: 'Светильник' },
      { label: 'Настольные лампы', href: '/Catalog', searchName: 'Настольная лампа' },
      { label: 'Торшеры', href: '/web-1nashtange', searchName: 'Торшер' },
      { label: 'Соединители', href: '/web-1nashtange', searchName: 'Соединитель' },
      { label: 'Светильники уличный', href: '/office-lamps', searchName: 'Светильник уличный' },
    ],
  },
  {
    name: 'ElektroStandard',
    categories: [
      { label: 'Светильники', searchName: 'Светильник' },
      { label: 'Шинопроводы', searchName: 'Шинопровод' },
      { label: 'Коннекторы', searchName: 'Коннектор' },
      { label: 'Подвесной светильник', searchName: 'Подвесной св' }, 
      { label: 'Лампы', searchName: 'Лампа' },
      { label: 'Светильник уличный', href: '/office-lamps', searchName: 'Светильник уличный' },
    ],
  },
  {
    name: 'Denkirs',
    categories: [
      { label: 'Подвесные светильники', searchName: 'Подвесной светильник' }, 
      { label: 'Бра', searchName: 'Бра ' },
      { label: 'Светильник', searchName: 'Светильник' },
    ],
  },
  {
    name: 'KinkLight',
    categories: [
      { label: 'Настольная лампа', href: '/Catalog', searchName: 'Настольная лампа' },
      { label: 'Люстра', href: '/Catalog', searchName: 'Люстра' }, 
      { label: 'Кресло', href: '/Catalog', searchName: 'Кресло' },
      { label: 'Торшер', href: '/web-1nashtange', searchName: 'Торшер' },
      { label: 'Настенный Светильник', href: '/web-1podvesnoy', searchName: 'Настенный Светильник' },
      { label: 'Светильник уличный', href: '/office-lamps', searchName: 'Светильник уличный' },
      { label: 'Подвес', href: '/decorative-lamps', searchName: 'Подвес' },
      { label: 'Бра', href: '/decorative-lamps', searchName: 'Бра' },
      { label: 'Светильник', href: '/decorative-lamps', searchName: 'Светильник' },
      { label: 'Трековый светильник', href: '/decorative-lamps', searchName: 'трековый светильник' },
      { label: 'Настенный светильник', href: '/decorative-lamps', searchName: 'настенный светильник' },
    ],
  },
  {
    name: 'Stluce',
    categories: [
      { label: 'Подвес', searchName: 'Подвес' },
      { label: 'Люстра', searchName: 'Люстра' },
      { label: 'Подвесной светильник', searchName: 'Подвесной светильник' }, 
      { label: 'Потолочный светильник', searchName: 'Потолочный светильник' },
    ],
    
  },
  {
    name: 'FavouriteLight',
    categories: [
      { label: 'Потолочная Люстра', searchName: 'Потолочная Люстра' },
      { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
      { label: 'Потолочный Светильник', searchName: 'Потолочный Светильник' },
      { label: 'Врезной Светильник', searchName: 'Врезной Светильник' },
      { label: 'Настенный Светильник', searchName: 'Настенный Светильник' },
      { label: 'Напольный Светильник', searchName: 'Напольный Светильник' },
      { label: 'Настольный Светильник', searchName: 'Настольный Светильник' },
      { label: 'Подвес', searchName: 'Подвес' }, 
      { label: 'Уличный светильник', searchName: 'Уличный светильник' },
    ],
  },
  {
    name: 'Maytoni',
    categories: [
      { label: 'Настольный светильник', searchName: 'Настольный светильник' },
      { label: 'Подвесной светильник', searchName: 'Подвесной светильник' }, 
      { label: 'Люстра', searchName: 'Люстра' }, 
      { label: 'Потолочный светильник', searchName: 'Потолочный светильник' },
    ],
  },
  {
    name: 'Artelamp',
    categories: [
      { label: 'Подвесной светильник', searchName: 'Подвесной светильник' },
      { label: 'Люстра на штанге', searchName: 'Люстра на штанге' },
      { label: 'Бра', searchName: 'Бра' },
      { label: 'Подвесная люстра', searchName: 'Подвесная люстра' },
      { label: 'Декоративная настольная лампа', searchName: 'Декоративная настольная лампа' },
      { label: 'Торшер', searchName: 'Торшер' },
      { label: 'Трековый светильник', searchName: 'Трековый светильник' },
      { label: 'Точечный встраиваемый светильник', searchName: 'Точечный встраиваемый светильник' }, 
    ],
  },
  
  {
    name: 'Werkel',
    categories: [
      { label: 'Выключатель', searchName: 'Выключатель' },
      { label: 'Розетка', searchName: 'Розетка' },
      { label: 'Датчик', searchName: 'Датчик' }, 
      { label: 'Провод', searchName: 'Провод' },
    ],
  },
];
const Catalog: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<Brand>(brands[0]);
  const [products, setProducts] = useState<ProductI[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>(selectedBrand.categories[0]);
  const [minPrice, setMinPrice] = useState<number>(10);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);
  const [showInStock, setShowInStock] = useState<boolean>(true);
const [showOutOfStock, setShowOutOfStock] = useState<boolean>(true);
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [itemsPerPage, setItemsPerPage] = useState<number>(32);
const [activeFilters, setActiveFilters] = useState<string[]>([]);
const [showFilters, setShowFilters] = useState(true);
const [showFeaturedProducts, setShowFeaturedProducts] = useState(true);
const [sortType, setSortType] = useState<'popular' | 'new' | 'price-asc' | 'price-desc'>('popular');
const [searchQuery, setSearchQuery] = useState('');

  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const getStockCount = (stock: any) => {
    // Replace this logic with how your stock is calculated
    return stock ? stock.count || 0 : 0;
  };
  
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const stockCount = getStockCount(product.stock);
      const matchesStock = (showInStock && stockCount > 0) || 
                          (showOutOfStock && stockCount === 0);
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.article.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStock && matchesPrice && matchesSearch;
    });

    // Сортировка
    switch (sortType) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'new':
        filtered.sort((a, b) => {
          const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
          const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'popular':
      default:
        // Здесь можно добавить логику сортировки по популярности
        break;
    }

    return filtered;
  }, [products, showInStock, showOutOfStock, minPrice, maxPrice, searchQuery, sortType]);
  
  
  const fetchProducts = async (page: number, name: string) => {
    setIsPageLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${selectedBrand.name}`, {
        params: {
          page,
          limit: 32,
          name,
          minPrice,
          maxPrice,
        },
      });

      if (page === 1) {
        setProducts(res.data.products);
      } else {
        setProducts((prevProducts) => [...prevProducts, ...res.data.products]);
      }

      setTotalPages(res.data.totalPages);
      setTotalProducts(res.data.totalProducts);
      setHasMoreProducts(page < res.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsPageLoading(false);
    }
  };


  useEffect(() => {
    if (sortOrder) {
      const sortedProducts = [...products].sort((a, b) =>
        sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      );
      setProducts(sortedProducts);
    }
  }, [sortOrder]);

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setHasMoreProducts(true);
  };

  const handleBrandChange = (brand: Brand) => {
    setSelectedBrand(brand);
    setSelectedCategory(brand.categories[0]);
    setCurrentPage(1);
    setHasMoreProducts(true);
  };

  const handlePriceChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    setter(value);
    setCurrentPage(1);
    setHasMoreProducts(true);
  };

  

  useEffect(() => {
    fetchProducts(currentPage, selectedCategory.searchName);
  }, [currentPage, selectedCategory, minPrice, maxPrice, selectedBrand]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-gradient-to-br mt-28 from-white to-gray-50 min-h-screen">
      {/* Hero секция с динамическим фоном */}
      <div className="relative h-[400px] bg-black overflow-hidden">
        {/* Фоновые элементы */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black"></div>
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5"></div>
        
        {/* Декоративные элементы */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-9xl mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full py-12">
            {/* Левая часть */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-7xl font-bold text-white tracking-tight leading-tight">
                  Каталог<br/>
                  <span className="text-white/90">товаров</span>
                </h1>
                <div className="flex items-center text-white/60 text-sm">
                  <a href="/" className="hover:text-white transition-colors">Главная</a>
                  <span className="mx-2">/</span>
                  <span className="text-white">Каталог</span>
                </div>
              </div>

              <div className="flex items-center space-x-12">
                <div className="group">
                  <div className="text-3xl font-bold text-white mb-1">{totalProducts}</div>
                  <div className="text-sm text-white/60 group-hover:text-white transition-colors">
                    Товаров
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="group">
                  <div className="text-3xl font-bold text-white mb-1">{brands.length}</div>
                  <div className="text-sm text-white/60 group-hover:text-white transition-colors">
                    Брендов
                  </div>
                </div>
              </div>
            </div>

            {/* Правая часть - карточки товаров */}
            <div className="hidden lg:grid grid-cols-3 gap-6 w-[900px]">
              {products.slice(0, 3).map((product, index) => (
                <Link 
                  href={`/products/${product.source}/${product.article}`}
                  key={product._id} 
                  className={`group relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 
                             hover:bg-white/10 transition-all duration-500 transform 
                             hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30
                             border border-white/10`}
                >
                  {/* Индикатор наличия */}
                  {getStockCount(product.stock) > 0 ? (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white/10 
                                  backdrop-blur-md px-3 py-1 rounded-full">
                    
                      <span className="text-xs text-white/80">В наличии</span>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 flex items-center space-x-2  
                                  backdrop-blur-md px-3 py-1 rounded-full">
                    
          
                    </div>
                  )}

                  {/* Изображение */}
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-xl 
                                bg-gradient-to-br from-white/5 to-white/10">
                    <img 
                      src={product.imageAddress} 
                      alt={product.name} 
                      className="w-full h-full object-contain transform group-hover:scale-110 
                               transition-transform duration-500 p-2"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  {/* Информация о товаре */}
                  <div className="space-y-3">
                    <div className="min-h-[2.5rem]">
                      <p className="text-sm text-white/80 line-clamp-2 group-hover:text-white transition-colors">
                        {product.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-white">
                          {product.price.toLocaleString()} ₽
                        </p>
                        <p className="text-xs text-white/50">
                          Артикул: {product.article}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                                   group-hover:bg-white/20 transition-all duration-500 
                                   group-hover:scale-110">
                        <svg className="w-5 h-5 text-white transform group-hover:translate-x-0.5 transition-transform" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Панель управления */}
      <div className="bg-white shadow-lg -mt-10 relative z-20 mx-4 rounded-xl">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Поиск */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию или артикулу..."
                className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg 
                         focus:border-black focus:ring-0 transition-colors"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Сортировка */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Сортировать:</span>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as typeof sortType)}
                className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-2 
                         focus:border-black focus:ring-0 transition-colors"
              >
                <option value="popular">По популярности</option>
                <option value="new">Сначала новые</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
              </select>
            </div>

            {/* Существующие элементы управления */}
            <div className="flex items-center space-x-4">
              {/* Вид отображения */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Количество на странице */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Показывать:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-2
                           focus:border-black focus:ring-0 transition-colors"
                >
                  {[16, 32, 48, 64].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-9xl mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Сайдбар с фильтрами */}
          <div className={`w-full lg:w-1/4 transition-all duration-300 ${
            showFilters ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full lg:hidden'
          }`}>
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl p-6">
              {/* Заголовок фильтров */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-black mb-2">Фильтры</h3>
                <p className="text-gray-500">Найдено {filteredProducts.length} товаров</p>
              </div>

              {/* Бренды */}
              <div className="space-y-6 divide-y divide-gray-100">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-black tracking-wide">БРЕНДЫ</h3>
                  <div className="space-y-1 max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
                    {brands.map((brand) => (
                      <label key={brand.name}
                        className="flex items-center p-3 rounded-xl hover:bg-gray-50 
                                 transition-all cursor-pointer group"
                      >
                        <input type="radio" name="brand" value={brand.name}
                          checked={selectedBrand.name === brand.name}
                          onChange={() => handleBrandChange(brand)}
                          className="w-5 h-5 border-2 border-gray-300 text-black focus:ring-0
                                   checked:border-black transition-colors"
                        />
                        <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-black">
                          {brand.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Категории */}
                <div className="pt-6 space-y-4">
                  <h3 className="text-xl font-bold text-black tracking-wide">КАТЕГОРИИ</h3>
                  <div className="space-y-1">
                    {selectedBrand.categories?.map((category) => (
                      <label key={category.searchName}
                        className="flex items-center p-3 rounded-xl hover:bg-gray-50 
                                 transition-all cursor-pointer group"
                      >
                        <input type="radio" name="category" value={category.searchName}
                          checked={selectedCategory.searchName === category.searchName}
                          onChange={() => handleCategoryChange(category)}
                          className="w-5 h-5 border-2 border-gray-300 text-black focus:ring-0
                                   checked:border-black transition-colors"
                        />
                        <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-black">
                          {category.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Цена */}
                <div className="pt-6 space-y-4">
                  <h3 className="text-xl font-bold text-black tracking-wide">ЦЕНА</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-1">
                        <input type="number" value={minPrice}
                          onChange={(e) => handlePriceChange(setMinPrice, Number(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50 border-2 text-black border-gray-200 rounded-xl
                                   focus:border-black focus:ring-0 transition-colors"
                          placeholder="От"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₽</span>
                      </div>
                      <div className="relative flex-1">
                        <input type="number" value={maxPrice}
                          onChange={(e) => handlePriceChange(setMaxPrice, Number(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50 border-2 text-black border-gray-200 rounded-xl
                                   focus:border-black focus:ring-0 transition-colors"
                          placeholder="До"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₽</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {setMinPrice(0); setMaxPrice(5000)}}
                        className="px-4 py-2 text-sm border-2 border-gray-200 rounded-xl hover:border-black
                                 transition-colors text-gray-700 hover:text-black"
                      >
                        До 5000 ₽
                      </button>
                      <button 
                        onClick={() => {setMinPrice(5000); setMaxPrice(10000)}}
                        className="px-4 py-2 text-sm border-2 border-gray-200 rounded-xl hover:border-black
                                 transition-colors text-gray-700 hover:text-black"
                      >
                        5000-10000 ₽
                      </button>
                    </div>
                  </div>
                </div>

                {/* Наличие */}
                <div className="pt-6 space-y-4">
                  <h3 className="text-xl font-bold text-black tracking-wide">НАЛИЧИЕ</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 rounded-xl hover:bg-gray-50 
                                   transition-all cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={showInStock}
                        onChange={(e) => setShowInStock(e.target.checked)}
                        className="w-5 h-5 border-2 border-gray-300 text-black rounded-lg
                                 focus:ring-0 checked:border-black transition-colors"
                      />
                      <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-black">
                        В наличии
                      </span>
                    </label>
                    <label className="flex items-center p-3 rounded-xl hover:bg-gray-50 
                                   transition-all cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={showOutOfStock}
                        onChange={(e) => setShowOutOfStock(e.target.checked)}
                        className="w-5 h-5 border-2 border-gray-300 text-black rounded-lg
                                 focus:ring-0 checked:border-black transition-colors"
                      />
                      <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-black">
                        Нет в наличии
                      </span>
                    </label>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="pt-6 space-y-3">
                  <button 
                    onClick={() => {
                      setMinPrice(10);
                      setMaxPrice(1000000);
                      setShowInStock(true);
                      setShowOutOfStock(true);
                    }}
                    className="w-full px-4 py-3 text-gray-700 border-2 border-gray-200 rounded-xl
                             hover:border-black hover:text-black transition-colors"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className={`flex-1 transition-all duration-300 ${
            showFilters ? 'lg:w-3/4' : 'w-full'
          }`}>
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-8">
              {/* Результаты поиска */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-xl font-semibold">
                  Найдено: {filteredProducts.length} товаров
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Страница {currentPage} из {totalPages}
                  </span>
                </div>
              </div>

              {/* Сетка товаров */}
              {isPageLoading ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <div key={index} 
                      className={`bg-white rounded-2xl p-4 shadow-md animate-pulse ${
                        viewMode === 'list' ? 'flex gap-4' : ''
                      }`}>
                      <div className="bg-gray-200 rounded-xl h-64 mb-4 flex-shrink-0"></div>
                      <div className="space-y-2 flex-grow">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <CatalogOfProducts 
                  products={filteredProducts} 
                  viewMode={viewMode}
                />
              )}

              {/* Пагинация */}
              {hasMoreProducts && !isPageLoading && (
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="group relative px-8 py-3 bg-black text-white rounded-lg overflow-hidden"
                  >
                    <span className="relative z-10 transition-transform group-hover:translate-y-[-2px]">
                      Показать еще {Math.min(itemsPerPage, totalProducts - products.length)} товаров
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </button>
                  <span className="text-sm text-gray-500">
                    Показано {products.length} из {totalProducts}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;

