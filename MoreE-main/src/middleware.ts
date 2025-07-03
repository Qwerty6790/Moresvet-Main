import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Константы для типов файлов и кеширования
const STATIC_ASSETS = /\.(?:jpg|jpeg|gif|png|webp|avif|svg|ico|woff2|woff|eot|ttf|otf|css|js)$/i;
const FONTS = /\.(?:woff2|woff|eot|ttf|otf)$/i;
const IMAGES = /\.(?:jpg|jpeg|gif|png|webp|avif|svg|ico)$/i;
const SCRIPTS_STYLES = /\.(?:css|js)$/i;

// Пустой middleware, который просто пропускает все запросы
export function middleware(request: NextRequest) {
  // Базовая обработка запросов без сложной логики
  const response = NextResponse.next()
  
  // Добавляем безопасные заголовки
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

// Настраиваем matcher, чтобы middleware применялся к нужным путям
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}