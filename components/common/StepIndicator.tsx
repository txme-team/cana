interface Props {
  steps: string[];
  current: number;
}

export default function StepIndicator({ steps, current }: Props) {
  // 0 ~ 1 사이 진행률 (마지막 스텝 완료 = 1)
  const fraction = steps.length > 1 ? current / (steps.length - 1) : 0;

  return (
    <div className="relative w-full">
      {/* 배경선 — 첫 원 중앙(14px)부터 마지막 원 중앙(14px from right)까지 */}
      <div className="absolute left-3.5 right-3.5 top-3.5 h-px bg-cana-rule" />

      {/* 완료선 — scaleX로 진행도만큼 채움 */}
      <div
        className="absolute left-3.5 right-3.5 top-3.5 h-px origin-left bg-cana transition-transform duration-500"
        style={{ transform: `scaleX(${fraction})` }}
      />

      {/* 서클 + 라벨 — 첫/마지막이 양 끝에 정확히 붙도록 justify-between */}
      <div className="relative flex justify-between">
        {steps.map((label, i) => {
          const done   = i < current;
          const active = i === current;

          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                  done
                    ? 'bg-cana text-white'
                    : active
                    ? 'bg-cana text-white ring-[3px] ring-cana/20'
                    : 'border-2 border-cana-rule bg-white text-cana-ink3',
                ].join(' ')}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className={[
                  'text-xs text-center leading-tight',
                  active ? 'font-semibold text-cana'
                  : done  ? 'text-cana/70'
                  :         'text-cana-ink3',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
