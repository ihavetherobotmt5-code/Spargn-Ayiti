# Changelog

All notable changes to the Agent System Prompt project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0] — 2026-06-25

### Summary

Major release. Generalized the Sprint Code Review prompt (v2.x) into a modular, task-agnostic Agent System Prompt. Packaged as a complete open-source project with documentation, tests, and examples.

### Added

- **Project structure** — README, ARCHITECTURE, PROMPT_GUIDE, CHANGELOG, INSTALL, TESTS, EXAMPLES, LICENSE.
- **Layered architecture** — prompt reorganized into seven layers (L0–L6) with explicit dependency chain.
- **Criticality markers** — every section marked `[CRITICAL]`, `[RECOMMENDED]`, or `[OPTIONAL]`.
- **Customization hooks** — Section 11 explicitly documents what can be removed, replaced, or relaxed.
- **Test battery** — TESTS.md with 12 tests covering simple, complex, reasoning, navigation, search, code, multi-file, long-conversation, and edge cases.
- **Examples gallery** — EXAMPLES.md with bad/good/simple/advanced/software/research/autonomous agent examples.
- **Architecture documentation** — ARCHITECTURE.md with layer-by-layer description and dependency graph.
- **Prompt guide** — PROMPT_GUIDE.md with block-by-block explanation, modification recipes, and common pitfalls.

### Changed

- **Identity section** generalized from "Senior Software Engineer conducting a Pull Request review" to "Senior Software Engineer and autonomous task executor."
- **Mission section** generalized from "review a completed Sprint" to "transform a user request into a concrete, verifiable, deliverable artifact."
- **Output format** made replaceable — Section 7 is now explicitly `[RECOMMENDED]` and can be replaced with task-specific formats.
- **Patch format** made optional — Section 8 is now `[REQUIRED for code tasks]` / `[OPTIONAL]` otherwise.
- **Quality Gates** reformatted as a table for readability.
- **Locality rules** reformatted as a table of forbidden modifications.

### Removed

- **Sprint-specific language** — "Sprint 2", "Pull Request review", and other code-review-specific framing removed from the core prompt (preserved in EXAMPLES.md as a use case).
- **Redundant reinforcement** — v2.0 had three separate "Mandatory Rule" sections; consolidated into one (Section 10).
- **Conflated confidence/risk** — v2.0 mixed finding-confidence and patch-confidence into HIGH/MEDIUM/LOW; replaced with five binary Quality Gates (Section 4) plus a separate Risk calibration in the output format.

### Migration from v2.x

If you were using v2.x for Sprint code review:
1. Replace your system prompt with `agent-system-prompt.md` v3.0.
2. Add the following to your user message: "Review the attached Sprint patch and produce a GitHub PR review document with applicable Git patches for any improvements."
3. The output format is compatible — v3.0's Generic Output Format (Section 7) is a superset of v2.x's format.

---

## [2.2] (Patch 2) — 2026-06-24

### Summary

Patch release. Added the five-gate Confidence Gate to operationalize the "silence over partial output" principle.

### Added

- **Confidence Gate** (Section 4) — five binary gates (Finding, Implementation, Safety, Context, Value) replacing the subjective HIGH/MEDIUM/LOW confidence levels.
- **Re-read before patching** rule (Section 5, rule 5) — requires re-reading exact lines immediately before generating each patch.
- **Independently applicable hunks** rule (Section 8) — multiple improvements must be separate hunks, not merged.

### Changed

- **Risk calibration** — LOW/MEDIUM/HIGH now defined explicitly (LOW = pure extraction; MEDIUM = touches multiple files; HIGH = changes behavior or API).

### Fixed

- **v2.0 conflation** — v2.0 mixed "finding confidence" (is this an issue?) and "patch confidence" (will this patch break something?) into one axis. v2.2 separates them: confidence is now five binary gates; risk is a separate output field with explicit calibration.

---

## [2.1] (Patch 1) — 2026-06-24

### Summary

Patch release. Added the Diff Format Protocol to eliminate `git apply` failures.

### Added

- **Diff Format Protocol** (Section 8) — exact Git unified diff format specification.
- **Anti-hallucination rule for context** (Section 5, rule 1) — "Every line in an output must be traceable to code you observed."
- **No placeholders inside hunks** rule — forbids `...`, `// existing code`, `<rest of function>` inside diff hunks.
- **`index` placeholder allowance** — the `index 0000000..1111111` line may use placeholder hashes (the ONLY permitted placeholder).

### Changed

- **Patch Quality Requirements** expanded from 4 rules to 9, with explicit consequences for violations.

### Fixed

- **`git apply` failures** — v2.0 patches frequently failed application due to missing `diff --git` headers, missing `@@` hunk headers, fabricated context lines, and placeholders inside hunks. v2.1 eliminates these failure modes by specifying the exact format and forbidding the problematic patterns.

---

## [2.0] — 2026-06-24

### Summary

Major release. Introduced the Patch-First Rule, the core principle that every reported improvement must include a complete, applicable Git patch.

### Added

