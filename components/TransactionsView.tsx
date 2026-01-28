import React, { useState, useMemo } from 'react';
import { Transaction, Card, PaymentMethod, TransactionType } from '../types';

interface TransactionsViewProps {
    transactions: Transaction[];
    onBack: () => void;
    cards: Card[];
    onEditTransaction: (tx: Transaction) => void;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onBack, cards, onEditTransaction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'PIX_IN' | 'PIX_OUT' | 'DEBIT' | 'CREDIT' | 'BOLETO'>('ALL');

    // Calcular resumos
    const summary = useMemo(() => {
        const stats = {
            pixIn: { count: 0, total: 0 },
            pixOut: { count: 0, total: 0 },
            debit: { count: 0, total: 0 },
            credit: { count: 0, total: 0 },
            boleto: { count: 0, total: 0 }
        };

        transactions.forEach(tx => {
            const amount = Math.abs(tx.amount);

            if (tx.paymentMethod === PaymentMethod.PIX) {
                if (tx.type === TransactionType.INCOME) {
                    stats.pixIn.count++;
                    stats.pixIn.total += amount;
                } else {
                    stats.pixOut.count++;
                    stats.pixOut.total += amount;
                }
            } else if (tx.paymentMethod === PaymentMethod.DEBIT) {
                stats.debit.count++;
                stats.debit.total += amount;
            } else if (tx.paymentMethod === PaymentMethod.CREDIT) {
                stats.credit.count++;
                stats.credit.total += amount;
            } else if (tx.description.toUpperCase().includes('BOLETO')) {
                stats.boleto.count++;
                stats.boleto.total += amount;
            }
        });

        return stats;
    }, [transactions]);

