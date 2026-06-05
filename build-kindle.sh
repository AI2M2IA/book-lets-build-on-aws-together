#!/usr/bin/env bash
# build.sh — Assembles and compiles "Let's Build on AWS Together"
# Follows the same build pattern as "Let's Learn Java Together?" (AI(2)M(2)IA series)
# Outputs: EPUB3, PDF (KDP-ready 6x9), cover PNG
set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
BUILD="$REPO/build"
CHAPTERS="$REPO/chapters/en-us"
ASSETS="$REPO/assets"
STYLES="$ASSETS/styles"

EPUB_OUT="$BUILD/epub/lets-build-on-aws-together.epub"
PDF_OUT="$BUILD/pdf/lets-build-on-aws-together.pdf"
COVER_PNG="$BUILD/kdp/cover.png"
COVER_BACK_PNG="$BUILD/kdp/cover-back.png"
MANUSCRIPT="$BUILD/manuscript.md"

mkdir -p "$BUILD/epub" "$BUILD/pdf" "$BUILD/kdp"

echo "=== Let's Build on AWS Together — Build Script ==="
echo ""

# ── 1. Check dependencies ────────────────────────────────────────────────────
check_dep() {
  command -v "$1" &>/dev/null || { echo "ERROR: '$1' not found. Install it first."; exit 1; }
}
check_dep pandoc
check_dep tectonic
check_dep rsvg-convert
check_dep python3


echo "  $(pandoc --version | head -1)"
echo "  tectonic: $(tectonic --version 2>&1 | head -1)"
echo "  rsvg-convert: $(rsvg-convert --version 2>&1 | head -1)"
echo ""

# ── 2. Convert SVG covers to PNG (needed before PDF build) ───────────────────
echo "→ Converting SVG covers to PNG (1800×2700px)..."

rsvg-convert --format=png --width=1800 --height=2700 --output="$COVER_PNG" "$ASSETS/cover/cover.svg"
echo "  Front cover: $COVER_PNG ($(du -sh "$COVER_PNG" | cut -f1))"

rsvg-convert --format=png --width=1800 --height=2700 --output="$COVER_BACK_PNG" "$ASSETS/cover/cover-back.svg"
echo "  Back cover:  $COVER_BACK_PNG ($(du -sh "$COVER_BACK_PNG" | cut -f1))"
echo ""

# ── 3. Build manuscript (front matter + ordered chapters) ────────────────────
echo "→ Assembling manuscript..."
rm -f "$MANUSCRIPT"

cat "$ASSETS/front-matter.md" >> "$MANUSCRIPT"
echo "" >> "$MANUSCRIPT"

for file in $(find "$CHAPTERS" -maxdepth 1 -name "*.md" | sort); do
  echo "  + $(basename "$file")"
  echo "" >> "$MANUSCRIPT"
  cat "$file" >> "$MANUSCRIPT"
  echo "" >> "$MANUSCRIPT"
done

echo "  Lines: $(wc -l < "$MANUSCRIPT")  Words: $(wc -w < "$MANUSCRIPT")"
echo ""

# ── 4. Generate EPUB ─────────────────────────────────────────────────────────
echo "→ Generating EPUB..."

pandoc "$MANUSCRIPT" \
  --from markdown+smart \
  --to epub3 \
  --output "$EPUB_OUT" \
  --metadata-file "$ASSETS/metadata.yaml" \
  --css "$STYLES/kindle.css" \
  --epub-cover-image "$COVER_PNG" \
  --toc \
  --toc-depth=2 \
  --split-level=1 \
  --highlight-style=tango \
  --standalone

echo "  EPUB: $EPUB_OUT ($(du -sh "$EPUB_OUT" | cut -f1))"
echo ""

# ── 4b. Patch EPUB nav.xhtml (bodymatter landmark + TOC label fix) ───────────
echo "→ Patching EPUB nav.xhtml..."
python3 - "$EPUB_OUT" <<'PYEOF'
import sys, zipfile, shutil, os

epub_path = sys.argv[1]
tmp_dir   = epub_path + ".patch_tmp"

if os.path.exists(tmp_dir):
    shutil.rmtree(tmp_dir)
os.makedirs(tmp_dir)

