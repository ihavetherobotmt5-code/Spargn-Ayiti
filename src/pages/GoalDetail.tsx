import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TRANSLATIONS, FREQ_LABELS } from '../lib/translations';
import { calculateTotalSaved, calculateProgress, formatMoney, daysRemaining, formatDate, calculateRecommendedAmount, convert } from '../lib/currency';
import { ArrowLeft, Trash2, CheckCircle, Plus, Sparkles, Coins, Lightbulb, TrendingUp, Lock, Search, Download, X } from 'lucide-react';
import { ProjectionChart } from '../components/ProjectionChart';
import { AddContributionDialog } from '../components/AddContributionDialog';
import Markdown from 'react-markdown';
import { CurrencyCode } from '../types';

interface GoalSuccessBannerProps {
  goalName: string;
  saved: number;
  target: number;
  currency: CurrencyCode;
  language: 'FR' | 'HT' | 'EN';
  onMarkComplete?: () => void;
  status?: 'active' | 'completed';
}

const GoalSuccessBanner: React.FC<GoalSuccessBannerProps> = ({
  goalName,
  saved,
  target,
  currency,
  language,
  onMarkComplete,
  status
}) => {
  const isHT = language === 'HT';
  const isEN = language === 'EN';

  const title = isHT
    ? "Olye bravo ! Ou rive nan bout li ! 🥳"
    : isEN
    ? "Outstanding achievement! You reached your goal! 🥳"
    : "Félicitations éclatantes ! Vous y êtes arrivé ! 🥳";

  const bannerText = isHT
    ? `Ou sove yon total de ${formatMoney(saved, currency)} sou yon sib de ${formatMoney(target, currency)}. Se yon bofik siksè finansye !`
    : isEN
    ? `You have saved a total of ${formatMoney(saved, currency)} out of your ${formatMoney(target, currency)} target. Outstanding financial discipline!`
    : `Vous avez épargné un total de ${formatMoney(saved, currency)} sur une cible de ${formatMoney(target, currency)}. Quelle superbe discipline financière !`;

  const btnText = isHT ? "Marke kòm reyalize" : isEN ? "Mark as completed" : "Marquer comme complété";

  return (
    <div id="goal-success-banner" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/20 via-amber-500/10 to-emerald-500/10 border-2 border-emerald-500/40 p-6 md:p-8 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Sparkles / Ambient light effects */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row relative z-10 w-full md:w-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 p-0.5 shadow-lg flex-shrink-0 flex items-center justify-center animate-bounce">
          <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-3xl">
            🏆
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="font-extrabold text-lg md:text-xl text-emerald-400 tracking-tight flex items-center gap-2 justify-center md:justify-start">
            <span>{title}</span>
            <Sparkles size={16} className="text-amber-400" />
          </h2>
          <p className="text-neutral-200 text-xs md:text-sm leading-relaxed max-w-xl font-medium">
            {bannerText}
          </p>
        </div>
      </div>

      {status !== 'completed' && onMarkComplete && (
        <button
          onClick={onMarkComplete}
          className="relative z-10 font-bold uppercase text-xs tracking-wider text-neutral-950 bg-gradient-to-r from-emerald-400 to-[#f2ca50] hover:from-emerald-300 hover:to-amber-300 py-3.5 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer shrink-0 active:scale-95"
        >
          ✅ {btnText}
        </button>
      )}
    </div>
  );
};

interface GoalDetailProps {
  goalId: string;
  onBack: () => void;
}

export const GoalDetail: React.FC<GoalDetailProps> = ({ goalId, onBack }) => {
  const { 
    goals, 
    completedGoals,
    contributions, 
    rates, 
    language, 
    userName,
    deleteGoal, 
    deleteContribution, 
    markGoalAsCompleted,
    reopenGoal,
    showToast 
  } = useAppContext();

  const t = TRANSLATIONS[language] || TRANSLATIONS.HT;

  // Localized dictionaries for advanced detail elements
  const detailTranslations = {
    FR: {
      congratsTitle: "Félicitations ! 🏆",
      congratsText: "Cet objectif a été atteint avec succès",
      congratsOn: "le",
      disabledAddedTitle: "Archivé",
      disabledAddedDesc: "Cet objectif est archivé. Réactivez-le pour ajouter de nouveaux dépôts.",
      reactivateBtn: "Réactiver l'objectif",
      searchTransPlaceholder: "Rechercher un dépôt...",
      filterAll: "Tous",
      filterBig: "Gros dépôts",
      filterNote: "Avec note",
      exportCSV: "Exporter (.CSV)",
      noMatches: "Aucun dépôt ne correspond à votre recherche.",
      aiCoachTitle: "Pyas AI Coach ⚡",
      aiCoachSubtitle: "Votre planificateur financier intelligent",
      aiCoachPromptBtn: "Créer un plan d'action de l'IA",
      aiCoachGenerating: "Planification en cours (Pyas analyse vos données)...",
      aiCoachIntro: "Envie d'accélérer vos économies pour cet objectif ? Pyas AI peut analyser votre rythme actuel et formuler 3 actions concrètes pour réussir !",
      aiCoachDisclaimer: "Pyas s'adapte à vos données réelles pour vous offrir des solutions de budget sur-mesure.",
      // Early completion strings
      completeEarlyTitle: "Félicitations ! 🎉",
      completeEarlySubtitle: "Voulez-vous marquer cet objectif comme réalisé même si l'épargne n'a pas encore atteint 100 % ?",
      completeEarlyExplanation: "Cela arrive souvent si vous avez trouvé une promotion, si un proche vous a soutenu, ou si vous disposiez déjà d'un complément d'argent.",
      reasonLabel: "Pourquoi marquez-vous cet objectif comme réalisé ?",
      reasonPromoCategory: "promo",
      reasonPromo: "🏷️ J'ai bénéficié d'une promotion / rabais",
      reasonHelp: "🤝 Un proche ou un membre de ma famille m'a aidé",
      reasonBalance: "💰 Je disposais déjà du reste de l'argent nécessaire",
      reasonEarly: "⚡ J'ai obtenu ce que je voulais plus tôt que prévu",
      reasonOther: "🔮 Autre raison",
      closeGoalTitle: "Fermer l'objectif sans atteindre 100 %",
      closeGoalDesc: "Vous souhaitez abandonner ou arrêter cet objectif ? Vos économies ne seront pas effacées et l'historique sera conservé.",
      btnKeepSaving: "⬅️ Continuer l'épargne",
      btnConfirmRealized: "🎉 Oui, je l'ai réalisé !",
      btnConfirmClosed: "🛑 Fermer cet objectif",
      daysAheadText: "Vous avez réalisé votre objectif !",
      daysAheadPlan: "Incroyable ! Vous avez devancé votre plan de {{days}} jours. Vous aviez prévu de terminer le {{targetDate}}, mais vous l'avez obtenu aujourd'hui !",
      statusClosedLabel: "Clos / Arrêté",
      statusRealizedLabel: "Réalisé",
    },
    HT: {
      congratsTitle: "Gwo Bravo ! 🏆",
      congratsText: "Yo te reyalize objektif sa a avèk siksè",
      congratsOn: "nan dat",
      disabledAddedTitle: "Depo Deaktif",
      disabledAddedDesc: "Objektif sa a achive. Re-aktive l pou w ka mete nouvo depo kòrèkteman.",
      reactivateBtn: "Re-aktive objektif la",
      searchTransPlaceholder: "Chèche depo...",
      filterAll: "Tout",
      filterBig: "Gwo depo",
      filterNote: "Ak nòt",
      exportCSV: "Ekspòte (.CSV)",
      noMatches: "Pa gen depo ki koresponn ak sa.",
      aiCoachTitle: "Kach Pyas AI ⚡",
      aiCoachSubtitle: "Planifikatè finansye entèlijan baze sou done w",
      aiCoachPromptBtn: "Kreye plan aksyon avèk IA",
      aiCoachGenerating: "Pyas ap analize kounye a...",
      aiCoachIntro: "Ou ta renmen fini ak objektif sa a pi vit ? Pyas AI ka analize kijan w ap mete depo yo kounye a epi ba w 3 fòmil pratik pou w reyisi !",
      aiCoachDisclaimer: "Pyas gade done reyèl ou pou l ba w konsèy ak estrateji ki reyalize.",
      // Early completion strings
      completeEarlyTitle: "Felisitasyon ! 🎉",
      completeEarlySubtitle: "Ou vle make objektif sa a kòm reyalize menm si ekonomi an poko rive 100 % ?",
      completeEarlyExplanation: "Sa rive pafwa paske ou jwenn yon rabè, yon fanmi ede w, oswa ou te deja gen yon pati nan lajan an.",
      reasonLabel: "Poukisa ou vle make objektif sa kòm reyalize ?",
      reasonPromoCategory: "promo",
      reasonPromo: "🏷️ Mwen jwenn yon rabè / bon afè",
      reasonHelp: "🤝 Yon fanmi oswa yon zanmi ede m",
      reasonBalance: "💰 Mwen te deja gen rès lajan an nan men m",
      reasonEarly: "⚡ Mwen rive jwenn sa m te vle a pi bonè",
      reasonOther: "🔮 Lòt rezon",
      closeGoalTitle: "Fèmen objektif la san rive nan 100 %",
      closeGoalDesc: "Èske ou vle sispann oswa abandone objektif sa a ? Sa pap efase depo ak ekonomi ou te deja fè yo. Yo rete nan istwa.",
      btnKeepSaving: "⬅️ Kontinye ekonomize",
      btnConfirmRealized: "🎉 Wi, mwen reyalize l !",
      btnConfirmClosed: "🛑 Fèmen objektif sa a",
      daysAheadText: "Ou fini objektif ou avèk siksè !",
      daysAheadPlan: "Ekselan ! Ou depase plan an avèk {{days}} jou davans ! Ou te prevwa fini dat {{targetDate}}, men ou rive jwenn li jodi a !",
      statusClosedLabel: "Fèmen / Sispann",
      statusRealizedLabel: "Reyalize",
    },
    EN: {
      congratsTitle: "Congratulations! 🏆",
      congratsText: "This goal was successfully achieved",
      congratsOn: "on",
      disabledAddedTitle: "Archived",
      disabledAddedDesc: "This goal is archived. Reactivate it to add new deposits.",
      reactivateBtn: "Reactivate Goal",
      searchTransPlaceholder: "Search deposits...",
      filterAll: "All",
      filterBig: "Big deposits",
      filterNote: "With note",
      exportCSV: "Export (.CSV)",
      noMatches: "No deposits match your search criteria.",
      aiCoachTitle: "Pyas AI Coach ⚡",
      aiCoachSubtitle: "Your intelligent financial gameplan",
      aiCoachPromptBtn: "Formulate AI custom action plan",
      aiCoachGenerating: "Running optimization analysis...",
      aiCoachIntro: "Looking to hasten completion of this goal? Pyas AI can analyze your current rate and compile a 3-step actionable strategy for you!",
      aiCoachDisclaimer: "Pyas utilizes your real-time stats to draft precise, achievable financial milestones.",
      // Early completion strings
      completeEarlyTitle: "Congratulations! 🎉",
      completeEarlySubtitle: "Do you want to mark this goal as achieved even though your savings haven't reached 100% yet?",
      completeEarlyExplanation: "This often happens if you found a discount, received help from someone, or already had the remaining balance.",
      reasonLabel: "Why are you marking this goal as completed?",
      reasonPromoCategory: "promo",
      reasonPromo: "🏷️ I found a discount / promotion",
      reasonHelp: "🤝 A friend or family member helped me",
      reasonBalance: "💰 I already had the remaining money",
      reasonEarly: "⚡ I achieved my target earlier than expected",
      reasonOther: "🔮 Other reason",
      closeGoalTitle: "Close goal without reaching 100%",
      closeGoalDesc: "Do you want to stop or abandon this goal? Your savings will not be deleted and history will be preserved.",
      btnKeepSaving: "⬅️ Continue saving",
      btnConfirmRealized: "🎉 Yes, I accomplished it!",
      btnConfirmClosed: "🛑 Close this goal",
      daysAheadText: "Goal achieved with success!",
      daysAheadPlan: "Amazing! You completed your plan {{days}} days ahead of schedule! You had planned to finish on {{targetDate}}, but you got it today!",
      statusClosedLabel: "Closed / Stopped",
      statusRealizedLabel: "Achieved",
    }
  };

  const df = detailTranslations[language] || detailTranslations.HT;

  const [showAddContribution, setShowAddContribution] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBypassCompleteConfirm, setShowBypassCompleteConfirm] = useState(false);
  const [completeStep, setCompleteStep] = useState<'options' | 'realized_reason' | 'close_confirm' | 'celebrate'>('options');
  const [selectedReason, setSelectedReason] = useState<string>('promo');
  const [daysAheadCalculated, setDaysAheadCalculated] = useState<number>(0);
  const [contribToDelete, setContribToDelete] = useState<string | null>(null);
  
  // Advanced history tools state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState<'all' | 'big' | 'notes'>('all');

  // Pyas AI inline advisor plan state
  const [aiPlan, setAiPlan] = useState<string | null>(() => {
    return localStorage.getItem(`spargn_ai_plan_${goalId}`) || null;
  });
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Selector state for multi-currency viewing
  const [displayCurrency, setDisplayCurrency] = useState<'ORIGINAL' | 'HTG' | 'USD'>('ORIGINAL');

  const goal = goals.find(g => g.id === goalId) || completedGoals.find(g => g.id === goalId);

  if (!goal) {
    return (
      <div className="text-center py-12 bg-neutral-900 border border-white/5 rounded-2xl p-6">
        <p className="text-neutral-400 mb-4 font-semibold">Objectif introuvable ou archivé</p>
        <button 
          onClick={onBack}
          className="text-amber-400 hover:text-amber-300 font-bold flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} /> {t.back}
        </button>
      </div>
    );
  }

  const list = contributions[goal.id] || [];
  const saved = calculateTotalSaved(list, goal.currency, rates);
  const progress = calculateProgress(saved, goal.targetAmount);
  const remainingValue = Math.max(0, goal.targetAmount - saved);
  const daysLeft = daysRemaining(goal.targetDate);

  // Derived converted metrics for user display toggle
  const viewCurrency = displayCurrency === 'ORIGINAL' ? goal.currency : displayCurrency;
  const viewSaved = convert(saved, goal.currency, viewCurrency, rates);
  const viewTarget = convert(goal.targetAmount, goal.currency, viewCurrency, rates);
  const viewRemaining = convert(remainingValue, goal.currency, viewCurrency, rates);

  // Helper context for AI Coach
  const getContextForCoach = () => {
    const solWeeklyHand = Number(localStorage.getItem('spargn_sol_hand') || '1000');
    const solSelectedTurn = Number(localStorage.getItem('spargn_sol_turn') || '2');
    const solWeek = Number(localStorage.getItem('spargn_sol_week') || '1');
    const emergencyFund = Number(localStorage.getItem('spargn_emergency_fund') || '0');
    const solPaidWeeksRaw = localStorage.getItem('spargn_sol_paid');
    const solPaidWeeks = solPaidWeeksRaw ? JSON.parse(solPaidWeeksRaw) : [false, false, false, false];
    const solPayout = solWeeklyHand * 4;

    const contributionsSummary: Record<string, { count: number; total: number }> = {};
    Object.keys(contributions).forEach(gId => {
      const listObj = contributions[gId] || [];
      const sum = listObj.reduce((acc, curr) => acc + curr.amount, 0);
      contributionsSummary[gId] = {
        count: listObj.length,
        total: sum
      };
    });

    return {
      language,
      userName,
      goals: goals.map(g => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currency: g.currency,
        icon: g.icon,
        saved: contributionsSummary[g.id]?.total || 0,
        targetDate: g.targetDate,
        frequency: g.frequency
      })),
      contributionsSummary,
      solWeeklyHand,
      solSelectedTurn,
      solWeek,
      solPaidWeeks,
      solPayout,
      emergencyFund
    };
  };

  const generateAiPlan = async () => {
    setAiIsLoading(true);
    setAiError(null);
    try {
      const appContextValue = getContextForCoach();
      const pct = progress.toFixed(1);

      const prompt = language === 'HT' 
        ? `Mwen vle yon plan aksyon pèsonalize, reyalis e motivan an 3 pwen kle pou m fin reyalize objektif mwen '[Objetif: ${goal.name}]'. Cible mwen se ${goal.targetAmount} ${goal.currency} e kounye a mwen deja sove ${saved} ${goal.currency} (${pct}%). Bann astis pratik ak solisyon selon sitiyasyon finansyè m ak fréquence de dépôt m ki se : ${goal.frequency}. Repon dirèkteman an kreyòl ayisyen nan yon bèl fòma Markdown ak ti list à puces ak emoji enteresan pou bay fòs. Kòmanse ak yon akeyi dous pou mwen menm ${userName}.`
        : `Formule-moi un plan d'action personnalisé, ultra-réaliste, moderne et motivant en exactement 3 points courts pour m'aider à compléter mon objectif '${goal.name}'. Ma cible est de ${goal.targetAmount} ${goal.currency}, et j'ai actuellement capitalisé ${saved} ${goal.currency} (${pct}%). Propose des astuces très concrètes d'économie adaptées à ma fréquence d'épargne : ${goal.frequency}. Rédige entièrement en Français avec un style Markdown soigné (paragraphes aérés, puces, emojis pertinents). Salue-moi chaleureusement (en m'appelant ${userName}) pour commencer.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: prompt }
          ],
          context: appContextValue
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error");
      }

      const data = await response.json();
      const planContent = data.content || "Impossible d'analyser le budget actuellement.";
      setAiPlan(planContent);
      localStorage.setItem(`spargn_ai_plan_${goalId}`, planContent);
      showToast(language === 'HT' ? 'Plan aksyon pèsonalize pare ⚡' : 'Plan personnalisé prêt ! ✨', 'success');
    } catch (e) {
      console.error(e);
      setAiError(language === 'HT' ? 'Erè koneksyon. Tanpri verifye kle GEMINI_API_KEY ou nan paramètres yo oswa eseye ankò.' : 'Impossible de contacter le service Pyas AI. Veuillez vous assurer que la variable GEMINI_API_KEY est bien configurée.');
    } finally {
      setAiIsLoading(false);
    }
  };

  // Timeline Estimator calculations
  const avgContribution = list.length > 0 ? saved / list.length : 0;
  const viewAvgContribution = convert(avgContribution, goal.currency, viewCurrency, rates);
  let estText = '';
  let estDateText = '';

  if (progress >= 100) {
    estText = language === 'HT' ? 'Objektif sa a konplete deja! 🎉' : 'Objectif déjà atteint ! 🎉';
    estDateText = '';
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
    
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + estDays);

    if (language === 'HT') {
      estText = `Avèk mwayèn ${formatMoney(viewAvgContribution, viewCurrency)} pa depo, w ap bezwen apeprè ${requiredPeriods} depo ankò.`;
      estDateText = `Estimatasyon Konplete : d'ici ~${estMonths} mwa (${formatDate(estDate.toISOString().split('T')[0], 'fr-FR')})`;
    } else {
      estText = `Avec une moyenne de ${formatMoney(viewAvgContribution, viewCurrency)} par dépôt, il vous reste environ ${requiredPeriods} dépôts.`;
      estDateText = `Date d'achèvement estimée : d'ici ~${estMonths} mois (${formatDate(estDate.toISOString().split('T')[0], 'fr-FR')})`;
    }
  } else {
    estText = language === 'HT' ? "Mete yon premye depo pou wè vitès ou." : "Ajoutez un premier dépôt pour estimer votre rythme d'épargne d'avenir.";
  }

  // Recommendations calculation (Priority 1)
  const recommendedAmount = calculateRecommendedAmount(
    goal.targetAmount,
    saved,
    goal.targetDate,
    goal.frequency
  );
  const viewRecommendedAmount = convert(recommendedAmount, goal.currency, viewCurrency, rates);

  const freqOptionLabel = FREQ_LABELS[goal.frequency]?.[language] || FREQ_LABELS[goal.frequency]?.EN || 'période';

  const handleDeleteGoal = () => {
    deleteGoal(goal.id);
    onBack();
  };

  const handleForceCompleteGoal = () => {
    setShowBypassCompleteConfirm(false);
    markGoalAsCompleted(goal.id);
    showToast(t.goalAchievedToast, 'success');
    onBack();
  };

  const handleMarkAsCompleted = () => {
    if (progress < 100) {
      setCompleteStep('options');
      setSelectedReason('promo');
      setDaysAheadCalculated(0);
      setShowBypassCompleteConfirm(true);
      return;
    }
    markGoalAsCompleted(goal.id);
    showToast(t.goalAchievedToast, 'success');
    onBack();
  };

  const handleConfirmEarlyRealized = () => {
    const targetDt = new Date(goal.targetDate);
    const todayDt = new Date();
    const diffTime = targetDt.getTime() - todayDt.getTime();
    const daysAhead = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysAhead > 0) {
      setDaysAheadCalculated(daysAhead);
      setCompleteStep('celebrate');
    } else {
      markGoalAsCompleted(goal.id, selectedReason, 'realized', progress, 0);
      showToast(t.goalAchievedToast, 'success');
      onBack();
    }
  };

  const handleFinishCelebrate = () => {
    markGoalAsCompleted(goal.id, selectedReason, 'realized', progress, daysAheadCalculated);
    showToast(t.goalAchievedToast, 'success');
    onBack();
  };

  const handleConfirmClosed = () => {
    markGoalAsCompleted(goal.id, 'closed_unrealized', 'closed', progress, 0);
    showToast(language === 'HT' ? 'Objektif fèmen ak siksè !' : 'Objectif clos avec succès !', 'success');
    onBack();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Montant,Devise,Date,Note\r\n";
    list.forEach(contrib => {
      const row = [
        contrib.id || "",
        contrib.amount,
        contrib.currency,
        contrib.date,
        `"${(contrib.note || "").replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historique-depots-${goal.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(language === 'HT' ? 'Istorik depo ekspòte kòm CSV!' : 'Historique des dépôts exporté avec succès !', 'success');
  };

  const filteredList = list.slice().filter(contrib => {
    // 1st: filterOption
    if (filterOption === 'big') {
      const threshold = goal.targetAmount * 0.1;
      if (contrib.amount < threshold) return false;
    } else if (filterOption === 'notes') {
      if (!contrib.note || contrib.note.trim() === '') return false;
    }

    // 2nd: search term
    if (searchTerm.trim() !== '') {
      const s = searchTerm.toLowerCase();
      const noteMatch = (contrib.note || '').toLowerCase().includes(s);
      const amountMatch = contrib.amount.toString().includes(s);
      const dateMatch = contrib.date.toLowerCase().includes(s);
      const currencyMatch = contrib.currency.toLowerCase().includes(s);
      return noteMatch || amountMatch || dateMatch || currencyMatch;
    }

    return true;
  });

  // SVG ring details
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // 339.29

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-300 pb-12">
      
      {/* Header secondary nav matching Screen 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="active:scale-95 transition-transform text-amber-400 h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-headline-md text-xl md:text-2xl font-black text-amber-500 tracking-tight leading-none">
            {goal.name}
          </h1>
        </div>

        {/* Currency Display Selector */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-white/5 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setDisplayCurrency('ORIGINAL')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${displayCurrency === 'ORIGINAL' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'}`}
          >
            {goal.currency}
          </button>
          <button
            onClick={() => setDisplayCurrency('HTG')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${displayCurrency === 'HTG' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'}`}
          >
            HTG
          </button>
          <button
            onClick={() => setDisplayCurrency('USD')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${displayCurrency === 'USD' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'}`}
          >
            USD
          </button>
        </div>
      </div>

      {/* Goal Success Banner / Celebration / Completed goals banner */}
      {progress >= 100 ? (
        <GoalSuccessBanner 
          goalName={goal.name}
          saved={viewSaved}
          target={viewTarget}
          currency={viewCurrency}
          language={language as 'FR' | 'HT' | 'EN'}
          status={goal.status}
          onMarkComplete={() => {
            markGoalAsCompleted(goal.id);
            showToast(
              language === 'HT' 
                ? 'Gwo Bravo ! Objektif sa a konplete ofisyèlman ! 🏆' 
                : 'Félicitations ! Votre objectif est maintenant marqué comme complété ! 🏆', 
              'success'
            );
          }}
        />
      ) : (
        goal.status === 'completed' && (
          <div className={`bg-gradient-to-r ${goal.completionType === 'closed' ? 'from-red-950/30 via-neutral-900/40 to-amber-950/10 border-red-500/25' : 'from-emerald-950/40 via-neutral-900/40 to-amber-950/20 border-emerald-500/20'} border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg`}>
            <div className="flex items-center gap-3.5 text-center md:text-left flex-col md:flex-row">
              <div className={`w-11 h-11 rounded-full ${goal.completionType === 'closed' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} flex items-center justify-center text-lg shadow-[0_0_15px_rgba(16,185,129,0.15)] flex-shrink-0`}>
                {goal.completionType === 'closed' ? '🛑' : '🏆'}
              </div>
              <div className="space-y-1">
                <h3 className={`font-extrabold text-sm md:text-base ${goal.completionType === 'closed' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {goal.completionType === 'closed' ? df.statusClosedLabel : df.completeEarlyTitle}
                </h3>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  {goal.completionType === 'closed' ? (
                    language === 'HT' 
                      ? 'Objektif sa a te fèmen/sispann san li pa rive 100% pwogrè.' 
                      : 'Cet objectif a été clos sans avoir atteint son achèvement complet.'
                  ) : (
                    <span>
                      {df.congratsText} {df.congratsOn} <span className="font-bold text-amber-450">{goal.completedDate ? formatDate(goal.completedDate, language === 'EN' ? 'en-US' : 'fr-FR') : (language === 'HT' ? 'moman sa' : 'récemment')}</span>.
                    </span>
                  )}
                </p>
                {/* Custom meta info tags */}
                <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
                  {goal.completionType !== 'closed' && goal.completionReason && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                      {goal.completionReason === 'promo' && df.reasonPromo}
                      {goal.completionReason === 'help' && df.reasonHelp}
                      {goal.completionReason === 'balance' && df.reasonBalance}
                      {goal.completionReason === 'early' && df.reasonEarly}
                      {goal.completionReason === 'other' && df.reasonOther}
                    </span>
                  )}
                  {goal.daysSavedAhead && goal.daysSavedAhead > 0 ? (
                    <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg px-2 py-0.5 text-[10px] font-extrabold font-mono animate-pulse">
                      🚀 +{goal.daysSavedAhead} {language === 'HT' ? 'jou davans' : 'jours d\'avance'}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                reopenGoal(goal.id);
                showToast(language === 'HT' ? 'Konpliman! Objektif sa a re-aktive ak siksè.' : 'Félicitations ! Cet objectif a été réactivé avec succès.', 'success');
              }}
              className="px-4 py-2.5 bg-neutral-950/80 hover:bg-neutral-950 border border-amber-500/30 hover:border-amber-500 text-amber-400 text-[11px] font-black uppercase rounded-xl transition-all duration-200 cursor-pointer text-center whitespace-nowrap active:scale-95"
            >
              ♻️ {df.reactivateBtn}
            </button>
          </div>
        )
      )}

      {/* Hero Section: Progress Circle & Overview details split layout */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center pt-2">
        
        {/* Large Circular Gauge */}
        <div className="flex flex-col items-center justify-center bg-neutral-900/40 rounded-3xl p-6 border border-white/5 relative h-72 md:h-80 shadow-inner">
          <div className="absolute top-4 left-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase">
            KONPLETE / PROGRESSION
          </div>
          
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle 
                cx="60" 
                cy="60" 
                r={radius} 
                fill="transparent" 
                stroke="rgba(255,255,255,0.03)" 
                strokeWidth="8" 
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="url(#goldGradient)"
                strokeWidth="8.5"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display-lg text-4xl md:text-5xl font-black text-amber-400 leading-none">
                {Math.round(progress)}%
              </span>
              <span className="font-label-sm text-[10px] text-neutral-400 uppercase tracking-widest mt-1">Konplete</span>
            </div>
          </div>
        </div>

        {/* Overview figures & recommendation container */}
        <div className="space-y-4">
          
          {/* Main Saving details figures card */}
          <div className="glass-card p-6 rounded-2xl space-y-3.5 border border-white/5 shadow-lg relative">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-label-sm text-[11px] text-neutral-500 uppercase tracking-wider font-bold">Epay Aktyèl / Épargne Actuelle</p>
                <h2 className="font-display-lg text-2xl md:text-3xl font-black text-[#f2ca50] mt-1">{formatMoney(viewSaved, viewCurrency)}</h2>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-[11px] text-neutral-500 uppercase tracking-wider font-bold font-mono">Objektif Final / Cible</p>
                <p className="font-headline-md text-base md:text-lg font-bold text-neutral-100 mt-1">{formatMoney(viewTarget, viewCurrency)}</p>
              </div>
            </div>

            {/* Premium small progress line */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
              <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Start and End date timeline summary */}
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-white/5 flex justify-between items-center text-[10.5px] text-neutral-400 font-bold">
              <span>Début: <span className="text-neutral-100 font-extrabold">{formatDate(goal.startDate || goal.createdDate || '', language === 'EN' ? 'en-US' : 'fr-FR')}</span></span>
              <span>Fin / Échéance: <span className="text-neutral-100 font-extrabold">{formatDate(goal.endDate || goal.targetDate || '', language === 'EN' ? 'en-US' : 'fr-FR')}</span></span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-0.5">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <TrendingUp size={12} />
                {progress >= 100 ? "Objectif Atteint ! 🏆" : `Reste ${formatMoney(viewRemaining, viewCurrency)}`}
              </span>
              <span className="font-bold uppercase tracking-wider bg-white/5 border border-white/5 px-2 py-0.5 rounded text-neutral-400">
                {daysLeft > 0 ? `${daysLeft} jours restants` : 'Date limite dépassée'}
              </span>
            </div>

            {/* Smart Timeline Estimator Indicator (Item 3 User Request) */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs">
                <span>🕒</span>
                <span>{language === 'HT' ? 'Estimatè de Tan Reyalisasyon' : 'Estimateur de Temps de Réalisation'}</span>
              </div>
              <p className="text-neutral-200 text-xs leading-relaxed">{estText}</p>
              {estDateText && (
                <p className="text-amber-300 font-mono text-[10.5px] font-bold">{estDateText}</p>
              )}
            </div>
          </div>

          {/* Golden Recommendation Box styled exactly like Screen 2 */}
          <div className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-md relative group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-md pointer-events-none"></div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mt-0.5">
                <Lightbulb size={18} />
              </div>
              <div className="flex-grow space-y-1.5">
                <h4 className="font-bold text-sm text-[#f2ca50] tracking-tight">{t.recommendedAmount}</h4>
                <p className="text-neutral-400 text-[11px]">Pour atteindre l'objectif d'ici le {formatDate(goal.targetDate, language === 'EN' ? 'en-US' : 'fr-FR')}</p>
                
                <div className="pt-2">
                  <div className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/10 inline-flex flex-col">
                    <span className="font-label-sm text-[9px] text-neutral-500 block uppercase font-bold tracking-wider mb-0.5">
                      Chak {freqOptionLabel} / {goal.frequency === 'DAILY' ? 'Par jour' : goal.frequency === 'WEEKLY' ? 'Par semaine' : goal.frequency === 'MONTHLY' ? 'Par mois' : goal.frequency === 'QUARTERLY' ? 'Par trimestre' : 'Par an'}
                    </span>
                    <span className="font-headline-md text-lg font-black text-amber-400">
                      {formatMoney(viewRecommendedAmount, viewCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pyas AI Coach Section */}
      <section className="glass-card p-6 rounded-2xl border border-amber-500/10 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 relative overflow-hidden shadow-xl space-y-4">
        {/* Decorative subtle ambient lights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-[#f2ca50] flex items-center justify-center text-lg shadow-[0_0_15px_rgba(245,158,11,0.25)] select-none">
              🪙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-100 flex items-center gap-1">
                  <span>{df.aiCoachTitle}</span>
                </h3>
                <span className="bg-amber-500/10 border border-amber-500/30 text-[#f2ca50] text-[8px] font-black py-0.5 px-2 rounded-full uppercase tracking-wider">
                  Pyas Insight
                </span>
              </div>
              <p className="text-neutral-400 text-[10.5px] font-medium">{df.aiCoachSubtitle}</p>
            </div>
          </div>
          
          {aiPlan && (
            <div className="flex items-center gap-2">
              <button
                disabled={aiIsLoading}
                onClick={generateAiPlan}
                className="text-[10px] uppercase font-black text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-950 border border-white/5 rounded-xl hover:border-amber-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>♻️</span>
                <span>{language === 'HT' ? 'Mete plan an a jou' : 'Mettre à jour le plan'}</span>
              </button>
              
              <button
                onClick={() => {
                  setAiPlan(null);
                  localStorage.removeItem(`spargn_ai_plan_${goalId}`);
                  showToast(language === 'HT' ? 'Konsèy IA efase avèk siksè!' : 'Conseil IA masqué avec succès !', 'info');
                }}
                className="w-7 h-7 bg-neutral-950 hover:bg-neutral-900 border border-white/5 hover:border-red-500/30 text-neutral-400 hover:text-red-400 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title={language === 'HT' ? 'Efase konsèy sa a' : 'Fermer / Réinitialiser le conseil'}
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="relative z-10">
          {aiIsLoading ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50] animate-bounce"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50] animate-bounce delay-75"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50] animate-bounce delay-150"></span>
              </div>
              <p className="text-xs text-neutral-400 font-bold tracking-wider animate-pulse">{df.aiCoachGenerating}</p>
            </div>
          ) : aiError ? (
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start gap-3">
              <span className="text-red-400 text-sm">⚠️</span>
              <p className="text-xs text-red-350 leading-relaxed font-semibold">{aiError}</p>
            </div>
          ) : aiPlan ? (
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 max-h-[350px] overflow-y-auto scrollbar-thin">
              <div className="prose prose-invert max-w-none text-neutral-300 text-xs leading-relaxed space-y-2">
                <Markdown>{aiPlan}</Markdown>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-neutral-950/40 rounded-xl border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-neutral-300 text-xs leading-relaxed max-w-xl">
                  {df.aiCoachIntro}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">
                  ※ {df.aiCoachDisclaimer}
                </p>
              </div>
              <button
                onClick={generateAiPlan}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-neutral-950 font-black uppercase text-xs rounded-xl tracking-wider hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95 duration-200 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start lg:self-auto"
              >
                <Sparkles size={13} />
                <span>{df.aiCoachPromptBtn}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bento Grid: 6-Month Projection Chart & History of deposits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Projection chart (Span 2) */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl flex flex-col border border-white/5 space-y-4 shadow-md h-full">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">{t.projection}</h3>
            <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-bold bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
              <Sparkles size={11} className="text-amber-400" /> Estimasyon
            </span>
          </div>
          <div className="flex-grow">
            <ProjectionChart 
              language={language}
              currentAmount={saved}
              targetAmount={goal.targetAmount}
              recommendedMonth={
                goal.frequency === 'DAILY' ? recommendedAmount * 30.4375 :
                goal.frequency === 'WEEKLY' ? recommendedAmount * 4.35 :
                goal.frequency === 'MONTHLY' ? recommendedAmount :
                goal.frequency === 'QUARTERLY' ? recommendedAmount / 3 :
                recommendedAmount / 12
              }
              currency={goal.currency}
            />
          </div>
        </div>

        {/* History Deposits Column (Span 1) */}
        <div className="glass-card rounded-2xl flex flex-col overflow-hidden border border-white/5 shadow-md">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-300">{t.history}</h3>
            {goal.status === 'completed' ? (
              <span className="flex items-center gap-1 text-[10px] bg-neutral-800 border border-neutral-700 text-neutral-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                <Lock size={10} /> {df.disabledAddedTitle}
              </span>
            ) : (
              <button 
                onClick={() => setShowAddContribution(true)}
                className="text-amber-400 text-xs font-black hover:underline bg-transparent border-none outline-none cursor-pointer flex items-center gap-0.5"
              >
                <Plus size={14} /> {t.add}
              </button>
            )}
          </div>

          {/* Advanced Search & Filtering Box */}
          {list.length > 0 && (
            <div className="p-3 border-b border-white/5 bg-black/20 space-y-2">
              {/* Search input with lens icon */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-neutral-500 pointer-events-none">
                  <Search size={13} />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={df.searchTransPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl text-xs text-neutral-250 placeholder-neutral-500 focus:outline-none transition-all"
                />
              </div>

              {/* Filtering pills & individual export */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
                <div className="flex gap-1">
                  <button
                    onClick={() => setFilterOption('all')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      filterOption === 'all' 
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                        : 'bg-white/3 border border-transparent text-neutral-450 hover:text-neutral-300'
                    }`}
                  >
                    {df.filterAll}
                  </button>
                  <button
                    onClick={() => setFilterOption('big')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      filterOption === 'big' 
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                        : 'bg-white/3 border border-transparent text-neutral-450 hover:text-neutral-300'
                    }`}
                    title="Dépôts ≥ 10% de la cible"
                  >
                    {df.filterBig}
                  </button>
                  <button
                    onClick={() => setFilterOption('notes')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      filterOption === 'notes' 
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                        : 'bg-white/3 border border-transparent text-neutral-450 hover:text-neutral-300'
                    }`}
                  >
                    {df.filterNote}
                  </button>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="text-neutral-400 hover:text-amber-400 text-[10px] font-bold flex items-center gap-1 px-1.5 py-1 rounded bg-white/5 border border-white/5 active:scale-95 transition-all cursor-pointer uppercase tracking-wider font-mono"
                  title="Exporter l'historique complet pour cet objectif"
                >
                  <Download size={10} />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-grow overflow-y-auto max-h-[300px] p-2 space-y-2" style={{ scrollbarWidth: 'thin' }}>
            {list.length === 0 ? (
              <p className="text-neutral-500 text-center py-12 text-xs font-semibold">{t.noContributionsYet}</p>
            ) : filteredList.length === 0 ? (
              <p className="text-neutral-500 text-center py-12 text-xs font-medium px-4">{df.noMatches}</p>
            ) : (
              <ul className="divide-y divide-white/5 space-y-2">
                {[...filteredList].reverse().map((contrib, idx) => (
                  <li key={contrib.id || idx} className="p-3 bg-neutral-900/40 hover:bg-neutral-900 border border-white/3 py-2 flex items-center justify-between rounded-xl transition-colors group/item relative gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        💰
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-200 truncate" title={contrib.note || (language === 'HT' ? 'Depo Kontribisyon' : 'Dépôt / Contribution')}>
                          {contrib.note || (language === 'HT' ? 'Depo Kontribisyon' : 'Dépôt / Contribution')}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-medium">
                          {formatDate(contrib.date, 'fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2 flex-shrink-0">
                      <span className="text-emerald-400 font-black text-xs whitespace-nowrap">
                        +{formatMoney(convert(contrib.amount, contrib.currency, viewCurrency, rates), viewCurrency)}
                      </span>
                      {goal.status !== 'completed' && (
                        <button
                          onClick={() => {
                            setContribToDelete(contrib.id);
                          }}
                          className="text-neutral-500 hover:text-red-400 p-1 rounded hover:bg-white/5 opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer"
                          title="Supprimer la contribution"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </section>

      {/* Actions footer styled exactly like CTA bar in Screen 2 */}
      <section className="flex flex-col sm:flex-row gap-4 items-center justify-between p-5 glass-card rounded-2xl border border-white/10 shadow-lg mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>

        <div className="text-center sm:text-left space-y-1 relative z-10">
          <h4 className="font-bold text-neutral-200 text-sm md:text-base">Objektif sa pwòch pou fini ? / Prêt à franchir le cap ?</h4>
          <p className="text-xs text-neutral-400">Marquez cet objectif comme accompli ou supprimez-le du système.</p>
        </div>
        
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-end relative z-10">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-3 border border-red-500/20 bg-red-500/5 hover:bg-neutral-800 text-red-400 rounded-xl font-bold text-xs uppercase duration-200 cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center transition-colors"
          >
            <Trash2 size={14} />
            {t.deleteGoal}
          </button>
          
          {goal.status === 'completed' ? (
            <button
              onClick={() => {
                reopenGoal(goal.id);
                showToast(language === 'HT' ? 'Konpliman! Objektif sa a re-aktive ak siksè.' : 'Félicitations ! Cet objectif a été réactivé avec succès.', 'success');
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-neutral-900 font-extrabold rounded-xl text-xs uppercase transition shadow-[0_4px_15px_rgba(245,158,11,0.2)] active:scale-95 duration-200 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>♻️</span>
              {df.reactivateBtn}
            </button>
          ) : progress >= 100 ? (
            <button
               id="complete-goal-btn-direct"
              onClick={handleMarkAsCompleted}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-neutral-900 font-extrabold rounded-xl text-xs uppercase transition shadow-[0_4px_15px_rgba(16,185,129,0.2)] active:scale-95 duration-200 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <CheckCircle size={14} />
              {t.markAsCompleted}
            </button>
          ) : (
            <button
              id="complete-goal-btn-bypass"
              type="button"
              onClick={handleMarkAsCompleted}
              className="px-6 py-3 bg-neutral-900 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-extrabold rounded-xl text-xs uppercase duration-200 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center group relative overflow-hidden transition-all shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] active:scale-95"
            >
              <span>🎉</span>
              <span>
                {language === 'HT' 
                  ? 'Mwen reyalize objektif la' 
                  : language === 'EN' 
                  ? "I've achieved my goal" 
                  : "J'ai réalisé cet objectif"}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Pop-up and modal overlays */}
      <AddContributionDialog
        open={showAddContribution}
        onClose={() => setShowAddContribution(false)}
        goalId={goal.id}
      />

      {/* Danger Zone Confirmation popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full relative">
            <h3 className="text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
              🚨 Danger Zone
            </h3>
            <p className="text-neutral-300 text-sm font-medium mb-6">
              {t.deleteConfirm}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 bg-neutral-800 text-white hover:bg-neutral-750 font-bold rounded-xl text-xs uppercase transition-colors border border-white/5 cursor-pointer"
              >
                {t.no}
              </button>
              <button
                onClick={handleDeleteGoal}
                className="flex-1 py-3 px-4 bg-red-600 text-white hover:bg-red-500 font-bold rounded-xl text-xs uppercase transition-colors border-none cursor-pointer"
                id="delete-goal-confirm"
              >
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Humanized Early Completion Dialog System */}
      {showBypassCompleteConfirm && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-white/10 p-6 md:p-8 rounded-2xl max-w-md w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
            
            {/* STEP 1: OPTIONS FOR REASON OR CLOSE */}
            {completeStep === 'options' && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="text-4xl">🥳</div>
                  <h3 className="text-xl font-extrabold text-[#f2ca50] tracking-tight">
                    {df.completeEarlyTitle}
                  </h3>
                  <p className="text-neutral-200 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
                    {df.completeEarlySubtitle} ({Math.round(progress)}%)
                  </p>
                </div>

                <p className="text-xs text-neutral-400 bg-neutral-950/50 p-4 rounded-xl border border-white/3 leading-relaxed text-center">
                  💡 {df.completeEarlyExplanation}
                </p>

                <div className="space-y-3 pt-2">
                  {/* Option Realized Successfully */}
                  <button
                    type="button"
                    onClick={() => setCompleteStep('realized_reason')}
                    className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/45 border-2 border-emerald-500/30 hover:border-emerald-400 text-left cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between group active:scale-95"
                  >
                    <div>
                      <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                        <span>🎉</span>
                        <span>{language === 'HT' ? 'Mwen reyalize l !' : 'J\'ai atteint mon objectif !'}</span>
                      </h4>
                      <p className="text-neutral-400 text-[11px] mt-1 font-medium">
                        {language === 'HT' ? 'Mwen jwenn sa m te vle a' : 'J\'ai obtenu l\'objet ou le service désiré.'}
                      </p>
                    </div>
                    <span className="text-neutral-500 group-hover:text-emerald-400 font-extrabold text-sm">➡️</span>
                  </button>

                  {/* Option Closed uncompleted */}
                  <button
                    type="button"
                    onClick={() => setCompleteStep('close_confirm')}
                    className="w-full p-4 rounded-xl bg-neutral-950/40 border border-white/5 hover:border-amber-500/20 text-left cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between group active:scale-95"
                  >
                    <div>
                      <h4 className="font-bold text-amber-500/90 group-hover:text-amber-400 text-sm flex items-center gap-1.5">
                        <span>🛑</span>
                        <span>{language === 'HT' ? 'Abandone / Fèmen li' : 'Arrêter / Clore'}</span>
                      </h4>
                      <p className="text-neutral-400 text-[11px] mt-1 font-medium">
                        {language === 'HT' ? 'Mwen pa swete kontinye sere kòb pou sa a' : 'Je souhaite simplement clore cet objectif sans suite.'}
                      </p>
                    </div>
                    <span className="text-neutral-500 group-hover:text-amber-400 font-extrabold text-sm">➡️</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBypassCompleteConfirm(false)}
                    className="w-full py-3.5 bg-neutral-800 text-neutral-300 hover:text-white font-bold rounded-xl text-xs uppercase transition-all tracking-wider border border-white/5 cursor-pointer active:scale-95"
                  >
                    {df.btnKeepSaving}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE SUCCESS REASON */}
            {completeStep === 'realized_reason' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                    🎯 Poukisa ou reyalize l ?
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {df.reasonLabel}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { key: 'promo', label: df.reasonPromo },
                    { key: 'help', label: df.reasonHelp },
                    { key: 'balance', label: df.reasonBalance },
                    { key: 'early', label: df.reasonEarly },
                    { key: 'other', label: df.reasonOther },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all text-xs font-semibold select-none ${
                        selectedReason === item.key
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                          : 'bg-neutral-950/40 border-white/5 text-neutral-300 hover:bg-neutral-950/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="early_complete_reason"
                        value={item.key}
                        checked={selectedReason === item.key}
                        onChange={() => setSelectedReason(item.key)}
                        className="accent-amber-500 h-4 w-4 shrink-0"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setCompleteStep('options')}
                    className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold rounded-xl text-xs uppercase border border-white/5 cursor-pointer active:scale-95"
                  >
                    Back / Tounen
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmEarlyRealized}
                    className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-xs uppercase duration-200 cursor-pointer active:scale-95"
                  >
                    {language === 'HT' ? 'Konfime 🎉' : 'Confirmer 🎉'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: HIGH ENERGY TIMELINE SAVINGS CELEBRATION */}
            {completeStep === 'celebrate' && (
              <div className="space-y-5 text-center py-4">
                <div className="text-5xl animate-bounce">🥳</div>
                <h3 className="text-xl font-black text-amber-300 tracking-tight">
                  {language === 'HT' ? 'Ou depase plan an !' : 'Vous avez devancé votre plan !'}
                </h3>
                
                <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl space-y-3 text-center">
                  <p className="text-neutral-100 text-sm font-semibold max-w-xs mx-auto leading-relaxed">
                    {df.daysAheadPlan
                      .replace('{{days}}', daysAheadCalculated.toString())
                      .replace('{{targetDate}}', formatDate(goal.targetDate, language === 'EN' ? 'en-US' : 'fr-FR'))}
                  </p>
                  <p className="text-[11px] text-amber-400 font-mono font-bold uppercase tracking-wider">
                    🏆 {daysAheadCalculated} {language === 'HT' ? 'jou davans kach !' : 'jours d\'avance !'}
                  </p>
                </div>

                <p className="text-xs text-neutral-400 px-2 leading-relaxed">
                  {language === 'HT' 
                    ? 'Pyas ak Spargn Ayiti kontan pou siksè sa a ! Ekonomi ak efò ou yo ap kontinye enspire w pou lòt vizyon.' 
                    : 'Pyas et Spargn Ayiti célèbrent vos accomplissements ! Votre rigueur financière est récompensée.'}
                </p>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleFinishCelebrate}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:to-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.3)] cursor-pointer active:scale-95 transition-all"
                  >
                    {language === 'HT' ? "Mete kòb nan pòch mwen / Fèmen !! 👑" : "Finaliser l'archivage !! 👑"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: HEALTHY CLOSE UNCOMPLETED INTERACTION */}
            {completeStep === 'close_confirm' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-red-400 flex items-center gap-1.5">
                    <span>🛑</span>
                    <span>{df.closeGoalTitle}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {df.closeGoalDesc}
                  </p>
                </div>

                <div className="p-4 bg-neutral-950/60 rounded-xl border border-white/5 text-[11px] text-neutral-300 leading-relaxed space-y-1">
                  <p className="font-bold text-amber-400">🛡️ {language === 'HT' ? 'Sa ou dwe konnen :' : 'Note de sécurité :'}</p>
                  <p>{language === 'HT' ? '• Lajan ou sere yo pap siprime oswa efase.' : '• Vos dépôts d\'épargne passés restent comptabilisés de manière intègre.'}</p>
                  <p>{language === 'HT' ? '• Pyas ak lòt kalkilatè yo konnen ou te reyalize depo sa yo.' : '• Votre historique aidera le moteur financier à comprendre vos habitudes d\'épargne.'}</p>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setCompleteStep('options')}
                    className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold rounded-xl text-xs uppercase border border-white/5 cursor-pointer active:scale-95"
                  >
                    Back / Tounen
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClosed}
                    className="flex-1 py-3 px-4 bg-red-650 hover:bg-red-600 text-white font-bold rounded-xl text-xs uppercase duration-200 cursor-pointer active:scale-95 border-none"
                  >
                    {df.btnConfirmClosed}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Contribution Deletion Confirmation popup */}
      {contribToDelete && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full relative">
            <h3 className="text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
              🚨 {language === 'HT' ? 'Supprimer Kontribisyon' : 'Supprimer Contribution'}
            </h3>
            <p className="text-neutral-300 text-xs font-semibold mb-6 leading-relaxed">
              {language === 'HT' 
                ? 'Èske ou sèten ou vle efase kontribisyon sa a nan istwa ou?' 
                : 'Êtes-vous sûr de vouloir supprimer cette contribution de votre historique ?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setContribToDelete(null)}
                className="flex-1 py-3 px-4 bg-neutral-800 text-white hover:bg-neutral-750 font-bold rounded-xl text-xs uppercase transition-colors border border-white/5 cursor-pointer"
              >
                {t.no}
              </button>
              <button
                onClick={() => {
                  deleteContribution(goal.id, contribToDelete);
                  setContribToDelete(null);
                  showToast(language === 'HT' ? 'Kontribisyon efase ak siksè!' : 'Contribution supprimée avec succès !', 'success');
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
