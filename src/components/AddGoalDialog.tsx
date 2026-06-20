import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TRANSLATIONS } from '../lib/translations';
import { CurrencyCode, ContributionFrequency } from '../types';
import { X } from 'lucide-react';

interface AddGoalDialogProps {
  open: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = [
  { value: 'house', label: '🏠 Maison' },
  { value: 'directions_car', label: '🚗 Voiture' },
  { value: 'laptop_mac', label: '💻 Ordinateur / Projets' },
  { value: 'flight_takeoff', label: '✈️ Voyage' },
  { value: 'school', label: '🎓 Études' },
  { value: 'trending_up', label: '📈 Investissement' },
  { value: 'payments', label: '💵 Épargne Libre' },
  { value: 'shopping_bag', label: '🛍️ Commerce' }
];

export const AddGoalDialog: React.FC<AddGoalDialogProps> = ({ open, onClose }) => {
  const { addGoal, language } = useAppContext();
  const t = TRANSLATIONS[language] || TRANSLATIONS.HT;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState<ContributionFrequency>('MONTHLY');
  const [selectedIcon, setSelectedIcon] = useState('house');

  // Trigger default dates when dialog opens
  useEffect(() => {
    if (open) {
      setName('');
      setAmount('');
      setCurrency('HTG');
      setFrequency('MONTHLY');
      setSelectedIcon('house');
      
      const todayString = new Date().toISOString().split('T')[0];
      setStartDate(todayString);

      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      setEndDate(futureDate.toISOString().split('T')[0]);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    addGoal({
      name: name.trim(),
      targetAmount: parseFloat(amount),
      currency,
      targetDate: endDate, // Safe backward compatibility copy
      startDate,
      endDate,
      frequency,
      icon: selectedIcon,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-955/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div 
        className="bg-neutral-900 border border-white/10 rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[95vh]"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold font-headline-md text-amber-400 mb-6 flex items-center gap-2">
          <span>🎯</span> {t.newGoal}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Goal Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              {t.goalName}
            </label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fond d'Urgence, Achat Terrain..."
              className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-medium placeholder-neutral-500 text-sm"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              {t.targetAmount}
            </label>
            <input 
              type="number"
              required
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500000"
              className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-semibold text-sm"
            />
          </div>

          {/* Currency (Pill Buttons) */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              {t.currency}
            </label>
            <div className="grid grid-cols-4 gap-2 bg-neutral-950 p-1.5 rounded-xl border border-white/5">
              {(['HTG', 'USD', 'EUR', 'USDT'] as CurrencyCode[]).map((cur) => {
                const isActive = currency === cur;
                let sym = 'G';
                if (cur === 'USD') sym = '$';
                if (cur === 'EUR') sym = '€';
                if (cur === 'USDT') sym = '₮';
                
                return (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setCurrency(cur)}
                    className={`py-2 text-xs text-center rounded-lg font-bold transition-all duration-150 ${
                      isActive 
                        ? 'bg-amber-500 text-neutral-950 shadow-sm font-extrabold' 
                        : 'text-neutral-400 hover:text-neutral-200 border border-transparent'
                    }`}
                  >
                    {sym} <span className="font-medium text-[10px]">{cur}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start and End Date selection replacing targetDate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                {language === 'HT' ? 'Dat kòmansman' : language === 'FR' ? 'Date de début' : 'Start Date'}
              </label>
              <input 
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-neutral-955 border border-white/10 rounded-xl px-3 py-3 text-neutral-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                {language === 'HT' ? 'Dat limit fèmti' : language === 'FR' ? 'Date d\'échéance' : 'End Date'}
              </label>
              <input 
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-neutral-955 border border-white/10 rounded-xl px-3 py-3 text-neutral-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-semibold"
              />
            </div>
          </div>

          {/* Frequency (Pill Buttons) */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              {t.frequency}
            </label>
            <div className="grid grid-cols-5 gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-white/5">
              {(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as ContributionFrequency[]).map((freq) => {
                let label = '';
                if (freq === 'DAILY') label = language === 'HT' ? 'Chak Jou' : language === 'FR' ? 'Jour' : 'Daily';
                else if (freq === 'WEEKLY') label = language === 'HT' ? 'Chak Sem' : language === 'FR' ? 'Sem' : 'Weekly';
                else if (freq === 'MONTHLY') label = language === 'HT' ? 'Chak Mwa' : language === 'FR' ? 'Mois' : 'Monthly';
                else if (freq === 'QUARTERLY') label = language === 'HT' ? 'Trimès' : language === 'FR' ? 'Trim' : 'Quarterly';
                else if (freq === 'YEARLY') label = language === 'HT' ? 'Chak Ane' : language === 'FR' ? 'An' : 'Yearly';

                const isActive = frequency === freq;
                return (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`py-2 text-[10px] text-center rounded-lg font-black transition-all duration-150 ${
                      isActive 
                        ? 'bg-amber-400 text-neutral-950 shadow-md font-extrabold scale-100' 
                        : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Choice Picker */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              {t.icon}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EMOJI_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSelectedIcon(item.value)}
                  className={`py-2.5 px-1 text-center text-sm rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedIcon === item.value 
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(242,202,80,0.15)]' 
                      : 'border-white/5 bg-neutral-800/50 hover:border-white/20 text-neutral-300'
                  }`}
                >
                  <span className="text-xl">{item.label.split(' ')[0]}</span>
                  <span className="text-[9px] block text-neutral-500 line-clamp-1">{item.label.split(' ')[1]}</span>
                </button>
              ))}
            </div>
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-emerald-600 hover:opacity-95 text-neutral-900 font-bold rounded-xl transition shadow-[0_4px_20px_rgba(242,202,80,0.25)] active:scale-95 duration-200"
            >
              {t.create}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
