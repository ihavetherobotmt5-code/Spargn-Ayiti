import React from 'react';

const TRANSLATIONS = {
  FR: { past: 'Passé', projected: 'Projeté' },
  HT: { past: 'Pase', projected: 'Pwojete' },
  EN: { past: 'Past', projected: 'Projected' }
};

interface ProjectionChartProps {
  language?: 'FR' | 'HT' | 'EN' | string;
  currentAmount?: number;
  targetAmount?: number;
  recommendedMonth?: number;
  monthlyRate?: number;
  currency?: string;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ 
  language = 'EN', 
  currentAmount = 0, 
  monthlyRate = 0,
  recommendedMonth = 0,
  targetAmount = 100,
  currency = 'HTG'
}) => {
  const langKey = (language ? language.toUpperCase() : 'EN') as 'FR' | 'HT' | 'EN';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.EN;
  const rate = monthlyRate || recommendedMonth;
  
  const months = [];
  for (let i = -3; i <= 2; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const amount = Math.max(0, currentAmount + rate * i);
    
    months.push({
      label: date.toLocaleDateString(language === 'HT' ? 'ht' : language === 'FR' ? 'fr-FR' : 'en-US', { month: 'short' }),
      isPast: i < 0,
      amount
    });
  }

  const maxAmount = Math.max(...months.map(m => m.amount), targetAmount, 1);

  return (
    <div className="w-full h-full flex flex-col justify-between space-y-4">
      {/* Legend */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-neutral-600 rounded"></div>
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{t.past}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{t.projected}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-grow h-48 flex items-end justify-between gap-2.5 pt-4">
        {months.map((month, idx) => {
          const percentage = (month.amount / maxAmount) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
              {/* Tooltip on hover */}
              <div className="group relative w-full flex justify-center">
                <div className="absolute bottom-full mb-1 bg-neutral-900 border border-white/10 text-[9px] font-mono font-bold text-neutral-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {month.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}
                </div>
                <div
                  data-testid={month.isPast ? `projection-bar-past-${idx}` : `projection-bar-projected-${idx}`}
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    month.isPast 
                      ? 'bg-neutral-600 hover:bg-neutral-500' 
                      : 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  }`}
                  style={{ height: `${Math.max(percentage, 8)}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{month.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectionChart;
