#!/usr/bin/env python3
"""Generate the static study API (questions.json / flashcards.json) for the PWA.

Single source of truth: the English book markdown under chapters/en-us/ plus
the root flashcards.md. Stdlib only. Deterministic output: the same input
bytes always produce the same output bytes (generatedAt is taken from the
HEAD commit date).

Fail-fast philosophy: any exercise/question block that starts but cannot be
parsed completely aborts the run with a clear stderr message. A final
validation pass enforces the content contract (counts, answer keys, etc.)
before anything is written to disk.

Layout of this repository (differs from the original generator's repo):
  - flat chapters: chapters/en-us/NN-name.md (only en-us feeds the API)
  - chapter exercises titled '**Exercise 2 — SAA-C03 Scenario**'
  - Appendix D: chapters/en-us/appendix-d.md, 65 questions in 4 domain parts,
    multiple-response marked '(Choose TWO.)', compact one-paragraph answer key
  - flashcard sources: chapters/en-us/appendix-c.md glossary + root flashcards.md
"""

import hashlib
import json
import os
import re
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
EN_DIR = os.path.join(ROOT, "chapters", "en-us")
FLASHCARDS_MD = os.path.join(ROOT, "flashcards.md")
API_DIR = os.path.join(ROOT, "docs", "api")

SCHEMA_VERSION = "1.0.0"
EXAM_QUESTION_COUNT = 65

DOMAIN_LABELS = {
    0: "Cross-domain",
    1: "Design Secure Architectures",
    2: "Design Resilient Architectures",
    3: "Design High-Performing Architectures",
    4: "Design Cost-Optimized Architectures",
}

DOMAIN_NAME_HINTS = [
    (re.compile(r"Domain\s*1\b"), 1),
    (re.compile(r"Domain\s*2\b"), 2),
    (re.compile(r"Domain\s*3\b"), 3),
    (re.compile(r"Domain\s*4\b"), 4),
    (re.compile(r"Secure", re.I), 1),
    (re.compile(r"Resilient", re.I), 2),
    (re.compile(r"High-Performing", re.I), 3),
    (re.compile(r"Cost-Optimized", re.I), 4),
    (re.compile(r"Cross-domain", re.I), 0),
]


def fail(msg):
    sys.stderr.write("ERROR: %s\n" % msg)
    sys.exit(1)


