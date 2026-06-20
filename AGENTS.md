# AGENTS.md - Spargn Ayiti

## Project Goal

Spargn Ayiti is an AI-powered financial assistant that helps Haitians save money, manage budgets, and improve their financial habits. Preserve stability, performance, and user trust.

---

## Critical Rules

Do NOT modify any of the following without explicit user approval:

* package.json
* server.ts
* .env.example
* Railway deployment configuration
* Environment variables (GEMINI_API_KEY, APP_URL, etc.)
* Build scripts
* API endpoints

---

## Development Rules

* Keep the project fully compatible with Railway.
* Never introduce breaking changes.
* Do not remove existing features unless explicitly requested.
* Reuse existing components whenever possible.
* Write clean, maintainable TypeScript code.
* Preserve the current project architecture.

---

## Before Every Commit

Always verify that:

* The project builds successfully.
* No TypeScript errors remain.
* Existing chatbot features still work.
* Existing financial calculators still work.
* No environment variables are exposed.
* No secrets are committed to GitHub.

---

## Git Workflow

* Implement requested features.
* Test locally.
* Commit only when the project is stable.
* Push to GitHub.
* Let Railway deploy automatically.

---

## UI Guidelines

* Keep the interface modern, responsive, and accessible.
* Do not change the overall design language unless requested.
* Optimize for mobile devices.

---

## Security

* Never expose API keys.
* Never hardcode secrets.
* Never delete production configuration.
* Never modify deployment settings without user approval.

---

## Priority

Stability > Security > Performance > New Features.
