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
  title: 'cana | Christian Rotation Dating',
  description: '크리스천 로테이션 소개팅 cana',
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
