import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MessageSquare, X, Send, Sparkles, AlertCircle, Bot, CornerDownLeft } from 'lucide-react';
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
    showToast 
  } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

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

    try {
      const appContextValue = getContext();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: appContextValue
        })
      });

      if (!response.ok) {
        throw new Error(language === 'HT' ? 'Sèvè a gen pwoblèm' : 'Erreur de connexion avec le serveur');
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: "Désolé, je rencontre une petite difficulté technique de connexion. Veuillez vérifier que votre clé `GEMINI_API_KEY` est bien enregistrée.",
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
                <p className="text-[10px] text-neutral-400 font-medium">
                  Conseiller en budget & Sòl
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
