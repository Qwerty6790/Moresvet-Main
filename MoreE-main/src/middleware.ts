import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


// Пустой middleware, который просто пропускает все запросы
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Настраиваем matcher, чтобы middleware применялся к нужным путям
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}