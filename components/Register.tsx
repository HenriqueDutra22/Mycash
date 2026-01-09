import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface RegisterProps {
    onRegister: (name: string, email: string) => void;
    onLoginClick: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onLoginClick }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=000`
                    }
                }
            });

            if (error) throw error;

            if (data.user && data.user.email) {
                onRegister(name, data.user.email);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-6 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1920&h=1080"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm scale-105"
                    alt="background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-background-dark/80 to-background-dark"></div>
            </div>

            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

            <div className="w-full max-w-[400px] flex flex-col gap-10 z-10 animate-in fade-in zoom-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-dark rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-dark border border-white/10 shadow-2xl">
                            <span className="material-symbols-outlined text-primary text-[40px] font-bold">person_add</span>
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black tracking-tighter text-white">CRIAR CONTA</h2>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Comece a controlar suas finanças</p>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Nome Completo</label>
                        <div className="relative group">
                            <input
                                className="form-input w-full rounded-2xl border border-white/10 bg-surface-dark/50 backdrop-blur-sm px-5 py-4 text-base text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="Seu nome"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[22px]">person</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">E-mail</label>
                        <div className="relative group">
                            <input
                                className="form-input w-full rounded-2xl border border-white/10 bg-surface-dark/50 backdrop-blur-sm px-5 py-4 text-base text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="seu@email.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[22px]">alternate_email</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Senha</label>
                        <div className="relative group">
                            <input
                                className="form-input w-full rounded-2xl border border-white/10 bg-surface-dark/50 backdrop-blur-sm px-5 py-4 pr-14 text-base text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="••••••••"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Confirmar Senha</label>
                        <div className="relative group">
                            <input
                                className="form-input w-full rounded-2xl border border-white/10 bg-surface-dark/50 backdrop-blur-sm px-5 py-4 pr-14 text-base text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="••••••••"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        className="mt-4 w-full rounded-2xl bg-primary hover:brightness-110 text-black font-black text-base py-4 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading}
                    >
                        <span>{loading ? 'CRIANDO...' : 'CRIAR CONTA'}</span>
                        {!loading && <span className="material-symbols-outlined text-[22px] font-bold">arrow_forward_ios</span>}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                        Já tem conta?
                        <button
                            onClick={onLoginClick}
                            className="text-primary hover:underline underline-offset-4 ml-2 uppercase"
                        >
                            Acessar
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
