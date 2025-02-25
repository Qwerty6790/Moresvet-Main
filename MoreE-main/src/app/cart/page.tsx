'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { ProductI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { FaMinus, FaPlus, FaTrash, FaLock } from 'react-icons/fa';

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

  // Удаление продукта (уменьшение количества или полное удаление)
  const handleRemoveProduct = (id: string) => {
    setCartProducts((prevProducts) => {
      const updatedProducts = prevProducts
        .map((product) => {
          if (product._id === id) {
            const updatedQuantity = product.quantity && product.quantity > 1 ? product.quantity - 1 : 0;
            return updatedQuantity > 0 ? { ...product, quantity: updatedQuantity } : null;
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
          return { ...product, quantity: (product.quantity || 0) + 1 };
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
        if (product._id === id && product.quantity && product.quantity > 1) {
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
    setError('Корзина пуста.');
    toast.success('Корзина очищена');
  };

  // Функция подтверждения заказа с возможностью онлайн-оплаты
  const confirmOrder = async (paymentMethod: string) => {
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
      const url =
        paymentMethod === 'online'
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/orders/add-order-with-payment`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/orders/add-order-without-payment`;

      const response = await axios.post(
        url,
        { products, paymentMethod },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );

      if (paymentMethod === 'online') {
        const paymentUrl = response.data.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          toast.error('Не удалось получить URL для оплаты. Попробуйте позже.');
        }
      } else {
        toast.success('Заказ успешно создан!');
        handleClearCart();
        setIsOnlinePaymentModalOpen(false);
        router.push('/orders');
      }
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          toast.error('Пожалуйста, войдите в аккаунт заново.');
          localStorage.removeItem('token');
        } else if (error.response?.status === 500) {
          toast.error('Серверная ошибка. Попробуйте позже.');
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
    <section className="min-h-screen bg-white">
      <Toaster position="top-center" richColors />

      {/* Header Section */}
      <div className="container mx-auto px-4 mt-64 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-black">В КОРЗИНЕ {cartProducts.length} ТОВАРА</h1>
          <button className="flex items-center gap-2 text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Поделиться корзиной
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className={`${!error ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center">
                <ClipLoader color="#000000" size={40} />
                <p className="mt-4 text-black">Загружаем вашу корзину...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center w-full">
                <img 
                  src="/images/cartlogo.png" 
                  alt="Empty cart"
                  className="w-full h-64 object-contain mb-6"
                />
                <p className="text-xl text-black mb-6">{error}</p>
                <Link
                  href="/catalog"
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-gray-200">
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
                    <div key={product._id} className="pt-6">
                      <div className="flex gap-6">
                        <div className="w-24 h-24 bg-[#f8f8f8] flex items-center justify-center">
                          <img
                            src={`${imageUrl}?q=75&w=400`}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>

                        <div className="flex-grow">
                          <h3 className="text-black mb-1">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.article}</p>
                          <div className="flex items-center gap-4 mt-4">
                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                            <label className="text-sm text-gray-600">
                              Рассчитать стоимость сборки и установки
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDecreaseQuantity(product._id)}
                              className="text-black text-2xl"
                            >
                              −
                            </button>
                            <span className="text-black">{product.quantity}</span>
                            <button
                              onClick={() => handleIncreaseQuantity(product._id)}
                              className="text-black text-2xl"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="text-black font-medium">{product.price} руб.</div>
                            <button onClick={() => handleRemoveProduct(product._id)} className="text-black mt-2">
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          {!error && (
            <div className="lg:col-span-1">
              <div className="bg-white p-6 border border-gray-200 rounded">
                <h2 className="text-xl font-medium text-black mb-6">ВАША КОРЗИНА</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-black">Товары ({cartProducts.length})</span>
                    <span className="text-black">{totalAmount} руб.</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Доставка</span>
                    <span className="text-green-600">Бесплатно</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-medium text-black">ИТОГО</span>
                      <span className="text-xl font-medium text-black">{totalToPay} руб.</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Вернется бонусами</span>
                      <span className="bg-green-500 text-white px-2 py-1 rounded">4 325 ₽</span>
                      <span className="text-gray-500">при оплате картой Сбербанка</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOnlinePaymentModalOpen(true)}
                    className="w-full py-3 bg-black text-white text-center font-medium"
                  >
                    ПЕРЕЙТИ К ОФОРМЛЕНИЮ
                  </button>
                  <p className="text-sm text-gray-600 text-center">
                    Способ и время доставки можно выбрать на следующем шаге
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Payment Modal */}
      {isOnlinePaymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-black">Подтверждение оплаты</h3>
            <div className="space-y-6 mb-8">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-black">Адрес получения:</p>
                <p className="text-lg font-medium text-black">
                  Деревня Исаково 103А Истринский район
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                <FaLock className="w-5 h-5 text-black" />
                <div>
                  <p className="font-medium text-black">Безопасный платеж</p>
                  <p className="text-sm text-black">Оплата через YooKassa</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => confirmOrder('online')}
                className="flex-1 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300 font-medium"
              >
                Оплатить
              </button>
              <button
                onClick={() => setIsOnlinePaymentModalOpen(false)}
                className="flex-1 py-4 bg-gray-50 text-black rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Cart;
