import React, { useState } from 'react';
import Link from 'next/link';
import { ProductI } from '../types/interfaces';
import { toast } from 'sonner';

interface CatalogOfProductProps {
  products: ProductI[];
  viewMode: 'grid' | 'list';
}

const CatalogOfProductSearch: React.FC<CatalogOfProductProps> = ({ products, viewMode }) => {
  // Функция добавления товара в корзину
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
    <div className={`grid gap-8 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
        : 'grid-cols-1'
    }`}>
      {products.map((product) => (
        <div
          key={product._id}
          className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
            viewMode === 'list' ? 'flex gap-4' : ''
          }`}
        >
          <Link href={`/products/${product.source}/${product.article}`} passHref>
            <div className={`relative ${viewMode === 'list' ? 'w-48' : 'w-full'} aspect-square bg-[#F5F5F5]`}>
              <img
                className="w-full h-full object-contain p-4"
                src={product.imageAddress}
                alt={product.name}
                loading="lazy"
              />
              {product.isNew && (
                <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded-sm">
                  new
                </span>
              )}
            </div>
          </Link>

          <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'flex-1 justify-between' : ''}`}>
            <div>
              <Link href={`/products/${product.source}/${product.article}`}>
                <h2 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  {product.name}
                </h2>
              </Link>
              <p className="text-sm text-gray-500 mb-4">{product.source}</p>
            </div>

            <div className={`flex items-center ${viewMode === 'list' ? 'justify-between' : ''}`}>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('ru-RU').format(product.price)} ₽
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  В наличии
                </p>
              </div>
              <button
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => addToCart(product.article, product.source, product.name)}
              >
                Купить
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CatalogOfProductSearch;
