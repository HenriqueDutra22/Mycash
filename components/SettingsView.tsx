
import React, { useState } from 'react';
import { UserProfile, Card, Transaction } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
  cards: Card[];
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onDeleteCard: (id: string) => void;
  onSignOut: () => void;
  transactions?: Transaction[];
  resetData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateProfile, onBack, cards, onAddCard, onDeleteCard, onSignOut, transactions = [], resetData }) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingField, setEditingField] = useState<'name' | 'limit' | 'avatar' | 'color' | null>(null);
  const [editValue, setEditValue] = useState('');

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

  const startEditing = (field: 'name' | 'limit' | 'avatar' | 'color', value: string | number) => {
    setEditingField(field);
    setEditValue(String(value));
  };

  const saveEdit = (overrideValue?: string) => {
    if (!editingField) return;

    const updates: Partial<UserProfile> = {};
    const finalValue = overrideValue || editValue;

    if (editingField === 'name') updates.name = finalValue;
    if (editingField === 'avatar') updates.avatar = finalValue;
    if (editingField === 'limit') updates.monthlyLimit = Number(finalValue);
    if (editingField === 'color') updates.accentColor = finalValue;

    onUpdateProfile(updates);
    setEditingField(null);
  };

  return (
    <div className="animate-fadeIn pb-32">
      <header className="sticky top-0 z-50 glass bg-[#0a0f0c]/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-all active:scale-95">
          <span className="material-symbols-outlined text-white">chevron_left</span>
        </button>
        <h2 className="text-lg font-black tracking-tight uppercase tracking-[0.2em]">Configurações</h2>
        <div className="size-10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined filled">settings</span>
        </div>
      </header>

      <main className="p-6 flex flex-col gap-10">
        {/* Profile Premium Section */}
        <section className="relative glass bg-gradient-to-b from-white/[0.05] to-transparent rounded-[32px] p-8 border border-white/5 overflow-hidden">
          <div className="absolute -right-10 -top-10 size-40 bg-primary/10 rounded-full blur-[80px]"></div>

          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className="relative group cursor-pointer" onClick={() => startEditing('avatar', user.avatar)}>
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-500"></div>
              <div className="size-32 rounded-full border-4 border-primary/20 p-1 relative overflow-hidden">
                <img src={user.avatar} className="w-full h-full rounded-full object-cover shadow-2xl" alt="Profile" />
                <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">edit</span>
                </button>
              </div>
            </div>

            <div className="text-center group cursor-pointer" onClick={() => startEditing('name', user.name)}>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-2xl font-black text-white/90 group-hover:text-primary transition-colors">{user.name}</h3>
                <span className="material-symbols-outlined text-white/20 group-hover:text-primary text-sm">edit</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">{user.email}</p>
            </div>

            <div className="flex gap-4 w-full">
              <div className="flex-1 bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center justify-center gap-1.5">
                  <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs font-black text-primary uppercase">Premium</span>
                </div>
              </div>
              <div className="flex-1 bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Última Importação</p>
                <p className="text-[10px] font-black text-white uppercase break-words">
                  {user.lastImportAt
                    ? new Date(user.lastImportAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : 'Nunca'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Digital Wallet - Cards */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-center px-1">
            <div className="flex flex-col">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Carteira Digital</h4>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{cards.length} Cartões Ativos</p>
            </div>
            <button
              onClick={() => setShowAddCard(true)}
              className="size-11 flex items-center justify-center bg-primary/10 text-primary rounded-2xl border border-primary/20 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">add_card</span>
            </button>
          </div>

          <div className="flex flex-col -gap-20">
            {cards.length > 0 ? (
              cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="relative transition-all duration-500 hover:-translate-y-8 cursor-pointer h-48"
                  style={{
                    zIndex: cards.length - idx,
                    marginTop: idx === 0 ? 0 : '-110px'
                  }}
                >
                  <div
                    className="w-full h-full rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                    }}
                  >
                    {/* Chip and Signal */}
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-7 bg-white/20 rounded-md border border-white/30 relative overflow-hidden">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/20"></div>
                        <div className="absolute top-0 left-1/2 w-px h-full bg-white/20"></div>
                      </div>
                      <span className="material-symbols-outlined text-white/40 text-2xl">contactless</span>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">{card.name}</p>
                      <div className="flex items-end justify-between">
                        <p className="text-xl font-mono font-bold tracking-[0.2em] text-white">•••• •••• •••• {card.lastDigits}</p>
                        <span className="text-sm font-black italic text-white opacity-80 uppercase">{card.brand}</span>
                      </div>
                    </div>

                    {/* Delete Toggle Tooltip-like button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteCard(card.id); }}
                      className="absolute top-4 right-4 size-8 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
                    >
                      <span className="material-symbols-outlined text-white text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-40 glass bg-white/[0.02] border-white/5 border border-dashed rounded-[32px] flex flex-col items-center justify-center gap-3 text-gray-600">
                <span className="material-symbols-outlined text-3xl">credit_card_off</span>
                <p className="text-xs font-bold uppercase tracking-widest text-center">Nenhum cartão na carteira</p>
              </div>
            )}
          </div>
        </section>

        {/* Global Finance Config */}
        <section className="flex flex-col gap-6">
          <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] px-1">DNA Financeiro</h4>

          <div className="glass bg-white/[0.02] rounded-3xl p-6 border border-white/5 flex flex-col gap-8">
            <div className="flex flex-col gap-4 cursor-pointer group" onClick={() => startEditing('limit', user.monthlyLimit)}>
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Meta de Gasto Mensal</p>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-primary text-xs">edit</span>
                  </div>
                  <h5 className="text-2xl font-black group-hover:text-primary transition-colors">R$ {(user.monthlyLimit ?? 0).toLocaleString('pt-BR')}</h5>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Saldo do Limite</p>
                  <p className="text-sm font-bold text-gray-400">R$ {((user.monthlyLimit ?? 0) * 0.4).toLocaleString('pt-BR')} livre</p>
                </div>
              </div>

              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(25,230,94,0.4)]" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => startEditing('color', user.accentColor)}
                className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all border border-white/5 w-full group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                    <span className="material-symbols-outlined text-xl">palette</span>
                  </div>
                  <span className="text-sm font-bold text-left">Cor de Destaque</span>
                </div>
                <div className="size-6 rounded-full ring-2 ring-white/10 shadow-lg" style={{ backgroundColor: user.accentColor }}></div>
              </button>

              <button
                onClick={() => {
                  if (transactions.length === 0) {
                    alert('Nenhuma transação para exportar.');
                    return;
                  }

                  // Simple CSV Generation
                  const header = ["Data", "Descrição", "Valor", "Categoria", "Tipo", "Método"];
                  const rows = transactions.map(t => [
                    t.date,
                    t.description.replace(/,/g, ''), // Avoid CSV breakage
                    t.amount.toFixed(2),
                    t.category,
                    t.type,
                    t.paymentMethod || 'N/A'
                  ]);

                  const csvContent = "data:text/csv;charset=utf-8,"
                    + [header.join(','), ...rows.map(e => e.join(','))].join("\n");

                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `mycash_export_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all border border-white/5 w-full group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="size-10 rounded-xl bg-white/5 text-gray-400 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                    <span className="material-symbols-outlined text-xl">download</span>
                  </div>
                  <span className="text-sm font-bold text-left text-gray-400 group-hover:text-white transition-colors">Exportar Dados (CSV)</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={onSignOut}
            className="w-full h-16 bg-white/[0.03] border border-white/5 text-gray-500 font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            Sair da Conta
          </button>

          <button
            onClick={() => {
              if (window.confirm("ATENÇÃO: Isso apagará TODOS os seus lançamentos, cartões e metas. Essa ação NÃO pode ser desfeita. Tem certeza?")) {
                resetData();
              }
            }}
            className="w-full h-12 bg-red-500/5 border border-red-500/20 text-red-500 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all mt-4 hover:bg-red-500/10"
          >
            <span className="material-symbols-outlined">delete_forever</span>
            Zerar/Excluir Todos os Dados
          </button>

          <p className="text-center text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] py-4">
            MyCash Premium v1.2.0 • 2026
          </p>
        </div>
      </main>

      {/* Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 z-[200] flex items-end animate-fadeIn">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setEditingField(null)}></div>
          <div className="relative w-full bg-[#0a0f0c] rounded-t-[40px] p-8 pb-12 animate-slide-up border-t border-white/10">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>

            <h3 className="text-xl font-black mb-8">
              {editingField === 'name' ? 'Editar Nome' :
                editingField === 'limit' ? 'Editar Limite Mensal' :
                  editingField === 'color' ? 'Escolha sua Cor' : 'Editar URL do Avatar'}
            </h3>

            <div className="flex flex-col gap-6">
              {editingField === 'color' ? (
                <div className="grid grid-cols-4 gap-4">
                  {['#19e65e', '#ffffff', '#eb4034', '#4287f5', '#9b42f5', '#f5a442', '#e619d0', '#19e6d9'].map(c => (
                    <button
                      key={c}
                      onClick={() => saveEdit(c)}
                      className={`aspect-square rounded-2xl border-2 transition-all flex items-center justify-center ${editValue === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: c }}
                    >
                      {editValue === c && <span className="material-symbols-outlined text-black font-bold">check</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">
                      {editingField === 'limit' ? 'Novo Valor (R$)' : 'Novo Valor'}
                    </label>
                    <input
                      type={editingField === 'limit' ? 'number' : 'text'}
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      autoFocus
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold"
                    />
                  </div>

                  <button
                    onClick={() => saveEdit()}
                    className="w-full h-16 bg-primary text-[#0a0f0c] font-black rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all mt-4"
                  >
                    Salvar Alterações
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 z-[200] flex items-end animate-fadeIn">
          {/* Existing Add Card Modal Content */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowAddCard(false)}></div>
          <div className="relative w-full bg-[#0a0f0c] rounded-t-[40px] p-8 pb-12 animate-slide-up border-t border-white/10">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>

            <h3 className="text-xl font-black mb-8">Novo Cartão Físico</h3>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Nome de Identificação</label>
                <input
                  type="text"
                  value={newCard.name}
                  onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                  placeholder="Ex: Nubank, Inter, Santander..."
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold"
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
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-mono font-bold tracking-widest"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Bandeira</label>
                  <select
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold"
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
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Estilo Visual</label>
                <div className="flex gap-3 px-1 py-1">
                  {['#19e65e', '#ffffff', '#eb4034', '#4287f5', '#9b42f5', '#f5a442'].map(c => (
                    <button
                      key={c}
                      onClick={() => setNewCard({ ...newCard, color: c })}
                      className={`size-10 rounded-full border-2 transition-all ${newCard.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddCard}
                className="w-full h-16 bg-primary text-[#0a0f0c] font-black rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all mt-4"
              >
                Cadastrar Cartão <span className="material-symbols-outlined ml-2">check_circle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
