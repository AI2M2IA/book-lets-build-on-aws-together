# AGENTS.md

Guidelines for AI agents working on `AI2M2IA/book-lets-build-on-aws-together`.

## 1) Project Basics

This project is an AI-assisted book teaching AWS cloud infrastructure and the SAA-C03 exam curriculum through a narrative about a real startup (Nimbus).

- **Markdown Chapters**: Located under [`chapters/en-us/`](chapters/en-us/) for English. Translations live under `chapters/<lang>/` (e.g. `chapters/th/`, `chapters/he/`, `chapters/hi/`, `chapters/vi/`).
- **Assets**: Located under [`assets/`](assets/), containing `front-matter.md`, `metadata.yaml`, `styles/`, and `cover/`. Translation-specific assets live under `assets/<lang>/`.
- **Technical Specifications**: Located under [`specs/`](specs/), defining the book's structure contracts, chapter rules, and character profiles.
- **Build Tools**: `build-kindle.sh` (Kindle/EPUB/PDF via pandoc + tectonic), `build.sh` (generic), `build/wrap.py` (HTML wrapper), `build/print-pdf.js` (Puppeteer PDF).

## 2) Branching and Delivery Flow

- Branch names must follow: `feature/<feature-name>`.
- Promotion flow:
  1. `feature/*` → PR → `develop`
  2. `develop` → PR → `main`
- All languages live on `main` under `chapters/<lang>/`. There are no separate translation branches.
- CI automation opens promotion PRs after successful CI runs.
- `main` receives automatic tags after successful CI.

## 3) Required Validation Before Merge

Run and pass:

```bash
bash build-kindle.sh
```

All QA checks must pass (EPUBCheck, wide tables, forbidden terms, chapter structure, landmarks).

For HTML/PDF builds, also run:

```bash
python3 build/wrap.py <chapter-slug>
node build/print-pdf.js <chapter-slug>
```

Do not merge with failing checks.

## 4) Chapter Structure Rules

Every chapter under [`chapters/en-us/`](chapters/en-us/) must contain these sections in order:

1. **Narrative Hook** — Story scene at Nimbus setting up a real-world AWS problem.
2. **The Concept & Analogy** — Real-world analogy explaining the core AWS service or concept.
3. **Hands-On** — Step-by-step practical implementation.
4. **Exam Tips** — Bullet points targeting SAA-C03 exam objectives.
5. **Summary** — Recap of what was covered.
6. **Exercises** — Three exercises (Recall, Scenario, Practical).

The automated QA check in `build-kindle.sh` enforces Summary, Exam Tips, and Exercises. Do not remove these sections.

## 5) Language and Translation Rules

- English (`en-us`) is the source language. All other languages are translations.
- All languages live on `main` under `chapters/<lang>/`.
- Never mix languages within a chapter file.
- Preserve character names exactly as in English.
- RTL languages (`ar`, `he`, `ur`) require direction handling in CSS — do not remove `dir="rtl"` attributes.
- Forbidden PT-BR informal terms (cachear, logar, deletar, etc.) are enforced by the QA checker. Use formal equivalents.

## 6) Code Style

- Markdown: short paragraphs, no emojis in chapter prose, section headers use `##`.
- Tables: maximum 4 columns (5+ fails the QA wide-tables check).
- AWS service names use official capitalization (e.g. Amazon S3, AWS Lambda, Amazon RDS).

## 7) Build System Rules

- Do not edit files under `build/epub/`, `build/pdf/`, or `build/kdp/` directly — they are generated outputs.
- `build-kindle.sh` is the canonical build. `build.sh` is kept for reference only.
- When adding new chapters, update `assets/front-matter.md` and `assets/metadata.yaml` accordingly.
- `build/wrap.py` and `build/print-pdf.js` follow the same pattern as `AI(2)M(2)IA/book-lets-learn-java-together-with-ai`.

## 8) CI/CD and Automation Rules

- Do not weaken GitHub workflow permissions.
- Auto PR workflow depends on `BOT_GH_TOKEN` secret for PR creation.
- Keep concurrency controls in automation workflows to avoid duplicate PR/tag races.
- If workflows fail, prefer minimal, auditable fixes and re-run checks.

