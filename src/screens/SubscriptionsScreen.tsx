import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Calendar, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, generateId, formatDate } from '../utils/format';
import { Modal } from '../components/ui/Modal';
import type { BillingCycle } from '../types';

const POPULAR_SERVICES = [
  { name: 'Netflix', color: '#E50914', icon: '🎬' },
  { name: 'Spotify', color: '#1DB954', icon: '🎵' },
  { name: 'Disney+', color: '#0063E5', icon: '🏰' },
  { name: 'Amazon Prime', color: '#FF9900', icon: '📦' },
  { name: 'Apple TV+', color: '#000000', icon: '🍎' },
  { name: 'YouTube Premium', color: '#FF0000', icon: '▶️' },
  { name: 'Adobe CC', color: '#FF0000', icon: '🎨' },
  { name: 'iCloud', color: '#007AFF', icon: '☁️' },
  { name: 'Notion', color: '#000000', icon: '📝' },
  { name: 'Dropbox', color: '#0061FF', icon: '📁' },
];

const CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly',
  biannual: 'Bi-Annual', annual: 'Annual',
};

export const SubscriptionsScreen: React.FC = () => {
  const { subscriptions, accounts, addSubscription, updateSubscription, deleteSubscription } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', amount: '', currency: 'USD',
    billing_cycle: 'monthly' as BillingCycle, next_billing_date: '',
    start_date: new Date().toISOString().split('T')[0],
    account_id: '', color: '#6C63FF', note: '',
  });

  const activeSubscriptions = subscriptions.filter(s => s.is_active);
  const monthlyTotal = activeSubscriptions.reduce((sum, s) => {
    const multipliers: Record<BillingCycle, number> = {
      weekly: 4.33, monthly: 1, quarterly: 1/3, biannual: 1/6, annual: 1/12
    };
    return sum + s.amount * (multipliers[s.billing_cycle] || 1);
  }, 0);
  const annualTotal = monthlyTotal * 12;

  // Sort by next billing date
  const sorted = [...activeSubscriptions].sort((a, b) =>
    new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime()
  );

  const getDaysUntil = (dateStr: string) => {
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    return days;
  };

  const handleSave = () => {
    if (!form.name || !form.amount) return;
    const sub = {
      id: editingId || generateId(),
      user_id: 'user-1',
      name: form.name,
      amount: parseFloat(form.amount),
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      next_billing_date: form.next_billing_date || new Date().toISOString().split('T')[0],
      start_date: form.start_date,
      account_id: form.account_id || undefined,
      color: form.color,
      note: form.note,
      is_active: true,
      remind_days_before: 3,
      created_at: new Date().toISOString(),
    };
    if (editingId) updateSubscription(editingId, sub);
    else addSubscription(sub);
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', amount: '', currency: 'USD', billing_cycle: 'monthly', next_billing_date: '', start_date: new Date().toISOString().split('T')[0], account_id: '', color: '#6C63FF', note: '' });
  };

  const openEdit = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;
    setEditingId(id);
    setForm({
      name: sub.name, amount: sub.amount.toString(), currency: sub.currency,
      billing_cycle: sub.billing_cycle, next_billing_date: sub.next_billing_date,
      start_date: sub.start_date, account_id: sub.account_id || '', color: sub.color, note: sub.note || '',
    });
    setShowModal(true);
  };

  const COLORS = ['#E50914','#1DB954','#6C63FF','#FFB830','#FF4D6D','#007AFF','#4ECDC4','#9B59B6'];

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <button onClick={() => { setEditingId(null); setShowModal(true); }}
            className="flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-indigo-400" />
              <p className="text-xs text-gray-400">Monthly</p>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(monthlyTotal)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-amber-400" />
              <p className="text-xs text-gray-400">Annual</p>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(annualTotal)}</p>
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 mb-4">
          <p className="text-xs text-amber-400 font-semibold mb-2">📅 Upcoming This Week</p>
          <div className="space-y-1">
            {sorted.filter(s => getDaysUntil(s.next_billing_date) <= 7 && getDaysUntil(s.next_billing_date) >= 0).map(s => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">in {getDaysUntil(s.next_billing_date)} days</span>
                  <span className="text-white font-semibold">{formatCurrency(s.amount)}</span>
                </div>
              </div>
            ))}
            {sorted.filter(s => getDaysUntil(s.next_billing_date) <= 7 && getDaysUntil(s.next_billing_date) >= 0).length === 0 && (
              <p className="text-xs text-gray-500">No renewals this week</p>
            )}
          </div>
        </div>

        {/* Subscription List */}
        <div className="space-y-3">
          {sorted.map(sub => {
            const daysUntil = getDaysUntil(sub.next_billing_date);
            const isUrgent = daysUntil <= 3;

            return (
              <div
                key={sub.id}
                className="flex items-center gap-3 bg-white/5 border rounded-2xl p-4 transition-all"
                style={{ borderColor: isUrgent ? `${sub.color}44` : 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: sub.color + '22' }}
                >
                  {POPULAR_SERVICES.find(s => s.name.toLowerCase().includes(sub.name.toLowerCase()))?.icon || '📱'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{sub.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 capitalize">{CYCLE_LABELS[sub.billing_cycle]}</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className={`text-xs ${isUrgent ? 'text-amber-400' : 'text-gray-500'}`}>
                      {daysUntil === 0 ? 'Today!' : daysUntil < 0 ? 'Overdue' : `${daysUntil}d`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatCurrency(sub.amount)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(sub.next_billing_date)}</p>
                </div>
                <div className="flex flex-col gap-1 ml-1">
                  <button onClick={() => openEdit(sub.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => deleteSubscription(sub.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {activeSubscriptions.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📱</div>
              <p className="text-white font-semibold mb-1">No subscriptions</p>
              <p className="text-gray-500 text-sm">Track your recurring payments</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Edit Subscription' : 'Add Subscription'}>
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Quick pick popular */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Quick Add</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {POPULAR_SERVICES.slice(0, 6).map(s => (
                <button key={s.name} onClick={() => setForm(f => ({ ...f, name: s.name, color: s.color }))}
                  className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Service name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />

          <div className="flex gap-3">
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="Amount"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
            <select value={form.billing_cycle} onChange={e => setForm(f => ({ ...f, billing_cycle: e.target.value as BillingCycle }))}
              className="flex-1 bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
              {Object.entries(CYCLE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Next Billing Date</label>
            <input type="date" value={form.next_billing_date} onChange={e => setForm(f => ({ ...f, next_billing_date: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none [color-scheme:dark]" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                  className="w-8 h-8 rounded-full"
                  style={{ background: color, outline: form.color === color ? '2px solid white' : 'none', outlineOffset: '2px' }} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Pay from Account</label>
            <select value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
              <option value="">No linked account</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </select>
          </div>

          <button onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
            {editingId ? 'Update' : 'Add Subscription'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
