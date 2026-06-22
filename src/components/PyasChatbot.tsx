import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MessageSquare, X, Send, Sparkles, AlertCircle, Bot, CornerDownLeft, Settings, Key, Eye, EyeOff } from 'lucide-react';
import Markdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const PyasChatbot: React.FC = () => {
  const { 
    goals, 
    contributions, 
    language, 
    userName, 
    showToast,
    subscriptions
  } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('spargn_user_gemini_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial friendly greetings in French
    const defaultWelcome = "Bonjour ! 👋 Je suis Pyas, votre conseiller en budget Spargn. Je suis là pour vous aider à planifier vos objectifs, maîtriser votre Sòl (`tontine`), et vous guider pour épargner gourde par gourde ! Qu'allons-nous analyser aujourd'hui ? 💰";
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: defaultWelcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAiCalls, setRemainingAiCalls] = useState(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('spargn_ai_date') || '';
    let count = Number(localStorage.getItem('spargn_ai_count') || '0');
    if (savedDate !== today) {
      count = 0;
      localStorage.setItem('spargn_ai_date', today);
      localStorage.setItem('spargn_ai_count', '0');
    }
    return Math.max(0, 10 - count);
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Sync custom key from localStorage when chatbot opens
  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('spargn_user_gemini_key') || '';
      setCustomApiKey(storedKey);
    }
  }, [isOpen]);

  const checkAndRegisterAiCall = (): { allowed: boolean; remaining: number } => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('spargn_ai_date') || '';
    let count = Number(localStorage.getItem('spargn_ai_count') || '0');
    
    if (savedDate !== today) {
      count = 0;
      localStorage.setItem('spargn_ai_date', today);
      localStorage.setItem('spargn_ai_count', '0');
    }
    
    const limit = 10;
    if (count >= limit) {
      return { allowed: false, remaining: 0 };
    }
    
    return { allowed: true, remaining: limit - count };
  };

  const incrementAiCallCount = () => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('spargn_ai_date') || '';
    let count = Number(localStorage.getItem('spargn_ai_count') || '0');
    if (savedDate !== today) {
      count = 0;
      localStorage.setItem('spargn_ai_date', today);
    }
    const newCount = count + 1;
    localStorage.setItem('spargn_ai_count', String(newCount));
    setRemainingAiCalls(Math.max(0, 10 - newCount));
  };

  const getLocalResponse = (text: string): string | null => {
    const raw = text.toLowerCase().trim();
    const ctx = getContext();

    // 1. Solde / balance check
    if (
      raw.includes('solde') || 
      raw.includes('balans') || 
      raw.includes('balance') || 
      raw.includes('kòb') || 
      raw.includes('gourde') || 
      raw.includes('goud') || 
      raw.includes('mon argent') || 
      raw.includes('combien j\'ai') || 
      raw.includes('montant') || 
      raw.includes('économie') || 
      raw.includes('ekonomize')
    ) {
      // Calculate total saved in goals
      const totalSavedInGoals = goals.reduce((acc, g) => {
        const list = contributions[g.id] || [];
        return acc + list.reduce((sum, c) => sum + c.amount, 0);
      }, 0);

      const solPaidCount = ctx.solPaidWeeks.filter(Boolean).length;
      const totalSolPaid = solPaidCount * ctx.solWeeklyHand;
      const grandTotal = totalSavedInGoals + ctx.emergencyFund + totalSolPaid;

      if (language === 'HT') {
        return `### 💰 Rezime Balans ou (Mòd Lokal oswa Nivo 1)

Kòb ou sere an total sou tout aplikasyon **Spargn Ayiti** a, san sa pa koute anyen nan API :

*   **🎯 Objektif Epay yo :** \`${totalSavedInGoals.toLocaleString()} HTG\` (depoze sou objektif aktif yo)
*   **🛡️ Kòb Sekou (Fon Irjans) :** \`${ctx.emergencyFund.toLocaleString()} HTG\`
*   **🤝 Patisipasyon nan Sòl :** \`${totalSolPaid.toLocaleString()} HTG\` te deja vèse nan sik la (Semèn ${ctx.solWeek})

---
💵 **Total Sere Net :** **\`${grandTotal.toLocaleString()} HTG\`**

*Chak ti goud ou sere se yon gwo pwoteksyon pou lavni ou ! Kontinye mete men !* 💪`;
      } else if (language === 'EN') {
        return `### 💰 Balance Summary (Mòd Lokal or Level 1)

Here is your combined current savings summary, calculated locally (completely cost-free):

*   **🎯 Savings Goals:** \`${totalSavedInGoals.toLocaleString()} HTG\` (collected across your active goals)
*   **🛡️ Kòb Sekou (Emergency Fund):** \`${ctx.emergencyFund.toLocaleString()} HTG\`
*   **🤝 Sòl Tontine Contribution:** \`${totalSolPaid.toLocaleString()} HTG\` contributed in the current cycle (Week ${ctx.solWeek})

---
💵 **Total Savings:** **\`${grandTotal.toLocaleString()} HTG\`**

*Every gourde saved is a solid shield for your financial freedom! Keep up the amazing work!* 💪`;
      } else {
        return `### 💰 Résumé de vos Soldes (Niveau 1 - Instantané et Local)

Voici le détail de votre argent épargné dans **Spargn Ayiti**, analysé localement pour préserver votre forfait :

*   **🎯 Objectifs d'Épargne :** \`${totalSavedInGoals.toLocaleString()} HTG\` (cumulés sur vos projets actifs)
*   **🛡️ Kòb Sekou (Fonds d'Urgence) :** \`${ctx.emergencyFund.toLocaleString()} HTG\`
*   **🤝 Participation au Sòl :** \`${totalSolPaid.toLocaleString()} HTG\` versés dans le cycle en cours (Semaine ${ctx.solWeek})

---
💵 **Total Épargné :** **\`${grandTotal.toLocaleString()} HTG\`**

*Chaque gourde mise de côté vous rapproche de votre indépendance financière !* 💪`;
      }
    }

    // 2. Objectifs / Goals / progression check
    if (
      raw.includes('objectif') || 
      raw.includes('objektif') || 
      raw.includes('pwogrè') || 
      raw.includes('pwogre') || 
      raw.includes('progression') || 
      raw.includes('avancement') || 
      raw.includes('target') || 
      raw.includes('liste') || 
      raw.includes('lis ')
    ) {
      if (goals.length === 0) {
        if (language === 'HT') {
          return `### 🎯 Objektif Epay yo (Poko Genyen)

Ou pa gen okenn objektif ki aktif kounye a sou kòb ki gen la.
*Klike sou boutòn **+** nan paj objektif yo pou w kòmanse kreye yon vizyon !* 📈`;
        } else if (language === 'EN') {
          return `### 🎯 Savings Goals (Not Started Yet)

You do not have any active goals recorded at the moment.
*Click the **+** button on the goals screen to lock in your first target!* 📈`;
        } else {
          return `### 🎯 Vos Objectifs d'Épargne (Aucun pour l'instant)

Vous n'avez pas encore d'objectif actif enregistré dans l'application.
*Cliquez sur le bouton **+** de l'onglet Objectifs pour tracer votre premier projet !* 📈`;
        }
      }

      const getProgressBar = (prog: number) => {
        const totalBlocks = 10;
        const filledBlocks = Math.min(10, Math.max(0, Math.round((prog / 100) * totalBlocks)));
        const emptyBlocks = totalBlocks - filledBlocks;
        return '`[' + '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks) + '] ' + Math.min(100, Math.round(prog)) + '%`';
      };

      let result = '';
      if (language === 'HT') {
        result = `### 🎯 Lis ak Pwogrè Objektif ou yo (Nivo 1 - Lokal)\n\nMen sitiyasyon pwojè ou yo kounye a :\n\n`;
        goals.forEach(g => {
          const list = contributions[g.id] || [];
          const saved = list.reduce((sum, c) => sum + c.amount, 0);
          const prog = g.targetAmount > 0 ? (saved / g.targetAmount) * 100 : 0;
          result += `*   **${g.icon || '🎯'} ${g.name}**\n`;
          result += `    Progression: ${getProgressBar(prog)}\n`;
          result += `    Sere: \`${saved.toLocaleString()} ${g.currency}\` / Cible: \`${g.targetAmount.toLocaleString()} ${g.currency}\` (Rès pou ranpli: \`${Math.max(0, g.targetAmount - saved).toLocaleString()} ${g.currency}\`)\n`;
          result += `    Dat limit: \`${g.targetDate}\`\n\n`;
        });
        result += `💡 *Pyas di w : Sere kòb regilyèman se pi bèl sekrè pou w reyalize gwo rèv ou !*`;
      } else if (language === 'EN') {
        result = `### 🎯 Your Active Savings Goals (Level 1 - Local Direct)\n\nHere is a local list of your ongoing projects:\n\n`;
        goals.forEach(g => {
          const list = contributions[g.id] || [];
          const saved = list.reduce((sum, c) => sum + c.amount, 0);
          const prog = g.targetAmount > 0 ? (saved / g.targetAmount) * 100 : 0;
          result += `*   **${g.icon || '🎯'} ${g.name}**\n`;
          result += `    Progress: ${getProgressBar(prog)}\n`;
          result += `    Saved: \`${saved.toLocaleString()} ${g.currency}\` / Target: \`${g.targetAmount.toLocaleString()} ${g.currency}\` (Remaining: \`${Math.max(0, g.targetAmount - saved).toLocaleString()} ${g.currency}\`)\n`;
          result += `    Target Date: \`${g.targetDate}\`\n\n`;
        });
        result += `💡 *Pyas says: Steady regular contributions make the dream real. Keep building block by block!*`;
      } else {
        result = `### 🎯 Vos Objectifs d'Épargne Réels (Niveau 1 - Instantané)\n\nVoici l'état d'avancement de vos projets actifs :\n\n`;
        goals.forEach(g => {
          const list = contributions[g.id] || [];
          const saved = list.reduce((sum, c) => sum + c.amount, 0);
          const prog = g.targetAmount > 0 ? (saved / g.targetAmount) * 100 : 0;
          result += `*   **${g.icon || '🎯'} ${g.name}**\n`;
          result += `    Avancement : ${getProgressBar(prog)}\n`;
          result += `    Épargné : \`${saved.toLocaleString()} ${g.currency}\` / Cible : \`${g.targetAmount.toLocaleString()} ${g.currency}\` (Reste : \`${Math.max(0, g.targetAmount - saved).toLocaleString()} ${g.currency}\`)\n`;
          result += `    Date échéance : \`${g.targetDate}\`\n\n`;
        });
        result += `💡 *Le mot de Pyas : La rigueur l'emporte toujours sur les gros montants occasionnels !*`;
      }
      return result;
    }

    // 3. Sòl tontine check
    if (
      raw.includes('sòl') || 
      raw.includes('sol ') || 
      raw.includes('solde sol') ||
      raw.includes('tontine') || 
      raw.includes('main') || 
      raw.includes('tirage') || 
      raw.includes('tour') || 
      raw.includes('lòt') || 
      raw.includes('lot')
    ) {
      const paidCount = ctx.solPaidWeeks.filter(Boolean).length;
      const totalPaid = paidCount * ctx.solWeeklyHand;

      if (language === 'HT') {
        return `### 🤝 Rapò ak Fonksyònman Sòl ou (Nivo 1 - Lokal)

Sòl la se yon zouti tontine tradisyonèl poto mitan pou pèp Ayisyen. Men eta Sòl ou kounye a sou aplikasyon an :

*   **💵 Main Sòl (Cotisation) :** \`${ctx.solWeeklyHand.toLocaleString()} HTG\` pa semèn
*   **🎯 Tour Tiraj ou :** Semèn \`${ctx.solSelectedTurn}\` sou 4
*   **📅 Semèn k ap woule a :** Semèn \`${ctx.solWeek}\` kounye a
*   **📦 Gwo Lòt (Sa w ap touche) :** **\`${ctx.solPayout.toLocaleString()} HTG\`**
*   **📈 Lajan ou deja vèse :** \`${totalPaid.toLocaleString()} HTG\`

**✅ Eta peman ou fè :**
* Let 1 (Semèn 1): ${ctx.solPaidWeeks[0] ? '🟢 Vèse' : '🔴 Poko vèse'}
* Let 2 (Semèn 2): ${ctx.solPaidWeeks[1] ? '🟢 Vèse' : '🔴 Poko vèse'}
* Let 3 (Semèn 3): ${ctx.solPaidWeeks[2] ? '🟢 Vèse' : '🔴 Poko vèse'}
* Let 4 (Semèn 4): ${ctx.solPaidWeeks[3] ? '🟢 Vèse' : '🔴 Poko vèse'}

*Sistèm lan ba w yon gwo kòb yon sèl kou pou w kòmanse oswa akselere gwo objektif ou ! Respekte vèsman yo pou Sòl la mache byen.* 🪙`;
      } else if (language === 'EN') {
        return `### 🤝 Sòl Tontine Status & Rules (Level 1 - Local)

The traditional Haitian "Sòl" is a community-driven collective rotating savings challenge. Here is your current plan:

*   **💵 Weekly Contribution (Main Sòl):** \`${ctx.solWeeklyHand.toLocaleString()} HTG\` per week
*   **🎯 Your Payout Turn:** Week \`${ctx.solSelectedTurn}\` (out of 4)
*   **📅 Active Cycle Week:** Week \`${ctx.solWeek}\`
*   **📦 Hand Payout Value (Gwo Lòt):** **\`${ctx.solPayout.toLocaleString()} HTG\`**
*   **📈 Completed payments:** \`${totalPaid.toLocaleString()} HTG\` paid

**✅ Payment Status:**
* Week 1: ${ctx.solPaidWeeks[0] ? '🟢 Contributed' : '🔴 Pending'}
* Week 2: ${ctx.solPaidWeeks[1] ? '🟢 Contributed' : '🔴 Pending'}
* Week 3: ${ctx.solPaidWeeks[2] ? '🟢 Contributed' : '🔴 Pending'}
* Week 4: ${ctx.solPaidWeeks[3] ? '🟢 Contributed' : '🔴 Pending'}

*Always pay your hands on schedule to maintain group symmetry and community confidence!* 🪙`;
      } else {
        return `### 🤝 Statut et Règles de votre Sòl (Niveau 1 - Local)

Le Sòl traditionnel haïtien est un formidable levier d'épargne rotative communautaire. Voici un récapitulatif de votre plan actuel :

*   **💵 Main Sòl (Mensualité/Semaine) :** \`${ctx.solWeeklyHand.toLocaleString()} HTG\` par semaine
*   **🎯 Votre Tour de Tirage :** Semaine \`${ctx.solSelectedTurn}\` sur 4
*   **📅 Semaine active :** Semaine \`${ctx.solWeek}\`
*   **📦 Gwo Lòt (Cagnotte Finale attendue) :** **\`${ctx.solPayout.toLocaleString()} HTG\`**
*   **📈 Somme totale versée :** \`${totalPaid.toLocaleString()} HTG\`

**✅ Statut des Mains versées :**
* Semaine 1 : ${ctx.solPaidWeeks[0] ? '🟢 Payée' : '🔴 En attente'}
* Semaine 2 : ${ctx.solPaidWeeks[1] ? '🟢 Payée' : '🔴 En attente'}
* Semaine 3 : ${ctx.solPaidWeeks[2] ? '🟢 Payée' : '🔴 En attente'}
* Semaine 4 : ${ctx.solPaidWeeks[3] ? '🟢 Payée' : '🔴 En attente'}

*N'oubliez pas d'honorer vos versements chaque semaine à temps pour respecter la tontine !* 🪙`;
      }
    }

    // 4. Emergency fund / Kòb Sekou check
    if (
      raw.includes('sekou') || 
      raw.includes('urgence') || 
      raw.includes('accident') || 
      raw.includes('fonds d') || 
      raw.includes('fund')
    ) {
      if (language === 'HT') {
        return `### 🛡️ Kòb Sekou (Fon Irjans - Nivo 1 - Lokal)

Fon irjans "Kòb Sekou" se plak boukliye ou kont tout sanzatann lavi a (maladi, ijans kay, ets.) :

*   **💰 Montant Sere Kounye a :** **\`${ctx.emergencyFund.toLocaleString()} HTG\`**

💡 **Gid pratik Pyas :**
Apre ou kreye yon pwojè, mete yon pati nan kòb ou genyen kòm kòb sekou. Yon nivo sekirite ideyal se kouvri 3 a 6 mwa depans minimòm pou lavi w. Menmsi se **50 goud** ou mete chak semèn sou li, sa ap evite w pran dèt an kachèt lè gen ijans !`;
      } else if (language === 'EN') {
        return `### 🛡️ Kòb Sekou (Emergency Shield - Level 1 - Local)

The emergency fund "Kòb Sekou" functions as your armor against unforeseen events (medical costs, unexpected bills, temporary lay-offs):

*   **💰 Saved Amount:** **\`${ctx.emergencyFund.toLocaleString()} HTG\`**

💡 **Best Practices from Pyas:**
Try to pile up enough to cover at least 3 to 6 months of your bare-minimum living expenses. Laying aside even **50 to 100 gourdes** every week directly to this fund before committing other expenses prevents you from getting caught in high-interest debt loops!`;
      } else {
        return `### 🛡️ Kòb Sekou (Fonds d'Urgence - Niveau 1 - Instantané)

Le fonds de sécurité "Kòb Sekou" fait office de gilet pare-balles contre tous les aléas urgents (santé, pépins domestiques) :

*   **💰 Montant Épargné Actuel :** **\`${ctx.emergencyFund.toLocaleString()} HTG\`**

💡 **L'avis d'expert de Pyas :**
Constituez idéalement l'équivalent de 3 à 6 mois de vos besoins vitaux de subsistance. Y faire glisser ne serait-ce que **50 ou 100 Gourdes** automatiquement chaque semaine prévient le recours à des micro-crédits toxiques !`;
      }
    }

    // 5. Statistics / Dépôts check
    if (
      raw.includes('statistique') || 
      raw.includes('stat') || 
      raw.includes('depot') || 
      raw.includes('depo') || 
      raw.includes('kontribisyon') || 
      raw.includes('historique') || 
      raw.includes('istorik') || 
      raw.includes('transaction')
    ) {
      // Aggregate contributions
      let contribCount = 0;
      let contribTotal = 0;
      Object.keys(contributions).forEach(gId => {
        const list = contributions[gId] || [];
        contribCount += list.length;
        contribTotal += list.reduce((s, c) => s + c.amount, 0);
      });
      const contribAvg = contribCount > 0 ? Math.round(contribTotal / contribCount) : 0;

      if (language === 'HT') {
        return `### 📊 Statistik ak Depozisyon ou yo (Nivo 1 - Isit la)

Epay ou bati sou ti aksyon ki repete regilyèman :

*   **📈 Kantite Depo Vese :** \`${contribCount} depo\` sou objektif ou yo
*   **💰 Som Total Depoze :** \`${contribTotal.toLocaleString()} HTG\`
*   **🔍 Mwayèn chak vèsman :** \`${contribAvg.toLocaleString()} HTG\`

Chak fwa ou mete yon ti ti kòb sou kote, ou montre disiplin ou epi ou reyalize siksè. Kontinye konsa ! 🚀`;
      } else if (language === 'EN') {
        return `### 📊 Your Savings Contribution Metrics (Level 1 - Instant)

Steady actions compound to build substantial wealth. Here are your stats:

*   **📈 Savings Occurrences:** \`${contribCount} deposit(s)\`
*   **💰 Total Saved Weight:** \`${contribTotal.toLocaleString()} HTG\`
*   **🔍 Average Deposit Weight:** \`${contribAvg.toLocaleString()} HTG\`

Consistency always beats irregular spikes. You are building highly positive saving habits! 🚀`;
      } else {
        return `### 📊 Statistiques de vos Dépôts (Niveau 1 - Local)

La régularité est un super-pouvoir financier. Voici le résumé de vos dépôts :

*   **📈 Versements effectués :** \`${contribCount} versement(s)\`
*   **💰 Cumul Épargné :** \`${contribTotal.toLocaleString()} HTG\`
*   **🔍 Moyenne par Dépôt :** \`${contribAvg.toLocaleString()} HTG\`

Chaque dépôt consolidé renforce votre parcours et votre motivation d'épargne ! 🚀`;
      }
    }

    // 6. Score check
    if (
      raw.includes('score') || 
      raw.includes('habitudes') || 
      raw.includes('abid') || 
      raw.includes('sante') || 
      raw.includes('skò') || 
      raw.includes('sko') || 
      raw.includes('finances')
    ) {
      // Calculate financial score
      const hasGoals = goals.length > 0;
      let contribCount = 0;
      Object.keys(contributions).forEach(gId => {
        contribCount += (contributions[gId] || []).length;
      });

      const pointsGoals = hasGoals ? 20 : 0;
      const pointsContribs = contribCount > 0 ? Math.min(30, contribCount * 6) : 0;
      const pointsEmergency = ctx.emergencyFund > 0 ? 30 : 0;
      const pointsSol = ctx.solWeeklyHand > 0 ? 20 : 0;
      const score = pointsGoals + pointsContribs + pointsEmergency + pointsSol;

      let rating = 'D (Kòmanse)';
      if (score >= 90) rating = '👑 AAA+ (Mèt Finans !)';
      else if (score >= 75) rating = '🌟 A (Ekselan)';
      else if (score >= 50) rating = '🟢 B (Bon travay)';
      else if (score >= 30) rating = '🟡 C (Mwayen)';

      if (language === 'HT') {
        let advice = '';
        if (pointsGoals === 0) advice += '* 🎯 Ou poko fikse yon objektif ! Kreye youn kounye a pou w jwenn direksyon.\n';
        if (pointsContribs < 12) advice += '* 📈 Eseye fè depo yo pi souvan pou w gen plis disiplin ak pratik.\n';
        if (pointsEmergency === 0) advice += '* 🛡️ Mete menm 50 Gourdes nan **Kòb Sekou** kounye a pou w gen sekirite kont risk.\n';
        if (pointsSol === 0) advice += '* 🤝 Konfigure yon ti plan **Sòl** pou w aprann kolabore epi jwenn gwo lo an.\n';
        if (advice === '') advice += '* 🎉 Ou gen pi bèl abitid yo net ! Kontinye pwoteje nivo AAA+ sa a ! ⭐\n';

        return `### 🏆 Skò Sante Finansye ou Spargn (Nivo 1)

Kalkil otomatik ak konbisyon done reyalite w yo :

🎯 **Skò ou: \`${score} / 100\`**
Evaluation : **\`${rating}\`**

**Kijan nou rasanble pwen yo :**
*   **🎯 Fikse Objektif :** \`${pointsGoals}/20\`
*   **📈 Regilarite Depo :** \`${pointsContribs}/30\`
*   **🛡️ Kòb Sekou (Irjans) :** \`${pointsEmergency}/30\`
*   **🤝 Sòl (Epay Rotatif) :** \`${pointsSol}/20\`

🌟 **Wout pou n asire siksè ak monte skò a :**
${advice}`;
      } else if (language === 'EN') {
        let advice = '';
        if (pointsGoals === 0) advice += '* 🎯 Set up your first goal to have a defined path!\n';
        if (pointsContribs < 12) advice += '* 📈 Try to execute deposits more regularly to compound habits.\n';
        if (pointsEmergency === 0) advice += '* 🛡️ Fund your **Kòb Sekou (Emergency Shield)** to bulletproof yourself!\n';
        if (pointsSol === 0) advice += '* 🤝 Try completing one active **Sòl rotation challenge**!\n';
        if (advice === '') advice += '* 🎉 Stellar! You are fully optimized. Maintain your AAA+ master score! ⭐\n';

        return `### 🏆 Spargn Financial Health Score (Level 1)

This real-time indicator scores your local savings ecosystem objectively:

🎯 **Your Score: \`${score} / 100\`**
Performance Rank: **\`${rating}\`**

**Scoring Breakdown:**
*   **🎯 Goal Targets:** \`${pointsGoals}/20\`
*   **📈 Savings Frequency:** \`${pointsContribs}/30\`
*   **🛡️ Emergency Fund:** \`${pointsEmergency}/30\`
*   **🤝 Sòl Participation:** \`${pointsSol}/20\`

🌟 **How to enhance your score & financial stability:**
${advice}`;
      } else {
        let advice = '';
        if (pointsGoals === 0) advice += '* 🎯 Définissez un premier objectif d\'épargne actif pour donner une direction à vos finances.\n';
        if (pointsContribs < 12) advice += '* 📈 Augmentez la fréquence de vos versements pour forger une discipline d\'acier.\n';
        if (pointsEmergency === 0) advice += '* 🛡️ Alimentez le fonds **Kòb Sekou** pour être paré à faire face aux coups durs.\n';
        if (pointsSol === 0) advice += '* 🤝 Configurez un cycle de **Sòl** pour structurer de grands paiements groupés.\n';
        if (advice === '') advice += '* 🎉 Exceptionnel ! Vous avez mis en place de formidables habitudes de vie. Maintenez le cap AAA+ ! ⭐\n';

        return `### 🏆 Score de Santé Financière Spargn (Niveau 1)

Votre diagnostic financier calculé en temps réel d'après vos relevés réels :

🎯 **Votre Score : \`${score} / 100\`**
Évaluation globale : **\`${rating}\`**

**Barème de calcul :**
*   **🎯 Objectifs Clairs :** \`${pointsGoals}/20\`
*   **📈 Fréquence Dépôts :** \`${pointsContribs}/30\`
*   **🛡️ Fonds d'Urgence Kòb Sekou :** \`${pointsEmergency}/30\`
*   **🤝 Intégration du Sòl :** \`${pointsSol}/20\`

🌟 **Recommandations de Pyas pour briller :**
${advice}`;
      }
    }

    // 7. Subscriptions / Abonnements check
    if (
      raw.includes('abonnement') || 
      raw.includes('abònman') || 
      raw.includes('abonman') || 
      raw.includes('netflix') || 
      raw.includes('claude') || 
      raw.includes('subscription') || 
      raw.includes('paye ankò') || 
      raw.includes('récurrent')
    ) {
      const activeSubs = subscriptions.filter(s => s.active);
      if (activeSubs.length === 0) {
        if (language === 'HT') {
          return `### 📅 Abònman ou yo (Poko Genyen)
          
Ou pa gen okenn abònman aktif konfigire jounen jodi a.
*Ou ka jere tou senpleman abònman ak depans renouvlab ou yo depi sou feyè Dashboard ou a pou Pyas ka asire w nan kalkil yo !* 💸`;
        } else {
          return `### 📅 Vos Abonnements Récurrents
          
Vous n'avez aucun abonnement actif ou enregistré pour le moment.
*Vous pouvez facilement ajouter vos abonnements (Netflix, Claude AI, iCloud, etc.) sur le Dashboard pour que je puisse vous alerter avant chaque prélèvement !* 💸`;
        }
      }

      let subList = '';
      const today = new Date();
      today.setHours(0,0,0,0);
      
      activeSubs.forEach(s => {
        const nextDate = new Date(s.nextBillingDate + 'T00:00:00');
        const timeDiff = nextDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        let dueAlert = '';
        if (daysRemaining < 0) {
          dueAlert = language === 'HT' ? `⚠️ Peye sa gen ${Math.abs(daysRemaining)} jou` : `⚠️ Échu depuis ${Math.abs(daysRemaining)} jours`;
        } else if (daysRemaining === 0) {
          dueAlert = language === 'HT' ? `🚨 Prelevman AP FÈT JODI A !` : `🚨 Prélèvement AUJOURD'HUI !`;
        } else if (daysRemaining === 1) {
          dueAlert = language === 'HT' ? `🔔 Touche DEMEN` : `🔔 Demain !`;
        } else {
          dueAlert = language === 'HT' ? `🔔 Touche nan ${daysRemaining} jou` : `🔔 Dans ${daysRemaining} jours (${s.nextBillingDate})`;
        }

        subList += `*   **${s.name}** : \`${s.amount} ${s.currency}\` (${s.billingCycle === 'monthly' ? (language === 'HT' ? 'Chak Mwa' : 'Tous les mois') : s.billingCycle}) — **${dueAlert}**\n`;
      });

      if (language === 'HT') {
        let resultHT = `### 📅 Swivi Abònman ak Avètisman\n\nMen lis abònman ou yo k ap kouri :\n\n${subList}\n`;
        const netflixSub = activeSubs.find(s => s.name.toLowerCase().includes('netflix'));
        const claudeSub = activeSubs.find(s => s.name.toLowerCase().includes('claude'));
        
        if (netflixSub) {
          const nextDate = new Date(netflixSub.nextBillingDate + 'T00:00:00');
          const daysRemaining = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysRemaining > 0) {
            resultHT += `\n📺 **Rapèl sa enpòtan :** *Nan ${daysRemaining} jou, y ap prélève abònman **Netflix** ou an (${netflixSub.amount} ${netflixSub.currency}) !*\n`;
          }
        }
        if (claudeSub) {
          resultHT += `\n🧠 **Sajès Pyas :** *Pa bliye prevwa ak sere kòb sifizan (**${claudeSub.amount} ${claudeSub.currency}**) pou abònman **${claudeSub.name}** ou an pito w sanzatann !*\n`;
        }
        return resultHT;
      } else {
        let resultFR = `### 📅 Suivi et Alertes d'Abonnements\n\nVoici vos prélèvements récurrents actifs sous surveillance :\n\n${subList}\n`;
        const netflixSub = activeSubs.find(s => s.name.toLowerCase().includes('netflix'));
        const claudeSub = activeSubs.find(s => s.name.toLowerCase().includes('claude'));
        
        if (netflixSub) {
          const nextDate = new Date(netflixSub.nextBillingDate + 'T00:00:00');
          const daysRemaining = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysRemaining > 0) {
            resultFR += `\n📺 **Rappel important :** *Dans ${daysRemaining} jours, votre abonnement **Netflix** de ${netflixSub.amount} ${netflixSub.currency} sera prélevé.*\n`;
          }
        }
        if (claudeSub) {
          resultFR += `\n🧠 **Note d'anticipation :** *N'oubliez pas de prévoir **${claudeSub.amount} ${claudeSub.currency}** pour votre abonnement **${claudeSub.name}** afin de l'aborder l'esprit serein.*\n`;
        }
        return resultFR;
      }
    }

    return null;
  };

  // Read current Sòl configuration directly from localStorage to provide premium accurate advice
  const getContext = () => {
    const solWeeklyHand = Number(localStorage.getItem('spargn_sol_hand') || '1000');
    const solSelectedTurn = Number(localStorage.getItem('spargn_sol_turn') || '2');
    const solWeek = Number(localStorage.getItem('spargn_sol_week') || '1');
    const emergencyFund = Number(localStorage.getItem('spargn_emergency_fund') || '0');
    const solPaidWeeksRaw = localStorage.getItem('spargn_sol_paid');
    const solPaidWeeks = solPaidWeeksRaw ? JSON.parse(solPaidWeeksRaw) : [false, false, false, false];
    
    // Sum payout potensial (Gwo Lòt)
    const solPayout = solWeeklyHand * 4;

    // Build contributions summary
    const contributionsSummary: Record<string, { count: number; total: number }> = {};
    Object.keys(contributions).forEach(goalId => {
      const list = contributions[goalId] || [];
      const sum = list.reduce((acc, curr) => acc + curr.amount, 0);
      contributionsSummary[goalId] = {
        count: list.length,
        total: sum
      };
    });

    // Subscriptions helper context for LLM comprehension
    const activeSubsText = subscriptions
      .filter(s => s.active)
      .map(s => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const nextDate = new Date(s.nextBillingDate + 'T00:00:00');
        const daysRemaining = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return `${s.name} (${s.amount} ${s.currency}, prélèvement dans ${daysRemaining} jours / date: ${s.nextBillingDate})`;
      })
      .join(', ');

    const virtualGoalList = activeSubsText ? [
      {
        name: `[ALERTE SYSTEME - ABONNEMENTS ACTIFS DE L'UTILISATEUR]: ${activeSubsText}`,
        targetAmount: 0,
        currency: 'USD' as any,
        icon: 'bell',
        saved: 0,
        targetDate: '',
        frequency: 'DAILY' as any
      }
    ] : [];

    return {
      language,
      userName,
      goals: [
        ...goals.map(g => ({
          name: g.name,
          targetAmount: g.targetAmount,
          currency: g.currency,
          icon: g.icon,
          saved: contributionsSummary[g.id]?.total || 0,
          targetDate: g.targetDate,
          frequency: g.frequency
        })),
        ...virtualGoalList
      ],
      contributionsSummary,
      solWeeklyHand,
      solSelectedTurn,
      solWeek,
      solPaidWeeks,
      solPayout,
      emergencyFund
    };
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue('');
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // 1. Level 1 check: Is it a local instant query?
    const localContent = getLocalResponse(text);
    if (localContent) {
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: localContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
        setIsLoading(false);
      }, 650);
      return;
    }

    // 2. Level 2 check: Check custom API key OR Rate Limiting
    const isCustomKeyUsed = customApiKey.trim().length > 0;
    const rateLimitCheck = checkAndRegisterAiCall();

    if (!isCustomKeyUsed && !rateLimitCheck.allowed) {
      // Show rate limit exceeded message
      setTimeout(() => {
        const quotaExceededContent = language === 'HT'
          ? `⚠️ **Nivo 2 (IA jodi a fini / Quota Atteint)**

Ou fin itilize limit gratis **10 mesaj konsèy IA** ou pou jodi a.

**Kisa w ka fè kounye a :**
1. 💡 **Sèvi ak Nivo 1 (Lokal & Gratifis):** Poze kesyon sou done w yo ak mo senp tankou: \`solde\`, \`objectifs\`, \`sòl\`, \`sekou\`, \`score\` oswa \`statistiques\`. Sa yo ap reponn enstantane san limit !
2. ⚙️ **Enstale pwòp kle Gemini API ou:** Klike sou ikòn Paramètres anlè a dwat epi mete kle API Gemini w lan pou w jwenn aksè totalman san okenn limit ak chat la !`
          : `⚠️ **Niveau 2 (Assistant IA limité / Quota Quotidien Atteint)**

Vous avez épuisé vos **10 jetons d'IA approfondis** gratuits pour aujourd'hui.

**Comment continuer à discuter ?**
1. 💡 **Explorez gratuitement et en illimité** le diagnostic local (Niveau 1) en saisissant des termes comme : \`solde\`, \`objectifs\`, \`sòl\`, \`urgences\`, \`score\` ou \`statistiques\`. 
2. ⚙️ **Renseignez votre propre clé API Gemini** dans les Paramètres (en haut à droite) pour débloquer des échanges d'analyse IA instantanés, privés et 100% illimités !`;

        const limitMsg: ChatMessage = {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: quotaExceededContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, limitMsg]);
        setIsLoading(false);
      }, 700);
      return;
    }

    // Otherwise, execute Level 2 calls to backend API
    try {
      const appContextValue = getContext();
      const headersList: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (isCustomKeyUsed) {
        headersList['x-api-key'] = customApiKey.trim();
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: headersList,
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: appContextValue
        })
      });

      if (!response.ok) {
        let errorMsg = language === 'HT' ? 'Sèvè a gen pwoblèm' : 'Erreur de connexion avec le serveur';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Only increment daily usage score if calling the public/shared server-side API (no custom client key)
      if (!isCustomKeyUsed) {
        incrementAiCallCount();
      }

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: err.message || (language === 'HT' 
          ? "Désolé, mwen rankontre yon ti pwoblèm teknik koneksyon. Tanpri verifye si kle `GEMINI_API_KEY` ou a byen anrejistre." 
          : "Désolé, je rencontre une petite difficulté technique de connexion. Veuillez vérifier que votre clé `GEMINI_API_KEY` est bien enregistrée."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    const welcome = "Historique de discussion effacé ! Comment puis-je vous aider à nouveau ? 💵";
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast(language === 'HT' ? 'Historique effacé' : 'Historique effacé avec succès', 'info');
  };

  // Dynamic prompt generator for saving tips based on current goal rates & targets
  const getDynamicTipsPrompt = () => {
    if (goals.length === 0) {
      return language === 'HT'
        ? "Mwen pa gen okenn objektif ki aktif kounye a. Bann konsèy jeneral sou kòman pou m kòmanse planifye bidjè m."
        : "Je n'ai pas encore d'objectif d'épargne actif enregistré. Donne-moi quelques conseils économiques généraux pour démarrer.";
    }

    const goalsSummary = goals.map(g => {
      const list = contributions[g.id] || [];
      const saved = list.reduce((acc, curr) => acc + curr.amount, 0);
      return `- Objectif: "${g.name}", Cible: ${g.targetAmount} ${g.currency}, Déjà accumulé: ${saved} ${g.currency}, Fréquence de versement: ${g.frequency}, Date cible: ${g.targetDate}`;
    }).join('\n');

    return language === 'HT'
      ? `Bonjou Pyas AI ! Mwen vle w analize avansman m ak vitès mwen pou objektif aktif sa yo :\n${goalsSummary}\n\nFè kalkil presi pou mwen sou kòman yon ogmantasyon nan depo yo ka ede m fini pi vit. Fòmile egzanp pratik tounèf, tankou : "Si w sove 50 Goud / [Devise] anplis pa semèn pou kòb [Nom Objektif], w ap rive fini sa 2 semèn pi vit !". Ekri repons la byen klè an kreyòl ayisyen ak lòt ti konsèy.`
      : `Bonjour Pyas AI ! Analyse la progression réelle et le rythme de mes objectifs d'épargne ci-dessous :\n${goalsSummary}\n\nFais des calculs mathématiques précis et suggère-moi au moins deux scénarios d'épargne accélérés et hyper concrets sous cette forme : "Si vous épargnez [Montant] de plus par [Fréquence] sur votre objectif [Nom], vous l'atteindrez [Nombre] semaines/mois plus tôt !". S'il te plaît, base-toi sur mes données réelles fournies ci-dessus.`;
  };

  const getDynamicGoalsPrompt = () => {
    if (goals.length === 0) {
      return language === 'HT'
        ? "Mwen pa gen objektif kounye a. Banm konsèy sou kòman pou m fikse yon bon objektif."
        : "Je n'ai pas de projet d'épargne en cours. Comment puis-je définir des objectifs d'épargne pertinents ?";
    }

    const goalNames = goals.map(g => `"${g.name}"`).join(', ');
    return language === 'HT'
      ? `Mwen gen objektif aktif sa yo: ${goalNames}. Èske w ka evalye yo, gade kòb mwen mete deja epi ban m konsèy sou priyoritizasyon ak repartition bidjè ?`
      : `J'ai défini les objectifs d'épargne suivants : ${goalNames}. Peux-tu analyser la pertinence de chaque projet et me donner des conseils exclusifs de priorisation et de répartition ?`;
  };

  // Suggestion chips
  const suggestions = [
    { 
      label: "❓ Comment marche le Sòl ?", 
      prompt: "Explique-moi comment fonctionne le challenge Sòl dans l'application et quels sont ses avantages par rapport à une tontine classique." 
    },
    { 
      label: "🌱 Conseils d'épargne", 
      prompt: getDynamicTipsPrompt() 
    },
    { 
      label: "📊 Analyser mes objectifs", 
      prompt: getDynamicGoalsPrompt() 
    }
  ];

  return (
    <>
      {/* Floating Sparkle Chat Button */}
      <div className="fixed bottom-24 right-4 md:right-8 z-55">
        <button
          id="pyas-floating-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center p-4 bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black rounded-full shadow-25 hover:shadow-amber-500/20 active:scale-95 transition-all outline-none border border-amber-400/20 cursor-pointer group"
          title="Parler avec l'IA Pyas"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />}
          
          {/* Subtle Notification Indicator */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-neutral-900 flex items-center justify-center text-[8px] text-white font-black">AI</span>
            </span>
          )}
          
          {/* Label text popping on wider screens hover */}
          {!isOpen && (
            <span className="absolute right-14 bg-neutral-900 border border-white/10 text-amber-400 text-xs py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap shadow-xl">
              Parler à Pyas AI ✨
            </span>
          )}
        </button>
      </div>

      {/* Floating Side Panel Drawer Chatbot (Safe & Bounded Inside iFrame Viewports) */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[calc(100vh-14rem)] flex flex-col bg-neutral-950 border border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header Panel */}
          <div className="p-4 bg-neutral-900 border-b border-white/8 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 blur-xl rounded-full -z-10"></div>
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-400/20 flex items-center justify-center text-neutral-950 text-xl shadow-inner font-extrabold">
                🪙
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-neutral-100 text-sm tracking-wider uppercase">Pyas AI</h3>
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold py-0.5 px-1.5 rounded-full inline-block animate-pulse">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                  <span>Conseiller</span>
                  <span className="text-neutral-600 font-bold">•</span>
                  <span className="text-amber-400 font-bold">
                    {customApiKey.trim() ? "∞ IA ⚡" : `${remainingAiCalls}/10 IA`}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1 px-1.5 text-xs rounded-lg flex items-center justify-center transition-all cursor-pointer border ${showSettings ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'text-neutral-400 hover:text-white hover:bg-white/5 border-white/5'}`}
                title="Configurer la clé API"
              >
                <Settings size={14} className={showSettings ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />
              </button>
              <button 
                onClick={clearHistory}
                className="p-1 px-2 text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 hover:text-red-400 rounded-lg hover:bg-white/5 cursor-pointer border border-white/5"
                title="Effacer l'historique"
              >
                Reset
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 flex items-center justify-center cursor-pointer border-none"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-neutral-900 border-b border-white/8 space-y-3 shrink-0 animate-in slide-in-from-top duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1.5 font-mono">
                  <Key size={12} />
                  <span>{language === 'HT' ? "Konfigure kle API ou" : "Configurez votre Clé API"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="text-[10px] text-neutral-400 hover:text-white cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
                {language === 'HT'
                  ? "Pou chat bot la mache pi byen, mete pwòp kle Gemini API ou. Li rete nan navigatè w sèlman epi li sekirize."
                  : "Pour assurer le parfait fonctionnement du chatbot, renseignez votre propre clé Gemini API. Elle reste stockée localement en toute sécurité."}
              </p>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  id="gemini-custom-api-key-input"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-amber-500/40 font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1 font-extrabold uppercase text-[10px] tracking-wider">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('spargn_user_gemini_key', customApiKey.trim());
                    showToast(
                      language === 'HT' 
                        ? 'Konfigirasyon anrejistre!' 
                        : 'Configuration enregistrée !', 
                      'success'
                    );
                    setShowSettings(false);
                  }}
                  className="flex-grow bg-amber-500 hover:bg-amber-400 text-neutral-950 py-2.5 px-3 rounded-xl transition-all cursor-pointer active:scale-95 text-center"
                >
                  {language === 'HT' ? "Anrejistre" : "Sauvegarder"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomApiKey('');
                    localStorage.removeItem('spargn_user_gemini_key');
                    showToast(
                      language === 'HT' 
                        ? 'Klè efase!' 
                        : 'Clé API réinitialisée !', 
                      'info'
                    );
                    setShowSettings(false);
                  }}
                  className="bg-neutral-950 hover:bg-neutral-900 text-neutral-400 border border-white/5 hover:border-red-500/30 hover:text-red-400 py-2.5 px-3 rounded-xl transition-all cursor-pointer active:scale-95 text-center"
                >
                  {language === 'HT' ? "Efase" : "Effacer"}
                </button>
              </div>
            </div>
          )}

          {/* Conversation history lists */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-neutral-800 text-amber-400 border border-amber-500/10' 
                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
                }`}>
                  {msg.role === 'user' ? '👑' : '🪙'}
                </div>

                {/* Message Content Bubble with standard markup */}
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                    msg.role === 'user' 
                      ? 'bg-amber-500/10 text-neutral-200 border-amber-500/20 rounded-tr-none' 
                      : 'bg-neutral-900 text-neutral-300 border-white/5 rounded-tl-none'
                  }`}>
                    <div className="markdown-body text-xs overflow-x-hidden space-y-1 prose prose-invert prose-xs">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                  <p className={`text-[9px] text-neutral-500 font-medium ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                  🪙
                </div>
                <div>
                  <div className="bg-neutral-900 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-reply Suggestions Chips */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 border-t border-white/5 bg-neutral-900/30">
              <p className="text-[10px] text-neutral-400 font-bold mb-2 uppercase tracking-wide">
                💡 Suggestions :
              </p>
              <div className="flex flex-col gap-1.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.prompt)}
                    className="text-left w-full p-2 py-1.5 bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 text-[11px] font-semibold text-amber-400/95 hover:text-amber-400 rounded-xl transition-all outline-none cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat text Input panel */}
          <div className="p-3 bg-neutral-900 border-t border-white/8">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-neutral-950 border border-white/10 focus-within:border-amber-500/40 p-1.5 rounded-xl transition-colors"
            >
              <input
                type="text"
                placeholder="Posez votre question sur votre budget..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-grow bg-transparent text-neutral-200 placeholder-neutral-500 text-xs py-1.5 px-2 outline-none border-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="p-2 aspect-square bg-amber-500 text-neutral-950 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 font-extrabold rounded-lg flex items-center justify-center transition-all cursor-pointer border-none"
              >
                <Send size={14} className="rotate-0" />
              </button>
            </form>
            <p className="text-[9px] text-neutral-600 font-medium text-center mt-2 flex items-center justify-center gap-1">
              <Sparkles size={8} className="text-amber-500/60" /> Pyas AI est connecté en temps réel aux données de vos objectifs locaux.
            </p>
          </div>

        </div>
      )}
    </>
  );
};
