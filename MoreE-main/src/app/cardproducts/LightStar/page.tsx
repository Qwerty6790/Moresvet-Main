'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios'; // Импортируем axios
import { CatalogOfLightStar, ProductI } from './CatalogLightStar';
import Skeleton from 'react-loading-skeleton'; // Importing the skeleton loader component
import 'react-loading-skeleton/dist/skeleton.css'; // Importing the styles

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

const LightStar: React.FC = () => {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null); // Error state
  const [isPageLoading, setIsPageLoading] = useState(true); // Page loading state

  const fetchProducts = async () => {
    setIsPageLoading(true); // Set loading to true before making the request
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${selectedBrand.name}`, {
        params: {
          page,
          limit: 4,
          name: 'LightStar',
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
    } finally {
      setIsPageLoading(false); // Set loading to false after the request is complete
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

      {/* If page is loading, show skeleton loaders */}
      {isPageLoading ? (
        <div className="grid grid-cols-3 gap-4">
        </div>
      ) : (
        <CatalogOfLightStar products={products} viewMode={'table'} />
      )}
    </motion.div>
  );
};

export default LightStar;
