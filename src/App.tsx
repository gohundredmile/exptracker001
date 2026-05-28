import React, { useState } from 'react';
import { useStore } from './store/useStore';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TransactionsScreen } from './screens/TransactionsScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { BudgetsScreen } from './screens/BudgetsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AccountsScreen } from './screens/AccountsScreen';
import { SavingsGoalsScreen } from './screens/SavingsGoalsScreen';
import { DebtsScreen } from './screens/DebtsScreen';
import { SubscriptionsScreen } from './screens/SubscriptionsScreen';
import { ShoppingScreen } from './screens/ShoppingScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { SharedProjectsScreen } from './screens/SharedProjectsScreen';
import { ExportScreen } from './screens/ExportScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { TransactionDetailScreen } from './screens/TransactionDetailScreen';
import { BillsScreen } from './screens/BillsScreen';
import { BottomNav } from './components/layout/BottomNav';
import { AddTransactionScreen } from './screens/AddTransactionScreen';
import { Modal } from './components/ui/Modal';

const AppContent: React.FC = () => {
  const { onboardingCompleted, isAuthenticated, activeScreen } = useStore();
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  if (!onboardingCompleted || !isAuthenticated) {
    return <OnboardingScreen />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home': return <HomeScreen />;
      case 'transactions': return <TransactionsScreen />;
      case 'analytics': return <AnalyticsScreen />;
      case 'budgets': return <BudgetsScreen />;
      case 'settings': return <SettingsScreen />;
      case 'accounts': return <AccountsScreen />;
      case 'add-account': return <AccountsScreen />;
      case 'account-detail': return <AccountsScreen />;
      case 'savings-goals': return <SavingsGoalsScreen />;
      case 'debts': return <DebtsScreen />;
      case 'subscriptions': return <SubscriptionsScreen />;
      case 'bills': return <SubscriptionsScreen />;
      case 'shopping': return <ShoppingScreen />;
      case 'notifications': return <NotificationsScreen />;
      case 'shared-projects': return <SharedProjectsScreen />;
      case 'export': return <ExportScreen />;
      case 'categories': return <CategoriesScreen />;
      case 'receipts': return <ReceiptsPlaceholder />;
      case 'transaction-detail': return <TransactionDetailScreen />;
      case 'budget-detail': return <BudgetsScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative" style={{ paddingTop: 0 }}>
        <div className="max-w-lg mx-auto w-full min-h-screen">
          {renderScreen()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="max-w-lg mx-auto w-full fixed bottom-0 left-0 right-0" style={{ zIndex: 40 }}>
        <BottomNav onAddTransaction={() => setShowAddTransaction(true)} />
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        size="md"
        className="max-h-[95vh]"
      >
        <AddTransactionScreen onClose={() => setShowAddTransaction(false)} />
      </Modal>
    </div>
  );
};

const ReceiptsPlaceholder: React.FC = () => {
  const { navigateBack } = useStore();
  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={navigateBack} className="text-gray-400 hover:text-white text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-white">Receipt Scanner</h1>
        </div>
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.05))', border: '1px solid rgba(108,99,255,0.3)' }}>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-bold text-white mb-2">AI Receipt Scanner</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Take a photo of any receipt and our AI will automatically extract the merchant name, date, amount, and line items.
            </p>
            <div className="space-y-3">
              <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                📷 Take Photo
              </button>
              <button className="w-full py-3 rounded-2xl bg-white/10 text-white font-semibold">
                🖼️ Choose from Gallery
              </button>
              <button className="w-full py-3 rounded-2xl bg-white/10 text-white font-semibold">
                📧 Forward Email Receipt
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🔍', title: 'OCR Powered', desc: 'Extracts text from any receipt' },
            { icon: '🌍', title: 'Multi-language', desc: 'Supports 50+ languages' },
            { icon: '✅', title: 'Auto-fill', desc: 'Fills transaction form automatically' },
            { icon: '🔒', title: 'Secure', desc: 'Encrypted storage for all receipts' },
          ].map(f => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
