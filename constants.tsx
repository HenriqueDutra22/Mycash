
import { Transaction, TransactionType } from './types';

// Aqui você pode alterar os links das imagens diretamente
export const IMAGES = {
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
  receipt: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=300&h=400',
  emptyState: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=300'
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    description: 'Investimento Apple (AAPL)',
    category: 'Investimentos',
    amount: 1500.00,
    date: '2023-11-20',
    time: '10:30',
    type: TransactionType.INCOME,
    icon: 'trending_up'
  },
  {
    id: '2',
    description: 'Jantar Restaurante D.O.M',
    category: 'Alimentação',
    amount: -850.20,
    date: '2023-11-20',
    time: '21:15',
    type: TransactionType.EXPENSE,
    icon: 'restaurant'
  },
  {
    id: '3',
    description: 'Mensalidade Academia BlueFit',
    category: 'Saúde',
    amount: -129.90,
    date: '2023-11-19',
    time: '08:00',
    type: TransactionType.EXPENSE,
    icon: 'fitness_center'
  },
  {
    id: '4',
    description: 'Dividendos Imobiliários',
    category: 'Renda Passiva',
    amount: 450.40,
    date: '2023-11-18',
    time: '06:00',
    type: TransactionType.INCOME,
    icon: 'account_balance_wallet'
  }
];

export const CATEGORIES = [
  { id: 'food', label: 'Alimentação', icon: 'restaurant' },
  { id: 'transport', label: 'Transporte', icon: 'directions_car' },
  { id: 'shopping', label: 'Compras', icon: 'shopping_bag' },
  { id: 'salary', label: 'Salário', icon: 'payments' },
  { id: 'health', label: 'Saúde', icon: 'medical_services' },
  { id: 'leisure', label: 'Lazer', icon: 'movie' },
];
