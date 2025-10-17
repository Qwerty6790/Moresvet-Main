
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
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
    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
    <p className="text-gray-500">Загрузка товаров...</p>
  </div>
);

// --- Минималистичный компонент уведомления (замена Sonner) ---

interface ToastProps {
  message: string;
  onClose: () => void;
}

const CustomToast: React.FC<ToastProps> = ({ message, onClose }) => {
  // Автоматическое закрытие уведомления через 3 секунды
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

// --- Основной компонент корзины ---

const Cart: React.FC = () => {
  const router = useRouter();
  const [cartProducts, setCartProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null); // Состояние для уведомлений

  // Состояние для формы оформления заказа
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');

  // Загрузка товаров из корзины при монтировании
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
        setError('Ваша корзина пуста. Добавьте товары из каталога.');
      }
      setIsLoading(false);
    };

    fetchCartProducts();
  }, []);

  // Хелпер для обновления localStorage и состояния
  const updateCartStorageAndState = (updatedProducts: ProductI[]) => {
    const productsToStore = updatedProducts.map(p => ({ _id: p._id, quantity: p.quantity }));
    localStorage.setItem('cart', JSON.stringify({ products: productsToStore }));
    localStorage.setItem('cartCount', productsToStore.length.toString());
    setCartProducts(updatedProducts);
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: productsToStore.length } }));
    
    if (updatedProducts.length === 0) {
      setError('Ваша корзина пуста. Добавьте товары из каталога.');
    }
  };

  // Обработчики изменения количества
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

  // Оформление заказа
  const confirmOrder = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      return setToastMessage('Пожалуйста, укажите ваше имя и телефон.');
    }
    if (deliveryMethod === 'delivery' && !address.trim()) {
      return setToastMessage('Пожалуйста, укажите адрес для доставки.');
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const orderPayload = {
      products: cartProducts.map(p => ({ name: p.name, article: p.article, price: p.price, quantity: p.quantity })),
      contactName,
      contactPhone,
      address: deliveryMethod === 'delivery' ? address : 'Самовывоз',
      paymentMethod,
      deliveryMethod,
      comment: comment || undefined,
      isGuest: !token,
    };

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/add-order`,
        orderPayload,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );

      if (paymentMethod === 'online' && data?.confirmation?.confirmation_url) {
        window.location.href = data.confirmation.confirmation_url;
      } else {
        setToastMessage('Ваш заказ успешно создан!');
        updateCartStorageAndState([]); // Очищаем корзину
        router.push(token ? '/orders' : '/');
      }
    } catch (err) {
      setToastMessage('Ошибка при создании заказа. Попробуйте еще раз.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cartProducts.reduce((sum, p) => sum + (Number(p.price) || 0) * (p.quantity ?? 1), 0);
  const inputStyles = "w-full bg-transparent border-b-2 border-gray-300 text-black px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-400";
  const buttonStyles = (isActive: boolean) =>
    `flex-1 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 ${
      isActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;
  
  return (
    <motion.section
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer toastMessage={toastMessage} setToastMessage={setToastMessage} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-black tracking-tight">Корзина</h1>
          <p className="text-gray-500 mt-2">
            <Link href="/" className="hover:text-black transition-colors">Главная</Link>
            <span className="mx-2">/</span>
            <span>Корзина</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-12 lg:gap-12 lg:items-start">
          <div className={`${!error ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
            {isLoading ? (
              <div className="flex justify-center items-center p-20 bg-white rounded-lg shadow-sm">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg p-10 text-center shadow-sm">
                <p className="text-xl text-gray-700 mb-6">{error}</p>
                <Link href="/catalog" className="inline-flex items-center px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    className="bg-white rounded-lg p-4 flex items-center gap-4 border border-gray-100 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                      <img
                        src={`${product.imageAddresses?.[0] || product.imageAddress?.[0] || '/placeholder.jpg'}?q=75&w=200`}
                        alt={product.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-md font-semibold text-black truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500">Артикул: {product.article}</p>
                      <p className="text-lg font-bold text-black mt-1 lg:hidden">
                        {(Number(product.price) * (product.quantity ?? 1)).toLocaleString()} ₽
                      </p>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-md">
                      <button onClick={() => handleDecreaseQuantity(product._id)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-md transition-colors"><FaMinus size={12} /></button>
                      <div className="px-4 text-sm font-medium text-black">{product.quantity ?? 0}</div>
                      <button onClick={() => handleIncreaseQuantity(product._id)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-md transition-colors"><FaPlus size={12} /></button>
                    </div>
                    <div className="text-md font-bold text-black w-28 text-right hidden lg:block">
                      {(Number(product.price) * (product.quantity ?? 1)).toLocaleString()} ₽
                    </div>
                    <button onClick={() => handleRemoveProduct(product._id)} className="text-gray-400 hover:text-red-500 transition-colors"><FaTrash /></button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {!error && cartProducts.length > 0 && (
            <aside className="lg:col-span-5 mt-8 lg:mt-0">
              <div className="sticky top-28 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-black mb-6">Оформление заказа</h2>
                <div className="grid grid-cols-1 gap-5">
                  <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Ваше имя*" className={inputStyles} />
                  <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Номер телефона*" className={inputStyles} />
                  
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button onClick={() => setDeliveryMethod('delivery')} className={buttonStyles(deliveryMethod === 'delivery')}>Доставка</button>
                    <button onClick={() => setDeliveryMethod('pickup')} className={buttonStyles(deliveryMethod === 'pickup')}>Самовывоз</button>
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Адрес доставки*" className={inputStyles} />
                    </motion.div>
                  )}
                  {deliveryMethod === 'pickup' && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <div className="p-3 text-sm text-gray-800 bg-gray-100 rounded-md">Адрес: 121601, Москва, МКАД, 25-й километр, ТК КОНСТРУКТОР</div>
                     </motion.div>
                  )}

                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button onClick={() => setPaymentMethod('online')} className={buttonStyles(paymentMethod === 'online')}>Онлайн</button>
                    <button onClick={() => setPaymentMethod('cod')} className={buttonStyles(paymentMethod === 'cod')}>Без предоплаты</button>
                  </div>
                  
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Комментарий к заказу" className={`${inputStyles} min-h-[90px] bg-transparent`} />
                </div>

                <div className="border-t my-6"></div>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between"><span>Товары ({cartProducts.length})</span><span className="font-medium text-black">{totalAmount.toLocaleString()} ₽</span></div>
                  <div className="flex justify-between"><span>Доставка</span><span className="font-medium text-green-600">Бесплатно</span></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-black">Итого</span><span className="text-xl font-extrabold text-black">{totalAmount.toLocaleString()} ₽</span>
                  </div>
                </div>

                <button onClick={confirmOrder} disabled={isSubmitting || cartProducts.length === 0} className="w-full py-3 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100">
                  {isSubmitting ? 'Обработка...' : (paymentMethod === 'online' ? 'Перейти к оплате' : 'Оформить заказ')}
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default Cart;