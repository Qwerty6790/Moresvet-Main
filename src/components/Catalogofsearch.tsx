// ...

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ProductI } from '../types/interfaces';
import { toast } from 'sonner';

let prefetchImagesForRoutes: any = null;
try {
  prefetchImagesForRoutes = require('../lib/serviceWorkerRegistration').prefetchImagesForRoutes;
} catch (e) {}

interface CatalogOfProductProps {
  products: ProductI[];
  viewMode: 'grid' | 'list' | 'table';
  isLoading?: boolean;
}

const IMAGE_FORMATS = { AVIF: 'avif', WEBP: 'webp', JPG: 'jpg', PNG: 'png' };
const IMAGE_SIZES = { ULTRA_SMALL_LCP: 60, SMALL_LCP: 100, THUMBNAIL: 80, SMALL: 150, MEDIUM: 300 };
const QUALITY_LEVELS = { ULTRA_LOW: 15, LOW: 30, MEDIUM: 40, HIGH: 50, VERY_HIGH: 75 };
const IMAGE_CACHE_MAX_SIZE = 200;
const IMAGE_CACHE_ITEMS: Array<{key: string, format: string, url: string, timestamp: number}> = [];
const IMAGE_CACHE: Record<string, { format: string, url: string }> = {};

let imageWorker: Worker | null = null;
try {
  if (typeof window !== 'undefined' && 'Worker' in window) {
    const workerBlob = new Blob([`
      self.onmessage = function(e) {
        const { url, format } = e.data;
        const cacheStrategy = self.caches ? 'default' : 'force-cache';
        fetch(url, { mode: 'cors', cache: cacheStrategy })
          .then(r => { if (!r.ok) throw new Error('Network response was not ok for ' + url); return r.blob(); })
          .then(blob => self.postMessage({ url, blob, success: true }))
          .catch(err => self.postMessage({ url, success: false, error: err.message }));
      }
    `], { type: 'application/javascript' });
    imageWorker = new Worker(URL.createObjectURL(workerBlob));
  }
} catch (e) { console.warn('Ошибка создания воркера для изображений:', e); }

let isOffline = false;
let isLowBandwidth = false;
const supportCache = { avif: null as boolean | null, webp: null as boolean | null, jpeg2000: null as boolean | null };
let imageDB: IDBDatabase | null = null;
const DB_NAME = 'image_cache_db';
const STORE_NAME = 'images';

try {
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains(STORE_NAME)) db.deleteObjectStore(STORE_NAME);
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    };
    request.onsuccess = (event) => {
      imageDB = (event.target as IDBOpenDBRequest).result;
      if (imageDB) cleanupOldIndexedDBEntries(imageDB as IDBDatabase);
    };
    request.onerror = (event) => console.warn('Ошибка при открытии IndexedDB:', (event.target as IDBOpenDBRequest).error);
  }
} catch (e) { console.warn('Ошибка при инициализации IndexedDB:', e); }

function cleanupOldIndexedDBEntries(db: IDBDatabase): void {
  try {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const dayAgo = Date.now() - 86400000;
    const range = IDBKeyRange.upperBound(dayAgo);
    const cursorRequest = index.openCursor(range);
    cursorRequest.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result;
      if (cursor) {
        try { store.delete(cursor.primaryKey); } catch (delErr) { console.warn('Ошибка при удалении записи из IndexedDB:', delErr) }
        cursor.continue();
      }
    };
  } catch (e) { console.warn('Ошибка при очистке старых записей в IndexedDB:', e); }
}

const saveImageToIndexedDB = (url: string, blob: Blob): void => {
  if (!imageDB || !url || !blob || blob.size === 0) return;
  try {
    const readTx = imageDB.transaction(STORE_NAME, 'readonly');
    const storeRead = readTx.objectStore(STORE_NAME);
    const getReq = storeRead.get(url);
    getReq.onsuccess = () => {
      if (!getReq.result) {
        try {
          const writeTx = imageDB!.transaction(STORE_NAME, 'readwrite');
          const storeWrite = writeTx.objectStore(STORE_NAME);
          storeWrite.put({ url, blob, timestamp: Date.now() });
        } catch (eWrite) { console.warn('Ошибка при записи в IndexedDB:', eWrite); }
      }
    }
  } catch (e) { console.warn('Ошибка при сохранении в IndexedDB:', e); }
};

