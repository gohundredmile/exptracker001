import React, { useState } from 'react';
import { Download, FileText, Table, BarChart2, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';

export const ExportScreen: React.FC = () => {
  const { transactions, accounts, navigateBack } = useStore();
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [selectedType, setSelectedType] = useState('all_transactions');
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [exported, setExported] = useState(false);

  const filteredTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= new Date(dateFrom) && d <= new Date(dateTo + 'T23:59:59');
  });

  const totalIncome = filteredTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const handleExport = () => {
    // Simulate export
    if (selectedFormat === 'csv') {
      const headers = ['Date', 'Type', 'Title', 'Amount', 'Currency', 'Account', 'Category', 'Note'];
      const rows = filteredTxs.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        `"${t.title}"`,
        t.type === 'income' ? t.amount : -t.amount,
        t.currency,
        accounts.find(a => a.id === t.account_id)?.name || '',
        t.category_id || '',
        `"${t.note || ''}"`,
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `money-manager-export-${dateFrom}-${dateTo}.csv`;
      a.click();
    }
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const formats = [
    { id: 'pdf', icon: <FileText size={20} />, label: 'PDF Report', desc: 'Formatted with charts' },
    { id: 'csv', icon: <Table size={20} />, label: 'CSV Export', desc: 'Raw data for spreadsheets' },
    { id: 'excel', icon: <BarChart2 size={20} />, label: 'Excel Workbook', desc: 'Multiple sheets' },
  ];

  const reportTypes = [
    { id: 'all_transactions', label: 'All Transactions' },
    { id: 'income_expense', label: 'Income vs Expense' },
    { id: 'by_category', label: 'Category Summary' },
    { id: 'budget_performance', label: 'Budget Performance' },
    { id: 'account_statement', label: 'Account Statement' },
    { id: 'tax_summary', label: 'Tax Summary' },
  ];

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={navigateBack} className="text-gray-400 hover:text-white text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-white">Export & Reports</h1>
        </div>

        {/* Preview Summary */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'linear-gradient(135deg, #1a1040, #0d1b2a)', border: '1px solid rgba(108,99,255,0.3)' }}>
          <p className="text-xs text-gray-400 mb-3">Report Preview</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{filteredTxs.length}</p>
              <p className="text-xs text-gray-500">Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-gray-500">Income</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-red-400">{formatCurrency(totalExpense)}</p>
              <p className="text-xs text-gray-500">Expenses</p>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-white mb-3 block">Date Range</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 [color-scheme:dark]" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 [color-scheme:dark]" />
            </div>
          </div>
          {/* Quick date presets */}
          <div className="flex gap-2 mt-2">
            {[
              { label: '7D', days: 7 },
              { label: '30D', days: 30 },
              { label: '90D', days: 90 },
              { label: '1Y', days: 365 },
            ].map(p => (
              <button
                key={p.label}
                onClick={() => {
                  setDateFrom(new Date(Date.now() - p.days * 86400000).toISOString().split('T')[0]);
                  setDateTo(new Date().toISOString().split('T')[0]);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 border border-white/10 hover:bg-white/10 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Type */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-white mb-3 block">Report Type</label>
          <div className="grid grid-cols-2 gap-2">
            {reportTypes.map(rt => (
              <button
                key={rt.id}
                onClick={() => setSelectedType(rt.id)}
                className={`p-3 rounded-xl text-sm text-left transition-all ${
                  selectedType === rt.id
                    ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300'
                    : 'bg-white/5 border border-white/10 text-gray-400'
                }`}
              >
                {selectedType === rt.id && <CheckCircle size={12} className="inline mr-1 text-indigo-400" />}
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-white mb-3 block">Export Format</label>
          <div className="space-y-2">
            {formats.map(fmt => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id as any)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left ${
                  selectedFormat === fmt.id
                    ? 'bg-indigo-500/20 border border-indigo-500/50'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedFormat === fmt.id ? 'bg-indigo-500/30 text-indigo-400' : 'bg-white/5 text-gray-400'
                }`}>
                  {fmt.icon}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${selectedFormat === fmt.id ? 'text-indigo-300' : 'text-white'}`}>{fmt.label}</p>
                  <p className="text-xs text-gray-500">{fmt.desc}</p>
                </div>
                {selectedFormat === fmt.id && (
                  <CheckCircle size={20} className="ml-auto text-indigo-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className={`w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
            exported
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600'
          }`}
          style={{ boxShadow: exported ? '0 8px 24px rgba(0,200,150,0.4)' : '0 8px 24px rgba(108,99,255,0.4)' }}
        >
          {exported ? (
            <><CheckCircle size={20} /> Exported Successfully!</>
          ) : (
            <><Download size={20} /> Export {selectedFormat.toUpperCase()}</>
          )}
        </button>

        {/* Share Options */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 text-center mb-3">After export, share via:</p>
          <div className="flex justify-center gap-4">
            {['📧 Email', '📱 WhatsApp', '☁️ Drive', '📂 Files'].map(opt => (
              <button key={opt} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">{opt}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
