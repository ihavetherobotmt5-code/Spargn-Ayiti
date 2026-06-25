export type CurrencyCode = 'USD' | 'HTG' | 'EUR' | 'USDT';

export type ContributionFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currency: CurrencyCode;
  targetDate: string; // End date of saving target
  startDate: string; // Saving start date
  endDate: string; // Saving end/completion date
  frequency: ContributionFrequency;
  icon: string; // material symbol or emoji
  createdDate: string;
  completedDate?: string;
  status: 'active' | 'completed';
  completionReason?: string;
  completionType?: 'realized' | 'closed';
  completionPercentage?: number;
  daysSavedAhead?: number;
}

export interface Contribution {
  id: string;
  amount: number;
  currency: CurrencyCode;
  date: string; // YYYY-MM-DD;
  note?: string;
}

export interface ExchangeRates {
  USD: number;
  HTG: number;
  EUR: number;
  USDT: number;
}

export type LanguageCode = 'FR' | 'HT' | 'EN';

// --- v1.3: Budget Intelligent & Enveloppes Flexibles ---

export type IncomeSource = 'COMMERCE' | 'DAILY_LABOR' | 'TRANSFER' | 'SALARY' | 'OTHER';

export interface IncomeTransaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  source: IncomeSource;
  date: string; // YYYY-MM-DD
  profileId: string; // ID of the applied distribution profile
  splits: Record<string, number>; // envelopeId -> allocated amount in transaction currency
  note?: string;
}

export interface BudgetEnvelope {
  id: string; // 'food' | 'transport' | 'family' | 'emergency' | 'saving' or custom
  name: string; // French name
  nameKreyol: string; // Kreyòl name
  percentage: number; // Applied percentage
  allocatedAmount: number; // Lifetime cumulative allocated amount in budget's base currency (HTG or stable)
  spentAmount: number; // Lifetime cumulative spent amount in budget's base currency (HTG)
  icon: string; // Lucide icon identifier
  category?: 'monthly' | 'saving' | 'event' | 'subscription' | 'project' | 'custom';
  recurringAmount?: number;
  recurringCurrency?: CurrencyCode;
  recurringNextDate?: string;
}

export interface DistributionProfile {
  id: string;
  name: string;
  nameKreyol: string;
  percentages: Record<string, number>; // envelopeId -> percentage (total must equal 100)
}

export interface FinancialState {
  envelopes: BudgetEnvelope[];
  profiles: DistributionProfile[];
  incomeTransactions: IncomeTransaction[];
  activeProfileId: string;
  financialHealthScore: number;
}

// --- v1.4: Mon Carnet d'Avenir / Vision Financière ---
export type VisionSection = 'notes' | 'ideas' | 'projects' | 'prevision' | 'wishlist';

export interface VisionItem {
  id: string;
  title: string;
  content: string;
  section: VisionSection;
  cost?: number;
  currency?: CurrencyCode;
  targetDate?: string;
  createdDate: string;
}

// --- v1.5: Les Abonnements (Subscriptions) ---
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'custom';
  nextBillingDate: string; // YYYY-MM-DD
  active: boolean;
}
// ===============================
// Expense Management (Sprint 4)
// ===============================

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'family'
  | 'business'
  | 'subscription'
  | 'saving'
  | 'other';

export interface Expense {
  id: string;
  amount: number;
  currency: CurrencyCode;

  category: ExpenseCategory;

  envelopeId?: string;

  title: string;
  description?: string;

  date: string;

  createdAt: string;
  updatedAt?: string;
}

export type ExpenseReason =
  | 'user_deleted'
  | 'correction';

export interface ArchivedExpense {
  id: string;

  expense: Expense;

  archivedAt: string;

  reason: ExpenseReason;
}


