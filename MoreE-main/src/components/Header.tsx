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
  ChevronUp,
  UserRound
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import { FaHeart, FaShoppingBag, FaShoppingBasket, FaShoppingCart, FaUser } from 'react-icons/fa';

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
    { title: "Люстры", link: "/catalog/Люстра", icon: "" },
    { title: "Cветильники", link: "/catlog/potolochnie-svetilniki", icon: "" },
    { title: "Торшеры", link: "/category/torshery", icon: "" },
    { title: "Настольные лампы", link: "/category/nastolnye-lampy", icon: "" },
    { title: "Точечные светильники", link: "/category/tochechnye-svetilniki", icon: "" },
    { title: "Споты", link: "/category/spoty", icon: "" },
    { title: "Светильники для картин, зеркал и ступеней", link: "/category/dlya-kartin", icon: "" },
    { title: "Детские светильники", link: "/category/detskie-svetilniki", icon: "" },
    { title: "Садово-парковые светильники", link: "/category/sadovo-parkovye", icon: "" },
    { title: "Уличное освещение", link: "/category/ulichnoe-osveschenie", icon: "" },
    { title: "Шинные и струнные системы", link: "/category/shinnye-systemy", icon: "" },
  ];

  // Объект с массивами подкатегорий для каждой основной категории
  const catalogSubCategories: Record<string, SubCategory[]> = {
    "Люстры": [
      { title: "Каскадная", image: "" },
      { title: "Люстра на штанге", image: "" },
      { title: "потолочная", image: "" },
      { title: "подвесная", image: "" }
    ],
    "Cветильники": [
      { title: "Настенный светильник", image: "" },
      { title: "Бра", image: "" },
      { title: "Потолочный светильник", image: "" },
      { title: "напольный", image: "" }
    ],
    "Торшеры": [
      { title: "Торшер", image: "" },
    ],
    "Настольные лампы": [
      { title: "Настольная лампа", image: "" },
      { title: "Прикроватная лампа", image: "" },
      { title: "Офисная настольная лампа", image: "" },
    ],
    "Точечные светильники": [
      { title: "Точечный 1", image: "" },
      { title: "Точечный 2", image: "" },
      { title: "Точечный 3", image: "" },
      { title: "Точечный 4", image: "" }
    ],
    "Споты": [
      { title: "Спот 1", image: "" },
      { title: "Спот 2", image: "" },
      { title: "Спот 3", image: "" },
      { title: "Спот 4", image: "" }
    ],
    "Светильники для картин, зеркал и ступеней": [
      { title: "Тип 1", image: "" },
      { title: "Тип 2", image: "" },
      { title: "Тип 3", image: "" },
      { title: "Тип 4", image: "" }
    ],
    "Детские светильники": [
      { title: "Детский 1", image: "" },
      { title: "Детский 2", image: "" },
      { title: "Детский 3", image: "" },
      { title: "Детский 4", image: "" }
    ],
    "Садово-парковые светильники": [
      { title: "Садовый 1", image: "" },
      { title: "Садовый 2", image: "" },
      { title: "Садовый 3", image: "" },
      { title: "Садовый 4", image: "" }
    ],
    "Уличное освещение": [
      { title: "Уличный 1", image: "" },
      { title: "Уличный 2", image: "" },
      { title: "Уличный 3", image: "" },
      { title: "Уличный 4", image: "" }
    ],
    "Шинные и струнные системы": [
      { title: "Система 1", image: "" },
      { title: "Система 2", image: "" },
      { title: "Система 3", image: "" },
      { title: "Система 4", image: "" }
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

  // Массив основных пунктов меню
  const mainMenuItems = [
    { title: "Продукция", link: "/products", hasSubmenu: true },
    { title: "О нас", link: "/about", hasSubmenu: true },
    { title: "Новости", link: "/news" },
    { title: "Проекты", link: "/projects" },
    { title: "Сотрудничество", link: "/partnership" },
    { title: "Где купить", link: "/where-to-buy" },
  ];

  const toggleAccordionItem = (index: number) => {
    setExpandedAccordionItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index) 
        : [...prev, index]
    );
  };

  return (
    <>
      {/* Фоновое изображение для всей страницы */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/assets_task_01jrdh7qpqf7ftcpemen2q4j7c_img_0.webp" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto px-4 pt-4">
        <header className="fixed top-4 left-0 right-0 z-50 w-full">
          <div className="max-w-7xl mx-auto px-4">
            {/* Основной хедер с темно-синим фоном и закругленными краями */}
            <div className="bg-transparent backdrop-blur-lg text-black rounded-xl overflow-hidden shadow-xl">
              <div className="px-6">
                <div className="flex items-center justify-between h-16">
                  {/* Логотип */}
                  <Link href="/" className="flex-shrink-0 text-black text-2xl font-bold flex items-center">
                  <img src="/images/logo.png" alt="StLuce" className="h-10 w-20" />
                  </Link>

                  {/* Основное меню - десктоп */}
                  <nav className="hidden lg:flex items-center space-x-8 mx-4">
                    {mainMenuItems.map((item, index) => (
                      <div key={index} className="relative group">
                        <Link
                          href={item.link}
                          className="text-white hover:text-gray-300 text-base font-medium transition-colors flex items-center"
                        >
                          {item.title}
                          {item.hasSubmenu && <ChevronDown className="w-4 h-4 ml-1" />}
                        </Link>
                      </div>
                    ))}
                  </nav>

                  {/* Правая часть - поиск, сравнение, избранное, корзина */}
                  <div className="flex items-center space-x-6">
                    {/* Поиск */}
                    <button className="text-white hover:text-gray-300">
                      <Search className="w-5 h-5" />
                    </button>
                    
                    {/* Разделитель */}
                    <span className="h-6 w-px bg-gray-500"></span>
                    
                    {/* Сравнение */}
                    <Link href="/compare" className="text-white hover:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 20h4a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4"></path>
                        <path d="M4 4v16a2 2 0 0 0 2 2h4"></path>
                        <path d="M12 14l4-4"></path>
                        <path d="M8 8l4 4"></path>
                      </svg>
                    </Link>
                    
                    {/* Избранное */}
                    <Link href="/favorites" className="text-white hover:text-gray-300">
                      <Heart className="w-5 h-5" />
                    </Link>
                    
                    {/* Корзина */}
                    <Link href="/cart" className="text-white hover:text-gray-300">
                      <ShoppingCart className="w-5 h-5" />
                    </Link>

                    {/* Мобильное меню */}
                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="lg:hidden text-white hover:text-gray-300"
                    >
                      <MenuIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Нижняя полоса с контактами */}
              <div className="border-t border-gray-700 text-white">
                <div className="px-6 flex justify-between items-center h-10">
                  <div className="hidden md:flex items-center">
                    <a href="tel:88005509084" className="text-sm text-white">8-800-550-90-84</a>
                  </div>
                  <div className="hidden md:flex items-center">
                    <a href="mailto:info@donel.su" className="text-sm text-white">info@donel.su</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Мобильное меню */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-[#0a1f38] bg-opacity-95 backdrop-blur-sm overflow-y-auto rounded-lg">
              <div className="max-w-7xl mx-auto px-4 py-4">
                {/* Верхняя панель с логотипом и кнопкой закрытия */}
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                  <Link href="/" className="flex-shrink-0 text-white text-2xl font-bold flex items-center">
                    <span className="mr-1">D</span>
                    <span className="inline-block w-4 h-4 relative">
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="block w-1 h-1 bg-white rounded-full"></span>
                      </span>
                      <span className="absolute inset-0 border border-white rounded-full"></span>
                    </span>
                    <span>nel</span>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-800"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Навигация */}
                <div className="mt-4">
                  <div className="flex flex-col space-y-1">
                    {mainMenuItems.map((item, index) => (
                      <Link 
                        key={index}
                        href={item.link}
                        className="flex items-center justify-between py-3 px-2 text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                      >
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Контактная информация */}
                <div className="mt-8 border-t border-gray-700 pt-6">
                  <div className="flex flex-col space-y-4">
                    <Link href="tel:88005509084" className="flex items-center text-white">
                      <span className="h-5 w-5 mr-3">📞</span>
                      8-800-550-90-84
                    </Link>
                    <Link href="mailto:info@donel.su" className="flex items-center text-white">
                      <span className="h-5 w-5 mr-3">✉️</span>
                      info@donel.su
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
      </div>
      
      {/* Баннер под хедером */}
      <div className="relative z-10 pt-36 w-full h-screen">
        <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-112px)] flex items-center">
          <div className="w-1/2">
            <h1 className="text-white text-7xl font-bold mb-2">Серия R98</h1>
            <h2 className="text-white text-7xl font-bold mb-8">Trendy Colors</h2>
            <p className="text-white text-xl mb-8">24 трендовых оттенка стандарта NCS</p>
            
            <button className="bg-white text-black font-medium px-8 py-4 rounded-md hover:bg-opacity-90 transition-colors">
              Подробности скоро...
            </button>
          </div>
          

          
        </div>
      </div>
    </>
  );
};

export default Header;