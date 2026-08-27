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
};

export default nextConfig;
