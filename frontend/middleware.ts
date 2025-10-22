import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 由于JWT token存储在localStorage中，middleware无法直接访问
  // 我们移除middleware中的认证逻辑，改为在客户端页面中进行验证
  // 这样可以避免依赖cookie或header传递token的问题
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclude static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
