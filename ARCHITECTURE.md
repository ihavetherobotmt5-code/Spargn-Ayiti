# Architecture

> Layer-by-layer description of the Agent System Prompt, the role of each layer, the dependencies between them, and the logical execution order.

---

## Overview

The Agent System Prompt is organized into **seven layers** (L0–L6) plus a termination layer (L7). Each layer has a single responsibility and depends only on the layers above it.

```
┌─────────────────────────────────────────┐
│  L0  Identity                           │  Who the agent is
├─────────────────────────────────────────┤
│  L1  Mission                            │  What success means
├─────────────────────────────────────────┤
│  L2  Core Operating Principles          │  The five hard rules
├─────────────────────────────────────────┤
│  L3  Execution Protocol                 │  Six-phase workflow
├─────────────────────────────────────────┤
│  L4  Quality Gates                      │  Five-gate filter
├─────────────────────────────────────────┤
│  L5  Output Format                      │  Markdown structure
├─────────────────────────────────────────┤
│  L6  Termination Rules                  │  When to stop
└─────────────────────────────────────────┘
```

The layers form a **strict dependency chain**: each layer assumes the layers above it are present and intact. You can replace or remove lower layers without breaking higher ones, but removing a higher layer invalidates the layers below.

---

## L0 — Identity

**Section in prompt:** Section 0
**Criticality:** `[CRITICAL]`

### Role

Establishes **who the agent is** and the baseline behavioral contract.

L0 sets the agent's posture: a Senior Software Engineer and autonomous task executor who receives a task, executes it, and produces a verifiable deliverable. It explicitly forbids narration, speculation, and description-without-action.

### Why it exists

Without L0, the model defaults to "assistant" posture — helpful, conversational, willing to describe without doing. L0 re-frames the model as an **operator** whose success is measured by deliverables, not explanation.

### Dependencies

- None. L0 is the root layer.

### What breaks if removed

The model reverts to conversational assistant mode. Action-First (L2) becomes unenforceable because the model no longer sees itself as an executor.

---

## L1 — Mission

**Section in prompt:** Section 1
**Criticality:** `[CRITICAL]`

### Role

Defines **what success means**: transforming a user request into a concrete, verifiable, deliverable artifact while preserving existing behavior, respecting scope, and never fabricating information.

L1 also defines the success metric: the user's ability to use the output without further editing.

### Why it exists

Without an explicit success metric, the model optimizes for verbose, "helpful-looking" output that requires the user to do the implementation work. L1 redirects optimization toward **artifact usability**.

### Dependencies

- L0 (Identity) — the mission is meaningless without an executor identity.

### What breaks if removed

The model loses its north star. Output becomes description-heavy, optimization shifts from "usable artifact" to "complete-sounding explanation," and the Action-First principle has no anchor.

---

## L2 — Core Operating Principles

**Section in prompt:** Section 2
**Criticality:** Mixed — see principle-level criticality below

### Role

The five hard rules that govern the agent's behavior at all times.

| Principle | Criticality | Role |
|-----------|-------------|------|
| 2.1 Action-First | `[CRITICAL]` | Every observation ships with an artifact |
| 2.2 Anti-Hallucination | `[CRITICAL]` | Never fabricate; never guess |
| 2.3 Locality | `[CRITICAL]` | Touch only what the task requires |
| 2.4 Confidence-Gated | `[CRITICAL]` | Silence over partial output |
| 2.5 Behavior-Preserving | `[CRITICAL]` | 100% behavior preservation |
| 2.6 Scope-Disciplined | `[RECOMMENDED]` | Read and modify only what is necessary |

### Why it exists

L2 is the **policy layer**. It defines what the agent must and must not do, independent of any specific task. Without L2, the agent has no constraints and reverts to default model behavior.

The five critical principles were chosen because they address the **most common LLM failure modes** in agentic contexts:

- LLMs describe instead of implement → Action-First
- LLMs fabricate context → Anti-Hallucination
- LLMs over-refactor → Locality
- LLMs ship partial output to "be helpful" → Confidence-Gated
- LLMs change behavior while "improving" → Behavior-Preserving

### Dependencies

- L0 (Identity) — principles apply to an executor
- L1 (Mission) — principles serve the mission

### What breaks if removed

Removing any critical principle removes the corresponding behavioral constraint. The model reverts to default behavior for that dimension.

---

## L3 — Execution Protocol

**Section in prompt:** Section 3
**Criticality:** `[RECOMMENDED]`

### Role

Defines the **six-phase workflow** the agent follows for every task:

1. **Scope Discovery** — identify deliverable, input files, scope
2. **Source Analysis** — read minimum files for confidence
3. **Execution** — produce deliverable (Action-First)
4. **Quality Gate** — verify against 5 gates; discard failures
5. **Anti-Hallucination Check** — re-read referenced lines; verify match
6. **Termination** — stop; do not search for more work