const getImageFromIndexedDB = async (url: string): Promise<Blob | null> => {
  if (!imageDB || !url) return null;
  return new Promise((resolve) => {
    try {
      const transaction = imageDB!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);
      request.onsuccess = () => resolve(request.result ? request.result.blob : null);
      request.onerror = () => { console.warn('Ошибка запроса get в IndexedDB:', request.error); resolve(null); };
    } catch (e) { console.warn('Ошибка при получении из IndexedDB:', e); resolve(null); }
  });
};

if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  isOffline = !navigator.onLine;
  try {
    window.addEventListener('online', () => isOffline = false);
    window.addEventListener('offline', () => isOffline = true);
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        const updateLowBandwidth = () => { isLowBandwidth = conn.saveData || /^(slow-)?2g$/.test(conn.effectiveType) || conn.downlink < 0.5; }
        updateLowBandwidth();
        conn.addEventListener('change', updateLowBandwidth);
      }
    }
  } catch (e) { console.warn('Ошибка при инициализации сетевых слушателей:', e); }
}

const isAvifSupported = (): boolean => {
  if (typeof window === 'undefined') return true;
  if (supportCache.avif !== null) return supportCache.avif;
  try {
    const canvas = document.createElement('canvas');
    const isLikelySupported = canvas.toDataURL('image/avif', 0.1).indexOf('data:image/avif') === 0;
    supportCache.avif = isLikelySupported;
    return isLikelySupported;
  } catch (e) { supportCache.avif = false; return false; }
}

const isWebPSupported = (): boolean => {
  if (typeof window === 'undefined') return true;
  if (supportCache.webp !== null) return supportCache.webp;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    const isSupported = canvas.toDataURL('image/webp', 0.1).indexOf('data:image/webp') === 0;
    supportCache.webp = isSupported;
    return isSupported;
  } catch (e) { supportCache.webp = false; return false; }
}

let connectionSpeed: 'fast' | 'slow' | 'unknown' = 'unknown';
let lastConnectionCheck = 0;

const isSlowConnection = (): boolean => {
  const now = Date.now();
  if (connectionSpeed !== 'unknown' && now - lastConnectionCheck < 5000) return connectionSpeed === 'slow';
  lastConnectionCheck = now;
  if (typeof window === 'undefined' || typeof navigator === 'undefined') { connectionSpeed = 'fast'; return false; }
  try {
    if (isOffline || isLowBandwidth) { connectionSpeed = 'slow'; return true; }
    if ('connection' in navigator) {
       const conn = (navigator as any).connection;
       if (conn && /^(slow-)?2g$/.test(conn.effectiveType)) { connectionSpeed = 'slow'; return true; }
    }
    connectionSpeed = 'fast';
    return false;
  } catch (e) { connectionSpeed = 'fast'; return false; }
};

const selectOptimalFormat = (isLCPElement = false, isFirstProduct = false): { format: string, quality: number } => {
  const avif = isAvifSupported();
  const webp = isWebPSupported();
  const slow = isSlowConnection();
  if (isFirstProduct) {
     if (slow && webp) return { format: IMAGE_FORMATS.WEBP, quality: QUALITY_LEVELS.ULTRA_LOW };
     if (webp) return { format: IMAGE_FORMATS.WEBP, quality: QUALITY_LEVELS.LOW };
     return { format: IMAGE_FORMATS.JPG, quality: QUALITY_LEVELS.LOW + 5 };
  }
  if (isLCPElement) {
     if (slow && webp) return { format: IMAGE_FORMATS.WEBP, quality: QUALITY_LEVELS.LOW };
     if (avif) return { format: IMAGE_FORMATS.AVIF, quality: QUALITY_LEVELS.MEDIUM };
     if (webp) return { format: IMAGE_FORMATS.WEBP, quality: QUALITY_LEVELS.HIGH };
     return { format: IMAGE_FORMATS.JPG, quality: QUALITY_LEVELS.VERY_HIGH };
  }
  if (avif) return { format: IMAGE_FORMATS.AVIF, quality: QUALITY_LEVELS.MEDIUM };
  if (webp) return { format: IMAGE_FORMATS.WEBP, quality: QUALITY_LEVELS.HIGH };
  return { format: IMAGE_FORMATS.JPG, quality: QUALITY_LEVELS.VERY_HIGH };
};

