
export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  NEW_TRANSACTION = 'NEW_TRANSACTION',
  REGISTER = 'REGISTER',
  ANALYTICS = 'ANALYTICS',
  WALLET = 'WALLET',
  SETTINGS = 'SETTINGS'
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
  notes?: string;
  time: string;
  icon: string;
  paymentMethod?: string;
  isRecurring?: boolean;
  installments?: {
    current: number;
    total: number;
    groupId: string;
  };
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  paymentMethods?: string[];
  monthlyLimit?: number;
  accentColor?: string;
  privacyMode?: boolean;
}
