import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import Header from '@/components/Header';
import Menu from '@/components/Menu';
import Pagination from '@/components/PaginationComponents';
import { ClipLoader } from 'react-spinners';
import { Grid, List, X, ChevronDown, Sliders, ArrowUpDown, Check, Search as SearchIcon } from 'lucide-react';

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string[]}>({
    'Тип цоколя': [],
    'Степень защиты': [],
    'Место применения': [],
    'Стиль': [],
    'Цвет': [],
    'Форма': [],
    'Материал': [],
  });
  const [showFiltered, setShowFiltered] = useState(false);

  const sortOptions = [
    { id: 'popular', label: 'По популярности' },
    { id: 'priceAsc', label: 'Сначала дешевые' },
    { id: 'priceDesc', label: 'Сначала дорогие' },
    { id: 'new', label: 'По новизне' },
    { id: 'rating', label: 'По рейтингу' },
  ];

  const filterOptions = {
    'Тип цоколя': ['E14', 'E27', 'G4', 'G9', 'GU10', 'GX53', 'MR16', 'LED'],
    'Степень защиты': ['IP20', 'IP44', 'IP54', 'IP65', 'IP67'],
    'Место применения': [
      'Для дома',
      'Для улицы',
      'Для офиса',
      'Для магазина',
      'Для кафе и ресторанов',
      'Для промышленных помещений',
      'Для ванной',
      'Для кухни'
    ],
    'Стиль': [
      'Современный',
      'Классический',
      'Лофт',
      'Минимализм',
      'Хай-тек',
      'Скандинавский',
      'Арт-деко',
      'Индустриальный',
      'Эко-стиль',
      'Винтаж'
    ],
    'Цвет': [
      'Белый',
      'Черный',
      'Золотой',
      'Серебряный',
      'Бронзовый',
      'Мультиколор',
      'Хром',
      'Медный',
      'Прозрачный',
      'Матовый'
    ],
    'Форма': [
      'Круглая',
      'Квадратная',
      'Прямоугольная',
      'Овальная',
      'Многоугольная',
      'Линейная',
      'Каскадная',
      'Абстрактная'
    ],
    'Материал': [
      'Металл',
      'Стекло',
      'Пластик',
      'Хрусталь',
      'Дерево',
      'Алюминий',
      'Акрил',
      'Латунь',
      'Керамика'
    ]
  };

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Фильтруем активные фильтры
        const activeFilters = Object.entries(selectedFilters)
          .filter(([_, values]) => values.length > 0)
          .reduce((acc, [key, values]) => {
            acc[key.toLowerCase()] = values;
            return acc;
          }, {} as Record<string, string[]>);
    
        // Запрос к API
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search`, {
          params: {
            name: query,
            page: currentPage,
            pageSize: 32,
            sortBy: 'price',
            sortOrder: sortOrder || 'asc',  // Убедитесь, что sortOrder может быть undefined
            filters: JSON.stringify(activeFilters),
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
  }, [query, currentPage, sortOrder, selectedFilters]);

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

  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter(v => v !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      return updated;
    });
    setShowFiltered(true);
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      'Тип цоколя': [],
      'Степень защиты': [],
      'Место применения': [],
      'Стиль': [],
      'Цвет': [],
      'Форма': [],
      'Материал': [],
    });
    setShowFiltered(false);
    setSortOrder(null);
    setSelectedSort('popular');
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce((acc, curr) => acc + curr.length, 0);
  };

  return (
    <div className="min-h-screen relative">
      <Header />
      <Menu />

      {/* Hero section */}
      <div className="relative  text-black py-10 mt-40">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0  to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-black mb-6">
            <a href="/" className="hover:text-white transition-colors">MoreElecriki.ru</a>
            <span className="mx-2">/</span>
            <span className="text-black">Главная</span>
          </div>

          <div className="flex items-center gap-4">
            <SearchIcon size={36} className="text-gray-400" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Результаты поиска</h1>
              <p className="text-gray-300 text-lg">
                По запросу "{query}" {totalProducts > 0 ? `найдено ${totalProducts} товаров` : 'ничего не найдено'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и сортировка */}
      <div className="sticky top-[80px] bg-white z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 duration-200 shadow-md"
              >
                <Sliders className="w-5 h-5 mr-2" />
                <span>Фильтры</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="ml-2 bg-white text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center px-6 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200"
                >
                  <ArrowUpDown className="w-5 h-5 mr-2" />
                  <span className="font-medium">{sortOptions.find(opt => opt.id === selectedSort)?.label}</span>
                  <ChevronDown className="w-5 h-5 ml-2" />
                </button>

                {isSortOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl">
                    {sortOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => handleSortChange(option.id)}
                        className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        {selectedSort === option.id && (
                          <Check className="w-5 h-5 mr-2 text-blue-500" />
                        )}
                        <span className={selectedSort === option.id ? "text-blue-500 font-medium" : ""}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-gray-600 font-medium">
                {showFiltered ? `Найдено ${totalProducts} товаров` : `${totalProducts} товаров`}
              </span>
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <ClipLoader size={50} color="#000000" />
          </div>
        ) : (
          <div>
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-4">
                  <SearchIcon size={48} className="mx-auto text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">По вашему запросу ничего не найдено</h2>
                <p className="text-gray-600 mb-8">Попробуйте изменить параметры поиска или сформулировать запрос иначе</p>
                <button 
                  onClick={() => router.push('/')}
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 duration-200 shadow-md"
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

      {/* Мобильная панель фильтров */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity z-50 ${
        isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isFilterOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Фильтры</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Фильтры */}
            <div className="space-y-8">
              {Object.entries(filterOptions).map(([category, options]) => (
                <div key={category} className="pb-6">
                  <h3 className="text-lg font-semibold mb-4">{category}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {options.map(option => (
                      <label key={option} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters[category].includes(option)}
                          onChange={() => handleFilterChange(category, option)}
                          className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-300"
                        />
                        <span className="ml-3 text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Кнопки действий */}
            <div className="sticky bottom-0 bg-white pt-4 pb-6 space-y-4">
              <button
                onClick={handleResetFilters}
                className="w-full py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Сбросить все фильтры
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-3 text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Показать {totalProducts} товаров
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;