### Why it exists

Without an explicit protocol, the agent's behavior is non-deterministic. L3 imposes order: scope before reading, reading before executing, execution before verification, verification before output.

The phases are ordered to **fail fast**: scope errors are caught in Phase 1, source gaps in Phase 2, implementation gaps in Phase 3, quality gaps in Phase 4, hallucination in Phase 5. By the time output is produced (Phase 6), every gate has already passed.

### Dependencies

- L2 (Principles) — the protocol enforces the principles
- L4 (Quality Gates) — Phase 4 invokes the gates
- L5 (Output Format) — Phase 6 produces the output

### What breaks if removed

The agent still works (the principles in L2 still constrain it), but its behavior becomes non-deterministic across tasks. Some tasks will succeed, others will skip verification or produce output before reading the source.

---

## L4 — Quality Gates

**Section in prompt:** Section 4
**Criticality:** `[CRITICAL]`

### Role

The **five-gate filter** every output must pass:

| Gate | Question |
|------|----------|
| 1. Finding Confidence | Is there an observable defect or clear actionable item? |
| 2. Implementation Confidence | Can you produce a complete artifact with 100% certainty? |
| 3. Safety Confidence | Does the output preserve 100% of existing behavior? |
| 4. Context Confidence | Does your output match the source character-for-character? |
| 5. Value Confidence | Is the output clearly more valuable than leaving things unchanged? |

Failure at any gate means the output is omitted.

### Why it exists

L4 is the **enforcement layer**. L2 says "be confident-gated," but without an explicit checklist, "confident" is subjective. L4 operationalizes confidence as five binary questions, each with a clear fail action (omit).

The gates are ordered from cheapest to most expensive:
- Gate 1 (Finding) is a single yes/no.
- Gate 2 (Implementation) requires mental simulation.
- Gate 3 (Safety) requires reasoning about side effects.
- Gate 4 (Context) requires re-reading source.
- Gate 5 (Value) requires comparison against the status quo.

If Gate 1 fails, the agent skips Gates 2–5. This minimizes wasted computation.

### Dependencies

- L2.4 (Confidence-Gated) — the gates are the operationalization
- L3 (Execution Protocol) — Phase 4 invokes the gates

### What breaks if removed

The agent reverts to subjective "I think this is fine" reasoning. Outputs that should be omitted (because they are uncertain, unsafe, or low-value) get reported. Review noise increases.

---

## L5 — Output Format

**Section in prompt:** Section 7
**Criticality:** `[RECOMMENDED]` (replaceable with task-specific format)

### Role

Defines the **Markdown structure** the agent must produce:

```
# [Task Title]
## Executive Summary
## Findings
  ### [Finding Title]
    #### Summary
    #### Evidence
    #### Root Cause
    #### Proposed Solution
    #### Artifact
    #### Why this is safe
    #### Expected Benefit
    #### Risk
## Positive Findings
## Final Assessment
```

### Why it exists

Without a fixed output format, the agent's output structure varies by task and mood, making it impossible to programmatically parse. L5 imposes a stable structure that:

- Is human-readable (GitHub PR review quality)
- Is machine-parseable (each section has a known heading)
- Enforces the Action-First principle (every finding has an `#### Artifact` section)
- Enforces Anti-Hallucination (every finding has `#### Evidence` with quoted source)

### Dependencies

- L2.1 (Action-First) — the `#### Artifact` section enforces it
- L2.2 (Anti-Hallucination) — the `#### Evidence` section enforces it
- L4 (Quality Gates) — the `#### Why this is safe` section references Gate 3

### What breaks if removed

Output structure becomes non-deterministic. The Action-First principle loses its structural enforcement (no guaranteed `#### Artifact` section). Programmatic parsing becomes impossible.

### Replacement

L5 is explicitly designed to be replaced with a task-specific format. When the task specifies its own format, that format replaces L5 — but the Action-First principle still applies: every finding in the task-specific format must include a complete artifact.

---

## L6 — Termination Rules

**Section in prompt:** Section 9
**Criticality:** `[RECOMMENDED]`

### Role

Defines **when the agent stops**:

- Stop as soon as the deliverable is complete and verified.
- Do not search for additional work after completion.
- Do not "improve" beyond scope.
- If no item passes all Quality Gates, return no deliverable and explain why.
- **Returning no deliverable is a fully successful execution when no item qualifies.**

### Why it exists

LLMs have a strong "be thorough" bias that, left unchecked, produces scope creep: the agent finds one issue, then five more, then "while I'm here let me also..." — turning a focused review into an open-ended audit.

L6 caps this. The agent stops when done, not when exhausted. And critically, L6 normalizes **empty output as success**: an agent that finds nothing wrong has succeeded, not failed.

### Dependencies

- L2.6 (Scope-Disciplined) — termination is the ultimate scope discipline
- L4 (Quality Gates) — termination follows gate verification

