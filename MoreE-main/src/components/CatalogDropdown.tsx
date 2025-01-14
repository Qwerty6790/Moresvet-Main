'use client';
import { AlignJustify, X } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);

  const categories = [
    { 
      links: [{ href: '/products', label: 'Все товары' }],
      images: ['/images/p1.png', '/images/p3.png', '/images/p2.png'], // Убрана третья фотография
    },
    { 
      links: [{ href: '/categories', label: 'Потолочные люстры' }],
      images: ['/images/p4.png', '/images/p5.png'], // Убрана третья фотография
    },
    { 
      links: [{ href: '/categories', label: 'Подвесные люстры' }],
      images: ['/images/p6.png', '/images/p7.png'], // Убрана третья фотография
    },
    { 
      links: [{ href: '/categories', label: 'Светильники' }],
      images: ['/images/p8.png', '/images/p9.png'], // Убрана третья фотография
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
                className="relative p-10 max-md:text-4xl text-5xl"
                onMouseEnter={() => setHoveredCategoryIndex(index)} // Track hovered category
                onMouseLeave={() => setHoveredCategoryIndex(null)} // Reset on leave
              >
                <motion.a
                  href={link.href}
                  className="block p-2 hover:text-orange-500 transition duration-300"
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

  const renderImages = (): JSX.Element | null => {
    if (hoveredCategoryIndex === null) return null;
  
    const images = categories[hoveredCategoryIndex]?.images || [];
    return (
      <motion.div
        className=" top-1/2 right-10 transform -translate-y-1/2 flex flex-col space-y-4"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {images.map((src, index) => (
          <motion.img
            key={index}
            src={src}
            alt={`Category ${index}`}
            className="rounded-lg shadow-lg w-[300px] h-[200px] object-cover"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="relative">
      {/* Desktop menu toggle */}
      <div
        className="hidden lg:flex items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)} // Toggle menu
      >
        <AlignJustify size={30} />
        <span className="ml-2 font-medium">Каталог</span>
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
        className={`fixed inset-0 bg-white text-black z-20 p-6 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center border-b border-gray-300 pb-4">
          <h2 className="text-4xl font-bold">Каталог</h2>
          <button
            onClick={() => setIsOpen(false)} // Close menu
            className="text-black hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu content */}
        <div className="relative mt-4 flex">
          <div className="w-3/4">{renderCategories()}</div>
          <div className="relative">{renderImages()}</div>
        </div>
      </motion.div>
    </div>
  );
};

export default DropdownMenu;
