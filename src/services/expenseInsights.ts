// src/services/expenseInsights.ts

import { ArchivedExpense, Expense } from '../types';

/**
 * Service de statistiques pour les dépenses archivées.
 * Utilisé par Pyas pour fournir des insights sur l'historique.
 * INDÉPENDANT de React Context.
 */
export const expenseInsights = {
  /**
   * Calcule le nombre total de dépenses archivées.
   */
  getArchiveCount(archivedExpenses: ArchivedExpense[]): number {
    return archivedExpenses.length;
  },

  /**
   * Calcule le montant total des dépenses archivées.
   */
  getArchivedAmount(archivedExpenses: ArchivedExpense[]): number {
    return archivedExpenses.reduce((sum, a) => sum + a.expense.amount, 0);
  },

  /**
   * Calcule le nombre de dépenses archivées ce mois-ci.
   */
  getArchivedThisMonth(archivedExpenses: ArchivedExpense[]): number {
    const now = new Date();
    return archivedExpenses.filter((a) => {
      return (
        a.archivedAt.getMonth() === now.getMonth() &&
        a.archivedAt.getFullYear() === now.getFullYear()
      );
    }).length;
  },

  /**
   * Calcule le nombre de dépenses archivées cette semaine.
   */
  getArchivedThisWeek(archivedExpenses: ArchivedExpense[]): number {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return archivedExpenses.filter((a) => a.archivedAt >= weekAgo).length;
  },

  /**
   * Calcule le montant moyen des dépenses archivées.
   */
  getAverageArchivedAmount(archivedExpenses: ArchivedExpense[]): number {
    if (archivedExpenses.length === 0) return 0;
    return this.getArchivedAmount(archivedExpenses) / archivedExpenses.length;
  },

  /**
   * Retourne la catégorie la plus archivée.
   */
  getTopArchivedCategory(archivedExpenses: ArchivedExpense[]): string {
    if (archivedExpenses.length === 0) return 'Aucune';

    const categoryCounts: Record<string, number> = {};
    archivedExpenses.forEach((a) => {
      const category = a.expense.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0];
  },

  /**
   * Retourne les dépenses archivées par catégorie.
   */
  getArchivedByCategory(archivedExpenses: ArchivedExpense[]): Record<string, number> {
    const byCategory: Record<string, number> = {};
    archivedExpenses.forEach((a) => {
      const category = a.expense.category;
      byCategory[category] = (byCategory[category] || 0) + 1;
    });
    return byCategory;
  },

  /**
   * Retourne les dépenses archivées par raison.
   */
  getArchivedByReason(archivedExpenses: ArchivedExpense[]): Record<string, number> {
    const byReason: Record<string, number> = {};
    archivedExpenses.forEach((a) => {
      const reason = a.reason;
      byReason[reason] = (byReason[reason] || 0) + 1;
    });
    return byReason;
  },

  /**
   * Génère un message d'insight pour Pyas.
   */
  generateInsightMessage(archivedExpenses: ArchivedExpense[]): string | null {
    const count = this.getArchiveCount(archivedExpenses);
    if (count === 0) return null;

    const thisMonth = this.getArchivedThisMonth(archivedExpenses);
    const totalAmount = this.getArchivedAmount(archivedExpenses);
    const topCategory = this.getTopArchivedCategory(archivedExpenses);

    const messages = [
      `Vous avez archivé ${count} dépenses au total (${totalAmount.toLocaleString('fr-HA')} HTG).`,
      `Ce mois-ci, vous avez archivé ${thisMonth} dépenses.`,
      `La catégorie la plus archivée est "${topCategory}".`,
      `Le montant moyen des dépenses archivées est ${Math.round(this.getAverageArchivedAmount(archivedExpenses)).toLocaleString('fr-HA')} HTG.`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  },
};