### What breaks if removed

The agent continues past completion, producing scope creep and review noise. Worse, the agent may "find" issues to justify continued work, violating the Action-First principle (because the findings are forced, not observed).

---

## L7 — Patch Format Protocol (Cross-cutting)

**Section in prompt:** Section 8
**Criticality:** `[REQUIRED for code tasks]`, `[OPTIONAL]` otherwise

### Role

Defines the **Git unified diff format** for code-related artifacts:

- `diff --git` / `index` / `--- a/` / `+++ b/` / `@@` headers
- ≥3 lines of unchanged context before and after each change
- No placeholders inside hunks
- Independently applicable hunks

### Why it exists

Without a format spec, LLMs produce diffs that look correct but fail `git apply` — typically because:
- Missing `diff --git` header
- Missing `@@` hunk header
- Inaccurate context lines (fabricated)
- Placeholders like `...` or `// existing code` inside hunks
- Multiple improvements merged into one hunk

L7 eliminates these failure modes by specifying the exact format and explicitly forbidding the problematic patterns.

### Dependencies

- L2.1 (Action-First) — the patch IS the artifact for code tasks
- L2.2 (Anti-Hallucination) — accurate context lines enforce this
- L5 (Output Format) — the patch goes in the `#### Artifact` section

### What breaks if removed

For non-code tasks: nothing. The section is optional.

For code tasks: patches become non-applicable. `git apply` fails. The Action-First principle is technically satisfied (a patch exists) but practically defeated (the patch cannot be used).

---

## Dependency Graph

```
L0 Identity
  │
  ▼
L1 Mission
  │
  ▼
L2 Core Operating Principles
  │  ├── 2.1 Action-First ──────────┐
  │  ├── 2.2 Anti-Hallucination ────┤
  │  ├── 2.3 Locality ──────────────┤
  │  ├── 2.4 Confidence-Gated ──────┤
  │  ├── 2.5 Behavior-Preserving ───┤
  │  └── 2.6 Scope-Disciplined ─────┤
  │                                 │
  ▼                                 │
L3 Execution Protocol               │
  │                                 │
  ├── Phase 4 invokes ──► L4 Quality Gates
  │                       (depends on 2.4)
  │                                 │
  └── Phase 6 invokes ──► L5 Output Format
                          (depends on 2.1, 2.2)
                                 │
                                 ▼
                          L7 Patch Format Protocol
                          (depends on 2.1, 2.2, L5)
                                 │
                                 ▼
                          L6 Termination Rules
                          (depends on 2.6, L4)
```

---

## Execution Order

The logical execution order for a single task:

```
1. L0 Identity       → "I am an executor."
2. L1 Mission        → "I produce verifiable artifacts."
3. L2 Principles     → "I follow five hard rules."
4. L3 Phase 1        → Scope Discovery
5. L3 Phase 2        → Source Analysis
6. L3 Phase 3        → Execution (produce artifact)
7. L3 Phase 4        → Quality Gate (L4)
8. L3 Phase 5        → Anti-Hallucination Check (L2.2)
9. L3 Phase 6        → Termination (L6)
10. L5 Output Format → Final Markdown document
11. L7 Patch Format  → (if code task) Git diff in Artifact section
```

Note: L5 and L7 are **cross-cutting** — they are not "executed" in a phase, but rather constrain the format of the output produced in Phase 3 and finalized in Phase 6.

---

## Modification Strategy

Because layers form a strict dependency chain, modifications should follow these rules:

| Modification | Safe? | Notes |
|--------------|-------|-------|
| Replace L5 (Output Format) with task-specific format | ✅ Safe | Action-First still applies within the new format |
| Remove L7 (Patch Format) for non-code tasks | ✅ Safe | Section is explicitly optional |
| Relax L2.6 (Scope-Disciplined) for exploratory tasks | ✅ Safe | Mark as `[RECOMMENDED]` already |
| Add a new principle to L2 | ✅ Safe if it doesn't conflict | Test against existing principles |
| Remove L2.1 (Action-First) | ❌ Breaks the prompt | Core principle — do not remove |
| Remove L4 (Quality Gates) | ❌ Breaks the prompt | Enforcement layer for L2.4 |
| Reorder L3 phases | ❌ Breaks the prompt | Phases are ordered for fail-fast |
| Remove L0 (Identity) | ❌ Breaks the prompt | Root layer — everything depends on it |

For the full modification guide, see [PROMPT_GUIDE.md](PROMPT_GUIDE.md).

---

## Summary

The Agent System Prompt is a **layered, dependency-ordered** system prompt. Each layer has one job, depends only on layers above it, and can be customized (within limits) without breaking the whole.

The seven layers enforce a single behavioral contract: **the agent ships artifacts, not descriptions, and every artifact is verifiable against the source.**
