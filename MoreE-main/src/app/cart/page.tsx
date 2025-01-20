'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { ProductI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

const Cart: React.FC = () => {
  const router = useRouter();
  const [cartProducts, setCartProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
        setError('Корзина пуста,добавьте в корзину товар для оформления!');
      }
      setIsLoading(false);
    };

    fetchCartProducts();
  }, []);

  const handleRemoveProduct = (id: string) => {
    setCartProducts((prevProducts) => {
      const updatedProducts = prevProducts
        .map((product) => {
          if (product._id === id) {
            const updatedQuantity = product.quantity - 1;
            return updatedQuantity <= 0 ? null : { ...product, quantity: updatedQuantity };
          }
          return product;
        })
        .filter((product) => product !== null) as ProductI[];

      localStorage.setItem('cart', JSON.stringify({ products: updatedProducts }));
      setCartCount(updatedProducts.length);
      localStorage.setItem('cartCount', updatedProducts.length.toString());

      toast.success('Товар удален из корзины');
      return updatedProducts;
    });
  };

  const handleIncreaseQuantity = (id: string) => {
    setCartProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product) => {
        if (product._id === id) {
          return { ...product, quantity: product.quantity + 1 };
        }
        return product;
      });

      localStorage.setItem('cart', JSON.stringify({ products: updatedProducts }));
      setCartCount(updatedProducts.length);
      localStorage.setItem('cartCount', updatedProducts.length.toString());

      return updatedProducts;
    });
  };

  const handleDecreaseQuantity = (id: string) => {
    setCartProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product) => {
        if (product._id === id && product.quantity > 1) {
          return { ...product, quantity: product.quantity - 1 };
        }
        return product;
      });

      localStorage.setItem('cart', JSON.stringify({ products: updatedProducts }));
      setCartCount(updatedProducts.length);
      localStorage.setItem('cartCount', updatedProducts.length.toString());

      return updatedProducts;
    });
  };

  const handleClearCart = () => {
    setCartProducts([]);
    localStorage.setItem('cart', JSON.stringify({ products: [] }));
    setCartCount(0);
    localStorage.setItem('cartCount', '0');
    setError('Корзина пуста,добавтье в корзину товар для оформления!');
    toast.success('Корзина очищена');
  };

  const handleOrder = () => {
    if (!isAuthenticated) {
      router.push('/auth/register');
      return;
    }
    setIsModalOpen(true);
  };

  const confirmOrder = async () => {
    const token = localStorage.getItem('token');
    const products = cartProducts.map((product) => ({
      name: product.name,
      article: product.article,
      source: product.source,
      quantity: product.quantity,
      price: product.price,
    }));

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/add-order`,
        { products },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );

      toast.success('Заказ успешно создан!');
      handleClearCart();
      setIsModalOpen(false);
      router.push('/orders');
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);

      if (error instanceof AxiosError && error.response?.status === 403) {
        toast.error('Пожалуйста, войдите в аккаунт заново.');
        localStorage.removeItem('token');
      } else {
        toast.error('Ошибка при создании заказа.');
      }
    }
  };

  const cancelOrder = () => {
    setIsModalOpen(false);
  };

  const totalAmount = cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const deliveryCost = 0;
  const totalToPay = totalAmount + deliveryCost;

  const isCartEmpty = cartProducts.length === 0;

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
            <h1 className="text-7xl font-bold text-white tracking-tight">
              Корзина
            </h1>
            <div className="flex items-center text-black/60 ">
              <Link href="/" className="hover:text-black transition-colors">Главная</Link>
              <span className="mx-2">/</span>
              <span className="text-black ">Корзина</span>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая секция: Таблица товаров */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <ClipLoader color="#000000" size={40} />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-2xl font-medium text-gray-600 mb-8">{error}</p>
                  <Link href="/products" className="inline-flex items-center px-6 py-3 border-2 border-black 
                                                text-black rounded-xl hover:bg-black hover:text-white 
                                                transition-colors text-lg font-medium">
                    Перейти в каталог
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartProducts.map((product) => (
                    <div key={product._id} 
                      className="flex flex-col sm:flex-row items-start gap-6 p-4 rounded-xl 
                               border border-gray-100 hover:border-black transition-colors">
                      {/* Изображение */}
                      <Link href={`/products/${product.source}/${product.article}`} 
                        className="relative w-full sm:w-48 aspect-square rounded-lg overflow-hidden 
                                 bg-gray-50 group">
                        <img
                          src={product.imageAddress}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 transform group-hover:scale-105 
                                   transition-transform duration-300"
                        />
                      </Link>

                      {/* Информация о товаре */}
                      <div className="flex-1 min-w-0 space-y-4">
                        <div>
                          <Link href={`/products/${product.source}/${product.article}`}>
                            <h3 className="text-lg font-medium line-clamp-2 hover:text-black/80 
                                       transition-colors text-black">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-black/60 mt-1">Артикул: {product.article}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleDecreaseQuantity(product._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg 
                                       border-2 border-gray-200 text-black hover:border-black 
                                       transition-colors"
                            >
                              <FaMinus size={12} />
                            </button>
                            <span className="text-lg font-medium min-w-[2ch] text-center text-black">
                              {product.quantity}
                            </span>
                            <button
                              onClick={() => handleIncreaseQuantity(product._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg 
                                       border-2 border-gray-200 text-black hover:border-black 
                                       transition-colors"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>

                          <div className="flex items-center space-x-6">
                            <p className="text-xl font-bold text-black">
                              {(product.price * product.quantity).toLocaleString()} ₽
                            </p>
                            <button
                              onClick={() => handleRemoveProduct(product._id)}
                              className="p-2 text-black/40 hover:text-red-500 transition-colors"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Правая секция: Итоги */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 sticky top-24">
              <h2 className="text-2xl text-black font-bold">Итого</h2>
              
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-base text-black/70">
                  <span>Товары ({cartProducts.length})</span>
                  <span>{totalAmount.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-base text-black/70">
                  <span>Доставка</span>
                  <span>{deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-100 text-black">
                  <span>К оплате</span>
                  <span>{totalToPay.toLocaleString()} ₽</span>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <button
                  onClick={handleOrder}
                  disabled={isCartEmpty}
                  className="w-full py-4 bg-black text-white rounded-xl text-lg font-medium
                           hover:bg-gray-800 transition-colors disabled:bg-gray-200 
                           disabled:cursor-not-allowed"
                >
                  Оформить заказ
                </button>
                <button
                  onClick={handleClearCart}
                  disabled={isCartEmpty}
                  className="w-full py-4 border-2 border-black text-black rounded-xl text-lg 
                           font-medium hover:bg-black hover:text-white transition-colors
                           disabled:border-gray-200 disabled:text-gray-400 
                           disabled:cursor-not-allowed"
                >
                  Очистить корзину
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div 
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-black">Подтверждение заказа</h2>
            <p className="text-black/70 mb-6">
              Вы уверены, что хотите оформить заказ на сумму {totalToPay.toLocaleString()} ₽?
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={cancelOrder}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-black
                         hover:border-black transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={confirmOrder}
                className="flex-1 py-3 bg-black text-white rounded-xl
                         hover:bg-gray-800 transition-colors"
              >
                Подтвердить
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
};

export default Cart;
