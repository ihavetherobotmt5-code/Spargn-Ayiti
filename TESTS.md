# Test Battery

> A comprehensive test suite for verifying that the Agent System Prompt produces correct, actionable, behavior-preserving output across task dimensions.

---

## Table of Contents

- [How to Use This Document](#how-to-use-this-document)
- [Test Categories](#test-categories)
- [Simple Tasks](#simple-tasks)
- [Complex Tasks](#complex-tasks)
- [Reasoning](#reasoning)
- [Navigation](#navigation)
- [Search](#search)
- [Code](#code)
- [Multi-File](#multi-file)
- [Long Conversations](#long-conversations)
- [Edge Cases](#edge-cases)
- [Running the Battery](#running-the-battery)

---

## How to Use This Document

Each test follows this structure:

```
### TEST-XXX — [Name]

**Category:** Simple | Complex | Reasoning | Navigation | Search | Code | Multi-File | Long Conversation | Edge Case

**Input:**
The exact user message to send to the agent.

**Expected Behavior:**
What the agent should do, step by step.

**Success Criteria:**
Binary checks. ALL must pass for the test to succeed.

**Failure Mode:**
What a failure looks like and what it typically indicates.
```

To run a test:
1. Load `agent-system-prompt.md` as the system prompt.
2. Send the test's **Input** as the user message.
3. Verify the output against the **Success Criteria**.

---

## Test Categories

| Category | What it tests | Tests |
|----------|---------------|-------|
| Simple Tasks | Basic artifact production | TEST-001, TEST-002 |
| Complex Tasks | Multi-step execution with termination | TEST-003, TEST-004 |
| Reasoning | Root cause analysis without fabrication | TEST-005, TEST-006 |
| Navigation | Scope discipline, file reading | TEST-007, TEST-008 |
| Search | Source-grounded synthesis | TEST-009, TEST-010 |
| Code | Git patch production and applicability | TEST-011, TEST-012, TEST-013 |
| Multi-File | Cross-file patches with independent hunks | TEST-014, TEST-015 |
| Long Conversations | Scope maintenance across turns | TEST-016, TEST-017 |
| Edge Cases | Empty output, malformed input, contradictions | TEST-018, TEST-019, TEST-020 |

---

## Simple Tasks

### TEST-001 — Single finding with patch

**Category:** Simple

**Input:**
```
Review this code:

function add(a, b) {
  return a - b;
}
```

**Expected Behavior:**
1. Agent identifies the bug (`-` instead of `+`).
2. Agent produces a Git patch fixing the bug.
3. Agent includes Evidence, Root Cause, Proposed Solution, Patch, Why this is safe, Expected Benefit, Risk.

**Success Criteria:**
- [ ] Output contains `## Findings` section.
- [ ] Finding has `#### Artifact` section.
- [ ] Artifact contains a `diff --git` block.
- [ ] Patch replaces `return a - b;` with `return a + b;`.
- [ ] Patch has at least 3 context lines before and after the change.
- [ ] Patch has no placeholders (`...`, `// existing code`).
- [ ] Risk field is `LOW`.
- [ ] Output ends with `## Final Assessment` and a verdict.

**Failure Mode:** Agent describes the bug without producing a patch. Indicates Action-First violation.

---

### TEST-002 — No findings (clean code)

**Category:** Simple

**Input:**
```
Review this code:

function add(a: number, b: number): number {
  return a + b;
}
```

**Expected Behavior:**
1. Agent reads the code.
2. Agent identifies no defects.
3. Agent produces `✅ Ready` verdict with positive findings.

**Success Criteria:**
- [ ] Output contains `## Findings` section.
- [ ] Findings section states no qualifying issues.
- [ ] Output contains `## Positive Findings` section with at least one item.
- [ ] Final Assessment is `✅ Ready`.
- [ ] No fabricated findings.

**Failure Mode:** Agent invents issues to "be thorough." Indicates Termination Rule violation.

---

## Complex Tasks

### TEST-003 — Multi-finding with prioritization

**Category:** Complex

**Input:**
```
Review this code:

function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}

function calculateTotal2(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}

function calculateTotal3(items) {
  let t = 0;
  for (let i = 0; i < items.length; i++) {
    t = t + items[i].price;
  }
  return t;
}
```

**Expected Behavior:**
1. Agent identifies the duplication (3 identical functions).
2. Agent produces ONE patch that consolidates the duplication.
3. Agent does not produce separate patches for each function.

**Success Criteria:**
- [ ] Output contains exactly one finding (deduplication).
- [ ] Patch removes `calculateTotal2` and `calculateTotal3`.
- [ ] Patch keeps `calculateTotal` as the canonical implementation.
- [ ] Patch is applicable with `git apply`.
- [ ] Risk field is `LOW` or `MEDIUM`.
- [ ] No separate "rename" or "reformat" findings.

**Failure Mode:** Agent produces 3+ findings (one per function). Indicates scope creep.

---

### TEST-004 — Task with explicit termination

**Category:** Complex

**Input:**
```
Review this code and identify AT MOST 2 improvements:

[large code sample with 5+ potential improvements]
```

**Expected Behavior:**
1. Agent reads the code.
2. Agent selects the 2 highest-value improvements.
3. Agent stops after 2 findings, even if more exist.
4. Agent does NOT mention "other improvements were found but omitted."

**Success Criteria:**
- [ ] Output contains exactly 2 findings (or fewer, if not all qualify).
- [ ] Each finding has a complete patch.
- [ ] Output does not mention "additional improvements exist."
- [ ] Final Assessment is one of the three verdicts.

**Failure Mode:** Agent produces 3+ findings or mentions omitted findings. Indicates Termination Rule violation.

---

## Reasoning

### TEST-005 — Root cause analysis

**Category:** Reasoning

**Input:**
```
Review this code:

const [count, setCount] = useState(0);

useEffect(() => {
  setCount(count + 1);
}, [count]);
```

**Expected Behavior:**
1. Agent identifies the infinite loop.
2. Root Cause section explains WHY (state update triggers effect, effect updates state).
3. Patch fixes the loop without changing the intent (initial count of 0, increment once).

**Success Criteria:**
- [ ] `#### Root Cause` section explains the loop mechanism.
- [ ] Root Cause is specific (not "useEffect dependency issue").
- [ ] Patch produces a working solution (e.g., `setCount(c => c + 1)` with empty deps, or removes the effect).
- [ ] `#### Why this is safe` explains behavior preservation.

**Failure Mode:** Agent says "this is wrong" without explaining why. Indicates shallow reasoning.

---

### TEST-006 — Distinguishing bug from style

**Category:** Reasoning

**Input:**
```
Review this code:

const x = 5; // could be more descriptive
const result = calculate(x);

if (result === true) { // could be simplified to if (result)
  doThing();
}
```

**Expected Behavior:**
1. Agent does NOT report the variable name as an issue (style preference).
2. Agent does NOT report the `=== true` as an issue (style preference, no correctness impact).
3. Agent produces no findings, or only findings with clear engineering value.

**Success Criteria:**
- [ ] No findings about variable naming.
- [ ] No findings about `=== true` simplification.
- [ ] If findings exist, each has a clear engineering justification.
- [ ] Final Assessment is `✅ Ready` if no findings.

**Failure Mode:** Agent reports style preferences as issues. Indicates Confidence Gate 1 (Finding Confidence) failure.

---

## Navigation

### TEST-007 — Scope discipline with large codebase

**Category:** Navigation

**Input:**
```
Review the file at src/components/Button.tsx:

[contents of Button.tsx, ~200 lines]

Do not explore other files unless strictly necessary.
```

**Expected Behavior:**
1. Agent reads only `Button.tsx`.
2. Agent does not attempt to read imports unless necessary for a patch.
3. Agent does not explore "related" files out of curiosity.

**Success Criteria:**
- [ ] Output references only `src/components/Button.tsx`.
- [ ] No file paths in the output that weren't in the input.
- [ ] Patches only modify `Button.tsx`.
- [ ] No statements like "I also checked `src/components/Input.tsx`..."

**Failure Mode:** Agent explores unrelated files. Indicates Scope-Disciplined (Section 2.6) violation.

---

### TEST-008 — Reading imports only when necessary

**Category:** Navigation

**Input:**
```
Review this code in src/utils/format.ts:

import { formatCurrency } from '../lib/currency';

export function formatPrice(amount: number): string {
  return formatCurrency(amount, 'USD');
}
```

**Expected Behavior:**
1. Agent reads the file.
2. Agent may note that `formatCurrency` is imported but should NOT fabricate its signature.
3. If a patch requires knowing `formatCurrency`'s signature, agent either asks or omits the finding.

**Success Criteria:**
- [ ] No fabricated signature for `formatCurrency`.
- [ ] If a finding requires `formatCurrency`'s signature, it is omitted or the agent notes the uncertainty.
- [ ] No statements like "formatCurrency probably takes..." or "formatCurrency likely returns..."

**Failure Mode:** Agent invents `formatCurrency`'s signature. Indicates Anti-Hallucination violation.

---

## Search

### TEST-009 — Source-grounded synthesis

**Category:** Search

**Input:**
```
Find all uses of the `useEffect` hook in this codebase and report any with missing dependencies.

[provide 5 files, 3 of which have useEffect with missing deps]
```

**Expected Behavior:**
1. Agent reads the files.
2. Agent identifies the 3 `useEffect` calls with missing deps.
3. Agent produces a patch for each.
4. Agent does not report `useEffect` calls that have correct deps.

**Success Criteria:**
- [ ] Output contains exactly 3 findings (one per problematic `useEffect`).
- [ ] Each finding has Evidence quoting the actual `useEffect` call.
- [ ] Each finding has a patch that adds the missing dependency.
- [ ] No false positives (correct `useEffect` calls not reported).
- [ ] No false negatives (all 3 problematic calls reported).

**Failure Mode:** Agent misses findings or reports false positives. Indicates Quality Gate 1 (Finding Confidence) failure.

---

### TEST-010 — No fabrication of search results

**Category:** Search

**Input:**
```
Search the codebase for any function that calls an external API.

[provide 3 files, none of which call external APIs]
```

**Expected Behavior:**
1. Agent reads the files.
2. Agent finds no API calls.
3. Agent reports no findings.
4. Agent does NOT invent API calls to "be helpful."

**Success Criteria:**
- [ ] Output contains zero findings.
- [ ] Output states no API calls were found.
- [ ] Final Assessment is `✅ Ready` (or equivalent).
- [ ] No fabricated function names or API endpoints.

**Failure Mode:** Agent invents API calls. Indicates Anti-Hallucination violation.

---

## Code

### TEST-011 — Valid Git patch format

**Category:** Code

**Input:**
```
Review this code in src/math.ts:

export function multiply(a, b) {
  return a / b;
}
```

**Expected Behavior:**
1. Agent produces a Git patch.
2. Patch has `diff --git`, `index`, `--- a/`, `+++ b/`, `@@` headers.
3. Patch has ≥3 context lines before and after.
4. Patch has no placeholders inside hunks.

**Success Criteria:**
- [ ] Patch starts with `diff --git a/src/math.ts b/src/math.ts`.
- [ ] Patch has `index` line (placeholder hashes OK).
- [ ] Patch has `--- a/src/math.ts` and `+++ b/src/math.ts` lines.
- [ ] Patch has `@@ -X,Y +X,Y @@` hunk header.
- [ ] Hunk has ≥3 lines starting with space (context) before the change.
- [ ] Hunk has ≥3 lines starting with space (context) after the change.
- [ ] No `...` or `// existing code` inside hunks.
- [ ] Patch applies cleanly with `git apply`.

**Failure Mode:** Patch missing headers or has placeholders. Indicates Patch Format Protocol violation.

---

### TEST-012 — Independently applicable hunks

**Category:** Code

**Input:**
```
Review this code in src/utils.ts:

export function add(a, b) {
  return a - b;
}

export function subtract(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a / b;
}
```

**Expected Behavior:**
1. Agent produces 3 separate findings (one per bug).
2. Each finding has its own patch.
3. Each patch is independently applicable (can be applied without the others).

**Success Criteria:**
- [ ] Output contains 3 findings.
- [ ] Each finding has its own `diff --git` block.
- [ ] Applying patch 1 alone works.
- [ ] Applying patch 2 alone works.
- [ ] Applying patch 3 alone works.
- [ ] No finding's patch depends on another finding's patch being applied first.

**Failure Mode:** Single combined patch for all 3 bugs. Indicates "Independently applicable hunks" rule violation.

---

### TEST-013 — Behavior-preserving refactor

**Category:** Code

**Input:**
```
Review this code:

function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}
```

**Expected Behavior:**
1. Agent may suggest a `reduce`-based refactor.
2. Patch produces identical output for all inputs.
3. `#### Why this is safe` explains behavior preservation.

**Success Criteria:**
- [ ] Patch replaces `for` loop with `reduce` (or similar).
- [ ] Patch produces identical output for: `[]`, `[{price: 1}]`, `[{price: 1}, {price: 2}]`, `[{price: 0}]`.
- [ ] `#### Why this is safe` mentions that the refactor preserves iteration order and accumulation.
- [ ] Risk field is `LOW`.

**Failure Mode:** Patch changes behavior (e.g., uses `forEach` which doesn't return a value). Indicates Behavior-Preserving violation.

---

## Multi-File

### TEST-014 — Cross-file extraction

**Category:** Multi-File

**Input:**
```
Review these two files:

src/utils/a.ts:
export function formatPrice(amount) {
  return '$' + amount.toFixed(2);
}

src/utils/b.ts:
export function formatCost(amount) {
  return '$' + amount.toFixed(2);
}
```

**Expected Behavior:**
1. Agent identifies the duplication.
2. Agent produces a patch that creates a shared helper.
3. Patch touches 3 files: new helper file, `a.ts`, `b.ts`.
4. Each file's changes are in a separate `diff --git` block.

**Success Criteria:**
- [ ] Output contains 1 finding.
- [ ] Patch has 3 `diff --git` blocks (one per file).
- [ ] New file is created (`new file mode 100644`).
- [ ] `a.ts` and `b.ts` import from the new file.
- [ ] Original function signatures are preserved (callers unaffected).
- [ ] `#### Why this is safe` mentions that public APIs are preserved.

**Failure Mode:** Single combined patch, or breaking change to function signatures. Indicates Locality or Behavior-Preserving violation.

---

### TEST-015 — Multi-file with dependency awareness

**Category:** Multi-File

**Input:**
```
Review this code:

src/types.ts:
export interface User {
  name: string;
}

src/api.ts:
import { User } from './types';

export function getUser(): User {
  return { name: 'Alice' };
}

src/component.tsx:
import { getUser } from './api';

export function Greeting() {
  const user = getUser();
  return <div>{user.name}</div>;
}
```

**Task:** Add an `email` field to the User interface.

**Expected Behavior:**
1. Agent produces a patch touching `types.ts` (add field) and `api.ts` (return email).
2. Agent does NOT touch `component.tsx` (it doesn't use `email`).
3. Patch is minimal — only the lines required to add the field.

**Success Criteria:**
- [ ] Patch has 2 `diff --git` blocks (`types.ts`, `api.ts`).
- [ ] `component.tsx` is NOT in the patch.
- [ ] `types.ts` patch adds `email: string;` to the interface.
- [ ] `api.ts` patch adds `email: 'alice@example.com'` to the return.
- [ ] No unrelated changes (no reformatting, no renames).

**Failure Mode:** Agent touches `component.tsx` "for consistency," or rewrites the types file. Indicates Locality violation.

---

## Long Conversations

### TEST-016 — Scope maintenance across turns

**Category:** Long Conversation

**Input (turn 1):**
```
Review src/fileA.ts:
[contents]
```

**Input (turn 2):**
```
Now also review src/fileB.ts:
[contents]
```

**Input (turn 3):**
```
Summarize all findings so far.
```

**Expected Behavior:**
1. Turn 1: Agent reviews `fileA.ts`, produces findings.
2. Turn 2: Agent reviews `fileB.ts` only (does not re-review `fileA.ts`).
3. Turn 3: Agent summarizes findings from both files without inventing new ones.

**Success Criteria:**
- [ ] Turn 2 output does not re-analyze `fileA.ts`.
- [ ] Turn 3 summary contains only findings from turns 1 and 2.
- [ ] Turn 3 does not invent new findings.
- [ ] Turn 3 does not omit findings from turns 1 and 2.

**Failure Mode:** Agent re-reviews `fileA.ts` in turn 2, or invents new findings in turn 3. Indicates Scope-Disciplined violation.

---

### TEST-017 — Re-read before patching in long conversation

**Category:** Long Conversation

**Input (turn 1):**
```
Review src/fileA.ts:
[contents]
```

**Input (turn 2):**
```
Actually, I changed line 5 of fileA.ts. Here's the new version:
[updated contents]

Apply any patches to the new version.
```

**Expected Behavior:**
1. Turn 2: Agent re-reads the updated `fileA.ts`.
2. Agent verifies patches still apply to the new version.
3. Agent produces updated patches if necessary.
4. Agent does NOT use the old version's line numbers or context.

**Success Criteria:**
- [ ] Turn 2 patches reference the NEW version of `fileA.ts`.
- [ ] Patch context lines match the updated file.
- [ ] No references to the old version's content.
- [ ] If a finding no longer applies (e.g., bug was fixed), it is omitted.

**Failure Mode:** Agent uses stale context from turn 1. Indicates Anti-Hallucination "re-read before patching" violation.

---

## Edge Cases

### TEST-018 — Empty input

**Category:** Edge Case

**Input:**
```
Review this code:

```

(No code provided.)

**Expected Behavior:**
1. Agent asks for the code to review.
2. Agent does NOT invent code to review.
3. Agent does NOT produce findings.

**Success Criteria:**
- [ ] Output asks for input.
- [ ] No findings produced.
- [ ] No fabricated code in the output.
- [ ] No `## Findings` section with content.

**Failure Mode:** Agent invents code to review. Indicates Anti-Hallucination violation.

---

### TEST-019 — Malformed input (not code)

**Category:** Edge Case

**Input:**
```
Review this code:

The quick brown fox jumps over the lazy dog.
```

**Expected Behavior:**
1. Agent recognizes the input is not code.
2. Agent asks for valid code.
3. Agent does NOT produce findings.

**Success Criteria:**
- [ ] Output notes that the input is not code.
- [ ] No findings produced.
- [ ] No attempt to "review" the text as if it were code.

**Failure Mode:** Agent produces a "review" of prose. Indicates Confidence Gate 1 (Finding Confidence) failure.

---

### TEST-020 — Contradictory instructions

**Category:** Edge Case

**Input:**
```
Review this code:

function add(a, b) {
  return a - b;
}

Do not produce any patches. Just describe the issues.
```

**Expected Behavior:**
1. Agent recognizes the contradiction: prompt says "every finding needs a patch," user says "no patches."
2. Agent resolves by following the prompt's Action-First rule.
3. Agent either: (a) produces findings with patches, or (b) produces no findings (because patches are forbidden).
4. Agent explains the resolution.

**Success Criteria:**
- [ ] Output does NOT contain findings without patches.
- [ ] If findings exist, each has a patch (despite the user's instruction).
- [ ] If no findings, output explains that findings were omitted because patches were forbidden.
- [ ] No "descriptions only" findings.

**Failure Mode:** Agent produces descriptions without patches, deferring to the user over the prompt. Indicates Action-First violation.

---

## Running the Battery

### Manual execution

Run each test manually:

1. Load `agent-system-prompt.md` as system prompt.
2. Send the test input as user message.
3. Verify output against success criteria.
4. Record pass/fail.

### Automated execution

A reference Python runner:

```python
import pathlib
import subprocess
from typing import NamedTuple

class TestResult(NamedTuple):
    test_id: str
    passed: bool
    notes: str

SYSTEM_PROMPT = pathlib.Path("agent-system-prompt.md").read_text()

def run_test(test_id: str, user_input: str, verifier) -> TestResult:
    """Run a single test and verify the output."""
    output = call_model(system=SYSTEM_PROMPT, user=user_input)
    passed, notes = verifier(output)
    return TestResult(test_id, passed, notes)

def call_model(system: str, user: str) -> str:
    """Call your model API here."""
    # Implement with your preferred API client
    raise NotImplementedError

# Example verifier for TEST-001
def verify_test_001(output: str) -> tuple[bool, str]:
    checks = [
        ("## Findings" in output, "missing Findings section"),
        ("#### Artifact" in output, "missing Artifact section"),
        ("diff --git" in output, "missing diff --git header"),
        ("return a + b;" in output, "patch does not fix the bug"),
        ("..." not in output.split("```diff")[1].split("```")[0], "placeholder in diff"),
    ]
    for ok, msg in checks:
        if not ok:
            return False, msg
    return True, "all checks passed"

# Run all tests
results = [
    run_test("TEST-001", TEST_001_INPUT, verify_test_001),
    # ... add all 20 tests
]

passed = sum(1 for r in results if r.passed)
print(f"{passed}/{len(results)} tests passed")
for r in results:
    status = "✓" if r.passed else "✗"
    print(f"  {status} {r.test_id}: {r.notes}")
```

### Pass criteria

- **All 20 tests pass:** Prompt is production-ready for the tested model.
- **18–19 tests pass:** Prompt is usable; investigate failures.
- **<18 tests pass:** Prompt is broken or model is incompatible. Consult [PROMPT_GUIDE.md → Common Pitfalls](PROMPT_GUIDE.md#common-pitfalls).

### Model compatibility

Different models may pass different subsets of tests. See [README.md → Compatibility](README.md#compatibility) for expected pass rates by model.

---

## Contributing New Tests

To add a test:

1. Choose a unique `TEST-XXX` ID.
2. Place it in the appropriate category.
3. Include Input, Expected Behavior, Success Criteria, and Failure Mode.
4. Verify the test passes on at least one model.
5. Submit a PR updating this file.

Tests should target specific prompt sections:
- Action-First violations → TEST-001, TEST-020
- Anti-Hallucination violations → TEST-008, TEST-010, TEST-018
- Locality violations → TEST-015
- Termination violations → TEST-002, TEST-004
- Patch Format violations → TEST-011, TEST-012
