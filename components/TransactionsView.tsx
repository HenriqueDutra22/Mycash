
import React, { useState } from 'react';
import { Transaction, Card, PaymentMethod, TransactionType } from '../types';

interface TransactionsViewProps {
    transactions: Transaction[];
    onBack: () => void;
    cards: Card[];
    onEditTransaction: (tx: Transaction) => void;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onBack, cards, onEditTransaction }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransactions = transactions.filter(tx =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedTransactions = filteredTransactions.reduce((acc: any, tx) => {
        const date = tx.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(tx);
        return acc;
    }, {});

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    return (
        <div className="flex flex-col bg-[#0a0f0c] h-screen animate-fadeIn">
            <header className="p-6 flex items-center justify-between sticky top-0 z-50 bg-[#0a0f0c]/80 backdrop-blur-xl">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-white text-3xl">chevron_left</span>
                </button>
                <h1 className="text-xl font-bold">Histórico Completo</h1>
                <div className="w-10"></div>
            </header>

            <div className="px-6 mb-6">
                <div className="glass bg-white/5 p-4 rounded-3xl flex items-center gap-3 border border-white/5">
                    <span className="material-symbols-outlined text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nome ou categoria..."
                        className="bg-transparent border-none outline-none text-sm w-full font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <main className="flex-1 px-6 pb-24 overflow-y-auto">
                {Object.keys(groupedTransactions).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">history_edu</span>
                        <p className="font-bold text-lg">Nenhum lançamento encontrado</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)).map(date => (
                            <div key={date} className="flex flex-col gap-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                                    {formatDate(date)}
                                </h4>
                                <div className="flex flex-col gap-3">
                                    {groupedTransactions[date].map((tx: Transaction) => (
                                        <div
                                            key={tx.id}
                                            onClick={() => onEditTransaction(tx)}
                                            className="flex items-center justify-between glass bg-white/[0.02] p-4 rounded-2xl border-white/5 cursor-pointer hover:bg-white/5 transition-colors active:scale-95"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`size-10 rounded-xl flex items-center justify-center glass ${tx.amount > 0 ? 'bg-primary/10 text-primary' : 'bg-white/5 text-gray-400'}`}>
                                                    <span className="material-symbols-outlined text-xl">{tx.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white/90">{tx.description}</p>
                                                    <div className="flex items-center gap-2 opacity-60">
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{tx.category}</span>
                                                        {tx.paymentMethod && (
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                                                                {tx.paymentMethod === PaymentMethod.PIX ? (tx.amount > 0 ? 'Pix Recebido' : 'Pix Enviado') :
                                                                    tx.paymentMethod === PaymentMethod.DEBIT ? 'Débito' :
                                                                        tx.paymentMethod === PaymentMethod.CREDIT ? (tx.cardId ? cards.find(c => c.id === tx.cardId)?.name : 'Crédito') :
                                                                            tx.paymentMethod}
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
                )}
            </main>
        </div>
    );
};

export default TransactionsView;
