export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  category_display: string;
  date: string;
  receipt?: string;
  ai_insights: string;
  ai_confidence: number;
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  category: string;
  category_display: string;
  amount: number;
  period: string;
  period_display: string;
  alert_threshold: number;
  is_active: boolean;
}

export interface AnalyticsData {
  labels: string[];
  data: number[];
  type: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
