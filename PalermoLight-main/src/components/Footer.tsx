import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaTelegram } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-black py-8">
      {/* Top Section */}
      <div className="container mx-auto px-4 lg:px-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">MoreElectriki</h4>
          <p className="text-sm text-gray-400">
            Электротовары для вашего дома и бизнеса. Качество и надежность — наша цель.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Быстрые ссылки</h4>
          <ul className="space-y-2">
            <li>
              <a href="/about" className="text-sm text-gray-400 hover:text-white transition">
                О компании
              </a>
            </li>
            <li>
              <a href="/products" className="text-sm text-gray-400 hover:text-white transition">
                Каталог товаров
              </a>
            </li>
            <li>
              <a href="/contact" className="text-sm text-gray-400 hover:text-white transition">
                Контакты
              </a>
            </li>
            <li>
              <a href="/faq" className="text-sm text-gray-400 hover:text-white transition">
                Частые вопросы
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Контакты</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Адрес: г. Москва, ул. Электриков, д. 5</li>
            <li>Телефон: <a href="tel:+1234567890" className="hover:text-white">+7 (123) 456-78-90</a></li>
            <li>Email: <a href="mailto:info@moreelectriki.com" className="hover:text-white">info@moreelectriki.com</a></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 my-6"></div>

      {/* Bottom Section */}
      <div className="container mx-auto px-4 lg:px-16 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MoreElectriki. Все права защищены.
        </p>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-500 hover:text-white transition">
            <FaFacebook size={20} />
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition">
            <FaInstagram size={20} />
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition">
            <FaTwitter size={20} />
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition">
            <FaTelegram size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