def read_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def slugify(text):
    text = text.lower()
    text = re.sub(r"[’'`]", "", text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def strip_md(text):
    """Remove emphasis markers; the book only uses * for emphasis here."""
    text = text.replace("**", "")
    text = re.sub(r"\*([^*\n]+)\*", r"\1", text)
    text = text.replace("*", "")
    return text


def normalize_block(text):
    """Re-join wrapped lines into paragraphs; preserve paragraph breaks as \n\n."""
    paragraphs = re.split(r"\n\s*\n", text.strip())
    out = []
    for p in paragraphs:
        lines = [re.sub(r"\s+$", "", l).strip() for l in p.split("\n")]
        lines = [l for l in lines if l]
        if lines:
            out.append(re.sub(r"[ \t]+", " ", " ".join(lines)))
    return "\n\n".join(out)


def clean_text(text):
    return normalize_block(strip_md(text))


# ---------------------------------------------------------------------------
# Domain line parsing (chapter exercises)
# ---------------------------------------------------------------------------

def parse_domain_line(line, where):
    """Parse a '*SAA-C03 Domain ...*' line -> (domain:int, task:str|None).

    Formats seen in this book:
      *SAA-C03 Domain 1 — Task 1.1 (IAM roles, least privilege)*
      *SAA-C03 Domain 3 — Task 3.1 / Domain 4 — Task 4.1*
      *SAA-C03 Domain: Design Secure Architectures — Task 1.2*
      *SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*
      *SAA-C03 Domain: Cross-domain — Cloud concepts fundamentals*
      *SAA-C03 Domain: Cross-domain*
    """
    body = strip_md(line).strip()
    body = re.sub(r"^SAA-C03\s+", "", body)
    body = re.sub(r"^Domains?:\s*", "", body)
    # First domain = text up to the first ' / ' separator (multi-domain lines).
    first = re.split(r"\s*/\s*", body)[0]
    domain = None
    for rx, d in DOMAIN_NAME_HINTS:
        if rx.search(first):
            domain = d
            break
    if domain is None:
        fail("%s: cannot map domain line: %r" % (where, line))
    task = None
    m = re.search(r"Task\s*(\d+\.\d+)", first)
    if m:
        task = m.group(1)
    return domain, task


# ---------------------------------------------------------------------------
# Chapter exercises (chapters/en-us/NN-name.md)
# ---------------------------------------------------------------------------

EXERCISE_TITLE_RX = re.compile(r"^\*\*Exercise 2b? — SAA-C03 Scenario[^\n]*\*\*\s*$", re.M)


def chapter_code_from_filename(filename):
    m = re.match(r"^(\d+)([a-z]?)-", filename)
    if not m:
        fail("cannot derive chapter code from file %r" % filename)
    return m.group(1) + m.group(2).upper()


def split_option_lines(lines, where):
    """lines: option block lines (first starts with 'A) '). Returns list of dicts."""
    options = []
    cur_key = None
    cur_parts = []
    for line in lines:
        m = re.match(r"^([A-E])\)\s+(.*)$", line.strip())
        if m:
            if cur_key is not None:
                options.append((cur_key, " ".join(cur_parts)))
            cur_key = m.group(1)
            cur_parts = [m.group(2)]
        else:
            if cur_key is None:
                fail("%s: option continuation before first option: %r" % (where, line))
            cur_parts.append(line.strip())
    if cur_key is not None:
        options.append((cur_key, " ".join(cur_parts)))
    expected = ["A", "B", "C", "D", "E"][: len(options)]
    if [k for k, _ in options] != expected:
        fail("%s: option keys out of order: %s" % (where, [k for k, _ in options]))
    return [{"key": k, "text": clean_text(t)} for k, t in options]


def parse_chapter_exercise(title_line, block, where, chapter_code):
    is_2b = title_line.startswith("**Exercise 2b")
    # Locate the first option line.
    opt_match = re.search(r"^(A\)\s)", block, re.M)
    if not opt_match:
        fail("%s: no options found" % where)
    stem_raw = block[: opt_match.start()]
    rest = block[opt_match.start():]

    # Options run until the first blank line followed by a **Hint/**Answer marker.
    m = re.search(r"\n\s*\n(?=\*\*(?:Hint|Answer))", rest)
    if not m:
        fail("%s: cannot find end of options block" % where)
    options_raw = rest[: m.start()]
    tail = rest[m.end():]

    option_lines = [l for l in options_raw.split("\n") if l.strip()]
    options = split_option_lines(option_lines, where)

    # Hints
    hints = []
    for hm in re.finditer(r"\*\*Hint (\d)\*\*:\s*(.*?)(?=\n\s*\n)", tail, re.S):
        hints.append(clean_text(hm.group(2)))

    am = re.search(r"\*\*Answer\*\*:\s*([A-E](?:\s+and\s+[A-E])?)\s*\n", tail)
    if not am:
        fail("%s: no **Answer** found" % where)
    answers = re.split(r"\s+and\s+", am.group(1).strip())

    em = re.search(r"\*\*Explanation\*\*:\s*(.*?)(?=\n\s*\n\*\*Why not)", tail, re.S)
    if not em:
        fail("%s: no **Explanation** ... **Why not** sequence found" % where)
    explanation = clean_text(em.group(1))

    # Why-not paragraphs. The body ends at the next bold marker (which covers
    # both the next '**Why not' and extra sections like '**Exam-keyword
    # warning**') or at the '*SAA-C03' footer. Extra sections between the last
    # why-not and the footer are tolerated (skipped).
    why_nots = {}
    for wm in re.finditer(
        r"\*\*Why not ([A-E])\?\*\*\s*(.*?)(?=\n\s*\n\*\*|\n\s*\n\*SAA-C03|\Z)",
        tail, re.S,
    ):
        why_nots[wm.group(1)] = clean_text(wm.group(2))
    if not why_nots:
        fail("%s: no **Why not X?** paragraphs found" % where)

    dm = re.search(r"^\*SAA-C03 Domain.*$", tail, re.M)
    if not dm:
        fail("%s: no *SAA-C03 Domain* line found" % where)
    domain, task = parse_domain_line(dm.group(0), where)

    stem = clean_text(re.sub(r"^\*Scenario\*:\s*", "", stem_raw.strip()))
    if not stem:
        fail("%s: empty stem" % where)

    is_select_two = ("Select TWO" in title_line or "Select TWO" in stem
                     or "Choose TWO" in title_line or "Choose TWO" in stem)

    qid = "ch%s-ex2b" % chapter_code.lower() if is_2b else "ch%s-ex2" % chapter_code.lower()
    return {
        "id": qid,
        "source": "chapter",
        "sourceChapter": chapter_code,
        "domain": domain,
        "type": "select_two" if is_select_two else "single",
        "stem": stem,
        "options": options,
        "answers": answers,
        "explanation": explanation,
        "whyNots": why_nots,
        "hints": hints,
        "domainLabel": DOMAIN_LABELS[domain],
        "task": task,
    }


def list_chapter_files():
    """Numbered en-us chapter files (appendices and zz-* excluded)."""
    files = []
    for name in sorted(os.listdir(EN_DIR)):
        if re.match(r"^\d+[a-z]?-.*\.md$", name):
            files.append(os.path.join(EN_DIR, name))
    if not files:
        fail("no chapter files found under %s" % EN_DIR)
    return files


def count_exercise_titles():
    """Independent count of exercise blocks across en-us chapters (for the
    parse-everything-we-see contract check)."""
    total = 0
    for path in list_chapter_files():
        total += len(EXERCISE_TITLE_RX.findall(read_text(path)))
    return total


def parse_chapter_questions():
    questions = []
    for path in list_chapter_files():
        filename = os.path.basename(path)
        text = read_text(path)
        for tm in EXERCISE_TITLE_RX.finditer(text):
            where = "%s:%d" % (os.path.relpath(path, ROOT), text.count("\n", 0, tm.start()) + 1)
            # Block ends at the next **Exercise heading or next ## section.
            end_m = re.search(r"^\*\*Exercise |^## ", text[tm.end():], re.M)
            block = text[tm.end(): tm.end() + (end_m.start() if end_m else len(text))]
            chapter_code = chapter_code_from_filename(filename)
            questions.append(parse_chapter_exercise(tm.group(0), block, where, chapter_code))
    return questions


# ---------------------------------------------------------------------------
# Appendix D mock exam (chapters/en-us/appendix-d.md)
# ---------------------------------------------------------------------------

def parse_why_not_groups(body, where):
    """Parse '*Why not the others:* A — text; B and D — text; C, E — text.'
    Letters may be grouped ('A and C', 'A, C, D'); each letter in a group gets
    the same explanation text. Text itself may contain semicolons, so segments
    are split on '; LETTER(S) —' boundaries only."""
    why_nots = {}
    rx = re.compile(
        r"([A-E](?:(?:,\s*|\s+and\s+)[A-E])*)\s+—\s+(.*?)(?=;\s*[A-E](?:(?:,\s*|\s+and\s+)[A-E])*\s+—|\Z)",
        re.S,
    )
    matched_any = False
    for m in rx.finditer(body):
        matched_any = True
        letters = re.split(r",\s*|\s+and\s+", m.group(1))
        text = clean_text(m.group(2).rstrip().rstrip("."))
        for letter in letters:
            letter = letter.strip()
            if letter in why_nots:
                fail("%s: duplicate why-not letter %s" % (where, letter))
            why_nots[letter] = text
    if not matched_any:
        fail("%s: cannot parse why-not body: %r" % (where, body[:120]))
    return why_nots


def parse_exam_questions():
    path = os.path.join(EN_DIR, "appendix-d.md")
    text = read_text(path)
    parts = text.split("## Answer Key")
    if len(parts) != 2:
        fail("appendix-d: expected exactly one '## Answer Key' heading")
    part1, part2 = parts

    # --- Part 1: question stems + options. Header carries domain and task:
    #     **Question N** *(Domain D — Task T.T)*
    stems = {}
    q_rx = re.compile(
        r"\*\*Question (\d+)\*\*\s+\*\(Domain (\d+) — Task (\d+\.\d+)\)\*\n"
        r"(.*?)(?=\n\*\*Question \d+\*\*|\n---|\n## |\Z)",
        re.S,
    )
    for bm in q_rx.finditer(part1):
        num = int(bm.group(1))
        domain = int(bm.group(2))
        task = bm.group(3)
        body = bm.group(4).strip()
        where = "appendix-d Question %d" % num
        lines = [l for l in body.split("\n") if l.strip()]
        opt_idx = None
        for i, l in enumerate(lines):
            if re.match(r"^[A-E]\)\s", l):
                opt_idx = i
                break
        if opt_idx is None:
            fail("%s: no options found" % where)
        stem = clean_text("\n".join(lines[:opt_idx]))
        options = split_option_lines(lines[opt_idx:], where)
        if num in stems:
            fail("%s: duplicate question number" % where)
        stems[num] = (stem, options, domain, task)

    # --- Answer key: one compact paragraph per question:
    #     **N. Answer: X[, Y]** — explanation. *Why not the others:* A — ...; B — ...
    answers_part = {}
    k_rx = re.compile(
        r"\*\*(\d+)\. Answer: ([A-E](?:,\s*[A-E])*)\*\*\s+—\s+"
        r"(.*?)(?=\n\s*\n\*\*\d+\. Answer:|\n\s*\n---|\n\s*\n## |\Z)",
        re.S,
    )
    for bm in k_rx.finditer(part2):
        num = int(bm.group(1))
        ans = [a.strip() for a in bm.group(2).split(",")]
        body = bm.group(3).strip()
        where = "appendix-d Answer Key Question %d" % num

        wn_marker = re.search(r"\*Why not the others:\*", body)
        if not wn_marker:
            fail("%s: no '*Why not the others:*' marker" % where)
        explanation_raw = body[: wn_marker.start()]
        wn_raw = body[wn_marker.end():].strip()
        why_nots = parse_why_not_groups(wn_raw, where)

        if num in answers_part:
            fail("%s: duplicate answer key entry" % where)
        answers_part[num] = {
            "answers": ans,
            "explanation": clean_text(explanation_raw),
            "whyNots": why_nots,
        }

    expected = list(range(1, EXAM_QUESTION_COUNT + 1))
    if sorted(stems) != expected:
        fail("appendix-d: Part 1 question numbers incomplete: %s" % sorted(stems))
    if sorted(answers_part) != expected:
        fail("appendix-d: Answer Key question numbers incomplete: %s" % sorted(answers_part))

    questions = []
    for num in expected:
        stem, options, domain, task = stems[num]
        meta = answers_part[num]
        select_two = "(Choose TWO" in stem or len(meta["answers"]) == 2
        questions.append({
            "id": "appd-q%02d" % num,
            "source": "exam",
            "sourceChapter": None,  # Appendix D's key does not map to chapters
            "domain": domain,
            "type": "select_two" if select_two else "single",
            "stem": stem,
            "options": options,
            "answers": meta["answers"],
            "explanation": meta["explanation"],
            "whyNots": meta["whyNots"],
            "hints": [],
            "domainLabel": DOMAIN_LABELS[domain],
            "task": task,
        })
    return questions


# ---------------------------------------------------------------------------
# Flashcards source 1: glossary (chapters/en-us/appendix-c.md)
# ---------------------------------------------------------------------------

def parse_glossary_flashcards():
    path = os.path.join(EN_DIR, "appendix-c.md")
    text = read_text(path)
    cards = []
    rx = re.compile(r"^\*\*(.+?)\*\* — (.+)$", re.M)
    for m in rx.finditer(text):
        term = strip_md(m.group(1)).strip()
        rest = m.group(2).strip()
        where = "appendix-c entry %r" % term

        source_chapter = None
        domain = None

        # Trailing Domain sentence: 'Domain 3.', 'Domain 2, 3.', 'Cross-domain.',
        # 'All domains.'
        dm = re.search(
            r"\s*(?:(?:Domains?\s+([0-9]+(?:,\s*[0-9]+)*))|(Cross-domain)|(All domains))\.\s*$",
            rest,
        )
        if dm:
            if dm.group(1):
                domain = int(dm.group(1).split(",")[0])
            else:
                domain = 0
            rest = rest[: dm.start()].rstrip()

        # Trailing Chapter sentence. Variants: 'Chapter 7.', 'Chapter 11, 30.',
        # 'Chapters 18, 30.', 'Chapter 32, Chapter 34.'
        cm = re.search(
            r"\s*Chapters?\s+([0-9]+[A-Z]?(?:,\s*(?:Chapters?\s+)?(?:[0-9]+[A-Z]?|Epilogue))*)\.\s*$",
            rest,
        )
        if cm:
            first = cm.group(1).split(",")[0].strip()
            first = re.sub(r"^Chapters?\s+", "", first)
            source_chapter = first
            rest = rest[: cm.start()].rstrip()

        definition = clean_text(rest)
        if not definition:
            fail("%s: empty definition" % where)
        if domain is None:
            # Cross-reference entries like 'DLQ — See Dead Letter Queue.'
            domain = 0
        cards.append({
            "id": "fc-" + slugify(term),
            "source": "glossary",
            "term": term,
            "definition": definition,
            "analogy": None,
            "sourceChapter": source_chapter,
            "domain": domain,
            "domainLabel": DOMAIN_LABELS[domain],
        })
    if len(cards) < 100:
        fail("appendix-c: expected >=100 glossary entries, got %d" % len(cards))
    ids = [c["id"] for c in cards]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        fail("appendix-c: duplicate flashcard ids: %s" % dupes)
    return cards


# ---------------------------------------------------------------------------
# Flashcards source 2: root flashcards.md (service cards by domain)
# ---------------------------------------------------------------------------

def flashcards_md_domain(heading, where):
    m = re.match(r"DOMAIN\s+(\d)\b", heading)
    if m:
        return int(m.group(1))
    if re.match(r"CROSS-DOMAIN", heading, re.I):
        return 0
    fail("%s: cannot map flashcards.md section heading %r" % (where, heading))


def parse_servicecard_flashcards():
    text = read_text(FLASHCARDS_MD)
    cards = []
    current_domain = None
    # Walk '## ' sections, then '### ' cards inside each.
    section_rx = re.compile(r"^## (.+)$", re.M)
    sections = list(section_rx.finditer(text))
    for i, sm in enumerate(sections):
        heading = sm.group(1).strip()
        start = sm.end()
        end = sections[i + 1].start() if i + 1 < len(sections) else len(text)
        body = text[start:end]
        current_domain = flashcards_md_domain(heading, "flashcards.md section %r" % heading)

        for cm in re.finditer(r"^### ([^\n]+)\n(.*?)(?=^### |\Z)", body, re.S | re.M):
            name = strip_md(cm.group(1)).strip()
            card_body = cm.group(2)
            where = "flashcards.md card %r" % name
            # Cards are '**Label:** value' lines. The contract is the presence
            # of '**What it is:**'; other labels vary (most cards have
            # 'Use when' / 'Keywords' / 'Trade-off', a few — e.g. Shared
            # Responsibility Model — use bespoke labels, which are folded
            # into the definition).
            fields = []
            for fm in re.finditer(
                r"^\*\*([^*\n]+?):\*\*\s*(.*?)(?=\n\*\*[^*\n]+?:\*\*|\n\s*\n|\n---|\Z)",
                card_body, re.S | re.M,
            ):
                fields.append((fm.group(1).strip(), clean_text(fm.group(2))))
            labels = [l for l, _ in fields]
            if "What it is" not in labels:
                # Non-card sections (tables, quick references) — skip silently.
                continue
            field_map = dict(fields)
            if len(field_map) != len(fields):
                fail("%s: duplicate field labels" % where)
            what = field_map["What it is"]
            if not what:
                fail("%s: empty 'What it is'" % where)
            parts = [what]
            for label, value in fields:
                if label in ("What it is", "Keywords", "Trade-off"):
                    continue
                parts.append("%s: %s" % (label, value))
            definition = "\n\n".join(parts)
            tradeoff = field_map.get("Trade-off")
            card = {
                "id": "sc-" + slugify(name),
                "source": "service",
                "term": name,
                "definition": definition,
                "analogy": None,
                "sourceChapter": None,
                "domain": current_domain,
                "domainLabel": DOMAIN_LABELS[current_domain],
            }
            if tradeoff:
                # Extra field; the PWA ignores unknown fields (forward-compatible).
                card["tradeoff"] = tradeoff
            cards.append(card)
    if len(cards) < 30:
        fail("flashcards.md: expected >=30 service cards, got %d" % len(cards))
    ids = [c["id"] for c in cards]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        fail("flashcards.md: duplicate card ids: %s" % dupes)
    return cards


# ---------------------------------------------------------------------------
# Envelope helpers
# ---------------------------------------------------------------------------

def git_head_date():
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cI"],
            cwd=ROOT, capture_output=True, text=True, timeout=20,
        )
        if out.returncode == 0 and out.stdout.strip():
            return out.stdout.strip()
    except Exception:
        pass
    return "1970-01-01T00:00:00Z"


