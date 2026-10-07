import type { LucideIcon } from 'lucide-react';
import { Card } from './ui/Card';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
}

export function StatCard({ label, value, icon: IconCmp, iconColor, iconBg, subtitle, trend }: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5" hover>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white mt-1 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1.5">
              <span
                className={`text-xs font-semibold ${trend.positive ? 'text-brand-600 dark:text-brand-400' : 'text-rose-500'}`}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <IconCmp className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}
