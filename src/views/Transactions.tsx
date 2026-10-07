import { useState, useMemo } from 'react';
import { Plus, Search, X, ArrowDownUp, Moon, Sun } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORY_MAP, PAYMENT_METHOD_MAP, EXPENSE_CATEGORIES, INCOME_CATEGORY_LABELS } from '../constants';
import { formatINR, monthKey, currentMonthKey } from '../lib/format';
import type { Transaction, CategoryKey } from '../types';
import { Card, Button } from '../components/ui/Card';
import { TransactionRow } from '../components/TransactionRow';
import { TransactionForm } from '../components/TransactionForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Icon } from '../components/ui/Icon';

type SortBy = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type FilterType = 'all' | 'income' | 'expense';
type FilterPeriod = 'all' | 'this-month' | 'last-month';

export function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...transactions];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (CATEGORY_MAP[t.category as CategoryKey]?.label ?? '').toLowerCase().includes(q) ||
          (INCOME_CATEGORY_LABELS[t.category] ?? '').toLowerCase().includes(q) ||
          PAYMENT_METHOD_MAP[t.paymentMethod].label.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((t) => t.category === filterCategory);
    }

    // Period filter
    if (filterPeriod === 'this-month') {
      const key = currentMonthKey();
      result = result.filter((t) => monthKey(t.date) === key);
    } else if (filterPeriod === 'last-month') {
      const [y, m] = currentMonthKey().split('-').map(Number);
      const d = new Date(y, m - 2, 1);
      const key = monthKey(d);
      result = result.filter((t) => monthKey(t.date) === key);
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt);
        break;
      case 'amount-desc':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        result.sort((a, b) => a.amount - b.amount);
        break;
    }

    return result;
  }, [transactions, search, filterType, filterCategory, filterPeriod, sortBy]);

  const handleAdd = () => {
    setEditingTx(null);
    setFormOpen(true);
  };

  const handleEdit = (t: Transaction) => {
    setEditingTx(t);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      showToast('Transaction deleted', 'success');
      setDeleteId(null);
    }
  };

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const activeFilters = (filterType !== 'all' ? 1 : 0) + (filterCategory !== 'all' ? 1 : 0) + (filterPeriod !== 'all' ? 1 : 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-ink-400 dark:text-ink-500 mt-1">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-ink-900 shadow-card text-ink-500 hover:text-ink-800 dark:hover:text-ink-200 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <Button onClick={handleAdd} icon={Plus}>
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 sm:p-4">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase">Income</p>
          <p className="text-base sm:text-lg font-bold text-brand-600 dark:text-brand-400 mt-1">
            {formatINR(totalIncome, { compact: true })}
          </p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase">Expenses</p>
          <p className="text-base sm:text-lg font-bold text-rose-500 dark:text-rose-400 mt-1">
            {formatINR(totalExpense, { compact: true })}
          </p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase">Net</p>
          <p className={`text-base sm:text-lg font-bold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-500'}`}>
            {formatINR(totalIncome - totalExpense, { compact: true })}
          </p>
        </Card>
      </div>

      {/* Search + Filters */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 text-sm font-medium text-ink-900 dark:text-white placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <Button
            variant={showFilters || activeFilters > 0 ? 'primary' : 'secondary'}
            onClick={() => setShowFilters((s) => !s)}
            className="shrink-0"
          >
            <ArrowDownUp className="w-4 h-4" />
            {activeFilters > 0 && (
              <span className="ml-1 text-xs bg-white/20 rounded-full px-1.5 py-0.5">{activeFilters}</span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 space-y-3 animate-slide-up">
            {/* Type */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-ink-400 dark:text-ink-500 mr-1">Type:</span>
              {(['all', 'income', 'expense'] as FilterType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    filterType === t
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expense'}
                </button>
              ))}
            </div>

            {/* Period */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-ink-400 dark:text-ink-500 mr-1">Period:</span>
              {(['all', 'this-month', 'last-month'] as FilterPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPeriod(p)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    filterPeriod === p
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700'
                  }`}
                >
                  {p === 'all' ? 'All time' : p === 'this-month' ? 'This month' : 'Last month'}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-ink-400 dark:text-ink-500 mr-1">Category:</span>
              <button
                onClick={() => setFilterCategory('all')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700'
                }`}
              >
                All
              </button>
              {EXPENSE_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setFilterCategory(c.key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    filterCategory === c.key
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700'
                  }`}
                >
                  <Icon name={c.icon} className="w-3.5 h-3.5" />
                  {c.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-ink-400 dark:text-ink-500 mr-1">Sort:</span>
              {([
                { key: 'date-desc', label: 'Newest' },
                { key: 'date-asc', label: 'Oldest' },
                { key: 'amount-desc', label: 'High to Low' },
                { key: 'amount-asc', label: 'Low to High' },
              ] as { key: SortBy; label: string }[]).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    sortBy === s.key
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterCategory('all');
                  setFilterPeriod('all');
                }}
                className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-ink-300 dark:text-ink-600" />
            </div>
            <p className="text-base font-semibold text-ink-700 dark:text-ink-200">
              {transactions.length === 0 ? 'No transactions yet' : 'No transactions found'}
            </p>
            <p className="text-sm text-ink-400 dark:text-ink-500 mt-1 max-w-xs">
              {transactions.length === 0
                ? 'Start tracking your income and expenses to see them here.'
                : 'Try adjusting your search or filters.'}
            </p>
            {transactions.length === 0 && (
              <Button onClick={handleAdd} icon={Plus} className="mt-5">
                Add Transaction
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-5">
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {filtered.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                onEdit={handleEdit}
                onDelete={(tx) => setDeleteId(tx.id)}
              />
            ))}
          </div>
        </Card>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(data) => {
          if (editingTx) {
            updateTransaction(editingTx.id, data);
          } else {
            addTransaction(data);
          }
        }}
        editingTransaction={editingTx}
      />
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Transaction?"
        message="This transaction will be permanently removed. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