- **Patch-First Rule** (Core Principle) — "Every reported improvement MUST include a complete, valid, directly-applicable Git patch. If you cannot generate a valid patch, you MUST NOT report that improvement."
- **Patch Quality Requirements** — 4 rules: valid unified Git diff, directly applicable, no placeholders, no partial implementations.
- **Anti-Hallucination Rules** (Section 5) — 6 rules targeting fabricated code, guessed paths, invented signatures, unread files, re-reading, and omission when uncertain.
- **Locality Rule** (Section 6) — every changed line must be directly required by the improvement.
- **Finding structure** — restructured from `Issue / Why / Impact / Patch` to `Summary / Evidence / Root Cause / Proposed Solution / Patch / Why this is safe / Expected Benefit / Risk`.
- **Mandatory Rule** — explicit statement that descriptions without patches are forbidden.
- **Positive Findings** section — praise for good implementation decisions, no patches required.
- **Final Assessment** — three-option verdict: Ready to Merge / Merge Recommended After Applying Suggested Patches / Changes Required Before Merge.

### Changed

- **Output format** — restructured to enforce Action-First (every finding has a Patch section).
- **Risk field** — added LOW/MEDIUM/HIGH (calibration added in v2.1).

### Fixed

- **v1 weakness: descriptions without patches** — v1 allowed the agent to report findings without producing patches. v2.0 forbids this explicitly.

---

## [1.0] — 2026-06-23

### Summary

Initial release. Sprint Code Review prompt for the Continuite Sparn Ayiti project.

### Added

- **Role** — Senior Software Engineer conducting a Pull Request review.
- **Review Priorities** — 5 priorities: Correctness, Maintainability, Performance, React Best Practices, TypeScript Best Practices.
- **Important Rules** — never rewrite architecture, never introduce breaking changes, never change business logic, never generate cosmetic-only patches.
- **Confidence Policy** — HIGH / MEDIUM / LOW (LOW patches forbidden).
- **Output Format** — `# Sprint Review` → `## Executive Summary` → `## Critical Issues` → `## Optional Improvements` → `## Positive Findings` → `## Final Assessment`.
- **Critical Issue structure** — `### Issue / ### Why / ### Impact / ### Patch`.
- **Optional Improvement structure** — `### Improvement / ### Benefit / ### Risk / ### Patch`.
- **Final Rule** — "Never return an empty review."

### Known Weaknesses (fixed in v2.0)

- **No Patch-First enforcement** — findings could be reported without patches.
- **No anti-hallucination rules** — patches frequently contained fabricated context.
- **No diff format spec** — patches failed `git apply`.
- **No locality rule** — patches included unrelated refactoring.
- **Conflated confidence/risk** — finding-confidence and patch-confidence mixed into one axis.
- **"Never return empty" was ambiguous** — conflated "no technical analysis" with "no patches."

---

## Version History at a Glance

| Version | Date | Type | Key Change |
|---------|------|------|------------|
| 1.0 | 2026-06-23 | Initial | Sprint Code Review prompt |
| 2.0 | 2026-06-24 | Major | Patch-First Rule, Anti-Hallucination, Locality |
| 2.1 | 2026-06-24 | Patch | Diff Format Protocol (fix `git apply` failures) |
| 2.2 | 2026-06-24 | Patch | Five-gate Confidence Gate, Risk calibration |
| 3.0 | 2026-06-25 | Major | Generalized to Agent System Prompt, full project packaging |

---

## Upgrade Path

### From v1.0 to v2.0

**Breaking.** Replace your system prompt entirely. v2.0 is not backward-compatible with v1.0 output formats (the finding structure changed).

### From v2.x to v2.1

**Non-breaking.** v2.1 adds the Diff Format Protocol but does not change the output format. Existing v2.0 outputs are valid v2.1 outputs.

### From v2.1 to v2.2

**Non-breaking.** v2.2 adds the Confidence Gate but does not change the output format. The Risk field calibration is clarified but the field itself is unchanged.

### From v2.x to v3.0

**Mostly compatible.** The output format is a superset — v2.x outputs are valid v3.0 outputs. The core prompt is generalized (Sprint-specific language removed), so v3.0 can be used for non-code-review tasks. For Sprint code review specifically, add the task description to the user message instead of relying on the system prompt.

---

## Deprecation Policy

- **v1.0** — deprecated as of v2.0. No longer maintained.
- **v2.0** — deprecated as of v2.1 (diff format fix). No longer maintained.
- **v2.1** — deprecated as of v2.2 (confidence gate). No longer maintained.
- **v2.2** — superseded by v3.0 but still maintained for backward compatibility.
- **v3.0** — current stable release.

---

## Contributing

To propose a change to the Agent System Prompt:

1. Open an issue describing the problem and proposed change.
2. Reference the affected section(s) by number.
3. Indicate whether the change is `[CRITICAL]`, `[RECOMMENDED]`, or `[OPTIONAL]`.
4. Provide test cases from TESTS.md that verify the change.
5. Update PROMPT_GUIDE.md and ARCHITECTURE.md if the change affects criticality or layering.

Changes that weaken Action-First, Anti-Hallucination, Locality, or Confidence-Gated principles will not be accepted.
