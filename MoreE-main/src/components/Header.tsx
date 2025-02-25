import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Phone,
  MapPin,
  ShoppingCart,
  Heart,
  ShoppingBasket
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DropdownMenu from './CatalogDropdown';
import Navigation from './Menu';
import Link from 'next/link';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  component?: React.ComponentType<any>;
  items?: string[];
}

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const router = useRouter();
  const phoneNumber = "+7 (800) 555-35-35"; // Добавленный номер телефона

  // Закрытие мобильного меню при клике вне его
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

  // Дебаунс для поискового запроса
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Обработка скролла страницы
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      // Скрывать нижнее меню, если прокрутка больше 50px и пользователь скроллит вниз
      setIsScrolled(currentScrollPos > 50 && currentScrollPos > prevScrollPos);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (debouncedSearchQuery.trim()) {
      const encodedSearchQuery = encodeURIComponent(debouncedSearchQuery);
      router.push(`/search/${encodedSearchQuery}?query=${encodedSearchQuery}`);
      setIsSearchOpen(false);
    }
  };

  const menuItems: MenuItem[] = [
    
    {
      id: 'account',
      title: 'Личный кабинет',
      icon: User,
      items: ['Мои заказы', 'Избранное', 'Настройки'],
    },
    {
      id: 'contacts',
      title: 'Контакты',
      icon: Phone,
      items: ['8 800 777 15 37', phoneNumber, 'support@example.com', 'Наши магазины'],
    },
  ];

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      {/* Верхняя информационная полоса с телефоном */}
     
      
      <div className="max-w-[1920px] mx-auto px-4 md:px-6">
        {/* Верхняя часть Header – всегда видна */}
        <div className="flex items-center justify-between h-[72px]">
          {/* Логотип */}
          <Link href="/" className="flex-shrink-0 transition-transform hover:scale-105">
            <img src="/images/logo.png" alt="Minimiru" className="h-10" />
          </Link>

          {/* Основная навигация (desktop) */}
          <nav className="hidden lg:flex items-center space-x-8"> 
            <Link href="/about" className="text-gray-800 hover:text-black font-medium transition-colors">
              О компании
            </Link>
            <Link href="/contacts" className="text-gray-800 hover:text-black font-medium transition-colors">
              Контакты
            </Link>
            <Link href="/partner" className="text-gray-800 hover:text-black font-medium transition-colors">
              Все Бренды
            </Link>
            <Link href="/partner" className="text-gray-800 hover:text-black font-medium transition-colors">
              На карте
            </Link>
          </nav>

          {/* Правая часть */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Поиск */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Поиск"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            {/* Корзина - добавлена */}
            <Link 
              href="/cart" 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden relative"
              aria-label="Корзина"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">0</span>
            </Link>
            <div className='hidden md:flex items-center space-x-2 text-gray-800 hover:text-black group'>
              8 (900) 555-35-35
            </div>

            {/* Точки продаж */}
            <Link 
              href="/cart" 
              className="hidden md:flex items-center space-x-2 text-gray-800 hover:text-black group"
            >
              <ShoppingBasket className="w-5 h-5 text-gray-700" />
            
            </Link>
            <Link 
              href="/liked" 
              className="hidden md:flex items-center space-x-2 text-gray-800 hover:text-black group"
            >
            <Heart   className="w-5 h-5 text-gray-700"/> 
            </Link>
            <Link 
              href="auth/register" 
              className="hidden md:flex items-center space-x-2 text-gray-800 hover:text-black group"
            >
            <User   className="w-5 h-5 text-gray-700"/> 
            </Link>
            {/* Кнопка мобильного меню */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Меню"
            >
              <MenuIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Поисковая строка (desktop) */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-100 animate-fadeIn">
            <div className="max-w-3xl mx-auto relative">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="search"
                  placeholder="Поиск по сайту..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-700" />
                </button>
              </form>
              <button 
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed top-0 left-0 w-full h-full bg-white z-50 transform transition-transform duration-300 ease-in-out"
          style={{ paddingTop: '4rem' }}
        >
          <div className="px-4 border-b border-gray-100 py-2 flex items-center justify-between">
            {/* Логотип */}
            <Link href="/" className="flex-shrink-0">
              <img src="/images/logo.png" alt="Minimiru" className="h-10" />
            </Link>
            
            {/* Кнопка закрытия мобильного меню */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          
          {/* Телефон в мобильном меню */}
          <div className="px-6 py-3 border-b border-gray-100 flex items-center">
            <Phone className="w-4 h-4 mr-3 text-black" />
            <a href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`} className="font-medium">
              {phoneNumber} 
            </a>
          </div>
          
          <div className="h-full overflow-y-auto">
            {/* Поисковая строка (mobile) */}
            <div className="px-4 py-3 border-b border-gray-100">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="search"
                  placeholder="Поиск по сайту..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
              
            </div>
            
            {/* Основное меню (категории) */}
            
            <Navigation />

            {/* Дополнительные пункты меню */}
            <nav className="py-2 mt-4 bg-gray-50">
              {menuItems.map((item) => (
                <div key={item.id} className="border-b border-gray-100 last:border-0">
                  <button
                    className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      setActiveSubmenu(activeSubmenu === item.id ? null : item.id)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-gray-700" />
                      </div>
                      <span className="font-medium text-gray-800">{item.title}</span>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform duration-200 ${
                        activeSubmenu === item.id ? 'transform rotate-90' : ''
                      } text-gray-500`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      activeSubmenu === item.id ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="bg-white py-2">
                      {item.component ? (
                        <div className="px-6">
                          <item.component />
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {item.items?.map((subItem, index) => (
                            <li key={index}>
                              <a href="#" className="block px-8 py-2 text-sm hover:bg-gray-100 text-gray-700 transition-colors">
                                {subItem}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Нижнее меню Navigation – скрывается при скролле вниз */}
      
    </header>
  );
};

export default Header;