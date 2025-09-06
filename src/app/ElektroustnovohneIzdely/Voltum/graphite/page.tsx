'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/catalogofsearch';
import CriticalPreloader from '@/components/CriticalPreloader';
import LoadingSpinner from '@/components/LoadingSpinner';
import PaginationComponents from '@/components/PaginationComponents';
import { fetchProductsOptimized, filterProducts, paginateProducts, preloadCriticalImages } from '@/utils/api';

export default function VoltumGraphitePage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const itemsPerPage = 12;

  const [allProducts, setAllProducts] = useState<ProductI[]>([]);

  // Мемоизированные вычисления
  const filteredProducts = useMemo(() => {
    return filterProducts(allProducts, (product: any) => {
      const category = product.category?.toLowerCase() || '';
      const name = product.name?.toLowerCase() || '';
      
      // Быстрая проверка на графит
      const hasGraphite = category.includes('графит') || 
                         name.includes('графит') ||
                         name.includes('graphite');
      
      // Исключаем хром
      const notChrome = !category.includes('хром') && !name.includes('хром');
      
      const isMatch = hasGraphite && notChrome;
      
      // Логируем только подходящие товары
      if (isMatch) {
        console.log(`[Voltum Graphite] НАЙДЕН: "${product.name}"`);
      }
      
      return isMatch;
    });
  }, [allProducts]);

  const paginatedProducts = useMemo(() => {
    return paginateProducts(filteredProducts, currentPage, itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Оптимизированная загрузка с поиском по ключевым словам
      const products = await fetchProductsOptimized('Voltum', { 
        source: 'Voltum',
        name: 'графит',
        include_name: 'графит,graphite'
      });
      setAllProducts(Array.isArray(products) ? products : []);
      
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setProducts(paginatedProducts);
    setTotalProducts(filteredProducts.length);
    setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    
    // Логируем результаты
    console.log(`✅ Найдено товаров Voltum Graphite: ${filteredProducts.length}`);
    if (filteredProducts.length > 0) {
      console.log('Найденные товары:', filteredProducts.map((p: any) => ({
        name: p.name,
        article: p.article
      })));
    } else {
      console.log('❌ Товары Voltum Graphite не найдены');
    }
    
    // Принудительная предзагрузка критических изображений
    if (filteredProducts.length > 0) {
      preloadCriticalImages(filteredProducts);
    }
  }, [paginatedProducts, filteredProducts.length, itemsPerPage, filteredProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Прокручиваем вверх при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      {/* Принудительная предзагрузка критических изображений */}
      <CriticalPreloader products={filteredProducts} />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 mb-48" style={{ maxWidth: '88rem' }}>
       
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '88rem' }}>
        <div className="mb-8">
          <h2 className="text-5xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">Графит</h2>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm sm:text-base text-white">
          <Link href="/" className="hover:text-white transition-colors">Главная</Link>
          <span>/</span>
          <Link href="/ElektroustnovohneIzdely" className="hover:text-white transition-colors">Электроустановочные изделия</Link>
          <span>/</span>
          <Link href="/ElektroustnovohneIzdely/Voltum" className="hover:text-white transition-colors">Voltum</Link>
          <span>/</span>
          <span className="text-white">Графит</span>
        </nav>
        </div>

        <div className="mb-8">
          { loading ? (
  <LoadingSpinner isLoading={loading} />
) : products.length > 0 ? (
            <CatalogOfProductSearch products={products} viewMode={viewMode} isLoading={loading} />
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-lg mb-4">Товары не найдены</div>
            </div>
          )}
        </div>

        
{ /* pagination */ }
<PaginationComponents
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isLoading={loading}
          totalItems={totalProducts}
          itemsPerPage={40}
        />
           
          </div>
      </div>
  
  );
} 
