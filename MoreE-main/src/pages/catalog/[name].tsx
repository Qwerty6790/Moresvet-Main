import React, { useEffect, useState, useRef } from 'react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { ProductI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import { CatalogOfProducts } from '@/components/CatalogOfProducts';
import Pagination from '@/components/PaginationComponents';
import { Grid, List, X, Search } from 'lucide-react';
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
      { label: 'Настенный светильник', href: '/decorative-lamps', searchName: 'настенный светильник' },
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
  const limit = 32;
  const router = useRouter();
  const { name: urlName } = router.query;
  const productsContainerRef = useRef<HTMLDivElement>(null);

  // Функция для получения товаров (при изменении фильтров или страницы)
  const fetchProducts = async (page: number) => {
    setIsPageLoading(true);
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
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setTotalProducts(data.totalProducts);
    } catch (error) {
      console.error('Ошибка при получении продуктов:', error);
      setError('Ошибка при получении продуктов. Попробуйте снова.');
    } finally {
      setIsPageLoading(false);
    }
  };

  // Запрос новых данных при изменении страницы или фильтров
  useEffect(() => {
    fetchProducts(currentPage);
  }, [
    currentPage,
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

  return (
    <>
      <Head>
        <title>Каталог Люстр - Все Бренды | Minimiru.ru</title>
        <meta name="description" content="Большой выбор люстр от различных брендов. Высокое качество и доступные цены." />
      </Head>
      <div className="min-h-screen bg-white relative">
        <Header />

        {/* Breadcrumbs */}
        <div className="container mx-auto mt-24 md:mt-40 px-4 pt-4 pb-2">
          <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-500">
            <a href="/" className="hover:text-gray-900">
              Minimiru.ru
            </a>
            <span className="mx-2">/</span>
            <a href="/lighting" className="hover:text-gray-900">
              Освещение для дома
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Люстры</span>
          </div>
        </div>

        {/* Заголовок страницы */}
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-4xl font-medium text-gray-900">Люстры</h1>
        </div>

        {/* Фильтры и сортировка */}
        <div className="sticky top-[80px] bg-white z-30 border-t border-b border-gray-200">
          <div className="container mx-auto px-4">
            {/* На мобильных вертикально, на md - горизонтально */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-3 space-y-3 md:space-y-0">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                >
                  Все фильтры
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Цена
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Степень пылевлагозащиты
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Источник света
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500">Товаров: {totalProducts}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Список товаров */}
        <div className="container mx-auto px-4 py-8" ref={productsContainerRef}>
          {isPageLoading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader color="#000000" loading={true} size={60} />
            </div>
          ) : (
            <CatalogOfProducts products={products} viewMode={viewMode} />
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>

        {/* Выезжающая панель фильтров */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${
            isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`fixed inset-y-0 left-0 w-full sm:w-96 bg-white transform transition-transform duration-300 ease-in-out overflow-y-auto ${
              isFilterOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Фильтры</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              {/* Поиск */}
              <div className="mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Поиск товаров..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Фильтр по цене */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Цена</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(+e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                      placeholder="От"
                    />
                    <span className="absolute right-4 top-3 text-gray-400">₽</span>
                  </div>
                  <span className="text-gray-400">—</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(+e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                      placeholder="До"
                    />
                    <span className="absolute right-4 top-3 text-gray-400">₽</span>
                  </div>
                </div>
              </div>

              {/* Выбор бренда */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Бренды</h3>
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <label key={brand.name} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand.name === brand.name}
                        onChange={() => handleBrandChange(brand)}
                        className="form-radio text-blue-500 h-5 w-5"
                      />
                      <span className="ml-3 text-gray-700">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Сброс фильтров */}
              <button
                onClick={() => {
                  handleResetFilters();
                  setIsFilterOpen(false);
                }}
                className="w-full py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
              >
                Сбросить фильтры
              </button>
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
