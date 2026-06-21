import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TRANSLATIONS, FREQ_LABELS } from '../lib/translations';
import { calculateTotalSaved, calculateProgress, convert, formatMoney, daysRemaining, formatDate } from '../lib/currency';
import { Search, Filter, Sparkles, Plus, Target, ChevronRight, Trophy, Award, Calendar, RefreshCw, TrendingUp, HelpCircle } from 'lucide-react';
import { getIconSymbol } from '../lib/icons';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface GoalsPageProps {
  onSelectGoal: (goalId: string) => void;
  onOpenAddGoal: () => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ onSelectGoal, onOpenAddGoal }) => {
  const { goals, completedGoals, contributions, rates, language, reopenGoal } = useAppContext();
  const t = TRANSLATIONS[language] || TRANSLATIONS.HT;

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'target'>('progress');

  // Dashboard Currency for combined totals
  const [dashCurrency, setDashCurrency] = useState<'HTG' | 'USD'>('HTG');

  // Combined goals across lists
  const allCombinedGoals = [
    ...goals.map(g => ({ ...g, statusType: 'active' as const })),
    ...completedGoals.map(g => ({ ...g, statusType: 'completed' as const }))
  ];

  // Helper metrics for overall Goals
  const activeCount = goals.length;
  const completedCount = completedGoals.length;
  const totalCount = activeCount + completedCount;

  // Compute calculated metrics
  const goalsWithCalculatedData = allCombinedGoals.map(goal => {
    const list = contributions[goal.id] || [];
    const saved = calculateTotalSaved(list, goal.currency, rates);
    const progress = calculateProgress(saved, goal.targetAmount);
    return {
      ...goal,
      saved,
      progress,
    };
  });

  // Calculate combined metrics for overall dashboard
  const activeCalculatedGoals = goals.map(goal => {
    const list = contributions[goal.id] || [];
    const saved = calculateTotalSaved(list, goal.currency, rates);
    
    // Converted to selected currency code
    const savedInDash = convert(saved, goal.currency, dashCurrency, rates);
    const targetInDash = convert(goal.targetAmount, goal.currency, dashCurrency, rates);
    
    // Monthly recommendation formula for each active goal
    const remainingVal = Math.max(0, goal.targetAmount - saved);
    const daysLeft = Math.max(1, daysRemaining(goal.targetDate));
    
    let daysInPeriod = 30.4375;
    if (goal.frequency === 'DAILY') daysInPeriod = 1;
    else if (goal.frequency === 'WEEKLY') daysInPeriod = 7;
    else if (goal.frequency === 'MONTHLY') daysInPeriod = 30.4375;
    else if (goal.frequency === 'QUARTERLY') daysInPeriod = 91.25;
    else if (goal.frequency === 'YEARLY') daysInPeriod = 365;

    const periodsLeft = daysLeft / daysInPeriod;
    const recommendedAmountPerPeriod = remainingVal / (periodsLeft < 1 ? 1 : periodsLeft);
    
    // Monthly normalizer
    let recommendedPerMonthInGoal = recommendedAmountPerPeriod;
    if (goal.frequency === 'DAILY') recommendedPerMonthInGoal = recommendedAmountPerPeriod * 30.4375;
    else if (goal.frequency === 'WEEKLY') recommendedPerMonthInGoal = recommendedAmountPerPeriod * 4.35;
    else if (goal.frequency === 'MONTHLY') recommendedPerMonthInGoal = recommendedAmountPerPeriod;
    else if (goal.frequency === 'QUARTERLY') recommendedPerMonthInGoal = recommendedAmountPerPeriod / 3;
    else if (goal.frequency === 'YEARLY') recommendedPerMonthInGoal = recommendedAmountPerPeriod / 12;

    const recommendedPerMonthInDash = convert(recommendedPerMonthInGoal, goal.currency, dashCurrency, rates);

    return {
      savedInDash,
      targetInDash,
      recommendedPerMonthInDash
    };
  });

  const totalSavedDash = activeCalculatedGoals.reduce((sum, g) => sum + g.savedInDash, 0);
  const totalTargetDash = activeCalculatedGoals.reduce((sum, g) => sum + g.targetInDash, 0);
  const totalRecommendedPerMonthDash = activeCalculatedGoals.reduce((sum, g) => sum + g.recommendedPerMonthInDash, 0);
  const overallProgressPercent = totalTargetDash > 0 ? Math.min(100, (totalSavedDash / totalTargetDash) * 100) : 0;

  // Monthly Labels across languages
  const monthNamesFR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const monthNamesHT = ['Jan', 'Fev', 'Mas', 'Apr', 'Me', 'Jen', 'Jiy', 'Out', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthNamesEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getMonthLabel = (offset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    const mIndex = d.getMonth();
    if (language === 'HT') return monthNamesHT[mIndex];
    if (language === 'FR') return monthNamesFR[mIndex];
    return monthNamesEN[mIndex];
  };

  // Build the 6-Month Projection Array for All Goals Combined
  const chartColumns = [];
  for (let i = -3; i <= 2; i++) {
    const isPast = i < 0;
    const isNow = i === 0;
    
    let simulatedAmount = 0;
    if (isPast) {
      const factor = (i + 4) / 4; // 0.25, 0.5, 0.75
      simulatedAmount = Math.max(0, totalSavedDash * factor);
    } else if (isNow) {
      simulatedAmount = totalSavedDash;
    } else {
      simulatedAmount = totalSavedDash + (totalRecommendedPerMonthDash * i);
    }

    const cappedAmount = Math.min(simulatedAmount, totalTargetDash * 1.5 || 1);

    chartColumns.push({
      label: getMonthLabel(i),
      isPast,
      isNow,
      amount: cappedAmount,
      rawAmount: simulatedAmount
    });
  }

  const chartMaxVal = Math.max(...chartColumns.map(c => c.amount), totalTargetDash, 100);

  // --- RECHARTS CUMULATIVE MONTHS DATA COMPILATION FOR GOALS PAGE ---
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
    const allContribs: { amountConverted: number; dateObj: Date }[] = [];
    Object.keys(contributions).forEach(gId => {
      const list = contributions[gId] || [];
      list.forEach(c => {
        const convertedVal = convert(c.amount, c.currency, dashCurrency, rates);
        allContribs.push({
          amountConverted: convertedVal,
          dateObj: new Date(c.date)
        });
      });
    });

    // Map each month to its cumulative sum
    return listMonths.map(m => {
      const limitDate = m.rawDate;
      const cumulativeSum = allContribs
        .filter(c => c.dateObj <= limitDate)
        .reduce((sum, c) => sum + c.amountConverted, 0);
        
      return {
        name: m.name,
        epaye: Math.round(cumulativeSum)
      };
    });
  })();

  // Filter application for searchable list
  const filteredGoals = goalsWithCalculatedData.filter(goal => {
    const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && goal.statusType === 'active') ||
      (statusFilter === 'completed' && goal.statusType === 'completed');

    return matchesSearch && matchesStatus;
  });

  // Sorting application
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'progress') {
      return b.progress - a.progress;
    } else if (sortBy === 'target') {
      return b.targetAmount - a.targetAmount;
    }
    return 0;
  });

  // Translations helper
  const htFrTexts = {
    searchPlaceholder: language === 'HT' ? 'Chache objektif...' : language === 'FR' ? 'Rechercher un objectif...' : 'Search goals...',
    allFilter: language === 'HT' ? 'Tout' : language === 'FR' ? 'Tous' : 'All',
    activeFilter: language === 'HT' ? 'An kour' : language === 'FR' ? 'En cours' : 'Active',
    completedFilter: language === 'HT' ? 'Reyalize' : language === 'FR' ? 'Complétés' : 'Completed',
    sortByLabel: language === 'HT' ? 'Triye pa' : language === 'FR' ? 'Trier par' : 'Sort by',
    sortByName: language === 'HT' ? 'Non' : language === 'FR' ? 'Nom' : 'Name',
    sortByProgress: language === 'HT' ? 'Pwogrè %' : language === 'FR' ? 'Progrès %' : 'Progress %',
    sortByTarget: language === 'HT' ? 'Kib valè' : language === 'FR' ? 'Cible' : 'Target amount',
    metricSubtitle: language === 'HT' ? 'Swiv ak jere planifikasyon finansyè ou' : language === 'FR' ? 'Suivi et gestion de votre planification financière' : 'Track and manage your financial planning center',
    achievedBadge: language === 'HT' ? 'REVALIZE 🏆' : language === 'FR' ? 'ATTEINT 🏆' : 'ACHIEVED 🏆',
    activeLabel: language === 'HT' ? 'Chak' : language === 'FR' ? 'Chaque' : 'Every',
    reactivateLabel: language === 'HT' ? 'Re-aktive' : language === 'FR' ? 'Réactiver' : 'Reactivate',
    viewDetailsLabel: language === 'HT' ? 'Gade Detay & Pwojeksyon' : language === 'FR' ? 'Voir détails & projection' : 'Details & Projections',
    goalsStats: language === 'HT' ? 'Estatisitiq Objektif' : language === 'FR' ? 'Statistiques des objectifs' : 'Goal Statistics'
  };

  return (
    <div className="goals-page-container space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300 pb-12">
      
      {/* Page Title & Premium Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-2xl md:text-3xl font-black text-amber-400 tracking-tight flex items-center gap-2">
            <Target size={28} className="text-[#f2ca50] animate-pulse" />
            {language === 'HT' ? 'Sant Planifikasyon' : language === 'FR' ? 'Centre de Planification' : 'Planning Goals Center'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {htFrTexts.metricSubtitle}
          </p>
        </div>

        {/* Quick action trigger button */}
        <button 
          onClick={onOpenAddGoal}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 px-5 py-3 rounded-xl transition duration-200 active:scale-95 shadow-[0_4px_15px_rgba(242,202,80,0.15)] cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          {t.newGoal}
        </button>
      </div>

      {/* 6-Month Combined Projection Dashboard Block (User Requested Amendment) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Graph Display Container (Span 2) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 bg-neutral-900/20 relative flex flex-col justify-between shadow-lg">
          
          <div className="flex justify-between items-start gap-3 mb-4">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Dashboard Jeneral</span>
              <h3 className="font-headline-md text-base md:text-lg font-black text-white">
                {language === 'HT' ? 'Pwojeksyon Plan Jeneral (6 Mwa)' : 'Projection Progressive Globale (6 Mois)'}
              </h3>
            </div>
            
            {/* Currency switcher toggles for overall aggregate dashboard projection */}
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setDashCurrency('HTG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dashCurrency === 'HTG' 
                    ? 'bg-amber-500 text-neutral-955 shadow-sm' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                G (HTG)
              </button>
              <button
                onClick={() => setDashCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dashCurrency === 'USD' 
                    ? 'bg-amber-500 text-neutral-955 shadow-sm' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                $ (USD)
              </button>
            </div>
          </div>

          {/* SVG Line / Bar progression area chart canvas */}
          <div className="relative h-44 flex flex-col justify-end overflow-hidden border border-white/5 bg-neutral-950/40 rounded-xl p-4">
            
            {/* Target cumulative line boundary indicator */}
            {totalTargetDash > 0 && (
              <div 
                className="absolute left-0 right-0 border-t border-dashed border-amber-500/20 w-full z-0 px-4 flex justify-between items-center pointer-events-none"
                style={{ 
                  bottom: `${Math.max(15, Math.min(85, (totalTargetDash / chartMaxVal) * 80))}%` 
                }}
              >
                <span className="text-[8px] text-amber-500/50 bg-neutral-900 border border-amber-500/5 px-2 py-0.5 rounded leading-none font-bold uppercase tracking-wider">
                  Cible: {formatMoney(totalTargetDash, dashCurrency)}
                </span>
              </div>
            )}

            {/* Visual Bars listing column projections */}
            <div className="flex items-end justify-between gap-3 h-full z-10 relative">
              {chartColumns.map((col, idx) => {
                const heightPercent = Math.max(8, Math.round((col.amount / chartMaxVal) * 80));
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group/chart relative">
                    
                    {/* Tooltip on hover details */}
                    <span className="absolute bottom-full mb-2 opacity-0 group-hover/chart:opacity-100 transition-opacity bg-neutral-950/95 border border-white/10 text-[9px] text-amber-400 font-extrabold py-1 px-2 rounded-lg pointer-events-none shadow-xl text-center min-w-[85px] z-50">
                      {formatMoney(col.rawAmount, dashCurrency)}
                    </span>

                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 relative ${
                        col.isPast 
                          ? 'bg-neutral-800' 
                          : col.isNow
                          ? 'bg-gradient-to-t from-emerald-600 to-amber-500 shadow-[0_0_15px_rgba(242,202,80,0.15)] ring-1 ring-amber-500/30'
                          : 'bg-gradient-to-t from-emerald-700 to-emerald-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 rounded-full"></div>
                    </div>

                    <span className={`text-[9px] font-black ${col.isNow ? 'text-amber-400' : 'text-neutral-500'}`}>
                      {col.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-4 leading-none pt-1">
            <Sparkles size={11} className="text-amber-400" />
            <span>Planification dynamique consolidée basée sur les dates de commencement et fin de vos {goals.length} projets.</span>
          </div>

        </div>

        {/* Aggregate KPI details card (Span 1) */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-neutral-900/40 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Progressions Combinées</span>
              <h4 className="text-2xl font-black text-amber-400 tracking-tight mt-1">{formatMoney(totalSavedDash, dashCurrency)}</h4>
              <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider">Épargné sur {formatMoney(totalTargetDash, dashCurrency)} cibles</p>
            </div>

            {/* Premium Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs font-mono">
                <span className="text-emerald-400 font-extrabold">{Math.round(overallProgressPercent)}% Konplete</span>
                <span className="text-neutral-500">{formatMoney(Math.max(0, totalTargetDash - totalSavedDash), dashCurrency)} restants</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${overallProgressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Recommendation block for total aggregate per month */}
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[9px] text-neutral-500 uppercase tracking-wider font-extrabold block">Recommandation Mensuelle Globale</span>
              <span className="text-sm font-extrabold text-amber-400 block">{formatMoney(totalRecommendedPerMonthDash, dashCurrency)} / {language === 'HT' ? 'mwa' : 'mois'}</span>
              <span className="text-[9px] text-neutral-400 block">Investissement cumulé nécessaire pour atteindre tous les objectifs.</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between text-[11px] text-neutral-400 mt-3 md:mt-0">
            <span>{goals.length} Projets Actifs</span>
            <span>{completedGoals.length} Archives</span>
          </div>
        </div>

      </section>

      {/* Goal Summary Statistics Counter row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/5 bg-neutral-900/40">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{language === 'HT' ? 'Kantite Objektif' : 'Total Objectifs'}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-[#f2ca50]">{totalCount}</span>
            <span className="text-xs text-neutral-500">objektif</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/5 bg-neutral-900/40">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{language === 'HT' ? 'Reyalize' : 'Complétés'}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-400">{completedCount}</span>
            <span className="text-xs text-neutral-500">achiv</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/5 bg-neutral-900/40">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{language === 'HT' ? 'An Kous' : 'En Cours'}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-amber-400">{activeCount}</span>
            <span className="text-xs text-neutral-500">aktif</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/5 bg-neutral-900/40 col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{language === 'HT' ? 'To Siksè' : 'Taux de Réussite'}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-400">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </span>
            <span className="text-xs text-neutral-500">de reyalizasyon</span>
          </div>
        </div>
      </section>

      {/* Search & Dynamic Filter Header Controls */}
      <section className="glass-card p-4 rounded-2xl border border-white/5 bg-neutral-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search bar inputs */}
        <div className="relative flex-grow max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input 
            type="text"
            placeholder={htFrTexts.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-950 border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl h-10 pl-10 pr-4 text-xs font-semibold text-neutral-200 outline-none transition-all placeholder:text-neutral-500"
          />
        </div>

        {/* Categories togglers and sorting selectors */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Filter Chips */}
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-100'
              }`}
            >
              {htFrTexts.allFilter}
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'active' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-100'
              }`}
            >
              {htFrTexts.activeFilter}
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'completed' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-100'
              }`}
            >
              {htFrTexts.completedFilter}
            </button>
          </div>

          {/* Sort selection drop down */}
          <div className="flex items-center gap-1.5 bg-neutral-950 px-3 py-2 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{htFrTexts.sortByLabel}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-xs font-bold text-amber-400 outline-none cursor-pointer focus:ring-0 pr-1 py-0 font-sans"
            >
              <option value="progress" className="bg-neutral-950 text-neutral-300">{htFrTexts.sortByProgress}</option>
              <option value="target" className="bg-neutral-950 text-neutral-300">{htFrTexts.sortByTarget}</option>
              <option value="name" className="bg-neutral-950 text-neutral-300">{htFrTexts.sortByName}</option>
            </select>
          </div>

        </div>
      </section>

      {/* 📈 COMPANION SAVINGS CUMULATIVE CHRONOLOGY (Recharts AreaChart matching the dashboard style) */}
      <section className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-neutral-100 text-sm md:text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-400" />
              {language === 'HT' ? 'Grafik Evolisyon Epay yo (6 Mwa)' : 'Évolution Cumulative Globale de l\'Épargne'}
            </h3>
            <p className="text-[10px] text-neutral-400">
              {language === 'HT' ? 'Koubyepay akimile sou dènye 6 mwa de tout depo yo ansanm' : 'Courbe de progression ascendante et cumulée de tous vos efforts financiers'}
            </p>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full uppercase">
            {language === 'HT' ? 'Deviz chwazi:' : 'Devise active :'} {dashCurrency}
          </span>
        </div>

        <div className="h-56 w-full pr-2">
          {totalSavedDash === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-4 bg-neutral-950/40 rounded-xl border border-white/5">
              <p className="text-xs text-neutral-500">
                {language === 'HT' ? 'Depoze kèk kòb nan objektif ou yo pou wè grafik sa a grandi! 🌱' : 'Enregistrez votre première contribution pour tracer votre courbe de progression globale ! 🌱'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavGoals" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(value: any) => [`${value.toLocaleString('fr-FR')} ${dashCurrency}`, language === 'HT' ? 'Total Epanye' : 'Total Épargné']}
                />
                <Area 
                  type="monotone" 
                  dataKey="epaye" 
                  stroke="#f2ca50" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorSavGoals)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Grid listing of custom high-fidelity goal models */}
      <section className="space-y-4">
        {sortedGoals.length === 0 ? (
          <div className="text-center py-16 bg-neutral-950 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center">
            <span className="text-3xl mb-2">🔍</span>
            <p className="text-neutral-400 text-xs font-bold font-mono">
              {language === 'HT' ? 'Okenn objektif pa koresponn ak chaché sa...' : 'Aucun objectif ne correspond à vos critères...'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedGoals.map((goal) => {
              const ringRadius = 24;
              const ringCircumference = 2 * Math.PI * ringRadius;
              const daysLeft = daysRemaining(goal.targetDate);
              const freqOptionLabel = FREQ_LABELS[goal.frequency]?.[language] || FREQ_LABELS[goal.frequency]?.EN || 'période';

              return (
                <div 
                  key={goal.id} 
                  className={`glass-card rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                    goal.statusType === 'completed' 
                      ? 'border-emerald-500/15 bg-emerald-500/[0.01] hover:border-emerald-500/30' 
                      : 'border-white/5 hover:border-amber-500/20 bg-neutral-900/20 shadow-md hover:shadow-[0_4px_25px_rgba(242,202,80,0.03)] focus-within:ring-1 focus-within:ring-amber-500/40'
                  }`}
                >
                  {/* Decorative glowing gradient blur backgrounds */}
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl pointer-events-none transition-opacity duration-300 opacity-20 ${
                    goal.statusType === 'completed' ? 'bg-emerald-500/10' : 'bg-amber-500/10 group-hover:opacity-40'
                  }`}></div>

                  <div className="p-5 space-y-4 relative z-10">
                    
                    {/* Upper row: icon, name, status indicator & gauge graphs */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        {/* Interactive Goal Symbol icon bubble container */}
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl transition-all duration-300 ${
                          goal.statusType === 'completed' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-neutral-950 border-white/5 text-[#f2ca50] group-hover:bg-amber-500/5 group-hover:border-amber-500/20'
                        }`}>
                          {getIconSymbol(goal.icon)}
                        </div>
                        <div>
                          <h3 className="font-headline-md text-base font-black text-neutral-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                            {goal.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {goal.statusType === 'completed' ? (
                              <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase">
                                {htFrTexts.achievedBadge}
                              </span>
                            ) : (
                              <span className="text-[9px] font-black text-neutral-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full uppercase font-mono">
                                {htFrTexts.activeLabel} {freqOptionLabel}
                              </span>
                            )}
                            <span className="text-[10px] text-neutral-500">•</span>
                            <span className="text-[10px] text-neutral-400 font-bold inline-flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(goal.targetDate, language === 'EN' ? 'en-US' : 'fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mini Round gauge meter matching top right design profile */}
                      <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                          <circle 
                            cx="30" 
                            cy="30" 
                            r={ringRadius} 
                            fill="transparent" 
                            stroke="rgba(255,255,255,0.03)" 
                            strokeWidth="4" 
                          />
                          <circle
                            cx="30"
                            cy="30"
                            r={ringRadius}
                            fill="transparent"
                            stroke={goal.statusType === 'completed' ? '#10b981' : 'url(#goldProgressMini)'}
                            strokeWidth="4.5"
                            strokeDasharray={ringCircumference}
                            strokeDashoffset={ringCircumference - (Math.min(100, goal.progress) / 100) * ringCircumference}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                          <defs>
                            <linearGradient id="goldProgressMini" x1="0%" x2="100%" y1="0%" y2="100%">
                              <stop offset="0%" stopColor="#d4af37" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-tighter text-neutral-200">
                          {Math.round(goal.progress)}%
                        </span>
                      </div>
                    </div>

                    {/* Start/End project timeline summary (User requested commencement/finicement) */}
                    <div className="p-2 py-1.5 bg-neutral-950/40 rounded-lg border border-white/3 flex justify-between items-center text-[10px] text-neutral-500 font-medium">
                      <span>Démarre: <span className="text-neutral-300 font-bold">{formatDate(goal.startDate || goal.createdDate || '', 'fr-FR')}</span></span>
                      <span>Échéance: <span className="text-neutral-300 font-bold">{formatDate(goal.endDate || goal.targetDate || '', 'fr-FR')}</span></span>
                    </div>

                    {/* Progress details line indicator */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end text-xs">
                        <div>
                          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">{language === 'HT' ? 'Epanye' : 'Épargné'}</span>
                          <span className="font-extrabold text-[#f2ca50] tracking-tight">{formatMoney(goal.saved, goal.currency)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">{language === 'HT' ? 'Kib Cible' : 'Objectif'}</span>
                          <span className="font-extrabold text-neutral-300">{formatMoney(goal.targetAmount, goal.currency)}</span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-neutral-955 rounded-full overflow-hidden relative border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            goal.statusType === 'completed' 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                              : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                          }`}
                          style={{ width: `${Math.min(100, goal.progress)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Row Actions: view details and reactivation tags */}
                    <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-1 text-[11px] text-neutral-400">
                      
                      <span className="font-bold flex items-center gap-1 font-mono text-neutral-500">
                        {goal.statusType === 'completed' ? (
                          <span className="text-emerald-400 flex flex-wrap items-center gap-1.5 font-mono">
                            <Trophy size={11} />
                            {goal.completionType === 'closed' ? (
                              <span className="text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded text-[9px] uppercase">
                                🛑 {language === 'HT' ? 'Sispann' : 'Clos'}
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-bold">
                                {language === 'HT' ? 'Konplè' : 'Atteint'}
                                {goal.completionReason === 'promo' && ' 🏷️'}
                                {goal.completionReason === 'help' && ' 🤝'}
                                {goal.completionReason === 'balance' && ' 💰'}
                                {goal.completionReason === 'early' && ' ⚡'}
                              </span>
                            )}
                            {goal.daysSavedAhead && goal.daysSavedAhead > 0 ? (
                              <span className="text-[#f2ca50] text-[9px] font-bold bg-amber-500/15 px-1.5 py-0.5 rounded">
                                +{goal.daysSavedAhead}j
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span>
                            {daysLeft > 0 ? `${daysLeft} ${t.daysLeft}` : 'Date limite dépassée'}
                          </span>
                        )}
                      </span>

                      {goal.statusType === 'completed' ? (
                        <div className="flex gap-2.5 items-center">
                          <button
                            onClick={() => reopenGoal(goal.id)}
                            className="text-amber-500 hover:text-amber-400 font-extrabold cursor-pointer bg-transparent border-none outline-none leading-none pr-1 text-[11px]"
                          >
                            {htFrTexts.reactivateLabel}
                          </button>
                          <span className="text-neutral-700">|</span>
                          <button
                            onClick={() => onSelectGoal(goal.id)}
                            className="text-amber-400 hover:text-amber-300 font-extrabold cursor-pointer flex items-center gap-0.5 transition-all leading-none border-none bg-transparent outline-none uppercase text-[10px] tracking-wider"
                          >
                            {htFrTexts.viewDetailsLabel}
                            <ChevronRight size={11} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectGoal(goal.id)}
                          className="text-amber-400 group-hover:text-amber-300 font-black cursor-pointer flex items-center gap-1 transition-all leading-none border-none bg-transparent outline-none uppercase text-[10px] tracking-wider"
                        >
                          {htFrTexts.viewDetailsLabel}
                          <ChevronRight size={13} className="transform group-hover:translate-x-0.5 duration-200" />
                        </button>
                      )}

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Haitian financial quote */}
      <footer className="pt-8 text-center border-t border-white/5">
        <p className="text-xs text-neutral-500 font-medium italic tracking-widest leading-relaxed">
          {t.haitianVibe}
        </p>
      </footer>

    </div>
  );
};
