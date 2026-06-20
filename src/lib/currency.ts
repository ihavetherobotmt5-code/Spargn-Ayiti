import { CurrencyCode, Contribution, ExchangeRates, ContributionFrequency } from '../types';

export const CURRENCIES = [
  { code: 'USD' as CurrencyCode, name: 'Dollar Américain', symbol: '$' },
  { code: 'HTG' as CurrencyCode, name: 'Gourde Haïtienne', symbol: 'G' },
  { code: 'EUR' as CurrencyCode, name: 'Euro', symbol: '€' },
  { code: 'USDT' as CurrencyCode, name: 'Tether', symbol: '₮' },
];

export function getCurrencySymbol(code: CurrencyCode): string {
  const curr = CURRENCIES.find(c => c.code === code);
  return curr?.symbol || code;
}

export function getCurrencyName(code: CurrencyCode): string {
  const curr = CURRENCIES.find(c => c.code === code);
  return curr?.name || code;
}

export function convert(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return amount;

  // Amount in HTG
  const rateFrom = rates[fromCurrency] || 1;
  const amountInHTG = amount * rateFrom;

  // Amount in toCurrency
  const rateTo = rates[toCurrency] || 1;
  return amountInHTG / rateTo;
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const symbol = getCurrencySymbol(currency);
  
  if (currency === 'HTG') {
    return `${Math.round(amount).toLocaleString('fr-FR')} G`;
  } else if (currency === 'EUR') {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  } else if (currency === 'USDT') {
    return `₮${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function calculateTotalSaved(
  contributions: Contribution[],
  goalCurrency: CurrencyCode,
  rates: ExchangeRates
): number {
  if (!contributions || contributions.length === 0) return 0;

  return contributions.reduce((total, contrib) => {
    const convertedAmount = convert(
      contrib.amount,
      contrib.currency,
      goalCurrency,
      rates
    );
    return total + convertedAmount;
  }, 0);
}

export function calculateProgress(saved: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min((saved / target) * 100, 100);
}

export function daysRemaining(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize today
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0); // normalize target
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateString: string, locale: string = 'fr-FR'): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateRecommendedAmount(
  targetAmount: number,
  savedAmount: number,
  targetDate: string,
  frequency: ContributionFrequency
): number {
  const remaining = Math.max(0, targetAmount - savedAmount);
  if (remaining <= 0) return 0;

  const daysLeft = Math.max(1, daysRemaining(targetDate));
  
  let periods = 1;
  switch (frequency) {
    case 'DAILY':
      periods = daysLeft;
      break;
    case 'WEEKLY':
      periods = daysLeft / 7;
      break;
    case 'MONTHLY':
      periods = daysLeft / 30.4375;
      break;
    case 'QUARTERLY':
      periods = daysLeft / 91.25;
      break;
    case 'YEARLY':
      periods = daysLeft / 365;
      break;
  }

  // Avoid divide-by-less-than-one behavior blowing up recommended amount
  const adjustedPeriods = periods < 1 ? 1 : periods;
  return remaining / adjustedPeriods;
}
