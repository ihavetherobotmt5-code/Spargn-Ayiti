# Prompt Guide

> Why each block exists, which rules are critical, which are optional, and how to modify the prompt without breaking its behavior.

---

## Table of Contents

- [Quick Reference: Criticality Levels](#quick-reference-criticality-levels)
- [Block-by-Block Explanation](#block-by-block-explanation)
- [Modification Recipes](#modification-recipes)
- [Testing Your Modifications](#testing-your-modifications)
- [Common Pitfalls](#common-pitfalls)

---

## Quick Reference: Criticality Levels

Every section in the prompt is marked with one of three criticality levels.

| Marker | Meaning | Can remove? | Can modify? |
|--------|---------|-------------|-------------|
| `[CRITICAL]` | Core behavioral contract. Removing breaks the prompt. | ❌ No | ⚠️ Carefully |
| `[RECOMMENDED]` | Strong default. Remove only with a specific reason. | ⚠️ With testing | ✅ Yes |
| `[OPTIONAL]` | Task-specific. Replace or remove freely. | ✅ Yes | ✅ Yes |

### Critical sections (do not remove)

- Section 1 — Mission
- Section 2.1 — Action-First
- Section 2.2 — Anti-Hallucination
- Section 2.3 — Locality
- Section 2.4 — Confidence-Gated
- Section 2.5 — Behavior-Preserving
- Section 4 — Quality Gates
- Section 5 — Anti-Hallucination Rules
- Section 6 — Locality & Minimality Rules
- Section 10 — Mandatory Rules

### Recommended sections (keep unless you have a reason)

- Section 0 — Identity
- Section 2.6 — Scope-Disciplined
- Section 3 — Execution Protocol
- Section 7 — Output Format
- Section 9 — Termination Rules

### Optional sections (replace or remove freely)

- Section 8 — Patch Format Protocol (required for code tasks, optional otherwise)

---

## Block-by-Block Explanation

### Section 0 — Identity

**Criticality:** `[RECOMMENDED]` (but practically critical)

**Why it exists:** LLMs default to "assistant" posture — helpful, conversational, willing to describe without doing. Section 0 re-frames the model as an **operator** whose success is measured by deliverables.

**What it does:** Establishes three behavioral defaults:
1. You execute, you don't narrate.
2. You produce, you don't speculate.
3. You complete or you explain why completion is impossible.

**What happens if removed:** The model reverts to conversational mode. Action-First (Section 2.1) becomes unenforceable because the model no longer sees itself as an executor.

**How to modify safely:**
- You can change "Senior Software Engineer" to a domain-specific role (e.g., "Senior Data Analyst", "Senior Researcher").
- Do NOT change "You do not narrate" or "You do not speculate" — these are the load-bearing behavioral defaults.

---

### Section 1 — Mission

**Criticality:** `[CRITICAL]`

**Why it exists:** Without an explicit success metric, the model optimizes for verbose, "helpful-looking" output that requires the user to do the implementation work. Section 1 redirects optimization toward **artifact usability**.

**What it does:** Defines success as "the user's ability to use your output without further editing." This single sentence is the anchor for the entire prompt — every other section serves this metric.

**What happens if removed:** The model loses its north star. Output becomes description-heavy, optimization shifts from "usable artifact" to "complete-sounding explanation," and Action-First has no anchor.

**How to modify safely:**
- You can narrow the mission (e.g., "Your mission is to review code and produce applicable Git patches").
- Do NOT broaden the mission to include "educate the user" or "explain your reasoning" — these conflict with Action-First.

---

### Section 2 — Core Operating Principles

**Criticality:** Mixed (see below)

**Why it exists:** Section 2 is the **policy layer**. It defines what the agent must and must not do, independent of any specific task. Without it, the agent has no constraints and reverts to default model behavior.

#### 2.1 Action-First `[CRITICAL]`

**Why it exists:** This is the single most important rule in the prompt. It directly addresses the user's reported weakness: "The agent correctly detects improvements, but often stops after describing them."

**What it does:** Requires every observation to ship with a complete artifact. Forbids description-without-implementation.

**What happens if removed:** The prompt reverts to v1 behavior — findings without patches, observations without implementations.

**How to modify safely:** Do not modify. This rule is the prompt's reason for existing.

#### 2.2 Anti-Hallucination `[CRITICAL]`

**Why it exists:** LLMs frequently fabricate surrounding context lines in Git patches, making `git apply` fail — a failure mode that is invisible until the user tries to apply the patch.

**What it does:** Forbids fabricating code, paths, signatures, or imports. Requires re-reading before producing.

**What happens if removed:** Patches contain fabricated context. `git apply` fails. The user cannot use the output.

**How to modify safely:** Do not weaken. You can strengthen (e.g., add "verify with a tool call if available").

#### 2.3 Locality `[CRITICAL]`

**Why it exists:** LLMs, once "in" a function, tend to "improve" adjacent code, turning 5-line fixes into 50-line diffs that no reviewer wants to read.

**What it does:** Forbids modifying adjacent code for consistency, reformatting, renaming unrelated symbols.

**What happens if removed:** Patches balloon in size. Reviewers reject them. The agent's output becomes low-signal.

**How to modify safely:** You can relax for specific tasks (e.g., "for this task, you may also remove obvious dead code in the same function"). Do not remove globally.

#### 2.4 Confidence-Gated `[CRITICAL]`

**Why it exists:** LLMs ship partial output to "be helpful," producing broken patches and incomplete artifacts.

**What it does:** Requires every output to pass all five Quality Gates (Section 4). Silence is preferable to partial output.

**What happens if removed:** The agent reports uncertain findings. Review noise increases. Trust decreases.

**How to modify safely:** Do not remove. You can adjust the gates in Section 4 if needed.

#### 2.5 Behavior-Preserving `[CRITICAL]`

**Why it exists:** LLMs change behavior while "improving" — e.g., "fixing" a function that wasn't broken, or "optimizing" in a way that changes outputs.

**What it does:** Requires 100% behavior preservation — same outputs, same side effects, same types, same public API.

**What happens if removed:** The agent ships patches that "look right" but break tests. Users lose trust.

**How to modify safely:** For bug-fix tasks, you can explicitly scope this rule to "all behavior EXCEPT the bug being fixed."

#### 2.6 Scope-Disciplined `[RECOMMENDED]`

**Why it exists:** LLMs over-read, exploring unrelated parts of the repository.

**What it does:** Requires reading and modifying only what is necessary.

**What happens if removed:** The agent wastes tokens reading unrelated files. Latency increases. Hallucination risk increases (more unread context to confuse the model).

**How to modify safely:** For exploratory tasks (research, audit), you can relax this to "read broadly, but report only what is relevant."

---

### Section 3 — Execution Protocol

**Criticality:** `[RECOMMENDED]`

**Why it exists:** Without an explicit protocol, the agent's behavior is non-deterministic. Section 3 imposes order: scope before reading, reading before executing, execution before verification, verification before output.

**What it does:** Defines six phases, ordered for fail-fast:
1. Scope Discovery (catch scope errors early)
2. Source Analysis (catch source gaps early)
3. Execution (produce artifact)
4. Quality Gate (verify)
5. Anti-Hallucination Check (re-read)
6. Termination (stop)

**What happens if removed:** The agent still works (the principles in L2 still constrain it), but behavior becomes non-deterministic across tasks.

**How to modify safely:**
- You can add phases (e.g., "Phase 0: Tool Check — verify required tools are available").
- Do NOT reorder existing phases — they are ordered for fail-fast.
- You can remove Phase 5 (Anti-Hallucination Check) if your model has built-in source verification, but this is not recommended.

---

### Section 4 — Quality Gates

**Criticality:** `[CRITICAL]`

**Why it exists:** Section 2.4 says "be confidence-gated," but without an explicit checklist, "confident" is subjective. Section 4 operationalizes confidence as five binary questions.

**What it does:** Defines five gates, each with a clear fail action (omit). Gates are ordered cheapest-to-most-expensive so early failures skip later computation.

**What happens if removed:** The agent reverts to subjective "I think this is fine" reasoning. Outputs that should be omitted get reported.

**How to modify safely:**
- You can add gates (e.g., "Gate 6: Tool Verification — if a verification tool is available, run it").
- Do NOT remove gates — each addresses a specific failure mode.
- You can reorder gates ONLY if you preserve the cheap-to-expensive ordering.

---

### Section 5 — Anti-Hallucination Rules

**Criticality:** `[CRITICAL]`

**Why it exists:** Section 2.2 states the principle; Section 5 provides the operational rules. Without operational rules, "don't hallucinate" is a wish, not a constraint.

**What it does:** Six specific rules targeting the most common hallucination modes:
1. Never fabricate code, paths, signatures, or imports.
2. Never guess file paths.
3. Never invent function signatures or type definitions.
4. Never patch or reference code you did not read.
5. Re-read before producing.
6. If uncertain, omit.

**What happens if removed:** Section 2.2 becomes aspirational. Hallucinations return.

**How to modify safely:** You can add rules (e.g., "7. Never assume a dependency is installed — verify with the package manager"). Do not remove rules.

---

### Section 6 — Locality & Minimality Rules

**Criticality:** `[CRITICAL]`

**Why it exists:** Section 2.3 states the principle; Section 6 provides the operational rules.

**What it does:** A table of forbidden modifications and their reasons.

**What happens if removed:** Section 2.3 becomes aspirational. Scope creep returns.

**How to modify safely:** You can add rows to the table (e.g., "Do not add comments to unrelated lines"). Do not remove rows.

---

### Section 7 — Output Format

**Criticality:** `[RECOMMENDED]` (replaceable)

**Why it exists:** Without a fixed output format, the agent's output structure varies, making it impossible to programmatically parse. Section 7 imposes a stable structure that:
- Is human-readable (GitHub PR review quality)
- Is machine-parseable (each section has a known heading)
- Enforces Action-First (every finding has `#### Artifact`)
- Enforces Anti-Hallucination (every finding has `#### Evidence`)

**What it does:** Defines the Markdown structure: `# Title → ## Executive Summary → ## Findings → ### Finding → #### Summary/Evidence/Root Cause/Proposed Solution/Artifact/Why this is safe/Expected Benefit/Risk → ## Positive Findings → ## Final Assessment`.

**What happens if removed:** Output structure becomes non-deterministic. Programmatic parsing becomes impossible.

**How to modify safely:**
- You can replace Section 7 entirely with a task-specific format. Action-First still applies within the new format.
- You can add sections (e.g., `#### Verification Steps`).
- Do NOT remove `#### Artifact` or `#### Evidence` — these enforce Action-First and Anti-Hallucination.

---

### Section 8 — Patch Format Protocol

**Criticality:** `[REQUIRED for code tasks]`, `[OPTIONAL]` otherwise

**Why it exists:** Without a format spec, LLMs produce diffs that look correct but fail `git apply`.

**What it does:** Specifies the exact Git unified diff format and forbids the problematic patterns (missing headers, fabricated context, placeholders inside hunks, merged hunks).

**What happens if removed (for code tasks):** Patches become non-applicable. `git apply` fails.

**What happens if removed (for non-code tasks):** Nothing. The section is optional.

**How to modify safely:**
- For non-code tasks, remove this section entirely.
- For code tasks with a different VCS (e.g., Mercurial), replace the format spec but keep the "no placeholders" and "accurate context" rules.

---

### Section 9 — Termination Rules

**Criticality:** `[RECOMMENDED]`

**Why it exists:** LLMs have a "be thorough" bias that produces scope creep. Section 9 caps this and normalizes empty output as success.

**What it does:** Five rules:
1. Stop when complete.
2. Do not search for more work.
3. Do not improve beyond scope.
4. If nothing passes gates, return nothing with explanation.
5. Empty output is success when nothing qualifies.

**What happens if removed:** The agent continues past completion. Scope creep. Forced findings to justify continued work.

**How to modify safely:**
- For exploratory tasks, you can relax rule 2 ("do not search for more work").
- Do NOT remove rule 5 — it normalizes empty output, which is critical for Action-First enforcement.

---

### Section 10 — Mandatory Rules

**Criticality:** `[CRITICAL]`

**Why it exists:** Section 10 restates the most important rules in the strongest terms, as the last structural instruction before the agent begins generating. This is a reinforcement layer — the principles are already stated above, but restating them at the end increases adherence.

**What it does:** Eight absolute rules, numbered for reference.

**What happens if removed:** Adherence to the principles above drops slightly. The reinforcement effect is lost.

**How to modify safely:** Do not modify. This section is reinforcement, not new content.

---

### Section 11 — Customization Hooks

**Criticality:** N/A (meta-section)

**Why it exists:** Section 11 makes the criticality levels explicit and tells the user what they can safely modify. Without it, users may remove critical sections by mistake.

**What it does:** Lists critical, recommended, and optional sections, plus common customization patterns.

**How to modify safely:** Update this section whenever you modify the prompt's criticality levels.

---

### Section 12 — Final Rule

**Criticality:** `[CRITICAL]`

**Why it exists:** Resolves the apparent contradiction between "never return an empty review" (from v1) and "silence is preferable to noise" (from v2). Section 12 clarifies: empty = no technical analysis; NOT empty = no patches. A review with zero patches but thorough positive findings is success. A review with observations but no patches is failure.

**What it does:** Defines what "empty" means and confirms the success condition for empty-output cases.

**What happens if removed:** The agent may produce noise to avoid "empty" output, violating Action-First.

**How to modify safely:** Do not modify.

---

## Modification Recipes

### Recipe 1: Adapt for a non-code task

**Goal:** Use the prompt for research or document generation, not code review.

**Steps:**
1. Keep Sections 0–7, 9–12 as-is.
2. Remove Section 8 (Patch Format Protocol).
3. Replace Section 7's `#### Artifact` description with "Complete deliverable document — no placeholders."
4. Update Section 11 to reflect that Section 8 is removed.

**Risk:** LOW. The Action-First principle still applies (artifacts are documents, not patches).

---

### Recipe 2: Adapt for an exploratory task

**Goal:** Use the prompt for an audit or research task where broad reading is required.

**Steps:**
1. Keep all sections.
2. Relax Section 2.6 to: "Read broadly to build context, but report only what is directly relevant to the task."
3. Relax Section 9 rule 2 to: "Continue searching until you have covered the agreed scope, then stop."

**Risk:** MEDIUM. Relaxing scope discipline increases hallucination risk. Re-read Section 5 rules before producing output.

---

### Recipe 3: Adapt for a specific domain

**Goal:** Use the prompt for a specific domain (e.g., data analysis, legal review).

**Steps:**
1. Update Section 0 to reflect the domain role (e.g., "You are a Senior Data Analyst").
2. Update Section 1 to reflect the domain mission (e.g., "Your mission is to produce a verifiable analysis report").
3. Update Section 7's output format to match domain conventions.
4. Keep Sections 2, 4, 5, 6, 9, 10, 12 unchanged.

**Risk:** LOW. The core principles are domain-agnostic.

---

### Recipe 4: Adapt for a weaker model

**Goal:** Use the prompt with a smaller model (<30B parameters) that may not follow all rules.

**Steps:**
1. Keep all sections.
2. Add a reinforcement at the start of Section 10: "These rules are absolute. Violating any rule makes the entire output invalid."
3. Repeat the Action-First rule at the end of Section 12.
4. Consider shortening Sections 5 and 6 to their first sentence each (weaker models handle shorter rules better).

**Risk:** MEDIUM. Weaker models may still ignore rules. Test thoroughly.

---

### Recipe 5: Add a new principle

**Goal:** Add a domain-specific principle (e.g., "Always cite sources for factual claims").

**Steps:**
1. Add the principle to Section 2 as 2.7, with appropriate criticality.
2. Add operational rules to a new Section 6.1 (or extend Section 6).
3. Add a Quality Gate in Section 4 if the principle is enforceable as a binary check.
4. Update Section 11 to reflect the new principle's criticality.

**Risk:** MEDIUM if the new principle conflicts with existing ones. LOW otherwise. Test against the existing test battery in [TESTS.md](TESTS.md).

---

## Testing Your Modifications

After any modification, run the test battery in [TESTS.md](TESTS.md). At minimum:

1. **Run TEST-001 (Simple Task)** — verify the agent still produces an artifact.
2. **Run TEST-007 (Code Task)** — verify the agent still produces an applicable Git patch.
3. **Run TEST-009 (Edge Case: No Findings)** — verify the agent still produces empty output as success.

If any of these tests fail, revert your modification and consult [Common Pitfalls](#common-pitfalls).

---

## Common Pitfalls

### Pitfall 1: Removing Action-First to "let the agent explain"

**Symptom:** The agent produces eloquent descriptions but no artifacts.

**Cause:** Section 2.1 was removed or weakened.

**Fix:** Restore Section 2.1. If you need explanation, add an `#### Explanation` section to Section 7, but do NOT remove the `#### Artifact` requirement.

### Pitfall 2: Relaxing Anti-Hallucination to "let the agent be creative"

**Symptom:** Patches fail `git apply`. References to nonexistent files appear.

**Cause:** Section 2.2 or Section 5 was weakened.

**Fix:** Restore Sections 2.2 and 5. Creativity is for content, not for source code references.

### Pitfall 3: Removing Quality Gates to "speed up the agent"

**Symptom:** The agent reports uncertain findings. Review noise increases.

**Cause:** Section 4 was removed or gates were skipped.

**Fix:** Restore Section 4. The gates are cheap-to-expensive; early failures save computation.

### Pitfall 4: Reordering Execution Phases

**Symptom:** The agent produces output before reading the source, then hallucinates context.

**Cause:** Section 3 phases were reordered.

**Fix:** Restore the original order. Phases are ordered for fail-fast.

### Pitfall 5: Broadening the Mission

**Symptom:** The agent produces educational content instead of artifacts.

**Cause:** Section 1 was broadened to include "educate the user" or "explain reasoning."

**Fix:** Restore the original mission. If explanation is needed, add it to the output format (Section 7), not the mission (Section 1).

### Pitfall 6: Removing the Final Rule

**Symptom:** The agent produces noise to avoid "empty" output.

**Cause:** Section 12 was removed.

**Fix:** Restore Section 12. It resolves the apparent contradiction between "never return empty" and "silence over noise."

---

## Summary

The Agent System Prompt is **modular by design**. Critical sections enforce the core behavioral contract; recommended sections provide strong defaults; optional sections adapt to task type.

When modifying:
1. Check the criticality marker.
2. Consult the block-by-block explanation.
3. Follow the modification recipe if one applies.
4. Run the test battery.
5. Watch for common pitfalls.

If in doubt, **do not modify critical sections**. The prompt is tuned for production use, and the critical sections are load-bearing.
