import React, { useState } from 'react';
import { Plus, Users, Trash2, UserPlus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, generateId } from '../utils/format';
import { Modal } from '../components/ui/Modal';

const ICONS = ['✈️','🏠','🎉','💼','🌍','🎓','🏋️','🍽️','🎮','🤝'];
const COLORS = ['#6C63FF','#00C896','#FFB830','#FF4D6D','#4ECDC4','#FF6B9D','#45B7D1'];

export const SharedProjectsScreen: React.FC = () => {
  const { sharedProjects, profile, addSharedProject, deleteSharedProject } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '✈️', color: '#6C63FF', currency: 'USD' });

  const handleSave = () => {
    if (!form.name) return;
    addSharedProject({
      id: generateId(),
      name: form.name,
      description: form.description,
      icon: form.icon,
      color: form.color,
      currency: form.currency,
      owner_id: profile.id,
      total_amount: 0,
      is_active: true,
      members: [{ user_id: profile.id, name: `${profile.full_name} (You)`, role: 'owner', paid_amount: 0 }],
      created_at: new Date().toISOString(),
    });
    setShowModal(false);
    setForm({ name: '', description: '', icon: '✈️', color: '#6C63FF', currency: 'USD' });
  };

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Shared Projects</h1>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus size={16} /> New Project
          </button>
        </div>

        {sharedProjects.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No shared projects</p>
            <p className="text-gray-500 text-sm">Create a project to split expenses with others</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sharedProjects.map(project => {
              const totalPaid = project.members.reduce((s, m) => s + m.paid_amount, 0);
              const perPerson = project.members.length > 0 ? totalPaid / project.members.length : 0;

              return (
                <div key={project.id} className="rounded-2xl overflow-hidden" style={{ background: `${project.color}15`, border: `1px solid ${project.color}33` }}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center" style={{ background: project.color + '22' }}>
                          {project.icon}
                        </div>
                        <div>
                          <p className="font-bold text-white">{project.name}</p>
                          {project.description && <p className="text-xs text-gray-400 mt-0.5">{project.description}</p>}
                          <div className="flex items-center gap-1.5 mt-1">
                            <Users size={11} className="text-gray-500" />
                            <span className="text-xs text-gray-500">{project.members.length} members</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteSharedProject(project.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-white/5 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-bold text-white">{formatCurrency(totalPaid)}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-gray-500">Per Person</p>
                        <p className="text-sm font-bold text-white">{formatCurrency(perPerson)}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-gray-500">Currency</p>
                        <p className="text-sm font-bold text-white">{project.currency}</p>
                      </div>
                    </div>

                    {/* Members */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Members</p>
                      <div className="space-y-2">
                        {project.members.map(member => {
                          const owes = member.paid_amount - perPerson;
                          return (
                            <div key={member.user_id} className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                                {member.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-white">{member.name}</p>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    member.role === 'owner' ? 'bg-amber-500/20 text-amber-400' :
                                    member.role === 'editor' ? 'bg-indigo-500/20 text-indigo-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>{member.role}</span>
                                </div>
                                <p className="text-xs text-gray-500">Paid: {formatCurrency(member.paid_amount)}</p>
                              </div>
                              <span className={`text-xs font-semibold ${owes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {owes >= 0 ? '+' : ''}{formatCurrency(owes)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Settlement Suggestions */}
                    <div className="mt-4 p-3 bg-white/5 rounded-xl">
                      <p className="text-xs text-gray-400 font-semibold mb-2">💡 Settlement</p>
                      {project.members
                        .filter(m => m.paid_amount < perPerson)
                        .map(m => ({
                          from: m.name,
                          to: project.members.find(pm => pm.paid_amount > perPerson)?.name || '?',
                          amount: perPerson - m.paid_amount,
                        }))
                        .map((s, i) => (
                          <p key={i} className="text-xs text-gray-300">
                            {s.from} → {s.to}: <span className="text-amber-400 font-semibold">{formatCurrency(s.amount)}</span>
                          </p>
                        ))
                      }
                      {project.members.every(m => Math.abs(m.paid_amount - perPerson) < 0.01) && (
                        <p className="text-xs text-emerald-400">✓ All settled!</p>
                      )}
                    </div>

                    <button className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border" style={{ borderColor: project.color + '44', color: project.color }}>
                      <UserPlus size={13} /> Invite Member
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Project">
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Icon</label>
            <div className="flex gap-2 flex-wrap">
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
            placeholder="Project name (e.g. Europe Trip 2025)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
            {['USD','EUR','GBP','JPY','INR','CAD','AUD'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
            Create Project
          </button>
        </div>
      </Modal>
    </div>
  );
};
