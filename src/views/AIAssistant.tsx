import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  Sparkles,
  Send,
  MessageCircle,
  BarChart3,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Loader2,
  Bot,
  User,
  RefreshCw,
  ArrowUp,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { formatINR } from '../lib/format';
import {
  sendChatMessage,
  getSpendingAnalysis,
  getSavingsSuggestions,
  type ChatMessage,
  type AnalysisResult,
  type SavingsSuggestion,
} from '../lib/ai';
import { Card, Button, Badge } from '../components/ui/Card';

type Tab = 'chat' | 'analysis' | 'suggestions';

const SUGGESTED_QUESTIONS = [
  'How can I reduce my monthly expenses?',
  'Am I saving enough of my income?',
  'What are my biggest spending categories?',
  'How should I budget for next month?',
];

const PRIORITY_BADGE: Record<string, { color: 'red' | 'amber' | 'blue'; label: string }> = {
  high: { color: 'red', label: 'High Priority' },
  medium: { color: 'amber', label: 'Medium Priority' },
  low: { color: 'blue', label: 'Low Priority' },
};

export function AIAssistant() {
  const { transactions, budgets, goals } = useFinance();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>('chat');

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">AI Assistant</h1>
          <p className="text-sm text-ink-400 dark:text-ink-500 mt-1">
            Smart insights about your money
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-ink-900 shadow-card text-ink-500 hover:text-ink-800 dark:hover:text-ink-200 transition-colors shrink-0"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-ink-100 dark:bg-ink-800 rounded-xl">
        <TabButton active={tab === 'chat'} onClick={() => setTab('chat')} icon={MessageCircle} label="Chat" />
        <TabButton active={tab === 'analysis'} onClick={() => setTab('analysis')} icon={BarChart3} label="Analysis" />
        <TabButton active={tab === 'suggestions'} onClick={() => setTab('suggestions')} icon={PiggyBank} label="Savings" />
      </div>

      {tab === 'chat' && <ChatTab transactions={transactions} budgets={budgets} goals={goals} />}
      {tab === 'analysis' && <AnalysisTab transactions={transactions} budgets={budgets} goals={goals} />}
      {tab === 'suggestions' && <SuggestionsTab transactions={transactions} budgets={budgets} goals={goals} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: IconCmp,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof MessageCircle;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-white dark:bg-ink-700 text-brand-600 dark:text-brand-400 shadow-sm'
          : 'text-ink-500 dark:text-ink-400'
      }`}
    >
      <IconCmp className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ---------- Chat Tab ---------- */

function ChatTab({
  transactions,
  budgets,
  goals,
}: {
  transactions: ReturnType<typeof useFinance>['transactions'];
  budgets: ReturnType<typeof useFinance>['budgets'];
  goals: ReturnType<typeof useFinance>['goals'];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e?: FormEvent, question?: string) => {
    e?.preventDefault();
    const userMsg = (question ?? input).trim();
    if (!userMsg || loading) return;

    setInput('');
    setError(null);
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const reply = await sendChatMessage(newMessages, transactions, budgets, goals);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get a response. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden" >
      <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Finance Coach</p>
          <p className="text-xs text-ink-400 dark:text-ink-500">Ask about budgeting, expenses, or savings</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[300px] max-h-[460px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            </div>
            <p className="text-base font-semibold text-ink-700 dark:text-ink-200">Ask me anything about your finances</p>
            <p className="text-sm text-ink-400 dark:text-ink-500 mt-1 max-w-sm">
              I can see your transactions, budgets, and goals — so my advice is tailored to your real spending.
            </p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(undefined, q)}
                  className="text-left text-sm font-medium text-ink-600 dark:text-ink-300 px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="bg-ink-50 dark:bg-ink-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-ink-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Something went wrong</p>
              <p className="text-xs text-rose-500 dark:text-rose-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-ink-100 dark:border-ink-800">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your question..."
              rows={1}
              className="w-full px-4 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 text-sm font-medium text-ink-900 dark:text-white placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none max-h-24"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="shrink-0 !px-3"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser
            ? 'bg-ink-100 dark:bg-ink-800'
            : 'bg-brand-100 dark:bg-brand-900/30'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-ink-500 dark:text-ink-400" />
        ) : (
          <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-ink-50 dark:bg-ink-800 text-ink-800 dark:text-ink-100 rounded-tl-sm'
        }`}
      >
        <FormattedText text={message.content} isUser={isUser} />
      </div>
    </div>
  );
}

function FormattedText({ text, isUser }: { text: string; isUser: boolean }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className={isUser ? 'text-brand-200' : 'text-ink-400'}>•</span>
              <span>{trimmed.slice(2)}</span>
            </div>
          );
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <p key={i} className="font-bold">
              {trimmed.slice(2, -2)}
            </p>
          );
        }
        if (trimmed === '') return <div key={i} className="h-1" />;
        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
}

/* ---------- Analysis Tab ---------- */

