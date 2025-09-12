import React, { useState, useMemo, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductI } from '../types/interfaces';
import { toast } from 'sonner';
// lightweight fallback: if serviceWorkerRegistration is missing, avoid importing it to prevent build errors
let prefetchImagesForRoutes: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  prefetchImagesForRoutes = require('../lib/serviceWorkerRegistration').prefetchImagesForRoutes;
} catch (e) {
  // noop - optional feature
}

interface CatalogOfProductProps {
  products: ProductI[];
  viewMode: 'grid' | 'list' | 'table';
  isLoading?: boolean; // Добавляем параметр для состояния загрузки
}

// Константы для оптимизации изображений
const IMAGE_FORMATS = {
  AVIF: 'avif',
  WEBP: 'webp',
  JPG: 'jpg',
  PNG: 'png',
};

// УЛЬТРА-АГРЕССИВНЫЕ размеры для LCP на медленных сетях
const IMAGE_SIZES = {
  ULTRA_SMALL_LCP: 60, // Увеличиваем размер для лучшего качества LCP
  SMALL_LCP: 100,      // Для 2-го и 3-го увеличиваем размер
  THUMBNAIL: 80,
  SMALL: 150,
  MEDIUM: 300,
};

// УЛЬТРА-АГРЕССИВНОЕ качество для LCP на медленных сетях
const QUALITY_LEVELS = {
  ULTRA_LOW: 15,       // Улучшаем качество для первого LCP
  LOW: 30,             // Улучшаем качество для 2-го и 3-го LCP
  MEDIUM: 40,          // AVIF
  HIGH: 50,            // WebP
  VERY_HIGH: 75        // JPG
};

// Глобальный кэш успешно загруженных форматов изображений с LRU механизмом
const IMAGE_CACHE_MAX_SIZE = 200;
const IMAGE_CACHE_ITEMS: Array<{key: string, format: string, url: string, timestamp: number}> = [];
const IMAGE_CACHE: Record<string, { format: string, url: string }> = {};

// Инициализируем Worker для обработки изображений, если он доступен
let imageWorker: Worker | null = null;
try {
  if (typeof window !== 'undefined' && 'Worker' in window) {
    // Инлайн-скрипт для воркера, чтобы избежать проблем с CORS
    const workerBlob = new Blob([`
      self.onmessage = function(e) {
        const { url, format } = e.data;
        // Используем force-cache только если изображение уже должно быть в кэше браузера
        const cacheStrategy = self.caches ? 'default' : 'force-cache';
        fetch(url, { mode: 'cors', cache: cacheStrategy })
          .then(r => {
            if (!r.ok) throw new Error('Network response was not ok for ' + url);
            return r.blob();
           })
          .then(blob => self.postMessage({ url, blob, success: true }))
          .catch(err => self.postMessage({ url, success: false, error: err.message }));
      }
    `], { type: 'application/javascript' });

    imageWorker = new Worker(URL.createObjectURL(workerBlob));
  }
} catch (e) {
  console.warn('Ошибка создания воркера для изображений:', e);
}

// Добавляем состояние сетевого подключения - безопасно для SSR
let isOffline = false;
let isLowBandwidth = false;
let didPrefetchPaths = false;
// Переменная для SSR в компоненте OptimizedImage
let isSSR = typeof window === 'undefined';
// Флаг для определения применения BlurHash/SQIP
let useEnhancedPlaceholders = false; // Отключено временно
// Память для хранения частично загруженных изображений
const PARTIAL_IMAGES: Record<string, Blob> = {};
// Инициализировали ли мы Image Service Worker
let initedServiceWorker = false;

// Кэш для предварительно проверенных форматов
const supportCache = {
  avif: null as boolean | null,
  webp: null as boolean | null,
  jpeg2000: null as boolean | null,
};

// Новый механизм для HTTP/3 и QuicTransport, если доступно
let supportsHTTP3 = false;
let supportsQuic = false;

// Определяем поддержку HTTP/3 и QUIC
try {
  if (typeof navigator !== 'undefined') {
    // @ts-ignore - проверка на экспериментальные возможности
    supportsHTTP3 = 'connection' in navigator && navigator.connection && 'http3' in navigator.connection;
    // @ts-ignore - проверка на экспериментальные возможности
    supportsQuic = typeof window !== 'undefined' && 'QuicTransport' in window;
  }
} catch (e) {
  console.warn('Ошибка при проверке поддержки HTTP/3:', e);
}

// Инициализация IndexedDB для сверхбыстрого кэширования изображений
let imageDB: IDBDatabase | null = null;
const DB_NAME = 'image_cache_db';
const STORE_NAME = 'images';

// Инициализация IndexedDB
try {
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    const request = indexedDB.open(DB_NAME, 2);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    };

    request.onsuccess = (event) => {
      imageDB = (event.target as IDBOpenDBRequest).result;
      if (imageDB) {
        cleanupOldIndexedDBEntries(imageDB as IDBDatabase);
      }
    };

    request.onerror = (event) => {
      console.warn('Ошибка при открытии IndexedDB:', (event.target as IDBOpenDBRequest).error);
    };
  }
} catch (e) {
  console.warn('Ошибка при инициализации IndexedDB:', e);
}

