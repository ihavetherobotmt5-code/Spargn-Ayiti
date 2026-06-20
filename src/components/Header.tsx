import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TRANSLATIONS } from '../lib/translations';
import { PiggyBank, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'goals' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'goals' | 'settings') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { rates, language, userAvatar, showToast } = useAppContext();
  const t = TRANSLATIONS[language] || TRANSLATIONS.HT;

  return (
    <header className="fixed top-0 w-full z-40 bg-neutral-900/85 backdrop-blur-xl border-b border-white/10">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
        
        {/* Logo and Title */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-[#022c7a]/30 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:text-amber-300 group-hover:border-amber-400/50 transition-all shadow-[0_0_15px_rgba(242,202,80,0.1)]">
            <PiggyBank size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg md:text-xl text-amber-400 tracking-tight leading-none group-hover:text-amber-300 transition-colors neon-text-gold">
              {t.title}
            </h1>
            <span className="text-[10px] text-neutral-400 block mt-1 font-mono">
              1 USD ≈ {rates.USD} HTG
            </span>
          </div>
        </div>

        {/* Right Indicators */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => showToast(language === 'HT' ? 'Pa gen nouvo notifikasyon pou kounye a' : 'Pas de nouvelles notifications pour le moment', 'info')}
            className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-neutral-400 hover:text-amber-400 transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
          </button>
          
          {/* Avatar Profile Triggering Settings tab */}
          <div 
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 cursor-pointer group hover:opacity-90 active:scale-95 transition-all"
            title="Profil & Paramètres"
          >
            <div className={`w-9 h-9 rounded-full border ${activeTab === 'settings' ? 'border-amber-400' : 'border-white/15'} overflow-hidden bg-neutral-800 transition-all shadow-md`}>
              <img 
                className="w-full h-full object-cover" 
                alt="Portrait of Haitian entrepreneur" 
                src={userAvatar}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
