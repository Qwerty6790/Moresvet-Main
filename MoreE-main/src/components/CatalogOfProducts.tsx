import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ProductI } from '../types/interfaces';

interface CatalogOfProductsProps {
  products: ProductI[];
  viewMode: 'grid' | 'list' | 'table';
}

const getStockCount = (stock: string | number): number => {
  const match = String(stock).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export const CatalogOfProducts: React.FC<CatalogOfProductsProps> = ({ products, viewMode }) => {
  const [isInView, setIsInView] = useState<boolean[]>(new Array(products.length).fill(false));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    products.forEach((_, index) => {
      const element = document.getElementById(`product-${index}`);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setIsInView((prevState) => {
                  const newState = [...prevState];
                  newState[index] = true;
                  return newState;
                });
              }
            });
          },
          { threshold: 0.2 }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [products]);

  // Более строгая проверка URL изображения:
  const validImageRegex = /^(https?:\/\/|\/).*?\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;

  // Фильтруем товары, у которых изображение отсутствует или не соответствует требованиям
  const filteredProducts = products.filter(
    (product) =>
      product.imageAddress &&
      product.imageAddress.trim() !== '' &&
      validImageRegex.test(product.imageAddress)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {filteredProducts.map((product, index) => {
        const stockCount = getStockCount(product.stock);
        const encodedArticle = product.article.replace(/\//g, '%2F');
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={product._id}
            id={`product-${index}`}
            className={`group relative bg-white rounded-none overflow-hidden transition-all duration-300 ${
              isInView[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="absolute top-4 left-4 z-10">
              {product.isNew && (
                <span className="bg-black text-white text-xs px-2 py-1 rounded-sm">new</span>
              )}
            </div>

            <Link href={`/products/${product.source}/${encodedArticle}`} passHref>
              <div className="relative w-full aspect-square bg-[#F5F5F5] overflow-hidden">
                {isInView[index] ? (
                  <img
                    className="w-full h-full object-contain transform transition-transform duration-300 group-hover:scale-105 p-6"
                    src={`${product.imageAddress}?q=75&width=400&height=400&fit=scale`}
                    alt={product.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                    <span className="text-sm text-gray-400">Загрузка...</span>
                  </div>
                )}
              </div>
            </Link>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('ru-RU').format(parseFloat(String(product.price)))} ₽
                </p>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    stockCount === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                  onClick={() =>
                    stockCount > 0 && addToCart(product.article, product.source, product.name)
                  }
                  disabled={stockCount === 0}
                >
                  Купить
                </button>
              </div>

              <h2 className="text-sm text-gray-900 line-clamp-2 min-h-[2.5rem]">
                {product.name}
              </h2>

              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-500">{product.source}</p>
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      stockCount > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className={`${stockCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stockCount > 0 ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
