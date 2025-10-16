// import { updateSession } from "@/utils/supabase/middleware"
import { type NextRequest } from "next/server"

// export async function middleware(request: NextRequest) {
//   return await updateSession(request)
// }

export async function middleware(request: NextRequest) {
}

export const config = {
  matcher: [
    // Exclude static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
