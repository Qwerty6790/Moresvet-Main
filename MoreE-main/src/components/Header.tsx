import React, { useState, useEffect } from "react";
import { Menu, SearchIcon, X } from "lucide-react";
import { FaHeart, FaFacebook, FaInstagram, FaTelegram, FaMapMarkerAlt } from "react-icons/fa";
import { BiSolidBasket } from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";

const Header: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
    className={`fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg shadow-lg transition-all duration-300 ${
      isScrolled ? "py-2" : "py-4"
    }`}
  >
    {/* Основная часть */}
    <div className="container mx-auto px-4 lg:px-16 flex justify-between items-center flex-wrap gap-y-4 transition-all duration-300">
      {/* Логотип */}
      <a
        href="/"
        className={`font-extrabold ${
          isScrolled ? "text-2xl" : "text-4xl"
        } text-gray-900 hover:text-blue-600 transition`}
      >
        MORE ELECTRIKI
      </a>
  
      {/* Навигация */}
      <nav className="hidden lg:flex space-x-8 font-semibold text-lg">
        <a href="/products" className="text-gray-800 hover:text-neutral-700 transition duration-300">
          Каталог
        </a>
        <a href="/map" className="text-gray-800 hover:text-neutral-700 transition duration-300">
          На карте
        </a>
        <a href="/about" className="text-gray-800 hover:text-neutral-700 transition duration-300">
          О нас
        </a>
      </nav>
  
      {/* Поиск, корзина, избранное */}
      <div className="flex items-center space-x-4 md:space-x-6 flex-wrap">
        {/* Поиск */}
        <a href="/search">
          <SearchIcon color="black" />
        </a>
  
        {/* Избранное */}
        <a href="/liked" className="relative">
          <FaHeart size={24} className="text-gray-800 hover:text-red-500 transition" />
        </a>
  
        {/* Корзина */}
        <div className="relative group">
          <a href="/cart">
            <div className="flex items-center border rounded-lg px-2 py-2 hover:shadow-lg cursor-pointer transition">
              <BiSolidBasket size={24} className="text-gray-800" />
              <span className="ml-2 text-black hidden md:inline font-medium">Корзина</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
          </a>
        </div>
  
        {/* Авторизация */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          <a
            href="/auth/login"
            className="border px-4 py-2 rounded-lg bg-red-950 text-white font-semibold hover:bg-red-800 transition"
          >
            Войти
          </a>
          <a
            href="/auth/register"
            className="bg-red-950 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-800 transition"
          >
            Регистрация
          </a>
        </div>
      </div>
  
      {/* Кнопка мобильного меню */}
      <button
        className="lg:hidden p-2 rounded-lg border text-gray-900 hover:bg-gray-200 transition"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </div>
  
    {/* Мобильное меню */}
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          className="fixed top-0 z-50 left-0 h-screen w-3/4 sm:w-1/2 bg-black text-white shadow-xl"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 250, damping: 30 }}
        >
          {/* Заголовок меню */}
          <div className="p-4 flex justify-between items-center border-b border-gray-700">
            <a href="/" className="text-xl font-bold text-white">
              MORE ELECTRIKI
            </a>
            <button onClick={() => setIsMenuOpen(false)} className="text-white">
              <X size={30} />
            </button>
          </div>
  
          {/* Ссылки меню */}
          <div className="flex flex-col px-6 space-y-4 mt-6 text-lg">
            <a href="/products" className="hover:text-blue-400 flex items-center space-x-2 transition duration-300">
              <Menu />
              <span>Каталог</span>
            </a>
            <a href="/map" className="hover:text-blue-400 flex items-center space-x-2 transition duration-300">
              <FaMapMarkerAlt />
              <span>На карте</span>
            </a>
            <a href="/about" className="hover:text-blue-400 transition duration-300">
              О нас
            </a>
            <a href="/liked" className="hover:text-blue-400 transition duration-300">
              Избранное
            </a>
            <a href="/orders" className="hover:text-blue-400 transition duration-300">
              Мои заказы
            </a>
            <a href="/auth/register" className="hover:text-blue-400 transition duration-300">
              Войти
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </header>
  
  );
};

export default Header;
