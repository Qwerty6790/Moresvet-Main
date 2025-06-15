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
  const [isBrandsMenuOpen, setIsBrandsMenuOpen] = useState(false);
  const [catalogMenuPosition, setCatalogMenuPosition] = useState({ top: 0, left: 0 });
  const [brandsMenuPosition, setBrandsMenuPosition] = useState({ top: 0, left: 0 });
  const router = useRouter();
  const catalogRef = useRef<HTMLDivElement | null>(null);
  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const catalogLinkRef = useRef<HTMLAnchorElement | null>(null);
  const brandsLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Хук для поиска товаров
  const { products, loading } = useSearchProducts(searchQuery);

  // Данные для каталога (виды светильников)
  const catalogCategories = [
    { title: 'Подвесные', image: '/images/ЛюстраME.webp', link: '/catalog/Подвесные' },
    { title: 'Потолочные', image: '/images/светильникME.webp', link: '/catalog/Потолочные' },
    { title: 'Настенные', image: '/images/БраME.webp', link: '/catalog/Настенные' },
    { title: 'Настенно-потолочные', image: '/images/светильникME.webp', link: '/catalog/Настенно-потолочные' },
    { title: 'Накладные светильники', image: '/images/светильникME.webp', link: '/catalog/Накладные' },
    { title: 'Встраиваемые', image: '/images/трековый-светильникME.webp', link: '/catalog/Встраиваемые' },
    { title: 'Точечные светильники', image: '/images/трековый-светильникME.webp', link: '/catalog/Точечные' },
    { title: 'Ночники', image: '/images/настольнаялампаME.webp', link: '/catalog/Ночники' },
    { title: 'Мебельные', image: '/images/настольнаялампаME.webp', link: '/catalog/Мебельные' },
    { title: 'Для растений', image: '/images/светоидоднаялампаME.webp', link: '/catalog/Для-растений' },
    { title: 'Бактерицидные светильники и облучатели', image: '/images/УличныйСветME.png', link: '/catalog/Бактерицидные' },
    { title: 'Элитные светильники', image: '/images/ЛюстраME.webp', link: '/catalog/Элитные' }
  ];

  // Данные для брендов
  const brandCategories = [
    { title: 'MAYTONI', image: '/images/maytonilogo.png', link: '/brands/maytoni' },
    { title: 'FAVOURITE', image: '/images/favouritelogo.png', link: '/brands/favourite' },
    { title: 'ODEON LIGHT', image: '/images/odeonlightlogo.png', link: '/brands/odeon' },
    { title: 'ARTE LAMP', image: '/images/artelamplogo.png', link: '/brands/arte' },
    { title: 'LIGHTSTAR', image: '/images/lightstarlogo.png', link: '/brands/lightstar' },
    { title: 'LUMION', image: '/images/lumionlogo.png', link: '/brands/lumion' },
    { title: 'KINKLIGHT', image: '/images/kinklightlogo.png', link: '/brands/kinklight' },
    { title: 'SONEX', image: '/images/sonexlogo1.png', link: '/brands/sonex' },
    { title: 'NOVOTECH', image: '/images/novotechlogo.png', link: '/brands/novotech' },
    { title: 'WERKEL', image: '/images/werkellogo.png', link: '/brands/werkel' },
    { title: 'ST LUCE', image: '/images/stlucelogo.png', link: '/brands/stluce' },
    { title: 'VOLTUM', image: '/images/voltumlogo.png', link: '/brands/voltum' }
  ];

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
      setCatalogMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2 - 400 // 400 = половина ширины меню (800px)
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

  const handleBrandsMouseEnter = () => {
    if (brandsLinkRef.current) {
      const rect = brandsLinkRef.current.getBoundingClientRect();
      setBrandsMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2 - 250 // 250 = половина ширины меню (500px)
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
                        className="text-white hover:text-gray-300 text-base font-medium transition-colors flex items-center"
                      >
                        Каталог
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Link>
                    </div>

                    {/* О нас */}
                    <Link
                      href="/about"
                      className="text-white hover:text-gray-300 text-base font-medium transition-colors"
                    >
                      О нас
                    </Link>

                    {/* Бренды с выпадающим меню */}
                    <div 
                      className="relative"
                      onMouseEnter={handleBrandsMouseEnter}
                      onMouseLeave={handleBrandsMouseLeave}
                    >
                      <Link
                        ref={brandsLinkRef}
                        href="/brands"
                        className="text-white hover:text-gray-300 text-base font-medium transition-colors flex items-center"
                      >
                        Бренды
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Link>
                    </div>

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
          className="fixed w-[800px] bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-200 ease-in-out"
          style={{
            top: catalogMenuPosition.top,
            left: catalogMenuPosition.left,
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-in-out'
          }}
          onMouseEnter={() => setIsCatalogMenuOpen(true)}
          onMouseLeave={() => setIsCatalogMenuOpen(false)}
        >
          <div className="flex h-[500px]">
            {/* Левая часть с изображением - точно как на фото */}
            <div className="w-[320px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-l-lg p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-3 leading-tight">СВЕТИЛЬНИКИ</h3>
                <p className="text-lg mb-6 leading-relaxed">для впечатляющих<br/>интерьеров</p>
                <div className="text-4xl font-bold tracking-wide">MAYTONI</div>
              </div>
              
              {/* Декоративные светильники - как на фото */}
              <div className="absolute top-6 right-6 w-20 h-20 rounded-full overflow-hidden border-4 border-white/30">
                <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/40 rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute top-32 right-12 w-16 h-16 rounded-full overflow-hidden border-4 border-white/30">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 via-teal-300 to-green-300 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white/40 rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute bottom-12 right-8 w-24 h-24 rounded-full overflow-hidden border-4 border-white/30">
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-300 rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/40 rounded-full"></div>
                </div>
              </div>
              
              {/* Сетка на фоне */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-white/20"></div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Правая часть с категориями */}
            <div className="flex-1 p-8">
              <h4 className="text-xl font-bold mb-6 text-gray-800 tracking-wide">ВИДЫ</h4>
              <div className="grid grid-cols-1 gap-3">
                {catalogCategories.map((category, index) => (
                  <Link
                    key={index}
                    href={category.link}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-all duration-150 text-gray-600 hover:text-gray-800 group border-l-2 border-transparent hover:border-blue-500"
                  >
                    <span className="text-base group-hover:text-blue-600 transition-colors font-medium">{category.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {typeof window !== 'undefined' && isBrandsMenuOpen && createPortal(
        <div 
          id="brands-menu"
          className="fixed w-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-200 ease-in-out"
          style={{
            top: brandsMenuPosition.top,
            left: brandsMenuPosition.left,
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-in-out'
          }}
          onMouseEnter={() => setIsBrandsMenuOpen(true)}
          onMouseLeave={() => setIsBrandsMenuOpen(false)}
        >
          <div className="p-6">
            <h4 className="text-lg font-bold mb-4 text-gray-800">Популярные бренды</h4>
            <div className="grid grid-cols-3 gap-4">
              {brandCategories.map((brand, index) => (
                <Link
                  key={index}
                  href={brand.link}
                  className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    <img 
                      src={brand.image} 
                      alt={brand.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 text-center">
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