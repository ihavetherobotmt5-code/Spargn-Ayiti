import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TRANSLATIONS } from '../lib/translations';
import { ExchangeRates, LanguageCode } from '../types';
import { Clipboard, HardDriveDownload, RefreshCw, Key, ShieldCheck, Trash2, CheckCircle2, Languages, RefreshCw as LoopIcon } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    rates, 
    updateRates, 
    language, 
    setLanguage, 
    completedGoals, 
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
    setIsUnlocked,
    showToast
  } = useAppContext();

  const t = TRANSLATIONS[language] || TRANSLATIONS.HT;

  // Local inputs rate states
  const [usd, setUsd] = useState(rates.USD.toString());
  const [eur, setEur] = useState(rates.EUR.toString());
  const [usdt, setUsdt] = useState(rates.USDT.toString());

  // PIN settings helpers
  const [showPinForm, setShowPinForm] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinFormError, setPinFormError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleTogglePinLock = () => {
    if (isPinLockEnabled) {
      setPinLockEnabled(false);
      setShowPinForm(false);
      setNewPinInput('');
      setPinFormError('');
      showToast(language === 'HT' ? 'Pwoteksyon kòd PIN dezaktive.' : 'Protection par code PIN désactivée.', 'info');
    } else {
      setShowPinForm(true);
      setNewPinInput('');
      setPinFormError('');
    }
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPinInput)) {
      setPinFormError(language === 'HT' ? 'Kòd la fòk li gen egzakteman 4 chif!' : 'Le code doit contenir exactement 4 chiffres !');
      return;
    }
    setPinCode(newPinInput);
    setPinLockEnabled(true);
    setIsUnlocked(true);
    setShowPinForm(false);
    setNewPinInput('');
    setPinFormError('');
    showToast(language === 'HT' ? 'Kòd PIN ou anrejistre epi li aktif kounye a!' : 'Code PIN enregistré et actif !', 'success');
  };

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editAvatar, setEditAvatar] = useState(userAvatar);

  // Sync profile edit states with context shifts
  useEffect(() => {
    setEditName(userName);
    setEditAvatar(userAvatar);
  }, [userName, userAvatar]);

  useEffect(() => {
    setUsd(rates.USD.toString());
    setEur(rates.EUR.toString());
    setUsdt(rates.USDT.toString());
  }, [rates]);

  const handleSaveRates = () => {
    const rawUsd = parseFloat(usd);
    const rawEur = parseFloat(eur);
    const rawUsdt = parseFloat(usdt);
    
    if (isNaN(rawUsd) || isNaN(rawEur) || isNaN(rawUsdt)) {
      showToast(language === 'HT' ? 'Tanpri mete chif valab pou pousantaj yo' : 'Veuillez saisir des chiffres valides pour les taux', 'error');
      return;
    }

    updateRates({
      USD: rawUsd,
      EUR: rawEur,
      USDT: rawUsdt,
      HTG: 1
    });

    showToast(language === 'HT' ? 'Taux yo mizajou ak siksè!' : 'Taux de change enregistrés avec succès !', 'success');
  };

  const PRESET_AVATARS = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuASZfbYFSGky0hlFIES1mhVDDKA9MytGAuPtQArL2ivbgyThhmS1VHY9uf7p6XoOmelOtSA5dBhHG6g3gj79xhIsa6wiNALu3yw__mtPY3ycXZlqaXZEMCkqYEX4YdCOIxLSq-yn9XhUDkEiMgyDZhr-Jv0utVxoz5FeEgFl49_icVFrav2JyR7TNSDpej-PTjnMf_PBS5WkWza_bm7Tt1RXoACU8zTwOG42dY6okVlUXt9kBTU4eYhEq-RJlfowpT3zbpnxqucQ06p",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBWE2Wu5y4W6_7py3k4P89BiXultLstISBVkmvZrRTyl0IISimcj7mjePW5eJ_qrYfYhMaDJ9TscZxniENmShoC6jCStL26FlHyxgDV4PM1WUBj-JXMypLmWOpIZa_QqmA41SGLyliNhKUEKvf42XlRrzVrLgrgTxTZTjw8e6102ryVS4gBR-RxKIedY79-Md5aW_FTJAMA125PjiHmNfQEX7ALyUWfrCO5zvDjNetz2NwDpPWCWlODxURaqKseUagoN2wGmMJ5AJQY",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300"
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          const img = new Image();
          img.onload = () => {
            // Create a canvas of 256x256 for a perfect square avatar
            const canvas = document.createElement('canvas');
            const SIZE = 256;
            canvas.width = SIZE;
            canvas.height = SIZE;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              // Calculate center crop offsets to prevent squishing
              const sourceSize = Math.min(img.width, img.height);
              const xOffset = (img.width - sourceSize) / 2;
              const yOffset = (img.height - sourceSize) / 2;
              
              ctx.drawImage(
                img, 
                xOffset, yOffset, sourceSize, sourceSize, // Source square
                0, 0, SIZE, SIZE // Destination square
              );
              
              // Compress as high-quality JPEG
              const compressedData = canvas.toDataURL('image/jpeg', 0.85);
              setEditAvatar(compressedData);
            } else {
              setEditAvatar(event.target!.result as string);
            }
          };
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast(language === 'HT' ? 'Tanpri ekri yon non valab' : 'Veuillez entrer un nom valide', 'error');
      return;
    }
    updateProfile(editName.trim(), editAvatar);
    setIsEditingProfile(false);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const res = importData(text);
        if (res) {
          showToast(language === 'HT' ? 'Done yo enpòte ak siksè!' : 'Données importées avec succès !', 'success');
        } else {
          showToast('Chifreman fayit. Dosye backup la pa kòrèk.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300 pb-12">
      
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-black font-headline-md text-amber-400">
          {t.settings}
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Gérez vos profils, taux de change de gourdes et archives de sauvegarde.
        </p>
      </div>

      {/* User Profile display card with inline edit capabilities (User Requested feature) */}
      <section className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden bg-neutral-900/40 shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>

        {!isEditingProfile ? (
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group/avatar">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-amber-500/25 shadow-md bg-neutral-950">
                <img 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105" 
                  alt="Avatar principal" 
                  src={userAvatar}
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setEditName(userName);
                  setEditAvatar(userAvatar);
                  setIsEditingProfile(true);
                }}
                className="absolute -bottom-2 -right-2 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold p-2 rounded-lg shadow-md active:scale-95 transition-all cursor-pointer border-none outline-none leading-none"
                title="Modifier le profil"
              >
                ✏️
              </button>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h3 className="font-bold text-lg text-neutral-100 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>{userName}</span>
                <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full leading-none">
                  STRATEGE TIER
                </span>
              </h3>
              <p className="text-neutral-400 font-medium text-xs">
                Port-au-Prince, HT • Actif depuis 2024
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditName(userName);
                  setEditAvatar(userAvatar);
                  setIsEditingProfile(true);
                }}
                className="text-[10px] text-amber-400 hover:underline font-bold mt-1 block uppercase tracking-wider bg-transparent border-none outline-none text-left"
              >
                {language === 'HT' ? 'Chanje non ak foto' : 'Modifier le nom ou la photo'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in duration-200">
            <h4 className="font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
              👤 {language === 'HT' ? 'Mizajou Profile ou' : 'Mise à jour du profil'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Avatar Preview & File upload */}
              <div className="flex flex-col items-center justify-center space-y-3 bg-neutral-950/40 p-4 rounded-xl border border-white/5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-md bg-neutral-900 relative">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Preview avatar" 
                    src={editAvatar}
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <label className="w-full py-2 px-3 border border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 text-center text-[10px] uppercase font-bold text-neutral-300 rounded-lg cursor-pointer transition-all">
                    <span>📁 Custom Image / Photo</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[9px] text-neutral-500 text-center">Toutes tailles acceptées. Auto-compressé pour la performance.</p>
                </div>
              </div>

              {/* Right Columns: Inputs for Name and presets selection */}
              <div className="md:col-span-2 space-y-4">
                {/* Profile Name Edit */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                    {language === 'HT' ? 'Non ou' : 'Votre nom / Raison sociale'}
                  </label>
                  <input 
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Jean-Robert L'Ouverture"
                    className="w-full bg-neutral-955 border border-white/5 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm font-bold text-neutral-100 outline-none"
                  />
                </div>

                {/* Preselected Elegant Avatars */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                    {language === 'HT' ? 'Chwazi yon Avatar' : 'Sélectionnez un avatar par défaut'}
                  </label>
                  <div className="grid grid-cols-6 gap-2 bg-neutral-950/50 p-2 rounded-xl border border-white/5">
                    {PRESET_AVATARS.map((avatarUrl, idx) => {
                      const isSelected = editAvatar === avatarUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditAvatar(avatarUrl)}
                          className={`aspect-square w-full rounded-lg overflow-hidden border-2 transition-all p-0.5 bg-neutral-900 ${
                            isSelected 
                              ? 'border-amber-500 scale-105 shadow-[0_0_10px_rgba(242,202,80,0.2)]' 
                              : 'border-transparent hover:border-white/25 grayscale hover:grayscale-0'
                          }`}
                        >
                          <img 
                            src={avatarUrl} 
                            className="w-full h-full object-cover rounded-md" 
                            alt={`Avatar preset ${idx + 1}`} 
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* Editing Action Triggers */}
            <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setEditName(userName);
                  setEditAvatar(userAvatar);
                  setIsEditingProfile(false);
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-bold uppercase rounded-lg border border-transparent transition-all"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-neutral-950 text-xs font-extrabold uppercase rounded-lg transition-all shadow-md"
              >
                {t.save}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Exchange Rate Setup */}
      <section className="space-y-4">
        <h4 className="font-bold text-neutral-200 text-base flex items-center gap-2">
          💰 {t.exchangeRate}
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-400">1 USD → HTG</label>
            <div className="relative">
              <input 
                type="number" 
                step="any"
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                className="w-full bg-neutral-955 border border-white/5 rounded-xl px-3.5 py-2.5 text-amber-400 font-bold outline-none text-sm" 
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 font-bold uppercase">Gourde</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-400">1 EUR → HTG</label>
            <div className="relative">
              <input 
                type="number" 
                step="any"
                value={eur}
                onChange={(e) => setEur(e.target.value)}
                className="w-full bg-neutral-955 border border-white/5 rounded-xl px-3.5 py-2.5 text-cyan-400 font-bold outline-none text-sm" 
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 font-bold uppercase">Gourde</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-400">1 USDT → HTG</label>
            <div className="relative">
              <input 
                type="number" 
                step="any"
                value={usdt}
                onChange={(e) => setUsdt(e.target.value)}
                className="w-full bg-neutral-955 border border-white/5 rounded-xl px-3.5 py-2.5 text-emerald-400 font-bold outline-none text-sm" 
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 font-bold uppercase">Gourde</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSaveRates}
          className="bg-neutral-800 hover:bg-neutral-750 text-amber-400 border border-amber-500/25 py-3 px-6 rounded-xl font-bold text-xs uppercase cursor-pointer transition-all active:scale-95"
        >
          {t.save}
        </button>
      </section>

      {/* Language choices */}
      <section className="space-y-3">
        <h4 className="font-bold text-neutral-200 text-base flex items-center gap-2">
          🌐 {t.language}
        </h4>
        <div className="flex gap-2.5 max-w-sm">
          {([
            { code: 'FR', label: '🇫🇷 FR' },
            { code: 'HT', label: '🇭🇹 HT (Kreyòl)' },
            { code: 'EN', label: '🇺🇸 EN' }
          ] as const).map((item) => (
            <button
              key={item.code}
              onClick={() => setLanguage(item.code)}
              className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all active:scale-95 duration-200 ${
                language === item.code 
                  ? 'border-amber-400 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(242,202,80,0.15)] select-none' 
                  : 'border-white/5 bg-neutral-900 text-neutral-400 hover:border-white/20'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Achieved Goals stats info */}
      <section className="space-y-3">
        <h4 className="font-bold text-neutral-200 text-base flex items-center gap-2">
          🏆 {t.completedGoals}
        </h4>
        <div className="glass-card rounded-2xl p-4 flex justify-between items-center bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <p className="text-neutral-200 text-sm font-bold">Archives complétées</p>
              <p className="text-neutral-400 text-xs">Visibles directement en fin du tableau bord.</p>
            </div>
          </div>
          <span className="font-black text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {completedGoals.length} Objectifs
          </span>
        </div>
      </section>

      {/* Security Switch & Backup Utilities (Priority 3) */}
      <section className="space-y-4">
        <h4 className="font-bold text-neutral-200 text-base flex items-center gap-2">
          🛡️ {language === 'HT' ? 'Sekirite & Done' : 'Sécurité & Données'}
        </h4>

        <div className="space-y-3">
          {/* PIN Card Setup */}
          <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔑</span>
                <div>
                  <span className="font-semibold text-neutral-200 text-xs block">
                    {language === 'HT' ? 'Verrouyaj ak Kòd PIN (4 chif)' : 'Verrouillage par Code PIN (4 chiffres)'}
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    {isPinLockEnabled 
                      ? (language === 'HT' ? `Sekirite PIN aktif: ${pinCode}` : `Sécurité PIN active : ${pinCode}`)
                      : (language === 'HT' ? 'Kòd PIN pa aktif' : 'Code PIN désactivé')
                    }
                  </span>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={handleTogglePinLock}
                className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none border-none relative flex items-center cursor-pointer ${
                  isPinLockEnabled ? 'bg-amber-400 justify-end' : 'bg-neutral-800 justify-start'
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-neutral-900 block`}></span>
              </button>
            </div>

            {/* Custom Interactive PIN Formulation Form */}
            {(showPinForm || (isPinLockEnabled && !pinCode)) && (
              <form onSubmit={handleSavePin} className="p-3 bg-neutral-950/60 rounded-xl border border-white/5 space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                    {language === 'HT' ? 'Mete nouvo kòd PIN ou a (4 chif)' : 'Nouveau code PIN de sécurité (4 chiffres)'}
                  </label>
                  <p className="text-[10px] text-neutral-500">
                    {language === 'HT' ? 'Mete sèlman chif de 0 a 9 pou sekirize aplikasyon an.' : 'Saisir uniquement des chiffres de 0 à 9.'}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewPinInput(val);
                      setPinFormError('');
                    }}
                    placeholder="ex: 1234"
                    className="flex-grow bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-neutral-200 text-sm font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 text-xs font-extrabold uppercase rounded-lg transition-all duration-150 cursor-pointer"
                  >
                    {language === 'HT' ? 'Aksepte' : 'Activer'}
                  </button>
                </div>

                {pinFormError && (
                  <p className="text-red-400 text-[10px] font-semibold animate-pulse">
                    ⚠️ {pinFormError}
                  </p>
                )}
              </form>
            )}

            {isPinLockEnabled && !showPinForm && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPinForm(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider bg-transparent border-none outline-none cursor-pointer"
                >
                  ⚙️ {language === 'HT' ? 'Chanje Kòd PIN' : 'Modifier le code PIN'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Export JSON backup button */}
            <button 
              onClick={exportDataJSON}
              className="glass-card rounded-2xl p-4 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors cursor-pointer text-left font-bold text-xs uppercase flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="block text-neutral-500 text-[9px] uppercase tracking-wider font-semibold">Sauvegarde</span>
                <span className="text-neutral-200 tracking-tight leading-none text-xs block">{t.exportJSON}</span>
              </div>
              <HardDriveDownload size={18} className="text-amber-500" />
            </button>

            {/* Export CSV backup button */}
            <button 
              onClick={exportDataCSV}
              className="glass-card rounded-2xl p-4 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors cursor-pointer text-left font-bold text-xs uppercase flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="block text-neutral-500 text-[9px] uppercase tracking-wider font-semibold">Analyse Excel</span>
                <span className="text-neutral-200 tracking-tight leading-none text-xs block">{t.exportCSV}</span>
              </div>
              <Clipboard size={18} className="text-emerald-500" />
            </button>
          </div>

          {/* Import JSON backup wrapper */}
          <div className="glass-card rounded-2xl p-4 border border-white/5 relative hover:bg-white/5 transition-all">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-1">
                <span className="block text-neutral-500 text-[9px] uppercase tracking-wider font-semibold">Restaurer</span>
                <span className="text-neutral-200 font-bold text-xs">{t.importBackup} (.JSON)</span>
              </div>
              <RefreshCw size={18} className="text-amber-500" />
              <input 
                type="file" 
                accept=".json"
                onChange={handleImportBackup}
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </section>

      {/* Danger Reset Zone */}
      <section className="space-y-3 pt-4 border-t border-white/5">
        <h4 className="font-bold text-red-500 text-sm flex items-center gap-2">
          🚨 {t.dangerZone}
        </h4>
        <div className="bg-red-950/10 border border-red-500/15 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-red-400 text-xs font-bold">Réinitialisation d'usine</p>
            <p className="text-neutral-400 text-[11px] mt-0.5">Effacera définitivement tous vos objectifs personnels, dépôts et taux.</p>
          </div>
          <button 
            type="button"
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer shadow-md border-none outline-none align-self-start sm:align-self-auto"
          >
            {t.resetApp}
          </button>
        </div>
      </section>

      {/* Software version mark */}
      <div className="pt-4 text-center">
        <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest">
          Spargn Ayiti v2.5.0 • Elite Financial Engine 🇭🇹
        </p>
      </div>

      {/* Reset Confirmation popup */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full relative">
            <h3 className="text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
              🚨 {language === 'HT' ? 'Sitiyasyon Alèt' : 'Attention !'}
            </h3>
            <p className="text-neutral-300 text-xs font-semibold mb-6 leading-relaxed">
              {t.resetConfirm || (language === 'HT' ? 'Èske ou sèten ou vle efase tout done Spargn yo?' : 'Êtes-vous sûr de vouloir tout effacer ? Cette action est irréversible.')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 px-4 bg-neutral-800 text-white hover:bg-neutral-750 font-bold rounded-xl text-xs uppercase transition-colors border border-white/5 cursor-pointer"
              >
                {t.no || 'Non'}
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  window.location.reload();
                }}
                className="flex-1 py-3 px-4 bg-red-600 text-white hover:bg-red-500 font-bold rounded-xl text-xs uppercase transition-colors border-none cursor-pointer"
              >
                {t.yes || 'Wi'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
