import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import 'tailwindcss/tailwind.css';
import Header from '@/components/Header';
import { Toaster, toast } from 'sonner';
import { ClipLoader } from 'react-spinners';
import { ChevronRight, ArrowRight, Heart } from 'lucide-react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { BASE_URL, getImageUrl } from '@/utils/constants';
import SEO from '@/components/SEO';

import type { ProductI } from '@/types/interfaces';

interface ProductDetailProps {
  product: ProductI;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product: initialProduct }) => {
  const router = useRouter();
  const [product, setProduct] = useState<ProductI | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [activeTab, setActiveTab] = useState('characteristics');
  const [isMounted, setIsMounted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Состояния для логики изображений
  const [mainImage, setMainImage] = useState<string>('');
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [failedThumbnailIndices, setFailedThumbnailIndices] = useState<number[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        setMainImage(allImages[0]);
        setMainImageError(false);
        if (allImages.length > 1) {
          const remaining = allImages.slice(1);
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

  // Проверка, находится ли товар в избранном
  useEffect(() => {
    if (product && isMounted) {
      const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
      const isProductLiked = liked.products.some(
        (item: any) => item.article === product.article && item.source === product.source
      );
      setIsLiked(isProductLiked);
    }
  }, [product, isMounted]);

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    const existingProductIndex = cart.products.findIndex(
      (item: any) => item.article === product.article
    );

    if (existingProductIndex > -1) {
      cart.products[existingProductIndex].quantity += 1;
    } else {
      cart.products.push({ article: product.article, source: product.source, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Товар добавлен в корзину');
  };

  const toggleLiked = () => {
    if (!product) return;
    
    const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    const existingProductIndex = liked.products.findIndex(
      (item: any) => item.article === product.article && item.source === product.source
    );

    if (existingProductIndex > -1) {
      // Удаляем из избранного
      liked.products.splice(existingProductIndex, 1);
      setIsLiked(false);
      toast.success('Товар удален из избранного');
    } else {
      // Добавляем в избранное
      liked.products.push({ 
        article: product.article, 
        source: product.source,
        _id: product._id
      });
      setIsLiked(true);
      toast.success('Товар добавлен в избранное');
    }

    localStorage.setItem('liked', JSON.stringify(liked));
  };

  // Если продукт не найден
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p>Товар не найден</p>
      </div>
    );
  }

  const mainImageForStructured: string | undefined = Array.isArray(product.imageAddresses)
    ? product.imageAddresses[0]
    : typeof product.imageAddresses === 'string'
    ? product.imageAddresses
    : typeof product.imageAddress === 'string'
    ? product.imageAddress
    : Array.isArray(product.imageAddress)
    ? product.imageAddress[0]
    : undefined;

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": mainImageForStructured,
    "description": `${product.name} - ${product.material}, ${product.color}`,
    "brand": {
      "@type": "Brand",
      "name": product.source
    },
    "offers": {
      "@type": "Offer",
      "url": `${BASE_URL}/products/${product.source}/${product.article}`,
      "priceCurrency": "RUB",
      "price": product.price,
      "availability": Number(product.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <SEO 
        title={`${product.name} | PalermoLight`}
        description={`Купить ${product.name} по выгодной цене. ${product.material}, ${product.color}. Доставка по всей России.`}
        keywords={`${product.name}, ${product.source}, светильник, ${product.material}, ${product.color}`}
        ogImage={mainImageForStructured}
        url={`${BASE_URL}/products/${product.source}/${product.article}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mt-5 mx-auto px-4 pt-4 ">
          {/* Компактные хлебные крошки */}
          <div className="flex items-center gap-1 text-xs mb-2 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="text-gray-500 hover:underline">Главная</Link>
            <ChevronRight className="w-3 h-3 text-gray-500" />
            <Link href="/catalog" className="text-gray-500 hover:underline">Каталог</Link>
            <ChevronRight className="w-3 h-3 text-gray-500" />
            <Link href="/catalog/lights" className="text-gray-500 hover:underline">Светильники</Link>
            <ChevronRight className="w-3 h-3 text-gray-500" />
            <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
          </div>

          {/* Компактный заголовок и артикул */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
            <h1 className="text-xl font-normal mb-2 sm:mb-0">{product.name}</h1>
            <div className="flex flex-wrap items-center text-sm space-x-2">
              <div className="flex items-center mb-1 sm:mb-0">
                <span className="text-gray-500">Арт: </span>
                <span>{product.article}</span>
              </div>
              <button className="text-gray-500 hover:underline text-sm mb-1 sm:mb-0">Сравнить</button>
              <button 
                onClick={toggleLiked}
                className="flex items-center text-gray-500 hover:underline text-sm"
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-black text-black' : ''}`} />
                {isLiked ? 'В избранном' : 'В избранное'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Левая колонка - изображения */}
            <div className="col-span-1 sm:col-span-5">
              <div className="aspect-[4/3] relative bg-[#f8f8f8] rounded">
                {!mainImageError && mainImage && (
                  <img
                    src={`${mainImage}?q=75&w=400`}
                    alt={`${product.name} - основное фото`}
                    className="w-full h-full object-contain p-4 mix-blend-multiply"
                    onError={() => setMainImageError(true)}
                  />
                )}
                {thumbnails.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex gap-1 overflow-x-auto py-1">
                      {thumbnails.map((img, idx) => {
                        if (failedThumbnailIndices.includes(idx)) return null;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setMainImage(img);
                              setMainImageError(false);
                            }}
                            className={`relative flex-shrink-0 w-12 h-12 rounded overflow-hidden ${
                              mainImage === img ? 'ring-1 ring-black' : 'opacity-50'
                            }`}
                          >
                            <img
                              src={getImageUrl(img)}
                              alt={`Миниатюра ${idx + 1}`}
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

            {/* Правая колонка - информация о товаре */}
            <div className="col-span-1 sm:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Основная информация о цене и кнопки действий */}
                <div className="col-span-1 sm:col-span-6 mb-2 sm:mb-0">
                  <div className="text-2xl font-medium">{product.price} ₽</div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <div className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">6%</div>
                    <div className="text-green-600">99 бонусов</div>
                  </div>
                </div>
                
                <div className="col-span-1 sm:col-span-6 mb-4 sm:mb-0">
                  <div className="flex flex-col  gap-2">
                    <button
                      onClick={addToCart}
                      className="w-full bg-black rounded-full text-white py-2 px-4 text-center font-medium text-sm"
                    >
                      В КОРЗИНУ
                    </button>
                    <button className="w-full border rounded-full border-black py-2 px-4 text-center font-medium text-sm">
                      КУПИТЬ В 1 КЛИК
                    </button>
                  </div>
                </div>
                
                {/* Наличие и доставка */}
                <div className="col-span-1 sm:col-span-12 bg-gray-50 p-3 rounded text-sm mb-3 sm:mb-0">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between">
                    <div className="flex items-center gap-1 mb-1 sm:mb-0">
                      <span className="text-green-600">В наличии {product.stock} шт.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Доставка: 10 февраля</span>
                    </div>
                  </div>
                </div>
                
                {/* Основные характеристики */}
                <div className="col-span-1 sm:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3 sm:mb-0">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Высота:</span>
                    <span>100 мм</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Диаметр:</span>
                    <span>70 мм</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Цоколь:</span>
                    <span>GU10</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Тип лампы:</span>
                    <span>Галогеновая</span>
                  </div>
                </div>
                
                {/* Дополнительные преимущества - компактно */}
                <div className="col-span-1 sm:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
                  <div className="flex items-center gap-1 mb-1 sm:mb-0">
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">Увеличенный срок возврата</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1 sm:mb-0">
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">Расширенная гарантия</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1 sm:mb-0">
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">Бесплатная доставка от 3000₽</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">Оплата бонусами СберСпасибо</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Табы */}
          <div className="mt-6 border-b">
            <div className="flex overflow-x-auto">
              {['Характеристики', 'Описание', 'Доставка', 'Лампы', 'Отзывы'].map((tab) => (
                <button
                  key={tab}
                  className={`pb-2 px-3 text-sm whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-b-2 border-black font-medium'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Содержимое таба */}
          {activeTab === 'characteristics' && (
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium mb-2 text-sm">ЭЛЕКТРИКА</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Вид ламп</span>
                    <span>Галогеновая</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Цоколь</span>
                    <span>GU10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Количество ламп</span>
                    <span>1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Мощность лампы, W</span>
                    <span>50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Общая мощность, W</span>
                    <span>50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Напряжение</span>
                    <span>220</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-sm">ВНЕШНИЙ ВИД</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Материал плафона</span>
                    <span>Металл</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Цвет плафона</span>
                    <span>Черный</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Материал арматуры</span>
                    <span>Металл</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Цвет арматуры</span>
                    <span>Черный</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Стиль</span>
                    <span>Минимализм</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Направление</span>
                    <span>Поворотное</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Форма плафона</span>
                    <span>Цилиндр</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Toaster position="top-center" richColors />
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { supplier, article } = params as { supplier: string; article: string };
  
  try {
    const url = `${BASE_URL}/api/product/${supplier}?productArticle=${article}`;
    console.log('Fetching product from:', url);
    const response = await fetch(url);
    console.log('Product fetch status:', response.status);

    if (!response.ok) {
      const errText = await response.text().catch(() => 'no body');
      console.error('Product fetch failed:', response.status, errText);
      return { notFound: true };
    }

    const product = await response.json();
    console.log('Product response:', product);

    if (!product) {
      return { notFound: true };
    }

    return {
      props: {
        product,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { notFound: true };
  }
};

export default ProductDetail;