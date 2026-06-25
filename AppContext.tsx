# Sprint 4 - AppContext Extension

## Objective

Extend `AppContext` with support for archived expenses while preserving complete backward compatibility.

---

## Minimal Changes

### Import

```typescript
import type { ArchivedExpense } from '../types';
```

### AppState

```typescript
interface AppState {
  // Existing active expenses
  expenses: Expense[];

  // NEW: Archived expenses
  archivedExpenses: ArchivedExpense[];

  // ...existing state
}
```

### State

```typescript
const [archivedExpenses, setArchivedExpenses] = useState<ArchivedExpense[]>([]);
```

### Context Value

```typescript
const value = {
  ...

  expenses,
  archivedExpenses,

  setExpenses,
  setArchivedExpenses,

  ...
};
```

### FinancialEngine

**No changes are required.**

The financial engine continues to use only active expenses.

```typescript
const financialData = {
  totalSaved: calculateTotalSaved(expenses, incomes),
  healthScore: calculateFinancialHealthScore(expenses, incomes),

  // All existing calculations remain unchanged
};
```

---

## Design Rationale

- `Expense` remains unchanged.
- `FinancialEngine` ignores archived expenses.
- Existing business logic continues to operate exactly as before.
- No breaking changes are introduced.
- Archived expenses are managed independently.
- Future migrations remain simple and maintainable.

---

## Result

```
AppContext
├── expenses (active)
├── archivedExpenses (new)
├── incomes
├── goals
├── budgets
└── FinancialEngine
      └── Uses only active expenses
```
