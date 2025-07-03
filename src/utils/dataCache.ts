/**
 * Утилита для кеширования данных и оптимизации запросов к API
 */

interface CacheOptions {
  maxAge?: number; // Время жизни кеша в миллисекундах
  staleWhileRevalidate?: boolean; // Возвращать устаревшие данные при перезапросе
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  isStale: boolean;
}

class DataCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultOptions: CacheOptions = {
    maxAge: 5 * 60 * 1000, // 5 минут по умолчанию
    staleWhileRevalidate: true,
  };

  /**
   * Получение данных из кеша или через функцию-загрузчик
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    const cachedItem = this.cache.get(key);
    const now = Date.now();

    // Проверяем наличие данных в кеше и их актуальность
    if (cachedItem) {
      const isExpired = now - cachedItem.timestamp > (opts.maxAge || 0);
      
      // Если данные не просрочены, возвращаем их
      if (!isExpired) {
        return cachedItem.data;
      }
      
      // Если просрочены, но можно использовать устаревшие данные
      if (opts.staleWhileRevalidate) {
        // Помечаем данные как устаревшие
        this.cache.set(key, { ...cachedItem, isStale: true });
        
        // Асинхронно обновляем кеш
        this.updateCache(key, fetcher, opts).catch(console.error);
        
        // Возвращаем устаревшие данные немедленно
        return cachedItem.data;
      }
    }

    // Если нет в кеше или нельзя использовать устаревшие данные, загружаем заново
    return this.updateCache(key, fetcher, opts);
  }

  /**
   * Обновление данных в кеше
   */
  private async updateCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    try {
      // Загружаем данные
      const data = await fetcher();
      
      // Помещаем в кеш
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        isStale: false,
      });
      
      return data;
    } catch (error) {
      // В случае ошибки, если у нас есть устаревшие данные, возвращаем их
      const cachedItem = this.cache.get(key);
      if (cachedItem) {
        console.warn(`Ошибка обновления кеша для ${key}, возвращаем устаревшие данные`);
        return cachedItem.data;
      }
      
      // Иначе прокидываем ошибку дальше
      throw error;
    }
  }

  /**
   * Принудительное обновление кеша
   */
  async invalidate<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    return this.updateCache(key, fetcher, this.defaultOptions);
  }

  /**
   * Удаление элемента из кеша
   */
  remove(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Очистка всего кеша
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Установка значения в кеш вручную
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isStale: false,
    });
  }
}

// Создаем один экземпляр для всего приложения
const dataCache = new DataCache();

export default dataCache; 