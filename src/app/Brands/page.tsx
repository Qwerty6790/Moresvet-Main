'use client'
import React, { useState } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

type Brand = {
  name: string;
  count?: number;
};

const BrandsPage: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Временные данные для примера
  const brands: Record<string, Brand[]> = {
    'A': [
      { name: 'ABB', count: 190 },
      { name: 'Adilux' },
      { name: 'Akfa Lighting' },
    ],
    'B': [
      { name: 'Belfast' },
      { name: 'Bergenson Bjorn' },
    ],
    // ... другие бренды
  };

  const alphabet = {
    latin: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0-9'],
    cyrillic: ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я']
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mt-36 mx-auto px-4 py-8">
        <h1 className="text-2xl text-black font-bold mb-6">
          ПРОИЗВОДИТЕЛИ ЛЮСТР И СВЕТИЛЬНИКОВ
          <span className="text-gray-500 text-lg ml-2">190 брендов</span>
        </h1>

        {/* Поиск */}
        <div className="flex mb-8">
          <input
            type="text"
            placeholder="Поиск бренда"
            className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-black text-white px-8 py-3 rounded-r-lg hover:bg-green-600">
            Найти
          </button>
        </div>

        {/* Алфавитный указатель */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">
              Все
            </button>
            {alphabet.latin.map((letter) => (
              <button
                key={letter}
                className="px-3 py-1 rounded hover:bg-gray-200"
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {alphabet.cyrillic.map((letter) => (
              <button
                key={letter}
                className="px-3 py-1 rounded hover:bg-gray-200 text-gray-600"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Список брендов */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {Object.entries(brands).map(([letter, brandsList]) => (
            <div key={letter} className="space-y-4">
              <div className="text-6xl text-gray-300 font-light">{letter}</div>
              <div className="space-y-2">
                {brandsList.map((brand) => (
                  <div key={brand.name} className="group">
                    <a href="#" className="text-gray-700 hover:text-blue-500">
                      {brand.name}
                    </a>
                    {brand.count && (
                      <span className="text-gray-400 text-sm ml-2">
                        Показать еще {brand.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandsPage;