import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';

type AnalyticsView = 'overview' | 'income' | 'expense' | 'cashflow' | 'calendar';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const AnalyticsScreen: React.FC = () => {
  const { transactions, categories, accounts } = useStore();
  const [view, setView] = useState<AnalyticsView>('overview');
  const [selectedPieSlice, setSelectedPieSlice] = useState<string | null>(null);
  const [calendarMonth] = useState(new Date());

  const now = new Date();

  const getCategoryById = (id?: string) => categories.find(c => c.id === id);

  // Monthly data for bar chart
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const monthTxs = transactions.filter(t => {
        const td = new Date(t.date);
        return td >= d && td <= monthEnd;
      });
      return {
        month: MONTHS[d.getMonth()],
        income: monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  // Pie chart data - current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthTxs = transactions.filter(t => new Date(t.date) >= monthStart);

  const expensePieData = useMemo(() => {
    const grouped = currentMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const key = t.category_id || 'other';
        acc[key] = (acc[key] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        return { name: cat?.name || 'Other', value: amount, color: cat?.color || '#6B7280', icon: cat?.icon || '📦', catId };
      });
  }, [currentMonthTxs]);

  const incomePieData = useMemo(() => {
    const grouped = currentMonthTxs
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        const key = t.category_id || 'other';
        acc[key] = (acc[key] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        return { name: cat?.name || 'Other', value: amount, color: cat?.color || '#00C896', icon: cat?.icon || '💰', catId };
      });
  }, [currentMonthTxs]);

  const totalExpense = expensePieData.reduce((s, d) => s + d.value, 0);
  const totalIncome = incomePieData.reduce((s, d) => s + d.value, 0);

  // Calendar data
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();

  const calendarDayData = useMemo(() => {
    const map: Record<number, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const td = new Date(t.date);
      if (td.getMonth() === calendarMonth.getMonth() && td.getFullYear() === calendarMonth.getFullYear()) {
        const day = td.getDate();
        if (!map[day]) map[day] = { income: 0, expense: 0 };
        if (t.type === 'income') map[day].income += t.amount;
        if (t.type === 'expense') map[day].expense += t.amount;
      }
    });
    return map;
  }, [transactions, calendarMonth]);

  // Account contribution
  const accountData = accounts.filter(a => a.include_in_total && a.balance > 0).map(a => ({
    name: a.name,
    value: a.balance,
    color: a.color,
    icon: a.icon,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-white/20 rounded-xl p-3 text-sm">
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
              <span className="text-gray-300">{p.name}:</span>
              <span className="text-white font-bold">{formatCurrency(p.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const views: { id: AnalyticsView; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'expense', label: 'Expenses' },
    { id: 'income', label: 'Income' },
    { id: 'cashflow', label: 'Cash Flow' },
    { id: 'calendar', label: 'Calendar' },
  ];

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-white mb-4">Analytics</h1>

        {/* View Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                view === v.id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Overview */}
        {view === 'overview' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <p className="text-xs text-emerald-400/70 mb-1">This Month Income</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
                <p className="text-xs text-emerald-400/50 mt-1">{incomePieData.length} sources</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <p className="text-xs text-red-400/70 mb-1">This Month Spend</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpense)}</p>
                <p className="text-xs text-red-400/50 mt-1">{expensePieData.length} categories</p>
              </div>
            </div>

            {/* Account Breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">Account Balances</h3>
              <div className="space-y-3">
                {accountData.map(acc => {
                  const totalAssets = accountData.reduce((s, a) => s + a.value, 0);
                  const pct = totalAssets > 0 ? (acc.value / totalAssets) * 100 : 0;
                  return (
                    <div key={acc.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span>{acc.icon}</span>
                          <span className="text-sm text-gray-300">{acc.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{formatCurrency(acc.value)}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%`, background: acc.color, boxShadow: `0 0 8px ${acc.color}44` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6-month trend */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">6-Month Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={monthlyData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="income" stroke="#00C896" strokeWidth={2} dot={{ fill: '#00C896', r: 3 }} name="Income" />
                  <Line type="monotone" dataKey="expense" stroke="#FF4D6D" strokeWidth={2} dot={{ fill: '#FF4D6D', r: 3 }} name="Expense" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Expense Pie */}
        {(view === 'expense' || view === 'income') && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-1">
                {view === 'expense' ? 'Expense Breakdown' : 'Income Sources'}
              </h3>
              <p className="text-xs text-gray-500 mb-4">This month</p>

              {(view === 'expense' ? expensePieData : incomePieData).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">{view === 'expense' ? '💸' : '💰'}</div>
                  <p className="text-sm">No {view} data this month</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <ResponsiveContainer width={200} height={200}>
                        <PieChart>
                          <Pie
                            data={view === 'expense' ? expensePieData : incomePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            onClick={(d: any) => setSelectedPieSlice(d.catId === selectedPieSlice ? null : d.catId)}
                          >
                            {(view === 'expense' ? expensePieData : incomePieData).map((entry, i) => (
                              <Cell
                                key={i}
                                fill={entry.color}
                                opacity={selectedPieSlice && selectedPieSlice !== entry.catId ? 0.3 : 1}
                                stroke={selectedPieSlice === entry.catId ? 'white' : 'transparent'}
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="text-lg font-bold text-white">
                          {formatCurrency(view === 'expense' ? totalExpense : totalIncome)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(view === 'expense' ? expensePieData : incomePieData).map((item, i) => {
                      const total = view === 'expense' ? totalExpense : totalIncome;
                      const pct = total > 0 ? (item.value / total) * 100 : 0;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedPieSlice(item.catId === selectedPieSlice ? null : item.catId)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                            selectedPieSlice === item.catId ? 'bg-white/10' : 'hover:bg-white/5'
                          }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-white font-medium">{item.name}</span>
                              <span className="text-sm font-bold" style={{ color: item.color }}>{formatCurrency(item.value)}</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color }} />
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-1 w-10 text-right">{pct.toFixed(0)}%</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Cash Flow */}
        {view === 'cashflow' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-1">Monthly Cash Flow</h3>
            <p className="text-xs text-gray-500 mb-4">Last 6 months</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData} barCategoryGap="20%">
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#00C896" radius={[4,4,0,0]} />
                <Bar dataKey="expense" name="Expense" fill="#FF4D6D" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-4 mt-3">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400" /><span className="text-xs text-gray-400">Income</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-xs text-gray-400">Expense</span></div>
            </div>

            {/* Month Details */}
            <div className="mt-4 space-y-2">
              {monthlyData.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-300 w-12">{m.month}</span>
                  <span className="text-sm text-emerald-400">+{formatCurrency(m.income)}</span>
                  <span className="text-sm text-red-400">-{formatCurrency(m.expense)}</span>
                  <span className={`text-sm font-bold ${m.income - m.expense >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(m.income - m.expense)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-1">
              {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-xs text-gray-500 mb-4">Daily spending heatmap</p>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const data = calendarDayData[day];
                const maxExpense = Math.max(...Object.values(calendarDayData).map(d => d.expense), 1);
                const intensity = data ? data.expense / maxExpense : 0;
                const isToday = new Date().getDate() === day && new Date().getMonth() === calendarMonth.getMonth();

                return (
                  <div
                    key={day}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs cursor-pointer transition-all hover:scale-105"
                    style={{
                      background: data
                        ? `rgba(255, 77, 109, ${0.15 + intensity * 0.7})`
                        : 'rgba(255,255,255,0.03)',
                      border: isToday ? '1px solid #6C63FF' : '1px solid transparent',
                    }}
                  >
                    <span className={isToday ? 'text-indigo-400 font-bold' : 'text-gray-400'}>{day}</span>
                    {data && data.expense > 0 && (
                      <div className="w-1 h-1 rounded-full bg-red-400 mt-0.5" />
                    )}
                    {data && data.income > 0 && (
                      <div className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
              <span>Less spending</span>
              <div className="flex gap-1">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map(o => (
                  <div key={o} className="w-5 h-3 rounded" style={{ background: `rgba(255,77,109,${o})` }} />
                ))}
              </div>
              <span>More spending</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
