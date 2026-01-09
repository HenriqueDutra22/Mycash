import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: (email: string) => void;
  onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && data.user.email) {
        onLogin(data.user.email);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
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
              <span className="material-symbols-outlined text-primary text-[40px] font-bold">account_balance_wallet</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black tracking-tighter text-white">MYCASH</h2>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Controle o seu futuro hoje</p>
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
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">E-mail de Acesso</label>
            <div className="relative group">
              <input
                className="form-input w-full rounded-2xl border border-white/10 bg-surface-dark/50 backdrop-blur-sm px-5 py-4 text-base text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="exemplo@mycash.com"
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
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Senha Privada</label>
            <div className="relative group">
              <input
                className="form-input w-full rounded-2xl border border-white/10 bg-surface-dark/50 backdrop-blur-sm px-5 py-4 pr-14 text-base text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button className="absolute right-0 top-0 h-full px-5 text-gray-500 hover:text-primary transition-colors flex items-center justify-center" type="button">
                <span className="material-symbols-outlined text-[22px]">lock_open</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end px-1">
            <a className="text-xs font-bold text-primary hover:brightness-110 transition-all uppercase tracking-tighter" href="#">
              Esqueci meus dados
            </a>
          </div>

          <button
            className="mt-4 w-full rounded-2xl bg-primary hover:brightness-110 text-black font-black text-base py-4 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? 'ENTRANDO...' : 'ENTRAR NA CONTA'}</span>
            {!loading && <span className="material-symbols-outlined text-[22px] font-bold">arrow_forward_ios</span>}
          </button>
        </form>

        {/* Social Login */}
        <div className="flex flex-col gap-6">
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Biometria ou Social</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="flex gap-4">
            <button className="flex flex-1 items-center justify-center h-14 rounded-2xl border border-white/5 bg-surface-dark/40 hover:bg-surface-dark transition-all active:scale-95">
              <span className="material-symbols-outlined text-white text-[24px]">fingerprint</span>
            </button>
            <button className="flex flex-1 items-center justify-center h-14 rounded-2xl border border-white/5 bg-surface-dark/40 hover:bg-surface-dark transition-all active:scale-95">
              <span className="material-symbols-outlined text-white text-[24px]">face</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            Sem cadastro?
            <button
              onClick={onRegisterClick}
              className="text-primary hover:underline underline-offset-4 ml-2 uppercase"
            >
              Criar acesso
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
