export type TransactionType = 'income' | 'expense';

export type CategoryKey =
  | 'food'
  | 'travel'
  | 'education'
  | 'entertainment'
  | 'shopping'
  | 'bills'
  | 'rent'
  | 'health'
  | 'subscriptions'
  | 'other';

export type PaymentMethod = 'upi' | 'cash' | 'debit-card' | 'credit-card' | 'net-banking';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryKey | 'salary' | 'freelance' | 'investment' | 'gift';
  paymentMethod: PaymentMethod;
  description: string;
  date: string; // ISO date string
  createdAt: number;
}

export type IncomeCategory = 'salary' | 'freelance' | 'investment' | 'gift' | 'other';

export type ExpenseCategory = CategoryKey;

export interface Budget {
  id: string;
  category: CategoryKey;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date string
  createdAt: number;
}

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  icon: string; // lucide icon name
  color: string; // tailwind color class prefix
}

export interface PaymentMethodMeta {
  key: PaymentMethod;
  label: string;
  icon: string;
}

export type View = 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'ai-assistant';
