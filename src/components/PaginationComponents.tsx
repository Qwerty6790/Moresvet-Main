import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const smallButton = (children: React.ReactNode, onClick: () => void, disabled = false, key?: React.Key) => (
    <button
      key={key}
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 text-black rounded-lg transition-opacity duration-150 ${disabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
    >
      {children}
    </button>
  );

  return (
    <nav aria-label="Pagination" className="mt-8">
      <div className="flex items-center justify-center gap-6">
        {smallButton(<ChevronLeft className="h-8 w-8" />, () => onPageChange(Math.max(1, currentPage - 1)), currentPage === 1, 'prev')}

        <div className="text-4xl font-semibold text-gray-900 select-none">{currentPage}</div>

        <div className="text-sm text-gray-500 select-none">/ {totalPages}</div>

        {smallButton(<ChevronRight className="h-8 w-8" />, () => onPageChange(Math.min(totalPages, currentPage + 1)), currentPage === totalPages, 'next')}
      </div>
    </nav>
  );
};

export default Pagination;