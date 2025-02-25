import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ProductI } from '../types/interfaces';
import { toast } from 'sonner';

interface CatalogOfProductProps {
  products: ProductI[];
  viewMode: 'grid' | 'list';
}

// Функция нормализации URL: если протокол страницы https и URL начинается с http://,
// заменяем его на https://
const normalizeUrl = (url: string): string => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

const CatalogOfProductSearch: React.FC<CatalogOfProductProps> = ({ products, viewMode }) => {
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

  // Компонент карточки товара с логикой отображения фотографий, как в CatalogOfProducts
  const ProductCard: React.FC<{ product: ProductI; index: number }> = ({ product }) => {
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
    };

    return (
      <div className="group bg-white rounded-xl p-4 transition-shadow hover:shadow-lg">
        <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`}>
          <div>
            <div className="relative mb-4">
              {/* Бейджи */}
              <div className="absolute top-3 left-3 flex gap-2 z-10">
                <div className="bg-white rounded-full px-3 py-1 text-xs shadow-sm">new</div>
              </div>

              {/* Контейнер изображения с hover-эффектом */}
              <div
                className="aspect-square bg-[#f8f8f8] flex items-center justify-center p-4 relative"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {images.length > 0 && !mainImageError ? (
                  <img
                    src={`${images[currentIndex]}?q=75&w=400`}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    loading="lazy"
                    onError={() => setMainImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    Нет изображения
                  </div>
                )}

                {/* Пагинация (точки) поверх изображения, если изображений больше одного */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
                      ></span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Миниатюры для выбора изображения */}
            {images.length > 1 && (
              <div className="flex space-x-2">
                {images.map((img, idx) => {
                  if (failedThumbnailIndices.includes(idx)) return null;
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentIndex(idx);
                        setMainImageError(false);
                      }}
                      className={`flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden ${
                        currentIndex === idx ? 'ring-2 ring-black' : 'opacity-50'
                      }`}
                    >
                      <img
                        src={`${img}?q=75&w=100`}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => setFailedThumbnailIndices((prev) => [...prev, idx])}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Информация о товаре */}
            <div className="mt-2 flex flex-col justify-between h-20">
              <h3 className="text-[15px] leading-tight font-normal text-black/90 min-h-[40px]">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product.article, product.source, product.name);
                  }}
                  disabled={Number(product.stock) <= 0}
                  className={`px-4 py-2 mt-2 text-white text-sm font-medium rounded-lg transition ${
                    Number(product.stock) > 0 ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Купить
                </button>
                <span className="text-xl font-bold text-black">
                  {new Intl.NumberFormat('ru-RU').format(product.price)} ₽
                </span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    Number(product.stock) > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600">Остаток: {product.realStock}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`grid gap-6 ${
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-1'
      }`}
    >
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} />
      ))}
    </div>
  );
};

export default CatalogOfProductSearch;
