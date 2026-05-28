import React, { useState } from 'react';
import { ArrowLeft, Trash2, Edit2, MapPin, Tag, Calendar, Repeat } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDateFull, formatTime } from '../utils/format';

export const TransactionDetailScreen: React.FC = () => {
  const { transactions, categories, accounts, deleteTransaction, navigateBack, selectedTransactionId } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tx = transactions.find(t => t.id === selectedTransactionId);
  const cat = categories.find(c => c.id === tx?.category_id);
  const account = accounts.find(a => a.id === tx?.account_id);
  const toAccount = accounts.find(a => a.id === tx?.to_account_id);

  if (!tx) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>Transaction not found</p>
        <button onClick={navigateBack} className="mt-3 text-indigo-400">← Go Back</button>
      </div>
    );
  }

  const typeColor = tx.type === 'income' ? '#00C896' : tx.type === 'expense' ? '#FF4D6D' : '#6C63FF';
  const typeLabel = tx.type === 'income' ? 'Income' : tx.type === 'expense' ? 'Expense' : 'Transfer';

  const handleDelete = () => {
    deleteTransaction(tx.id);
    navigateBack();
  };

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={navigateBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex gap-2">
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white">
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Amount Hero */}
      <div className="mx-5 mb-5">
        <div
          className="rounded-3xl p-6 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${typeColor}22, ${typeColor}0a)`,
            border: `1px solid ${typeColor}33`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-[120px]">{cat?.icon || '💰'}</div>
          </div>
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{ background: typeColor + '22' }}
            >
              {cat?.icon || (tx.type === 'transfer' ? '🔁' : '💰')}
            </div>
            <p className="text-sm font-medium mb-2" style={{ color: typeColor }}>
              {typeLabel}
            </p>
            <p className="text-4xl font-bold text-white mb-1">
              {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount, tx.currency)}
            </p>
            <p className="text-base font-semibold text-white">{tx.title}</p>
            {tx.note && <p className="text-sm text-gray-400 mt-1">{tx.note}</p>}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mx-5 space-y-3">
        {/* Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <DetailRow icon={<Calendar size={16} />} label="Date & Time" value={`${formatDateFull(tx.date)} at ${formatTime(tx.date)}`} />
          {cat && <DetailRow icon={<span className="text-sm">{cat.icon}</span>} label="Category" value={cat.name} color={cat.color} />}
          {account && <DetailRow icon={<span className="text-sm">{account.icon}</span>} label="Account" value={`${account.name} (${account.currency})`} />}
          {toAccount && <DetailRow icon={<span className="text-sm">{toAccount.icon}</span>} label="To Account" value={toAccount.name} />}
          {tx.is_recurring && <DetailRow icon={<Repeat size={16} />} label="Recurring" value="Yes" color="#FFB830" />}
          {tx.is_tax_deductible && <DetailRow icon={<span>💼</span>} label="Tax Deductible" value="Yes" color="#00C896" />}
        </div>

        {/* Tags */}
        {tx.tags.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={14} className="text-gray-400" />
              <p className="text-sm text-gray-400">Tags</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tx.tags.map(tag => (
                <span key={tag} className="bg-indigo-500/20 text-indigo-300 text-xs rounded-full px-3 py-1">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        {tx.location_name && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <MapPin size={16} className="text-gray-400" />
            <p className="text-sm text-white">{tx.location_name}</p>
          </div>
        )}

        {/* Receipt placeholder */}
        {tx.receipt_url && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-gray-400 mb-2">📎 Receipt</p>
            <div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center text-gray-600">
              <p className="text-sm">Receipt Image</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-md bg-gray-900 rounded-t-3xl p-5 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-1">Delete Transaction?</h3>
            <p className="text-sm text-gray-400 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string; color?: string }> = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium" style={{ color: color || '#fff' }}>{value}</p>
    </div>
  </div>
);