// Функция для очистки устаревших записей в IndexedDB
function cleanupOldIndexedDBEntries(db: IDBDatabase): void {
  try {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const dayAgo = Date.now() - 86400000; // 24 часа
    const range = IDBKeyRange.upperBound(dayAgo);
    const cursorRequest = index.openCursor(range);
    cursorRequest.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result;
      if (cursor) {
        try {
         store.delete(cursor.primaryKey);
        } catch (delErr) {
          console.warn('Ошибка при удалении записи из IndexedDB:', delErr)
        }
        cursor.continue();
      }
    };
     cursorRequest.onerror = (e) => {
       console.warn('Ошибка курсора при очистке IndexedDB:', (e.target as IDBRequest).error);
     }
     transaction.onerror = (e) => {
       console.warn('Ошибка транзакции при очистке IndexedDB:', (e.target as IDBTransaction).error);
     }
  } catch (e) {
    console.warn('Ошибка при очистке старых записей в IndexedDB:', e);
  }
}

// Функция сохранения изображения в IndexedDB
const saveImageToIndexedDB = (url: string, blob: Blob): void => {
  if (!imageDB || !url || !blob || blob.size === 0) return;

  try {
    // Проверяем есть ли уже такая запись, чтобы не перезаписывать зря
    const readTx = imageDB.transaction(STORE_NAME, 'readonly');
    const storeRead = readTx.objectStore(STORE_NAME);
    const getReq = storeRead.get(url);

    getReq.onsuccess = () => {
      if (!getReq.result) {
        // Записи нет, можно добавлять
        try {
          const writeTx = imageDB!.transaction(STORE_NAME, 'readwrite');
          const storeWrite = writeTx.objectStore(STORE_NAME);
          storeWrite.put({
            url,
            blob,
            timestamp: Date.now()
          });
           writeTx.onerror = (e) => console.warn('Ошибка транзакции записи в IndexedDB:', (e.target as IDBTransaction).error);
        } catch (eWrite) {
           console.warn('Ошибка при записи в IndexedDB (внутри get):', eWrite);
        }
      }
    }
     getReq.onerror = (e) => console.warn('Ошибка при проверке наличия в IndexedDB:', (e.target as IDBRequest).error);
     readTx.onerror = (e) => console.warn('Ошибка транзакции чтения в IndexedDB:', (e.target as IDBTransaction).error);

  } catch (e) {
    console.warn('Ошибка при сохранении в IndexedDB (снаружи):', e);
  }
};

// Функция получения изображения из IndexedDB
const getImageFromIndexedDB = async (url: string): Promise<Blob | null> => {
  if (!imageDB || !url) return null;

  return new Promise((resolve) => {
    try {
      const transaction = imageDB!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        resolve(request.result ? request.result.blob : null);
      };
      request.onerror = () => {
        console.warn('Ошибка запроса get в IndexedDB:', request.error);
        resolve(null);
      };
       transaction.onerror = (e) => {
         console.warn('Ошибка транзакции get в IndexedDB:', (e.target as IDBTransaction).error);
         resolve(null); // Резолвим null при ошибке транзакции
       }
    } catch (e) {
      console.warn('Ошибка при получении из IndexedDB:', e);
      resolve(null);
    }
  });
};

// Проверка состояния сети для адаптивной загрузки - безопасно для SSR
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  isOffline = !navigator.onLine;

  // Слушаем изменения состояния сети
  try {
    window.addEventListener('online', () => isOffline = false);
    window.addEventListener('offline', () => isOffline = true);

    // Определяем низкую пропускную способность (упрощенно)
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        const updateLowBandwidth = () => {
           isLowBandwidth = conn.saveData || /^(slow-)?2g$/.test(conn.effectiveType) || conn.downlink < 0.5;
        }
        updateLowBandwidth();
        conn.addEventListener('change', updateLowBandwidth);
      }
    }
  } catch (e) {
    console.warn('Ошибка при инициализации сетевых слушателей:', e);
  }
}

// Функция определения поддержки AVIF в браузере (используем кэш)
const isAvifSupported = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR
  if (supportCache.avif !== null) return supportCache.avif; // Кэш в памяти

  try {
    const cached = typeof localStorage !== 'undefined' ? localStorage.getItem('avif_supported') : null;
    if (cached !== null) {
       supportCache.avif = cached === 'true';
       return supportCache.avif;
    }
  } catch (e) { console.warn('Ошибка доступа к localStorage (AVIF):', e); }

  // Простая проверка (может быть неточной, но быстрой)
  try {
    const canvas = document.createElement('canvas');
    const isLikelySupported = canvas.toDataURL('image/avif', 0.1).indexOf('data:image/avif') === 0;
    supportCache.avif = isLikelySupported;
     if (typeof localStorage !== 'undefined') localStorage.setItem('avif_supported', String(isLikelySupported));
     return isLikelySupported;
  } catch (e) {
     supportCache.avif = false; // Если ошибка, считаем не поддерживается
     if (typeof localStorage !== 'undefined') localStorage.setItem('avif_supported', 'false');
     return false;
  }
}

// Функция определения поддержки WebP в браузере (используем кэш)
const isWebPSupported = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR
  if (supportCache.webp !== null) return supportCache.webp; // Кэш в памяти

  try {
    const cached = typeof localStorage !== 'undefined' ? localStorage.getItem('webp_supported') : null;
    if (cached !== null) {
       supportCache.webp = cached === 'true';
       return supportCache.webp;
    }
  } catch (e) { console.warn('Ошибка доступа к localStorage (WebP):', e); }

  // Быстрая проверка через canvas
   try {
     const canvas = document.createElement('canvas');
     canvas.width = 1; canvas.height = 1;
     const isSupported = canvas.toDataURL('image/webp', 0.1).indexOf('data:image/webp') === 0;
     supportCache.webp = isSupported;
     if (typeof localStorage !== 'undefined') localStorage.setItem('webp_supported', String(isSupported));
     return isSupported;
   } catch (e) {
     supportCache.webp = false;
     if (typeof localStorage !== 'undefined') localStorage.setItem('webp_supported', 'false');
     return false;
   }
}

