import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TRANSLATIONS } from '../lib/translations';
import { CurrencyCode } from '../types';
import { X } from 'lucide-react';

interface AddContributionDialogProps {
  open: boolean;
  onClose: () => void;
  // If undefined, let's offer list selector for Priority 2 Dashboard Quick Add
  goalId?: string;
}

export const AddContributionDialog: React.FC<AddContributionDialogProps> = ({ open, onClose, goalId }) => {
  const { goals, addContribution, language } = useAppContext();
  const t = TRANSLATIONS[language] || TRANSLATIONS.HT;

  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  // Default values setup
  useEffect(() => {
    if (open) {
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);

      if (goalId) {
        setSelectedGoalId(goalId);
        const parentGoal = goals.find(g => g.id === goalId);
        if (parentGoal) {
          setCurrency(parentGoal.currency);
        } else {
          setCurrency('HTG');
        }
      } else {
        setSelectedGoalId(goals[0]?.id || '');
        setCurrency('HTG');
      }
    }
  }, [open, goalId, goals]);

  if (!open) return null;

  const handleGoalSelect = (id: string) => {
    setSelectedGoalId(id);
    const parentGoal = goals.find(g => g.id === id);
    if (parentGoal) {
      setCurrency(parentGoal.currency);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !amount) return;

    addContribution(selectedGoalId, {
      amount: parseFloat(amount),
      currency,
      date,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold font-headline-md text-emerald-400 mb-6 flex items-center gap-2">
          <span>💰</span> {t.addContribution}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Goal Selector -- only display if no preselected goalId was passed down */}
          {!goalId && (
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Sélectionner l'objectif
              </label>
              {goals.length === 0 ? (
                <div className="text-sm text-amber-500 font-semibold mb-2">
                  Aucun objectif disponible. Veuillez d'abord créer un objectif.
                </div>
              ) : (
                <select 
                  value={selectedGoalId}
                  onChange={(e) => handleGoalSelect(e.target.value)}
                  className="w-full bg-neutral-955 border border-white/10 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-semibold text-sm"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.currency})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                {t.amount}
              </label>
              <input 
                type="number"
                required
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
                className="w-full bg-neutral-955 border border-white/10 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-semibold text-sm"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                {t.currency}
              </label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-neutral-955 border border-white/10 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-bold text-sm"
              >
                <option value="HTG">G (Gourdes)</option>
                <option value="USD">$ (USD)</option>
                <option value="EUR">€ (Euro)</option>
                <option value="USDT">₮ (USDT)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Date du dépôt
              </label>
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-955 border border-white/10 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-semibold text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              {t.note}
            </label>
            <input 
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Virement bimensuel, Intérêts..."
              className="w-full bg-neutral-955 border border-white/10 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium placeholder-neutral-500 text-sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/5 bg-neutral-800/30 hover:bg-neutral-800 text-neutral-100 rounded-xl font-bold transition duration-200"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={goals.length === 0 && !goalId}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-neutral-900 font-bold rounded-xl transition shadow-[0_4px_20px_rgba(16,185,129,0.25)] active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed duration-200"
            >
              {t.add}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
