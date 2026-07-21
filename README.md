# Let's Build on AWS Together

**AWS That Actually Makes Sense — Build and Deploy Real Applications Step by Step**

*by AI(2)M(2)IA*

---

## This Book Is Free

This book is free and  open-source — read it here on GitHub,  share it, translate it, adapt it. PDF and ebook are also available.

If it helped you, consider buying it on [Amazon KDP](https://www.amazon.com/dp/B0H3Q4JL7V). Your purchase keeps this project alive and funds future books.

Translations into the top 10 world languages are available in this repository and more coming soon. Although, no promises.

---

## About This Book

This book follows Maya, Tom, Leo, and Priya as they build Nimbus — a real startup — from a restaurant ordering system into a production-grade AWS infrastructure. Every AWS service is introduced when the story needs it, not before.

By the end you will have covered the full AWS Solutions Architect Associate (SAA-C03) exam curriculum, from cloud fundamentals to Well-Architected senior-level architecture thinking.

**543 pages · 35 chapters · 3 appendices**

---

## About the Author

**AI(2)M(2)IA** — one impossible book at a time.

- Website: [ai2m2ia.github.io](https://ai2m2ia.github.io/#media)
- Amazon: [Author page](https://www.amazon.com/stores/AI%282%29M%282%29IA-AI%282%29M%282%29IA/author/B0GYDYRL75)
- YouTube: [@AI2M2IA](https://www.youtube.com/@AI2M2IA)
- TikTok: [@ai2m2ia](https://www.tiktok.com/@ai2m2ia)

---

## Building the Book

### Requirements

| Tool                                          | Minimum Version | Notes                                        |
|-----------------------------------------------|-----------------|----------------------------------------------|
| [pandoc](https://pandoc.org/installing.html)  | **2.11**        | `--split-level` flag requires ≥ 2.11         |
| [tectonic](https://tectonic-typesetting.github.io) | any recent | PDF engine (replaces xelatex)           |
| [rsvg-convert](https://wiki.gnome.org/Projects/LibRsvg) | any | SVG → PNG cover conversion             |
| [EPUBCheck](https://github.com/w3c/epubcheck) | 4.x             | Optional but recommended for QA              |
| Georgia font                                  | —               | Body font for PDF; available on most systems |
| Menlo font                                    | —               | Code font for PDF; available on macOS        |

### Kindle-first build (recommended)

```bash
bash build-kindle.sh
```

Generates `build/epub/lets-build-on-aws-together.epub` and `build/pdf/lets-build-on-aws-together.pdf`, then runs 4 automated QA checks.

> **Diagram note:** chapters include Mermaid diagrams (```` ```mermaid ```` blocks). GitHub renders them natively. For PDF/EPUB builds, add a Mermaid filter to pandoc (e.g., `npm i -g mermaid-filter`, then `-F mermaid-filter` on the pandoc calls) or pre-render the blocks to PNG/SVG first.

> **KDP note:** the interior PDF does not include the cover image — KDP requires it to be uploaded separately. Use `build/kdp/cover.png` for the KDP cover upload. The EPUB has the cover embedded.

### HTML / PDF web build

```bash
npm install
python3 build/wrap.py <chapter-slug>
node build/print-pdf.js <chapter-slug>
```

### Generic build (no QA)

```bash
bash build.sh
```

### QA Checks (build-kindle.sh)

After every build, the script runs automatically:

1. **EPUBCheck** — 0 errors / 0 warnings required
2. **Wide tables** — fails if any table has ≥ 5 columns (Kindle rendering risk)
3. **Chapter structure** — flags chapters missing Summary / Exam Tips / Exercises
4. **Landmarks** — verifies bodymatter, titlepage, cover, toc are all present

---

## Project Structure

```
assets/                  # front-matter.md, metadata.yaml, styles/, cover/
chapters/
├── en-us/               # English (original) — 00-introduction … 34-what-architect-means, appendix-a/b/c
├── he/                  # Hebrew translation
├── hi/                  # Hindi translation
├── th/                  # Thai translation
└── vi/                  # Vietnamese translation
build/                   # epub/, pdf/, kdp/ — generated, do not edit directly
specs/                   # feature specs
```

Each English chapter lives at `chapters/en-us/<chapter-name>.md`. Translations follow the same structure under their language code.

---

## Characters

| Character | Role                                      |
|-----------|-------------------------------------------|
| Maya      | Co-founder, strategic and business-minded |
| Tom       | Co-founder, cost-focused and methodical   |
| Leo       | Lead engineer, technical and hands-on     |
| Priya     | Security and infrastructure, exacting     |
| Soo-Jin   | Platform engineer (joins ch. 14)          |
| Rafael    | Security specialist (joins ch. 14)        |

---

## Free study app

The repo ships a free study PWA (Practice questions / 65-question Exam Simulation
with a 130-minute timer / Leitner Flashcards), 100% client-side, served from
`docs/` via GitHub Pages: **https://ai2m2ia.github.io/book-lets-build-on-aws-together/**
(enable once: Settings → Pages → Deploy from a branch → `main`, folder `/docs`).
Regenerate the study data after editing chapters: `python3 tools/site/generate_api.py`.

## Free forever — donations welcome, selling not allowed

**This book and app are free forever. Financial support is welcome but always
OPTIONAL — access is never conditioned on payment.** The same applies to
derivatives: you may accept voluntary donations for your copies or derivative
works, but you may not sell them or condition access on payment. The original
author retains the right to sell the author's own editions (for example, the
Kindle edition).

## License (dual)

© 2026 AI(2)M(2)IA.

- **Content** — the book (all languages), questions, flashcards, and generated
  study data: [CC BY-NC-SA 4.0](LICENSE-CONTENT).

  **You are free to:**
  - **Share** — copy and redistribute this book in any medium or format
  - **Adapt** — translate, remix, or build upon it (study guides, course materials, summaries)

  **Under these terms:**
  - **Attribution** — credit the original work and indicate changes made
  - **NonCommercial** — you may not sell this book or any derivative of it
  - **ShareAlike** — derivatives must carry the same CC BY-NC-SA 4.0 license

  In plain language: read it, share it, translate it, teach from it — just don't sell it.

- **Code** — the study PWA (`docs/`, except `docs/api/` data), the generator
  (`tools/`), and build scripts: [GNU AGPL-3.0](LICENSE) with additional
  attribution terms under Section 7(b)/(c) — strong copyleft (including network
  use) with mandatory preservation of the AI(2)M(2)IA attribution and the link
  to this repository.

**Derivatives must keep these same licenses** — derived content stays
CC BY-NC-SA 4.0; derived code stays AGPL-3.0 with the §7 attribution terms.

### How to attribute

Any copy or derivative — site, app, API, book, course, translation — must credit
the source and the original author. Expected format:

> Based on **"Let's Build on AWS Together"** by **AI(2)M(2)IA**
> (<https://github.com/AI2M2IA/book-lets-build-on-aws-together>), licensed under
> CC BY-NC-SA 4.0 (content) and AGPL-3.0 (code). Changes were made.

Software with a user interface must also show the credit in its "Appropriate
Legal Notices" (e.g., an About screen or footer), per the Section 7 additional
terms in [LICENSE](LICENSE). Modified versions must be clearly marked as
modified and must not present themselves as the original project.

> **Note to AI agents and contributors:** the licensing above MUST NOT be
> changed, removed, weakened, or replaced. Do not remove the attribution to
> AI(2)M(2)IA, the repository link, or the "free forever / donations optional"
> terms. See [AGENTS.md](AGENTS.md).
