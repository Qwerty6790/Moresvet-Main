import React, { useState, useEffect, useCallback } from 'react';

interface Category {
  id: number;
  title: string;
  image: string;
  name: string;
  span: string;
}

interface FadeState {
  state: 'in' | 'out';
  index: number;
}

const CategoryGrid: React.FC = () => {
  // Все возможные категории для выбора
  const allCategories: Category[] = [
    {
      id: 1,
      title: 'Люстры',
      image: '/images/11.jpg',
      name: 'Люстра',
      span: 'col-span-12 sm:col-span-8 sm:row-span-2 h-[200px] sm:h-[600px]',
    },
    {
      id: 2,
      title: 'Трековые светильники',
      image: '/images/12.jpg',
      name: 'Трековый светильник',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
    {
      id: 3,
      title: 'Розетки и выключатели',
      image: '/images/14.jpg',
      name: 'Розетка',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
    {
      id: 4,
      title: 'Точечные светильники',
      image: '/images/16.jpg',
      name: 'spot-lights',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
    {
      id: 5,
      title: 'Настольные светильники',
      image: '/images/188.jpg',
      name: 'smart-home',
      span: 'col-span-12 sm:col-span-8 sm:row-span-2 h-[200px] sm:h-[600px]',
    },
    {
      id: 6,
      title: 'Уличное освещение',
      image: '/images/15.jpg',
      name: 'Уличный светильник',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
    {
      id: 7,
      title: 'Бра и настенные светильники',
      image: '/images/13.jpg',
      name: 'Бра',
      span: 'col-span-12 sm:col-span-8 sm:row-span-2 h-[200px] sm:h-[600px]',
    },
    {
      id: 8,
      title: 'Светодиодные ленты',
      image: '/images/177.jpg',
      name: 'Светодиодная лента',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
    {
      id: 9,
      title: 'Торшеры',
      image: '/images/178.jpg',
      name: 'Торшер',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
    {
      id: 10,
      title: 'Подвесные светильники',
      image: '/images/179.jpg',
      name: 'Подвесной светильник',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
    {
      id: 11,
      title: 'Умный дом',
      image: '/images/180.jpg',
      name: 'smart-home',
      span: 'col-span-12 sm:col-span-8 sm:row-span-2 h-[200px] sm:h-[600px]',
    },
    {
      id: 12,
      title: 'Аксессуары для освещения',
      image: '/images/181.png',
      name: 'Аксессуар',
      span: 'col-span-12 sm:col-span-4 h-[200px] sm:h-[290px]',
    },
  ];

  // Первоначально отображаются первые 6 категорий
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(allCategories.slice(0, 6));

  // Состояние для отслеживания анимации затухания по id категории
  const [fadingCategories, setFadingCategories] = useState<Record<number, FadeState>>({});

  // Состояние для ховера по категории
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  // Функция для получения случайной категории, которая не отображается
  const getRandomNewCategory = useCallback(
    (currentIds: number[]): Category | null => {
      const availableCategories = allCategories.filter(cat => !currentIds.includes(cat.id));
      if (availableCategories.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * availableCategories.length);
      return availableCategories[randomIndex];
    },
    [allCategories]
  );

  // Периодическая замена только в одной ячейке (с индексом 0)
  useEffect(() => {
    const replaceCategory = () => {
      const currentIds = displayedCategories.map(cat => cat.id);
      const indexToUpdate = 0; // фиксированный индекс для обновления
      const categoryToReplace = displayedCategories[indexToUpdate];

      // Запуск анимации исчезновения
      setFadingCategories(prev => ({
        ...prev,
        [categoryToReplace.id]: { state: 'out', index: indexToUpdate }
      }));

      // После завершения анимации исчезновения заменяем категорию
      setTimeout(() => {
        const newCategory = getRandomNewCategory(currentIds);
        if (newCategory) {
          const updatedCategories = [...displayedCategories];
          updatedCategories[indexToUpdate] = newCategory;
          setDisplayedCategories(updatedCategories);

          // Запуск анимации появления для новой категории
          setFadingCategories(prev => ({
            ...prev,
            [newCategory.id]: { state: 'in', index: indexToUpdate }
          }));

          // Очистка состояния анимации после появления
          setTimeout(() => {
            setFadingCategories(prev => {
              const updated = { ...prev };
              delete updated[newCategory.id];
              return updated;
            });
          }, 500); // длительность анимации появления
        }
      }, 500); // длительность анимации исчезновения
    };

    const interval = setInterval(replaceCategory, 3000);
    return () => clearInterval(interval);
  }, [displayedCategories, getRandomNewCategory]);

  // Функция для установки класса прозрачности по состоянию анимации
  const getOpacityClass = (categoryId: number): string => {
    if (!fadingCategories[categoryId]) return 'opacity-100';
    return fadingCategories[categoryId].state === 'out' ? 'opacity-0' : 'opacity-100';
  };

  return (
    <div className="w-full py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl sm:text-5xl font-medium text-black relative">
            Популярные категории
          </h2>

          <a
            href="/catalog"
            className="hidden sm:inline-flex items-center text-black hover:text-black font-medium transition-colors duration-200"
          >
            Все категории
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {displayedCategories.map((category) => (
            <a
              key={category.id}
              href={`/catalog/${encodeURIComponent(category.name)}`}
              className={`relative overflow-hidden group ${category.span} transition-all duration-500 rounded-xl ${getOpacityClass(
                category.id
              )} shadow-lg hover:shadow-xl`}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 ${
                  hoveredCategory === category.id ? 'opacity-90' : 'opacity-70'
                }`}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300 group-hover:translate-y-0">
                <h3 className="text-white text-xl sm:text-2xl font-medium mb-2">
                  {category.title}
                </h3>
                <div className="w-10 h-0.5 bg-black mb-3 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Смотреть коллекцию
                </p>
              </div>
              <div className="absolute top-4 right-4 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;
