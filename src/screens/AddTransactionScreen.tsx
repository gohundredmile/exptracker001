import React, { useState } from 'react';
import { X, ChevronDown, Tag, MapPin, Repeat, Camera } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, generateId } from '../utils/format';
import type { TransactionType } from '../types';

interface AddTransactionScreenProps {
  onClose: () => void;
}

const CALC_BUTTONS = ['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+'];

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({ onClose }) => {
  const { accounts, categories, addTransaction, profile } = useStore();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('0');
  const [displayExpr, setDisplayExpr] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [selectedToAccountId, setSelectedToAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showToAccountPicker, setShowToAccountPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredCategories = categories.filter(c =>
    c.is_active && (c.type === type || c.type === 'both')
  );

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const selectedToAccount = accounts.find(a => a.id === selectedToAccountId);

  const handleCalc = (key: string) => {
    if (key === '=') {
      try {
        const expr = displayExpr.replace('÷', '/').replace('×', '*');
        const result = Function(`'use strict'; return (${expr})`)();
        setAmount(parseFloat(result.toFixed(2)).toString());
        setDisplayExpr('');
      } catch { }
      return;
    }
    if (['+', '-', '÷', '×'].includes(key)) {
      setDisplayExpr(prev => (prev || amount) + key);
      return;
    }
    if (displayExpr) {
      setDisplayExpr(prev => prev + key);
    } else {
      if (key === '.' && amount.includes('.')) return;
      if (amount === '0' && key !== '.') setAmount(key);
      else setAmount(prev => prev + key);
    }
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (type !== 'transfer' && !selectedCategoryId) { setShowCategoryPicker(true); return; }
    setSaving(true);
    const tx = {
      id: generateId(),
      user_id: 'user-1',
      type,
      amount: parseFloat(amount),
      currency: profile.default_currency,
      account_id: selectedAccountId,
      to_account_id: type === 'transfer' ? selectedToAccountId : undefined,
      category_id: type !== 'transfer' ? selectedCategoryId : undefined,
      title: title || selectedCategory?.name || (type === 'transfer' ? 'Transfer' : 'Transaction'),
      note,
      date: new Date(date).toISOString(),
      is_recurring: isRecurring,
      tags,
      hashtags: [],
      is_tax_deductible: false,
      created_at: new Date().toISOString(),
    };
    setTimeout(() => {
      addTransaction(tx);
      onClose();
    }, 400);
  };

  const typeColors: Record<TransactionType, string> = {
    income: '#00C896',
    expense: '#FF4D6D',
    transfer: '#6C63FF',
  };

  const currentColor = typeColors[type];

  return (
    <div className="flex flex-col h-full max-h-[95vh] bg-gray-900 rounded-t-3xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-lg font-bold text-white">Add Transaction</h2>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Type Toggle */}
      <div className="mx-5 mb-4 bg-white/5 rounded-2xl p-1 flex">
        {(['expense', 'income', 'transfer'] as TransactionType[]).map(t => (
          <button
            key={t}
            onClick={() => { setType(t); setSelectedCategoryId(''); }}
            className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200"
            style={{
              background: type === t ? currentColor + '33' : 'transparent',
              color: type === t ? currentColor : '#6B7280',
              border: type === t ? `1px solid ${currentColor}66` : '1px solid transparent',
            }}
          >
            {t === 'expense' ? '💸' : t === 'income' ? '💰' : '🔁'} {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {/* Amount Display */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-400 text-2xl">$</span>
            <span
              className="text-5xl font-bold transition-all duration-200"
              style={{ color: currentColor }}
            >
              {displayExpr || parseFloat(amount || '0').toLocaleString('en-US', { minimumFractionDigits: amount.includes('.') ? 2 : 0 })}
            </span>
          </div>
          {displayExpr && (
            <p className="text-gray-500 text-sm mt-1">{amount}</p>
          )}
        </div>

        {/* Calculator */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {CALC_BUTTONS.map((key) => (
            <button
              key={key}
              onClick={() => handleCalc(key)}
              className={`h-12 rounded-xl text-lg font-semibold transition-all duration-150 active:scale-90 ${
                ['+', '-', '÷', '×', '='].includes(key)
                  ? 'text-white'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
              style={
                key === '='
                  ? { background: `linear-gradient(135deg, ${currentColor}aa, ${currentColor})`, boxShadow: `0 4px 12px ${currentColor}44` }
                  : ['+', '-', '÷', '×'].includes(key)
                  ? { background: 'rgba(108,99,255,0.2)', color: '#a78bfa' }
                  : {}
              }
            >
              {key}
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <div className="space-y-3 mb-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm transition-colors"
          />

          {/* Category */}
          {type !== 'transfer' && (
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <span>{selectedCategory?.icon || '📁'}</span>
                <span className={selectedCategoryId ? 'text-white' : 'text-gray-500'}>
                  {selectedCategory?.name || 'Select Category'}
                </span>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          )}

          {/* Category Picker */}
          {showCategoryPicker && (
            <div className="bg-gray-800 border border-white/10 rounded-2xl p-3">
              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategoryId(cat.id); setShowCategoryPicker(false); if (!title) setTitle(cat.name); }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      selectedCategoryId === cat.id ? 'ring-2 ring-indigo-500' : 'hover:bg-white/5'
                    }`}
                    style={{ background: selectedCategoryId === cat.id ? cat.color + '22' : '' }}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[10px] text-gray-400 text-center leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Account */}
          <button
            onClick={() => setShowAccountPicker(!showAccountPicker)}
            className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-white/10"
          >
            <div className="flex items-center gap-2">
              <span>{selectedAccount?.icon || '🏦'}</span>
              <span className="text-white">{selectedAccount?.name || 'Select Account'}</span>
              <span className="text-gray-500 text-xs">({formatCurrency(selectedAccount?.balance || 0)})</span>
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {showAccountPicker && (
            <div className="bg-gray-800 border border-white/10 rounded-2xl p-2 space-y-1">
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => { setSelectedAccountId(acc.id); setShowAccountPicker(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    selectedAccountId === acc.id ? 'bg-indigo-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  <span>{acc.icon}</span>
                  <span className="text-sm text-white flex-1 text-left">{acc.name}</span>
                  <span className="text-xs text-gray-400">{formatCurrency(acc.balance)}</span>
                </button>
              ))}
            </div>
          )}

          {/* To Account (Transfer) */}
          {type === 'transfer' && (
            <>
              <button
                onClick={() => setShowToAccountPicker(!showToAccountPicker)}
                className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span>{selectedToAccount?.icon || '🏦'}</span>
                  <span className={selectedToAccountId ? 'text-white' : 'text-gray-500'}>
                    {selectedToAccount?.name || 'To Account'}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              {showToAccountPicker && (
                <div className="bg-gray-800 border border-white/10 rounded-2xl p-2 space-y-1">
                  {accounts.filter(a => a.id !== selectedAccountId).map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => { setSelectedToAccountId(acc.id); setShowToAccountPicker(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5"
                    >
                      <span>{acc.icon}</span>
                      <span className="text-sm text-white flex-1 text-left">{acc.name}</span>
                      <span className="text-xs text-gray-400">{formatCurrency(acc.balance)}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Date */}
          <input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
          />

          {/* Note */}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm resize-none transition-colors"
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 rounded-full px-3 py-1 text-xs">
                <Tag size={10} /> {tag}
                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1 text-indigo-400 hover:text-white">×</button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); e.preventDefault(); } }}
              placeholder="+ Add tag"
              className="bg-transparent text-sm text-gray-400 placeholder-gray-600 outline-none"
            />
          </div>

          {/* Extra Options */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isRecurring ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-gray-500 border border-white/10'
              }`}
            >
              <Repeat size={14} /> Recurring
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-gray-500 border border-white/10">
              <MapPin size={14} /> Location
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-gray-500 border border-white/10">
              <Camera size={14} /> Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="p-5 pt-3 border-t border-white/10">
        <button
          onClick={handleSave}
          disabled={saving || parseFloat(amount) <= 0}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-95 disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${currentColor}dd, ${currentColor})`,
            boxShadow: `0 8px 24px ${currentColor}44`,
          }}
        >
          {saving ? '✓ Saved!' : `Save ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </button>
      </div>
    </div>
  );
};
