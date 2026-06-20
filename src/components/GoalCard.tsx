import React from 'react';
import { Goal } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { calculateTotalSaved, calculateProgress, formatMoney, daysRemaining } from '../lib/currency';
import { ChevronRight, Award, Flame, Hourglass } from 'lucide-react';
import { getIconSymbol } from '../lib/icons';

interface GoalCardProps {
  goal: Goal;
  onSelect: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onSelect }) => {
  const { contributions, rates, language } = useAppContext();
  
  const list = contributions[goal.id] || [];
  const saved = calculateTotalSaved(list, goal.currency, rates);
  const progress = calculateProgress(saved, goal.targetAmount);
  const daysLeft = daysRemaining(goal.targetDate);

  // Timeline Estimator calculations
  const avgContribution = list.length > 0 ? saved / list.length : 0;
  const remainingValue = Math.max(0, goal.targetAmount - saved);
  let estText = '';

  if (progress >= 100) {
    estText = language === 'HT' ? 'Objektif reyisi! 🎉' : 'Objectif atteint ! 🎉';
  } else if (list.length > 0 && avgContribution > 0) {
    const requiredPeriods = Math.ceil(remainingValue / avgContribution);
    let daysPerPeriod = 30;
    if (goal.frequency === 'DAILY') daysPerPeriod = 1;
    else if (goal.frequency === 'WEEKLY') daysPerPeriod = 7;
    else if (goal.frequency === 'MONTHLY') daysPerPeriod = 30;
    else if (goal.frequency === 'QUARTERLY') daysPerPeriod = 90;
    else if (goal.frequency === 'YEARLY') daysPerPeriod = 365;

    const estDays = requiredPeriods * daysPerPeriod;
    const estMonths = (estDays / 30).toFixed(1);
    
    if (language === 'HT') {
      estText = `Ritm: ~${estMonths} mwa (${requiredPeriods} depo)`;
    } else {
      estText = `Rythme : ~${estMonths} mois (${requiredPeriods} dépôts)`;
    }
  } else {
    estText = language === 'HT' ? "Tantann premye depo" : "En attente d'un dépôt";
  }

  // Status indicators for Priority 3
  const isHighProgress = progress >= 80 && progress < 100;
  const isCloseToDeadline = daysLeft > 0 && daysLeft <= 30;

  return (
    <div 
      onClick={() => onSelect(goal.id)}
      className="glass-card rounded-2xl p-5 hover:bg-neutral-800/40 border border-white/5 hover:border-amber-500/30 transition-all duration-300 cursor-pointer group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
    >
      {/* Decorative background visual */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

      {/* Badges container for Priority 3 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {isHighProgress && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <Flame size={12} className="animate-bounce" />
            🔥 Près du but
          </span>
        )}
        {isCloseToDeadline && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.1)] animate-pulse">
            <Hourglass size={12} />
            ⏳ &lt; 30 jours ({daysLeft}j)
          </span>
        )}
      </div>

      <div className="flex justify-between items-start gap-3">
        {/* Left Side: Avatar/Icon and Name */}
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
            {getIconSymbol(goal.icon)}
          </div>
          <div>
            <h4 className="font-bold text-neutral-100 group-hover:text-amber-400 transition-colors text-base line-clamp-1">
              {goal.name}
            </h4>
            <span className="text-xs text-neutral-400 font-medium block">
              Cible: {formatMoney(goal.targetAmount, goal.currency)}
            </span>
          </div>
        </div>

        {/* Right Arrow */}
        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-amber-400 group-hover:bg-neutral-700/50 transition-all">
          <ChevronRight size={16} />
        </div>
      </div>

      {/* Progression details (Priority 2 visual) */}
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          {/* Partially saved description requested in priority 2 */}
          <span className="text-neutral-400">
            {formatMoney(saved, goal.currency)} / {formatMoney(goal.targetAmount, goal.currency)}
          </span>
          <span className="text-emerald-400 flex items-center gap-1 font-bold">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Custom multi-color progress bar */}
        <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Frequency & Deadline labels */}
        <div className="flex justify-between items-center text-[10px] text-neutral-500 pt-1 font-medium">
          <span className="uppercase tracking-wider">
            ({goal.frequency === 'WEEKLY' ? 'Hebdomadaire' : goal.frequency === 'MONTHLY' ? 'Mensuel' : goal.frequency === 'QUARTERLY' ? 'Trimestriel' : 'Annuel'})
          </span>
          <span>
            {daysLeft > 0 ? `${daysLeft} jours restants` : 'Date dépassée'}
          </span>
        </div>

        {/* Dynamic Timeline Rhythm Estimator */}
        <div className="font-mono text-[9px] text-amber-400 bg-amber-400/5 border border-amber-500/10 px-2 py-1 rounded-md flex items-center gap-1 mt-1 font-semibold">
          <span>🕒</span>
          <span className="truncate">{estText}</span>
        </div>
      </div>
    </div>
  );
};
