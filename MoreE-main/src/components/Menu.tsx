'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface MenuItem {
  columns: {
    title: string;
    items: string[];
  }[];
  featured?: {
    image: string;
    title: string;
    link: string;
  };
}

interface MenuData {
  [key: string]: MenuItem;
}

const Navigation = () => {
  // Состояния для десктопного выпадающего меню и мобильного аккордеона
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  // Данные меню (без изменений)
  const menuData: MenuData = {
    "Освещение для дома": {
      columns: [
        {
          title: "Люстры",
          items: [
            "Потолочная Люстра",
            "Подвесная Люстра",
            "Люстра на штанге",
            "Светильник потолочный",
            "Светильник подвесной",
          ],
        },
        {
          title: "Трековые светильники",
          items: [
            "Трековый светильник",
            "Line Magnetic",
            "Mini Magnetic",
            "Module System",
            "Esthetic Magnetic",
            "Flat Magnetic",
            "Slim Magnetic",
          ],
        },
        {
          title: "Точечные светильники",
          items: [
            "Спот",
            "Накладной светильник",
            "Встраиваемый светильник",
          ],
        },
        {
          title: "Настольные лампы и торшеры",
          items: [
            "Настольная лампа",
            "Торшер",
          ],
        },
        {
          title: "Бра",
          items: [
            "Бра",
            "Светильник настенный",
          ],
        },
        {
          title: "Лампы и лампочки",
          items: [
            "Лампа",
            "Лампочка",
          ],
        },
      ],
      featured: {
        image: "/images/13.jpg",
        title: "Световое решение для дома",
        link: "#",
      },
    },
    "Уличное освещение": {
      columns: [
        {
          title: "Светильники для улицы",
          items: [
            "Потолочные уличные светильники",
            "Подвесные уличные светильники",
            "Светильники с датчиками",
            "Светодиодные уличные светильники",
          ],
        },
        {
          title: "Уличные фонари",
          items: [
            "Декоративные фонари",
            "Энергосберегающие фонари",
            "Фонари для парков",
          ],
        },
      ],
      featured: {
        image: "/images/Fonar-yliza.jpg",
        title: "Уличное освещение премиум-класса",
        link: "#",
      },
    },
    "Розетки и выключатели": {
      columns: [
        {
          title: "Розетки",
          items: [
            "Настенные розетки",
            "Подвесные розетки",
            "Уголковые розетки",
          ],
        },
        {
          title: "Выключатели",
          items: [
            "Тактильные выключатели",
            "Сенсорные выключатели",
            "Электронные выключатели",
          ],
        },
      ],
      featured: {
        image: "/images/switch.png",
        title: "Современные розетки и выключатели",
        link: "#",
      },
    },
    "Модульное оборудование": {
      columns: [
        {
          title: "Панели управления",
          items: [
            "Цифровые панели",
            "Модульные системы",
            "Интерактивные панели",
          ],
        },
        {
          title: "Системы монтажа",
          items: [
            "Металлические крепления",
            "Пластиковые крепления",
            "Комплектующие",
          ],
        },
      ],
      featured: {
        image: "/images/module.png",
        title: "Модульное оборудование для вашего проекта",
        link: "#",
      },
    },
    "Умный дом": {
      columns: [
        {
          title: "Системы умного дома",
          items: [
            "Управление освещением",
            "Управление климатом",
            "Безопасность и видеонаблюдение",
          ],
        },
        {
          title: "Устройства управления",
          items: [
            "Пульты дистанционного управления",
            "Смартфоны и планшеты",
            "Интеграция с голосовыми ассистентами",
          ],
        },
      ],
      featured: {
        image: "/images/smart-home.png",
        title: "Решения для умного дома",
        link: "#",
      },
    },
    "Электротовары": {
      columns: [
        {
          title: "Кабели и проводка",
          items: [
            "Электрические кабели",
            "Силовые кабели",
            "Проводка для дома",
          ],
        },
        {
          title: "Защитное оборудование",
          items: [
            "Автоматические выключатели",
            "УЗО",
            "Розетки с заземлением",
          ],
        },
      ],
      featured: {
        image: "/images/electrical.png",
        title: "Качественные электротовары",
        link: "#",
      },
    },
    "Товары для дома": {
      columns: [
        {
          title: "Декор и освещение",
          items: [
            "Настенные светильники",
            "Торшеры",
            "Подсветка интерьера",
          ],
        },
        {
          title: "Мебель и аксессуары",
          items: [
            "Столы и стулья",
            "Декоративные элементы",
            "Ковры и шторы",
          ],
        },
      ],
      featured: {
        image: "/images/home.png",
        title: "Товары для уютного дома",
        link: "#",
      },
    },
    "Новинки": {
      columns: [
        {
          title: "Новые поступления",
          items: [
            "Новейшие технологии",
            "Последние тренды",
            "Эксклюзивные модели",
          ],
        },
      ],
      featured: {
        image: "/images/new.png",
        title: "Новинки сезона",
        link: "#",
      },
    },
    "Акции": {
      columns: [
        {
          title: "Скидки",
          items: [
            "Скидки до 50%",
            "Сезонные акции",
            "Распродажи",
          ],
        },
        {
          title: "Спецпредложения",
          items: [
            "Комплекты товаров",
            "Подарки при покупке",
            "Акционные предложения",
          ],
        },
      ],
      featured: {
        image: "/images/sale.png",
        title: "Акции и распродажи",
        link: "#",
      },
    },
    "Дизайнерам": {
      columns: [
        {
          title: "Инструменты",
          items: [
            "Программы для дизайна",
            "Профессиональное оборудование",
            "Аксессуары для творчества",
          ],
        },
        {
          title: "Материалы",
          items: [
            "Декоративные материалы",
            "Текстиль и ткани",
            "Краски и лаки",
          ],
        },
      ],
      featured: {
        image: "/images/designer.png",
        title: "Инструменты для дизайна интерьера",
        link: "#",
      },
    },
    "Все о компании": {
      columns: [
        {
          title: "О нас",
          items: [
            "История компании",
            "Наша миссия",
            "Партнёры",
          ],
        },
        {
          title: "Контакты",
          items: [
            "Адрес",
            "Телефон",
            "Email",
          ],
        },
        {
          title: "Вакансии",
          items: [
            "Открытые вакансии",
            "Как подать заявку",
          ],
        },
      ],
      featured: {
        image: "/images/company.png",
        title: "Узнайте больше о нас",
        link: "#",
      },
    },
  };

  // Массив пунктов навигации
  const navItems = [
    "Освещение для дома",
    "Уличное освещение",
    "Розетки и выключатели",
    "Модульное оборудование",
    "Умный дом",
    "Электротовары",
    "Товары для дома",
    "Новинки",
    "Акции",
    "Дизайнерам",
    "Все о компании",
  ];

  // Обработчики для десктопного dropdown с задержкой
  const handleDropdownMouseEnter = (item: string) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(item);
  };

  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 200); // задержка в 200 мс, можно регулировать
    setDropdownTimeout(timeout);
  };

  return (
    <nav className="bg-white w-full relative">
      {/* Верхняя панель: логотип и переключатель мобильного меню */}
      <div className="container mx-auto px-4 flex items-center justify-between py-4">

        {/* Кнопка-гамбургер – видна только на мобильных */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="text-black flex focus:outline-none"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            Каталог
          </button>
        </div>
        {/* Десктопное меню – видно на md и выше */}
        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <div
              key={item}
              className="relative group"
              onMouseEnter={() => handleDropdownMouseEnter(item)}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <Link href={`/search/${encodeURIComponent(item)}?query=${encodeURIComponent(item)}`}>
                <span className="py-3 text-sm font-medium text-black hover:text-gray-600 whitespace-nowrap transition-colors duration-200">
                  {item}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Десктопное выпадающее меню с улучшенным дизайном */}
      {activeDropdown && menuData[activeDropdown] && (
        <div
          className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-xl z-50"
          onMouseEnter={handleDropdownMouseEnter.bind(null, activeDropdown)}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <div className="max-w-screen-xl mx-auto px-8 py-8">
            <div className="flex">
              {/* Основная область: колонки */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                {menuData[activeDropdown].columns.map((column, idx) => (
                  <div key={`${activeDropdown}-${idx}`} className="p-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{column.title}</h3>
                    <ul className="space-y-2">
                      {column.items.map((subItem) => (
                        <li key={subItem}>
                          <Link href={`/search/${encodeURIComponent(subItem)}?query=${encodeURIComponent(subItem)}`}>
                            <span className="block text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                              {subItem}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {/* Боковая область: featured (показываем только на больших экранах) */}
              {menuData[activeDropdown].featured && (
                <div className="hidden lg:block w-1/3 pl-8">
                  <a href={menuData[activeDropdown].featured.link} className="block group">
                    <img
                      src={menuData[activeDropdown].featured.image}
                      alt={menuData[activeDropdown].featured.title}
                      className="w-full h-64 object-cover rounded-lg shadow-md transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-800 uppercase group-hover:text-gray-900 transition-colors duration-200">
                        {menuData[activeDropdown].featured.title}
                      </h3>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Мобильное меню (аккордеон) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          {navItems.map((item) => (
            <div key={item}>
              <div
                className="flex justify-between items-center p-4 border-b cursor-pointer"
                onClick={() => setMobileActiveDropdown(mobileActiveDropdown === item ? null : item)}
              >
                <span className="text-black font-medium">{item}</span>
                <svg
                  className={`h-4 w-4 transform transition-transform duration-200 ${
                    mobileActiveDropdown === item ? 'rotate-180' : 'rotate-0'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {mobileActiveDropdown === item && menuData[item] && (
                <div className="p-4 bg-gray-50">
                  <div className="space-y-4">
                    {menuData[item].columns.map((column, idx) => (
                      <div key={`${item}-${idx}`}>
                        <h3 className="text-base font-bold text-gray-800 mb-2">{column.title}</h3>
                        <ul className="space-y-2">
                          {column.items.map((subItem) => (
                            <li key={subItem}>
                              <Link href={`/search/${encodeURIComponent(subItem)}?query=${encodeURIComponent(subItem)}`}>
                                <span className="block text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                                  {subItem}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {menuData[item].featured && (
                      <div className="mt-4">
                        <a href={menuData[item].featured.link} className="block">
                          <img
                            src={menuData[item].featured.image}
                            alt={menuData[item].featured.title}
                            className="w-full h-40 object-cover rounded-lg shadow-md"
                          />
                          <h3 className="mt-2 text-lg font-semibold text-gray-800 uppercase">
                            {menuData[item].featured.title}
                          </h3>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
