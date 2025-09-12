'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import { NEXT_PUBLIC_API_URL } from '@/utils/constants';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/PaginationComponents';

export default function VoltumWhiteGlossPage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [allFilteredProducts, setAllFilteredProducts] = useState<ProductI[]>([]);
  const itemsPerPage = 12;

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      
      if (allFilteredProducts.length > 0) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setProducts(allFilteredProducts.slice(startIndex, endIndex));
        setCurrentPage(page);
        setLoading(false);
        return;
      }
      
      const apiUrl = NEXT_PUBLIC_API_URL;
      let allProducts: any[] = [];
      
      for (let pageNum = 1; pageNum <= 5; pageNum++) {
        try {
          const params = {
            source: 'Voltum',
            page: pageNum,
            limit: 200,
            inStock: 'true'
          };
          
          console.log(`[Voltum Белый глянцевый] Загружаем страницу ${pageNum}...`);
          const response = await axios.get(`${apiUrl}/api/products/Voltum`, { params });
          
          if (response.data && response.data.products && Array.isArray(response.data.products)) {
            const pageProducts = response.data.products;
            allProducts = [...allProducts, ...pageProducts];
            console.log(`[Voltum Белый глянцевый] Страница ${pageNum}: +${pageProducts.length} товаров (всего: ${allProducts.length})`);
            
            if (pageProducts.length < params.limit) {
              console.log(`[Voltum Белый глянцевый] Последняя страница: ${pageNum}`);
              break;
            }
          } else {
            console.log(`[Voltum Белый глянцевый] Страница ${pageNum}: нет данных`);
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`[Voltum Белый глянцевый] Ошибка страницы ${pageNum}:`, error);
          break;
        }
      }
      
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.article === product.article)
      );

      if (uniqueProducts.length > 0) {
        const filteredProducts = uniqueProducts.filter((product: any) => {
          const category = product.category || '';
          const name = product.name || '';
          
          const isWhiteGloss = category.toLowerCase().includes('белый глянцевый') || 
                              name.toLowerCase().includes('белый глянцевый');
          
          console.log(`[Voltum Белый глянцевый] "${name}" | Категория: "${category}" | Белый глянцевый: ${isWhiteGloss}`);
          
          return isWhiteGloss;
        });
        
        setAllFilteredProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
        setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setProducts(filteredProducts.slice(startIndex, endIndex));
        
        console.log('Товары Voltum Белый глянцевый:', filteredProducts.length);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allFilteredProducts.length === 0) {
      fetchProducts(1);
    }
  }, []);

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  useEffect(() => {
    if (allFilteredProducts.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setProducts(allFilteredProducts.slice(startIndex, endIndex));
    }
  }, [currentPage, allFilteredProducts, itemsPerPage]);

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
    

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-44">
      <div className="mb-8">
          <h2 className="text-5xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-black mb-5">Белый глянцевый</h2>
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-2xl text-black">
          <Link href="/ElektroustnovohneIzdely" className="hover:text-transition-colors">Электроустановочные изделия</Link>
           <Link href="/ElektroustnovohneIzdely/Voltum" className="hover:text-gray-200 transition-colors">Voltum</Link>
          <span className="text-white">Белый глянцевый</span>
        </nav>
        </div>
        </div>

        

        <div className="mb-8">
          {loading ? (
            <div className="py-10 w-full flex justify-center">
              <LoadingSpinner size="lg" text="Загружаем товары..." />
            </div>
          ) : products.length > 0 ? (
            <CatalogOfProductSearch products={products} viewMode={viewMode} isLoading={loading} />
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-lg mb-4">Товары не найдены</div>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
} 