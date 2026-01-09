
import React from 'react';
import { Transaction } from '../../types';

interface TransactionListProps {
    groupedTransactions: Record<string, Transaction[]>;
}

const formatDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Hoje';
    if (dateStr === yesterday) return 'Ontem';

    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${d} de ${months[parseInt(m) - 1]}`;
};

const TransactionList: React.FC<TransactionListProps> = ({ groupedTransactions }) => {
    const dates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

    if (dates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="size-20 rounded-full bg-surface-dark flex items-center justify-center mb-4 ring-1 ring-white/5">
                    <span className="material-symbols-outlined text-[40px] opacity-20">history_toggle_off</span>
                </div>
                <p className="font-bold text-sm tracking-tight">Nada por aqui ainda.</p>
                <p className="text-xs opacity-60">Suas transações aparecerão nesta lista.</p>
            </div>
        )
    }

    return (
        <main className="flex flex-col gap-6 px-4 pt-2 lg:px-6">
            {dates.map((date) => (
                <div key={date} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{formatDateLabel(date)}</h3>
                        <div className="h-px flex-grow bg-white/5 ml-4"></div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {groupedTransactions[date].map(t => (
                            <div key={t.id} className="group flex items-center justify-between rounded-[20px] bg-surface-dark p-4 shadow-sm ring-1 ring-white/5 transition-all hover:ring-white/10 hover:translate-x-1 active:scale-[0.98]">
                                <div className="flex items-center gap-4">
                                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${t.type === 'income' ? 'bg-[#244730] text-primary' : 'bg-red-900/20 text-red-400'}`}>
                                        <span className="material-symbols-outlined text-[26px]">{t.icon}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="line-clamp-1 text-sm font-bold text-white">{t.title}</p>
                                        <p className="line-clamp-1 text-xs font-medium text-slate-500">{t.category}</p>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
                                    <p className={`text-base font-black ${t.type === 'income' ? 'text-primary' : 'text-white'}`}>
                                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {t.paymentMethod && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">
                                                <span className="material-symbols-outlined text-[10px] text-primary/70">credit_card</span>
                                                <p className="text-[9px] font-bold text-slate-400 truncate max-w-[60px]">{t.paymentMethod.replace('Cartão de Crédito - ', '')}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/20 border border-white/5">
                                            <span className="material-symbols-outlined text-[10px] text-slate-500">schedule</span>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase">{t.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </main>
    );
};

export default TransactionList;