const getOptimalImageSize = (isLCP: boolean = false, isFirstProduct: boolean = false): number => {
  if (isLCP) return isFirstProduct ? IMAGE_SIZES.ULTRA_SMALL_LCP : IMAGE_SIZES.SMALL_LCP;
  if (isOffline) return IMAGE_SIZES.THUMBNAIL;
  const slow = isSlowConnection();
  if (slow) return IMAGE_SIZES.THUMBNAIL;
  return IMAGE_SIZES.SMALL;
};

const normalizeUrl = (originalUrl: string, isLCPCandidate: boolean = false, isFirstProduct: boolean = false): string | null => {
  if (!originalUrl) return null;
  const url = originalUrl.replace("#first-product", "").trim();
  const cacheKeyLookup = `${url}_${isLCPCandidate}_${isFirstProduct}`;
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
  if (IMAGE_CACHE_ITEMS.length >= IMAGE_CACHE_MAX_SIZE) {
    const itemsToRemoveCount = Math.max(1, Math.ceil(IMAGE_CACHE_ITEMS.length * 0.2));
    const itemsToRemove = IMAGE_CACHE_ITEMS.splice(0, itemsToRemoveCount);
    itemsToRemove.forEach(item => { delete IMAGE_CACHE[item.key]; });
  }
  const { format, quality } = selectOptimalFormat(isLCPCandidate, isFirstProduct);
  const size = getOptimalImageSize(isLCPCandidate, isFirstProduct);
  if (isOffline && typeof caches !== 'undefined') return url; 
  const isRelevantDomain = url.includes('lightstar.ru') || url.includes('moresvet.ru') || url.includes('divinare.ru');
  if (isRelevantDomain) {
    const baseUrl = url.split('?')[0];
    let optimizedUrl = `${baseUrl}?format=${format}&quality=${quality}&width=${size}`;
    if (format === 'jpg') optimizedUrl += '&progressive=true';
    optimizedUrl += '&strip=true';
    IMAGE_CACHE[cacheKeyLookup] = { format, url: optimizedUrl };
    IMAGE_CACHE_ITEMS.push({ key: cacheKeyLookup, format, url: optimizedUrl, timestamp: Date.now() });
    return optimizedUrl;
  }
  return url;
};

const cacheImagesFromBackend = (products: ProductI[]): void => {
  if (!imageDB || isOffline || typeof window === 'undefined' || !('fetch' in window)) return;
  const imagesToCache: { url: string, forceWebP: boolean }[] = [];
  products.slice(0, 10).forEach((product, index) => {
    let originalUrl: string | null = null;
    if (typeof product.imageAddresses === 'string') originalUrl = product.imageAddresses;
    else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) originalUrl = product.imageAddresses[0];
    else if (typeof product.imageAddress === 'string') originalUrl = product.imageAddress;
    else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) originalUrl = product.imageAddress[0];
    if (originalUrl) {
       const isLCP = index < 3;
       const normalized = normalizeUrl(originalUrl, isLCP);
       if (normalized) imagesToCache.push({ url: normalized, forceWebP: isLCP });
    }
  });
  const cacheNextImage = (index: number): void => {
      if (index >= imagesToCache.length) return;
      const { url } = imagesToCache[index];
      getImageFromIndexedDB(url).then(cachedBlob => {
          if (!cachedBlob) {
              try {
                  new URL(url);
                  const abortController = new AbortController();
                  const timeoutId = setTimeout(() => abortController.abort(), 8000);
                  fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', priority: 'low', signal: abortController.signal })
                      .then(response => {
                          clearTimeout(timeoutId);
                          if (!response.ok) throw new Error(`HTTP ${response.status}`);
                          return response.blob();
                      })
                      .then(blob => { if (blob.size > 0) saveImageToIndexedDB(url, blob); })
                      .catch(() => {});
              } catch (e) {}
          }
          cacheNextImage(index + 1);
      }).catch(() => { cacheNextImage(index + 1); });
  };
  cacheNextImage(0);
};

