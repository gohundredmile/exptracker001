import React, { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, generateId } from '../utils/format';
import { Modal } from '../components/ui/Modal';
import type { AccountType } from '../types';

const ACCOUNT_TYPES: { type: AccountType; icon: string; label: string }[] = [
  { type: 'bank', icon: '🏦', label: 'Bank Account' },
  { type: 'cash', icon: '💵', label: 'Cash Wallet' },
  { type: 'credit_card', icon: '💳', label: 'Credit Card' },
  { type: 'debit_card', icon: '💳', label: 'Debit Card' },
  { type: 'e_wallet', icon: '🌐', label: 'E-Wallet' },
  { type: 'crypto', icon: '🔐', label: 'Crypto Wallet' },
  { type: 'custom', icon: '🎯', label: 'Custom' },
];

const COLORS = ['#6C63FF','#00C896','#FF4D6D','#FFB830','#4ECDC4','#FF6B9D','#45B7D1','#A8E6CF'];
const ICONS = ['🏦','💵','💳','🌐','🔐','🎯','💰','🏠','📈','🚀','💎','🌟'];

export const AccountsScreen: React.FC = () => {
  const { accounts, transactions, addAccount, updateAccount, deleteAccount } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', type: 'bank' as AccountType, currency: 'USD',
    initial_balance: '', color: '#6C63FF', icon: '🏦',
    include_in_total: true, credit_limit: '', description: '',
  });

  const totalBalance = accounts.filter(a => a.include_in_total && a.is_active).reduce((s, a) => s + a.balance, 0);
  const totalAssets = accounts.filter(a => a.balance > 0 && a.include_in_total).reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.balance < 0 && a.include_in_total).reduce((s, a) => s + Math.abs(a.balance), 0);

  const getAccountTrend = (accountId: string) => {
    const last7 = transactions.filter(t => {
      const d = new Date(t.date);
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      return t.account_id === accountId && d >= weekAgo;
    });
    return last7.reduce((s, t) => s + (t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : 0), 0);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', type: 'bank', currency: 'USD', initial_balance: '', color: '#6C63FF', icon: '🏦', include_in_total: true, credit_limit: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    setEditingId(id);
    setForm({
      name: acc.name, type: acc.type, currency: acc.currency,
      initial_balance: acc.initial_balance.toString(), color: acc.color, icon: acc.icon,
      include_in_total: acc.include_in_total, credit_limit: acc.credit_limit?.toString() || '', description: acc.description || '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    const accountData = {
      id: editingId || generateId(),
      user_id: 'user-1',
      name: form.name,
      type: form.type,
      currency: form.currency,
      balance: editingId ? accounts.find(a => a.id === editingId)?.balance || parseFloat(form.initial_balance || '0') : parseFloat(form.initial_balance || '0'),
      initial_balance: parseFloat(form.initial_balance || '0'),
      color: form.color,
      icon: form.icon,
      is_active: true,
      include_in_total: form.include_in_total,
      credit_limit: form.credit_limit ? parseFloat(form.credit_limit) : undefined,
      description: form.description,
      display_order: editingId ? accounts.find(a => a.id === editingId)?.display_order || 0 : accounts.length,
      created_at: new Date().toISOString(),
    };

    if (editingId) updateAccount(editingId, accountData);
    else addAccount(accountData);
    setShowModal(false);
  };

  const accountsByType = ACCOUNT_TYPES.reduce((acc, at) => {
    const accsOfType = accounts.filter(a => a.type === at.type && a.is_active);
    if (accsOfType.length > 0) acc[at.type] = accsOfType;
    return acc;
  }, {} as Record<string, typeof accounts>);

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Accounts</h1>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus size={16} /> Add Account
          </button>
        </div>

        {/* Net Worth Card */}
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'linear-gradient(135deg, #1a1040, #0d1b2a)', border: '1px solid rgba(108,99,255,0.3)' }}>
          <p className="text-xs text-gray-400 mb-1 tracking-wider">NET WORTH</p>
          <p className="text-3xl font-bold text-white mb-3">{formatCurrency(totalBalance)}</p>
          <div className="flex gap-6">
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-xs text-gray-400">Assets</span>
              </div>
              <p className="text-base font-bold text-emerald-400">{formatCurrency(totalAssets)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <TrendingDown size={14} className="text-red-400" />
                <span className="text-xs text-gray-400">Liabilities</span>
              </div>
              <p className="text-base font-bold text-red-400">{formatCurrency(totalLiabilities)}</p>
            </div>
          </div>
        </div>

        {/* Accounts by Type */}
        {Object.entries(accountsByType).map(([typeKey, accs]) => {
          const typeInfo = ACCOUNT_TYPES.find(at => at.type === typeKey);
          return (
            <div key={typeKey} className="mb-5">
              <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <span>{typeInfo?.icon}</span> {typeInfo?.label}
              </h2>
              <div className="space-y-3">
                {accs.map(account => {
                  const trend = getAccountTrend(account.id);
                  const accountTxCount = transactions.filter(t => t.account_id === account.id).length;

                  return (
                    <div
                      key={account.id}
                      className="rounded-2xl p-4 relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${account.color}22, ${account.color}0a)`, border: `1px solid ${account.color}33` }}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" style={{ background: account.color + '22' }} />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: account.color + '22' }}>
                              {account.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{account.name}</p>
                              <p className="text-xs text-gray-400 capitalize">{account.currency} · {accountTxCount} transactions</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(account.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => deleteAccount(account.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Balance</p>
                            <p className="text-2xl font-bold" style={{ color: account.balance >= 0 ? '#fff' : '#FF4D6D' }}>
                              {formatCurrency(account.balance)}
                            </p>
                            {account.credit_limit && (
                              <p className="text-xs text-gray-500 mt-0.5">Limit: {formatCurrency(account.credit_limit)}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center gap-1 justify-end ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              <span className="text-sm font-medium">{formatCurrency(Math.abs(trend))}</span>
                            </div>
                            <p className="text-xs text-gray-500">last 7 days</p>
                          </div>
                        </div>

                        {!account.include_in_total && (
                          <span className="absolute top-3 right-16 text-xs text-gray-500 bg-white/5 rounded-full px-2 py-0.5">excluded</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {accounts.filter(a => a.is_active).length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏦</div>
            <p className="text-white font-semibold mb-1">No accounts yet</p>
            <p className="text-gray-500 text-sm">Add your first account to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Account' : 'Add Account'}>
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Icon */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === icon ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : 'bg-white/5'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
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
            <label className="text-xs text-gray-400 mb-1.5 block">Account Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Chase Savings"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Account Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNT_TYPES.map(at => (
                <button key={at.type} onClick={() => setForm(f => ({ ...f, type: at.type, icon: at.icon }))}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm transition-all ${form.type === at.type ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                  <span>{at.icon}</span> {at.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1.5 block">Initial Balance</label>
              <input type="number" value={form.initial_balance} onChange={e => setForm(f => ({ ...f, initial_balance: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1.5 block">Currency</label>
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
                {['USD','EUR','GBP','JPY','INR','CAD','AUD'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {form.type === 'credit_card' && (
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Credit Limit</label>
              <input type="number" value={form.credit_limit} onChange={e => setForm(f => ({ ...f, credit_limit: e.target.value }))}
                placeholder="5000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional notes..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div>
              <p className="text-sm text-white">Include in Total</p>
              <p className="text-xs text-gray-500">Count this account in net worth</p>
            </div>
            <button onClick={() => setForm(f => ({ ...f, include_in_total: !f.include_in_total }))}
              className={`w-12 h-6 rounded-full transition-all duration-200 ${form.include_in_total ? 'bg-indigo-500' : 'bg-gray-600'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-all duration-200 mx-0.5 ${form.include_in_total ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <button onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
            {editingId ? 'Update Account' : 'Add Account'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
