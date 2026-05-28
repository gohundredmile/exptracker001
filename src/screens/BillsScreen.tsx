import React, { useState } from 'react';
import { Plus, CheckCircle, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, generateId, formatDate } from '../utils/format';
import { Modal } from '../components/ui/Modal';

export const BillsScreen: React.FC = () => {
  const { bills, accounts, categories, addBill, updateBill, deleteBill } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');
  const [form, setForm] = useState({
    name: '', amount: '', currency: 'USD', due_date: '',
    account_id: '', category_id: '', is_recurring: false,
    note: '', remind_days_before: '3',
  });

  const filtered = bills.filter(b => filterStatus === 'all' || b.status === filterStatus);
  const unpaidTotal = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
  const overdue = bills.filter(b => b.status === 'overdue').length;

  const handleSave = () => {
    if (!form.name || !form.amount || !form.due_date) return;
    addBill({
      id: generateId(),
      user_id: 'user-1',
      name: form.name,
      amount: parseFloat(form.amount),
      currency: form.currency,
      due_date: form.due_date,
      account_id: form.account_id || undefined,
      category_id: form.category_id || undefined,
      status: 'unpaid',
      is_recurring: form.is_recurring,
      note: form.note,
      remind_days_before: parseInt(form.remind_days_before) || 3,
      created_at: new Date().toISOString(),
    });
    setShowModal(false);
    setForm({ name: '', amount: '', currency: 'USD', due_date: '', account_id: '', category_id: '', is_recurring: false, note: '', remind_days_before: '3' });
  };

  const getStatusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle size={16} className="text-emerald-400" />;
    if (status === 'overdue') return <AlertTriangle size={16} className="text-red-400" />;
    return <Clock size={16} className="text-amber-400" />;
  };

  const getStatusBg = (status: string) => {
    if (status === 'paid') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
    if (status === 'overdue') return 'bg-red-500/10 border-red-500/20 text-red-300';
    return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
  };

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Bills</h1>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus size={16} /> Add Bill
          </button>
        </div>

        {/* Summary */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
            <p className="text-xs text-red-400/70">Total Unpaid</p>
            <p className="text-xl font-bold text-red-400">{formatCurrency(unpaidTotal)}</p>
          </div>
          {overdue > 0 && (
            <div className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3">
              <p className="text-xs text-amber-400/70">Overdue</p>
              <p className="text-xl font-bold text-amber-400">{overdue} bill{overdue !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {(['all', 'unpaid', 'overdue', 'paid'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                filterStatus === s ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10'
              }`}>
              {s === 'all' ? 'All Bills' : s}
            </button>
          ))}
        </div>

        {/* Bills List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🧾</div>
            <p className="text-white font-semibold mb-1">No bills found</p>
            <p className="text-gray-500 text-sm">Add your recurring bills and utilities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(bill => (
              <div key={bill.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(bill.status)}
                    <div>
                      <p className="font-semibold text-white text-sm">{bill.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Due: {formatDate(bill.due_date)}</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-white">{formatCurrency(bill.amount)}</p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getStatusBg(bill.status)}`}>
                    {bill.status}
                  </span>
                  <div className="flex gap-2">
                    {bill.status !== 'paid' && (
                      <button onClick={() => updateBill(bill.id, { status: 'paid' })}
                        className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        Mark Paid
                      </button>
                    )}
                    <button onClick={() => deleteBill(bill.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {bill.note && <p className="text-xs text-gray-600 mt-2">{bill.note}</p>}
                {bill.is_recurring && <span className="text-xs text-indigo-400 mt-1 block">🔁 Recurring</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Bill">
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Bill name (e.g. Electric Bill)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />

          <div className="flex gap-3">
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="Amount"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="w-24 bg-gray-800 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none">
              {['USD','EUR','GBP','JPY','INR'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none [color-scheme:dark]" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Category</label>
            <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
              <option value="">Select category</option>
              {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Pay from Account</label>
            <select value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
              <option value="">No linked account</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </select>
          </div>

          <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="Notes..." rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm resize-none" />

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div>
              <p className="text-sm text-white">Recurring Bill</p>
              <p className="text-xs text-gray-500">Repeats every month</p>
            </div>
            <button onClick={() => setForm(f => ({ ...f, is_recurring: !f.is_recurring }))}
              className={`w-12 h-6 rounded-full transition-all ${form.is_recurring ? 'bg-indigo-500' : 'bg-gray-600'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow mx-0.5 transition-all ${form.is_recurring ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <button onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
            Add Bill
          </button>
        </div>
      </Modal>
    </div>
  );
};
