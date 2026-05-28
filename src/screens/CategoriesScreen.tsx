import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateId } from '../utils/format';
import { Modal } from '../components/ui/Modal';
import type { CategoryType } from '../types';

const ICONS = ['🍔','🚗','🛍️','❤️','📚','🎬','⚡','✈️','📱','📦','💼','💻','📈','🎁','🏠','🔐','💵','🌐','🎯','💰','🛒','🎮','🎵','🐾','🌱','☕','🍕','🏋️','🎓','🏥'];
const COLORS = ['#6C63FF','#00C896','#FF4D6D','#FFB830','#4ECDC4','#FF6B9D','#45B7D1','#A8E6CF','#FF8C42','#9B59B6','#E74C3C','#2ECC71','#3498DB','#F39C12'];

export const CategoriesScreen: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, navigateBack } = useStore();
  const [activeType, setActiveType] = useState<CategoryType>('expense');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', type: 'expense' as CategoryType, icon: '📦', color: '#6C63FF' });

  const filtered = categories.filter(c => c.type === activeType || c.type === 'both');

  const handleSave = () => {
    if (!form.name) return;
    const cat = {
      id: editingId || generateId(),
      name: form.name,
      type: form.type,
      icon: form.icon,
      color: form.color,
      is_system: false,
      is_active: true,
      display_order: categories.length,
      user_id: 'user-1',
    };
    if (editingId) updateCategory(editingId, cat);
    else addCategory(cat);
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', type: 'expense', icon: '📦', color: '#6C63FF' });
  };

  const openEdit = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    setEditingId(id);
    setForm({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color });
    setShowModal(true);
  };

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={navigateBack} className="text-gray-400 hover:text-white text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-white flex-1">Categories</h1>
          <button onClick={() => { setEditingId(null); setShowModal(true); }}
            className="flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Type Tabs */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-5">
          {(['income', 'expense'] as CategoryType[]).map(t => (
            <button key={t} onClick={() => setActiveType(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${activeType === t ? 'bg-indigo-500 text-white' : 'text-gray-400'}`}>
              {t === 'income' ? '💰' : '💸'} {t}
            </button>
          ))}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-3 rounded-2xl p-3.5"
              style={{ background: cat.color + '15', border: `1px solid ${cat.color}33` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: cat.color + '22' }}>
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{cat.name}</p>
                {cat.is_system && <p className="text-xs text-gray-600">system</p>}
              </div>
              {!cat.is_system && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat.id)} className="p-1 text-gray-500 hover:text-indigo-400">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-1 text-gray-500 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Edit Category' : 'Add Category'}>
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Type</label>
            <div className="flex bg-white/5 rounded-xl p-1">
              {(['income', 'expense'] as CategoryType[]).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${form.type === t ? 'bg-indigo-500 text-white' : 'text-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
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
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                  className="w-8 h-8 rounded-full"
                  style={{ background: color, outline: form.color === color ? '2px solid white' : 'none', outlineOffset: '2px' }} />
              ))}
            </div>
          </div>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Category name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          <button onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
            {editingId ? 'Update Category' : 'Add Category'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
