import { supabase } from './supabase';
import type {
  Profile, Account, Category, Transaction, Budget,
  SavingsGoal, Debt, Subscription, Bill, ShoppingList,
  Notification, SharedProject
} from '../types';

// ==================== PROFILES ====================
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// ==================== ACCOUNTS ====================
export const getAccounts = async (userId: string) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createAccount = async (account: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('accounts')
    .insert([account])
    .select()
    .single();
  return { data, error };
};

export const updateAccount = async (accountId: string, updates: Partial<Account>) => {
  const { data, error } = await supabase
    .from('accounts')
    .update(updates)
    .eq('id', accountId)
    .select()
    .single();
  return { data, error };
};

export const deleteAccount = async (accountId: string) => {
  const { data, error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId);
  return { data, error };
};

// ==================== CATEGORIES ====================
export const getCategories = async (userId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });
  return { data, error };
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();
  return { data, error };
};

export const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();
  return { data, error };
};

export const deleteCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);
  return { data, error };
};

// ==================== TRANSACTIONS ====================
export const getTransactions = async (userId: string, limit = 100) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const getTransactionsByAccount = async (accountId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('date', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();
  return { data, error };
};

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single();
  return { data, error };
};

export const deleteTransaction = async (transactionId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);
  return { data, error };
};

// ==================== BUDGETS ====================
export const getBudgets = async (userId: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createBudget = async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('budgets')
    .insert([budget])
    .select()
    .single();
  return { data, error };
};

export const updateBudget = async (budgetId: string, updates: Partial<Budget>) => {
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', budgetId)
    .select()
    .single();
  return { data, error };
};

export const deleteBudget = async (budgetId: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', budgetId);
  return { data, error };
};

// ==================== SAVINGS GOALS ====================
export const getSavingsGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .insert([goal])
    .select()
    .single();
  return { data, error };
};

export const updateSavingsGoal = async (goalId: string, updates: Partial<SavingsGoal>) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();
  return { data, error };
};

export const deleteSavingsGoal = async (goalId: string) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', goalId);
  return { data, error };
};

// ==================== DEBTS ====================
export const getDebts = async (userId: string) => {
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createDebt = async (debt: Omit<Debt, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('debts')
    .insert([debt])
    .select()
    .single();
  return { data, error };
};

export const updateDebt = async (debtId: string, updates: Partial<Debt>) => {
  const { data, error } = await supabase
    .from('debts')
    .update(updates)
    .eq('id', debtId)
    .select()
    .single();
  return { data, error };
};

export const deleteDebt = async (debtId: string) => {
  const { data, error } = await supabase
    .from('debts')
    .delete()
    .eq('id', debtId);
  return { data, error };
};

// ==================== SUBSCRIPTIONS ====================
export const getSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createSubscription = async (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([subscription])
    .select()
    .single();
  return { data, error };
};

export const updateSubscription = async (subscriptionId: string, updates: Partial<Subscription>) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single();
  return { data, error };
};

export const deleteSubscription = async (subscriptionId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', subscriptionId);
  return { data, error };
};

// ==================== NOTIFICATIONS ====================
export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateNotification = async (notificationId: string, updates: Partial<Notification>) => {
  const { data, error } = await supabase
    .from('notifications')
    .update(updates)
    .eq('id', notificationId)
    .select()
    .single();
  return { data, error };
};

// ==================== BILLS ====================
export const getBills = async (userId: string) => {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });
  return { data, error };
};

export const createBill = async (bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('bills')
    .insert([bill])
    .select()
    .single();
  return { data, error };
};

export const updateBill = async (billId: string, updates: Partial<Bill>) => {
  const { data, error } = await supabase
    .from('bills')
    .update(updates)
    .eq('id', billId)
    .select()
    .single();
  return { data, error };
};

export const deleteBill = async (billId: string) => {
  const { data, error } = await supabase
    .from('bills')
    .delete()
    .eq('id', billId);
  return { data, error };
};

// ==================== SHOPPING LISTS ====================
export const getShoppingLists = async (userId: string) => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getShoppingListWithItems = async (listId: string) => {
  const { data: list, error: listError } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('id', listId)
    .single();

  if (listError) return { data: null, error: listError };

  const { data: items, error: itemsError } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('list_id', listId)
    .order('display_order', { ascending: true });

  return { data: { ...list, items: items || [] }, error: itemsError };
};

export const createShoppingList = async (list: Omit<ShoppingList, 'id' | 'created_at' | 'updated_at' | 'items'>) => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .insert([list])
    .select()
    .single();
  return { data, error };
};

export const updateShoppingList = async (listId: string, updates: Partial<ShoppingList>) => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .update(updates)
    .eq('id', listId)
    .select()
    .single();
  return { data, error };
};

export const deleteShoppingList = async (listId: string) => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .delete()
    .eq('id', listId);
  return { data, error };
};

// ==================== SHARED PROJECTS ====================
export const getSharedProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('shared_projects')
    .select('*, shared_project_members(*)')
    .or(`owner_id.eq.${userId},shared_project_members.user_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createSharedProject = async (project: Omit<SharedProject, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('shared_projects')
    .insert([project])
    .select()
    .single();
  return { data, error };
};

export const updateSharedProject = async (projectId: string, updates: Partial<SharedProject>) => {
  const { data, error } = await supabase
    .from('shared_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();
  return { data, error };
};

export const deleteSharedProject = async (projectId: string) => {
  const { data, error } = await supabase
    .from('shared_projects')
    .delete()
    .eq('id', projectId);
  return { data, error };
};
