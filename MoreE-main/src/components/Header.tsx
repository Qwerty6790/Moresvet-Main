import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, Menu as MenuIcon, X, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DropdownMenu from './CatalogDropdown';
import Navigation from './Menu';

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const router = useRouter();

  // Закрытие меню при клике вне его
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

  // Блокировка скролла при открытом меню
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const maxScroll = 100;
      const progress = Math.min(currentScrollPos / maxScroll, 1);
      setScrollProgress(progress);
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

  const logoHeight = 4 - (scrollProgress * 1);
  const phoneTextSize = 2 - (scrollProgress * 0.25);

  const menuItems: MenuItem[] = [
    {
      id: 'catalog',
      title: 'Каталог',
      icon: MenuIcon,
      component: DropdownMenu
    },
    {
      id: 'account',
      title: 'Личный кабинет',
      icon: User,
      items: ['Мои заказы', 'Избранное', 'Настройки']
    },
    {
      id: 'contacts',
      title: 'Контакты',
      icon: Phone,
      items: ['8 800 777 15 37', 'support@example.com', 'Наши магазины']
    }
  ];

  return (
    <header className="w-full bg-white fixed top-0 left-0 right-0 z-40">
      {/* Main header */}
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center bg-white transition-all duration-300">
        {/* Mobile menu button */}
        <button 
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MenuIcon className="w-6 h-6" />
          )}
        </button>

        {/* Logo */}
        <a href="/" className="flex-shrink-0">
          <div className="flex items-center transition-all duration-300">
            <img 
              src="/images/logo.png" 
              alt="minimir" 
              className="h-8 md:h-12 lg:h-16 transition-all duration-300"
              style={{
                height: `${logoHeight}rem`,
              }}
            />
          </div>
        </a>

        {/* Search bar - desktop */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-auto px-4">
          <div className="relative flex items-center w-full">
            <form onSubmit={handleSearchSubmit} className="w-full flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск"
                className="w-full px-2 py-2 text-sm border border-gray-300 text-black focus:outline-none"
              />
              <button
                type="submit"
                className="px-2 py-2 bg-black border border-l-0 border-gray-300 hover:bg-gray-200 transition duration-200"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile search button */}
        <button 
          className="lg:hidden p-2"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          <Search className="w-6 h-6" />
        </button>

        {/* Contact and icons */}
        <div className="flex items-center space-x-2 md:space-x-6">
          {/* Phone number */}
          <div className="hidden md:block text-right transition-all duration-300">
            <div 
              className="font-bold text-black transition-all duration-300"
              style={{
                fontSize: `${phoneTextSize}rem`
              }}
            >
              8 800 777 15 37
            </div>
            <div className="text-xs text-gray-600">Консультации и поддержка 24/7</div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="flex flex-col items-center text-xs md:text-sm text-gray-600">
              <User className="w-5 h-5 text-black" />
              <span className="hidden text-black md:block">Войти</span>
            </button>
            <button className="flex flex-col items-center text-xs md:text-sm text-gray-600">
              <Heart className="w-5 h-5 text-black" />
              <span className="hidden text-black md:block">Избранное</span>
            </button>
            <button className="flex flex-col items-center text-xs md:text-sm text-gray-600">
              <ShoppingBag className="w-5 h-5 text-black" />
              <span className="hidden text-black md:block">Корзина</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      <div className={`lg:hidden w-full bg-white transition-all duration-300 ${isSearchOpen ? 'h-16' : 'h-0 overflow-hidden'}`}>
        <form onSubmit={handleSearchSubmit} className="h-full p-4">
          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск"
              className="w-full px-2 py-2 text-sm border border-gray-300 text-black focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-0 px-2 py-2"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </form>
      </div>

      {/* Enhanced Mobile Menu */}
      <div 
        id="mobile-menu"
        className={`fixed top-0 left-0 w-full h-full bg-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}
        style={{ paddingTop: '4rem' }}
      >
        <div className="h-full overflow-y-auto">
          {/* Search bar in mobile menu */}
          <div className="px-4 py-3 border-b border-gray-200">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по каталогу"
                className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </form>
          </div>

          {/* Main menu items */}
          <nav className="py-2">
            {menuItems.map((item) => (
              <div key={item.id} className="border-b border-gray-100 last:border-0">
                <button
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
                  onClick={() => setActiveSubmenu(activeSubmenu === item.id ? null : item.id)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      activeSubmenu === item.id ? 'transform rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Submenu content */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${activeSubmenu === item.id ? 'max-h-96' : 'max-h-0'}`}
                >
                  <div className="bg-gray-50 py-2">
                    {item.component ? (
                      <div className="px-4">
                        <item.component />
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {item.items?.map((subItem, index) => (
                          <li key={index}>
                            <a
                              href="#"
                              className="block px-8 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
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

          {/* Contact information */}
          <div className="px-4 py-6 bg-gray-50 mt-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-5 h-5" />
                <a href="tel:88007771537" className="text-sm">8 800 777 15 37</a>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <a href="mailto:support@example.com" className="text-sm">support@example.com</a>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">Наши магазины</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav className={`hidden lg:block bg-white border-t border-gray-200 transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>
        <Navigation />
      </nav>
    </header>
  );
};

export default Header;
