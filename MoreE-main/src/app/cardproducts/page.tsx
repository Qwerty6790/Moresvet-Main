'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import CatalogOfProductsStluce from './CatalogofMayoni';
import { ProductI } from '../../types/interfaces';
import { toast } from 'sonner';

const Maytoni: React.FC = () => {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Функция для добавления товара в корзину
  const handleAddToCart = (product: ProductI) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
      const existingProductIndex = cart.products.findIndex(
        (item: any) => item.article === product.article
      );

      if (existingProductIndex > -1) {
        cart.products[existingProductIndex].quantity += 1;
      } else {
        cart.products.push({ ...product, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      toast.success('Товар добавлен в корзину');
    } catch (err) {
      console.error('Ошибка добавления в корзину:', err);
      toast.error('Не удалось добавить товар в корзину');
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search`, {
        params: {
          page: 1,
          limit: 4,
          name: 'Выключатель ',
        },
      });
      console.log(res.data.products);
      setProducts(res.data.products || []);
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Ошибка при загрузке товаров';
      setError(message);
      console.error('Ошибка при загрузке товаров:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto py-8">
      {isLoading ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-700"
        >
          Загрузка товаров...
        </motion.p>
      ) : error ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-500"
        >
          {error}
        </motion.p>
      ) : (
        // Передаем товары в компонент-каталог, а также функцию добавления в корзину
        <CatalogOfProductsStluce products={products} viewMode="grid" />
      )}
    </div>
  );
};

export default Maytoni;
