import React, { useState, useMemo } from 'react';
import { User, Transaction } from '../../types';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import BalanceCard from './BalanceCard';
import FilterBar from './FilterBar';
import TransactionList from './TransactionList';

interface DashboardProps {
  user: User;
  transactions: Transaction[];
  balance: number;
  onAddClick: () => void;
  onLogout: () => void;
  onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, transactions, balance, onAddClick, onLogout, onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showBalance, setShowBalance] = useState(!user.privacyMode);

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
      const date = t.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const handleMenuClick = (item: string) => {
    if (item === 'analytics') {
      onNavigate('ANALYTICS');
    } else if (item === 'wallet') {
      onNavigate('WALLET');
    } else if (item === 'settings') {
      onNavigate('SETTINGS');
    } else {
      alert(`Navegar para: ${item} (Em breve)`);
    }
  };

  const handleActionClick = (action: string) => {
    if (action === 'reports') {
      // Navigate to Analytics for reports
      onNavigate('ANALYTICS');
    } else if (action === 'export') {
      // CSV Export Logic
      const headers = ['Data', 'Título', 'Categoria', 'Tipo', 'Valor'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(t => {
          return [
            t.date,
            `"${t.title}"`,
            t.category,
            t.type === 'income' ? 'Receita' : 'Despesa',
            t.amount.toFixed(2)
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `extrato_mycash_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background-dark text-white font-display overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar onAddClick={onAddClick} onMenuClick={handleMenuClick} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto lg:ml-64 relative">
        <Navbar
          user={user}
          onNavigate={onNavigate}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
        />

        <div className="flex flex-col pb-24 lg:pb-10 max-w-5xl mx-auto w-full">
          <BalanceCard
            balance={balance}
            showBalance={showBalance}
            onAddClick={onAddClick}
            onActionClick={handleActionClick}
          />

          {/* Monthly Budget Progress */}
          {user.monthlyLimit && (
            <div className="px-4 mb-6 lg:px-6">
              <div className="bg-surface-dark border border-white/5 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-4xl">track_changes</span>
                </div>
                <div className="flex justify-between items-end mb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Meta Mensal</span>
                    <p className="text-sm font-bold text-white">Gasto este mês</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-primary">
                      {user.privacyMode ? 'R$ ••••' : `R$ ${transactions
                        .filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0, 7)))
                        .reduce((acc, t) => acc + t.amount, 0)
                        .toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                    </span>
                    <span className="text-xs text-gray-500 font-bold"> / R$ {user.monthlyLimit.toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="h-3 w-full bg-background-dark rounded-full p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(25,230,94,0.3)]"
                    style={{
                      width: `${Math.min(100, (transactions
                        .filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0, 7)))
                        .reduce((acc, t) => acc + t.amount, 0) / user.monthlyLimit) * 100)}%`
                    }}
                  />
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                    {Math.round((transactions
                      .filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0, 7)))
                      .reduce((acc, t) => acc + t.amount, 0) / user.monthlyLimit) * 100)}% do limite utilizado
                  </p>
                  {((transactions
                    .filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0, 7)))
                    .reduce((acc, t) => acc + t.amount, 0) / user.monthlyLimit) * 100) > 90 && (
                      <span className="flex items-center gap-1 text-[9px] text-red-400 font-bold uppercase animate-pulse">
                        <span className="material-symbols-outlined text-[10px]">warning</span> Atenção ao Limite
                      </span>
                    )}
                </div>
              </div>
            </div>
          )}

          <FilterBar filter={filter} setFilter={setFilter} />

          <TransactionList groupedTransactions={groupedTransactions} />
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav onAddClick={onAddClick} onNavigate={handleMenuClick} />
    </div>
  );
};

export default Dashboard;
