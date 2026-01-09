
import React, { useMemo } from 'react';
import { Transaction, User } from '../../types';

interface WalletProps {
    user: User;
    transactions: Transaction[];
    onBack: () => void;
    onAdd: () => void;
}

const Wallet: React.FC<WalletProps> = ({ user, transactions, onBack, onAdd }) => {
    const today = new Date().toISOString().split('T')[0];

    const receivedTransactions = useMemo(() => {
        return transactions.filter(t => t.type === 'income' && t.date <= today);
    }, [transactions, today]);

    const futureTransactions = useMemo(() => {
        return transactions.filter(t => t.type === 'income' && t.date > today);
    }, [transactions, today]);

    const debtTransactions = useMemo(() => {
        return transactions.filter(t => t.type === 'expense' && t.date > today);
    }, [transactions, today]);

    const totalReceived = useMemo(() => {
        return receivedTransactions.reduce((acc, t) => acc + t.amount, 0);
    }, [receivedTransactions]);

    const totalFuture = useMemo(() => {
        return futureTransactions.reduce((acc, t) => acc + t.amount, 0);
    }, [futureTransactions]);

    const totalDebts = useMemo(() => {
        return debtTransactions.reduce((acc, t) => acc + t.amount, 0);
    }, [debtTransactions]);

    const ValueDisplay = ({ amount, colorClass, type }: { amount: number, colorClass: string, type: string }) => {
        if (user.privacyMode) {
            return <h2 className={`text-3xl font-black blur-md select-none ${colorClass}`}>R$ ••••••</h2>;
        }
        return (
            <h2 className={`text-3xl font-black flex items-baseline gap-1 ${colorClass}`}>
                <span className="text-lg font-bold opacity-60">R$</span>
                {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white p-4 lg:p-10">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 max-w-5xl mx-auto w-full">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center size-10 rounded-xl bg-surface-dark border border-white/5 text-white hover:bg-white/10 transition-all"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-black tracking-tighter uppercase">Minha Carteira</h1>
                <button
                    onClick={onAdd}
                    className="flex items-center justify-center size-10 rounded-xl bg-primary text-black hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined font-bold">add</span>
                </button>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full space-y-8 pb-20">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Received Card */}
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 rounded-[28px] p-6 border border-emerald-500/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-500/80 tracking-wider font-display uppercase">Recebidos</span>
                        </div>
                        <ValueDisplay amount={totalReceived} colorClass="text-white" type="income" />
                        <p className="text-xs text-white/40 mt-2 font-medium">Acumulado até hoje</p>
                    </div>

                    {/* Future Income Card */}
                    <div className="bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-[28px] p-6 border border-primary/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">upcoming</span>
                            </div>
                            <span className="text-sm font-bold text-primary/80 tracking-wider font-display uppercase">A Receber</span>
                        </div>
                        <ValueDisplay amount={totalFuture} colorClass="text-primary" type="income" />
                        <p className="text-xs text-white/40 mt-2 font-medium">Previsão futura</p>
                    </div>

                    {/* Debts Card */}
                    <div className="bg-gradient-to-br from-red-500/20 to-red-900/20 rounded-[28px] p-6 border border-red-500/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined">event_busy</span>
                            </div>
                            <span className="text-sm font-bold text-red-500/80 tracking-wider font-display uppercase">A Pagar</span>
                        </div>
                        <ValueDisplay amount={totalDebts} colorClass="text-red-400" type="expense" />
                        <p className="text-xs text-white/40 mt-2 font-medium">Contas e parcelas</p>
                    </div>
                </div>

                {/* Detailed Sections */}
                <div className={`space-y-12 transition-all ${user.privacyMode ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                    {/* Future Debts Section */}
                    <section>
                        <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                            <span className="w-1.5 h-6 rounded-full bg-red-500"></span>
                            Próximos Pagamentos
                        </h3>
                        <div className="space-y-3">
                            {debtTransactions.length > 0 ? (
                                debtTransactions.map(t => (
                                    <div key={t.id} className="bg-surface-dark border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-red-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                                <span className="material-symbols-outlined">{t.icon}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-sm text-white">{t.title}</h4>
                                                    {t.installments && (
                                                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/60 font-black">
                                                            {t.installments.current}/{t.installments.total}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-white/40 uppercase font-bold tracking-tighter">{t.category} • {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-red-500">- R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 bg-surface-dark/40 rounded-[28px] border border-dashed border-white/5 gap-4">
                                    <div className="size-14 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                        <span className="material-symbols-outlined text-3xl">task_alt</span>
                                    </div>
                                    <p className="text-white/20 font-medium tracking-tight">Nenhuma dívida futura pendente.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                            <span className="w-1.5 h-6 rounded-full bg-emerald-500"></span>
                            Histórico de Recebidos
                        </h3>
                        <div className="space-y-3">
                            {receivedTransactions.length > 0 ? (
                                receivedTransactions.map(t => (
                                    <div key={t.id} className="bg-surface-dark border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <span className="material-symbols-outlined">{t.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-white">{t.title}</h4>
                                                <p className="text-xs text-white/40 uppercase font-bold tracking-tighter">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-emerald-500">+ R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/20 text-center py-8 bg-surface-dark/50 rounded-2xl border border-dashed border-white/5 font-bold uppercase tracking-widest text-[10px]">Nenhum histórico</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Wallet;
