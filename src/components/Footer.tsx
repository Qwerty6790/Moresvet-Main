'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1450px] mx-auto px-4 md:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: MoreSvet */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium border-b border-white pb-2 mb-4 text-gray-200">MoreSvet</h2>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Фактический адрес:</p>
              <p>121601, город Москва, Мкад 25-километр,ТК КОНСТРУКТОР</p>
              <p className="mt-4">По данному адресу шоу-рума нет. Ознакомиться с ассортиментом можно только на сайте.</p>
              
              <div className="mt-6">
                <p>Контактный телефон:</p>
                <p className="text-gray-100 hover:text-white transition-colors">+7 (926) 451-31-32</p>
              </div>
            </div>
          </div>

          {/* Column 2: ОБ MORE SVET */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium border-b border-white pb-2 mb-4 text-gray-200">ОБ MORE SVET</h2>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">О компании</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">Доставка</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">Способы оплаты</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">Скачать</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">Контакты</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">Договор-оферта</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">Дизайнерам</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">О товаре</Link></li>
            </ul>
          </div>

          {/* Column 3: НОВОСТИ */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium border-b border-white pb-2 mb-4 text-gray-200">НОВОСТИ</h2>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">Точка на карте</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">Статьи</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">2025</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline transition-colors">2024</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white mt-8 pt-8">
          <div className="text-sm text-center text-gray-400">
            <div>© 2005—2025 moresvet.ru. Все права защищены</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;