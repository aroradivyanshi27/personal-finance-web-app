import { useMemo } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Plus,
  Moon,
  Sun,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  PieChart,
  Target,
  Trophy,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import {
  getMonthlyStats,
  getAvailableBalance,
  getCategoryBreakdown,
  getBudgetProgress,
  getGoalProgress,
  getMonthlyTrend,
  getRecentTransactions,
  getHealthScore,
  getInsights,
  getSavingsRecommendations,
} from '../lib/calculations';
import { formatINR, formatMonthYear, currentMonthKey, prevMonthKey } from '../lib/format';
import { CATEGORY_MAP } from '../constants';
import { Card, Button, ProgressBar, Badge } from '../components/ui/Card';
import { DonutChart } from '../components/ui/DonutChart';
import { TrendChart } from '../components/ui/TrendChart';
import { StatCard } from '../components/StatCard';
import { TransactionRow } from '../components/TransactionRow';
import { Icon } from '../components/ui/Icon';
import type { View } from '../types';

interface DashboardProps {
  onNavigate: (view: View) => void;
  onAddTransaction: () => void;
}

const INSIGHT_ICONS: Record<string, typeof TrendingUp> = {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  PieChart,
  Target,
  Trophy,
  PiggyBank,
};

export function Dashboard({ onNavigate, onAddTransaction }: DashboardProps) {
  const { transactions, budgets, goals, loading } = useFinance();
  const { theme, toggleTheme } = useTheme();

  const stats = useMemo(() => getMonthlyStats(transactions), [transactions]);
  const prevStats = useMemo(
    () => getMonthlyStats(transactions, prevMonthKey(currentMonthKey())),
    [transactions]
  );
  const balance = useMemo(() => getAvailableBalance(transactions), [transactions]);
  const breakdown = useMemo(() => getCategoryBreakdown(transactions), [transactions]);
  const budgetProgress = useMemo(
    () => getBudgetProgress(transactions, budgets),
    [transactions, budgets]
  );
  const goalProgress = useMemo(() => getGoalProgress(goals), [goals]);
  const trend = useMemo(() => getMonthlyTrend(transactions, 4), [transactions]);
  const recent = useMemo(() => getRecentTransactions(transactions, 5), [transactions]);
  const health = useMemo(
    () => getHealthScore(transactions, budgets, goals),
    [transactions, budgets, goals]
  );
  const insights = useMemo(
    () => getInsights(transactions, budgets, goals),
    [transactions, budgets, goals]
  );
  const recommendations = useMemo(
    () => getSavingsRecommendations(transactions, budgets),
    [transactions, budgets]
  );

  const expenseTrendPct = prevStats.expenses > 0
    ? Math.round(((stats.expenses - prevStats.expenses) / prevStats.expenses) * 100)
    : 0;
  const incomeTrendPct = prevStats.income > 0
    ? Math.round(((stats.income - prevStats.income) / prevStats.income) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const insightColorMap = {
    positive: { bg: 'bg-brand-50 dark:bg-brand-900/20', text: 'text-brand-600 dark:text-brand-400', border: 'border-brand-200 dark:border-brand-800' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    negative: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">
            Paise Kahan Gaye Bhai? <span className="inline-block">👀</span>
          </h1>
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
          <Button onClick={onAddTransaction} icon={Plus} className="shadow-sm">
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>

      {/* Balance Hero */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-brand-600 to-brand-700 dark:from-brand-700 dark:to-brand-800 border-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-brand-100">Available Balance</p>
          <Wallet className="w-5 h-5 text-brand-200" />
        </div>
        <p className="text-3xl sm:text-4xl font-bold text-white">{formatINR(balance)}</p>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-brand-500/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-brand-100">Income (This month)</p>
              <p className="text-sm font-bold text-white">{formatINR(stats.income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-brand-100">Expenses (This month)</p>
              <p className="text-sm font-bold text-white">{formatINR(stats.expenses)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Income"
          value={formatINR(stats.income)}
          icon={ArrowDownLeft}
          iconColor="text-brand-600 dark:text-brand-400"
          iconBg="bg-brand-100 dark:bg-brand-900/30"
          trend={prevStats.income > 0 ? { value: `${incomeTrendPct >= 0 ? '+' : ''}${incomeTrendPct}% vs last`, positive: incomeTrendPct >= 0 } : undefined}
        />
        <StatCard
          label="Expenses"
          value={formatINR(stats.expenses)}
          icon={ArrowUpRight}
          iconColor="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          trend={prevStats.expenses > 0 ? { value: `${expenseTrendPct >= 0 ? '+' : ''}${expenseTrendPct}% vs last`, positive: expenseTrendPct < 0 } : undefined}
        />
        <StatCard
          label="Savings"
          value={formatINR(stats.savings)}
          icon={PiggyBank}
          iconColor={stats.savings >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-500'}
          iconBg={stats.savings >= 0 ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}
          subtitle={`Savings rate: ${stats.savingsRate.toFixed(0)}%`}
        />
        <StatCard
          label="Health Score"
          value={`${health.score}`}
          icon={TrendingUp}
          iconColor={
            health.color === 'emerald'
              ? 'text-emerald-600 dark:text-emerald-400'
              : health.color === 'brand'
              ? 'text-brand-600 dark:text-brand-400'
              : health.color === 'amber'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-rose-600 dark:text-rose-400'
          }
          iconBg={
            health.color === 'emerald'
              ? 'bg-emerald-100 dark:bg-emerald-900/30'
              : health.color === 'brand'
              ? 'bg-brand-100 dark:bg-brand-900/30'
              : health.color === 'amber'
              ? 'bg-amber-100 dark:bg-amber-900/30'
              : 'bg-rose-100 dark:bg-rose-900/30'
          }
          subtitle={health.label}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-ink-900 dark:text-white">Spending by Category</h2>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View all
            </button>
          </div>
          <DonutChart data={breakdown} total={stats.expenses} />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-ink-900 dark:text-white">Monthly Trends</h2>
            <span className="text-xs text-ink-400 dark:text-ink-500">Last 4 months</span>
          </div>
          <TrendChart data={trend} />
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-ink-900 dark:text-white mb-3 px-1">Smart Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, i) => {
              const colors = insightColorMap[insight.type];
              const InsightIcon = INSIGHT_ICONS[insight.icon] ?? Lightbulb;
              return (
                <Card key={i} className={`p-4 border ${colors.border} ${colors.bg}`}>
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-9 h-9 rounded-xl bg-white dark:bg-ink-900/50 flex items-center justify-center ${colors.text}`}>
                      <InsightIcon className="w-[18px] h-[18px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink-900 dark:text-white">{insight.title}</p>
                      <p className="text-xs text-ink-600 dark:text-ink-300 mt-1 leading-relaxed">{insight.message}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Budgets + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-ink-900 dark:text-white">Budget Status</h2>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Manage
            </button>
          </div>
          {budgetProgress.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-ink-400 dark:text-ink-500">No budgets set yet</p>
              <button
                onClick={() => onNavigate('budgets')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-2 hover:underline"
              >
                Create your first budget
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetProgress.slice(0, 4).map((bp) => {
                const meta = CATEGORY_MAP[bp.budget.category];
                const color = bp.status === 'over' ? 'rose' : bp.status === 'warning' ? 'amber' : 'brand';
                return (
                  <div key={bp.budget.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon name={meta?.icon ?? 'Sparkle'} className="w-4 h-4 text-ink-500 dark:text-ink-400" />
                        <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{meta?.label}</span>
                        {bp.status === 'over' && <Badge color="red">Over</Badge>}
                        {bp.status === 'warning' && <Badge color="amber">Watch</Badge>}
                      </div>
                      <span className={`text-xs font-semibold ${bp.status === 'over' ? 'text-rose-500' : 'text-ink-500 dark:text-ink-400'}`}>
                        {formatINR(bp.spent, { compact: true })} / {formatINR(bp.budget.limit, { compact: true })}
                      </span>
                    </div>
                    <ProgressBar percentage={bp.percentage} color={color as 'brand' | 'amber' | 'rose'} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-ink-900 dark:text-white">Savings Goals</h2>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View all
            </button>
          </div>
          {goalProgress.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-ink-400 dark:text-ink-500">No savings goals yet</p>
              <button
                onClick={() => onNavigate('goals')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-2 hover:underline"
              >
                Set your first goal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {goalProgress.slice(0, 3).map((gp) => {
                const color = gp.status === 'achieved' ? 'brand' : gp.status === 'behind' ? 'rose' : 'blue';
                return (
                  <div key={gp.goal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon name="Target" className="w-4 h-4 text-ink-500 dark:text-ink-400" />
                        <span className="text-sm font-medium text-ink-700 dark:text-ink-200 truncate">
                          {gp.goal.name}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-ink-500 dark:text-ink-400 shrink-0">
                        {gp.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <ProgressBar percentage={gp.percentage} color={color as 'brand' | 'rose' | 'blue'} />
                    <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">
                      {formatINR(gp.goal.currentAmount, { compact: true })} of {formatINR(gp.goal.targetAmount, { compact: true })}
                      {gp.daysLeft > 0 && ` · ${gp.daysLeft}d left`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-ink-900 dark:text-white">Recent Transactions</h2>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            View all
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-ink-400 dark:text-ink-500">No transactions yet</p>
            <Button onClick={onAddTransaction} icon={Plus} size="sm" className="mt-3">
              Add your first transaction
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {recent.map((t) => (
              <TransactionRow key={t.id} transaction={t} compact />
            ))}
          </div>
        )}
      </Card>

      {/* Savings Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-ink-900 dark:text-white">Savings Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Icon name={rec.icon} className="w-[18px] h-[18px] text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink-900 dark:text-white">{rec.title}</p>
                    <p className="text-xs text-ink-600 dark:text-ink-300 mt-1 leading-relaxed">{rec.message}</p>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">
                      Potential savings: {formatINR(rec.potentialSavings)}/month
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
