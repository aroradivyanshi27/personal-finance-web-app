import { useState, useMemo } from 'react';
import { Plus, Target, Trash2, Trophy, Calendar, TrendingUp, Moon, Sun } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { formatINR, todayISO, toISODate } from '../lib/format';
import { getGoalProgress } from '../lib/calculations';
import type { SavingsGoal } from '../types';
import { Card, Button, ProgressBar, Badge } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useFinance();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);

  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCurrent, setFormCurrent] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [contributeAmount, setContributeAmount] = useState('');

  const progress = useMemo(() => getGoalProgress(goals), [goals]);

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const achievedCount = progress.filter((p) => p.status === 'achieved').length;

  const handleAdd = () => {
    setEditingGoal(null);
    setFormName('');
    setFormTarget('');
    setFormCurrent('');
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    setFormDate(toISODate(d));
    setFormErrors({});
    setFormOpen(true);
  };

  const handleEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setFormName(g.name);
    setFormTarget(String(g.targetAmount));
    setFormCurrent(String(g.currentAmount));
    setFormDate(g.targetDate);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Enter a goal name';
    const target = parseFloat(formTarget);
    if (!formTarget || isNaN(target) || target <= 0) errors.target = 'Enter a valid target amount';
    const current = parseFloat(formCurrent) || 0;
    if (current < 0) errors.current = 'Current amount cannot be negative';
    if (!formDate) errors.date = 'Select a target date';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: formName.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate: formDate,
      });
      showToast('Goal updated', 'success');
    } else {
      addGoal({
        name: formName.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate: formDate,
      });
      showToast('Goal created', 'success');
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteGoal(deleteId);
      showToast('Goal deleted', 'success');
      setDeleteId(null);
    }
  };

  const handleContribute = () => {
    if (!contributeGoal) return;
    const amount = parseFloat(contributeAmount);
    if (!contributeAmount || isNaN(amount) || amount <= 0) {
      showToast('Enter a valid amount', 'error');
      return;
    }
    contributeToGoal(contributeGoal.id, amount);
    showToast(`${formatINR(amount)} added to ${contributeGoal.name}`, 'success');
    setContributeGoal(null);
    setContributeAmount('');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">Savings Goals</h1>
          <p className="text-sm text-ink-400 dark:text-ink-500 mt-1">
            {goals.length} goal{goals.length !== 1 ? 's' : ''}
            {achievedCount > 0 && ` · ${achievedCount} achieved`}
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
            <span className="hidden sm:inline">New Goal</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase">Total Saved</p>
          <p className="text-lg font-bold text-brand-600 dark:text-brand-400 mt-1">{formatINR(totalSaved, { compact: true })}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase">Total Target</p>
          <p className="text-lg font-bold text-ink-900 dark:text-white mt-1">{formatINR(totalTarget, { compact: true })}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase">Progress</p>
          <p className="text-lg font-bold text-ink-900 dark:text-white mt-1">
            {totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(0)}%` : '—'}
          </p>
        </Card>
      </div>

      {/* Goals Grid */}
      {progress.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-ink-300 dark:text-ink-600" />
            </div>
            <p className="text-base font-semibold text-ink-700 dark:text-ink-200">No savings goals yet</p>
            <p className="text-sm text-ink-400 dark:text-ink-500 mt-1 max-w-xs">
              Set savings goals to track your progress toward things you want to buy or achieve.
            </p>
            <Button onClick={handleAdd} icon={Plus} className="mt-5">
              Create Goal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progress.map((gp) => {
            const barColor = gp.status === 'achieved' ? 'brand' : gp.status === 'behind' ? 'rose' : 'blue';
            return (
              <Card key={gp.goal.id} className="p-5" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gp.status === 'achieved' ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-ink-100 dark:bg-ink-800'}`}>
                      {gp.status === 'achieved' ? (
                        <Trophy className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                      ) : (
                        <Target className="w-5 h-5 text-ink-600 dark:text-ink-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink-900 dark:text-white">{gp.goal.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-ink-400" />
                        <p className="text-xs text-ink-400 dark:text-ink-500">
                          {gp.daysLeft > 0 ? `${gp.daysLeft} days left` : gp.daysLeft === 0 ? 'Due today' : `${Math.abs(gp.daysLeft)} days overdue`}
                        </p>
                      </div>
                    </div>
                  </div>
                  {gp.status === 'achieved' && <Badge color="green">Achieved!</Badge>}
                  {gp.status === 'behind' && <Badge color="red">Overdue</Badge>}
                </div>

                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold text-ink-900 dark:text-white">{formatINR(gp.goal.currentAmount)}</p>
                    <p className="text-xs text-ink-400 dark:text-ink-500">of {formatINR(gp.goal.targetAmount)}</p>
                  </div>
                  <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{gp.percentage.toFixed(0)}%</p>
                </div>

                <ProgressBar percentage={gp.percentage} color={barColor as 'brand' | 'rose' | 'blue'} showGlow />

                {gp.status !== 'achieved' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Save {formatINR(gp.monthlyNeeded, { compact: true })}/month to reach your goal
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  {gp.status !== 'achieved' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setContributeGoal(gp.goal);
                        setContributeAmount('');
                      }}
                    >
                      Add Money
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(gp.goal)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(gp.goal.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Form Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'New Savings Goal'}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
              Goal Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., New Laptop"
              autoFocus
              className={`w-full px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border-2 text-sm font-medium text-ink-900 dark:text-white placeholder:text-ink-300 focus:outline-none transition-colors ${
                formErrors.name ? 'border-rose-300 dark:border-rose-700' : 'border-transparent focus:border-brand-400'
              }`}
            />
            {formErrors.name && <p className="text-xs text-rose-500 mt-1">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-semibold">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  placeholder="50000"
                  className={`w-full pl-7 pr-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border-2 text-sm font-semibold text-ink-900 dark:text-white placeholder:text-ink-300 focus:outline-none transition-colors ${
                    formErrors.target ? 'border-rose-300 dark:border-rose-700' : 'border-transparent focus:border-brand-400'
                  }`}
                />
              </div>
              {formErrors.target && <p className="text-xs text-rose-500 mt-1">{formErrors.target}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                Already Saved
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-semibold">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={formCurrent}
                  onChange={(e) => setFormCurrent(e.target.value)}
                  placeholder="0"
                  className={`w-full pl-7 pr-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border-2 text-sm font-semibold text-ink-900 dark:text-white placeholder:text-ink-300 focus:outline-none transition-colors ${
                    formErrors.current ? 'border-rose-300 dark:border-rose-700' : 'border-transparent focus:border-brand-400'
                  }`}
                />
              </div>
              {formErrors.current && <p className="text-xs text-rose-500 mt-1">{formErrors.current}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
              Target Date
            </label>
            <input
              type="date"
              value={formDate}
              min={todayISO()}
              onChange={(e) => setFormDate(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border-2 text-sm font-medium text-ink-900 dark:text-white focus:outline-none transition-colors ${
                formErrors.date ? 'border-rose-300 dark:border-rose-700' : 'border-transparent focus:border-brand-400'
              }`}
            />
            {formErrors.date && <p className="text-xs text-rose-500 mt-1">{formErrors.date}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingGoal ? 'Save Changes' : 'Create Goal'}</Button>
          </div>
        </div>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        open={contributeGoal !== null}
        onClose={() => setContributeGoal(null)}
        title="Add Money to Goal"
        size="sm"
      >
        {contributeGoal && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800">
              <p className="text-sm font-bold text-ink-900 dark:text-white">{contributeGoal.name}</p>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">
                {formatINR(contributeGoal.currentAmount)} saved of {formatINR(contributeGoal.targetAmount)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                Amount to Add
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-semibold text-lg">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="1000"
                  autoFocus
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border-2 border-transparent focus:border-brand-400 text-lg font-semibold text-ink-900 dark:text-white placeholder:text-ink-300 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setContributeGoal(null)}>Cancel</Button>
              <Button onClick={handleContribute}>Add Money</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Goal?"
        message="This savings goal will be permanently removed. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
