# Study PWA — GitHub Pages root

This folder is the **GitHub Pages root** for the free study companion of
*Let's Build on AWS Together*: a static PWA with Practice questions, a full
65-question Exam Simulation, and Leitner Flashcards. No backend, no accounts,
no tracking — all progress lives in the browser's localStorage.

- App shell: `index.html`, `app.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `icons/`
- Static API: `api/questions.json`, `api/flashcards.json` — **generated, do not
  edit by hand**. Regenerate from the book with `python3 tools/site/generate_api.py`
  (run from the repo root).
- Generator inputs (this repo has no `concept-registry.md`): the English
  chapters under `chapters/en-us/` — exercise blocks and the Appendix D mock
  exam for questions; the Appendix C glossary (`chapters/en-us/appendix-c.md`)
  plus the root `flashcards.md` service cards for flashcards.
- `.nojekyll` disables Jekyll so files are served as-is.

## One-time activation (repo owner)

GitHub → **Settings → Pages** → Build and deployment: **Deploy from a branch** →
Branch: **main**, Folder: **/docs** → Save.

After a minute the app is live at:
**https://ai2m2ia.github.io/book-lets-build-on-aws-together/**

(Project page = subpath hosting: that is why every path in the app is relative.)

Licenses: code AGPL-3.0 + §7 attribution terms (`../LICENSE`), content/data
CC BY-NC-SA 4.0. Free forever — donations optional, selling not allowed.
See the repository README.
