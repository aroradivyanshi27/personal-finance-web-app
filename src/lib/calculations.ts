import type { Transaction, Budget, SavingsGoal, CategoryKey } from '../types';
import { monthKey, currentMonthKey, prevMonthKey, formatINR, daysUntil } from './format';
import { CATEGORY_MAP } from '../constants';

export interface MonthlyStats {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export interface CategoryBreakdown {
  category: CategoryKey;
  label: string;
  color: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  percentage: number;
  remaining: number;
  status: 'on-track' | 'warning' | 'over';
}

export interface GoalProgress {
  goal: SavingsGoal;
  percentage: number;
  remaining: number;
  daysLeft: number;
  monthlyNeeded: number;
  status: 'on-track' | 'behind' | 'achieved';
}

export interface Insight {
  type: 'positive' | 'warning' | 'negative' | 'info';
  title: string;
  message: string;
  icon: string;
}

export function getAllTimeStats(transactions: Transaction[]) {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  return { income, expenses, balance };
}

export function getMonthlyStats(transactions: Transaction[], mKey?: string): MonthlyStats {
  const key = mKey ?? currentMonthKey();
  const monthTxns = transactions.filter((t) => monthKey(t.date) === key);
  const income = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  return { income, expenses, savings, savingsRate };
}

export function getAvailableBalance(transactions: Transaction[]): number {
  const { balance } = getAllTimeStats(transactions);
  return balance;
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  mKey?: string
): CategoryBreakdown[] {
  const key = mKey ?? currentMonthKey();
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && monthKey(t.date) === key
  );
  const total = monthExpenses.reduce((s, t) => s + t.amount, 0);
  if (total === 0) return [];

  const byCategory = new Map<CategoryKey, { amount: number; count: number }>();
  for (const t of monthExpenses) {
    const cat = t.category as CategoryKey;
    const existing = byCategory.get(cat) ?? { amount: 0, count: 0 };
    existing.amount += t.amount;
    existing.count += 1;
    byCategory.set(cat, existing);
  }

