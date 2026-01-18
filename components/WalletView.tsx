
import React, { useState } from 'react';
import { Card } from '../types';

interface WalletViewProps {
    cards: Card[];
    onAddCard: (card: Omit<Card, 'id'>) => void;
    onDeleteCard: (id: string) => void;
    onBack: () => void;
}

const WalletView: React.FC<WalletViewProps> = ({ cards, onAddCard, onDeleteCard, onBack }) => {
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCard, setNewCard] = useState<Omit<Card, 'id'>>({
        name: '',
        lastDigits: '',
        brand: 'Visa',
        color: '#19e65e',
        type: 'BOTH'
    });

    const handleAddCard = () => {
        if (!newCard.name || !newCard.lastDigits) return;
        onAddCard(newCard);
        setShowAddCard(false);
        setNewCard({ name: '', lastDigits: '', brand: 'Visa', color: '#19e65e', type: 'BOTH' });
    };

    return (
        <div className="animate-fadeIn pb-32">
            <header className="sticky top-0 z-50 glass bg-[#0a0f0c]/60 backdrop-blur-xl px-6 py-6 flex items-center justify-between border-b border-white/5">
                <div className="flex flex-col">
                    <h2 className="text-xl font-black text-white/90">Meus Cartões</h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Gestão de Carteira Digital</p>
                </div>
                <button
                    onClick={() => setShowAddCard(true)}
                    className="size-11 flex items-center justify-center bg-primary text-[#0a0f0c] rounded-2xl active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined font-black">add</span>
                </button>
            </header>

            <main className="p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                    {cards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cards.map((card) => (
                                <div
                                    key={card.id}
                                    className="w-full h-52 rounded-[32px] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group border border-white/10"
                                    style={{
                                        background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                                    }}
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="w-12 h-8 bg-white/20 rounded-lg border border-white/30 relative overflow-hidden">
                                            <div className="absolute top-1/2 left-0 w-full h-px bg-white/20"></div>
                                            <div className="absolute top-0 left-1/2 w-px h-full bg-white/20"></div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-black text-white/60 mb-1">{card.brand}</span>
                                            <span className="material-symbols-outlined text-white/40 text-2xl">contactless</span>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <p className="text-xs font-black uppercase text-white/60 tracking-widest mb-1">{card.name}</p>
                                        <div className="flex items-end justify-between">
                                            <p className="text-2xl font-mono font-bold tracking-[0.2em] text-white">•••• {card.lastDigits}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onDeleteCard(card.id)}
                                        className="absolute top-6 right-6 size-10 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40"
                                    >
                                        <span className="material-symbols-outlined text-white text-lg">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 glass bg-white/[0.02] border-white/5 border border-dashed rounded-[40px] flex flex-col items-center justify-center gap-4 text-gray-600">
                            <span className="material-symbols-outlined text-5xl">credit_card_off</span>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-center">Sua carteira está vazia</p>
                            <button
                                onClick={() => setShowAddCard(true)}
                                className="mt-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary transition-all"
                            >
                                Adicionar Primeiro Cartão
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {showAddCard && (
                <div className="fixed inset-0 z-[200] flex items-end animate-fadeIn">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowAddCard(false)}></div>
                    <div className="relative w-full bg-[#0a0f0c] rounded-t-[40px] p-8 pb-12 animate-slide-up border-t border-white/10">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
                        <h3 className="text-2xl font-black mb-8">Novo Cartão</h3>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Identificação</label>
                                <input
                                    type="text"
                                    value={newCard.name}
                                    onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                                    placeholder="Ex: Nubank, Inter, Santander..."
                                    className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Últimos 4 Dígitos</label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={newCard.lastDigits}
                                        onChange={e => setNewCard({ ...newCard, lastDigits: e.target.value })}
                                        placeholder="0000"
                                        className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-mono font-bold tracking-widest"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Bandeira</label>
                                    <select
                                        className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold"
                                        value={newCard.brand}
                                        onChange={e => setNewCard({ ...newCard, brand: e.target.value })}
                                    >
                                        <option value="Visa">Visa</option>
                                        <option value="Mastercard">Mastercard</option>
                                        <option value="Elo">Elo</option>
                                        <option value="Amex">Amex</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Cor do Cartão</label>
                                <div className="flex gap-4 p-2">
                                    {['#19e65e', '#ffffff', '#eb4034', '#4287f5', '#9b42f5', '#f5a442'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setNewCard({ ...newCard, color: c })}
                                            className={`size-12 rounded-full border-4 transition-all ${newCard.color === c ? 'border-primary ring-4 ring-primary/20 bg-white' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAddCard}
                                className="w-full h-18 bg-primary text-[#0a0f0c] font-black rounded-[24px] shadow-xl shadow-primary/30 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3"
                            >
                                Confirmar Cadastro
                                <span className="material-symbols-outlined font-black">check_circle</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletView;
