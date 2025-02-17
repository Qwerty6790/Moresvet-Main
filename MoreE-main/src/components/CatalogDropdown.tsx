'use client';
import { AlignJustify, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number>(0);

  const categories = [
    { 
      links: [{ href: '/products', label: 'Все товары' }],
      image: '/images/p1.png'
    },
    { 
      links: [{ href: '/auth/register', label: 'Войти' }],
      image: '/images/p1.png'
    },
    { 
      links: [{ href: '/cart', label: 'Корзина' }],
      image: '/images/p1.png'
    },
    { 
      links: [{ href: '/liked', label: 'Избранное' }],
      image: '/images/p1.png'
    },
  ];

  const renderCategories = (): JSX.Element => (
    <div className="grid grid-cols-1 gap-4">
      {categories.map((category, index) => (
        <div key={index} className="relative">
          <ul>
            {category.links.map((link) => (
              <li
                key={link.href}
                className="relative p-10 max-md:text-4xl text-6xl"
                onMouseEnter={() => setHoveredCategoryIndex(index)}
              >
                <motion.a
                  href={link.href}
                  className="block p-2 hover:text-orange-500 text-neutral-500 transition duration-300"
                  initial={{ x: 0 }}
                  whileHover={{ x: 10 }}
                >
                  {link.label}
                </motion.a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderImage = (): JSX.Element => {
    const image = categories[hoveredCategoryIndex]?.image;
    return (
      <motion.div
        className="fixed top-0 right-0 w-1/2 h-full max-md:hidden flex items-center justify-center "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <motion.img
          src={image}
          alt={`Category ${hoveredCategoryIndex}`}
          className="w-full h-full object-contain "
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  };

  const CloseButton = () => (
    <motion.button
      onClick={() => setIsOpen(false)}
      className="fixed top-8 right-8 z-30 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ rotate: -90, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      exit={{ rotate: 90, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <X size={32} className="text-neutral-800" />
    </motion.button>
  );

  return (
    <div className="relative">
      {/* Desktop menu toggle */}
      <div
        className="hidden lg:flex items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="w-9 h-8 mr-3 text-black" />
      </div>

      {/* Mobile menu toggle */}
      <div
        className="lg:hidden flex items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <AlignJustify size={23} />
      </div>

      {/* Dropdown menu */}
      <motion.div
        className={`fixed inset-0 bg-white text-black z-20 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {isOpen && <CloseButton />}
        
        {/* Header */}
        <div className="flex items-center p-6 ">
          <h2 className="text-4xl font-bold">Каталог</h2>
        </div>

        {/* Menu content */}
        <div className="relative flex h-full">
          <div className="w-1/2 p-6 overflow-y-auto">
            {renderCategories()}
          </div>
          {renderImage()}
        </div>
      </motion.div>
    </div>
  );
};

export default DropdownMenu;