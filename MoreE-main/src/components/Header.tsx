import React, { useState, useEffect } from "react";
import { SearchIcon, X, Menu, Grid, User } from "lucide-react";
import { FaHeart } from "react-icons/fa";
import { BiBasket } from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(3);
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
    <header className={`bg-white py-4 md:py-6 border-b border-gray-300 fixed top-0 w-full z-50 ${isScrolled ? "shadow-lg" : ""}`}>
    <div className="container mx-auto flex flex-wrap items-center justify-between px-4">
      <div className="flex text-sm font-semibold items-center space-x-2 md:space-x-4 w-full md:w-auto justify-between md:justify-start">
        <span className="text-xs sm:text-sm text-black truncate">
          Ваш город: <span className="font-medium">Москва</span>
        </span>
        <div className="hidden sm:block text-xs sm:text-sm text-black">
          <span className="mr-2 sm:mr-4 truncate">8-926-552-21-73</span>
          <span>8-800-250-19-05</span>
        </div>
        <a
          href="mailto:s.roma86@mail.ru"
          className="hidden sm:block text-xs sm:text-sm text-black hover:underline truncate"
        >
          s.roma86@mail.ru
        </a>
      </div>
  
      <nav className="hidden lg:flex flex-wrap items-center space-x-2 lg:space-x-6 text-sm font-semibold text-black">
        <a href="#" className="hover:text-blue-600 truncate">ДИЗАЙНЕРАМ</a>
        <a href="#" className="hover:text-blue-600 truncate">НАШИ ПРОЕКТЫ</a>
        <a href="#" className="hover:text-blue-600 truncate">КОНТАКТЫ</a>
        <a href="#" className="hover:text-blue-600 truncate">3D МОДЕЛИ</a>
        <a href="#" className="hover:text-blue-600 truncate">ОПЛАТА</a>
        <a href="#" className="hover:text-blue-600 truncate">ДОСТАВКА</a>
      </nav>
  
      <button
        className="lg:hidden p-2 rounded-lg border text-gray-900 hover:bg-gray-200 transition"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </div>
  
    <div className="container mx-auto flex items-center justify-between mt-2 md:mt-4 px-4">
      <div className="flex items-center space-x-4">
        <a
          href="/"
          className={`font-extrabold ${
            isScrolled ? "text-lg sm:text-2xl" : "text-2xl sm:text-4xl"
          } text-gray-900 hover:text-blue-600 transition truncate`}
        >
          MORE ELECTRIKI
        </a>
  
        <div className="flex items-center space-x-2 md:space-x-6">
          <button className="bg-black flex text-xs md:text-sm lg:text-2xl text-white px-4 py-2 md:px-8 md:py-2 rounded truncate">
            <Grid className="mt-1" color="white" /> <span className="hidden sm:block">Каталог</span>
          </button>
        </div>
      </div>
  
      <form className="hidden md:flex items-center border border-gray-300 rounded-md overflow-hidden w-1/2">
        <input
          type="text"
          placeholder="Поиск"
          className="flex-1 p-2 text-sm text-gray-700 focus:outline-none"
        />
        <button type="submit" className="px-4">
          <FiSearch size={18} className="text-gray-600" />
        </button>
      </form>
  
      <div className="flex items-center p-2 space-x-2 md:space-x-5">
        <a href="#" className="relative flex items-center text-black hover:text-gray-700">
          <FaHeart size={24} />
          {wishlistCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-gray-300 shadow-sm">
              {wishlistCount}
            </span>
          )}
        </a>
        <a href="#" className="relative flex items-center text-black hover:text-gray-700">
          <BiBasket size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-neutral-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-gray-300 shadow-sm">
              {cartCount}
            </span>
          )}
        </a>
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          <a
            href="/auth/register"
            className="flex text-black rounded-lg transition"
          >
            <User size={24} />
            Войдите
          </a>
        </div>
      </div>
    </div>
  
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          className="fixed top-0 left-0 w-3/4 sm:w-1/2 h-full bg-gray-100 shadow-lg z-40"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="p-4 border-b border-gray-300 flex justify-between items-center">
            <span className="text-lg font-medium">Меню</span>
            <button
              className="text-gray-700 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col p-4 space-y-4 text-black">
            <a href="#" className="hover:text-blue-600 truncate">Каталог</a>
            <a href="#" className="hover:text-blue-600 truncate">ДИЗАЙНЕРАМ</a>
            <a href="#" className="hover:text-blue-600 truncate">НАШИ ПРОЕКТЫ</a>
            <a href="#" className="hover:text-blue-600 truncate">КОНТАКТЫ</a>
            <a href="#" className="hover:text-blue-600 truncate">ОПЛАТА</a>
            <a href="#" className="hover:text-blue-600 truncate">ДОСТАВКА</a>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  </header>
  
  );
};

export default Header;
