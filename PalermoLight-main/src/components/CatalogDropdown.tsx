'use client';
import { AlignJustify, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const categories = [
    { links: [{ href: '/products', label: 'Товары' }] },
    { links: [{ href: '/products', label: 'Категорий' }] },
  ];

  const handleMouseEnter = (label: string): void => {
    setHoveredCategory(label);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleMouseLeave = (): void => {
    setHoveredCategory(null);
  };

  // Hide the dropdown menu when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  const renderCategories = (): JSX.Element => {
    return (
      <div className="grid grid-cols-1 gap-2">
        {categories.map((category, index) => (
          <div
            key={index}
            onMouseEnter={() => handleMouseEnter(category.links[0].label)}
            onMouseLeave={handleMouseLeave}
            className="relative group"
          >
            <ul>
              {category.links.map((link) => (
                <li key={link.href} className="relative pl-8 text-4xl group">
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 bg-transparent rounded-full transition-all duration-300 group-hover:bg-orange-200"></span>
                  <motion.a
                    href={link.href}
                    className="block p-2 hover:text-orange-200 transition duration-300"
                    initial={{ x: 0 }}
                    whileHover={{ x: 10 }} // Apply translate-x effect on hover
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
  };

  return (
    <div className="relative">
      <div
        className="lg:flex max-md:hidden relative w-full h-full"
        onMouseEnter={() => setIsOpen(true)}  // Show menu on hover
        onMouseLeave={() => setIsOpen(false)}  // Hide menu on mouse leave
      >
        <div className="flex items-center font-medium transition duration-300">
          <AlignJustify className="" size={30} />
          Каталог
        </div>
      </div>

      <ul
        className={`fixed right-0 -left-0  h-screen w-screen bg-white text-white z-10 transition-opacity duration-300  ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-between p-4">
          <h2 className="text-5xl font-bold">Каталог</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          {renderCategories()}
        </div>
      </ul>
    </div>
  );
};

export default DropdownMenu;
