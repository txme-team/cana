export const metadata = {
  title: '로그인',
  // 로그인 화면은 검색 결과에 노출될 필요가 없는 전환 단계 페이지라,
  // 홈으로 잘못 향하던 canonical을 자기참조로 바꾸는 대신 색인 자체를 막는다.
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
