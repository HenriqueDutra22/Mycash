
import React from 'react';
import { UserProfile, Transaction, TransactionType, Card, PaymentMethod } from '../types';

interface HomeViewProps {
  user: UserProfile;
  transactions: Transaction[];
  dbBalance: number;
  isGhostMode: boolean;
  setIsGhostMode: (v: boolean) => void;
  onNewTransaction: () => void;
  onShowAnalytics: () => void;
  onShowHistory: () => void;
  onEditTransaction: (tx: Transaction) => void;
  cards: Card[];
}

const HomeView: React.FC<HomeViewProps> = ({ user, transactions, dbBalance, isGhostMode, setIsGhostMode, onNewTransaction, onShowAnalytics, onShowHistory, onEditTransaction, cards }) => {
  const groupedTransactions = React.useMemo(() => {
    return transactions.reduce((acc: any, tx) => {
      const date = tx.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    }, {});
  }, [transactions]);

  const formatDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Hoje';
    if (dateStr === yesterday) return 'Ontem';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="animate-slide-up">
      {/* Header - Only visible on mobile */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 z-50 bg-[#0a0f0c]/60 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/40 transition-all"></div>
            <div className="size-12 rounded-full border-2 border-primary/40 overflow-hidden relative shadow-lg">
              <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Bem-vindo,</p>
            <h2 className="text-base font-bold text-white/90">{user.name}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsGhostMode(!isGhostMode)}
            className={`flex size-11 items-center justify-center rounded-2xl glass transition-all ${isGhostMode ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-xl">
              {isGhostMode ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Balance */}
      <section className="px-6 pb-6 max-w-4xl mx-auto w-full">
        <div className="relative glass bg-gradient-to-br from-glass-dark to-black/40 p-8 rounded-[32px] overflow-hidden emerald-glow border border-white/5">
          <div className="absolute -right-20 -top-20 size-60 bg-primary/10 blur-[80px] rounded-full"></div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Saldo Geral</span>
              <h1 className="text-4xl font-black tracking-tight mt-1 flex items-baseline">
                {isGhostMode ? (
                  <span className="tracking-[0.1em] text-gray-700">••••••••</span>
                ) : (
                  <>
                    <span className="text-primary/60 text-2xl mr-2">R$</span>
                    {dbBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </>
                )}
              </h1>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onNewTransaction}
              className="flex-1 h-14 flex items-center justify-center gap-3 rounded-2xl bg-primary text-[#0a0f0c] font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined font-black">add_circle</span>
              Novo Lançamento
            </button>
            <button
              onClick={onShowAnalytics}
              className="size-14 flex items-center justify-center rounded-2xl glass text-white active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">analytics</span>
            </button>
          </div>
        </div>
      </section>

      {/* Transaction Feed */}
      <main className="px-6 pb-32 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-white/80">Movimentações</h3>
          <button
            onClick={onShowHistory}
            className="text-[10px] text-primary font-black uppercase tracking-[0.2em] px-3 py-1 bg-primary/5 rounded-full"
          >
            Ver Histórico
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)).map(date => (
            <div key={date} className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-8 h-px bg-gray-800"></span>
                {formatDate(date)}
              </h4>
              <div className="flex flex-col gap-3">
                {groupedTransactions[date].map((tx: Transaction) => (
                  <div
                    key={tx.id}
                    onClick={() => onEditTransaction(tx)}
                    className="group flex items-center justify-between glass bg-white/[0.02] p-4 rounded-[20px] border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`size-12 rounded-2xl flex items-center justify-center glass ${tx.amount > 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                        <span className="material-symbols-outlined text-2xl">{tx.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white/90 truncate max-w-[150px]">{tx.description}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{tx.category}</p>
                          {tx.paymentMethod && (
                            <>
                              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                              <div className="flex items-center gap-1 opacity-60">
                                <span className="material-symbols-outlined text-[10px]">
                                  {tx.paymentMethod === PaymentMethod.CREDIT ? 'credit_card' :
                                    tx.paymentMethod === PaymentMethod.DEBIT ? 'account_balance_wallet' :
                                      tx.paymentMethod === PaymentMethod.PIX ? 'payments' : 'money'}
                                </span>
                                <span className="text-[8px] font-black uppercase text-primary">
                                  {tx.paymentMethod === PaymentMethod.PIX ? (tx.amount > 0 ? 'Pix Recebido' : 'Pix Enviado') :
                                    tx.paymentMethod === PaymentMethod.DEBIT ? 'Débito' :
                                      tx.paymentMethod === PaymentMethod.CREDIT ? (tx.cardId ? cards.find(c => c.id === tx.cardId)?.name : 'Crédito') :
                                        tx.paymentMethod}
                                </span>
                              </div>
                            </>
                          )}
                          {tx.installments && (
                            <span className="text-[8px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded font-black">
                              {tx.installments.current}/{tx.installments.total}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${tx.amount > 0 ? 'text-primary' : 'text-white'}`}>
                        {tx.amount > 0 ? '+' : ''} R$ {Math.abs(tx.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-gray-600 font-bold">{tx.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomeView;
