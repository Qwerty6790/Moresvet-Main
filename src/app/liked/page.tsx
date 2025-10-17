
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ProductI } from '../../types/interfaces';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

// --- Минималистичный компонент уведомления ---

interface ToastProps {
  message: string;
  onClose: () => void;
}

const CustomToast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const toastVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full shadow-lg"
    >
      {message}
    </motion.div>
  );
};

// Контейнер для управления анимацией
const ToastContainer: React.FC<{
  toastMessage: string | null;
  setToastMessage: (message: null) => void;
}> = ({ toastMessage, setToastMessage }) => (
  <AnimatePresence>
    {toastMessage && (
      <CustomToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    )}
  </AnimatePresence>
);


// --- Основной компонент страницы "Избранное" ---

const Liked: React.FC = () => {
  const [likedProducts, setLikedProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLikedProducts = async () => {
      setLoading(true);
      const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');

      if (liked.products && liked.products.length > 0) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/list`,
            { products: liked.products },
            { headers: { 'Content-Type': 'application/json' } }
          );
          setLikedProducts(
            response.data.products.map((product: any) => ({
              ...product,
              price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
            }))
          );
        } catch (err) {
          setError('Произошла ошибка при загрузке избранных товаров.');
          console.error(err);
        }
      } else {
        setError('Ваш список избранного пуст');
      }
      setLoading(false);
    };

    fetchLikedProducts();
  }, []);

  const handleRemoveProduct = (id: string) => {
    const updatedProducts = likedProducts.filter((product) => product._id !== id);
    setLikedProducts(updatedProducts);

    const updatedLiked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    updatedLiked.products = updatedLiked.products.filter((productId: string) => productId !== id);
    localStorage.setItem('liked', JSON.stringify(updatedLiked));

    localStorage.setItem('likedCount', updatedLiked.products.length.toString());
    window.dispatchEvent(new CustomEvent('liked-updated', { detail: { count: updatedLiked.products.length } }));
    
    setToastMessage('Товар удален из избранного');

    if (updatedProducts.length === 0) {
      setError('Ваш список избранного пуст');
    }
  };

  const handleClearLiked = () => {
    setLikedProducts([]);
    localStorage.setItem('liked', JSON.stringify({ products: [] }));
    localStorage.setItem('likedCount', '0');
    window.dispatchEvent(new CustomEvent('liked-updated', { detail: { count: 0 } }));
    setError('Ваш список избранного пуст');
    setToastMessage('Избранное очищено');
  };

  const totalAmount = likedProducts.reduce((sum, product) => {
    const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;
    return sum + price;
  }, 0);

  return (
    <motion.section
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer toastMessage={toastMessage} setToastMessage={setToastMessage} />

      {/* Изменено: max-w-7xl, py-8 md:py-12 для лучшей адаптивности */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
            {/* Изменено: text-3xl md:text-4xl для адаптивного заголовка */}
            <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">Избранное</h1>
            <p className="text-gray-500 mt-2">
                <Link href="/" className="hover:text-black transition-colors">Главная</Link>
                <span className="mx-2">/</span>
                <span>Избранное</span>
            </p>
        </div>

        {/* Изменено: flex-col lg:flex-row вместо grid для лучшей адаптивности */}
        <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">
          {/* Основной контент (список товаров) */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="flex justify-center items-center p-10 md:p-20 bg-white rounded-lg shadow-sm">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg p-8 md:p-10 text-center shadow-sm">
                <p className="text-lg md:text-xl text-gray-700 mb-6">{error}</p>
                <Link href="/catalog" className="inline-flex items-center px-6 py-3 md:px-8 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {likedProducts.map((product) => {
                   const images = (() => {
                    if (typeof product.imageAddresses === 'string') return [product.imageAddresses];
                    if (Array.isArray(product.imageAddresses)) return product.imageAddresses;
                    if (typeof product.imageAddress === 'string') return [product.imageAddress];
                    if (Array.isArray(product.imageAddress)) return product.imageAddress;
                    return [];
                  })();
                  const imageUrl = images.length > 0 ? images[0] : '/placeholder.jpg';

                  return (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      // Изменено: flex-col sm:flex-row для адаптивной карточки
                      className="bg-white rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-gray-100 shadow-sm"
                    >
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                        <img src={`${imageUrl}?q=75&w=200`} alt={product.name} className="w-full h-full object-contain p-1 rounded-md" />
                      </div>

                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <h3 className="text-md font-semibold text-black truncate">{product.name}</h3>
                        <p className="text-sm text-gray-500">Артикул: {product.article}</p>
                         {/* Цена для мобильных устройств, скрыта на sm+ */}
                         <p className="text-md font-bold text-black mt-2 sm:hidden">
                          {typeof product.price === 'number' ? `${product.price.toLocaleString()} ₽` : `${product.price} ₽`}
                        </p>
                      </div>
                      
                      {/* Блок цены и кнопки, выровненный вправо на sm+ */}
                      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end sm:ml-auto mt-2 sm:mt-0 space-x-4">
                        <div className="text-md font-bold text-black w-28 text-right hidden sm:block">
                          {typeof product.price === 'number' ? `${product.price.toLocaleString()} ₽` : `${product.price} ₽`}
                        </div>

                        <button onClick={() => handleRemoveProduct(product._id)} className="text-sm text-red-500 hover:text-red-700 transition-colors font-medium px-3 py-1 rounded-md hover:bg-red-50">
                          Удалить
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Боковая панель (итоги) */}
          {!error && likedProducts.length > 0 && (
            // Изменено: ширина и отступы для адаптивности
            <aside className="w-full lg:w-1/3 lg:max-w-sm mt-8 lg:mt-0">
              <div className="sticky top-28 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-black">Ваш список</h2>
                  <button onClick={handleClearLiked} className="text-sm text-gray-500 hover:text-red-500 transition-colors">Очистить</button>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between"><span>Количество товаров</span><span className="font-medium text-black">{likedProducts.length}</span></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-black">Итого</span><span className="text-xl font-extrabold text-black">{totalAmount.toLocaleString()} ₽</span>
                  </div>
                </div>

                <Link href="/cart" className="w-full text-center block py-3 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
                  Перейти в корзину
                </Link>
                <div className="mt-3 text-center text-xs text-gray-500">Оформите заказ в корзине</div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default Liked;
