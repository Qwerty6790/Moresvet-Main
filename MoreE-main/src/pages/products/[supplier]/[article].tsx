'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import 'tailwindcss/tailwind.css';
import Header from '@/components/Header';
import { Toaster, toast } from 'sonner';
import { Heart, Facebook, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import ClipLoader from 'react-spinners/ClipLoader';
import { FaWhatsapp } from "react-icons/fa";

interface ProductI {
  imageAddress: any;
  _id: string;
  article: string;
  name: string;
  price: number;
  stock: string;
  imageAddresses: string[] | string;
  source: string;
}

const ProductDetail: React.FC = () => {
  const router = useRouter();
  const { supplier, article } = router.query;

  const [product, setProduct] = useState<ProductI | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({ article: product.article, source: product.source, quantity });
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
      liked.products.splice(existingProductIndex, 1);
      setIsLiked(false);
      toast.success('Товар удален из избранного');
    } else {
      liked.products.push({ article: product.article, source: product.source, quantity: 1 });
      setIsLiked(true);
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

  const goToPrevImage = () => {
    const images = Array.isArray(product?.imageAddresses) ? product?.imageAddresses : [product?.imageAddresses];
    if (images?.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  const goToNextImage = () => {
    const images = Array.isArray(product?.imageAddresses) ? product?.imageAddresses : [product?.imageAddresses];
    if (images?.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white text-black">
        <ClipLoader size={50} color="#000000" loading={loading} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-white text-black">
        <p>Товар не найден</p>
      </div>
    );
  }

  const images = Array.isArray(product?.imageAddresses) && product.imageAddresses.length > 0
  ? product.imageAddresses
  : product?.imageAddress
  ? [product.imageAddress]
  : []; // обработка imageAddress

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      <Header />
      <div className="flex justify-center mt-32 items-center flex-1 p-6">
        <div className="bg-white rounded-lg  flex flex-col md:flex-row max-w-7xl w-full">
          {/* Левый блок с изображением */}
          <div className="w-full md:w-1/2 relative">
            {images.length > 0 ? (
              <img className="w-full h-full object-cover rounded-lg" src={images[currentImageIndex]} alt={product.name} />
            ) : (
              <div className="w-full h-full bg-gray-200">No Image</div>
            )}
          </div>

          {/* Правая часть с информацией о товаре */}
          <div className="w-full md:w-1/2 flex flex-col justify-between p-8">
            <div>
              {/* Название товара */}
              <h1 className="text-4xl font-extrabold text-black tracking-wide">{product.name}</h1>
              {/* Цена */}
             
              {/* Артикул и наличие */}
              <p className="text-lg text-gray-600 mt-4">Артикул: {product.article}</p>
              <p className="text-lg text-gray-600 mt-2">Остаток: {product.stock} шт.</p>
            </div>
            <p className="text-4xl font-semibold text-gray-800 mt-2">{product.price} ₽</p>
            <div className="mt-6 flex items-center justify-between">
            
              {/* Увеличение и уменьшение количества */}
              <div className="flex items-center space-x-4">
                <button onClick={() => setQuantity(Math.max(quantity - 1, 1))} className="bg-neutral-700 text-white px-4 py-2 text-3xl">
                  -
                </button>
                <span className="text-2xl font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="bg-neutral-700 text-white px-4 py-2  text-3xl">
                  +
                </button>
              </div>

              {/* Кнопка добавить в корзину */}
              <button onClick={addToCart} className="bg-neutral-700 text-white p-8 mx-2 rounded-md text-lg transition duration-500 hover:bg-blue-700 w-48">
                В Корзину
              </button>
            </div>

            <div className="mt-6 flex items-center space-x-4">
              {/* Добавить в избранное */}
              <button onClick={addToLiked} className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                <Heart fill={isLiked ? 'red' : 'none'} className="w-6 h-6" />
                <span>{isLiked ? 'Удалить из избранного' : 'В избранное'}</span>
              </button>

              {/* Кнопки для соцсетей */}
              <div className="flex space-x-4">
                <button onClick={shareOnFacebook}>
                  <Facebook color="black" size={24} />
                </button>
                <button onClick={shareOnTelegram}>
                  <Send color="black" size={24} />
                </button>
                <button onClick={shareOnWhatsApp}>
                  <FaWhatsapp color="black" size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