  return Array.from(byCategory.entries())
    .map(([cat, { amount, count }]) => {
      const meta = CATEGORY_MAP[cat];
      return {
        category: cat,
        label: meta?.label ?? 'Other',
        color: meta?.color ?? 'slate',
        amount,
        percentage: (amount / total) * 100,
        count,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function getBudgetProgress(
  transactions: Transaction[],
  budgets: Budget[],
  mKey?: string
): BudgetProgress[] {
  const key = mKey ?? currentMonthKey();
  return budgets.map((budget) => {
    const spent = transactions
      .filter(
        (t) => t.type === 'expense' && t.category === budget.category && monthKey(t.date) === key
      )
      .reduce((s, t) => s + t.amount, 0);
    const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
    const remaining = budget.limit - spent;
    let status: BudgetProgress['status'] = 'on-track';
    if (percentage >= 100) status = 'over';
    else if (percentage >= 80) status = 'warning';
    return { budget, spent, percentage, remaining, status };
  });
}

export function getGoalProgress(goals: SavingsGoal[]): GoalProgress[] {
  return goals.map((goal) => {
    const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysLeft = daysUntil(goal.targetDate);
    const monthsLeft = Math.max(daysLeft / 30, 0.1);
    const monthlyNeeded = remaining > 0 ? remaining / monthsLeft : 0;
    let status: GoalProgress['status'] = 'on-track';
    if (percentage >= 100) status = 'achieved';
    else if (daysLeft < 0) status = 'behind';
    return { goal, percentage, remaining, daysLeft, monthlyNeeded, status };
  });
}

export function getMonthlyTrend(
  transactions: Transaction[],
  months: number
): { label: string; key: string; income: number; expenses: number; savings: number }[] {
  const now = new Date();
  const result: { label: string; key: string; income: number; expenses: number; savings: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    const stats = getMonthlyStats(transactions, key);
    result.push({
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      key,
      ...stats,
    });
  }
  return result;
}

export function getRecentTransactions(transactions: Transaction[], limit: number = 5): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(b.date).getTime() || b.createdAt - a.createdAt)
    .slice(0, limit);
}

export function getHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[]
): { score: number; label: string; color: string } {
  const current = getMonthlyStats(transactions);
  const prevKey = prevMonthKey(currentMonthKey());
  const prev = getMonthlyStats(transactions, prevKey);
  let score = 50;

  // Savings rate contributes up to 30 points
  if (current.income > 0) {
    if (current.savingsRate >= 30) score += 30;
    else if (current.savingsRate >= 20) score += 22;
    else if (current.savingsRate >= 10) score += 14;
    else if (current.savingsRate >= 0) score += 5;
    else score -= 10;
  }

  // Budget adherence contributes up to 15 points
  if (budgets.length > 0) {
    const progress = getBudgetProgress(transactions, budgets);
    const overBudgets = progress.filter((p) => p.status === 'over').length;
    const warningBudgets = progress.filter((p) => p.status === 'warning').length;
    score += 15 - overBudgets * 6 - warningBudgets * 3;
  }

  // Goal progress contributes up to 10 points
  if (goals.length > 0) {
    const goalProgress = getGoalProgress(goals);
    const avgProgress = goalProgress.reduce((s, g) => s + Math.min(g.percentage, 100), 0) / goals.length;
    score += (avgProgress / 100) * 10;
  }

  // Trend: improving vs declining
  if (current.expenses < prev.expenses && prev.expenses > 0) score += 5;
  else if (current.expenses > prev.expenses && prev.expenses > 0) score -= 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label = 'Needs Work';
  let color = 'rose';
  if (score >= 80) { label = 'Excellent'; color = 'emerald'; }
  else if (score >= 65) { label = 'Good'; color = 'brand'; }
  else if (score >= 45) { label = 'Fair'; color = 'amber'; }

  return { score, label, color };
}

export function getInsights(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[]
): Insight[] {
  const insights: Insight[] = [];
  const current = getMonthlyStats(transactions);
  const prevKey = prevMonthKey(currentMonthKey());
  const prev = getMonthlyStats(transactions, prevKey);
  const breakdown = getCategoryBreakdown(transactions);
  const budgetProgress = getBudgetProgress(transactions, budgets);
  const goalProgress = getGoalProgress(goals);

  // Category comparison insight
  if (breakdown.length > 0) {
    const topCategory = breakdown[0];
    const prevCatAmount = transactions
      .filter((t) => t.type === 'expense' && t.category === topCategory.category && monthKey(t.date) === prevKey)
      .reduce((s, t) => s + t.amount, 0);
    if (prevCatAmount > 0) {
      const diff = topCategory.amount - prevCatAmount;
      const pctChange = Math.round((diff / prevCatAmount) * 100);
      if (diff > 0) {
        insights.push({
          type: 'warning',
          title: `${topCategory.label} spending is up`,
          message: `You spent ${formatINR(topCategory.amount)} on ${topCategory.label} this month — ${formatINR(diff)} more (${pctChange}%) than last month.`,
          icon: 'TrendingUp',
        });
      } else if (diff < 0) {
        insights.push({
          type: 'positive',
          title: `${topCategory.label} spending is down`,
          message: `You spent ${formatINR(Math.abs(diff))} less on ${topCategory.label} this month compared to last. Keep it up!`,
          icon: 'TrendingDown',
        });
      }
    } else {
      insights.push({
        type: 'info',
        title: `${topCategory.label} is your top category`,
        message: `You've spent ${formatINR(topCategory.amount)} on ${topCategory.label} this month — ${topCategory.percentage.toFixed(0)}% of your total expenses.`,
        icon: 'PieChart',
      });
    }
  }

  // Budget alerts
  const overBudgets = budgetProgress.filter((p) => p.status === 'over');
  if (overBudgets.length > 0) {
    const worst = overBudgets[0];
    insights.push({
      type: 'negative',
      title: `Over budget on ${CATEGORY_MAP[worst.budget.category]?.label}`,
      message: `You've exceeded your ${formatINR(worst.budget.limit)} budget for ${CATEGORY_MAP[worst.budget.category]?.label} by ${formatINR(worst.spent - worst.budget.limit)}.`,
      icon: 'AlertTriangle',
    });
  }

  const warningBudgets = budgetProgress.filter((p) => p.status === 'warning');
  if (warningBudgets.length > 0) {
    const w = warningBudgets[0];
    insights.push({
      type: 'warning',
      title: `Approaching budget limit`,
      message: `You've used ${w.percentage.toFixed(0)}% of your ${CATEGORY_MAP[w.budget.category]?.label} budget. Only ${formatINR(w.remaining)} left.`,
      icon: 'AlertCircle',
    });
  }

  // Savings rate insight
  if (current.income > 0) {
    if (current.savingsRate >= 20) {
      insights.push({
        type: 'positive',
        title: 'Great savings rate!',
        message: `You're saving ${current.savingsRate.toFixed(0)}% of your income this month — that's ${formatINR(current.savings)}.`,
        icon: 'PiggyBank',
      });
    } else if (current.savingsRate < 10 && current.savingsRate >= 0) {
      insights.push({
        type: 'warning',
        title: 'Low savings rate',
        message: `You're only saving ${current.savingsRate.toFixed(0)}% of your income. Aim for at least 20% to build a healthy cushion.`,
        icon: 'Lightbulb',
      });
    } else if (current.savingsRate < 0) {
      insights.push({
        type: 'negative',
        title: 'Spending exceeds income',
        message: `You've spent ${formatINR(current.expenses - current.income)} more than you earned this month. Time to cut back.`,
        icon: 'AlertTriangle',
      });
    }
  }

  // Goal insight
  if (goalProgress.length > 0) {
    const closest = [...goalProgress].sort((a, b) => a.daysLeft - b.daysLeft)[0];
    if (closest.status !== 'achieved' && closest.daysLeft > 0) {
      insights.push({
        type: 'info',
        title: `${closest.goal.name}`,
        message: `Save ${formatINR(closest.monthlyNeeded)}/month to reach this goal by ${new Date(closest.goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}. You're ${closest.percentage.toFixed(0)}% there.`,
        icon: 'Target',
      });
    } else if (closest.status === 'achieved') {
      insights.push({
        type: 'positive',
        title: 'Goal achieved!',
        message: `You've reached your savings goal for "${closest.goal.name}". Time to set a new one!`,
        icon: 'Trophy',
      });
    }
  }

  // Expense trend
  if (prev.expenses > 0) {
    const expenseDiff = current.expenses - prev.expenses;
    const pctChange = Math.round((expenseDiff / prev.expenses) * 100);
    if (expenseDiff < 0 && prev.expenses > 0) {
      insights.push({
        type: 'positive',
        title: 'Spending is trending down',
        message: `Your total expenses are down ${Math.abs(pctChange)}% compared to last month. Nice work!`,
        icon: 'TrendingDown',
      });
    }
  }

  return insights.slice(0, 5);
}

export function getSavingsRecommendations(
  transactions: Transaction[],
  budgets: Budget[]
): { title: string; message: string; potentialSavings: number; icon: string }[] {
  void budgets;
  const recs: { title: string; message: string; potentialSavings: number; icon: string }[] = [];
  const breakdown = getCategoryBreakdown(transactions);
  const current = getMonthlyStats(transactions);
  const prevKey = prevMonthKey(currentMonthKey());
  const prev = getMonthlyStats(transactions, prevKey);

  // Food overspending
  const foodBreakdown = breakdown.find((b) => b.category === 'food');
  if (foodBreakdown && foodBreakdown.amount > 4000) {
    const potential = Math.round(foodBreakdown.amount * 0.3);
    recs.push({
      title: 'Cut food delivery costs',
      message: `You're spending a lot on food this month. Cooking 2-3 meals at home could save you around ${formatINR(potential)} per month.`,
      potentialSavings: potential,
      icon: 'UtensilsCrossed',
    });
  }

  // Subscription audit
  const subBreakdown = breakdown.find((b) => b.category === 'subscriptions');
  if (subBreakdown && subBreakdown.amount > 500) {
    recs.push({
      title: 'Audit your subscriptions',
      message: `You have ${subBreakdown.count} subscription payment(s) totaling ${formatINR(subBreakdown.amount)} this month. Cancel any you don't use regularly.`,
      potentialSavings: Math.round(subBreakdown.amount * 0.4),
      icon: 'Repeat',
    });
  }

  // Shopping
  const shoppingBreakdown = breakdown.find((b) => b.category === 'shopping');
  if (shoppingBreakdown && shoppingBreakdown.amount > 3000) {
    recs.push({
      title: 'Reduce impulse shopping',
      message: `Your shopping spend is ${formatINR(shoppingBreakdown.amount)}. Try a 48-hour rule before non-essential purchases to save ${formatINR(Math.round(shoppingBreakdown.amount * 0.35))}.`,
      potentialSavings: Math.round(shoppingBreakdown.amount * 0.35),
      icon: 'ShoppingBag',
    });
  }

  // General savings rate
  if (current.income > 0 && current.savingsRate < 20) {
    const targetSavings = current.income * 0.2;
    const gap = targetSavings - current.savings;
    if (gap > 0) {
      recs.push({
        title: 'Aim for 20% savings rate',
        message: `You're saving ${current.savingsRate.toFixed(0)}% of income. To reach 20%, cut expenses by ${formatINR(gap)} next month.`,
        potentialSavings: Math.round(gap),
        icon: 'PiggyBank',
      });
    }
  }

  // Expense trend
  if (prev.expenses > 0 && current.expenses > prev.expenses * 1.15) {
    const increase = current.expenses - prev.expenses;
    recs.push({
      title: 'Reverse the spending trend',
      message: `Your spending is up ${formatINR(increase)} from last month. Review your top categories to find quick wins.`,
      potentialSavings: Math.round(increase * 0.5),
      icon: 'TrendingUp',
    });
  }

  return recs.slice(0, 4);
}
