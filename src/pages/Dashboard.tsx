import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TRANSLATIONS } from '../lib/translations';
import { GoalCard } from '../components/GoalCard';
import { BudgetIntelligent } from '../components/BudgetIntelligent';
import { 
  PlusCircle, 
  Zap, 
  Trophy, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  Trash2, 
  Award, 
  Shield, 
  Coins, 
  Flame, 
  BookOpen, 
  Info, 
  RefreshCw, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { formatMoney, formatDate, calculateTotalSaved } from '../lib/currency';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface DashboardProps {
  onSelectGoal: (goalId: string) => void;
  onOpenAddGoal: () => void;
  onOpenQuickAdd: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onSelectGoal, 
  onOpenAddGoal, 
  onOpenQuickAdd 
}) => {
  const { 
    goals, 
    completedGoals, 
    contributions, 
    rates, 
    language, 
    reopenGoal, 
    deleteGoal,
    isPinLockEnabled,
    showToast 
  } = useAppContext();
  
  const t = TRANSLATIONS[language] || TRANSLATIONS.HT;

  // --- PERSISTENT SÒL CHALLENGE STATE (Item 2) ---
  const [solWeeklyHand, setSolWeeklyHand] = useState<number>(() => {
    return Number(localStorage.getItem('spargn_sol_hand') || '1000');
  });
  const [solSelectedTurn, setSolSelectedTurn] = useState<number>(() => {
    return Number(localStorage.getItem('spargn_sol_turn') || '2');
  });
  const [solWeek, setSolWeek] = useState<number>(() => {
    return Number(localStorage.getItem('spargn_sol_week') || '1');
  });
  const [solPaidWeeks, setSolPaidWeeks] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem('spargn_sol_paid');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [false, false, false, false];
  });
  const [solCycleCount, setSolCycleCount] = useState<number>(() => {
    return Number(localStorage.getItem('spargn_sol_cycle_count') || '0');
  });

  useEffect(() => {
    localStorage.setItem('spargn_sol_hand', solWeeklyHand.toString());
    localStorage.setItem('spargn_sol_turn', solSelectedTurn.toString());
    localStorage.setItem('spargn_sol_week', solWeek.toString());
    localStorage.setItem('spargn_sol_paid', JSON.stringify(solPaidWeeks));
    localStorage.setItem('spargn_sol_cycle_count', solCycleCount.toString());
  }, [solWeeklyHand, solSelectedTurn, solWeek, solPaidWeeks, solCycleCount]);

  // --- PERSISTENT KÒB SEKOU STATE (Item 2) ---
  const [emergencyFund, setEmergencyFund] = useState<number>(() => {
    return Number(localStorage.getItem('spargn_emergency_fund') || '0');
  });
  const [emergencyInput, setEmergencyInput] = useState<string>('');
  const [withdrawInput, setWithdrawInput] = useState<string>('');
  const [isWithdrawingEmergency, setIsWithdrawingEmergency] = useState<boolean>(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    localStorage.setItem('spargn_emergency_fund', emergencyFund.toString());
  }, [emergencyFund]);

  // --- KONSÈY SAJ ADVICE STATE (Item 4) ---
  const [tipIndex, setTipIndex] = useState<number>(0);

  // --- INTERACTIVE CHART SETTINGS ---
  const [chartCurrency, setChartCurrency] = useState<'HTG' | 'USD' | 'EUR'>('HTG');
  const [chartView, setChartView] = useState<'cumulative' | 'monthly'>('cumulative');

  const tips = [
    {
      title: language === 'HT' ? "Règ de lò 50/30/20 a" : "La Règle d'or des 50/30/20",
      desc: language === 'HT' 
        ? "Separe salè ou: 50% pou Bezwen Nesesè (Kay, Manje), 30% pou Plezi, ak 20% pou Epanye nan Kòb Sekou ou."
        : "Divisez vos ressources : 50% pour les Besoins vitaux, 30% pour les Loisirs et 20% pour l'Épargne de secours."
    },
    {
      title: language === 'HT' ? "Konbat Enflasyon Goud la" : "Fronter l'Inflation en Haïti",
      desc: language === 'HT'
        ? "Goud la kapab pèdi valè. Pwoteje tèt ou lè ou konvèti yon pati nan epay ou an Dola (USD) oswa USDT."
        : "Contrez la dépréciation de la Gourde en gardant une partie de votre épargne sous forme de devises stables (USD/USDT)."
    },
    {
      title: language === 'HT' ? "Peye Tèt Ou Premye" : "Payez-vous en Premier",
      desc: language === 'HT'
        ? "Dabò, sere omwen 10% nan chak vèsman anvan ou kòmanse depanse pou nenpòt lòt bagay."
        : "Prélèveez au moins 10% pour votre épargne dès la réception de vos revenus, avant même d'effectuer d'autres dépenses."
    },
    {
      title: language === 'HT' ? "Piti piti fann bwa" : "Petit à Petit, l'Oiseau Fait son Nid",
      desc: language === 'HT'
        ? "Sere sa ou kapab. Se pa kantite a k ap fè fòs ou, men se tennfòs pou sere chak semèn san rete!"
        : "Chaque centime compte. Ce n'est pas le montant qui compte le plus, mais la régularité ininterrompue de vos dépôts."
    },
    {
      title: language === 'HT' ? "Kòb Sekou se poto mitan" : "L'importance du Kòb Sekou",
      desc: language === 'HT'
        ? "Sere 3 a 6 mwa depans nan Kòb Sekou ou pou lè gen ijans pou ou pa kouri prete nan enterè."
        : "Prévoyez 3 à 6 mois de dépenses courantes dans votre fonds d'urgence pour parer aux coups durs sans vous endetter."
    }
  ];

  // Rotate tips automatic timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Calculate global savings metrics using rates
  let totalSavedHTG = 0;
  Object.keys(contributions).forEach(goalId => {
    const list = contributions[goalId] || [];
    list.forEach(c => {
      const inHTG = c.currency === 'HTG' ? c.amount : c.amount * (rates[c.currency] || 1);
      totalSavedHTG += inHTG;
    });
  });

  const totalSavedUSD = totalSavedHTG / (rates.USD || 130);

  // Calculate active target and active saved for overall progress
  let activeTargetHTG = 0;
  let activeSavedHTG = 0;

  goals.forEach(g => {
    const targetInHTG = g.currency === 'HTG' ? g.targetAmount : g.targetAmount * (rates[g.currency] || 1);
    activeTargetHTG += targetInHTG;

    const list = contributions[g.id] || [];
    list.forEach(c => {
      const inHTG = c.currency === 'HTG' ? c.amount : c.amount * (rates[c.currency] || 1);
      activeSavedHTG += inHTG;
    });
  });

  const overallProgress = activeTargetHTG > 0 ? Math.min(100, Math.round((activeSavedHTG / activeTargetHTG) * 100)) : 0;

  // --- RECHARTS CUMULATIVE & MONTHLY DATA COMPILATION (Item 1) ---
  const evolutionData = (() => {
    const listMonths: { name: string; key: string; rawDate: Date }[] = [];
    const now = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const mNum = d.getMonth() + 1;
      const mStr = mNum.toString().padStart(2, '0');
      
      let label = '';
      if (language === 'HT') {
        const labelsHT = ['Jan', 'Feb', 'Mas', 'Avr', 'Me', 'Jen', 'Jiy', 'Out', 'Sep', 'Okt', 'Nov', 'Des'];
        label = labelsHT[d.getMonth()] + ' ' + year.toString().slice(-2);
      } else if (language === 'FR') {
        const labelsFR = ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
        label = labelsFR[d.getMonth()] + ' ' + year.toString().slice(-2);
      } else {
        const labelsEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = labelsEN[d.getMonth()] + ' ' + year.toString().slice(-2);
      }
      
      listMonths.push({
        name: label,
        key: `${year}-${mStr}`,
        rawDate: new Date(year, d.getMonth() + 1, 0, 23, 59, 59)
      });
    }

    // Accumulate all contributions overall
    const allContribs: { amountHTG: number; dateObj: Date }[] = [];
    Object.keys(contributions).forEach(gId => {
      const list = contributions[gId] || [];
      list.forEach(c => {
        const valueHTG = c.currency === 'HTG' ? c.amount : c.amount * (rates[c.currency] || 1);
        allContribs.push({
          amountHTG: valueHTG,
          dateObj: new Date(c.date)
        });
      });
    });

    const divisor = chartCurrency === 'HTG' ? 1 : rates[chartCurrency] || 1;

    // Map each month to its cumulative and individual monthly sum
    return listMonths.map(m => {
      const limitDate = m.rawDate;
      const cumulativeSum = allContribs
        .filter(c => c.dateObj <= limitDate)
        .reduce((sum, c) => sum + c.amountHTG, 0);

      const monthlySum = allContribs
        .filter(c => {
          const cYear = c.dateObj.getFullYear();
          const cMonth = (c.dateObj.getMonth() + 1).toString().padStart(2, '0');
          return `${cYear}-${cMonth}` === m.key;
        })
        .reduce((sum, c) => sum + c.amountHTG, 0);
        
      return {
        name: m.name,
        'cumulative': Math.round(cumulativeSum / divisor),
        'monthly': Math.round(monthlySum / divisor)
      };
    });
  })();

  // --- DYNAMIC GAMIFICATION SYSTEM (Item 5) ---
  // Count total contributions
  let totalContribCount = 0;
  Object.keys(contributions).forEach(key => {
    totalContribCount += (contributions[key] || []).length;
  });

  const badges = [
    {
      id: 'b1',
      title: language === 'HT' ? 'Premye Pa' : 'Premier Pas',
      desc: language === 'HT' ? 'Ou poze premye depo epay ou nan aplikasyon an.' : 'Vous avez effectué votre tout premier dépôt d\'épargne.',
      icon: '🥇',
      unlocked: totalContribCount >= 1,
    },
    {
      id: 'b2',
      title: language === 'HT' ? 'Epanyan Konstan' : 'Épargnant Assidu',
      desc: language === 'HT' ? 'Franchis papòt 5 depo akimile pou montre tennfòs ou.' : 'Réalisez un minimum de 5 dépôts cumulés dans votre historique.',
      icon: '🔥',
      unlocked: totalContribCount >= 5,
    },
    {
      id: 'b3',
      title: language === 'HT' ? 'Gwo Poto Mitan' : 'Colosse de l\'Épargne',
      desc: language === 'HT' ? 'Sere plis pase 50,000 HTG nan epay total ou.' : 'Séparez plus de 50 000 HTG au total de vos épargnes.',
      icon: '🦖',
      unlocked: totalSavedHTG >= 50000,
    },
    {
      id: 'b4',
      title: language === 'HT' ? 'Sòlda Goud la' : 'Soldat de la Gourde',
      desc: language === 'HT' ? 'Konplete omwen yon gwo objektif epay nèt.' : 'Terminez et archivez au moins 1 objectif d\'épargne actif.',
      icon: '🏆',
      unlocked: completedGoals.length >= 1,
    },
    {
      id: 'b5',
      title: language === 'HT' ? 'Pwoteksyon Solèy' : 'Bouclier de Sécurité',
      desc: language === 'HT' ? 'Aktive kòd PIN pou sekirize aplikasyon an nèt daprè nòm yo.' : 'Activez le verrouillage par code PIN dans les réglages.',
      icon: '🛡️',
      unlocked: !isPinLockEnabled, // Wait! Unlocked if isPinLockEnabled is true! Let's write `!!isPinLockEnabled`!
    },
    {
      id: 'b6',
      title: language === 'HT' ? 'Mèt Sòl la' : 'Maître du Sòl',
      desc: language === 'HT' ? 'Klore yon sik konplè ak 4 peman nan Sòl Virtuel la.' : 'Complétez un cycle complet de 4 semaines dans le Sòl Virtuel.',
      icon: '🎯',
      unlocked: solCycleCount >= 1 || solPaidWeeks.every(w => w),
    }
  ];

  // Correct badge 5 condition to be boolean
  badges[4].unlocked = !!isPinLockEnabled;

  // --- SÒL COTISATION PAYMENT HELPER ---
  const handlePaySolWeek = () => {
    if (solWeek > 4) {
      showToast(language === 'HT' ? 'Sik sa fin konplete dejà! Tanpri rekòmanse yon nouvo sik.' : 'Ce cycle est déjà terminé ! Veuillez redémarrer un nouveau cycle.', 'info');
      return;
    }

    const updated = [...solPaidWeeks];
    updated[solWeek - 1] = true;
    setSolPaidWeeks(updated);

    // If we paid the user's turn (Turn 2 is week 2), or when we paid everything, check if we complete the turn
    if (solWeek === solSelectedTurn) {
      const payout = solWeeklyHand * 4;
      showToast(language === 'HT' 
        ? `🎉 GWO LÒT LA VÈSE POU OU! Ou resevwa men sòl la: ${formatMoney(payout, 'HTG')}. Sa se fwi disiplin ou!` 
        : `🎉 SÒL TIRÉ ET VERSÉ ! Vous touchez le gros lot de la tontine : ${formatMoney(payout, 'HTG')}. C'est la récolte de votre discipline !`,
        'success'
      );
    } else {
      showToast(language === 'HT' 
        ? `Kòb Sòl ou antre pou Semèn ${solWeek}! Depo ${formatMoney(solWeeklyHand, 'HTG')} anrejistre.` 
        : `Votre main de Sòl pour la Semaine ${solWeek} a été versée ! Dépôt de ${formatMoney(solWeeklyHand, 'HTG')} enregistré.`,
        'success'
      );
    }

    if (solWeek === 4) {
      // Complete cycle
      setSolCycleCount(prev => prev + 1);
      showToast(language === 'HT' 
        ? 'Bravo! Sik Sòl la konplete ak siksè! Ou ka rekòmanse yon lòt pou kontinye bati disiplin ou.'
        : 'Bravo ! Le cycle de Sòl est entièrement bouclé ! Vous pouvez réinitialiser pour lancer un nouveau tour.',
        'success'
      );
    }

    setSolWeek(prev => Math.min(5, prev + 1));
  };

  const handleResetSol = () => {
    setSolPaidWeeks([false, false, false, false]);
    setSolWeek(1);
    showToast(language === 'HT' ? 'Nouvo sik Sòl Virtuel kòmanse!' : 'Nouveau cycle de Sòl Virtuel démarré !', 'success');
  };

  // --- KÒB SEKOU TRANSACTION HELPERS ---
  const handleAddEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(emergencyInput);
    if (isNaN(val) || val <= 0) {
      showToast(language === 'HT' ? 'Tanpri mete yon montan ki fò epi ki kòrèk!' : 'Saisir un montant valide supérieur à 0 !', 'error');
      return;
    }
    setEmergencyFund(prev => prev + val);
    setEmergencyInput('');
    showToast(language === 'HT' 
      ? `Depo fèt ak siksè! Ou mete ${formatMoney(val, 'HTG')} nan Kòb Sekou ou.` 
      : `Dépôt réussi ! Vous avez ajouté ${formatMoney(val, 'HTG')} dans votre fonds d'urgence Kòb Sekou.`,
      'success'
    );
  };

  const handleWithdrawEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawInput);
    if (isNaN(val) || val <= 0) {
      showToast(language === 'HT' ? 'Mete yon montan ki kòrèk!' : 'Montant invalide !', 'error');
      return;
    }
    if (val > emergencyFund) {
      showToast(language === 'HT' ? 'Epay ou an pa ase pou retrè sa!' : 'Fonds insuffisants !', 'error');
      return;
    }
    setEmergencyFund(prev => Math.max(0, prev - val));
    setWithdrawInput('');
    setIsWithdrawingEmergency(false);
    showToast(language === 'HT' 
      ? `Retrè fini ak siksè! Ou retire ${formatMoney(val, 'HTG')} pou yon ijans.` 
      : `Retrait effectué ! Vous avez retiré ${formatMoney(val, 'HTG')} pour parer à une urgence.`,
      'success'
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
      
      {/* Global Savings Hero */}
      <section className="relative">
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(242,202,80,0.03)] overflow-hidden relative">
          
          {/* Glowing background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div>
              <p className="text-xs font-bold text-neutral-400 mb-2 tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400 max-w-none" />
                {t.totalSavings}
              </p>
              
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl md:text-5xl font-black text-amber-400 tracking-tight leading-none">
                  {Math.round(totalSavedHTG).toLocaleString('fr-FR')}
                </h2>
                <span className="text-amber-400/80 font-bold text-lg leading-none">
                  HTG
                </span>
              </div>
              
              <p className="text-neutral-400 font-semibold text-sm mt-3 flex items-center gap-1">
                ≈ {totalSavedUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>

              {totalSavedHTG === 0 && (
                <p className="text-neutral-500 font-semibold text-xs mt-2.5 italic flex items-center gap-1.5 bg-neutral-950/40 p-2.5 rounded-xl border border-white/5 max-w-sm">
                  💡 {language === 'HT' ? 'Chak gwo reyalizasyon kòmanse ak premye goud la.' : 'Chaque grand projet commence par une première gourde.'}
                </p>
              )}
            </div>

            <div className="w-full md:w-5/12 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-neutral-400">{t.overallProgress}</span>
                <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {overallProgress}%
                </span>
              </div>
              
              <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden relative border border-white/5">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-1000" 
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              
              <span className="text-[10px] text-neutral-500 block text-right font-medium">
                {goals.length} {goals.length <= 1 ? 'objectif actif' : 'objectifs actifs'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="flex flex-wrap gap-3">
        <button 
          onClick={onOpenAddGoal}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 px-5 py-4 rounded-xl transition duration-200 active:scale-95 shadow-[0_4px_15px_rgba(242,202,80,0.15)] flex-1 sm:flex-initial cursor-pointer"
        >
          <PlusCircle size={18} />
          {t.newGoal}
        </button>

        <button 
          onClick={onOpenQuickAdd}
          className="border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 px-5 py-4 rounded-xl transition duration-200 active:scale-95 flex-1 sm:flex-initial cursor-pointer"
        >
          <Zap size={18} />
          {t.quickAdd}
        </button>
      </section>

      {/* 🛡️ MULTI-ENVELOPPES & BUDGET INTELLIGENT (v1.3) */}
      <section className="glass-card rounded-2xl p-6 border border-white/5 shadow-sm space-y-4">
        <BudgetIntelligent />
      </section>

      {/* 📈 COMPANION SAVINGS CUMULATIVE CHRONOLOGY (Item 1) */}
      <section className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-neutral-100 text-sm md:text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-400" />
              {chartView === 'cumulative' 
                ? (language === 'HT' ? 'Grafik Evolisyon Epay yo' : "Évolution Cumulative de l'Épargne")
                : (language === 'HT' ? 'Epay pa Mwa' : "Épargne Mensuelle Individuelle")
              }
            </h3>
            <p className="text-[10px] text-neutral-400">
              {chartView === 'cumulative'
                ? (language === 'HT' ? 'Koubyepay akimile sou dènye 6 mwa yo' : "Courbe de progression ascendante et cumulée de vos efforts")
                : (language === 'HT' ? 'Kantite kòb ou mete chak mwa separeman' : "Montant total déposé lors de chaque mois")
              }
            </p>
          </div>

          {/* Interactive Controls Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Tab Toggle */}
            <div className="bg-neutral-900 border border-white/5 p-1 rounded-xl flex items-center">
              <button
                onClick={() => setChartView('cumulative')}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  chartView === 'cumulative' 
                    ? 'bg-amber-500 text-neutral-950 shadow-sm' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {language === 'HT' ? 'Akimile' : 'Cumulé'}
              </button>
              <button
                onClick={() => setChartView('monthly')}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  chartView === 'monthly' 
                    ? 'bg-amber-500 text-neutral-950 shadow-sm' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {language === 'HT' ? 'Chak Mwa' : 'Mensuel'}
              </button>
            </div>

            {/* Currency Pill Toggle */}
            <div className="bg-neutral-900 border border-white/5 p-1 rounded-xl flex items-center">
              {(['HTG', 'USD', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setChartCurrency(curr)}
                  className={`text-[10px] font-mono font-bold px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    chartCurrency === curr 
                      ? 'bg-neutral-800 text-amber-400 border border-amber-500/20' 
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-56 w-full pr-2">
          {totalSavedHTG === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-4 bg-neutral-950/40 rounded-xl border border-white/5">
              <p className="text-xs text-neutral-500">
                {language === 'HT' ? 'Depoze kèk kòb nan objektif ou yo pou wè grafik sa a grandi! 🌱' : "Enregistrez votre première contribution pour tracer votre courbe ascendante ! 🌱"}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'cumulative' ? (
                <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSav" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f2ca50" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f2ca50" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(23, 23, 23, 0.95)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#f4f4f5'
                    }}
                    formatter={(value: any) => [`${value.toLocaleString('fr-FR')} ${chartCurrency}`, language === 'HT' ? 'Total Epanye' : 'Total Épargné']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#f2ca50" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorSav)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={evolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(23, 23, 23, 0.95)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#f4f4f5'
                    }}
                    formatter={(value: any) => [`${value.toLocaleString('fr-FR')} ${chartCurrency}`, language === 'HT' ? 'Epay Mwa sa' : 'Épargne du Mois']}
                  />
                  <Bar 
                    dataKey="monthly" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* 🎯 BENTO GRID: TRADITIONAL CHALLENGES, ACHIEVEMENTS & TIPS (Items 2, 4, 5) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SÒL VIRTUEL (Item 2) */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#f2ca50]/5 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#f2ca50] font-extrabold uppercase bg-[#f2ca50]/10 px-2.5 py-1 rounded-full">
                🇭🇹 Sòl Virtuel
              </span>
              <span className="text-[10px] text-neutral-400 font-mono font-bold leading-none bg-white/5 px-2 py-1 rounded">
                Sik : #{solCycleCount + 1}
              </span>
            </div>
            
            <h4 className="font-bold text-neutral-100 text-sm">
              {language === 'HT' ? 'Tontin Tradisyonèl Ayisyen' : 'Tontine Traditionnelle Haïtienne'}
            </h4>
            <p className="text-[10.5px] text-neutral-400 leading-relaxed">
              {language === 'HT' 
                ? 'Sere yon kòb fiks chak semèn ansanm ak Madame Fifi, Tonton Jean, ak Luckson. Se tou pa w pou w touche lòt la nan semèn #2!'
                : "Épargnez une main fixe chaque semaine avec vos pairs virtuels. C'est votre tour de toucher le gros lot en semaine #2 !"
              }
            </p>
          </div>

          <div className="p-3 bg-neutral-950/60 rounded-xl space-y-3.5 border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-neutral-300">{language === 'HT' ? 'Men Sòl (Hebdomadaire)' : 'Main de Sòl'}</span>
              <select
                value={solWeeklyHand}
                onChange={(e) => {
                  setSolWeeklyHand(Number(e.target.value));
                  handleResetSol();
                }}
                className="bg-neutral-900 border border-white/5 rounded px-2 py-1 text-amber-400 font-mono text-[11px] outline-none cursor-pointer"
              >
                <option value={500}>500 HTG</option>
                <option value={1000}>1,000 HTG</option>
                <option value={2500}>2,500 HTG</option>
                <option value={5000}>5,000 HTG</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-neutral-400 uppercase font-black tracking-wider">
                <span>{language === 'HT' ? 'Pwogrè Kòtizasyon' : 'Progression de versements'}</span>
                <span>Semèn {Math.min(4, solWeek)} / 4</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => {
                  const i = num - 1;
                  const paid = solPaidWeeks[i];
                  const label = `S${num}`;
                  const isUserTurn = num === solSelectedTurn;
                  return (
                    <div 
                      key={i} 
                      className={`text-center py-2 rounded-lg border text-xs font-mono font-bold flex flex-col items-center justify-center relative ${
                        paid 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-neutral-900/60 border-white/5 text-neutral-500'
                      }`}
                    >
                      <span>{label}</span>
                      {paid ? (
                        <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">PEYE</span>
                      ) : (
                        <span className="text-[9px] text-neutral-500 font-medium block mt-0.5">
                          {isUserTurn ? '👉 LOT' : 'ATANN'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePaySolWeek}
              disabled={solWeek > 4}
              className={`flex-1 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all duration-150 cursor-pointer ${
                solWeek > 4 
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                  : 'bg-[#f2ca50] hover:bg-amber-400 text-neutral-950 active:scale-95'
              }`}
            >
              💸 {language === 'HT' ? 'Peye Men Sòl Kounye a' : 'Verser ma Main de Sòl'}
            </button>
            <button
              onClick={handleResetSol}
              className="px-3 py-2.5 bg-neutral-900 text-neutral-400 hover:text-amber-400 border border-white/5 rounded-xl active:scale-95 transition-all outline-none cursor-pointer"
              title="Réinitialiser la tontine"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* KÒB SEKOU (Item 2 Emergency Milestone) */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full">
              🛡️ Kòb Sekou
            </span>
            <h4 className="font-bold text-neutral-100 text-sm">{language === 'HT' ? "Fon d'Ijans Sekou" : "Fonds de Réserve d'Urgence"}</h4>
            <p className="text-[10.5px] text-neutral-400 leading-relaxed">
              {language === 'HT'
                ? 'Bati yon baraj sekirite finansye pou pa kouri prete nan enterè lè ijans rive k sanzatann.'
                : "Mettez de côté des fonds d'urgence sécurisés étape par étape pour résister sereinement aux aléas."
              }
            </p>
          </div>

          <div className="p-3 bg-neutral-950/60 rounded-xl space-y-3.5 border border-white/5">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-sans font-extrabold uppercase text-neutral-500 tracking-wider">
                {language === 'HT' ? 'Rezèv Aktyèl' : 'Réserve Active'}
              </span>
              <span className="text-[#f2ca50] font-black text-sm">
                {formatMoney(emergencyFund, 'HTG')}
              </span>
            </div>

            {/* Emergency milestones stack */}
            <div className="space-y-1.5">
              {[
                { name: language === 'HT' ? 'Premye Swen (5k)' : 'Premiers Soins (5k)', limit: 5000 },
                { name: language === 'HT' ? 'Sekirite Kay (25k)' : 'Sécurité Foyer (25k)', limit: 25000 },
                { name: language === 'HT' ? 'Poto Mitan (100k)' : 'Piliers Secours (100k)', limit: 100000 },
                { name: language === 'HT' ? 'Kòb Repoz (250k)' : 'Kòb Repoz (250k)', limit: 250000 }
              ].map((ms, i) => {
                const unlocked = emergencyFund >= ms.limit;
                return (
                  <div key={i} className="flex justify-between items-center text-[10px] leading-tight">
                    <span className={`font-semibold ${unlocked ? 'text-emerald-400 font-extrabold' : 'text-neutral-500'}`}>
                      {unlocked ? '✅' : '🔒'} {ms.name}
                    </span>
                    <span className="font-mono text-neutral-500">
                      {ms.limit.toLocaleString()} {language === 'HT' ? 'Goud' : 'HTG'}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleAddEmergency} className="flex gap-1.5 items-center pt-1 border-t border-white/5">
              <input
                type="text"
                pattern="\d*"
                value={emergencyInput}
                onChange={(e) => setEmergencyInput(e.target.value.replace(/\D/g, ''))}
                placeholder="ex. 1000"
                className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2 py-1.5 text-neutral-200 text-[11px] font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider cursor-pointer active:scale-95 transition-transform"
              >
                {language === 'HT' ? 'Mete' : 'Déposer'}
              </button>
            </form>
          </div>

          {isWithdrawingEmergency ? (
            <form onSubmit={handleWithdrawEmergencySubmit} className="space-y-2 pt-1 border-t border-white/5">
              <span className="text-[9px] font-sans font-extrabold uppercase text-amber-500 tracking-wider">
                {language === 'HT' ? 'Konbyen kòb ou vle retire?' : 'Montant à retirer :'}
              </span>
              <div className="flex gap-1.5 items-center">
                <input
                  type="text"
                  pattern="\d*"
                  value={withdrawInput}
                  onChange={(e) => setWithdrawInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="ex. 500"
                  className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2 py-1.5 text-neutral-200 text-[11px] font-mono focus:outline-none focus:border-amber-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider cursor-pointer transition-transform"
                >
                  {language === 'HT' ? 'Retire' : 'Retirer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsWithdrawingEmergency(false);
                    setWithdrawInput('');
                  }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                >
                  {language === 'HT' ? 'Anile' : 'Annuler'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsWithdrawingEmergency(true)}
              disabled={emergencyFund <= 0}
              className={`w-full py-2.5 rounded-xl border border-white/5 font-extrabold text-[10px] uppercase tracking-widest ${
                emergencyFund <= 0 
                  ? 'opacity-40 cursor-not-allowed text-neutral-500' 
                  : 'bg-transparent text-emerald-400 hover:bg-emerald-500/10 cursor-pointer active:scale-95 transition-all'
              }`}
            >
              🏥 {language === 'HT' ? 'Sèvi ak Kòb Sekou sa' : 'Utiliser ces fonds'}
            </button>
          )}
        </div>

        {/* Dynamic Achievements & rotating wisdom advice "Konsèy Saj" (Items 4 & 5) */}
        <div className="space-y-4">
          
          {/* Wisdom Advice "Konsèy Saj" Block (Item 4) */}
          <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between shadow-md relative h-40">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-1 text-[11px] text-[#f2ca50] font-black uppercase tracking-wider">
                  💡 Konsèy Saj
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTipIndex(prev => (prev - 1 + tips.length) % tips.length)}
                    className="p-1 text-neutral-400 hover:text-amber-400 bg-transparent border-none outline-none cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setTipIndex(prev => (prev + 1) % tips.length)}
                    className="p-1 text-neutral-400 hover:text-amber-400 bg-transparent border-none outline-none cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <h4 className="font-extrabold text-neutral-200 text-xs">
                {tips[tipIndex].title}
              </h4>
              <p className="text-[10.5px] text-neutral-400 italic leading-relaxed line-clamp-3">
                "{tips[tipIndex].desc}"
              </p>
            </div>
            
            <div className="flex justify-end text-[8px] font-mono text-neutral-500 tracking-widest uppercase">
              Konsèy saj #{tipIndex + 1}
            </div>
          </div>

          {/* Gamified Achievements Box (Item 5) */}
          <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3.5 shadow-md">
            <h4 className="font-bold text-neutral-100 text-sm flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" />
              {language === 'HT' ? 'Siksè & Badj Yo' : 'Badges de Récompenses'}
            </h4>

            <div className="space-y-2 h-[164px] overflow-y-auto pr-1">
              {badges.map(b => (
                <div 
                  key={b.id} 
                  className={`p-2 rounded-xl flex items-center justify-between gap-2.5 border transition-all duration-300 ${
                    b.unlocked 
                      ? 'bg-amber-500/5 border-amber-500/20 text-neutral-200' 
                      : 'bg-neutral-900/40 border-white/5 opacity-45 text-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{b.icon}</span>
                    <div>
                      <h5 className="font-bold text-[11px]">{b.title}</h5>
                      <p className="text-[9.5px]/tight text-neutral-400 font-medium">{b.desc}</p>
                    </div>
                  </div>

                  <span className={`font-mono text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    b.unlocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-500 border border-transparent'
                  }`}>
                    {b.unlocked ? (language === 'HT' ? 'GANNYE' : 'ACQUIS') : (language === 'HT' ? 'AN KOU' : 'BLOQUÉ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* Active Goals Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg md:text-xl text-neutral-100 flex items-center gap-2">
            <span>🚀</span> {t.yourGoals}
            <span className="text-xs font-semibold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              {goals.length}
            </span>
          </h3>
        </div>

        {goals.length === 0 ? (
          <div className="p-6 md:p-8 bg-gradient-to-br from-neutral-900/40 via-neutral-900/20 to-amber-950/20 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="text-4xl md:text-5xl p-5 bg-neutral-950/60 rounded-2xl border border-white/5 shadow-lg text-center flex items-center justify-center select-none scale-100 hover:scale-105 transition-transform duration-300">
              🎯
            </div>

            <div className="space-y-4 flex-1 text-center md:text-left">
              <div className="space-y-1">
                <h4 className="text-lg md:text-xl font-extrabold text-amber-300 flex items-center justify-center md:justify-start gap-1.5">
                  👋 {language === 'HT' ? 'Byenvini nan Spargn Ayiti!' : 'Bienvenue sur Spargn Ayiti !'}
                </h4>
                <p className="text-xs md:text-sm text-neutral-400 font-semibold leading-relaxed max-w-xl">
                  {language === 'HT' 
                    ? 'Tout kòmanse ak premye objektif ou. Fixe yon vizyon klè pou rèv ou vle reyalize yo, kit se epay pou ijans, pwojè, oswa yon rèv pèsonèl.' 
                    : 'Tout commence par votre premier objectif. Fixez-vous une vision claire pour vos projets, futilités, événements ou votre épargne de secours.'}
                </p>
              </div>

              <p className="text-[11px] text-amber-400/80 font-black tracking-wider uppercase">
                👇 {language === 'HT' ? 'Chwazi yon rèv ou vle reyalize' : 'Sélectionnez un rêve à réaliser dès maintenant'} :
              </p>

              <button
                onClick={onOpenAddGoal}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-[0_4px_15px_rgba(242,202,80,0.25)] cursor-pointer"
              >
                <span>🎯</span>
                {language === 'HT' ? 'Kreye premye objektif mwen' : 'Créer mon premier objectif'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onSelect={onSelectGoal} />
            ))}
          </div>
        )}
      </section>

      {/* Completed Goals Panel (Priority 2 Separation) */}
      {completedGoals.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="font-bold text-lg md:text-xl text-neutral-400 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500 animate-bounce" />
            {t.completedGoals}
            <span className="text-xs font-semibold text-neutral-500 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full">
              {completedGoals.length}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map(goal => {
              const list = contributions[goal.id] || [];
              const saved = calculateSavedForCompleted(goal, list, rates);
              return (
                <div 
                  key={goal.id}
                  onClick={() => onSelectGoal(goal.id)}
                  className="bg-neutral-900/50 hover:bg-neutral-900 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between group transition-all duration-300 relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl">
                        🏆
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-100 group-hover:text-amber-400 transition-colors text-sm">
                          {goal.name}
                        </h4>
                        <span className="text-xs text-emerald-400 font-semibold block">
                          Atteint : {formatMoney(goal.targetAmount, goal.currency)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full leading-none">
                      CONQUIS
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-white/5 mt-2">
                    <span className="italic text-[10px]">
                      {t.completedOn} {goal.completedDate ? formatDate(goal.completedDate) : 'récemment'}
                    </span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Interactive reopen goal */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          reopenGoal(goal.id);
                        }}
                        className="text-xs text-amber-500 hover:text-amber-400 font-bold hover:underline bg-transparent border-none outline-none p-0 cursor-pointer"
                        title="Ré-ouvrir cet objectif"
                      >
                        Réactiver
                      </button>
                      <span className="text-neutral-700">•</span>
                      {/* Delete goal */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setGoalToDelete(goal.id);
                        }}
                        className="text-neutral-500 hover:text-red-400 p-1 rounded hover:bg-white/5"
                        title="Supprimer des archives"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Haitian financial quote */}
      <footer className="pt-8 text-center">
        <p className="text-xs text-neutral-500 font-medium italic tracking-widest leading-relaxed">
          {t.haitianVibe}
        </p>
      </footer>

      {/* Goal Deletion Confirmation popup */}
      {goalToDelete && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full relative">
            <h3 className="text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
              🚨 {language === 'HT' ? 'Supprimer Objektif' : 'Supprimer l\'Objectif'}
            </h3>
            <p className="text-neutral-300 text-xs font-semibold mb-6 leading-relaxed">
              {t.deleteConfirm || (language === 'HT' ? 'Sèten ou vle efase sa?' : 'Êtes-vous sûr de vouloir supprimer cet élément ?')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setGoalToDelete(null)}
                className="flex-1 py-3 px-4 bg-neutral-800 text-white hover:bg-neutral-750 font-bold rounded-xl text-xs uppercase transition-colors border border-white/5 cursor-pointer"
              >
                {t.no}
              </button>
              <button
                onClick={() => {
                  deleteGoal(goalToDelete, true);
                  setGoalToDelete(null);
                  showToast(language === 'HT' ? 'Objektif la efase ak siksè!' : 'Objectif supprimé avec succès !', 'success');
                }}
                className="flex-1 py-3 px-4 bg-red-600 text-white hover:bg-red-500 font-bold rounded-xl text-xs uppercase transition-colors border-none cursor-pointer"
              >
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Internal safety wrapper to sum savings for completed goals
function calculateSavedForCompleted(goal: any, list: any[], rates: any) {
  if (list.length === 0) return goal.targetAmount;
  return calculateTotalSaved(list, goal.currency, rates);
}
