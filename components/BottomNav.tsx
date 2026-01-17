
import React from 'react';
import { ViewType } from '../types';

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (v: ViewType) => void;
  onPlusClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange, onPlusClick }) => {
  const tabs = [
    { id: 'HOME', icon: 'grid_view', label: 'Início' },
    { id: 'PLANNING', icon: 'event_repeat', label: 'Planos' },
    { id: 'GOALS', icon: 'emoji_events', label: 'Metas' },
    { id: 'PROFILE', icon: 'person', label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] h-16 glass bg-[#0a0f0c]/80 rounded-full px-2 flex items-center justify-between z-[100] emerald-glow lg:hidden">
      {tabs.slice(0, 2).map(tab => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id as ViewType)}
          className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${currentView === tab.id ? 'text-primary' : 'text-gray-500'}`}
        >
          <span className={`material-symbols-outlined ${currentView === tab.id ? 'filled font-bold' : ''}`} style={currentView === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
        </button>
      ))}

      <button
        onClick={onPlusClick}
        className="flex items-center justify-center size-12 bg-primary rounded-full -translate-y-4 shadow-2xl shadow-primary/40 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-[#0a0f0c] font-black text-2xl">add</span>
      </button>

      {tabs.slice(2, 4).map(tab => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id as ViewType)}
          className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${currentView === tab.id ? 'text-primary' : 'text-gray-500'}`}
        >
          <span className={`material-symbols-outlined ${currentView === tab.id ? 'filled font-bold' : ''}`} style={currentView === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
