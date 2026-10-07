import type { CategoryBreakdown } from '../../lib/calculations';
import { formatINR } from '../../lib/format';
import { Icon } from './Icon';

interface DonutChartProps {
  data: CategoryBreakdown[];
  total: number;
}

const COLOR_MAP: Record<string, string> = {
  orange: '#f97316',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  pink: '#ec4899',
  amber: '#f59e0b',
  rose: '#f43f5e',
  cyan: '#06b6d4',
  red: '#ef4444',
  indigo: '#6366f1',
  slate: '#64748b',
  emerald: '#10b981',
  teal: '#14b8a6',
  green: '#22c55e',
  lime: '#84cc16',
};

export function DonutChart({ data, total }: DonutChartProps) {
  if (data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-ink-400 dark:text-ink-600">
        <Icon name="PieChart" className="w-12 h-12 mb-3" />
        <p className="text-sm font-medium">No expenses to chart yet</p>
        <p className="text-xs mt-1">Add some transactions to see your breakdown</p>
      </div>
    );
  }

  const radius = 65;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative shrink-0">
        <svg width="170" height="170" viewBox="0 0 170 170" className="-rotate-90">
          <circle
            cx="85"
            cy="85"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-ink-100 dark:stroke-ink-800"
          />
          {data.map((item) => {
            const dash = (item.percentage / 100) * circumference;
            const segment = (
              <circle
                key={item.category}
                cx="85"
                cy="85"
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                stroke={COLOR_MAP[item.color] ?? '#64748b'}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            );
            offset += dash;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-ink-900 dark:text-white">
            {formatINR(total, { compact: true })}
          </span>
          <span className="text-xs text-ink-400 dark:text-ink-500 font-medium">Total spent</span>
        </div>
      </div>
      <div className="w-full space-y-2.5">
        {data.slice(0, 5).map((item) => (
          <div key={item.category} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: COLOR_MAP[item.color] ?? '#64748b' }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink-700 dark:text-ink-200 truncate">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-ink-900 dark:text-white shrink-0">
                  {formatINR(item.amount, { compact: true })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs text-ink-400">{item.percentage.toFixed(0)}% of total</span>
                <span className="text-xs text-ink-400">{item.count} txn{item.count > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        ))}
        {data.length > 5 && (
          <p className="text-xs text-ink-400 pt-1">+{data.length - 5} more categories</p>
        )}
      </div>
    </div>
  );
}
