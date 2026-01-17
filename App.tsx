
import React, { useState, useEffect, useMemo } from 'react';
import { ViewType, Transaction, UserProfile, TransactionType, Card, PaymentMethod, Goal } from './types';
import { INITIAL_TRANSACTIONS, IMAGES } from './constants';
import HomeView from './components/HomeView';
import AnalyticsView from './components/AnalyticsView';
import NewTransactionView from './components/NewTransactionView';
import ImportView from './components/ImportView';
import SettingsView from './components/SettingsView';
import TransactionsView from './components/TransactionsView';
import PlanningView from './components/PlanningView';
import GoalsView from './components/GoalsView';
import BottomNav from './components/BottomNav';

import Layout from './components/Layout';
import AuthView from './components/AuthView';
import EditTransactionModal from './components/EditTransactionModal';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  console.log('🚀 App component is rendering!');
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('HOME');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: 'Roberto Silva',
    email: 'roberto.silva@mycash.com',
    avatar: IMAGES.avatar,
    monthlyLimit: 5000,
    accentColor: '#19e65e'
  });

  // Check if Supabase is configured
  const supabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!supabaseConfigured) {
      setSession({ user: { id: 'dev-user', email: 'dev@mycash.com' } } as any);
      setTransactions(INITIAL_TRANSACTIONS);
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        fetchTransactions(session.user.id);
        fetchCards(session.user.id);
        fetchGoals(session.user.id);
        updateUserProfile(session.user);
      } else {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchTransactions(session.user.id);
        fetchCards(session.user.id);
        fetchGoals(session.user.id);
        updateUserProfile(session.user);
      } else {
        setTransactions([]);
        setCards([]);
        setGoals([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserProfile = (sbUser: any) => {
    setUser(prev => ({
      ...prev,
      email: sbUser.email || prev.email,
      name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || prev.name,
      avatar: sbUser.user_metadata?.avatar_url || prev.avatar,
      monthlyLimit: sbUser.user_metadata?.monthly_limit || prev.monthlyLimit,
      accentColor: sbUser.user_metadata?.accent_color || prev.accentColor
    }));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (session?.user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: updates.name,
            avatar_url: updates.avatar,
            monthly_limit: updates.monthlyLimit,
            accent_color: updates.accentColor
          }
        });

        if (error) throw error;

        setUser(prev => ({ ...prev, ...updates }));
        alert('Perfil atualizado com sucesso!');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Erro ao atualizar perfil');
      }
    } else {
      // Dev mode fallback
      setUser(prev => ({ ...prev, ...updates }));
    }
  };

  const fetchTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map(tx => ({
          ...tx,
          paymentMethod: tx.payment_method,
          cardId: tx.card_id,
          installments: tx.installments_total ? {
            current: tx.installments_current,
            total: tx.installments_total
          } : undefined,
          isRecurring: tx.is_recurring,
          recurringDay: tx.recurring_day
        }));
        setTransactions(formatted.length > 0 ? formatted : INITIAL_TRANSACTIONS);
      } else {
        setTransactions(INITIAL_TRANSACTIONS);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions(INITIAL_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      if (data) setCards(data);
    } catch (err) {
      console.error('Error fetching cards:', err);
    }
  };

  const fetchGoals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      if (data) {
        const formatted = data.map(g => ({
          ...g,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount
        }));
        setGoals(formatted);
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  };

  const addGoal = async (newGoal: Omit<Goal, 'id'>) => {
    if (session?.user) {
      try {
        const dbGoal = {
          ...newGoal,
          user_id: session.user.id,
          target_amount: newGoal.targetAmount,
          current_amount: newGoal.currentAmount
        };
        // @ts-ignore
        delete dbGoal.targetAmount;
        // @ts-ignore
        delete dbGoal.currentAmount;

        const { data, error } = await supabase
          .from('goals')
          .insert([dbGoal])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const formatted = {
            ...data,
            targetAmount: data.target_amount,
            currentAmount: data.current_amount
          };
          setGoals([formatted, ...goals]);
        }
      } catch (err) {
        console.error('Error adding goal:', err);
        const goal = { ...newGoal, id: Math.random().toString(36).substr(2, 9) } as Goal;
        setGoals([goal, ...goals]);
      }
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (session?.user) {
      try {
        const dbUpdates: any = { ...updates };
        if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
        if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
        delete dbUpdates.targetAmount;
        delete dbUpdates.currentAmount;

        const { error } = await supabase
          .from('goals')
          .update(dbUpdates)
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Error updating goal:', err);
      }
    }
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = async (id: string) => {
    if (session?.user) {
      await supabase.from('goals').delete().eq('id', id);
    }
    setGoals(goals.filter(g => g.id !== id));
  };

  const addCard = async (newCard: Omit<Card, 'id'>) => {
    if (session?.user) {
      try {
        const { data, error } = await supabase
          .from('cards')
          .insert([{ ...newCard, user_id: session.user.id }])
          .select()
          .single();

        if (error) throw error;
        if (data) setCards([data, ...cards]);
      } catch (err) {
        console.error('Error adding card:', err);
      }
    }
  };

  const deleteCard = async (id: string) => {
    if (session?.user) {
      await supabase.from('cards').delete().eq('id', id);
    }
    setCards(cards.filter(c => c.id !== id));
  };

  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + curr.amount, 10000);
  }, [transactions]);

  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (session?.user) {
      try {
        const dbTx = {
          ...newTx,
          user_id: session.user.id,
          payment_method: newTx.paymentMethod,
          card_id: newTx.cardId,
          installments_current: newTx.installments?.current,
          installments_total: newTx.installments?.total,
          is_recurring: newTx.isRecurring,
          recurring_day: newTx.recurringDay
        };

        const { data, error } = await supabase
          .from('transactions')
          .insert([dbTx])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const formatted = {
            ...data,
            paymentMethod: data.payment_method,
            cardId: data.card_id,
            installments: data.installments_total ? {
              current: data.installments_current,
              total: data.installments_total
            } : undefined,
            isRecurring: data.is_recurring,
            recurringDay: data.recurring_day
          };
          setTransactions([formatted, ...transactions]);
        }
      } catch (err) {
        console.error('Error saving transaction:', err);
        const tx = { ...newTx, id: Math.random().toString(36).substr(2, 9) } as Transaction;
        setTransactions([tx, ...transactions]);
      }
    } else {
      const tx = { ...newTx, id: Math.random().toString(36).substr(2, 9) } as Transaction;
      setTransactions([tx, ...transactions]);
    }
    setCurrentView('HOME');
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (session?.user) {
      try {
        const dbUpdates: any = { ...updates };
        if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
        if (updates.cardId) dbUpdates.card_id = updates.cardId;
        if (updates.installments) {
          dbUpdates.installments_current = updates.installments.current;
          dbUpdates.installments_total = updates.installments.total;
        }
        delete dbUpdates.paymentMethod;
        delete dbUpdates.cardId;
        delete dbUpdates.installments;

        const { error } = await supabase
          .from('transactions')
          .update(dbUpdates)
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Error updating transaction:', err);
      }
    }

    setTransactions(transactions.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = async (id: string) => {
    if (session?.user) {
      await supabase.from('transactions').delete().eq('id', id);
    }
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const bulkAddTransactions = async (newTxs: Omit<Transaction, 'id'>[]) => {
    if (session?.user) {
      try {
        const dbTxs = newTxs.map(tx => ({
          ...tx,
          user_id: session.user.id,
          payment_method: tx.paymentMethod,
          card_id: tx.cardId,
          installments_current: tx.installments?.current,
          installments_total: tx.installments?.total,
          is_recurring: tx.isRecurring,
          recurring_day: tx.recurringDay
        }));

        const { data, error } = await supabase
          .from('transactions')
          .insert(dbTxs)
          .select();

        if (error) throw error;
        if (data) {
          const formatted = data.map(d => ({
            ...d,
            paymentMethod: d.payment_method,
            cardId: d.card_id,
            installments: d.installments_total ? {
              current: d.installments_current,
              total: d.installments_total
            } : undefined,
            isRecurring: d.is_recurring,
            recurringDay: d.recurring_day
          }));
          setTransactions([...formatted, ...transactions]);
        }
      } catch (err) {
        console.error('Error saving bulk transactions:', err);
        const tempTxs = newTxs.map(tx => ({ ...tx, id: Math.random().toString(36).substr(2, 9) } as Transaction));
        setTransactions([...tempTxs, ...transactions]);
      }
    } else {
      const tempTxs = newTxs.map(tx => ({ ...tx, id: Math.random().toString(36).substr(2, 9) } as Transaction));
      setTransactions([...tempTxs, ...transactions]);
    }
    setCurrentView('HOME');
  };

  const handleSignOut = async () => {
    if (session) {
      await supabase.auth.signOut();
      setSession(null);
      setTransactions([]);
      setCards([]);
      setGoals([]);
    }
  };

  const renderView = () => {
    if (loading && session) return (
      <div className="flex items-center justify-center h-screen bg-[#0a0f0c]">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    switch (currentView) {
      case 'HOME':
        return <HomeView
          user={user}
          transactions={transactions}
          totalBalance={totalBalance}
          isGhostMode={isGhostMode}
          setIsGhostMode={setIsGhostMode}
          onNewTransaction={() => setCurrentView('NEW_TRANSACTION')}
          onShowAnalytics={() => setCurrentView('ANALYTICS')}
          onShowHistory={() => setCurrentView('TRANSACTIONS')}
          onEditTransaction={setEditingTransaction}
          cards={cards}
        />;
      case 'ANALYTICS':
        return <AnalyticsView transactions={transactions} cards={cards} />;
      case 'TRANSACTIONS':
        return <TransactionsView
          transactions={transactions}
          onBack={() => setCurrentView('HOME')}
          cards={cards}
        />;
      case 'PLANNING':
        return <PlanningView
          transactions={transactions}
          onAddRecurring={addTransaction}
          onDeleteRecurring={deleteTransaction}
          onConfirmRecurring={addTransaction}
        />;
      case 'GOALS':
        return <GoalsView
          goals={goals}
          onAddGoal={addGoal}
          onUpdateGoal={updateGoal}
          onDeleteGoal={deleteGoal}
          onBack={() => setCurrentView('HOME')}
        />;
      case 'NEW_TRANSACTION':
        return <NewTransactionView
          onBack={() => setCurrentView('HOME')}
          onSave={addTransaction}
          onImport={() => setCurrentView('IMPORT')}
          cards={cards}
        />;
      case 'IMPORT':
        return <ImportView
          onBack={() => setCurrentView('NEW_TRANSACTION')}
          onSaveTransactions={bulkAddTransactions}
        />;
      case 'PROFILE':
        return <SettingsView
          user={user}
          onUpdateProfile={updateProfile}
          onBack={() => setCurrentView('HOME')}
          cards={cards}
          onAddCard={addCard}
          onDeleteCard={deleteCard}
          onSignOut={handleSignOut}
          transactions={transactions}
        />;
      default:
        return <HomeView
          user={user}
          transactions={transactions}
          totalBalance={totalBalance}
          isGhostMode={isGhostMode}
          setIsGhostMode={setIsGhostMode}
          onNewTransaction={() => setCurrentView('NEW_TRANSACTION')}
          cards={cards}
        />;
    }
  };

  const hideNav = currentView === 'NEW_TRANSACTION' || currentView === 'IMPORT';

  if (!session) {
    return <AuthView />;
  }

  return (
    <Layout
      currentView={currentView}
      onViewChange={setCurrentView}
      user={user}
      hideNav={hideNav}
    >
      {renderView()}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={updateTransaction}
          onDelete={deleteTransaction}
        />
      )}
    </Layout>
  );
};

export default App;
