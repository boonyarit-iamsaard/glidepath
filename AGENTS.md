# AGENTS.md

## Markdown

Every time you touch a `.md` file, leave it in good shape before you finish. Two tools must pass:

```bash
pnpm format      # prettier --write on md/yaml/yml
pnpm lint:md     # markdownlint
```

Use `pnpm lint:md:fix` to repair most markdownlint findings automatically. The rules live in `.prettierrc.json` and `.markdownlint.json`. Do not weaken a rule to make a file pass — fix the file.

Two rules trip people up most often:

- A fenced code block needs a language tag. Use `text` for directory trees and plain output.
- A heading needs exactly one space after the hash.

## English level

Write all prose at CEFR B2–C1. Where the content is procedural — steps, commands, checklists — use ASD-STE100 Simplified Technical English instead.

This applies to two things: prose committed to this repo, and how you talk to the maintainer in chat.

- One idea per sentence. Keep sentences short.
- Use active voice and present tense.
- Choose the plain word over the jargon word. Explain a technical term the first time you use it.
- Do not stack more than three nouns together.
- Say the same thing the same way each time. Do not reach for synonyms to add variety.

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature-slug>/` in this repo — there is no remote issue tracker. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name, recorded as a `Status:` line in the issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` and one `docs/adr/` at the repo root, covering the whole workspace. See `docs/agents/domain.md`.
