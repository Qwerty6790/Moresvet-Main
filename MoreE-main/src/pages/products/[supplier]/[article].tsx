'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Toaster, toast } from 'sonner';
import { Heart, ArrowLeft, Copy } from 'lucide-react';
import Header from '@/components/Header';

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
  // Основное изображение, отображаемое в большом блоке
  const [mainImage, setMainImage] = useState<string>('');
  // Флаг ошибки загрузки для основного изображения
  const [mainImageError, setMainImageError] = useState(false);
  // 5 случайных миниатюр (не включая первое изображение)
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  // Индексы миниатюр, у которых произошла ошибка загрузки
  const [failedThumbnailIndices, setFailedThumbnailIndices] = useState<number[]>([]);
  // Состояние для избранного
  const [isFavorite, setIsFavorite] = useState(false);

  // Загрузка данных о товаре
  useEffect(() => {
    const fetchProduct = async () => {
      if (!supplier || !article) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/${supplier}?productArticle=${article}`
        );
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

  // Обработка изображений: выбираем основное (первое) и 5 случайных из оставшихся
  useEffect(() => {
    if (product) {
      const allImages =
        typeof product.imageAddresses === 'string'
          ? [product.imageAddresses]
          : Array.isArray(product.imageAddresses)
          ? product.imageAddresses
          : typeof product.imageAddress === 'string'
          ? [product.imageAddress]
          : Array.isArray(product.imageAddress)
          ? product.imageAddress
          : [];
      if (allImages.length > 0) {
        // Основное изображение — всегда первое
        setMainImage(allImages[0]);
        setMainImageError(false);
        if (allImages.length > 1) {
          // Из оставшихся выбираем 5 случайных
          const remaining = allImages.slice(1);
          // Перемешиваем массив (алгоритм Фишера-Йетса)
          for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
          }
          setThumbnails(remaining.slice(0, 5));
          setFailedThumbnailIndices([]);
        }
      }
    }
  }, [product]);

  // При загрузке товара проверяем, есть ли он в избранном
  useEffect(() => {
    if (product) {
      const likedData = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
      const exists = likedData.products.some((p: ProductI) => p._id === product._id);
      setIsFavorite(exists);
    }
  }, [product]);

  // Функция для добавления/удаления товара в/из избранного
  const toggleFavorite = () => {
    if (!product) return;
    const likedData = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    if (isFavorite) {
      // Удаляем товар
      likedData.products = likedData.products.filter((p: ProductI) => p._id !== product._id);
      localStorage.setItem('liked', JSON.stringify(likedData));
      setIsFavorite(false);
      toast.success('Товар удалён из избранного');
    } else {
      // Добавляем товар
      likedData.products.push(product);
      localStorage.setItem('liked', JSON.stringify(likedData));
      setIsFavorite(true);
      toast.success('Товар добавлен в избранное');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p>Товар не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1420px] mt-10 mx-auto px-8 pt-24">
        {/* Top Navigation */}
        <div className="flex items-center justify-between py-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-900 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Напольные светильники (Торшер)</span>
          </button>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Copy className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleFavorite}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Heart 
                className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
              />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Left Side - Product Info */}
          <div className="w-5/12 pr-12">
            <div className="mb-8">
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">new</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">LED</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">{product.article}</p>
                <button className="text-sm text-gray-600 underline">Все характеристики</button>
              </div>
            </div>

            {/* Dimensions */}
            <div className="flex items-center gap-3 mb-12">
              <span className="text-xl">1620</span>
              <span className="text-xl">×</span>
              <span className="text-xl">450</span>
              <span className="text-xl">×</span>
              <span className="text-xl">450</span>
            </div>

            {/* Specifications */}
            <div className="space-y-6">
              <div>
                <p className="text-sm mb-2">Цветовая температура, К</p>
                <div className="h-px bg-gray-200"></div>
              </div>

              <div>
                <p className="text-sm mb-2">Мощность, Вт</p>
                <p className="text-sm text-gray-600">36</p>
                <div className="h-px bg-gray-200"></div>
              </div>

              <div>
                <p className="text-sm mb-2">Степень защиты</p>
                <p className="text-sm text-gray-600">IP 20</p>
                <div className="h-px bg-gray-200"></div>
              </div>
            </div>

            {/* Price and Action */}
            <div className="mt-12">
              <div className="flex items-baseline justify-between mb-6">
                <span className="text-4xl font-bold">
                  {new Intl.NumberFormat('ru-RU').format(product.price)} ₽
                </span>
                <span className="text-sm text-gray-600">В наличии: {product.stock}</span>
              </div>
              <button className="w-full py-4 border border-gray-900 rounded text-sm font-medium hover:bg-gray-50">
                Найти у партнёра
              </button>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="w-7/12 bg-[#f8f8f8]">
            <div className="aspect-square relative">
              {/* Основное изображение показывается только если загрузилось */}
              {!mainImageError && mainImage && (
                <img
                  src={`${mainImage}?q=75&w=400`}
                  alt="Product"
                  className="w-full h-full object-contain p-12 mix-blend-multiply"
                  onError={() => setMainImageError(true)}
                />
              )}
              
              {/* Thumbnails */}
              {thumbnails.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {thumbnails.map((img, idx) => {
                      if (failedThumbnailIndices.includes(idx)) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setMainImage(img);
                            setMainImageError(false);
                          }}
                          className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden ${
                            mainImage === img ? 'ring-2 ring-black' : 'opacity-50'
                          }`}
                        >
                          <img 
                            src={`${img}?q=75&w=100`}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={() =>
                              setFailedThumbnailIndices((prev) => [...prev, idx])
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default ProductDetail;
