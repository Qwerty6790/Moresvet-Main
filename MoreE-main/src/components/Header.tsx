import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  User,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Phone,
  ShoppingCart,
  Heart,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';

// Интерфейс для товара (используется в поиске)
interface Product {
  _id: string;
  name: string;
  price: number;
  imageAddresses: string | string[];
  imageAddress?: string | string[];
}

// Кастомный хук для поиска товаров по API
const useSearchProducts = (query: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query || query.length < 2) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/search`,
          { params: { name: query, limit: 6 } }
        );
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Ошибка при поиске товаров:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { products, loading };
};

interface SubCategory {
  title: string;
  image: string;
}

interface CatalogCategory {
  title: string;
  link: string;
  icon: string;
}

interface FilterCategory {
  title: string;
  options: string[];
  allLink: string;
}

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [hideTopBar, setHideTopBar] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [mobileSubcategoryOpen, setMobileSubcategoryOpen] = useState(false);
  const [mobileSelectedCategory, setMobileSelectedCategory] = useState<number | null>(null);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<number | null>(null);
  const [expandedAccordionItems, setExpandedAccordionItems] = useState<number[]>([]);
  const router = useRouter();
  const catalogRef = useRef<HTMLDivElement | null>(null);
  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);

  // Хук для поиска товаров
  const { products, loading } = useSearchProducts(searchQuery);

  // Отслеживание скролла для скрытия верхней панели
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setHideTopBar(true);
      } else {
        setHideTopBar(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Мемоизированный рендер выпадающего списка с товарами (новый дизайн)
  const searchResultsContent = useMemo(() => {
    if (loading) {
      return (
        <div className="p-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-gray-500"></div>
        </div>
      );
    }
    if (products.length > 0) {
      return (
        <>
          {products.map((product, index) => {
            const images = (() => {
              if (typeof product.imageAddresses === 'string') {
                return [product.imageAddresses];
              } else if (Array.isArray(product.imageAddresses)) {
                return product.imageAddresses;
              } else if (typeof product.imageAddress === 'string') {
                return [product.imageAddress];
              } else if (Array.isArray(product.imageAddress)) {
                return product.imageAddress;
              }
              return [];
            })();
            const imageUrl = images.length > 0 ? images[0] : '/placeholder.jpg';

            return (
              <div 
                key={product._id} 
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${index !== products.length - 1 ? 'border-b border-gray-200' : ''}`}
                onClick={() => handleProductClick(product.name)}
              >
                <img 
                  src={imageUrl} 
                  alt={product.name} 
                  className="w-12 h-12 object-cover mr-4"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.price} ₽</p>
                </div>
              </div>
            );
          })}
          <div 
            className="p-3 text-center font-medium text-blue-600 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleProductClick(searchQuery)}
          >
            Показать все товары
          </div>
        </>
      );
    }
    return (
      <div className="p-4 text-center text-gray-500">
        Ничего не найдено
      </div>
    );
  }, [products, loading, searchQuery]);

  // При наведении на категорию каталога
  const handleCategoryHover = (index: number) => {
    setActiveCategory(index);
  };

  // Закрытие мобильного меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Закрытие каталога при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        catalogRef.current &&
        !catalogRef.current.contains(event.target as Node) &&
        catalogButtonRef.current &&
        !catalogButtonRef.current.contains(event.target as Node)
      ) {
        setIsCatalogOpen(false);
      }
    };

    if (isCatalogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCatalogOpen]);

  // Блокировка скролла, когда открыто мобильное меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Обработчик отправки поиска (для формы)
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const encodedSearchQuery = encodeURIComponent(searchQuery);
      router.push(`/search/${encodedSearchQuery}?query=${encodedSearchQuery}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  // Обработчик клика по товару из выпадающего списка
  const handleProductClick = (query: string) => {
    if (query.trim()) {
      const encodedSearchQuery = encodeURIComponent(query);
      router.push(`/search/${encodedSearchQuery}?query=${encodedSearchQuery}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  // Обработчик для перехода к категории
  const handleCategoryClick = (categoryTitle: string) => {
    const encodedCategory = encodeURIComponent(categoryTitle);
    router.push(`/search/${encodedCategory}?query=${encodedCategory}`);
    setIsCatalogOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileCatalogOpen(false);
  };

  // Обработчик для перехода к подкатегории
  const handleSubCategoryClick = (categoryTitle: string, subCategoryTitle: string) => {
    const encodedCategory = encodeURIComponent(categoryTitle);
    const encodedSubCategory = encodeURIComponent(subCategoryTitle);
    router.push(`/search/${encodedSubCategory}?query=${encodedSubCategory}&category=${encodedCategory}`);
    setIsCatalogOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileCatalogOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Здесь можно реализовать переключение темы
  };

  // Обработчик для открытия мобильного каталога
  const handleMobileCatalogOpen = () => {
    setMobileCatalogOpen(true);
    setMobileSubcategoryOpen(false);
  };

  // Обработчик для выбора категории в мобильном каталоге
  const handleMobileCategorySelect = (index: number) => {
    setMobileSelectedCategory(index);
    setMobileSubcategoryOpen(true);
  };

  // Обработчик для возврата к списку категорий
  const handleBackToCategories = () => {
    setMobileSubcategoryOpen(false);
  };

  // Массив категорий каталога
  const catalogCategories: CatalogCategory[] = [
    { title: "Люстры", link: "/catalog/Люстра", icon: "/images/Kackandy.png" },
    { title: "Cветильники", link: "/catlog/potolochnie-svetilniki", icon: "/images/nastenni.png" },
    { title: "Торшеры", link: "/category/torshery", icon: "/images/Torher.png" },
    { title: "Настольные лампы", link: "/category/nastolnye-lampy", icon: "/images/nastolyna Lampa.png" },
    { title: "Точечные светильники", link: "/category/tochechnye-svetilniki", icon: "/api/placeholder/30/30" },
    { title: "Споты", link: "/category/spoty", icon: "/api/placeholder/30/30" },
    { title: "Светильники для картин, зеркал и ступеней", link: "/category/dlya-kartin", icon: "/api/placeholder/30/30" },
    { title: "Детские светильники", link: "/category/detskie-svetilniki", icon: "/api/placeholder/30/30" },
    { title: "Садово-парковые светильники", link: "/category/sadovo-parkovye", icon: "/api/placeholder/30/30" },
    { title: "Уличное освещение", link: "/category/ulichnoe-osveschenie", icon: "/api/placeholder/30/30" },
    { title: "Шинные и струнные системы", link: "/category/shinnye-systemy", icon: "/api/placeholder/30/30" },
  ];

  // Объект с массивами подкатегорий для каждой основной категории
  const catalogSubCategories: Record<string, SubCategory[]> = {
    "Люстры": [
      { title: "Каскадная", image: "/images/Kackandy.png" },
      { title: "Люстра на штанге", image: "/images/Htange.png" },
      { title: "потолочная", image: "/images/Potolohny.png" },
      { title: "подвесная", image: "/images/Podvesny.png" }
    ],
    "Cветильники": [
      { title: "Настенный светильник", image: "/images/nastenni.png" },
      { title: "Бра", image: "/images/bra.png" },
      { title: "Потолочный светильник", image: "/images/Potolcny svetlynik.png" },
      { title: "напольный", image: "/images/Napolyny svetilnik.png" }
    ],
    "Торшеры": [
      { title: "Торшер", image: "/images/Torher.png" },
    ],
    "Настольные лампы": [
      { title: "Настольная лампа", image: "/images/nastolyna Lampa.png" },
      { title: "Прикроватная лампа", image: "/images/Prikrovatnt lampa.png" },
      { title: "Офисная настольная лампа", image: "/images/Oficny lampa.png" },
    ],
    "Точечные светильники": [
      { title: "Точечный 1", image: "/images/sub1.png" },
      { title: "Точечный 2", image: "/images/sub2.png" },
      { title: "Точечный 3", image: "/images/sub3.png" },
      { title: "Точечный 4", image: "/images/sub4.png" }
    ],
    "Споты": [
      { title: "Спот 1", image: "/images/sub1.png" },
      { title: "Спот 2", image: "/images/sub2.png" },
      { title: "Спот 3", image: "/images/sub3.png" },
      { title: "Спот 4", image: "/images/sub4.png" }
    ],
    "Светильники для картин, зеркал и ступеней": [
      { title: "Тип 1", image: "/images/sub1.png" },
      { title: "Тип 2", image: "/images/sub2.png" },
      { title: "Тип 3", image: "/images/sub3.png" },
      { title: "Тип 4", image: "/images/sub4.png" }
    ],
    "Детские светильники": [
      { title: "Детский 1", image: "/images/sub1.png" },
      { title: "Детский 2", image: "/images/sub2.png" },
      { title: "Детский 3", image: "/images/sub3.png" },
      { title: "Детский 4", image: "/images/sub4.png" }
    ],
    "Садово-парковые светильники": [
      { title: "Садовый 1", image: "/images/sub1.png" },
      { title: "Садовый 2", image: "/images/sub2.png" },
      { title: "Садовый 3", image: "/images/sub3.png" },
      { title: "Садовый 4", image: "/images/sub4.png" }
    ],
    "Уличное освещение": [
      { title: "Уличный 1", image: "/images/sub1.png" },
      { title: "Уличный 2", image: "/images/sub2.png" },
      { title: "Уличный 3", image: "/images/sub3.png" },
      { title: "Уличный 4", image: "/images/sub4.png" }
    ],
    "Шинные и струнные системы": [
      { title: "Система 1", image: "/images/sub1.png" },
      { title: "Система 2", image: "/images/sub2.png" },
      { title: "Система 3", image: "/images/sub3.png" },
      { title: "Система 4", image: "/images/sub4.png" }
    ]
  };
  


  // Массив для фильтров (без изменений)
  const filterCategories: FilterCategory[] = [
    {
      title: "Форма",
      options: ["Квадрат", "Круг", "Овал", "Пирамида"],
      allLink: "/filters/forma"
    },
    {
      title: "Цвет",
      options: ["Бежевые", "Белые", "Хром", "Черные"],
      allLink: "/filters/cvet"
    },
    {
      title: "Материал",
      options: ["Деревянные", "Металлические", "Пластиковые", "Стеклянные"],
      allLink: "/filters/material"
    },
    {
      title: "Стиль",
      options: ["Восточные", "Дизайнерские", "Кантри", "Классические"],
      allLink: "/filters/stil"
    },
    {
      title: "Место",
      options: ["Гостиная", "Зал", "Кухня", "Прихожая"],
      allLink: "/filters/mesto"
    }
  ];

  // Пункты навигационного меню для мобильной версии
  const navigationItems = [
    { title: "Главная", link: "/" },
    { title: "Каталог", link: "/catalog", hasSubmenu: true },
    { title: "Бренды", link: "/brands" },
    { title: "Компания", link: "/company", hasSubmenu: true },
    { title: "Блог", link: "/blog" },
    { title: "Покупателям", link: "/customers", hasSubmenu: true },
    { title: "Контакты", link: "/contacts" },
    { title: "Акции", link: "/sales" },
  ];

  const toggleAccordionItem = (index: number) => {
    setExpandedAccordionItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index) 
        : [...prev, index]
    );
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300">
      {/* Верхняя панель навигации */}
      <div className={`border-b border-gray-200 transition-all duration-300 ${hideTopBar ? 'h-0 overflow-hidden opacity-0' : 'h-12 opacity-100'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Левое меню */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/brands"
                className="text-gray-700 hover:text-red-600 text-sm font-medium transition-colors"
              >
                Бренды
              </Link>
              <div className="relative group">
                <Link
                  href="/company"
                  className="text-gray-700 hover:text-red-600 text-sm font-medium transition-colors flex items-center"
                >
                  Компания
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Link>
                <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-2">
                    <Link
                      href="/company/about"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    >
                      О компании
                    </Link>
                    <Link
                      href="/company/history"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    >
                      История
                    </Link>
                    <Link
                      href="/company/team"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    >
                      Команда
                    </Link>
                  </div>
                </div>
              </div>
              <Link
                href="/blog"
                className="text-gray-700 hover:text-red-600 text-sm font-medium transition-colors"
              >
                Блог
              </Link>
              <div className="relative group">
                <Link
                  href="/customers"
                  className="text-gray-700 hover:text-red-600 text-sm font-medium transition-colors flex items-center"
                >
                  Покупателям
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Link>
                <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-2">
                    <Link
                      href="/customers/delivery"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    >
                      Доставка
                    </Link>
                    <Link
                      href="/customers/payment"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    >
                      Оплата
                    </Link>
                    <Link
                      href="/customers/warranty"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    >
                      Гарантия
                    </Link>
                    <Link
                      href="/customers/faq"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    >
                      Частые вопросы
                    </Link>
                  </div>
                </div>
              </div>
              <Link
                href="/contacts"
                className="text-gray-700 hover:text-red-600 text-sm font-medium transition-colors"
              >
                Контакты
              </Link>
              <Link
                href="/sales"
                className="text-gray-700 hover:text-red-600 text-sm font-medium transition-colors"
              >
                Акции
              </Link>
            </nav>

            {/* Телефон */}
            <div className="hidden md:flex items-center ml-auto">
              <Link
                href="tel:+74956779569"
                className="text-gray-800 font-medium text-sm hover:text-red-600 transition-colors flex items-center"
              >
                <Phone className="w-4 h-4 mr-2 text-black" />
                +7 (495) 677-95-69
              </Link>
              <span className="mx-2 text-gray-300">•</span>
              <Link
                href="/callback"
                className="text-gray-600 text-sm hover:text-red-600 transition-colors"
              >
                Заказать звонок
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Основной хедер */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Логотип */}
          <Link href="/" className="flex-shrink-0 transition-transform hover:scale-105">
            <img src="/images/logo.png" alt="StLuce" className="h-10" />
          </Link>

          {/* Кнопка каталога */}
          <button
            ref={catalogButtonRef}
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className="hidden md:flex items-center bg-black hover:bg-neutral-400 text-white px-6 py-3 rounded-lg transition-all ml-4 font-medium"
          >
            {isCatalogOpen ? <X className="w-5 h-5 mr-2" /> : <MenuIcon className="w-5 h-5 mr-2" />}
            Каталог
          </button>

          {/* Поиск (десктоп) */}
          <div className="hidden md:block flex-grow mx-6 max-w-xl relative">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="search"
                placeholder="Найти светильник"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-black hover:bg-neutral-400 text-white rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              {/* Новый дизайн выпадающего списка с товарами */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-lg border border-gray-300 shadow-lg max-h-80 overflow-y-auto">
                  {searchResultsContent}
                </div>
              )}
            </form>
          </div>

          {/* Пользовательские действия */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/auth/login"
              className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors"
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Войти</span>
            </Link>
            <Link
              href="/Brands"
              className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors"
            >
              <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 12H18L15 21L9 3L6 12H2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-medium">Сравнение</span>
            </Link>
            <Link
              href="/liked"
              className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors"
            >
              <Heart className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Избранное</span>
            </Link>
            <Link
              href="/cart"
              className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors relative"
            >
              <ShoppingCart className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Корзина</span>
            </Link>
          </div>

          {/* Мобильные кнопки */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Поиск"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"></span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Меню"
            >
              <MenuIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Мобильная строка поиска */}
      {isSearchOpen && (
        <div className="md:hidden py-3 px-4 border-t border-gray-200 animate-fadeIn relative">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Найти светильник"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-black text-white rounded-lg"
            >
              <Search className="w-4 h-4" />
            </button>
            {/* Выпадающий список с товарами для мобильного поиска с новым дизайном */}
            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-lg border border-gray-300 shadow-lg max-h-80 overflow-y-auto">
                {searchResultsContent}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Выпадающее меню каталога */}
      {isCatalogOpen && (
        <div ref={catalogRef} className="absolute left-0 right-0 bg-white shadow-xl z-40 border-t border-gray-200">
          <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6 py-8 px-4">
            {/* Левый блок категорий */}
            <div className="col-span-3 border-r border-gray-200 pr-4">
              <ul className="space-y-1">
                {catalogCategories.map((category, index) => (
                  <li key={index}>
                    <button
                      className={`flex items-center py-2.5 px-3 rounded-lg text-sm transition-colors w-full text-left ${
                        activeCategory === index
                          ? 'bg-red-50 text-black font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onMouseEnter={() => handleCategoryHover(index)}
                      onClick={() => handleCategoryClick(category.title)}
                    >
                      <img src={category.icon} className="w-5 h-5 mr-3" alt={category.title} />
                      {category.title}
                      <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Основной блок категорий */}
            <div className="col-span-9">
              {activeCategory !== null && catalogSubCategories[catalogCategories[activeCategory].title] &&
              catalogSubCategories[catalogCategories[activeCategory].title].length > 0 ? (
                <>
                  {/* Заголовок подкатегории */}
                  <div className="mb-6 flex items-center">
                    <Link
                      href={`/search/${encodeURIComponent(catalogCategories[activeCategory].title)}?query=${encodeURIComponent(catalogCategories[activeCategory].title)}`}
                      className="text-xl font-medium text-gray-900 hover:text-red-600 transition-colors flex items-center"
                    >
                      {catalogCategories[activeCategory].title}
                      <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                    </Link>
                  </div>

                  {/* Сетка подкатегорий */}
                  <div className="grid grid-cols-4 gap-6">
                    {catalogSubCategories[catalogCategories[activeCategory].title].map((sub, index) => (
                      <Link
                        key={index}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubCategoryClick(catalogCategories[activeCategory].title, sub.title);
                        }}
                        className="group"
                      >
                        <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3 flex items-center justify-center border border-gray-100 group-hover:border-red-200 transition-colors">
                          <img
                            src={sub.image}
                            alt={sub.title}
                            className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-sm text-center text-gray-700 group-hover:text-red-600 font-medium transition-colors">
                          {sub.title}
                        </p>
                      </Link>
                    ))}
                  </div>

                  {/* Фильтры */}
                  <div className="mt-10 grid grid-cols-5 gap-6">
                    {filterCategories.map((filterCat, index) => (
                      <div key={index}>
                        <h3 className="font-medium text-gray-900 mb-3">{filterCat.title}</h3>
                        <ul className="space-y-2">
                          {filterCat.options.map((option, optIndex) => (
                            <li key={optIndex}>
                              <Link
                                href={`${filterCat.allLink}/${encodeURIComponent(option.toLowerCase())}`}
                                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                              >
                                {option}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              href={filterCat.allLink}
                              className="text-sm text-black hover:text-red-700 transition-colors font-medium"
                            >
                              Посмотреть все →
                            </Link>
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              ) : activeCategory !== null ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-xl font-medium mb-4">{catalogCategories[activeCategory].title}</h3>
                    <Link
                      href={`/search/${encodeURIComponent(catalogCategories[activeCategory].title)}?query=${encodeURIComponent(catalogCategories[activeCategory].title)}`}
                      className="inline-block px-5 py-2.5 bg-black text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Перейти в категорию
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
        >
          <div className="container mx-auto px-4 py-4">
            {/* Верхняя панель с логотипом и кнопкой закрытия */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <Link href="/" className="flex-shrink-0">
                <img src="/logo.svg" alt="Logo" className="h-8" />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6 text-black" />
              </button>
            </div>
            
            {/* Поиск */}
            <div className="mt-4 mb-6">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="search"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-black text-white rounded-lg"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Навигация */}
            <div className="mt-4">
              <div className="flex flex-col space-y-1">
                <Link href="/" className="flex items-center py-3 px-2 text-lg font-medium text-black hover:bg-gray-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Главная
                </Link>
                
                {/* Каталог с аккордеоном */}
                <div className="border-b border-gray-100 py-1">
                  <button
                    onClick={() => setIsMobileCatalogOpen(!isMobileCatalogOpen)}
                    className="flex items-center justify-between w-full py-3 px-2 text-lg font-medium text-black hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Каталог
                    </div>
                    {isMobileCatalogOpen ? (
                      <ChevronUp className="w-5 h-5 text-black" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-black" />
                    )}
                  </button>
                  
                  {isMobileCatalogOpen && (
                    <div className="pl-10 py-2 space-y-1 mt-1 mb-2">
                      {catalogCategories.map((category, index) => (
                        <div key={index} className="mb-1">
                          <button
                            onClick={() => toggleAccordionItem(index)}
                            className="flex items-center justify-between w-full py-2 px-2 text-md text-black hover:bg-gray-50 rounded-lg"
                          >
                            <div 
                              className="flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategoryClick(category.title);
                              }}
                            >
                              <Image
                                src={category.icon}
                                alt={category.title}
                                width={20}
                                height={20}
                                className="mr-2"
                              />
                              <span>{category.title}</span>
                            </div>
                            {expandedAccordionItems.includes(index) ? (
                              <ChevronUp className="w-4 h-4 text-black" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-black" />
                            )}
                          </button>
                          
                          {expandedAccordionItems.includes(index) && (
                            <div className="pl-8 py-1 space-y-1 ml-2">
                              {Object.keys(catalogSubCategories).includes(category.title) && 
                                catalogSubCategories[category.title as keyof typeof catalogSubCategories].map((sub, subIndex) => (
                                  <Link
                                    key={subIndex}
                                    href="#"
                                    className="block py-2 px-2 text-sm text-black hover:bg-gray-50 rounded-lg"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSubCategoryClick(category.title, sub.title);
                                    }}
                                  >
                                    {sub.title}
                                  </Link>
                                ))
                              }
                              <Link
                                href="#"
                                className="block py-2 px-2 text-sm font-medium text-black hover:bg-gray-50 rounded-lg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleCategoryClick(category.title);
                                }}
                              >
                                Все {category.title.toLowerCase()}
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Link href="/about" className="flex items-center py-3 px-2 text-lg font-medium text-black hover:bg-gray-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  О компании
                </Link>
                
                <Link href="/delivery" className="flex items-center py-3 px-2 text-lg font-medium text-black hover:bg-gray-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  Доставка и оплата
                </Link>
                
                <Link href="/contacts" className="flex items-center py-3 px-2 text-lg font-medium text-black hover:bg-gray-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Контакты
                </Link>
              </div>
            </div>

            {/* Контактная информация */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex flex-col space-y-4">
                <Link href="tel:+74956779569" className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +7 (495) 677-95-69
                </Link>
                <div className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Пн-Пт: 9:00-18:00
                </div>
                <Link href="mailto:info@example.com" className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@example.com
                </Link>
              </div>
            </div>

            {/* Иконки корзины и избранного */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Link
                href="/favorites"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Heart className="w-6 h-6 text-black mb-2" />
                <span className="text-sm font-medium text-black">Избранное</span>
              </Link>
              <Link
                href="/cart"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative"
              >
                <ShoppingCart className="w-6 h-6 text-black mb-2" />
                <span className="absolute top-2 right-1/4 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">3</span>
                <span className="text-sm font-medium text-black">Корзина</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
