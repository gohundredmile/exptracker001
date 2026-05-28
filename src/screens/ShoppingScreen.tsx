import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, Trash2, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, generateId } from '../utils/format';
import { Modal } from '../components/ui/Modal';

const ICONS = ['🛒','🛍️','🏪','🏬','🍎','🧴','🐾','🎁','💊','👕'];
const COLORS = ['#6C63FF','#00C896','#FFB830','#FF4D6D','#4ECDC4','#FF6B9D'];

export const ShoppingScreen: React.FC = () => {
  const { shoppingLists, addShoppingList, updateShoppingList, deleteShoppingList } = useStore();
  const [showListModal, setShowListModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState<string | null>(null);
  const [expandedList, setExpandedList] = useState<string | null>(null);
  const [listForm, setListForm] = useState({ name: '', icon: '🛒', color: '#6C63FF', currency: 'USD' });
  const [itemForm, setItemForm] = useState({ name: '', estimated_price: '', quantity: '1', unit: '' });

  const handleAddList = () => {
    if (!listForm.name) return;
    addShoppingList({
      id: generateId(),
      user_id: 'user-1',
      name: listForm.name,
      icon: listForm.icon,
      color: listForm.color,
      estimated_total: 0,
      actual_total: 0,
      currency: listForm.currency,
      is_completed: false,
      items: [],
      created_at: new Date().toISOString(),
    });
    setShowListModal(false);
    setListForm({ name: '', icon: '🛒', color: '#6C63FF', currency: 'USD' });
  };

  const handleAddItem = (listId: string) => {
    if (!itemForm.name) return;
    const list = shoppingLists.find(l => l.id === listId);
    if (!list) return;
    const newItem = {
      id: generateId(),
      list_id: listId,
      name: itemForm.name,
      estimated_price: itemForm.estimated_price ? parseFloat(itemForm.estimated_price) : undefined,
      quantity: parseInt(itemForm.quantity) || 1,
      unit: itemForm.unit || undefined,
      is_checked: false,
      display_order: list.items.length,
    };
    const newItems = [...list.items, newItem];
    const estimatedTotal = newItems.reduce((s, i) => s + (i.estimated_price || 0) * i.quantity, 0);
    updateShoppingList(listId, { items: newItems, estimated_total: estimatedTotal });
    setShowItemModal(null);
    setItemForm({ name: '', estimated_price: '', quantity: '1', unit: '' });
  };

  const toggleItem = (listId: string, itemId: string) => {
    const list = shoppingLists.find(l => l.id === listId);
    if (!list) return;
    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
    );
    const checkedTotal = updatedItems
      .filter(i => i.is_checked)
      .reduce((s, i) => s + (i.actual_price || i.estimated_price || 0) * i.quantity, 0);
    updateShoppingList(listId, { items: updatedItems, actual_total: checkedTotal });
  };

  const deleteItem = (listId: string, itemId: string) => {
    const list = shoppingLists.find(l => l.id === listId);
    if (!list) return;
    const newItems = list.items.filter(i => i.id !== itemId);
    updateShoppingList(listId, { items: newItems });
  };

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Shopping Lists</h1>
          <button onClick={() => setShowListModal(true)}
            className="flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus size={16} /> New List
          </button>
        </div>

        {shoppingLists.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No shopping lists</p>
            <p className="text-gray-500 text-sm">Create a list to track your purchases</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shoppingLists.map(list => {
              const checkedCount = list.items.filter(i => i.is_checked).length;
              const totalCount = list.items.length;
              const isExpanded = expandedList === list.id;

              return (
                <div key={list.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${list.color}33`, background: `${list.color}08` }}>
                  {/* List Header */}
                  <button
                    onClick={() => setExpandedList(isExpanded ? null : list.id)}
                    className="w-full flex items-center gap-3 p-4"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: list.color + '22' }}>
                      {list.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">{list.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {checkedCount}/{totalCount} items · {formatCurrency(list.estimated_total)} est.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {totalCount > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${totalCount ? (checkedCount/totalCount)*100 : 0}%`, background: list.color }} />
                          </div>
                        </div>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); deleteShoppingList(list.id); }} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </button>

                  {/* Items */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="space-y-2 mb-3">
                        {list.items.map(item => (
                          <div key={item.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                            <button onClick={() => toggleItem(list.id, item.id)} className="flex-shrink-0">
                              {item.is_checked
                                ? <CheckCircle size={20} style={{ color: list.color }} />
                                : <Circle size={20} className="text-gray-500" />
                              }
                            </button>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${item.is_checked ? 'text-gray-500 line-through' : 'text-white'}`}>
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                Qty: {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                                {item.estimated_price ? ` · ${formatCurrency(item.estimated_price)}` : ''}
                              </p>
                            </div>
                            <button onClick={() => deleteItem(list.id, item.id)} className="p-1 text-gray-600 hover:text-red-400">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      {list.items.length > 0 && (
                        <div className="flex justify-between text-xs text-gray-500 mb-3 px-1">
                          <span>Estimated: {formatCurrency(list.estimated_total)}</span>
                          <span>Actual: {formatCurrency(list.actual_total)}</span>
                        </div>
                      )}

                      <button
                        onClick={() => { setShowItemModal(list.id); setItemForm({ name: '', estimated_price: '', quantity: '1', unit: '' }); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed text-sm transition-all"
                        style={{ borderColor: list.color + '44', color: list.color }}
                      >
                        <Plus size={14} /> Add Item
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add List Modal */}
      <Modal isOpen={showListModal} onClose={() => setShowListModal(false)} title="New Shopping List">
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(icon => (
                <button key={icon} onClick={() => setListForm(f => ({ ...f, icon }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center ${listForm.icon === icon ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : 'bg-white/5'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button key={color} onClick={() => setListForm(f => ({ ...f, color }))}
                  className="w-8 h-8 rounded-full"
                  style={{ background: color, outline: listForm.color === color ? '2px solid white' : 'none', outlineOffset: '2px' }} />
              ))}
            </div>
          </div>
          <input value={listForm.name} onChange={e => setListForm(f => ({ ...f, name: e.target.value }))}
            placeholder="List name (e.g. Weekly Groceries)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          <button onClick={handleAddList}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
            Create List
          </button>
        </div>
      </Modal>

      {/* Add Item Modal */}
      {showItemModal && (
        <Modal isOpen={!!showItemModal} onClose={() => setShowItemModal(null)} title="Add Item">
          <div className="p-5 space-y-4">
            <input value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Item name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
            <div className="flex gap-3">
              <input type="number" value={itemForm.estimated_price} onChange={e => setItemForm(f => ({ ...f, estimated_price: e.target.value }))}
                placeholder="Price" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
              <input type="number" value={itemForm.quantity} onChange={e => setItemForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="Qty" className="w-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
              <input value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="Unit" className="w-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
            </div>
            <button onClick={() => handleAddItem(showItemModal)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
              Add Item
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
