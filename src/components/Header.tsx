'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'; // Добавлен useCallback
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchProductsWithSorting } from '@/utils/api';
import { FiSearch, FiX, FiMenu } from 'react-icons/fi'; // FiMenu added
// import { FaHeart, FaShoppingCart, FaShoppingBag } from 'react-icons/fa'; // Удалены импорты FaHeart и FaShoppingCart
import { getImageUrl } from '@/utils/constants';

interface Product {
  _id: string;
  article: string;
  name: string;
  source: string;
  stock: string;
  price: number;
  imageAddresses: string | string[];
  imageAddress?: string | string[];
}

// A new interface for items in the mini cart
interface CartItem {
    id: string;
    name: string;
    imageUrl: string | null;
    quantity: number;
    price: number;
}


const useSearchProducts = (query: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller: AbortController | null = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let mounted = true;

    const fetchProducts = async () => {
      if (!query || query.length < 2) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchProductsWithSorting(query, { limit: 6 }, controller ? controller.signal : undefined, true);
        if (!mounted) return;
        setProducts(data.products || []);
      } catch (error) {
        if ((error as any)?.name === 'CanceledError' || (error as any)?.message === 'canceled') {
          // запрос отменён — игнорируем
          return;
        }
        console.error('Ошибка при поиске товаров:', error);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const timer = window.setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => {
      mounted = false;
      try {
        if (controller) controller.abort();
      } catch (e) {
        // ignore
      }
      clearTimeout(timer);
    };
  }, [query]);

  return { products, loading };
};

const normalizeUrl = (url: string): string | null => {
  if (!url) return null;
  url = url.trim();
  if (url.includes('lightstar.ru')) {
    return url;
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.startsWith('/')) {
      return url;
    }
    url = 'https://' + url;
  }
  try {
    new URL(url);
    return url;
  } catch (e) {
    console.warn('Invalid URL:', url);
    return null;
  }
};

interface ProductI {
  _id: string;
  name: string;
  imageAddresses?: string | string[];
  imageAddress?: string | string[];
  article?: string;
}

interface SearchResultItemProps {
  product: ProductI;
  handleSearch: (searchTerm?: string) => void;
}

