import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Константы для типов файлов и кеширования
const STATIC_ASSETS = /\.(?:jpg|jpeg|gif|png|webp|avif|svg|ico|woff2|woff|eot|ttf|otf|css|js)$/i;
const FONTS = /\.(?:woff2|woff|eot|ttf|otf)$/i;
const IMAGES = /\.(?:jpg|jpeg|gif|png|webp|avif|svg|ico)$/i;
const SCRIPTS_STYLES = /\.(?:css|js)$/i;

// Пустой middleware, который просто пропускает все запросы
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl;
  
  // Добавляем агрессивные заголовки кеширования для статических ресурсов
  if (STATIC_ASSETS.test(pathname)) {
    // Изображения: max-age на год
    if (IMAGES.test(pathname)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } 
    // Шрифты: долгосрочное кеширование
    else if (FONTS.test(pathname)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } 
    // CSS и JS: кеширование с валидацией
    else if (SCRIPTS_STYLES.test(pathname)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
  } 
  // Кешируем API-запросы на короткое время с возможностью revalidate во время устаревания
  else if (pathname.startsWith('/api/')) {
    // Не кешируем мутирующие запросы
    const method = request.method.toUpperCase();
    if (method === 'GET') {
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
    } else {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
  } 
  // Для JSON-ответов используем умеренное кеширование
  else if (pathname.endsWith('.json')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400');
  }
  // Для HTML страниц
  else if (!pathname.includes('.') || pathname.endsWith('.html')) {
    // Умеренное кеширование для статических страниц, но с частой проверкой валидности
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
  }

  // Добавляем заголовки безопасности
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  
  // Добавляем заголовки производительности
  response.headers.set('Server-Timing', 'cdn-cache;desc=HIT');
  
  // Оптимизация сжатия
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  if (acceptEncoding.includes('br')) {
    response.headers.set('Content-Encoding', 'br');
  } else if (acceptEncoding.includes('gzip')) {
    response.headers.set('Content-Encoding', 'gzip');
  }
  
  // Вывод Resource Hints для браузера
  if (!pathname.includes('.')) {
    // Добавляем preload для критичных ресурсов
    const preloadLinks = [
      '</favicon.ico>; rel=preload; as=image',
    ].join(', ');
    
    response.headers.set('Link', preloadLinks);
  }

  return response
}

// Настраиваем matcher, чтобы middleware применялся к нужным путям
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Применяем middleware к API-запросам
    '/api/:path*',
    // Применяем middleware к статическим ресурсам
    '/(.*\\.(?:jpg|jpeg|gif|png|webp|avif|svg|ico|css|js|woff2|ttf))'
  ],
}

