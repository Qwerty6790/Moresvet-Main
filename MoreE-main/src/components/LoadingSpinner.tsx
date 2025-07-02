import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showText?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Загружаем товары...', 
  showText = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-12 h-12';
      case 'lg': return 'w-16 h-16';
      case 'xl': return 'w-24 h-24';
      default: return 'w-12 h-12';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Основной спиннер */}
      <div className={`${getSizeClasses()} border-4 border-gray-200 border-t-black rounded-full animate-spin`}></div>

      {/* Текст MoreElektriki */}
      <div className="mt-6 text-center">
        <p className={`font-bold text-black ${getTextSize()}`}>
          MoreElektriki
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 