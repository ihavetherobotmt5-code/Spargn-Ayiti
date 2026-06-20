import { useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { GoalDetail } from './pages/GoalDetail';
import { GoalsPage } from './pages/GoalsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddGoalDialog } from './components/AddGoalDialog';
import { AddContributionDialog } from './components/AddContributionDialog';
import { PinLockScreen } from './components/PinLockScreen';
import { PyasChatbot } from './components/PyasChatbot';
import { TRANSLATIONS } from './lib/translations';
import { LayoutDashboard, Target, Settings, Award } from 'lucide-react';

function AppContent() {
  const { language, isPinLockEnabled, isUnlocked } = useAppContext();
  const t = TRANSLATIONS[language] || TRANSLATIONS.HT;

  // Render Lock Screen if PIN Lock is enabled and user hasn't successfully unlocked yet
  if (isPinLockEnabled && !isUnlocked) {
    return <PinLockScreen />;
  }

  // Tabs navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'settings'>('dashboard');
  
  // Drill-down goal details ID state
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Dialog overlay management
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showQuickAddContrib, setShowQuickAddContrib] = useState(false);

  // Handle drilling selection of details
  const handleSelectGoal = (id: string) => {
    setSelectedGoalId(id);
    setActiveTab('goals');
  };

  // Nav handler
  const handleTabClick = (tab: 'dashboard' | 'goals' | 'settings') => {
    setActiveTab(tab);
    // When clicking any main tab, reset drill-down state so the tab loads from its main list view
    setSelectedGoalId(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col relative antialiased selection:bg-amber-500/30 selection:text-white">
      
      {/* Dynamic Background Atmospheric Lighting Glow */}
      <div className="fixed top-0 right-1/4 w-[450px] h-[450px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse duration-10000"></div>
      <div className="fixed bottom-12 left-1/4 w-[350px] h-[350px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse duration-[15000ms]"></div>

      {/* Corporate Header Nav */}
      <Header activeTab={activeTab} setActiveTab={handleTabClick} />

      {/* Main Container View Panel Area */}
      <main className="flex-grow pt-24 pb-32 px-4 md:px-6 w-full max-w-5xl mx-auto">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            onSelectGoal={handleSelectGoal}
            onOpenAddGoal={() => setShowAddGoal(true)}
            onOpenQuickAdd={() => setShowQuickAddContrib(true)}
          />
        )}

        {/* TAB 2: GOALS & DETAILS */}
        {activeTab === 'goals' && (
          selectedGoalId ? (
            <GoalDetail 
              goalId={selectedGoalId} 
              onBack={() => {
                setSelectedGoalId(null);
              }}
            />
          ) : (
            <GoalsPage 
              onSelectGoal={handleSelectGoal} 
              onOpenAddGoal={() => setShowAddGoal(true)} 
            />
          )
        )}

        {/* TAB 3: CONFIGURATIONS */}
        {activeTab === 'settings' && <SettingsPage />}

      </main>

      {/* FLOATING POPUP OVERLAYS */}
      <AddGoalDialog 
        open={showAddGoal} 
        onClose={() => setShowAddGoal(false)} 
      />

      <AddContributionDialog 
        open={showQuickAddContrib} 
        onClose={() => setShowQuickAddContrib(false)} 
      />

      {/* Floating AI Budgeting Companion */}
      <PyasChatbot />

      {/* BOTTOM TAB-BAR NAVIGATION PANEL */}
      <nav className="fixed bottom-0 w-full z-40 bg-neutral-900/90 backdrop-blur-xl border-t border-white/10 rounded-t-2xl shadow-2xl">
        <div className="flex justify-around items-center w-full h-20 max-w-lg mx-auto px-4 pb-safe">
          
          <button 
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all outline-none border-none cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'text-amber-400 font-bold bg-amber-500/5 px-5 py-2 border border-amber-500/10' 
                : 'text-neutral-400 hover:text-amber-400'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold tracking-wider mt-1.5 uppercase">
              Dashboard
            </span>
          </button>

          <button 
            onClick={() => handleTabClick('goals')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all outline-none border-none cursor-pointer ${
              activeTab === 'goals' 
                ? 'text-amber-400 font-bold bg-amber-500/5 px-5 py-2 border border-amber-500/10' 
                : 'text-neutral-400 hover:text-amber-400'
            }`}
          >
            <Target size={20} />
            <span className="text-[10px] font-bold tracking-wider mt-1.5 uppercase">
              Goals
            </span>
          </button>

          <button 
            onClick={() => handleTabClick('settings')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all outline-none border-none cursor-pointer ${
              activeTab === 'settings' 
                ? 'text-amber-400 font-bold bg-amber-500/5 px-5 py-2 border border-amber-500/10' 
                : 'text-neutral-400 hover:text-amber-400'
            }`}
          >
            <Settings size={20} />
            <span className="text-[10px] font-bold tracking-wider mt-1.5 uppercase">
              Settings
            </span>
          </button>

        </div>
      </nav>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
