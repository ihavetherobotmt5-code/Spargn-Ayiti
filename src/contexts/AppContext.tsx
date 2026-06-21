import React, { createContext, useContext, useState, useEffect } from 'react';
import { Goal, Contribution, ExchangeRates, LanguageCode, CurrencyCode, ContributionFrequency, IncomeTransaction, BudgetEnvelope, DistributionProfile, IncomeSource } from '../types';
import { FinancialEngine, DEFAULT_ENVELOPES, DEFAULT_PROFILES } from '../lib/FinancialEngine';

interface AppContextType {
  goals: Goal[];
  completedGoals: Goal[];
  contributions: Record<string, Contribution[]>;
  rates: ExchangeRates;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdDate' | 'status'>) => Goal;
  markGoalAsCompleted: (
    goalId: string,
    completionReason?: string,
    completionType?: 'realized' | 'closed',
    completionPercentage?: number,
    daysSavedAhead?: number
  ) => void;
  reopenGoal: (goalId: string) => void;
  deleteGoal: (goalId: string, isCompleted?: boolean) => void;
  addContribution: (goalId: string, contribution: Omit<Contribution, 'id'>) => Contribution;
  deleteContribution: (goalId: string, contribId: string) => void;
  updateRates: (rates: ExchangeRates) => void;
  exportDataJSON: () => void;
  exportDataCSV: () => void;
  importData: (jsonString: string) => boolean;
  clearAllData: () => void;
  userName: string;
  userAvatar: string;
  updateProfile: (name: string, avatar: string) => void;
  isPinLockEnabled: boolean;
  setPinLockEnabled: (enabled: boolean) => void;
  pinCode: string;
  setPinCode: (pin: string) => void;
  isUnlocked: boolean;
  setIsUnlocked: (unlocked: boolean) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // --- Budget Intelligent ---
  envelopes: BudgetEnvelope[];
  profiles: DistributionProfile[];
  incomeTransactions: IncomeTransaction[];
  activeProfileId: string;
  financialHealthScore: number;
  availableFunds: number;
  setAvailableFunds: React.Dispatch<React.SetStateAction<number>>;
  addEnvelope: (name: string, nameKreyol: string, icon: string, initialAllocated: number, extra?: Partial<BudgetEnvelope>) => void;
  deleteEnvelope: (id: string) => void;
  updateEnvelopeDeposit: (id: string, newAllocated: number) => void;
  setEnvelopes: React.Dispatch<React.SetStateAction<BudgetEnvelope[]>>;
  addIncomeTransaction: (transaction: Omit<IncomeTransaction, 'id' | 'splits'>, autoSplit?: boolean) => void;
  addEnvelopeExpense: (envelopeId: string, amount: number, note?: string) => void;
  transferFonDegaje: (sourceId: string, destId: string, amount: number) => void;
  updateProfilePercentages: (profileId: string, percentages: Record<string, number>) => void;
  setActiveProfileId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'spargn_ayiti_secure_v2';

const DEFAULT_RATES: ExchangeRates = {
  USD: 130,
  HTG: 1,
  EUR: 141,
  USDT: 130,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [contributions, setContributions] = useState<Record<string, Contribution[]>>({});
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES);
  const [language, setLanguage] = useState<LanguageCode>('HT');
  const [userName, setUserName] = useState<string>("Jean-Robert L'Ouverture");
  const [userAvatar, setUserAvatar] = useState<string>("https://lh3.googleusercontent.com/aida-public/AB6AXuASZfbYFSGky0hlFIES1mhVDDKA9MytGAuPtQArL2ivbgyThhmS1VHY9uf7p6XoOmelOtSA5dBhHG6g3gj79xhIsa6wiNALu3yw__mtPY3ycXZlqaXZEMCkqYEX4YdCOIxLSq-yn9XhUDkEiMgyDZhr-Jv0utVxoz5FeEgFl49_icVFrav2JyR7TNSDpej-PTjnMf_PBS5WkWza_bm7Tt1RXoACU8zTwOG42dY6okVlUXt9kBTU4eYhEq-RJlfowpT3zbpnxqucQ06p");
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Budget Intelligent State v1.3 ---
  const [envelopes, setEnvelopes] = useState<BudgetEnvelope[]>(DEFAULT_ENVELOPES);
  const [profiles, setProfiles] = useState<DistributionProfile[]>(DEFAULT_PROFILES);
  const [incomeTransactions, setIncomeTransactions] = useState<IncomeTransaction[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('normal');
  const [availableFunds, setAvailableFunds] = useState<number>(10500);

  const [isPinLockEnabled, setPinLockEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return !!data.isPinLockEnabled;
      }
    } catch (_) {}
    return false;
  });

  const [pinCode, setPinCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.pinCode || '';
      }
    } catch (_) {}
    return '';
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Derived financial health score
  const financialHealthScore = FinancialEngine.calculateFinancialHealthScore(
    envelopes,
    incomeTransactions,
    contributions
  );

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.goals) {
          const loadedGoals = data.goals.map((g: any) => ({
            ...g,
            startDate: g.startDate || g.createdDate?.split('T')[0] || new Date().toISOString().split('T')[0],
            endDate: g.endDate || g.targetDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            targetDate: g.targetDate || g.endDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }));
          setGoals(loadedGoals);
        }
        if (data.completedGoals) {
          const loadedCompGoals = data.completedGoals.map((g: any) => ({
            ...g,
            startDate: g.startDate || g.createdDate?.split('T')[0] || new Date().toISOString().split('T')[0],
            endDate: g.endDate || g.targetDate || new Date().toISOString().split('T')[0],
            targetDate: g.targetDate || g.endDate || new Date().toISOString().split('T')[0],
          }));
          setCompletedGoals(loadedCompGoals);
        }
        if (data.contributions) setContributions(data.contributions);
        if (data.rates) setRates(data.rates);
        if (data.language) setLanguage(data.language);
        if (data.userName) setUserName(data.userName);
        if (data.userAvatar) setUserAvatar(data.userAvatar);
        if (data.isPinLockEnabled !== undefined) setPinLockEnabled(data.isPinLockEnabled);
        if (data.pinCode !== undefined) setPinCode(data.pinCode);
        
        // --- Budget Intelligent ---
        if (data.envelopes) setEnvelopes(data.envelopes);
        if (data.profiles) setProfiles(data.profiles);
        if (data.incomeTransactions) setIncomeTransactions(data.incomeTransactions);
        if (data.activeProfileId) setActiveProfileId(data.activeProfileId);
        if (data.availableFunds !== undefined) setAvailableFunds(data.availableFunds);
      } catch (e) {
        console.error('Failed to parse storage data:', e);
      }
    } else {
      // Seed initial dummy goals for pristine first impressions if empty
      const initialGoalId1 = 'g_seed_1';
      const initialGoalId2 = 'g_seed_2';
      
      const seedGoals: Goal[] = [
        {
          id: initialGoalId1,
          name: 'Maison de Rêve',
          targetAmount: 5000000,
          currency: 'HTG',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year out
          targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year out
          frequency: 'MONTHLY',
          icon: 'house',
          createdDate: new Date().toISOString(),
          status: 'active',
        },
        {
          id: initialGoalId2,
          name: 'Achat SUV Tourisme',
          targetAmount: 1200000,
          currency: 'HTG',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months out
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months out
          frequency: 'WEEKLY',
          icon: 'directions_car',
          createdDate: new Date().toISOString(),
          status: 'active',
        }
      ];
 
      const seedContributions: Record<string, Contribution[]> = {
        [initialGoalId1]: [
          { id: 'c_seed_1', amount: 650000, currency: 'HTG', date: new Date().toISOString().split('T')[0], note: 'Épargne initiale Groupe' }
        ],
        [initialGoalId2]: [
          { id: 'c_seed_2', amount: 980000, currency: 'HTG', date: new Date().toISOString().split('T')[0], note: 'Dépôt Tranche 1' }
        ]
      };
 
      const seedCompletedGoals: Goal[] = [
        {
          id: 'g_seed_completed_1',
          name: 'Laptop MacBook Pro',
          targetAmount: 320000,
          currency: 'HTG',
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          targetDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          frequency: 'MONTHLY',
          icon: 'laptop_mac',
          createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
        }
      ];

      const completedContributions: Record<string, Contribution[]> = {
        'g_seed_completed_1': [
          { id: 'c_seed_comp_1', amount: 320000, currency: 'HTG', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], note: 'Donation & Épargne' }
        ]
      };

      setGoals(seedGoals);
      setCompletedGoals(seedCompletedGoals);
      setContributions({ ...seedContributions, ...completedContributions });
      setRates(DEFAULT_RATES);
      setLanguage('HT');
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        goals,
        completedGoals,
        contributions,
        rates,
        language,
        userName,
        userAvatar,
        isPinLockEnabled,
        pinCode,
        envelopes,
        profiles,
        incomeTransactions,
        activeProfileId,
        availableFunds
      }));
    }
  }, [goals, completedGoals, contributions, rates, language, userName, userAvatar, isPinLockEnabled, pinCode, envelopes, profiles, incomeTransactions, activeProfileId, availableFunds, isLoaded]);

  const addGoal = (goal: Omit<Goal, 'id' | 'createdDate' | 'status'>): Goal => {
    const newGoal: Goal = {
      ...goal,
      id: 'g_' + Date.now().toString(),
      createdDate: new Date().toISOString(),
      status: 'active'
    };
    setGoals(prev => [...prev, newGoal]);
    setContributions(prev => ({
      ...prev,
      [newGoal.id]: []
    }));
    return newGoal;
  };

  const markGoalAsCompleted = (
    goalId: string,
    completionReason?: string,
    completionType?: 'realized' | 'closed',
    completionPercentage?: number,
    daysSavedAhead?: number
  ) => {
    const goalIndex = goals.findIndex(g => g.id === goalId);
    if (goalIndex > -1) {
      const goalToComplete = goals[goalIndex];
      const completed: Goal = {
        ...goalToComplete,
        status: 'completed',
        completedDate: new Date().toISOString(),
        completionReason,
        completionType: completionType || 'realized',
        completionPercentage,
        daysSavedAhead
      };
      setGoals(prev => prev.filter(g => g.id !== goalId));
      setCompletedGoals(prev => [...prev, completed]);
    }
  };

  const reopenGoal = (goalId: string) => {
    const goalIndex = completedGoals.findIndex(g => g.id === goalId);
    if (goalIndex > -1) {
      const goalToReopen = completedGoals[goalIndex];
      const active: Goal = {
        ...goalToReopen,
        status: 'active',
        completedDate: undefined
      };
      setCompletedGoals(prev => prev.filter(g => g.id !== goalId));
      setGoals(prev => [...prev, active]);
    }
  };

  const deleteGoal = (goalId: string, isCompleted?: boolean) => {
    if (isCompleted) {
      setCompletedGoals(prev => prev.filter(g => g.id !== goalId));
    } else {
      setGoals(prev => prev.filter(g => g.id !== goalId));
    }
    setContributions(prev => {
      const copy = { ...prev };
      delete copy[goalId];
      return copy;
    });
  };

  const addContribution = (goalId: string, contribution: Omit<Contribution, 'id'>): Contribution => {
    const newContrib: Contribution = {
      ...contribution,
      id: 'c_' + Date.now().toString()
    };
    setContributions(prev => {
      const existing = prev[goalId] || [];
      return {
        ...prev,
        [goalId]: [...existing, newContrib]
      };
    });
    return newContrib;
  };

  const deleteContribution = (goalId: string, contribId: string) => {
    setContributions(prev => {
      const existing = prev[goalId] || [];
      return {
        ...prev,
        [goalId]: existing.filter(c => c.id !== contribId)
      };
    });
  };

  const updateRates = (newRates: ExchangeRates) => {
    setRates({
      ...newRates,
      HTG: 1 // ensure base gourde stays normalized
    });
  };

  const exportDataJSON = () => {
    const data = {
      goals,
      completedGoals,
      contributions,
      rates,
      language,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spargn-ayiti-sauvegarde-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportDataCSV = () => {
    // Generate two portions in CSV:
    // 1st Port: Goals overview
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "=== OBJECTIFS ===\r\n";
    csvContent += "ID,Nom,Statut,Cible,Devise,Frequence,Date Cible,Date Creation,Date Fin\r\n";
    
    const allGoalsList = [
      ...goals.map(g => ({ ...g, type: 'En Cours' })),
      ...completedGoals.map(g => ({ ...g, type: 'Terminé' }))
    ];

    allGoalsList.forEach(g => {
      const row = [
        g.id,
        `"${g.name.replace(/"/g, '""')}"`,
        g.type,
        g.targetAmount,
        g.currency,
        g.frequency,
        g.targetDate,
        g.createdDate,
        g.completedDate || ""
      ].join(",");
      csvContent += row + "\r\n";
    });

    csvContent += "\r\n=== CONTRIBUTIONS ET DEPOTS ===\r\n";
    csvContent += "ID Contribution,ID Objectif,Nom Objectif,Date Depot,Montant,Devise,Taux Dynamic (vs HTG),Notes\r\n";

    allGoalsList.forEach(g => {
      const list = contributions[g.id] || [];
      list.forEach(c => {
        const row = [
          c.id,
          g.id,
          `"${g.name.replace(/"/g, '""')}"`,
          c.date,
          c.amount,
          c.currency,
          rates[c.currency] || 1,
          `"${(c.note || '').replace(/"/g, '""')}"`
        ].join(",");
        csvContent += row + "\r\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `spargn-ayiti-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const importData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.goals) setGoals(data.goals);
      if (data.completedGoals) setCompletedGoals(data.completedGoals);
      if (data.contributions) setContributions(data.contributions);
      if (data.rates) setRates(data.rates);
      if (data.language) setLanguage(data.language);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  };

  const updateProfile = (name: string, avatar: string) => {
    setUserName(name);
    setUserAvatar(avatar);
  };

  const addEnvelope = (name: string, nameKreyol: string, icon: string, initialAllocated: number, extra?: Partial<BudgetEnvelope>) => {
    const id = 'env_' + Date.now().toString(36);
    const newEnvelope: BudgetEnvelope = {
      id,
      name,
      nameKreyol,
      percentage: 0,
      allocatedAmount: initialAllocated,
      spentAmount: 0,
      icon,
      ...extra,
    };
    setEnvelopes(prev => [...prev, newEnvelope]);
    setAvailableFunds(prev => Math.max(0, prev - initialAllocated));
  };

  const deleteEnvelope = (id: string) => {
    const env = envelopes.find(e => e.id === id);
    if (!env) return;
    const refund = Math.max(0, env.allocatedAmount - env.spentAmount);
    setEnvelopes(prev => prev.filter(e => e.id !== id));
    setAvailableFunds(prev => prev + refund);
  };

  const updateEnvelopeDeposit = (id: string, newAllocated: number) => {
    setEnvelopes(prev => prev.map(env => {
      if (env.id === id) {
        const diff = newAllocated - env.allocatedAmount;
        setAvailableFunds(curr => Math.max(0, curr - diff));
        return {
          ...env,
          allocatedAmount: newAllocated
        };
      }
      return env;
    }));
  };

  const addIncomeTransaction = (transaction: Omit<IncomeTransaction, 'id' | 'splits'>, autoSplit: boolean = true) => {
    const amountHTG = FinancialEngine.convertToHTG(transaction.amount, transaction.currency, rates);

    if (autoSplit) {
      const profile = profiles.find(p => p.id === transaction.profileId) || profiles[0] || DEFAULT_PROFILES[0];
      const splits = FinancialEngine.computeSplits(transaction.amount, profile);
      
      const newTx: IncomeTransaction = {
        ...transaction,
        id: 'tx_' + Date.now().toString(),
        splits,
      };

      setIncomeTransactions(prev => [newTx, ...prev]);

      // Apply the splits to envelope allocated amounts, converted into base currency (HTG)
      setEnvelopes(prevEnvs => {
        return prevEnvs.map(env => {
          const share = splits[env.id] || 0;
          const shareHTG = FinancialEngine.convertToHTG(share, transaction.currency, rates);
          return {
            ...env,
            allocatedAmount: env.allocatedAmount + shareHTG
          };
        });
      });
    } else {
      // Add straight to availableFunds
      const newTx: IncomeTransaction = {
        ...transaction,
        id: 'tx_' + Date.now().toString(),
        splits: {}, // No splits, added to available funds
      };

      setIncomeTransactions(prev => [newTx, ...prev]);
      setAvailableFunds(prev => prev + amountHTG);
    }
  };

  const addEnvelopeExpense = (envelopeId: string, amount: number, note?: string) => {
    setEnvelopes(prevEnvs => {
      return prevEnvs.map(env => {
        if (env.id === envelopeId) {
          return {
            ...env,
            spentAmount: env.spentAmount + amount
          };
        }
        return env;
      });
    });
  };

  const transferFonDegaje = (sourceId: string, destId: string, amount: number) => {
    setEnvelopes(prevEnvs => {
      return prevEnvs.map(env => {
        if (env.id === sourceId) {
          return {
            ...env,
            allocatedAmount: Math.max(0, env.allocatedAmount - amount)
          };
        }
        if (env.id === destId) {
          return {
            ...env,
            allocatedAmount: env.allocatedAmount + amount
          };
        }
        return env;
      });
    });
  };

  const updateProfilePercentages = (profileId: string, percentages: Record<string, number>) => {
    setProfiles(prevProfiles => {
      return prevProfiles.map(p => {
        if (p.id === profileId) {
          return {
            ...p,
            percentages
          };
        }
        return p;
      });
    });
  };

  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGoals([]);
    setCompletedGoals([]);
    setContributions({});
    setRates(DEFAULT_RATES);
    setLanguage('HT');
    setUserName("Jean-Robert L'Ouverture");
    setUserAvatar("https://lh3.googleusercontent.com/aida-public/AB6AXuASZfbYFSGky0hlFIES1mhVDDKA9MytGAuPtQArL2ivbgyThhmS1VHY9uf7p6XoOmelOtSA5dBhHG6g3gj79xhIsa6wiNALu3yw__mtPY3ycXZlqaXZEMCkqYEX4YdCOIxLSq-yn9XhUDkEiMgyDZhr-Jv0utVxoz5FeEgFl49_icVFrav2JyR7TNSDpej-PTjnMf_PBS5WkWza_bm7Tt1RXoACU8zTwOG42dY6okVlUXt9kBTU4eYhEq-RJlfowpT3zbpnxqucQ06p");
    setEnvelopes(DEFAULT_ENVELOPES);
    setProfiles(DEFAULT_PROFILES);
    setIncomeTransactions([]);
    setActiveProfileId('normal');
    setAvailableFunds(10500);
  };

  return (
    <AppContext.Provider value={{
      goals,
      completedGoals,
      contributions,
      rates,
      language,
      setLanguage,
      addGoal,
      markGoalAsCompleted,
      reopenGoal,
      deleteGoal,
      addContribution,
      deleteContribution,
      updateRates,
      exportDataJSON,
      exportDataCSV,
      importData,
      clearAllData,
      userName,
      userAvatar,
      updateProfile,
      isPinLockEnabled,
      setPinLockEnabled,
      pinCode,
      setPinCode,
      isUnlocked,
      setIsUnlocked,
      showToast,
      envelopes,
      profiles,
      incomeTransactions,
      activeProfileId,
      financialHealthScore,
      availableFunds,
      setAvailableFunds,
      addEnvelope,
      deleteEnvelope,
      updateEnvelopeDeposit,
      setEnvelopes,
      addIncomeTransaction,
      addEnvelopeExpense,
      transferFonDegaje,
      updateProfilePercentages,
      setActiveProfileId
    }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-none md:max-w-sm w-full px-4 sm:px-0">
          <div className={`p-4 rounded-xl border shadow-2xl flex items-center gap-3 pointer-events-auto bg-neutral-900 ${
            toast.type === 'error' 
              ? 'border-red-500/30 text-red-200 bg-red-950/90' 
              : toast.type === 'info' 
              ? 'border-cyan-500/30 text-cyan-200 bg-cyan-950/90' 
              : 'border-amber-500/30 text-neutral-200 bg-neutral-900/95 shadow-amber-500/5'
          }`}>
            <span className="text-base leading-none">
              {toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '🎉'}
            </span>
            <div className="text-xs font-medium leading-normal">{toast.message}</div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
