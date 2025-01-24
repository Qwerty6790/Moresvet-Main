import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ProductI } from '../../../types/interfaces'; // Importing ProductI interface

interface CatalogOfProductsProps {
  products: ProductI[];
}

const getStockCount = (stock: string): number => {
  const match = stock.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export const CatalogOfLightStar: React.FC<CatalogOfProductsProps> = ({ products }) => {
  const [isInView, setIsInView] = useState<boolean[]>([]);

  useEffect(() => {
    const initialViewStates = products.map(() => false);
    setIsInView(initialViewStates);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.id.replace('product-', ''), 10);
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

    const items = document.querySelectorAll('[id^="product-"]');
    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [products]);

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-5">
      {products
        .filter((product) => getStockCount(product.stock) > 0) // Filter products with stock available
        .map((product, index) => {
          const stockCount = getStockCount(product.stock);
          const stockClass = stockCount > 0 ? 'text-green-500' : 'text-red-500';

          // Encode article to handle special characters
          const encodedArticle = product.article.replace(/\//g, '%2F');

          return (
            <div
              key={product._id}
              id={`product-${index}`}
              className={`relative  transition-opacity duration-500 rounded-lg overflow-hidden transform ${
                isInView[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <Link href={`/products/${product.source}/${encodedArticle}`} passHref>
                <div className="relative w-full h-48 sm:h-56 md:h-64">
                  {isInView[index] ? (
                    <img
                      className="w-full h-full object-contain"
                      src={`${product.imageAddress}?q=50&width=300&height=300&fit=scale`} // Optimize image size and quality
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm text-gray-500">Загрузка...</span>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4 bg-white">
                <h2 className="text-black text-sm font-semibold truncate">{product.name}</h2>
                <p className="font-bold text-black text-2xl mt-1">{product.price} ₽</p>
                <div className="flex justify-between items-center mt-4">
                  <div className={`text-sm ${stockClass}`}>
                    {stockCount > 0 ? <p className="text-green-700">В наличии</p> : <p>Нет в наличии</p>}
                  </div>
                  <button
                    className={`border bg-neutral-700 text-white transition duration-500 p-3 rounded-md w-24 ${
                      stockCount === 0 ? 'cursor-not-allowed' : 'hover:bg-neutral-500'
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

export type { ProductI };