with zipfile.ZipFile(epub_path, 'r') as z:
    z.extractall(tmp_dir)

nav_path = os.path.join(tmp_dir, "EPUB", "nav.xhtml")
with open(nav_path, 'r', encoding='utf-8') as f:
    nav = f.read()

# Rename copyright TOC entry (title uses U+2019 right single quotation mark)
nav = nav.replace(
    '>Let\u2019s Build on AWS Together</a></li>',
    '>Copyright</a></li>',
    1  # only first occurrence (ch001 TOC entry)
)

# Add bodymatter landmark before titlepage entry (4-space indent on <li>, 6 on <a>)
bodymatter = (
    '\n    <li>\n      '
    '<a href="text/ch003.xhtml" epub:type="bodymatter">Start Reading</a>\n    </li>'
)
nav = nav.replace(
    '\n    <li>\n      <a href="text/title_page.xhtml" epub:type="titlepage">',
    bodymatter + '\n    <li>\n      <a href="text/title_page.xhtml" epub:type="titlepage">',
    1
)

with open(nav_path, 'w', encoding='utf-8') as f:
    f.write(nav)

# Add scope="col" to all <th> elements across chapter files (accessibility)
import re as _re
text_dir = os.path.join(tmp_dir, "EPUB", "text")
th_fixed = 0
for xhtml in os.listdir(text_dir):
    if not xhtml.endswith(".xhtml"):
        continue
    fpath = os.path.join(text_dir, xhtml)
    with open(fpath, encoding='utf-8') as f:
        content = f.read()
    def add_scope(m):
        tag = m.group(0)
        if 'scope=' not in tag:
            return tag.replace('<th', '<th scope="col"', 1)
        return tag
    new_content = _re.sub(r'<th(?=[\s>])[^>]*>', add_scope, content)
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        th_fixed += 1

# Repack EPUB (mimetype must be first and uncompressed per EPUB spec)
out_path = epub_path + ".new"
with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED) as zout:
    mimetype = os.path.join(tmp_dir, "mimetype")
    zout.write(mimetype, "mimetype", compress_type=zipfile.ZIP_STORED)
    for root, _dirs, files in os.walk(tmp_dir):
        for fname in files:
            full = os.path.join(root, fname)
            arc  = os.path.relpath(full, tmp_dir)
            if arc == "mimetype":
                continue
            zout.write(full, arc)

shutil.move(out_path, epub_path)
shutil.rmtree(tmp_dir)
print("  nav.xhtml patched (bodymatter landmark + Copyright label)")
print("  th[scope] accessibility fix applied")
PYEOF
echo ""

# ── 6. Generate PDF ──────────────────────────────────────────────────────────
# KDP note: the interior PDF does not include the cover image.
# Upload the cover separately in KDP via build/kdp/cover.png.
echo "→ Generating PDF (this may take a few minutes)..."

pandoc "$MANUSCRIPT" \
  --from markdown+smart \
  --to pdf \
  --output "$PDF_OUT" \
  --metadata-file "$ASSETS/metadata.yaml" \
  --pdf-engine=tectonic \
  --include-in-header "$STYLES/pdf-header.tex" \
  --toc \
  --toc-depth=2 \
  --top-level-division=chapter \
  --highlight-style=tango \
  --standalone \
  --variable=documentclass:book \
  --variable=classoption:openany \
  --variable=fontsize:11pt \
  --variable=linestretch:1.45 \
  --variable=mainfont:"${MAINFONT:-Georgia}" \
  --variable=monofont:"${MONOFONT:-Menlo}" \
  --variable=monofontoptions:"Scale=0.85" \
  --variable=geometry:"paperwidth=6in,paperheight=9in,top=0.875in,bottom=0.875in,inner=0.875in,outer=0.625in" \
  --variable=colorlinks:true \
  --variable=linkcolor:blue \
  --variable=urlcolor:blue \
  --variable=graphics:true

if [[ -f "$PDF_OUT" ]]; then
  echo "  PDF: $PDF_OUT ($(du -sh "$PDF_OUT" | cut -f1))"
else
  echo "  ERROR: PDF was not generated. Re-run with: bash build.sh 2>&1 | less"
  exit 1
fi
echo ""

