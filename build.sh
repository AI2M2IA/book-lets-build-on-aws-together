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

# cover-page.tex with resolved absolute path
COVER_PAGE_TEX="$BUILD/cover-page-resolved.tex"

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

# ── 3. Generate resolved cover-page.tex ─────────────────────────────────────
sed "s|COVER_PNG_PATH|$COVER_PNG|g" "$STYLES/cover-page.tex" > "$COVER_PAGE_TEX"

# ── 4. Build manuscript (front matter + ordered chapters) ────────────────────
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

# ── 5. Generate EPUB ─────────────────────────────────────────────────────────
echo "→ Generating EPUB..."

pandoc "$MANUSCRIPT" \
  --from markdown+smart \
  --to epub3 \
  --output "$EPUB_OUT" \
  --metadata-file "$ASSETS/metadata.yaml" \
  --css "$STYLES/epub.css" \
  --epub-cover-image "$COVER_PNG" \
  --toc \
  --toc-depth=2 \
  --split-level=1 \
  --highlight-style=tango \
  --standalone

echo "  EPUB: $EPUB_OUT ($(du -sh "$EPUB_OUT" | cut -f1))"
echo ""

# ── 5b. Patch EPUB nav.xhtml (bodymatter landmark + TOC label fix) ───────────
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
PYEOF
echo ""

# ── 6. Generate PDF ──────────────────────────────────────────────────────────
echo "→ Generating PDF (this may take a few minutes)..."

pandoc "$MANUSCRIPT" \
  --from markdown+smart \
  --to pdf \
  --output "$PDF_OUT" \
  --metadata-file "$ASSETS/metadata.yaml" \
  --pdf-engine=tectonic \
  --include-in-header "$STYLES/pdf-header.tex" \
  --include-before-body "$COVER_PAGE_TEX" \
  --toc \
  --toc-depth=2 \
  --number-sections \
  --top-level-division=chapter \
  --highlight-style=tango \
  --standalone \
  --variable=documentclass:book \
  --variable=classoption:openany \
  --variable=fontsize:11pt \
  --variable=linestretch:1.45 \
  --variable=mainfont:Georgia \
  --variable=monofont:Menlo \
  --variable=monofontoptions:"Scale=0.85" \
  --variable=geometry:"paperwidth=6in,paperheight=9in,top=0.85in,bottom=0.85in,left=0.75in,right=0.75in" \
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

# ── 7. Summary ───────────────────────────────────────────────────────────────
echo "=== Build complete ==="
echo ""
echo "  Interior PDF : $PDF_OUT"
echo "  EPUB (Kindle): $EPUB_OUT"
echo "  Cover PNG    : $COVER_PNG"
echo ""
echo "  See build/kdp/kdp-guidelines.md for KDP upload checklist."
echo ""
