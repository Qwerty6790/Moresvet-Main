import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, Menu as MenuIcon, X, ChevronRight, Phone, Mail, MapPin, Camera } from 'lucide-react';
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

  const mainMenu = [
    'Освещение для дома',
    'Уличное освещение',
    'Розетки и выключатели',
    'Модульное оборудование',
    'Умный дом',
    'Электротовары',
    'Товары для дома',
    'Акции'
  ];

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
      {/* Top brand bar */}
      <div className="hidden lg:block w-full bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-xs text-gray-500 py-1">
            Strotskis Group: Eurosvot, Elektrostandard, Werkel
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center bg-white transition-all duration-300">
        {/* Left section */}
        <div className="flex items-center lg:space-x-6">
          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
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
            <img 
              src="/images/logo.png" 
              alt="minimir" 
              className="h-8 md:h-10"
            />
          </a>

          {/* Desktop catalog button */}
          <button className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-black text-white rounded">
            <MenuIcon className="w-5 h-5" />
            <span>Каталог</span>
          </button>
        </div>

        {/* Search bar - desktop */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-6">
          <div className="relative flex items-center w-full">
            <form onSubmit={handleSearchSubmit} className="w-full flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск"
                className="w-full px-4 py-2 text-sm border border-r-0 border-gray-300 rounded-l text-black focus:outline-none focus:border-gray-400"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-900 hover:bg-black transition duration-200 rounded-r"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </form>
            <button className="ml-2 p-2 hover:bg-gray-100 rounded">
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile search button */}
        <button 
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          <Search className="w-6 h-6" />
        </button>

        {/* Right section */}
        <div className="flex items-center space-x-1 md:space-x-6">
          {/* Phone number */}
          <div className="hidden lg:block text-right">
            <div className="font-bold text-2xl text-black">8 800 777 15 37</div>
            <div className="text-xs text-gray-600">Консультации и поддержка 24/7</div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1 md:space-x-4">
            <a href='/auth/register' className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg">
              <User className="w-6 h-6 text-gray-700" />
              <span className="hidden text-xs font-medium text-gray-700 mt-1 lg:block">Войти</span>
            </a>
            <a href='/liked' className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg">
              <Heart className="w-6 h-6 text-gray-700" />
              <span className="hidden text-xs font-medium text-gray-700 mt-1 lg:block">Избранное</span>
            </a>
            <a href='/cart' className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-gray-700" />
              <span className="hidden text-xs font-medium text-gray-700 mt-1 lg:block">Корзина</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      <div className={`lg:hidden w-full bg-white border-t border-gray-100 transition-all duration-300 ${isSearchOpen ? 'h-16' : 'h-0 overflow-hidden'}`}>
        <form onSubmit={handleSearchSubmit} className="h-full p-4">
          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-l text-black focus:outline-none focus:border-gray-400"
            />
            <button type="submit" className="px-6 py-2 bg-gray-900 rounded-r">
              <Search className="w-5 h-5 text-white" />
            </button>
            <button className="ml-2 p-2 hover:bg-gray-100 rounded">
              <Camera className="w-5 h-5 text-gray-600" />
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
          {/* Main categories */}
     
           
             <Navigation />
          

          {/* Additional menu items */}
          <nav className="py-2 mt-4 bg-gray-50">
            {menuItems.map((item) => (
              <div key={item.id} className="border-b border-gray-100 last:border-0">
                <button
                  className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-gray-100"
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

                <div className={`overflow-hidden transition-all duration-200 ${activeSubmenu === item.id ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="bg-white py-2">
                    {item.component ? (
                      <div className="px-6">
                        <item.component />
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {item.items?.map((subItem, index) => (
                          <li key={index}>
                            <a href="#" className="block px-8 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50">
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
      <nav className={`hidden lg:block bg-white border-t border-gray-100 transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8 py-3">
            <Navigation />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;