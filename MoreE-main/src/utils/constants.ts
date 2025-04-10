export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://all-eight.vercel.app';
// Для обратной совместимости временно оставляю BASE_URL
export const BASE_URL = NEXT_PUBLIC_API_URL;
export const IMAGE_QUALITY = 'q=75';
export const IMAGE_WIDTH = 'w=400';
export const DOMAIN = 'https://www.moreelectriki.ru/';

// Улучшенная функция для работы с изображениями с гибкими параметрами
export const getImageUrl = (url: string, options?: { quality?: number, width?: number }) => {
  if (!url) return '';
  
  const quality = options?.quality || 75;
  const width = options?.width || 400;
  
  // Исключаем добавление параметров для изображений из других доменов
  if (url.startsWith('http') && !url.includes(DOMAIN)) {
    return url;
  }
  
  return `${url}?q=${quality}&w=${width}`;
}; 