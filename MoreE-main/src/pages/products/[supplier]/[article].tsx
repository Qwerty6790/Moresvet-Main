import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import 'tailwindcss/tailwind.css';
import Header from '@/components/Header';
import { Toaster, toast } from 'sonner';
import { Heart, Facebook, Twitter, Send } from 'lucide-react';
import ClipLoader from 'react-spinners/ClipLoader'; // Import the spinner
import { FaWhatsapp } from "react-icons/fa";

interface ProductI {
  _id: string; 
  article: string;
  name: string;
  price: number;
  stock: string;
  imageAddress: string;
  images?: string[]; // Поле для дополнительных изображений
  source: string;
}


const ProductDetail: React.FC = () => {
  const router = useRouter();
  const { supplier, article } = router.query;

  const [product, setProduct] = useState<ProductI | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!supplier || !article) return;

      setLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${supplier}?productArticle=${article}`);
        setProduct(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Ошибка при загрузке товара');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [supplier, article]);

  useEffect(() => {
    // Проверяем, есть ли этот товар в избранном, и устанавливаем статус "лайкнут"
    const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    const isProductLiked = liked.products.some((item: any) => item.article === product?.article);
    setIsLiked(isProductLiked);
  }, [product]);

  const extractStock = (stock: string): number => {
    const match = stock.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const addToCart = () => {
    if (!product) {
      toast.error('Товар не найден');
      return;
    }

    const stockCount = extractStock(product.stock);
    if (stockCount <= 0) {
      toast.error('Товар закончился');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    const existingProductIndex = cart.products.findIndex((item: any) => item.article === product.article);

    if (existingProductIndex > -1) {
      cart.products[existingProductIndex].quantity += 1;
    } else {
      cart.products.push({ article: product.article, source: product.source, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Товар добавлен в корзину');
  };

  const addToLiked = () => {
    if (!product) {
      toast.error('Товар не найден');
      return;
    }

    const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    const existingProductIndex = liked.products.findIndex((item: any) => item.article === product.article);

    if (existingProductIndex > -1) {
      // Если товар уже есть в избранном, удаляем его
      liked.products.splice(existingProductIndex, 1);
      setIsLiked(false);  // Обновляем статус лайка
      toast.success('Товар удален из избранного');
    } else {
      // Добавляем товар в избранное
      liked.products.push({ article: product.article, source: product.source, quantity: 1 });
      setIsLiked(true);  // Обновляем статус лайка
      toast.success('Товар добавлен в избранное');
    }

    localStorage.setItem('liked', JSON.stringify(liked));
  };

  const shareOnTelegram = () => {
    if (product) {
      const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`;
      window.open(url, '_blank');
    }
  };

  const shareOnWhatsApp = () => {
    if (product) {
      const url = `https://wa.me/?text=${encodeURIComponent(product.name)}%20${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    }
  };

  const shareOnFacebook = () => {
    if (product) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        {/* Show spinner when loading */}
        <ClipLoader size={50} color="#ffffff" loading={loading} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <p>Товар не найден</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
    <Toaster position="top-center" richColors />
    <Header />
    <div className="flex justify-center mt-20 items-center flex-1 p-6">
      <div className="bg-gray-50 rounded-lg shadow-lg flex flex-col md:flex-row max-w-4xl w-full border border-gray-200">
        <div className="w-full md:w-1/2 flex flex-col items-center">
          {/* Главное изображение */}
          <img
            className="w-full h-auto object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
            src={product.imageAddress}
            alt={product.name}
          />
          {/* Дополнительные изображения */}
          {product.images && product.images.length > 0 && (
            <div className="flex mt-4 space-x-2">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  src={img}
                  alt={`${product.name} - изображение ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-between p-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-xl text-blue-600 font-semibold mt-4">{product.price} ₽</p>
            <p className="text-sm text-gray-500 mt-2">Артикул: {product.article}</p>
            <p className="text-sm text-gray-500 mt-1">Остаток: {product.stock} шт.</p>
          </div>
          <div className="mt-6">
            <button
              onClick={addToCart}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg transition duration-300 hover:bg-blue-700 w-full"
            >
              В корзину
            </button>
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={addToLiked}
                className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 transition-colors"
              >
                <Heart
                  fill={isLiked ? 'blue' : 'none'}
                  className="w-6 h-6"
                />
                <span>{isLiked ? 'Удалить из избранного' : 'Добавить в избранное'}</span>
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={shareOnFacebook}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Facebook size={24} />
                </button>
                <button
                  onClick={shareOnTelegram}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Send size={24} />
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="text-gray-500 hover:text-green-600 transition-colors"
                >
                  <FaWhatsapp size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default ProductDetail;
