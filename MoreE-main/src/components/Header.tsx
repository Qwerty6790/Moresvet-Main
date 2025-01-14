import React, { useState, useEffect } from "react";
import { SearchIcon, X, Menu, Grid, User } from "lucide-react";
import { FaHeart } from "react-icons/fa";
import { BiBasket } from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import DropdownMenu from "./CatalogDropdown";

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
    </div>
  
    <div className="container mx-auto flex items-center justify-between mt-2 md:mt-4 px-4">
      <div className="flex items-center space-x-4">
        <a
          href="/"
          className={`font-extrabold ${
            isScrolled ? "text-lg sm:text-2xl" : "text-2xl sm:text-4xl"
          } text-black  transition truncate`}
        >
          MORE ELECTRIKI
        </a>
  
        <div className="flex items-center   space-x-2 md:space-x-6 bg-black text-xs md:text-sm lg:text-2xl text-white px-3 py-2 md:px-4 md:py-2 rounded truncate>
        ">
           
            <DropdownMenu />
       
        </div>
      </div>
  
      <form className="hidden md:flex mx-5 items-center border border-gray-300 rounded-md overflow-hidden w-1/2">
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
        <a href="/liked" className="relative flex items-center text-black hover:text-gray-700">
          <FaHeart size={24} />
          {wishlistCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-gray-300 shadow-sm">
              {wishlistCount}
            </span>
          )}
        </a>
        <a href="/cart" className="relative flex items-center text-black hover:text-gray-700">
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
            <User   size={24} />
          </a>
        </div>
      </div>
    </div>
  </header>
  
  );
};

export default Header;
