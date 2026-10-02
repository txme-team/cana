'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function VoteLinkCard({ url, eventTitle }: { url: string; eventTitle: string }) {
  const [copied, setCopied] = useState(false);
  const [big, setBig] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 접근이 막힌 환경 — 링크 텍스트를 직접 복사하면 됨
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => setBig(true)}
          className="shrink-0 self-start rounded-lg border border-gray-100 p-2 transition hover:border-cana/40"
          aria-label="QR코드 크게 보기"
        >
          <QRCodeSVG value={url} size={132} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">참가자 투표 링크</p>
          <p className="mt-1.5 break-all text-sm text-gray-700">{url}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              {copied ? '복사됨' : '링크 복사'}
            </button>
            <button
              type="button"
              onClick={() => setBig(true)}
              className="rounded-lg bg-cana px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cana-dark"
            >
              QR 크게 보기 (현장 화면용)
            </button>
          </div>
        </div>
      </div>

      {big && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white px-6"
          onClick={() => setBig(false)}
        >
          <p className="mb-2 text-center text-2xl font-bold text-gray-900">첫인상 투표</p>
          <p className="mb-6 text-center text-base text-gray-500">{eventTitle}</p>
          <QRCodeSVG
            value={url}
            size={512}
            style={{ width: 'min(70vw, 60vh)', height: 'min(70vw, 60vh)' }}
          />
          <p className="mt-6 text-center text-base text-gray-500">카메라로 QR코드를 스캔해서 투표해주세요</p>
          <p className="mt-8 text-xs text-gray-300">화면을 누르면 닫혀요</p>
        </div>
      )}
    </>
  );
}
