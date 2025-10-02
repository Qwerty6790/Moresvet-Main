'use client';

import React from 'react';
import Link from 'next/link';
import { FaInstagram, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';

// Компонент для ссылок в футере
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link href={href} className="text-white hover:opacity-80 transition-opacity duration-200">
      {children}
    </Link>
  </li>
);

// Компонент для иконок социальных сетей
const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80 transition-opacity duration-200">
        {icon}
    </a>
);

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Основная сетка футера */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Колонка 1: Бренд и информация */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <h2 className="text-3xl font-bold tracking-wider">MORESVET</h2>
            </Link>
            <p className="text-sm text-white opacity-90 max-w-xs">
              Современные решения для освещения вашего пространства. Откройте для себя мир света.
            </p>
          </div>

          {/* Колонка 2: Компания */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">Компания</h3>
            <ul className="space-y-3">
              <FooterLink href="/about">О нас</FooterLink>
              <FooterLink href="/about">Доставка и оплата</FooterLink>
              <FooterLink href="/about">Контакты</FooterLink>
              <FooterLink href="/about">Политика</FooterLink>
            </ul>
          </div>

          {/* Колонка 3: Каталог */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">Каталог</h3>
            <ul className="space-y-3">
              <FooterLink href="/catalog/chandeliers">Люстры</FooterLink>
              <FooterLink href="/catalog/wall-sconces">Бра</FooterLink>
              <FooterLink href="/catalog/lights/track-lights">Трековые светильники</FooterLink>
              <FooterLink href="/catalog/outdoor-lights">Уличный свет</FooterLink>
            </ul>
          </div>

          {/* Колонка 4: Контакты */}
          <div>
             <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">Связаться с нами</h3>
             <div className="space-y-3 text-sm">
                 <p>
                     <a href="tel:+79264513132" className="text-white hover:opacity-80 transition-opacity">
                         +7 (926) 451-31-32
                     </a>
                 </p>
                 <p>
                     <a href="mailto:info@moresvet.ru" className="text-white hover:opacity-80 transition-opacity">
                         info@moresvet.ru
                     </a>
                 </p>
                 <p className="text-white opacity-90">
                    Москва, ТК КОНСТРУКТОР, <br />
                    25-й км МКАД
                 </p>
             </div>
          </div>

        </div>

        {/* Нижняя панель с копирайтом и соцсетями */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="text-white opacity-70">
            © {new Date().getFullYear()} moresvet.ru. Все права защищены.
          </p>
        
        </div>
      </div>
    </footer>
  );
};

export default Footer;