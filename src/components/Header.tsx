'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { searchProductsWithSorting } from '@/utils/api';
import { FiSearch, FiUser, FiHeart, FiShoppingCart, FiMenu, FiX, FiNavigation2 } from 'react-icons/fi';
import { FaAccessibleIcon, FaHeart, FaShoppingCart, FaUser } from 'react-icons/fa';
import { NEXT_PUBLIC_API_URL, getImageUrl } from '@/utils/constants';

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

const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({});
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mounted, setMounted] = useState(false);
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
  const hoverTimeoutRef = useRef<number | null>(null);
  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const catalogMenuRef = useRef<HTMLDivElement | null>(null);
  const brandsButtonRef = useRef<HTMLButtonElement | null>(null);
  const brandsMenuRef = useRef<HTMLDivElement | null>(null);
  const brandsHoverTimeoutRef = useRef<number | null>(null);
  // Mini cart indicator
  const cartIconRef = useRef<HTMLDivElement | null>(null);
  const [miniCartVisible, setMiniCartVisible] = useState(false);
  const [miniCartMessage, setMiniCartMessage] = useState<string | null>(null);
  const miniCartTimeoutRef = useRef<number | null>(null);
  const [miniCartImageSrc, setMiniCartImageSrc] = useState<string | null>(null);
  const [miniCartQuantity, setMiniCartQuantity] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  const { products, loading } = useSearchProducts(searchQuery);

  // Listen for cart-added events to briefly show mini modal
  useEffect(() => {
    const handler = (ev: Event) => {
      let addedQuantity = 1;
      try {
        const ce = ev as CustomEvent;
        addedQuantity = typeof ce?.detail?.quantity === 'number' ? ce.detail.quantity : 1;
        setMiniCartMessage(ce?.detail?.name ? `${ce.detail.name}` : 'Товар добавлен');
        setMiniCartImageSrc(ce?.detail?.imageUrl || null);
        setMiniCartQuantity(addedQuantity);
      } catch (err) {
        setMiniCartMessage('Товар добавлен');
        setMiniCartImageSrc(null);
        setMiniCartQuantity(1);
        addedQuantity = 1;
      }

      // Обновляем видимый мини-кошелёк
      setMiniCartVisible(true);
      if (miniCartTimeoutRef.current) window.clearTimeout(miniCartTimeoutRef.current);
      miniCartTimeoutRef.current = window.setTimeout(() => setMiniCartVisible(false), 1800);

      // Обновляем глобальный счётчик корзины, читая актуальные данные из localStorage
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        setCartCount(Array.isArray(cart.products) ? cart.products.reduce((s: number, it: any) => s + (it.quantity || 0), 0) : 0);
      } catch (err) {
        // Если чтение localStorage не удалось, делаем локальное прибавление
        setCartCount((prev) => prev + (typeof addedQuantity === 'number' ? addedQuantity : 1));
      }
    };

    window.addEventListener('cart-added', handler as EventListener);
    // initialize cart count from localStorage
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
      setCartCount(Array.isArray(cart.products) ? cart.products.reduce((s: number, it: any) => s + (it.quantity || 0), 0) : 0);
    } catch (e) {
      setCartCount(0);
    }
    return () => {
      window.removeEventListener('cart-added', handler as EventListener);
      if (miniCartTimeoutRef.current) {
        window.clearTimeout(miniCartTimeoutRef.current);
        miniCartTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setMounted(true);
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

  const handleSearch = (queryOrEvent?: string | React.FormEvent) => {
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
  };

  const SearchResultItem: React.FC<SearchResultItemProps> = ({ product, handleSearch }) => {
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [imageError, setImageError] = useState<boolean>(false);
    const [isHovering, setIsHovering] = useState<boolean>(false);

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
        className={`flex items-center px-4 py-4 text-white cursor-pointer transition-all duration-200 bg-black rounded-md`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
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
          <div className="max-h-[73vh] bg-black overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3">
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
              className="w-full py-3 text-xs font-medium uppercase text-white hover:bg-gray-50 transition-colors"
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
  }, [products, loading, searchQuery, handleSearch, ]);

  const toggleCatalogMenu = () => {
    setIsCatalogOpen(!isCatalogOpen);
  };
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const toggleBrandsMenu = () => setIsBrandsOpen(prev => !prev);

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

  const openCatalog = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsCatalogOpen(true);
  };

  const closeCatalog = () => {
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsCatalogOpen(false);
      hoverTimeoutRef.current = null;
    }, 160);
  };

  const openSearchDropdown = () => {
    // отменяем размонтирование если было
    if (dropdownTimeoutRef.current) {
      window.clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    // сначала монтируем контейнер, затем в следующем тике включаем анимацию
    setDropdownMounted(true);
    window.setTimeout(() => {
      setShowSearchResults(true);
      searchInputRef.current?.focus();
    }, 20);
  };

  useEffect(() => {
    const handleClickOutsideCatalog = (event: MouseEvent) => {
      if (!isCatalogOpen) return;
      const target = event.target as Node;
      if (
        catalogMenuRef.current &&
        catalogButtonRef.current &&
        !catalogMenuRef.current.contains(target) &&
        !catalogButtonRef.current.contains(target)
      ) {
        setIsCatalogOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCatalogOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutsideCatalog);
    document.addEventListener('keydown', handleKeyDown);
    // brands outside click handler
    const handleClickOutsideBrands = (event: MouseEvent) => {
      if (!isBrandsOpen) return;
      const target = event.target as Node;
      if (
        brandsMenuRef.current &&
        brandsButtonRef.current &&
        !brandsMenuRef.current.contains(target) &&
        !brandsButtonRef.current.contains(target)
      ) {
        setIsBrandsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideBrands);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideCatalog);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutsideBrands);
    };
  }, [isCatalogOpen]);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Render full header on server and client to avoid hydration mismatch.
  // Client-only behaviors are controlled via state/effects without changing markup shape.

  return (
    <header className="w-full bg-black z-50 fixed top-0 left-0 right-0 shadow-lg h-18 md:h-18">
      {/* Основной хедер */}
      <div className="bg-black py-5 sm:py-4 ">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
          {/* Логотип */}
          <div className="absolute left-1/2 max-lg:left-[55%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className={`transition-all duration-300 ${showSearchResults || scrolled ? 'translate-x-[-1.5rem] scale-90' : 'translate-x-0 scale-100'}`}>
              <Link href="/" className={`flex items-center ${showSearchResults || scrolled ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                <span className={`text-5xl font-bold tracking-widest transition-all duration-300 ${showSearchResults || scrolled ? 'text-4xl' : 'text-5xl'} text-white`}>MORESVET</span>
                <span className={`text-1xl max-lg:hidden font-bold tracking-widest transition-all duration-300 ${showSearchResults || scrolled ? 'text-1xl' : 'text-1xl'} text-white`}>2025</span>
              </Link>
            </div>
          </div>

          {/* Центральная навигация */}
          <nav className="hidden md:flex items-center gap-9 text-white uppercase text-sm font-bold tracking-wide">
            <Link href="/about" className="hover:text-gray-300">ПРАВИЛА ДОСТАВКИ</Link>
            <Link href="/about" className="hover:text-gray-300">О КОМПАНИИ</Link>
            <button
              ref={brandsButtonRef}
              onMouseEnter={openBrands}
              onMouseLeave={closeBrands}
              onClick={toggleBrandsMenu}
              aria-haspopup="true"
              aria-expanded={isBrandsOpen}
              className="hover:text-gray-300"
            >
              БРЕНДЫ
            </button>
          </nav>

          {/* Правые элементы */}
          <div className="hidden sm:flex items-center gap-4 text-white">
            <button 
              ref={catalogButtonRef}
              onClick={toggleCatalogMenu}
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
            <Link href="/auth/register" aria-label="Личный кабинет" className="text-sm font-bold hover:text-gray-300 px-3 py-2">
              ДЛЯ ДИЗАЙНЕРОВ
            </Link>
            <Link href="/liked" aria-label="Избранное" className="p-2 hover:text-gray-300">
              <FaHeart size={20} />
            </Link>
            <div
              ref={cartIconRef}
              className="relative p-2"
              onMouseEnter={() => {
                if (miniCartTimeoutRef.current) window.clearTimeout(miniCartTimeoutRef.current);
                // show empty message if no items
                if (cartCount === 0) {
                  setMiniCartMessage('В корзине нет товаров');
                  setMiniCartImageSrc(null);
                  setMiniCartQuantity(0);
                }
                setMiniCartVisible(true);
              }}
              onMouseLeave={() => {
                if (miniCartTimeoutRef.current) window.clearTimeout(miniCartTimeoutRef.current);
                miniCartTimeoutRef.current = window.setTimeout(() => setMiniCartVisible(false), 180);
              }}
            >
              <Link href="/cart" aria-label="Корзина" className="hover:text-gray-300">
                <FaShoppingCart size={20} />
              </Link>

              {/* Мини-модальное окно под иконкой корзины */}
              {miniCartVisible && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white text-black rounded-md shadow-lg z-50 p-3 text-sm">
                  <div className="flex items-start gap-4">
                    {miniCartImageSrc ? (
                      <div className="w-52 h-52 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                        {/** product image will be injected via inline img src from state set by event **/}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getImageUrl(miniCartImageSrc)} alt={miniCartMessage || 'img'} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base whitespace-normal break-words">{miniCartMessage || 'Товар добавлен'}</div>
                      <div className="flex items-center justify-end mt-2">
                        <div className="text-sm text-black">В корзине товаров:</div>
                        <div className="text-sm  text-black px-3 py-1 rounded">{miniCartQuantity ?? 1}</div>
                      </div>
                      <div className="mt-3">
                        <Link href="/cart" className="inline-block w-full text-center bg-black text-white py-2 rounded text-sm">Перейти в корзину</Link>
                      </div>
                    </div>
                  </div>
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
                      {/* hardcoded logos from public/images/brands */}
                      {(
                        // массив объектов: имя файла и отдельная ссылка (href)
                        [
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
                      )}
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/3 lg:w-1/4">
                    <div className="w-full  bg-center h-96" style={{ backgroundImage: "url('/images/banners/Bannersbrandsmenu.png')" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Мобильные элементы (гамбургер) */}
          <div className="flex sm:hidden items-center gap-2 text-white">
            <button
              onClick={() => {
                // Сначала монтируем контейнер, затем чуть позже включаем класс анимации
                setIsMobileMenuOpen(true);
                if (mobileMenuTimeoutRef.current) window.clearTimeout(mobileMenuTimeoutRef.current);
                mobileMenuTimeoutRef.current = window.setTimeout(() => setShowMobileMenu(true), 20);
              }}
              aria-label="Открыть меню"
              className="p-2"
            >
              <FiMenu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Встроенный выпадающий поиск (вместо модального окна) */}
      {dropdownMounted && (
        <div ref={searchResultsRef} className="absolute left-0 right-0 top-[100%] z-40 pointer-events-none">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className={`bg-black rounded-b-lg shadow-lg overflow-hidden transform transition-all duration-300 ease-out ${showSearchResults ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Введите название товара..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-10 rounded-md  bg-transparent text-white focus:outline-none"
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
              <div className="border-t">
                {searchResultsContent}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <>
          <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => { setShowMobileMenu(false); mobileMenuTimeoutRef.current = window.setTimeout(() => setIsMobileMenuOpen(false), 300); }} />
          <div className={`fixed top-0 left-0 z-50 bg-white h-full max-w-xs w-full shadow-lg transform transition-transform duration-300 ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`} role="dialog" aria-modal="true">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="text-2xl font-bold text-black">MORESVET</Link>
              <button onClick={() => { setShowMobileMenu(false); mobileMenuTimeoutRef.current = window.setTimeout(() => setIsMobileMenuOpen(false), 300); }} className="p-2 text-black" aria-label="Закрыть меню">
                <FiX size={22} className="text-black" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
              <div className="flex items-center justify-between mb-4">
                <Link href="/auth/register" className="text-base font-bold text-black">ДЛЯ ДИЗАЙНЕРОВ</Link>
                <div className="flex items-center gap-4">
                  <Link href="/liked" className="p-2 text-black hover:text-gray-700"><FaHeart size={20} /></Link>
                  <Link href="/cart" className="p-2 text-black hover:text-gray-700"><FaShoppingCart size={20} /></Link>
                </div>
              </div>
              <div className="space-y-6 text-black">
                <div>
                  <h3 className="text-lg font-bold mb-3">Декоративный свет</h3>
                  <ul className="space-y-2">
                    <li><Link href="/catalog?category=Подвесная+люстра&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Подвесные люстры</Link></li>
                    <li><Link href="/catalog?category=Потолочная+люстра&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Потолочные люстры</Link></li>
                    <li><Link href="/catalog?category=Люстры+на+штанге&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Люстры на штанге</Link></li>
                    <li><Link href="/catalog?category=Подвесы&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Подвесы</Link></li>
                    <li><Link href="/catalog?category=Бра&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Бра</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3">Функциональный свет</h3>
                  <ul className="space-y-2">
                    <li><Link href="/catalog?category=Трековые+системы&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Трековые системы</Link></li>
                    <li><Link href="/catalog?category=Светодиодная+лента&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Светодиодная лента</Link></li>
                    <li><Link href="/catalog?category=Профили&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Профили</Link></li>
                    <li><Link href="/catalog?category=Гибкий+неон&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Гибкий неон</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3">Уличный свет</h3>
                  <ul className="space-y-2">
                    <li><Link href="/catalog?category=Уличные+светильники&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Уличные и фасадные светильники</Link></li>
                    <li><Link href="/catalog?category=Светильник+уличный&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Светильники уличные</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3">Новинки и акции</h3>
                  <ul className="space-y-2">
                    <li><Link href="/catalog?filter=new&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Новинки</Link></li>
                    <li><Link href="/promotions" className="block text-base text-black hover:text-gray-700">Акции</Link></li>
                    <li><Link href="/catalog?filter=sale&subcategory=&page=1" className="block text-base text-black hover:text-gray-700">Скидки</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Выпадающее меню каталога */}
      {isCatalogOpen && (
        <>
          <div
            ref={catalogMenuRef}
            onMouseEnter={openCatalog}
            onMouseLeave={closeCatalog}
            className="absolute left-0 right-0 top-[calc(100%)] bg-white shadow-lg z-40 overflow-visible transition-all duration-300 border-t border-gray-200"
          >
            {/* Основной контейнер растянут на всю ширину; внутри — блок с колонкой категорий и блок для фото справа */}
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
                    <ul className="space-y-3">
                      <li><Link href="/catalog?category=Подвесная+люстра&subcategory=&page=1" className="block text-base hover:text-black">Подвесные люстры</Link></li>
                      <li><Link href="/catalog?category=Потолочная+люстра&subcategory=&page=1" className="block text-base hover:text-black">Потолочные люстры</Link></li>
                      <li><Link href="/catalog?category=Люстры+на+штанге&subcategory=&page=1" className="block text-base hover:text-black">Люстры на штанге</Link></li>
                      <li><Link href="/catalog?category=Подвесы&subcategory=&page=1" className="block text-base hover:text-black">Подвесы</Link></li>
                      <li><Link href="/catalog?category=Бра&subcategory=&page=1" className="block text-base hover:text-black">Бра</Link></li>
                    </ul>
                  </div>

                  <div className="text-black">
                    <h3 className="text-lg font-bold mb-4">Функциональный свет</h3>
                    <ul className="space-y-3">
                      <li><Link href="/catalog?category=Трековые+системы&subcategory=&page=1" className="block text-base hover:text-black">Трековые системы</Link></li>
                      <li><Link href="/catalog?category=Светодиодная+лента&subcategory=&page=1" className="block text-base hover:text-black">Светодиодная лента</Link></li>
                      <li><Link href="/catalog?category=Профили&subcategory=&page=1" className="block text-base hover:text-black">Профили</Link></li>
                      <li><Link href="/catalog?category=Гибкий+неон&subcategory=&page=1" className="block text-base hover:text-black">Гибкий неон</Link></li>
                    </ul>
                  </div>

                  <div className="text-black">
                    <h3 className="text-lg font-bold mb-4">Уличный свет</h3>
                    <ul className="space-y-3">
                      <li><Link href="/catalog?category=Уличные+светильники&subcategory=&page=1" className="block text-base hover:text-black">Уличные и фасадные светильники</Link></li>
                      <li><Link href="/catalog?category=Светильник+уличный&subcategory=&page=1" className="block text-base hover:text-black">Светильники уличные</Link></li>
                    </ul>
                  </div>

                  <div className="text-black">
                    <h3 className="text-lg font-bold mb-4">Новинки и акции</h3>
                    <ul className="space-y-3">
                      <li><Link href="/catalog?filter=new&subcategory=&page=1" className="block text-base hover:text-black">Новинки</Link></li>
                      <li><Link href="/promotions" className="block text-base hover:text-black">Акции</Link></li>
                      <li><Link href="/catalog?filter=sale&subcategory=&page=1" className="block text-base hover:text-black">Скидки</Link></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Image area: full-height block on the right that stretches to the screen edge */}
              <div className="hidden md:block md:w-1/3 lg:w-1/4">
                <div
                  className="w-full  bg-center h-96"
                  style={{ backgroundImage: "url('/images/banners/Bannersmenu.png')" }}
                />
              </div>
            </div>
          </div>
        </>
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