const SearchIcon = ({ className = "" }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M9 17A8 8 0 109 1a8 8 0 000 16z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M19 19l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Новая кастомная иконка "Избранное"
const HeartIcon = ({ className = "" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

// Новая кастомная иконка "Корзина"
const CartIcon = ({ className = "" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSocketsOpen, setIsSocketsOpen] = useState(false); // New state for sockets menu
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dropdownMounted, setDropdownMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuTimeoutRef = useRef<number | null>(null);
  const dropdownTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (mobileMenuTimeoutRef.current) {
        window.clearTimeout(mobileMenuTimeoutRef.current);
        mobileMenuTimeoutRef.current = null;
      }
    };
  }, []);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  
  // Refs for Catalog Menu
  const catalogHoverTimeoutRef = useRef<number | null>(null);
  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const catalogMenuRef = useRef<HTMLDivElement | null>(null);

  // Refs for Sockets Menu
  const socketsHoverTimeoutRef = useRef<number | null>(null);
  const socketsButtonRef = useRef<HTMLButtonElement | null>(null);
  const socketsMenuRef = useRef<HTMLDivElement | null>(null);
  
  const brandsButtonRef = useRef<HTMLButtonElement | null>(null);
  const brandsMenuRef = useRef<HTMLDivElement | null>(null);
  const brandsHoverTimeoutRef = useRef<number | null>(null);
  
  // Mini cart state and refs
  const cartIconRef = useRef<HTMLDivElement | null>(null);
  const miniCartRef = useRef<HTMLDivElement | null>(null);
  const [isMiniCartVisible, setIsMiniCartVisible] = useState(false);
  const [miniCartItems, setMiniCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const miniCartTimeoutRef = useRef<number | null>(null);

  const { products, loading } = useSearchProducts(searchQuery);

  const updateCartState = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
      if (Array.isArray(cartData.products)) {
        const total = cartData.products.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        const totalCost = cartData.products.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
        setCartCount(total);
        setCartTotal(totalCost);
        
        // Map products from localStorage to the CartItem interface
        const items: CartItem[] = cartData.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            imageUrl: getImageUrl(p.imageUrl || '/placeholder.jpg'),
            quantity: p.quantity,
            price: p.price
        }));
        setMiniCartItems(items);
      }
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
      setCartCount(0);
      setCartTotal(0);
      setMiniCartItems([]);
    }
  };
  
  // Listen for cart events
  useEffect(() => {
      const handleCartUpdate = () => {
          updateCartState();
      };
      
      const handleCartAdded = () => {
          updateCartState();
          setIsMiniCartVisible(true);
          if (miniCartTimeoutRef.current) window.clearTimeout(miniCartTimeoutRef.current);
          miniCartTimeoutRef.current = window.setTimeout(() => setIsMiniCartVisible(false), 2500);
      };
      
      window.addEventListener('cart:updated', handleCartUpdate);
      window.addEventListener('cart-added', handleCartAdded);
      
      // Initial cart state load
      updateCartState();
      
      return () => {
          window.removeEventListener('cart:updated', handleCartUpdate);
          window.removeEventListener('cart-added', handleCartAdded);
          if (miniCartTimeoutRef.current) {
              window.clearTimeout(miniCartTimeoutRef.current);
          }
      };
  }, []);

  // Mini cart hover logic
  const handleMiniCartEnter = () => {
      if (miniCartTimeoutRef.current) clearTimeout(miniCartTimeoutRef.current);
      setIsMiniCartVisible(true);
  };
  
  const handleMiniCartLeave = () => {
      miniCartTimeoutRef.current = window.setTimeout(() => {
          setIsMiniCartVisible(false);
      }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && searchResultsRef.current && 
          !searchInputRef.current.contains(event.target as Node) && 
          !searchResultsRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Управление монтированием дропдауна для плавного входа/выхода
  useEffect(() => {
    if (showSearchResults) {
      if (dropdownTimeoutRef.current) window.clearTimeout(dropdownTimeoutRef.current);
      setDropdownMounted(true);
      return;
    }

    // при закрытии даём 320ms на анимацию, затем размонтируем
    dropdownTimeoutRef.current = window.setTimeout(() => {
      setDropdownMounted(false);
      dropdownTimeoutRef.current = null;
    }, 320);

    return () => {
      if (dropdownTimeoutRef.current) {
        window.clearTimeout(dropdownTimeoutRef.current);
        dropdownTimeoutRef.current = null;
      }
    };
  }, [showSearchResults]);

  // Отслеживание скролла для изменения внешнего вида логотипа
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // --- ИСПРАВЛЕНИЕ: Оборачиваем handleSearch в useCallback ---
  const handleSearch = useCallback((queryOrEvent?: string | React.FormEvent) => {
    let finalQuery = '';
    if (typeof queryOrEvent === 'string') {
      finalQuery = queryOrEvent;
      setSearchQuery(queryOrEvent);
    } else if (queryOrEvent && 'preventDefault' in queryOrEvent) {
      queryOrEvent.preventDefault();
      finalQuery = searchQuery;
    } else {
      finalQuery = searchQuery;
    }
    if (!finalQuery.trim()) return;
    
    setShowSearchResults(false);
    const encodedSearchQuery = encodeURIComponent(finalQuery);
    router.push(`/search/${encodedSearchQuery}?query=${encodedSearchQuery}`);
  }, [router, searchQuery]); // Зависимости функции

  const SearchResultItem: React.FC<SearchResultItemProps> = ({ product, handleSearch }) => {
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [imageError, setImageError] = useState<boolean>(false);

    const { mainImage, debugImageUrl, hasImage } = useMemo(() => {
      if (
        typeof product.imageAddresses === 'string' &&
        product.imageAddresses.includes('lightstar.ru')
      ) {
        return {
          mainImage: null,
          debugImageUrl: product.imageAddresses,
          hasImage: true,
        };
      }

      let image: string | null = null;

      if (typeof product.imageAddresses === 'string') {
        const url = product.imageAddresses.trim();
        image = url.startsWith('http://') || url.startsWith('https://')
          ? url
          : normalizeUrl(url);
      } else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) {
        image = normalizeUrl(product.imageAddresses[0]);
      }

      if (!image) {
        if (typeof product.imageAddress === 'string') {
          image = normalizeUrl(product.imageAddress);
        } else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) {
          image = normalizeUrl(product.imageAddress[0]);
        }
      }

      return {
        mainImage: image,
        debugImageUrl: null,
        hasImage: !!image,
      };
    }, [product]);

    useEffect(() => {
      if (mainImage || debugImageUrl) {
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageError(true);
        img.src = mainImage || debugImageUrl || '';
      }
    }, [mainImage, debugImageUrl]);

    const imageUrl = hasImage && !imageError ? (debugImageUrl || mainImage) : '/placeholder.jpg';

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleSearch(product.name);
    };

    return (
      <div
        key={product._id}
        className={`flex items-center px-4 py-4 text-white cursor-pointer transition-all duration-200 bg-transparent rounded-md`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        <div className="relative w-20 h-20 mr-4 flex-shrink-0 overflow-hidden rounded-md">
          <img
            src={imageUrl ? getImageUrl(imageUrl) : '/placeholder.jpg'}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md"></div>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-base text-white line-clamp-2">{product.name}</span>
          {product.article && (
            <span className="text-sm text-white mt-1">Арт.: {product.article}</span>
          )}
        </div>
      </div>
    );
  };

  const searchResultsContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-black border-t-transparent"></div>
        </div>
      );
    }
    if (products.length > 0) {
      return (
        <div>
          <div className=" py-2 px-4">
            <h3 className="text-xs font-medium uppercase text-white">Результаты поиска</h3>
          </div>
          <div className="max-h-[60vh] max-w-[140vh] bg-black overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 p-3">
              {products.map((product) => (
                <SearchResultItem 
                  key={product._id} 
                  product={product} 
                  handleSearch={handleSearch} 
                />
              ))}
            </div>
          </div>
          <div className="border-t bg-black border-gray-100">
            <button
              onClick={() => handleSearch()}
              className="w-full py-3 text-xs font-medium uppercase text-white  transition-colors"
            >
              Показать все результаты
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="py-6 px-4 text-center">
        <p className="text-sm text-white">Ничего не найдено. Попробуйте использовать другие ключевые слова.</p>
      </div>
    );
  }, [products, loading, handleSearch]); // searchQuery убран, т.к. handleSearch уже зависит от него

  // --- Handlers for Catalog Menu ---
  const toggleCatalogMenu = () => setIsCatalogOpen(prev => !prev);
  const openCatalog = () => {
    if (catalogHoverTimeoutRef.current) {
      window.clearTimeout(catalogHoverTimeoutRef.current);
      catalogHoverTimeoutRef.current = null;
    }
    setIsCatalogOpen(true);
  };
  const closeCatalog = () => {
    if (catalogHoverTimeoutRef.current) window.clearTimeout(catalogHoverTimeoutRef.current);
    catalogHoverTimeoutRef.current = window.setTimeout(() => {
      setIsCatalogOpen(false);
      catalogHoverTimeoutRef.current = null;
    }, 160);
  };

  // --- Handlers for Sockets Menu ---
  const toggleSocketsMenu = () => setIsSocketsOpen(prev => !prev);
  const openSocketsMenu = () => {
    if (socketsHoverTimeoutRef.current) {
      window.clearTimeout(socketsHoverTimeoutRef.current);
      socketsHoverTimeoutRef.current = null;
    }
    setIsSocketsOpen(true);
  };
  const closeSocketsMenu = () => {
    if (socketsHoverTimeoutRef.current) window.clearTimeout(socketsHoverTimeoutRef.current);
    socketsHoverTimeoutRef.current = window.setTimeout(() => {
      setIsSocketsOpen(false);
      socketsHoverTimeoutRef.current = null;
    }, 160);
  };

  const [isBrandsOpen, setIsBrandsOpen] = useState(false);

  const openBrands = () => {
    if (brandsHoverTimeoutRef.current) {
      window.clearTimeout(brandsHoverTimeoutRef.current);
      brandsHoverTimeoutRef.current = null;
    }
    setIsBrandsOpen(true);
  };

  const closeBrands = () => {
    if (brandsHoverTimeoutRef.current) window.clearTimeout(brandsHoverTimeoutRef.current);
    brandsHoverTimeoutRef.current = window.setTimeout(() => {
      setIsBrandsOpen(false);
      brandsHoverTimeoutRef.current = null;
    }, 160);
  };

  const openSearchDropdown = () => {
    if (dropdownTimeoutRef.current) {
      window.clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setDropdownMounted(true);
    window.setTimeout(() => {
      setShowSearchResults(true);
      searchInputRef.current?.focus();
    }, 20);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        isCatalogOpen &&
        catalogMenuRef.current &&
        catalogButtonRef.current &&
        !catalogMenuRef.current.contains(target) &&
        !catalogButtonRef.current.contains(target)
      ) {
        setIsCatalogOpen(false);
      }

      if (
        isSocketsOpen &&
        socketsMenuRef.current &&
        socketsButtonRef.current &&
        !socketsMenuRef.current.contains(target) &&
        !socketsButtonRef.current.contains(target)
      ) {
        setIsSocketsOpen(false);
      }
      
      if (
        isBrandsOpen &&
        brandsMenuRef.current &&
        brandsButtonRef.current &&
        !brandsMenuRef.current.contains(target) &&
        !brandsButtonRef.current.contains(target)
      ) {
        setIsBrandsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCatalogOpen(false);
        setIsSocketsOpen(false);
        setIsBrandsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCatalogOpen, isSocketsOpen, isBrandsOpen]);

  return (
    <header className="w-full bg-transparent z-50 fixed top-0 left-0 right-0 shadow-lg h-18 md:h-18">
      {/* Основной хедер */}
      <div className="bg-black py-5 sm:py-4 ">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between">
          {/* Логотип */}
          <div className="absolute left-1/2 max-lg:left-[55%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className={`transition-all duration-300 ${showSearchResults || scrolled ? 'translate-x-[-1.5rem] scale-90' : 'translate-x-0 scale-100'}`}>
              <Link href="/" className={`flex items-center ${showSearchResults || scrolled ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                <span className={`md:text-5xl text-4xl font-bold tracking-widest transition-all duration-300 ${showSearchResults || scrolled ? 'text-1xl' : 'text-1xl'} text-white`}>LUMORALIGHT</span>
                <span className={`text-1xl max-lg:hidden font-bold tracking-widest transition-all duration-300 ${showSearchResults || scrolled ? 'text-1xl' : 'text-1xl'} text-white`}>2025</span>
              </Link>
            </div>
          </div>

          {/* Центральная навигация */}
          <nav className="hidden md:flex items-center gap-9 text-white uppercase text-sm font-bold tracking-wide">
            <Link href="/about" className="hover:text-gray-300">ПРАВИЛА ДОСТАВКИ</Link>
            <button
                ref={socketsButtonRef}
                onClick={() => setIsSocketsOpen(prev => !prev)}
                onMouseEnter={openSocketsMenu}
                onMouseLeave={closeSocketsMenu}
                aria-haspopup="true"
                aria-expanded={isSocketsOpen}
                className="relative flex items-center uppercase text-sm font-bold text-white hover:text-gray-300 transition-colors px-3 py-1"
            >
                РОЗЕТКИ И ВЫКЛЮЧАТЕЛИ
            </button>
          </nav>

          {/* Правые элементы */}
          <div className="hidden sm:flex items-center gap-4 text-white">
            <button 
              ref={catalogButtonRef}
              onClick={() => setIsCatalogOpen(prev => !prev)}
              onMouseEnter={openCatalog}
              onMouseLeave={closeCatalog}
              aria-haspopup="true"
              aria-expanded={isCatalogOpen}
              className="relative flex items-center uppercase text-sm font-bold text-white hover:text-gray-300 transition-colors px-3 py-1"
            >
              КАТАЛОГ
            </button>
            <button 
              onClick={openSearchDropdown} 
              aria-label="Поиск" 
              className="p-2 hover:text-gray-300"
            >
              <SearchIcon className="w-6 h-6" />
            </button>
            <button 
              disabled 
              aria-label="Личный кабинет" 
              className="text-sm font-bold px-3 py-2 cursor-not-allowed opacity-50"
            >
              ДЛЯ ДИЗАЙНЕРОВ
            </button>
            <Link href="/liked" aria-label="Избранное" className="p-2 hover:text-gray-300">
              <HeartIcon className="w-6 h-6" />
            </Link>
            <div
                ref={cartIconRef}
                className="relative p-2"
                onMouseEnter={handleMiniCartEnter}
                onMouseLeave={handleMiniCartLeave}
            >
                <Link href="/cart" aria-label="Корзина" className="relative hover:text-gray-300">
                    <CartIcon className="w-6 h-6" />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                            {cartCount}
                        </span>
                    )}
                </Link>

                {/* --- IMPROVED MINIMALIST MINI-CART DROPDOWN (WITH FIX) --- */}
                {isMiniCartVisible && (
                    <div
                        ref={miniCartRef}
                        className="absolute right-0 top-full mt-2 w-96 bg-white text-black rounded-lg shadow-2xl z-50 overflow-hidden"
                        onMouseEnter={handleMiniCartEnter}
                        onMouseLeave={handleMiniCartLeave}
                    >
                        {miniCartItems.length > 0 ? (
                            <>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-black">Корзина</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto border-t border-b border-gray-200">
    {/* Добавляем 'index' в параметры map */}
    {miniCartItems.map((item, index) => (
        /* Создаем гарантированно уникальный ключ */
        <div key={`${item.id}-${index}`} className="flex items-center gap-4 p-4">
            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-sm text-black">{item.quantity} для {(item.price || 0).toLocaleString('ru-RU')} ₽</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
                {(item.quantity * (item.price || 0)).toLocaleString('ru-RU')} ₽
            </p>
        </div>
    ))}
</div>
                                <div className="p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-base font-medium text-gray-900">Итого:</span>
                                        <span className="text-lg font-bold text-gray-900">{cartTotal.toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                    <Link href="/cart" className="block w-full text-center bg-black text-white py-3 rounded-lg text-sm font-semibold  transition-colors">
                                        Перейти в корзину
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-base text-gray-600">В корзине нет товаров</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Brands dropdown menu */}
            {isBrandsOpen && (
              <div
                ref={brandsMenuRef}
                onMouseEnter={openBrands}
                onMouseLeave={closeBrands}
                className="absolute left-0 right-0 top-[calc(100%)] bg-white shadow-lg z-40 overflow-visible transition-all duration-300 border-t border-gray-200"
              >
                <div className="w-full flex flex-col md:flex-row">
                  <div className="w-full md:flex-1 py-6 px-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-black uppercase">Бренды</h2>
                      <button onClick={() => setIsBrandsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={20} className="text-gray-700" /></button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 items-center">
                      {[
                          { file: 'artelamplogo.png', href: '/catalog/artelamp' },
                          { file: 'denkirslogo.png', href: '/catalog/denkirs' },
                          { file: 'elektrostandartlogo.png', href: '/catalog/elektrostandart' },
                          { file: 'favouritelogo.png', href: '/catalog/favourite' },
                          { file: 'kinklightlogo.png', href: '/catalog/kinklight' },
                          { file: 'lightstarlogo.png', href: '/catalog/lightstar' },
                          { file: 'lumionlogo.png', href: '/catalog/lumion' },
                          { file: 'maytonilogo.png', href: '/catalog/maytoni' },
                          { file: 'novotechlogo.png', href: '/catalog/novotech' },
                          { file: 'odeonlightlogo.png', href: '/catalog/odeonlight' },
                          { file: 'sonexlogo.png', href: '/catalog/sonex' },
                          { file: 'stlucelogo.png', href: '/catalog/stluce' },
                        ].map((b) => (
                          <Link key={b.file} href={b.href} className="flex items-center justify-center p-2 bg-black rounded">
                            <div className="w-32 h-12 flex items-center justify-center bg-black rounded overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`/images/brands/${b.file}`} alt={b.file.replace(/\.[^.]+$/, '')} className="max-w-full max-h-full object-contain" />
                            </div>
                          </Link>
                        ))
                      }
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/3 lg:w-1/4">
                    <div className="w-full  bg-center h-96" style={{ backgroundImage: "url('/images/banners/Bannersbrandsmenu.png')" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- MOBILE BURGER BUTTON --- */}
          <div className="flex sm:hidden items-center text-white">
            <button
              onClick={() => {
                setIsMobileMenuOpen(true);
                if (mobileMenuTimeoutRef.current) window.clearTimeout(mobileMenuTimeoutRef.current);
                mobileMenuTimeoutRef.current = window.setTimeout(() => setShowMobileMenu(true), 20);
              }}
              aria-label="Открыть меню"
              className="p-2"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Встроенный выпадающий поиск (вместо модального окна) */}
      {dropdownMounted && (
        <div ref={searchResultsRef} className="absolute left-0 right-0 top-[calc(100%+10px)] z-40 pointer-events-none">
          <div className="max-w-screen-xl mx-auto px-4 flex justify-center">
            <div className={`bg-black rounded-2xl shadow-xl overflow-hidden max-w-3xl w-full transform transition-all duration-300 ease-out ${showSearchResults ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Введите название товара..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-10 rounded-lg bg-black/20 text-white backdrop-blur-sm focus:outline-none"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">
                      <SearchIcon />
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowSearchResults(false); }}
                    className="p-2 text-white hover:text-gray-800"
                    aria-label="Закрыть поиск"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
              <div className="border-t border-white/10">
                {searchResultsContent}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- COMPREHENSIVE MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <>
          <div 
            className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            onClick={() => { 
              setShowMobileMenu(false); 
              mobileMenuTimeoutRef.current = window.setTimeout(() => setIsMobileMenuOpen(false), 300); 
            }} 
          />
          <div 
            className={`fixed top-0 left-0 z-50 bg-white h-full max-w-sm w-full shadow-2xl transform transition-transform duration-300 ease-in-out ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`} 
            role="dialog" 
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link href="/" className="text-2xl font-bold text-gray-900 tracking-wider">LUMORALIGHT</Link>
              <button 
                onClick={() => { 
                  setShowMobileMenu(false); 
                  mobileMenuTimeoutRef.current = window.setTimeout(() => setIsMobileMenuOpen(false), 300); 
                }} 
                className="p-2 text-gray-600 hover:text-black" 
                aria-label="Закрыть меню"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto h-[calc(100%-140px)]">
              <div className="space-y-6 text-gray-800">
                
                {/* Catalog Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Каталог</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-lg mb-2">Декоративный свет</h4>
                      <ul className="space-y-1 pl-2 border-l-2">
                          <li><Link href="/catalog/chandeliers/" className="block text-base py-1.5 hover:text-black transition-colors">Люстры</Link></li>
                          <li><Link href="/catalog/floor-lamps" className="block text-base py-1.5 hover:text-black transition-colors">Торшеры</Link></li>
                          <li><Link href="/catalog/wall-sconces" className="block text-base py-1.5 hover:text-black transition-colors">Бра</Link></li>
                          <li><Link href="/catalog/table-lamps" className="block text-base py-1.5 hover:text-black transition-colors">Настольная лампа</Link></li>
                          <li><Link href="/catalog/led-lamp" className="block text-base py-1.5 hover:text-black transition-colors">Лампы LED</Link></li>
                          <li><Link href="/catalog/led-strips" className="block text-base py-1.5 hover:text-black transition-colors">Светоидодная лампы</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Функциональный свет</h4>
                      <ul className='space-y-1 pl-2 border-l-2'>
                      <li><Link href="/catalog/lights/track-lights" className="block text-base hover:text-black">Трековые светильники</Link></li>
                        <li><Link href="/catalog/lights/pendant-lights" className="block text-base hover:text-black">Подвесные светильники</Link></li>
                        <li><Link href="/catalog/led-strip-profiles" className="block text-base hover:text-black">Профили</Link></li>
                        </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Уличный свет</h4>
                      <ul className="space-y-1 pl-2 border-l-2">
                        <li><Link href="/catalog/outdoor-lights" className="block text-base py-1.5 hover:text-black transition-colors">Уличные светильники</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sockets and Switches Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Розетки и выключатели</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-lg mb-2">Серии Voltum</h4>
                      <ul className="space-y-1 pl-2 border-l-2">
                          <li><Link href="/ElektroustnovohneIzdely/Voltum" className="block text-base py-1.5 hover:text-black">Встраиваемые серии</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Серия Werkel</h4>
                      <ul className="space-y-1 pl-2 border-l-2">
                          <li><Link href="/ElektroustnovohneIzdely/Werkel" className="block text-base py-1.5 hover:text-black">Встраиваемые серии</Link></li>
                          <li><Link href="/catalog/switches/two-key-switches" className="block text-base py-1.5 hover:text-black">Накладные серии</Link></li>
                          <li><Link href="/catalog/switches/pass-through-switches" className="block text-base py-1.5 hover:text-black">Серия Retro</Link></li>
                          <li><Link href="/catalog/switches/dimmers" className="block text-base py-1.5 hover:text-black">Серия Vintage</Link></li>
                          <li><Link href="/catalog/switches/dimmers" className="block text-base py-1.5 hover:text-black">Серия выдвижных блоков</Link></li>
                      </ul>
                    </div> 
                  </div>
                </div>

                {/* Other Links */}
                <div>
                   <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Информация</h3>
                   <ul className="space-y-1">
                      <li><Link href="/about" className="block text-lg py-2 hover:text-black transition-colors">Правила доставки</Link></li>
                      <li><span className="block text-lg py-2 text-gray-400 cursor-not-allowed">Для дизайнеров</span></li>
                      <li><Link href="/catalog?filter=new&subcategory=&page=1" className="block text-lg py-2 text-black hover:text-gray-700">Новинки</Link></li>
                   </ul>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-around">
                <Link href="/liked" className="flex flex-col items-center text-black hover:text-black transition-colors">
                  <HeartIcon className="w-6 h-6" />
                  <span className="text-xs mt-1">Избранное</span>
                </Link>
                <Link href="/cart" className="relative flex flex-col items-center text-black hover:text-black transition-colors">
                <CartIcon className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                      {cartCount}
                    </span>
                  )}
                  <span className="text-xs mt-1">Корзина</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sockets & Switches Dropdown Menu */}
      {isSocketsOpen && (
        <div
            ref={socketsMenuRef}
            onMouseEnter={openSocketsMenu}
            onMouseLeave={closeSocketsMenu}
            className="absolute left-0 right-0 top-[calc(100%)] bg-white shadow-lg z-40 overflow-visible transition-all duration-300 border-t border-gray-200"
        >
            <div className="w-full flex flex-col md:flex-row">
                <div className="w-full md:flex-1 py-8 px-4 sm:px-6 md:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-black uppercase">Розетки и выключатели</h2>
                        <button 
                            onClick={() => setIsSocketsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiX size={24} className="text-gray-700" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
                        <div className="text-black">
                        <h3 className="font-bold text-lg mb-2">Серии Voltum</h3>
                      <ul className="space-y-1 pl-2 border-l-2">
                          <li><Link href="/ElektroustnovohneIzdely/Voltum" className="block text-base py-1.5 hover:text-black">Встраиваемые серии</Link></li>
                      </ul>
                        </div>

                        <div className="text-black">
                        <h3 className="font-bold text-lg mb-2">Серия Werkel</h3>
                      <ul className="space-y-1 pl-2 border-l-2">
                          <li><Link href="/ElektroustnovohneIzdely/Werkel" className="block text-base py-1.5 hover:text-black">Встраиваемые серии</Link></li>
                          <li><Link href="/catalog/switches/two-key-switches" className="block text-base py-1.5 hover:text-black">Накладные серии</Link></li>
                          <li><Link href="/catalog/switches/pass-through-switches" className="block text-base py-1.5 hover:text-black">Серия Retro</Link></li>
                          <li><Link href="/catalog/switches/dimmers" className="block text-base py-1.5 hover:text-black">Серия Vintage</Link></li>
                          <li><Link href="/catalog/switches/dimmers" className="block text-base py-1.5 hover:text-black">Серия выдвижных блоков</Link></li>
                      </ul>
                        </div>

                   
                        
                        <div className="text-black">
                            <h3 className="text-lg font-bold mb-4">Терморегуляторы</h3>
                            <ul className="space-y-3">
                                <li><Link href="/catalog/thermostats/floor-heating" className="block text-base hover:text-black">Для теплого пола</Link></li>
                                <li><Link href="/catalog/thermostats/floor-heating" className="block text-base hover:text-black">Теплый пол</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block md:w-1/3 lg:w-2/1">
                    <div
                        className="w-full bg-cover bg-center h-96"
                        style={{ backgroundImage: "url('/images/banners/Bannersrostekaivikluhately.png')" }}
                    />
                </div>
            </div>
        </div>
      )}

      {/* Выпадающее меню каталога */}
      {isCatalogOpen && (
        <div
            ref={catalogMenuRef}
            onMouseEnter={openCatalog}
            onMouseLeave={closeCatalog}
            className="absolute left-0 right-0 top-[calc(100%)] bg-white shadow-lg z-40 overflow-visible transition-all duration-300 border-t border-gray-200"
        >
            <div className="w-full flex flex-col md:flex-row">
                <div className="w-full md:flex-1 py-8 px-4 sm:px-6 md:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-black uppercase">Каталог</h2>
                    <button 
                    onClick={() => setIsCatalogOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                    <FiX size={24} className="text-gray-700" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
                    <div className="text-black">
                    <h3 className="text-lg font-bold mb-4">Декоративный свет</h3>
                    <ul className="space-y-1 pl-2 border-l-2">
                          <li><Link href="/catalog/chandeliers/" className="block text-base py-1.5 hover:text-black transition-colors">Люстры</Link></li>
                          <li><Link href="/catalog/floor-lamps" className="block text-base py-1.5 hover:text-black transition-colors">Торшеры</Link></li>
                          <li><Link href="/catalog/wall-sconces" className="block text-base py-1.5 hover:text-black transition-colors">Бра</Link></li>
                          <li><Link href="/catalog/table-lamps" className="block text-base py-1.5 hover:text-black transition-colors">Настольная лампа</Link></li>
                          <li><Link href="/catalog/led-lamp" className="block text-base py-1.5 hover:text-black transition-colors">Лампы LED</Link></li>
                          <li><Link href="/catalog/led-strips" className="block text-base py-1.5 hover:text-black transition-colors">Светоидодная лампы</Link></li>
                      </ul>
                    </div>

                    <div className="text-black">
                    <h3 className="text-lg font-bold mb-4">Функциональный свет</h3>
                    <ul className="space-y-3">
                        <li><Link href="/catalog/lights/track-lights" className="block text-base hover:text-black">Трековые светильники</Link></li>
                        <li><Link href="/catalog/lights/pendant-lights" className="block text-base hover:text-black">Подвесные светильники</Link></li>
                        <li><Link href="/catalog/led-strip-profiles" className="block text-base hover:text-black">Профили</Link></li>
                    </ul>
                    </div>

                    <div className="text-black">
                    <h3 className="text-lg font-bold mb-4">Уличный свет</h3>
                    <ul className="space-y-3">
                        <li><Link href="/catalog/outdoor-lights" className="block text-base hover:text-black">Уличные светильники</Link></li>
                    </ul>
                    </div>

                    <div className="text-black">
                    <h3 className="text-lg font-bold mb-4">Новинки и акции</h3>
                    </div>
                </div>
                </div>

                <div className="hidden md:block md:w-1/3 lg:w-1/4">
                <div
                    className="w-full  bg-center h-96"
                    style={{ backgroundImage: "url('/images/banners/Bannersmenu.png')" }}
                />
                </div>
            </div>
        </div>
      )}

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        body {
          padding-top: 72px; /* reserved space for fixed header to avoid layout shift */
        }
        
        @media (min-width: 768px) {
          body {
            padding-top: 72px; /* keep consistent with header height */
          }
        }
      `}</style>
    </header>
  );
};

export default Header;