import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, User } from '../../types';
import Tesseract from 'tesseract.js';

interface NewTransactionProps {
  user: User | null;
  onSave: (transaction: Omit<Transaction, 'id' | 'time'>) => void;
  onCancel: () => void;
}

const NewTransaction: React.FC<NewTransactionProps> = ({ user, onSave, onCancel }) => {
  const [amount, setAmount] = useState('0,00');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'fixed' | 'installments'>('fixed');
  const [installmentsCount, setInstallmentsCount] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [showCustomPayment, setShowCustomPayment] = useState(false);

  useEffect(() => {
    if (user?.paymentMethods && user.paymentMethods.length > 0) {
      setPaymentMethod(user.paymentMethods[0]);
    } else {
      setPaymentMethod('Conta Corrente');
    }
  }, [user]);

  const handleSave = () => {
    const numericAmount = parseFloat(amount.replace('.', '').replace(',', '.'));
    if (numericAmount <= 0) return alert('Insira um valor válido');
    if (!category) return alert('Selecione uma categoria');

    const categoryIcons: Record<string, string> = {
      'Alimentação': 'restaurant',
      'Transporte': 'directions_car',
      'Shopping': 'shopping_bag',
      'Assinatura': 'subscriptions',
      'Lazer': 'sports_esports',
      'Investimentos': 'account_balance',
      'Salário': 'payments',
    };

    onSave({
      title: description || 'Sem descrição',
      category: category,
      amount: numericAmount,
      type: type,
      date: date,
      icon: type === 'income' ? 'trending_up' : (categoryIcons[category] || 'payments'),
      isRecurring: isRecurring && recurrenceType === 'fixed',
      installments: isRecurring && recurrenceType === 'installments' ? {
        current: 1,
        total: installmentsCount,
        groupId: '' // Will be generated in App
      } : undefined,
      notes: notes,
      paymentMethod: paymentMethod === 'Outro' ? customPaymentMethod : paymentMethod
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) {
      setAmount('0,00');
      return;
    }
    const val = parseInt(value, 10);
    const formatted = (val / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    setAmount(formatted);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);

    Tesseract.recognize(
      file,
      'por', // Portuguese language
      { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
      console.log('Recognized text:', text);
      const currencyRegex = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g;
      const matches = text.match(currencyRegex);

      if (matches && matches.length > 0) {
        const potentialAmounts = matches.map(m => {
          const clean = m.replace(/[R$\s.]/g, '').replace(',', '.');
          return parseFloat(clean);
        });

        const maxAmount = Math.max(...potentialAmounts);
        if (maxAmount > 0) {
          setAmount(maxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
        }
      }

      const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/;
      const dateMatch = text.match(dateRegex);
      if (dateMatch) {
        const [_, day, month, year] = dateMatch;
        setDate(`${year}-${month}-${day}`);
      }

      setIsProcessingImage(false);
      alert('Imagem processada! Verifique os valores preenchidos.');
    }).catch(err => {
      console.error(err);
      setIsProcessingImage(false);
      alert('Erro ao processar imagem.');
    });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col mx-auto max-w-md bg-background-dark shadow-xl overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md">
        <button
          onClick={onCancel}
          className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <h2 className="text-lg font-bold tracking-tight">Nova Transação</h2>
        <button
          onClick={() => { setAmount('0,00'); setCategory(''); setType('expense'); setDescription(''); setNotes(''); }}
          className="text-primary font-semibold text-sm px-2 py-1 rounded hover:bg-primary/10 transition-colors"
        >
          Limpar
        </button>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 flex flex-col gap-6 px-4 py-2 pb-24 h-screen overflow-y-auto">
        {/* Value Input Section */}
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <label className="text-sm font-medium text-gray-400">Valor da transação</label>
          <div className="relative flex items-center justify-center w-full">
            <span className="text-3xl font-bold text-gray-400 mr-2">R$</span>
            <input
              autoFocus
              className="bg-transparent border-none text-center text-5xl font-bold text-white placeholder-gray-600 focus:ring-0 w-full max-w-[280px] p-0 caret-primary"
              value={amount}
              onChange={handleAmountChange}
              inputMode="decimal"
            />
          </div>
        </div>

        {/* OCR Button */}
        <div className="flex justify-center">
          <label className={`flex items-center gap-2 px-4 py-2 rounded-full bg-surface-dark border border-white/10 cursor-pointer hover:bg-white/5 transition-all outline-none ${isProcessingImage ? 'opacity-50 pointer-events-none' : ''}`}>
            <span className="material-symbols-outlined text-primary">add_a_photo</span>
            <span className="text-sm font-semibold">{isProcessingImage ? 'Lendo nota...' : 'Escanear Nota Fiscal'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isProcessingImage} />
          </label>
        </div>

        {/* Segmented Control */}
        <div className="bg-surface-dark p-1 rounded-xl flex shadow-sm border border-white/5">
          <button
            onClick={() => setType('expense')}
            className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg transition-all duration-200 text-sm font-semibold ${type === 'expense' ? 'bg-background-dark text-red-400 shadow-sm' : 'text-gray-400'}`}
          >
            <span className="material-symbols-outlined text-[18px] mr-2">trending_down</span>
            Despesa
          </button>
          <button
            onClick={() => setType('income')}
            className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg transition-all duration-200 text-sm font-semibold ${type === 'income' ? 'bg-background-dark text-primary shadow-sm' : 'text-gray-400'}`}
          >
            <span className="material-symbols-outlined text-[18px] mr-2">trending_up</span>
            Receita
          </button>
        </div>

        {/* Input Fields Group */}
        <div className="flex flex-col gap-4">
          <div className="relative group">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Categoria</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">category</span>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full pl-10 pr-10 py-3.5 bg-surface-dark border border-white/10 rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer text-white"
              >
                <option value="" disabled>Selecione uma categoria</option>
                <option value="Alimentação">Alimentação</option>
                <option value="Transporte">Transporte</option>
                <option value="Shopping">Compras</option>
                <option value="Assinatura">Assinatura</option>
                <option value="Lazer">Lazer</option>
                <option value="Investimentos">Investimentos</option>
                <option value="Salário">Salário</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400">expand_more</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Método de Pagamento</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">credit_card</span>
              </div>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setShowCustomPayment(e.target.value === 'Outro');
                }}
                className="block w-full pl-10 pr-10 py-3.5 bg-surface-dark border border-white/10 rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer text-white"
              >
                {user?.paymentMethods && user.paymentMethods.length > 0 ? (
                  <optgroup label="Meus Métodos Salvos">
                    {user.paymentMethods.map(m => (
                      <option key={m} value={m}>{m.includes('Cartão') || m.includes('Nubank') ? '💳' : '💰'} {m}</option>
                    ))}
                  </optgroup>
                ) : (
                  <>
                    <optgroup label="Contas">
                      <option value="Conta Corrente">🏦 Conta Corrente</option>
                      <option value="Dinheiro">💵 Dinheiro</option>
                      <option value="Pix">📱 Pix</option>
                    </optgroup>
                    <optgroup label="Cartões de Crédito">
                      <option value="Cartão de Crédito - Nubank">💳 Nubank</option>
                      <option value="Cartão de Crédito - Visa">💳 Visa</option>
                      <option value="Cartão de Crédito - Master">💳 Mastercard</option>
                    </optgroup>
                  </>
                )}
                <optgroup label="Outros">
                  <option value="Vale Refeição">🍕 Vale Refeição</option>
                  <option value="Outro">➕ Adicionar Outro / Nome Personalizado</option>
                </optgroup>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400">expand_more</span>
              </div>
            </div>
          </div>

          {showCustomPayment && (
            <div className="relative animate-in fade-in slide-in-from-top-1 duration-300">
              <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Nome do Cartão/Método</label>
              <input
                placeholder="Ex: Cartão Porto Seguro"
                value={customPaymentMethod}
                onChange={(e) => setCustomPaymentMethod(e.target.value)}
                className="block w-full px-4 py-3.5 bg-surface-dark border border-white/10 rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all text-white placeholder-gray-500"
              />
            </div>
          )}

          <div className="relative group">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Data</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">calendar_today</span>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full pl-10 pr-4 py-3.5 bg-surface-dark border border-white/10 rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all text-white [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Título</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">edit_note</span>
              </div>
              <input
                placeholder="Título da transação (ex: Aluguel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full pl-10 pr-4 py-3.5 bg-surface-dark border border-white/10 rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Observações</label>
            <div className="relative">
              <div className="absolute top-3.5 left-0 pl-3 flex items-start pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">notes</span>
              </div>
              <textarea
                placeholder="Detalhes adicionais (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full pl-10 pr-4 py-3.5 bg-surface-dark border border-white/10 rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all text-white placeholder-gray-500 resize-none font-sans"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-12 h-6 rounded-full transition-all relative ${isRecurring ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 size-4 rounded-full bg-white transition-all ${isRecurring ? 'left-7' : 'left-1'}`}></div>
              </div>
              <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">Repetir esta transação</span>
            </label>

            {isRecurring && (
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-2">
                  <button
                    onClick={() => setRecurrenceType('fixed')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${recurrenceType === 'fixed' ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    MENSAL / FIXO
                  </button>
                  <button
                    onClick={() => setRecurrenceType('installments')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${recurrenceType === 'installments' ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    PARCELADO
                  </button>
                </div>

                {recurrenceType === 'installments' && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-white/60">Número de parcelas:</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setInstallmentsCount(Math.max(2, installmentsCount - 1))}
                        className="size-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="text-sm font-black w-4 text-center">{installmentsCount}</span>
                      <button
                        onClick={() => setInstallmentsCount(Math.min(48, installmentsCount + 1))}
                        className="size-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-dark/90 backdrop-blur-md border-t border-white/5 max-w-md mx-auto z-20">
        <button
          onClick={handleSave}
          className="w-full bg-primary hover:bg-green-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">check</span>
          Salvar Transação
        </button>
      </div>
    </div>
  );
};

export default NewTransaction;
