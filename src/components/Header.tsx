'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchProductsWithSorting } from '@/utils/api';
import { FiSearch, FiX, FiMenu } from 'react-icons/fi';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
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

// Interface for items displayed in the mini cart
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
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let mounted = true;

    const fetchProducts = async () => {
      if (!query || query.length < 2) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchProductsWithSorting(query, { limit: 6 }, controller?.signal, true);
        if (mounted) setProducts(data.products || []);
      } catch (error) {
        if ((error as any)?.name !== 'CanceledError') {
          console.error('Ошибка при поиске товаров:', error);
          if (mounted) setProducts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const timer = window.setTimeout(fetchProducts, 300);

    return () => {
      mounted = false;
      controller?.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return { products, loading };
};

const normalizeUrl = (url: string): string | null => {
  if (!url) return null;
  url = url.trim();
  if (url.includes('lightstar.ru')) return url;
  if (!url.startsWith('http')) {
    if (url.startsWith('/')) return url;
    url = 'https://' + url;
  }
  try {
    new URL(url);
    return url;
  } catch (e) {
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
  const [isSocketsOpen, setIsSocketsOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dropdownMounted, setDropdownMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuTimeoutRef = useRef<number | null>(null);
  const dropdownTimeoutRef = useRef<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  
  const catalogHoverTimeoutRef = useRef<number | null>(null);
  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const catalogMenuRef = useRef<HTMLDivElement | null>(null);

  const socketsHoverTimeoutRef = useRef<number | null>(null);
  const socketsButtonRef = useRef<HTMLButtonElement | null>(null);
  const socketsMenuRef = useRef<HTMLDivElement | null>(null);
  
  const brandsButtonRef = useRef<HTMLButtonElement | null>(null);
  const brandsMenuRef = useRef<HTMLDivElement | null>(null);
  const brandsHoverTimeoutRef = useRef<number | null>(null);
  
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
        
        const totalCount = cartData.products.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        const totalCost = cartData.products.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
        
        setCartCount(totalCount);
        setCartTotal(totalCost);
        
        const items: CartItem[] = cartData.products.map((p: any) => {
          let imageUrl: string | null = null;
          if (p.imageUrl) {
            imageUrl = getImageUrl(p.imageUrl);
          } else if (typeof p.imageAddress === 'string') {
            imageUrl = getImageUrl(p.imageAddress);
          } else if (Array.isArray(p.imageAddress) && p.imageAddress.length > 0) {
            imageUrl = getImageUrl(p.imageAddress[0]);
          } else if (typeof p.imageAddresses === 'string') {
            imageUrl = getImageUrl(p.imageAddresses);
          } else if (Array.isArray(p.imageAddresses) && p.imageAddresses.length > 0) {
            imageUrl = getImageUrl(p.imageAddresses[0]);
          }

          return {
            id: p._id || p.id,
            name: p.name || 'Без названия',
            imageUrl: imageUrl || '/placeholder.jpg',
            quantity: p.quantity || 0,
            price: p.price || 0
          };
        });

        setMiniCartItems(items);
      }
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
      setCartCount(0);
      setCartTotal(0);
      setMiniCartItems([]);
    }
  };
  
  useEffect(() => {
      const handleCartUpdate = () => updateCartState();
      const handleCartAdded = () => {
          updateCartState();
          setIsMiniCartVisible(true);
          if (miniCartTimeoutRef.current) window.clearTimeout(miniCartTimeoutRef.current);
          miniCartTimeoutRef.current = window.setTimeout(() => setIsMiniCartVisible(false), 2500);
      };
      
      window.addEventListener('cart:updated', handleCartUpdate);
      window.addEventListener('cart-added', handleCartAdded);
      
      updateCartState(); // Initial load
      
      return () => {
          window.removeEventListener('cart:updated', handleCartUpdate);
          window.removeEventListener('cart-added', handleCartAdded);
          if (miniCartTimeoutRef.current) {
              window.clearTimeout(miniCartTimeoutRef.current);
          }
      };
  }, []);

  const handleMiniCartEnter = () => {
      if (miniCartTimeoutRef.current) clearTimeout(miniCartTimeoutRef.current);
      updateCartState();
      setIsMiniCartVisible(true);
  };
  
  const handleMiniCartLeave = () => {
      miniCartTimeoutRef.current = window.setTimeout(() => setIsMiniCartVisible(false), 200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearchResults) {
      if (dropdownTimeoutRef.current) window.clearTimeout(dropdownTimeoutRef.current);
      setDropdownMounted(true);
    } else {
      dropdownTimeoutRef.current = window.setTimeout(() => setDropdownMounted(false), 320);
    }
    return () => {
      if (dropdownTimeoutRef.current) window.clearTimeout(dropdownTimeoutRef.current);
    };
  }, [showSearchResults]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setShowSearchResults(searchQuery.trim().length > 0);
  }, [searchQuery]);

  const handleSearch = (queryOrEvent?: string | React.FormEvent) => {
    if (queryOrEvent && typeof queryOrEvent !== 'string') {
        queryOrEvent.preventDefault();
    }
    const finalQuery = typeof queryOrEvent === 'string' ? queryOrEvent : searchQuery;
    if (!finalQuery.trim()) return;
    
    setShowSearchResults(false);
    setSearchQuery('');
    router.push(`/search/${encodeURIComponent(finalQuery)}?query=${encodeURIComponent(finalQuery)}`);
  };

  const SearchResultItem: React.FC<SearchResultItemProps> = ({ product, handleSearch }) => {
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [imageError, setImageError] = useState<boolean>(false);

    const imageUrl = useMemo(() => {
      let imageSrc = null;
      const addresses = product.imageAddresses || product.imageAddress;
      if (typeof addresses === 'string') {
        imageSrc = normalizeUrl(addresses);
      } else if (Array.isArray(addresses) && addresses.length > 0) {
        imageSrc = normalizeUrl(addresses[0]);
      }
      return imageSrc;
    }, [product]);

    useEffect(() => {
      if (imageUrl) {
        setImageLoaded(false);
        setImageError(false);
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageError(true);
        img.src = getImageUrl(imageUrl);
      }
    }, [imageUrl]);

    const finalImageUrl = imageUrl && !imageError ? getImageUrl(imageUrl) : '/placeholder.jpg';

    return (
      <div onClick={() => handleSearch(product.name)} className="flex items-center px-4 py-4 text-white cursor-pointer transition-colors duration-200 hover:bg-white/10 rounded-md">
        <div className="relative w-20 h-20 mr-4 flex-shrink-0 overflow-hidden rounded-md">
          <img src={finalImageUrl} alt={product.name} className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} />
          {!imageLoaded && <div className="absolute inset-0 bg-gray-700 animate-pulse rounded-md"></div>}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-base text-white line-clamp-2">{product.name}</span>
          {product.article && <span className="text-sm text-gray-400 mt-1">Арт.: {product.article}</span>}
        </div>
      </div>
    );
  };

  const searchResultsContent = useMemo(() => {
    if (loading) {
      return <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div></div>;
    }
    if (products.length > 0) {
      return (
        <div>
          <div className="py-2 px-4"><h3 className="text-xs font-medium uppercase text-gray-400">Результаты поиска</h3></div>
          <div className="max-h-[60vh] bg-black overflow-y-auto"><div className="grid grid-cols-1 gap-1 p-2">{products.map((p) => <SearchResultItem key={p._id} product={p} handleSearch={handleSearch} />)}</div></div>
          <div className="border-t bg-black border-white/10"><button onClick={() => handleSearch()} className="w-full py-3 text-sm font-medium uppercase text-white hover:bg-white/10 transition-colors">Показать все результаты</button></div>
        </div>
      );
    }
    return <div className="py-6 px-4 text-center"><p className="text-sm text-gray-400">Ничего не найдено.</p></div>;
  }, [products, loading, searchQuery]);

  const openCatalog = () => {
    if (catalogHoverTimeoutRef.current) clearTimeout(catalogHoverTimeoutRef.current);
    setIsCatalogOpen(true);
  };
  const closeCatalog = () => {
    catalogHoverTimeoutRef.current = window.setTimeout(() => setIsCatalogOpen(false), 160);
  };

  const openSocketsMenu = () => {
    if (socketsHoverTimeoutRef.current) clearTimeout(socketsHoverTimeoutRef.current);
    setIsSocketsOpen(true);
  };
  const closeSocketsMenu = () => {
    socketsHoverTimeoutRef.current = window.setTimeout(() => setIsSocketsOpen(false), 160);
  };

  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const openBrands = () => {
    if (brandsHoverTimeoutRef.current) clearTimeout(brandsHoverTimeoutRef.current);
    setIsBrandsOpen(true);
  };
  const closeBrands = () => {
    brandsHoverTimeoutRef.current = window.setTimeout(() => setIsBrandsOpen(false), 160);
  };

  const openSearchDropdown = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setDropdownMounted(true);
    setTimeout(() => {
      setShowSearchResults(true);
      searchInputRef.current?.focus();
    }, 20);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isCatalogOpen && catalogMenuRef.current && !catalogMenuRef.current.contains(target) && catalogButtonRef.current && !catalogButtonRef.current.contains(target)) setIsCatalogOpen(false);
      if (isSocketsOpen && socketsMenuRef.current && !socketsMenuRef.current.contains(target) && socketsButtonRef.current && !socketsButtonRef.current.contains(target)) setIsSocketsOpen(false);
      if (isBrandsOpen && brandsMenuRef.current && !brandsMenuRef.current.contains(target) && brandsButtonRef.current && !brandsButtonRef.current.contains(target)) setIsBrandsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCatalogOpen(false);
        setIsSocketsOpen(false);
        setIsBrandsOpen(false);
        setShowSearchResults(false);
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
      <div className="bg-black py-5 sm:py-4">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
          <div className="absolute left-1/2 max-lg:left-[55%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className={`transition-all duration-300 ${showSearchResults || scrolled ? 'translate-x-[-1.5rem] scale-90' : 'translate-x-0 scale-100'}`}>
              <Link href="/" className={`flex items-center ${showSearchResults || scrolled ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                <span className={`text-5xl font-bold tracking-widest transition-all duration-300 ${showSearchResults || scrolled ? 'text-4xl' : 'text-5xl'} text-white`}>MORESVET</span>
                <span className={`text-1xl max-lg:hidden font-bold tracking-widest transition-all duration-300 ${showSearchResults || scrolled ? 'text-1xl' : 'text-1xl'} text-white`}>2025</span>
              </Link>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-9 text-white uppercase text-sm font-bold tracking-wide">
            <Link href="/about" className="hover:text-gray-300">ПРАВИЛА ДОСТАВКИ</Link>
            <button ref={socketsButtonRef} onMouseEnter={openSocketsMenu} onMouseLeave={closeSocketsMenu} aria-haspopup="true" aria-expanded={isSocketsOpen} className="relative flex items-center uppercase text-sm font-bold text-white hover:text-gray-300 transition-colors px-3 py-1">РОЗЕТКИ И ВЫКЛЮЧАТЕЛИ</button>
          </nav>

          <div className="hidden sm:flex items-center gap-4 text-white">
            <button ref={catalogButtonRef} onMouseEnter={openCatalog} onMouseLeave={closeCatalog} aria-haspopup="true" aria-expanded={isCatalogOpen} className="relative flex items-center uppercase text-sm font-bold text-white hover:text-gray-300 transition-colors px-3 py-1">КАТАЛОГ</button>
            <button onClick={openSearchDropdown} aria-label="Поиск" className="p-2 hover:text-gray-300"><SearchIcon className="w-6 h-6" /></button>
            <Link href="/auth/register" aria-label="Личный кабинет" className="text-sm font-bold hover:text-gray-300 px-3 py-2">ДЛЯ ДИЗАЙНЕРОВ</Link>
            <Link href="/liked" aria-label="Избранное" className="p-2 hover:text-gray-300"><FaHeart size={20} /></Link>
            <div ref={cartIconRef} className="relative p-2" onMouseEnter={handleMiniCartEnter} onMouseLeave={handleMiniCartLeave}>
                <Link href="/cart" aria-label="Корзина" className="relative hover:text-gray-300">
                    <FaShoppingCart size={20} />
                    {cartCount > 0 && <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">{cartCount}</span>}
                </Link>

                {isMiniCartVisible && (
                    <div ref={miniCartRef} className="absolute right-0 top-full mt-2 w-96 bg-white text-black rounded-lg shadow-2xl z-50 overflow-hidden" onMouseEnter={handleMiniCartEnter} onMouseLeave={handleMiniCartLeave}>
                        {miniCartItems.length > 0 ? (
                            <>
                                <div className="p-4"><h3 className="text-lg font-semibold text-gray-800">Корзина ({cartCount})</h3></div>
                                <div className="max-h-80 overflow-y-auto border-t border-b border-gray-200">
                                    {miniCartItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 p-4">
                                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden"><img src={item.imageUrl!} alt={item.name} className="w-full h-full object-cover" /></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} x {item.price > 0 ? `${item.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {item.price > 0 ? `${(item.quantity * item.price).toLocaleString('ru-RU')} ₽` : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-base font-medium text-gray-900">Итого:</span>
                                        <span className="text-lg font-bold text-gray-900">{cartTotal.toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                    <Link href="/cart" className="block w-full text-center bg-black text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">Перейти в корзину</Link>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center"><p className="text-base text-gray-600">В корзине нет товаров</p></div>
                        )}
                    </div>
                )}
            </div>
            {isBrandsOpen && (
              <div ref={brandsMenuRef} onMouseEnter={openBrands} onMouseLeave={closeBrands} className="absolute left-0 right-0 top-full bg-white shadow-lg z-40 border-t border-gray-200">
                {/* Brands Content Here */}
              </div>
            )}
          </div>

          <div className="flex sm:hidden items-center gap-2 text-white">
            <button onClick={() => { setIsMobileMenuOpen(true); setTimeout(() => setShowMobileMenu(true), 20); }} aria-label="Открыть меню" className="p-2"><FiMenu size={22} /></button>
          </div>
        </div>
      </div>

      {dropdownMounted && (
        <div ref={searchResultsRef} className="absolute left-0 right-0 top-[calc(100%+10px)] z-40 pointer-events-none">
          <div className="max-w-screen-xl mx-auto px-4 flex justify-center">
            <div className={`bg-black rounded-2xl shadow-xl overflow-hidden max-w-3xl w-full transform transition-all duration-300 ease-out ${showSearchResults ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input ref={searchInputRef} type="text" placeholder="Введите название товара..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-3 pl-10 rounded-lg bg-white/10 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50" />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70"><SearchIcon /></div>
                  </div>
                  <button onClick={() => setShowSearchResults(false)} className="p-2 text-white/70 hover:text-white" aria-label="Закрыть поиск"><FiX /></button>
                </div>
              </div>
              <div className="border-t border-white/10">{searchResultsContent}</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu, Catalog Menu, Sockets Menu remain unchanged */}
      
      <style jsx global>{`
        body { padding-top: 72px; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </header>
  );
};

export default Header;