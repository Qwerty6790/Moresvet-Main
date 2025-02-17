import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-400 py-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* О Minimir */}
          <div>
            <h3 className="text-black text-2xl sm:text-3xl mb-4">MoreElecriki</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">О компании</a></li>
              <li><a href="#" className="hover:text-white">Контакты</a></li>
              <li><a href="#" className="hover:text-white">Карта сайта</a></li>
              <li><a href="#" className="hover:text-white">Публичная оферта</a></li>
              <li><a href="#" className="hover:text-white">Политика конфиденциальности</a></li>
            </ul>
          </div>

          {/* Покупателю */}
          <div>
            <h3 className="text-white text-2xl sm:text-3xl mb-4">Покупателю</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Личный кабинет</a></li>
              <li><a href="#" className="hover:text-white">Доставка и оплата</a></li>
              <li><a href="#" className="hover:text-white">Обмен и возврат</a></li>
              <li><a href="#" className="hover:text-white">Онлайн примерочная</a></li>
              <li><a href="#" className="hover:text-white">Гарантия</a></li>
            </ul>
          </div>

          {/* Дизайнерам */}
          <div>
            <h3 className="text-white text-2xl sm:text-3xl mb-4">Дизайнерам</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">База 3D моделей</a></li>
              <li><a href="#" className="hover:text-white">Strotskis Club</a></li>
              <li><a href="#" className="hover:text-white">Гайд для дизайнеров Werkel</a></li>
              <li><a href="#" className="hover:text-white">Каталог Werkel 2024</a></li>
              <li><a href="#" className="hover:text-white">Трековые системы освещения Elektrostandard</a></li>
            </ul>
          </div>

          {/* Консультация и Бренды */}
          <div className="space-y-8">
            <div>
              <h3 className="text-white text-2xl sm:text-3xl mb-4">Консультация 24/7</h3>
              <div className="space-y-2">
                <p>8 800 777 15 37</p>
                <p>info@minimir.ru</p>
                <p>WhatsApp</p>
                <p>Telegram</p>
              </div>
            </div>

            <div>
              <h3 className="text-black text-2xl sm:text-3xl mb-4">Наши бренды</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-black">EUROSVET</div>
                <div className="text-black">WERKEL</div>
                <div className="text-black">BOGATES</div>
                <div className="text-black">GOTTIS</div>
                <div className="text-black">ELEKTROSTANDARD</div>
                <div className="text-black">STROTSKIS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-8">
          <h3 className="text-white text-2xl sm:text-3xl mb-4">Будьте в тренде</h3>
          <p className="mb-4">Подписывайтесь на наши каналы в соцсетях и email рассылку и узнавайте первыми о самых интересных новинках и предложениях.</p>
          <div className="flex gap-4 flex-wrap">
            <a href="#" className="hover:text-white text-sm sm:text-base">VK</a>
            <a href="#" className="hover:text-white text-sm sm:text-base">YouTube</a>
            <a href="#" className="hover:text-white text-sm sm:text-base">Pinterest</a>
            <a href="#" className="hover:text-white text-sm sm:text-base">Telegram</a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-sm text-center sm:text-left">
          <p>©1998-2025, Minimir.ru - официальный интернет-магазин производителя.</p>
          <p>Использование материалов сайта без согласования запрещено.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
