import React from 'react';
import Link from 'next/link';
import { ProductI } from '@/types/interfaces';

interface CatalogOfProductsProps {
  products: ProductI[];
  viewMode: 'grid' | 'list' | 'table';
}

const ProductCard: React.FC<{ product: ProductI }> = ({ product }) => {
  const images = (() => {
    if (typeof product.imageAddresses === 'string') {
      return [product.imageAddresses];
    } else if (Array.isArray(product.imageAddresses)) {
      return product.imageAddresses;
    } else if (typeof product.imageAddress === 'string') {
      return [product.imageAddress];
    } else if (Array.isArray(product.imageAddress)) {
      return product.imageAddress;
    }
    return [];
  })();

  // Используем только первое изображение
  const mainImage = images[0];

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
    <div className="group">
      <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`}>
        <div className="relative mb-4">
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            <div className="bg-white rounded-full px-3 py-1 text-xs shadow-sm">new</div>
          </div>

          <div className="aspect-square bg-[#f8f8f8] flex items-center justify-center p-4 relative">
            {mainImage && (
              <img
                src={`${mainImage}?q=75&w=400`}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply"
                loading="lazy"
              />
            )}
          </div>
        </div>

        <div className="mt-1 flex flex-col justify-between h-20">
          <h3 className="text-[8px] leading-tight font-normal text-black/90 min-h-[40px]">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(product.article, product.source, product.name);
              }}
              disabled={Number(product.stock) <= 0}
              className={`px-4 py-2 mt-2 text-white text-sm font-medium transition ${
                Number(product.stock) > 0 ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Купить
            </button>
            <span className="text-xl font-bold text-black">
              {Intl.NumberFormat('ru-RU').format(product.price)} ₽
            </span>
            <div className={`w-3 h-3 rounded-full ${Number(product.stock) > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">Остаток: {product.realStock}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export const CatalogOfProducts: React.FC<CatalogOfProductsProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default CatalogOfProducts;
