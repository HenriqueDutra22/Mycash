
import React from 'react';

interface BalanceCardProps {
    balance: number;
    showBalance: boolean;
    onAddClick: () => void;
    onActionClick: (action: string) => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, showBalance, onAddClick, onActionClick }) => {
    return (
        <section className="px-4 py-4 lg:grid lg:grid-cols-2 lg:gap-6">
            <div className="relative w-full aspect-[1.8/1] overflow-hidden rounded-[24px] bg-gradient-to-br from-primary via-primary-dark to-surface-dark p-7 shadow-2xl shadow-primary/20 ring-1 ring-white/10 group lg:aspect-[2.2/1]">
                {/* Credit Card Pattern Background */}
                <img
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600&h=400"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                    alt="card-bg"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none"></div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold uppercase tracking-widest text-black/60">Saldo disponível</span>
                            <h1 className="text-4xl font-black tracking-tight text-black flex items-baseline gap-1">
                                {showBalance ? (
                                    <>
                                        <span className="text-2xl font-bold opacity-70">R$</span>
                                        <span>{balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split(',')[0]}</span>
                                        <span className="text-xl font-bold opacity-60">,{balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[1]}</span>
                                    </>
                                ) : (
                                    <span>••••••</span>
                                )}
                            </h1>
                        </div>
                        <span className="material-symbols-outlined text-black/80 text-3xl font-bold">contactless</span>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-bold uppercase text-black/50 tracking-tighter">Cartão Principal</p>
                            <p className="text-sm font-mono font-bold text-black/80">**** **** **** 8842</p>
                        </div>
                        <div className="bg-black/10 backdrop-blur-md px-3 py-1 rounded-full border border-black/5">
                            <p className="text-[10px] font-black text-black">MYCASH PLATINUM</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Visible only on mobile here, moved to Sidebar for desktop, but keeping some actions potentially available */}
            <div className="mt-6 grid grid-cols-2 gap-4 lg:mt-0 lg:flex lg:flex-col lg:justify-center">
                <button
                    onClick={onAddClick}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-black transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20 lg:hidden"
                >
                    <span className="material-symbols-outlined text-[22px]">add_circle</span>
                    NOVA TRANSAÇÃO
                </button>
                <button
                    onClick={() => onActionClick('reports')}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-surface-dark py-4 text-sm font-bold text-white ring-1 ring-white/10 transition-all hover:bg-surface-dark-highlight active:scale-95 lg:h-full"
                >
                    <span className="material-symbols-outlined text-[22px]">query_stats</span>
                    RELATÓRIOS
                </button>
                <button
                    onClick={() => onActionClick('export')}
                    className="hidden lg:flex items-center justify-center gap-2 rounded-2xl bg-surface-dark py-4 text-sm font-bold text-white ring-1 ring-white/10 transition-all hover:bg-surface-dark-highlight active:scale-95 lg:h-full"
                >
                    <span className="material-symbols-outlined text-[22px]">download</span>
                    EXPORTAR
                </button>
            </div>
        </section>
    );
};

export default BalanceCard;
