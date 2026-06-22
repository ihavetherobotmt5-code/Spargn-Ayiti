import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CurrencyCode, IncomeSource } from '../types';
import { convert, formatMoney } from '../lib/currency';
import { TRANSLATIONS } from '../lib/translations';
import { 
  X, 
  ArrowRightLeft, 
  Coins, 
  TrendingUp, 
  Wallet, 
  PiggyBank, 
  Target, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  PlusCircle,
  TrendingDown
} from 'lucide-react';

interface CurrencyConverterModalProps {
  open: boolean;
  onClose: () => void;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({ open, onClose }) => {
  const { 
    rates, 
    language, 
    goals, 
    envelopes, 
    profiles, 
    addIncomeTransaction, 
    addEnvelopeExpense, 
    updateEnvelopeDeposit, 
    addContribution, 
    showToast 
  } = useAppContext();

  const t = TRANSLATIONS[language] || TRANSLATIONS.HT;

  // Conversion States
  const [amountStr, setAmountStr] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('HTG');

  // Multi-destination flow states
  const [showApplySection, setShowApplySection] = useState(false);
  const [activeTarget, setActiveTarget] = useState<'income' | 'expense' | 'deposit_envelope' | 'goal_contrib'>('income');

  // Destination Forms Input States
  // 1. Income Form
  const [incomeSource, setIncomeSource] = useState<IncomeSource>('OTHER');
  const [incomeProfileId, setIncomeProfileId] = useState<string>('');
  const [incomeNote, setIncomeNote] = useState<string>('');
  const [autoSplitIncome, setAutoSplitIncome] = useState<boolean>(true);

  // 2. Expense Form
  const [selectedExpenseEnvelopeId, setSelectedExpenseEnvelopeId] = useState<string>('');
  const [expenseNote, setExpenseNote] = useState<string>('');

  // 3. Envelope Deposit Form
  const [selectedDepositEnvelopeId, setSelectedDepositEnvelopeId] = useState<string>('');

  // 4. Goal Contribution Form
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [goalNote, setGoalNote] = useState<string>('');

  const amountNum = parseFloat(amountStr) || 0;
  const convertedVal = convert(amountNum, fromCurrency, toCurrency, rates);

  // Default values setup on open
  useEffect(() => {
    if (open) {
      setShowApplySection(false);
      setAmountStr('100');
      
      // Auto-set first options to avoid empty selections
      if (profiles && profiles.length > 0) {
        setIncomeProfileId(profiles[0].id);
      }
      if (envelopes && envelopes.length > 0) {
        setSelectedExpenseEnvelopeId(envelopes[0].id);
        setSelectedDepositEnvelopeId(envelopes[0].id);
      }
      if (goals && goals.length > 0) {
        setSelectedGoalId(goals[0].id);
      }
    }
  }, [open, profiles, envelopes, goals]);

  if (!open) return null;

  // Single unit rate calculations for the ticker text
  const rateForOne = convert(1, fromCurrency, toCurrency, rates);
  const inverseRateForOne = convert(1, toCurrency, fromCurrency, rates);

  // Handle transaction dispatch based on user target selection
  const handleApplyAmount = (e: React.FormEvent) => {
    e.preventDefault();

    if (convertedVal <= 0) {
      showToast(
        language === 'HT' 
          ? 'Kantite lajan an dwe pi gwo pase 0!' 
          : 'Le montant converti doit être supérieur à 0 !',
        'error'
      );
      return;
    }

    try {
      if (activeTarget === 'income') {
        // Send to Income
        addIncomeTransaction({
          amount: convertedVal,
          currency: toCurrency,
          source: incomeSource,
          date: new Date().toISOString().split('T')[0],
          profileId: incomeProfileId,
          note: incomeNote.trim() || undefined
        }, autoSplitIncome);

        showToast(
          language === 'HT' 
            ? `Rantre ${formatMoney(convertedVal, toCurrency)} te ajoute ak siksè !` 
            : `Revenu de ${formatMoney(convertedVal, toCurrency)} enregistré avec succès !`,
          'success'
        );
        onClose();
      } 
      else if (activeTarget === 'expense') {
        if (!selectedExpenseEnvelopeId) {
          showToast(language === 'HT' ? 'Chwazi yon anvlòp!' : 'Sélectionnez une enveloppe !', 'error');
          return;
        }

        // Envelopes use base currency (HTG), so convert the convertedVal to HTG first
        const amountHTG = convert(convertedVal, toCurrency, 'HTG', rates);
        addEnvelopeExpense(selectedExpenseEnvelopeId, amountHTG, expenseNote.trim() || undefined);

        const targetEnvelope = envelopes.find(e => e.id === selectedExpenseEnvelopeId);
        showToast(
          language === 'HT' 
            ? `Depans de ${formatMoney(amountHTG, 'HTG')} te ajoute nan anvlòp "${targetEnvelope?.nameKreyol || selectedExpenseEnvelopeId}" !` 
            : `Dépense de ${formatMoney(amountHTG, 'HTG')} enregistrée dans l'enveloppe "${targetEnvelope?.name || selectedExpenseEnvelopeId}" !`,
          'success'
        );
        onClose();
      } 
      else if (activeTarget === 'deposit_envelope') {
        if (!selectedDepositEnvelopeId) {
          showToast(language === 'HT' ? 'Chwazi yon anvlòp!' : 'Sélectionnez une enveloppe !', 'error');
          return;
        }

        const env = envelopes.find(e => e.id === selectedDepositEnvelopeId);
        if (!env) return;

        // Envelopes use base currency (HTG), so convert the convertedVal to HTG first
        const amountHTG = convert(convertedVal, toCurrency, 'HTG', rates);
        const newAllocated = env.allocatedAmount + amountHTG;

        updateEnvelopeDeposit(selectedDepositEnvelopeId, newAllocated);

        showToast(
          language === 'HT' 
            ? `Depo de ${formatMoney(amountHTG, 'HTG')} te ajoute nan envlòp la !` 
            : `Allocation de ${formatMoney(amountHTG, 'HTG')} ajoutée à l'enveloppe !`,
          'success'
        );
        onClose();
      } 
      else if (activeTarget === 'goal_contrib') {
        if (!selectedGoalId) {
          showToast(language === 'HT' ? 'Chwazi yon objektif!' : 'Sélectionnez un objectif !', 'error');
          return;
        }

        // Add contribution direktèman nan toCurrency
        addContribution(selectedGoalId, {
          amount: convertedVal,
          currency: toCurrency,
          date: new Date().toISOString().split('T')[0],
          note: goalNote.trim() || undefined
        });

        const targetGoal = goals.find(g => g.id === selectedGoalId);
        showToast(
          language === 'HT' 
            ? `Kontribisyon de ${formatMoney(convertedVal, toCurrency)} te ajoute nan objektif "${targetGoal?.name}" !` 
            : `Dépôt de ${formatMoney(convertedVal, toCurrency)} ajouté à l'objectif "${targetGoal?.name}" !`,
          'success'
        );
        onClose();
      }
    } catch {
      showToast(
        language === 'HT' 
          ? 'Gen yon ti erè ki pase nèt. Silvouplè eseye ankò.' 
          : 'Une erreur est survenue lors de l\'enregistrement.',
        'error'
      );
    }
  };

  // Switch conversion direction
  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  // Translations helpers inside the modal
  const text = {
    title: language === 'HT' ? 'Konvètè Lajan' : 'Convertisseur de Devises',
    subtitle: language === 'HT' ? 'Kalkile ak deplase lajan ant diferan deviz an tan reyèl' : 'Calculez et déplacez vos fonds entre devises en temps réel',
    amount: language === 'HT' ? 'Kantite lajan' : 'Montant à convertir',
    from: language === 'HT' ? 'Soti nan' : 'De (Depuis)',
    to: language === 'HT' ? 'Rive nan' : 'À (Vers)',
    rateUsed: language === 'HT' ? 'Taux de chanj ki itilize a :' : 'Taux de change appliqué :',
    useThisAmount: language === 'HT' ? 'Sèvi ak montan sa a' : 'Utiliser ce montant',
    sendTo: language === 'HT' ? 'Mete montan sa a kòm :' : 'Appliquer ce montant comme :',
    income: language === 'HT' ? 'Entre kòb (Rantre)' : 'Revenu (Entrée)',
    expense: language === 'HT' ? 'Depans' : 'Dépense/Achat',
    deposit_envelope: language === 'HT' ? 'Depo / Envlòp' : 'Allocation Enveloppe',
    goal_contrib: language === 'HT' ? 'Depo Objektif' : 'Dépôt d\'Objectif',
    
    // Form fields
    source: language === 'HT' ? 'Sous rantre a' : 'Origine du revenu',
    profile: language === 'HT' ? 'Pwofil distribisyon' : 'Profil de répartition',
    note: language === 'HT' ? 'Nòt / Memo' : 'Mémo / Notes',
    autoSplit: language === 'HT' ? 'Distribye nan anvlòp yo otomatikman' : 'Ventiler automatiquement dans les enveloppes',
    confirm: language === 'HT' ? 'Konfime kounye a' : 'Confirmer l\'opération',
    selectEnvelope: language === 'HT' ? 'Chwazi Envlòp la' : 'Sélectionner l\'enveloppe',
    selectGoal: language === 'HT' ? 'Chwazi Objektif la' : 'Sélectionner l\'objectif',
    noActiveGoals: language === 'HT' ? 'Pa gen okenn objektif aktif kounye a.' : 'Aucun objectif actif trouvé.',
    noActiveEnvelopes: language === 'HT' ? 'Pa gen okenn anvlòp sovgade.' : 'Aucune enveloppe active trouvée.',
    conversionPreview: language === 'HT' ? 'Rezime Konvèsyon :' : 'Équivalence :'
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Coins size={22} />
          </div>
          <div>
            <h3 className="font-display font-black text-base md:text-lg text-amber-400 leading-tight">
              {text.title}
            </h3>
            <p className="text-[10px] text-neutral-400 mt-0.5 max-w-xs md:max-w-md">
              {text.subtitle}
            </p>
          </div>
        </div>

        {/* Currency Converter Form container */}
        <div className="space-y-4">
          
          {/* Inputs Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Source amount input */}
            <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950/30 border border-white/5">
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                {text.amount}
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full bg-transparent text-white font-mono font-black text-base md:text-lg outline-none focus:text-amber-400"
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                  className="bg-neutral-800 border border-white/10 text-white font-bold font-mono text-xs p-1.5 rounded-lg outline-none cursor-pointer"
                >
                  <option value="HTG">HTG</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>

            {/* Target Currency */}
            <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950/30 border border-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                  {text.to}
                </label>
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  className="p-1 rounded bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 transition cursor-pointer"
                  title="Inverser"
                >
                  <ArrowRightLeft size={12} />
                </button>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-emerald-400 font-mono font-black text-lg md:text-xl">
                  {formatMoney(convertedVal, toCurrency)}
                </span>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                  className="bg-neutral-800 border border-white/10 text-white font-bold font-mono text-xs p-1.5 rounded-lg outline-none cursor-pointer"
                >
                  <option value="HTG">HTG</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rates visual pill & Info ticker */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-neutral-950/60 border border-white/5">
            <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
              <TrendingUp size={12} className="text-amber-400" /> {text.rateUsed}
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px]">
              <span className="text-white font-bold">{rateText(rateForOne, fromCurrency, toCurrency)}</span>
              <span className="text-neutral-500 font-medium border-l border-white/10 pl-4">{rateText(inverseRateForOne, toCurrency, fromCurrency)}</span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col gap-2">
            {!showApplySection ? (
              <button
                type="button"
                onClick={() => setShowApplySection(true)}
                disabled={convertedVal <= 0}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:pointer-events-none text-neutral-950 font-black rounded-xl text-xs uppercase cursor-pointer tracking-wider flex items-center justify-center gap-2 transition duration-200 shadow-md"
              >
                <PlusCircle size={15} />
                {text.useThisAmount}
              </button>
            ) : (
              <div className="space-y-4 border-t border-white/5 pt-4 animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    🎯 {text.sendTo}
                  </span>
                  <button
                    onClick={() => setShowApplySection(false)}
                    className="text-[10px] font-bold text-neutral-400 hover:text-white transition uppercase"
                  >
                    {language === 'HT' ? 'Fèmen' : 'Masquer'}
                  </button>
                </div>

                {/* Subnav tab button selectors */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-neutral-950/30 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTarget('income')}
                    className={`px-2 py-2 rounded-lg text-[9.5px] font-black uppercase tracking-tight flex flex-col items-center gap-1 transition cursor-pointer ${
                      activeTarget === 'income' 
                        ? 'bg-amber-500 text-neutral-950' 
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Wallet size={12} />
                    <span>Income</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTarget('expense')}
                    className={`px-2 py-2 rounded-lg text-[9.5px] font-black uppercase tracking-tight flex flex-col items-center gap-1 transition cursor-pointer ${
                      activeTarget === 'expense' 
                        ? 'bg-amber-500 text-neutral-950' 
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Coins size={12} />
                    <span>Expense</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTarget('deposit_envelope')}
                    className={`px-2 py-2 rounded-lg text-[9.5px] font-black uppercase tracking-tight flex flex-col items-center gap-1 transition cursor-pointer ${
                      activeTarget === 'deposit_envelope' 
                        ? 'bg-amber-500 text-neutral-950' 
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Layers size={12} />
                    <span>Envelope</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTarget('goal_contrib')}
                    className={`px-2 py-2 rounded-lg text-[9.5px] font-black uppercase tracking-tight flex flex-col items-center gap-1 transition cursor-pointer ${
                      activeTarget === 'goal_contrib' 
                        ? 'bg-amber-500 text-neutral-950' 
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Target size={12} />
                    <span>Goal</span>
                  </button>
                </div>

                {/* Active Choice Form */}
                <form onSubmit={handleApplyAmount} className="space-y-3 p-4 bg-neutral-950/40 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono font-bold border-b border-white/5 pb-2">
                    <span>{text.conversionPreview}</span>
                    <span className="text-emerald-400 font-extrabold font-sans">
                      {formatMoney(convertedVal, toCurrency)}
                    </span>
                    {activeTarget !== 'goal_contrib' && activeTarget !== 'income' && (
                      <span className="text-neutral-500 pl-1">
                        (= {formatMoney(convert(convertedVal, toCurrency, 'HTG', rates), 'HTG')})
                      </span>
                    )}
                  </div>

                  {/* 1. INCOME FORM FIELDS */}
                  {activeTarget === 'income' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Source Select */}
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                            {text.source}
                          </label>
                          <select
                            value={incomeSource}
                            onChange={(e) => setIncomeSource(e.target.value as IncomeSource)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white uppercase outline-none font-sans cursor-pointer"
                          >
                            <option value="SALARY">💵 {language === 'HT' ? 'Salè' : 'Salaire'}</option>
                            <option value="COMMERCE">🛍️ {language === 'HT' ? 'Kòmès' : 'Logistique'}</option>
                            <option value="TRANSFER">✈️ {language === 'HT' ? 'Transfè' : 'Transfert'}</option>
                            <option value="DAILY_LABOR">🔨 {language === 'HT' ? 'Jounalye' : 'Travail journalier'}</option>
                            <option value="OTHER">✨ {language === 'HT' ? 'Lòt sous' : 'Autre source'}</option>
                          </select>
                        </div>

                        {/* Profile select */}
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                            {text.profile}
                          </label>
                          <select
                            value={incomeProfileId}
                            onChange={(e) => setIncomeProfileId(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none font-sans cursor-pointer"
                          >
                            {profiles.map(p => (
                              <option key={p.id} value={p.id}>
                                {language === 'HT' ? p.nameKreyol : p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Note */}
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                          {text.note}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Komisyon, Bonis..."
                          value={incomeNote}
                          onChange={(e) => setIncomeNote(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                        />
                      </div>

                      {/* Auto-Split Toggle switch */}
                      <label className="flex items-center gap-2.5 bg-neutral-900/40 p-2 rounded-lg border border-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSplitIncome}
                          onChange={(e) => setAutoSplitIncome(e.target.checked)}
                          className="accent-amber-500 rounded cursor-pointer"
                        />
                        <span className="text-[10px] font-bold text-neutral-300">
                          {text.autoSplit}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* 2. EXPENSE FORM FIELDS */}
                  {activeTarget === 'expense' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                          {text.selectEnvelope}
                        </label>
                        {envelopes.length === 0 ? (
                          <div className="text-xs text-amber-500 font-semibold">{text.noActiveEnvelopes}</div>
                        ) : (
                          <select
                            value={selectedExpenseEnvelopeId}
                            onChange={(e) => setSelectedExpenseEnvelopeId(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none font-sans cursor-pointer"
                          >
                            {envelopes.map(env => (
                              <option key={env.id} value={env.id}>
                                {env.icon} {language === 'HT' ? env.nameKreyol : env.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                          {text.note}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Acha manje, transpò..."
                          value={expenseNote}
                          onChange={(e) => setExpenseNote(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. ENVELOPE DEPOSIT FORM FIELDS */}
                  {activeTarget === 'deposit_envelope' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                          {text.selectEnvelope}
                        </label>
                        {envelopes.length === 0 ? (
                          <div className="text-xs text-amber-500 font-semibold">{text.noActiveEnvelopes}</div>
                        ) : (
                          <select
                            value={selectedDepositEnvelopeId}
                            onChange={(e) => setSelectedDepositEnvelopeId(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none font-sans cursor-pointer"
                          >
                            {envelopes.map(env => (
                              <option key={env.id} value={env.id}>
                                {env.icon} {language === 'HT' ? env.nameKreyol : env.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. GOAL CONTRIBUTION FORM FIELDS */}
                  {activeTarget === 'goal_contrib' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                          {text.selectGoal}
                        </label>
                        {goals.length === 0 ? (
                          <div className="text-xs text-amber-500 font-semibold">{text.noActiveGoals}</div>
                        ) : (
                          <select
                            value={selectedGoalId}
                            onChange={(e) => setSelectedGoalId(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none font-sans cursor-pointer"
                          >
                            {goals.map(g => (
                              <option key={g.id} value={g.id}>
                                🎯 {g.name} ({g.currency})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                          {text.note}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sove pou mwa jen..."
                          value={goalNote}
                          onChange={(e) => setGoalNote(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submission Row */}
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle2 size={13} />
                    {text.confirm}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

// Utility to create descriptive rate text strings
function rateText(rate: number, from: string, to: string) {
  if (rate === 1) return `1 ${from} = 1 ${to}`;
  
  // Format based on value size
  const precision = rate < 0.01 ? 6 : rate < 1 ? 4 : 2;
  return `1 ${from} = ${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: precision })} ${to}`;
}
