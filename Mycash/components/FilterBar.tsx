
import React from 'react';

interface FilterBarProps {
    filter: 'all' | 'income' | 'expense';
    setFilter: (filter: 'all' | 'income' | 'expense') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter }) => {
    return (
        <section className="sticky top-[76px] z-10 bg-background-dark py-3 lg:top-0 lg:pt-0">
            <div className="flex w-full items-center gap-2 overflow-x-auto px-4 pb-2 no-scrollbar lg:px-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`flex h-10 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${filter === 'all' ? 'bg-primary text-black' : 'bg-surface-dark text-slate-400 ring-1 ring-white/10'}`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setFilter('income')}
                    className={`flex h-10 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${filter === 'income' ? 'bg-[#244730] text-primary ring-1 ring-primary/20' : 'bg-surface-dark text-slate-400 ring-1 ring-white/10'}`}
                >
                    Entradas
                </button>
                <button
                    onClick={() => setFilter('expense')}
                    className={`flex h-10 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${filter === 'expense' ? 'bg-red-900/20 text-red-400 ring-1 ring-red-400/20' : 'bg-surface-dark text-slate-400 ring-1 ring-white/10'}`}
                >
                    Saídas
                </button>
            </div>
        </section>
    );
};

export default FilterBar;
