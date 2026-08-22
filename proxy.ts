import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Sembunyikan /admin di production (dikembalikan 404 sehingga tidak terekspos publik).
// Di development (NODE_ENV !== 'production'), halaman admin tetap bisa diakses.
export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
