import React, { useState, useMemo } from 'react';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, formatTime } from '../utils/format';
import type { TransactionType } from '../types';

export const TransactionsScreen: React.FC = () => {
  const { transactions, categories, accounts, deleteTransaction, navigateTo, setSelectedTransaction } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [showFilter, setShowFilter] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('month');

  const getCategoryById = (id?: string) => categories.find(c => c.id === id);
  const getAccountById = (id: string) => accounts.find(a => a.id === id);

  const filteredTransactions = useMemo(() => {
    let txs = [...transactions];
    const now = new Date();

    if (selectedPeriod === 'today') {
      txs = txs.filter(t => new Date(t.date).toDateString() === now.toDateString());
    } else if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      txs = txs.filter(t => new Date(t.date) >= weekAgo);
    } else if (selectedPeriod === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      txs = txs.filter(t => new Date(t.date) >= monthStart);
    }

    if (filterType !== 'all') txs = txs.filter(t => t.type === filterType);
    if (search) {
      const q = search.toLowerCase();
      txs = txs.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.note?.toLowerCase().includes(q) ||
        getCategoryById(t.category_id)?.name.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'date') txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    else txs.sort((a, b) => b.amount - a.amount);

    return txs;
  }, [transactions, filterType, search, sortBy, selectedPeriod]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Group by date
  const grouped = filteredTransactions.reduce((acc, tx) => {
    const dateKey = formatDate(tx.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);
    return acc;
  }, {} as Record<string, typeof transactions>);

  const typeIcon = (type: TransactionType) => {
    if (type === 'income') return <ArrowDownLeft size={14} className="text-emerald-400" />;
    if (type === 'expense') return <ArrowUpRight size={14} className="text-red-400" />;
    return <ArrowLeftRight size={14} className="text-indigo-400" />;
  };

  return (
    <div className="flex flex-col h-full pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white mb-4">Transactions</h1>

        {/* Summary */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center">
            <p className="text-xs text-emerald-400/70 mb-0.5">Income</p>
            <p className="text-base font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-center">
            <p className="text-xs text-red-400/70 mb-0.5">Expenses</p>
            <p className="text-base font-bold text-red-400">{formatCurrency(totalExpense)}</p>
          </div>
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p className="text-xs text-gray-400/70 mb-0.5">Net</p>
            <p className={`text-base font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(totalIncome - totalExpense)}
            </p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          {(['all', 'today', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                selectedPeriod === p
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              {p === 'all' ? 'All Time' : p === 'week' ? 'This Week' : p === 'today' ? 'Today' : 'This Month'}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Search size={16} className="text-gray-500 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400"
          >
            <Filter size={16} />
          </button>
          <button
            onClick={() => setSortBy(s => s === 'date' ? 'amount' : 'date')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-xs"
          >
            {sortBy === 'date' ? '🗓️' : '💲'}
          </button>
        </div>

        {/* Type Filter */}
        {showFilter && (
          <div className="flex gap-2 mt-3">
            {(['all', 'income', 'expense', 'transfer'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  filterType === t
                    ? t === 'income' ? 'bg-emerald-500 text-white'
                    : t === 'expense' ? 'bg-red-500 text-white'
                    : t === 'transfer' ? 'bg-indigo-500 text-white'
                    : 'bg-white text-gray-900'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-5">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">💸</div>
            <p className="text-white font-semibold mb-1">No transactions found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or add a new transaction</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateKey, txs]) => (
            <div key={dateKey} className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-400">{dateKey}</h3>
                <span className="text-xs text-gray-600">
                  {txs.filter(t => t.type === 'income').length > 0 && (
                    <span className="text-emerald-500 mr-2">+{formatCurrency(txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}</span>
                  )}
                  {txs.filter(t => t.type === 'expense').length > 0 && (
                    <span className="text-red-500">-{formatCurrency(txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}</span>
                  )}
                </span>
              </div>
              <div className="space-y-2">
                {txs.map(tx => {
                  const cat = getCategoryById(tx.category_id);
                  const account = getAccountById(tx.account_id);
                  const isSwiped = swipedId === tx.id;

                  return (
                    <div key={tx.id} className="relative overflow-hidden rounded-2xl">
                      {/* Delete bg */}
                      {isSwiped && (
                        <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center rounded-2xl z-0">
                          <Trash2 size={20} className="text-white" />
                        </div>
                      )}

                      <div
                        className={`relative z-10 flex items-center gap-3 bg-gray-800/80 border border-white/10 rounded-2xl p-3.5 transition-all duration-200 cursor-pointer hover:bg-gray-800 ${
                          isSwiped ? '-translate-x-20' : ''
                        }`}
                        onClick={() => {
                          if (isSwiped) { deleteTransaction(tx.id); setSwipedId(null); }
                          else { setSelectedTransaction(tx.id); navigateTo('transaction-detail'); }
                        }}
                        onMouseLeave={() => setSwipedId(null)}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: `${cat?.color || '#6C63FF'}22` }}
                        >
                          {cat?.icon || '💰'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {typeIcon(tx.type)}
                            <p className="text-sm font-semibold text-white truncate">{tx.title}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-500">{account?.name}</p>
                            {tx.tags.length > 0 && (
                              <span className="text-xs text-indigo-400/70">#{tx.tags[0]}</span>
                            )}
                            {tx.is_recurring && <span className="text-xs text-amber-400/70">🔁</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-bold ${
                            tx.type === 'income' ? 'text-emerald-400' :
                            tx.type === 'expense' ? 'text-red-400' : 'text-gray-300'
                          }`}>
                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                          </p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{formatTime(tx.date)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
