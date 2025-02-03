import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ProductI } from '../types/interfaces';

interface CatalogOfProductsProps {
  products: ProductI[];
  viewMode: 'grid' | 'list';
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {products
        .filter((product) => getStockCount(product.stock) > 0)
        .map((product, index) => {
          const stockCount = getStockCount(product.stock);
          const encodedArticle = product.article.replace(/\//g, '%2F');
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={product._id}
              id={`product-${index}`}
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                isInView[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <Link href={`/products/${product.source}/${encodedArticle}`} passHref>
                <div className="relative w-full h-64 p-4 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                  {isInView[index] ? (
                    <img
                      className="w-full h-full object-contain transform transition-transform duration-300 group-hover:scale-105"
                      src={`${product.imageAddress}?q=50&width=300&height=300&fit=scale`}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-400">Загрузка...</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-6 space-y-4">
                <h2 className="text-lg font-medium text-gray-800 line-clamp-2 leading-tight min-h-[3rem]">
                  {product.name}
                </h2>

                <div className="inline-block bg-neutral-100 px-4 py-2 rounded-full">
                  <p className="font-bold text-2xl text-neutral-800">
                    {new Intl.NumberFormat('ru-RU').format(parseFloat(String(product.price)))} ₽
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${stockCount > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-sm ${stockCount > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      {stockCount > 0 ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </div>

                  <button
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform
                      ${stockCount === 0 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-neutral-800 text-white hover:bg-neutral-700 active:scale-95 hover:shadow-lg'
                      }`}
                    onClick={() => stockCount > 0 && addToCart(product.article, product.source, product.name)}
                    disabled={stockCount === 0}
                  >
                    Купить
                  </button>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};
