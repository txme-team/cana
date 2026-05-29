export default function Footer() {
  return (
    <footer className="border-t border-cana-rule bg-cana-cream px-5 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 sm:flex-row sm:gap-16">

        {/* 좌측 — 로고 */}
        <div className="flex-shrink-0">
          <img src="/logos/logo_black.svg" alt="cana" className="h-[18px]" />
        </div>

        {/* 우측 — 사업자 정보 + 링크 + 카피라이트 */}
        <div className="flex flex-col gap-6">

          {/* 사업자 정보 */}
          <div className="flex flex-col gap-1 text-[11px] text-cana-ink3/70">
            <p className="font-semibold text-cana-ink3">주식회사 팀빌더</p>
            <p>대표 : 김지섭 &nbsp;|&nbsp; 연락처 : 070-4768-5491</p>
            <p>주소 : 서울특별시 강남구 강남대로 132길 55, 5층</p>
            <p>사업자등록번호 : 873-86-02735 &nbsp;|&nbsp; 통신판매업 신고번호 : (추후 추가 예정)</p>
          </div>

          {/* 링크 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <a
              href="https://instagram.com/cana_official"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cana-ink3 transition hover:text-cana"
            >
              Instagram
            </a>
            <span className="text-xs text-cana-rule">|</span>
            <a
              href="mailto:hello@cana.kr"
              className="text-xs text-cana-ink3 transition hover:text-cana"
            >
              문의하기
            </a>
            <span className="text-xs text-cana-rule">|</span>
            <a
              href="#"
              className="text-xs text-cana-ink3 transition hover:text-cana"
            >
              서비스 이용약관
            </a>
            <span className="text-xs text-cana-rule">|</span>
            <a
              href="#"
              className="text-xs font-bold text-cana-ink3 transition hover:text-cana"
            >
              개인정보처리방침
            </a>
          </div>

          {/* 카피라이트 */}
          <p className="text-[11px] text-cana-ink3/60">
            © 2026 cana. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
