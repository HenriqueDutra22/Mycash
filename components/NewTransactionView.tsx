
import React, { useState } from 'react';
import { TransactionType, Transaction, Card, PaymentMethod } from '../types';
import { CATEGORIES } from '../constants';

interface NewTransactionViewProps {
  onBack: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  onImport: () => void;
  cards: Card[];
}

const NewTransactionView: React.FC<NewTransactionViewProps> = ({ onBack, onSave, onImport, cards }) => {
  const [amount, setAmount] = useState('0,00');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('shopping');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [cardId, setCardId] = useState<string>('');
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSave = () => {
    const cleanAmountStr = amount.replace(/\./g, '').replace(',', '.');
    const isIncome = type === TransactionType.INCOME;
    const numericAmount = parseFloat(cleanAmountStr) * (isIncome ? 1 : -1);

    if (isNaN(numericAmount) || numericAmount === 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    const selectedCat = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

    onSave({
      description: description || 'Sem título',
      amount: numericAmount,
      date,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      category: selectedCat.label,
      type,
      icon: selectedCat.icon,
      paymentMethod,
      cardId: cardId || undefined,
      isRecurring,
      recurringDay: isRecurring ? parseInt(date.split('-')[2]) : undefined,
      installments: paymentMethod === PaymentMethod.CREDIT ? {
        current: 1,
        total: totalInstallments
      } : undefined
    });
  };

  return (
    <div className="flex flex-col bg-[#0a0f0c] animate-slide-up">
      <header className="flex items-center justify-between p-6 sticky top-0 z-50 bg-[#0a0f0c]/80 backdrop-blur-xl">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-lg font-black tracking-tight uppercase tracking-[0.2em]">Lançamento</h2>
        <button onClick={onImport} className="text-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-primary/10 rounded-xl">
          Scanner IA
        </button>
      </header>

      <main className="flex-1 px-6 py-4 flex flex-col gap-10">
        <div className="flex flex-col items-center py-6">
          <div className="flex bg-white/5 p-1 rounded-2xl mb-6 w-full max-w-[240px]">
            <button
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === TransactionType.EXPENSE ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Saída (-)
            </button>
            <button
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === TransactionType.INCOME ? 'bg-primary text-black border border-primary shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Entrada (+)
            </button>
          </div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-4">Montante Financeiro</p>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-black transition-colors ${type === TransactionType.INCOME ? 'text-primary' : 'text-primary/40'}`}>R$</span>
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                const numericValue = parseInt(value || '0', 10) / 100;
                const formatted = numericValue.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
                setAmount(formatted);
              }}
              className={`bg-transparent border-none text-6xl font-black text-center focus:ring-0 p-0 w-full max-w-[400px] placeholder:text-gray-900 transition-colors ${type === TransactionType.INCOME ? 'text-primary' : 'text-white'}`}
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Tipo de Transação */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Modalidade</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'PIX', label: 'Pix', icon: 'payments', method: PaymentMethod.PIX },
                { id: 'DEBIT', label: 'Débito', icon: 'account_balance_wallet', method: PaymentMethod.DEBIT },
                { id: 'CREDIT', label: 'Crédito', icon: 'credit_card', method: PaymentMethod.CREDIT },
                { id: 'CASH', label: 'Dinheiro', icon: 'money', method: PaymentMethod.CASH }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setPaymentMethod(mode.method)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${paymentMethod === mode.method ? 'bg-white text-black border-white shadow-lg' : 'bg-white/[0.03] border-white/5 text-gray-500'}`}
                >
                  <span className="material-symbols-outlined text-xl">{mode.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Campos de Dados */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Identificação</label>
              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl h-16 px-5 focus-within:border-primary/50 focus-within:bg-white/[0.06] transition-all">
                <span className="material-symbols-outlined text-gray-600">edit_note</span>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição da movimentação"
                  className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-white font-bold placeholder:text-gray-800"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Classificação</label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center gap-2 h-20 rounded-2xl border transition-all ${category === cat.id ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20' : 'bg-white/[0.03] border-white/5 text-gray-500 hover:bg-white/[0.06]'}`}
                  >
                    <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>


            <div className="flex flex-col gap-2 animate-slide-up">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Vincular Cartão/Conta</label>
              {cards.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  <button
                    onClick={() => setCardId('')}
                    className={`flex-none w-32 h-20 rounded-2xl border-2 flex flex-col justify-center items-center p-3 transition-all ${!cardId ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/[0.03] text-gray-500'}`}
                  >
                    <span className="material-symbols-outlined text-xl mb-1">block</span>
                    <p className="text-[9px] font-black uppercase tracking-widest">Nenhum</p>
                  </button>
                  {cards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => setCardId(card.id)}
                      className={`flex-none w-32 h-20 rounded-2xl border-2 flex flex-col justify-between p-3 transition-all ${cardId === card.id ? 'border-primary bg-white/5 shadow-lg shadow-primary/5' : 'border-white/5 bg-white/[0.03]'}`}
                      style={{ borderLeft: `6px solid ${card.color || '#fff'}` }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase text-gray-500">{card.brand}</span>
                        <div className={`size-1.5 rounded-full ${cardId === card.id ? 'bg-primary animate-pulse' : 'bg-white/10'}`}></div>
                      </div>
                      <p className="text-[10px] font-black text-white truncate">{card.name}</p>
                      <p className="text-[8px] text-gray-500 font-mono">•••• {card.lastDigits}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => alert('Vá em Perfil > Gerenciar Cartões para adicionar um cartão.')}
                  className="bg-white/5 border border-white/10 border-dashed p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/[0.08] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-600">credit_card_off</span>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nenhum cartão cadastrado</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-sm">add_circle</span>
                </div>
              )}
            </div>

            {paymentMethod === PaymentMethod.CREDIT && (
              <div className="flex flex-col gap-2 animate-slide-up">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Parcelas</label>
                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl h-16 px-5 transition-all">
                  <span className="material-symbols-outlined text-gray-600">view_week</span>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="48"
                      value={totalInstallments}
                      onChange={(e) => setTotalInstallments(parseInt(e.target.value) || 1)}
                      className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-white font-bold"
                    />
                    <span className="text-[10px] font-black text-primary uppercase">x parcelas</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Data Efetiva</label>
              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl h-16 px-5 transition-all">
                <span className="material-symbols-outlined text-gray-600">calendar_today</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-white font-bold [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between glass bg-white/[0.03] border border-white/5 rounded-2xl h-16 px-5 transition-all">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-gray-600">event_repeat</span>
                <span className="text-sm font-bold text-white/80">Lançamento Recorrente?</span>
              </div>
              <button
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-12 h-6 rounded-full transition-all relative ${isRecurring ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${isRecurring ? 'left-7 shadow-lg shadow-black/20' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto pb-10 pt-4">
          <button
            onClick={handleSave}
            className="w-full h-16 bg-primary text-[#0a0f0c] rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-all"
          >
            Registrar Lançamento
            <span className="material-symbols-outlined font-black">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default NewTransactionView;
