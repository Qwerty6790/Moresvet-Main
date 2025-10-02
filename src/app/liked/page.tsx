'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import axios from 'axios';
import { ProductI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaShareAlt } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

const Liked: React.FC = () => {
  const [likedProducts, setLikedProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchLikedProducts = async () => {
      setLoading(true);
      const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');

      if (liked.products.length > 0) {
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
          setError('Произошла ошибка при загрузке продуктов из Избранного.');
          console.error(err);
        }
      } else {
        setError('Ваш список Избранного пустой');
      }
      setLoading(false);
    };

    fetchLikedProducts();
  }, []);

  const handleRemoveProduct = (id: string) => {
    setLikedProducts((prevProducts) => prevProducts.filter((product) => product._id !== id));
    const updatedLiked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    updatedLiked.products = updatedLiked.products.filter((productId: string) => productId !== id);
    localStorage.setItem('liked', JSON.stringify(updatedLiked));
    toast.success('Товар удален из Избранного');
  };

  const handleClearLiked = () => {
    setLikedProducts([]);
    localStorage.setItem('liked', JSON.stringify({ products: [] }));
    setError('Ваш список Избранного пуст.');
    toast.success('Избранное очищено');
  };

  const handleProductClick = (article: string, source: string) => {
    const encodedArticle = article.replace(/\//g, '%2F');
    router.push(`/products/${source}/${encodedArticle}`);
  };

  const handleShareLiked = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Избранное товары',
          text: 'Посмотрите, какие товары у меня в избранном!',
          url: window.location.href,
        })
        .then(() => console.log('Share successful'))
        .catch((error) => console.error('Ошибка при шаринге', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована');
    }
  };

  const totalAmount = likedProducts.reduce((sum, product) => {
    const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;
    const qty = product.quantity ?? 1;
    return sum + price * qty;
  }, 0);

  const totalToPay = totalAmount;

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
            <h1 className="text-4xl font-extrabold text-gray-900">Избранное</h1>
            <div className="text-sm text-gray-500 mt-1">
              <Link href="/" className="hover:underline">Главная</Link>
              <span className="mx-2">/</span>
              <span>Избранное</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Товаров: <span className="font-medium text-gray-900">{likedProducts.length}</span></div>
            <div className="text-sm text-gray-500">Итого: <span className="font-bold text-gray-900">{totalToPay.toLocaleString()} ₽</span></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className={`${!error ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
            {loading ? (
              <div className="bg-white rounded-2xl shadow p-12 flex flex-col items-center">
              <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl shadow p-10 text-center">
                <p className="text-2xl font-medium text-gray-800 mb-6">{error}</p>
               
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
                  <h2 className="text-lg font-bold text-gray-900">Ваш список</h2>
                  <button onClick={handleClearLiked} className="text-sm text-red-600 hover:text-red-700">Очистить</button>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between"><span>Товары</span><span className="font-medium text-gray-900">{likedProducts.length}</span></div>
                  <div className="flex justify-between"><span>Общая стоимость</span><span className="font-medium text-gray-900">{totalAmount.toLocaleString()} ₽</span></div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500">Итого</div>
                      <div className="text-xl font-extrabold text-gray-900">{totalToPay.toLocaleString()} ₽</div>
                    </div>
                    <div className="text-xs text-gray-400">VAT не включен</div>
                  </div>
                </div>

                <Link href="/cart" className="w-full inline-block text-center py-3 bg-black text-white rounded-lg font-medium">Перейти в корзину</Link>
                <div className="mt-3 text-center text-xs text-gray-500">Добавьте товары в корзину для оформления заказа</div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default Liked;