def content_hash(paths):
    h = hashlib.sha256()
    for p in sorted(paths):
        with open(p, "rb") as f:
            h.update(f.read())
    return h.hexdigest()[:12]


def by_domain(items):
    counts = {str(d): 0 for d in range(5)}
    for it in items:
        counts[str(it["domain"])] += 1
    return counts


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate_questions(questions, expected_chapter_count):
    chapter_q = [q for q in questions if q["source"] == "chapter"]
    exam_q = [q for q in questions if q["source"] == "exam"]
    expected_total = expected_chapter_count + EXAM_QUESTION_COUNT
    if (len(questions) != expected_total
            or len(chapter_q) != expected_chapter_count
            or len(exam_q) != EXAM_QUESTION_COUNT):
        fail("question counts wrong: total=%d chapter=%d exam=%d (expected %d/%d/%d)"
             % (len(questions), len(chapter_q), len(exam_q),
                expected_total, expected_chapter_count, EXAM_QUESTION_COUNT))
    exam_nums = sorted(int(q["id"][-2:]) for q in exam_q)
    if exam_nums != list(range(1, EXAM_QUESTION_COUNT + 1)):
        fail("exam question numbers incomplete")
    ids = [q["id"] for q in questions]
    if len(set(ids)) != len(ids):
        fail("duplicate question ids")
    for q in questions:
        keys = [o["key"] for o in q["options"]]
        if len(q["options"]) < 4:
            fail("%s: fewer than 4 options" % q["id"])
        if not set(q["answers"]) <= set(keys):
            fail("%s: answers %s not subset of option keys %s" % (q["id"], q["answers"], keys))
        if q["type"] == "select_two":
            if len(q["options"]) != 5 or len(q["answers"]) != 2:
                fail("%s: select_two must have 5 options and 2 answers" % q["id"])
        elif q["type"] == "single":
            if len(q["answers"]) != 1:
                fail("%s: single must have exactly 1 answer" % q["id"])
        else:
            fail("%s: unknown type %r" % (q["id"], q["type"]))
        if not q["explanation"].strip():
            fail("%s: empty explanation" % q["id"])
        wrong = set(keys) - set(q["answers"])
        if not set(q["whyNots"]) <= wrong:
            fail("%s: whyNots keys %s not subset of wrong letters %s"
                 % (q["id"], sorted(q["whyNots"]), sorted(wrong)))
        if len(q["whyNots"]) < 1:
            fail("%s: whyNots empty" % q["id"])
        if q["domain"] not in DOMAIN_LABELS:
            fail("%s: invalid domain %r" % (q["id"], q["domain"]))
        for o in q["options"]:
            if not o["text"].strip():
                fail("%s: empty option text for %s" % (q["id"], o["key"]))
        if not q["stem"].strip():
            fail("%s: empty stem" % q["id"])


