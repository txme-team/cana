export const metadata = {
  title: '마이페이지',
  robots: { index: false, follow: false },
};

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
