'use client';
import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const values = [
    {
      title: "Качество",
      description:
        "Я использую только проверенные инструменты и технологии, чтобы предоставлять высококачественные решения.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-12 h-12 text-blue-500"
        >
          <path d="M12 2a7 7 0 0 0-7 7c0 3.53 2.61 6.43 6 6.92V21h2v-5.08c3.39-.49 6-3.39 6-6.92a7 7 0 0 0-7-7Zm0 2a5 5 0 0 1 5 5c0 2.5-1.84 4.54-4.25 4.92L12 13l-.75-.08A5 5 0 0 1 7 9a5 5 0 0 1 5-5Z" />
        </svg>
      ),
    },
    {
      title: "Индивидуальность",
      description:
        "Я адаптирую свои решения под уникальные потребности каждого клиента, чтобы подчеркнуть их стиль.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-12 h-12 text-green-500"
        >
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1 5h2v5h-2Zm0 6h2v2h-2Z" />
        </svg>
      ),
    },
    {
      title: "Экологичность",
      description:
        "Я использую энергоэффективные технологии и поддерживаю современные экологические стандарты.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-12 h-12 text-teal-500"
        >
          <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0 0 12 2Zm-.75 14.5V15H9.25a1.25 1.25 0 0 1 0-2.5H11V10h2v2.5h1.75a1.25 1.25 0 0 1 0 2.5H13v1.5Z" />
        </svg>
      ),
    },
    {
      title: "Доверие",
      description:
        "Я работаю с клиентами на основе взаимного доверия и надежности, что делает меня лидером в своей области.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-12 h-12 text-yellow-500"
        >
          <path d="M12 2a10 10 0 0 0-9.33 6.39L2 10h3l2-5h10l2 5h3l-.67-1.61A10 10 0 0 0 12 2Zm0 18a10 10 0 0 0 8.66-5H12a2 2 0 0 0-2 2v3H3.34A10 10 0 0 0 12 20Z" />
        </svg>
      ),
    },
  ];

  const statistics = [
    { label: "Довольных клиентов", value: "100+" },
    { label: "Реализованных проектов", value: "50+" },
    { label: "Лет опыта", value: "5" },
    { label: "Партнеров", value: "10+" },
  ];

  return (
    <section className="bg-gray-50 text-gray-800 py-20 md:py-40">
      {/* Основной заголовок */}
      <div className="container max-w-5xl px-4 mx-auto text-center">
        <motion.h1
          className="text-4xl font-extrabold text-gray-800 mb-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Обо мне
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Я - профессиональный разработчик, который создает современные и эффективные решения для своих клиентов.
        </motion.p>
      </div>

      {/* Преимущества */}
      <div className="container max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
        {values.map((value, idx) => (
          <motion.div
            key={idx}
            className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
          >
            <div className="mb-4">{value.icon}</div>
            <h3 className="text-xl font-bold text-gray-800">{value.title}</h3>
            <p className="text-gray-600 mt-2">{value.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Статистика */}
      <div className="container max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
        {statistics.map((stat, idx) => (
          <motion.div
            key={idx}
            className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
          >
            <span className="text-3xl font-extrabold text-blue-500">{stat.value}</span>
            <p className="text-gray-700 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Завершающий блок */}
      <div className="container max-w-7xl mx-auto text-center mt-16">
        <motion.h2
          className="text-3xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Готовы начать?
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Свяжитесь со мной, и я помогу вам создать решение, которое превзойдет ваши ожидания.
        </motion.p>
        <motion.button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mt-8 transition-colors duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          Связаться со мной
        </motion.button>
      </div>
    </section>
  );
};

export default About;