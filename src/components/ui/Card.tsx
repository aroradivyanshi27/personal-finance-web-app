import type { ReactNode, ButtonHTMLAttributes } from 'react';
import {
  type LucideIcon,
} from 'lucide-react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-ink-900 rounded-2xl shadow-card ${hover ? 'transition-shadow hover:shadow-card-hover' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
    secondary:
      'bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700',
    ghost:
      'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
  };
  const sizes = {
    sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2',
  };
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]'} />}
      {children}
    </button>
  );
}

interface ProgressBarProps {
  percentage: number;
  color?: 'brand' | 'amber' | 'rose' | 'blue' | 'violet';
  className?: string;
  showGlow?: boolean;
}

export function ProgressBar({
  percentage,
  color = 'brand',
  className = '',
  showGlow = false,
}: ProgressBarProps) {
  const colorClasses: Record<string, string> = {
    brand: 'bg-brand-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
  };
  const clamped = Math.min(Math.max(percentage, 0), 100);
  return (
    <div className={`h-2 bg-ink-200 dark:bg-ink-800 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${colorClasses[color]} rounded-full transition-all duration-700 ease-out ${showGlow ? 'shadow-sm' : ''}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  color?: 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'violet';
  className?: string;
}

export function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  const colors: Record<string, string> = {
    green: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    red: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    gray: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}
