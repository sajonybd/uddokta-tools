import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    console.log("Middleware checking path:", req.nextUrl.pathname);
    console.log("Token role:", req.nextauth.token?.role);
    
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
      console.log("Redirecting to dashboard - Not Admin");
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] }
