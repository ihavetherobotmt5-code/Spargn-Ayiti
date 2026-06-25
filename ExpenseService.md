Expense Service
Overview

ExpenseService centralizes all business logic related to expense archiving.

Its responsibility is to manage the lifecycle of an expense without modifying the existing Expense model or impacting the financial calculation engine.

File
src/services/expenseService.ts

Responsibilities

The service provides three core operations:

Archive an active expense
Restore an archived expense
Permanently delete an archived expense

The service is completely independent from React.

It:

does not use React hooks
does not access LocalStorage
does not manipulate the UI
does not perform exports

Each method returns new immutable collections.

Public API
archive()

Moves an active expense into the archive.

Parameters

expenses: Expense[]
archived: ArchivedExpense[]
expenseId: string
reason: 'user_deleted' | 'correction'

Behaviour

Locate the expense.
Create an ArchivedExpense.
Remove it from active expenses.
Add it to archived expenses.
Return the updated collections.

Return

expenses: Expense[]
archived: ArchivedExpense[]
restore()

Restores an archived expense.

Parameters

expenses: Expense[]
archived: ArchivedExpense[]
archivedId: string

Behaviour

Locate the archived expense.
Restore the original expense.
Remove it from the archive.
Return updated collections.
permanentDelete()

Permanently deletes an archived expense.

Parameters

archived: ArchivedExpense[]
archivedId: string

Behaviour

Removes the archived expense.
Does not affect active expenses.
This action is irreversible.
Design Principles
Immutable Operations

Every method returns new arrays.

No existing object is modified.

Expense Model Preservation

The original Expense interface remains unchanged.

ArchivedExpense simply wraps the original expense while preserving complete backward compatibility.

Financial Engine Compatibility

The Financial Engine only processes active expenses.

Archived expenses are excluded from all calculations.

No existing financial logic needs to be modified.

Separation of Responsibilities

The service is responsible only for business logic.

It never:

updates React state
saves data
loads data
exports files
renders components

Those responsibilities belong to dedicated layers.

Benefits
No breaking changes
Immutable architecture
Easy to test
Predictable business logic
Compatible with the existing Financial Engine
Ready for Undo, Trash and History features
Architecture
ExpenseContext
        │
        ▼
ExpenseService
        │
        ├── archive()
        ├── restore()
        └── permanentDelete()
        │
        ▼
Updated Expense Collections
Sprint 4 Result

ExpenseService introduces a dedicated business layer for managing the lifecycle of expenses while preserving the existing data model and maintaining full compatibility with the application's financial calculations.
