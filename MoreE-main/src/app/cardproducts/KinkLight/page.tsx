'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios'; // Импортируем axios
import { CatalogOfKinkLight,  ProductI } from './CatalogOfKinkLight';
import LightStar from '../LightStar/page';

interface Category {
  label: string;
  searchName: string;
}

interface Brand {
  name: string;
  categories: Category[];
  collection: string;
}

const selectedBrand: Brand = {
    name: 'KinkLight',
    categories: [
        { label: 'Люстра', searchName: 'Люстра' },
        { label: 'Настольная лампа', searchName: 'Настольная лампа' },
        { label: 'Кресло', searchName: 'Кресло' },
        { label: 'Торшер', searchName: 'Торшер' },
        { label: 'Настенный Светильник', searchName: 'Настенный Светильник' },
        { label: 'Светильник уличный', searchName: 'Светильник уличный' },
        { label: 'Подвес', searchName: 'Подвес' },
        { label: 'Бра', searchName: 'Бра' },
        { label: 'Светильник', searchName: 'Светильник' },
        { label: 'Трековый светильник', searchName: 'трековый светильник' },
        { label: 'Настенный светильник', searchName: 'настенный светильник' },
        { label: 'Шнур с перекл', searchName: 'Шнур с перекл' },
    ],
    collection: ''
}

const minPrice = 0;
const maxPrice = 1000000;
const page = 1;

const KinkLight: React.FC = () => {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null); // Error state

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${selectedBrand.name}`, {
        params: {
          page,
          limit: 50,
          name: '071',
          minPrice,
          maxPrice,
        },
      });

      setProducts(res.data.products);
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response
        ? error.response.data.message
        : 'Ошибка при загрузке товаров';
      setError(message);
      console.error('Ошибка при загрузке товаров:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {error && <div className="text-red-500">{error}</div>} {/* Display error if it exists */}
      <CatalogOfKinkLight products={products} />
    </motion.div>
  );
};

export default KinkLight;