import React, { useState } from 'react';
import Link from 'next/link';
import { ProductI } from '@/types/interfaces';

interface CatalogOfProductsProps {
  products: ProductI[];
  viewMode: 'grid' | 'list' | 'table';
}

const getMainImage = (product: ProductI): string | null => {
  if (typeof product.imageAddresses === 'string') {
    return product.imageAddresses;
  } else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) {
    return product.imageAddresses[0];
  } else if (typeof product.imageAddress === 'string') {
    return product.imageAddress;
  } else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) {
    return product.imageAddress[0];
  }
  return null;
};

const ProductCard: React.FC<{ product: ProductI }> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const mainImage = getMainImage(product);

  const addToCart = (article: string, source: string, name: string) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    const existingProductIndex = cart.products.findIndex((item: any) => item.article === article);
    if (existingProductIndex > -1) {
      cart.products[existingProductIndex].quantity += 1;
    } else {
      cart.products.push({ article, source, name, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  return (
    <div 
      className="overflow-hidden h-full "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`}>
        <div className="relative h-full flex flex-col">
          {/* Image container */}
          <div className=" flex items-center justify-center p-4 aspect-square relative">
            {mainImage && (
              <img
                src={`${mainImage}?q=75&w=300`}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply"
                loading="lazy"
              />
            )}
            
            {/* Quick view button on hover */}
            {isHovered && (
              <div className="absolute inset-0 flex items-end justify-center pb-4">
                <span className="bg-black text-white text-xs px-4 py-2">
                  Быстрый просмотр
                </span>
              </div>
            )}
          </div>
          
          {/* Product info */}
          <div className="p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm text-black mb-1 line-clamp-2 min-h-[40px]">{product.name}</h3>
              
              <div className="mb-2">
                <span className="text-xs text-gray-500">Арт: {product.article}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${Number(product.stock) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  В наличии: {product.stock || 0} шт.
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-black">
                  {Intl.NumberFormat('ru-RU').format(product.price)} ₽
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product.article, product.source, product.name);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-none transition-colors ${Number(product.stock) > 0 ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  disabled={Number(product.stock) <= 0}
                >
                  {Number(product.stock) > 0 ? 'В корзину' : 'Нет в наличии'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export const CatalogOfProductsMaytoni: React.FC<CatalogOfProductsProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };
  
  const prevPage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  const currentProducts = products.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        {/* Заголовок с навигацией */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-normal text-black">Новинки коллекции</h2>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={prevPage}
              className="w-10 h-10 flex items-center justify-center border border-gray-200 text-black"
              disabled={totalPages <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextPage}
              className="w-10 h-10 flex items-center justify-center border border-gray-200 text-black"
              disabled={totalPages <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Сетка товаров */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {currentProducts.map((product, index) => (
            <ProductCard key={`${product.article}-${index}`} product={product} />
          ))}
        </div>
        
        {/* Пагинация для мобильных устройств */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 md:hidden">
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    currentIndex === index ? 'bg-black' : 'bg-gray-300'
                  }`}
                  aria-label={`Страница ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogOfProductsMaytoni;
