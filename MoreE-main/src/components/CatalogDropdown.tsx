'use client';
import { AlignJustify, X } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const categories = [
    { links: [{ href: '/products', label: 'Все товары' }] },
    { links: [{ href: '/categories', label: 'Потолочные люстры' }] },
    { links: [{ href: '/categories', label: 'Подвесные люстры' }] },{ links: [{ href: '/categories', label: 'Светильники ' }] },
    { links: [{ href: '/categories', label: 'Бра ' }] },
  ];

  const renderCategories = (): JSX.Element => (
    <div className="grid grid-cols-1 gap-4">
      {categories.map((category, index) => (
        <div key={index} className="relative">
          <ul>
            {category.links.map((link) => (
              <li key={link.href} className="relative p-10 max-md:text-4xl text-5xl">
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
        <AlignJustify size={30} />
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
        <div className="mt-4">{renderCategories()}</div>
      </motion.div>
    </div>
  );
};

export default DropdownMenu;
