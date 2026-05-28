import React from 'react';
import { CheckCheck, BellOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDate, formatTime } from '../utils/format';

const TYPE_ICONS: Record<string, string> = {
  budget_alert: '⚠️',
  bill_reminder: '📅',
  debt_reminder: '💳',
  goal_milestone: '🎯',
  subscription_renewal: '🔄',
  recurring_transaction: '🔁',
  general: '💬',
  security: '🔐',
};

const TYPE_COLORS: Record<string, string> = {
  budget_alert: '#FFB830',
  bill_reminder: '#FF4D6D',
  debt_reminder: '#FF6B9D',
  goal_milestone: '#00C896',
  subscription_renewal: '#6C63FF',
  recurring_transaction: '#4ECDC4',
  general: '#6B7280',
  security: '#FF4D6D',
};

export const NotificationsScreen: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, navigateBack } = useStore();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const grouped = notifications.reduce((acc, n) => {
    const dateKey = formatDate(n.created_at);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(n);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button onClick={navigateBack} className="text-gray-400 hover:text-white text-sm">← Back</button>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-xs text-gray-500 mb-4">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <BellOff size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No notifications</p>
            <p className="text-gray-500 text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div>
            {Object.entries(grouped).map(([dateKey, notifs]) => (
              <div key={dateKey} className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">{dateKey}</h3>
                <div className="space-y-2">
                  {notifs.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all ${
                        n.is_read
                          ? 'bg-white/3 border border-white/5 opacity-60'
                          : 'bg-white/8 border border-white/15 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: (TYPE_COLORS[n.type] || '#6B7280') + '22' }}
                      >
                        {TYPE_ICONS[n.type] || '🔔'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-white">{n.title}</p>
                          {!n.is_read && (
                            <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-xs text-gray-600 mt-1.5">{formatTime(n.created_at)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
