Expense History Service
Overview

ExpenseHistoryService centralizes all operations related to archived expense history.

Its purpose is to provide filtering, searching and sorting capabilities while keeping the original archived data immutable.

This service contains no UI logic, no React dependency and no persistence layer.

File

src/services/expenseHistoryService.ts

Responsibilities

The service provides four core operations:

Filter archived expenses by archive reason
Search archived expenses
Sort archived expenses
Apply multiple filters simultaneously

All operations return new immutable collections.

Public API
filterByReason()

Returns archived expenses matching a specific archive reason.

Parameters

archived: ArchivedExpense[]
reason: 'user_deleted' | 'correction' | 'all'

Behaviour

Returns all archived expenses when the reason is all
Otherwise filters by the selected archive reason
Does not modify the original collection
search()

Searches archived expenses using a text query.

Parameters

archived: ArchivedExpense[]
query: string

Behaviour

The search is case-insensitive and checks:

Expense description
Expense category

If the search query is empty, the original collection is returned unchanged.

sort()

Sorts archived expenses according to the selected field.

Parameters

archived: ArchivedExpense[]
sortBy
date
amount
category
description
order
asc
desc

Supported sorting

Expense date
Expense amount
Expense category
Expense description

The original array is never modified.

Bug Fix

A typo in the comparison variable has been corrected.

Previous implementation:

comparation

Correct implementation:

comparison

This ensures proper sorting behavior and improves code readability.

applyFilters()

Applies multiple filters in a single operation.

Supported options

Archive reason
Search query
Sort field
Sort order

Filters are executed in the following order:

Archive reason
Search
Sorting

This guarantees predictable and consistent results.

Design Principles
Immutable Operations

Every method returns a new collection.

The original archived expenses are never modified.

Pure Business Logic

The service contains only business logic.

It does not:

access LocalStorage
update React state
render components
communicate with external services
Reusable

The service can be used by:

Expense History page
Trash view
Search dialog
Export features
Future reporting modules
Benefits
Centralized filtering logic
Reusable search engine
Consistent sorting behavior
Immutable operations
Easy unit testing
No UI dependency
No breaking changes
Architecture
Archived Expenses
        │
        ▼
ExpenseHistoryService
        │
        ├── filterByReason()
        ├── search()
        ├── sort()
        └── applyFilters()
        │
        ▼
Filtered & Sorted Results
ExpenseHistoryService introduces a dedicated layer for managing archived expense history. It provides efficient filtering, searching and sorting while preserving immutability, maintaining compatibility with the existing application architecture and fixing the previous sorting implementation bug.
