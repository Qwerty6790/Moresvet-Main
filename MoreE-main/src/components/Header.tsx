import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Phone,
  MapPin
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
      id: 'catalog',
      title: 'Каталог',
      icon: MenuIcon,
      component: DropdownMenu,
    },
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
      items: ['8 800 777 15 37', 'support@example.com', 'Наши магазины'],
    },
  ];

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 md:px-6">
        {/* Верхняя часть Header – всегда видна */}
        <div className="flex items-center justify-between h-[72px]">
          {/* Логотип */}
          <Link href="/" className="flex-shrink-0">
            <img src="/images/logo.png" alt="Minimiru" className="h-12" />
          </Link>

          {/* Основная навигация (desktop) */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/cart" className="text-black hover:text-black font-medium">
              Корзина
            </Link>
            <Link href="/about" className="text-black hover:text-black font-medium">
              О компании
            </Link>
            <Link href="/liked" className="text-black hover:text-black font-medium">
              Избранное
            </Link>
            <Link href="/contacts" className="text-black hover:text-black font-medium">
              Контакты
            </Link>
            <Link href="/partner" className="text-black hover:text-black font-medium">
              Офиц. Бренды
            </Link>
            <Link href="/partner" className="text-black hover:text-black font-medium">
              На карте
            </Link>
          </nav>

          {/* Правая часть */}
          <div className="flex items-center space-x-6">
            {/* Валюта */}
            <div className="hidden md:block">
              <select className="bg-transparent border-none text-black font-medium focus:outline-none">
                <option>RUB</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>

            {/* Поиск */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-black" />
            </button>

            {/* Точки продаж */}
            <Link 
              href="/stores" 
              className="hidden md:flex items-center space-x-2 text-black hover:text-black"
            >
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Точки продаж</span>
            </Link>

            {/* Профиль */}
            <Link 
              href="/profile" 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <User className="w-5 h-5 text-black" />
            </Link>

            {/* Кнопка мобильного меню */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MenuIcon className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        {/* Поисковая строка (desktop) */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <div className="max-w-3xl mx-auto relative">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="search"
                  placeholder="Поиск по сайту..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </form>
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
          <div className="px-4">
            {/* Кнопка закрытия мобильного меню */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 mb-4 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-black" />
            </button>
          </div>
          <div className="h-full overflow-y-auto px-4">
            {/* Основное меню (категории) */}
            <Navigation />

            {/* Дополнительные пункты меню */}
            <nav className="py-2 mt-4 bg-gray-50">
              {menuItems.map((item) => (
                <div key={item.id} className="border-b border-gray-100 last:border-0">
                  <button
                    className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-gray-100"
                    onClick={() =>
                      setActiveSubmenu(activeSubmenu === item.id ? null : item.id)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-black">{item.title}</span>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform duration-200 ${
                        activeSubmenu === item.id ? 'transform rotate-90' : ''
                      } text-black`}
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
                              <a href="#" className="block px-8 py-2 text-sm hover:bg-gray-100 text-black">
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

            {/* Поисковая строка (mobile) */}
            {isSearchOpen && (
              <div className="py-4 border-t">
                <div className="max-w-3xl mx-auto relative">
                  <form onSubmit={handleSearchSubmit}>
                    <input
                      type="search"
                      placeholder="Поиск по сайту..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <Search className="w-5 h-5 text-gray-400" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Нижнее меню Navigation – скрывается при скролле вниз */}
      {!isScrolled && <Navigation />}
    </header>
  );
};

export default Header;
