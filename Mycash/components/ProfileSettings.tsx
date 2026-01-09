
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileSettingsProps {
    user: User;
    onSave: (updates: Partial<User>) => void;
    onBack: () => void;
    onLogout: () => void;
}

const ACCENT_COLORS = [
    { name: 'Esmeralda', color: '#22c55e' },
    { name: 'Safira', color: '#3b82f6' },
    { name: 'Ametista', color: '#a855f7' },
    { name: 'Ouro', color: '#eab308' },
    { name: 'Coral', color: '#f43f5e' },
];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onSave, onBack, onLogout }) => {
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar);
    const [paymentMethods, setPaymentMethods] = useState<string[]>(user.paymentMethods || ['Conta Corrente', 'Pix', 'Dinheiro']);
    const [monthlyLimit, setMonthlyLimit] = useState(user.monthlyLimit || 5000);
    const [accentColor, setAccentColor] = useState(user.accentColor || '#19e65e');
    const [privacyMode, setPrivacyMode] = useState(user.privacyMode || false);
    const [newMethod, setNewMethod] = useState('');

    const applyTempTheme = (color: string) => {
        setAccentColor(color);
        document.documentElement.style.setProperty('--primary', color);
        // Create a semi-transparent version for --primary-dark
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        document.documentElement.style.setProperty('--primary-dark', `rgba(${r}, ${g}, ${b}, 0.8)`);
    };

    const handleSave = () => {
        if (!name.trim()) return alert('O nome não pode estar vazio');
        onSave({
            name,
            avatar,
            paymentMethods,
            monthlyLimit,
            accentColor,
            privacyMode
        });
    };

    const addMethod = () => {
        if (!newMethod.trim()) return;
        if (paymentMethods.includes(newMethod.trim())) return alert('Este método já existe');
        setPaymentMethods([...paymentMethods, newMethod.trim()]);
        setNewMethod('');
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white p-4 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex items-center justify-between mb-10 max-w-2xl mx-auto w-full">
                <button onClick={onBack} className="flex items-center justify-center size-10 rounded-xl bg-surface-dark border border-white/5 text-white hover:bg-white/10 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black tracking-tighter uppercase">Configurações Premium</h1>
                    <p className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">Módulo de Personalização</p>
                </div>
                <div className="size-10"></div>
            </header>

            <main className="flex-1 max-w-2xl mx-auto w-full space-y-8 pb-32">
                {/* 1. Profile & Avatar */}
                <section className="bg-surface-dark/30 p-8 rounded-[32px] border border-white/5 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">account_circle</span>
                    </div>

                    <div className="flex flex-col items-center gap-6 mb-8">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-primary-dark rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative size-32 rounded-full border-4 border-surface-dark overflow-hidden shadow-2xl">
                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <button
                                onClick={() => {
                                    const url = prompt('URL da foto:', avatar);
                                    if (url) setAvatar(url);
                                }}
                                className="absolute bottom-1 right-1 size-10 rounded-full bg-primary text-black flex items-center justify-center shadow-lg border-4 border-background-dark hover:scale-110 active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-xl font-bold">edit</span>
                            </button>
                        </div>
                        <div className="text-center space-y-1">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent text-2xl font-black text-center border-none focus:ring-0 w-full"
                                placeholder="Seu Nome"
                            />
                            <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                        </div>
                    </div>
                </section>

                {/* 2. Meta Financeira (Surprise!) */}
                <section className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-[32px] border border-primary/10 backdrop-blur-sm">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-lg">track_changes</span>
                        Meta de Gasto Mensal
                    </h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-gray-400 font-bold uppercase">Seu Limite Ideal</span>
                            <span className="text-2xl font-black text-white">R$ {monthlyLimit.toLocaleString('pt-BR')}</span>
                        </div>
                        <input
                            type="range"
                            min="500"
                            max="20000"
                            step="100"
                            value={monthlyLimit}
                            onChange={(e) => setMonthlyLimit(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/5">
                            <p className="text-[10px] text-gray-400 leading-relaxed uppercase font-bold tracking-wider">
                                <span className="text-primary">DICA IA:</span> Com base em seus gastos, um limite de R$ {monthlyLimit} ajudará você a economizar 15% a mais este mês.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Personalização Visual (Surprise!) */}
                <section className="bg-surface-dark/30 p-8 rounded-[32px] border border-white/5 backdrop-blur-sm">
                    <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-lg">palette</span>
                        Pintura do App (Accent Color)
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {ACCENT_COLORS.map((c) => (
                            <button
                                key={c.color}
                                onClick={() => applyTempTheme(c.color)}
                                className={`size-12 rounded-2xl transition-all relative flex items-center justify-center ${accentColor === c.color ? 'scale-110 ring-2 ring-white ring-offset-4 ring-offset-background-dark shadow-xl' : 'hover:scale-105 opacity-60'}`}
                                style={{ backgroundColor: c.color }}
                            >
                                {accentColor === c.color && <span className="material-symbols-outlined text-black font-bold">check</span>}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 4. Segurança e Privacidade (Surprise!) */}
                <section className="bg-surface-dark/30 p-8 rounded-[32px] border border-white/5 backdrop-blur-sm">
                    <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-lg">security</span>
                        Segurança e Privacidade
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 rounded-2xl bg-white/5 cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold">Modo Fantasma (Privacy)</span>
                                <span className="text-[10px] text-gray-500 uppercase font-black">Esconde valores ao abrir o app</span>
                            </div>
                            <div
                                onClick={() => setPrivacyMode(!privacyMode)}
                                className={`w-12 h-6 rounded-full transition-all relative ${privacyMode ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 size-4 rounded-full bg-white transition-all ${privacyMode ? 'left-7' : 'left-1'}`}></div>
                            </div>
                        </label>

                        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
                            <div className="flex flex-col gap-1 text-left">
                                <span className="text-sm font-bold">Exportar Dados</span>
                                <span className="text-[10px] text-gray-500 uppercase font-black">Planilha Excel (.CSV)</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">download</span>
                        </button>
                    </div>
                </section>

                {/* 5. Meus Cartões */}
                <section className="bg-surface-dark/30 p-8 rounded-[32px] border border-white/5 backdrop-blur-sm">
                    <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-lg">credit_card</span>
                        Carteira de Cartões
                    </h3>
                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newMethod}
                            onChange={(e) => setNewMethod(e.target.value)}
                            placeholder="Novo cartão..."
                            className="flex-1 px-5 py-4 bg-background-dark/50 border border-white/10 rounded-2xl text-base focus:ring-1 focus:ring-primary outline-none"
                        />
                        <button onClick={addMethod} className="px-6 rounded-2xl bg-primary text-black font-black hover:brightness-110 transition-all">
                            ADD
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.map((m) => (
                            <div key={m} className="flex items-center justify-between p-4 bg-background-dark/30 rounded-2xl group border border-white/5">
                                <span className="text-xs font-bold truncate pr-2">{m}</span>
                                <button onClick={() => setPaymentMethods(paymentMethods.filter(x => x !== m))} className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="space-y-4 pt-10">
                    <button
                        onClick={handleSave}
                        className="w-full bg-primary hover:brightness-110 text-black font-black py-5 rounded-[28px] shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                    >
                        <span className="material-symbols-outlined font-black">done_all</span>
                        APLICAR TODAS AS MUDANÇAS
                    </button>

                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-[28px] border border-red-500/20 text-red-500 font-bold hover:bg-red-500/5 transition-all"
                    >
                        <span className="material-symbols-outlined">power_settings_new</span>
                        ENCERRAR SESSÃO
                    </button>
                </div>

                <p className="text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] py-10">
                    MyCash Pro v2.4.0 • 2026
                </p>
            </main>
        </div>
    );
};

export default ProfileSettings;
