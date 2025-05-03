import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ProductI } from '../types/interfaces';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface CatalogOfProductProps {
  products: ProductI[];
  viewMode: 'grid' | 'list' | 'table';
  isLoading?: boolean;
}

// Функция нормализации URL: если протокол страницы https и URL начинается с http://,
// заменяем его на https://
const normalizeUrl = (url: string): string => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

const CatalogOfProductSearch: React.FC<CatalogOfProductProps> = ({ products, viewMode, isLoading }) => {
  const addToCart = (article: string, source: string, name: string) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    const existingProductIndex = cart.products.findIndex((item: any) => item.article === article);
    if (existingProductIndex > -1) {
      cart.products[existingProductIndex].quantity += 1;
    } else {
      cart.products.push({ article, source, name, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Товар добавлен в корзину');
  };

  // Компонент карточки товара с логикой отображения фотографий и улучшенным дизайном
  const ProductCard: React.FC<{ product: ProductI; index: number }> = ({ product, index }) => {
    // Собираем массив изображений из всех возможных источников, нормализуем URL и ограничиваем до 4-х фото
    const images = useMemo(() => {
      const arr: string[] = [];
      if (typeof product.imageAddresses === 'string') {
        arr.push(normalizeUrl(product.imageAddresses));
      } else if (Array.isArray(product.imageAddresses)) {
        arr.push(...product.imageAddresses.map(normalizeUrl));
      }
      if (typeof product.imageAddress === 'string') {
        arr.push(normalizeUrl(product.imageAddress));
      } else if (Array.isArray(product.imageAddress)) {
        arr.push(...product.imageAddress.map(normalizeUrl));
      }
      return arr.slice(0, 4);
    }, [product.imageAddresses, product.imageAddress]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [mainImageError, setMainImageError] = useState(false);
    const [failedThumbnailIndices, setFailedThumbnailIndices] = useState<number[]>([]);
    const [isHovering, setIsHovering] = useState(false);

    // При перемещении мыши вычисляем новый индекс изображения в зависимости от позиции курсора
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const newIndex = Math.floor((x / width) * images.length);
      setCurrentIndex(newIndex);
    };

    const handleMouseLeave = () => {
      setCurrentIndex(0);
      setIsHovering(false);
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    // Анимация карточки с задержкой для создания каскадного эффекта
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.5,
          delay: index * 0.05, // Небольшая задержка для каскадной анимации
        }
      }
    };

    return (
      <div className="bg-white rounded-sm overflow-hidden border border-gray-100">
        <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`}>
          <div>
            {/* Контейнер изображения */}
            <div className="relative">
              {/* Бейджи */}
              <div className="absolute top-2 left-2 z-10">
                {product.isNew && (
                  <div className="bg-black text-white text-xs px-2 py-0.5">
                    NEW
                  </div>
                )}
              </div>

              <div className="aspect-square bg-white flex items-center justify-center">
                {images.length > 0 && !mainImageError ? (
                  <img
                    src={`${images[currentIndex]}?q=75&w=400`}
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                    loading={index < 8 ? "eager" : "lazy"}
                    onError={() => setMainImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                    Нет изображения
                  </div>
                )}
              </div>
            </div>

            {/* Информация о товаре */}
            <div className="p-3">
              <div className="mb-1">
                <div className="text-xs text-gray-400 uppercase">{product.source}</div>
              </div>
              <h3 className="text-sm text-gray-800 line-clamp-2 mb-2">
                {product.name}
              </h3>
              
              <div className="flex flex-col gap-2">
                <span className="text-base font-bold">
                  {new Intl.NumberFormat('ru-RU').format(product.price)} ₽
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="w-8 h-8 border border-gray-300 flex items-center justify-center"
                  >
                    −
                  </button>
                  
                  <span className="text-center flex-1">1</span>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="w-8 h-8 border border-gray-300 flex items-center justify-center"
                  >
                    +
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product.article, product.source, product.name);
                    }}
                    disabled={Number(product.stock) <= 0}
                    className="bg-white p-2 border border-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  // Создаем стиль сетки в зависимости от выбранного режима просмотра
  const gridStyle = useMemo(() => {
    if (viewMode === 'list') {
      return 'grid-cols-1 gap-4';
    }
    if (viewMode === 'table') {
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4';
    }
    // По умолчанию используем стиль grid
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-3 gap-4';
  }, [viewMode]);

  return (
    <div className={`grid ${gridStyle}`}>
      {products.map((product, index) => (
        <ProductCard key={`${product._id || product.article}-${index}`} product={product} index={index} />
      ))}
    </div>
  );
};

export default CatalogOfProductSearch;
