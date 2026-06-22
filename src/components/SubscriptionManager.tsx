import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Calendar, Plus, Trash2, AlertCircle, Bell, Clock, Info, Check } from 'lucide-react';
import { Subscription, CurrencyCode } from '../types';

export const SubscriptionManager: React.FC = () => {
  const {
    language,
    subscriptions,
    addSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
    showToast
  } = useAppContext();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');

  // Calculate days remaining helper
  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString + 'T00:00:00');
    const MathMs = targetDate.getTime() - today.getTime();
    return Math.ceil(MathMs / (1000 * 60 * 60 * 24));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast(language === 'HT' ? 'Silvouplè antre yon non' : 'Veuillez entrer un nom', 'error');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast(language === 'HT' ? 'Silvouplè antre yon montan kòrèk' : 'Veuillez entrer un montant valide', 'error');
      return;
    }
    if (!nextBillingDate) {
      showToast(language === 'HT' ? 'Silvouplè chwazi dat pwochen prèvman an' : 'Veuillez choisir la date du prélèvement', 'error');
      return;
    }

    addSubscription({
      name: name.trim(),
      amount: Number(amount),
      currency,
      billingCycle,
      nextBillingDate,
      active: true
    });

    showToast(
      language === 'HT' 
        ? `${name} ajoute nan abònman ou yo !` 
        : `${name} a été ajouté avec succès !`, 
      'success'
    );

    // Reset Form
    setName('');
    setAmount('');
    setNextBillingDate('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string, subName: string) => {
    deleteSubscription(id);
    showToast(
      language === 'HT' 
        ? `${subName} retire nan lis la !` 
        : `${subName} a été supprimé.`, 
      'info'
    );
  };

  // Find critical alerts (due in less than 7 days) to display highlight banners
  const criticalSubscriptions = subscriptions.filter(s => {
    if (!s.active) return false;
    const daysLeft = getDaysRemaining(s.nextBillingDate);
    return daysLeft >= 0 && daysLeft <= 7;
  });

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-5 shadow-md relative overflow-hidden" id="subscription-manager-card">
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
        <div>
          <h3 className="font-bold text-neutral-100 text-sm md:text-base flex items-center gap-2">
            <span className="text-amber-500 text-lg">📅</span>
            {language === 'HT' ? 'Swivi ak Alèt Abònman' : 'Suivi & Prévisions d\'Abonnements'}
          </h3>
          <p className="text-[10.5px] text-neutral-400 font-medium">
            {language === 'HT' 
              ? 'Mete abònman ou yo (Netflix, Claude AI, ets.) pou asire nivo mwayen prelevman yo.' 
              : 'Gérez vos charges récurrentes (Netflix, Claude AI, iCloud, etc.) pour anticiper vos sorties d\'argent.'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer ${
            showAddForm 
              ? 'bg-neutral-800 text-neutral-400 hover:text-white' 
              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-[0_3px_10px_rgba(242,202,80,0.15)] active:scale-95'
          }`}
        >
          {showAddForm ? (language === 'HT' ? 'Kache' : 'Masquer') : (language === 'HT' ? 'Ajoute Abònman' : 'Nouveau')}
          {!showAddForm && <Plus size={12} className="stroke-[3px]" />}
        </button>
      </div>

      {/* Dynamic Critical Notifications Alert Banner */}
      {criticalSubscriptions.length > 0 && (
        <div className="space-y-2">
          {criticalSubscriptions.map(s => {
            const daysLeft = getDaysRemaining(s.nextBillingDate);
            return (
              <div 
                key={s.id}
                className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-neutral-200 rounded-xl animate-in fade-in slide-in-from-top duration-300"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <Bell size={16} className="animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-tight">
                    {language === 'HT' ? (
                      daysLeft === 0 ? (
                        <span>🚨 Abònman **{s.name}** yo pral prélève jounen jodi a !</span>
                      ) : (
                        <span>Dans **{daysLeft} jou**, y ap prélève abònman **{s.name}** ou an !</span>
                      )
                    ) : (
                      daysLeft === 0 ? (
                        <span>🚨 L'abonnement **{s.name}** est prélevé aujourd'hui !</span>
                      ) : (
                        <span>Dans **{daysLeft} jours**, l'abonnement **{s.name}** sera prélevé.</span>
                      )
                    )}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {language === 'HT' ? 'Prevwa ' : 'N\'oubliez pas de prévoir '}
                    <strong className="text-amber-400 font-mono font-black">{s.amount} {s.currency}</strong>
                    {language === 'HT' ? ' pou sa pa ba w sanzatann.' : ' pour ce renouvellement.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Subscription Form Accordion */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="p-4 bg-neutral-900/60 border border-white/5 rounded-xl space-y-4 animate-in slide-in-from-top duration-200">
          <h4 className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
            <span>📝</span>
            {language === 'HT' ? 'Konfigire yon nouvo abònman' : 'Enregistrer une charge récurrente'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Name input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 block">
                {language === 'HT' ? 'Non sèvis / Abònman' : 'Nom de l\'abonnement'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex. Netflix, Claude AI"
                className="w-full bg-neutral-950 border border-white/10 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            {/* Amount input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 block">
                {language === 'HT' ? 'Montan' : 'Montant'}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  pattern="\d*(\.\d+)?"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="20"
                  className="w-full bg-neutral-950 border border-white/10 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500 font-mono transition-colors"
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="bg-neutral-950 border border-white/10 text-neutral-300 px-2 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                >
                  <option value="HTG">HTG (G)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            {/* Billing Cycle */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 block">
                {language === 'HT' ? 'Frèkans prèlevman' : 'Fréquence'}
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="w-full bg-neutral-950 border border-white/10 text-neutral-300 px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
              >
                <option value="monthly">{language === 'HT' ? 'Lis chak mwa (Mensuel)' : 'Chaque mois'}</option>
                <option value="weekly">{language === 'HT' ? 'Lis chak semèn (Hebdo)' : 'Chaque semaine'}</option>
                <option value="yearly">{language === 'HT' ? 'Lis chak ane (Annuel)' : 'Chaque année'}</option>
              </select>
            </div>

            {/* Next Date */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 block">
                {language === 'HT' ? 'Dat pwochen prèlevman' : 'Prochain prélèvement'}
              </label>
              <input
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500 font-mono transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 font-extrabold text-[10px] uppercase tracking-widest">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 rounded-xl border border-white/5 hover:border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              {language === 'HT' ? 'Kase fey' : 'Annuler'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-neutral-950 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              💾 {language === 'HT' ? 'Anrejistre sa' : 'Confirmer l\'abonnement'}
            </button>
          </div>
        </form>
      )}

      {/* Subscriptions Grid / List */}
      {subscriptions.length === 0 ? (
        <div className="p-8 text-center bg-neutral-900/10 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-2">
          <span className="text-2xl">📅</span>
          <p className="text-xs text-neutral-400 font-semibold">
            {language === 'HT' ? 'Pa gen okenn abònman anrejistre kounye a' : 'Aucun prélèvement récurrent enregistré.'}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-[10px] text-amber-500 hover:text-amber-400 font-bold underline cursor-pointer"
          >
            {language === 'HT' ? 'Ajoute premye abònman ou' : 'Ajouter un premier abonnement'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subscriptions.map(s => {
            const daysLeft = getDaysRemaining(s.nextBillingDate);
            const isDueSoon = daysLeft >= 0 && daysLeft <= 4;
            return (
              <div 
                key={s.id}
                className={`p-4 border rounded-2xl flex items-center justify-between gap-3 transition-all duration-300 ${
                  s.active 
                    ? (isDueSoon 
                      ? 'bg-amber-950/10 border-amber-500/20 shadow-[0_2px_10px_rgba(242,202,80,0.02)]' 
                      : 'bg-neutral-950 border-white/5')
                    : 'bg-neutral-950/40 border-white/5 opacity-40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    onClick={() => toggleSubscriptionActive(s.id)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 ${
                      s.active 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                        : 'bg-neutral-900 border-white/5 text-neutral-600'
                    }`}
                    title={s.active ? "Désactiver" : "Activer"}
                  >
                    {s.active ? (
                      <Check size={14} className="stroke-[3px]" />
                    ) : (
                      <Clock size={14} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-neutral-200 flex items-center gap-1.5 truncate">
                      {s.name}
                      {!s.active && (
                        <span className="text-[8px] uppercase tracking-wider bg-neutral-900 border border-white/5 text-neutral-500 px-1 rounded">
                          {language === 'HT' ? 'FÈMEN' : 'DÉSACTIVÉ'}
                        </span>
                      )}
                    </h5>
                    
                    <p className="text-[10px] text-neutral-400 mt-0.5 space-x-1.5 flex items-center">
                      <span className="font-mono bg-white/5 border border-white/5 px-1 rounded-sm text-[8px] font-black uppercase text-amber-500">
                        {s.billingCycle === 'monthly' ? (language === 'HT' ? 'Mwa' : 'Mois') : s.billingCycle}
                      </span>
                      <span>•</span>
                      <span className="font-medium">
                        {language === 'HT' ? 'Prélv. : ' : 'Prélv. : '}
                        <strong className="text-neutral-300 font-mono">{s.nextBillingDate}</strong>
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-black font-mono text-xs text-neutral-100">
                      {s.amount.toLocaleString()} {s.currency}
                    </div>
                    {s.active && (
                      <span className={`text-[8.5px] font-extrabold block leading-none mt-0.5 ${
                        daysLeft < 0 
                          ? 'text-red-400' 
                          : daysLeft === 0 
                          ? 'text-amber-400 animate-pulse' 
                          : daysLeft === 1 
                          ? 'text-amber-500 font-extrabold'
                          : 'text-neutral-500'
                      }`}>
                        {daysLeft < 0 
                          ? (language === 'HT' ? 'Depase' : 'Échu') 
                          : daysLeft === 0 
                          ? (language === 'HT' ? 'Jodi a' : 'Auj.') 
                          : daysLeft === 1
                          ? (language === 'HT' ? 'Demen' : 'Demain')
                          : `${daysLeft}j`}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="p-2 bg-transparent hover:bg-red-500/10 text-neutral-500 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-xl transition-all cursor-pointer"
                    title={language === 'HT' ? 'Retire abònman' : 'Supprimer'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
