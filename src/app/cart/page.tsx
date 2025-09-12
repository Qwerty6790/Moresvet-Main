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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try { window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: updatedProducts.length } })); } catch {}
  };

  // Удаление продукта (уменьшение количества или полное удаление)
  const handleRemoveProduct = (id: string) => {
    const updatedProducts = cartProducts
      .map((product) => {
        if (product._id === id) {
          const updatedQuantity = (product.quantity ?? 0) > 1 ? (product.quantity ?? 0) - 1 : 0;
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
        return { ...product, quantity: (product.quantity ?? 0) + 1 };
      }
      return product;
    });
    handleUpdateCart(updatedProducts);
  };

  const handleDecreaseQuantity = (id: string) => {
    const updatedProducts = cartProducts.map((product) => {
      if (product._id === id && (product.quantity ?? 0) > 1) {
        return { ...product, quantity: (product.quantity ?? 0) - 1 };
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

  // Логика оформления заказа (гость или авторизованный)
  const confirmOrder = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error('Укажите имя и телефон');
      return;
    }

    const token = localStorage.getItem('token');
    const products = cartProducts.map((product) => ({
      name: product.name,
      article: product.article,
      source: product.source,
      quantity: product.quantity ?? 0,
      price: product.price || 0,
    }));

    const payload: any = {
      products,
      contactName,
      contactPhone,
      contactEmail: contactEmail || undefined,
      deliveryMethod,
      paymentMethod,
      address: deliveryMethod === 'delivery' ? address : 'pickup',
      comment: comment || undefined,
      isGuest: !token,
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      setIsSubmitting(true);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/add-order`,
        payload,
        { headers }
      );

      // Если бэк вернул ссылку на оплату — редиректим
      if (paymentMethod === 'online') {
        const paymentUrl =
          data?.confirmation?.confirmation_url || data?.paymentUrl || data?.url || data?.redirectUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
      }

      toast.success('Заказ успешно создан!');
      handleClearCart();
      if (token) {
        router.push('/orders');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          // Пробуем как гость без токена (если вдруг заглючил локальный токен)
          try {
            const { data } = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/orders/add-order`,
              { ...payload, isGuest: true },
              { headers: { 'Content-Type': 'application/json' } }
            );

            if (paymentMethod === 'online') {
              const paymentUrl =
                data?.confirmation?.confirmation_url || data?.paymentUrl || data?.url || data?.redirectUrl;
              if (paymentUrl) {
                window.location.href = paymentUrl;
                return;
              }
            }

            toast.success('Заказ успешно создан!');
            handleClearCart();
            router.push('/');
          } catch (guestErr) {
            toast.error('Ошибка при создании заказа. Повторите попытку.');
          }
        } else {
          toast.error('Ошибка при создании заказа. Повторите попытку.');
        }
      } else {
        toast.error('Произошла неизвестная ошибка.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cartProducts.reduce((sum, product) => {
    const quantity = product.quantity ?? 0;
    const price = product.price || 0;
    return sum + price * quantity;
  }, 0);

  const deliveryCost = 0;
  const totalToPay = totalAmount + deliveryCost;

  return (
    <motion.section
      className="min-h-screen bg-gradient-to-b from-white to-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Toaster position="top-center" richColors />

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Корзина</h1>
            <div className="text-sm text-gray-500 mt-1">
              <Link href="/" className="hover:underline">Главная</Link>
              <span className="mx-2">/</span>
              <span>Корзина</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Товаров: <span className="font-medium text-gray-900">{cartProducts.length}</span></div>
            <div className="text-sm text-gray-500">Итого: <span className="font-bold text-gray-900">{totalToPay.toLocaleString()} ₽</span></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className={`${!error ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow p-12 flex flex-col items-center">
                <ClipLoader color="#111827" size={36} />
                <p className="mt-4 text-gray-700">Загружаем корзину...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl shadow p-10 text-center">
                <p className="text-2xl font-medium text-gray-800 mb-6">{error}</p>
                <Link href="/catalog" className="inline-flex items-center px-5 py-3 bg-black text-white rounded-xl">Перейти в каталог</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartProducts.map((product) => {
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
                      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 items-center"
                      whileHover={{ y: -2 }}
                    >
                      <div className="w-28 h-28 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={`${imageUrl}?q=75&w=400`} alt={product.name} className="w-full h-full object-contain p-2" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-500">Артикул: {product.article}</p>
                        {product.source && <p className="text-sm text-gray-400 mt-1">Производитель: {product.source}</p>}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-lg font-bold text-gray-900">{typeof product.price === 'number' ? `${product.price.toLocaleString()} ₽` : `${product.price} ₽`}</div>

                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => handleDecreaseQuantity(product._id)} className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100">
                            <FaMinus />
                          </button>
                          <div className="px-4 text-sm font-medium">{product.quantity ?? 0}</div>
                          <button onClick={() => handleIncreaseQuantity(product._id)} className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100">
                            <FaPlus />
                          </button>
                        </div>

                        <button onClick={() => handleRemoveProduct(product._id)} className="text-sm text-red-600 hover:text-red-700">Удалить</button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {!error && (
            <aside className="lg:col-span-4">
              <div className="sticky top-28 bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900">Ваш заказ</h2>
                  <button onClick={handleClearCart} className="text-sm text-red-600 hover:text-red-700">Очистить</button>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between"><span>Товары</span><span className="font-medium text-gray-900">{cartProducts.length}</span></div>
                  <div className="flex justify-between"><span>Сумма</span><span className="font-medium text-gray-900">{totalAmount.toLocaleString()} ₽</span></div>
                  <div className="flex justify-between"><span>Доставка</span><span className="text-green-600 font-medium">Бесплатно</span></div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500">Итого к оплате</div>
                      <div className="text-xl font-extrabold text-gray-900">{totalToPay.toLocaleString()} ₽</div>
                    </div>
                    <div className="text-xs text-gray-400">VAT не включен</div>
                  </div>
                </div>

                {/* Inline checkout form (moved from modal) */}
                <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Оформление заказа</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Укажите имя" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                    <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Укажите телефон" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                    <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Укажите E-mail" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />

                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setDeliveryMethod('delivery')} className={`px-3 py-1.5 rounded-lg border text-sm ${deliveryMethod === 'delivery' ? 'bg-black text-white border-black' : 'border-gray-300 text-black'}`}>Доставка</button>
                      <button onClick={() => setDeliveryMethod('pickup')} className={`px-3 py-1.5 rounded-lg border text-sm ${deliveryMethod === 'pickup' ? 'bg-black text-white border-black' : 'border-gray-300 text-black'}`}>Самовывоз</button>
                    </div>

                    {deliveryMethod === 'delivery' ? (
                      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Адрес доставки" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                    ) : (
                      <div className="p-3 text-black rounded">121601, город Москва, Мкад 25-километр,ТК КОНСТРУКТОР</div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setPaymentMethod('online')} className={`px-3 py-1.5 rounded-lg border text-sm ${paymentMethod === 'online' ? 'bg-black text-white border-black' : 'border-gray-300 text-black'}`}>Онлайн</button>
                      <button onClick={() => setPaymentMethod('cod')} className={`px-3 py-1.5 rounded-lg border text-sm ${paymentMethod === 'cod' ? 'bg-black text-white border-black' : 'border-gray-300 text-black'}`}>Без предоплаты</button>
                    </div>

                    {paymentMethod === 'online' && (
                      <div className="text-xs text-gray-500">Безопасный платеж через YooKassa</div>
                    )}

                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Комментарий к заказу" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none min-h-[64px]" />

                    <div className="flex gap-2">
                      <button onClick={confirmOrder} disabled={isSubmitting} className="flex-1 py-2 bg-black text-white rounded-lg text-sm">{isSubmitting ? 'Отправляем...' : paymentMethod === 'online' ? 'Перейти к оплате' : 'Оформить без предоплаты'}</button>
                      <button onClick={() => { setContactName(''); setContactPhone(''); setContactEmail(''); setAddress(''); setComment(''); }} className="py-2 px-3 bg-gray-100 rounded-lg text-sm">Очистить</button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {false && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {}}
        >
          <motion.div
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg md:max-w-2xl lg:max-w-3xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-3 text-black">Оформление заказа</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="grid grid-cols-1 gap-2.5">
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm text-black/70">Имя*</label>
                  <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Ваше имя" className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black text-sm" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm text-black/70">Телефон*</label>
                  <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+7 (___) ___-__-__" className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black text-sm" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm text-black/70">E-mail</label>
                  <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="name@mail.ru" className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black text-sm" />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm text-black/70">Способ получения</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setDeliveryMethod('delivery')} className={`px-3 py-1.5 rounded-lg border text-sm ${deliveryMethod === 'delivery' ? 'bg-black text-white border-black' : 'border-gray-300 text-black'}`}>Доставка</button>
                    <button onClick={() => setDeliveryMethod('pickup')} className={`px-3 py-1.5 rounded-lg border text-sm ${deliveryMethod === 'pickup' ? 'bg-black text-white border-black' : 'border-gray-300 text-black'}`}>Самовывоз</button>
                  </div>
                </div>

                {deliveryMethod === 'delivery' ? (
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-sm text-black/70">Адрес доставки</label>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Город, улица, дом, квартира" className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black text-sm" />
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-black/70">Адрес самовывоза:</p>
                    <p className="text-black font-medium mt-1">Деревня Исаково 103А, Истринский район</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm text-black/70">Способ оплаты</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setPaymentMethod('online')} className={`px-3 py-1.5 rounded-lg border text-sm ${paymentMethod === 'online' ? 'bg-black text-white border-black' : 'border-gray-300 text-black'}`}>Онлайн оплата</button>
                    <button onClick={() => setPaymentMethod('cod')} className={`px-3 py-1.5 rounded-lg border text-sm ${paymentMethod === 'cod' ? 'bg-black text-white border-black' : 'border-gray-300 text-black'}`}>Без предоплаты</button>
                  </div>
                  {paymentMethod === 'online' && (
                    <div className="flex items-center gap-2.5 p-2 border border-gray-200 rounded-xl mt-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3V5a3 3 0 00-6 0v3c0 1.657 1.343 3 3 3z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"></path></svg>
                      <div>
                        <p className="font-medium text-black text-sm">Безопасный платеж</p>
                        <p className="text-xs text-black">Оплата через YooKassa</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm text-black/70">Комментарий к заказу</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Пожелания, удобное время звонка..." className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black min-h-[56px] text-sm" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-3">
              <button onClick={confirmOrder} disabled={isSubmitting} className="flex-1 py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300 font-medium disabled:opacity-60 text-sm">
                {isSubmitting ? 'Отправляем...' : paymentMethod === 'online' ? 'Перейти к оплате' : 'Оформить без предоплаты'}
              </button>
              <button onClick={() => {}} className="flex-1 py-2.5 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium text-sm">Отмена</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default Cart;
