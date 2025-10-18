'use client';

import React from 'react';
import Link from 'next/link';
import { FaInstagram, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';

// Компонент для ссылок в футере
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link href={href} className="text-white/80 hover:text-white transition-colors duration-300">
      {children}
    </Link>
  </li>
);


const Footer = () => {
  return (
    <footer className="bg-black text-white relative overflow-hidden">

      

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Основная сетка футера */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Колонка 1: Бренд и информация */}
          <div className="space-y-6">
            <Link href="/" className="inline-block group">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-widest group-hover:text-white/80 transition-colors">
                LUMORALIGHT
              </h2>
            </Link>

          </div>

          {/* Колонка 2: Компания */}
          <div>
            <h3 className="text-2xl font-semibold tracking-wider uppercase mb-6 text-white">
              Компания
            </h3>
            <ul className="space-y-3 text-lg">
              <FooterLink href="/about">О нас</FooterLink>
              <FooterLink href="/about">Доставка и оплата</FooterLink>
              <FooterLink href="/about">Гарантия</FooterLink>
            </ul>
          </div>

          {/* Колонка 3: Информация */}
          <div>
            <h3 className="text-2xl font-semibold tracking-wider uppercase mb-6 text-white">
              Информация
            </h3>
            <ul className="space-y-3 text-lg">
              <FooterLink href="/about">Контакты</FooterLink>
              <FooterLink href="/about">Политика конфиденциальности</FooterLink>
              <FooterLink href="/about">Правила и условия</FooterLink>
            </ul>
          </div>

          {/* Колонка 4: Контакты */}
          <div>
            <h3 className="text-2xl font-semibold tracking-wider uppercase mb-6 text-white">
              Связаться с нами
            </h3>
            <div className="space-y-4 text-lg">
              <p>
                <a 
                  href="tel:+79264513132" 
                  className="text-white hover:text-white/80 transition-colors font-medium text-lg"
                >
                  +7 (926) 451-31-32
                </a>
              </p>
            </div>
          </div>
        </div>



        {/* Нижняя панель с копирайтом и реквизитами */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white">
          <p>
            © {new Date().getFullYear()} LUMORALIGHT. Все права защищены.
          </p>
          <p className="text-center text-white md:text-right">
            ИНН: 616712200437 | ИП: Багдасарян Ашот | ОГРНИП: 324150810029217
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;