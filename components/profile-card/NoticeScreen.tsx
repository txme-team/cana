export default function NoticeScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cana-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-cana-rule bg-white p-8 text-center shadow-sm">
        <p className="mb-4 text-xs font-medium tracking-wide text-cana">CANA</p>
        <h1 className="mb-2 text-lg font-semibold text-cana-ink">{title}</h1>
        <p className="text-sm leading-relaxed text-cana-ink3">{description}</p>
      </div>
    </main>
  );
}
