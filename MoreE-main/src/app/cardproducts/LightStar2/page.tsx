'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios'; // Импортируем axios
import { CatalogOfLightStar,   ProductI } from './CatalogLightStar';
;

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
  name: 'LightStar',
  categories: [
    { label: 'Люстра', searchName: 'Люстра' },
    { label: 'Люстра подвесная', searchName: 'Люстра подвесная' },
    { label: 'Подвес', searchName: 'Подвес' },
    { label: 'Бра', searchName: 'Бра' },
    { label: 'Светильник', searchName: 'Светильник' },
    { label: 'Настольная лампа', searchName: 'Настольная лампа' },
    { label: 'Торшер', searchName: 'Торшер' },
    { label: 'Светильник уличный', searchName: 'Светильник уличный' },
  ],
  collection: ''
};

const minPrice = 0;
const maxPrice = 1000000;
const page = 1;

const LightStar2: React.FC = () => {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null); // Error state

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${selectedBrand.name}`, {
        params: {
          page,
          limit:3,
          name: 'Faraone',
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
      <CatalogOfLightStar products={products} />
    </motion.div>
  );
};

export default LightStar2;