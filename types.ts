export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum PaymentMethod {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  PIX = 'PIX',
  CASH = 'CASH'
}

export interface Card {
  id: string;
  name: string; // e.g., "Nubank", "Santander"
  lastDigits: string;
  brand: string; // e.g., "Visa", "Mastercard"
  color: string;
  type: 'CREDIT' | 'DEBIT' | 'BOTH';
}

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  time: string;
  type: TransactionType;
  icon: string;
  paymentMethod?: PaymentMethod;
  cardId?: string;
  installments?: {
    current: number;
    total: number;
  };
  isRecurring?: boolean;
  recurringDay?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  icon: string;
  color: string;
}

export type ViewType = 'HOME' | 'ANALYTICS' | 'WALLET' | 'PROFILE' | 'NEW_TRANSACTION' | 'IMPORT' | 'TRANSACTIONS' | 'PLANNING' | 'GOALS';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  monthlyLimit: number;
  accentColor: string;
}
