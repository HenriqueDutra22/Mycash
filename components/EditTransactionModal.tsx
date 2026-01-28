import React, { useState } from 'react';
import { Transaction, PaymentMethod, TransactionType, Card } from '../types';
import { CATEGORIES } from '../constants';

interface EditTransactionModalProps {
    transaction: Transaction;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Transaction>) => void;
    onDelete: (id: string) => void;
    cards: Card[];
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, onClose, onSave, onDelete, cards }) => {
    const [description, setDescription] = useState(transaction.description);
    const [category, setCategory] = useState(transaction.category);
    const [isIncome, setIsIncome] = useState(transaction.amount > 0);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(transaction.cardId || null);

    const handleSave = () => {
        const selectedCat = CATEGORIES.find(c => c.label === category) || CATEGORIES[0];
        const finalAmount = isIncome ? Math.abs(transaction.amount) : -Math.abs(transaction.amount);

        onSave(transaction.id, {
            description,
            category: selectedCat.label,
            icon: selectedCat.icon,
            amount: finalAmount,
            type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
            cardId: selectedCardId || null
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end animate-fadeIn">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full bg-[#0a0f0c] rounded-t-[40px] p-8 pb-12 animate-slide-up border-t border-white/10 max-h-[90vh] overflow-y-auto">
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>

                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black">Editar Lançamento</h3>
                    <button
                        onClick={() => { if (window.confirm('Excluir este lançamento?')) { onDelete(transaction.id); onClose(); } }}
                        className="size-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col items-center">
                        <div className="flex bg-white/5 p-1 rounded-2xl mb-4 w-full max-w-[200px]">
                            <button
                                onClick={() => setIsIncome(false)}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isIncome ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}
                            >
                                Saída
                            </button>
                            <button
                                onClick={() => setIsIncome(true)}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isIncome ? 'bg-primary text-black border border-primary shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-400'}`}
                            >
                                Entrada
                            </button>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Valor do Lançamento</p>
                        <h4 className={`text-3xl font-black ${isIncome ? 'text-primary' : 'text-white'}`}>
                            {isIncome ? '+' : '-'} R$ {Math.abs(transaction.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h4>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Identificação</label>
                        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl h-16 px-5 focus-within:border-primary/50 transition-all">
                            <span className="material-symbols-outlined text-gray-600">edit_note</span>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ex: Almoço, Supermercado..."
                                className="w-full bg-transparent border-none outline-none text-sm font-bold text-white"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Categoria Corretiva</label>
                        <div className="grid grid-cols-3 gap-3">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.label)}
                                    className={`flex flex-col items-center justify-center gap-2 h-20 rounded-2xl border transition-all ${category === cat.label ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20' : 'bg-white/[0.03] border-white/5 text-gray-500 hover:bg-white/[0.06]'}`}
                                >
                                    <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                                    <span className="text-[8px] font-black uppercase tracking-tighter">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {cards.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Vincular Cartão</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                                <button
                                    onClick={() => setSelectedCardId(null)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${!selectedCardId ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-500 border-white/5'}`}
                                >
                                    Nenhum
                                </button>
                                {cards.map(card => (
                                    <button
                                        key={card.id}
                                        onClick={() => setSelectedCardId(card.id)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${selectedCardId === card.id ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-500 border-white/5'}`}
                                        style={selectedCardId === card.id ? { backgroundColor: card.color, color: 'white', borderColor: card.color } : {}}
                                    >
                                        <div className="size-1.5 rounded-full" style={{ backgroundColor: card.color }}></div>
                                        {card.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 h-16 bg-white/5 text-white font-black rounded-2xl active:scale-95 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] h-16 bg-primary text-[#0a0f0c] font-black rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditTransactionModal;
