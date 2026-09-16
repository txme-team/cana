console.log(`\n>>> APP_ENV = ${process.env.APP_ENV ?? 'unset'} (${process.env.NEXT_PUBLIC_APP_URL})\n`);

const supabaseHostname =
  process.env.APP_ENV === 'prod'
    ? 'xbqmwomochywvnpozakb.supabase.co'
    : 'qiacxbqclvgzagtuciwp.supabase.co'; // 새 dev 프로젝트 ref로 교체

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // These paths belong to the existing Cana app. The Lightsail gateway handles
  // them on cana.im/dev.cana.im; exact redirects keep the standalone Vercel
  // landing usable without restoring the old catch-all rewrite (which would
  // loop unknown /rotation paths back through the gateway).
  async redirects() {
    return [
      { source: '/home', destination: 'https://cana.im/home', permanent: false },
      { source: '/terms', destination: 'https://cana.im/terms', permanent: false },
      { source: '/privacy', destination: 'https://cana.im/privacy', permanent: false },
    ];
  },

  // 이 앱이 서빙하는 /rotation/* 전체에 적용되는 기본 보안 헤더.
  // CSP는 clickjacking 방지용 frame-ancestors만 건다 — Next.js 인라인
  // 하이드레이션 스크립트를 막지 않으려고 script-src 등은 넣지 않았다.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
