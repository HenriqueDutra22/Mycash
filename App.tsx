
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
import WalletView from './components/WalletView';

import Layout from './components/Layout';
import AuthView from './components/AuthView';
import EditTransactionModal from './components/EditTransactionModal';
import { supabase } from './services/supabase';
import { createTransaction } from './services/transactionService';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  console.log('🚀 App component is rendering!');
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('HOME');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dbBalance, setDbBalance] = useState<number>(0);
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
      // Removed redundant fetching here as it's handled by onAuthStateChange on subscription
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchTransactions(session.user.id);
        fetchCards(session.user.id);
        fetchGoals(session.user.id);
        fetchBalance(session.user.id);
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
        setTransactions(formatted);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions(INITIAL_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_balance')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          setDbBalance(0);
        } else {
          throw error;
        }
      }

      if (data) {
        setDbBalance(Number(data.balance) || 0);
      }
    } catch (err) {
      console.error('Error fetching balance from view:', err);
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
        const dbCard = {
          name: newCard.name,
          lastDigits: newCard.lastDigits,
          brand: newCard.brand,
          color: newCard.color,
          type: newCard.type,
          user_id: session.user.id
        };

        const { data, error } = await supabase
          .from('cards')
          .insert([dbCard])
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

  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (session?.user) {
      try {
        const isIncome = newTx.type === TransactionType.INCOME;

        // Chamada via RPC conforme solicitado
        await createTransaction({
          p_user_id: session.user.id,
          p_description: newTx.description,
          p_credit: isIncome ? Math.abs(newTx.amount) : null,
          p_debit: !isIncome ? Math.abs(newTx.amount) : null,
          p_date: newTx.date,
          p_category: newTx.category || 'Outros'
        });

        // Recarregar transações e saldo para refletir a mudança
        fetchTransactions(session.user.id);
        fetchBalance(session.user.id);

      } catch (err) {
        console.error('Error saving transaction via RPC:', err);
        alert(`Erro ao salvar transação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        // Fallback local caso queira manter a experiência offline
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
        const dbUpdates: any = {};
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.time !== undefined) dbUpdates.time = updates.time;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
        if (updates.cardId !== undefined) dbUpdates.card_id = updates.cardId;
        if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
        if (updates.recurringDay !== undefined) dbUpdates.recurring_day = updates.recurringDay;

        if (updates.installments) {
          dbUpdates.installments_current = updates.installments.current;
          dbUpdates.installments_total = updates.installments.total;
        }

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
        console.log(`📦 Importando ${newTxs.length} transações via RPC insert_transaction...`);

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        // Chamar insert_transaction para cada linha individualmente
        for (let i = 0; i < newTxs.length; i++) {
          const tx = newTxs[i];
          const txNum = i + 1;

          try {
            const isIncome = tx.type === TransactionType.INCOME;

            console.log(`📝 [${txNum}/${newTxs.length}] Inserindo: ${tx.description} - ${isIncome ? '+' : '-'}${Math.abs(tx.amount)}`);

            await createTransaction({
              p_user_id: session.user.id,
              p_description: tx.description,
              p_credit: isIncome ? Math.abs(tx.amount) : null,
              p_debit: !isIncome ? Math.abs(tx.amount) : null,
              p_date: tx.date,
              p_category: tx.category || 'Outros'
            });

            successCount++;
            console.log(`✅ [${txNum}/${newTxs.length}] Sucesso!`);
          } catch (err: any) {
            errorCount++;
            const errorMsg = `${tx.description}: ${err.message || 'Erro desconhecido'}`;
            errors.push(errorMsg);
            console.error(`❌ [${txNum}/${newTxs.length}] Erro ao importar "${tx.description}":`, err);
            // Continua para próxima transação
          }
        }

        console.log(`✅ Importação concluída: ${successCount} sucesso, ${errorCount} erros`);

        if (errorCount > 0) {
          alert(`Importação parcial: ${successCount} transações salvas, ${errorCount} com erro.\n\nErros:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
        } else {
          alert(`✅ ${successCount} transações importadas com sucesso!`);
        }

        // Recarregar transações e saldo
        fetchTransactions(session.user.id);
        fetchBalance(session.user.id);

      } catch (err) {
        console.error('Error in bulk import:', err);
        alert(`Erro ao importar transações: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
    } else {
      // Dev mode fallback
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

  const resetAccount = async () => {
    if (session?.user) {
      try {
        setLoading(true);
        // Delete all compatible data
        await supabase.from('transactions').delete().eq('user_id', session.user.id);
        await supabase.from('goals').delete().eq('user_id', session.user.id);
        // Keep cards or delete them? "Zerar dados" usually means transaction history, but user said "Zerar dados" (Reset data).
        // The prompt in Settings says "TODOS os seus lançamentos, cartões e metas". So I will delete everything.
        await supabase.from('cards').delete().eq('user_id', session.user.id);

        setTransactions([]);
        setGoals([]);
        setCards([]);
        alert('Todos os dados foram excluídos com sucesso.');
        setCurrentView('HOME');
      } catch (err) {
        console.error("Error resetting account:", err);
        alert("Erro ao excluir dados.");
      } finally {
        setLoading(false);
      }
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
          dbBalance={dbBalance}
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
          onEditTransaction={setEditingTransaction}
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
      case 'WALLET':
        return <WalletView
          cards={cards}
          onAddCard={addCard}
          onDeleteCard={deleteCard}
          onBack={() => setCurrentView('HOME')}
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
          resetData={resetAccount}
        />;
      default:
        return <HomeView
          user={user}
          transactions={transactions}
          dbBalance={dbBalance}
          isGhostMode={isGhostMode}
          setIsGhostMode={setIsGhostMode}
          onNewTransaction={() => setCurrentView('NEW_TRANSACTION')}
          onShowAnalytics={() => setCurrentView('ANALYTICS')}
          onShowHistory={() => setCurrentView('TRANSACTIONS')}
          onEditTransaction={setEditingTransaction}
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
