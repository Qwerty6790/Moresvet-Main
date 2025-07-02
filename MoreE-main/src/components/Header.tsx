import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

// Обновленный интерфейс для категорий
interface CatalogItem {
  title: string;
  link: string;
  subcategories?: {
    title: string;
    link: string;
  }[];
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
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
  const [isBrandsMenuOpen, setIsBrandsMenuOpen] = useState(false);
  const [catalogMenuPosition, setCatalogMenuPosition] = useState({ top: 0, left: 0 });
  const [brandsMenuPosition, setBrandsMenuPosition] = useState({ top: 0, left: 0 });
  const [activeSubcategories, setActiveSubcategories] = useState<number | null>(null);
  const [isHoveringBridge, setIsHoveringBridge] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const [aboutMenuPosition, setAboutMenuPosition] = useState({ top: 0, left: 0 });
  const router = useRouter();
  const catalogRef = useRef<HTMLDivElement | null>(null);
  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const catalogLinkRef = useRef<HTMLAnchorElement | null>(null);
  const brandsLinkRef = useRef<HTMLAnchorElement | null>(null);
  const aboutLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Хук для поиска товаров
  const { products, loading } = useSearchProducts(searchQuery);

  // Обновленные данные для каталога с подкатегориями
  const catalogData = {
    lighting: [
      { 
        title: 'Люстры', 
        link: '/osveheny?category=Люстра',
        subcategories: [
          { title: 'Подвесные люстры', link: '/osveheny?category=Люстра&page=1' },
          { title: 'Потолочные люстры', link: '/osveheny?category=Люстра&page=1' },
          { title: 'Каскадные люстры', link: '/osveheny?category=Люстра&page=1' },
          { title: 'Хрустальные люстры', link: '/osveheny?category=Люстра&page=1' },
          { title: 'Современные люстры', link: '/osveheny?category=Люстра&page=1' }
        ]
      },
      { 
        title: 'Светильники', 
        link: '/osveheny?category=Светильник',
        subcategories: [
          { title: 'Встраиваемые светильники', link: '/osveheny?category=Светильник&page=1' },
          { title: 'Накладные светильники', link: '/osveheny?category=Светильник&page=1' },
          { title: 'Трековые светильники', link: '/osveheny?category=Светильник&page=1' },
          { title: 'Точечные светильники', link: '/osveheny?category=Светильник&page=1' }
        ]
      },
      { 
        title: 'Торшеры', 
        link: '/osveheny?category=Торшер',
        subcategories: [
          { title: 'Классические торшеры', link: '/osveheny?category=Торшер&page=1' },
          { title: 'Современные торшеры', link: '/osveheny?category=Торшер&page=1' },
          { title: 'Торшеры с регулировкой', link: '/osveheny?category=Торшер&page=1' }
        ]
      },
      { 
        title: 'Бра', 
        link: '/osveheny?category=Бра',
        subcategories: [
          { title: 'Настенные бра', link: '/osveheny?category=Бра&page=1' },
          { title: 'Светодиодные бра', link: '/osveheny?category=Бра&page=1' },
          { title: 'Классические бра', link: '/osveheny?category=Бра&page=1' },
          { title: 'Современные бра', link: '/osveheny?category=Бра&page=1' }
        ]
      },
      { 
        title: 'Уличные светильники', 
        link: '/osveheny?category=Уличный светильник',
        subcategories: [
          { title: 'Настенные уличные светильники', link: '/osveheny?category=Уличный светильник&page=1' },
          { title: 'Столбы освещения', link: '/osveheny?category=Уличный светильник&page=1' },
          { title: 'Грунтовые светильники', link: '/osveheny?category=Уличный светильник&page=1' },
          { title: 'Прожекторы', link: '/osveheny?category=Уличный светильник&page=1' }
        ]
      },
      { 
        title: 'Комплектующие', 
        link: '/osveheny?category=Комплектующие',
        subcategories: [
          { title: 'Трансформаторы', link: '/osveheny?category=Комплектующие&page=1' },
          { title: 'Драйверы', link: '/osveheny?category=Комплектующие&page=1' },
          { title: 'Блоки питания', link: '/osveheny?category=Комплектующие&page=1' }
        ]
      },
      { 
        title: 'Светодиодные ленты', 
        link: '/osveheny?category=Светодиодная лента',
        subcategories: [
          { title: 'Одноцветные ленты', link: '/osveheny?category=Светодиодная лента&page=1' },
          { title: 'RGB ленты', link: '/osveheny?category=Светодиодная лента&page=1' },
          { title: 'Профили для лент', link: '/osveheny?category=Светодиодная лента&page=1' }
        ]
      },
      { 
        title: 'Светодиодные лампы', 
        link: '/osveheny?category=Светодиодная лампа',
        subcategories: [
          { title: 'Лампы E27', link: '/osveheny?category=Светодиодная лампа&page=1' },
          { title: 'Лампы E14', link: '/osveheny?category=Светодиодная лампа&page=1' },
          { title: 'Лампы GU10', link: '/osveheny?category=Светодиодная лампа&page=1' },
          { title: 'Трубчатые лампы', link: '/osveheny?category=Светодиодная лампа&page=1' }
        ]
      }
    ],
    electrical: [
      { 
        title: 'Встраиваемые серии', 
        link: '/catalog/Встраиваемые-серии',
        subcategories: [
          { title: 'Розетки', link: '/catalog/Встраиваемые-серии/Розетки' },
          { title: 'Выключатели', link: '/catalog/Встраиваемые-серии/Выключатели' },
          { title: 'Рамки', link: '/catalog/Встраиваемые-серии/Рамки' }
        ]
      },
      { 
        title: 'Выдвижной блок', 
        link: '/catalog/Выдвижной-блок',
        subcategories: [
          { title: 'В столешницу', link: '/catalog/Выдвижной-блок/В-столешницу' },
          { title: 'В розетку', link: '/catalog/Выдвижной-блок/В-розетку' }
        ]
      },
      { 
        title: 'Накладные серии', 
        link: '/catalog/Накладные-серии',
        subcategories: [
          { title: 'Розетки', link: '/catalog/Накладные-серии/Розетки' },
          { title: 'Выключатели', link: '/catalog/Накладные-серии/Выключатели' }
        ]
      }
    ]
  };

