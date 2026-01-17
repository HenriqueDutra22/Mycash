
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const AuthView: React.FC = () => {
    console.log('🔑 AuthView is rendering!');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Confirme seu e-mail para ativar sua conta!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            console.error('Auth Error:', err);
            setError(err.message || 'Ocorreu um erro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f0c] p-6">
            <div className="w-full max-w-sm glass bg-white/[0.02] p-8 rounded-[32px] border-white/5 emerald-glow space-y-6 animate-slide-up">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-primary tracking-tighter">MyCash</h1>
                    <p className="text-gray-400 text-sm">{isSignUp ? 'Crie sua conta premium' : 'Bem-vindo de volta'}</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">E-mail</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">mail</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-primary/50 focus:ring-0 transition-all text-sm outline-none"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Senha</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">lock</span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-primary/50 focus:ring-0 transition-all text-sm outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-xs text-center font-medium font-display">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-[#0a0f0c] py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem uma conta? Cadastre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
