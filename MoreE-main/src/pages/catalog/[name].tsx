import React, { useEffect, useState, useRef } from 'react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { ProductI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import { CatalogOfProducts } from '@/components/CatalogOfProducts';
import Pagination from '@/components/PaginationComponents';
import { Grid, List, X, Search, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Head from 'next/head';

// Определяем типы для категорий и брендов
export type Category = {
  label: string;
  searchName: string;
  href?: string;
  aliases?: string[];
};

export type Brand = {
  name: string;
  categories: Category[];
};

// Массив брендов с категориями
const brands: Brand[] = [
  {
    name: 'Все товары',
    categories: [{ label: 'Все товары', searchName: 'Все товары' }],
  },
  {
    name: 'Favourite',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
      { label: 'Потолочный Светильник', searchName: 'Потолочный Светильник' },
      { label: 'Трековый светильник', href: '/decorative-lamps', searchName: 'трековый светильник' },
      { label: 'Врезной Светильник', searchName: 'Врезной Светильник' },
      { label: 'Настенный Светильник', searchName: 'Настенный Светильник' },
      {
        label: 'Люстры потолочные',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Напольный Светильник', searchName: 'Напольный Светильник' },
      { label: 'Настольный Светильник', searchName: 'Настольный Светильник' },
      { label: 'Подвес', searchName: 'Подвес' },
      { label: 'Уличный светильник', searchName: 'Уличный светильник' },
    ],
  },
  {
    name: 'Maytoni',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Подвесные светильники', searchName: 'Подвесной светильник' },
      {
        label: 'Люстры потолочные',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Бра', searchName: 'Бра ' },
      { label: 'Светильники', searchName: 'Светильник' },
      { label: 'Подвесная люстра', searchName: 'Подвесная люстра' },
      { label: 'Настольные лампы', href: '/Catalog', searchName: 'Настольная лампа' },
      { label: 'Торшеры', href: '/web-1nashtange', searchName: 'Торшер' },
      { label: 'Соединители', href: '/web-1nashtange', searchName: 'Соединитель' },
      { label: 'Светильники уличный', href: '/office-lamps', searchName: 'Светильник уличный' },
    ],
  },
  {
    name: 'ElektroStandard',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
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
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Подвесные светильники', searchName: 'Подвесной светильник' },
      { label: 'Бра', searchName: 'Бра ' },
      { label: 'Светильник', searchName: 'Светильник' },
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
  {
    name: 'KinkLight',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      { label: 'Настольная лампа', href: '/Catalog', searchName: 'Настольная лампа' },
      { label: 'Люстра', href: '/Catalog', searchName: 'Люстра' },
      { label: 'Кресло', href: '/Catalog', searchName: 'Кресло' },
      { label: 'Торшер', href: '/web-1nashtange', searchName: 'Торшер' },
      {
        label: 'Люстры потолочные',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
      { label: 'Настенный Светильник', href: '/web-1podvesnoy', searchName: 'Настенный Светильник' },
      { label: 'Светильник уличный', href: '/office-lamps', searchName: 'Светильник уличный' },
      { label: 'Подвес', href: '/decorative-lamps', searchName: 'Подвес' },
      { label: 'Бра', href: '/decorative-lamps', searchName: 'Бра' },
      { label: 'Светильник', href: '/decorative-lamps', searchName: 'Светильник' },
      { label: 'Трековый светильник', href: '/decorative-lamps', searchName: 'трековый светильник' },
    ],
  },
  {
    name: 'Stluce',
    categories: [
      { label: 'Все товары', searchName: 'Все товары' },
      {
        label: 'Люстры потолочные',
        searchName: 'Люстра',
        aliases: ['Потолочная люстра'],
      },
    ],
  },
];

interface CatalogProps {
  initialBrand: Brand;
  initialCategory: Category;
  initialProducts: ProductI[];
  initialTotalPages: number;
  initialTotalProducts: number;
}

const Catalog: NextPage<CatalogProps> = ({
  initialBrand,
  initialCategory,
  initialProducts,
  initialTotalPages,
  initialTotalProducts,
}) => {
  // Состояния компонента
  const [selectedBrand, setSelectedBrand] = useState<Brand>(initialBrand);
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [products, setProducts] = useState<ProductI[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [totalProducts, setTotalProducts] = useState<number>(initialTotalProducts);
  const [minPrice, setMinPrice] = useState<number>(10);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [allLoadedProducts, setAllLoadedProducts] = useState<ProductI[]>(initialProducts);
  const limit = 32;
  const router = useRouter();
  const { name: urlName } = router.query;
  const productsContainerRef = useRef<HTMLDivElement>(null);

  // Функция для получения товаров (при изменении фильтров или страницы)
  const fetchProducts = async (page: number, append: boolean = false) => {
    if (!append) {
      setIsPageLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    // Если введён поисковый запрос – отключаем фильтрацию по категории
    const categoryFilter =
      !searchQuery && selectedCategory.label !== 'Все товары'
        ? selectedCategory.searchName
        : '';
    // Если есть поисковый запрос, источник (бренд) не передаём, чтобы искать по всем брендам
    const sourceParam =
      searchQuery || selectedBrand.name === 'Все товары' ? '' : selectedBrand.name;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${selectedBrand.name}`,
        {
          params: {
            page,
            limit,
            search: searchQuery,
            searchField: 'title',
            name: categoryFilter,
            source: sourceParam,
            color: selectedColor,
            material: selectedMaterial,
            minPrice,
            maxPrice,
            rating: selectedRating,
            available: onlyAvailable,
            sortBy: 'price',
            sortOrder: sortOrder || 'asc',
          },
        }
      );
      
      if (append) {
        setAllLoadedProducts(prev => [...prev, ...data.products]);
      } else {
        setAllLoadedProducts(data.products);
        setProducts(data.products);
      }
      
      setTotalPages(data.totalPages);
      setTotalProducts(data.totalProducts);
    } catch (error) {
      console.error('Ошибка при получении продуктов:', error);
      setError('Ошибка при получении продуктов. Попробуйте снова.');
    } finally {
      if (!append) {
        setIsPageLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // Запрос новых данных при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
  }, [
    selectedBrand.name,
    selectedCategory.label,
    minPrice,
    maxPrice,
    selectedColor,
    selectedMaterial,
    selectedRating,
    onlyAvailable,
    sortOrder,
    searchQuery,
  ]);

  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, true);
    
    // Плавная прокрутка к началу списка товаров
    if (productsContainerRef.current) {
      productsContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Обработчик кнопки "Показать еще"
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  // При изменении URL определяем выбранную категорию/бренд или, если нет точного совпадения – выполняем глобальный поиск
  useEffect(() => {
    if (!router.isReady) return;
    if (urlName) {
      const categoryName = decodeURIComponent(urlName as string).trim().toLowerCase();

      // Поиск совпадений категории во всех брендах
      let foundCategory: Category | undefined;
      let foundBrands: Brand[] = [];

      brands.forEach(brand => {
        const category = brand.categories.find(c =>
          c.label.trim().toLowerCase() === categoryName ||
          c.searchName.trim().toLowerCase() === categoryName ||
          (c.aliases && c.aliases.some(alias => alias.toLowerCase() === categoryName))
        );
        if (category) {
          foundCategory = category;
          foundBrands.push(brand);
        }
      });

      if (foundCategory) {
        if (foundBrands.length > 1 || foundBrands[0].name !== 'Все товары') {
          // Если категория найдена в нескольких брендах, выбираем "Все товары"
          const globalBrand = brands.find(b => b.name === 'Все товары');
          if (globalBrand) {
            setSelectedBrand(globalBrand);
            setSelectedCategory(foundCategory);
            setSearchQuery('');
          }
        } else {
          // Если категория найдена в одном бренде
          setSelectedBrand(foundBrands[0]);
          setSelectedCategory(foundCategory);
          setSearchQuery('');
        }
      } else {
        // Если точное совпадение не найдено – выполняем глобальный поиск по имени товара
        const globalBrand = brands.find(b => b.name === 'Все товары');
        if (globalBrand) {
          setSelectedBrand(globalBrand);
          setSelectedCategory(globalBrand.categories[0]);
        }
        setSearchQuery(urlName as string);
      }
      setCurrentPage(1);
    }
  }, [router.isReady, urlName]);

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    router.push(`/catalog/${encodeURIComponent(category.label)}`, undefined, { shallow: true });
    setCurrentPage(1);
  };

  const handleBrandChange = (brand: Brand) => {
    setSelectedBrand(brand);
    setSelectedCategory(brand.categories[0]);
    router.push(`/catalog/${encodeURIComponent(brand.categories[0].label)}`, undefined, { shallow: true });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedBrand(brands[0]);
    setSelectedCategory(brands[0].categories[0]);
    setMinPrice(10);
    setMaxPrice(1000000);
    setSelectedColor(null);
    setSelectedMaterial(null);
    setSelectedRating(null);
    setOnlyAvailable(false);
    setSortOrder(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const categories = [
    { name: 'Люстры', href: '/catalog/Люстра' },
    { name: 'Подвесные светильники', href: '/catalog/Подвесной светильник' },
    { name: 'Потолочные светильники', href: '/catalog/Потолочный светильник' },
    { name: 'Напольные светильники', href: '/catalog/Напольный светильник' },
    { name: 'Настенные светильники', href: '/catalog/Настенный светильник' },
    { name: 'Настольные светильники', href: '/catalog/Настольный светильник' },
    { name: 'Ленты', href: '/catalog/Лента' },
    { name: 'Встраиваемый светильник', href: '/catalog/Встраиваемый светильник' },
    { name: 'Уличные светильники', href: '/catalog/Уличный светильник' },
    { name: 'Трековые светильники', href: '/catalog/Трековый светильник' },
    { name: 'Врезные светильники', href: '/catalog/Врезной светильник' },
    { name: 'Подвесные светильники', href: '/catalog/Подвесной светильник' },
    { name: 'Бра', href: '/catalog/Бра' },
    { name: 'Светильники', href: '/catalog/Светильник' },
    { name: 'Лампы', href: '/catalog/Лампа' },
    { name: 'Шинпроводы', href: '/catalog/Шинпровод' },
  ];

  return (
    <>
      <Head>
        <title>Каталог светильников | MoreElecktriki.ru</title>
        <meta name="description" content="Большой выбор светильников от различных брендов. Высокое качество и доступные цены." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-white">
        <Header />

        {/* Основной контейнер */}
        <div className="container mx-auto px-4 sm:px-6 mt-28 sm:mt-32 md:mt-36 lg:mt-40">
          {/* Заголовок с выпадающим меню */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 sm:py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button className="flex items-center text-xl sm:text-2xl font-bold text-black">
                Каталог
                <ChevronDown className="ml-2 w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              {/* Мобильная кнопка фильтров */}
              <button 
                className="flex items-center text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-lg sm:hidden"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                Фильтры
                {isFilterOpen ? <X className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
              </button>
            </div>
            
            {/* Мобильная строка поиска */}
            <div className="mt-4 sm:hidden relative">
              <input
                type="search"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--voltum-blue)]"
              />
              <button
                onClick={() => fetchProducts(1)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-[var(--voltum-blue)] text-white rounded-lg"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Основной контент */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 pt-4 sm:pt-6">
            {/* Левое меню категорий - скрыто на мобильных, показывается при нажатии на кнопку фильтров */}
            <div className={`w-full lg:w-64 xl:w-72 flex-shrink-0 mb-4 lg:mb-0 transition-all duration-300 ease-in-out ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24 overflow-auto max-h-[calc(100vh-120px)] pb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Категории</h3>
                <nav className="space-y-2 sm:space-y-3">
                  {categories.map((category) => (
                    <a
                      key={category.href}
                      href={category.href}
                      className="block text-gray-900 hover:text-[var(--voltum-blue)] transition-colors text-sm sm:text-base py-1"
                    >
                      {category.name}
                    </a>
                  ))}
                </nav>
                
                {/* Фильтры для мобильной версии */}
                <div className="mt-6 lg:hidden">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Фильтры</h3>
                  
                  {/* Бренды */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Бренд</h4>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedBrand.name}
                      onChange={(e) => {
                        const brand = brands.find(b => b.name === e.target.value);
                        if (brand) handleBrandChange(brand);
                      }}
                    >
                      {brands.map((brand) => (
                        <option key={brand.name} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Цена */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Цена</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="От"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="До"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Кнопка сброса фильтров */}
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors mt-4"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              </div>
            </div>

            {/* Правая часть с фильтрами и товарами */}
            <div className="flex-1">
              {/* Верхняя панель с фильтрами - скрыта на мобильных */}
              <div className="hidden sm:flex flex-col md:flex-row items-start md:items-center justify-between mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 md:mb-0">
                  <button className="text-gray-900 font-medium text-sm sm:text-base">Фильтры</button>
                  <button className="text-gray-900 font-medium text-sm sm:text-base">Новинки</button>
                  <button className="text-gray-900 font-medium text-sm sm:text-base">Акции</button>
                  <button 
                    className="text-gray-900 font-medium text-sm sm:text-base flex items-center"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    По цене
                    <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm sm:text-base">Валюта:</span>
                    <select className="bg-transparent border-none font-medium focus:outline-none text-sm sm:text-base">
                      <option>RUB</option>
                    </select>
                  </div>
                  <span className="text-gray-600 text-sm sm:text-base">{totalProducts} товаров</span>
                </div>
              </div>

              {/* Режим отображения товаров */}
              <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Сетка"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="Список"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Список товаров */}
              <div className="min-h-[200px]" ref={productsContainerRef}>
                {isPageLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <ClipLoader color="#000B4E" loading={true} size={60} />
                  </div>
                ) : products.length > 0 ? (
                  <CatalogOfProducts products={allLoadedProducts} viewMode={viewMode} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-gray-500 mb-4">По вашему запросу ничего не найдено</p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-[var(--voltum-blue)] text-white rounded-md hover:bg-[var(--voltum-blue-light)] transition-colors"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                )}
              </div>

              {/* Кнопка "Показать еще" */}
              {currentPage < totalPages && (
                <div className="flex justify-center mt-6 sm:mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-[var(--voltum-blue)] text-white rounded-md hover:bg-[var(--voltum-blue-light)] transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center justify-center">
                        <ClipLoader color="#FFFFFF" loading={true} size={20} />
                        <span className="ml-2">Загрузка...</span>
                      </div>
                    ) : (
                      'Показать еще'
                    )}
                  </button>
                </div>
              )}

              {/* Пагинация */}
              <div className="mt-6 sm:mt-8 mb-8 sm:mb-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Генерация путей для всех категорий (и алиасов)
export const getStaticPaths: GetStaticPaths = async () => {
  const paths: { params: { name: string } }[] = [];
  brands.forEach((brand) => {
    brand.categories.forEach((category) => {
      paths.push({ params: { name: category.label } });
      if (category.aliases) {
        category.aliases.forEach((alias) => {
          paths.push({ params: { name: alias } });
        });
      }
    });
  });
  return {
    paths,
    fallback: 'blocking',
  };
};

// Получение данных на этапе сборки (SSG)
export const getStaticProps: GetStaticProps = async (context) => {
  const { name } = context.params as { name: string };

  const categoryName = name.trim().toLowerCase();
  const isGlobalCategory = categoryName === 'люстра' || categoryName === 'люстры';

  // Выбираем бренд "Все товары", если это глобальная категория
  const defaultBrand = isGlobalCategory 
    ? brands.find(b => b.name === 'Все товары')
    : brands.find(b => 
        b.categories.some(c => 
          c.label.trim().toLowerCase() === categoryName ||
          c.searchName.trim().toLowerCase() === categoryName ||
          (c.aliases && c.aliases.some(alias => alias.toLowerCase() === categoryName))
        )
      );

  if (!defaultBrand) {
    return {
      notFound: true,
    };
  }

  // Найти соответствующую категорию
  let defaultCategory = defaultBrand.categories.find(c => 
    c.label.trim().toLowerCase() === categoryName ||
    c.searchName.trim().toLowerCase() === categoryName ||
    (c.aliases && c.aliases.some(alias => alias.toLowerCase() === categoryName))
  );

  if (!defaultCategory && isGlobalCategory) {
    defaultCategory = { label: 'Люстра', searchName: 'Люстра' };
  }

  if (!defaultCategory) {
    defaultCategory = { label: 'Нет категории', searchName: '' };
  }

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/products/${encodeURIComponent(defaultBrand.name)}`;
  
  const response = await axios.get(endpoint, {
    params: {
      page: 1,
      limit: 32,
      search: isGlobalCategory ? name.trim() : '',
      searchField: 'title',
      name: isGlobalCategory ? 'Люстра' : defaultCategory.searchName,
      source: isGlobalCategory ? '' : defaultBrand.name,
    },
  });

  const products = response.data.products;
  const totalPages = response.data.totalPages;
  const totalProducts = response.data.totalProducts;

  return {
    props: {
      initialBrand: defaultBrand,
      initialCategory: defaultCategory,
      initialProducts: products,
      initialTotalPages: totalPages,
      initialTotalProducts: totalProducts,
    },
    revalidate: 60,
  };
};

export default Catalog;
