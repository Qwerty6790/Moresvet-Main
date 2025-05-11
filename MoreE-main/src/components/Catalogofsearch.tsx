import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ProductI } from '../types/interfaces';
import { toast } from 'sonner';

interface CatalogOfProductProps {
  products: ProductI[];
  viewMode: 'grid' | 'list' | 'table';
  isLoading?: boolean;
}

// Константы для оптимизации изображений
const IMAGE_FORMATS = {
  WEBP: 'webp',
  JPG: 'jpg',
  PNG: 'png',
};

// Размеры для изображений
const IMAGE_SIZES = {
  SMALL_LCP: 50,
  THUMBNAIL: 40,
  SMALL: 80,
  MEDIUM: 100,
  D_ARTICLE_SIZE: 65,
};

// Функция нормализации URL
const normalizeUrl = (originalUrl: string, isLCPCandidate: boolean = false): string | null => {
  if (!originalUrl) return null;

  // Проверяем и конвертируем HTTP на HTTPS для предотвращения mixed content
  let url = originalUrl;
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }

  return url;
};

// Упрощенный компонент для изображений
const SafeOptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  isLCP?: boolean;
  width?: number;
  height?: number;
}> = React.memo(({ src, alt, className, priority = false, isLCP = false, width, height }) => {
  const [error, setError] = useState(false);

  const handleError = useCallback(() => { setError(true); }, []);

  const aspectRatioStyle = width && height ? { aspectRatio: `${width}/${height}` } : undefined;
  const sizeStyle = width && height ? { width: `${width}px`, height: `${height}px` } : undefined;

  // Placeholder
  if (!src || error) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-100 ${className || ''} block`}
        style={{ ...aspectRatioStyle, ...sizeStyle }}
      ></div>
    );
  }

  // Основное изображение
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-contain ${className || ''}`}
      onError={handleError}
      decoding="async"
      loading={isLCP || priority ? "eager" : "lazy"}
      fetchPriority={isLCP ? "high" : "auto"}
      width={width}
      height={height}
      style={aspectRatioStyle}
    />
  );
});
SafeOptimizedImage.displayName = 'SafeOptimizedImage';

