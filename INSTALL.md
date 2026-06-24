# Installation & Integration Guide

> How to integrate the Agent System Prompt into your agent stack, load it, maintain it, and follow best practices for production use.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Integration Targets](#integration-targets)
- [Loading the Prompt](#loading-the-prompt)
- [Maintenance](#maintenance)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Option A — Copy-paste (simplest)

1. Open [`agent-system-prompt.md`](agent-system-prompt.md).
2. Copy the entire file contents.
3. Paste into your agent's system prompt slot.
4. Send your task as the user message.

### Option B — File-based (recommended for production)

1. Clone or download this repository.
2. Reference `agent-system-prompt.md` from your agent's startup code.
3. Load the file at startup and inject as the system prompt.

See [Loading the Prompt](#loading-the-prompt) for code examples.

---

## Integration Targets

### CLI Agents

| Agent | Integration |
|-------|-------------|
| **Claude Code** | Settings → System prompt → paste file contents |
| **Cursor** | Settings → AI → System prompt → paste file contents |
| **Aider** | `--system-prompt agent-system-prompt.md` |
| **GitHub Copilot Chat** | Settings → System prompt → paste file contents |

### API Agents

#### OpenAI (GPT-4 / GPT-4o)

```python
from openai import OpenAI
import pathlib

client = OpenAI()
system_prompt = pathlib.Path("agent-system-prompt.md").read_text()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Review the attached patch and produce a PR review document."},
    ],
)
```

#### Anthropic (Claude)

```python
import anthropic
import pathlib

client = anthropic.Anthropic()
system_prompt = pathlib.Path("agent-system-prompt.md").read_text()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4096,
    system=system_prompt,
    messages=[
        {"role": "user", "content": "Review the attached patch and produce a PR review document."},
    ],
)
```

#### Google (Gemini)

```python
import google.generativeai as genai
import pathlib

genai.configure(api_key="YOUR_API_KEY")
system_prompt = pathlib.Path("agent-system-prompt.md").read_text()

model = genai.GenerativeModel(
    model_name="gemini-2.0-pro",
    system_instruction=system_prompt,
)
response = model.generate_content("Review the attached patch and produce a PR review document.")
```

#### Z.ai (GLM)

```python
from zai import ZaiClient
import pathlib

client = ZaiClient()
system_prompt = pathlib.Path("agent-system-prompt.md").read_text()

response = client.chat.completions.create(
    model="glm-4.6",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Review the attached patch and produce a PR review document."},
    ],
)
```

### Framework Agents

#### LangChain

```python
from langchain_core.prompts import SystemMessagePromptTemplate
from langchain_openai import ChatOpenAI
import pathlib

system_prompt = pathlib.Path("agent-system-prompt.md").read_text()
system_template = SystemMessagePromptTemplate.from_template(system_prompt)

llm = ChatOpenAI(model="gpt-4o")
chain = system_template | llm
response = chain.invoke({})
```

#### AutoGen

```python
from autogen import ConversableAgent
import pathlib

system_prompt = pathlib.Path("agent-system-prompt.md").read_text()

agent = ConversableAgent(
    name="engineer",
    system_message=system_prompt,
    llm_config={"model": "gpt-4o"},
)
```

#### CrewAI

```python
from crewai import Agent
import pathlib

system_prompt = pathlib.Path("agent-system-prompt.md").read_text()

engineer = Agent(
    role="Senior Software Engineer",
    goal="Produce verifiable deliverables for assigned tasks",
    backstory=system_prompt,
    llm="gpt-4o",
)
```

---

## Loading the Prompt

### Pattern 1 — Static load (recommended for production)

Load the prompt once at application startup and reuse for all requests.

```python
# Python
import pathlib
from functools import lru_cache

@lru_cache(maxsize=1)
def get_system_prompt() -> str:
    return pathlib.Path("prompts/agent-system-prompt.md").read_text()

# Usage
system_prompt = get_system_prompt()
```

```typescript
// TypeScript
import { readFileSync } from "fs";

const systemPrompt = readFileSync("prompts/agent-system-prompt.md", "utf-8");

// Usage
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userTask },
  ],
});
```

### Pattern 2 — Dynamic load with customization

Load the prompt and inject task-specific customizations before each request.

```python
import pathlib

def build_system_prompt(task_type: str) -> str:
    base = pathlib.Path("prompts/agent-system-prompt.md").read_text()
    if task_type == "research":
        # Remove patch format section for non-code task
        return base.split("## 8. Patch Format Protocol")[0] + base.split("## 9. Termination Rules")[1]
    return base
```

### Pattern 3 — Templated load

Use the prompt as a template with variables.

```python
import pathlib
from string import Template

template = Template(pathlib.Path("prompts/agent-system-prompt.md").read_text())
system_prompt = template.substitute(
    project_name="My Project",
    sprint_number="3",
)
```

> **Note:** The default `agent-system-prompt.md` does not use template variables. Add `$variable` placeholders only if you need this pattern, and document them in PROMPT_GUIDE.md.

---

## Maintenance

### Versioning

- The prompt follows [Semantic Versioning](https://semver.org/).
- Major versions (1.x → 2.x → 3.x) break output format compatibility.
- Minor and patch versions are backward-compatible.
- Always pin to a specific version in production: `agent-system-prompt@3.0.0`.

### Updating

When updating to a new version:

1. Read the [CHANGELOG.md](CHANGELOG.md) for breaking changes.
2. Run the [TESTS.md](TESTS.md) battery against the new version.
3. If tests pass, update.
4. If tests fail, consult [PROMPT_GUIDE.md → Common Pitfalls](PROMPT_GUIDE.md#common-pitfalls).

### Forking

If you need to customize heavily:

1. Fork the repository.
2. Document your customizations in a `CUSTOMIZATIONS.md` file.
3. Track upstream changes via `git remote add upstream`.
4. Rebase your fork after each upstream release.
5. Run the test battery after every rebase.

### Testing

Run the test battery before every production deploy:

```bash
# Run all tests (requires a model API)
python tests/run_tests.py --model gpt-4o --prompt agent-system-prompt.md
```

The test battery is defined in [TESTS.md](TESTS.md). Each test has a defined input, expected behavior, and success criteria.

---

## Best Practices

### 1. Pin the prompt version

In production, pin to a specific version. Do not use `latest` or `main` — a breaking change upstream will silently change your agent's behavior.

```python
# Good
PROMPT_VERSION = "3.0.0"
PROMPT_PATH = f"prompts/agent-system-prompt@{PROMPT_VERSION}.md"

# Bad
PROMPT_PATH = "prompts/agent-system-prompt.md"  # tracks main, may break
```

### 2. Log the prompt version with every request

Include the prompt version in your request logs so you can correlate behavior changes with prompt versions.

```python
import logging
logger = logging.getLogger(__name__)

def call_agent(user_task: str):
    logger.info({
        "event": "agent_call",
        "prompt_version": PROMPT_VERSION,
        "task": user_task[:100],
    })
    # ... call model ...
```

### 3. Validate output format

The prompt produces Markdown with a known structure (Section 7). Validate the output before using it.

```python
import re

def validate_output(output: str) -> bool:
    required_sections = [
        r"^# .+",
        r"^## Executive Summary",
        r"^## Findings",
        r"^## Final Assessment",
    ]
    return all(re.search(pat, output, re.MULTILINE) for pat in required_sections)
```

### 4. Set appropriate token limits

The prompt itself is ~3,000 tokens. Set your model's `max_tokens` to at least 4,000 for the response, more for complex tasks.

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    max_tokens=8192,  # leaves room for full findings + patches
)
```

### 5. Use streaming for long outputs

For complex tasks, stream the response so the user sees progress.

```python
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    stream=True,
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 6. Handle empty output gracefully

The prompt may legitimately produce empty output (no findings). Do not treat this as an error.

```python
if "## Findings" not in response and "No qualifying" in response:
    # This is success, not failure
    return {"status": "no_findings", "verdict": "ready"}
```

### 7. Re-read on hallucination suspicion

If you suspect hallucination (e.g., a patch references a file that doesn't exist), re-run with a stricter prompt variant:

```python
STRICT_PROMPT = base_prompt + "\n\nADDITIONAL: Re-read every referenced file before producing output. If any reference cannot be verified, omit the finding."
```

### 8. Cache the prompt

The prompt is static. Cache it to avoid re-reading the file on every request.

```python
from functools import lru_cache

@lru_cache(maxsize=1)
def get_prompt():
    return pathlib.Path("agent-system-prompt.md").read_text()
```

### 9. Monitor for principle violations

Track whether the model is following the principles. Common violations:
- Output without `#### Artifact` section → Action-First violation
- Patch fails `git apply` → Anti-Hallucination or Patch Format violation
- Diff includes unrelated changes → Locality violation
- Output continues past scope → Termination violation

### 10. Keep the prompt in version control

Treat the prompt as code. Commit it, review changes, tag releases. Do not edit the prompt directly in production — always go through version control.

---

## Troubleshooting

### Problem: The agent produces descriptions without patches

**Cause:** Action-First rule not enforced. May indicate a weak model or a modified prompt.

**Fix:**
1. Verify you are using the unmodified `agent-system-prompt.md` v3.0.
2. Verify the model is on the [compatible list](README.md#compatibility).
3. If using a weaker model, see [PROMPT_GUIDE.md → Recipe 4](PROMPT_GUIDE.md#recipe-4-adapt-for-a-weaker-model).

### Problem: Patches fail `git apply`

**Cause:** Anti-Hallucination or Patch Format violation.

**Fix:**
1. Verify Section 8 (Patch Format Protocol) is present in your prompt.
2. Check if the patch has `diff --git` headers and `@@` hunk headers.
3. Check for placeholders inside hunks (`...`, `// existing code`).
4. Re-run with a stricter variant (see [Best Practice 7](#7-re-read-on-hallucination-suspicion)).

### Problem: The agent produces too many findings

**Cause:** Termination rule not enforced, or Quality Gates too loose.

**Fix:**
1. Verify Section 9 (Termination Rules) is present.
2. Verify Section 4 (Quality Gates) is present and unmodified.
3. Add to the user message: "Apply the Quality Gates strictly. Omit any finding that does not pass all five gates."

### Problem: The agent produces no findings when there clearly are issues

**Cause:** Quality Gates too strict, or Anti-Hallucination rule causing excessive omission.

**Fix:**
1. Verify the input (patch, files) is actually provided to the agent.
2. Check if the agent is reading the right files (Phase 2).
3. Relax Section 2.6 (Scope-Disciplined) to allow broader reading.

### Problem: The output format is wrong

**Cause:** Section 7 modified or removed, or task-specific format not provided.

**Fix:**
1. Verify Section 7 is present and unmodified.
2. If using a task-specific format, verify it is provided in the user message.
3. Re-run with the default Section 7 to confirm the prompt is intact.

### Problem: The agent refuses to produce output ("silent" failure)

**Cause:** This is correct behavior when no finding passes the Quality Gates. The agent should produce a "Ready" verdict with positive findings.

**Fix:**
1. Check the output for `✅ Ready` — this is success, not failure.
2. If you expected findings, verify the input contains actual defects.
3. If you want the agent to be more permissive, relax Section 2.6 or Section 4 Gate 5 (Value Confidence).

### Problem: The agent re-reads files excessively (high latency)

**Cause:** Section 5 rule 5 ("Re-read before producing") applied too aggressively.

**Fix:**
1. This is correct behavior — re-reading prevents hallucination.
2. If latency is unacceptable, use a faster model for the re-read step (e.g., GPT-4o-mini for verification, GPT-4o for generation).
3. Do NOT remove the re-read rule — it prevents hallucination.

---

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the prompt's layered design.
- Read [PROMPT_GUIDE.md](PROMPT_GUIDE.md) before customizing.
- Run [TESTS.md](TESTS.md) to verify your integration.
- Browse [EXAMPLES.md](EXAMPLES.md) for use cases.
- Track changes via [CHANGELOG.md](CHANGELOG.md).
