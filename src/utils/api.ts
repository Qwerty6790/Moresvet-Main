export const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.warn('API URL не определен, используется fallback');
    return 'https://more-svet-backend.vercel.app';
  }
  return apiUrl;
}; 

import axios from 'axios';
import { NEXT_PUBLIC_API_URL  } from './constants';

// Создаем экземпляр axios с настройками
const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  timeout: 10000, // Увеличиваем таймаут для стабильности
});

// Добавляем кеш для запросов
const cache = new Map();
const CACHE_TIME = 5 * 60 * 1000; // 5 минут

// Функция для получения данных с кешированием
const fetchWithCache = async (url: string, params: any, signal?: AbortSignal, forceFresh = false) => {
  const cacheKey = `${url}:${JSON.stringify(params)}`;
  
  // Проверяем кеш, если не требуется свежий запрос
  if (!forceFresh && cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (Date.now() - cachedData.timestamp < CACHE_TIME) {
      console.log('Используем кешированные данные:', url);
      return cachedData.data;
    }
  }
  
  // Выполняем запрос
  const { data } = await api.get(url, { 
    params, 
    signal,
    headers: {
      // Используем условное кеширование для более эффективного управления кешем
      'Cache-Control': forceFresh ? 'no-cache' : 'max-age=300',
    }
  });
  
  // Сохраняем в кеш
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};

/**
 * Функция для получения продуктов с правильной сортировкой
 * @param brandName Имя бренда
 * @param params Параметры запроса
 * @param signal AbortSignal для отмены запроса
 * @param forceFresh Требовать свежие данные без кеша
 * @returns Результат запроса
 */
export const fetchProductsWithSorting = async (
  brandName: string, 
  params: Record<string, any>, 
  signal?: AbortSignal,
  forceFresh = false
) => {
  // Проверяем и корректируем параметры сортировки
  const finalParams = { ...params };
  
  // Печатаем полученные параметры для отладки
  console.log('ИСХОДНЫЕ ПАРАМЕТРЫ СОРТИРОВКИ:', {
    sortBy: finalParams.sortBy,
    sortOrder: finalParams.sortOrder,
    sort: finalParams.sort
  });
  
  // Принудительно устанавливаем сортировку по убыванию цены
  finalParams.sortBy = 'price';
  finalParams.sortOrder = 'desc';
  
  // Удаляем все другие параметры сортировки, которые могут конфликтовать
  delete finalParams.randomSeed;
  
  // Отключаем кеширование напрямую для всех запросов продуктов
  forceFresh = true;
  
  // Выводим окончательные параметры для отладки
  console.log('ОКОНЧАТЕЛЬНЫЕ ПАРАМЕТРЫ API ЗАПРОСА (БЕЗ КЕША):', finalParams);
  
  try {
    // Напрямую выполняем запрос без использования кеша
    const url = `/api/products/${encodeURIComponent(brandName)}`;
    
    // Используем прямой запрос вместо кешированного
    const { data } = await api.get(url, { 
      params: finalParams, 
      signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    return data;
  } catch (error: unknown) {
    // Специальная обработка для ERR_BLOCKED_BY_CLIENT
    const axiosError = error as { code?: string; message?: string };
    if (axiosError.code === 'ERR_NETWORK' || axiosError.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.error('❌ Запрос заблокирован блокировщиком рекламы!');
      console.error('🔧 Решение: Отключите AdBlock/uBlock для домена more-elecktriki-backand.vercel.app');
      console.error('📋 Или добавьте домен в белый список блокировщика');
    }
    console.error('Ошибка запроса продуктов:', error);
    throw error;
  }
}; 

/**
 * Функция для поиска продуктов с правильной сортировкой
 * @param searchQuery Поисковый запрос
 * @param params Параметры запроса
 * @param signal AbortSignal для отмены запроса
 * @param forceFresh Требовать свежие данные без кеша
 * @returns Результат запроса
 */
export const searchProductsWithSorting = async (
  searchQuery: string, 
  params: Record<string, any>, 
  signal?: AbortSignal,
  forceFresh = false
) => {
  // Проверяем и корректируем параметры сортировки
  const finalParams: Record<string, any> = { ...params, name: searchQuery };
  
  // Устанавливаем параметры сортировки по умолчанию если не указаны
  if (!finalParams.sortBy) {
    finalParams.sortBy = 'price';
  }
  
  // Для случайной сортировки устанавливаем специальный параметр
  if (finalParams.sortBy === 'random') {
    finalParams.sortBy = 'price';
    // Добавляем случайный seed для обеспечения случайной сортировки
    finalParams.randomSeed = Math.floor(Math.random() * 1000000);
    // Удаляем sortOrder для случайной сортировки
    delete finalParams.sortOrder;
  }
  
  // Выводим окончательные параметры для отладки
  console.log('🔍 API search params:', finalParams);
  
  // Отладка зеркального поиска
  if (finalParams.mirroredSearches) {
    console.log('🪞 Зеркальные варианты поиска:', {
      original: finalParams.name,
      mirrored: finalParams.mirroredSearches
    });
  }
  
  try {
    const url = `/api/products/search`;
    return await fetchWithCache(url, finalParams, signal, forceFresh);
  } catch (error: unknown) {
    // Специальная обработка для ERR_BLOCKED_BY_CLIENT
    const axiosError = error as { code?: string; message?: string };
    if (axiosError.code === 'ERR_NETWORK' || axiosError.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.error('❌ Запрос заблокирован блокировщиком рекламы!');
      console.error('🔧 Решение: Отключите AdBlock/uBlock для домена more-elecktriki-backand.vercel.app');
      console.error('📋 Или добавьте домен в белый список блокировщика');
    }
    console.error('Ошибка поиска продуктов:', error);
    throw error;
  }
}; 