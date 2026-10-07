import type { Transaction, Budget, SavingsGoal } from '../types';
import { STORAGE_KEYS } from '../constants';
import { getDemoTransactions, getDemoBudgets, getDemoGoals } from './demoData';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function loadTransactions(): Transaction[] {
  const seeded = localStorage.getItem(STORAGE_KEYS.seeded);
  if (!seeded) {
    const demo = getDemoTransactions();
    safeSet(STORAGE_KEYS.transactions, demo);
    localStorage.setItem(STORAGE_KEYS.seeded, '1');
    return demo;
  }
  return safeGet<Transaction[]>(STORAGE_KEYS.transactions, []);
}

export function saveTransactions(transactions: Transaction[]): void {
  safeSet(STORAGE_KEYS.transactions, transactions);
}

export function loadBudgets(): Budget[] {
  const seeded = localStorage.getItem(STORAGE_KEYS.seeded);
  if (!seeded) {
    const demo = getDemoBudgets();
    safeSet(STORAGE_KEYS.budgets, demo);
    return demo;
  }
  return safeGet<Budget[]>(STORAGE_KEYS.budgets, []);
}

export function saveBudgets(budgets: Budget[]): void {
  safeSet(STORAGE_KEYS.budgets, budgets);
}

export function loadGoals(): SavingsGoal[] {
  const seeded = localStorage.getItem(STORAGE_KEYS.seeded);
  if (!seeded) {
    const demo = getDemoGoals();
    safeSet(STORAGE_KEYS.goals, demo);
    return demo;
  }
  return safeGet<SavingsGoal[]>(STORAGE_KEYS.goals, []);
}

export function saveGoals(goals: SavingsGoal[]): void {
  safeSet(STORAGE_KEYS.goals, goals);
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.transactions);
  localStorage.removeItem(STORAGE_KEYS.budgets);
  localStorage.removeItem(STORAGE_KEYS.goals);
  localStorage.removeItem(STORAGE_KEYS.seeded);
}
