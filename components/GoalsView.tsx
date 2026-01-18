
import React, { useState, useMemo } from 'react';
import { Goal } from '../types';
import { CATEGORIES } from '../constants';

interface GoalsViewProps {
    goals: Goal[];
    onAddGoal: (goal: Omit<Goal, 'id'>) => void;
    onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
    onDeleteGoal: (id: string) => void;
    onBack: () => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, onBack }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [showContribute, setShowContribute] = useState<Goal | null>(null);
    const [contributionAmount, setContributionAmount] = useState('');

    // New Goal State
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [category, setCategory] = useState(CATEGORIES[1].label); // Default to Savings/Investment
    const [deadline, setDeadline] = useState('');
    const [color, setColor] = useState('#19e65e');

    const totalTarget = useMemo(() => goals.reduce((acc, g) => acc + g.targetAmount, 0), [goals]);
    const totalSaved = useMemo(() => goals.reduce((acc, g) => acc + g.currentAmount, 0), [goals]);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    const handleAddGoal = () => {
        if (!name || !target) return;
        onAddGoal({
            name,
            targetAmount: parseFloat(target),
            currentAmount: 0,
            category,
            deadline: deadline || undefined,
            icon: CATEGORIES.find(c => c.label === category)?.icon || 'savings',
            color
        });
        setName('');
        setTarget('');
        setShowAdd(false);
    };

    const handleContribute = () => {
        if (!showContribute || !contributionAmount) return;
        const amount = parseFloat(contributionAmount);
        onUpdateGoal(showContribute.id, {
            currentAmount: showContribute.currentAmount + amount
        });
        setShowContribute(null);
        setContributionAmount('');
    };

    return (
        <div className="animate-fadeIn pb-32">
            <header className="p-6 pb-2">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-white/90">Metas</h2>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="size-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-primary/20"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Transforme sonhos em realidade</p>
            </header>

            <main className="p-6 flex flex-col gap-8">
                {/* Overall Progress Large Card */}
                <div className="glass bg-white/[0.03] p-8 rounded-[40px] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Progresso Geral</p>
                        <div className="flex items-end gap-2 mb-6">
                            <h3 className="text-4xl font-black text-white">R$ {(totalSaved ?? 0).toLocaleString('pt-BR')}</h3>
                            <p className="text-sm font-bold text-gray-500 mb-1.5">de R$ {(totalTarget ?? 0).toLocaleString('pt-BR')}</p>
                        </div>

                        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-1000 shadow-[0_0_20px_rgba(25,230,94,0.3)]"
                                style={{ width: `${Math.min(overallProgress, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-primary uppercase">{overallProgress.toFixed(1)}% Completo</p>
                            <p className="text-[10px] font-black text-gray-600 uppercase">Faltam R$ {((totalTarget ?? 0) - (totalSaved ?? 0)).toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </div>

                {/* Goals Grid */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-[0.2em] ml-2">Meus Objetivos</h3>

                    {goals.length === 0 ? (
                        <div className="py-20 text-center opacity-20">
                            <span className="material-symbols-outlined text-6xl mb-4">emoji_events</span>
                            <p className="font-bold">Você ainda não tem metas cadastradas.</p>
                            <p className="text-xs mt-1">Comece criando seu primeiro objetivo!</p>
                        </div>
                    ) : (
                        goals.map(goal => {
                            const progress = (goal.currentAmount / goal.targetAmount) * 100;
                            return (
                                <div key={goal.id} className="glass bg-white/[0.02] p-5 rounded-[32px] border border-white/5 group relative overflow-hidden transition-all hover:bg-white/[0.04]">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                                                <span className="material-symbols-outlined text-2xl">{goal.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white/90">{goal.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{goal.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white">R$ {(goal.currentAmount ?? 0).toLocaleString('pt-BR')}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Meta: R$ {(goal.targetAmount ?? 0).toLocaleString('pt-BR')}</p>
                                        </div>
                                    </div>

                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                                        <div
                                            className="h-full transition-all duration-700 shadow-lg"
                                            style={{
                                                width: `${Math.min(progress, 100)}%`,
                                                backgroundColor: goal.color,
                                                boxShadow: `0 0 15px ${goal.color}40`
                                            }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between pointer-events-none">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-xs text-gray-600">event</span>
                                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">
                                                {goal.deadline ? `Até ${new Date(goal.deadline).toLocaleDateString('pt-BR')}` : 'Sem prazo'}
                                            </p>
                                        </div>
                                        <p className="text-[10px] font-black uppercase" style={{ color: goal.color }}>{progress.toFixed(0)}%</p>
                                    </div>

                                    {/* Quick Actions Overlay (Hidden by default, shown on hover/touch) */}
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => setShowContribute(goal)}
                                            className="h-12 px-6 bg-white text-black font-black rounded-2xl text-xs uppercase tracking-widest flex items-center gap-2 active:scale-90 transition-all"
                                        >
                                            Contribuir <span className="material-symbols-outlined text-sm">add_circle</span>
                                        </button>
                                        <button
                                            onClick={() => onDeleteGoal(goal.id)}
                                            className="size-12 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-red-500/20"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Add Goal Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-[200] flex items-end animate-fadeIn">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAdd(false)}></div>
                    <div className="relative w-full bg-[#0a0f0c] rounded-t-[40px] p-8 pb-12 animate-slide-up border-t border-white/10">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
                        <h3 className="text-xl font-black mb-6">Novo Objetivo</h3>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Nome do Objetivo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Viagem Japão, Reserva de Emergência"
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold focus:border-primary outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Valor da Meta</label>
                                    <input
                                        type="number"
                                        value={target}
                                        onChange={e => setTarget(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-black text-primary outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Prazo (Opcional)</label>
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={e => setDeadline(e.target.value)}
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Categoria e Cor</label>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {['#19e65e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`size-10 shrink-0 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAddGoal}
                                className="w-full h-16 bg-primary text-[#0a0f0c] font-black rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all mt-4"
                            >
                                Começar Jornada <span className="material-symbols-outlined ml-2">rocket_launch</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contribute Modal */}
            {showContribute && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowContribute(null)}></div>
                    <div className="relative w-full max-w-sm bg-[#0e1411] rounded-[40px] p-8 border border-white/10 animate-scale-in">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="size-16 rounded-3xl flex items-center justify-center mb-4" style={{ backgroundColor: `${showContribute.color}20`, color: showContribute.color }}>
                                <span className="material-symbols-outlined text-4xl">{showContribute.icon}</span>
                            </div>
                            <h3 className="text-xl font-black">{showContribute.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Quanto quer guardar hoje?</p>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black text-lg">R$</span>
                                <input
                                    type="number"
                                    autoFocus
                                    value={contributionAmount}
                                    onChange={e => setContributionAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full h-20 bg-white/5 border border-white/10 rounded-3xl pl-14 pr-6 text-2xl font-black text-white focus:border-primary outline-none text-center"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setContributionAmount('50')}
                                    className="h-12 bg-white/5 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all border border-white/5"
                                >
                                    + R$ 50
                                </button>
                                <button
                                    onClick={() => setContributionAmount('100')}
                                    className="h-12 bg-white/5 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all border border-white/5"
                                >
                                    + R$ 100
                                </button>
                            </div>

                            <button
                                onClick={handleContribute}
                                style={{ backgroundColor: showContribute.color }}
                                className="w-full h-16 text-[#0a0f0c] font-black rounded-2xl shadow-xl active:scale-95 transition-all mt-2 flex items-center justify-center gap-2"
                            >
                                Confirmar Depósito <span className="material-symbols-outlined">payments</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalsView;
