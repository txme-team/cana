import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#1C1B1A] border-t border-white/8 py-12">
      <div className="max-w-5xl mx-auto px-5">
        <div className="flex items-start gap-16">
          {/* Logo */}
          <Image
            src="/txme-assets/logo-text-white.svg"
            alt="카나"
            width={72}
            height={20}
            className="shrink-0 mt-1"
          />

          {/* Right: company info + links + copyright */}
          <div>
            <div className="text-[13px] text-white/40 leading-[22px] space-y-0.5 mb-6">
              <p className="font-semibold text-white/60">주식회사 팀빌더</p>
              <p>대표 : 김지섭  │  연락처 : ask@teambuildercorp.com</p>
              <p>주소 : 서울특별시 강남구 강남대로 132길 55, 5층</p>
              <p>사업자등록번호 : 873-86-02735  │  통신판매업 신고번호 : 2023-서울강남-06128</p>
            </div>

            <div className="flex items-center gap-0 mb-6 text-[13px] text-white/40">
              {[
                { label: "Instagram", href: "https://instagram.com/cana_for_love" },
                { label: "서비스 이용약관", href: "/terms" },
                { label: "개인정보처리방침", href: "/privacy" },
              ].map(({ label, href }, i) => (
                <span key={label} className="flex items-center">
                  {i !== 0 && <span className="mx-3 text-white/20">│</span>}
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={`hover:text-white/70 transition-colors ${label === "개인정보처리방침" ? "font-semibold text-white/60" : ""}`}
                  >
                    {label}
                  </a>
                </span>
              ))}
            </div>

            <p className="text-[13px] text-white/30">© 2026 cana. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