const CollagePlaceholder: React.FC<{ className?: string; style?: React.CSSProperties; label?: string }> = ({ className, style, label = 'MORESVET' }) => {
  const defaultStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000000',
    color: '#ffff',
    fontWeight: 600,
    letterSpacing: '0.1em',
    fontSize: '1rem',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    padding: '0.5rem'
  };

  return (
    <div className={className || ''} style={{ ...defaultStyle, ...style }}>
      <span>{label}</span>
    </div>
  );
};

const SafeOptimizedImage: React.FC<{
  src: string; alt: string; className?: string; priority?: boolean; isLCP?: boolean; width?: number; height?: number; decoding?: 'async' | 'sync' | 'auto';
}> = React.memo(({ src, alt, className, priority = false, isLCP = false, width, height, decoding }) => {
  const [error, setError] = useState(false);
  const handleError = useCallback(() => { setError(true); }, []);
  const aspectRatioStyle = width && height ? { aspectRatio: `${width}/${height}` } : undefined;
  
  if (!src || error) {
    return (
      <div className={`${className || ''} flex items-center justify-center w-full h-full`} style={aspectRatioStyle}>
        <CollagePlaceholder />
      </div>
    );
  }

  return (
      <img 
          src={src} 
          alt={alt} 
          className={`w-full h-full object-contain ${className || ''}`} 
          onError={handleError}
          decoding={decoding || 'async'}
          loading={isLCP || priority ? "eager" : "lazy"} 
          fetchPriority={isLCP ? "high" : "auto"}
          width={width} 
          height={height} 
          style={aspectRatioStyle} 
      />
  );
});
SafeOptimizedImage.displayName = 'SafeOptimizedImage';

