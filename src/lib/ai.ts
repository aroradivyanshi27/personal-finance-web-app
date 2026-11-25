import type { Transaction, Budget, SavingsGoal } from '../types';

interface FinanceContextPayload {
  transactions: Array<{
    type: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }>;
  budgets: Array<{ category: string; limit: number }>;
  goals: Array<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  }>;
  currency: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnalysisResult {
  summary: string;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
    insight: string;
  }>;
  trends: string[];
  warnings: string[];
  positiveNotes: string[];
}

export interface SavingsSuggestion {
  recommendations: Array<{
    title: string;
    description: string;
    potentialSavings: number;
    category: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  estimatedMonthlySavings: number;
  summary: string;
}

function buildContext(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[]
): FinanceContextPayload {
  return {
    transactions: transactions.slice(0, 60).map((t) => ({
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date,
      paymentMethod: t.paymentMethod,
    })),
    budgets: budgets.map((b) => ({ category: b.category, limit: b.limit })),
    goals: goals.map((g) => ({
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetDate: g.targetDate,
    })),
    currency: 'INR',
  };
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-finance`;

const headers: Record<string, string> = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
};

async function callEdgeFunction(body: Record<string, unknown>): Promise<string> {
  let response: Response;
  try {
    response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'Could not reach the AI service. This may be a network connectivity issue — please check your internet connection and try again.'
    );
  }

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errData = await response.json();
      if (errData?.error) errorMsg = errData.error;
    } catch {
      errorMsg = await response.text().catch(() => errorMsg);
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (data?.error) {
    throw new Error(data.error);
  }
  if (!data?.result) {
    throw new Error('Received an empty response from the AI service.');
  }
  return data.result as string;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[]
): Promise<string> {
  const context = buildContext(transactions, budgets, goals);
  return callEdgeFunction({ action: 'chat', messages, context });
}

export async function getSpendingAnalysis(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[]
): Promise<AnalysisResult> {
  const context = buildContext(transactions, budgets, goals);
  const raw = await callEdgeFunction({ action: 'analyze', context });
  try {
    const parsed = JSON.parse(raw) as AnalysisResult;
    return {
      summary: parsed.summary ?? 'Unable to generate analysis.',
      topCategories: Array.isArray(parsed.topCategories) ? parsed.topCategories : [],
      trends: Array.isArray(parsed.trends) ? parsed.trends : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      positiveNotes: Array.isArray(parsed.positiveNotes) ? parsed.positiveNotes : [],
    };
  } catch {
    throw new Error('AI service returned malformed analysis data.');
  }
}

export async function getSavingsSuggestions(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[]
): Promise<SavingsSuggestion> {
  const context = buildContext(transactions, budgets, goals);
  const raw = await callEdgeFunction({ action: 'suggestions', context });
  try {
    const parsed = JSON.parse(raw) as SavingsSuggestion;
    return {
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      estimatedMonthlySavings: parsed.estimatedMonthlySavings ?? 0,
      summary: parsed.summary ?? 'Unable to generate suggestions.',
    };
  } catch {
    throw new Error('AI service returned malformed suggestions data.');
  }
}
