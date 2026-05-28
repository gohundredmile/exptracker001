import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, generateId, getPercentage } from '../utils/format';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import type { DebtDirection } from '../types';

export const DebtsScreen: React.FC = () => {
  const { debts, addDebt, updateDebt, deleteDebt } = useStore();
  const [activeTab, setActiveTab] = useState<DebtDirection>('i_owe');
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [form, setForm] = useState({
    direction: 'i_owe' as DebtDirection,
    contact_name: '', original_amount: '', currency: 'USD',
    interest_rate: '0', due_date: '', note: '',
  });

  const iOwe = debts.filter(d => d.direction === 'i_owe');
  const owedToMe = debts.filter(d => d.direction === 'owed_to_me');
  const totalIOwe = iOwe.reduce((s, d) => s + d.remaining_amount, 0);
  const totalOwedToMe = owedToMe.reduce((s, d) => s + d.remaining_amount, 0);

  const displayed = activeTab === 'i_owe' ? iOwe : owedToMe;

  const handleSave = () => {
    if (!form.contact_name || !form.original_amount) return;
    const amount = parseFloat(form.original_amount);
    addDebt({
      id: generateId(),
      user_id: 'user-1',
      direction: form.direction,
      contact_name: form.contact_name,
      original_amount: amount,
      remaining_amount: amount,
      currency: form.currency,
      interest_rate: parseFloat(form.interest_rate || '0'),
      due_date: form.due_date || undefined,
      note: form.note,
      status: 'active',
      created_at: new Date().toISOString(),
    });
    setShowModal(false);
    setForm({ direction: 'i_owe', contact_name: '', original_amount: '', currency: 'USD', interest_rate: '0', due_date: '', note: '' });
  };

  const handlePayment = (debtId: string) => {
    const amount = parseFloat(payAmount);
    if (!amount) return;
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;
    const newRemaining = Math.max(0, debt.remaining_amount - amount);
    updateDebt(debtId, {
      remaining_amount: newRemaining,
      status: newRemaining <= 0 ? 'settled' : newRemaining < debt.original_amount ? 'partial' : 'active',
    });
    setShowPayModal(null);
    setPayAmount('');
  };

  const getStatusIcon = (status: string) => {
    if (status === 'settled') return <CheckCircle size={14} className="text-emerald-400" />;
    if (status === 'partial') return <Clock size={14} className="text-amber-400" />;
    return <AlertTriangle size={14} className="text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'settled') return 'text-emerald-400 bg-emerald-500/10';
    if (status === 'partial') return 'text-amber-400 bg-amber-500/10';
    return 'text-gray-400 bg-white/5';
  };

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Debt Tracker</h1>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus size={16} /> Add Debt
          </button>
        </div>

        {/* Summary Cards */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <p className="text-xs text-red-400/70 mb-1">I Owe</p>
            <p className="text-xl font-bold text-red-400">{formatCurrency(totalIOwe)}</p>
            <p className="text-xs text-red-400/50">{iOwe.filter(d => d.status !== 'settled').length} active</p>
          </div>
          <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-xs text-emerald-400/70 mb-1">Owed to Me</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalOwedToMe)}</p>
            <p className="text-xs text-emerald-400/50">{owedToMe.filter(d => d.status !== 'settled').length} active</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-4">
          {([
            { id: 'i_owe', label: 'I Owe', count: iOwe.length },
            { id: 'owed_to_me', label: 'Owed to Me', count: owedToMe.length },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-indigo-500 text-white' : 'text-gray-400'}`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Debt List */}
        {displayed.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">💳</div>
            <p className="text-white font-semibold mb-1">No {activeTab === 'i_owe' ? 'debts' : 'receivables'} found</p>
            <p className="text-gray-500 text-sm">Tap + to add a new entry</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(debt => {
              const paidPct = getPercentage(debt.original_amount - debt.remaining_amount, debt.original_amount);
              const isOverdue = debt.due_date && new Date(debt.due_date) < new Date() && debt.status !== 'settled';

              return (
                <div
                  key={debt.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4"
                  style={{ borderColor: isOverdue ? '#FF4D6D33' : undefined }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg font-bold text-indigo-300">
                        {debt.contact_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{debt.contact_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {getStatusIcon(debt.status)}
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(debt.status)}`}>
                            {debt.status}
                          </span>
                          {isOverdue && <span className="text-xs text-red-400">Overdue!</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${activeTab === 'i_owe' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatCurrency(debt.remaining_amount)}
                      </p>
                      <p className="text-xs text-gray-500">of {formatCurrency(debt.original_amount)}</p>
                    </div>
                  </div>

                  <ProgressBar value={paidPct} color={activeTab === 'i_owe' ? '#FF4D6D' : '#00C896'} height={6} />

                  {(debt.due_date || debt.note) && (
                    <div className="mt-3 space-y-1">
                      {debt.due_date && (
                        <p className="text-xs text-gray-500">📅 Due: {formatDate(debt.due_date)}</p>
                      )}
                      {debt.note && <p className="text-xs text-gray-600 truncate">📝 {debt.note}</p>}
                      {debt.interest_rate > 0 && (
                        <p className="text-xs text-amber-400">💹 {debt.interest_rate}% interest</p>
                      )}
                    </div>
                  )}

                  {debt.status !== 'settled' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => { setShowPayModal(debt.id); setPayAmount(''); }}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      >
                        Record Payment
                      </button>
                      <button
                        onClick={() => updateDebt(debt.id, { status: 'settled', remaining_amount: 0 })}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      >
                        Mark Settled
                      </button>
                      <button
                        onClick={() => deleteDebt(debt.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Debt Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Debt">
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="flex bg-white/5 rounded-2xl p-1">
            {(['i_owe', 'owed_to_me'] as DebtDirection[]).map(d => (
              <button key={d} onClick={() => setForm(f => ({ ...f, direction: d }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${form.direction === d ? 'bg-indigo-500 text-white' : 'text-gray-400'}`}>
                {d === 'i_owe' ? '🔴 I Owe' : '🟢 Owed to Me'}
              </button>
            ))}
          </div>
          <input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
            placeholder="Person / Company name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          <div className="flex gap-3">
            <input type="number" value={form.original_amount} onChange={e => setForm(f => ({ ...f, original_amount: e.target.value }))}
              placeholder="Amount"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
            <input type="number" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))}
              placeholder="Interest %"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          </div>
          <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none [color-scheme:dark]" />
          <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="Notes..." rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm resize-none" />
          <button onClick={handleSave} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
            Add Debt
          </button>
        </div>
      </Modal>

      {/* Payment Modal */}
      {showPayModal && (
        <Modal isOpen={!!showPayModal} onClose={() => setShowPayModal(null)} title="Record Payment">
          <div className="p-5 space-y-4">
            <p className="text-gray-400 text-sm">Enter payment amount</p>
            <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-2xl font-bold text-center" />
            <button onClick={() => handlePayment(showPayModal)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm">
              Record Payment
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
