import React, { useState } from 'react';
import { Plus, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, getPercentage, getBudgetColor, generateId } from '../utils/format';
import { ProgressBar, CircularProgress } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';

export const BudgetsScreen: React.FC = () => {
  const { budgets, categories, addBudget, updateBudget, deleteBudget } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', amount: '', currency: 'USD', period: 'monthly',
    category_ids: [] as string[], icon: '💰', color: '#6C63FF',
    alert_at_50: true, alert_at_80: true, alert_at_100: true,
  });

  const totalBudgeted = budgets.filter(b => b.is_active).reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.filter(b => b.is_active).reduce((s, b) => s + b.spent, 0);
  const overBudgetCount = budgets.filter(b => b.is_active && b.spent > b.amount).length;

  const expenseCategories = categories.filter(c => (c.type === 'expense' || c.type === 'both') && c.is_active);

  const handleSaveBudget = () => {
    if (!form.name || !form.amount) return;

    const budget = {
      id: editingBudget || generateId(),
      user_id: 'user-1',
      name: form.name,
      amount: parseFloat(form.amount),
      spent: editingBudget ? budgets.find(b => b.id === editingBudget)?.spent || 0 : 0,
      currency: form.currency,
      period: form.period as any,
      category_ids: form.category_ids,
      alert_at_50: form.alert_at_50,
      alert_at_80: form.alert_at_80,
      alert_at_100: form.alert_at_100,
      is_active: true,
      color: form.color,
      icon: form.icon,
      created_at: new Date().toISOString(),
    };

    if (editingBudget) updateBudget(editingBudget, budget);
    else addBudget(budget);

    setShowAddModal(false);
    setEditingBudget(null);
    setForm({ name: '', amount: '', currency: 'USD', period: 'monthly', category_ids: [], icon: '💰', color: '#6C63FF', alert_at_50: true, alert_at_80: true, alert_at_100: true });
  };

  const openEdit = (budgetId: string) => {
    const b = budgets.find(bud => bud.id === budgetId);
    if (!b) return;
    setForm({
      name: b.name, amount: b.amount.toString(), currency: b.currency,
      period: b.period, category_ids: b.category_ids, icon: b.icon, color: b.color,
      alert_at_50: b.alert_at_50, alert_at_80: b.alert_at_80, alert_at_100: b.alert_at_100,
    });
    setEditingBudget(budgetId);
    setShowAddModal(true);
  };

  const ICONS = ['💰','🍔','🚗','🛍️','🏠','📱','✈️','❤️','📚','🎬','⚡','🎯','🎮','🛒','💳'];
  const COLORS = ['#6C63FF','#00C896','#FF4D6D','#FFB830','#4ECDC4','#FF6B9D','#45B7D1','#A8E6CF','#FF8C42','#9B59B6'];

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Budgets</h1>
          <button
            onClick={() => { setEditingBudget(null); setShowAddModal(true); }}
            className="flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors"
          >
            <Plus size={16} /> Add Budget
          </button>
        </div>

        {/* Overview Card */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: 'linear-gradient(135deg, #1a1040, #0d1b2a)', border: '1px solid rgba(108,99,255,0.3)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Budgeted</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalBudgeted)}</p>
            </div>
            <CircularProgress value={totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0} size={72} strokeWidth={7} color={getBudgetColor(totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0)}>
              <span className="text-xs font-bold text-white">{totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0}%</span>
            </CircularProgress>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-gray-500">Spent</p>
              <p className="text-base font-semibold text-red-400">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Remaining</p>
              <p className="text-base font-semibold text-emerald-400">{formatCurrency(Math.max(0, totalBudgeted - totalSpent))}</p>
            </div>
            {overBudgetCount > 0 && (
              <div className="ml-auto flex items-center gap-1">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="text-xs text-amber-400">{overBudgetCount} over limit</span>
              </div>
            )}
          </div>
        </div>

        {/* Budget List */}
        {budgets.filter(b => b.is_active).length === 0 ? (
          <div className="text-center py-16">
            <Target size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No budgets yet</p>
            <p className="text-gray-500 text-sm">Create your first budget to track spending</p>
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.filter(b => b.is_active).map(budget => {
                  const pct = getPercentage(budget.spent, budget.amount);
                  const remaining = budget.amount - budget.spent;
              const isOver = budget.spent > budget.amount;
              const linkedCategories = categories.filter(c => budget.category_ids.includes(c.id));

              return (
                <div
                  key={budget.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4"
                  style={{ borderColor: isOver ? '#FF4D6D33' : undefined }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: budget.color + '22' }}
                      >
                        {budget.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{budget.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{budget.period}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(budget.spent)}</p>
                      <p className="text-xs text-gray-500">of {formatCurrency(budget.amount)}</p>
                    </div>
                  </div>

                  <ProgressBar value={pct} budgetStyle height={8} />

                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-2">
                      {isOver ? (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <AlertTriangle size={12} /> Over by {formatCurrency(budget.spent - budget.amount)}
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <TrendingUp size={12} /> {formatCurrency(remaining)} left
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(budget.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {linkedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {linkedCategories.map(cat => (
                        <span key={cat.id} className="flex items-center gap-1 text-[10px] bg-white/5 rounded-full px-2 py-0.5 text-gray-500">
                          {cat.icon} {cat.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Budget Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditingBudget(null); }} title={editingBudget ? 'Edit Budget' : 'Create Budget'}>
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Icon + Color */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === icon ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : 'bg-white/5 hover:bg-white/10'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{ background: color, outline: form.color === color ? '2px solid white' : 'none', outlineOffset: '2px' }} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Budget Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Food & Dining"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1.5 block">Amount *</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="500"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1.5 block">Period</label>
              <select
                value={form.period}
                onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Link Categories (optional)</label>
            <div className="grid grid-cols-3 gap-2">
              {expenseCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({
                    ...f,
                    category_ids: f.category_ids.includes(cat.id)
                      ? f.category_ids.filter(id => id !== cat.id)
                      : [...f.category_ids, cat.id]
                  }))}
                  className={`flex items-center gap-1.5 p-2 rounded-xl text-xs transition-all ${
                    form.category_ids.includes(cat.id)
                      ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300'
                      : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Alert Thresholds</label>
            <div className="flex gap-3">
              {[
                { key: 'alert_at_50', label: '50%' },
                { key: 'alert_at_80', label: '80%' },
                { key: 'alert_at_100', label: '100%' },
              ].map(alert => (
                <button
                  key={alert.key}
                  onClick={() => setForm(f => ({ ...f, [alert.key]: !f[alert.key as keyof typeof f] }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    form[alert.key as keyof typeof form]
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                      : 'bg-white/5 border border-white/10 text-gray-500'
                  }`}
                >
                  {alert.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveBudget}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm"
          >
            {editingBudget ? 'Update Budget' : 'Create Budget'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
