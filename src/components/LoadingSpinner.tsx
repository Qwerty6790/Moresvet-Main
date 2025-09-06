import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showText?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Загружаем MORESVET...',
  showText = true
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-16 h-16';
      case 'md': return 'w-28 h-28';
      case 'lg': return 'w-40 h-40';
      case 'xl': return 'w-56 h-56';
      default: return 'w-28 h-28';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-base';
      case 'xl': return 'text-lg';
      default: return 'text-sm';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <h2
          className={`font-extrabold ${getTextSize()}`}
          style={{
            background: 'linear-gradient(90deg, #b78d2b 0%, #ffd86b 50%, #b78d2b 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s linear infinite'
          }}
        >
          MORESVET
        </h2>

        {showText && <div className="text-gray-500 mt-2" style={{ fontSize: '12px' }}>{text}</div>}
      </div>

      <span className="sr-only" role="status" aria-live="polite">{text}</span>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;