import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/rotation/admin',
          '/rotation/admin/*',
          '/rotation/my',
          '/rotation/my/*',
          '/rotation/onboard',
          '/rotation/profile',
          '/rotation/profile/*',
          '/rotation/apply/success',
          '/rotation/apply/fail',
          '/rotation/apply/complete',
          '/rotation/auth/*',
          '/api/*',
        ],
      },
    ],
    sitemap: 'https://cana.im/sitemap.xml',
  };
}
