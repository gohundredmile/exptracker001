import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Profile, Account, Category, Transaction, Budget,
  SavingsGoal, Debt, Subscription, Bill, ShoppingList,
  Notification, SharedProject, ThemeMode
} from '../types';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  isPinVerified: boolean;
  onboardingStep: number;
  onboardingCompleted: boolean;

  // Profile
  profile: Profile;

  // Theme
  isDark: boolean;

  // Data
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  subscriptions: Subscription[];
  bills: Bill[];
  shoppingLists: ShoppingList[];
  notifications: Notification[];
  sharedProjects: SharedProject[];

  // Navigation
  activeTab: string;
  activeScreen: string;
  screenStack: string[];
  selectedTransactionId: string | null;
  selectedAccountId: string | null;
  selectedBudgetId: string | null;
  selectedGoalId: string | null;
  selectedDebtId: string | null;
  selectedSubscriptionId: string | null;
  selectedProjectId: string | null;

  // Actions
  setAuthenticated: (v: boolean) => void;
  setPinVerified: (v: boolean) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  updateProfile: (p: Partial<Profile>) => void;

  // Account actions
  addAccount: (a: Account) => void;
  updateAccount: (id: string, a: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Transaction actions
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Category actions
  addCategory: (c: Category) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Budget actions
  addBudget: (b: Budget) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Savings Goal actions
  addSavingsGoal: (g: SavingsGoal) => void;
  updateSavingsGoal: (id: string, g: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;

  // Debt actions
  addDebt: (d: Debt) => void;
  updateDebt: (id: string, d: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  // Subscription actions
  addSubscription: (s: Subscription) => void;
  updateSubscription: (id: string, s: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;

  // Bill actions
  addBill: (b: Bill) => void;
  updateBill: (id: string, b: Partial<Bill>) => void;
  deleteBill: (id: string) => void;

  // Shopping actions
  addShoppingList: (l: ShoppingList) => void;
  updateShoppingList: (id: string, l: Partial<ShoppingList>) => void;
  deleteShoppingList: (id: string) => void;

  // Notification actions
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Project actions
  addSharedProject: (p: SharedProject) => void;
  updateSharedProject: (id: string, p: Partial<SharedProject>) => void;
  deleteSharedProject: (id: string) => void;

  // Navigation actions
  setActiveTab: (tab: string) => void;
  navigateTo: (screen: string) => void;
  navigateBack: () => void;
  setSelectedTransaction: (id: string | null) => void;
  setSelectedAccount: (id: string | null) => void;
  setSelectedBudget: (id: string | null) => void;
  setSelectedGoal: (id: string | null) => void;
  setSelectedDebt: (id: string | null) => void;
  setSelectedSubscription: (id: string | null) => void;
  setSelectedProject: (id: string | null) => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-salary', name: 'Salary', type: 'income', icon: '💼', color: '#00C896', is_system: true, is_active: true, display_order: 0 },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: '💻', color: '#6C63FF', is_system: true, is_active: true, display_order: 1 },
  { id: 'cat-investment', name: 'Investment', type: 'income', icon: '📈', color: '#FFB830', is_system: true, is_active: true, display_order: 2 },
  { id: 'cat-gift-in', name: 'Gift', type: 'income', icon: '🎁', color: '#FF6B9D', is_system: true, is_active: true, display_order: 3 },
  { id: 'cat-rental', name: 'Rental', type: 'income', icon: '🏠', color: '#4ECDC4', is_system: true, is_active: true, display_order: 4 },
  { id: 'cat-other-in', name: 'Other Income', type: 'income', icon: '💰', color: '#95E1D3', is_system: true, is_active: true, display_order: 5 },
  { id: 'cat-food', name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#FF6B6B', is_system: true, is_active: true, display_order: 0 },
  { id: 'cat-transport', name: 'Transport', type: 'expense', icon: '🚗', color: '#4ECDC4', is_system: true, is_active: true, display_order: 1 },
  { id: 'cat-shopping', name: 'Shopping', type: 'expense', icon: '🛍️', color: '#FFB830', is_system: true, is_active: true, display_order: 2 },
  { id: 'cat-health', name: 'Health', type: 'expense', icon: '❤️', color: '#FF4D6D', is_system: true, is_active: true, display_order: 3 },
  { id: 'cat-education', name: 'Education', type: 'expense', icon: '📚', color: '#6C63FF', is_system: true, is_active: true, display_order: 4 },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', icon: '🎬', color: '#A8E6CF', is_system: true, is_active: true, display_order: 5 },
  { id: 'cat-bills', name: 'Bills & Utilities', type: 'expense', icon: '⚡', color: '#FF8C42', is_system: true, is_active: true, display_order: 6 },
  { id: 'cat-travel', name: 'Travel', type: 'expense', icon: '✈️', color: '#45B7D1', is_system: true, is_active: true, display_order: 7 },
  { id: 'cat-subscriptions', name: 'Subscriptions', type: 'expense', icon: '📱', color: '#9B59B6', is_system: true, is_active: true, display_order: 8 },
  { id: 'cat-other-ex', name: 'Other Expense', type: 'expense', icon: '📦', color: '#95A5A6', is_system: true, is_active: true, display_order: 9 },
];

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-bank', user_id: 'user-1', name: 'Chase Bank', type: 'bank', currency: 'USD', balance: 5200, initial_balance: 5000, color: '#6C63FF', icon: '🏦', is_active: true, include_in_total: true, display_order: 0, created_at: new Date().toISOString() },
  { id: 'acc-cash', user_id: 'user-1', name: 'Cash Wallet', type: 'cash', currency: 'USD', balance: 340, initial_balance: 500, color: '#00C896', icon: '💵', is_active: true, include_in_total: true, display_order: 1, created_at: new Date().toISOString() },
  { id: 'acc-visa', user_id: 'user-1', name: 'Visa Credit', type: 'credit_card', currency: 'USD', balance: -890, initial_balance: 0, color: '#FF4D6D', icon: '💳', is_active: true, include_in_total: true, credit_limit: 5000, display_order: 2, created_at: new Date().toISOString() },
  { id: 'acc-btc', user_id: 'user-1', name: 'Bitcoin Wallet', type: 'crypto', currency: 'USD', balance: 5910, initial_balance: 4000, color: '#FFB830', icon: '🔐', is_active: true, include_in_total: true, display_order: 3, created_at: new Date().toISOString() },
];

const now = new Date();
const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', user_id: 'user-1', type: 'expense', amount: 5.40, currency: 'USD', account_id: 'acc-cash', category_id: 'cat-food', title: 'Starbucks Coffee', note: 'Morning latte', date: new Date().toISOString(), is_recurring: false, tags: [], hashtags: [], is_tax_deductible: false, created_at: new Date().toISOString() },
  { id: 'tx-2', user_id: 'user-1', type: 'income', amount: 2100, currency: 'USD', account_id: 'acc-bank', category_id: 'cat-salary', title: 'Monthly Salary', note: 'November paycheck', date: new Date(now.getTime() - 86400000).toISOString(), is_recurring: true, tags: [], hashtags: [], is_tax_deductible: false, created_at: new Date(now.getTime() - 86400000).toISOString() },
  { id: 'tx-3', user_id: 'user-1', type: 'expense', amount: 67.99, currency: 'USD', account_id: 'acc-visa', category_id: 'cat-shopping', title: 'Amazon Order', note: 'Books and supplies', date: new Date(now.getTime() - 86400000 * 2).toISOString(), is_recurring: false, tags: [], hashtags: [], is_tax_deductible: false, created_at: new Date(now.getTime() - 86400000 * 2).toISOString() },
  { id: 'tx-4', user_id: 'user-1', type: 'expense', amount: 45.00, currency: 'USD', account_id: 'acc-bank', category_id: 'cat-transport', title: 'Uber Ride', date: new Date(now.getTime() - 86400000 * 3).toISOString(), is_recurring: false, tags: [], hashtags: [], is_tax_deductible: false, created_at: new Date(now.getTime() - 86400000 * 3).toISOString() },
  { id: 'tx-5', user_id: 'user-1', type: 'income', amount: 850, currency: 'USD', account_id: 'acc-bank', category_id: 'cat-freelance', title: 'Freelance Project', note: 'Website design', date: new Date(now.getTime() - 86400000 * 4).toISOString(), is_recurring: false, tags: [], hashtags: [], is_tax_deductible: false, created_at: new Date(now.getTime() - 86400000 * 4).toISOString() },
  { id: 'tx-6', user_id: 'user-1', type: 'expense', amount: 120, currency: 'USD', account_id: 'acc-bank', category_id: 'cat-bills', title: 'Electric Bill', date: new Date(now.getTime() - 86400000 * 5).toISOString(), is_recurring: true, tags: [], hashtags: [], is_tax_deductible: false, created_at: new Date(now.getTime() - 86400000 * 5).toISOString() },
  { id: 'tx-7', user_id: 'user-1', type: 'expense', amount: 15.99, currency: 'USD', account_id: 'acc-visa', category_id: 'cat-subscriptions', title: 'Netflix', date: new Date(now.getTime() - 86400000 * 6).toISOString(), is_recurring: true, tags: [], hashtags: [], is_tax_deductible: false, created_at: new Date(now.getTime() - 86400000 * 6).toISOString() },
  { id: 'tx-8', user_id: 'user-1', type: 'expense', amount: 89.50, currency: 'USD', account_id: 'acc-bank', category_id: 'cat-food', title: 'Grocery Store', date: new Date(now.getTime() - 86400000 * 7).toISOString(), is_recurring: false, tags: [], hashtags: [], is_tax_deductible: false, created_at: new Date(now.getTime() - 86400000 * 7).toISOString() },
  { id: 'tx-9', user_id: 'user-1', type: 'income', amount: 1250, currency: 'USD', account_id: 'acc-btc', category_id: 'cat-investment', title: 'Crypto Gains', date: new Date(now.getTime() - 86400000 * 8).toISOString(), is_recurring: false, tags: [], hashtags: [], is_tax_deductible: false, created_at: new Date(now.getTime() - 86400000 * 8).toISOString() },
  { id: 'tx-10', user_id: 'user-1', type: 'expense', amount: 200, currency: 'USD', account_id: 'acc-bank', category_id: 'cat-entertainment', title: 'Concert Tickets', date: new Date(now.getTime() - 86400000 * 9).toISOString(), is_recurring: false, tags: [], hashtags: [], is_tax_deductible: false, created_at: new Date(now.getTime() - 86400000 * 9).toISOString() },
];

const DEFAULT_BUDGETS: Budget[] = [
  { id: 'bud-1', user_id: 'user-1', name: 'Food & Dining', amount: 500, spent: 400, currency: 'USD', period: 'monthly', category_ids: ['cat-food'], alert_at_50: true, alert_at_80: true, alert_at_100: true, is_active: true, color: '#FF6B6B', icon: '🍔', created_at: new Date().toISOString() },
  { id: 'bud-2', user_id: 'user-1', name: 'Transport', amount: 200, spent: 90, currency: 'USD', period: 'monthly', category_ids: ['cat-transport'], alert_at_50: true, alert_at_80: true, alert_at_100: true, is_active: true, color: '#4ECDC4', icon: '🚗', created_at: new Date().toISOString() },
  { id: 'bud-3', user_id: 'user-1', name: 'Entertainment', amount: 300, spent: 200, currency: 'USD', period: 'monthly', category_ids: ['cat-entertainment'], alert_at_50: true, alert_at_80: true, alert_at_100: true, is_active: true, color: '#A8E6CF', icon: '🎬', created_at: new Date().toISOString() },
  { id: 'bud-4', user_id: 'user-1', name: 'Shopping', amount: 400, spent: 350, currency: 'USD', period: 'monthly', category_ids: ['cat-shopping'], alert_at_50: true, alert_at_80: true, alert_at_100: true, is_active: true, color: '#FFB830', icon: '🛍️', created_at: new Date().toISOString() },
];

const DEFAULT_GOALS: SavingsGoal[] = [
  { id: 'goal-1', user_id: 'user-1', name: 'Emergency Fund', icon: '🛡️', color: '#6C63FF', target_amount: 10000, current_amount: 4500, currency: 'USD', is_completed: false, note: '6 months of expenses', created_at: new Date().toISOString() },
  { id: 'goal-2', user_id: 'user-1', name: 'Europe Trip 2025', icon: '✈️', color: '#00C896', target_amount: 5000, current_amount: 2800, currency: 'USD', target_date: '2025-06-01', is_completed: false, created_at: new Date().toISOString() },
  { id: 'goal-3', user_id: 'user-1', name: 'New MacBook Pro', icon: '💻', color: '#FFB830', target_amount: 3500, current_amount: 1200, currency: 'USD', target_date: '2025-03-01', is_completed: false, created_at: new Date().toISOString() },
];

const DEFAULT_DEBTS: Debt[] = [
  { id: 'debt-1', user_id: 'user-1', direction: 'i_owe', contact_name: 'Alex Johnson', original_amount: 500, remaining_amount: 250, currency: 'USD', interest_rate: 0, due_date: '2025-02-01', status: 'partial', note: 'Borrowed for car repair', created_at: new Date().toISOString() },
  { id: 'debt-2', user_id: 'user-1', direction: 'owed_to_me', contact_name: 'Sarah Mitchell', original_amount: 200, remaining_amount: 200, currency: 'USD', interest_rate: 0, due_date: '2025-01-15', status: 'active', note: 'Dinner last week', created_at: new Date().toISOString() },
];

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-1', user_id: 'user-1', name: 'Netflix', amount: 15.99, currency: 'USD', billing_cycle: 'monthly', next_billing_date: '2025-01-15', start_date: '2024-01-15', color: '#E50914', is_active: true, remind_days_before: 3, created_at: new Date().toISOString() },
  { id: 'sub-2', user_id: 'user-1', name: 'Spotify', amount: 9.99, currency: 'USD', billing_cycle: 'monthly', next_billing_date: '2025-01-20', start_date: '2024-01-20', color: '#1DB954', is_active: true, remind_days_before: 3, created_at: new Date().toISOString() },
  { id: 'sub-3', user_id: 'user-1', name: 'Adobe Creative Cloud', amount: 54.99, currency: 'USD', billing_cycle: 'monthly', next_billing_date: '2025-01-25', start_date: '2024-01-25', color: '#FF0000', is_active: true, remind_days_before: 3, created_at: new Date().toISOString() },
  { id: 'sub-4', user_id: 'user-1', name: 'iCloud Storage', amount: 2.99, currency: 'USD', billing_cycle: 'monthly', next_billing_date: '2025-01-10', start_date: '2023-01-10', color: '#007AFF', is_active: true, remind_days_before: 3, created_at: new Date().toISOString() },
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', user_id: 'user-1', title: 'Budget Alert', body: 'You\'ve spent 80% of your Food & Dining budget', type: 'budget_alert', is_read: false, created_at: new Date().toISOString() },
  { id: 'notif-2', user_id: 'user-1', title: 'Bill Due Soon', body: 'Electric Bill is due in 3 days', type: 'bill_reminder', is_read: false, created_at: new Date(now.getTime() - 3600000).toISOString() },
  { id: 'notif-3', user_id: 'user-1', title: 'Goal Milestone!', body: 'You reached 50% of your Europe Trip goal! 🎉', type: 'goal_milestone', is_read: true, created_at: new Date(now.getTime() - 86400000).toISOString() },
];

