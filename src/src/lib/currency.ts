+ /**
+  * Calculate total saved amount for a list of contributions
+  */
+ export function calculateTotalSaved(
+   contributions: Array<{ amount: number; currency: CurrencyCode }>,
+   goalCurrency: CurrencyCode,
+   rates: Record<CurrencyCode, number>
+ ): number {
+   return contributions.reduce((sum, c) => {
+     const rate = rates[c.currency] || 1;
+     return sum + (c.amount * rate);
+   }, 0);
+ }
+
+ /**
+  * Calculate recommended amount to reach target
+  */
+ export function calculateRecommendedAmount(
+   target: number,
+   saved: number,
+   targetDate: string,
+   frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
+ ): number {
+   if (target <= saved) return 0;
+   const remaining = target - saved;
+   const targetMs = new Date(targetDate).getTime();
+   const nowMs = Date.now();
+   const daysRemaining = Math.max(1, Math.ceil((targetMs - nowMs) / (1000 * 60 * 60 * 24)));
+
+   let periodsRemaining = 0;
+   switch (frequency) {
+     case 'DAILY': periodsRemaining = daysRemaining; break;
+     case 'WEEKLY': periodsRemaining = Math.ceil(daysRemaining / 7); break;
+     case 'MONTHLY': periodsRemaining = Math.ceil(daysRemaining / 30.4375); break;
+     case 'QUARTERLY': periodsRemaining = Math.ceil(daysRemaining / 91.3125); break;
+     case 'YEARLY': periodsRemaining = Math.ceil(daysRemaining / 365.25); break;
+   }
+
+   return periodsRemaining > 0 ? remaining / periodsRemaining : remaining;
+ }
+
+ /**
+  * Calculate days remaining until target date
+  */
+ export function daysRemaining(targetDate: string): number {
+   const targetMs = new Date(targetDate).getTime();
+   const nowMs = Date.now();
+   if (isNaN(targetMs)) return 0;
+   return Math.max(0, Math.ceil((targetMs - nowMs) / (1000 * 60 * 60 * 24)));
+ }
