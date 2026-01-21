
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType, Card, PaymentMethod } from '../types';
import { CATEGORIES } from '../constants';

interface AnalyticsViewProps {
  transactions: Transaction[];
  cards: Card[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, cards }) => {
  const incomes = useMemo(() =>
    transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );

  const expenses = useMemo(() =>
    transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + Math.abs(t.amount || 0), 0),
    [transactions]
  );

  const cashFlow = incomes - expenses;

  const creditCardBill = useMemo(() =>
    transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.paymentMethod === PaymentMethod.CREDIT)
      .reduce((acc, t) => acc + Math.abs(t.amount || 0), 0),
    [transactions]
  );

  const savingsRate = useMemo(() => {
    if (incomes <= 0) return 0;
    const rate = ((incomes - expenses) / incomes) * 100;
    return Math.max(0, rate);
  }, [incomes, expenses]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount || 0);
      });

    return Object.entries(totals)
      .map(([label, val]) => {
        const catInfo = CATEGORIES.find(c => c.label === label) || { icon: 'payments', color: 'bg-gray-500' };
        return { label, val, icon: catInfo.icon, color: (catInfo as any).color || 'bg-primary' };
      })
      .sort((a, b) => b.val - a.val);
  }, [transactions]);

  const methodTotals = useMemo(() => {
    const totals: Record<string, { label: string, amount: number, icon: string, color: string }> = {};

    transactions.forEach(t => {
      let key = '';
      let label = '';
      let icon = '';

      if (t.paymentMethod === PaymentMethod.PIX) {
        if (t.type === TransactionType.INCOME) {
          key = 'PIX_RECEIVED';
          label = 'Pix Recebido';
          icon = 'account_balance';
        } else {
          key = 'PIX_SENT';
          label = 'Pix Enviado';
          icon = 'payments';
        }
      } else if (t.paymentMethod === PaymentMethod.CREDIT) {
        key = 'CREDIT';
        label = t.cardId ? (cards.find(c => c.id === t.cardId)?.name || 'Cartão de Crédito') : 'Cartão de Crédito';
        icon = 'credit_card';
      } else if (t.paymentMethod === PaymentMethod.DEBIT) {
        key = 'DEBIT';
        label = 'Débito / Conta';
        icon = 'account_balance_wallet';
      } else {
        key = 'CASH';
        label = 'Dinheiro / Outros';
        icon = 'money';
      }

      const amount = Math.abs(t.amount || 0);
      if (!totals[key]) {
        totals[key] = { label, amount: 0, icon, color: t.type === TransactionType.INCOME ? 'text-primary' : 'text-gray-500' };
      }
      totals[key].amount += amount;
    });

    return Object.values(totals).sort((a, b) => b.amount - a.amount);
  }, [transactions, cards]);

  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string, income: number, expense: number }> = {};
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTxs.forEach(t => {
      const dateKey = t.date;
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, income: 0, expense: 0 };
      }

      if (t.type === TransactionType.INCOME) {
        dailyData[dateKey].income += t.amount;
      } else {
        dailyData[dateKey].expense += Math.abs(t.amount);
      }
    });

    return Object.values(dailyData);
  }, [transactions]);

  const insights = useMemo(() => {
    const list = [];

    if (expenses > incomes && incomes > 0) {
      list.push({
        title: "Atenção ao Fluxo",
        desc: "Seus gastos superaram sua receita em " + ((expenses / (incomes || 1) - 1) * 100).toFixed(0) + "%.",
        icon: "warning",
        color: "text-red-400",
        bg: "bg-red-400/10"
      });
    }

    const avgDaily = expenses / (chartData.length || 1);
    if (avgDaily > 0) {
      list.push({
        title: "Gasto Médio Diário",
        desc: "Você gasta em média R$ " + avgDaily.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + " por dia este mês.",
        icon: "schedule",
        color: "text-blue-400",
        bg: "bg-blue-400/10"
      });
    }

    if (savingsRate > 20) {
      list.push({
        title: "Excelente Economia",
        desc: "Você está poupando " + savingsRate.toFixed(0) + "% do que ganha. Parabéns!",
        icon: "star",
        color: "text-primary",
        bg: "bg-primary/10"
      });
    } else if (cashFlow > 0) {
      list.push({
        title: "Potencial de Investimento",
        desc: "Você tem R$ " + (cashFlow ?? 0).toLocaleString('pt-BR') + " sobrando. Que tal investir?",
        icon: "trending_up",
        color: "text-primary",
        bg: "bg-primary/10"
      });
    }

    return list.slice(0, 3);
  }, [incomes, expenses, cashFlow, savingsRate, chartData]);

  const maxCategoryVal = Math.max(...categoryTotals.map(c => c.val), 1);

  return (
    <div className="animate-fadeIn pb-32">
      <header className="p-6 pb-2 flex items-center justify-between sticky top-0 z-50 bg-[#0a0f0c]/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-white/90">Análise</h2>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Dashboard de Insights</p>
        </div>
        <div className="size-11 flex items-center justify-center rounded-2xl glass bg-white/5 border border-white/10 text-primary">
          <span className="material-symbols-outlined filled">monitoring</span>
        </div>
      </header>

      <main className="p-6 flex flex-col gap-8">
        {/* Summary Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass bg-white/[0.02] border border-white/5 p-5 rounded-[28px] flex flex-col gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Entradas</p>
              <h3 className="text-base font-black text-white">R$ {incomes.toLocaleString('pt-BR')}</h3>
            </div>
          </div>

          <div className="glass bg-white/[0.02] border border-white/5 p-5 rounded-[28px] flex flex-col gap-3">
            <div className="size-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <span className="material-symbols-outlined">trending_down</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Saídas</p>
              <h3 className="text-base font-black text-white">R$ {expenses.toLocaleString('pt-BR')}</h3>
            </div>
          </div>

          <div className="glass bg-white/[0.02] border border-white/5 p-5 rounded-[28px] flex flex-col gap-3">
            <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <span className="material-symbols-outlined">credit_card</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Fatura</p>
              <h3 className="text-base font-black text-white">R$ {creditCardBill.toLocaleString('pt-BR')}</h3>
            </div>
          </div>

          <div className="glass bg-primary/5 border border-primary/20 p-5 rounded-[28px] flex flex-col gap-3">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Saldo Líquido</p>
              <h3 className="text-base font-black text-white">R$ {cashFlow.toLocaleString('pt-BR')}</h3>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="relative glass bg-[#121814] rounded-[32px] p-6 border border-white/5 overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Fluxo de Caixa</p>
              <h2 className="text-2xl font-black text-white">Desempenho Diário</h2>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{savingsRate.toFixed(0)}% poupado</span>
              <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${savingsRate}%` }}></div>
              </div>
            </div>
          </div>

          <div className="h-48 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#19e65e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#19e65e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0f0c', border: '1px solid #ffffff10', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#19e65e" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Smart Insights */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] px-1">Smart Insights</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            {insights.length > 0 ? insights.map((insight, i) => (
              <div key={i} className={`flex-none w-72 p-6 rounded-[28px] border border-white/5 relative overflow-hidden ${insight.bg}`}>
                <span className={`material-symbols-outlined text-2xl mb-3 ${insight.color}`}>{insight.icon}</span>
                <h4 className="text-sm font-black text-white mb-2">{insight.title}</h4>
                <p className="text-xs text-gray-400 font-bold leading-relaxed">{insight.desc}</p>
              </div>
            )) : (
              <div className="w-full glass bg-white/[0.02] p-8 rounded-[32px] text-center text-gray-600 border border-dashed border-white/10">
                <p className="text-xs font-bold uppercase tracking-widest">Continue lançando para ver insights</p>
              </div>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Gastos por Área</h3>
            <span className="text-[10px] text-primary font-black uppercase tracking-widest">Ver Todos</span>
          </div>

          <div className="flex flex-col gap-3">
            {categoryTotals.slice(0, 5).map(cat => (
              <div key={cat.label} className="group glass bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-5 hover:bg-white/[0.05] transition-all">
                <div className={`size-12 rounded-2xl flex items-center justify-center text-primary bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined">{cat.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-sm font-bold text-white/80">{cat.label}</p>
                    <p className="text-sm font-black text-white">R$ {(cat.val ?? 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${(cat.val / maxCategoryVal) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Methods */}
        <section className="glass bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8">DNA de Pagamento</h3>
          <div className="flex flex-col gap-6">
            {methodTotals.map((item) => (
              <div key={item.label} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="size-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <span className={`material-symbols-outlined text-lg ${item.color}`}>
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-white">R$ {(item.amount ?? 0).toLocaleString('pt-BR')}</span>
                  <div className="size-1.5 rounded-full bg-primary" style={{ opacity: Math.max(0.1, (item.amount ?? 0) / (expenses || 1)) }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default AnalyticsView;
