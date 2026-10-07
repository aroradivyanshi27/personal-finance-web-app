import type { CategoryKey, CategoryMeta, PaymentMethod, PaymentMethodMeta } from './types';

export const STORAGE_KEYS = {
  transactions: 'pkgb_transactions',
  budgets: 'pkgb_budgets',
  goals: 'pkgb_goals',
  theme: 'pkgb_theme',
  seeded: 'pkgb_seeded',
} as const;

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  { key: 'food', label: 'Food', icon: 'UtensilsCrossed', color: 'orange' },
  { key: 'travel', label: 'Travel', icon: 'Car', color: 'blue' },
  { key: 'education', label: 'Education', icon: 'GraduationCap', color: 'violet' },
  { key: 'entertainment', label: 'Entertainment', icon: 'Clapperboard', color: 'pink' },
  { key: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: 'amber' },
  { key: 'bills', label: 'Bills', icon: 'ReceiptText', color: 'rose' },
  { key: 'rent', label: 'Rent', icon: 'Home', color: 'cyan' },
  { key: 'health', label: 'Health', icon: 'HeartPulse', color: 'red' },
  { key: 'subscriptions', label: 'Subscriptions', icon: 'Repeat', color: 'indigo' },
  { key: 'other', label: 'Other', icon: 'Sparkle', color: 'slate' },
];

export const INCOME_CATEGORIES: CategoryMeta[] = [
  { key: 'other', label: 'Salary', icon: 'Wallet', color: 'emerald' },
  { key: 'other', label: 'Freelance', icon: 'Laptop', color: 'teal' },
  { key: 'other', label: 'Investment', icon: 'TrendingUp', color: 'green' },
  { key: 'other', label: 'Gift', icon: 'Gift', color: 'lime' },
  { key: 'other', label: 'Other Income', icon: 'Plus', color: 'slate' },
];

export const CATEGORY_MAP: Record<CategoryKey, CategoryMeta> = EXPENSE_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.key]: c }),
  {} as Record<CategoryKey, CategoryMeta>
);

export const PAYMENT_METHODS: PaymentMethodMeta[] = [
  { key: 'upi', label: 'UPI', icon: 'Smartphone' },
  { key: 'cash', label: 'Cash', icon: 'Banknote' },
  { key: 'debit-card', label: 'Debit Card', icon: 'CreditCard' },
  { key: 'credit-card', label: 'Credit Card', icon: 'CreditCard' },
  { key: 'net-banking', label: 'Net Banking', icon: 'Building2' },
];

export const PAYMENT_METHOD_MAP: Record<PaymentMethod, PaymentMethodMeta> =
  PAYMENT_METHODS.reduce(
    (acc, p) => ({ ...acc, [p.key]: p }),
    {} as Record<PaymentMethod, PaymentMethodMeta>
  );

export const INCOME_CATEGORY_KEYS = ['salary', 'freelance', 'investment', 'gift', 'other'] as const;

export const INCOME_CATEGORY_LABELS: Record<string, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  investment: 'Investment',
  gift: 'Gift',
  other: 'Other Income',
};
