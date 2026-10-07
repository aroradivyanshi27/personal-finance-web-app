import { useState, useMemo } from 'react';
import { Plus, AlertTriangle, CheckCircle2, AlertCircle, Moon, Sun } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { EXPENSE_CATEGORIES, CATEGORY_MAP } from '../constants';
import { formatINR, formatMonthYear } from '../lib/format';
import { getBudgetProgress } from '../lib/calculations';
import type { Budget, CategoryKey } from '../types';
import { Card, Button, ProgressBar, Badge } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Icon } from '../components/ui/Icon';

export function Budgets() {
  const { transactions, budgets, addBudget, updateBudget, deleteBudget } = useFinance();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState<CategoryKey>('food');
  const [formLimit, setFormLimit] = useState('');
  const [formError, setFormError] = useState('');

  const progress = useMemo(
    () => getBudgetProgress(transactions, budgets),
    [transactions, budgets]
  );

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = progress.reduce((s, p) => s + p.spent, 0);
  const overCount = progress.filter((p) => p.status === 'over').length;
  const warningCount = progress.filter((p) => p.status === 'warning').length;

  const handleAdd = () => {
    setEditingBudget(null);
    setFormCategory('food');
    setFormLimit('');
    setFormError('');
    setFormOpen(true);
  };

  const handleEdit = (b: Budget) => {
    setEditingBudget(b);
    setFormCategory(b.category);
    setFormLimit(String(b.limit));
    setFormError('');
    setFormOpen(true);
  };

  const handleSubmit = () => {
    const limit = parseFloat(formLimit);
    if (!formLimit || isNaN(limit) || limit <= 0) {
      setFormError('Enter a valid amount');
      return;
    }
    const existing = budgets.find((b) => b.category === formCategory && b.id !== editingBudget?.id);
    if (existing && !editingBudget) {
      setFormError('A budget for this category already exists');
      return;
    }
    if (editingBudget) {
      updateBudget(editingBudget.id, { category: formCategory, limit });
      showToast('Budget updated', 'success');
    } else {
      addBudget({ category: formCategory, limit });
      showToast('Budget created', 'success');
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteBudget(deleteId);
      showToast('Budget deleted', 'success');
      setDeleteId(null);
    }
  };

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (c) => !budgets.some((b) => b.category === c.key && b.id !== editingBudget?.id)
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">Budgets</h1>
          <p className="text-sm text-ink-400 dark:text-ink-500 mt-1">{formatMonthYear(new Date())}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-ink-900 shadow-card text-ink-500 hover:text-ink-800 dark:hover:text-ink-200 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <Button onClick={handleAdd} icon={Plus} disabled={availableCategories.length === 0 && !editingBudget}>
            <span className="hidden sm:inline">Add Budget</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase">Total Budget</p>
          <p className="text-lg font-bold text-ink-900 dark:text-white mt-1">{formatINR(totalBudget, { compact: true })}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase">Total Spent</p>
          <p className="text-lg font-bold text-ink-900 dark:text-white mt-1">{formatINR(totalSpent, { compact: true })}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase">Remaining</p>
          <p className={`text-lg font-bold mt-1 ${totalBudget - totalSpent >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-500'}`}>
            {formatINR(totalBudget - totalSpent, { compact: true })}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase">Alerts</p>
          <div className="flex items-center gap-2 mt-1">
            {overCount > 0 && <Badge color="red">{overCount} Over</Badge>}
            {warningCount > 0 && <Badge color="amber">{warningCount} Warning</Badge>}
            {overCount === 0 && warningCount === 0 && budgets.length > 0 && (
              <Badge color="green">All good</Badge>
            )}
            {budgets.length === 0 && <span className="text-sm text-ink-400">No budgets</span>}
          </div>
        </Card>
      </div>

      {/* Budget List */}
      {progress.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-4">
              <Icon name="PieChart" className="w-8 h-8 text-ink-300 dark:text-ink-600" />
            </div>
            <p className="text-base font-semibold text-ink-700 dark:text-ink-200">No budgets set yet</p>
            <p className="text-sm text-ink-400 dark:text-ink-500 mt-1 max-w-xs">
              Create monthly budgets for your spending categories to track and avoid overspending.
            </p>
            <Button onClick={handleAdd} icon={Plus} className="mt-5">
              Create Budget
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progress.map((bp) => {
            const meta = CATEGORY_MAP[bp.budget.category];
            const pct = bp.percentage.toFixed(0);
            const barColor = bp.status === 'over' ? 'rose' : bp.status === 'warning' ? 'amber' : 'brand';
            const StatusIcon = bp.status === 'over' ? AlertTriangle : bp.status === 'warning' ? AlertCircle : CheckCircle2;
            const statusColor = bp.status === 'over' ? 'text-rose-500' : bp.status === 'warning' ? 'text-amber-500' : 'text-brand-500';

            return (
              <Card key={bp.budget.id} className="p-5" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center">
                      <Icon name={meta?.icon ?? 'Sparkle'} className="w-5 h-5 text-ink-600 dark:text-ink-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink-900 dark:text-white">{meta?.label}</p>
                      <p className="text-xs text-ink-400 dark:text-ink-500">
                        {formatINR(bp.spent)} of {formatINR(bp.budget.limit)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                  </div>
                </div>

                <ProgressBar percentage={bp.percentage} color={barColor as 'brand' | 'amber' | 'rose'} showGlow />

                <div className="flex items-center justify-between mt-3">
                  <span className={`text-sm font-bold ${statusColor}`}>{pct}% used</span>
                  <span className="text-xs text-ink-400 dark:text-ink-500">
                    {bp.remaining >= 0
                      ? `${formatINR(bp.remaining, { compact: true })} left`
                      : `${formatINR(Math.abs(bp.remaining), { compact: true })} over`}
                  </span>
                </div>

                {bp.status === 'over' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      You've exceeded this budget by {formatINR(bp.spent - bp.budget.limit)}
                    </p>
                  </div>
                )}
                {bp.status === 'warning' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      You're approaching the limit. Only {formatINR(bp.remaining)} left.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(bp.budget)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(bp.budget.id)}>
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Budget Form Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingBudget ? 'Edit Budget' : 'Create Budget'}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-5 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => {
                const disabled = budgets.some((b) => b.category === cat.key && b.id !== editingBudget?.id);
                return (
                  <button
                    key={cat.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => setFormCategory(cat.key)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                      formCategory === cat.key
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                        : disabled
                        ? 'border-transparent bg-ink-50 dark:bg-ink-800/50 opacity-40 cursor-not-allowed'
                        : 'border-transparent bg-ink-50 dark:bg-ink-800 hover:bg-ink-100 dark:hover:bg-ink-700'
                    }`}
                  >
                    <Icon name={cat.icon} className="w-5 h-5 text-ink-600 dark:text-ink-300" />
                    <span className="text-[10px] font-medium text-ink-600 dark:text-ink-400 leading-tight text-center">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
              Monthly Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-semibold text-lg">₹</span>
              <input
                type="number"
                inputMode="numeric"
                value={formLimit}
                onChange={(e) => setFormLimit(e.target.value)}
                placeholder="5000"
                autoFocus
                className={`w-full pl-8 pr-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border-2 text-lg font-semibold text-ink-900 dark:text-white placeholder:text-ink-300 focus:outline-none transition-colors ${
                  formError ? 'border-rose-300 dark:border-rose-700' : 'border-transparent focus:border-brand-400'
                }`}
              />
            </div>
            {formError && <p className="text-xs text-rose-500 mt-1">{formError}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingBudget ? 'Save Changes' : 'Create Budget'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Budget?"
        message="This budget will be removed. You can always create a new one later."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
