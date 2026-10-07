import type { Transaction } from '../types';
import { CATEGORY_MAP, PAYMENT_METHOD_MAP, INCOME_CATEGORY_LABELS } from '../constants';
import { formatINR, formatDateShort } from '../lib/format';
import { Pencil, Trash2 } from 'lucide-react';
import { Icon } from './ui/Icon';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
  compact?: boolean;
}

export function TransactionRow({ transaction, onEdit, onDelete, compact = false }: TransactionRowProps) {
  const isIncome = transaction.type === 'income';
  const catLabel = isIncome
    ? INCOME_CATEGORY_LABELS[transaction.category] ?? 'Income'
    : CATEGORY_MAP[transaction.category as keyof typeof CATEGORY_MAP]?.label ?? 'Other';
  const catIcon = isIncome
    ? 'Wallet'
    : CATEGORY_MAP[transaction.category as keyof typeof CATEGORY_MAP]?.icon ?? 'Sparkle';
  const pm = PAYMENT_METHOD_MAP[transaction.paymentMethod];

  return (
    <div className="group flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors">
      <div
        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          isIncome
            ? 'bg-brand-100 dark:bg-brand-900/30'
            : 'bg-ink-100 dark:bg-ink-800'
        }`}
      >
        <Icon
          name={catIcon}
          className={`w-5 h-5 ${isIncome ? 'text-brand-600 dark:text-brand-400' : 'text-ink-500 dark:text-ink-400'}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-900 dark:text-white truncate">
          {transaction.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-ink-400 dark:text-ink-500">{catLabel}</span>
          <span className="text-ink-300 dark:text-ink-700 text-xs">·</span>
          <span className="text-xs text-ink-400 dark:text-ink-500">{pm?.label}</span>
          {!compact && (
            <>
              <span className="text-ink-300 dark:text-ink-700 text-xs">·</span>
              <span className="text-xs text-ink-400 dark:text-ink-500">{formatDateShort(transaction.date)}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-bold ${isIncome ? 'text-brand-600 dark:text-brand-400' : 'text-ink-900 dark:text-white'}`}
        >
          {isIncome ? '+' : '−'}
          {formatINR(transaction.amount).replace('₹', '₹')}
        </p>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-200 hover:text-ink-700 dark:hover:bg-ink-700 dark:hover:text-ink-200 transition-colors"
              aria-label="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction)}
              className="p-1.5 rounded-lg text-ink-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
