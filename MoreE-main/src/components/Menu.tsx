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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Данные выпадающего меню для каждого пункта навигации
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
          ]
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
          ]
        },
        {
          title: "Точечные светильники",
          items: [
            "Спот",
            "Накладной светильник",
            "Встраиваемый светильник",
          ]
        },
        {
          title: "Настольные лампы и торшеры",
          items: [
            "Настольная лампа",
            "Торшер",
          ]
        },
        {
          title: "Бра",
          items: [
            "Бра",
            "Светильник настенный",
          ]
        },
        {
          title: "Лампы и лампочки",
          items: [
            "Лампа",
            "Лампочка",
          ]
        },
      ],
      
      featured: {
        image: "/images/Lustry-umni.png",
        title: "ТРЕКОВАЯ СИСТЕМА SLIM MAGNETIC 2000-3500K",
        link: "#"
      }
    },
    "Уличное освещение": {
      columns: [
        {
          title: "Светильники для улицы",
          items: [
            "Потолочные уличные светильники",
            "Подвесные уличные светильники",
            "Светильники с датчиками",
            "Светодиодные уличные светильники"
          ]
        },
        {
          title: "Уличные фонари",
          items: [
            "Декоративные фонари",
            "Энергосберегающие фонари",
            "Фонари для парков"
          ]
        }
      ],
      featured: {
        image: "/images/Fonar-yliza.png",
        title: "Уличное освещение премиум-класса",
        link: "#"
      }
    },
    "Розетки и выключатели": {
      columns: [
        {
          title: "Розетки",
          items: [
            "Настенные розетки",
            "Подвесные розетки",
            "Уголковые розетки"
          ]
        },
        {
          title: "Выключатели",
          items: [
            "Тактильные выключатели",
            "Сенсорные выключатели",
            "Электронные выключатели"
          ]
        }
      ],
      featured: {
        image: "/images/switch.png",
        title: "Современные розетки и выключатели",
        link: "#"
      }
    },
    "Модульное оборудование": {
      columns: [
        {
          title: "Панели управления",
          items: [
            "Цифровые панели",
            "Модульные системы",
            "Интерактивные панели"
          ]
        },
        {
          title: "Системы монтажа",
          items: [
            "Металлические крепления",
            "Пластиковые крепления",
            "Комплектующие"
          ]
        }
      ],
      featured: {
        image: "/images/module.png",
        title: "Модульное оборудование для вашего проекта",
        link: "#"
      }
    },
    "Умный дом": {
      columns: [
        {
          title: "Системы умного дома",
          items: [
            "Управление освещением",
            "Управление климатом",
            "Безопасность и видеонаблюдение"
          ]
        },
        {
          title: "Устройства управления",
          items: [
            "Пульты дистанционного управления",
            "Смартфоны и планшеты",
            "Интеграция с голосовыми ассистентами"
          ]
        }
      ],
      featured: {
        image: "/images/smart-home.png",
        title: "Решения для умного дома",
        link: "#"
      }
    },
    "Электротовары": {
      columns: [
        {
          title: "Кабели и проводка",
          items: [
            "Электрические кабели",
            "Силовые кабели",
            "Проводка для дома"
          ]
        },
        {
          title: "Защитное оборудование",
          items: [
            "Автоматические выключатели",
            "УЗО",
            "Розетки с заземлением"
          ]
        }
      ],
      featured: {
        image: "/images/electrical.png",
        title: "Качественные электротовары",
        link: "#"
      }
    },
    "Товары для дома": {
      columns: [
        {
          title: "Декор и освещение",
          items: [
            "Настенные светильники",
            "Торшеры",
            "Подсветка интерьера"
          ]
        },
        {
          title: "Мебель и аксессуары",
          items: [
            "Столы и стулья",
            "Декоративные элементы",
            "Ковры и шторы"
          ]
        }
      ],
      featured: {
        image: "/images/home.png",
        title: "Товары для уютного дома",
        link: "#"
      }
    },
    "Новинки": {
      columns: [
        {
          title: "Новые поступления",
          items: [
            "Новейшие технологии",
            "Последние тренды",
            "Эксклюзивные модели"
          ]
        }
      ],
      featured: {
        image: "/images/new.png",
        title: "Новинки сезона",
        link: "#"
      }
    },
    "Акции": {
      columns: [
        {
          title: "Скидки",
          items: [
            "Скидки до 50%",
            "Сезонные акции",
            "Распродажи"
          ]
        },
        {
          title: "Спецпредложения",
          items: [
            "Комплекты товаров",
            "Подарки при покупке",
            "Акционные предложения"
          ]
        }
      ],
      featured: {
        image: "/images/sale.png",
        title: "Акции и распродажи",
        link: "#"
      }
    },
    "Дизайнерам": {
      columns: [
        {
          title: "Инструменты",
          items: [
            "Программы для дизайна",
            "Профессиональное оборудование",
            "Аксессуары для творчества"
          ]
        },
        {
          title: "Материалы",
          items: [
            "Декоративные материалы",
            "Текстиль и ткани",
            "Краски и лаки"
          ]
        }
      ],
      featured: {
        image: "/images/designer.png",
        title: "Инструменты для дизайна интерьера",
        link: "#"
      }
    },
    "Все о компании": {
      columns: [
        {
          title: "О нас",
          items: [
            "История компании",
            "Наша миссия",
            "Партнёры"
          ]
        },
        {
          title: "Контакты",
          items: [
            "Адрес",
            "Телефон",
            "Email"
          ]
        },
        {
          title: "Вакансии",
          items: [
            "Открытые вакансии",
            "Как подать заявку"
          ]
        }
      ],
      featured: {
        image: "/images/company.png",
        title: "Узнайте больше о нас",
        link: "#"
      }
    }
  };

  // Массив пунктов навигации (ключи из menuData)
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

  return (
    <nav className="bg-neutral-800 relative">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6">
          {navItems.map((item) => (
            <div
              key={item}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(item)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {/* Формируем ссылку на страницу поиска с query-параметром */}
              <Link href={`/search/${encodeURIComponent(item)}?query=${encodeURIComponent(item)}`}>
                <span className="py-3 text-sm font-medium text-white hover:text-gray-600 whitespace-nowrap block">
                  {item}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
      {/* Выпадающее меню, центрированное строго посередине */}
      {activeDropdown && menuData[activeDropdown] && (
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-full bg-white shadow-lg z-50"
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="mx-auto">
            <div className="flex flex-col md:flex-row p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 flex-1">
                {menuData[activeDropdown].columns.map((column, idx) => (
                  <div key={`${activeDropdown}-${idx}`} className="min-w-[200px] mb-4 md:mb-0">
                    <h3 className="text-black font-semibold mb-4">{column.title}</h3>
                    <ul className="space-y-2">
                      {column.items.map((subItem) => (
                        <li key={subItem}>
                          {/* Ссылка для подпункта – также переходим на страницу поиска */}
                          <Link href={`/search/${encodeURIComponent(subItem)}?query=${encodeURIComponent(subItem)}`}>
                            <span className="text-sm text-gray-600 hover:text-black block transition-colors duration-150">
                              {subItem}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {menuData[activeDropdown].featured && (
                <div className="mt-8 md:mt-0 md:ml-8 min-w-[300px]">
                  <a href={menuData[activeDropdown].featured.link} className="block group">
                    <img
                      src={menuData[activeDropdown].featured.image}
                      alt={menuData[activeDropdown].featured.title}
                      className="w-full h-60 object-cover"
                    />
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-black uppercase">
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
    </nav>
  );
};

export default Navigation;
