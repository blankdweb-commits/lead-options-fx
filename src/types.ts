import { LucideIcon } from 'lucide-react';

export interface StatData {
  id: string;
  label: string;
  value: string | number;
  iconName: 'DollarSign' | 'Wallet' | 'TrendingUp' | 'CheckCircle' | 'XCircle' | 'Activity';
  accentColor: 'green' | 'red' | 'orange' | 'default';
}

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface NavItem {
  label: string;
  iconName: 'LayoutDashboard' | 'Wallet' | 'History' | 'User';
  active?: boolean;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'bonus';
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  date: string;
  method: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  userId: string;
  userName: string;
  messages: Message[];
  unreadAdmin: boolean; // Does admin have unread messages from this user?
  unreadUser: boolean;  // Does user have unread messages from admin?
}