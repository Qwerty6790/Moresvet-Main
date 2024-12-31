import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ProductI } from '../../../types/interfaces'; // Импорт интерфейса ProductI

interface CatalogOfProductsProps {
  products: ProductI[];
}

const getStockCount = (stock: string): number => {
  const match = stock.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export const CatalogOfKinkLight: React.FC<CatalogOfProductsProps> = ({ products }) => {

  const addToCart = (article: string, source: string, name: string) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    const existingProductIndex = cart.products.findIndex((item: any) => item.article === article);

    if (existingProductIndex > -1) {
      cart.products[existingProductIndex].quantity += 1;
    } else {
      cart.products.push({ article, source, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Товар добавлен в корзину');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-4">
      {products
        .filter((product) => getStockCount(product.stock) > 0) // Фильтруем товары с нулевым остатком
        .map((product) => {
          const stockCount = getStockCount(product.stock);
          const stockClass = stockCount > 0 ? 'text-green-500' : 'text-red-500';

          // Заменяем слэш на %2F в артикуле
          const encodedArticle = product.article.replace(/\//g, '%2F');

          return (
            <div key={product._id} className="relative  transition duration-500 cursor-pointer hover:shadow-lg bg-white rounded-lg overflow-hidden">
              <Link href={`/products/${product.source}/${encodedArticle}`} passHref>
                <div className="relative w-full h-40 sm:h-full md:h-full">
                  {product.imageAddress ? (
                    <img
                      className="w-full h-full object-cover"
                      src={product.imageAddress}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                      <span className="absolute text-white text-lg font-semibold">Изображение отсутствует</span>
                      <div className="absolute top-2 left-2 text-white text-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 3v3m-3-6h6M12 3c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4 bg-white">
                <h2 className="text-black hidden text-lg font-semibold truncate">{product.name}</h2>
                <p className="font-bold text-black text-xl mt-2">{product.price} ₽</p>
                <div className="flex justify-between items-center mt-3">
                  <div className={`text-sm  hidden items-center space-x-2 ${stockClass}`}>
                  <svg
  xmlns="http://www.w3.org/2000/svg"
  fill="currentColor"
  viewBox="0 0 24 24"
  stroke="none"
  className={`w-6 h-6 ${stockCount > 0 ? 'text-green-500' : 'text-red-500'} rounded-full `}
>
  <circle cx="12" cy="12" r="10" />
</svg>

                    <p className="text-black hidden">Остаток: {stockCount} шт.</p>
                    {/* Add Kinklight label next to the stock count */}
                    
                  </div>
                  <button
                    className={`border transition hidden duration-500 py-2 rounded-md w-full ${stockCount === 0 ? 'bg-white text-neutral-600 cursor-not-allowed' : 'hover:bg-neutral-500 hover:text-white'}`}
                    onClick={() => {
                      if (stockCount > 0) {
                        addToCart(product.article, product.source, product.name); // Pass the product name
                      }
                    }}
                    disabled={stockCount === 0}
                  >
                    <p className="text-black  text-xs text-center">Купить</p>
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
