import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TRANSLATIONS } from '../lib/translations';
import { formatMoney } from '../lib/currency';
import { 
  Sparkles, 
  Trash2, 
  Plus, 
  PlusCircle,
  TrendingUp, 
  Heart, 
  Target, 
  BookOpen, 
  AlertCircle, 
  Lightbulb, 
  Calendar,
  Send,
  Zap,
  CheckCircle2,
  Bookmark,
  DollarSign
} from 'lucide-react';
import { VisionItem, VisionSection, CurrencyCode } from '../types';

export const VisionPage: React.FC = () => {
  const { 
    visionItems, 
    addVisionItem, 
    deleteVisionItem, 
    updateVisionItem, 
    addGoal, 
    language,
    showToast 
  } = useAppContext();

  const t = TRANSLATIONS[language] || TRANSLATIONS.HT;

  // Track active section state
  const [activeSection, setActiveSection] = useState<VisionSection>('wishlist');

  // Input fields state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [costStr, setCostStr] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('HTG');
  const [targetDate, setTargetDate] = useState('');

  // Is Add Form open
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Localization resources
  const visionLabels = {
    HT: {
      title: "Kaye Rèv & Pwojè m",
      subtitle: "Yon espas prive pou planifye, reve, ak prepare demen san li pa touche bidjè aktyèl ou.",
      notes: "Nòt Lib",
      ideas: "Lide Dépans",
      projects: "Pwojè pou Demen",
      prevision: "Depans Prevwa",
      wishlist: "Lis Souhè m",
      noCost: "Pa gen pri",
      costEstimated: "Kòb estime",
      dueDate: "Dat limit",
      wishlistConvert: "Tounen Objektif",
      wishlistConvertSuccess: "Bravo! Se yon gwo etap. Souhè ou la tounen yon vrè Objektif Epargn kounye a!",
      addBtn: "Ajoute yon nouvo rèv",
      addTitle: "Tit rèv oswa pwojè w la",
      addDesc: "Eksplike rèv ou a an detay...",
      addCost: "Konbyen sa ka koute? (Si ou konnen)",
      addDate: "Ki lè ou ta anvi reyalize l?",
      btnSave: "Anrejistre nan Kaye m",
      btnCancel: "Anile",
      freeNotesDesc: "Ekri tout lide k ap pase nan tèt ou, kaye sa pa nan kalkil lajan kounye a.",
      pyasBoxTitle: "Konsèy Pyas sou Kaye w la",
      pyasBoxDesc: "Asistan finansye ou Pyas ka li kaye rèv sa pou li ba ou bon konsèy ak estrateji finansye lè w ap koze avè l nan chatbot la!",
      emptyState: "Kaye sa vid pou seksyon sa a. Kòmanse ekri premye rèv ou pou w ka bay lavni w fòm!"
    },
    FR: {
      title: "Mon Carnet d'Avenir",
      subtitle: "Un espace personnel et inspirant pour rêver, planifier et préparer vos projets futurs sans affecter votre budget.",
      notes: "Notes Libres",
      ideas: "Idées de Dépenses",
      projects: "Projets Futurs",
      prevision: "Dépenses Prévues",
      wishlist: "Liste de Souhaits",
      noCost: "Aucun coût spécifié",
      costEstimated: "Coût estimé",
      dueDate: "Échéance souhaitée",
      wishlistConvert: "Créer un Objectif",
      wishlistConvertSuccess: "Félicitations ! Votre souhait a été converti en un véritable objectif d'épargne active !",
      addBtn: "Ajouter un nouveau souhait",
      addTitle: "Titre de votre projet ou note",
      addDesc: "Décrivez votre projet en détail...",
      addCost: "Avez-vous une idée du coût ? (Facultatif)",
      addDate: "Échéance souhaitée ? (Facultatif)",
      btnSave: "Consigner dans mon carnet",
      btnCancel: "Annuler",
      freeNotesDesc: "Écrivez tout ce qui vous passe par la tête, sans aucune contrainte ni impact sur vos comptes actuels.",
      pyasBoxTitle: "L'Intelligence de Pyas",
      pyasBoxDesc: "Pyas analyse discrètement ces notes pour vous formuler des suggestions d'optimisation personnalisées lors de vos prochaines discussions.",
      emptyState: "Cette section est encore vide. Prenez la plume et commencez à planifier vos rêves dès maintenant !"
    }
  }[language === 'HT' ? 'HT' : 'FR'];

  // Categories metadata
  const sections = [
    { id: 'wishlist' as const, label: visionLabels.wishlist, icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/10' },
    { id: 'projects' as const, label: visionLabels.projects, icon: Target, color: 'text-amber-400 bg-amber-500/10 border-amber-500/10' },
    { id: 'prevision' as const, label: visionLabels.prevision, icon: Calendar, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10' },
    { id: 'ideas' as const, label: visionLabels.ideas, icon: Lightbulb, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/10' },
    { id: 'notes' as const, label: visionLabels.notes, icon: BookOpen, color: 'text-purple-400 bg-purple-500/10 border-purple-500/10' },
  ];

  // Filter items based on active tab
  const activeItems = visionItems.filter(item => item.section === activeSection);

  // Add Item Submit Handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast(language === 'HT' ? "Silvouplè ranpli tit ak deskripsyon rèv la!" : "Veuillez saisir un titre et une description valide !", "error");
      return;
    }

    const estimatedCost = costStr ? parseFloat(costStr) : undefined;

    addVisionItem({
      title: title.trim(),
      content: content.trim(),
      section: activeSection,
      cost: estimatedCost,
      currency: estimatedCost ? currency : undefined,
      targetDate: targetDate || undefined
    });

    // Reset Form fields
    setTitle('');
    setContent('');
    setCostStr('');
    setTargetDate('');
    setIsAddOpen(false);

    showToast(language === 'HT' ? "Ekselan ! Nouvo rèv la ekri nan Kaye w." : "Superbe ! Votre projet a bien été consigné.", "success");
  };

  // Convert a Wishlist / Project item to an active Saving Goal
  const handleConvertToGoal = (item: VisionItem) => {
    // We map details of VisionItem to a Goal structure
    const targetAmt = item.cost || 50000; // default if not specified
    const curr = item.currency || 'HTG';
    const finalDate = item.targetDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    addGoal({
      name: item.title,
      targetAmount: targetAmt,
      currency: curr,
      startDate: new Date().toISOString().split('T')[0],
      endDate: finalDate,
      targetDate: finalDate,
      frequency: 'MONTHLY',
      icon: activeSection === 'wishlist' ? '❤️' : '🎯'
    });

    // Optionally delete from vision so it's formally promoted
    deleteVisionItem(item.id);

    showToast(visionLabels.wishlistConvertSuccess, "success");
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ATMOSPHERIC GREETING HERO BANNER */}
      <div className="glass-card rounded-[24px] p-6 border border-white/5 relative overflow-hidden shadow-xl bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-950">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none -z-10 translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-2xl rounded-full pointer-events-none -z-10 -translate-x-10 translate-y-10"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-max">
              <Sparkles size={11} className="animate-spin duration-3000" />
              {language === 'HT' ? 'ESPAS SANS ENPAK FINANSYE' : 'ESPACE PRIVÉ EXTRA-BUDGÉTAIRE'}
            </span>
            <h1 className="text-2xl font-black text-neutral-100 font-sans tracking-tight">
              {visionLabels.title}
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              {visionLabels.subtitle}
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all font-black text-xs px-4 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(242,202,80,0.15)] flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus size={15} strokeWidth={3} />
            {visionLabels.addBtn}
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC FORM POPDOWN */}
      {isAddOpen && (
        <form 
          onSubmit={handleSave}
          className="glass-card rounded-2xl p-5 border border-white/10 bg-neutral-900/40 space-y-4 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wide flex items-center gap-1.5">
              <PlusCircle size={14} className="text-amber-400" />
              {language === 'HT' ? "Ranpli fòm pou bèl dezi w" : "Consigner un projet pour l'avenir"}
            </span>
            <span className="text-[10px] text-amber-300 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded font-bold font-mono uppercase">
              {activeSection}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder={visionLabels.addTitle}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-950/70 text-neutral-200 border border-white/5 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-amber-500/50 placeholder:text-neutral-500 transition-all"
                required
              />
            </div>

            <div>
              <textarea
                placeholder={visionLabels.addDesc}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full bg-neutral-950/70 text-neutral-200 border border-white/5 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-amber-500/50 placeholder:text-neutral-500 transition-all resize-none leading-relaxed"
                required
              />
            </div>

            {/* Optional cost & Date (only show for relevant sections if desired, or let it optional for all) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase">{visionLabels.addCost}</label>
                <div className="flex bg-neutral-950/70 border border-white/5 rounded-xl overflow-hidden focus-within:border-amber-500/50 transition-all">
                  <input
                    type="number"
                    placeholder="E.g. 500"
                    value={costStr}
                    onChange={(e) => setCostStr(e.target.value)}
                    className="w-full bg-transparent text-neutral-200 px-4 py-3 text-xs font-bold font-mono focus:outline-none"
                    min="1"
                  />
                  {costStr && (
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="bg-neutral-900 border-l border-white/5 text-neutral-300 text-xs font-bold font-mono px-3 py-1 outline-none"
                    >
                      <option value="HTG">HTG</option>
                      <option value="USD">USD</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase">{visionLabels.addDate}</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-neutral-950/70 text-neutral-200 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold font-mono focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setTitle('');
                setContent('');
                setCostStr('');
                setTargetDate('');
              }}
              className="text-neutral-400 hover:text-neutral-200 bg-neutral-950/50 hover:bg-neutral-950 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {visionLabels.btnCancel}
            </button>
            <button
              type="submit"
              className="text-neutral-950 bg-amber-400 hover:bg-amber-300 font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Send size={12} />
              {visionLabels.btnSave}
            </button>
          </div>
        </form>
      )}

      {/* 3. SECTION METRIC BAR & TAB NAVIGATION ELEMENT */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {sections.map(sec => {
          const count = visionItems.filter(item => item.section === sec.id).length;
          const SecIcon = sec.icon;
          const isActive = activeSection === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                // Also toggle off add form so they can view details smoothly
                setIsAddOpen(false);
              }}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 relative cursor-pointer ${
                isActive 
                  ? 'bg-amber-500/10 border-amber-400/30 text-amber-100 shadow-[0_4px_12px_rgba(242,202,80,0.05)]' 
                  : 'bg-neutral-900/40 border-white/5 text-neutral-400 hover:bg-neutral-900/80 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-amber-400/10 text-amber-400' : 'bg-neutral-950/40 text-neutral-400'}`}>
                  <SecIcon size={16} />
                </div>
                <span className="font-mono text-xs font-black opacity-80">{count}</span>
              </div>
              <div className="text-[11px] font-black tracking-wide mt-2.5 uppercase text-neutral-300/90">
                {sec.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. CONTENT LISTING */}
      <div className="space-y-4">
        
        {activeItems.length === 0 ? (
          <div className="glass-card rounded-2xl border border-white/5 p-12 text-center space-y-3 bg-neutral-900/20">
            <div className="w-12 h-12 rounded-full bg-neutral-950/70 border border-white/5 flex items-center justify-center mx-auto text-xl">
              ✍️
            </div>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto font-semibold leading-relaxed">
              {visionLabels.emptyState}
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="text-amber-400 hover:text-amber-300 transition-all font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 mx-auto mt-2 border border-amber-500/20 bg-amber-500/5 px-4 py-2 rounded-lg cursor-pointer"
            >
              <Plus size={12} className="stroke-[3]" />
              {language === 'HT' ? 'Plante premye grenn rèv la' : 'Écrire un nouveau rêve'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeItems.map((item) => {
              const displayDate = item.targetDate ? new Date(item.targetDate).toLocaleDateString(language === 'HT' ? 'fr-FR' : 'fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : null;

              return (
                <div 
                  key={item.id}
                  className="glass-card rounded-2xl p-5 border border-white/5 bg-neutral-900/30 flex flex-col justify-between hover:border-white/10 transition-all duration-300 relative group"
                >
                  <div className="space-y-2.5">
                    
                    {/* Header line of card */}
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-black text-xs text-neutral-100 uppercase tracking-tight line-clamp-2">
                        {item.title}
                      </h3>
                      
                      <button 
                        onClick={() => deleteVisionItem(item.id)}
                        className="text-neutral-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/5 transition cursor-pointer self-start shrink-0 duration-200"
                        title={language === 'HT' ? 'Efase' : 'Effacer'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Content text */}
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-semibold whitespace-pre-wrap">
                      {item.content}
                    </p>

                    {/* Budget Metadata section badges */}
                    {(item.cost || item.targetDate) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {item.cost !== undefined && (
                          <span className="text-[9.5px] font-black font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
                            💰 {visionLabels.costEstimated}: {formatMoney(item.cost, item.currency || 'HTG')}
                          </span>
                        )}
                        {item.targetDate && (
                          <span className="text-[9.5px] font-black font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded flex items-center gap-1">
                            <Calendar size={10} />
                            {visionLabels.dueDate}: {displayDate}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Operational promote to real savings goal ONLY for wishlist & projects */}
                  {(item.section === 'wishlist' || item.section === 'projects') && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase flex items-center gap-1">
                        <Bookmark size={10} className="text-amber-400" />
                        {language === 'HT' ? 'Rèv k ap tann' : 'Rêve en attente'}
                      </span>
                      
                      <button
                        onClick={() => handleConvertToGoal(item)}
                        className="text-[10px] text-amber-400 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-400 hover:text-neutral-950 font-black px-3 py-1.5 rounded-xl transition duration-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Zap size={11} className="fill-current animate-pulse" />
                        {visionLabels.wishlistConvert}
                      </button>
                    </div>
                  )}

                  {/* Prevent empty footer margins for other sections */}
                  {item.section === 'notes' && (
                    <div className="mt-3 text-[9px] text-neutral-500 font-bold border-t border-white/5 pt-2 uppercase flex items-center gap-1.5">
                      💡 {language === 'HT' ? 'Nòt sa p ap chanje anyen nan kont ou' : 'Cette note n\'impacte pas votre budget'}
                    </div>
                  )}

                  {item.section === 'prevision' && (
                    <div className="mt-3 text-[9.5px] text-emerald-300 bg-emerald-500/5 duration-200 border border-emerald-500/10 px-2 py-1.5 rounded-lg flex items-center gap-1.5 leading-normal uppercase font-black">
                      ⏰ {language === 'HT' ? 'Peye dousman ap planifye' : 'Dépense anticipée sous surveillance'}
                    </div>
                  )}

                  {item.section === 'ideas' && (
                    <div className="mt-3 text-[9px] text-neutral-500 font-bold border-t border-white/5 pt-2 uppercase flex items-center gap-1.5">
                      🧠 {language === 'HT' ? 'Konserve pou reflechi pita' : 'Consigné pour réflexion future'}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. PYAS TUTORIAL COMPANION */}
      <div className="glass-card rounded-[20px] p-5 border border-white/5 bg-gradient-to-r from-neutral-900 to-amber-950/20 flex gap-4 items-start shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl flex items-center justify-center"></div>
        <div className="text-2xl mt-0.5 shrink-0">🤖</div>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-neutral-200 uppercase tracking-wide flex items-center gap-1.5">
            {visionLabels.pyasBoxTitle}
            <span className="text-[9px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 font-black">
              LIVE
            </span>
          </h4>
          <p className="text-[10.5px] text-neutral-400 leading-relaxed font-semibold">
            {visionLabels.pyasBoxDesc}
          </p>
        </div>
      </div>

    </div>
  );
};
