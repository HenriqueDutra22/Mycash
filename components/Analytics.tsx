
import React, { useMemo } from 'react';
import { Transaction, User } from '../types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface AnalyticsProps {
    user: User;
    transactions: Transaction[];
    onBack: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ user, transactions, onBack }) => {
    // Basic Statistics
    const stats = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return {
            income,
            expense,
            balance: income - expense
        };
    }, [transactions]);

    // Monthly Data for Bar Chart
    const monthlyData = useMemo(() => {
        const data: Record<string, { name: string, income: number, expense: number }> = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            const key = `${date.getMonth()}-${date.getFullYear()}`;
            const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });

            if (!data[key]) {
                data[key] = { name: monthName, income: 0, expense: 0 };
            }

            if (t.type === 'income') {
                data[key].income += t.amount;
            } else {
                data[key].expense += t.amount;
            }
        });

        return Object.values(data).reverse(); // Show recent months
    }, [transactions]);

    // Comparison of Expenses by Category for Pie Chart
    const categoryData = useMemo(() => {
        const data: Record<string, number> = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            if (!data[t.category]) data[t.category] = 0;
            data[t.category] += t.amount;
        });

        return Object.keys(data).map(key => ({
            name: key,
            value: data[key]
        }));
    }, [transactions]);

    // Payment Method Data
    const paymentMethodData = useMemo(() => {
        const data: Record<string, number> = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const method = t.paymentMethod || 'Outros';
            if (!data[method]) data[method] = 0;
            data[method] += t.amount;
        });

        return Object.keys(data).map(key => ({
            name: key,
            value: data[key]
        }));
    }, [transactions]);

    const COLORS = ['#00E396', '#FF4560', '#FEB019', '#775DD0', '#546E7A'];

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white p-6 pb-24 overflow-y-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center size-10 rounded-xl bg-surface-dark hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black tracking-tight">Análise Financeira</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-surface-dark rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Entradas Totais</p>
                    <h3 className={`text-2xl font-black text-green-400 transition-all ${user.privacyMode ? 'blur-md select-none' : ''}`}>
                        R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                </div>
                <div className="bg-surface-dark rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Saídas Totais</p>
                    <h3 className={`text-2xl font-black text-red-400 transition-all ${user.privacyMode ? 'blur-md select-none' : ''}`}>
                        R$ {stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                </div>
                <div className="bg-surface-dark rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Balanço Líquido</p>
                    <h3 className={`text-2xl font-black text-primary transition-all ${user.privacyMode ? 'blur-md select-none' : ''}`}>
                        R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transition-all ${user.privacyMode ? 'blur-xl grayscale opacity-20 pointer-events-none select-none' : ''}`}>
                {/* Monthly Chart */}
                <div className="bg-surface-dark rounded-2xl p-6 border border-white/5 min-h-[300px]">
                    <h3 className="text-lg font-bold mb-6 text-gray-400 uppercase text-[10px] tracking-widest">Fluxo de Caixa Mensal</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} fill="none" />
                                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '8px' }}
                                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                                />
                                <Bar dataKey="income" name="Entradas" fill="#00E396" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Saídas" fill="#FF4560" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Pie Chart */}
                <div className="bg-surface-dark rounded-2xl p-6 border border-white/5 min-h-[300px]">
                    <h3 className="text-lg font-bold mb-6 text-gray-400 uppercase text-[10px] tracking-widest">Despesas por Categoria</h3>
                    <div className="h-[250px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '8px' }}
                                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {user.privacyMode && (
                <div className="text-center py-20 bg-surface-dark border border-white/5 rounded-[32px] mb-8">
                    <span className="material-symbols-outlined text-4xl text-primary/40 mb-4 scale-150">visibility_off</span>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Modo Privacidade Ativado</p>
                    <p className="text-xs text-gray-600 mt-2">Desative o "Modo Fantasma" nas configurações para ver os gráficos.</p>
                </div>
            )}

            {!user.privacyMode && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Methods Chart */}
                    <div className="bg-surface-dark rounded-2xl p-6 border border-white/5 min-h-[300px]">
                        <h3 className="text-lg font-bold mb-6 text-gray-400 uppercase text-[10px] tracking-widest">Gastos por Cartão/Método</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={paymentMethodData} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} fill="none" />
                                    <XAxis type="number" stroke="#666" fontSize={10} tickLine={false} axisLine={false} hide />
                                    <YAxis dataKey="name" type="category" stroke="#E2E8F0" fontSize={10} tickLine={false} axisLine={false} width={80} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '8px' }}
                                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']}
                                    />
                                    <Bar dataKey="value" fill="#FEB019" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Future Debts */}
                    <div className="bg-surface-dark rounded-2xl p-6 border border-white/5">
                        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Próximos Vencimentos</h3>
                        <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {transactions.filter(t => t.type === 'expense' && t.date > new Date().toISOString().split('T')[0]).length > 0 ? (
                                transactions
                                    .filter(t => t.type === 'expense' && t.date > new Date().toISOString().split('T')[0])
                                    .sort((a, b) => a.date.localeCompare(b.date))
                                    .slice(0, 5)
                                    .map(debt => (
                                        <div key={debt.id} className="flex items-center justify-between p-3 rounded-xl bg-background-dark border border-white/5 hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center size-9 rounded-lg bg-red-500/10 text-red-500">
                                                    <span className="material-symbols-outlined text-sm font-bold">{debt.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[11px] leading-none mb-1">{debt.title}</p>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase">{new Date(debt.date + 'T12:00:00').toLocaleDateString('pt-BR')} • {debt.paymentMethod}</p>
                                                </div>
                                            </div>
                                            <span className="font-black text-red-400 text-[11px]">- R$ {debt.amount.toLocaleString('pt-BR')}</span>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center py-8 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                                    Nenhum vencimento próximo
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
