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
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100"
      >
        <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`}>
          <div>
            {/* Контейнер изображения с hover-эффектом */}
            <div
              className="relative"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Бейджи */}
              <div className="absolute top-3 left-3 flex gap-2 z-10">
                {Number(product.stock) > 0 && (
                  <div className="bg-gradient-to-r from-green-500 to-green-400 text-white rounded-full px-3 py-1 text-xs shadow-sm">
                    В наличии
                  </div>
                )}
                {product.isNew && (
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full px-3 py-1 text-xs shadow-sm">
                    Новинка
                  </div>
                )}
              </div>

              <div className="aspect-square bg-white flex items-center justify-center relative overflow-hidden">
                {images.length > 0 && !mainImageError ? (
                  <motion.img
                    src={`${images[currentIndex]}?q=75&w=400`}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    loading={index < 8 ? "eager" : "lazy"}
                    onError={() => setMainImageError(true)}
                    animate={{ 
                      scale: isHovering ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                    Нет изображения
                  </div>
                )}

                {/* Пагинация (точки) поверх изображения, если изображений больше одного */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 bg-white/80 px-2 py-1 rounded-full shadow-sm">
                    {images.map((_, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0.6 }}
                        animate={{ 
                          opacity: idx === currentIndex ? 1 : 0.6,
                          scale: idx === currentIndex ? 1.2 : 1
                        }}
                        className={`w-2 h-2 rounded-full ${
                          idx === currentIndex ? 'bg-black' : 'bg-gray-400'
                        }`}
                      ></motion.span>
                    ))}
                  </div>
                )}

                {/* Кнопка быстрого добавления в корзину */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isHovering ? 1 : 0,
                    scale: isHovering ? 1 : 0.8
                  }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product.article, product.source, product.name);
                  }}
                  disabled={Number(product.stock) <= 0}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-md ${
                    Number(product.stock) > 0 
                      ? 'bg-white hover:bg-black hover:text-white' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  } transition-colors duration-300`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Информация о товаре */}
            <div className="p-4 flex flex-col justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2 group-hover:text-black transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="text-gray-400">{product.source}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2">
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {new Intl.NumberFormat('ru-RU').format(product.price)} ₽
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product.article, product.source, product.name);
                  }}
                  disabled={Number(product.stock) <= 0}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${
                    Number(product.stock) > 0 
                      ? 'bg-black hover:bg-gray-800' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {Number(product.stock) > 0 ? 'Купить' : 'Нет в наличии'}
                </motion.button>
              </div>
              
              {/* Индикатор наличия товара */}
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${Number(product.stock) > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-500">
                  {Number(product.stock) > 0 ? `В наличии: ${product.realStock || product.stock}` : 'Нет в наличии'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  // Создаем стиль сетки в зависимости от выбранного режима просмотра
  const gridStyle = useMemo(() => {
    if (viewMode === 'list') {
      return 'grid-cols-1 gap-6';
    }
    if (viewMode === 'table') {
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6';
    }
    // По умолчанию используем стиль grid
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6';
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
