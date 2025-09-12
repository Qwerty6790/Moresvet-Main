﻿'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import LoadingSpinner from '@/components/LoadingSpinner';
import PaginationComponents from '@/components/PaginationComponents';
import { NEXT_PUBLIC_API_URL } from '@/utils/constants';

export default function ChampagneCorrugatedPage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [allFilteredProducts, setAllFilteredProducts] = useState<ProductI[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        source: 'Werkel',
        page: 1,
        limit: 1000
      };

      const apiUrl = NEXT_PUBLIC_API_URL;
      const { data } = await axios.get(`${apiUrl}/api/products/Werkel`, { params });

      if (data && data.products) {
        const targetProductNames = [
          'Выключатель',
          'Розетка',
          'Встраиваемая',
          'ТВ-розетка',
          'Диммер',
          'Переключатель',
          'Акустическая розетка',
          'Кнопка',
          'Датчик движения',
          'Телефонная розетка',
          'Заглушка',
          'Кабельный выход',
        ];

        const filteredProducts = data.products.filter((product: any) => {
          const article = product.article || '';
          const name = (product.name || '').toLowerCase();
          
             // Проверяем что в названии есть слово "дымчатый"
             if (!name.includes('шампань рифленый')) return false;
          
          // Исключаем нежелательные категории
          const excludeTerms = ['vintage', 'ретро', 'retro', 'автоматический выключатель', 'gallant'];
          if (excludeTerms.some(term => name.includes(term))) return false;
          
          // Включаем только нужные типы товаров
          return targetProductNames.some(targetName => 
            name.includes(targetName.toLowerCase())
          );
        });
        
        filteredProducts.sort((a: any, b: any) => (a.article || '').localeCompare(b.article || ''));
        
        setAllFilteredProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
        
        const itemsPerPage = 40;
        const totalPagesCalc = Math.ceil(filteredProducts.length / itemsPerPage);
        setTotalPages(totalPagesCalc);
        
        updatePage(1, filteredProducts, itemsPerPage);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePage = (page: number, allProducts: ProductI[], itemsPerPage: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    
    setProducts(paginatedProducts);
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePageChange = (page: number) => {
    if (allFilteredProducts.length > 0) {
      updatePage(page, allFilteredProducts, 40);
    }
  };

  return (
    <div className="text-black" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      <div className="mx-auto max-w-[1550px] px-4 sm:px-6 lg:px-8 mb-52">
        
      </div>

      <div className="mx-auto max-w-[1550px] px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
          <h2 className="text-5xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-black mb-5">Retro - Белое</h2>
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-2xl text-black">
          <Link href="/ElektroustnovohneIzdely" className="hover:text-transition-colors">Электроустановочные изделия</Link>
           <Link href="/ElektroustnovohneIzdely/Werkel" className="hover:text-gray-200 transition-colors">Werkel</Link>
          <span className="text-white">Retro - Белое</span>
        </nav>
        </div>
        </div>

        

        <div>
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