    const filteredTransactions = transactions.filter(tx => {
        // Filtro de texto
        const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Filtro por tipo/método
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'PIX_IN') return tx.paymentMethod === PaymentMethod.PIX && tx.type === TransactionType.INCOME;
        if (activeFilter === 'PIX_OUT') return tx.paymentMethod === PaymentMethod.PIX && tx.type === TransactionType.EXPENSE;
        if (activeFilter === 'DEBIT') return tx.paymentMethod === PaymentMethod.DEBIT;
        if (activeFilter === 'CREDIT') return tx.paymentMethod === PaymentMethod.CREDIT;
        if (activeFilter === 'BOLETO') return tx.description.toUpperCase().includes('BOLETO');

        return true;
    });

    const groupedTransactions = filteredTransactions.reduce((acc: any, tx) => {
        const date = tx.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(tx);
        return acc;
    }, {});

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const SummaryCard = ({
        title,
        value,
        count,
        icon,
        isActive,
        onClick,
        colorClass = "text-primary",
        bgClass = "bg-primary/10"
    }: any) => (
        <button
            onClick={onClick}
            className={`flex-none w-36 p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-32 relative overflow-hidden group ${isActive ? 'bg-white/10 border-primary/50 ring-1 ring-primary/50' : 'glass bg-white/[0.02] border-white/5 hover:bg-white/5'}`}
        >
            <div className={`absolute -right-4 -top-4 size-16 rounded-full opacity-20 group-hover:scale-110 transition-transform ${bgClass}`}></div>

            <div className={`size-8 rounded-lg flex items-center justify-center mb-2 ${bgClass} ${colorClass}`}>
                <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>

            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{title}</p>
                <p className="text-white font-bold text-sm truncate">R$ {value.toLocaleString('pt-BR', { notation: 'compact' })}</p>
                <p className="text-[9px] text-gray-500 mt-1">{count} transações</p>
            </div>
        </button>
    );

    return (
        <div className="flex flex-col bg-[#0a0f0c] h-screen animate-fadeIn">
            <header className="px-6 pt-6 pb-2 flex items-center justify-between sticky top-0 z-50 bg-[#0a0f0c]/90 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-white text-3xl">chevron_left</span>
                    </button>
                    <h1 className="text-xl font-bold">Extrato</h1>
                </div>
                <div className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                    <span className="material-symbols-outlined text-gray-400">receipt_long</span>
                </div>
            </header>

            {/* Smart Filters / Summary */}
            <div className="pl-6 mb-2 py-2 overflow-x-auto scrollbar-hide flex gap-3 pr-6">
                <button
                    onClick={() => setActiveFilter('ALL')}
                    className={`flex-none w-14 h-32 rounded-2xl flex items-center justify-center border transition-all ${activeFilter === 'ALL' ? 'bg-white text-black border-white' : 'glass bg-white/[0.02] border-white/5 text-white'}`}
                >
                    <span className="text-xs font-black uppercase -rotate-90 tracking-widest whitespace-nowrap">Ver Tudo</span>
                </button>

                <SummaryCard
                    title="Pix Recebido"
                    value={summary.pixIn.total}
                    count={summary.pixIn.count}
                    icon="account_balance"
                    isActive={activeFilter === 'PIX_IN'}
                    onClick={() => setActiveFilter('PIX_IN')}
                    colorClass="text-[#19e65e]"
                    bgClass="bg-[#19e65e]/10"
                />

                <SummaryCard
                    title="Pix Enviado"
                    value={summary.pixOut.total}
                    count={summary.pixOut.count}
                    icon="send_money"
                    isActive={activeFilter === 'PIX_OUT'}
                    onClick={() => setActiveFilter('PIX_OUT')}
                    colorClass="text-red-400"
                    bgClass="bg-red-400/10"
                />

                <SummaryCard
                    title="Cartão Crédito"
                    value={summary.credit.total}
                    count={summary.credit.count}
                    icon="credit_card"
                    isActive={activeFilter === 'CREDIT'}
                    onClick={() => setActiveFilter('CREDIT')}
                    colorClass="text-purple-400"
                    bgClass="bg-purple-400/10"
                />

                <SummaryCard
                    title="Débito"
                    value={summary.debit.total}
                    count={summary.debit.count}
                    icon="account_balance_wallet"
                    isActive={activeFilter === 'DEBIT'}
                    onClick={() => setActiveFilter('DEBIT')}
                    colorClass="text-blue-400"
                    bgClass="bg-blue-400/10"
                />
            </div>

            <div className="px-6 mb-4 sticky top-[72px] z-40 bg-[#0a0f0c]">
                <div className="glass bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                    <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Buscar comprovante..."
                        className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <main className="flex-1 px-6 pb-24 overflow-y-auto">
                {Object.keys(groupedTransactions).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                        <p className="font-bold text-lg">Nada encontrado</p>
                        <p className="text-xs text-gray-500 mt-1">Tente mudar o filtro ou a busca</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)).map(date => (
                            <div key={date} className="flex flex-col gap-3">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] sticky top-0 bg-[#0a0f0c] py-2 z-10">
                                    {formatDate(date)}
                                </h4>
                                <div className="flex flex-col gap-2">
                                    {groupedTransactions[date].map((tx: Transaction) => (
                                        <div
                                            key={tx.id}
                                            onClick={() => onEditTransaction(tx)}
                                            className="group flex items-center justify-between glass bg-white/[0.02] p-3.5 rounded-2xl border-white/5 cursor-pointer hover:bg-white/5 transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className={`size-10 rounded-xl flex items-center justify-center glass ${tx.amount > 0 ? 'bg-primary/10 text-primary border-primary/10' : 'bg-white/5 text-gray-400 border-white/5'}`}>
                                                    <span className="material-symbols-outlined text-lg">{tx.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white/90 truncate max-w-[160px]">{tx.description}</p>
                                                    <div className="flex items-center gap-2 opacity-60">
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{tx.category}</span>
                                                        <span className="w-0.5 h-0.5 bg-gray-500 rounded-full"></span>
                                                        <span className="text-[8px] font-bold uppercase text-gray-400">
                                                            {tx.paymentMethod === PaymentMethod.PIX ? 'Pix' :
                                                                tx.paymentMethod === PaymentMethod.DEBIT ? 'Débito' :
                                                                    tx.paymentMethod === PaymentMethod.CREDIT ? 'Crédito' : tx.paymentMethod}
                                                        </span>
                                                        {tx.cardId && cards.find(c => c.id === tx.cardId) && (
                                                            <>
                                                                <span className="w-0.5 h-0.5 bg-gray-500 rounded-full"></span>
                                                                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                                                    <div
                                                                        className="size-1.5 rounded-full"
                                                                        style={{ backgroundColor: cards.find(c => c.id === tx.cardId)?.color }}
                                                                    ></div>
                                                                    <span className="text-[8px] font-black uppercase tracking-tighter text-white/60">
                                                                        {cards.find(c => c.id === tx.cardId)?.name}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-black ${tx.amount > 0 ? 'text-primary' : 'text-white'}`}>
                                                    {tx.amount > 0 ? '+' : ''} {Math.abs(tx.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-[9px] text-gray-600 font-bold">{tx.time?.slice(0, 5)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TransactionsView;
