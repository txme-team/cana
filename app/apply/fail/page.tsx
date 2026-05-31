import Link from 'next/link';
import Nav from '@/components/landing/Nav';

export const metadata = { title: '결제 실패 | cana' };

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string }>;
}) {
  const params = await searchParams;
  const message = params.message
    ? decodeURIComponent(params.message)
    : '결제가 취소됐거나 오류가 발생했어요.';

  return (
    <>
      <Nav />
      <main className="flex min-h-screen flex-col items-center justify-center bg-cana-cream px-4 pt-16">
        <div className="w-full max-w-sm rounded-2xl border border-cana-rule bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-2 text-lg font-semibold text-cana-ink">
            결제에 실패했어요
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-cana-ink3">
            {message}
          </p>

          <div className="mb-6 h-px w-full bg-cana-rule" />

          <div className="flex flex-col gap-2">
            <Link
              href="/apply"
              className="block w-full rounded-xl bg-cana py-3 text-center text-base font-medium text-white transition active:bg-cana-dark"
            >
              다시 시도하기
            </Link>
            <Link
              href="/"
              className="block w-full rounded-xl border border-cana-rule py-3 text-center text-base text-cana-ink3 transition active:bg-cana-cream"
            >
              홈으로
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-cana-ink3">
          문의가 필요하시면{' '}
          <span className="font-medium text-cana">@cana_official</span>로 연락해주세요
        </p>
      </main>
    </>
  );
}
