
import React from 'react';
import { ViewType, UserProfile } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (v: ViewType) => void;
  user: UserProfile;
  onPlusClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, user, onPlusClick }) => {
  const menuItems = [
    { id: 'HOME', icon: 'grid_view', label: 'Início' },
    { id: 'PLANNING', icon: 'event_repeat', label: 'Planos' },
    { id: 'GOALS', icon: 'emoji_events', label: 'Metas' },
    { id: 'ANALYTICS', icon: 'bar_chart', label: 'Análise' },
    { id: 'WALLET', icon: 'wallet', label: 'Cartões' },
    { id: 'PROFILE', icon: 'person', label: 'Perfil' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#0a0f0c] border-r border-white/10 sticky top-0 overflow-hidden">
      <div className="p-8">
        <h1 className="text-2xl font-black text-primary tracking-tighter">MyCash</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentView === item.id
                ? 'bg-primary text-[#0a0f0c] font-bold emerald-glow'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <span className={`material-symbols-outlined ${currentView === item.id ? 'filled' : ''}`} style={currentView === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {item.icon}
            </span>
            <span className="text-sm font-medium uppercase tracking-wider">{item.label}</span>
          </button>
        ))}

        <div className="pt-8 px-4">
          <button
            onClick={onPlusClick}
            className="w-full flex items-center justify-center gap-2 bg-primary text-[#0a0f0c] py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">add</span>
            Novo
          </button>
        </div>
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
          <img src={user.avatar} className="size-10 rounded-full border border-primary/20" alt="" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user.name}</p>
            <p className="text-[10px] text-gray-500 truncate uppercase mt-0.5">Premium Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