// Удаляем функции checkAvifSupport и checkWebPSupport, так как используем более простые проверки

// Функция выбора оптимального формата и качества
const selectOptimalFormat = (isLCPElement = false, isFirstProduct = false): { format: string, quality: number } => {
  const avif = isAvifSupported();
  const webp = isWebPSupported();
  const slow = isSlowConnection(); // Проверяем медленное соединение

  // Самый первый продукт (index 0) - УЛЬТРА-агрессивно, особенно на медленной сети
  if (isFirstProduct) {
     // На медленной сети форсируем WebP с ультра-низким качеством
     if (slow && webp) {
         return { format: IMAGE_FORMATS.WEBP, quality: QUALITY_LEVELS.ULTRA_LOW };
     }
     // На быстрой сети для первого LCP - можно чуть лучше, но все равно низкое
     if (webp) {
         return { format: IMAGE_FORMATS.WEBP, quality: QUALITY_LEVELS.LOW }; // Используем LOW вместо ULTRA_LOW
     }
     // Fallback на JPG с низким качеством
     return { format: IMAGE_FORMATS.JPG, quality: QUALITY_LEVELS.LOW + 5 };
  }

  // LCP 2 и 3 (index 1, 2)
  if (isLCPElement) {
     // На медленной - WebP LOW
     if (slow && webp) {
         return { format: IMAGE_FORMATS.WEBP, quality: QUALITY_LEVELS.LOW };
     }
     // На быстрой - WebP HIGH или AVIF MEDIUM
     if (avif) return { format: IMAGE_FORMATS.AVIF, quality: QUALITY_LEVELS.MEDIUM };
     if (webp) return { format: IMAGE_FORMATS.WEBP, quality: QUALITY_LEVELS.HIGH };
     return { format: IMAGE_FORMATS.JPG, quality: QUALITY_LEVELS.VERY_HIGH };
  }

  // Стандартный выбор для остальных (не LCP)
  if (avif) return { format: IMAGE_FORMATS.AVIF, quality: QUALITY_LEVELS.MEDIUM };
  if (webp) return { format: IMAGE_FORMATS.WEBP, quality: QUALITY_LEVELS.HIGH };
  return { format: IMAGE_FORMATS.JPG, quality: QUALITY_LEVELS.VERY_HIGH };
};

// Функция детекции быстрого или медленного соединения (упрощенная)
let connectionSpeed: 'fast' | 'slow' | 'unknown' = 'unknown';
let lastConnectionCheck = 0;

const isSlowConnection = (): boolean => {
  const now = Date.now();
  // Кэшируем результат на 5 секунд
  if (connectionSpeed !== 'unknown' && now - lastConnectionCheck < 5000) {
    return connectionSpeed === 'slow';
  }

  lastConnectionCheck = now;
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    connectionSpeed = 'fast'; // SSR
    return false;
  }

  try {
    if (isOffline) {
       connectionSpeed = 'slow';
       return true;
    }
    if (isLowBandwidth) { // Используем обновляемое значение
       connectionSpeed = 'slow';
       return true;
    }

    // Очень простая проверка
    if ('connection' in navigator) {
       const conn = (navigator as any).connection;
       if (conn && /^(slow-)?2g$/.test(conn.effectiveType)) {
           connectionSpeed = 'slow';
           return true;
       }
    }

    connectionSpeed = 'fast';
    return false;
  } catch (e) {
    console.warn('Ошибка при определении скорости соединения:', e);
    connectionSpeed = 'fast'; // По умолчанию - быстрое
    return false;
  }
};

// Получение оптимального размера изображения
const getOptimalImageSize = (isLCP: boolean = false, isFirstProduct: boolean = false): number => {
  // --- Ультра-агрессивно для LCP ---
  if (isLCP) {
    return isFirstProduct ? IMAGE_SIZES.ULTRA_SMALL_LCP : IMAGE_SIZES.SMALL_LCP;
  }
  // --------------------------------

  // Логика для остальных изображений
  if (isOffline) return IMAGE_SIZES.THUMBNAIL;
  const slow = isSlowConnection();
  if (slow) return IMAGE_SIZES.THUMBNAIL;
  // Убираем зависимость от window.innerWidth для простоты и предсказуемости
  // if (typeof window !== 'undefined') {
  //   const width = window.innerWidth;
  //   if (width > 1024 && !slow) return IMAGE_SIZES.MEDIUM;
  // }
  return IMAGE_SIZES.SMALL; // Базовый размер для не-LCP
};


