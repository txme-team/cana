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
};

export default nextConfig;
