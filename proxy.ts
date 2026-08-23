import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET_KEY || "rahasia-admin-falya-2026-super-aman";
const key = new TextEncoder().encode(secretKey);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Izinkan akses langsung ke halaman login
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Cek cookie sesi admin
  const sessionCookie = req.cookies.get("admin_session")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    // Verifikasi validitas JWT token
    await jwtVerify(sessionCookie, key, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch (error) {
    // Jika token tidak valid / kadaluarsa, arahkan ke login dan bersihkan cookie
    const response = NextResponse.redirect(new URL("/admin/login", req.url));
    response.cookies.delete("admin_session");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