# ── 6. Automated Kindle QA checks ────────────────────────────────────────────
echo "→ Running Kindle QA checks..."
QA_PASS=true

# 7a. EPUBCheck
if command -v epubcheck &>/dev/null; then
  EPUBCHECK_OUT=$(epubcheck "$EPUB_OUT" 2>&1)
  if echo "$EPUBCHECK_OUT" | grep -q "0 errors"; then
    echo "  ✓ EPUBCheck: 0 errors / 0 warnings"
  else
    echo "  ✗ EPUBCheck FAILED:"
    echo "$EPUBCHECK_OUT" | grep -E "ERROR|WARNING|fatal" | head -10
    QA_PASS=false
  fi
else
  echo "  ⚠ EPUBCheck not found — skipping"
fi

# 7b. Wide tables (>4 columns)
WIDE=$(python3 - "$CHAPTERS" <<'PYEOF'
import sys, glob, re
base = sys.argv[1]
files = sorted(glob.glob(f"{base}/*.md"))
wide = []
for fpath in files:
    ch = fpath.split("/")[-1][:-3]
    for lineno, line in enumerate(open(fpath), 1):
        if line.strip().startswith("|") and not re.match(r"^\s*\|[-:\s|]+\|\s*$", line):
            cols = len([c for c in line.split("|") if c.strip()])
            if cols >= 5:
                wide.append(f"    {ch}:{lineno} ({cols} cols)")
print("\n".join(wide))
PYEOF
)
if [[ -z "$WIDE" ]]; then
  echo "  ✓ Tables: no wide tables (>4 cols) found"
else
  echo "  ✗ Wide tables detected (Kindle risk):"
  echo "$WIDE"
  QA_PASS=false
fi

# 7d. Chapters missing Summary or Exam Tips
MISSING=$(python3 - "$CHAPTERS" <<'PYEOF' || true
import sys, glob
base = sys.argv[1]
skip = {"00-introduction", "33-when-it-depends", "34-what-architect-means",
        "appendix-a", "appendix-b", "appendix-c", "appendix-d", "zz-about-the-author"}
issues = []
for fpath in sorted(glob.glob(f"{base}/*.md")):
    ch = fpath.split("/")[-1][:-3]
    if any(ch.startswith(s) for s in skip):
        continue
    content = open(fpath).read()
    missing = []
    if "## Summary" not in content: missing.append("Summary")
    if "## Exam Tips" not in content: missing.append("Exam Tips")
    if "## Exercises" not in content: missing.append("Exercises")
    if missing:
        issues.append(f"    {ch}: missing {', '.join(missing)}")
print("\n".join(issues))
PYEOF
)
if [[ -z "$MISSING" ]]; then
  echo "  ✓ Chapter structure: all chapters complete"
else
  echo "  ✗ Incomplete chapters:"
  echo "$MISSING"
  QA_PASS=false
fi

# 7e. Landmarks check
LANDMARKS=$(python3 - "$EPUB_OUT" <<'PYEOF' || true
import sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as z:
    nav = z.read("EPUB/nav.xhtml").decode()
missing = []
for t in ["bodymatter", "titlepage", "cover", "toc"]:
    if f'epub:type="{t}"' not in nav:
        missing.append(t)
print("\n".join(f"    missing: {m}" for m in missing))
PYEOF
)
if [[ -z "$LANDMARKS" ]]; then
  echo "  ✓ EPUB landmarks: cover, toc, bodymatter all present"
else
  echo "  ✗ Landmarks missing:"
  echo "$LANDMARKS"
  QA_PASS=false
fi

echo ""
if [[ "$QA_PASS" == "true" ]]; then
  echo "  ✅ All QA checks passed — GO for KDP upload"
else
  echo "  ⚠️  QA issues found — fix before KDP upload"
fi
echo ""

# ── 8. Summary ───────────────────────────────────────────────────────────────
echo "=== Build complete ==="
echo ""
echo "  Interior PDF : $PDF_OUT"
echo "  EPUB (Kindle): $EPUB_OUT"
echo "  Cover PNG    : $COVER_PNG"
echo ""
echo "  See build/kdp/kdp-guidelines.md for KDP upload checklist."
echo ""
