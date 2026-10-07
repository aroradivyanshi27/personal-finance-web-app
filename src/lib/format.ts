export function formatINR(amount: number, opts?: { compact?: boolean; sign?: boolean }): string {
  const sign = opts?.sign && amount > 0 ? '+' : '';
  const abs = Math.abs(amount);

  if (opts?.compact) {
    if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
    if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
    if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }

  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
  return `${amount < 0 ? '−' : sign}₹${formatted}`;
}

export function formatINRPlain(amount: number): string {
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function monthKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function currentMonthKey(): string {
  return monthKey(new Date());
}

export function prevMonthKey(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return monthKey(d);
}

export function daysUntil(iso: string): number {
  const target = new Date(iso);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
