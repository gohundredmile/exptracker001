import React, { useState, useEffect } from 'react';
import { Bell, Settings, TrendingUp, TrendingDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, formatTime, getGreeting } from '../utils/format';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SparklineChart } from '../components/charts/SparklineChart';

export const HomeScreen: React.FC = () => {
  const { profile, accounts, transactions, budgets, categories, notifications, navigateTo, setSelectedTransaction, setSelectedAccount, setSelectedBudget } = useStore();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [animatedBalance, setAnimatedBalance] = useState(0);

  const totalBalance = accounts.filter(a => a.include_in_total).reduce((sum, a) => sum + a.balance, 0);
  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);

  const monthlyTransactions = transactions.filter(t => new Date(t.date) >= monthStart);
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const recentTransactions = transactions.slice(0, 5);
  const activeBudgets = budgets.filter(b => b.is_active).slice(0, 3);
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  // Animate balance counter
  useEffect(() => {
    let start = 0;
    const end = totalBalance;
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setAnimatedBalance(end); clearInterval(timer); }
      else setAnimatedBalance(start);
    }, 16);
    return () => clearInterval(timer);
  }, [totalBalance]);

  // 7-day sparkline data
  const sparklineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTx = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.toDateString() === date.toDateString();
    });
    return dayTx.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
  });

  const getCategoryById = (id?: string) => categories.find(c => c.id === id);

  const topCategories = Object.entries(
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const key = t.category_id || 'other';
        acc[key] = (acc[key] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  ).sort(([, a], [, b]) => b - a).slice(0, 3);

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6">
        <div>
          <p className="text-sm text-gray-400 font-medium">{getGreeting()},</p>
          <h1 className="text-xl font-bold text-white">{profile.full_name.split(' ')[0]} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('notifications')}
            className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unreadNotifications}
              </span>
            )}
          </button>
          <button
            onClick={() => navigateTo('settings')}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Balance Hero Card */}
      <div className="mx-5">
        <div
          className="relative rounded-3xl p-5 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1040 0%, #0d1b2a 50%, #0a2744 100%)',
            border: '1px solid rgba(108,99,255,0.3)',
            boxShadow: '0 20px 60px rgba(108,99,255,0.15)',
          }}
        >
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Total Balance</span>
              <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-gray-500 hover:text-gray-300 transition-colors">
                {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            <div className="flex items-end gap-2 mb-1">
              <span className="text-4xl font-bold text-white tracking-tight">
                {balanceVisible ? formatCurrency(animatedBalance) : '••••••'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-5">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">+{formatCurrency(monthlyIncome - monthlyExpense)} this month</span>
            </div>

            {/* Sparkline */}
            <SparklineChart data={sparklineData} />

            {/* Income / Expense Row */}
            <div className="flex gap-3 mt-4">
              <div className="flex-1 bg-white/5 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="p-1 rounded-lg bg-emerald-500/20">
                    <TrendingUp size={12} className="text-emerald-400" />
                  </div>
                  <span className="text-xs text-gray-400">Income</span>
                </div>
                <p className="text-base font-bold text-emerald-400">{formatCurrency(monthlyIncome)}</p>
              </div>
              <div className="flex-1 bg-white/5 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="p-1 rounded-lg bg-red-500/20">
                    <TrendingDown size={12} className="text-red-400" />
                  </div>
                  <span className="text-xs text-gray-400">Expenses</span>
                </div>
                <p className="text-base font-bold text-red-400">{formatCurrency(monthlyExpense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Accounts</h2>
          <button onClick={() => navigateTo('accounts')} className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
            See All <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => { setSelectedAccount(account.id); navigateTo('account-detail'); }}
              className="flex-shrink-0 w-40 rounded-2xl p-4 text-left transition-all duration-200 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${account.color}33, ${account.color}11)`,
                border: `1px solid ${account.color}44`,
              }}
            >
              <div className="text-2xl mb-2">{account.icon}</div>
              <p className="text-xs text-gray-400 truncate">{account.name}</p>
              <p
                className="text-base font-bold mt-0.5"
                style={{ color: account.balance >= 0 ? '#fff' : '#FF4D6D' }}
              >
                {balanceVisible ? formatCurrency(account.balance) : '••••'}
              </p>
              <p className="text-[10px] text-gray-500 capitalize mt-0.5">{account.type.replace('_', ' ')}</p>
            </button>
          ))}
          <button
            onClick={() => navigateTo('add-account')}
            className="flex-shrink-0 w-40 rounded-2xl p-4 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-300 hover:border-white/40 transition-colors"
          >
            <div className="text-3xl">+</div>
            <p className="text-xs">Add Account</p>
          </button>
        </div>
      </div>

      {/* Top Spending */}
      {topCategories.length > 0 && (
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Top Spending</h2>
            <button onClick={() => navigateTo('analytics')} className="flex items-center gap-1 text-sm text-indigo-400">
              Analytics <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-3">
            {topCategories.map(([catId, amount]) => {
              const cat = getCategoryById(catId);
              const percent = monthlyExpense > 0 ? (amount / monthlyExpense) * 100 : 0;
              return (
                <div
                  key={catId}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 text-center"
                >
                  <div className="text-2xl mb-1">{cat?.icon || '📦'}</div>
                  <p className="text-xs text-gray-400 truncate">{cat?.name || 'Other'}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{formatCurrency(amount)}</p>
                  <p className="text-[10px] text-gray-500">{percent.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budgets */}
      {activeBudgets.length > 0 && (
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Budgets</h2>
            <button onClick={() => navigateTo('budgets')} className="flex items-center gap-1 text-sm text-indigo-400">
              See All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2.5">
            {activeBudgets.map(budget => {
              const pct = (budget.spent / budget.amount) * 100;
              return (
                <button
                  key={budget.id}
                  onClick={() => { setSelectedBudget(budget.id); navigateTo('budget-detail'); }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-left hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{budget.icon}</span>
                      <span className="text-sm font-medium text-white">{budget.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <ProgressBar value={pct} budgetStyle height={6} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Recent Transactions</h2>
          <button onClick={() => navigateTo('transactions')} className="flex items-center gap-1 text-sm text-indigo-400">
            See All <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-2">
          {recentTransactions.map(tx => {
            const cat = getCategoryById(tx.category_id);
            const account = accounts.find(a => a.id === tx.account_id);
            return (
              <button
                key={tx.id}
                onClick={() => { setSelectedTransaction(tx.id); navigateTo('transaction-detail'); }}
                className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 hover:bg-white/8 transition-all duration-150 active:scale-99"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${cat?.color || '#6C63FF'}22` }}
                >
                  {cat?.icon || '💰'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{tx.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(tx.date)} · {account?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : tx.type === 'expense' ? 'text-red-400' : 'text-gray-300'}`}>
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{formatTime(tx.date)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5">
        <h2 className="text-base font-bold text-white mb-3">Quick Access</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '🎯', label: 'Goals', screen: 'savings-goals' },
            { icon: '💳', label: 'Debts', screen: 'debts' },
            { icon: '📱', label: 'Subs', screen: 'subscriptions' },
            { icon: '🛒', label: 'Shopping', screen: 'shopping' },
            { icon: '🧾', label: 'Receipts', screen: 'receipts' },
            { icon: '🤝', label: 'Shared', screen: 'shared-projects' },
            { icon: '📤', label: 'Export', screen: 'export' },
            { icon: '🔔', label: 'Bills', screen: 'bills' },
          ].map(item => (
            <button
              key={item.screen}
              onClick={() => navigateTo(item.screen)}
              className="flex flex-col items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-all active:scale-95"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