  // Данные для брендов
  const brandsData = [
    { title: 'Artelamp', link: '/brands/artelamp', logo: '/images/artelamplogo.png' },
    { title: 'Denkirs', link: '/brands/denkirs', logo: '/images/denkirslogo1.png' },
    { title: 'Elektrostandart', link: '/brands/elektrostandart', logo: '/images/elektrostandartlogo.png' },
    { title: 'Kinklight', link: '/brands/kinklight', logo: '/images/kinklightlogo.png' },
    { title: 'Lightstar', link: '/brands/lightstar', logo: '/images/lightstarlogo.png' },
    { title: 'Lumion', link: '/brands/lumion', logo: '/images/lumionlogo.png' },
    { title: 'Maytoni', link: '/brands/maytoni', logo: '/images/maytonilogo.png' },
    { title: 'Novotech', link: '/brands/novotech', logo: '/images/novotechlogo.png' },
    { title: 'Odeon Light', link: '/brands/odeonlight', logo: '/images/odeonlightlogo.png' },
    { title: 'Sonex', link: '/brands/sonex', logo: '/images/sonexlogo1.png' },
    { title: 'St Luce', link: '/brands/stluce', logo: '/images/stlucelogo.png' },
    { title: 'Voltum', link: '/brands/voltum', logo: '/images/voltumlogo.png' },
    { title: 'Werkel', link: '/brands/werkel', logo: '/images/werkellogo.png' }
  ];