const DEFAULT_SHOPPING_LISTS: ShoppingList[] = [
  { id: 'shop-1', user_id: 'user-1', name: 'Weekly Groceries', icon: '🛒', color: '#00C896', estimated_total: 150, actual_total: 0, currency: 'USD', is_completed: false, items: [
    { id: 'item-1', list_id: 'shop-1', name: 'Milk', estimated_price: 3.99, quantity: 2, unit: 'L', is_checked: true, display_order: 0 },
    { id: 'item-2', list_id: 'shop-1', name: 'Bread', estimated_price: 2.50, quantity: 1, is_checked: false, display_order: 1 },
    { id: 'item-3', list_id: 'shop-1', name: 'Eggs', estimated_price: 5.99, quantity: 12, unit: 'pcs', is_checked: false, display_order: 2 },
  ], created_at: new Date().toISOString() },
];

const DEFAULT_PROJECTS: SharedProject[] = [
  { id: 'proj-1', name: 'Europe Trip 2025', description: 'Summer vacation expenses', icon: '✈️', color: '#6C63FF', currency: 'USD', owner_id: 'user-1', total_amount: 2450, is_active: true, members: [
    { user_id: 'user-1', name: 'Alex (You)', role: 'owner', paid_amount: 1200 },
    { user_id: 'user-2', name: 'Sarah Mitchell', role: 'editor', paid_amount: 750 },
    { user_id: 'user-3', name: 'Jordan Lee', role: 'editor', paid_amount: 500 },
  ], created_at: new Date().toISOString() },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isPinVerified: false,
      onboardingStep: 0,
      onboardingCompleted: false,
      isDark: true,
      profile: {
        id: 'user-1',
        full_name: 'Alex Johnson',
        email: 'alex@example.com',
        default_currency: 'USD',
        financial_period_start: 1,
        theme: 'dark',
        accent_color: '#6C63FF',
        font_size: 'normal',
        biometric_enabled: false,
        auto_lock_minutes: 5,
        daily_reminder_enabled: true,
        daily_reminder_time: '20:00',
        onboarding_completed: false,
      },
      accounts: DEFAULT_ACCOUNTS,
      categories: DEFAULT_CATEGORIES,
      transactions: DEMO_TRANSACTIONS,
      budgets: DEFAULT_BUDGETS,
      savingsGoals: DEFAULT_GOALS,
      debts: DEFAULT_DEBTS,
      subscriptions: DEFAULT_SUBSCRIPTIONS,
      bills: [],
      shoppingLists: DEFAULT_SHOPPING_LISTS,
      notifications: DEFAULT_NOTIFICATIONS,
      sharedProjects: DEFAULT_PROJECTS,
      activeTab: 'home',
      activeScreen: 'onboarding',
      screenStack: ['onboarding'],
      selectedTransactionId: null,
      selectedAccountId: null,
      selectedBudgetId: null,
      selectedGoalId: null,
      selectedDebtId: null,
      selectedSubscriptionId: null,
      selectedProjectId: null,

      setAuthenticated: (v) => set({ isAuthenticated: v }),
      setPinVerified: (v) => set({ isPinVerified: v }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      completeOnboarding: () => set({ onboardingCompleted: true, activeScreen: 'home', screenStack: ['home'] }),
      toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
      setTheme: (mode) => set({ isDark: mode === 'dark' }),
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      addAccount: (a) => set((s) => ({ accounts: [...s.accounts, a] })),
      updateAccount: (id, a) => set((s) => ({ accounts: s.accounts.map(acc => acc.id === id ? { ...acc, ...a } : acc) })),
      deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter(a => a.id !== id) })),

      addTransaction: (t) => {
        set((s) => {
          const updatedAccounts = s.accounts.map(acc => {
            if (acc.id === t.account_id) {
              const delta = t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : -t.amount;
              return { ...acc, balance: acc.balance + delta };
            }
            if (t.to_account_id && acc.id === t.to_account_id) {
              return { ...acc, balance: acc.balance + t.amount };
            }
            return acc;
          });
          return { transactions: [t, ...s.transactions], accounts: updatedAccounts };
        });
      },
      updateTransaction: (id, t) => set((s) => ({ transactions: s.transactions.map(tx => tx.id === id ? { ...tx, ...t } : tx) })),
      deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter(t => t.id !== id) })),

      addCategory: (c) => set((s) => ({ categories: [...s.categories, c] })),
      updateCategory: (id, c) => set((s) => ({ categories: s.categories.map(cat => cat.id === id ? { ...cat, ...c } : cat) })),
      deleteCategory: (id) => set((s) => ({ categories: s.categories.filter(c => c.id !== id) })),

      addBudget: (b) => set((s) => ({ budgets: [...s.budgets, b] })),
      updateBudget: (id, b) => set((s) => ({ budgets: s.budgets.map(bud => bud.id === id ? { ...bud, ...b } : bud) })),
      deleteBudget: (id) => set((s) => ({ budgets: s.budgets.filter(b => b.id !== id) })),

      addSavingsGoal: (g) => set((s) => ({ savingsGoals: [...s.savingsGoals, g] })),
      updateSavingsGoal: (id, g) => set((s) => ({ savingsGoals: s.savingsGoals.map(goal => goal.id === id ? { ...goal, ...g } : goal) })),
      deleteSavingsGoal: (id) => set((s) => ({ savingsGoals: s.savingsGoals.filter(g => g.id !== id) })),

      addDebt: (d) => set((s) => ({ debts: [...s.debts, d] })),
      updateDebt: (id, d) => set((s) => ({ debts: s.debts.map(debt => debt.id === id ? { ...debt, ...d } : debt) })),
      deleteDebt: (id) => set((s) => ({ debts: s.debts.filter(d => d.id !== id) })),

      addSubscription: (sub) => set((s) => ({ subscriptions: [...s.subscriptions, sub] })),
      updateSubscription: (id, sub) => set((s) => ({ subscriptions: s.subscriptions.map(s2 => s2.id === id ? { ...s2, ...sub } : s2) })),
      deleteSubscription: (id) => set((s) => ({ subscriptions: s.subscriptions.filter(s2 => s2.id !== id) })),

      addBill: (b) => set((s) => ({ bills: [...s.bills, b] })),
      updateBill: (id, b) => set((s) => ({ bills: s.bills.map(bill => bill.id === id ? { ...bill, ...b } : bill) })),
      deleteBill: (id) => set((s) => ({ bills: s.bills.filter(b => b.id !== id) })),

      addShoppingList: (l) => set((s) => ({ shoppingLists: [...s.shoppingLists, l] })),
      updateShoppingList: (id, l) => set((s) => ({ shoppingLists: s.shoppingLists.map(list => list.id === id ? { ...list, ...l } : list) })),
      deleteShoppingList: (id) => set((s) => ({ shoppingLists: s.shoppingLists.filter(l => l.id !== id) })),

      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, is_read: true } : n) })),
      markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map(n => ({ ...n, is_read: true })) })),

      addSharedProject: (p) => set((s) => ({ sharedProjects: [...s.sharedProjects, p] })),
      updateSharedProject: (id, p) => set((s) => ({ sharedProjects: s.sharedProjects.map(proj => proj.id === id ? { ...proj, ...p } : proj) })),
      deleteSharedProject: (id) => set((s) => ({ sharedProjects: s.sharedProjects.filter(p => p.id !== id) })),

      setActiveTab: (tab) => {
        const tabScreenMap: Record<string, string> = {
          home: 'home', transactions: 'transactions', analytics: 'analytics',
          budgets: 'budgets', settings: 'settings'
        };
        set({ activeTab: tab, activeScreen: tabScreenMap[tab] || tab, screenStack: [tabScreenMap[tab] || tab] });
      },
      navigateTo: (screen) => set((s) => ({ activeScreen: screen, screenStack: [...s.screenStack, screen] })),
      navigateBack: () => set((s) => {
        const stack = s.screenStack.slice(0, -1);
        return { screenStack: stack, activeScreen: stack[stack.length - 1] || 'home' };
      }),
      setSelectedTransaction: (id) => set({ selectedTransactionId: id }),
      setSelectedAccount: (id) => set({ selectedAccountId: id }),
      setSelectedBudget: (id) => set({ selectedBudgetId: id }),
      setSelectedGoal: (id) => set({ selectedGoalId: id }),
      setSelectedDebt: (id) => set({ selectedDebtId: id }),
      setSelectedSubscription: (id) => set({ selectedSubscriptionId: id }),
      setSelectedProject: (id) => set({ selectedProjectId: id }),
    }),
    {
      name: 'money-manager-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        onboardingCompleted: state.onboardingCompleted,
        profile: state.profile,
        isDark: state.isDark,
        accounts: state.accounts,
        categories: state.categories,
        transactions: state.transactions,
        budgets: state.budgets,
        savingsGoals: state.savingsGoals,
        debts: state.debts,
        subscriptions: state.subscriptions,
        bills: state.bills,
        shoppingLists: state.shoppingLists,
        notifications: state.notifications,
        sharedProjects: state.sharedProjects,
      }),
    }
  )
);