const CartButton: React.FC<{
  product: ProductI; targetImageSrc?: string | null; mainImage?: string | null; isPurchasable: boolean; compact?: boolean;
}> = React.memo(({ product, targetImageSrc, mainImage, isPurchasable, compact = false }) => {
  const [quantity, setQuantity] = useState(0);
  const imageUrl = targetImageSrc || mainImage;

  useEffect(() => {
    try {
      const cart = JSON.parse(window.localStorage?.getItem('cart') || '{"products": []}');
      const item = cart.products.find((p: any) => p.article === product.article);
      setQuantity(item ? item.quantity : 0);
    } catch (e) {}
    const handleCartUpdate = () => {
      try {
        const cart = JSON.parse(window.localStorage?.getItem('cart') || '{"products": []}');
        const item = cart.products.find((p: any) => p.article === product.article);
        setQuantity(item ? item.quantity : 0);
      } catch (e) {}
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [product.article]);

  // --- THIS IS THE CORRECTED FUNCTION ---
  const updateCart = useCallback((newQuantity: number) => {
    try {
      const cart = JSON.parse(window.localStorage?.getItem('cart') || '{"products": []}');
      const idx = cart.products.findIndex((item: any) => item.article === product.article);
      
      if (newQuantity <= 0) {
        if (idx > -1) cart.products.splice(idx, 1);
      } else {
        if (idx > -1) {
          // If item exists, update its quantity and price
          cart.products[idx].quantity = newQuantity;
          cart.products[idx].price = product.price; // Update price in case it changed
        } else {
          // If new item, add it with all details, including price
          cart.products.push({ 
            article: product.article, 
            source: product.source, 
            name: product.name || 'Товар', 
            price: product.price, // **THE FIX IS HERE**
            quantity: newQuantity, 
            imageUrl: imageUrl 
          });
        }
      }
      
      window.localStorage?.setItem('cart', JSON.stringify(cart));
      setQuantity(newQuantity);
      window.dispatchEvent(new CustomEvent('cart-updated'));
      window.dispatchEvent(new CustomEvent('cart-added', { detail: { article: product.article, name: product.name, imageUrl: imageUrl || null, quantity: newQuantity }}));
      
      if (newQuantity > quantity) toast.success('Товар добавлен');
      else if (newQuantity === 0) toast.success('Товар удален');

    } catch (err) { console.error('Ошибка обновления корзины:', err); toast.error('Ошибка'); }
  }, [product, imageUrl, quantity]);

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isPurchasable) return;
    updateCart(quantity + 1);
  }, [quantity, isPurchasable, updateCart]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    updateCart(Math.max(0, quantity - 1));
  }, [quantity, updateCart]);

  if (!isPurchasable) {
    return <button className={`${compact ? 'text-[10px] sm:text-xs py-1.5 px-3' : 'px-4 py-2.5 text-xs'} rounded-lg  text-gray-400 cursor-not-allowed font-medium transition-all`} disabled>
      Нет в наличии
    </button>;
  }
  if (quantity === 0) {
    return <button onClick={handleAdd} className={`${compact ? 'text-[10px] sm:text-xs py-1.5 px-3' : 'px-4 py-2.5 text-xs'} rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all font-medium shadow-sm hover:shadow`}>
      В корзину
    </button>;
  }
  return <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-2'} bg-gray-50 rounded-lg p-0.5`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
    <button onClick={handleRemove} className={`${compact ? 'w-7 h-7 text-base' : 'w-9 h-9 text-lg'} flex items-center justify-center rounded-md bg-white hover:bg-gray-100 text-gray-700 transition-all shadow-sm font-medium`}>−</button>
    <span className={`${compact ? 'min-w-[24px] text-xs' : 'min-w-[28px] text-sm'} text-center text-gray-900 font-semibold`}>{quantity}</span>
    <button onClick={handleAdd} className={`${compact ? 'w-7 h-7 text-base' : 'w-9 h-9 text-lg'} flex items-center justify-center rounded-md bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-sm font-medium`}>+</button>
  </div>;
});
CartButton.displayName = 'CartButton';


