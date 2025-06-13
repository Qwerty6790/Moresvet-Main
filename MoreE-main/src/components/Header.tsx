import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  const router = useRouter();
  const catalogRef = useRef<HTMLDivElement | null>(null);
  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Хук для поиска товаров
  const { products, loading } = useSearchProducts(searchQuery);

  // Данные для слайдера
  const sliderData = [
    {
      image: '/images/assets_task_01jrdpq6eef67argn1c1279zna_img_0.webp', // Замените на другие изображения
      title: 'Новая коллекция',
      subtitle: 'Весна 2024',
      description: 'Элегантные решения для вашего интерьера',
      buttonText: 'Смотреть каталог'
    },
    {
      image: '/images/assets_task_01jrdr96hce8gvc3yrrapknvq8_img_0.webp', // Замените на другие изображения
      title: 'Специальное предложение',
      subtitle: 'Скидки до 30%',
      description: 'На избранные модели светильников',
      buttonText: 'Узнать больше'
    }
  ];

  // Автоматическое переключение слайдов
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000); // Меняем слайд каждые 5 секунд

    return () => clearInterval(interval);
  }, [sliderData.length]);

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


  
  


 
  // Массив основных пунктов меню
  const mainMenuItems = [
    { title: "Каталог", link: "/products", hasSubmenu: true },
    { title: "О нас", link: "/about", hasSubmenu: true },
    { title: "Новости", link: "/news" },
  ];

  const toggleAccordionItem = (index: number) => {
    setExpandedAccordionItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index) 
        : [...prev, index]
    );
  };

  // Функция для переключения на конкретный слайд
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <>
      {/* Фоновое изображение только для верхней части страницы - слайдер */}
      <div className="absolute top-0 left-0 right-0 h-screen z-0">
        {sliderData.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url('${slide.image}')`,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 pt-4 relative z-10">
        <header className="fixed top-4 left-0 right-0 z-50 w-full">
          <div className="max-w-7xl mx-auto px-4">
            {/* Основной хедер с прозрачным фоном и закругленными краями */}
            <div className=" backdrop-blur-lg bg-black/50 z-60 text-black rounded-xl overflow-hidden shadow-xl">
              <div className="px-6">
                <div className="flex items-center justify-between h-16">
                  {/* Логотип */}
                  <Link href="/" className="flex-shrink-0 text-black text-2xl font-bold flex items-center">
                  <span className='text-white text-3xl font-light'>MORELECKTRIKI</span>
                  </Link>

                  {/* Основное меню - десктоп */}
                  <nav className="hidden lg:flex items-center space-x-8 mx-4">
                    {mainMenuItems.map((item, index) => (
                      <div key={index} className="relative group">
                        <Link
                          href={item.link}
                          className="text-white hover:text-gray-300 text-base font-medium transition-colors flex items-center"
                        >
                          {item.title}
                          {item.hasSubmenu && <ChevronDown className="w-4 h-4 ml-1" />}
                        </Link>
                      </div>
                    ))}
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
              
              {/* Нижняя полоса с контактами */}
              <div className="border-t border-white/50 text-white">
                <div className="px-6 flex justify-between items-center h-10">
                  <div className="hidden md:flex items-center">
                    <a href="tel:88005509084" className="text-sm text-white">8-800-550-90-84</a>
                  </div>
                  <div className="hidden md:flex items-center">
                    <a href="mailto:info@donel.su" className="text-sm text-white">info@donel.su</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Мобильное меню */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-lg bg-opacity-95  overflow-y-auto rounded-lg">
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
                    {mainMenuItems.map((item, index) => (
                      <Link 
                        key={index}
                        href={item.link}
                        className="flex items-center justify-between py-3 px-2 text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                      >
                        <span>{item.title}</span>
                      </Link>
                    ))}
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
      
      {/* Баннер под хедером с автоматическим слайдером */}
      <div className="relative z-10 pt-36 w-full h-screen">
        <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-112px)] flex items-center">
          {sliderData.map((slide, index) => (
            <div 
              key={index} 
              className={`w-1/2 transition-opacity duration-1000 ease-in-out absolute ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
            >
              <h1 className="text-white text-7xl font-bold mb-2">{slide.title}</h1>
              <h2 className="text-white text-7xl font-bold mb-8">{slide.subtitle}</h2>
              <p className="text-white text-xl mb-8">{slide.description}</p>
              
              <button className="bg-white text-black font-medium px-8 py-4 rounded-md hover:bg-opacity-90 transition-colors">
                {slide.buttonText}
              </button>
            </div>
          ))}
          
          {/* Индикаторы слайдера */}
          <div className="absolute bottom-10 left-4 flex space-x-2">
            {sliderData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Белый блок для контента под баннером */}
      <div className="relative z-20 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Здесь будет основной контент страницы */}
          <h2 className="text-3xl font-bold mb-8">Популярные категории</h2>
          <div className="grid grid-cols-4 gap-6">
            {/* Примеры категорий */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-gray-100 p-4 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;