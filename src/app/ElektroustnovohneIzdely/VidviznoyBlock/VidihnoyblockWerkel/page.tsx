'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import LoadingSpinner from '@/components/LoadingSpinner';
import PaginationComponents from '@/components/PaginationComponents';
import { NEXT_PUBLIC_API_URL } from '@/utils/constants';

export default function S08GreyGraphitePage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [allFilteredProducts, setAllFilteredProducts] = useState<ProductI[]>([]);

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      
      if (allFilteredProducts.length > 0) {
        const itemsPerPage = 40;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = allFilteredProducts.slice(startIndex, endIndex);
        
        setProducts(paginatedProducts);
        setCurrentPage(page);
        setLoading(false);
        return;
      }
      
      const params = {
        source: 'Werkel',
        name: 'Выдвижной блок',
        page: 1,
        limit: 500
      };

      const apiUrl = NEXT_PUBLIC_API_URL;
      const { data } = await axios.get(`${apiUrl}/api/products/Werkel`, { params });

      if (data && data.products) {
        const filteredProducts = data.products.filter((product: any) => {
          const article = product.article || '';
          const name = (product.name || '').toLowerCase();
          
          const isS08 = name.includes('выдвижной блок') || article.toLowerCase().includes('выдвижной блок');
          const isGreyGraphiteColor = article.endsWith('выдвижной блок') || name.includes('выдвижной блок') || name.includes('выдвижной блок');
          
          return isS08 && isGreyGraphiteColor;
        });
        
        setAllFilteredProducts(filteredProducts);
        
        const itemsPerPage = 40;
        const totalFiltered = filteredProducts.length;
        const totalPagesFiltered = Math.ceil(totalFiltered / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        setProducts(paginatedProducts);
        setTotalProducts(totalFiltered);
        setTotalPages(totalPagesFiltered);
        setTotalProducts(totalFiltered);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-44">
      <div className="mb-8">
          <h2 className="text-5xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-black mb-5">Выдвижной блок</h2>
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-2xl text-black">
          <Link href="/ElektroustnovohneIzdely" className="hover:text-transition-colors">Электроустановочные изделия</Link>
           <Link href="/ElektroustnovohneIzdely/Werkel" className="hover:text-gray-200 transition-colors">Werkel</Link>
          <span className="text-white">Выдвижной блок</span>
        </nav>
        </div>
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
