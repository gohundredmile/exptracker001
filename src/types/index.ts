export type AccountType = 'bank' | 'cash' | 'credit_card' | 'debit_card' | 'e_wallet' | 'crypto' | 'custom';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type CategoryType = 'income' | 'expense' | 'both';
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
export type DebtDirection = 'i_owe' | 'owed_to_me';
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email: string;
  default_currency: string;
  financial_period_start: number;
  theme: ThemeMode;
  accent_color: string;
  font_size: 'normal' | 'large' | 'xlarge';
  pin_hash?: string;
  biometric_enabled: boolean;
  auto_lock_minutes: number;
  daily_reminder_enabled: boolean;
  daily_reminder_time: string;
  onboarding_completed: boolean;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  initial_balance: number;
  color: string;
  icon: string;
  is_active: boolean;
  include_in_total: boolean;
  credit_limit?: number;
  settlement_date?: number;
  minimum_payment?: number;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parent_id?: string;
  is_system: boolean;
  is_active: boolean;
  display_order: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  account_id: string;
  to_account_id?: string;
  category_id?: string;
  title: string;
  note?: string;
  date: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  receipt_url?: string;
  is_recurring: boolean;
  tags: string[];
  hashtags: string[];
  is_tax_deductible: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  spent: number;
  currency: string;
  period: BudgetPeriod;
  start_date?: string;
  end_date?: string;
  category_ids: string[];
  alert_at_50: boolean;
  alert_at_80: boolean;
  alert_at_100: boolean;
  is_active: boolean;
  color: string;
  icon: string;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  linked_account_id?: string;
  target_date?: string;
  auto_contribution_amount?: number;
  auto_contribution_frequency?: string;
  is_completed: boolean;
  note?: string;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  direction: DebtDirection;
  contact_name: string;
  contact_avatar?: string;
  original_amount: number;
  remaining_amount: number;
  currency: string;
  interest_rate: number;
  due_date?: string;
  note?: string;
  status: 'active' | 'partial' | 'settled';
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  logo_url?: string;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_billing_date: string;
  start_date: string;
  category_id?: string;
  account_id?: string;
  color: string;
  note?: string;
  is_active: boolean;
  remind_days_before: number;
  created_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  due_date: string;
  account_id?: string;
  category_id?: string;
  status: 'paid' | 'unpaid' | 'overdue';
  is_recurring: boolean;
  recurrence_frequency?: string;
  note?: string;
  remind_days_before: number;
  created_at: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  estimated_total: number;
  actual_total: number;
  currency: string;
  is_completed: boolean;
  items: ShoppingItem[];
  created_at: string;
}

export interface ShoppingItem {
  id: string;
  list_id: string;
  name: string;
  estimated_price?: number;
  actual_price?: number;
  quantity: number;
  unit?: string;
  is_checked: boolean;
  display_order: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface SharedProject {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  currency: string;
  owner_id: string;
  total_amount: number;
  is_active: boolean;
  members: ProjectMember[];
  created_at: string;
}

export interface ProjectMember {
  user_id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  paid_amount: number;
}
