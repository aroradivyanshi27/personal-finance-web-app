import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar, BottomNav } from './components/Navigation';
import { Dashboard } from './views/Dashboard';
import { Transactions } from './views/Transactions';
import { Budgets } from './views/Budgets';
import { Goals } from './views/Goals';
import { TransactionForm } from './components/TransactionForm';
import { ToastContainer } from './components/ui/Toast';
import type { View, Transaction } from './types';

function AppContent() {
  const [view, setView] = useState<View>('dashboard');
  const [txFormOpen, setTxFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const { addTransaction, updateTransaction } = useFinance();

  const handleNavigate = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAddTransaction = () => {
    setEditingTx(null);
    setTxFormOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-ink-50 dark:bg-ink-950">
      <Sidebar view={view} onNavigate={handleNavigate} />
      <main className="flex-1 min-w-0 pb-20 lg:pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
          {view === 'dashboard' && (
            <Dashboard onNavigate={handleNavigate} onAddTransaction={openAddTransaction} />
          )}
          {view === 'transactions' && <Transactions />}
          {view === 'budgets' && <Budgets />}
          {view === 'goals' && <Goals />}
        </div>
      </main>

      <BottomNav view={view} onNavigate={handleNavigate} />

      {/* Floating action button on mobile */}
      <button
        onClick={openAddTransaction}
        className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-brand-600 text-white shadow-elevated flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Add transaction"
      >
        <Plus className="w-6 h-6" />
      </button>

      <TransactionForm
        open={txFormOpen}
        onClose={() => setTxFormOpen(false)}
        onSubmit={(data) => {
          if (editingTx) {
            updateTransaction(editingTx.id, data);
          } else {
            addTransaction(data);
          }
        }}
        editingTransaction={editingTx}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </FinanceProvider>
    </ThemeProvider>
  );
}
