'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import axios from 'axios';
import { ProductI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';

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
          setLikedProducts(response.data.products);
        } catch (error) {
          setError('Произошла ошибка при загрузке продуктов из Избранного.');
          console.error(error);
        }
      } else {
        setError('Ваш список Избранного пуст.');
      }
      setLoading(false);
    };

    fetchLikedProducts();
  }, []);

  const handleRemoveProduct = (id: string) => {
    setLikedProducts((prevProducts) =>
      prevProducts.filter((product) => product._id !== id)
    );
    const updatedLiked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    updatedLiked.products = updatedLiked.products.filter((productId: string) => productId !== id);
    localStorage.setItem('liked', JSON.stringify(updatedLiked));
    toast.success('Товар удален из Избранного');
  };

  const handleClearCart = () => {
    setLikedProducts([]);
    localStorage.setItem('liked', JSON.stringify({ products: [] }));
    setError('Ваш список Избранного пуст.');
    toast.success('Избранное очищено');
  };

  const handleProductClick = (article: string, source: string) => {
    const encodedArticle = article.replace(/\//g, '%2F');
    router.push(`/products/${source}/${encodedArticle}`);
  };

  return (
    <motion.section
      className="py-28 bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Toaster position="top-center" richColors />
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center ">
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-800">
            Избранное
          </h1>
          <p className="mt-2 text-gray-600">
            Ваши любимые товары всегда под рукой.
          </p>
        </div>

        {/* Loading/Error/Empty States */}
        {loading ? (
          <div className="flex justify-center py-10">
            <ClipLoader color="#000000" loading={loading} size={50} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-10 text-gray-600">
            <svg
              className="w-20 h-20 text-gray-400 mb-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
              />
            </svg>
            <p>{error}</p>
          </div>
        ) : likedProducts.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-600">
            <svg
              className="w-20 h-20 text-gray-400 mb-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
              />
            </svg>
            <p>Ваш список Избранного пуст.</p>
          </div>
        ) : (
          <>
            {/* Product List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {likedProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => handleProductClick(product.article, product.source)}
                  >
                    <img
                      src={product.imageAddress}
                      alt={product.name}
                      className="w-full h-40 object-contain rounded-md"
                    />
                    <h2 className="mt-4 text-lg font-semibold text-gray-800">
                      {product.name}
                    </h2>
                    <p className="mt-2 text-gray-600">Цена: {product.price} ₽</p>
                  </div>
                  <button
                    className="mt-4 w-full bg-red-600 text-white py-2 rounded-md shadow hover:bg-red-500"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent product click
                      handleRemoveProduct(product._id);
                    }}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>

            {/* Clear Wishlist */}
            <div className="flex justify-center mt-8">
              <button
                className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-500 transition"
                onClick={handleClearCart}
              >
                Очистить Избранное
              </button>
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default Liked;
