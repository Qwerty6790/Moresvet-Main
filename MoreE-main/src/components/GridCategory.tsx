import React from 'react';

const CategoryGrid = () => {
  const categories = [
    {
      title: 'Люстры',
      image: '/images/11.jpg',
      name: 'Люстра',
      // На мобильных — полная ширина и меньшая высота,
      // на sm и выше — col-span-8, 2 ряда и высокая картинка.
      span: 'col-span-12 sm:col-span-8 sm:row-span-2 h-[200px] sm:h-[600px]',
    },
    {
      title: 'Трековые светильники',
      image: '/images/12.jpg',
      name: 'Трековый светильник',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
    {
      title: 'Розетки и выключатели',
      image: '/images/14.jpg',
      name: 'Розетка',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
    {
      title: 'Точечные светильники',
      image: '/images/16.jpg',
      name: 'spot-lights',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
    {
      title: 'Настольные светильники',
      image: '/images/188.jpg',
      name: 'smart-home',
      span: 'col-span-12 sm:col-span-8 sm:row-span-2 h-[200px] sm:h-[600px]',
    },
    {
      title: 'Уличное освещение',
      image: '/images/15.jpg',
      name: 'Уличный светильник',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
  ];

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4 sm:px-8">
        <h2 className="text-3xl sm:text-5xl font-medium text-gray-900 mb-12">
          Популярные категории
        </h2>

        {/* На мобильных — 1 колонка, на sm и выше — 12 колонок */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {categories.map((category) => (
            <a
              key={category.title}
              href={`/catalog/${encodeURIComponent(category.name)}`}
              className={`relative overflow-hidden group ${category.span}`}
            >
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              <h3 className="absolute bottom-6 left-6 text-white text-2xl font-medium">
                {category.title}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;
