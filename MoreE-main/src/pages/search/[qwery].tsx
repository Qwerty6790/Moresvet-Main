import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import Header from '@/components/Header';
import Pagination from '@/components/PaginationComponents';
import { ClipLoader } from 'react-spinners';
import { 
  Grid, 
  List, 
  X, 
  ChevronDown, 
  Sliders, 
  ArrowUpDown, 
  Check, 
  Search as SearchIcon 
} from 'lucide-react';

// Типы данных
type FiltersCount = {
  brands: Record<string, number>;
  categories: Record<string, number>;
  colors: Record<string, number>;
  materials: Record<string, number>;
};

const SearchResults: React.FC = () => {
  const router = useRouter();
  const { query } = router.query;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersCount, setFiltersCount] = useState<FiltersCount>({
    brands: {},
    categories: {},
    colors: {},
    materials: {},
  });
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Запрос к API
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search`, {
        params: {
            name: query,
            page: currentPage,
            pageSize: 32,
            sortBy: 'price',
            sortOrder: sortOrder || 'asc',
        },
      });
  
        // Обработка ответа
        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.totalProducts);
    
        if (response.data.filtersCount) {
          setFiltersCount(response.data.filtersCount);
        }
    } catch (error) {
        console.error('Ошибка при поиске:', error);
    } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [query, currentPage, sortOrder]);

  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId);
    setIsSortOpen(false);
    
    switch (sortId) {
      case 'priceAsc':
        setSortOrder('asc');
        break;
      case 'priceDesc':
        setSortOrder('desc');
        break;
      default:
        setSortOrder(null);
    }
  };

  // Добавляем функцию для определения заголовка категории
  const getCategoryTitle = (searchQuery: string | string[] | undefined): string => {
    if (!searchQuery) return 'Результаты поиска';
    
    return `Поиск: ${searchQuery}`;
  };

  return (
    <div className="min-h-screen bg-[#101010]">
      <Header />

      {/* Основной контейнер */}
      <div className="container  mx-auto px-4 mt-32">
        {/* Хлебные крошки */}
        <div className="flex items-center space-x-2 text-sm text-white mb-6 overflow-x-auto whitespace-nowrap">
          <a href="/" className="hover:text-[#633a3a]">Главная</a>
          <span>/</span>
          <a href="/catalog" className="hover:text-[#633a3a]">Каталог</a>
          <span>/</span>
          <span className="text-[#633a3a]">{getCategoryTitle(query)}</span>
        </div>

        {/* Заголовок с выпадающим меню */}
        <div className="flex items-center justify-between py-6">
          <button className="flex items-center text-xl md:text-2xl font-medium text-white">
            {getCategoryTitle(query)}
            <ChevronDown className="ml-2 w-5 h-5" />
          </button>
      </div>

        {/* Основной контент */}
        <div className="flex flex-col gap-8 pt-6">
          {/* Правая часть с фильтрами и товарами */}
          <div className="flex-1">
            {/* Верхняя панель с фильтрами */}
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
              

              <div className="flex items-center gap-4 md:gap-6">
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-white">Валюта:</span>
                  <select className="bg-transparent border-none text-white focus:outline-none">
                    <option>RUB</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-white text-sm md:text-base">{totalProducts} товаров</span>
                  <div className="flex items-center space-x-2 bg-[#633a3a] bg-opacity-20 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition ${
                        viewMode === 'grid' 
                          ? 'bg-[#633a3a] text-white shadow-sm' 
                          : 'text-white hover:text-[#633a3a]'
                      }`}
                    >
                      <Grid className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition ${
                        viewMode === 'list' 
                          ? 'bg-[#633a3a] text-white shadow-sm' 
                          : 'text-white hover:text-[#633a3a]'
                      }`}
                    >
                      <List className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Список товаров */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <ClipLoader size={50} color="#633a3a" />
              </div>
            ) : (
              <div>
                {products.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mb-6">
                      <SearchIcon size={48} className="mx-auto text-white" />
                    </div>
                    <h2 className="text-xl font-medium text-white mb-4">
                      По запросу "{query}" ничего не найдено
                    </h2>
                    <button
                      onClick={() => router.push('/')}
                      className="inline-flex items-center px-6 py-3 bg-[#633a3a] text-white rounded-lg hover:bg-[#633a3a]/80 transition"
                    >
                      Вернуться на главную
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <CatalogOfProductSearch products={products} viewMode={viewMode} />
                    </div>
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
