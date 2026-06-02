interface Props {
  steps: string[];
  current: number;
}

export default function StepIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-start">
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;

        return (
          <div key={label} className="flex flex-1 items-start min-w-0">
            {/* 서클 + 라벨 */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
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
                  'text-xs text-center leading-tight whitespace-nowrap',
                  active ? 'font-semibold text-cana'
                  : done  ? 'text-cana/70'
                  :         'text-cana-ink3',
                ].join(' ')}
              >
                {label}
              </span>
            </div>

            {/* 연결선 */}
            {i < steps.length - 1 && (
              <div
                className={[
                  'mt-3.5 h-px flex-1 transition-all',
                  done ? 'bg-cana' : 'bg-cana-rule',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
