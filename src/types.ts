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
