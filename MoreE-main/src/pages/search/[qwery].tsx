import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import Header from '@/components/Header';
import Menu from '@/components/Menu';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string[]}>( {
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
          sortOrder: sortOrder || 'asc',
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

  // Добавляем функцию для определения заголовка категории
  const getCategoryTitle = (searchQuery: string | string[] | undefined): string => {
    if (!searchQuery) return 'Все товары';
    
    const query = searchQuery.toString().toLowerCase();
    
    // Маппинг поисковых запросов на заголовки категорий
    const categoryMap: { [key: string]: string } = {
      'люстра': 'Потолочные люстры',
      'потолочная люстра': 'Потолочные люстры',
      'подвесная люстра': 'Подвесные люстры',
      'бра': 'Настенные светильники',
      'светильник': 'Декоративные светильники',
      'настенный': 'Настенные светильники',
      'потолочный': 'Потолочные светильники',
      'торшер': 'Напольные светильники',
      'настольная лампа': 'Настольные светильники',
      'трековый': 'Трековые системы',
      'подсветка': 'Декоративная подсветка'
    };

    // Поиск соответствующей категории
    const category = Object.entries(categoryMap).find(([key]) => query.includes(key));
    return category ? category[1] : 'Все товары';
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <Menu />

      {/* Основной контейнер */}
      <div className="container mx-auto px-4 mt-32">
        {/* Хлебные крошки */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-gray-900">Главная</a>
          <span>/</span>
          <a href="/catalog" className="hover:text-gray-900">Каталог</a>
          <span>/</span>
          <span className="text-gray-900">{getCategoryTitle(query)}</span>
        </div>

        {/* Заголовок с выпадающим меню */}
        <div className="flex items-center justify-between py-6">
          <button className="flex items-center text-2xl font-medium text-gray-900">
            {getCategoryTitle(query)}
            <ChevronDown className="ml-2 w-5 h-5" />
          </button>
      </div>

        {/* Основной контент */}
        <div className="flex gap-8 pt-6">
          {/* Левое меню категорий */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-3">
              <a href="/catalog/Люстры" className="block text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                Люстры
              </a>
              <a href="/catalog/Подвесные-светильники" className="block text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                Подвесные светильники
              </a>
              <a href="/catalog/Потолочные-светильники" className="block text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                Потолочные светильники
              </a>
              <a href="/catalog/Настенные-светильники" className="block text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                Настенные светильники (Бра)
              </a>
              <a href="/catalog/Напольные-светильники" className="block text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                Напольные светильники
              </a>
              <a href="/catalog/Настольные-светильники" className="block text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                Настольные светильники
              </a>
              <a href="/catalog/Трековые-системы" className="block text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                Трековые системы
              </a>
              <a href="/catalog/Встраиваемые-светильники" className="block text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                Встраиваемые светильники
              </a>
              <a href="/catalog/Декоративная-подсветка" className="block text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
                Декоративная подсветка
              </a>
            </nav>
      </div>

          {/* Правая часть с фильтрами и товарами */}
          <div className="flex-1">
            {/* Верхняя панель с фильтрами */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsFilterOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <Sliders className="w-5 h-5" />
                  <span>Фильтры</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="ml-2 bg-white text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {getActiveFiltersCount()}
                    </span>
                  )}
            </button>
                <button className="text-gray-600 hover:text-gray-900 transition">Новинки</button>
                <button className="text-gray-600 hover:text-gray-900 transition">Акции</button>
                <button className="text-gray-600 hover:text-gray-900 transition">По цене</button>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Валюта:</span>
                  <select className="bg-transparent border-none text-gray-900 focus:outline-none">
                    <option>RUB</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">{totalProducts} товаров</span>
                  <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition ${
                        viewMode === 'grid' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition ${
                        viewMode === 'list' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

            {/* Список товаров */}
            {loading ? (
          <div className="flex justify-center items-center h-64">
                <ClipLoader size={50} color="#000000" />
          </div>
        ) : (
              <div>
                {products.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mb-6">
                      <SearchIcon size={48} className="mx-auto text-gray-400" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 mb-4">
                      По запросу "{query}" ничего не найдено
                    </h2>
            <button
                      onClick={() => router.push('/')}
                      className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
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

      {/* Мобильная панель фильтров */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity z-50 ${
        isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isFilterOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-medium text-gray-900">Фильтры</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Фильтры */}
            <div className="space-y-8">
              {Object.entries(filterOptions).map(([category, options]) => (
                <div key={category} className="pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {options.map(option => (
                      <label key={option} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <input
                          type="checkbox"
                          checked={selectedFilters[category].includes(option)}
                          onChange={() => handleFilterChange(category, option)}
                          className="form-checkbox h-5 w-5 text-gray-900 rounded border-gray-300"
                        />
                        <span className="ml-3 text-sm">{option}</span>
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
                className="w-full py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition duration-200"
              >
                Сбросить все фильтры
              </button>
            <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-3 text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition duration-200"
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
