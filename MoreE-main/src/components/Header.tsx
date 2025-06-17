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
  const [catalogMenuPosition, setCatalogMenuPosition] = useState({ top: 0, left: 0 });
  const router = useRouter();
  const catalogRef = useRef<HTMLDivElement | null>(null);
  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const catalogLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Хук для поиска товаров
  const { products, loading } = useSearchProducts(searchQuery);

  // Данные для каталога
  const catalogData = {
    lighting: [
      { title: 'Люстры', link: '/catalog/Люстры' },
      { title: 'Светильники', link: '/catalog/Светильники' },
      { title: 'Торшеры', link: '/catalog/Торшеры' },
      { title: 'Бра', link: '/catalog/Бра' },
      { title: 'Уличные светильники', link: '/catalog/Уличные-светильники' },
      { title: 'Комплектующие', link: '/catalog/Комплектующие' },
      { title: 'Светодиодные ленты', link: '/catalog/Светодиодные-ленты' },
      { title: 'Светодиодные лампы', link: '/catalog/Светодиодные-лампы' }
    ],
    electrical: [
      { title: 'Встраиваемые серии', link: '/catalog/Встраиваемые-серии' },
      { title: 'Выдвижной блок', link: '/catalog/Выдвижной-блок' },
      { title: 'Накладные серии', link: '/catalog/Накладные-серии' }
    ]
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
      const maxLeft = window.innerWidth - menuWidth - 10; // 10px отступ от правого края
      
      // Проверяем, помещается ли меню снизу
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenAbove = spaceBelow < menuHeight + 20;
      
      setCatalogMenuPosition({
        top: shouldOpenAbove ? rect.top - menuHeight - 8 : rect.bottom - 4, // Уменьшили отступ для соединения
        left: Math.max(10, Math.min(centerPosition, maxLeft))
      });
    }
    setIsCatalogMenuOpen(true);
  };

  const handleCatalogMouseLeave = (e: React.MouseEvent) => {
    // Добавляем небольшую задержку для плавного перехода
    setTimeout(() => {
      const catalogMenu = document.getElementById('catalog-menu');
      const catalogLink = catalogLinkRef.current;
      
      if (catalogMenu && catalogLink) {
        const menuRect = catalogMenu.getBoundingClientRect();
        const linkRect = catalogLink.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Проверяем, находится ли курсор в области меню или ссылки
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
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-5px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .catalog-menu-enter {
          animation: slideDown 0.3s ease-out;
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
                  <Link href="/" className="flex-shrink-0 text-white  text-2xl font-bold flex items-center">
                  MORELECKTRIKI
                  </Link>

                  {/* Основное меню - десктоп */}
                  <nav className="hidden lg:flex items-center space-x-8 mx-4">
                    {/* Каталог с выпадающим меню */}
                    <div 
                      className="relative"
                      onMouseEnter={handleCatalogMouseEnter}
                      onMouseLeave={handleCatalogMouseLeave}
                    >
                      <Link
                        ref={catalogLinkRef}
                        href="/products"
                        className={`text-white text-base font-medium transition-all duration-300 flex items-center px-4 py-2 rounded-lg ${
                          isCatalogMenuOpen 
                            ? 'bg-black/60 backdrop-blur-xl transform translate-y-1' 
                            : 'hover:text-gray-300'
                        }`}
                      >
                        Каталог
                      </Link>
                    </div>

                    {/* О нас */}
                    <Link
                      href="/about"
                      className="text-white hover:text-gray-300 text-base font-medium transition-colors"
                    >
                      О нас
                    </Link>

                                        {/* Бренды без выпадающего меню */}
                    <Link
                      href="/brands"
                      className="text-white hover:text-gray-300 text-base font-medium transition-colors"
                    >
                      Бренды
                    </Link>

                    {/* Документация */}
                    <Link
                      href="/documentation"
                      className="text-white hover:text-gray-300 text-base font-medium transition-colors"
                    >
                      Документация
                    </Link>
                  </nav>

                  {/* Правая часть - поиск, сравнение, избранное, корзина */}
                  <div className="flex items-center space-x-6">
                    {/* Поиск */}
                    <button className="text-white hover:text-gray-300">
                      <Search className="w-5 h-5" />
                    </button>
                    
                    {/* Разделитель */}
                    <span className="h-6 w-px bg-white/50"></span>
                    
                    
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
              
            
            </div>
          </div>

          {/* Мобильное меню */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-lg bg-opacity-95  overflow-y-auto rounded-lg">
              <div className="max-w-7xl mx-auto px-4 py-4">
                {/* Верхняя панель с логотипом и кнопкой закрытия */}
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                  <Link href="/" className="flex-shrink-0 text-white text-2xl font-bold flex items-center">
                    <span className='text-white text-3xl font-light'>MORELECKTRIKI</span>
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
                    <Link 
                      href="/products"
                      className="flex items-center justify-between py-3 px-2 text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                    >
                      <span>Каталог</span>
                    </Link>
                    <Link 
                      href="/about"
                      className="flex items-center justify-between py-3 px-2 text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                    >
                      <span>О нас</span>
                    </Link>
                    <Link 
                      href="/brands"
                      className="flex items-center justify-between py-3 px-2 text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                    >
                      <span>Бренды</span>
                    </Link>
                    <Link 
                      href="/documentation"
                      className="flex items-center justify-between py-3 px-2 text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                    >
                      <span>Документация</span>
                    </Link>
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
                      MORELECKTRIKI@gmail.com
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Порталы для выпадающих меню */}
      {typeof window !== 'undefined' && isCatalogMenuOpen && createPortal(
        <div 
          id="catalog-menu"
          className="fixed w-[600px] bg-black/60 backdrop-blur-xl rounded-lg shadow-2xl transition-all duration-300 ease-in-out  catalog-menu-enter"
          style={{
            top: catalogMenuPosition.top,
            left: catalogMenuPosition.left,
            zIndex: 99999
          }}
          onMouseEnter={() => setIsCatalogMenuOpen(true)}
          onMouseLeave={() => setIsCatalogMenuOpen(false)}
        >
          <div className="flex h-[650px]">
            {/* Левая часть только с изображением */}
            <div className="w-[200px] rounded-l-lg relative overflow-hidden">
              <img 
                src="/images/assets_task_01jrdpq6eef67argn1c1279zna_img_0.webp" 
                alt="Каталог светильников"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Правая часть с категориями */}
            <div className="flex-1 p-6">
              {/* Освещение */}
              <div className="mb-8">
                <h4 className="text-lg font-bold mb-4 text-white tracking-wide">ОСВЕЩЕНИЕ</h4>
                <div className="grid grid-cols-1 gap-2">
                  {catalogData.lighting.map((item, index) => (
                    <Link
                      key={index}
                      href={item.link}
                      className="flex items-center p-2 hover:backdrop-blur-2xl rounded-lg transition-all duration-150 text-white group border-l-2 border-transparent"
                    >
                      <span className="text-sm  transition-colors font-medium">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Электроустановочное оборудование */}
              <div>
                <h4 className="text-lg font-bold mb-4 text-white tracking-wide">ЭЛЕКТРОУСТАНОВОЧНОЕ ОБОРУДОВАНИЕ</h4>
                <div className="grid grid-cols-1 gap-2">
                  {catalogData.electrical.map((item, index) => (
                    <Link
                      key={index}
                      href={item.link}
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-all duration-150 text-white hover:backdrop-blur-2xl group border-l-2 border-transparent hover:border-blue-500"
                    >
                      <span className="text-sm group-hover:text-blue-600 transition-colors font-medium">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}


     
    </>
  );
};

export default Header;