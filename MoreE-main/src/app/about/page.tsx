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
  Phone
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

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-b from-gray-50 to-white">
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
      <div className=" bg-black">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold mb-6">Готовы создать идеальное освещение?</h2>
              <p className="text-lg mb-8">
                Запишитесь на бесплатную консультацию с нашим дизайнером по свету
              </p>
              <button className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-900 transition-colors inline-flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Записаться на консультацию
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;