// Функция нормализации URL
const normalizeUrl = (originalUrl: string, isLCPCandidate: boolean = false, isFirstProduct: boolean = false): string | null => {
  if (!originalUrl) return null;

  const url = originalUrl.replace("#first-product", "").trim();
  const cacheKeyLookup = `${url}_${isLCPCandidate}_${isFirstProduct}`;

  // Используем простой JS-объект как LRU кэш в памяти
  if (IMAGE_CACHE[cacheKeyLookup]) {
    const cacheIndex = IMAGE_CACHE_ITEMS.findIndex(item => item.key === cacheKeyLookup);
    if (cacheIndex !== -1) {
      const item = IMAGE_CACHE_ITEMS.splice(cacheIndex, 1)[0];
      item.timestamp = Date.now();
      IMAGE_CACHE_ITEMS.push(item);
      return IMAGE_CACHE[cacheKeyLookup].url;
    } else {
      delete IMAGE_CACHE[cacheKeyLookup];
    }
  }

  // Очистка LRU кэша
  if (IMAGE_CACHE_ITEMS.length >= IMAGE_CACHE_MAX_SIZE) {
    const itemsToRemoveCount = Math.max(1, Math.ceil(IMAGE_CACHE_ITEMS.length * 0.2));
    const itemsToRemove = IMAGE_CACHE_ITEMS.splice(0, itemsToRemoveCount);
    itemsToRemove.forEach(item => {
      delete IMAGE_CACHE[item.key];
    });
  }

  // Передаем информацию о LCP и первом продукте для выбора формата и размера
  const { format, quality } = selectOptimalFormat(isLCPCandidate, isFirstProduct);
  const size = getOptimalImageSize(isLCPCandidate, isFirstProduct);

  if (isOffline && typeof caches !== 'undefined') {
    return url; 
  }

  const isRelevantDomain = url.includes('lightstar.ru') || url.includes('moresvet.ru') || url.includes('divinare.ru');
  
  if (isRelevantDomain) {
    const baseUrl = url.split('?')[0];
    
    // Для LCP изображений используем более высокое качество, но меньший размер
    // для быстрой загрузки
    let optimizedUrl = `${baseUrl}?format=${format}&quality=${quality}&width=${size}`;
    
    // Добавляем прогрессивный JPEG только для JPG
    if (format === 'jpg') {
      optimizedUrl += '&progressive=true';
    }
    
    // Всегда удаляем метаданные для уменьшения размера
    optimizedUrl += '&strip=true';
    
    // Не добавляем динамический bust кэша во время рендера — это может вызвать
    // несовпадение HTML при гидратации (сервер и клиент будут генерировать
    // разные значения времени). Кеш-бастинг выполняется асинхронно на клиенте при необходимости.

    IMAGE_CACHE[cacheKeyLookup] = { format, url: optimizedUrl };
    IMAGE_CACHE_ITEMS.push({ key: cacheKeyLookup, format, url: optimizedUrl, timestamp: Date.now() });

    return optimizedUrl;
  }

  return url;
};


// Функция для кэширования изображений, пришедших с бэкенда (упрощенная)
const cacheImagesFromBackend = (products: ProductI[]): void => {
  if (!imageDB || isOffline || typeof window === 'undefined' || !('fetch' in window)) return;

  // Обрабатываем только первые 5-10 изображений
  const imagesToCache: { url: string, forceWebP: boolean }[] = [];
  products.slice(0, 10).forEach((product, index) => {
    let originalUrl: string | null = null;
    if (typeof product.imageAddresses === 'string') {
      originalUrl = product.imageAddresses;
    } else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) {
      originalUrl = product.imageAddresses[0];
    } else if (typeof product.imageAddress === 'string') {
      originalUrl = product.imageAddress;
    } else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) {
      originalUrl = product.imageAddress[0];
    }

    if (originalUrl) {
       const isLCP = index < 3;
       const normalized = normalizeUrl(originalUrl, isLCP); // Получаем оптимизированный URL
       if (normalized) {
         imagesToCache.push({ url: normalized, forceWebP: isLCP }); // Кэшируем уже нормализованный URL
       }
    }
  });

  // Кэшируем асинхронно без requestIdleCallback для скорости
  const cacheNextImage = (index: number): void => {
      if (index >= imagesToCache.length) return;
      const { url } = imagesToCache[index];

      getImageFromIndexedDB(url).then(cachedBlob => {
          if (!cachedBlob) {
              try {
                  new URL(url); // Валидация
                  const abortController = new AbortController();
                  const timeoutId = setTimeout(() => abortController.abort(), 8000); // 8 сек

                  fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', priority: 'low', signal: abortController.signal })
                      .then(response => {
                          clearTimeout(timeoutId);
                          if (!response.ok) throw new Error(`HTTP ${response.status}`);
                          return response.blob();
                      })
                      .then(blob => {
                          if (blob.size > 0) saveImageToIndexedDB(url, blob);
                          // Не ждем завершения, запускаем следующий параллельно
                          // cacheNextImage(index + 1);
                      })
                      .catch(() => {
                         // При ошибке просто пропускаем
                         // cacheNextImage(index + 1);
                      });
              } catch (e) {
                  // Ошибка URL, пропускаем
                 // cacheNextImage(index + 1);
              }
          }
          // Переходим к следующему не дожидаясь fetch
          cacheNextImage(index + 1);
      }).catch(() => {
          // Ошибка IndexedDB, переходим к следующему
          cacheNextImage(index + 1);
      });
  };
  // Запускаем первый вызов
  cacheNextImage(0);
};


// Удаляем функции getLQIPUrl и preloadAllLQIP временно

// Простая компонент-коллаж для плейсхолдера с надписью MORESVET
const CollagePlaceholder: React.FC<{ className?: string; style?: React.CSSProperties; label?: string }> = ({ className, style, label = 'MORESVET' }) => {
  const defaultStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: "linear-gradient(45deg,#f8fafc 25%,#eef2f7 25%,#eef2f7 50%,#f8fafc 50%,#f8fafc 75%,#eef2f7 75%,#eef2f7 100%)",
    backgroundSize: '40px 40px',
    color: '#374151',
    fontWeight: 700,
    letterSpacing: '0.08em',
    fontSize: 12,
  };
  return (
    <div className={className || ''} style={{ ...defaultStyle, ...style }}>
      <span>{label}</span>
    </div>
  );
};

