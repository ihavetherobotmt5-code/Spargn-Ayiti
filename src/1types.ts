// ============================================================================
// Sprint 4 - Archived Expense Types
// NOTE:
// Do NOT modify the existing Expense interface.
// ArchivedExpense extends the application without introducing breaking changes.
// ============================================================================

export type ArchiveReason = 'user_deleted' | 'correction';

export interface ArchivedExpense {
  /**
   * Same identifier as the original expense.
   */
  id: string;

  /**
   * Original expense object.
   * The Expense model remains unchanged.
   */
  expense: Expense;

  /**
   * Date when the expense was archived.
   */
  archivedAt: Date;

  /**
   * Reason for archiving.
   */
  reason: ArchiveReason;
}
