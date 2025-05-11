'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { ProductI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { FaMinus, FaPlus, FaTrash, FaShareAlt } from 'react-icons/fa';

const Cart: React.FC = () => {
  const router = useRouter();
  const [cartProducts, setCartProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isOnlinePaymentModalOpen, setIsOnlinePaymentModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Загрузка товаров корзины и проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const fetchCartProducts = async () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
      const storedCartCount = localStorage.getItem('cartCount');

      if (storedCartCount) {
        setCartCount(Number(storedCartCount));
      }

      if (cart.products.length > 0) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/list`,
            { products: cart.products },
            { headers: { 'Content-Type': 'application/json' } }
          );
          setCartProducts(response.data.products);
        } catch (error) {
          setError('Произошла ошибка при загрузке продуктов из корзины.');
          console.error(error);
        }
      } else {
        setError(
          'Ваша корзина пуста. Вы еще не добавили товары. Перейдите в каталог, чтобы выбрать интересующие вас товары.'
        );
      }
      setIsLoading(false);
    };

    fetchCartProducts();
  }, []);

  // Функция для обновления корзины в localStorage и состояния
  const handleUpdateCart = (updatedProducts: ProductI[]) => {
    localStorage.setItem('cart', JSON.stringify({ products: updatedProducts }));
    setCartCount(updatedProducts.length);
    localStorage.setItem('cartCount', updatedProducts.length.toString());
    setCartProducts(updatedProducts);
  };

  // Удаление продукта (уменьшение количества или полное удаление)
  const handleRemoveProduct = (id: string) => {
    const updatedProducts = cartProducts
      .map((product) => {
        if (product._id === id) {
          const updatedQuantity = product.quantity && product.quantity > 1 ? product.quantity - 1 : 0;
          return updatedQuantity > 0 ? { ...product, quantity: updatedQuantity } : null;
        }
        return product;
      })
      .filter((product) => product !== null) as ProductI[];

    handleUpdateCart(updatedProducts);
    toast.success('Товар удален из корзины');
  };

  const handleIncreaseQuantity = (id: string) => {
    const updatedProducts = cartProducts.map((product) => {
      if (product._id === id) {
        return { ...product, quantity: (product.quantity || 0) + 1 };
      }
      return product;
    });
    handleUpdateCart(updatedProducts);
  };

  const handleDecreaseQuantity = (id: string) => {
    const updatedProducts = cartProducts.map((product) => {
      if (product._id === id && product.quantity && product.quantity > 1) {
        return { ...product, quantity: product.quantity - 1 };
      }
      return product;
    });
    handleUpdateCart(updatedProducts);
  };

  const handleClearCart = () => {
    handleUpdateCart([]);
    setError('Корзина пуста.');
    toast.success('Корзина очищена');
  };

  const handleShareCart = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Моя корзина товаров',
          text: 'Посмотрите, какие товары у меня в корзине!',
          url: window.location.href,
        })
        .then(() => console.log('Share successful'))
        .catch((error) => console.error('Ошибка при шаринге', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована');
    }
  };

  // Логика оформления заказа
  const confirmOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Необходимо войти в систему для оформления заказа');
      return;
    }

    const products = cartProducts.map((product) => ({
      name: product.name,
      article: product.article,
      source: product.source,
      quantity: product.quantity || 0,
      price: product.price || 0,
    }));

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/add-order`,
        { products },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      toast.success('Заказ успешно создан!');
      handleClearCart();
      setIsOnlinePaymentModalOpen(false);
      router.push('/orders');
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          toast.error('Пожалуйста, войдите в аккаунт заново.');
          localStorage.removeItem('token');
        } else {
          toast.error('Ошибка при создании заказа. Повторите попытку.');
        }
      } else {
        toast.error('Произошла неизвестная ошибка.');
      }
    }
  };

  const totalAmount = cartProducts.reduce((sum, product) => {
    const quantity = product.quantity || 0;
    const price = product.price || 0;
    return sum + price * quantity;
  }, 0);

  const deliveryCost = 0;
  const totalToPay = totalAmount + deliveryCost;

  return (
    <motion.section
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Toaster position="top-center" richColors />

      {/* Hero секция */}
      <div className="relative mt-32 h-[300px] bg-black overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="space-y-4">
            <h1 className="text-7xl font-bold text-white tracking-tight">Корзина</h1>
            <div className="flex items-center text-black/60 text-sm">
              <Link href="/" className="hover:text-black transition-colors">
                Главная
              </Link>
              <span className="mx-2">/</span>
              <span className="text-black">Корзина</span>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Секция товаров корзины */}
          <div className={`${!error ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center">
                <ClipLoader color="#000000" size={40} />
                <p className="mt-4 text-black">Загружаем вашу корзину...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl shadow-xl p-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-12 h-12 text-black/40"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 6v2h3v12H5V8h3V6H3v16h18V6h-5z" />
                      <path d="M11 11V3H9v8H6l4 4 4-4h-3z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-medium text-black mb-6">{error}</p>
                  <Link
                    href="/catalog"
                    className="inline-flex items-center px-6 py-3 border-2 border-black text-black rounded-xl hover:bg-black hover:text-white transition-colors text-lg font-medium"
                  >
                    Перейти в каталог
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                {/* Хедер с информацией и кнопкой поделиться */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                  <h1 className="text-2xl font-medium text-black">
                    В корзине {cartProducts.length} {cartProducts.length === 1 ? 'товар' : cartProducts.length > 1 && cartProducts.length < 5 ? 'товара' : 'товаров'}
                  </h1>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleClearCart}
                      className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                      Очистить корзину
                    </button>
                    <button
                      onClick={handleShareCart}
                      className="flex items-center gap-2 text-black hover:underline transition-colors"
                    >
                      <FaShareAlt />
                      Поделиться корзиной
                    </button>
                  </div>
                </div>

                {/* Список товаров */}
                <div className="divide-y divide-gray-200">
                  {cartProducts.map((product) => {
                    // Определяем URL изображения
                    const images = (() => {
                      if (typeof product.imageAddresses === 'string') {
                        return [product.imageAddresses];
                      } else if (Array.isArray(product.imageAddresses)) {
                        return product.imageAddresses;
                      } else if (typeof product.imageAddress === 'string') {
                        return [product.imageAddress];
                      } else if (Array.isArray(product.imageAddress)) {
                        return product.imageAddress;
                      }
                      return [];
                    })();
                    
                    const imageUrl = images.length > 0 ? images[0] : '/placeholder.jpg';

                    return (
                      <motion.div 
                        key={product._id} 
                        className="p-6 hover:bg-gray-50 rounded-xl transition-colors my-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex gap-6">
                          <div className="w-28 h-28 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                            <img
                              src={`${imageUrl}?q=75&w=400`}
                              alt={product.name}
                              className="w-full h-full object-contain p-2"
                            />
                          </div>

                          <div className="flex-grow">
                            <h3 className="text-lg font-medium text-black mb-1">{product.name}</h3>
                            <p className="text-sm text-black/60 mb-3">Артикул: {product.article}</p>
                            
                            <div className="flex flex-wrap items-center gap-6 mt-2">
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => handleDecreaseQuantity(product._id)}
                                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black"
                                >
                                  <FaMinus size={12} />
                                </button>
                                <span className="px-4 py-1 text-black font-medium">{product.quantity}</span>
                                <button
                                  onClick={() => handleIncreaseQuantity(product._id)}
                                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black"
                                >
                                  <FaPlus size={12} />
                                </button>
                              </div>
                              
                              <div className="text-xl font-bold text-black">
                                {typeof product.price === 'number' && !isNaN(product.price)
                                  ? `${product.price.toLocaleString()} ₽`
                                  : `${product.price} ₽`}
                              </div>
                              
                              <button 
                                onClick={() => handleRemoveProduct(product._id)} 
                                className="ml-auto text-red-500 hover:text-red-700 flex items-center gap-2"
                              >
                                <FaTrash size={16} />
                                <span className="hidden sm:inline">Удалить</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                            <label className="text-sm text-gray-600">
                              Рассчитать стоимость сборки и установки
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Сводка заказа */}
          {!error && (
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-2xl shadow-xl sticky top-24">
                <h2 className="text-2xl font-bold text-black mb-6 pb-3 border-b border-gray-200">Ваш заказ</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-black/70">Товары ({cartProducts.length})</span>
                    <span className="text-black font-medium">{totalAmount.toLocaleString()} ₽</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-black/70">Доставка</span>
                    <span className="text-green-600 font-medium">Бесплатно</span>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-2xl font-bold text-black">ИТОГО</span>
                      <span className="text-2xl font-bold text-black">{totalToPay.toLocaleString()} ₽</span>
                    </div>
                    <div className="mb-8 p-4 bg-green-50 rounded-lg flex items-center gap-3 text-sm">
                      <span className="text-black/70">Вернется бонусами:</span>
                      <span className="bg-green-500 text-white px-2 py-1 rounded font-medium">4 325 ₽</span>
                    </div>
                    <button
                      onClick={() => setIsOnlinePaymentModalOpen(true)}
                      className="w-full py-4 bg-black text-white text-center font-medium rounded-xl hover:bg-gray-900 transition-all shadow-md hover:shadow-lg text-lg"
                    >
                      ОФОРМИТЬ ЗАКАЗ
                    </button>
                    <p className="text-sm text-black/60 text-center mt-4">
                      Способ и время доставки можно выбрать при оформлении
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно оплаты */}
      {isOnlinePaymentModalOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsOnlinePaymentModalOpen(false)}
        >
          <motion.div 
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-6 text-black">Подтверждение оплаты</h3>
            <div className="space-y-6 mb-8">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-black">Адрес получения:</p>
                <p className="text-lg font-medium text-black">
                  Деревня Исаково 103А Истринский район
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3V5a3 3 0 00-6 0v3c0 1.657 1.343 3 3 3z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"></path>
                </svg>
                <div>
                  <p className="font-medium text-black">Безопасный платеж</p>
                  <p className="text-sm text-black">Оплата через YooKassa</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={confirmOrder}
                className="flex-1 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300 font-medium"
              >
                Оплатить
              </button>
              <button
                onClick={() => setIsOnlinePaymentModalOpen(false)}
                className="flex-1 py-4 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
              >
                Отмена
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default Cart;
