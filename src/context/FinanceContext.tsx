import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Transaction, Budget, SavingsGoal } from '../types';
import {
  loadTransactions,
  saveTransactions,
  loadBudgets,
  saveBudgets,
  loadGoals,
  saveGoals,
  resetAllData,
} from '../lib/storage';
import { genId } from '../lib/format';

interface FinanceContextValue {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  loading: boolean;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, b: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, g: Partial<Omit<SavingsGoal, 'id' | 'createdAt'>>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  resetData: () => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTransactions(loadTransactions());
    setBudgets(loadBudgets());
    setGoals(loadGoals());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) saveTransactions(transactions);
  }, [transactions, loading]);

  useEffect(() => {
    if (!loading) saveBudgets(budgets);
  }, [budgets, loading]);

  useEffect(() => {
    if (!loading) saveGoals(goals);
  }, [goals, loading]);

  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions((prev) => [{ ...t, id: genId(), createdAt: Date.now() }, ...prev]);
  }, []);

  const updateTransaction = useCallback(
    (id: string, t: Omit<Transaction, 'id' | 'createdAt'>) => {
      setTransactions((prev) =>
        prev.map((item) => (item.id === id ? { ...t, id, createdAt: item.createdAt } : item))
      );
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addBudget = useCallback((b: Omit<Budget, 'id'>) => {
    setBudgets((prev) => {
      if (prev.some((p) => p.category === b.category)) {
        return prev.map((p) => (p.category === b.category ? { ...b, id: p.id } : p));
      }
      return [...prev, { ...b, id: genId() }];
    });
  }, []);

  const updateBudget = useCallback((id: string, b: Omit<Budget, 'id'>) => {
    setBudgets((prev) => prev.map((item) => (item.id === id ? { ...b, id } : item)));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addGoal = useCallback((g: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    setGoals((prev) => [...prev, { ...g, id: genId(), createdAt: Date.now() }]);
  }, []);

  const updateGoal = useCallback(
    (id: string, g: Partial<Omit<SavingsGoal, 'id' | 'createdAt'>>) => {
      setGoals((prev) => prev.map((item) => (item.id === id ? { ...item, ...g } : item)));
    },
    []
  );

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) }
          : g
      )
    );
  }, []);

  const resetData = useCallback(() => {
    resetAllData();
    setTransactions(loadTransactions());
    setBudgets(loadBudgets());
    setGoals(loadGoals());
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        resetData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
