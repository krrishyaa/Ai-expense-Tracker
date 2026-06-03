import { create } from 'zustand';
import { Expense } from '../types';
import { supabaseAuthService } from '../services/supabase';

interface AuthStore {
  user: any | null;
  session: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  setAuth: (user: any, session: any) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  accessToken: null,
  refreshToken: null,
  loading: true,
  setAuth: (user, session) => {
    if (session) {
      localStorage.setItem('supabase_session', JSON.stringify(session));
      localStorage.setItem('access_token', session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({
      user,
      session,
      accessToken: session?.access_token || null,
      refreshToken: session?.refresh_token || null,
    });
  },
  logout: async () => {
    try {
      await supabaseAuthService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('supabase_session');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({
        user: null,
        session: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
  initializeAuth: async () => {
    try {
      const session = await supabaseAuthService.getSession();
      const user = await supabaseAuthService.getCurrentUser();

      if (session && user) {
        set({
          user,
          session,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false });
    }
  },
}));

interface ExpenseStore {
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: number, expense: Expense) => void;
  deleteExpense: (id: number) => void;
}

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),
  updateExpense: (id, expense) =>
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? expense : e)),
    })),
  deleteExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),
}));