function AnalysisTab({
  transactions,
  budgets,
  goals,
}: {
  transactions: ReturnType<typeof useFinance>['transactions'];
  budgets: ReturnType<typeof useFinance>['budgets'];
  goals: ReturnType<typeof useFinance>['goals'];
}) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSpendingAnalysis(transactions, budgets, goals);
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze spending. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!result && !loading && !error) runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !result) {
    return <LoadingState icon={BarChart3} label="Analyzing your spending patterns..." />;
  }

  if (error && !result) {
    return <ErrorState message={error} onRetry={runAnalysis} />;
  }

  if (!result) return null;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-ink-900 dark:text-white">Spending Analysis</h3>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors disabled:opacity-50"
            aria-label="Refresh analysis"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-sm text-ink-600 dark:text-ink-300 mt-3 leading-relaxed">{result.summary}</p>
      </Card>

      {result.topCategories.length > 0 && (
        <Card className="p-5">
          <h4 className="text-sm font-bold text-ink-900 dark:text-white mb-3">Top Categories</h4>
          <div className="space-y-3">
            {result.topCategories.map((cat, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">{cat.category}</span>
                    <Badge color="gray">{cat.percentage.toFixed(0)}%</Badge>
                  </div>
                  <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">{cat.insight}</p>
                </div>
                <span className="text-sm font-bold text-ink-900 dark:text-white shrink-0">
                  {formatINR(cat.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {result.trends.length > 0 && (
        <InsightList
          title="Trends"
          icon={TrendingUp}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          items={result.trends}
        />
      )}

      {result.warnings.length > 0 && (
        <InsightList
          title="Watch Out"
          icon={AlertTriangle}
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          iconColor="text-rose-600 dark:text-rose-400"
          items={result.warnings}
        />
      )}

      {result.positiveNotes.length > 0 && (
        <InsightList
          title="Doing Well"
          icon={CheckCircle2}
          iconBg="bg-brand-100 dark:bg-brand-900/30"
          iconColor="text-brand-600 dark:text-brand-400"
          items={result.positiveNotes}
        />
      )}
    </div>
  );
}

/* ---------- Suggestions Tab ---------- */

function SuggestionsTab({
  transactions,
  budgets,
  goals,
}: {
  transactions: ReturnType<typeof useFinance>['transactions'];
  budgets: ReturnType<typeof useFinance>['budgets'];
  goals: ReturnType<typeof useFinance>['goals'];
}) {
  const [result, setResult] = useState<SavingsSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSavingsSuggestions(transactions, budgets, goals);
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate suggestions. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!result && !loading && !error) runSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !result) {
    return <LoadingState icon={PiggyBank} label="Finding savings opportunities..." />;
  }

  if (error && !result) {
    return <ErrorState message={error} onRetry={runSuggestions} />;
  }

  if (!result) return null;

  return (
    <div className="space-y-4">
      <Card className="p-5 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-900 dark:text-white">Potential Monthly Savings</h3>
              <p className="text-xs text-ink-400 dark:text-ink-500">{result.summary}</p>
            </div>
          </div>
          <button
            onClick={runSuggestions}
            disabled={loading}
            className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors disabled:opacity-50"
            aria-label="Refresh suggestions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {result.estimatedMonthlySavings > 0 && (
          <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
              {formatINR(result.estimatedMonthlySavings)}
            </span>
            <span className="text-sm text-ink-400 dark:text-ink-500 mb-1">per month</span>
          </div>
        )}
      </Card>

      {result.recommendations.length === 0 ? (
        <Card className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-3">
              <Lightbulb className="w-6 h-6 text-ink-400" />
            </div>
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">No specific recommendations yet</p>
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-1 max-w-xs">
              Add more transactions so the AI can identify personalized saving opportunities.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {result.recommendations.map((rec, i) => {
            const priority = PRIORITY_BADGE[rec.priority] ?? PRIORITY_BADGE.medium;
            return (
              <Card key={i} className="p-5" hover>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <h4 className="text-sm font-bold text-ink-900 dark:text-white">{rec.title}</h4>
                  </div>
                  <Badge color={priority.color}>{priority.label}</Badge>
                </div>
                <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">{rec.description}</p>
                {rec.potentialSavings > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <ArrowUp className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      Save {formatINR(rec.potentialSavings)}/month
                    </span>
                    {rec.category && (
                      <span className="text-xs text-ink-400 dark:text-ink-500">· {rec.category}</span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Shared States ---------- */

function LoadingState({ icon: Icon, label }: { icon: typeof BarChart3; label: string }) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-brand-600 dark:text-brand-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-ink-500 dark:text-ink-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p className="text-sm font-semibold">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">Something went wrong</p>
        <p className="text-xs text-ink-400 dark:text-ink-500 mt-1 max-w-xs">{message}</p>
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4" icon={RefreshCw}>
          Try Again
        </Button>
      </div>
    </Card>
  );
}

function InsightList({
  title,
  icon: Icon,
  iconBg,
  iconColor,
  items,
}: {
  title: string;
  icon: typeof TrendingUp;
  iconBg: string;
  iconColor: string;
  items: string[];
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h4 className="text-sm font-bold text-ink-900 dark:text-white">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
            <span className="text-ink-300 dark:text-ink-700 mt-0.5">•</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
