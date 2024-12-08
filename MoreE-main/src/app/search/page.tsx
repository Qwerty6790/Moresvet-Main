'use client';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import axios from 'axios';
import { ProductI } from '../../types/interfaces';
import { CatalogOfProducts } from '../../components/CatalogOfProducts';
import Pagination from '../../components/PaginationComponents';
import { ClipLoader } from 'react-spinners';
import { SearchIcon } from 'lucide-react';

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
 

const Search: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<Brand>(brands[0]);
  const [products, setProducts] = useState<ProductI[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>(selectedBrand.categories[0]);
  const [minPrice, setMinPrice] = useState<number>(10);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const fetchProducts = async (page: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${selectedBrand.name}`, {
        params: {
          page,
          limit: 100,
          name: searchTerm,
          minPrice,
          maxPrice,
          categories: selectedCategories.join(','),
        },
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
      fetchProducts(currentPage);
    } else {
      setProducts([]);
      setTotalPages(1);
    }
  }, [currentPage, selectedCategory, minPrice, maxPrice, selectedBrand, searchTerm, selectedCategories]);

  return (
    <div className="flex flex-col items-center bg-gradient-to-b bg-white py-32 min-h-screen">
    <Toaster position="top-center" richColors />
  
    {/* Page Header */}
    <div className="w-full text-center mb-12 px-4">
      <h1 className="text-5xl lg:text-6xl font-extrabold text-black">
        Найдите лучшее c системой поиска 2.0
      </h1>
      <p className="text-lg lg:text-2xl text-black mt-4">
        Выбирайте из популярных брендов и фильтруйте товары.
      </p>
    </div>
  
    {/* Search Field */}
    <div className="mb-12 w-full px-4">
      <div className="relative w-full max-w-2xl mx-auto">
        <input
          type="text"
          className="bg-white text-black text-lg py-3 pl-14 pr-4 rounded-full shadow-xl w-full border-2 border-gray-600 focus:ring-4 focus:ring-gray-500 focus:border-gray-500 transition"
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
  
    {/* Main Content */}
    <div className="flex flex-col lg:flex-row w-full items-start justify-between px-4 lg:px-10 gap-8">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-black mb-6">
          Поиск по бренду
        </h2>
        <p className="text-black text-lg mb-8">
          Выберите бренд для персонализированного поиска.
        </p>
  
        {/* Brand Pyramid */}
        <div className="flex flex-col items-center  text-center space-y-4">
          {brands.map((brand, index) => (
            <div
              key={brand.name}
              className={`text-lg lg:text-xl font-medium border rounded-full p-2 cursor-pointer transition ${
                selectedBrand.name === brand.name
                  ? "text-blue-600 font-bold"
                  : "text-gray-800 hover:text-blue-600"
              } ${
                index % 2 === 0 ? "self-start" : "self-end"
              }`}
              onClick={() => {
                setSelectedBrand(brand);
                setSelectedCategory(brand.categories[0]);
              }}
            >
              {brand.name}
            </div>
          ))}
        </div>
      </div>
  
      {/* Product Listings */}
      <div className="w-full lg:w-3/4 bg-white rounded-2xl  p-8">
        {loading ? (
          <div className="flex justify-center">
            <ClipLoader color="#2563EB" size={50} />
          </div>
        ) : (
          <CatalogOfProducts products={products} />
        )}
      </div>
    </div>
  </div>
  
  

  );
};

export default Search;
