import type { Transaction, Budget, SavingsGoal } from '../types';
import { genId, toISODate } from './format';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

function daysAhead(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function getDemoTransactions(): Transaction[] {
  return [
    // Income - this month
    { id: genId(), type: 'income', amount: 35000, category: 'salary', paymentMethod: 'net-banking', description: 'Monthly Salary', date: daysAgo(2), createdAt: Date.now() - 200000 },
    { id: genId(), type: 'income', amount: 8000, category: 'freelance', paymentMethod: 'upi', description: 'Freelance Project — Logo Design', date: daysAgo(5), createdAt: Date.now() - 300000 },

    // Last month income
    { id: genId(), type: 'income', amount: 35000, category: 'salary', paymentMethod: 'net-banking', description: 'Monthly Salary', date: daysAgo(32), createdAt: Date.now() - 3000000 },
    { id: genId(), type: 'income', amount: 5000, category: 'freelance', paymentMethod: 'upi', description: 'Freelance — Web Banner', date: daysAgo(35), createdAt: Date.now() - 3100000 },

    // Two months ago income
    { id: genId(), type: 'income', amount: 35000, category: 'salary', paymentMethod: 'net-banking', description: 'Monthly Salary', date: daysAgo(62), createdAt: Date.now() - 6000000 },

    // This month expenses
    { id: genId(), type: 'expense', amount: 12000, category: 'rent', paymentMethod: 'upi', description: 'Room Rent — October', date: daysAgo(1), createdAt: Date.now() - 100000 },
    { id: genId(), type: 'expense', amount: 240, category: 'food', paymentMethod: 'upi', description: 'Zomato — Biryani', date: daysAgo(1), createdAt: Date.now() - 110000 },
    { id: genId(), type: 'expense', amount: 189, category: 'food', paymentMethod: 'upi', description: 'Swiggy — Breakfast', date: daysAgo(2), createdAt: Date.now() - 120000 },
    { id: genId(), type: 'expense', amount: 320, category: 'food', paymentMethod: 'upi', description: 'Swiggy — Dinner with friends', date: daysAgo(3), createdAt: Date.now() - 130000 },
    { id: genId(), type: 'expense', amount: 145, category: 'travel', paymentMethod: 'upi', description: 'Rapido — Ride to college', date: daysAgo(3), createdAt: Date.now() - 140000 },
    { id: genId(), type: 'expense', amount: 85, category: 'travel', paymentMethod: 'upi', description: 'Uber — Auto ride', date: daysAgo(4), createdAt: Date.now() - 150000 },
    { id: genId(), type: 'expense', amount: 649, category: 'subscriptions', paymentMethod: 'credit-card', description: 'Netflix — Monthly', date: daysAgo(4), createdAt: Date.now() - 160000 },
    { id: genId(), type: 'expense', amount: 299, category: 'subscriptions', paymentMethod: 'upi', description: 'Spotify Premium', date: daysAgo(5), createdAt: Date.now() - 170000 },
    { id: genId(), type: 'expense', amount: 1499, category: 'shopping', paymentMethod: 'credit-card', description: 'Amazon — Headphones', date: daysAgo(6), createdAt: Date.now() - 180000 },
    { id: genId(), type: 'expense', amount: 450, category: 'food', paymentMethod: 'cash', description: 'College Canteen — Lunch', date: daysAgo(6), createdAt: Date.now() - 190000 },
    { id: genId(), type: 'expense', amount: 1200, category: 'education', paymentMethod: 'debit-card', description: 'College Books — Data Structures', date: daysAgo(7), createdAt: Date.now() - 200000 },
    { id: genId(), type: 'expense', amount: 399, category: 'bills', paymentMethod: 'upi', description: 'Jio Recharge', date: daysAgo(8), createdAt: Date.now() - 210000 },
    { id: genId(), type: 'expense', amount: 750, category: 'bills', paymentMethod: 'upi', description: 'Electricity Bill', date: daysAgo(9), createdAt: Date.now() - 220000 },
    { id: genId(), type: 'expense', amount: 210, category: 'food', paymentMethod: 'upi', description: 'Zomato — Late night snack', date: daysAgo(10), createdAt: Date.now() - 230000 },
    { id: genId(), type: 'expense', amount: 650, category: 'entertainment', paymentMethod: 'upi', description: 'PVR Cinemas — Movie tickets', date: daysAgo(11), createdAt: Date.now() - 240000 },
    { id: genId(), type: 'expense', amount: 340, category: 'food', paymentMethod: 'cash', description: 'Tea & snacks — Campus', date: daysAgo(12), createdAt: Date.now() - 250000 },
    { id: genId(), type: 'expense', amount: 180, category: 'travel', paymentMethod: 'upi', description: 'Metro card top-up', date: daysAgo(13), createdAt: Date.now() - 260000 },
    { id: genId(), type: 'expense', amount: 5200, category: 'shopping', paymentMethod: 'credit-card', description: 'Amazon — New sneakers', date: daysAgo(14), createdAt: Date.now() - 270000 },
    { id: genId(), type: 'expense', amount: 350, category: 'health', paymentMethod: 'debit-card', description: 'Medical store — Vitamins', date: daysAgo(15), createdAt: Date.now() - 280000 },
    { id: genId(), type: 'expense', amount: 160, category: 'food', paymentMethod: 'upi', description: 'Swiggy — Ice cream', date: daysAgo(16), createdAt: Date.now() - 290000 },

    // Last month expenses
    { id: genId(), type: 'expense', amount: 12000, category: 'rent', paymentMethod: 'upi', description: 'Room Rent — September', date: daysAgo(30), createdAt: Date.now() - 2900000 },
    { id: genId(), type: 'expense', amount: 5100, category: 'food', paymentMethod: 'upi', description: 'Zomato & Swiggy — September', date: daysAgo(31), createdAt: Date.now() - 2910000 },
    { id: genId(), type: 'expense', amount: 1200, category: 'travel', paymentMethod: 'upi', description: 'Uber & Rapido — September', date: daysAgo(33), createdAt: Date.now() - 2920000 },
    { id: genId(), type: 'expense', amount: 649, category: 'subscriptions', paymentMethod: 'credit-card', description: 'Netflix — September', date: daysAgo(34), createdAt: Date.now() - 2930000 },
    { id: genId(), type: 'expense', amount: 800, category: 'entertainment', paymentMethod: 'upi', description: 'Concert tickets', date: daysAgo(36), createdAt: Date.now() - 2940000 },
    { id: genId(), type: 'expense', amount: 2400, category: 'shopping', paymentMethod: 'credit-card', description: 'Flipkart — T-shirts', date: daysAgo(38), createdAt: Date.now() - 2950000 },
    { id: genId(), type: 'expense', amount: 399, category: 'bills', paymentMethod: 'upi', description: 'Jio Recharge — Sept', date: daysAgo(39), createdAt: Date.now() - 2960000 },
    { id: genId(), type: 'expense', amount: 720, category: 'bills', paymentMethod: 'upi', description: 'Electricity — Sept', date: daysAgo(40), createdAt: Date.now() - 2970000 },

    // Two months ago
    { id: genId(), type: 'expense', amount: 12000, category: 'rent', paymentMethod: 'upi', description: 'Room Rent — August', date: daysAgo(60), createdAt: Date.now() - 5900000 },
    { id: genId(), type: 'expense', amount: 4600, category: 'food', paymentMethod: 'upi', description: 'Food delivery — August', date: daysAgo(61), createdAt: Date.now() - 5910000 },
    { id: genId(), type: 'expense', amount: 900, category: 'travel', paymentMethod: 'upi', description: 'Commute — August', date: daysAgo(63), createdAt: Date.now() - 5920000 },
    { id: genId(), type: 'expense', amount: 649, category: 'subscriptions', paymentMethod: 'credit-card', description: 'Netflix — August', date: daysAgo(64), createdAt: Date.now() - 5930000 },
    { id: genId(), type: 'expense', amount: 3200, category: 'shopping', paymentMethod: 'credit-card', description: 'Amazon — Backpack', date: daysAgo(66), createdAt: Date.now() - 5940000 },
    { id: genId(), type: 'expense', amount: 399, category: 'bills', paymentMethod: 'upi', description: 'Jio Recharge — Aug', date: daysAgo(69), createdAt: Date.now() - 5950000 },
  ];
}

export function getDemoBudgets(): Budget[] {
  return [
    { id: genId(), category: 'food', limit: 6000 },
    { id: genId(), category: 'travel', limit: 1500 },
    { id: genId(), category: 'entertainment', limit: 1000 },
    { id: genId(), category: 'shopping', limit: 3000 },
    { id: genId(), category: 'subscriptions', limit: 1000 },
    { id: genId(), category: 'bills', limit: 1500 },
  ];
}

export function getDemoGoals(): SavingsGoal[] {
  return [
    {
      id: genId(),
      name: 'New Laptop (MacBook Air)',
      targetAmount: 95000,
      currentAmount: 38000,
      targetDate: daysAhead(120),
      createdAt: Date.now() - 5000000,
    },
    {
      id: genId(),
      name: 'Emergency Fund',
      targetAmount: 50000,
      currentAmount: 22000,
      targetDate: daysAhead(90),
      createdAt: Date.now() - 6000000,
    },
    {
      id: genId(),
      name: 'Goa Trip with Friends',
      targetAmount: 15000,
      currentAmount: 8500,
      targetDate: daysAhead(45),
      createdAt: Date.now() - 4000000,
    },
  ];
}
