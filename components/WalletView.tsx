
import React, { useState } from 'react';
import { Card, Transaction, TransactionType, PaymentMethod } from '../types';
import { CATEGORIES } from '../constants';

interface WalletViewProps {
    cards: Card[];
    onAddCard: (card: Omit<Card, 'id'>) => void;
    onDeleteCard: (id: string) => void;
    onBack: () => void;
    onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
    transactions: Transaction[];
}

const WalletView: React.FC<WalletViewProps> = ({ cards, onAddCard, onDeleteCard, onBack, onAddTransaction, transactions }) => {
    const [showAddCard, setShowAddCard] = useState(false);
    const [showAddPurchase, setShowAddPurchase] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    const [newCard, setNewCard] = useState<Omit<Card, 'id'>>({
        name: '',
        lastDigits: '',
        brand: 'Visa',
        color: '#19e65e',
        type: 'BOTH'
    });

    const [purchaseForm, setPurchaseForm] = useState({
        description: '',
        amount: '0,00',
        category: 'shopping',
        date: new Date().toISOString().split('T')[0],
        installments: 1,
        type: TransactionType.EXPENSE
    });

    const handleAddCard = async () => {
        if (!newCard.name || !newCard.lastDigits) return;
        await onAddCard(newCard);
        setShowAddCard(false);
        setNewCard({ name: '', lastDigits: '', brand: 'Visa', color: '#19e65e', type: 'BOTH' });
    };

    const handleAddPurchase = () => {
        const cleanAmountStr = purchaseForm.amount.replace(/\./g, '').replace(',', '.');
        const isIncome = purchaseForm.type === TransactionType.INCOME;
        const numericAmount = parseFloat(cleanAmountStr) * (isIncome ? 1 : -1);

        if (isNaN(numericAmount) || numericAmount === 0 || !selectedCardId) {
            alert('Por favor, insira um valor válido.');
            return;
        }

        const selectedCat = CATEGORIES.find(c => c.id === purchaseForm.category) || CATEGORIES[0];

        onAddTransaction({
            description: purchaseForm.description || 'Compra no Cartão',
            amount: numericAmount,
            date: purchaseForm.date,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            category: selectedCat.label,
            type: purchaseForm.type,
            icon: selectedCat.icon,
            paymentMethod: PaymentMethod.CREDIT,
            cardId: selectedCardId,
            installments: purchaseForm.installments > 1 ? {
                current: 1,
                total: purchaseForm.installments
            } : undefined
        });

        setShowAddPurchase(false);
        setPurchaseForm({
            description: '',
            amount: '0,00',
            category: 'shopping',
            date: new Date().toISOString().split('T')[0],
            installments: 1
        });
    };

    const getCardTransactions = (cardId: string) => {
        return transactions.filter(t => t.cardId === cardId).slice(0, 3);
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

                                            <button
                                                onClick={() => {
                                                    setSelectedCardId(card.id);
                                                    setShowAddPurchase(true);
                                                }}
                                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                                Compra
                                            </button>
                                        </div>
                                    </div>

                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
                                        <button
                                            onClick={() => onDeleteCard(card.id)}
                                            className="size-10 bg-black/20 rounded-full flex items-center justify-center hover:bg-red-500/40 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-white text-lg">delete</span>
                                        </button>
                                    </div>

                                    {/* Sub-lista de compras se houver */}
                                    <div className="absolute bottom-0 left-0 w-full px-8 py-2 bg-black/10 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform">
                                        <div className="flex justify-between items-center h-8">
                                            <span className="text-[8px] font-black uppercase text-white/40">Últimas Movimentações</span>
                                            <div className="flex -space-x-1">
                                                {getCardTransactions(card.id).map((t, i) => (
                                                    <div key={t.id} className="size-4 rounded-full bg-white/10 flex items-center justify-center border border-white/5" title={t.description}>
                                                        <span className="material-symbols-outlined text-[10px] text-white/60">{t.icon}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
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

            {showAddPurchase && (
                <div className="fixed inset-0 z-[200] flex items-end animate-fadeIn">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowAddPurchase(false)}></div>
                    <div className="relative w-full bg-[#0a0f0c] rounded-t-[40px] p-8 pb-12 animate-slide-up border-t border-white/10">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
                        <h3 className="text-2xl font-black mb-1">Nova Compra</h3>
                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-8">No cartão: {cards.find(c => c.id === selectedCardId)?.name}</p>

                        <div className="flex flex-col gap-6">
                            <div className="flex bg-white/5 p-1 rounded-2xl mb-2 w-full max-w-[200px] mx-auto">
                                <button
                                    onClick={() => setPurchaseForm({ ...purchaseForm, type: TransactionType.EXPENSE })}
                                    className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${purchaseForm.type === TransactionType.EXPENSE ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500'}`}
                                >
                                    Saída
                                </button>
                                <button
                                    onClick={() => setPurchaseForm({ ...purchaseForm, type: TransactionType.INCOME })}
                                    className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${purchaseForm.type === TransactionType.INCOME ? 'bg-primary text-black' : 'text-gray-500'}`}
                                >
                                    Entrada
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Descrição</label>
                                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl h-14 px-5 focus-within:border-primary/50 transition-all">
                                        <span className="material-symbols-outlined text-gray-500">shopping_bag</span>
                                        <input
                                            type="text"
                                            value={purchaseForm.description}
                                            onChange={e => setPurchaseForm({ ...purchaseForm, description: e.target.value })}
                                            placeholder="Ex: Supermercado, Amazon..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-white placeholder:text-gray-700"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Valor</label>
                                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl h-14 px-5 focus-within:border-primary/50 transition-all">
                                            <span className="text-xs font-black text-primary">R$</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={purchaseForm.amount}
                                                onChange={e => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    const numericValue = parseInt(value || '0', 10) / 100;
                                                    const formatted = numericValue.toLocaleString('pt-BR', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    });
                                                    setPurchaseForm({ ...purchaseForm, amount: formatted });
                                                }}
                                                className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Parcelas</label>
                                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl h-14 px-5 focus-within:border-primary/50 transition-all">
                                            <span className="material-symbols-outlined text-gray-500 text-sm">reorder</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="48"
                                                value={purchaseForm.installments}
                                                onChange={e => setPurchaseForm({ ...purchaseForm, installments: parseInt(e.target.value) || 1 })}
                                                className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Categoria</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setPurchaseForm({ ...purchaseForm, category: cat.id })}
                                                className={`flex-none px-5 py-3 rounded-2xl border transition-all flex items-center gap-2 ${purchaseForm.category === cat.id ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                            >
                                                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Data da Compra</label>
                                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl h-14 px-5 transition-all">
                                        <span className="material-symbols-outlined text-gray-500">calendar_today</span>
                                        <input
                                            type="date"
                                            value={purchaseForm.date}
                                            onChange={e => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                                            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-white [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAddPurchase}
                                className="w-full h-16 bg-primary text-[#0a0f0c] font-black rounded-[24px] shadow-xl shadow-primary/30 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3"
                            >
                                Registrar Compra
                                <span className="material-symbols-outlined font-black text-xl">add_shopping_cart</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletView;