const CatalogOfProductSearch: React.FC<CatalogOfProductProps> = ({
  products,
  viewMode,
  isLoading = false,
}) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const validProducts: ProductI[] = [];
    const uniqueKeys = new Set<string>();
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product) continue;
      const stockValue = Number(product.stock);
      if (isNaN(stockValue) || stockValue <= 0) continue;
      if (!product.name || !product.article || !product.source) continue;
      const key = product._id || product.article;
      if (!key || uniqueKeys.has(key)) continue;
      
      validProducts.push(product);
      uniqueKeys.add(key);
    }
    
    return validProducts;
  }, [products]);

  // Компонент для табличного отображения
  const TableView = useCallback(() => { 
    if (!filteredProducts || filteredProducts.length === 0) return null;

    return (
      <div className="w-full overflow-x-auto text-white">
        <table className="min-w-full text-white">
          <thead>
            <tr>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Фото</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Название</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider hidden sm:table-cell">Артикул</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Цена</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              if (!product) return null;

              let originalUrl: string | null = null;
              if (typeof product.imageAddresses === 'string') originalUrl = product.imageAddresses;
              else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) originalUrl = product.imageAddresses[0];
              else if (typeof product.imageAddress === 'string') originalUrl = product.imageAddress;
              else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) originalUrl = product.imageAddress[0];

              const mainImage = originalUrl ? normalizeUrl(originalUrl) : null;
              const isPurchasable = Number(product.stock) > 0;

              return (
                <tr key={`table-${product._id || ''}-${product.article}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center ${product.article?.toString().startsWith('D') ? 'p-1' : ''}`}>
                      {mainImage ? (
                        <img 
                          src={mainImage} 
                          alt={product.name || 'Товар'} 
                          className={`h-full w-full ${product.article?.toString().startsWith('D') ? 'object-contain scale-90' : 'object-contain'}`} 
                          loading="lazy" 
                        />
                      ) : (
                        <span className="text-white text-[8px] sm:text-xs">Нет фото</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="text-xs sm:text-sm font-medium text-white hover:text-red-400 hover:underline truncate block max-w-[120px] sm:max-w-[200px]">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-2 py-2 hidden sm:table-cell"><span className="text-xs text-white">{product.article}</span></td>
                  <td className="px-2 py-2">
                    {product.price > 0 ? (
                      <span className="text-xs sm:text-sm font-medium">{product.price} ₽</span>
                    ) : null}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        if (!isPurchasable) return;
                        try {
                          const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
                          const idx = cart.products.findIndex((item: any) => item.article === product.article);
                          if (idx > -1) cart.products[idx].quantity += 1;
                          else cart.products.push({ article: product.article, source: product.source, name: product.name || 'Товар', quantity: 1, imageUrl: mainImage });
                          localStorage.setItem('cart', JSON.stringify(cart));
                          toast.success('Товар добавлен');
                        } catch (err) { console.error('Ошибка добавления в корзину (table):', err); toast.error('Ошибка'); }
                      }}
                      className={`text-[10px] sm:text-xs py-1 px-1 sm:px-2 rounded ${isPurchasable ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-white cursor-not-allowed'}`}
                      disabled={!isPurchasable}
                    >
                      В корзину
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }, [filteredProducts]);

  // Компонент карточки товара (Grid View)
  const ProductCard = useCallback(({ product, index }: { product: ProductI, index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [shouldLoad, setShouldLoad] = useState(index < 3);
    const isLCPCandidate = index < 3; 
    const isFirstProduct = index === 0;
    const [quantity, setQuantity] = useState(1);

    // Мемоизация URL изображения
    const targetImageSrc = useMemo(() => {
      if (!product) return null;
      let originalUrl: string | null = null;
      if (typeof product.imageAddresses === 'string') originalUrl = product.imageAddresses;
      else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) originalUrl = product.imageAddresses[0];
      else if (typeof product.imageAddress === 'string') originalUrl = product.imageAddress;
      else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) originalUrl = product.imageAddress[0];
      
      if (originalUrl) {
         return normalizeUrl(originalUrl, isLCPCandidate);
      }
      return null;
    }, [product, isLCPCandidate]);

    const isPurchasable = useMemo(() => product ? Number(product.stock) > 0 : false, [product]);

    // Observer для отложенной загрузки (ТОЛЬКО для НЕ-LCP)
    useEffect(() => {
      if (isLCPCandidate || shouldLoad || !cardRef.current) return;
      
      const observer = new IntersectionObserver(([entry]) => { 
        if (entry.isIntersecting) { 
          setShouldLoad(true); 
          observer.disconnect(); 
        }
      }, { rootMargin: '500px', threshold: 0.01 }); 
      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }, [shouldLoad, isLCPCandidate]); 

    // Обработчики для увеличения и уменьшения количества
    const handleIncrement = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isPurchasable) return;
      setQuantity(prev => prev + 1);
    }, [isPurchasable]);

    const handleDecrement = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isPurchasable) return;
      setQuantity(prev => Math.max(1, prev - 1));
    }, [isPurchasable]);

    const handleAddToCart = useCallback((e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (!isPurchasable || !product) return;
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        const idx = cart.products.findIndex((item: any) => item.article === product.article);
        if (idx > -1) cart.products[idx].quantity += quantity;
        else cart.products.push({ article: product.article, source: product.source, name: product.name || 'Товар', quantity, imageUrl: targetImageSrc });
        localStorage.setItem('cart', JSON.stringify(cart));
        toast.success(`Добавлено: ${quantity} шт.`);
        setQuantity(1);
      } catch (err) { console.error('Ошибка добавления в корзину (grid):', err); toast.error('Ошибка'); }
    }, [product, targetImageSrc, isPurchasable, quantity]); 

    if (!product) return null;
    
    const finalImageSrc = targetImageSrc;
    
    return (
      <div 
        ref={!isLCPCandidate ? cardRef : undefined}
        className="group bg-[#1a1a1a] text-white rounded-xl border border-zinc-800 flex flex-col h-full overflow-hidden transition-all duration-300 hover:border-red-600 hover:shadow-lg hover:shadow-red-900/20"
      >
        <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="flex flex-col h-full" prefetch={false}>
          {/* Контейнер изображения (белый фон для контраста с темной карточкой) */}
          <div 
            className={`relative w-full aspect-square overflow-hidden flex items-center justify-center rounded-t-lg ${product.article?.toString().startsWith('D') ? 'p-3 sm:p-4' : ''}`} 
          >
            {/* Логика рендера изображения (LCP vs non-LCP) */}
            {isLCPCandidate ? (
              // LCP Изображение
              finalImageSrc ? (
                <img
                  src={finalImageSrc}
                  alt={product.name || 'Товар'}
                  className={`w-full h-full ${product.article?.toString().startsWith('D') ? 'object-contain scale-90' : 'object-contain'} ${isFirstProduct ? 'first-product-img' : ''}`}
                  loading="eager"
                  fetchPriority="high"
                  decoding={isFirstProduct ? "sync" : "async"}
                  width={product.article?.toString().startsWith('D') ? IMAGE_SIZES.D_ARTICLE_SIZE : (isFirstProduct ? IMAGE_SIZES.SMALL_LCP : IMAGE_SIZES.SMALL_LCP)}
                  height={product.article?.toString().startsWith('D') ? IMAGE_SIZES.D_ARTICLE_SIZE : (isFirstProduct ? IMAGE_SIZES.SMALL_LCP : IMAGE_SIZES.SMALL_LCP)}
                  style={{ display: 'block' }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 animate-pulse"></div>
              )
            ) : (
              // Non-LCP Изображение
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundSize: product.article?.toString().startsWith('D') ? '85%' : 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundImage: (shouldLoad && finalImageSrc) ? `url('${finalImageSrc.replace(/'/g, "\'")}')` : 'none',
                  backgroundColor: (shouldLoad && finalImageSrc) ? 'transparent' : '#f3f4f6'
                }}
                className={`transition-opacity duration-300 ${!shouldLoad || !finalImageSrc ? 'opacity-0 animate-pulse' : 'opacity-100'}`}
                role="img"
                aria-label={product.name || 'Товар'}
              > 
                {(!shouldLoad || !finalImageSrc) && <div style={{ aspectRatio: '1 / 1' }} className="w-full h-auto bg-gray-100"></div>}
              </div>
            )}
            
            {/* Маркер новинки или скидки */}
            {product.isNew && (
              <div className="absolute top-2 left-2 bg-red-800 text-white text-xs px-2 py-1 rounded-md font-medium">
                Новинка
              </div>
            )}
          </div>
          
          {/* Текстовый контент */}
          <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <div className="flex flex-wrap items-center gap-1 mb-2">
              {/* Индикатор наличия */}
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isPurchasable ? 'bg-green-500' : 'bg-red-800'}`}></div>
                <span className="text-xs text-gray-300">{isPurchasable ? 'В наличии' : 'Нет в наличии'}</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-white line-clamp-2 product-name group-hover:text-red-400 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-white mb-3">Арт: {product.article}</p>
            
            {/* Цена и кнопка */}
            <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-zinc-700">
              {/* Цена */}
              {product.price > 0 ? (
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-white price-text whitespace-nowrap">{product.price} ₽</p>
                  
                  {/* Блок с количеством */}
                  <div className="flex items-center">
                    <button 
                      onClick={handleDecrement}
                      disabled={!isPurchasable || quantity <= 1}
                      className={`w-8 h-8 flex items-center justify-center rounded-l-md ${isPurchasable ? 'bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600' : 'bg-zinc-900 text-gray-500 cursor-not-allowed'}`}
                      aria-label="Уменьшить"
                    >
                      <span className="text-lg font-bold">-</span>
                    </button>
                    <div className="w-10 h-8 flex items-center justify-center bg-zinc-800 text-white">
                      {quantity}
                    </div>
                    <button 
                      onClick={handleIncrement}
                      disabled={!isPurchasable}
                      className={`w-8 h-8 flex items-center justify-center rounded-r-md ${isPurchasable ? 'bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600' : 'bg-zinc-900 text-gray-500 cursor-not-allowed'}`}
                      aria-label="Увеличить"
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>
              ) : null}
              
              {/* Кнопка для добавления в корзину */}
              <button 
                onClick={handleAddToCart} 
                className={`relative w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md text-white cart-button transition-all duration-200 overflow-hidden group/btn ${isPurchasable ? 'bg-[#812626] hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md' : 'bg-gray-700 text-gray-300 cursor-not-allowed'}`}
                disabled={!isPurchasable} 
                title={isPurchasable ? "Добавить в корзину" : "Нет в наличии"}
              >
                <span className="relative z-10">В корзину</span>
                {/* Эффект при наведении */} 
                {isPurchasable && (
                  <span className="absolute inset-0 bg-white/10 transform scale-0 origin-center transition-transform duration-300 group-hover/btn:scale-100 rounded-md"></span>
                )}
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }, []);

  // Теперь условный рендер
  if (isLoading || !isClient) {
    if (viewMode === 'grid' && !isLoading) {
      return (
        <div className="grid auto-rows-auto w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-3 xl:grid-cols-4 xl:gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-black rounded-lg border border-zinc-800 flex flex-col h-full">
              <div className="relative aspect-square bg-zinc-800 animate-pulse rounded-t-lg min-h-[150px] sm:min-h-[180px]"></div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2 animate-pulse min-h-[1rem]"></div>
                <div className="h-3 bg-zinc-700 rounded w-1/2 mb-3 animate-pulse min-h-[0.75rem]"></div>
                <div className="mt-auto flex items-start justify-between gap-2 pt-3 border-t border-zinc-700">
                  <div className="h-5 bg-zinc-700 rounded w-1/3 animate-pulse min-h-[1.25rem]"></div>
                  <div className="h-10 bg-red-900/50 rounded w-1/2 animate-pulse min-h-[2.5rem]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {/* Основной контент */}
      {viewMode === 'table' ? (
        <TableView />
      ) : (
        <div className="grid w-full grid-cols-1 gap-2 xs:grid-cols-2 sm:gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-3 xl:grid-cols-4 xl:gap-3">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={`grid-${product._id || ''}-${product.article}`}
              product={product}
              index={index}
            />
          ))}
          
          {/* Добавляем пустые div-элементы для заполнения строки, чтобы товары выравнивались по сетке */}
          {(() => {
            const columnsCount = (() => {
              if (typeof window !== 'undefined') {
                if (window.innerWidth >= 1280) return 4; // xl: 4 колонки
                if (window.innerWidth >= 1024) return 4; // lg: 4 колонки
                if (window.innerWidth >= 768) return 3; // md: 3 колонки
                if (window.innerWidth >= 576) return 2; // sm: 2 колонки
                return 1; // xs: 1 колонка
              }
              return 4; // По умолчанию для SSR
            })();
            
            const remainder = filteredProducts.length % columnsCount;
            if (remainder === 0) return null; // Строка уже полная
            
            const emptySlots = columnsCount - remainder;
            
            return Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`empty-${i}`} className="hidden xs:block"></div>
            ));
          })()}
          
          {/* Сообщение "Товары не найдены" */}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-8 sm:py-12 text-center bg-black border border-zinc-800 rounded-lg">
              <svg className="mx-auto h-10 w-10 text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-xs sm:text-sm font-medium text-white">Товары не найдены</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-400">Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CatalogOfProductSearch;