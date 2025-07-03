import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import Header from '@/components/Header';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';

const SearchResults: React.FC = () => {
  const router = useRouter();
  const { qwery } = router.query;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');

  useEffect(() => {
    if (!qwery) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search`, {
          params: {
            name: qwery,
            page: currentPage,
            pageSize: 40,
            sortBy: 'popularity',
            sortOrder: 'desc',
          },
        });

        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalProducts(response.data.totalProducts || 0);
      } catch (error) {
        console.error('Ошибка при поиске:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [qwery, currentPage]);

  // Функция для склонения слова "товар"
  const getTotalProductsText = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'товаров';
    }
    
    if (lastDigit === 1) {
      return 'товар';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'товара';
    }
    
    return 'товаров';
  };

  // Функция для рендера пагинации
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers: (number | string)[] = [];
    
    // Всегда показываем первую страницу
    pageNumbers.push(1);
    
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Расширяем диапазон для малых страниц
    if (currentPage <= 3) {
      endPage = Math.min(totalPages - 1, 5);
    }
    
    // Расширяем диапазон для больших страниц
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 4);
    }
    
    // Добавляем эллипсис в начале, если нужно
    if (startPage > 2) {
      pageNumbers.push('ellipsis-start');
    }
    
    // Добавляем страницы в диапазоне
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Добавляем эллипсис в конце, если нужно
    if (endPage < totalPages - 1) {
      pageNumbers.push('ellipsis-end');
    }
    
    // Всегда показываем последнюю страницу (если она не первая)
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return (
      <div className="flex justify-center items-center mt-8 space-x-2">
        {/* Кнопка "Назад" */}
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 border rounded-md transition-colors ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
          aria-label="Предыдущая страница"
        >
          ‹
        </button>
        
        {/* Номера страниц */}
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <span key={`${page}-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            );
          }
          
          const pageNum = Number(page);
          return (
            <button
              key={`page-${page}-${index}`}
              onClick={() => setCurrentPage(pageNum)}
              className={`min-w-[40px] px-3 py-2 border rounded-md transition-colors ${
                currentPage === pageNum
                  ? 'bg-black text-white border-black hover:bg-gray-800'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {page}
            </button>
          );
        })}
        
        {/* Кнопка "Вперед" */}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 border rounded-md transition-colors ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
          aria-label="Следующая страница"
        >
          ›
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-2 sm:px-4 lg:px-8 pt-4 sm:pt-6 pb-12 mt-20 max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Хлебные крошки */}
          <div className="hidden sm:flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-900 transition-colors">Главная</Link>
            <span className="text-gray-300 mx-2">•</span>
            <span className="text-gray-900 font-medium">Поиск: "{qwery}"</span>
          </div>
          
          {/* Заголовок */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Результаты поиска: "{qwery}"
            </h1>
          </div>

          {/* Информация о количестве товаров и переключатель вида */}
          <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-gray-700 font-medium w-full sm:w-auto text-center sm:text-left">
              Найдено: <span className="text-black font-semibold">{totalProducts}</span> {getTotalProductsText(totalProducts)}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              {/* Переключатель режима отображения */}
              <div className="flex bg-white border border-gray-200 rounded-md shadow-sm px-1 py-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Сетка"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Список"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'table' 
                      ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Таблица"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Содержимое товаров */}
          <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <ClipLoader size={50} color="#000000" />
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="mt-4 text-gray-500 text-lg">По запросу "{qwery}" ничего не найдено</p>
                <p className="text-gray-400 mt-2">Попробуйте изменить поисковый запрос</p>
                <Link 
                  href="/" 
                  className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Вернуться на главную
                </Link>
              </div>
            ) : (
              <>
                <CatalogOfProductSearch 
                  products={products} 
                  viewMode={viewMode}
                  isLoading={false}
                />
                
                {/* Пагинация */}
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
