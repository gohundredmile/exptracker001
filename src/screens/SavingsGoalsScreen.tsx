import React, { useState } from 'react';
import { Plus, Target, Calendar, Trash2, Plus as PlusIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, generateId, getPercentage } from '../utils/format';
import { CircularProgress } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';

const ICONS = ['🎯','✈️','🏠','💻','🚗','💎','📱','🎓','🏖️','💪','🎵','🌍'];
const COLORS = ['#6C63FF','#00C896','#FF4D6D','#FFB830','#4ECDC4','#FF6B9D','#45B7D1','#9B59B6'];

export const SavingsGoalsScreen: React.FC = () => {
  const { savingsGoals, accounts, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [form, setForm] = useState({
    name: '', icon: '🎯', color: '#6C63FF', target_amount: '',
    current_amount: '', currency: 'USD', target_date: '', note: '',
    linked_account_id: '',
  });

  const totalSaved = savingsGoals.reduce((s, g) => s + g.current_amount, 0);
  const totalTarget = savingsGoals.reduce((s, g) => s + g.target_amount, 0);

  const handleSave = () => {
    if (!form.name || !form.target_amount) return;
    addSavingsGoal({
      id: generateId(),
      user_id: 'user-1',
      name: form.name,
      icon: form.icon,
      color: form.color,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount || '0'),
      currency: form.currency,
      linked_account_id: form.linked_account_id || undefined,
      target_date: form.target_date || undefined,
      is_completed: false,
      note: form.note,
      created_at: new Date().toISOString(),
    });
    setShowModal(false);
    setForm({ name: '', icon: '🎯', color: '#6C63FF', target_amount: '', current_amount: '', currency: 'USD', target_date: '', note: '', linked_account_id: '' });
  };

  const handleContribute = (goalId: string) => {
    const amount = parseFloat(contributeAmount);
    if (!amount) return;
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return;
    const newAmount = goal.current_amount + amount;
    updateSavingsGoal(goalId, {
      current_amount: newAmount,
      is_completed: newAmount >= goal.target_amount,
    });
    setShowContribute(null);
    setContributeAmount('');
  };

  const getMilestone = (pct: number) => {
    if (pct >= 100) return { emoji: '🎉', text: 'Goal Achieved!' };
    if (pct >= 75) return { emoji: '🔥', text: '75% reached!' };
    if (pct >= 50) return { emoji: '⭐', text: 'Halfway there!' };
    if (pct >= 25) return { emoji: '💪', text: '25% done!' };
    return null;
  };

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Savings Goals</h1>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus size={16} /> New Goal
          </button>
        </div>

        {/* Summary */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #1a1040, #0d1b2a)', border: '1px solid rgba(108,99,255,0.3)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Saved</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalSaved)}</p>
              <p className="text-xs text-gray-500 mt-0.5">of {formatCurrency(totalTarget)} total goal</p>
            </div>
            <CircularProgress
              value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}
              size={72}
              strokeWidth={7}
              color="#00C896"
            >
              <span className="text-xs font-bold text-white">{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</span>
            </CircularProgress>
          </div>
        </div>

        {/* Goals Grid */}
        {savingsGoals.length === 0 ? (
          <div className="text-center py-16">
            <Target size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No savings goals yet</p>
            <p className="text-gray-500 text-sm">Create your first goal and start saving</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savingsGoals.map(goal => {
              const pct = getPercentage(goal.current_amount, goal.target_amount);
              const milestone = getMilestone(pct);
              const daysLeft = goal.target_date
                ? Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000))
                : null;

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl p-4 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${goal.color}22, ${goal.color}0a)`, border: `1px solid ${goal.color}33` }}
                >
                  {goal.is_completed && (
                    <div className="absolute top-3 right-3 text-xs bg-emerald-500 text-white rounded-full px-2 py-0.5">✓ Done</div>
                  )}

                  <div className="flex items-start gap-4">
                    <CircularProgress value={pct} size={72} strokeWidth={7} color={goal.color}>
                      <div className="text-center">
                        <div className="text-xl">{goal.icon}</div>
                      </div>
                    </CircularProgress>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-base">{goal.name}</p>
                      {milestone && (
                        <span className="text-xs font-medium" style={{ color: goal.color }}>
                          {milestone.emoji} {milestone.text}
                        </span>
                      )}
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-lg font-bold text-white">{formatCurrency(goal.current_amount)}</span>
                        <span className="text-xs text-gray-400">/ {formatCurrency(goal.target_amount)}</span>
                      </div>
                      {daysLeft !== null && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar size={11} className="text-gray-500" />
                          <span className="text-xs text-gray-500">{daysLeft} days left</span>
                        </div>
                      )}
                      {goal.note && <p className="text-xs text-gray-600 mt-1 truncate">{goal.note}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => { setShowContribute(goal.id); setContributeAmount(''); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: goal.color + 'aa' }}
                    >
                      <PlusIcon size={14} /> Contribute
                    </button>
                    <button
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Savings Goal">
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center ${form.icon === icon ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : 'bg-white/5'}`}>
                  {icon}
                </button>
              ))}
            </div>
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
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Goal name (e.g. Europe Trip)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          <div className="flex gap-3">
            <input type="number" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
              placeholder="Target amount" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
            <input type="number" value={form.current_amount} onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))}
              placeholder="Already saved" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          </div>
          <input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 text-sm [color-scheme:dark]" />
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Link to Account</label>
            <select value={form.linked_account_id} onChange={e => setForm(f => ({ ...f, linked_account_id: e.target.value }))}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
              <option value="">No linked account</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </select>
          </div>
          <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="Notes..." rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm resize-none" />
          <button onClick={handleSave} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
            Create Goal
          </button>
        </div>
      </Modal>

      {/* Contribute Modal */}
      {showContribute && (
        <Modal isOpen={!!showContribute} onClose={() => setShowContribute(null)} title="Add Contribution">
          <div className="p-5 space-y-4">
            <p className="text-gray-400 text-sm">How much are you adding to this goal?</p>
            <input type="number" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)}
              placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-2xl font-bold text-center" />
            <button onClick={() => handleContribute(showContribute)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm">
              Add {contributeAmount ? formatCurrency(parseFloat(contributeAmount)) : ''} to Goal
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
