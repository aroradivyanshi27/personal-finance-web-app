import type { View } from '../types';
import { Wallet, ArrowLeftRight, Target, PieChart } from 'lucide-react';
import { Icon } from './ui/Icon';

interface SidebarProps {
  view: View;
  onNavigate: (view: View) => void;
}

const NAV_ITEMS: { key: View; label: string; icon: typeof Wallet }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Wallet },
  { key: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { key: 'budgets', label: 'Budgets', icon: PieChart },
  { key: 'goals', label: 'Goals', icon: Target },
];

export function Sidebar({ view, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-ink-100 dark:border-ink-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Icon name="Wallet" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-ink-900 dark:text-white leading-tight">
              Paise Kahan Gaye
            </h1>
            <p className="text-xs text-ink-400 dark:text-ink-500">Bhai?</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${active ? 'text-brand-600 dark:text-brand-400' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-ink-100 dark:border-ink-800">
        <p className="text-xs text-ink-400 dark:text-ink-600">Track it. Understand it. Save it.</p>
      </div>
    </aside>
  );
}

interface BottomNavProps {
  view: View;
  onNavigate: (view: View) => void;
}

export function BottomNav({ view, onNavigate }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-ink-900 border-t border-ink-100 dark:border-ink-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                active
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-ink-400 dark:text-ink-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
