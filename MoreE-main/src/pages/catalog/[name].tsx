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

  const categories = [
    { name: 'Люстры', href: '/catalog/Люстры' },
    { name: 'Подвесные светильники', href: '/catalog/Подвесные-светильники' },
    { name: 'Потолочные светильники', href: '/catalog/Потолочные-светильники' },
    { name: 'Напольные светильники (Торшер)', href: '/catalog/Напольные-светильники' },
    { name: 'Настенные светильники (Бра)', href: '/catalog/Настенные-светильники' },
    { name: 'Настольные светильники', href: '/catalog/Настольные-светильники' },
    { name: 'Подсветка', href: '/catalog/Подсветка' },
    { name: 'Встраиваемый светильник', href: '/catalog/Встраиваемый-светильник' },
    { name: 'Аксессуары', href: '/catalog/Аксессуары' },
  ];

  return (
    <>
      <Head>
        <title>Каталог светильников | MoreElecktriki.ru</title>
        <meta name="description" content="Большой выбор светильников от различных брендов. Высокое качество и доступные цены." />
      </Head>
      <div className="min-h-screen bg-white">
        <Header />

        {/* Основной контейнер */}
        <div className="container mx-auto px-4 mt-32">
          {/* Заголовок с выпадающим меню */}
          <div className="flex items-center justify-between py-6 border-b border-gray-200">
            <button className="flex items-center text-2xl font-bold text-black">
              Декоративный свет
              <ChevronDown className="ml-2 w-6 h-6" />
            </button>
          </div>

          {/* Основной контент */}
          <div className="flex gap-8 pt-6">
            {/* Левое меню категорий */}
            <div className="w-72 flex-shrink-0">
              <nav className="space-y-4">
                {categories.map((category) => (
                  <a
                    key={category.href}
                    href={category.href}
                    className="block text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    {category.name}
                  </a>
                ))}
              </nav>
            </div>

            {/* Правая часть с фильтрами и товарами */}
            <div className="flex-1">
              {/* Верхняя панель с фильтрами */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button className="text-gray-900 font-medium">Фильтры</button>
                  <button className="text-gray-900 font-medium">Новинки</button>
                  <button className="text-gray-900 font-medium">Акции</button>
                  <button className="text-gray-900 font-medium">По цене</button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Валюта:</span>
                    <select className="bg-transparent border-none font-medium focus:outline-none">
                      <option>RUB</option>
                    </select>
                  </div>
                  <span className="text-gray-600">1230 товаров</span>
                </div>
              </div>

              {/* Список товаров */}
              <div className="min-h-[200px]">
                {isPageLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <ClipLoader color="#000000" loading={true} size={60} />
                  </div>
                ) : (
                  <CatalogOfProducts products={products} viewMode={viewMode} />
                )}
              </div>

              {/* Пагинация */}
              <div className="mt-14">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
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
