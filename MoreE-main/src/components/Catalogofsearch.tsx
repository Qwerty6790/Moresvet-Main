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

    const handleAddToCart = useCallback((e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (!isPurchasable || !product) return;
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        const idx = cart.products.findIndex((item: any) => item.article === product.article);
        if (idx > -1) cart.products[idx].quantity += 1;
        else cart.products.push({ article: product.article, source: product.source, name: product.name || 'Товар', quantity: 1, imageUrl: targetImageSrc });
        localStorage.setItem('cart', JSON.stringify(cart));
        toast.success('Товар добавлен');
      } catch (err) { console.error('Ошибка добавления в корзину (grid):', err); toast.error('Ошибка'); }
    }, [product, targetImageSrc, isPurchasable]); 

    if (!product) return null;
    
    const finalImageSrc = targetImageSrc;
    
    return (
      <div 
        ref={!isLCPCandidate ? cardRef : undefined}
        className="group bg-white text-black flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg"
      >
        <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="flex flex-col h-full" prefetch={false}>
          {/* Контейнер изображения */}
          <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center">
            {/* Логика рендера изображения (LCP vs non-LCP) */}
            {isLCPCandidate ? (
              // LCP Изображение
              finalImageSrc ? (
                <img
                  src={finalImageSrc}
                  alt={product.name || 'Товар'}
                  className="w-full h-full object-contain p-3"
                  loading="eager"
                  fetchPriority="high"
                  decoding={isFirstProduct ? "sync" : "async"}
                  style={{ display: 'block' }}
                />
              ) : (
                <div className="w-full h-full bg-gray-50 animate-pulse"></div>
              )
            ) : (
              // Non-LCP Изображение
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundImage: (shouldLoad && finalImageSrc) ? `url('${finalImageSrc.replace(/'/g, "\'")}')` : 'none',
                  backgroundColor: 'white',
                  padding: '12px'
                }}
                className={`transition-opacity duration-300 ${!shouldLoad || !finalImageSrc ? 'opacity-0 animate-pulse' : 'opacity-100'}`}
                role="img"
                aria-label={product.name || 'Товар'}
              > 
                {(!shouldLoad || !finalImageSrc) && <div style={{ aspectRatio: '1 / 1' }} className="w-full h-auto bg-gray-50"></div>}
              </div>
            )}
            
            {/* Маркер новинки */}
            {product.isNew && (
              <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 font-medium">
                NEW
              </div>
            )}
          </div>
          
          {/* Текстовый контент */}
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-sm text-black font-medium mb-1 line-clamp-2 transition-colors">
              {product.name}
            </h3>
            
            <p className="text-xs text-gray-600 mb-2">{product.article}</p>
            
            {/* Блок с ценой */}
            {product.price > 0 && (
              <div className="mt-auto flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-black">{product.price} ₽</p>
                  
                  <button 
                    onClick={handleAddToCart} 
                    className={`relative flex items-center justify-center p-2 rounded-full ${isPurchasable ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    disabled={!isPurchasable}
                    title={isPurchasable ? "Добавить в корзину" : "Нет в наличии"}
                    aria-label="Добавить в корзину"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
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
            <div key={i} className="bg-white flex flex-col h-full">
              <div className="relative aspect-square bg-gray-50 animate-pulse min-h-[150px] sm:min-h-[180px]"></div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse min-h-[1rem]"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-3 animate-pulse min-h-[0.75rem]"></div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="h-5 bg-gray-100 rounded w-1/3 animate-pulse min-h-[1.25rem]"></div>
                  <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse"></div>
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