export type CurrencyCode = 'HTG' | 'USD' | 'EUR' | string;

export interface FinancialScoreBreakdown {
  incomeStability: number;
  expenseControl: number;
  savingsRegularity: number;
  emergencyAdequacy: number;
  debtBurden: number;
}

export interface FinancialScore {
  score: number;
  rating: string;
  breakdown: FinancialScoreBreakdown;
}

export interface Envelope {
  id: string;
  name: string;
  nameKreyol: string;
  allocatedAmount: number;
  spentAmount: number;
  category: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currency: CurrencyCode;
  targetDate: string;
  icon: string;
}

export interface Contribution {
  id: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
}

export interface IncomeTransaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  source: string;
  splits?: unknown;
}

export interface FinancialSnapshot {
  goals: Goal[];
  contributions: Record<string, Contribution[]>;
  envelopes: Envelope[];
  incomeTransactions: IncomeTransaction[];
  solWeeklyHand: number;
  solSelectedTurn: number;
  solWeek: number;
  solPaidWeeks: boolean[];
  solCycleCount: number;
  emergencyFund: number;
  rates: Record<CurrencyCode, number>;
  legacyHealthScore: number;
}

export interface EnvelopeBreakdown {
  id: string;
  name: string;
  nameKreyol: string;
  allocatedHTG: number;
  spentHTG: number;
  balanceHTG: number;
  utilizationPercent: number;
  isOverdrawn: boolean;
}

export interface BudgetAnalysis {
  totalAllocatedHTG: number;
  totalSpentHTG: number;
  totalAvailableHTG: number;
  overdrawnEnvelopeIds: string[];
  envelopeBreakdown: EnvelopeBreakdown[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  currency: CurrencyCode;
  saved: number;
  target: number;
  progressPercent: number;
  daysRemaining: number;
  weeklyContributionNeeded: number;
  isOnTrack: boolean;
}

export interface SavingsAnalysis {
  goalsCount: number;
  totalSavedInGoalsHTG: number;
  totalDeposits: number;
  averageDepositHTG: number;
  solContributedHTG: number;
  solExpectedPayoutHTG: number;
  goals: SavingsGoal[];
}

export interface EmergencyFundAnalysis {
  currentAmountHTG: number;
  targetAmountHTG: number;
  monthsCovered: number;
  adequacyPercent: number;
  isAdequate: boolean;
}

export interface Warning {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  code: string;
  messageHT: string;
  messageFR: string;
  messageEN: string;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  code: string;
  titleHT: string;
  titleFR: string;
  titleEN: string;
  descriptionHT: string;
  descriptionFR: string;
  descriptionEN: string;
}

export interface Insight {
  id?: string;
  tone: 'positive' | 'warning' | 'neutral';
  messageHT: string;
  messageFR: string;
  messageEN: string;
}

export interface FinancialAnalysis {
  totalIncomeHTG: number;
  totalExpensesHTG: number;
  totalSavingsHTG: number;
  totalDebtsHTG: number;
  savingRate: number;
  expenseRatio: number;
  emergencyFundHTG: number;
  score: FinancialScore;
  budget: BudgetAnalysis;
  savings: SavingsAnalysis;
  emergencyFund: EmergencyFundAnalysis;
  warnings: Warning[];
  recommendations: Recommendation[];
  insights: Insight[];
}
