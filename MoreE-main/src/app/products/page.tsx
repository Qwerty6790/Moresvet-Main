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
      { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
      { label: 'Люстра', searchName: 'Люстра' },
      { label: 'Подвес', searchName: 'Подвес' }, 
      { label: 'Бра', searchName: 'Бра' },
      { label: 'Светильник', searchName: 'Светильник' },
      { label: 'Настольная лампа', href: '/Catalog', searchName: 'Настольная лампа' },
      { label: 'Торшер', href: '/web-1nashtange', searchName: 'Торшер' },
      { label: 'Светильник уличный', href: '/office-lamps', searchName: 'Светильник уличный' },
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

  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const getStockCount = (stock: any) => {
    // Replace this logic with how your stock is calculated
    return stock ? stock.count || 0 : 0;
  };
  
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const stockCount = getStockCount(product.stock);
      // Условие фильтрации:
      return (
        (showInStock && stockCount > 0) || // Показывать товары "в наличии", если включен флажок
        (showOutOfStock && stockCount === 0) // Показывать товары "не в наличии", если включен флажок
      );
    });
  }, [products, showInStock, showOutOfStock]);
  
  
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
    <div className="bg-white mt-52 min-h-screen">
    <div className="text-gray-500 text-sm p-4">
      <span className="font-medium">Главная</span> - Каталог
    </div>
  
    <div className="max-w-9xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 bg-white text-black p-6 space-y-4 top-0 shadow-md">
  {/* Brands */}
  <div className="space-y-4">
    <h3 className="text-2xl font-medium text-black">Бренды</h3>
    <div className="flex flex-col">
      {brands.map((brand) => (
        <label
          key={brand.name}
          className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <input
            type="checkbox"
            name="brand"
            value={brand.name}
            checked={selectedBrand.name === brand.name}
            onChange={() => handleBrandChange(brand)}
            className="size-5"
          />
          <span className="text-sm text-gray-800">{brand.name}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Categories */}
  <div className="space-y-4">
    <h3 className="text-2xl font-medium text-black">Категории</h3>
    <div className="flex flex-col gap-2">
      {selectedBrand.categories?.map((category) => (
        <label
          key={category.searchName}
          className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <input
            type="checkbox"
            name="category"
            value={category.searchName}
            onChange={() => handleCategoryChange(category)}
            className="size-5"
          />
          <span className="text-sm text-gray-800">{category.label}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Price Filters */}
  <div className="space-y-4">
    <h3 className="text-sm font-medium text-gray-600">Цена</h3>
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
      <input
        type="number"
        value={minPrice}
        onChange={(e) => handlePriceChange(setMinPrice, Number(e.target.value))}
        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm"
        placeholder="Мин."
        min="0"
        max="1000000"
      />
      <input
        type="number"
        value={maxPrice}
        onChange={(e) => handlePriceChange(setMaxPrice, Number(e.target.value))}
        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm"
        placeholder="Макс."
        min="0"
        max="1000000"
      />
    </div>
  </div>

  {/* Availability */}

</div>

  
        {/* Main Content */}
        <div className="flex w-full flex-col text-black space-y-6 pb-6">
          <h2 className="font-bold text-4xl md:text-6xl">
            Каталог {selectedCategory && `- ${selectedCategory.label}`}
          </h2>
  
          {/* Sort and Page Size */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Sort */}
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">Сортировать по:</label>
              <select
                className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm"
                value={sortOrder || ''}
                onChange={(e) =>
                  setSortOrder(e.target.value === 'asc' ? 'asc' : e.target.value === 'desc' ? 'desc' : null)
                }
              >
                <option value="">Выберите</option>
                <option value="asc">Цена: по возрастанию</option>
                <option value="desc">Цена: по убыванию</option>
              </select>
            </div>
  
            {/* Page Size */}
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">Товаров на странице:</label>
              <select
                className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm"
                value={products.length}
                onChange={(e) => setCurrentPage(1)}
              >
                {[8, 16, 32, 64].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
  
          {/* Product Grid */}
          {isPageLoading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(8)].map((_, index) => (
      <div
        key={index}
        className="w-[300px] p-3 h-[350px] bg-white rounded-lg animate-pulse shadow-xl"
      />
    ))}
  </div>
) : filteredProducts.length === 0 ? ( // Отображаем отфильтрованные товары
  <div className="flex items-center justify-center w-full text-center">
    <h2 className="text-3xl font-bold text-gray-500">Нет товаров для отображения</h2>
  </div>
) : (
  <CatalogOfProducts products={filteredProducts} />
)}

          {/* Show More Button */}
          {hasMoreProducts && !isPageLoading && (
            <div className="text-center mt-6">
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition duration-300"
              >
                Показать еще
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default Catalog;

