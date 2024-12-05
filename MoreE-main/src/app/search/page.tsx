'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ProductI } from '../../types/interfaces';
import { CatalogOfProducts } from '../../components/CatalogOfProducts';
import Pagination from '../../components/PaginationComponents';
import { ClipLoader } from 'react-spinners';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';

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

const brands: Brand[] = [
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
    name: 'KinkLight',
    categories: [
      { label: 'Люстра', href: '/Catalog', searchName: 'Люстра' },
      { label: 'Настольная лампа', href: '/Catalog', searchName: 'Настольная лампа' },
      { label: 'Кресло', href: '/Catalog', searchName: 'Кресло' },
      { label: 'Торшер', href: '/web-1nashtange', searchName: 'Торшер' },
      { label: 'Настенный Светильник', href: '/web-1podvesnoy', searchName: 'Настенный Светильник' },
      { label: 'Светильник уличный', href: '/office-lamps', searchName: 'Светильник уличный' },
      { label: 'Подвес', href: '/decorative-lamps', searchName: 'Подвес' },
      { label: 'Бра', href: '/decorative-lamps', searchName: 'Бра' },
      { label: 'Светильник', href: '/decorative-lamps', searchName: 'Светильник' },
      { label: 'Трековый светильник', href: '/decorative-lamps', searchName: 'трековый светильник' },
      { label: 'Настенный светильник', href: '/decorative-lamps', searchName: 'настенный светильник' },
      { label: 'Шнур с перекл', href: '/decorative-lamps', searchName: 'Шнур с перекл' },
    ],
  },
  {
    name: 'EksMarket',
    categories: [
      { label: 'Люстра', searchName: 'Люстра' },
      { label: 'Лампа', searchName: 'Лампа' },
      { label: 'Подвес', searchName: 'Подвес' }, 
      { label: 'Светильник', searchName: 'Светильник' },
      { label: 'Пульт', searchName: 'Пульт' },
      { label: 'Блок питания', searchName: 'Блок питания' },
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
    name: 'ElektroStandart',
    categories: [
      { label: 'Потолочный', searchName: 'Потолочный' },
      { label: 'Подвесной', searchName: 'Подвесной' },
      { label: 'Подвес', searchName: 'Подвес' }, 
      { label: 'Уличный светильник', searchName: 'Уличный светильник' },
      { label: 'Лампа', searchName: 'Лампа' },
      { label: 'Настольный', searchName: 'Настольный' },
      { label: 'Лента', searchName: 'Лента' },
      { label: 'Неон', searchName: 'Неон' },
      { label: 'Настенный', searchName: 'Настенный' },
      { label: 'Датчик', searchName: 'Датчик' },
      { label: 'Ландшафт', searchName: 'Ландшафт' },
    ],
  },
  {
    name: 'Denkirs',
    categories: [
      { label: 'Светильник', searchName: 'Светильник' },
      { label: 'Подвесной светильник', searchName: 'Подвесной светильник' },
      { label: 'Бра', searchName: 'Бра' },
      { label: 'Уличный светильник', searchName: 'Уличный светильник' },
      { label: 'Встраиваемый', searchName: 'Встраиваемый' },
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

const Search: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<Brand>(brands[0]);
  const [products, setProducts] = useState<ProductI[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>(selectedBrand.categories[0]);
  const [minPrice, setMinPrice] = useState<number>(10);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [showBrandDropdown, setShowBrandDropdown] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  const brandDropdownRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async (page: number, name: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${selectedBrand.name}`, {
        params: { page, limit: 12, name: searchTerm, minPrice, maxPrice },
      });
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm !== '') {
      fetchProducts(currentPage, selectedCategory.searchName);
    } else {
      setProducts([]);
      setTotalPages(1);  // Reset pagination when there's no search term
    }
  }, [currentPage, selectedCategory, minPrice, maxPrice, selectedBrand, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-black via-black to-black py-32 min-h-screen">
  <Toaster position="top-center" richColors />

  {/* Заголовок страницы */}
  <div className="w-full text-center mb-12 px-4">
    <h1 className="text-5xl lg:text-6xl font-extrabold text-white">Поиск</h1>
    <p className="text-lg lg:text-2xl text-gray-300 mt-4">
      Найдите лучшие товары, выбрав бренд и используя поиск.
    </p>
  </div>

  {/* Поле поиска */}
  <div className="mb-12 w-full px-4">
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        className="bg-black text-white text-lg py-3 pl-14 pr-4 rounded-full shadow-lg w-full border-2 border-white focus:border-gray-500 focus:outline-none"
        placeholder="Поиск товаров..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <SearchIcon
        className="absolute top-1/2 left-5 transform -translate-y-1/2 text-gray-400"
        size={24}
      />
    </div>
  </div>

  {/* Основное содержимое */}
  <div className="flex flex-col lg:flex-row w-full items-start justify-between px-4 lg:px-10">
    {/* Сайдбар */}
    <div className="w-full lg:w-1/4 bg-black rounded-xl shadow-lg p-6 mb-8 lg:mb-0">
      <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">Фильтры</h2>
      <p className="text-gray-400 text-base lg:text-lg mb-6">
        Выберите бренд, чтобы найти подходящие товары.
      </p>

      {/* Бренды */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowBrandDropdown((prev) => !prev)}
          className="bg-neutral-900 text-lg text-white py-3 px-4 rounded-lg shadow-lg w-full flex justify-between items-center hover:bg-neutral-800"
        >
          {selectedBrand.name}
          <ChevronDownIcon size={20} />
        </button>
        <AnimatePresence>
          {showBrandDropdown && (
            <motion.div
              className="absolute z-10 w-full bg-black text-white shadow-lg rounded-lg mt-2 max-h-64 overflow-y-auto border border-gray-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              ref={brandDropdownRef}
            >
              {brands.map((brand) => (
                <button
                  key={brand.name}
                  className="block w-full px-4 py-3 text-left hover:bg-neutral-700 border-b last:border-b-0 border-gray-700"
                  onClick={() => {
                    setSelectedBrand(brand);
                    setSelectedCategory(brand.categories[0]);
                    setShowBrandDropdown(false);
                  }}
                >
                  {brand.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Мотивационная фраза */}
      <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 text-center py-6 px-4 rounded-lg shadow-md text-white">
        <p className="text-xl font-semibold">
          Используйте фильтры для быстрого поиска!
        </p>
      </div>
    </div>

    {/* Секция товаров */}
    <div className="w-full lg:w-3/4">
      {searchTerm ? (
        <div className="grid grid-cols-1 sm:grid-cols- md:grid-cols-1 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center">
              <ClipLoader size={60} color="#fff" />
            </div>
          ) : (
            <CatalogOfProducts products={products} />
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400 text-lg lg:text-xl">
          Пожалуйста, введите запрос для поиска товаров.
        </div>
      )}

      {/* Пагинация */}
      {searchTerm && (
        <div className="mt-10  flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  </div>
</div>

  );
};

export default Search;
