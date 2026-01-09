
import React from 'react';
import { User } from '../types';

interface NavbarProps {
    user: User;
    onNavigate: (view: any) => void;
    showBalance: boolean;
    onToggleBalance: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, showBalance, onToggleBalance }) => {
    return (
        <header className="sticky top-0 z-20 flex items-center justify-between bg-background-dark/90 px-4 py-4 backdrop-blur-md border-b border-white/5 lg:px-6">
            <div className="flex items-center gap-3">
                <button onClick={() => onNavigate('SETTINGS')} className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 hover:border-primary transition-all group">
                    <img alt="User Avatar" className="h-full w-full object-cover group-hover:scale-110 transition-transform" src={user.avatar} />
                </button>
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-400">Olá,</span>
                    <span className="text-sm font-bold leading-tight">{user.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleBalance}
                    className="flex size-10 items-center justify-center rounded-full bg-surface-dark hover:bg-surface-dark-highlight text-slate-200 transition"
                >
                    <span className="material-symbols-outlined text-[22px]">{showBalance ? 'visibility' : 'visibility_off'}</span>
                </button>
                <button className="flex size-10 items-center justify-center rounded-full bg-surface-dark hover:bg-surface-dark-highlight text-slate-200 transition">
                    <span className="material-symbols-outlined text-[22px]">notifications</span>
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary ring-2 ring-[#112116]"></span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
