import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const pagesToShow = 5;
  const middlePagesToShow = 2;

  const renderPageNumbers = (): JSX.Element[] => {
    const buttons: JSX.Element[] = [];

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`relative inline-flex items-center px-4 py-2.5 rounded-lg border transition-all duration-200
          ${currentPage === 1 
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );

    // First page
    if (currentPage > 3) {
      buttons.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-lg"
        >
          1
        </button>
      );
    }

    // Dots after first page
    if (currentPage > 4) {
      buttons.push(
        <span key="dots-1" className="relative inline-flex items-center px-4 py-2 text-sm text-gray-400">
          ...
        </span>
      );
    }

    // Pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg
            ${currentPage === i
              ? 'z-10 border-2 border-gray-900 bg-gray-900 text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
          {i}
        </button>
      );
    }

    // Dots before last page
    if (currentPage < totalPages - 3) {
      buttons.push(
        <span key="dots-2" className="relative inline-flex items-center px-4 py-2 text-sm text-gray-400">
          ...
        </span>
      );
    }

    // Last page
    if (currentPage < totalPages - 2) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-lg"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`relative inline-flex items-center px-4 py-2.5 rounded-lg border transition-all duration-200
          ${currentPage === totalPages 
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );

    return buttons;
  };

  return (
    <nav aria-label="Pagination" className="mt-8">
      <div className="flex justify-center gap-2">
        {renderPageNumbers()}
      </div>
      <div className="mt-3 text-center text-sm text-gray-500">
        Страница {currentPage} из {totalPages}
      </div>
    </nav>
  );
};

export default Pagination;