def validate_flashcards(cards):
    if len(cards) < 150:
        fail("flashcards: expected >=150, got %d" % len(cards))
    ids = [c["id"] for c in cards]
    if len(set(ids)) != len(ids):
        dupes = sorted({i for i in ids if ids.count(i) > 1})
        fail("flashcards: duplicate ids: %s" % dupes)
    for c in cards:
        if not c["term"].strip() or not c["definition"].strip():
            fail("flashcard %s: empty term or definition" % c["id"])
        if c["domain"] not in range(5):
            fail("flashcard %s: invalid domain %r" % (c["id"], c["domain"]))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    source_paths = []
    for name in sorted(os.listdir(EN_DIR)):
        if name.endswith(".md"):
            source_paths.append(os.path.join(EN_DIR, name))
    source_paths.append(FLASHCARDS_MD)

    expected_chapter_count = count_exercise_titles()
    if expected_chapter_count < 30:
        fail("suspiciously few chapter exercises found: %d" % expected_chapter_count)

    chapter_questions = parse_chapter_questions()
    exam_questions = parse_exam_questions()
    questions = chapter_questions + exam_questions
    validate_questions(questions, expected_chapter_count)

    glossary_cards = parse_glossary_flashcards()
    service_cards = parse_servicecard_flashcards()
    flashcards = glossary_cards + service_cards
    validate_flashcards(flashcards)

    generated_at = git_head_date()
    chash = content_hash(source_paths)

    select_two = [q for q in questions if q["type"] == "select_two"]
    questions_doc = {
        "schemaVersion": SCHEMA_VERSION,
        "generatedAt": generated_at,
        "contentHash": chash,
        "counts": {
            "total": len(questions),
            "chapter": len(chapter_questions),
            "exam": len(exam_questions),
            "selectTwo": len(select_two),
            "byDomain": by_domain(questions),
        },
        "questions": questions,
    }
    flashcards_doc = {
        "schemaVersion": SCHEMA_VERSION,
        "generatedAt": generated_at,
        "contentHash": chash,
        "counts": {
            "total": len(flashcards),
            "glossary": len(glossary_cards),
            "services": len(service_cards),
            "byDomain": by_domain(flashcards),
        },
        "flashcards": flashcards,
    }

    os.makedirs(API_DIR, exist_ok=True)
    for name, doc in (("questions.json", questions_doc), ("flashcards.json", flashcards_doc)):
        path = os.path.join(API_DIR, name)
        payload = json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n"
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(payload)

    print("generated docs/api/questions.json and docs/api/flashcards.json")
    print("generatedAt: %s  contentHash: %s" % (generated_at, chash))
    print("questions: total=%d chapter=%d exam=%d selectTwo=%d"
          % (len(questions), len(chapter_questions), len(exam_questions), len(select_two)))
    print("  questions byDomain: %s" % json.dumps(by_domain(questions)))
    print("flashcards: total=%d glossary=%d services=%d"
          % (len(flashcards), len(glossary_cards), len(service_cards)))
    print("  flashcards byDomain: %s" % json.dumps(by_domain(flashcards)))


if __name__ == "__main__":
    main()