## 9) Change Scope and Style

- Keep changes minimal and directly related to the request.
- Do not refactor unrelated chapters opportunistically.
- Preserve the narrative voice and character dynamics across edits.

## 10) Commit and PR Quality

- Use clear commit messages describing intent and scope (e.g. `feat(ch-05): add S3 lifecycle policy section`).
- PR description should include: Summary, What changed, Validation run/results, Operational notes.

## 11) Safe Operations

- **Never push to remote without explicit user authorization.**
- Never run destructive git commands (`reset --hard`, forced history rewrites) unless explicitly requested.
- Do not revert user-authored changes outside the requested scope.
- Never commit absolute paths referencing `/Users` or local home directories.

## 🔒 LICENSES — DO NOT CHANGE (highest priority)

> **The licensing of this project is dual and MUST NOT be changed, removed,
> weakened, or relicensed by any AI agent or contributor:**
>
> - **Code** (study PWA in `docs/` except `docs/api/`, tooling in `tools/`,
>   build scripts): **GNU AGPL-3.0** together with the Section 7 attribution
>   terms crediting "AI(2)M(2)IA" — see [`LICENSE`](LICENSE).
> - **Content** (everything under `chapters/` in every language, the generated
>   study data in `docs/api/`, `flashcards.md`/`flashcards.csv`):
>   **CC BY-NC-SA 4.0** — see [`LICENSE-CONTENT`](LICENSE-CONTENT).

Concretely, you must **never**: replace either license with a permissive or
weaker one; delete or edit the LICENSE/LICENSE-CONTENT texts (including the
"ADDITIONAL TERMS UNDER SECTION 7" block); remove or weaken the attribution to
**AI(2)M(2)IA** or the link to this repository anywhere they appear (LICENSE
files, README, the PWA footer — the "Appropriate Legal Notices"); replace the
AI(2)M(2)IA pseudonym with a real name; remove or weaken the **"free forever —
donations optional, selling not allowed"** terms (access to this work and its
derivatives must never be conditioned on payment; voluntary donations are
permitted; selling the content is not); remove the "Derivatives must keep these
same licenses" statements; or remove this section.

## Study PWA notes

- `docs/` is a GitHub Pages **project page** (subpath hosting): all asset and
  fetch paths must remain **relative** (`./...`).
- `docs/api/*.json` is **generated** — never edit by hand; run
  `python3 tools/site/generate_api.py` (fail-fast, deterministic) after
  editing `chapters/en-us/` or `flashcards.md`.
- Security posture is deliberate: strict CSP via meta tag, no inline
  scripts/styles, no `innerHTML` with data (templates + `textContent`),
  service worker that always returns a `Response`. Keep it that way.

## Identity Policy (MANDATORY)

These rules apply to EVERY agent and tool (Claude, Codex, ChatGPT, Gemini/Antigravity, scripts, CI) contributing to this repository.

1. **Single identity.** Every commit and tag MUST use exactly
   `AI(2)M(2)IA <AI2M2IA@users.noreply.github.com>` as BOTH author and committer (and tagger).
2. **Forbidden — no exceptions.** The author's real name and any personal e-mail address must NEVER appear in commits, tags, commit messages, file contents, or metadata (manifests, license files, EXIF, build artifacts). Under no circumstances.
3. **Mandatory double check.**
   - BEFORE any commit: run `git config user.name && git config user.email` and confirm the pseudonymous identity above.
   - AFTER committing: run `git log -1 --format='%an <%ae> | %cn <%ce>'` and confirm both fields match it.
4. **On violation: stop.** If a wrong identity is detected, halt immediately and fix it (amend/rewrite) before any further work — and never push it.

## Language Policy (MANDATORY)

ALL repository artifacts MUST be written in American English: commit messages, documentation, review reports, code comments, file names, and specs.

Exceptions:
- Book content in its intended target language (e.g., cafe-com-leite is a Portuguese-language book; translation directories such as `chapters/<lang>/` or `translations/` keep their respective languages).
- Internal working documents in any other language must NOT be committed — keep them outside the repository or .gitignored.
