## `src/services/financialAnalyzer.ts`

### Magic Number Elimination

#### Objective

Replace hard-coded numeric values ("magic numbers") with clearly named constants to improve readability and maintainability.

#### Changes Made

Created a centralized `FINANCIAL_CONSTANTS` object containing all financial thresholds used throughout the service.

**Before**

```typescript
if (score.breakdown[p.key] >= 70)
if (analysis.expenseRatio > 80)
```

**After**

```typescript
export const FINANCIAL_CONSTANTS = {
  /** Minimum score to be considered a strength */
  STRENGTH_THRESHOLD: 70,

  /** Expense ratio above which a warning is issued */
  HIGH_EXPENSE_RATIO_THRESHOLD: 80,

  /** Minimum saving rate to avoid warnings */
  MIN_SAVING_RATE_THRESHOLD: 10,

  /** Target months of expenses for emergency fund */
  EMERGENCY_FUND_TARGET_MONTHS: 3,

  /** Minimum emergency fund amount when no spending data exists */
  EMERGENCY_FUND_FLOOR_HTG: 5000,

  /** Maximum utilization percent to cap envelope calculations */
  MAX_UTILIZATION_PERCENT: 200,

  /** Days remaining threshold for goal behind schedule warning */
  GOAL_DAYS_REMAINING_WARNING: 30,
} as const;

if (
  score.breakdown[p.key] >=
  FINANCIAL_CONSTANTS.STRENGTH_THRESHOLD
)

if (
  analysis.expenseRatio >
  FINANCIAL_CONSTANTS.HIGH_EXPENSE_RATIO_THRESHOLD
)
```

#### Benefits

* Eliminates magic numbers.
* Makes business rules self-documenting.
* Simplifies future updates.
* Reduces maintenance effort.

---

### JSDoc Documentation

#### Objective

Improve developer experience by documenting exported functions.

#### Changes Made

Added JSDoc comments to all exported functions.

**Before**

```typescript
export function calculateTotalIncomeHTG(
  snapshot: FinancialSnapshot
): number {
```

**After**

```typescript
/**
 * Calculates the total income converted to HTG.
 *
 * @param snapshot Financial data snapshot.
 * @returns Total income in HTG.
 */
export function calculateTotalIncomeHTG(
  snapshot: FinancialSnapshot
): number {
```

#### Benefits

* Better IDE autocompletion.
* Improved API documentation.
* Easier onboarding for new contributors.

---

### Nullish Coalescing (`??`)

#### Objective

Improve null safety by replacing logical OR (`||`) with nullish coalescing (`??`) where appropriate.

**Before**

```typescript
const list = snapshot.contributions[g.id] || [];
```

**After**

```typescript
const list = snapshot.contributions[g.id] ?? [];
```

#### Benefits

* Correctly distinguishes `null` and `undefined` from valid falsy values.
* Reduces subtle bugs.
* Improves code robustness.

---

## Testing

A new test suite was added:

```text
tests/financialAnalyzer.test.ts
```

The following scenarios are covered:

* No income.
* Single envelope.
* No envelopes.
* Goal already achieved.
* Very large financial amounts.
* User saving 100% of their income.

---

## Conclusion

Sprint 3 focused exclusively on improving the internal quality of the codebase without modifying application behavior.

The refactoring achieved the following objectives:

* Reduced duplicated code.
* Improved readability.
* Centralized configuration values.
* Increased null safety.
* Added comprehensive documentation.
* Expanded automated test coverage.
* Prepared the project for future development in Sprint 4.

Overall, the codebase is now cleaner, more maintainable, and easier to extend.