  // Данные для меню "О нас"
  const aboutData = {
    sections: [
      {
        title: 'О компании',
        items: [
          'Более 10 лет на рынке светотехники',
          'Прямые поставки от производителей',
          'Гарантия качества на все товары',
          'Профессиональная консультация',
          'Широкий ассортимент продукции'
        ]
      },  
    ],
    image: '/images/Снимок экрана 2025-06-29 163412.png'
  };

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

  // Функция для безопасного обновления состояния при наведении
  const handleCategoryHover = (index: number | null) => {
    setActiveSubcategories(index);
    setIsHoveringBridge(false);
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

  // Блокировка скролла при открытом мобильном меню
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

  // Обработчик клика по товару из выпадающего списка
  const handleProductClick = (query: string) => {
    if (query.trim()) {
      const encodedSearchQuery = encodeURIComponent(query);
      router.push(`/search/${encodedSearchQuery}?query=${encodedSearchQuery}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  // Обработчик поиска
  const handleSearch = () => {
    if (searchQuery.trim()) {
      handleProductClick(searchQuery);
    }
  };

  // Обработчик нажатия Enter в поле поиска
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Закрытие поиска по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen]);

  const toggleAccordionItem = (index: number) => {
    setExpandedAccordionItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index) 
        : [...prev, index]
    );
  };

  // Функции для обработки выпадающих меню
  const handleCatalogMouseEnter = () => {
    if (catalogLinkRef.current) {
      const rect = catalogLinkRef.current.getBoundingClientRect();
      const menuWidth = 600;
      const menuHeight = 650;
      const centerPosition = rect.left + rect.width / 2 - menuWidth / 2;
      const maxLeft = window.innerWidth - menuWidth - 10;
      
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenAbove = spaceBelow < menuHeight + 20;
      
      setCatalogMenuPosition({
        top: shouldOpenAbove ? rect.top - menuHeight - 8 : rect.bottom + 8,
        left: Math.max(10, Math.min(centerPosition, maxLeft))
      });
    }
    setIsCatalogMenuOpen(true);
  };

  const handleCatalogMouseLeave = (e: React.MouseEvent) => {
    setTimeout(() => {
      const catalogMenu = document.getElementById('catalog-menu');
      const catalogLink = catalogLinkRef.current;
      
      if (catalogMenu && catalogLink) {
        const menuRect = catalogMenu.getBoundingClientRect();
        const linkRect = catalogLink.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const inMenu = mouseX >= menuRect.left && mouseX <= menuRect.right && 
                      mouseY >= menuRect.top && mouseY <= menuRect.bottom;
        const inLink = mouseX >= linkRect.left && mouseX <= linkRect.right && 
                      mouseY >= linkRect.top && mouseY <= linkRect.bottom;
        
        if (!inMenu && !inLink) {
          setIsCatalogMenuOpen(false);
        }
      }
    }, 100);
  };

  const handleBrandsMouseEnter = () => {
    if (brandsLinkRef.current) {
      const rect = brandsLinkRef.current.getBoundingClientRect();
      const menuWidth = 500;
      const menuHeight = 350;
      const centerPosition = rect.left + rect.width / 2 - menuWidth / 2;
      const maxLeft = window.innerWidth - menuWidth - 10;
      
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenAbove = spaceBelow < menuHeight + 20;
      
      setBrandsMenuPosition({
        top: shouldOpenAbove ? rect.top - menuHeight - 8 : rect.bottom + 8,
        left: Math.max(10, Math.min(centerPosition, maxLeft))
      });
    }
    setIsBrandsMenuOpen(true);
  };

  const handleBrandsMouseLeave = (e: React.MouseEvent) => {
    setTimeout(() => {
      const brandsMenu = document.getElementById('brands-menu');
      const brandsLink = brandsLinkRef.current;
      
      if (brandsMenu && brandsLink) {
        const menuRect = brandsMenu.getBoundingClientRect();
        const linkRect = brandsLink.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const inMenu = mouseX >= menuRect.left && mouseX <= menuRect.right && 
                      mouseY >= menuRect.top && mouseY <= menuRect.bottom;
        const inLink = mouseX >= linkRect.left && mouseX <= linkRect.right && 
                      mouseY >= linkRect.top && mouseY <= linkRect.bottom;
        
        if (!inMenu && !inLink) {
          setIsBrandsMenuOpen(false);
        }
      }
    }, 100);
  };

  // Обработчики для меню "О нас"
  const handleAboutMouseEnter = () => {
    if (aboutLinkRef.current) {
      const rect = aboutLinkRef.current.getBoundingClientRect();
      const menuWidth = 800;
      const menuHeight = 650;
      const centerPosition = rect.left + rect.width / 2 - menuWidth / 2;
      const maxLeft = window.innerWidth - menuWidth - 10;
      
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenAbove = spaceBelow < menuHeight + 20;
      
      setAboutMenuPosition({
        top: shouldOpenAbove ? rect.top - menuHeight - 8 : rect.bottom + 8,
        left: Math.max(10, Math.min(centerPosition, maxLeft))
      });
    }
    setIsAboutMenuOpen(true);
  };

  const handleAboutMouseLeave = (e: React.MouseEvent) => {
    setTimeout(() => {
      const aboutMenu = document.getElementById('about-menu');
      const aboutLink = aboutLinkRef.current;
      
      if (aboutMenu && aboutLink) {
        const menuRect = aboutMenu.getBoundingClientRect();
        const linkRect = aboutLink.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const inMenu = mouseX >= menuRect.left && mouseX <= menuRect.right && 
                      mouseY >= menuRect.top && mouseY <= menuRect.bottom;
        const inLink = mouseX >= linkRect.left && mouseX <= linkRect.right && 
                      mouseY >= linkRect.top && mouseY <= linkRect.bottom;
        
        if (!inMenu && !inLink) {
          setIsAboutMenuOpen(false);
        }
      }
    }, 100);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .catalog-menu-enter {
          animation: slideFromLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .brands-menu-enter {
          animation: slideFromLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        @keyframes searchModalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .search-modal-enter {
          animation: searchModalFadeIn 0.3s ease-out;
        }
      `}</style>
      
      <div className="container mx-auto px-4">
        <header className="fixed top-4 left-0 right-0 z-[9998] w-full pointer-events-auto">
          <div className="max-w-7xl mx-auto px-4">
            {/* Основной хедер с прозрачным фоном и закругленными краями */}
            <div className="backdrop-blur-lg bg-black/50 text-black rounded-xl overflow-hidden shadow-xl">
              <div className="px-6">
                <div className="flex items-center justify-between h-16">
                  {/* Логотип */}
                  <a href="/" className="flex-shrink-0 text-white  text-2xl font-bold flex items-center">
                  MORELECKTRIKI
                  </a>

                  {/* Основное меню - десктоп */}
                  <nav className="hidden lg:flex items-center space-x-8 mx-4">
                    {/* Каталог с выпадающим меню */}
                    <div 
                      className="relative"
                      onMouseEnter={handleCatalogMouseEnter}
                      onMouseLeave={handleCatalogMouseLeave}
                    >
                   <a
  ref={catalogLinkRef}
  href="/products"
  className={`text-white text-base font-medium flex items-center px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${
    isCatalogMenuOpen
      ? 'bg-transparent backdrop-blur-xl translate-y-1'
      : 'hover:text-gray-300 hover:backdrop-blur-md'
  }`}
>
  Каталог
</a>

                    </div>

                    {/* О нас с выпадающим меню */}
                    <div 
                      className="relative"
                      onMouseEnter={handleAboutMouseEnter}
                      onMouseLeave={handleAboutMouseLeave}
                    >
                      <a
                        ref={aboutLinkRef}
                        href="/about"
                        className={`text-white text-base font-medium flex items-center px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${
                          isAboutMenuOpen
                            ? 'bg-transparent backdrop-blur-xl translate-y-1'
                            : 'hover:text-gray-300 hover:backdrop-blur-md'
                        }`}
                      >
                        О нас
                      </a>
                    </div>

                    {/* Бренды с выпадающим меню */}
                    <div 
                      className="relative"
                      onMouseEnter={handleBrandsMouseEnter}
                      onMouseLeave={handleBrandsMouseLeave}
                    >
                      <a
                        ref={brandsLinkRef}
                        href="/brands"
                        className={`text-white text-base font-medium flex items-center px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${
                          isBrandsMenuOpen
                            ? 'bg-transparent backdrop-blur-xl translate-y-1'
                            : 'hover:text-gray-300 hover:backdrop-blur-md'
                        }`}
                      >
                        Бренды
                      </a>
                    </div>

                    {/* Документация */}
                    <a
                      href="/documentation"
                      className="text-white hover:text-gray-300 text-base font-medium transition-colors"
                    >
                      Документация
                    </a>
                  </nav>

                  {/* Правая часть - поиск, сравнение, избранное, корзина */}
                  <div className="flex items-center space-x-6">
                    {/* Поиск */}
                    <button 
                      onClick={() => setIsSearchOpen(true)}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                    
                    {/* Разделитель */}
                    <span className="h-6 w-px bg-white/50"></span>
                    
                    
                    {/* Избранное */}
                    <a href="/favorites" className="text-white hover:text-gray-300">
                      <Heart className="w-5 h-5" />
                    </a>
                    
                    {/* Корзина */}
                    <a href="/cart" className="text-white hover:text-gray-300">
                      <ShoppingCart className="w-5 h-5" />
                    </a>

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
              
            
            </div>
          </div>

          {/* Мобильное меню */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-lg bg-opacity-95  overflow-y-auto rounded-lg">
              <div className="max-w-7xl mx-auto px-4 py-4">
                {/* Верхняя панель с логотипом и кнопкой закрытия */}
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                  <a href="/" className="flex-shrink-0 text-white text-2xl font-bold flex items-center">
                    <span className='text-white text-3xl font-light'>MORELECKTRIKI</span>
                  </a>
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
                    <a 
                      href="/products"
                      className="flex items-center justify-between py-3 px-2 text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                    >
                      <span>Каталог</span>
                    </a>
                    <a 
                      href="/about"
                      className="flex items-center justify-between py-3 px-2 text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                    >
                      <span>О нас</span>
                    </a>
                    <a 
                      href="/brands"
                      className="flex items-center justify-between py-3 px-2 text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                    >
                      <span>Бренды</span>
                    </a>
                    <a 
                      href="/documentation"
                      className="flex items-center justify-between py-3 px-2 text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                    >
                      <span>Документация</span>
                    </a>
                  </div>
                </div>

                {/* Контактная информация */}
                <div className="mt-8 border-t border-gray-700 pt-6">
                  <div className="flex flex-col space-y-4">
                    <a href="tel:88005509084" className="flex items-center text-white">                   
                      8-800-550-90-84
                    </a>
                    <a href="mailto:info@donel.su" className="flex items-center text-white">
                      MORELECKTRIKI@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Модальное окно поиска */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Блюр фон */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />
          
          {/* Модальное окно */}
          <div className="relative  backdrop-blur-2xl bg-black/20 rounded-2xl shadow-2xl w-full max-w-2xl search-modal-enter">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-3">
              <h3 className="text-5xl font-semibold text-white">Поиск товаров</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2  rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Поле поиска */}
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Введите название товара..."
                    className="w-full pl-12 pr-4 py-4 text-lg  bg-black/10 backdrop-blur-2xl   rounded-xl focus:ring-white  focus:border-transparent outline-none transition-all"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-8 py-4 bg- text-white rounded-xl  transition-colors font-medium"
                >
                  Найти
                </button>
              </div>
            </div>
            
            {/* Результаты поиска */}
            {searchQuery && (
              <div className="max-h-96 overflow-y-auto ">
                {searchResultsContent}
              </div>
            )}

           
          </div>
        </div>
      )}

      {/* Порталы для выпадающих меню */}
      {/* Каталог меню */}
      {typeof window !== 'undefined' && isCatalogMenuOpen && createPortal(
        <div 
          id="catalog-menu"
          className="fixed w-[820px] bg-black/60 backdrop-blur-xl rounded-lg shadow-2xl transition-all duration-300 ease-in-out catalog-menu-enter"
          style={{
            top: catalogMenuPosition.top,
            left: catalogMenuPosition.left,
            zIndex: 99999
          }}
          onMouseEnter={() => setIsCatalogMenuOpen(true)}
          onMouseLeave={() => {
            setIsCatalogMenuOpen(false);
            handleCategoryHover(null);
          }}
        >
          <div className="flex h-[650px]">
            {/* Левая часть с фото/подкатегориями */}
            <div 
              className="w-[500px] rounded-l-lg relative overflow-hidden"
              onMouseEnter={() => isHoveringBridge && activeSubcategories !== null && setIsHoveringBridge(true)}
              onMouseLeave={() => setIsHoveringBridge(false)}
            >
              <div className="absolute inset-0 transition-opacity duration-500 ease-in-out" 
                   style={{ opacity: activeSubcategories === null ? 1 : 0 }}>
                <img 
                  src="/images/Снимок экрана 2025-06-29 162945.png" 
                  alt="Каталог светильников"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 transition-opacity duration-500 ease-in-out"
                   style={{ opacity: activeSubcategories !== null ? 1 : 0 }}>
                {activeSubcategories !== null && (
                  <div className="w-full h-full bg-black/40 backdrop-blur-sm p-6 animate-fadeIn">
                    <h3 className="text-lg font-bold text-white mb-4 transition-transform duration-300 ease-out">
                      {activeSubcategories < catalogData.lighting.length 
                        ? catalogData.lighting[activeSubcategories].title
                        : catalogData.electrical[activeSubcategories - catalogData.lighting.length].title
                      }
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {(activeSubcategories < catalogData.lighting.length 
                        ? catalogData.lighting[activeSubcategories].subcategories
                        : catalogData.electrical[activeSubcategories - catalogData.lighting.length].subcategories
                      )?.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          href={sub.link}
                          className="block p-3 text-sm text-white hover:bg-white/10 rounded-lg transition-all duration-300 ease-in-out hover:translate-x-1"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Правая часть с категориями */}
            <div className="flex-1 p-6">
              {/* Освещение */}
              <div className="mb-8">
                <h4 className="text-lg font-bold mb-4 text-white tracking-wide">ОСВЕЩЕНИЕ</h4>
                <div className="grid grid-cols-1 gap-2">
                  {catalogData.lighting.map((item, index) => (
                    <div
                      key={index}
                      className="relative group"
                      onMouseEnter={() => handleCategoryHover(index)}
                    >
                      <div className="flex">
                        <Link
                          href={item.link}
                          className="flex-1 flex items-center p-2 hover:bg-black/60 rounded-lg transition-all duration-300 ease-in-out text-white hover:backdrop-blur-2xl group border-l-2 border-transparent"
                        >
                          <span className="text-sm transition-all duration-300 ease-in-out font-medium">{item.title}</span>
                        </Link>
                        {/* Широкая область для навигации */}
                        <div 
                          className="w-24 h-full"
                          onMouseEnter={() => {
                            setIsHoveringBridge(true);
                            handleCategoryHover(index);
                          }}
                          onMouseLeave={() => {
                            if (!isHoveringBridge) {
                              handleCategoryHover(null);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Электроустановочное оборудование */}
              <div>
                <h4 className="text-lg font-bold mb-4 text-white tracking-wide">ЭЛЕКТРОУСТАНОВОЧНОЕ ОБОРУДОВАНИЕ</h4>
                <div className="grid grid-cols-1 gap-2">
                  {catalogData.electrical.map((item, index) => (
                    <div
                      key={index}
                      className="relative group"
                      onMouseEnter={() => handleCategoryHover(index + catalogData.lighting.length)}
                    >
                      <div className="flex">
                        <Link
                          href={item.link}
                          className="flex-1 flex items-center p-2 hover:bg-black/60 rounded-lg transition-all duration-300 ease-in-out text-white hover:backdrop-blur-2xl group border-l-2 border-transparent"
                        >
                          <span className="text-sm transition-all duration-300 ease-in-out font-medium">{item.title}</span>
                        </Link>
                        {/* Широкая область для навигации */}
                        <div 
                          className="w-24 h-full"
                          onMouseEnter={() => {
                            setIsHoveringBridge(true);
                            handleCategoryHover(index + catalogData.lighting.length);
                          }}
                          onMouseLeave={() => {
                            if (!isHoveringBridge) {
                              handleCategoryHover(null);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* О нас меню */}
      {typeof window !== 'undefined' && isAboutMenuOpen && createPortal(
        <div 
          id="about-menu"
          className="fixed w-[800px] bg-black/60 backdrop-blur-xl rounded-lg shadow-2xl transition-all duration-300 ease-in-out catalog-menu-enter"
          style={{
            top: aboutMenuPosition.top,
            left: aboutMenuPosition.left,
            zIndex: 99999
          }}
          onMouseEnter={() => setIsAboutMenuOpen(true)}
          onMouseLeave={() => setIsAboutMenuOpen(false)}
        >
          <div className="flex h-[650px]">
            {/* Левая часть с фото */}
            <div className="w-[500px] rounded-l-lg relative overflow-hidden">
              <img 
                src={aboutData.image}
                alt="О нашей компании"
                className="w-full h-full object-cover"
              />
         
            </div>
            
            {/* Правая часть с информацией */}
            <div className="flex-1 p-8">
              <h3 className="text-2xl font-bold text-white mb-8">О нашей компании</h3>
              
              {aboutData.sections.map((section, index) => (
                <div key={index} className="mb-8">
                  <h4 className="text-lg font-bold mb-4 text-white tracking-wide">
                    {section.title}
                  </h4>
                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex}
                        className="flex items-center p-2 text-white hover:bg-black/60 rounded-lg transition-all duration-300 ease-in-out group"
                      >
                        <div className="w-2 h-2  rounded-full mr-3"></div>
                        <span className="text-sm transition-all duration-300 ease-in-out font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Бренды меню */}
      {typeof window !== 'undefined' && isBrandsMenuOpen && createPortal(
        <div 
          id="brands-menu"
          className="fixed w-[500px] bg-black/60 backdrop-blur-xl rounded-lg shadow-2xl transition-all duration-300 ease-in-out brands-menu-enter"
          style={{
            top: brandsMenuPosition.top,
            left: brandsMenuPosition.left,
            zIndex: 99999
          }}
          onMouseEnter={() => setIsBrandsMenuOpen(true)}
          onMouseLeave={() => setIsBrandsMenuOpen(false)}
        >
          <div className="p-4">
            <h4 className="text-base font-bold mb-4 text-white tracking-wide text-center">НАШИ БРЕНДЫ</h4>
            <div className="grid grid-cols-3 gap-2">
              {brandsData.map((brand, index) => (
                <Link
                  key={index}
                  href={brand.link}
                  className="flex flex-col items-center p-2 hover:backdrop-blur-2xl rounded-lg transition-all duration-200 group border border-transparent hover:border-white/20"
                >
                  <div 
                    className="relative w-[85px] h-[45px] mb-2 flex items-center justify-center bg-white/10 rounded-lg overflow-hidden"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img 
                      src={brand.logo} 
                      alt={brand.title}
                      style={{
                        maxWidth: '80%',
                        maxHeight: '80%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                      }}
                      className="filter brightness-0 invert group-hover:filter-none transition-all duration-200"
                    />
                  </div>
                  <span className="text-[10px] text-white text-center font-medium group-hover:text-blue-300 transition-colors">
                    {brand.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

     
    </>
  );
};

export default Header;