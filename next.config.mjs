console.log(`\n>>> APP_ENV = ${process.env.APP_ENV ?? 'unset'} (${process.env.NEXT_PUBLIC_APP_URL})\n`);

const supabaseHostname =
  process.env.APP_ENV === 'prod'
    ? 'xbqmwomochywvnpozakb.supabase.co'
    : 'qiacxbqclvgzagtuciwp.supabase.co'; // 새 dev 프로젝트 ref로 교체

// cana.im에서 이 Next.js 앱이 처리하지 않는 경로(/home, /signup, /login 등 기존 서비스)는
// 기존 AWS Lightsail 서버로 그대로 전달한다.
// fallback rewrite는 이 앱의 페이지/API/정적 파일에 매칭되는 게 전혀 없을 때만 동작하므로,
// '/', '/rotation/*', '/api/*' 등 이 앱의 라우트는 영향을 받지 않는다.
const LEGACY_ORIGIN = 'https://cana-prod.3zbgfx23jqqer.ap-northeast-2.cs.amazonlightsail.com';

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

  async rewrites() {
    if (process.env.APP_ENV !== 'prod') return [];

    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/:path*',
          destination: `${LEGACY_ORIGIN}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
