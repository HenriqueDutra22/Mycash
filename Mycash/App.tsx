import React, { useState, useCallback, useMemo } from 'react';
import { AppView, Transaction, User } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NewTransaction from './components/NewTransaction';
import Register from './components/Register';
import Analytics from './components/Analytics';
import Wallet from './components/Wallet';
import ProfileSettings from './components/ProfileSettings';
import { supabase } from './supabaseClient';

const INITIAL_TRANSACTIONS: Transaction[] = [];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [lastView, setLastView] = useState<AppView>(AppView.DASHBOARD);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const navigateTo = (view: AppView) => {
    if (view !== AppView.NEW_TRANSACTION) {
      setLastView(view);
    }
    setCurrentView(view);
  };

  const handleLogin = useCallback(async (email: string) => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (sbUser) {
      const metadata = sbUser.user_metadata;
      setUser({
        name: metadata?.name || 'Usuário',
        email: email,
        avatar: metadata?.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100',
        monthlyLimit: metadata?.monthlyLimit || 5000,
        accentColor: metadata?.accentColor || '#19e65e',
        privacyMode: metadata?.privacyMode || false,
        paymentMethods: metadata?.paymentMethods || ['Conta Corrente', 'Pix', 'Dinheiro']
      });

      // Apply saved theme
      if (metadata?.accentColor) {
        document.documentElement.style.setProperty('--primary', metadata.accentColor);
        const hex = metadata.accentColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--primary-dark', `rgba(${r}, ${g}, ${b}, 0.8)`);
      }
    }
    navigateTo(AppView.DASHBOARD);
  }, []);

  const handleRegister = useCallback(async (name: string, email: string) => {
    // Attempt to update metadata if just registered
    await supabase.auth.updateUser({
      data: { name, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100' }
    });

    setUser({
      name: name,
      email: email,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100',
      monthlyLimit: 5000,
      accentColor: '#19e65e',
      privacyMode: false,
      paymentMethods: ['Conta Corrente', 'Pix', 'Dinheiro']
    });
    navigateTo(AppView.DASHBOARD);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    navigateTo(AppView.LOGIN);
  }, []);

  const handleUpdateProfile = useCallback(async (updates: Partial<User>) => {
    // Persist to Supabase
    await supabase.auth.updateUser({
      data: updates
    });

    setUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updates };
      if (newUser.accentColor) {
        document.documentElement.style.setProperty('--primary', newUser.accentColor);
        const hex = newUser.accentColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--primary-dark', `rgba(${r}, ${g}, ${b}, 0.8)`);
      }
      return newUser;
    });
    navigateTo(AppView.DASHBOARD);
  }, []);

  const handleAddTransaction = useCallback((newTransaction: Omit<Transaction, 'id' | 'time'>) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (newTransaction.installments && newTransaction.installments.total > 1) {
      // Handle Installments
      const groupId = Math.random().toString(36).substr(2, 9);
      const newTs: Transaction[] = [];

      for (let i = 0; i < newTransaction.installments.total; i++) {
        const dateObj = new Date(newTransaction.date + 'T12:00:00'); // Use T12:00:00 to avoid timezone shifts
        dateObj.setMonth(dateObj.getMonth() + i);

        newTs.push({
          ...newTransaction,
          id: Math.random().toString(36).substr(2, 9),
          time,
          date: dateObj.toISOString().split('T')[0],
          installments: {
            current: i + 1,
            total: newTransaction.installments.total,
            groupId
          }
        });
      }
      setTransactions(prev => [...newTs, ...prev]);
    } else if (newTransaction.isRecurring) {
      // Handle Fixed Recurring (e.g., Rent, Condo) - Generate 12 months for visualization
      const newTs: Transaction[] = [];
      for (let i = 0; i < 12; i++) {
        const dateObj = new Date(newTransaction.date + 'T12:00:00');
        dateObj.setMonth(dateObj.getMonth() + i);

        newTs.push({
          ...newTransaction,
          id: Math.random().toString(36).substr(2, 9),
          time,
          date: dateObj.toISOString().split('T')[0]
        });
      }
      setTransactions(prev => [...newTs, ...prev]);
    } else {
      // Handle Single Transaction
      const transaction: Transaction = {
        ...newTransaction,
        id: Math.random().toString(36).substr(2, 9),
        time
      };
      setTransactions(prev => [transaction, ...prev]);
    }

    setCurrentView(lastView);
  }, [lastView]);

  const totalBalance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return transactions
      .filter(t => t.date <= today)
      .reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
      }, 0);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-background-dark text-white font-display overflow-x-hidden">
      {currentView === AppView.LOGIN && (
        <Login
          onLogin={handleLogin}
          onRegisterClick={() => navigateTo(AppView.REGISTER)}
        />
      )}

      {currentView === AppView.REGISTER && (
        <Register
          onRegister={handleRegister}
          onLoginClick={() => navigateTo(AppView.LOGIN)}
        />
      )}

      {currentView === AppView.DASHBOARD && user && (
        <Dashboard
          user={user}
          transactions={transactions}
          balance={totalBalance}
          onAddClick={() => navigateTo(AppView.NEW_TRANSACTION)}
          onLogout={handleLogout}
          onNavigate={(view) => navigateTo(view as AppView)}
        />
      )}

      {currentView === AppView.ANALYTICS && user && (
        <Analytics
          user={user}
          transactions={transactions}
          onBack={() => navigateTo(AppView.DASHBOARD)}
        />
      )}

      {currentView === AppView.WALLET && user && (
        <Wallet
          user={user}
          transactions={transactions}
          onBack={() => navigateTo(AppView.DASHBOARD)}
          onAdd={() => navigateTo(AppView.NEW_TRANSACTION)}
        />
      )}

      {currentView === AppView.SETTINGS && user && (
        <ProfileSettings
          user={user}
          onSave={handleUpdateProfile}
          onBack={() => navigateTo(AppView.DASHBOARD)}
          onLogout={handleLogout}
        />
      )}

      {currentView === AppView.NEW_TRANSACTION && (
        <NewTransaction
          user={user}
          onSave={handleAddTransaction}
          onCancel={() => navigateTo(lastView)}
        />
      )}
    </div>
  );
};

export default App;
