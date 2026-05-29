import Link from 'next/link';

export default function CompletePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cana/10">
            <svg
              className="h-8 w-8 text-cana"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-lg font-semibold text-gray-900">신청이 완료됐어요!</h1>
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          cana 팀이 확인 후 개별 연락드릴게요.
          <br />
          기다려주셔서 감사해요 :)
        </p>

        <div className="h-px w-full bg-gray-100 mb-6" />

        <p className="mb-1 text-xs text-gray-400">cana | CHRISTIAN ROTATION DATING</p>
        <p className="text-xs text-gray-400">문의: @cana_official</p>
      </div>

      <Link
        href="/"
        className="mt-6 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
