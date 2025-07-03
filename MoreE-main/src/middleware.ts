import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Константы для типов файлов и кеширования
const STATIC_ASSETS = /\.(?:jpg|jpeg|gif|png|webp|avif|svg|ico|woff2|woff|eot|ttf|otf|css|js)$/i;
const FONTS = /\.(?:woff2|woff|eot|ttf|otf)$/i;
const IMAGES = /\.(?:jpg|jpeg|gif|png|webp|avif|svg|ico)$/i;
const SCRIPTS_STYLES = /\.(?:css|js)$/i;

// Пустой middleware, который просто пропускает все запросы
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Настраиваем matcher, чтобы middleware применялся к нужным путям
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}