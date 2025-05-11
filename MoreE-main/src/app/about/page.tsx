'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Star,
  Award,
  Shield, 
  Clock,
  MessageSquare,
  Lightbulb,
  Gem,
  Zap,
  Phone,
  MapPin,
  Mail,
  Building
} from 'lucide-react';

const About = () => {
  const [activeSection, setActiveSection] = useState('expertise');

  const expertise = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Дизайнерские люстры",
      description: "Эксклюзивные коллекции от ведущих европейских дизайнеров"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Умное освещение",
      description: "Современные системы управления светом для вашего комфорта"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Гарантия качества",
      description: "5 лет гарантии на всю продукцию и профессиональный монтаж"
    }
  ];

  const advantages = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "15+ лет опыта",
      description: "Создаем уникальные световые решения с 2008 года"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "1000+ проектов",
      description: "Успешно реализованных дизайнерских проектов"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Консультации",
      description: "Бесплатные консультации дизайнера по свету"
    }
  ];

  const services = [
    {
      title: "Подбор освещения",
      description: "Профессиональный подбор светильников под ваш интерьер",
      items: ["Расчет освещенности", "3D-визуализация", "Подбор цветовой температуры"]
    },
    {
      title: "Монтаж и установка",
      description: "Квалифицированная установка любой сложности",
      items: ["Профессиональный монтаж", "Настройка систем управления", "Гарантийное обслуживание"]
    },
    {
      title: "Проектирование",
      description: "Создание проекта освещения для вашего помещения",
      items: ["Светотехнический расчет", "Схема размещения", "Спецификация оборудования"]
    }
  ];

  const photos = [
    "/images/gallery1.jpg",
    "/images/gallery2.jpg",
    "/images/gallery3.jpg",
    "/images/gallery4.jpg",
    "/images/gallery5.jpg",
    "/images/gallery6.jpg",
  ];

  const theses = [
    {
      icon: <Building className="w-10 h-10 text-yellow-400" />,
      title: "ЛИДЕР РЫНКА",
      description: "MoreElectriki — ведущий поставщик электрооборудования и светотехники в России"
    },
    {
      icon: <Shield className="w-10 h-10 text-yellow-400" />,
      title: "КАЧЕСТВО",
      description: "Только сертифицированная продукция от проверенных производителей"
    },
    {
      icon: <Award className="w-10 h-10 text-yellow-400" />,
      title: "ОПЫТ",
      description: "Более 15 лет успешной работы на рынке электрооборудования"
    }
  ];

  return (
    <div className="min-h-screen mt-20">
      {/* Photo Gallery Section */}
      <div className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 h-[50vh]">
            {photos.map((photo, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
              >
                <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="w-full h-full bg-cover bg-center" 
                    style={{ backgroundImage: `url(${photo})` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Theses Section */}
      <div className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-black mb-8 text-gray-900 tracking-tight">
              MOREELECTRIKI
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {theses.map((thesis, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="flex justify-center mb-4">
                  {thesis.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{thesis.title}</h3>
                <p className="text-gray-600">{thesis.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-50 bg-cover bg-center" />
        <div className="relative container mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <Gem className="w-16 h-16 mx-auto mb-8 text-yellow-400" />
            <h1 className="text-5xl font-black mb-6">
              Искусство света
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed mb-8">
              Мы создаем неповторимую атмосферу в вашем доме с помощью эксклюзивных светильников и профессиональных решений по освещению
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-medium hover:bg-yellow-300 transition-colors"
            >
              Получить консультацию
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-white">Готовы создать идеальное освещение?</h2>
              <p className="text-lg mb-8 text-gray-300">
                Запишитесь на бесплатную консультацию с нашим дизайнером по свету
              </p>
              <button className="bg-white text-black px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Записаться на консультацию
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Collaboration Request Section */}
      <div className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Заявка на сотрудничество</h2>
              <p className="text-lg text-gray-600 mb-8">
                Станьте нашим партнером и получите доступ к лучшим предложениям на рынке электрооборудования
              </p>
            </motion.div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название компании</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="ООО 'Компания'"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Контактное лицо</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Иван Иванов"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Электронная почта</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="info@company.ru"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Комментарий</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-32"
                  placeholder="Расскажите о ваших потребностях или предложениях"
                ></textarea>
              </div>
              
              <div className="text-center">
                <button 
                  type="submit"
                  className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-medium hover:bg-yellow-300 transition-colors inline-flex items-center"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Отправить заявку
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Store Map Section */}
      <div className="w-full bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Наш магазин</h2>
            <p className="text-lg text-gray-600 mb-8">
              Посетите наш шоурум, чтобы увидеть всё разнообразие предлагаемой продукции
            </p>
          </motion.div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[400px] w-full">
              {/* Здесь будет карта - можно заменить на реальный компонент карты */}
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-yellow-400" />
                <span className="ml-4 text-lg font-medium">Карта загружается...</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-yellow-400 mr-2" />
                <p className="text-gray-800">г. Москва, ул. Электрическая, д. 42</p>
              </div>
              <div className="flex items-center mb-4">
                <Phone className="w-5 h-5 text-yellow-400 mr-2" />
                <p className="text-gray-800">+7 (495) 123-45-67</p>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-400 mr-2" />
                <p className="text-gray-800">Пн-Пт: 9:00-20:00, Сб-Вс: 10:00-18:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;