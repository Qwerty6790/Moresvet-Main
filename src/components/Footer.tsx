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

// Компонент для иконок социальных сетей
const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors duration-300 text-2xl">
        {icon}
    </a>
);

const Footer = () => {
  return (
    <footer className="bg-black text-white relative overflow-hidden">
      {/* Огромный текст на фоне */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[12rem] sm:text-[14rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] font-bold text-white/5 whitespace-nowrap leading-none tracking-tight">
          Свет в твоем доме
        </span>
      </div>

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
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Создаем уют и комфорт в вашем доме с помощью качественного освещения
            </p>
          </div>

          {/* Колонка 2: Компания */}
          <div>
            <h3 className="text-xl font-semibold tracking-wider uppercase mb-6 text-white">
              Компания
            </h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/about">О нас</FooterLink>
              <FooterLink href="/about">Доставка и оплата</FooterLink>
              <FooterLink href="/about">Гарантия</FooterLink>
            </ul>
          </div>

          {/* Колонка 3: Информация */}
          <div>
            <h3 className="text-xl font-semibold tracking-wider uppercase mb-6 text-white">
              Информация
            </h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/about">Контакты</FooterLink>
              <FooterLink href="/about">Политика конфиденциальности</FooterLink>
              <FooterLink href="/about">Правила и условия</FooterLink>
            </ul>
          </div>

          {/* Колонка 4: Контакты */}
          <div>
            <h3 className="text-xl font-semibold tracking-wider uppercase mb-6 text-white">
              Связаться с нами
            </h3>
            <div className="space-y-4 text-sm">
              <p>
                <a 
                  href="tel:+79264513132" 
                  className="text-white hover:text-white/80 transition-colors font-medium text-lg"
                >
                  +7 (926) 451-31-32
                </a>
              </p>
              <p>
                <a 
                  href="mailto:info@lumoralight.ru" 
                  className="text-white/80 hover:text-white transition-colors"
                >
                  info@lumoralight.ru
                </a>
              </p>
             
            </div>
          </div>
        </div>

        {/* Разделительная линия */}
        <div className="border-t border-white/10 my-8"></div>

        {/* Нижняя панель с копирайтом и реквизитами */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} LUMORALIGHT. Все права защищены.
          </p>
          <p className="text-center md:text-right">
            ИНН: 616712200437 | ИП: Багдасарян Ашот | ОГРНИП: 324150810029217
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;