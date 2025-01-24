'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Zap,
  Award,
  ArrowRight,
  X,
  Target,
  Compass,
} from 'lucide-react';

// Тип проекта
type Project = {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  fullDescription: string;
  category: string;
  icon: any;
  color: string;
  image: string;
  detailImages: string[];
  tags: string[];
  year: number;
  client: string;
  challenges: string[];
  solutions: string[];
};

const projects: Project[] = [
  {
    id: 1,
    title: 'Умный Офис',
    shortTitle: 'Smart Office',
    description: 'Комплексное решение для автоматизации современного офисного пространства',
    fullDescription: `
      Революционный проект, который переосмысливает концепцию корпоративного пространства.
      Интеллектуальная экосистема, объединяющая передовые технологии управления,
      безопасностью и комфортом сотрудников.
    `,
    category: 'Корпоративные решения',
    icon: Layers,
    color: 'from-yellow-500 to-yellow-600',
    image: '/images/project1.jpg',
    detailImages: [
      '/images/project1-detail1.jpg',
      '/images/project1-detail2.jpg',
      '/images/project1-detail3.jpg',
    ],
    tags: ['Автоматизация', 'IoT', 'Энергоэффективность'],
    year: 2025,
    client: 'Технологический Центр',
    challenges: [
      'Интеграция разнородных систем',
      'Обеспечение кибербезопасности',
      'Оптимизация энергопотребления',
    ],
    solutions: [
      'Централизованное управление',
      'Адаптивные сценарии освещения',
      'Интеллектуальный контроль микроклимата',
    ],
  },
  {
    id: 2,
    title: 'Экодом',
    shortTitle: 'Eco Home',
    description: 'Интеллектуальная система управления энергопотреблением для частного дома',
    fullDescription: `
      Передовое решение в области домашнего энергоменеджмента.
      Система, которая анализирует и оптимизирует энергопотребление
      в реальном времени, создавая максимально эффективное и экологичное жилое пространство.
    `,
    category: 'Жилые пространства',
    icon: Zap,
    color: 'from-black to-yellow-600',
    image: '/images/project2.jpg',
    detailImages: [
      '/images/project2-detail1.jpg',
      '/images/project2-detail2.jpg',
      '/images/project2-detail3.jpg',
    ],
    tags: ['Зеленые технологии', 'Умный дом', 'Энергосбережение'],
    year: 2025,
    client: 'Частный Застройщик',
    challenges: [
      'Снижение углеродного следа',
      'Интеграция возобновляемых источников',
      'Персонализация потребления',
    ],
    solutions: ['Солнечные панели', 'Машинное обучение', 'Интерактивный мониторинг'],
  },
];

export default function AdvancedProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-black mt-32 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 bg-gradient-to-br  opacity-75"
        style={{
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      />

      {/* Page Content */}
      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-black mb-6 text-gradient bg-clip-text bg-gradient-to-r from-black to-gray-700">
            Наши Проекты
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Мы трансформируем технологические вызовы в инновационные решения, которые меняют
            представление о современных пространствах.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {projects.map((project) => {
            const ProjectIcon = project.icon;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                onClick={() => setSelectedProject(project)}
                className={`relative overflow-hidden rounded-3xl cursor-pointer transform transition-all duration-300 bg-gradient-to-br ${project.color} ${
                  hoveredProject === project.id ? 'shadow-2xl' : 'shadow-xl'
                }`}
              >
                <div
                  className="absolute inset-0 opacity-20 bg-cover bg-center"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
                <div className="relative p-8 h-96 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <ProjectIcon className="w-16 h-16 text-white/80" strokeWidth={1.5} />
                    <span className="text-2xl font-bold text-white/80">{project.year}</span>
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white mb-4">{project.title}</h3>
                    <p className="text-white/80 text-lg">{project.description}</p>
                    <div className="mt-4 flex space-x-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-white/20 text-white rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 text-black flex items-center justify-center p-8 overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl max-w-6xl w-full relative p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-10 bg-gray-200 hover:bg-gray-300 p-2 rounded-full text-black"
              >
                <X size={24} />
              </button>

              {/* Modal content */}
              <div className="grid md:grid-cols-2 gap-10">
                {/* Left Side */}
                <div>
                  <h2 className="text-5xl font-black mb-6 text-gradient bg-clip-text bg-gradient-to-r from-black to-gray-700">
                    {selectedProject.title}
                  </h2>
                  <p className="text-gray-700 text-lg mb-8">
                    {selectedProject.fullDescription}
                  </p>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <div className="flex items-center mb-3">
                        <Target className="mr-3 text-blue-400" size={24} />
                        <h4 className="text-lg font-bold text-black">Клиент</h4>
                      </div>
                      <p className="text-gray-700">{selectedProject.client}</p>
                    </div>
                    <div>
                      <div className="flex items-center mb-3">
                        <Compass className="mr-3 text-green-400" size={24} />
                        <h4 className="text-lg font-bold text-black">Год</h4>
                      </div>
                      <p className="text-gray-700">{selectedProject.year}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
