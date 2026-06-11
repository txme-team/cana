import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '100 900',
  display: 'swap',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Segoe UI',
    'sans-serif',
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cana.im'),
  title: {
    default: '카나 | 크리스천끼리 설레는 이상형 찾기',
    template: '%s | 카나',
  },
  description: '같은 믿음을 가진 사람들을 위한 프리미엄 소개팅 서비스. 크리스천끼리 설레는 이상형 찾기',
  openGraph: {
    title: '카나 | 크리스천끼리 설레는 이상형 찾기',
    description: '같은 믿음을 가진 사람들을 위한 프리미엄 소개팅 서비스. 크리스천끼리 설레는 이상형 찾기',
    url: 'https://cana.im',
    siteName: '카나',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '카나 | 크리스천끼리 설레는 이상형 찾기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '카나 | 크리스천끼리 설레는 이상형 찾기',
    description: '같은 믿음을 가진 사람들을 위한 프리미엄 소개팅 서비스. 크리스천끼리 설레는 이상형 찾기',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-[family-name:var(--font-pretendard)] antialiased">
        {children}
      </body>
    </html>
  );
}
