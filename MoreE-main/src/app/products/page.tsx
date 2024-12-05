'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Toaster } from 'sonner';
import { ChevronDown, Search, SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; // Importing axios
import { ProductI } from '../../types/interfaces';
import { CatalogOfProducts } from '../../components/CatalogOfProducts';
import Pagination from '../../components/PaginationComponents';
import { ClipLoader } from 'react-spinners';
import Skeleton from 'react-loading-skeleton';
type Category = {
  label: string;
  href?: string;
  searchName: string;
};

type Brand = {
  name: string;
  categories: Category[];
  collection?: string;
};



// Brands and categories data
const brands: Brand[] = [

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
    name: 'LightStar',
    categories: [
      { label: 'Люстра', searchName: 'Люстра' },
      { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
      { label: 'Подвес', searchName: 'Подвес' }, 
      { label: 'Бра', searchName: 'Бра' },
      { label: 'Светильник', searchName: 'Светильник' },
      { label: 'Настольная лампа', href: '/Catalog', searchName: 'Настольная лампа' },
      { label: 'Торшер', href: '/web-1nashtange', searchName: 'Торшер' },
      { label: 'Светильник уличный', href: '/office-lamps', searchName: 'Светильник уличный' },
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>(selectedBrand.categories[0]);
  const [minPrice, setMinPrice] = useState<number>(10);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false); // индикатор загрузки
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false); 
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true); // Есть ли еще товары для загрузки // Индикатор загрузки новых товаровСсылка на блок для отслеживания прокрутки
  const limit = 12;
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Прокрутка страницы вверх при смене страницы
  useEffect(() => {
    // Отключаем прокрутку наверх при смене страницы
  }, []);
  
  const fetchProducts = async (page: number, name: string) => {
    setIsLoadingMore(true); // Включаем локальный спиннер
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${selectedBrand.name}`, {
        params: {
          page,
          limit: 14,
          name,
          minPrice,
          maxPrice,
        },
      });

      
  
      if (page === 1) {
        setProducts(res.data.products); // Перезаписываем товары при первой загрузке
      } else {
        setProducts((prevProducts) => [...prevProducts, ...res.data.products]); // Добавляем товары при подгрузке
      }
  
      setTotalPages(res.data.totalPages);
      setTotalProducts(res.data.totalProducts);
  
      // Определяем, есть ли еще товары для подгрузки
      if (page >= res.data.totalPages) {
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error("Ошибка при загрузке продуктов:", error);
    } finally {
      setIsLoadingMore(false); // Выключаем локальный спиннер
      setIsPageLoading(false); // Выключаем глобальный спиннер
    }
  };

  useEffect(() => {
    if (sortOrder) {
      const sortedProducts = [...products].sort((a, b) => {
        if (sortOrder === "asc") {
          return a.price - b.price; // Сортировка по возрастанию
        } else {
          return b.price - a.price; // Сортировка по убыванию
        }
      });
      setProducts(sortedProducts); // Обновляем отсортированные продукты
    }
  }, [sortOrder]);
  
  // Функция для подгрузки товаров
  const loadMoreProducts = () => {
    if (!isLoadingMore && hasMoreProducts) {
      setCurrentPage((prevPage) => prevPage + 1); // Увеличиваем номер страницы
    }
  };
  
  // Обновление категории
  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Сбрасываем страницу на первую
    setShowCategoryDropdown(false);
    setHasMoreProducts(true); // Разрешаем подгрузку
  };
  
  // Обновление бренда
  const handleBrandChange = (brand: Brand) => {
    setSelectedBrand(brand);
    setSelectedCategory(brand.categories[0]);
    setCurrentPage(1); // Сбрасываем страницу на первую
    setShowBrandDropdown(false);
    setHasMoreProducts(true); // Разрешаем подгрузку
  };
  
  const handlePriceChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    setter(value);
    setCurrentPage(1); // Сбрасываем страницу на первую при изменении цены
    setHasMoreProducts(true); // Разрешаем подгрузку
  };
  
  // Используем useEffect для подгрузки товаров
  useEffect(() => {
    fetchProducts(currentPage, selectedCategory.searchName);
  }, [currentPage, selectedCategory, minPrice, maxPrice, selectedBrand]);
  
  // Закрытие выпадающих меню при клике снаружи
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handlePageChange = (page: number) => setCurrentPage(page); 

  useEffect(() => {
    setIsPageLoading(true); // Включение загрузки
    const timeout = setTimeout(() => {
      setIsPageLoading(false); // Выключение загрузки
    }, 2000); // Имитируем 2-секундную загрузку

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
    {/* Global Spinner */}
    {isPageLoading && (
      <div className="fixed inset-0 flex items-center justify-center bg-white text-black bg-opacity-75 z-50">
        <ClipLoader color="#ffffff" loading={isPageLoading} size={100} />
      </div>
    )}
  
    <div
      className={`flex flex-col items-center min-h-screen overflow-x-hidden ${
        isPageLoading ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <Toaster position="top-center" richColors />
  
      {/* Main Container */}
      <div className="w-full max-w-screen-xl px-6 py-44 ">
        {/* Filters and Categories Layout */}
        <div className="flex flex-col p-10 md:flex-row gap-6">
          {/* Categories Section */}
          <div className="w-full md:w-2/3 py-12 mt-20 flex flex-wrap gap-8">
            <h2 className="text-5xl font-bold text-gray-800 mb-8">Каталог товаров</h2>
            <div className="flex flex-wrap gap-6 w-full group">
              {selectedBrand.categories?.map((category) => (
                <div
                  key={category.searchName}
                  className="cursor-pointer hover:bg-gray-200 p-4 rounded-lg text-black transition-transform duration-300 transform hover:scale-105"
                  onClick={() => handleCategoryChange(category)}
                >
                  <span className="text-lg font-semibold">{category.label}</span>
                </div>
              ))}
            </div>
          </div>
  
          {/* Filters Section */}
          <div className="w-full md:w-1/3 bg-white mt-16 md:mt-0 text-black p-6 rounded-lg shadow-xl space-y-6 sticky top-20">
            <h2 className="text-3xl font-semibold mb-4">Фильтры</h2>
  
            {/* Brands (Radio buttons) */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Бренды</h3>
              <div className="flex flex-wrap gap-6">
                {brands.map((brand) => (
                  <label
                    key={brand.name}
                    className="flex items-center space-x-2 cursor-pointer p-4 rounded-lg border hover:bg-gray-100 transition-all duration-200"
                  >
                    <input
                      type="radio"
                      name="brand"
                      value={brand.name}
                      checked={selectedBrand.name === brand.name}
                      onChange={() => handleBrandChange(brand)}
                      className="form-radio text-blue-600"
                    />
                    <span className="text-sm text-gray-800">{brand.name}</span>
                  </label>
                ))}
              </div>
            </div>
  
            {/* Price Filters */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Цена</h3>
              <div className="flex space-x-4">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => handlePriceChange(setMinPrice, Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-100 border rounded-lg text-sm"
                  placeholder="Мин."
                  min="0"
                  max="1000000"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange(setMaxPrice, Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-100 border rounded-lg text-sm"
                  placeholder="Макс."
                  min="0"
                  max="1000000"
                />
              </div>
              <div className="w-full mt-4">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Диапазон цен:</label>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="1000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full cursor-pointer focus:outline-none transition duration-300"
                />
                <div className="flex justify-between text-xs text-black mt-1">
                  <span>{minPrice}</span>
                  <span>{maxPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Product List */}
        <div className="flex flex-col space-y-6 pb-6">
          {/* Product Grid */}
          {isPageLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="w-[300px] h-[350px] bg-white rounded-lg animate-pulse shadow-xl"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center w-full text-center">
              <h2 className="text-3xl font-bold text-gray-500">Нет товаров для отображения</h2>
            </div>
          ) : (
            <CatalogOfProducts products={products} />
          )}
  
          {/* Show More Button */}
          {isPageLoading ? (
            <div className="w-full text-center mt-6">
              <div className="w-[200px] h-[50px] bg-neutral-800 rounded-md animate-pulse mx-auto" />
            </div>
          ) : (
            hasMoreProducts && !isLoadingMore && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMoreProducts}
                  className="bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition duration-300"
                >
                  Показать еще
                </button>
              </div>
            )
          )}
  
          {/* Loading Spinner */}
          {isLoadingMore && (
            <div className="flex justify-center mt-6">
              <ClipLoader color="#ffffff" loading={isLoadingMore} size={30} />
            </div>
          )}
        </div>
  
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            handlePageChange(page);
            window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll up
          }}
        />
      </div>
    </div>
  </>
  

  
  );
};

export default Catalog;