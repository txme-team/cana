interface Props {
  steps: string[];
  current: number;
}

export default function StepIndicator({ steps, current }: Props) {
  return (
    <div
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
    >
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;

        // 연결선 색상
        // 왼쪽 연결선 (i-1 → i): i-1이 완료됐으면 채움
        const leftFilled  = i > 0 && i <= current;
        // 오른쪽 연결선 (i → i+1): i가 완료됐으면 채움
        const rightFilled = i < steps.length - 1 && i < current;

        return (
          <div key={label} className="relative flex flex-col items-center">
            {/* 왼쪽 연결선 절반 */}
            {i > 0 && (
              <div
                className={[
                  'absolute top-3.5 left-0 right-1/2 h-px transition-colors',
                  leftFilled ? 'bg-cana' : 'bg-cana-rule',
                ].join(' ')}
              />
            )}

            {/* 오른쪽 연결선 절반 */}
            {i < steps.length - 1 && (
              <div
                className={[
                  'absolute top-3.5 left-1/2 right-0 h-px transition-colors',
                  rightFilled ? 'bg-cana' : 'bg-cana-rule',
                ].join(' ')}
              />
            )}

            {/* 서클 */}
            <div
              className={[
                'relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                done
                  ? 'bg-cana text-white'
                  : active
                  ? 'bg-cana text-white ring-[3px] ring-cana/20'
                  : 'border-2 border-cana-rule bg-white text-cana-ink3',
              ].join(' ')}
            >
              {done ? '✓' : i + 1}
            </div>

            {/* 라벨 */}
            <span
              className={[
                'mt-1.5 text-xs text-center leading-tight',
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
  );
}
