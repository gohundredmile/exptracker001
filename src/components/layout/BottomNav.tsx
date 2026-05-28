import React from 'react';
import { Home, ArrowLeftRight, BarChart2, Target, Settings, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils/cn';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'transactions', icon: ArrowLeftRight, label: 'Trans' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  { id: 'budgets', icon: Target, label: 'Budgets' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

interface BottomNavProps {
  onAddTransaction: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onAddTransaction }) => {
  const { activeTab, setActiveTab } = useStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl border-t border-white/10" />

      <div className="relative flex items-center justify-around px-2 pt-2 pb-safe" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (i === 2) {
            return (
              <React.Fragment key="fab">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-200 min-w-[48px]',
                    isActive ? 'text-indigo-400' : 'text-gray-500'
                  )}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-indigo-400 absolute bottom-1" />
                  )}
                </button>

                {/* FAB */}
                <button
                  onClick={onAddTransaction}
                  className="relative -top-5 flex items-center justify-center w-14 h-14 rounded-2xl text-white transition-all duration-200 active:scale-90 shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
                    boxShadow: '0 8px 30px rgba(108, 99, 255, 0.6)',
                  }}
                >
                  <Plus size={26} strokeWidth={2.5} />
                </button>
              </React.Fragment>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-200 min-w-[48px] relative',
                isActive ? 'text-indigo-400' : 'text-gray-500'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