// Радикально упрощаем SafeOptimizedImage для борьбы с CLS
const SafeOptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  isLCP?: boolean;
  width?: number;
  height?: number;
}> = React.memo(({ src, alt, className, priority = false, isLCP = false, width, height }) => {
  const [error, setError] = useState(false);
  // Убираем стейт 'loaded', так как убираем transition
  // const [loaded, setLoaded] = useState(false);

  const handleError = useCallback(() => { setError(true); }, []);
  // Убираем handleLoad
  // const handleLoad = useCallback(() => { setLoaded(true); }, []);

  const aspectRatioStyle = width && height ? { aspectRatio: `${width}/${height}` } : undefined;
  const sizeStyle = width && height ? { width: `${width}px`, height: `${height}px` } : undefined; // Стиль для размеров

  // Placeholder
  if (!src || error) {
    return (
      <div
        className={`${className || ''} block w-full h-full`}
        style={{ ...aspectRatioStyle, ...sizeStyle }}
      >
        <CollagePlaceholder style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  // Основное изображение
  return (
    <img
      src={src}
      alt={alt}
      // Убираем классы, связанные с opacity и transition
      className={`w-full h-full object-contain ${className || ''}`}
      onError={handleError}
      // Убираем onLoad
      // onLoad={handleLoad}
      decoding="async"
      loading={isLCP || priority ? "eager" : "lazy"}
      fetchPriority={isLCP ? "high" : "auto"}
      width={width} // Атрибуты оставляем
      height={height}
      // Стиль оставляем, если нужен aspect-ratio
      style={aspectRatioStyle}
    />
  );
});
SafeOptimizedImage.displayName = 'SafeOptimizedImage';


// Определяем простую функцию предзагрузки изображений
const preloadImage = (url: string | null | undefined): void => {
  if (!url || typeof window === 'undefined') return;
  // Проверяем, не был ли уже создан такой link
  if (document.querySelector(`link[rel="preload"][href="${url}"]`)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  // Добавляем fetchPriority high только для LCP кандидатов
  // link.fetchPriority = 'high'; // Убрано отсюда, ставится в useEffect для LCP
  document.head.appendChild(link);
};


// Оптимизированный компонент CatalogOfProductSearch
const CatalogOfProductSearch: React.FC<CatalogOfProductProps> = ({
  products,
  viewMode,
  isLoading = false,
}) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const validProductIndices: number[] = [];
    const uniqueKeys = new Set<string>();
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product) continue;
      const stockValue = Number(product.stock);
      if (isNaN(stockValue) || stockValue <= 0) continue;
      if (!product.name || !product.article || !product.source) continue;
      const key = product._id || product.article;
      if (!key || uniqueKeys.has(key)) continue;
      validProductIndices.push(i);
      uniqueKeys.add(key);
    }
    return validProductIndices.map(index => products[index]);
  }, [products]);

  // !!! НАПОМИНАНИЕ ПРО PRELOAD (КРИТИЧЕСКИ ВАЖНО ДЛЯ LCP < 2 сек) !!!
  // Предзагрузка САМОГО ПЕРВОГО LCP изображения ДОЛЖНА быть реализована
  // на СЕРВЕРЕ (SSR/SSG) через <link rel="preload"> в <Head>.
  // Без этого достичь 1-2 сек LCP на медленных сетях практически НЕВОЗМОЖНО.
  // <link rel="preload" as="image"
  //       href="ОПТИМИЗИРОВАННЫЙ_URL_ПЕРВОГО_LCP_ИЗ_normalizeUrl"
  //       fetchpriority="high" />

   // Оставляем только фоновое кэширование
   useEffect(() => {
       if (isClient && !isLoading && products && products.length > 0) {
           const timer = setTimeout(() => {
              cacheImagesFromBackend(products);
           }, 1500);
           return () => clearTimeout(timer);
       }
   }, [products, isLoading, isClient]);

   // Компонент для табличного отображения (без изменений)
   const TableView = useCallback(() => { 
      // Проверяем filteredProducts перед использованием
      if (!filteredProducts || filteredProducts.length === 0) return null;

      return (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Фото</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Артикул</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts // Не нужно .filter(p => Number(p.stock) > 0), т.к. уже отфильтровано в useMemo
                .map((product) => {
                  // Добавляем проверку на product
                  if (!product) return null;

                  let originalUrl: string | null = null;
                   if (typeof product.imageAddresses === 'string') originalUrl = product.imageAddresses;
                   else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) originalUrl = product.imageAddresses[0];
                   else if (typeof product.imageAddress === 'string') originalUrl = product.imageAddress;
                   else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) originalUrl = product.imageAddress[0];

                  const mainImage = originalUrl ? normalizeUrl(originalUrl) : null;
                  const isPurchasable = Number(product.stock) > 0; // Проверка остается

                  return (
                    <tr key={`table-${product._id || ''}-${product.article}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                          {mainImage ? (
                            <SafeOptimizedImage src={mainImage} alt={product.name || 'Товар'} className="h-full w-full object-cover" />
                          ) : (
                            <CollagePlaceholder className="w-full h-full" style={{ borderRadius: '6px' }} />
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="text-xs sm:text-sm font-medium text-gray-900 hover:text-black hover:underline truncate block max-w-[120px] sm:max-w-[200px]">
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-2 py-2 hidden sm:table-cell"><span className="text-xs text-gray-500">{product.article}</span></td>
                      <td className="px-2 py-2"><span className="text-xs sm:text-sm font-medium">{product.price ? `${product.price} ₽` : 'По запросу'}</span></td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.preventDefault(); e.stopPropagation();
                            if (!isPurchasable) return;
                            try {
                              const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
                              const idx = cart.products.findIndex((item: any) => item.article === product.article);
                              if (idx > -1) cart.products[idx].quantity += 1;
                              else cart.products.push({ article: product.article, source: product.source, name: product.name || 'Товар', quantity: 1, imageUrl: mainImage });
                              localStorage.setItem('cart', JSON.stringify(cart));
                              toast.success('Товар добавлен');
                            } catch (err) { console.error('Ошибка добавления в корзину (table):', err); toast.error('Ошибка'); }
                          }}
                          className={`text-[10px] sm:text-xs py-1 px-1 sm:px-2 rounded ${isPurchasable ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          disabled={!isPurchasable}
                        >
                          В корзину
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      );
   }, [filteredProducts]); // Зависимость только от filteredProducts

   // Компонент карточки товара в режиме списка
   const ListProductCard = useCallback(({ product, index }: { product: ProductI, index: number }) => {
      const cardRef = useRef<HTMLDivElement>(null);
      const [shouldLoad, setShouldLoad] = useState(index < 8); // Грузим больше сразу

      useEffect(() => { // Observer
         if (shouldLoad || !cardRef.current) return;
         const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setShouldLoad(true); observer.disconnect(); }}, { rootMargin: '300px', threshold: 0.01 });
         observer.observe(cardRef.current);
         return () => observer.disconnect();
      }, [shouldLoad]);

      const mainImage = useMemo(() => {
          // Добавляем проверку product
          if (!product) return null;
          let originalUrl: string | null = null;
           if (typeof product.imageAddresses === 'string') originalUrl = product.imageAddresses;
           else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) originalUrl = product.imageAddresses[0];
           else if (typeof product.imageAddress === 'string') originalUrl = product.imageAddress;
           else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) originalUrl = product.imageAddress[0];
          return originalUrl ? normalizeUrl(originalUrl) : null;
      }, [product]); // Зависимость только от product

      const isPurchasable = useMemo(() => product ? Number(product.stock) > 0 : false, [product]); // Зависимость от product

      const handleAddToCart = useCallback((e: React.MouseEvent) => {
          e.preventDefault(); e.stopPropagation();
          if (!isPurchasable || !product) return;
          try {
              const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
              const idx = cart.products.findIndex((item: any) => item.article === product.article);
              // Используем mainImage из внешнего useMemo
              if (idx > -1) cart.products[idx].quantity += 1;
              else cart.products.push({ article: product.article, source: product.source, name: product.name || 'Товар', quantity: 1, imageUrl: mainImage });
              localStorage.setItem('cart', JSON.stringify(cart));
              toast.success('Товар добавлен');
          } catch (err) { console.error('Ошибка добавления в корзину (list):', err); toast.error('Ошибка'); }
      }, [product, mainImage, isPurchasable]); // <--- ДОБАВЛЕНЫ ЗАВИСИМОСТИ

      // Добавляем проверку product перед рендером
      if (!product) return null;

      return (
        <div ref={cardRef} className="flex flex-col sm:flex-row gap-3 p-3 border border-gray-100 rounded-lg bg-white hover:shadow-md transition-shadow">
          <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="block w-full sm:w-[120px] sm:min-w-[120px] md:w-[150px] md:min-w-[150px]"> {/* Уменьшили ширину */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-md min-h-[120px] md:min-h-[150px]"> {/* Добавили min-height */}
              {shouldLoad && mainImage ? (
                <SafeOptimizedImage src={mainImage} alt={product.name || 'Товар'} />
              ) : (
                <CollagePlaceholder className="w-full h-full" />
              )}
            </div>
          </Link>
          <div className="flex flex-col flex-grow justify-between py-1">
            <div>
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 product-name">
                <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="hover:underline">{product.name}</Link>
              </h3>
              <p className="text-xs text-gray-500 mt-1">Арт: {product.article}</p>
              {/* Убрали описание для упрощения */}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-2">
              <p className="text-sm sm:text-base font-semibold text-black price-text">{product.price ? `${product.price} ₽` : 'По запросу'}</p>
              <button onClick={handleAddToCart} className={`w-full sm:w-auto px-3 py-1.5 text-xs rounded-md cart-button ${isPurchasable ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} disabled={!isPurchasable}>
                В корзину
              </button>
            </div>
          </div>
        </div>
      );
   }, []); // Массив зависимостей useCallback должен включать все внешние переменные/функции, которые он использует

  // Компонент карточки товара (Grid View)
  const ProductCard = useCallback(({ product, index }: { product: ProductI, index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [shouldLoad, setShouldLoad] = useState(index < 3);
    const isLCPCandidate = index < 3;
    const isFirstProduct = index === 0; // Точно определяем первый продукт

    // Вычисляем URL изображения, передавая isFirstProduct
    let targetImageSrc: string | null = null;
    if (product) {
        let originalUrl: string | null = null;
        if (typeof product.imageAddresses === 'string') originalUrl = product.imageAddresses;
        else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) originalUrl = product.imageAddresses[0];
        else if (typeof product.imageAddress === 'string') originalUrl = product.imageAddress;
        else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) originalUrl = product.imageAddress[0];
        
        if (originalUrl) {
          // !!! Передаем isFirstProduct в normalizeUrl !!!
          targetImageSrc = normalizeUrl(originalUrl, isLCPCandidate, isFirstProduct);
        }
    }

    const isPurchasable = product ? Number(product.stock) > 0 : false;

    // Observer для отложенной загрузки (ТОЛЬКО для НЕ-LCP)
    useEffect(() => {
      if (isLCPCandidate || shouldLoad || !cardRef.current) return;
      
      const observer = new IntersectionObserver(([entry]) => { 
        if (entry.isIntersecting) { 
          setShouldLoad(true); 
          observer.disconnect(); 
        }
      }, { rootMargin: '500px', threshold: 0.01 }); 
      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }, [shouldLoad, isLCPCandidate]); // cardRef стабилен, isLCPCandidate зависит от index (стабилен для компонента)

    const handleAddToCart = useCallback((e: React.MouseEvent) => {
       e.preventDefault(); e.stopPropagation();
       if (!isPurchasable || !product) return;
       try {
           const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
           const idx = cart.products.findIndex((item: any) => item.article === product.article);
           // Используем targetImageSrc, вычисленный в рендере
           if (idx > -1) cart.products[idx].quantity += 1;
           else cart.products.push({ article: product.article, source: product.source, name: product.name || 'Товар', quantity: 1, imageUrl: targetImageSrc });
           localStorage.setItem('cart', JSON.stringify(cart));
           toast.success('Товар добавлен');
       } catch (err) { console.error('Ошибка добавления в корзину (grid):', err); toast.error('Ошибка'); }
    }, [product, targetImageSrc, isPurchasable]); // <--- ДОБАВЛЕНЫ ЗАВИСИМОСТИ

    if (!product) return null;
    
    const finalImageSrc = targetImageSrc;
    
    // --- РЕНДЕР LCP-кандидатов (index < 3) ---
    if (isLCPCandidate) {
      if (!finalImageSrc) { // Плейсхолдер на случай отсутствия URL
        return (
          <div className={`group bg-gray-100 rounded-lg border border-gray-100 flex flex-col h-full animate-pulse shadow-sm hover:shadow-md transition-shadow`}
               style={{ aspectRatio: '1 / 1' }}>
          </div>
        );
      }
       
      const lcpContainerStyle: React.CSSProperties = { 
        aspectRatio: '1 / 1', // Важно для CLS
        backgroundColor: '#fbfbfb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
        borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem',
      };

      const imageStyle: React.CSSProperties = {
        objectFit: 'contain', width: '100%', height: '100%', display: 'block',
      };
      
      // Определяем размеры LCP из констант
      const lcpWidth = isFirstProduct ? IMAGE_SIZES.ULTRA_SMALL_LCP : IMAGE_SIZES.SMALL_LCP;
      const lcpHeight = lcpWidth; // Предполагаем квадратные LCP

      // Определяем приоритеты и декодирование
      const loadingAttr = "eager";       // Всегда eager для LCP
      const fetchPriorityAttr = "high";    // Всегда high для LCP-кандидатов
      const decodingAttr = isFirstProduct ? "sync" : "async"; // sync только для первого

      return (
        // НЕ ИСПОЛЬЗУЕМ ref для LCP, Observer не нужен
        <div className={`group bg-white rounded-lg border border-gray-100 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow`}>
          <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="flex flex-col h-full" prefetch={false}>
            <div style={lcpContainerStyle}>
              <img
                src={finalImageSrc}
                alt={product.name || 'Товар'}
                className={`w-full h-full object-contain p-3 group-hover:scale-[1.02] transition-transform duration-300 ${isFirstProduct ? 'first-product-img' : ''}`}
                loading={loadingAttr}
                fetchPriority={fetchPriorityAttr}
                decoding={decodingAttr}
                style={imageStyle}
                width={lcpWidth}
                height={lcpHeight}
              />
            </div>
            <div className="p-3 sm:p-4 flex flex-col flex-grow border-t border-gray-100">
              <div className="mb-auto">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-black transition-colors">
                  {product.name}
                </h3>
                <p className="text-[10px] text-gray-500 mb-2">Арт: {product.article}</p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-sm sm:text-base font-semibold text-black">{product.price ? `${product.price} ₽` : 'По запросу'}</p>
                <button 
                  onClick={handleAddToCart} 
                  className={`inline-flex items-center justify-center px-3 py-1.5 text-xs rounded-md text-white ${
                    isPurchasable 
                      ? 'bg-black hover:bg-gray-800 active:bg-gray-900' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`} 
                  disabled={!isPurchasable}
                >
                  В корзину
                </button>
              </div>
            </div>
          </Link>
        </div>
      ); 
    }

    // --- Стандартный рендер для НЕ-LCP карточек (index >= 3) с background-image ---
    const imageDivStyle: React.CSSProperties = {
       aspectRatio: '1 / 1',
       backgroundSize: 'contain',
       backgroundRepeat: 'no-repeat',
       backgroundPosition: 'center',
       backgroundColor: '#fbfbfb',
       padding: '1rem',
       transition: 'transform 0.3s ease',
    };

    // Показываем фон только если shouldLoad (из IntersectionObserver) и URL готов
    if (shouldLoad && finalImageSrc) {
       imageDivStyle.backgroundImage = `url('${finalImageSrc.replace(/'/g, "\\'")}')`;
    }

    return (
      // Добавляем ref сюда, Observer нужен только для не-LCP
      <div ref={cardRef} className={`group bg-white rounded-lg border border-gray-100 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow`}>
        <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="flex flex-col h-full" prefetch={false}>
          <div
            style={imageDivStyle}
            className={`overflow-hidden rounded-t-lg group-hover:scale-[1.02] transition-transform duration-300 ${!shouldLoad || !finalImageSrc ? 'animate-pulse' : ''}`}
            role="img"
            aria-label={product.name || 'Товар'}
          >
            {/* Плейсхолдер для CLS */} 
            {(!shouldLoad || !finalImageSrc) && <div style={{ aspectRatio: '1 / 1' }} className="w-full h-auto bg-gray-100"></div>}
          </div>
          <div className="p-3 sm:p-4 flex flex-col flex-grow border-t border-gray-100">
            <div className="mb-auto">
              <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-black transition-colors">
                {product.name}
              </h3>
              <p className="text-[10px] text-gray-500 mb-2">Арт: {product.article}</p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-sm sm:text-base font-semibold text-black">{product.price ? `${product.price} ₽` : 'По запросу'}</p>
              <button 
                onClick={handleAddToCart} 
                className={`inline-flex items-center justify-center px-3 py-1.5 text-xs rounded-md text-white ${
                  isPurchasable 
                    ? 'bg-black hover:bg-gray-800 active:bg-gray-900' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`} 
                disabled={!isPurchasable}
              >
                В корзину
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }, []); // Добавьте зависимости, если useCallback использует внешние функции/переменные (normalizeUrl, toast)

  // Теперь условный рендер
  if (isLoading || !isClient) {
     if (viewMode === 'grid' && !isLoading) {
         return (
             <div className="grid auto-rows-auto w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-3 lg:gap-3 xl:grid-cols-3 xl:gap-3">
                 {Array.from({ length: 8 }).map((_, i) => (
                     <div key={i} className="bg-white rounded-lg border border-gray-100 flex flex-col h-full">
                         <div className="relative aspect-square bg-gray-100 rounded-t-lg"></div>
                         <div className="p-2 sm:p-4 flex flex-col flex-grow">
                             <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                             <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                             <div className="mt-auto flex items-center justify-between gap-2">
                                 <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                 <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         );
     }
    return null; // Или универсальный лоадер
  }

  // Если дошли сюда, значит !isLoading и isClient === true
  // Можно рендерить основной контент

  return (
    <>
      {/* Мобильные элементы управления */}
      <div className="block md:hidden mb-4 bg-white p-2 border border-gray-200 rounded-lg shadow-sm sticky top-0 z-10">
         <div className="flex justify-between items-center">
           <div className="flex items-center space-x-3">
             {/* ... Кнопки Grid/List ... */}
              <button
                onClick={() => { /* Логика смены viewMode */ console.log('Grid'); }}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-gray-100'}`}
                title="Отображение сеткой"
              >
                {/* SVG */}
              </button>
              <button
                onClick={() => { /* Логика смены viewMode */ console.log('List'); }}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-black text-white' : 'bg-gray-100'}`}
                title="Отображение списком"
              >
                {/* SVG */}
              </button>
           </div>
           <div className="text-xs text-gray-500">
             Товаров: {filteredProducts.length} {/* Используем длину уже отфильтрованного массива */}
           </div>
         </div>
      </div>

      {/* Основной контент */}
      {viewMode === 'table' ? (
        <TableView />
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredProducts.map((product, index) => (
              // Добавляем проверку product перед рендером
              product ? (
                  <ListProductCard
                      key={`list-${product._id || ''}-${product.article}`}
                      product={product}
                      index={index}
                  />
              ) : null
           ))}
          {/* Сообщение "Товары не найдены" */}
          {filteredProducts.length === 0 && (
             <div className="col-span-full py-8 sm:py-12 text-center">
                {/* SVG и текст */}
                <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">Товары не найдены</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">Попробуйте изменить параметры поиска</p>
             </div>
          )}
          {/* Кнопка "Наверх" */}
          {filteredProducts.length > 8 && (
             <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-4 right-4 bg-black text-white rounded-full p-3 shadow-lg md:hidden z-10" aria-label="Прокрутить наверх">
                {/* SVG */}
             </button>
          )}
        </div>
      ) : ( // Grid view
        // Убедимся, что isLoading обрабатывается правильно для предотвращения CLS=null
         (isLoading || !isClient) ? (
           <div className="grid w-full grid-cols-1 gap-2 xs:grid-cols-2 sm:gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-3 lg:gap-3 xl:grid-cols-3 xl:gap-3">
             {Array.from({ length: 12 }).map((_, i) => ( // Показываем больше скелетонов
               <div key={`skeleton-grid-${i}`} className="bg-white rounded-lg border border-gray-100 flex flex-col h-full">
                 <div className="relative aspect-square bg-gray-100 animate-pulse rounded-t-lg min-h-[150px] sm:min-h-[180px]"></div>
                 <div className="p-2 sm:p-4 flex flex-col flex-grow">
                   <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse min-h-[1rem]"></div>
                   <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse min-h-[0.75rem]"></div>
                   <div className="mt-auto flex items-center justify-between gap-2">
                     <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse min-h-[1.25rem]"></div>
                     <div className="h-8 bg-gray-300 rounded w-1/2 animate-pulse min-h-[2rem]"></div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         ) : filteredProducts.length > 0 ? (
           <div className="grid w-full grid-cols-1 gap-2 xs:grid-cols-2 sm:gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-3 lg:gap-3 xl:grid-cols-3 xl:gap-3">
             {filteredProducts.map((product, index) => (
                product ? (
                  <ProductCard
                      key={`grid-${product._id || ''}-${product.article}`}
                      product={product}
                      index={index}
                  />
                ) : null
              ))}
           </div>
         ) : (
            <div className="col-span-full py-8 sm:py-12 text-center">
               {/* SVG и текст "Товары не найдены" */}
                <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">Товары не найдены</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">Попробуйте изменить параметры поиска</p>
            </div>
         )
      )}

    </>
  );
};

export default CatalogOfProductSearch;