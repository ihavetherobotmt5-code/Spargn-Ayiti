- export function calculateFinancialScore(snapshot: FinancialSnapshot): FinancialScore {
+ export function calculateFinancialScore(params: {
+   snapshot: FinancialSnapshot;
+   totalIncomeHTG: number;
+   totalExpensesHTG: number;
+   totalSavingsHTG: number;
+   totalDebtsHTG: number;
+   savingRate: number;
+   expenseRatio: number;
+   budget: BudgetAnalysis;
+   savings: SavingsAnalysis;
+   emergencyFund: EmergencyFundAnalysis;
+   legacyHealthScore: number;
+ }): FinancialScore {
    // Corps de la fonction existant
+   const { snapshot, totalIncomeHTG, totalExpensesHTG, totalSavingsHTG, totalDebtsHTG, savingRate, expenseRatio, budget, savings, emergencyFund, legacyHealthScore } = params;

    // Logique existante à adapter si nécessaire
    // (Remplacer les références directes par les variables déstructurées)
  }
