
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

// --- Заглушки: Замените на ваши реальные компоненты и типы ---

interface ProductI {
  _id: string;
  name: string;
  article: string;
  source?: string;
  price: number | string;
  imageAddresses?: string[] | string;
  imageAddress?: string[] | string;
  quantity?: number;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <p className="text-black font-bold text-2xl">LUMORALIGHT</p>
  </div>
);

// --- Минималистичный компонент уведомления (замена Sonner) ---

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

// --- Основной компонент корзины ---

const Cart: React.FC = () => {
  const [cartProducts, setCartProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCartProducts = async () => {
      setIsLoading(true);
      const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');

      if (cart.products && cart.products.length > 0) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/list`,
            { products: cart.products },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const productsWithQuantity = response.data.products.map((product: ProductI) => {
            const cartItem = cart.products.find((p: { _id: string }) => p._id === product._id);
            return { ...product, quantity: cartItem ? cartItem.quantity : 1 };
          });

          setCartProducts(productsWithQuantity);
        } catch (err) {
          setError('Не удалось загрузить товары. Попробуйте обновить страницу.');
          console.error(err);
        }
      } else {
        setError('LUMORALIGHT');
      }
      setIsLoading(false);
    };

    fetchCartProducts();
  }, []);

  const updateCartStorageAndState = (updatedProducts: ProductI[]) => {
    const productsToStore = updatedProducts.map(p => ({ _id: p._id, quantity: p.quantity }));
    localStorage.setItem('cart', JSON.stringify({ products: productsToStore }));
    localStorage.setItem('cartCount', productsToStore.length.toString());
    setCartProducts(updatedProducts);
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: productsToStore.length } }));
    
    if (updatedProducts.length === 0) {
      setError('LUMORALIGHT');
    }
  };

  const handleIncreaseQuantity = (id: string) => {
    const updated = cartProducts.map(p => p._id === id ? { ...p, quantity: (p.quantity ?? 1) + 1 } : p);
    updateCartStorageAndState(updated);
  };

  const handleDecreaseQuantity = (id: string) => {
    const product = cartProducts.find(p => p._id === id);
    if (product && product.quantity && product.quantity > 1) {
      const updated = cartProducts.map(p => p._id === id ? { ...p, quantity: p.quantity! - 1 } : p);
      updateCartStorageAndState(updated);
    } else {
      handleRemoveProduct(id);
    }
  };

  const handleRemoveProduct = (id: string) => {
    const updated = cartProducts.filter(p => p._id !== id);
    updateCartStorageAndState(updated);
    setToastMessage('Товар удален из корзины');
  };

  const totalAmount = cartProducts.reduce((sum, p) => sum + (Number(p.price) || 0) * (p.quantity ?? 1), 0);

  return (
    <motion.section
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer toastMessage={toastMessage} setToastMessage={setToastMessage} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">Корзина</h1>
          <p className="text-black mt-2">
            <Link href="/" className="hover:text-black transition-colors">Главная</Link>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">
          <div className="flex-1 w-full">
            {isLoading ? (
              <div className="flex justify-center items-center p-10 md:p-20 bg-white rounded-lg shadow-sm">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg p-8 md:p-10 text-center shadow-sm">
                <p className="text-lg md:text-xl font-bold text-black mb-6">{error}</p>
                <Link href="/catalog/lights/pendant-lights" className="inline-flex items-center px-6 py-3 md:px-8 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    className="bg-white rounded-lg p-4 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 border border-gray-100 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                      <img
                        src={`${product.imageAddresses?.[0] || product.imageAddress?.[0] || '/placeholder.jpg'}?q=75&w=200`}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md p-1"
                      />
                    </div>

                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <h3 className="text-md  font-semibold text-black ">{product.name}</h3>
                      <p className="text-sm text-gray-500">Артикул: {product.article}</p>
                    </div>

                    <div className="w-full sm:w-auto flex justify-between items-center mt-2 sm:mt-0 sm:ml-auto">
                        <div className="flex items-center bg-gray-100 rounded-md">
                          <button onClick={() => handleDecreaseQuantity(product._id)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-md transition-colors"><FaMinus size={12} /></button>
                          <div className="px-4 text-sm font-medium text-black">{product.quantity ?? 0}</div>
                          <button onClick={() => handleIncreaseQuantity(product._id)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-md transition-colors"><FaPlus size={12} /></button>
                        </div>

                        <div className="text-md font-bold text-black text-right ml-4">
                          {(Number(product.price) * (product.quantity ?? 1)).toLocaleString()} ₽
                        </div>
                    </div>
                    
                    <button onClick={() => handleRemoveProduct(product._id)} className="text-gray-400 hover:text-red-500 transition-colors sm:ml-4"><FaTrash /></button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* === Блок оформления заказа заменен на информацию для связи === */}
          {!error && cartProducts.length > 0 && (
            <aside className="w-full lg:w-1/3 lg:max-w-sm mt-8 lg:mt-0">
              <div className="sticky top-28 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-black mb-4">Итог</h2>
                 <div className="border-t my-4"></div>
                 <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-black">Сумма</span><span className="text-xl font-extrabold text-black">{totalAmount.toLocaleString()} ₽</span>
                  </div>
                </div>

                <div className="mt-6 p-4 text-center bg-gray-100 rounded-lg">
                  <p className="text-md font-medium text-black">Для оформления заказа, пожалуйста, свяжитесь с нами по телефону:</p>
                  <a 
                    href="tel:+79264513132" 
                    className="block text-xl font-bold text-black mt-2 hover:text-gray-700 transition-colors"
                  >
                    +7 (926) 451-31-32
                  </a>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default Cart;