import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
  DollarSign, 
  Sliders, 
  PlusCircle, 
  ArrowRightLeft, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  PiggyBank, 
  ShieldAlert, 
  Car, 
  GraduationCap, 
  Utensils, 
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Plus,
  Minus,
  Home,
  ShoppingBag
} from 'lucide-react';
import { formatMoney } from '../lib/currency';
import { FinancialEngine } from '../lib/FinancialEngine';
import { IncomeSource, BudgetEnvelope } from '../types';

export const BudgetIntelligent: React.FC = () => {
  const {
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
    updateEnvelopeSpent,
    addIncomeTransaction,
    deleteIncomeTransaction,
    addEnvelopeExpense,
    transferFonDegaje,
    updateProfilePercentages,
    setActiveProfileId,
    language,
    rates,
    showToast
  } = useAppContext();

  // Dialog State
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState<string | null>(null); // envelopeId
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isSlidersOpen, setIsSlidersOpen] = useState(false);
  const [isAutoSplitOpen, setIsAutoSplitOpen] = useState(false);

  // Custom Envelopes Local State
  const [showEditDepositModal, setShowEditDepositModal] = useState<string | null>(null);
  const [newDepositAmount, setNewDepositAmount] = useState('');

  const [showEditSpentModal, setShowEditSpentModal] = useState<string | null>(null);
  const [newSpentAmount, setNewSpentAmount] = useState('');

  const [showAddFundsModal, setShowAddFundsModal] = useState<string | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');

  const [showWithdrawModal, setShowWithdrawModal] = useState<string | null>(null);
  const [withdrawFundsAmount, setWithdrawFundsAmount] = useState('');

  const [showCreateEnvelopeModal, setShowCreateEnvelopeModal] = useState(false);
  const [newEnvelopeName, setNewEnvelopeName] = useState('');
  const [newEnvelopeNameKreyol, setNewEnvelopeNameKreyol] = useState('');
  const [newEnvelopeIcon, setNewEnvelopeIcon] = useState('utensils');
  const [newEnvelopeInitialAlloc, setNewEnvelopeInitialAlloc] = useState('');
  const [newEnvelopeCategory, setNewEnvelopeCategory] = useState<'monthly' | 'saving' | 'event' | 'subscription' | 'project' | 'custom'>('custom');
  const [newEnvelopeIsRecurring, setNewEnvelopeIsRecurring] = useState(false);
  const [newEnvelopeRecurringAmount, setNewEnvelopeRecurringAmount] = useState('');
  const [newEnvelopeRecurringCurrency, setNewEnvelopeRecurringCurrency] = useState<'HTG' | 'USD' | 'EUR' | 'USDT'>('HTG');
  const [newEnvelopeRecurringNextDate, setNewEnvelopeRecurringNextDate] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'monthly' | 'saving' | 'event' | 'subscription' | 'project' | 'custom'>('all');
  const [envelopeToDelete, setEnvelopeToDelete] = useState<BudgetEnvelope | null>(null);

  // Income Form State
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeCurrency, setIncomeCurrency] = useState<'HTG' | 'USD' | 'EUR' | 'USDT'>('HTG');
  const [incomeSource, setIncomeSource] = useState<IncomeSource>('SALARY');
  const [incomeProfileId, setIncomeProfileId] = useState(activeProfileId);
  const [autoSplitIncome, setAutoSplitIncome] = useState(false);
  const [customIncomeSource, setCustomIncomeSource] = useState('');
  const [deleteConfirmTxId, setDeleteConfirmTxId] = useState<string | null>(null);
  const [isEditingAvailableFunds, setIsEditingAvailableFunds] = useState(false);
  const [newAvailableFundsValue, setNewAvailableFundsValue] = useState('');

  // Edit Envelope general properties state
  const [showEditEnvelopePropsModal, setShowEditEnvelopePropsModal] = useState<string | null>(null);
  const [editEnvelopeName, setEditEnvelopeName] = useState('');
  const [editEnvelopeNameKreyol, setEditEnvelopeNameKreyol] = useState('');
  const [editEnvelopeIcon, setEditEnvelopeIcon] = useState('utensils');
  const [editEnvelopeCategory, setEditEnvelopeCategory] = useState<'monthly' | 'saving' | 'event' | 'subscription' | 'project' | 'custom'>('custom');
  const [editEnvelopeIsRecurring, setEditEnvelopeIsRecurring] = useState(false);
  const [editEnvelopeRecurringAmount, setEditEnvelopeRecurringAmount] = useState('');
  const [editEnvelopeRecurringCurrency, setEditEnvelopeRecurringCurrency] = useState<'HTG' | 'USD' | 'EUR' | 'USDT'>('HTG');
  const [editEnvelopeRecurringNextDate, setEditEnvelopeRecurringNextDate] = useState('');

  // Expense Form State
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNote, setExpenseNote] = useState('');

  // Transfer Form State
  const [transferSource, setTransferSource] = useState('emergency');
  const [transferDest, setTransferDest] = useState('food');
  const [transferAmount, setTransferAmount] = useState('');

  // Sòl translation helpers
  const labels = {
    HT: {
      budgetTitle: 'Milti-Anvlòp & Bidjè Entèlijan (v1.3)',
      budgetSub: 'Sere kòb, jere anvlòp otomatik, epi ranfòse nivo sante finansyè w',
      healthScore: 'Nivo Sante Finansyè w',
      scoreDescription: 'Sòti nan 0 a 100, li evalye disiplin, rezèv kòb la, ak jan w respekte bidjè anvlòp yo.',
      ratingRegularity: 'Règilarite Sere Kòb (Max 40)',
      ratingEmergency: 'Alimantasyon Fon Degaje (Max 30)',
      ratingDiscipline: 'Disiplin Anvlòp yo (Max 30)',
      activeProfile: 'Mòd Divizyon Aktif',
      selectProfile: 'Chwazi ki jan kòb yo dwe otomatikman separe lè w touche:',
      customizePercentages: 'Ajiste Pousantaj Mòd la',
      totalPercentage: 'Total Pousantaj :',
      saveRentrée: 'Anrejistre yon Rentrées Kòb (Rentrées la ap separe otomatik)',
      source: 'Sous Kòb la',
      amount: 'Montan',
      currency: 'Deviz',
      applySplits: 'Otomatikman divize kòb la',
      envelopesTitle: 'Suivi Anvlòp yo',
      allocated: 'Sere pou anvlòp sa',
      spent: 'Depanse dejà',
      balance: 'Sòl ki rete',
      addExpense: 'Mete yon depans',
      transferTitle: 'Transfè ant anvlòp yo',
      withdrawFund: 'Ijans / Chanje rezèvasyon',
      historyTitle: 'Istorik Rantre Kòb yo',
      noHistory: 'Pa gen okenn rentrées kòb ki fèt ankò. Kòmanse kounye a!',
      invalidAmount: 'Mete yon montan ki plis pase 0!',
      invalidSum: 'Sòm pousantaj yo dwe egzakteman 100% pou sove chanjman an.',
      successIncome: 'Rantre kòb la separe ak siksè!',
      successExpense: 'Depans anrejistre pafè!',
      successTransfer: 'Transfè a konplete pafè!',
      from: 'Soti nan',
      to: 'Ale nan',
      transferAction: 'Fe Transfè',
      percentageError: 'Pousantaj pou anvlòp yo dwe bay 100% nèt.',
      schoolLabel: 'Lekòl / Fanmi',
      foodLabel: 'Manje / Pwovizyon',
      transportLabel: 'Transpò / Gaz',
      emergencyLabel: 'Fon Degaje',
      savingLabel: 'Spargn Pwojè',
      recentTransactions: 'Dènye Rantre yo daprè anvlòp',
    },
    FR: {
      budgetTitle: 'Enveloppes & Budget Intelligent (v1.3)',
      budgetSub: 'Répartissez vos revenus automatiquement et gérez vos plafonds de dépenses.',
      healthScore: 'Score de Santé Financière',
      scoreDescription: 'Sur une échelle de 0 à 100, reflète votre assiduité d\'épargne, votre réserve Fon Degaje et la discipline de vos comptes.',
      ratingRegularity: 'Régularité de l\'Épargne (Max 40)',
      ratingEmergency: 'Alimentation du Fon Degaje (Max 30)',
      ratingDiscipline: 'Discipline des Enveloppes (Max 30)',
      activeProfile: 'Profil de Répartition Actif',
      selectProfile: 'Choisissez comment répartir vos revenus entrants :',
      customizePercentages: 'Modifier les pourcentages du Profil',
      totalPercentage: 'Total des Pourcentages :',
      saveRentrée: 'Enregistrer un Revenu Rentrant (Ventilation Automatique)',
      source: 'Source du Revenu',
      amount: 'Montant',
      currency: 'Devise',
      applySplits: 'Ventiler automatiquement ce montant',
      envelopesTitle: 'Suivi de vos Enveloppes budgétaires',
      allocated: 'Déposé',
      spent: 'Dépensé',
      balance: 'Solde restant',
      addExpense: 'Déclarer une dépense',
      transferTitle: 'Transfert entre vos Enveloppes',
      withdrawFund: 'Fonds d\'Urgence / Ajustement',
      historyTitle: 'Historique des Revenus',
      noHistory: 'Aucun revenu enregistré pour le moment.',
      invalidAmount: 'Saisir un montant valide supérieur à 0 !',
      invalidSum: 'La somme de vos pourcentages doit être strictement égale à 100%.',
      successIncome: 'Revenu réparti avec succès entre vos enveloppes !',
      successExpense: 'Dépense déclarée avec succès !',
      successTransfer: 'Transfert effectué avec succès !',
      from: 'De',
      to: 'Vers',
      transferAction: 'Effectuer le transfert',
      percentageError: 'La somme des pourcentages des enveloppes doit être égale à 100%.',
      schoolLabel: 'Scolarité / Famille',
      foodLabel: 'Nourriture / Provision',
      transportLabel: 'Transport / Carburant',
      emergencyLabel: 'Fon Degaje (Urgence)',
      savingLabel: 'Spargn (Projets)',
      recentTransactions: 'Dernières répartitions par enveloppe',
    }
  };

  const currentLabels = labels[language] || labels.HT;

  // Active Profile object
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Map envelope icon to react icon
  const renderEnvelopeIcon = (iconName: string) => {
    switch (iconName) {
      case 'utensils':
        return <Utensils size={16} className="text-amber-400" />;
      case 'car':
        return <Car size={16} className="text-cyan-400" />;
      case 'graduation-cap':
        return <GraduationCap size={16} className="text-indigo-400" />;
      case 'shield-alert':
        return <ShieldAlert size={16} className="text-red-400 font-bold" />;
      case 'piggy-bank':
        return <PiggyBank size={16} className="text-emerald-400" />;
      case 'home':
        return <Home size={16} className="text-rose-400" />;
      case 'shopping-bag':
        return <ShoppingBag size={16} className="text-amber-300" />;
      default:
        return <DollarSign size={16} className="text-neutral-400" />;
    }
  };

  const handleProfileChange = (pId: string) => {
    setActiveProfileId(pId);
    setIncomeProfileId(pId);
    showToast(language === 'HT' ? `Chanjman mòd fèt ak siksè!` : `Profil de budget activé !`, 'success');
  };

  // Submit Income Entry
  const handleAddIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountFloat = parseFloat(incomeAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      showToast(currentLabels.invalidAmount, 'error');
      return;
    }

    addIncomeTransaction({
      amount: amountFloat,
      currency: incomeCurrency,
      source: incomeSource,
      date: new Date().toISOString().split('T')[0],
      profileId: incomeProfileId,
      note: customIncomeSource.trim() || undefined,
    }, autoSplitIncome);

    setIncomeAmount('');
    setCustomIncomeSource('');
    setShowIncomeModal(false);
    showToast(currentLabels.successIncome, 'success');
  };

  const handleEditDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditDepositModal) return;
    const amountFloat = parseFloat(newDepositAmount);
    if (isNaN(amountFloat) || amountFloat < 0) {
      showToast(currentLabels.invalidAmount, 'error');
      return;
    }
    updateEnvelopeDeposit(showEditDepositModal, amountFloat);
    setNewDepositAmount('');
    setShowEditDepositModal(null);
    showToast(language === 'HT' ? 'Depo anvlòp la chanje!' : 'Dépôt de l\'enveloppe mis à jour !', 'success');
  };

  const handleEditSpentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditSpentModal) return;
    const amountFloat = parseFloat(newSpentAmount);
    if (isNaN(amountFloat) || amountFloat < 0) {
      showToast(currentLabels.invalidAmount, 'error');
      return;
    }
    updateEnvelopeSpent(showEditSpentModal, amountFloat);
    setNewSpentAmount('');
    setShowEditSpentModal(null);
    showToast(language === 'HT' ? 'Depans yo jwenn chanjman avèk siksè!' : 'Dépenses de l\'enveloppe mises à jour avec succès !', 'success');
  };

  const handleEditEnvelopePropsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditEnvelopePropsModal) return;
    
    if (!editEnvelopeName.trim() || !editEnvelopeNameKreyol.trim()) {
      showToast(language === 'HT' ? 'Tanpri ranpli tout non yo' : 'Veuillez remplir tous les champs de nom', 'error');
      return;
    }

    const updates: Partial<BudgetEnvelope> = {
      name: editEnvelopeName.trim(),
      nameKreyol: editEnvelopeNameKreyol.trim(),
      category: editEnvelopeCategory,
      icon: editEnvelopeIcon,
      recurringAmount: editEnvelopeIsRecurring ? parseFloat(editEnvelopeRecurringAmount) || undefined : undefined,
      recurringCurrency: editEnvelopeIsRecurring ? editEnvelopeRecurringCurrency : undefined,
      recurringNextDate: editEnvelopeIsRecurring ? editEnvelopeRecurringNextDate : undefined,
    };

    updateEnvelope(showEditEnvelopePropsModal, updates);
    setShowEditEnvelopePropsModal(null);
    showToast(language === 'HT' ? 'Karyakteristik anvlòp la mete ajou avèk siksè!' : 'Propriétés de l\'enveloppe mises à jour avec succès !', 'success');
  };

  const handleAddFundsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddFundsModal) return;
    const amountFloat = parseFloat(addFundsAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      showToast(currentLabels.invalidAmount, 'error');
      return;
    }
    if (amountFloat > availableFunds) {
      showToast(language === 'HT' ? 'Kòb disponib ou pa ase!' : 'Fonds disponibles insuffisants !', 'error');
      return;
    }
    updateEnvelopeDeposit(showAddFundsModal, (envelopes.find(env => env.id === showAddFundsModal)?.allocatedAmount || 0) + amountFloat);
    setAddFundsAmount('');
    setShowAddFundsModal(null);
    showToast(language === 'HT' ? 'Kòb ajoute byen rapid!' : 'Fonds ajoutés avec succès !', 'success');
  };

  const handleWithdrawFundsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showWithdrawModal) return;
    const amountFloat = parseFloat(withdrawFundsAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      showToast(currentLabels.invalidAmount, 'error');
      return;
    }
    const currentAllocated = envelopes.find(env => env.id === showWithdrawModal)?.allocatedAmount || 0;
    if (amountFloat > currentAllocated) {
      showToast(language === 'HT' ? 'Kòb ki nan envelop la pa ase!' : 'Fonds insuffisants dans l\'enveloppe !', 'error');
      return;
    }
    updateEnvelopeDeposit(showWithdrawModal, currentAllocated - amountFloat);
    setWithdrawFundsAmount('');
    setShowWithdrawModal(null);
    showToast(language === 'HT' ? 'Kòb retire pafè!' : 'Fonds retirés avec succès !', 'success');
  };

  const handleCreateEnvelopeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initialAmt = parseFloat(newEnvelopeInitialAlloc) || 0;
    if (!newEnvelopeName.trim()) {
      showToast(language === 'HT' ? 'Mete yon non pou anvlòp la!' : 'Veuillez saisir un nom pour l\'enveloppe !', 'error');
      return;
    }
    if (initialAmt > availableFunds) {
      showToast(language === 'HT' ? 'Kòb disponib ou pa ase pou depo sa!' : 'Fonds disponibles insuffisants pour ce dépôt !', 'error');
      return;
    }

    const extra: Partial<BudgetEnvelope> = {
      category: newEnvelopeCategory,
    };

    if (newEnvelopeIsRecurring) {
      const recAmt = parseFloat(newEnvelopeRecurringAmount);
      if (!isNaN(recAmt) && recAmt > 0) {
        extra.recurringAmount = recAmt;
        extra.recurringCurrency = newEnvelopeRecurringCurrency;
        extra.recurringNextDate = newEnvelopeRecurringNextDate || undefined;
      }
    }

    addEnvelope(
      newEnvelopeName,
      newEnvelopeNameKreyol ? newEnvelopeNameKreyol : newEnvelopeName,
      newEnvelopeIcon,
      initialAmt,
      extra
    );

    // Reset fields
    setNewEnvelopeName('');
    setNewEnvelopeNameKreyol('');
    setNewEnvelopeIcon('utensils');
    setNewEnvelopeInitialAlloc('');
    setNewEnvelopeCategory('custom');
    setNewEnvelopeIsRecurring(false);
    setNewEnvelopeRecurringAmount('');
    setNewEnvelopeRecurringCurrency('HTG');
    setNewEnvelopeRecurringNextDate('');
    setShowCreateEnvelopeModal(false);
    showToast(language === 'HT' ? 'Anvlòp kreye ak siksè!' : 'Enveloppe créée avec succès !', 'success');
  };

  // Submit Expense Entry
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountFloat = parseFloat(expenseAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      showToast(currentLabels.invalidAmount, 'error');
      return;
    }

    if (showExpenseModal) {
      addEnvelopeExpense(showExpenseModal, amountFloat, expenseNote || '');
      setExpenseAmount('');
      setExpenseNote('');
      setShowExpenseModal(null);
      showToast(currentLabels.successExpense, 'success');
    }
  };

  // Submit Transfer Entry
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountFloat = parseFloat(transferAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      showToast(currentLabels.invalidAmount, 'error');
      return;
    }

    // Check balance of source envelope in HTG
    const sourceEnv = envelopes.find(env => env.id === transferSource);
    if (!sourceEnv) return;

    const sourceBalance = sourceEnv.allocatedAmount - sourceEnv.spentAmount;
    if (amountFloat > sourceBalance) {
      showToast(language === 'HT' ? 'Kòb ki nan envelop sa pa ase pou transfè sa!' : 'Fonds insuffisants dans l\'enveloppe d\'origine !', 'error');
      return;
    }

    transferFonDegaje(transferSource, transferDest, amountFloat);
    setTransferAmount('');
    setShowTransferModal(false);
    showToast(currentLabels.successTransfer, 'success');
  };

  // Slider change helper
  const handleSliderChange = (envelopeId: string, val: number) => {
    if (!activeProfile) return;
    const currentPercentages = { ...activeProfile.percentages };
    currentPercentages[envelopeId] = val;

    // Check sum
    updateProfilePercentages(activeProfile.id, currentPercentages);
  };

  // Check sum warning dynamically including custom envelopes
  const currentSum = activeProfile 
    ? envelopes.reduce((sum, env) => {
        const val = activeProfile.percentages[env.id] !== undefined ? activeProfile.percentages[env.id] : 0;
        return sum + val;
      }, 0)
    : 0;

  // Health Rating color styling
  let scoreBg = 'bg-red-500/10 text-red-400 border-red-500/20';
  if (financialHealthScore >= 70) {
    scoreBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (financialHealthScore >= 40) {
    scoreBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  // Calculate score items
  const weeksCount = new Set();
  incomeTransactions.forEach(tx => {
    if (tx.splits['saving'] > 0) {
      weeksCount.add(FinancialEngine.getWeekIdentifier(tx.date));
    }
  });

  const regularity = Math.min(40, weeksCount.size * 5);
  const emergencyEnvelope = envelopes.find(e => e.id === 'emergency');
  const emergencyNet = emergencyEnvelope ? Math.max(0, emergencyEnvelope.allocatedAmount - emergencyEnvelope.spentAmount) : 0;
  const emergencyScore = Math.min(30, Math.round(emergencyNet / 100));
  
  let disciplineScoreRaw = 30;
  envelopes.forEach(e => {
    if (e.allocatedAmount - e.spentAmount < 0) {
      disciplineScoreRaw -= 5;
    }
  });
  const disciplineScore = Math.max(0, disciplineScoreRaw);

  const totalAllocated = envelopes.reduce((sum, env) => sum + env.allocatedAmount, 0);

  return (
    <div className="space-y-8 py-2">
      
      {/* 💳 TITLE & HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-amber-400 tracking-tight flex items-center gap-2">
            <span>🛡️</span> {currentLabels.budgetTitle}
          </h2>
          <p className="text-neutral-400 text-xs font-medium md:max-w-xl">
            {currentLabels.budgetSub}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIncomeModal(true)}
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <PlusCircle size={15} />
            {language === 'HT' ? 'Depoze Kòb' : 'Faire un dépôt'}
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-3 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowRightLeft size={14} />
            {currentLabels.withdrawFund}
          </button>
        </div>
      </div>

      {/* 💥 SOLDE DISPONIBLE & ARGENT DANS LES ENVELOPPES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-900/40 p-5 rounded-2xl border border-white/5 shadow-md">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-neutral-250 text-xs font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span>💰</span>
              {language === 'HT' ? 'Lajan ki disponib' : 'Argent disponible'}
            </span>
            <button
              type="button"
              onClick={() => {
                setNewAvailableFundsValue(availableFunds.toString());
                setIsEditingAvailableFunds(true);
              }}
              className="text-amber-500 hover:text-amber-400 text-[9px] font-black flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 rounded cursor-pointer transition select-none tracking-normal font-sans"
            >
              ✏️ {language === 'HT' ? 'Ajiste' : 'Ajuster'}
            </button>
          </div>

          {isEditingAvailableFunds ? (
            <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-100">
              <input
                type="number"
                value={newAvailableFundsValue}
                onChange={(e) => setNewAvailableFundsValue(e.target.value)}
                className="bg-neutral-950 border border-white/10 text-emerald-400 font-mono text-base px-2 py-1 rounded w-32 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(newAvailableFundsValue);
                  if (!isNaN(val) && val >= 0) {
                    setAvailableFunds(val);
                    showToast(
                      language === 'HT' 
                        ? 'Sòl pòtfe w la ajiste avèk siksè !' 
                        : 'Le solde disponible a été ajusté avec succès !',
                      'success'
                    );
                  }
                  setIsEditingAvailableFunds(false);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-black px-2 py-1.5 rounded text-[10px] uppercase transition cursor-pointer font-sans"
              >
                {language === 'HT' ? 'Sove' : 'Sauf'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingAvailableFunds(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1.5 rounded text-[10px] font-black transition cursor-pointer font-sans"
              >
                X
              </button>
            </div>
          ) : (
            <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
              {formatMoney(availableFunds, 'HTG')}
            </div>
          )}
          
          <p className="text-[10.5px] text-neutral-400 font-medium">
            {language === 'HT' 
              ? 'Lajan ki rete nan pòtfe w ki poko nan okenn anvlòp. Ou ka separe l jan w vle.' 
              : 'Argent restant en dehors de vos enveloppes, prêt à être réparti.'}
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-neutral-250 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <span>📂</span>
            {language === 'HT' ? 'Kòb nan anvlòp yo' : 'Argent dans les enveloppes'}
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-500 font-mono">
            {formatMoney(envelopes.reduce((sum, env) => sum + Math.max(0, env.allocatedAmount - env.spentAmount), 0), 'HTG')}
          </div>
          <p className="text-[10.5px] text-neutral-400 font-medium">
            {language === 'HT' 
              ? 'Lajan ki rete nan anvlòp yo kounye a (sa ou depoze mwens sa ou depanse).' 
              : 'Cumul total de l\'argent restant disponible dans vos enveloppes (dépôts moins dépenses).'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. HEALTH SCORE METER MÈT SANTE */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-1.5">
              <span>🩺</span> {currentLabels.healthScore}
            </h3>
            <p className="text-[10.5px] text-neutral-400 leading-relaxed">
              {currentLabels.scoreDescription}
            </p>
          </div>

          <div className="flex items-center justify-center py-6 relative">
            <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${scoreBg} shadow-2xl`}>
              <span className="text-3xl font-black tracking-tight leading-none">
                {financialHealthScore}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">
                / 100 pt
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-white/5 text-xs font-medium">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">{currentLabels.ratingRegularity}</span>
              <span className={`font-bold ${regularity > 20 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                {regularity} pt
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">{currentLabels.ratingEmergency}</span>
              <span className={`font-bold ${emergencyScore > 15 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                {emergencyScore} pt
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">{currentLabels.ratingDiscipline}</span>
              <span className={`font-bold ${disciplineScore === 30 ? 'text-emerald-400' : 'text-red-400'}`}>
                {disciplineScore} pt
              </span>
            </div>
          </div>
        </div>

        {/* 2. DYNAMIC FINANCIAL INSIGHTS & PYAS CORNER */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 lg:col-span-2 shadow-md flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900/40 to-neutral-950">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10 translate-x-6 -translate-y-6"></div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-max">
                💡 {language === 'HT' ? 'Konsèy Entèlijan' : 'Recommandations Budget'}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 font-bold">
                PRO-{financialHealthScore >= 80 ? 'EXPERT' : 'ACTIVE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-neutral-200 uppercase tracking-wide">
                  {language === 'HT' ? '📈 Rezime Anvlòp yo' : '📈 Aperçu de vos Enveloppes'}
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-medium text-neutral-400">
                    <span>{language === 'HT' ? 'Anvlòp aktif :' : 'Enveloppes actives :'}</span>
                    <span className="font-mono font-bold text-neutral-200">{envelopes.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-medium text-neutral-400">
                    <span>{language === 'HT' ? 'Anvlòp mwayen :' : 'Enveloppes moyennes :'}</span>
                    <span className="font-mono font-bold text-neutral-300">
                      {Math.round(totalAllocated / (envelopes.length || 1))} HTG
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Alert notice inside insights */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-neutral-200 uppercase tracking-wide">
                  {language === 'HT' ? '🚨 Atansyon Bidjè' : '🚨 Alertes de vigilance'}
                </h4>
                {envelopes.some(env => env.spentAmount >= env.allocatedAmount) ? (
                  <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-950/25 text-[10.5px] font-bold text-red-300 leading-normal">
                    ⚠️ {language === 'HT' 
                      ? 'Gen anvlòp ki vid! Fè sipò nan fon degaje a san reta.'
                      : 'Certaines enveloppes sont vides ! Utilisez le fonds de secours.'}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-950/25 text-[10.5px] font-bold text-emerald-300 leading-normal text-left">
                    ✅ {language === 'HT' 
                      ? 'Tout anvlòp yo gen kòb ladan yo. Sante w rete pwoteje!'
                      : 'Toutes les enveloppes disposent de fonds. Votre budget tient bon !'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-neutral-300 font-black text-xs">
              <span>🤖</span>
              <span>{language === 'HT' ? 'Analiz rapid chatbot Pyas :' : 'Conseil financier personnalisé de Pyas :'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-400 font-bold font-sans">
              {financialHealthScore >= 80 
                ? (language === 'HT' 
                    ? "Sante finansyè w ekselan ! Disiplin ou genyen an ap pèmèt ou pran gwo desizyon pwojè san kè kase. Kenbe konsa." 
                    : "Votre santé financière est excellente ! Discipline et rigueur vous protègent des imprévus. Continuez sur cette lancée.")
                : financialHealthScore >= 50
                ? (language === 'HT' 
                    ? "Sante mwayen. Pousantaj sere kòb ou yo bon men ou ka fè pi plis fòs toujou pou w ka bati pi bon fòs degaje." 
                    : "Santé budgétaire moyenne. Vos réserves sont acceptables, mais essayez de renforcer votre fonds d'urgence.")
                : (language === 'HT' 
                    ? "Atansyon ! Nivo w ba. Li enpòtan pou w evite depans ki pa nesesè yo epi fèm byen vit anvlòp lwazi yo." 
                    : "Attention, vigilance maximale requise ! Ciblez les dépenses superflues et limitez les enveloppes de loisirs pour vous stabiliser.")
              }
            </p>
          </div>
        </div>

        {/* HIDDEN FOR BEGINNERS */}
        <div className="hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div>
              <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-1.5">
                <Sliders size={16} className="text-amber-400" />
                {language === 'HT' ? 'Modèl Divizyon Otomatik' : 'Modèles de Répartition Automatique'}
              </h3>
              <p className="text-[10.5px] text-neutral-400 mt-0.5">
                {language === 'HT' 
                  ? 'Chwazi oswa pèsonalize kijan nouvo revni yo ap separe otomatikman nan anvlòp ou yo.'
                  : 'Choisissez ou personnalisez comment vos futurs revenus seront répartis automatiquement.'}
              </p>
            </div>

            <button 
              onClick={() => setIsSlidersOpen(!isSlidersOpen)}
              className="text-amber-400 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer self-start sm:self-auto shrink-0"
            >
              {isSlidersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {currentLabels.customizePercentages}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {profiles.map(p => {
              // Calculate summary of active percentages
              const activeCount = Object.entries(p.percentages).filter(([_, val]) => val > 0).length;
              return (
                <button
                  key={p.id}
                  onClick={() => handleProfileChange(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    activeProfileId === p.id 
                      ? 'bg-amber-500/10 border-amber-400/40 text-amber-100 shadow-[0_4px_15px_rgba(242,202,80,0.05)]' 
                      : 'bg-neutral-900/50 border-white/5 text-neutral-400 hover:bg-neutral-900'
                  }`}
                >
                  <div className="text-xs font-black leading-normal truncate">
                    {language === 'HT' ? p.nameKreyol : p.name}
                  </div>
                  <div className="text-[9px] opacity-75 font-mono mt-1 font-semibold flex items-center gap-1 text-amber-300">
                    📂 {activeCount} {language === 'HT' ? 'anvlòp aktif' : 'enveloppes'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Adjust Sliders Panel */}
          {isSlidersOpen && activeProfile && (
            <div className="p-4 bg-neutral-950/40 rounded-xl space-y-4 border border-white/5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold">
                <span className="text-neutral-300 font-semibold">{currentLabels.customizePercentages} ({language === 'HT' ? activeProfile.nameKreyol : activeProfile.name})</span>
                <span className={`font-mono px-2 py-0.5 rounded flex items-center gap-1.5 ${currentSum <= 100 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {currentLabels.totalPercentage} {currentSum}% {currentSum <= 100 ? '✅' : '⚠️'}
                </span>
              </div>

              {currentSum < 100 ? (
                <div className="text-[10px] text-amber-300 bg-amber-950/20 px-3 py-2.5 rounded-lg border border-amber-900/30 flex items-start gap-1.5 font-semibold leading-normal">
                  <span className="text-amber-400 shrink-0 text-xs">💡</span>
                  <div>
                    {language === 'HT'
                      ? `Kòb ki rete a (${100 - currentSum}% nan revni yo) ap rete otomatikman nan Pòtfe w (Solde disponible) pou w ka separe l anyèlman pita.`
                      : `Puisque la somme est inférieure à 100%, l'excédent (${100 - currentSum}% de vos revenus) restera automatiquement dans votre Portefeuille (Solde disponible) !`}
                  </div>
                </div>
              ) : currentSum > 100 ? (
                <div className="text-[10px] text-red-300 bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-900/40 flex items-start gap-1.5 font-semibold leading-normal">
                  <AlertCircle size={12} className="shrink-0 mt-0.5 text-red-400" />
                  <div>
                    {language === 'HT'
                      ? `Atansyon! Total la depase 100% (${currentSum}%). Nou rekòmande ou bese pousantaj yo pou pa depase revni w.`
                      : `Attention ! Le total dépasse 100% (${currentSum}%). Nous vous suggérons d'ajuster les pourcentages pour ne pas dépasser vos revenus.`}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-emerald-300 bg-emerald-950/20 px-3 py-2.5 rounded-lg border border-emerald-900/40 flex items-start gap-1.5 font-semibold leading-normal">
                  <span className="text-emerald-400 shrink-0 text-xs">⭐</span>
                  <div>
                    {language === 'HT'
                      ? "pafè! 100% revni w yo pral divize egzakteman daprè limit anvlòp yo."
                      : "Parfait ! 100% de vos revenus seront intégralement répartis entre vos enveloppes."}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {envelopes.map(env => {
                  const val = activeProfile.percentages[env.id] !== undefined ? activeProfile.percentages[env.id] : 0;
                  return (
                    <div key={env.id} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-neutral-400">
                        <span className="flex items-center gap-1">
                          {renderEnvelopeIcon(env.icon)}
                          {language === 'HT' ? env.nameKreyol : env.name}
                        </span>
                        <span className="font-mono text-neutral-200">{val}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={val}
                        onChange={(e) => handleSliderChange(env.id, parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Slices Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1.5">
            {envelopes.filter(env => (activeProfile.percentages[env.id] || 0) > 0).map(env => {
              const val = activeProfile.percentages[env.id] || 0;
              return (
                <div key={env.id} className="text-center p-2 bg-neutral-900/30 rounded-lg border border-white/5 flex flex-col justify-center">
                  <div className="text-[11px] font-black text-amber-400 font-mono leading-none flex items-center justify-center gap-1">
                    {renderEnvelopeIcon(env.icon)}
                    {val}%
                  </div>
                  <div className="text-[8.5px] text-neutral-400 font-black truncate mt-1 leading-none uppercase">
                    {language === 'HT' ? env.nameKreyol : env.name}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* 3. ENVELOPES DETAILED LIST */}
      <section className="space-y-4">

        {/* Toggle option for advanced automated partition */}
        <div className="glass-card rounded-2xl p-4 border border-white/5 bg-neutral-900/10">
          <button
            type="button"
            onClick={() => setIsAutoSplitOpen(!isAutoSplitOpen)}
            className="w-full text-left flex items-center justify-between text-xs font-black uppercase text-amber-400 tracking-wider hover:text-amber-300 transition duration-150 cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5 font-sans">
              <span>⚙️</span> {language === 'HT' ? 'Otomatizasyon (Opsyon avanse)' : 'Automatisation (Option avancée)'}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
              <span>{isAutoSplitOpen ? 'MINDER' : 'EKSPLORE'}</span>
              <span>{isAutoSplitOpen ? '▲' : '▼'}</span>
            </div>
          </button>

          {isAutoSplitOpen && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in slide-in-from-top-3 duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div>
                  <h4 className="font-extrabold text-neutral-100 text-xs flex items-center gap-1.5 font-sans">
                    Modèl Divizyon Otomatik
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5 font-semibold font-sans">
                    {language === 'HT' 
                      ? 'Chwazi oswa pèsonalize kijan nouvo revni yo ap separe otomatikman nan anvlòp ou yo.'
                      : 'Choisissez ou personnalisez comment vos futurs revenus seront répartis automatiquement.'}
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={() => setIsSlidersOpen(!isSlidersOpen)}
                  className="text-amber-400 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer font-sans"
                >
                  <span>✏️</span>
                  {currentLabels.customizePercentages}
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {profiles.map(p => {
                  const activeCount = Object.entries(p.percentages).filter(([_, val]) => val > 0).length;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProfileChange(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        activeProfileId === p.id 
                          ? 'bg-amber-500/10 border-amber-400/40 text-amber-100' 
                          : 'bg-neutral-950/40 border-white/5 text-neutral-400 hover:bg-neutral-900/40'
                      }`}
                    >
                      <div className="text-xs font-black truncate font-sans">
                        {language === 'HT' ? p.nameKreyol : p.name}
                      </div>
                      <div className="text-[9px] font-mono mt-1 font-bold flex items-center gap-1 text-amber-300">
                        📂 {activeCount} {language === 'HT' ? 'anvlòp' : 'enveloppes'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {isSlidersOpen && activeProfile && (
                <div className="p-4 bg-neutral-950/60 rounded-xl space-y-4 border border-white/5 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold font-sans">
                    <span className="text-neutral-300 font-semibold">{currentLabels.customizePercentages} ({language === 'HT' ? activeProfile.nameKreyol : activeProfile.name})</span>
                    <span className={`font-mono px-2 py-0.5 rounded flex items-center gap-1.5 ${currentSum <= 100 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {currentLabels.totalPercentage} {currentSum}% {currentSum <= 100 ? '✅' : '⚠️'}
                    </span>
                  </div>

                  {currentSum < 100 ? (
                    <div className="text-[10px] text-amber-300 bg-amber-950/20 px-3 py-2.5 rounded-lg border border-amber-900/30 flex items-start gap-1.5 font-semibold font-sans">
                      💡
                      <div>
                        {language === 'HT'
                          ? `Kòb ki rete a (${100 - currentSum}% nan revni yo) ap rete otomatikman nan Pòtfe w (Solde disponible) pou w ka separe l anyèlman pita.`
                          : `Puisque la somme est inférieure à 100%, l'excédent (${100 - currentSum}% de vos revenus) restera automatiquement dans votre Portefeuille (Solde disponible) !`}
                      </div>
                    </div>
                  ) : currentSum > 100 ? (
                    <div className="text-[10px] text-red-300 bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-900/40 flex items-start gap-1.5 font-semibold font-sans">
                      ⚠️
                      <div>
                        {language === 'HT'
                          ? `Atansyon! Total la depase 100% (${currentSum}%). Nou rekòmande ou bese pousantaj yo pou pa depase revni w.`
                          : `Attention ! Le total dépasse 100% (${currentSum}%). Nous vous suggérons d'ajuster les pourcentages pour ne pas dépasser vos revenus.`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-300 bg-emerald-950/20 px-3 py-2.5 rounded-lg border border-emerald-900/40 flex items-start gap-1.5 font-semibold font-sans">
                      ⭐
                      <div>
                        {language === 'HT'
                          ? "pafè! 100% revni w yo pral divize egzakteman daprè limit anvlòp yo."
                          : "Parfait ! 100% de vos revenus seront intégralement répartis entre vos enveloppes."}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {envelopes.map(env => {
                      const val = activeProfile.percentages[env.id] !== undefined ? activeProfile.percentages[env.id] : 0;
                      return (
                        <div key={env.id} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-neutral-400">
                            <span className="flex items-center gap-1 font-sans">
                              {renderEnvelopeIcon(env.icon)}
                              {language === 'HT' ? env.nameKreyol : env.name}
                            </span>
                            <span className="font-mono text-neutral-200">{val}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={val}
                            onChange={(e) => handleSliderChange(env.id, parseInt(e.target.value))}
                            className="w-full accent-amber-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Slices Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1.5">
                {envelopes.filter(env => (activeProfile.percentages[env.id] || 0) > 0).map(env => {
                  const val = activeProfile.percentages[env.id] || 0;
                  return (
                    <div key={env.id} className="text-center p-2 bg-neutral-900/40 rounded-lg border border-white/5 flex flex-col justify-center">
                      <div className="text-[11px] font-black text-amber-400 font-mono leading-none flex items-center justify-center gap-1">
                        {renderEnvelopeIcon(env.icon)}
                        {val}%
                      </div>
                      <div className="text-[8.5px] text-neutral-400 font-black truncate mt-1 leading-none uppercase font-sans">
                        {language === 'HT' ? env.nameKreyol : env.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-lg md:text-xl text-neutral-100 flex items-center gap-2">
              <span>📂</span> {currentLabels.envelopesTitle}
            </h3>
            <p className="text-[11px] text-neutral-400 font-medium">
              {language === 'HT' ? 'Sove e jere lajan w pa anvlòp kreyatif oswa rekòmande yo.' : 'Organisez et économisez librement pour chaque aspect de votre vie.'}
            </p>
          </div>

          <button
            onClick={() => setShowCreateEnvelopeModal(true)}
            className="px-3.5 py-2.5 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
          >
            <Plus size={14} />
            {language === 'HT' ? 'Kreye Anvlòp' : 'Nouvelle Enveloppe'}
          </button>
        </div>

        {/* Category filtering tabs */}
        <div className="flex flex-wrap gap-1.5 pb-1 select-none">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase transition-all duration-150 cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                : 'bg-neutral-900/40 text-neutral-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            🌟 {language === 'HT' ? 'Tout' : 'Tout'}
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('monthly')}
            className={`px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase transition-all duration-150 cursor-pointer ${
              selectedCategoryFilter === 'monthly'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                : 'bg-neutral-900/40 text-neutral-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            🏡 {language === 'HT' ? 'Chak Mwa' : 'Mensuel'}
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('saving')}
            className={`px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase transition-all duration-150 cursor-pointer ${
              selectedCategoryFilter === 'saving'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                : 'bg-neutral-900/40 text-neutral-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            💰 {language === 'HT' ? 'Epany' : 'Épargne'}
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('event')}
            className={`px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase transition-all duration-150 cursor-pointer ${
              selectedCategoryFilter === 'event'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                : 'bg-neutral-900/40 text-neutral-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            🎉 {language === 'HT' ? 'Evènman' : 'Événement'}
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('subscription')}
            className={`px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase transition-all duration-150 cursor-pointer ${
              selectedCategoryFilter === 'subscription'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                : 'bg-neutral-900/40 text-neutral-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            📅 {language === 'HT' ? 'Abònman' : 'Abonnement'}
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('project')}
            className={`px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase transition-all duration-150 cursor-pointer ${
              selectedCategoryFilter === 'project'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                : 'bg-neutral-900/40 text-neutral-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            🚀 {language === 'HT' ? 'Pwojè' : 'Projet'}
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('custom')}
            className={`px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase transition-all duration-150 cursor-pointer ${
              selectedCategoryFilter === 'custom'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                : 'bg-neutral-900/40 text-neutral-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            📦 {language === 'HT' ? 'Pèsonalize' : 'Perso'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {envelopes
            .filter(env => {
              if (selectedCategoryFilter === 'all') return true;
              return (env.category || 'custom') === selectedCategoryFilter;
            })
            .map(env => {
              const progress = env.allocatedAmount > 0 
                ? Math.min(100, Math.round((env.spentAmount / env.allocatedAmount) * 100))
                : 0;
              const balance = env.allocatedAmount - env.spentAmount;

              return (
                <div 
                  key={env.id}
                  className={`glass-card rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-sm relative overflow-hidden transition hover:border-white/10 ${
                    balance < 0 ? 'border-red-500/20 bg-red-950/5' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="w-8 h-8 rounded-lg bg-neutral-950/60 flex items-center justify-center border border-white/5">
                        {renderEnvelopeIcon(env.icon)}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          balance < 0 ? 'bg-red-500/10 text-red-400' : 'bg-neutral-850 text-neutral-400'
                        }`}>
                          {progress}% {language === 'HT' ? 'Depanse' : 'Dépensé'}
                        </span>

                        <button
                          onClick={() => {
                            setEditEnvelopeName(env.name);
                            setEditEnvelopeNameKreyol(env.nameKreyol || '');
                            setEditEnvelopeIcon(env.icon || 'utensils');
                            setEditEnvelopeCategory(env.category || 'custom');
                            setEditEnvelopeIsRecurring(!!env.recurringAmount);
                            setEditEnvelopeRecurringAmount(env.recurringAmount?.toString() || '');
                            setEditEnvelopeRecurringCurrency(env.recurringCurrency || 'HTG');
                            setEditEnvelopeRecurringNextDate(env.recurringNextDate || '');
                            setShowEditEnvelopePropsModal(env.id);
                          }}
                          className="p-1 text-neutral-500 hover:text-amber-400 rounded hover:bg-white/5 transition cursor-pointer"
                          title={language === 'HT' ? 'Chanje Anvlòp sa' : 'Modifier cette enveloppe'}
                        >
                          <Edit2 size={12} />
                        </button>

                        <button
                          onClick={() => {
                            setEnvelopeToDelete(env);
                          }}
                          className="p-1 text-neutral-500 hover:text-red-400 rounded hover:bg-white/5 transition cursor-pointer"
                          title={language === 'HT' ? 'Siprime Anvlòp sa' : 'Supprimer cette enveloppe'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-neutral-100 text-xs md:text-sm leading-normal truncate">
                        {language === 'HT' ? env.nameKreyol : env.name}
                      </h4>
                      
                      {/* Classification Labels */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-neutral-400 font-extrabold font-mono inline-block">
                          {env.category === 'monthly' ? '🏡 Mensuel' :
                           env.category === 'saving' ? '💰 Épargne' :
                           env.category === 'event' ? '🎉 Événement' :
                           env.category === 'subscription' ? '📅 Abonnement' :
                           env.category === 'project' ? '🚀 Projet' : '📦 Perso'}
                        </span>

                        {activeProfile && activeProfile.percentages[env.id] !== undefined ? (
                          <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-neutral-400 font-extrabold font-mono inline-block">
                            {activeProfile.percentages[env.id]}% {language === 'HT' ? 'pataje' : 'automatique'}
                          </span>
                        ) : (
                          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-extrabold font-mono inline-block">
                            ⭐ {language === 'HT' ? 'Amanyèl' : 'Perso/Manuel'}
                          </span>
                        )}
                      </div>

                      {/* Recurring details & Notifications */}
                      {env.recurringAmount && (
                        <div className="mt-2.5 space-y-1 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
                          <div className="text-[9.5px] font-black text-amber-400 flex items-center justify-between">
                            <span>🔁 {language === 'HT' ? 'Abònman' : 'Recurrent'} :</span>
                            <span className="font-mono">{formatMoney(env.recurringAmount, env.recurringCurrency || 'HTG')}</span>
                          </div>
                          {env.recurringNextDate && (
                            <div className="text-[8.5px] text-neutral-400 font-bold">
                              📅 {language === 'HT' ? 'Dat pwochen' : 'Échéance'} : {env.recurringNextDate}
                            </div>
                          )}

                          {balance < env.recurringAmount && (
                            <div className="mt-1.5 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-[9px] leading-relaxed font-semibold">
                              🔔 {language === 'HT'
                                ? `Gen sèlman ${formatMoney(balance, 'HTG')}. Manke ${formatMoney(env.recurringAmount - balance, 'HTG')} pou abònman sa !`
                                : `Fonds insuffisants. Il manque ${formatMoney(env.recurringAmount - balance, 'HTG')} pour payer l'abonnement.`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-1">
                      {/* Allocated Line with direct actions */}
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-neutral-500 font-semibold">{currentLabels.allocated}</span>
                        <div className="flex items-center gap-1 font-mono text-neutral-300 font-bold">
                          <span>{formatMoney(env.allocatedAmount, 'HTG')}</span>
                          <div className="flex items-center gap-0.5 bg-neutral-950 p-0.5 rounded border border-white/5">
                            <button
                              onClick={() => {
                                setNewDepositAmount(env.allocatedAmount.toString());
                                setShowEditDepositModal(env.id);
                              }}
                              className="p-1 hover:text-amber-400 text-neutral-500 hover:bg-neutral-900 rounded transition cursor-pointer"
                              title={language === 'HT' ? 'Chanje depo a' : 'Modifier le dépôt'}
                            >
                              <Edit2 size={9} />
                            </button>
                            <button
                              onClick={() => {
                                setAddFundsAmount('');
                                setShowAddFundsModal(env.id);
                              }}
                              className="p-1 hover:text-emerald-400 text-neutral-500 hover:bg-neutral-900 rounded transition cursor-pointer"
                              title={language === 'HT' ? 'Depoze kòb pi plis' : 'Ajouter des fonds'}
                            >
                              <Plus size={9} />
                            </button>
                            <button
                              onClick={() => {
                                setWithdrawFundsAmount('');
                                setShowWithdrawModal(env.id);
                              }}
                              className="p-1 hover:text-rose-400 text-neutral-500 hover:bg-neutral-900 rounded transition cursor-pointer"
                              title={language === 'HT' ? 'Retire kòb' : 'Retirer des fonds'}
                            >
                              <Minus size={9} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-neutral-500 font-semibold">{currentLabels.spent}</span>
                        <div className="flex items-center gap-1 font-mono text-neutral-400 font-bold">
                          <span>{formatMoney(env.spentAmount, 'HTG')}</span>
                          <div className="flex items-center gap-0.5 bg-neutral-950 p-0.5 rounded border border-white/5">
                            <button
                              onClick={() => {
                                setNewSpentAmount(env.spentAmount.toString());
                                setShowEditSpentModal(env.id);
                              }}
                              className="p-1 hover:text-amber-400 text-neutral-500 hover:bg-neutral-900 rounded transition cursor-pointer"
                              title={language === 'HT' ? 'Chanje depans yo' : 'Modifier les dépenses'}
                            >
                              <Edit2 size={9} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden relative border border-white/5">
                        <div 
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                            balance < 0 
                              ? 'bg-red-500' 
                              : progress > 85 
                              ? 'bg-amber-400' 
                              : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                          }`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Sòl</span>
                      <span className={`font-mono text-sm font-black ${
                        balance < 0 ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {formatMoney(balance, 'HTG')}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowExpenseModal(env.id)}
                      className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-[10.5px] uppercase tracking-wider rounded-lg border border-white/5 cursor-pointer text-center"
                    >
                      💸 {currentLabels.addExpense}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* 4. SEPARATED LIST OF SPENDS & INWARD TRANSFERS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT REVENUE HISTORY & SPLITS */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 shadow-sm">
          <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-1.5">
            <TrendingUp size={16} className="text-amber-400" />
            {currentLabels.historyTitle}
          </h3>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {incomeTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 bg-neutral-950/20 rounded-xl border border-dashed border-white/5">
                {currentLabels.noHistory}
              </div>
            ) : (
              incomeTransactions.map(tx => (
                <div key={tx.id} className="p-3 bg-neutral-900/50 rounded-xl border border-white/5 hover:border-white/10 space-y-2">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-extrabold text-neutral-200 block">
                        {tx.note || (language === 'HT' ? (
                          tx.source === 'SALARY' ? 'Salè jeneral' :
                          tx.source === 'DAILY_LABOR' ? 'Freelance / Biznis Kote' :
                          tx.source === 'TRANSFER' ? 'Transfè dyaspora / Kado' :
                          tx.source === 'COMMERCE' ? 'Ti Komès / Biznis' : 'Lòt sous'
                        ) : (
                          tx.source === 'SALARY' ? 'Salaire' :
                          tx.source === 'DAILY_LABOR' ? 'Freelance' :
                          tx.source === 'TRANSFER' ? 'Transfert d\'argent' :
                          tx.source === 'COMMERCE' ? 'Commerce / Affaires' : 'Autre source'
                        ))}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {tx.date}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <span className="font-mono text-xs font-black text-amber-400">
                          + {formatMoney(tx.amount, tx.currency)}
                        </span>
                        <span className="text-[9px] font-extrabold text-neutral-400 block px-1.5 py-0.5 rounded bg-white/5 mt-0.5 uppercase tracking-wider">
                          {pIdLabel(tx.profileId)}
                        </span>
                      </div>
                      
                      {deleteConfirmTxId === tx.id ? (
                        <div className="flex items-center gap-1 self-center bg-red-950/40 border border-red-500/20 p-1 rounded-lg animate-in fade-in duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              deleteIncomeTransaction(tx.id);
                              setDeleteConfirmTxId(null);
                            }}
                            className="text-[9px] bg-red-500 hover:bg-red-600 text-white font-black px-1.5 py-0.5 rounded transition cursor-pointer font-sans"
                            title={language === 'HT' ? 'Konfime sipresyon an' : 'Confirmer la suppression'}
                          >
                            {language === 'HT' ? 'Wi' : 'Oui'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmTxId(null)}
                            className="text-[9px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded transition cursor-pointer font-sans"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTxId(tx.id)}
                          className="text-neutral-500 hover:text-red-400 p-1.5 rounded hover:bg-neutral-800 transition duration-150 cursor-pointer text-center flex items-center justify-center self-center shrink-0"
                          title={language === 'HT' ? 'Efase' : 'Supprimer'}
                        >
                          <Trash2 size={13} className="shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Splits details */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1 border-t border-white/5">
                    {Object.entries(tx.splits).map(([envId, sVal]) => {
                      if (sVal === 0) return null;
                      return (
                        <div key={envId} className="text-[9px] text-neutral-400 leading-tight">
                          <span className="block font-bold text-neutral-500 uppercase tracking-tight text-[8px]">
                            {envId}
                          </span>
                          <span className="font-mono font-bold">
                            {formatMoney(sVal, tx.currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FINANCIAL HEALTH RULES & CHEATSHEET */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3.5">
            <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-1.5">
              <Info size={16} className="text-neutral-400" />
              {language === 'HT' ? 'Konsèy pou Sante Finansyè' : 'Conseils pour Sante Finansyè'}
            </h3>

            <div className="p-3.5 bg-neutral-950/40 border border-white/5 rounded-xl space-y-3">
              <div className="flex items-start gap-2 text-xs">
                <span className="text-emerald-400 shrink-0 font-bold">✔</span>
                <p className="text-neutral-400 text-xs">
                  {language === 'HT'
                    ? 'Sere kòb regilyèman chak semèn pou jwenn tout 40 pwen nan Règilarite yo.'
                    : 'Épargnez chaque semaine pour débloquer les 40 points d\'assiduité de votre score.'
                  }
                </p>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <span className="text-emerald-400 shrink-0 font-bold">✔</span>
                <p className="text-neutral-400 text-xs">
                  {language === 'HT'
                    ? 'Ranpli anvlòp "Fon Degaje" a pou gen sekirite kont ijans epi jwenn 30 pwen nèt.'
                    : 'Garantissez au moins 3 000 HTG sur votre "Fon Degaje" d\'urgence pour cumuler les 30 points.'
                  }
                </p>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <span className="text-emerald-400 shrink-0 font-bold">✔</span>
                <p className="text-neutral-400 text-xs text-xs">
                  {language === 'HT'
                    ? 'Pa janm depanse plis pase sa w genyen nan anvlòp yo pou pa pèdi pwen Disiplin.'
                    : 'Évitez les enveloppes à solde négatif pour maintenir les 30 points de Discipline intacts.'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/10 flex gap-3 text-xs leading-relaxed font-medium">
            <span className="text-amber-400 text-lg">💡</span>
            <p className="text-neutral-400">
              {language === 'HT'
                ? "Pyas toujou la pou ba w konsèy sou jan pou miltipliye kòb anvlòp sa yo daprè bezwen kay ak lekòl."
                : "Utilisez le chatbot Pyas pour analyser la répartition optimale de vos enveloppes en temps de rentrée scolaire."
              }
            </p>
          </div>
        </div>

      </section>

      {/* --- ADD INCOME MODAL --- */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleAddIncomeSubmit}
            className="bg-neutral-900 border border-white/10 p-5 rounded-2xl max-w-sm w-full relative space-y-4"
          >
            <h3 className="text-base font-black text-amber-400 flex items-center gap-1.5">
              💵 {currentLabels.saveRentrée}
            </h3>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{currentLabels.source}</label>
              <select
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500"
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value as IncomeSource)}
              >
                <option value="SALARY">Salaire / Salè jeneral</option>
                <option value="DAILY_LABOR">Freelance / Biznis Kote</option>
                <option value="TRANSFER">Transfè dyaspora / Kado</option>
                <option value="COMMERCE">Ti Komès / Biznis</option>
                <option value="OTHER">Lòt sous / Divès</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">
                {language === 'HT' ? 'Ekri sous pèsonalize ou (Si ou vle)' : 'Sélectionnez ou écrivez votre propre source de revenu'}
              </label>
              <input
                type="text"
                placeholder={
                  incomeSource === 'SALARY' ? (language === 'HT' ? 'eg: Travay Lekòl, Ministè...' : 'ex: Salaire de Juin, Consultant...') :
                  incomeSource === 'COMMERCE' ? (language === 'HT' ? 'eg: Boutik, Vann klere...' : 'ex: Boutique, Vente habit...') :
                  incomeSource === 'TRANSFER' ? (language === 'HT' ? 'eg: MonCash, Kado Monik...' : 'ex: Envoi MonCash, Cadeau...') :
                  incomeSource === 'DAILY_LABOR' ? (language === 'HT' ? 'eg: Penti kay, Chofè kous...' : 'ex: Design Logo, Peinture...') :
                  (language === 'HT' ? 'eg: Enterè bank, Lwaye...' : 'ex: Intérêts, Loyer, Bonus...')
                }
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500 font-sans"
                value={customIncomeSource}
                onChange={(e) => setCustomIncomeSource(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-[10.5px] font-bold text-neutral-400">{currentLabels.amount}</label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-neutral-400">{currentLabels.currency}</label>
                <select
                  className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                  value={incomeCurrency}
                  onChange={(e) => setIncomeCurrency(e.target.value as any)}
                >
                  <option value="HTG">HTG</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1 pt-1.5">
              <input
                type="checkbox"
                id="autoSplitCheck"
                checked={autoSplitIncome}
                onChange={(e) => setAutoSplitIncome(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-neutral-950 border-white/10 accent-amber-500"
              />
              <label htmlFor="autoSplitCheck" className="text-xs font-bold text-neutral-300 cursor-pointer selection:bg-transparent">
                {language === 'HT' ? 'Pataje kòb la otomatikman' : 'Ventilation automatique'}
              </label>
            </div>

            {autoSplitIncome ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-neutral-400">{currentLabels.activeProfile}</label>
                  <select
                    className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500"
                    value={incomeProfileId}
                    onChange={(e) => setIncomeProfileId(e.target.value)}
                  >
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {language === 'HT' ? p.nameKreyol : p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 p-2 bg-neutral-950/60 rounded-xl text-[10px] text-neutral-400 italic font-medium leading-relaxed">
                  {language === 'HT' ? 'Kòb sa pral divize otomatikman nan tout anvlòp daprè pousantaj mòd yo.' : 'Cet argent sera réparti automatiquement selon les pourcentages prédéfinis.'}
                </div>
              </div>
            ) : (
              <div className="space-y-1 p-3 bg-emerald-950/35 border border-emerald-500/15 rounded-xl text-[10.5px] text-neutral-300 leading-relaxed font-semibold">
                ⭐ {language === 'HT' 
                  ? 'Kòb sa pral ale dirèk nan Fon Disponib pou w ka distribiye l amanyèlman nan anvlòp ou vle yo.' 
                  : 'Cet argent sera versé sur votre solde libre "Fonds disponible" pour que vous puissiez le répartir sur-mesure.'}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIncomeModal(false)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Anile
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                {language === 'HT' ? 'Sove' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- DECLARE EXPENSE MODAL --- */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleAddExpenseSubmit}
            className="bg-neutral-900 border border-white/10 p-5 rounded-2xl max-w-sm w-full relative space-y-4"
          >
            <h3 className="text-base font-black text-red-400 flex items-center gap-1.5">
              💸 {currentLabels.addExpense} : {pIdLabel(showExpenseModal)}
            </h3>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{currentLabels.amount} (HTG)</label>
              <input
                type="number"
                required
                placeholder="200"
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-red-500 font-mono"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">Note / Detay depans lan</label>
              <input
                type="text"
                placeholder="Ex : Achte pen oswa gaz..."
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-red-500"
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExpenseModal(null)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Anile
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Respekte bidjè a
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EMERGENCY TRANSFER FON DEGAJE MODAL --- */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleTransferSubmit}
            className="bg-neutral-900 border border-white/10 p-5 rounded-2xl max-w-sm w-full relative space-y-4"
          >
            <h3 className="text-base font-black text-amber-400 flex items-center gap-1.5">
              🛡️ {currentLabels.transferTitle}
            </h3>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{currentLabels.from}</label>
              <select
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500"
                value={transferSource}
                onChange={(e) => setTransferSource(e.target.value)}
              >
                {envelopes.map(env => (
                  <option key={env.id} value={env.id}>
                    {language === 'HT' ? env.nameKreyol : env.name} ({formatMoney(env.allocatedAmount - env.spentAmount, 'HTG')})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{currentLabels.to}</label>
              <select
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500"
                value={transferDest}
                onChange={(e) => setTransferDest(e.target.value)}
              >
                {envelopes.map(env => (
                  <option key={env.id} value={env.id}>
                    {language === 'HT' ? env.nameKreyol : env.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{currentLabels.amount} (HTG)</label>
              <input
                type="number"
                required
                placeholder="500"
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Anile
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                {currentLabels.transferAction}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EDIT DEPOSIT INSTANT MODAL --- */}
      {showEditDepositModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleEditDepositSubmit}
            className="bg-neutral-900 border border-white/10 p-5 rounded-2xl max-w-sm w-full relative space-y-4"
          >
            <h3 className="text-base font-black text-amber-400 flex items-center gap-1.5">
              ✏️ {language === 'HT' ? 'Chanje depo a' : 'Modifier le dépôt'} : {pIdLabel(showEditDepositModal)}
            </h3>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{language === 'HT' ? 'Kantite kòb ou vle mete nèt (HTG)' : 'Nouveau budget total alloué (HTG)'}</label>
              <input
                type="number"
                required
                min="0"
                placeholder="2000"
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                value={newDepositAmount}
                onChange={(e) => setNewDepositAmount(e.target.value)}
              />
            </div>

            <div className="text-[10px] text-neutral-400 leading-normal bg-neutral-950/40 p-2.5 rounded-lg border border-white/5">
              {language === 'HT' 
                ? 'Diferans lan pral kalkile otomatikman pou mete oswa retire kòb nan Fon Disponib yo.' 
                : 'La différence sera répercutée pour libérer ou amputer votre montant restant dans les "Fonds disponibles".'}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditDepositModal(null);
                  setNewDepositAmount('');
                }}
                className="flex-1 py-3 bg-neutral-800 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Anile
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                {language === 'HT' ? 'Chanje kounye a' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EDIT SPENT INSTANT MODAL --- */}
      {showEditSpentModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleEditSpentSubmit}
            className="bg-neutral-900 border border-white/10 p-5 rounded-2xl max-w-sm w-full relative space-y-4"
          >
            <h3 className="text-base font-black text-amber-400 flex items-center gap-1.5">
              ✏️ {language === 'HT' ? 'Chanje depans yo' : 'Modifier les dépenses'} : {pIdLabel(showEditSpentModal)}
            </h3>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">
                {language === 'HT' ? 'Kantite depans ou vle mete nèt (HTG)' : 'Nouveau montant total dépensé (HTG)'}
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="2000"
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                value={newSpentAmount}
                onChange={(e) => setNewSpentAmount(e.target.value)}
              />
            </div>

            <div className="text-[10px] text-neutral-400 leading-normal bg-neutral-950/40 p-2.5 rounded-lg border border-white/5">
              {language === 'HT' 
                ? 'Sa pral chanje montan total depans yo pou anvlòp sa a nèt.' 
                : 'Ceci modifiera directement le montant cumulé de vos dépenses pour cette enveloppe.'}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditSpentModal(null);
                  setNewSpentAmount('');
                }}
                className="flex-1 py-3 bg-neutral-800 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Anile
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                {language === 'HT' ? 'Chanje kounye a' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EDIT ENVELOPE PROPERTIES MODAL --- */}
      {showEditEnvelopePropsModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleEditEnvelopePropsSubmit}
            className="bg-neutral-900 border border-white/10 p-5 rounded-2xl max-w-sm w-full relative space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h3 className="text-base font-black text-amber-400 flex items-center gap-1.5">
              ✏️ {language === 'HT' ? 'Chanje Anvlòp la' : 'Modifier l\'enveloppe'}
            </h3>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">
                {language === 'HT' ? 'Non anvlòp an (Franse)' : 'Nom de l\'enveloppe (Français)'}
              </label>
              <input
                type="text"
                required
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500 font-sans"
                value={editEnvelopeName}
                onChange={(e) => setEditEnvelopeName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">
                {language === 'HT' ? 'Non anvlòp an (Kreyòl)' : 'Nom de l\'enveloppe (Kreyòl)'}
              </label>
              <input
                type="text"
                required
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500 font-sans"
                value={editEnvelopeNameKreyol}
                onChange={(e) => setEditEnvelopeNameKreyol(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">Icône / Ikon</label>
              <select
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500"
                value={editEnvelopeIcon}
                onChange={(e) => setEditEnvelopeIcon(e.target.value)}
              >
                <option value="utensils">🍚 {language === 'HT' ? 'Manje / Nouviti' : 'Nourriture'}</option>
                <option value="car">🚗 {language === 'HT' ? 'Transpò / Vwayaj' : 'Transport'}</option>
                <option value="graduation-cap">🎓 {language === 'HT' ? 'Lekòl / Edikasyon' : 'Scolarité/École'}</option>
                <option value="piggy-bank">💰 {language === 'HT' ? 'Epany / Sere' : 'Épargne/Investissement'}</option>
                <option value="home">🏠 {language === 'HT' ? 'Kay / Lwaye' : 'Logement/Maison'}</option>
                <option value="shopping-bag">🛍️ {language === 'HT' ? 'Acha / Boutik' : 'Courses/Shopping'}</option>
                <option value="shield-alert">🚨 {language === 'HT' ? 'Ijans oswa Devwa' : 'Urgence/Sécurité'}</option>
              </select>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10.5px] font-bold text-neutral-400">Type d'Enveloppe / Kalite Anvlòp</label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`p-2 bg-neutral-950/40 rounded-xl border flex items-center gap-1 cursor-pointer text-[9.5px] font-black ${editEnvelopeCategory === 'monthly' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="editCategory"
                    checked={editEnvelopeCategory === 'monthly'}
                    onChange={() => setEditEnvelopeCategory('monthly')}
                    className="hidden"
                  />
                  <span>🏡 {language === 'HT' ? 'Chak Mwa' : 'Mensuel'}</span>
                </label>

                <label className={`p-2 bg-neutral-950/40 rounded-xl border flex items-center gap-1 cursor-pointer text-[9.5px] font-black ${editEnvelopeCategory === 'saving' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="editCategory"
                    checked={editEnvelopeCategory === 'saving'}
                    onChange={() => setEditEnvelopeCategory('saving')}
                    className="hidden"
                  />
                  <span>💰 {language === 'HT' ? 'Epany' : 'Épargne'}</span>
                </label>

                <label className={`p-2 bg-neutral-950/40 rounded-xl border flex items-center gap-1 cursor-pointer text-[9.5px] font-black ${editEnvelopeCategory === 'event' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="editCategory"
                    checked={editEnvelopeCategory === 'event'}
                    onChange={() => setEditEnvelopeCategory('event')}
                    className="hidden"
                  />
                  <span>🎉 {language === 'HT' ? 'Evènman' : 'Événement'}</span>
                </label>

                <label className={`p-2 bg-neutral-950/40 rounded-xl border flex items-center gap-1 cursor-pointer text-[9.5px] font-black ${editEnvelopeCategory === 'subscription' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="editCategory"
                    checked={editEnvelopeCategory === 'subscription'}
                    onChange={() => {
                      setEditEnvelopeCategory('subscription');
                      setEditEnvelopeIsRecurring(true);
                    }}
                    className="hidden"
                  />
                  <span>📅 {language === 'HT' ? 'Abònman' : 'Abonnement'}</span>
                </label>

                <label className={`p-2 bg-neutral-950/40 rounded-xl border flex items-center gap-1 cursor-pointer text-[9.5px] font-black ${editEnvelopeCategory === 'project' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="editCategory"
                    checked={editEnvelopeCategory === 'project'}
                    onChange={() => setEditEnvelopeCategory('project')}
                    className="hidden"
                  />
                  <span>🚀 {language === 'HT' ? 'Pwojè' : 'Projet'}</span>
                </label>

                <label className={`p-2 bg-neutral-950/40 rounded-xl border flex items-center gap-1 cursor-pointer text-[9.5px] font-black ${editEnvelopeCategory === 'custom' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="editCategory"
                    checked={editEnvelopeCategory === 'custom'}
                    onChange={() => setEditEnvelopeCategory('custom')}
                    className="hidden"
                  />
                  <span>📦 {language === 'HT' ? 'Pèsonèl' : 'Perso'}</span>
                </label>
              </div>
            </div>

            {/* Recurring payment fields */}
            <div className="space-y-2 p-3 bg-neutral-950/60 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsRecurringCheck"
                  checked={editEnvelopeIsRecurring}
                  onChange={(e) => {
                    setEditEnvelopeIsRecurring(e.target.checked);
                    if (e.target.checked && editEnvelopeRecurringCurrency === undefined) {
                      setEditEnvelopeRecurringCurrency('HTG');
                    }
                  }}
                  className="w-4 h-4 rounded text-amber-500 bg-neutral-950 border-white/10 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="editIsRecurringCheck" className="text-[11px] font-extrabold text-neutral-200 cursor-pointer selection:bg-transparent">
                  🔁 {language === 'HT' ? 'Pajman regilyè / Abònman' : 'Paiement récurrent / Échéance'}
                </label>
              </div>

              {editEnvelopeIsRecurring && (
                <div className="space-y-3 pt-2 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9.5px] font-bold text-neutral-400">{language === 'HT' ? 'Kantite' : 'Montant'}</label>
                      <input
                        type="number"
                        placeholder="1000"
                        className="w-full bg-neutral-950 border border-white/10 text-white p-2.5 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                        value={editEnvelopeRecurringAmount}
                        onChange={(e) => setEditEnvelopeRecurringAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-neutral-400">{language === 'HT' ? 'Lajan' : 'Devise'}</label>
                      <select
                        className="w-full bg-neutral-950 border border-white/10 text-white p-2.5 rounded-xl text-[11px] outline-none focus:border-amber-500 font-mono"
                        value={editEnvelopeRecurringCurrency}
                        onChange={(e) => setEditEnvelopeRecurringCurrency(e.target.value as any)}
                      >
                        <option value="HTG">HTG</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="USDT">USDT</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-neutral-400">
                      {language === 'HT' ? 'Dat pwochen peman an' : 'Prochaine échéance'}
                    </label>
                    <input
                      type="date"
                      className="w-full bg-neutral-950 border border-white/10 text-white p-2.5 rounded-xl text-xs outline-none focus:border-amber-500 font-mono font-sans"
                      value={editEnvelopeRecurringNextDate}
                      onChange={(e) => setEditEnvelopeRecurringNextDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditEnvelopePropsModal(null);
                }}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Anile
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                {language === 'HT' ? 'Sove' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- ADD FUNDS QUICK MODAL --- */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleAddFundsSubmit}
            className="bg-neutral-900 border border-white/10 p-5 rounded-text-xs rounded-2xl max-w-sm w-full relative space-y-4"
          >
            <h3 className="text-base font-black text-emerald-400 flex items-center gap-1.5">
              ➕ {language === 'HT' ? 'Depoze kòb' : 'Ajouter des fonds'} : {pIdLabel(showAddFundsModal)}
            </h3>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{language === 'HT' ? 'Kantite kòb (HTG)' : 'Montant à ajouter (HTG)'}</label>
              <input
                type="number"
                required
                min="1"
                placeholder="1000"
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-emerald-500 font-mono"
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
              />
            </div>

            <div className="text-[10px] text-neutral-400 font-semibold">
              {language === 'HT' ? `Kòb disponib ou genyen : ${formatMoney(availableFunds, 'HTG')}` : `Maximum allouable de vos fonds libres : ${formatMoney(availableFunds, 'HTG')}`}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddFundsModal(null);
                  setAddFundsAmount('');
                }}
                className="flex-1 py-3 bg-neutral-800 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Anile
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Ajoute kòb
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- WITHDRAW FUNDS QUICK MODAL --- */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleWithdrawFundsSubmit}
            className="bg-neutral-900 border border-white/10 p-5 rounded-2xl max-w-sm w-full relative space-y-4"
          >
            <h3 className="text-base font-black text-rose-400 flex items-center gap-1.5">
              ➖ {language === 'HT' ? 'Retire kòb' : 'Retirer des fonds'} : {pIdLabel(showWithdrawModal)}
            </h3>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{language === 'HT' ? 'Kantite kòb (HTG)' : 'Montant à récupérer (HTG)'}</label>
              <input
                type="number"
                required
                min="1"
                placeholder="500"
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-rose-500 font-mono"
                value={withdrawFundsAmount}
                onChange={(e) => setWithdrawFundsAmount(e.target.value)}
              />
            </div>

            <div className="text-[10px] text-neutral-400 font-semibold">
              {language === 'HT' 
                ? `Limit maksimòm ou ka retire : ${formatMoney(envelopes.find(env => env.id === showWithdrawModal)?.allocatedAmount || 0, 'HTG')}` 
                : `Maximum retirable de cette enveloppe : ${formatMoney(envelopes.find(env => env.id === showWithdrawModal)?.allocatedAmount || 0, 'HTG')}`}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowWithdrawModal(null);
                  setWithdrawFundsAmount('');
                }}
                className="flex-1 py-3 bg-neutral-800 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Anile
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-neutral-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Retire kòb
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- CREATE CUSTOM ENVELOPE MODAL --- */}
      {showCreateEnvelopeModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleCreateEnvelopeSubmit}
            className="bg-neutral-900 border border-white/10 p-5 rounded-2xl max-w-sm w-full relative space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-black text-amber-400 flex items-center gap-1.5">
              📂 {language === 'HT' ? 'Kreye yon lòt anvlòp' : 'Nouvelle enveloppe'}
            </h3>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{language === 'HT' ? 'Non anvlòp an (Franse)' : 'Nom de l\'enveloppe (Français)'}</label>
              <input
                type="text"
                required
                placeholder="Ex : Shopping, Sante..."
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500"
                value={newEnvelopeName}
                onChange={(e) => setNewEnvelopeName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{language === 'HT' ? 'Non anvlòp an (Kreyòl)' : 'Nom de l\'enveloppe (Kreyòl - Optionnel)'}</label>
              <input
                type="text"
                placeholder="Ex : Makèt, Sante..."
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500"
                value={newEnvelopeNameKreyol}
                onChange={(e) => setNewEnvelopeNameKreyol(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">Icône / Ikon</label>
              <select
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500"
                value={newEnvelopeIcon}
                onChange={(e) => setNewEnvelopeIcon(e.target.value)}
              >
                <option value="utensils">🍚 {language === 'HT' ? 'Manje / Nouviti' : 'Nourriture'}</option>
                <option value="car">🚗 {language === 'HT' ? 'Transpò / Vwayaj' : 'Transport'}</option>
                <option value="graduation-cap">🎓 {language === 'HT' ? 'Lekòl / Edikasyon' : 'Scolarité/École'}</option>
                <option value="piggy-bank">💰 {language === 'HT' ? 'Epany / Sere' : 'Épargne/Investissement'}</option>
                <option value="home">🏠 {language === 'HT' ? 'Kay / Lwaye' : 'Logement/Maison'}</option>
                <option value="shopping-bag">🛍️ {language === 'HT' ? 'Acha / Boutik' : 'Courses/Shopping'}</option>
                <option value="shield-alert">🚨 {language === 'HT' ? 'Ijans oswa Devwa' : 'Urgence/Sécurité'}</option>
              </select>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10.5px] font-bold text-neutral-400">Type d'Enveloppe / Kalite Anvlòp</label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`p-2.5 rounded-xl border flex items-center gap-1.5 cursor-pointer selection:bg-transparent text-[10.5px] font-extrabold ${newEnvelopeCategory === 'monthly' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-neutral-950/40 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={newEnvelopeCategory === 'monthly'}
                    onChange={() => {
                      setNewEnvelopeCategory('monthly');
                    }}
                    className="hidden"
                  />
                  <span>🏡 {language === 'HT' ? 'Depans Chak Mwa' : 'Dépense mensuelle'}</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-1.5 cursor-pointer selection:bg-transparent text-[10.5px] font-extrabold ${newEnvelopeCategory === 'saving' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-neutral-950/40 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={newEnvelopeCategory === 'saving'}
                    onChange={() => {
                      setNewEnvelopeCategory('saving');
                    }}
                    className="hidden"
                  />
                  <span>💰 {language === 'HT' ? 'Epany' : 'Épargne'}</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-1.5 cursor-pointer selection:bg-transparent text-[10.5px] font-extrabold ${newEnvelopeCategory === 'event' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-neutral-950/40 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={newEnvelopeCategory === 'event'}
                    onChange={() => {
                      setNewEnvelopeCategory('event');
                    }}
                    className="hidden"
                  />
                  <span>🎉 {language === 'HT' ? 'Evènman yo' : 'Événement'}</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-1.5 cursor-pointer selection:bg-transparent text-[10.5px] font-extrabold ${newEnvelopeCategory === 'subscription' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-neutral-950/40 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={newEnvelopeCategory === 'subscription'}
                    onChange={() => {
                      setNewEnvelopeCategory('subscription');
                      setNewEnvelopeIsRecurring(true); // Auto-enable recurring for subscriptions!
                    }}
                    className="hidden"
                  />
                  <span>📅 {language === 'HT' ? 'Abònman' : 'Abonnement'}</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-1.5 cursor-pointer selection:bg-transparent text-[10.5px] font-extrabold ${newEnvelopeCategory === 'project' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-neutral-950/40 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={newEnvelopeCategory === 'project'}
                    onChange={() => {
                      setNewEnvelopeCategory('project');
                    }}
                    className="hidden"
                  />
                  <span>🚀 {language === 'HT' ? 'Pwojè' : 'Projet'}</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-1.5 cursor-pointer selection:bg-transparent text-[10.5px] font-extrabold ${newEnvelopeCategory === 'custom' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-neutral-950/40 text-neutral-400 hover:border-white/10'}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={newEnvelopeCategory === 'custom'}
                    onChange={() => {
                      setNewEnvelopeCategory('custom');
                    }}
                    className="hidden"
                  />
                  <span>📦 {language === 'HT' ? 'Pèsonalize' : 'Personnalisé'}</span>
                </label>
              </div>
            </div>

            {/* Recurring payment fields */}
            <div className="space-y-2 p-3 bg-neutral-950/60 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurringCheck"
                  checked={newEnvelopeIsRecurring}
                  onChange={(e) => setNewEnvelopeIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-neutral-950 border-white/10 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="isRecurringCheck" className="text-[11px] font-extrabold text-neutral-200 cursor-pointer selection:bg-transparent">
                  🔁 {language === 'HT' ? 'Pajman regilyè / Abònman' : 'Paiement récurrent / Échéance'}
                </label>
              </div>

              {newEnvelopeIsRecurring && (
                <div className="space-y-3 pt-2 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9.5px] font-bold text-neutral-400">{language === 'HT' ? 'Kantite' : 'Montant'}</label>
                      <input
                        type="number"
                        placeholder="500"
                        className="w-full bg-neutral-950 border border-white/10 text-white p-2 rounded-lg text-xs outline-none focus:border-amber-500 font-mono"
                        value={newEnvelopeRecurringAmount}
                        onChange={(e) => setNewEnvelopeRecurringAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-neutral-400">Deviz</label>
                      <select
                        className="w-full bg-neutral-950 border border-white/10 text-white p-2 rounded-lg text-xs outline-none focus:border-amber-500"
                        value={newEnvelopeRecurringCurrency}
                        onChange={(e) => setNewEnvelopeRecurringCurrency(e.target.value as any)}
                      >
                        <option value="HTG">HTG</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="USDT">USDT</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-neutral-400">{language === 'HT' ? 'Dat pwochen pajman (ex: 15 jiyè)' : 'Prochain paiement (ex: 15 juillet)'}</label>
                    <input
                      type="text"
                      placeholder="Ex : 15 juillet"
                      className="w-full bg-neutral-950 border border-white/10 text-white p-2 rounded-lg text-xs outline-none focus:border-amber-500"
                      value={newEnvelopeRecurringNextDate}
                      onChange={(e) => setNewEnvelopeRecurringNextDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-400">{language === 'HT' ? 'Depo Premye fwa (HTG)' : 'Dépôt Initial (Optionnel - HTG)'}</label>
              <input
                type="number"
                min="0"
                placeholder="Ex : 2000"
                className="w-full bg-neutral-950 border border-white/10 text-white p-3 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                value={newEnvelopeInitialAlloc}
                onChange={(e) => setNewEnvelopeInitialAlloc(e.target.value)}
              />
            </div>

            <div className="text-[10.5px] text-amber-200 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-xl font-semibold">
              🔑 {language === 'HT' 
                ? `Kòb disponib ou kounye a se : ${formatMoney(availableFunds, 'HTG')}` 
                : `Vos fonds libres actuels : ${formatMoney(availableFunds, 'HTG')}`}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateEnvelopeModal(false)}
                className="flex-1 py-3 bg-neutral-800 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Anile
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Kreye li pafè
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- CONFIRM ENVELOPE DELETION MODAL --- */}
      {envelopeToDelete && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center z-[250] p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-black uppercase tracking-wider">
                {language === 'HT' ? 'Siprime Anvlòp?' : 'Suppression'}
              </h3>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-300 font-semibold leading-relaxed">
                {language === 'HT' 
                  ? `Èske ou vle siprime anvlòp "${envelopeToDelete.nameKreyol || envelopeToDelete.name}" la tout bon vre?` 
                  : `Voulez-vous vraiment supprimer l'enveloppe "${envelopeToDelete.name}" ?`}
              </p>
              
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 space-y-1 text-xs">
                <div className="flex justify-between items-center text-neutral-400 font-medium">
                  <span>{language === 'HT' ? 'Depo ki ladan l:' : 'Épargne cumulée:'}</span>
                  <span className="font-mono text-neutral-200 font-bold">
                    {formatMoney(envelopeToDelete.allocatedAmount, 'HTG')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-neutral-400 font-medium">
                  <span>{language === 'HT' ? 'Kòb depanse:' : 'Dépenses effectuées:'}</span>
                  <span className="font-mono text-neutral-200 font-bold">
                    {formatMoney(envelopeToDelete.spentAmount, 'HTG')}
                  </span>
                </div>
                <div className="border-t border-white/5 pt-1 mt-1 flex justify-between items-center font-bold text-amber-400 text-xs">
                  <span>{language === 'HT' ? 'Kantite kòb k ap retounen:' : 'Solde reversé:'}</span>
                  <span className="font-mono font-black">
                    {formatMoney(Math.max(0, envelopeToDelete.allocatedAmount - envelopeToDelete.spentAmount), 'HTG')}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-neutral-400 leading-normal bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg font-semibold">
                ⚠️ {language === 'HT' 
                  ? 'Kòb ki rete a pral otomatikman tounen nan Solde disponible (Pòtfe w) pou w ka mete l lòt kote.' 
                  : 'Le solde restant de cette enveloppe sera reversé sur votre Solde disponible (Portefeuille).'}
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setEnvelopeToDelete(null)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-800/80 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all select-none cursor-pointer"
              >
                {language === 'HT' ? 'Anile' : 'Annuler'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteEnvelope(envelopeToDelete.id);
                  setEnvelopeToDelete(null);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all select-none cursor-pointer shadow-lg shadow-rose-950/30"
              >
                {language === 'HT' ? 'Wi, Siprime' : 'Oui, Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  function pIdLabel(pId: string) {
    const envObj = envelopes.find(e => e.id === pId);
    if (envObj) return language === 'HT' ? envObj.nameKreyol : envObj.name;

    if (pId === 'normal') return language === 'HT' ? 'Nòmal' : 'Normal';
    if (pId === 'crisis') return language === 'HT' ? 'Kriz' : 'Crise';
    if (pId === 'school') return language === 'HT' ? 'Lekòl' : 'École';
    if (pId === 'business') return language === 'HT' ? 'Biznis' : 'Business';
    
    // Envelope mappings fallback
    if (pId === 'food') return language === 'HT' ? 'Manje' : 'Nourriture';
    if (pId === 'transport') return language === 'HT' ? 'Transpò' : 'Transport';
    if (pId === 'family') return language === 'HT' ? 'Fanmi/Lekòl' : 'Scolarité';
    if (pId === 'emergency') return language === 'HT' ? 'Fon Degaje' : 'Urgences';
    if (pId === 'saving') return language === 'HT' ? 'Epany' : 'Épargne';

    return pId;
  }
};