const CatalogOfProductSearch: React.FC<CatalogOfProductProps> = ({ products, viewMode, isLoading = false }) => {
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

   useEffect(() => {
       if (isClient && !isLoading && products && products.length > 0) {
           const timer = setTimeout(() => { cacheImagesFromBackend(products); }, 1500);
           return () => clearTimeout(timer);
       }
   }, [products, isLoading, isClient]);

   const TableView = useCallback(() => { 
      if (!filteredProducts || filteredProducts.length === 0) return null;
      return (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Фото</th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Название</th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">Артикул</th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Цена</th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white  ">
              {filteredProducts.map((product) => {
                  if (!product) return null;
                  let originalUrl: string | null = null;
                   if (typeof product.imageAddresses === 'string') originalUrl = product.imageAddresses;
                   else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) originalUrl = product.imageAddresses[0];
                   else if (typeof product.imageAddress === 'string') originalUrl = product.imageAddress;
                   else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) originalUrl = product.imageAddress[0];
                  const mainImage = originalUrl ? normalizeUrl(originalUrl) : null;
                  const isPurchasable = Number(product.stock) > 0;
                  return (
                    <tr key={`table-${product._id || ''}-${product.article}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-lg flex items-center justify-center shadow-sm">
                          <SafeOptimizedImage src={mainImage!} alt={product.name || 'Товар'} className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="text-sm font-medium text-gray-900 hover:text-gray-700 hover:underline truncate block max-w-[140px] sm:max-w-[220px] transition-colors">
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs text-gray-500 font-mono">{product.article}</span></td>
                      <td className="px-4 py-3"><span className="text-sm font-semibold text-gray-900">{product.price ? `${product.price} ₽` : 'По запросу'}</span></td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <CartButton product={product} mainImage={mainImage} isPurchasable={isPurchasable} compact />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      );
   }, [filteredProducts]);

   const ListProductCard = useCallback(({ product, index }: { product: ProductI, index: number }) => {
      const cardRef = useRef<HTMLDivElement>(null);
      const [shouldLoad, setShouldLoad] = useState(index < 8);
      useEffect(() => {
         if (shouldLoad || !cardRef.current) return;
         const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setShouldLoad(true); observer.disconnect(); }}, { rootMargin: '300px', threshold: 0.01 });
         observer.observe(cardRef.current);
         return () => observer.disconnect();
      }, [shouldLoad]);
      const mainImage = useMemo(() => {
          if (!product) return null;
          let originalUrl: string | null = null;
           if (typeof product.imageAddresses === 'string') originalUrl = product.imageAddresses;
           else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) originalUrl = product.imageAddresses[0];
           else if (typeof product.imageAddress === 'string') originalUrl = product.imageAddress;
           else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) originalUrl = product.imageAddress[0];
          return originalUrl ? normalizeUrl(originalUrl) : null;
      }, [product]);
      const isPurchasable = useMemo(() => product ? Number(product.stock) > 0 : false, [product]);
      if (!product) return null;
      return (
        <div ref={cardRef} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:shadow-lg transition-all duration-300">
          <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="block w-full sm:w-[140px] sm:min-w-[140px] md:w-[160px] md:min-w-[160px]">
            <div className="relative aspect-square overflow-hidden rounded-lg min-h-[140px] md:min-h-[160px] shadow-sm">
              {shouldLoad ? <SafeOptimizedImage src={mainImage!} alt={product.name || 'Товар'} /> : <CollagePlaceholder />}
            </div>
          </Link>
          <div className="flex flex-col flex-grow justify-between py-1">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-gray-700 transition-colors">
                <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="hover:underline">{product.name}</Link>
              </h3>
              <p className="text-xs text-gray-400 font-mono">Арт: {product.article}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-3">
              <p className="text-base sm:text-lg font-bold text-gray-900">{product.price ? `${product.price} ₽` : 'По запросу'}</p>
              <CartButton product={product} mainImage={mainImage} isPurchasable={isPurchasable} />
            </div>
          </div>
        </div>
      );
   }, []);

  const ProductCard = useCallback(({ product, index }: { product: ProductI, index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [shouldLoad, setShouldLoad] = useState(index < 3);
    const isLCPCandidate = index < 3;
    const isFirstProduct = index === 0;

    const targetImageSrc = useMemo(() => {
        if (!product) return null;
        let originalUrl: string | null = null;
        if (typeof product.imageAddresses === 'string') originalUrl = product.imageAddresses;
        else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) originalUrl = product.imageAddresses[0];
        else if (typeof product.imageAddress === 'string') originalUrl = product.imageAddress;
        else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) originalUrl = product.imageAddress[0];
        
        return originalUrl ? normalizeUrl(originalUrl, isLCPCandidate, isFirstProduct) : null;
    }, [product, isLCPCandidate, isFirstProduct]);
    
    const isPurchasable = product ? Number(product.stock) > 0 : false;

    useEffect(() => {
      if (isLCPCandidate || shouldLoad || !cardRef.current) return;
      const observer = new IntersectionObserver(([entry]) => { 
        if (entry.isIntersecting) { setShouldLoad(true); observer.disconnect(); }
      }, { rootMargin: '500px', threshold: 0.01 }); 
      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }, [shouldLoad, isLCPCandidate]);

    if (!product) return null;
    
    const lcpWidth = isFirstProduct ? IMAGE_SIZES.ULTRA_SMALL_LCP : IMAGE_SIZES.SMALL_LCP;
    const lcpHeight = lcpWidth;

    return (
      <div ref={cardRef} className="group bg-white rounded-xl border border-gray-100 flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        <Link href={`/products/${product.source}/${encodeURIComponent(product.article)}`} className="flex flex-col h-full" prefetch={false}>
          <div className="relative aspect-square overflow-hidden ">
            {shouldLoad ? (
              <SafeOptimizedImage 
                src={targetImageSrc!}
                alt={product.name || 'Товар'}
                className="p-5 group-hover:scale-105 transition-transform duration-500"
                isLCP={isLCPCandidate}
                priority={isLCPCandidate}
                width={isLCPCandidate ? lcpWidth : undefined}
                height={isLCPCandidate ? lcpHeight : undefined}
                decoding={isFirstProduct ? "sync" : "async"}
              />
            ) : (
              <CollagePlaceholder />
            )}
          </div>
          <div className="p-4 sm:p-5 flex flex-col flex-grow border-t border-gray-50">
            <div className="mb-auto">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors leading-snug">{product.name}</h3>
              <p className="text-[10px] text-gray-400 font-mono mb-3">Арт: {product.article}</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-gray-50">
              <p className="text-base sm:text-lg font-bold text-gray-900">{product.price ? `${product.price} ₽` : 'По запросу'}</p>
              <CartButton product={product} targetImageSrc={targetImageSrc} isPurchasable={isPurchasable} />
            </div>
          </div>
        </Link>
      </div>
    );
  }, []);

  if (isLoading || !isClient) {
     if (viewMode === 'grid' && !isLoading) {
         return (
             <div className="grid auto-rows-auto w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-3 lg:gap-4 xl:grid-cols-3 xl:gap-4">
                 {Array.from({ length: 8 }).map((_, i) => (
                     <div key={i} className="bg-white rounded-xl border border-gray-100 flex flex-col h-full shadow-sm">
                         <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl animate-pulse"></div>
                         <div className="p-4 sm:p-5 flex flex-col flex-grow">
                             <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-2 animate-pulse"></div>
                             <div className="h-3 bg-gray-200 rounded-lg w-1/2 mb-4 animate-pulse"></div>
                             <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                                 <div className="h-6 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                                 <div className="h-9 bg-gray-300 rounded-lg w-1/2 animate-pulse"></div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         );
     }
    return null;
  }

  return (
    <>
      {viewMode === 'table' ? (
        <TableView />
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredProducts.map((product, index) => (
              product ? <ListProductCard key={`list-${product._id || ''}-${product.article}`} product={product} index={index} /> : null
           ))}
          {filteredProducts.length === 0 && (
             <div className="col-span-full py-12 sm:py-16 text-center">
                <div className="mx-auto w-24 h-24 mb-4 rounded-full  flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Товары не найдены</h3>
                <p className="text-sm text-gray-500">Попробуйте изменить параметры поиска</p>
             </div>
          )}
          {filteredProducts.length > 8 && (
             <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
               className="fixed bottom-6 right-6 bg-gray-900 text-white rounded-full p-3.5 shadow-xl md:hidden z-10 hover:bg-gray-800 transition-all hover:scale-110" 
               aria-label="Прокрутить наверх">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
             </button>
          )}
        </div>
      ) : (
         (isLoading || !isClient) ? (
           <div className="grid w-full grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-3 lg:gap-4 xl:grid-cols-3 xl:gap-4">
             {Array.from({ length: 12 }).map((_, i) => (
               <div key={`skeleton-grid-${i}`} className="bg-white rounded-xl border border-gray-100 flex flex-col h-full shadow-sm">
                 <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-t-xl min-h-[150px] sm:min-h-[180px]"></div>
                 <div className="p-4 sm:p-5 flex flex-col flex-grow">
                   <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-2 animate-pulse"></div>
                   <div className="h-3 bg-gray-200 rounded-lg w-1/2 mb-4 animate-pulse"></div>
                   <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                     <div className="h-6 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                     <div className="h-9 bg-gray-300 rounded-lg w-1/2 animate-pulse"></div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         ) : filteredProducts.length > 0 ? (
           <div className="grid w-full grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-3 lg:gap-4 xl:grid-cols-3 xl:gap-4">
             {filteredProducts.map((product, index) => (
                product ? <ProductCard key={`grid-${product._id || ''}-${product.article}`} product={product} index={index} /> : null
              ))}
           </div>
         ) : (
            <div className="col-span-full py-12 sm:py-16 text-center">
                <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Товары не найдены</h3>
                <p className="text-sm text-gray-500">Попробуйте изменить параметры поиска</p>
            </div>
         )
      )}
    </>
  );
};

export default CatalogOfProductSearch;