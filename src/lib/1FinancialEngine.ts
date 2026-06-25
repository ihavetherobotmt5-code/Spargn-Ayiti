 export class FinancialEngine {
+  static convertToHTG(amount: number, currency: CurrencyCode, rates: Record<CurrencyCode, number>): number {
+    if (currency === 'HTG') return amount;
+    const rate = rates[currency];
+    return rate ? amount * rate : amount;
+  }

   // ... reste du fichier existant
 }
