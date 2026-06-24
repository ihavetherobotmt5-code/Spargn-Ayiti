# Examples

> A gallery of bad and good prompts, plus concrete use cases for the Agent System Prompt across simple, advanced, software, research, and autonomous agent scenarios.

---

## Table of Contents

- [Bad vs Good Prompts](#bad-vs-good-prompts)
- [Agent Profiles](#agent-profiles)
  - [Simple Agent](#simple-agent)
  - [Advanced Agent](#advanced-agent)
  - [Software Agent](#software-agent)
  - [Research Agent](#research-agent)
  - [Autonomous Agent](#autonomous-agent)

---

## Bad vs Good Prompts

### ❌ Bad Prompt — Vague

```
You are a helpful assistant. Review the code and tell me what you think.
```

**Why it's bad:**
- No role definition (assistant ≠ executor).
- No success metric ("what you think" is not measurable).
- No enforcement of action over description.
- No anti-hallucination rules.
- No output format.
- Result: eloquent narration, no usable artifacts.

---

### ❌ Bad Prompt — Over-constrained

```
You are a code reviewer. Follow these 47 rules exactly:
1. Read every file in the repository.
2. Check every function for cyclomatic complexity > 10.
3. Check every import for circular dependencies.
4. Check every type annotation for correctness.
5. ... [42 more rules]
```

**Why it's bad:**
- Rigid script that breaks on edge cases.
- No priority ordering (all 47 rules are "equal").
- No escape hatch (no "if uncertain, omit").
- Encourages the agent to find issues to satisfy the rules, rather than to find real issues.
- Result: noisy output, forced findings, scope creep.

---

### ❌ Bad Prompt — Under-constrained

```
Review this code and improve it.
```

**Why it's bad:**
- No definition of "improve."
- No requirement to produce artifacts.
- No anti-hallucination rules.
- No locality rule (agent will rewrite everything).
- Result: massive diff, broken behavior, no usable patches.

---

### ✅ Good Prompt — The Agent System Prompt

Use [`agent-system-prompt.md`](agent-system-prompt.md) as-is. It defines:
- Role (executor, not assistant).
- Mission (verifiable artifact).
- Five hard principles (Action-First, Anti-Hallucination, Locality, Confidence-Gated, Behavior-Preserving).
- Six-phase execution protocol.
- Five Quality Gates.
- Strict output format.
- Termination rules.

---

## Agent Profiles

The Agent System Prompt is task-agnostic. Below are five concrete profiles that use the same prompt with different user messages.

---

### Simple Agent

**Use case:** Single-task execution with one clear deliverable.

**Setup:**
- System prompt: `agent-system-prompt.md` (unmodified).
- User message: a single, well-scoped task.

**Example user message:**
```
Review this function and produce a Git patch for any defect:

```ts
export function divide(a: number, b: number): number {
  return a / b;
}
```
```

**Expected agent behavior:**
1. Phase 1 (Scope): identify the function, the deliverable (patch), and scope (one function).
2. Phase 2 (Source): read the function.
3. Phase 3 (Execution): identify the divide-by-zero defect, produce a patch.
4. Phase 4 (Quality Gate): verify the patch is safe (preserves behavior for `b !== 0`).
5. Phase 5 (Anti-Hallucination): re-read the function to confirm patch context.
6. Phase 6 (Termination): produce output, stop.

**Expected output (abridged):**

```markdown
# Code Review

## Executive Summary

- Number of items: 1
- Overall assessment: One defect found (divide-by-zero). Low-risk patch provided.

## Findings

### Add divide-by-zero guard to `divide` function

#### Summary
The `divide` function does not guard against `b === 0`, producing `Infinity` instead of a meaningful error. The patch adds a guard that throws a `RangeError`.

#### Evidence
**File:** `src/math.ts`
**Function:** `divide`
**Observed code:**
```ts
export function divide(a: number, b: number): number {
  return a / b;
}
```

#### Root Cause
The function was written for the happy path only. No input validation was added because the original use case guaranteed `b !== 0`, but the function is now called from untrusted input paths.

#### Proposed Solution
Add an early-return guard that throws a `RangeError` when `b === 0`. This matches the behavior of `JSON.parse` and other standard-library functions that throw on invalid input.

#### Artifact
```diff
diff --git a/src/math.ts b/src/math.ts
index 0000000..1111111 100644
--- a/src/math.ts
+++ b/src/math.ts
@@ -1,3 +1,6 @@
 export function divide(a: number, b: number): number {
+  if (b === 0) {
+    throw new RangeError('Cannot divide by zero');
+  }
   return a / b;
 }
```

#### Why this is safe
- For `b !== 0`: behavior is identical (same return value, same type).
- For `b === 0`: previously returned `Infinity`, now throws. This is a deliberate behavior change to prevent silent failures.
- No caller relies on the `Infinity` return value (verified by reading the 2 call sites in `src/calc.ts`).

#### Expected Benefit
Prevents silent `Infinity` propagation in 2 call sites. Converts a silent failure mode into a loud one.

#### Risk
LOW
```

---

### Advanced Agent

**Use case:** Multi-step task with explicit termination criteria.

**Setup:**
- System prompt: `agent-system-prompt.md` (unmodified).
- User message: a multi-step task with a cap on findings.

**Example user message:**
```
Review the attached Sprint 3 patch (5 files modified). Identify AT MOST 3 improvements
that satisfy the Quality Gates. Do not search for additional work after 3 findings.

[sprint3.patch]
```

**Expected agent behavior:**
1. Phase 1: identify the 5 files, the cap (3 findings), the deliverable.
2. Phase 2: read all 5 files (necessary because the patch is the scope).
3. Phase 3: identify candidate improvements.
4. Phase 4: filter through Quality Gates; keep only those that pass all 5 gates.
5. Phase 5: rank by value (correctness > bug prevention > robustness > ...).
6. Phase 6: produce top 3, stop. Do not mention "other improvements were found but omitted."

**Expected output structure:**
- `# Sprint 3 Code Review`
- `## Executive Summary` — notes the 3-finding cap was respected.
- `## Findings` — exactly 3 findings, each with complete patch.
- `## Positive Findings` — praise for good implementation decisions.
- `## Final Assessment` — verdict.

**Key behavior verified:**
- Termination Rule: stops at 3 findings even if more qualify.
- Locality: each patch touches only the lines required.
- Action-First: every finding has a complete `diff --git` block.

---

### Software Agent

**Use case:** Code review with applicable Git patches.

**Setup:**
- System prompt: `agent-system-prompt.md` (unmodified).
- User message: a code review task.

**Example user message:**
```
Review the following Pull Request and produce a GitHub PR review document.
Every improvement must include a complete, `git apply`-ready patch.

Files changed:
- src/contexts/AppContext.tsx (centralized state)
- src/pages/Dashboard.tsx (consumed centralized state)
- src/components/PyasChatbot.tsx (consumed centralized state)
- src/pages/GoalDetail.tsx (consumed centralized state)

[diff contents]
```

**Expected agent behavior:**
1. Phase 1: identify the 4 files, the deliverable (PR review), the scope.
2. Phase 2: read the diff. If a finding requires understanding imports, read the imported file.
3. Phase 3: identify improvements (e.g., redundant `localStorage.removeItem` calls, duplicated currency-conversion pattern).
4. Phase 4: filter through Quality Gates.
5. Phase 5: re-read exact lines referenced in each patch.
6. Phase 6: produce review, stop.

**Expected output characteristics:**
- Every finding has a `diff --git` block.
- Patches are independently applicable.
- Patches have ≥3 context lines.
- No placeholders inside hunks.
- Each finding has Evidence, Root Cause, Proposed Solution, Patch, Why this is safe, Expected Benefit, Risk.
- Final Assessment is one of: ✅ Ready / ⚠ Apply Suggested Changes / ❌ Changes Required.

**Key behavior verified:**
- Patch Format Protocol: every patch is `git apply`-ready.
- Anti-Hallucination: context lines match the actual diff.
- Locality: no "while I'm here" refactoring.

---

### Research Agent

**Use case:** Source-grounded synthesis without fabrication.

**Setup:**
- System prompt: `agent-system-prompt.md` with Section 8 (Patch Format Protocol) removed.
- User message: a research task with provided sources.

**Customization (per PROMPT_GUIDE.md Recipe 1):**
```
[Load agent-system-prompt.md]
[Remove Section 8 — Patch Format Protocol]
[Update Section 11 to reflect that Section 8 is removed]
```

**Example user message:**
```
Read the following 3 articles and synthesize a 500-word summary.
Cite each claim with [Article N]. Do not invent claims not present in the sources.

[Article 1: ...]
[Article 2: ...]
[Article 3: ...]
```

**Expected agent behavior:**
1. Phase 1: identify the 3 sources, the deliverable (500-word summary), the citation format.
2. Phase 2: read all 3 sources.
3. Phase 3: synthesize, citing each claim.
4. Phase 4: Quality Gate — verify every claim is sourced.
5. Phase 5: re-read sources to confirm citations are accurate.
6. Phase 6: produce summary, stop.

**Expected output characteristics:**
- Every claim has a `[Article N]` citation.
- No claim appears that isn't in the sources.
- Summary is approximately 500 words.
- Summary is structured (not a wall of text).

**Key behavior verified:**
- Anti-Hallucination: no fabricated claims.
- Action-First: the summary IS the artifact (no "I would summarize..." preamble).
- Termination: stops at 500 words, does not pad.

---

### Autonomous Agent

**Use case:** Open-ended task with scope discipline.

**Setup:**
- System prompt: `agent-system-prompt.md` (unmodified).
- User message: an open-ended task with a defined deliverable.

**Example user message:**
```
Audit the authentication module in src/auth/ for security issues.
Produce a report with applicable patches for any issue found.
Stop when you have covered all files in src/auth/ or when 5 issues have been reported,
whichever comes first.
```

**Expected agent behavior:**
1. Phase 1: identify the scope (`src/auth/`), the deliverable (report + patches), the termination condition (all files OR 5 issues).
2. Phase 2: list files in `src/auth/`, read each.
3. Phase 3: for each file, identify security issues. Produce patches.
4. Phase 4: Quality Gate each finding.
5. Phase 5: re-read lines referenced in each patch.
6. Phase 6: stop when termination condition is met.

**Expected output characteristics:**
- Findings cover files in `src/auth/` only (no scope creep).
- Each finding has a complete patch.
- If 5 issues are found, the report stops at 5 (Termination Rule).
- If fewer than 5 issues are found across all files, the report covers all files.
- Final Assessment includes a coverage statement ("Reviewed N files in src/auth/").

**Key behavior verified:**
- Scope-Disciplined: does not explore outside `src/auth/`.
- Termination: stops at 5 findings or when all files are reviewed.
- Action-First: every security issue has a patch.

---

## Comparison Table

| Profile | System Prompt | User Message | Output | Termination |
|---------|---------------|--------------|--------|-------------|
| Simple | Unmodified | Single task | One finding + patch | Task complete |
| Advanced | Unmodified | Multi-step with cap | N findings (N ≤ cap) | Cap reached or no more findings |
| Software | Unmodified | Code review | PR review document | All files reviewed |
| Research | Section 8 removed | Synthesis task | Cited summary | Source coverage complete |
| Autonomous | Unmodified | Open-ended audit | Report + patches | Scope covered OR finding cap reached |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1 — Removing Action-First for "flexibility"

```
"You may produce a patch OR a description, whichever you prefer."
```

**Why it fails:** The agent will almost always choose description (it's easier). The output becomes useless.

**Fix:** Keep Action-First. If you need explanation, add an `#### Explanation` section to the output format.

### Anti-Pattern 2 — Removing Quality Gates for "speed"

```
"Skip verification. Just produce findings as fast as possible."
```

**Why it fails:** The agent produces hallucinated findings and broken patches. "Speed" is illusory because the user must verify everything.

**Fix:** Keep Quality Gates. If latency is an issue, use a faster model, not fewer gates.

### Anti-Pattern 3 — Removing Termination Rules for "thoroughness"

```
"Find every possible issue, no matter how small."
```

**Why it fails:** The agent produces 50+ findings, most of which are noise. The user cannot act on the output.

**Fix:** Keep Termination Rules. Set a finding cap in the user message if needed.

### Anti-Pattern 4 — Removing Anti-Hallucination for "creativity"

```
"You may infer file contents from context."
```

**Why it fails:** The agent fabricates imports, signatures, and context. Patches fail `git apply`.

**Fix:** Keep Anti-Hallucination. Creativity is for content, not for source code references.

### Anti-Pattern 5 — Removing Locality for "completeness"

```
"While you're fixing this, also clean up the surrounding code."
```

**Why it fails:** The agent rewrites the entire file. Reviewers reject the PR. The fix is buried in noise.

**Fix:** Keep Locality. If cleanup is needed, file a separate task.

---

## Building Your Own Profile

To create a custom agent profile:

1. **Start with the unmodified prompt.** Do not customize until you have a specific reason.
2. **Identify the task type.** Is it code? Research? Audit? Generation?
3. **Identify the deliverable.** Patch? Document? Report? Module?
4. **Identify the termination condition.** When should the agent stop?
5. **Identify the scope.** What files/sources should the agent read?
6. **Write the user message.** Be specific about deliverable, termination, and scope.
7. **If needed, customize the prompt** per [PROMPT_GUIDE.md → Modification Recipes](PROMPT_GUIDE.md#modification-recipes).
8. **Test with the test battery** in [TESTS.md](TESTS.md).

---

## Real-World Example — Sprint Code Review

This is the original use case that motivated the Agent System Prompt.

**System prompt:** `agent-system-prompt.md` (unmodified).

**User message:**
```
You are reviewing Sprint 2 of the Continuite Sparn Ayiti project.
Sprint 2 is functionally complete and stable. The burden of proof is on you.
Review the attached patch and produce a GitHub PR review document.
Every improvement must include a complete, `git apply`-ready patch.
Returning no patch is a fully successful review if no improvement satisfies
the Quality Gates.

[sprint2_patch.diff]
```

**Expected output:**
- `# Sprint 2 Code Review`
- `## Executive Summary` — N critical issues, M optional improvements.
- `## Critical Issues` — if any, each with complete patch.
- `## Optional Improvements` — if any, each with complete patch.
- `## Positive Findings` — praise for good implementation decisions.
- `## Final Assessment` — ✅ Ready / ⚠ Apply Suggested Changes / ❌ Changes Required.

This is the profile used to develop and test the prompt. It is the canonical example of a Software Agent profile.
