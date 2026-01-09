
import React from 'react';

interface BottomNavProps {
    onAddClick: () => void;
    onNavigate?: (view: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onAddClick, onNavigate }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[84px] items-start justify-around border-t border-white/5 bg-[#0c1810]/80 backdrop-blur-xl pt-4 pb-8 shadow-[0_-8px_30px_rgb(0,0,0,0.5)] lg:hidden">
            <button
                onClick={() => onNavigate?.('DASHBOARD')}
                className="group flex flex-col items-center gap-1.5 text-primary"
            >
                <div className="relative">
                    <span className="material-symbols-outlined fill-1 text-[28px]">dashboard</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">Início</span>
            </button>
            <button
                onClick={() => onNavigate?.('ANALYTICS')}
                className="group flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            >
                <span className="material-symbols-outlined text-[28px]">query_stats</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">Análise</span>
            </button>
            <div className="relative -top-3">
                <button
                    onClick={onAddClick}
                    className="flex size-14 items-center justify-center rounded-2xl bg-primary text-black shadow-xl shadow-primary/30 active:scale-90 transition-transform"
                >
                    <span className="material-symbols-outlined text-[32px] font-bold">add</span>
                </button>
            </div>
            <button
                onClick={() => onNavigate?.('WALLET')}
                className="group flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            >
                <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">Carteira</span>
            </button>
            <button className="group flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                <span className="material-symbols-outlined text-[28px]">settings</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">Ajustes</span>
            </button>
        </nav>
    );
};

export default BottomNav;
