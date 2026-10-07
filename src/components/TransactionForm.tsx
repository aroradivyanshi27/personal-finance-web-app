import { useState, useEffect, type FormEvent } from 'react';
import type { Transaction, TransactionType, CategoryKey, PaymentMethod } from '../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../constants';
import { todayISO } from '../lib/format';
import { Modal } from './ui/Modal';
import { Button } from './ui/Card';
import { Icon } from './ui/Icon';
import { useToast } from '../context/ToastContext';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: Transaction | null;
}

const INCOME_KEYS = ['salary', 'freelance', 'investment', 'gift', 'other'] as const;

export function TransactionForm({
  open,
  onClose,
  onSubmit,
  editingTransaction,
}: TransactionFormProps) {
  const { showToast } = useToast();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setPaymentMethod(editingTransaction.paymentMethod);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
    } else {
      setType('expense');
      setAmount('');
      setCategory('food');
      setPaymentMethod('upi');
      setDescription('');
      setDate(todayISO());
    }
    setErrors({});
  }, [editingTransaction, open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      newErrors.amount = 'Enter a valid amount greater than 0';
    }
    if (!description.trim()) {
      newErrors.description = 'Enter a description';
    }
    if (!date) {
      newErrors.date = 'Select a date';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      type,
      amount: amt,
      category: category as CategoryKey | (typeof INCOME_KEYS)[number],
      paymentMethod,
      description: description.trim(),
      date,
    });
    showToast(
      editingTransaction ? 'Transaction updated' : `${type === 'income' ? 'Income' : 'Expense'} added`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-ink-100 dark:bg-ink-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('food');
            }}
            className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === 'expense'
                ? 'bg-white dark:bg-ink-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-ink-500 dark:text-ink-400'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('salary');
            }}
            className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === 'income'
                ? 'bg-white dark:bg-ink-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-ink-500 dark:text-ink-400'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-semibold text-lg">
              ₹
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className={`w-full pl-8 pr-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border-2 text-lg font-semibold text-ink-900 dark:text-white placeholder:text-ink-300 focus:outline-none transition-colors ${
                errors.amount
                  ? 'border-rose-300 dark:border-rose-700'
                  : 'border-transparent focus:border-brand-400'
              }`}
            />
          </div>
          {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
            Category
          </label>
          {type === 'expense' ? (
            <div className="grid grid-cols-5 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                    category === cat.key
                      ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-transparent bg-ink-50 dark:bg-ink-800 hover:bg-ink-100 dark:hover:bg-ink-700'
                  }`}
                >
                  <Icon name={cat.icon} className="w-5 h-5 text-ink-600 dark:text-ink-300" />
                  <span className="text-[10px] font-medium text-ink-600 dark:text-ink-400 leading-tight text-center">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {INCOME_KEYS.map((key) => {
                const labels: Record<string, string> = {
                  salary: 'Salary',
                  freelance: 'Freelance',
                  investment: 'Investment',
                  gift: 'Gift',
                  other: 'Other',
                };
                const icons: Record<string, string> = {
                  salary: 'Wallet',
                  freelance: 'Laptop',
                  investment: 'TrendingUp',
                  gift: 'Gift',
                  other: 'Plus',
                };
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                      category === key
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-transparent bg-ink-50 dark:bg-ink-800 hover:bg-ink-100 dark:hover:bg-ink-700'
                    }`}
                  >
                    <Icon name={icons[key]} className="w-5 h-5 text-ink-600 dark:text-ink-300" />
                    <span className="text-[10px] font-medium text-ink-600 dark:text-ink-400 leading-tight text-center">
                      {labels[key]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
            Payment Method
          </label>
          <div className="grid grid-cols-5 gap-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.key}
                type="button"
                onClick={() => setPaymentMethod(pm.key)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                  paymentMethod === pm.key
                    ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-transparent bg-ink-50 dark:bg-ink-800 hover:bg-ink-100 dark:hover:bg-ink-700'
                }`}
              >
                <Icon name={pm.icon} className="w-5 h-5 text-ink-600 dark:text-ink-300" />
                <span className="text-[10px] font-medium text-ink-600 dark:text-ink-400 leading-tight text-center">
                  {pm.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Zomato — Biryani"
            className={`w-full px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border-2 text-sm font-medium text-ink-900 dark:text-white placeholder:text-ink-300 focus:outline-none transition-colors ${
              errors.description
                ? 'border-rose-300 dark:border-rose-700'
                : 'border-transparent focus:border-brand-400'
            }`}
          />
          {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border-2 text-sm font-medium text-ink-900 dark:text-white focus:outline-none transition-colors ${
              errors.date
                ? 'border-rose-300 dark:border-rose-700'
                : 'border-transparent focus:border-brand-400'
            }`}
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editingTransaction ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
