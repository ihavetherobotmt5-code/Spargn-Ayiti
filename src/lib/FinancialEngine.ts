import { IncomeTransaction, BudgetEnvelope, DistributionProfile, IncomeSource, CurrencyCode, ExchangeRates } from '../types';

export const DEFAULT_PROFILES: DistributionProfile[] = [
  {
    id: 'normal',
    name: 'Mode Normal (Régime Courant)',
    nameKreyol: 'Mòd Nòmal (Règleman)',
    percentages: {
      food: 35,
      transport: 15,
      family: 20,
      emergency: 15,
      saving: 15,
    },
  },
  {
    id: 'crisis',
    name: 'Mode Kriz (Urgence Absolue)',
    nameKreyol: 'Mòd Kriz (Ijans)',
    percentages: {
      food: 50,
      transport: 10,
      family: 0,
      emergency: 40,
      saving: 0,
    },
  },
  {
    id: 'school',
    name: 'Mode Lekòl (Rentrée Scolaire)',
    nameKreyol: 'Mòd Lekòl (Lekòl)',
    percentages: {
      food: 30,
      transport: 10,
      family: 45,
      emergency: 10,
      saving: 5,
    },
  },
  {
    id: 'business',
    name: 'Mode Biznis (Investissement)',
    nameKreyol: 'Mòd Biznis (Envestisman)',
    percentages: {
      food: 30,
      transport: 10,
      family: 10,
      emergency: 10,
      saving: 40,
    },
  },
];

export const DEFAULT_ENVELOPES: BudgetEnvelope[] = [
  {
    id: 'food',
    name: 'Nourriture / Alimentation',
    nameKreyol: 'Manje / Pwovizyon',
    percentage: 35,
    allocatedAmount: 1800,
    spentAmount: 850,
    icon: 'utensils',
    category: 'monthly',
  },
  {
    id: 'transport',
    name: 'Transport / Carburant',
    nameKreyol: 'Wout / Transpò',
    percentage: 15,
    allocatedAmount: 1200,
    spentAmount: 950,
    icon: 'car',
    category: 'monthly',
  },
  {
    id: 'family',
    name: 'Scolarité / Famille',
    nameKreyol: 'Lekòl / Fanmi',
    percentage: 20,
    allocatedAmount: 2500,
    spentAmount: 500,
    icon: 'graduation-cap',
    category: 'monthly',
  },
  {
    id: 'emergency',
    name: 'Fon Degaje (Urgence)',
    nameKreyol: 'Fon Degaje (Ijans)',
    percentage: 15,
    allocatedAmount: 1500,
    spentAmount: 0,
    icon: 'shield-alert',
    category: 'saving',
  },
  {
    id: 'saving',
    name: 'Spargn (Épargne Projets)',
    nameKreyol: 'Spargn (Epany Pwojè)',
    percentage: 15,
    allocatedAmount: 1000,
    spentAmount: 0,
    icon: 'piggy-bank',
    category: 'saving',
  },
];

export class FinancialEngine {
  /**
   * Calculates how a given income amount is split into envelope allocations
   * based on the given distribution profile.
   */
  static computeSplits(
    amount: number,
    profile: DistributionProfile,
    allEnvelopes: { id: string }[] = []
  ): Record<string, number> {
    const splits: Record<string, number> = {};
    const targetEnvelopes = allEnvelopes.length > 0 
      ? allEnvelopes.map(e => e.id)
      : Object.keys(profile.percentages);

    targetEnvelopes.forEach(id => {
      const percentage = profile.percentages[id] !== undefined ? profile.percentages[id] : 0;
      const share = Number(((amount * percentage) / 100).toFixed(2));
      splits[id] = Math.max(0, share);
    });

    return splits;
  }

  /**
   * Helper to convert amount from any currency to Base (HTG)
   */
  static convertToHTG(amount: number, currency: CurrencyCode, rates: ExchangeRates): number {
    const rate = rates[currency] || 1;
    // Since currency base rate in DEFAULT_RATES has USD=130, HTG=1, etc:
    // To convert USD to HTG: amount * rate (e.g. 10 USD * 130 = 1300 HTG)
    // To convert HTG to HTG: amount * 1 = amount
    return Number((amount * rate).toFixed(2));
  }

  /**
   * Helper to convert amount from Base (HTG) to any currency
   */
  static convertFromHTG(amountHTG: number, targetCurrency: CurrencyCode, rates: ExchangeRates): number {
    const rate = rates[targetCurrency] || 1;
    if (rate <= 0) return amountHTG;
    return Number((amountHTG / rate).toFixed(2));
  }

  /**
   * Helper to get week identity string (e.g., "YYYY-WW") from a date string (YYYY-MM-DD or standard ISO)
   */
  static getWeekIdentifier(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'unknown';
      const year = date.getFullYear();
      // Simple ISO week calculation
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return `${year}-W${weekNo}`;
    } catch (_) {
      return 'unknown';
    }
  }

  /**
   * Compute the total rating out of 100
   */
  static calculateFinancialHealthScore(
    envelopes: BudgetEnvelope[],
    incomeTransactions: IncomeTransaction[],
    contributionsList: Record<string, any[]>
  ): number {
    // 1. Regularity of savings (Score: 0 - 40 points)
    // S'incrémente de 5 points par semaine d'activité continue où au moins un apport d'épargne est constaté.
    const savingWeeks = new Set<string>();

    // Analyze savings splits in income transactions
    incomeTransactions.forEach(t => {
      const savingSplit = t.splits['saving'] || 0;
      if (savingSplit > 0) {
        const week = this.getWeekIdentifier(t.date);
        if (week !== 'unknown') {
          savingWeeks.add(week);
        }
      }
    });

    // Analyze contributions list (goals contributions)
    Object.values(contributionsList).forEach((contribArray) => {
      contribArray.forEach(c => {
        if (c.amount > 0) {
          const week = this.getWeekIdentifier(c.date);
          if (week !== 'unknown') {
            savingWeeks.add(week);
          }
        }
      });
    });

    // Score is 5 pts per week - max 40
    const regularityScore = Math.min(40, savingWeeks.size * 5);

    // 2. Emergency Fund "Fon Degaje" security (Score: 0 - 30 points)
    // Proportionnel au volume accumulé net dans l'enveloppe Fon Degaje.
    // Target representative of basic safety margin is 3,000 HTG = 30 pts. (approx 100 HTG/point scale)
    const emergencyEnv = envelopes.find(e => e.id === 'emergency');
    const emergencyNetBalance = emergencyEnv
      ? Math.max(0, emergencyEnv.allocatedAmount - emergencyEnv.spentAmount)
      : 0;

    const emergencyScore = Math.min(30, Math.round(emergencyNetBalance / 100));

    // 3. Discipline of Envelopes (Score: 0 - 30 points)
    // Start with 30 pts. Deduct 5 pts for each envelope that's overdrawn (negative).
    let disciplineScore = 30;
    envelopes.forEach(e => {
      const balance = e.allocatedAmount - e.spentAmount;
      if (balance < 0) {
        disciplineScore -= 5;
      }
    });
    disciplineScore = Math.max(0, disciplineScore);

    return regularityScore + emergencyScore + disciplineScore;
  }
}
