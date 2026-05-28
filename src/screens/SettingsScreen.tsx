import React, { useState } from 'react';
import { Moon, Sun, Shield, Bell, DollarSign, Download, Upload, ChevronRight, Palette, Globe, Lock, Smartphone, Database, HelpCircle, LogOut, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/ui/Modal';

const ACCENT_COLORS = [
  { color: '#6C63FF', name: 'Indigo' },
  { color: '#00C896', name: 'Emerald' },
  { color: '#FF4D6D', name: 'Rose' },
  { color: '#FFB830', name: 'Amber' },
  { color: '#45B7D1', name: 'Sky' },
  { color: '#9B59B6', name: 'Purple' },
  { color: '#FF6B9D', name: 'Pink' },
  { color: '#4ECDC4', name: 'Teal' },
  { color: '#FF8C42', name: 'Orange' },
  { color: '#A8E6CF', name: 'Mint' },
  { color: '#E74C3C', name: 'Red' },
  { color: '#2ECC71', name: 'Green' },
];

const CURRENCIES = ['USD','EUR','GBP','JPY','INR','CAD','AUD','CHF','SGD','BRL','MXN','KRW'];

export const SettingsScreen: React.FC = () => {
  const { profile, isDark, toggleTheme, updateProfile, setAuthenticated, navigateTo } = useStore();
  const [showAppearance, setShowAppearance] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editName, setEditName] = useState(profile.full_name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [pinEnabled, setPinEnabled] = useState(!!profile.pin_hash);
  const [biometricEnabled, setBiometricEnabled] = useState(profile.biometric_enabled);

  const SettingRow: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
  }> = ({ icon, title, subtitle, right, onClick, danger }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left ${danger ? 'hover:bg-red-500/10' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
      </div>
      {right || <ChevronRight size={16} className="text-gray-600" />}
    </button>
  );

  const Toggle: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => (
    <button onClick={onChange} className={`w-12 h-6 rounded-full transition-all duration-200 ${value ? 'bg-indigo-500' : 'bg-gray-600'}`}>
      <div className={`w-5 h-5 rounded-full bg-white shadow mx-0.5 transition-all duration-200 ${value ? 'translate-x-6' : ''}`} />
    </button>
  );

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        {/* Profile Card */}
        <div
          className="rounded-2xl p-4 mb-6 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setShowProfile(true)}
          style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(108,99,255,0.1))', border: '1px solid rgba(108,99,255,0.3)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-white">{profile.full_name}</p>
              <p className="text-sm text-gray-400">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs bg-indigo-500/20 text-indigo-300 rounded-full px-2 py-0.5">Premium Plan</span>
                <span className="text-xs text-gray-500">· {profile.default_currency}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-3 px-5">
        {/* Appearance */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Appearance</p>
          </div>
          <SettingRow
            icon={isDark ? <Moon size={16} /> : <Sun size={16} />}
            title="Dark Mode"
            subtitle={isDark ? 'Dark theme active' : 'Light theme active'}
            onClick={toggleTheme}
            right={<Toggle value={isDark} onChange={toggleTheme} />}
          />
          <div className="border-t border-white/5" />
          <SettingRow
            icon={<Palette size={16} />}
            title="Accent Color"
            subtitle={ACCENT_COLORS.find(c => c.color === profile.accent_color)?.name || 'Custom'}
            onClick={() => setShowAppearance(true)}
            right={
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full" style={{ background: profile.accent_color }} />
                <ChevronRight size={16} className="text-gray-600" />
              </div>
            }
          />
          <div className="border-t border-white/5" />
          <SettingRow
            icon={<Smartphone size={16} />}
            title="Font Size"
            subtitle={profile.font_size.charAt(0).toUpperCase() + profile.font_size.slice(1)}
            onClick={() => updateProfile({ font_size: profile.font_size === 'normal' ? 'large' : profile.font_size === 'large' ? 'xlarge' : 'normal' })}
          />
        </div>

        {/* Finance */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Finance</p>
          </div>
          <SettingRow
            icon={<DollarSign size={16} />}
            title="Default Currency"
            subtitle={profile.default_currency}
            onClick={() => setShowCurrency(true)}
          />
          <div className="border-t border-white/5" />
          <SettingRow
            icon={<Globe size={16} />}
            title="Exchange Rates"
            subtitle="Live rates via Open Exchange"
            onClick={() => {}}
          />
          <div className="border-t border-white/5" />
          <SettingRow
            icon={<Database size={16} />}
            title="Categories"
            subtitle="Manage income & expense categories"
            onClick={() => navigateTo('categories')}
          />
        </div>

        {/* Security */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Security</p>
          </div>
          <SettingRow
            icon={<Lock size={16} />}
            title="PIN Lock"
            subtitle={pinEnabled ? 'PIN protection enabled' : 'No PIN set'}
            onClick={() => setPinEnabled(!pinEnabled)}
            right={<Toggle value={pinEnabled} onChange={() => setPinEnabled(!pinEnabled)} />}
          />
          <div className="border-t border-white/5" />
          <SettingRow
            icon={<Shield size={16} />}
            title="Biometric Auth"
            subtitle="Face ID / Fingerprint"
            right={<Toggle value={biometricEnabled} onChange={() => { setBiometricEnabled(!biometricEnabled); updateProfile({ biometric_enabled: !biometricEnabled }); }} />}
          />
          <div className="border-t border-white/5" />
          <SettingRow
            icon={<Smartphone size={16} />}
            title="Auto-Lock Timer"
            subtitle={`Lock after ${profile.auto_lock_minutes} minutes`}
            onClick={() => updateProfile({ auto_lock_minutes: profile.auto_lock_minutes === 1 ? 5 : profile.auto_lock_minutes === 5 ? 15 : profile.auto_lock_minutes === 15 ? 30 : 1 })}
          />
        </div>

        {/* Notifications */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Notifications</p>
          </div>
          <SettingRow
            icon={<Bell size={16} />}
            title="Daily Reminder"
            subtitle={profile.daily_reminder_enabled ? `Remind at ${profile.daily_reminder_time}` : 'Disabled'}
            onClick={() => setShowNotifications(true)}
            right={<Toggle value={profile.daily_reminder_enabled} onChange={() => updateProfile({ daily_reminder_enabled: !profile.daily_reminder_enabled })} />}
          />
          <div className="border-t border-white/5" />
          <SettingRow
            icon={<Bell size={16} />}
            title="Budget Alerts"
            subtitle="Get notified when nearing limits"
            right={<Toggle value={true} onChange={() => {}} />}
          />
        </div>

        {/* Data */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Data & Backup</p>
          </div>
          <SettingRow
            icon={<Upload size={16} />}
            title="Export Data"
            subtitle="Download CSV, PDF, or Excel"
            onClick={() => navigateTo('export')}
          />
          <div className="border-t border-white/5" />
          <SettingRow
            icon={<Download size={16} />}
            title="Backup & Restore"
            subtitle="Auto-backup to cloud"
            onClick={() => {}}
          />
          <div className="border-t border-white/5" />
          <SettingRow
            icon={<Database size={16} />}
            title="Cloud Sync"
            subtitle="Sync across 5 devices"
            right={<Toggle value={true} onChange={() => {}} />}
          />
        </div>

        {/* About */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">About</p>
          </div>
          <SettingRow
            icon={<HelpCircle size={16} />}
            title="Help & Support"
            subtitle="FAQs, tutorials, contact us"
            onClick={() => {}}
          />
          <div className="border-t border-white/5" />
          <SettingRow
            icon={<Shield size={16} />}
            title="Privacy Policy"
            subtitle="How we protect your data"
            onClick={() => {}}
          />
          <div className="border-t border-white/5" />
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-white">App Version</p>
              <p className="text-xs text-gray-500">Money Manager v1.0.0</p>
            </div>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 rounded-full px-2 py-1">Latest</span>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white/5 border border-red-500/20 rounded-2xl overflow-hidden">
          <SettingRow
            icon={<LogOut size={16} />}
            title="Sign Out"
            subtitle="You'll need to sign in again"
            onClick={() => setAuthenticated(false)}
            danger
          />
        </div>
      </div>

      {/* Appearance Modal */}
      <Modal isOpen={showAppearance} onClose={() => setShowAppearance(false)} title="Accent Color">
        <div className="p-5">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {ACCENT_COLORS.map(({ color, name }) => (
              <button
                key={color}
                onClick={() => updateProfile({ accent_color: color })}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-12 h-12 rounded-2xl transition-all"
                  style={{
                    background: color,
                    outline: profile.accent_color === color ? '2px solid white' : 'none',
                    outlineOffset: '2px',
                    boxShadow: profile.accent_color === color ? `0 0 20px ${color}66` : 'none',
                  }}
                >
                  {profile.accent_color === color && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Check size={20} className="text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400">{name}</span>
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Custom Hex Color</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="#6C63FF"
                defaultValue={profile.accent_color}
                onChange={e => { if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) updateProfile({ accent_color: e.target.value }); }}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500"
              />
              <div className="w-12 h-12 rounded-xl" style={{ background: profile.accent_color }} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Currency Modal */}
      <Modal isOpen={showCurrency} onClose={() => setShowCurrency(false)} title="Default Currency">
        <div className="p-5 max-h-80 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {CURRENCIES.map(curr => (
              <button
                key={curr}
                onClick={() => { updateProfile({ default_currency: curr }); setShowCurrency(false); }}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  profile.default_currency === curr
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-300'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={showProfile} onClose={() => setShowProfile(false)} title="Edit Profile">
        <div className="p-5 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
              {editName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
            <input value={editName} onChange={e => setEditName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
            <input value={editEmail} onChange={e => setEditEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Financial Period Start</label>
            <select
              value={profile.financial_period_start}
              onChange={e => updateProfile({ financial_period_start: parseInt(e.target.value) })}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Day {d} of each month</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { updateProfile({ full_name: editName, email: editEmail }); setShowProfile(false); }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm"
          >
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Notifications Modal */}
      <Modal isOpen={showNotifications} onClose={() => setShowNotifications(false)} title="Notification Settings">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Daily Reminder</p>
              <p className="text-xs text-gray-500">Log your daily expenses</p>
            </div>
            <button
              onClick={() => updateProfile({ daily_reminder_enabled: !profile.daily_reminder_enabled })}
              className={`w-12 h-6 rounded-full transition-all duration-200 ${profile.daily_reminder_enabled ? 'bg-indigo-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow mx-0.5 transition-all duration-200 ${profile.daily_reminder_enabled ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          {profile.daily_reminder_enabled && (
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Reminder Time</label>
              <input
                type="time"
                value={profile.daily_reminder_time}
                onChange={e => updateProfile({ daily_reminder_time: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none [color-scheme:dark]"
              />
            </div>
          )}
          <button onClick={() => setShowNotifications(false)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
};
