import { formatINR } from '../../lib/format';

interface TrendChartProps {
  data: { label: string; income: number; expenses: number; savings: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-ink-400 dark:text-ink-600">
        <p className="text-sm font-medium">Not enough data yet</p>
        <p className="text-xs mt-1">Your spending trends will appear here</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1);
  const barWidth = data.length > 4 ? 100 / data.length - 2 : 100 / data.length - 6;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 h-48 px-2">
        {data.map((d) => {
          const incomeHeight = (d.income / maxVal) * 100;
          const expenseHeight = (d.expenses / maxVal) * 100;
          return (
            <div
              key={d.label}
              className="flex-1 flex flex-col items-center gap-2 group"
            >
              <div className="w-full flex items-end justify-center gap-1 h-full relative">
                {/* Tooltip */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap bg-ink-900 dark:bg-ink-700 text-white text-xs rounded-lg px-3 py-2 shadow-elevated">
                  <div className="font-semibold">{d.label}</div>
                  <div className="text-brand-300">In: {formatINR(d.income, { compact: true })}</div>
                  <div className="text-rose-300">Out: {formatINR(d.expenses, { compact: true })}</div>
                  <div className="text-amber-300">Saved: {formatINR(d.savings, { compact: true })}</div>
                </div>
                <div
                  className="bg-brand-500/80 dark:bg-brand-500/60 rounded-t-sm transition-all duration-700 group-hover:bg-brand-500"
                  style={{ width: `${barWidth / 2}%`, height: `${incomeHeight}%` }}
                />
                <div
                  className="bg-rose-400/80 dark:bg-rose-500/50 rounded-t-sm transition-all duration-700 group-hover:bg-rose-500"
                  style={{ width: `${barWidth / 2}%`, height: `${expenseHeight}%` }}
                />
              </div>
              <span className="text-xs font-medium text-ink-400 dark:text-ink-500">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-ink-100 dark:border-ink-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-500" />
          <span className="text-xs font-medium text-ink-500 dark:text-ink-400">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-xs font-medium text-ink-500 dark:text-ink-400">Expenses</span>
        </div>
      </div>
    </div>
  );
}
