import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pagesToShow = 5;
  const middlePagesToShow = 2;

  const renderPageNumbers = (): JSX.Element[] => {
    const buttons: JSX.Element[] = [];

    // Кнопка "предыдущая"
    buttons.push(
      <button
        key="prev"
        type="button"
        className={`inline-flex items-center  mt-10 px-2 py-2 text-sm font-semibold rounded-l-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span className="sr-only">Previous</span>
      </button>
    );

    // Отображение первых страниц
    for (let i = 1; i <= Math.min(pagesToShow, totalPages); i++) {
      buttons.push(
        <button
          key={i}
          type="button"
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold border border-black ${i === currentPage ? 'bg-white text-black' : 'bg-white'}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Отображение "..." если между текущей и первой группой страниц есть разрыв
    if (currentPage > pagesToShow + middlePagesToShow) {
      buttons.push(
        <button
          key="dots-before"
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold"
          disabled
        >
          ...
        </button>
      );
    }

    // Отображение страниц вокруг текущей
    const startMiddlePage = Math.max(pagesToShow + 1, currentPage - middlePagesToShow);
    const endMiddlePage = Math.min(currentPage + middlePagesToShow, totalPages - pagesToShow);

    for (let i = startMiddlePage; i <= endMiddlePage; i++) {
      buttons.push(
        <button
          key={i}
          type="button"
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold border border-black ${i === currentPage ? 'bg-white text-black' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Отображение "..." если между текущей и последними страницами есть разрыв
    if (currentPage < totalPages - pagesToShow - middlePagesToShow) {
      buttons.push(
        <button
          key="dots-after"
          type="button"
          className="inline-flex text-black items-center px-4 py-2 text-sm font-semibold"
          disabled
        >
          ...
        </button>
      );
    }

    // Отображение последних страниц
    for (let i = Math.max(totalPages - pagesToShow + 1, pagesToShow + middlePagesToShow + 1); i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          type="button"
          className={`inline-flex items-center rounded-lg px-4 py-3 text-sm font-semibold border border-black ${i === currentPage ? 'bg-white text-black' : 'bg-white'}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Кнопка "следующая"
    buttons.push(
      
    );

    return buttons;
  };

  return (
    <nav aria-label="Pagination" className="max-md:w-full -space-x-px rounded-md shadow-sm bg-white text-black">
      {renderPageNumbers()}
    </nav>
  );
};

export default Pagination;