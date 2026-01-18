
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, PaymentMethod, Card } from '../types';
import { CATEGORIES } from '../constants';

interface PlanningViewProps {
    transactions: Transaction[];
    onAddRecurring: (tx: Omit<Transaction, 'id'>) => void;
    onDeleteRecurring: (id: string) => void;
    onConfirmRecurring: (tx: Omit<Transaction, 'id'>) => void;
}

const PlanningView: React.FC<PlanningViewProps> = ({ transactions, onAddRecurring, onDeleteRecurring, onConfirmRecurring }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [desc, setDesc] = useState('');
    const [val, setVal] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [day, setDay] = useState(1);
    const [category, setCategory] = useState(CATEGORIES[0].label);

    const recurringItems = useMemo(() =>
        transactions.filter(t => t.isRecurring),
        [transactions]
    );

    const fixedIncome = useMemo(() =>
        recurringItems.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0),
        [recurringItems]
    );

    const fixedExpenses = useMemo(() =>
        recurringItems.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + Math.abs(t.amount), 0),
        [recurringItems]
    );

    const handleSave = () => {
        if (!desc || !val) return;
        onAddRecurring({
            description: desc,
            amount: parseFloat(val) * (type === TransactionType.EXPENSE ? -1 : 1),
            date: new Date().toISOString().split('T')[0],
            time: '00:00',
            category,
            type,
            icon: CATEGORIES.find(c => c.label === category)?.icon || 'receipt_long',
            isRecurring: true,
            recurringDay: day
        });
        setDesc('');
        setVal('');
        setShowAdd(false);
    };

    const isItemFulfilled = (item: Transaction) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return transactions.some(t =>
            !t.isRecurring &&
            t.description.toLowerCase() === item.description.toLowerCase() &&
            Math.abs(t.amount) === Math.abs(item.amount) &&
            new Date(t.date).getMonth() === currentMonth &&
            new Date(t.date).getFullYear() === currentYear
        );
    };

    const handleConfirm = (item: Transaction) => {
        onConfirmRecurring({
            description: item.description,
            amount: item.amount,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            category: item.category,
            type: item.type,
            icon: item.icon,
            isRecurring: false // Real transaction
        });
    };

    return (
        <div className="animate-fadeIn pb-32">
            <header className="p-6 pb-2">
                <h2 className="text-2xl font-black text-white/90">Planejamento</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Gere seus custos e ganhos fixos</p>
            </header>

            <main className="p-6 flex flex-col gap-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass bg-primary/5 border border-primary/20 p-5 rounded-3xl">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Receita Fixa</p>
                        <p className="text-xl font-black text-white">R$ {(fixedIncome ?? 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="glass bg-red-400/5 border border-red-400/20 p-5 rounded-3xl">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Custo Fixo</p>
                        <p className="text-xl font-black text-white">R$ {(fixedExpenses ?? 0).toLocaleString('pt-BR')}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-[0.2em]">Itens Recorrentes</h3>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="size-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-primary/20"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {recurringItems.length === 0 ? (
                            <div className="py-10 text-center opacity-30">
                                <span className="material-symbols-outlined text-4xl mb-2">calendar_month</span>
                                <p className="text-sm font-bold">Nenhum plano mensal ainda</p>
                            </div>
                        ) : (
                            recurringItems.map(item => {
                                const fulfilled = isItemFulfilled(item);
                                return (
                                    <div key={item.id} className="glass bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex items-center justify-between group overflow-hidden relative">
                                        {fulfilled && <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>}
                                        <div className="flex items-center gap-4">
                                            <div className={`size-10 rounded-xl flex items-center justify-center ${item.type === TransactionType.INCOME ? 'bg-primary/10 text-primary' : 'bg-white/5 text-gray-500'}`}>
                                                <span className="material-symbols-outlined">{item.icon}</span>
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${fulfilled ? 'text-gray-500 line-through' : 'text-white/90'}`}>{item.description}</p>
                                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Todo dia {item.recurringDay || '01'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className={`text-sm font-black ${item.type === TransactionType.INCOME ? 'text-primary' : (fulfilled ? 'text-gray-600' : 'text-white')}`}>
                                                R$ {Math.abs(item.amount ?? 0).toLocaleString('pt-BR')}
                                            </p>

                                            {!fulfilled ? (
                                                <button
                                                    onClick={() => handleConfirm(item)}
                                                    className="size-8 rounded-lg bg-primary text-[#0a0f0c] flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-primary/20"
                                                >
                                                    <span className="material-symbols-outlined text-base font-black">check</span>
                                                </button>
                                            ) : (
                                                <div className="size-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-base font-black">done_all</span>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => onDeleteRecurring(item.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-red-400/50 hover:text-red-400 transition-all ml-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Projeção de Sobra */}
                <div className="glass bg-white/5 p-6 rounded-[32px] border border-white/5 mt-4 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 size-40 bg-primary/10 rounded-full blur-3xl"></div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Sobra Planejada (Mensal)</p>
                    <h4 className="text-3xl font-black text-primary">R$ {((fixedIncome ?? 0) - (fixedExpenses ?? 0)).toLocaleString('pt-BR')}</h4>
                    <p className="text-[9px] text-gray-600 mt-2 leading-relaxed">
                        Este é o valor que teoricamente "sobra" do seu salário após pagar todos os custos fixos mensais cadastrados.
                    </p>
                </div>
            </main>

            {/* Add Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-[200] flex items-end animate-fadeIn">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAdd(false)}></div>
                    <div className="relative w-full bg-[#0a0f0c] rounded-t-[40px] p-8 pb-12 animate-slide-up border-t border-white/10">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>

                        <h3 className="text-xl font-black mb-6">Novo Plano Mensal</h3>

                        <div className="flex flex-col gap-6">
                            <div className="flex h-12 p-1 bg-white/5 rounded-xl border border-white/10">
                                <button onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 rounded-lg text-xs font-black uppercase ${type === TransactionType.EXPENSE ? 'bg-white text-black' : 'text-gray-500'}`}>Dívida</button>
                                <button onClick={() => setType(TransactionType.INCOME)} className={`flex-1 rounded-lg text-xs font-black uppercase ${type === TransactionType.INCOME ? 'bg-primary text-black' : 'text-gray-500'}`}>Receita</button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Descrição</label>
                                <input
                                    type="text"
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    placeholder="Ex: Aluguel, Salário, Internet"
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold focus:border-primary outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Valor Mensal</label>
                                    <input
                                        type="number"
                                        value={val}
                                        onChange={(e) => setVal(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-black text-primary outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Dia do Mês</label>
                                    <input
                                        type="number"
                                        min="1" max="31"
                                        value={day}
                                        onChange={(e) => setDay(parseInt(e.target.value) || 1)}
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full h-16 bg-primary text-[#0a0f0c] font-black rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all mt-4"
                            >
                                Salvar Plano <span className="material-symbols-outlined ml-2">check_circle</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanningView;
