import type { NextConfig } from "next";

// Security headers untuk seluruh response (defense-in-depth)
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://images.unsplash.com; font-src 'self' data:; connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "clsx", "tailwind-merge"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Izinkan query-string cache-buster (?v=hash, lihat
    // lib/utils/cacheBustImage.ts) pada gambar lokal di /images/** —
    // `search` sengaja tidak diisi karena hash-nya berbeda per file.
    localPatterns: [{ pathname: "/images/**" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Foto menu di-serve dengan query-string cache-buster (?v=hash
        // konten, lihat lib/utils/cacheBustImage.ts + scripts/generate-
        // image-manifest.mjs) — begitu isi file berubah, URL-nya ikut
        // berubah, jadi aman diberi cache sangat panjang di sini: file
        // lama tidak akan diminta lagi, dan file baru otomatis punya
        // URL baru yang belum pernah di-cache siapa pun.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        // Redirect URL lama berakhiran .html ke URL bersih yang baru
        source: "/:slug.html",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
