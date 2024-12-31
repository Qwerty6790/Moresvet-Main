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
      <div className="flex justify-center items-center h-screen bg-black text-white">
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
  const images = Array.isArray(product?.imageAddresses) && product.imageAddresses.length > 0
  ? product.imageAddresses
  : product?.imageAddress
  ? [product.imageAddress]
  : []; // обработка imageAddress

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Toaster position="top-center" richColors />
      <Header />
      <div className="flex justify-center mt-40 items-center flex-1 p-6">
        <div className="bg-black rounded-lg shadow-lg flex flex-col md:flex-row max-w-4xl w-full">
          <div className="w-full md:w-2/3 relative">
            {images.length > 1 && (
              <>
                <button onClick={goToPrevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white z-10">
                  <ChevronLeft size={32} />
                </button>
                <button onClick={goToNextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white z-10">
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {images.length > 0 ? (
              <img className="w-full h-auto object-cover rounded-lg" src={images[currentImageIndex]} alt={product.name} />
            ) : (
              <div className="w-full h-full bg-gray-200">No Image</div>
            )}

            {images.length > 1 && (
              <div className="flex overflow-x-auto py-4 space-x-2 mt-4 scrollbar-none">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index}`}
                    className={`w-20 h-20 object-cover rounded-md cursor-pointer transition transform hover:scale-110 ${currentImageIndex === index ? 'border-4 ' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-between p-6">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-4">
                {product.name}
              </h1>
              <p className="text-xl text-gray-300 font-semibold mt-2">{product.price} ₽</p>
              <p className="text-sm text-white mt-2">Артикул: {product.article}</p>
              <p className="text-sm text-white mt-2">Остаток: {product.stock} шт.</p>
            </div>
            <div className="mt-4">
              <button onClick={addToCart} className="bg-white text-black py-3 px-6 rounded-md transition duration-500 hover:bg-blue-700 w-full">
                В Корзину
              </button>
              <div className="flex items-center justify-between mt-4 space-x-4">
                <button onClick={addToLiked} className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart fill={isLiked ? 'red' : 'none'} className="w-6 h-6" />
                  <span>{isLiked ? 'Удалить из избранного' : 'В избранное'}</span>
                </button>
                <div className="flex space-x-4">
                  <button onClick={shareOnFacebook}>
                    <Facebook color="white" size={24} />
                  </button>
                  <button onClick={shareOnTelegram}>
                    <Send color="white" size={24} />
                  </button>
                  <button onClick={shareOnWhatsApp}>
                    <FaWhatsapp color="white" size={24} />
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
