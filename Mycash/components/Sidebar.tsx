
import React from 'react';

interface SidebarProps {
    onAddClick: () => void;
    onMenuClick: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddClick, onMenuClick }) => {
    return (
        <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-background-dark border-r border-white/5 px-4 py-6 z-30">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
                </div>
                <span className="text-xl font-black tracking-tighter text-white">MYCASH</span>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
                <button
                    onClick={() => onMenuClick('dashboard')}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary/10 text-primary transition-all text-left"
                >
                    <span className="material-symbols-outlined fill-1">dashboard</span>
                    <span className="text-sm font-bold">Visão Geral</span>
                </button>
                <button
                    onClick={() => onMenuClick('analytics')}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all text-left"
                >
                    <span className="material-symbols-outlined">query_stats</span>
                    <span className="text-sm font-bold">Análises</span>
                </button>
                <button
                    onClick={() => onMenuClick('wallet')}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all text-left"
                >
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                    <span className="text-sm font-bold">Minha Carteira</span>
                </button>
                <button
                    onClick={() => onMenuClick('settings')}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all text-left"
                >
                    <span className="material-symbols-outlined">person_settings</span>
                    <span className="text-sm font-bold">Meu Perfil</span>
                </button>
            </nav>

            <div className="mt-auto">
                <button
                    onClick={onAddClick}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black text-black transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-[22px]">add_circle</span>
                    NOVA TRANSAÇÃO
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
