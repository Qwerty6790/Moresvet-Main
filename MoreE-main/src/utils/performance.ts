'use client';

/**
 * Утилиты для измерения и улучшения производительности
 */

// Интерфейсы для типов
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  duration: number;
  startTime: number;
}

// Измеряет время загрузки компонента
export function measureLoadTime(componentName: string) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    console.log(`📊 Время загрузки ${componentName}: ${loadTime.toFixed(2)}ms`);
  };
}

// Функция для предварительной загрузки критичных изображений
export function preloadCriticalImages() {
  if (typeof window === 'undefined') return;
  
  const criticalImages = [
    '/images/TrekovoeLogo.png',
    '/images/SvetlnikiLogo.png',
    '/images/Maytoni.jpg',
    '/images/Werkel.png',
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

// Функция для включения инструментов отладки производительности
export function enablePerformanceDebugging() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  // Отслеживаем CLS (Cumulative Layout Shift)
  let cumulativeLayoutShiftScore = 0;
  
  const observer = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      const shift = entry as LayoutShift;
      if (!shift.hadRecentInput) {
        cumulativeLayoutShiftScore += shift.value;
        console.log(`📏 Layout Shift: ${shift.value.toFixed(4)}, Total CLS: ${cumulativeLayoutShiftScore.toFixed(4)}`);
      }
    }
  });
  
  try {
    observer.observe({ type: 'layout-shif', buffered: true });
  } catch (e) {
    console.log('PerformanceObserver для CLS не поддерживается в этом браузере');
  }
  
  // Отслеживаем LCP (Largest Contentful Paint)
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log(`🖼️ Largest Contentful Paint: ${lastEntry.startTime.toFixed(0)}ms`);
  });
  
  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.log('PerformanceObserver для LCP не поддерживается в этом браузере');
  }
  
  // Отслеживаем FID (First Input Delay)
  const fidObserver = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      const delay = entry as PerformanceEventTiming;
      console.log(`👆 First Input Delay: ${delay.processingStart - delay.startTime}ms`);
    }
  });
  
  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.log('PerformanceObserver для FID не поддерживается в этом браузере');
  }
}

// Запускаем предзагрузку критичных изображений для клиентской стороны
if (typeof window !== 'undefined') {
  preloadCriticalImages();
  // Включаем только в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    enablePerformanceDebugging();
  }
} 