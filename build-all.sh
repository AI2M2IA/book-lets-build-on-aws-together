#!/usr/bin/env bash
# build-all.sh — Builds EPUB + PDF for every language found in chapters/
#
# For each directory under chapters/ (e.g. en-us, th, hi, he, vi):
#   - Uses assets/<lang>/front-matter.md  (falls back to assets/front-matter.md)
#   - Uses assets/<lang>/metadata.yaml    (falls back to assets/metadata.yaml)
#   - Outputs build/epub/lets-build-on-aws-together-<lang>.epub
#   - Outputs build/pdf/lets-build-on-aws-together-<lang>.pdf
#
# Usage:
#   bash build-all.sh              # build all languages
#   bash build-all.sh th hi        # build only Thai and Hindi
#
# Font overrides for PDF (defaults: Georgia / Menlo on macOS, Liberation Serif / DejaVu Sans Mono on Linux):
#   MAINFONT / MONOFONT — used only for Latin-script languages (en-us, vi, pt-br, etc.)
#   Non-Latin scripts (hi, th, he, ar, ja, ko, zh, …) use Noto Serif / Noto Sans Mono automatically.
#
# Required tools: pandoc, tectonic, rsvg-convert
# Required fonts for non-Latin PDF: fonts-noto (Ubuntu) or Noto fonts (macOS via brew)

set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
BUILD="$REPO/build"
ASSETS="$REPO/assets"
STYLES="$ASSETS/styles"
CHAPTERS_ROOT="$REPO/chapters"
COVER_PNG="$BUILD/kdp/cover.png"

# ── Dependency check ───────────────────────────────────────────────────────────
check_dep() { command -v "$1" &>/dev/null || { echo "ERROR: '$1' not found."; exit 1; }; }
check_dep pandoc
check_dep tectonic
check_dep rsvg-convert

echo "=== Let's Build on AWS Together — Build All Languages ==="
echo "  pandoc   $(pandoc --version | head -1)"
echo "  tectonic $(tectonic --version 2>&1 | head -1)"
echo ""

mkdir -p "$BUILD/epub" "$BUILD/pdf" "$BUILD/kdp"

# ── Convert cover SVG → PNG (once, shared by all) ─────────────────────────────
if [[ ! -f "$COVER_PNG" ]]; then
  echo "→ Converting cover SVG to PNG..."
  rsvg-convert --format=png --width=1800 --height=2700 \
    --output="$COVER_PNG" "$ASSETS/cover/cover.svg"
  echo "  cover.png: $(du -sh "$COVER_PNG" | cut -f1)"
  echo ""
fi

# ── Determine which languages to build ────────────────────────────────────────
if [[ $# -gt 0 ]]; then
  LANGS=("$@")
else
  LANGS=()
  for dir in "$CHAPTERS_ROOT"/*/; do
    [[ -d "$dir" ]] && LANGS+=("$(basename "$dir")")
  done
fi

echo "Languages to build: ${LANGS[*]}"
echo ""

# ── Font selection per language ────────────────────────────────────────────────
# Returns "mainfont:monofont" for the given language code.
# Latin-script languages use the environment's MAINFONT/MONOFONT (default: Georgia/Menlo).
# Non-Latin scripts use Noto Serif variants, which support Unicode across all scripts.
get_fonts() {
  local lang="$1"
  local mono="${MONOFONT:-Menlo}"
  local latin_main="${MAINFONT:-Georgia}"
  case "$lang" in
    hi|mr|ne|sa|bn|gu|pa|or|te|ta|kn|ml)  # Indic scripts (Devanagari etc.)
      echo "Noto Serif Devanagari:Noto Sans Mono" ;;
    th|lo|km)                               # Southeast Asian scripts
      echo "Noto Serif Thai:Noto Sans Mono" ;;
    he|yi)                                  # Hebrew
      echo "Noto Serif Hebrew:Noto Sans Mono" ;;
    ar|fa|ur)                               # Arabic / Persian / Urdu (RTL)
      echo "Noto Naskh Arabic:Noto Sans Mono" ;;
    ja)                                     # Japanese
      echo "Noto Serif CJK JP:Noto Sans Mono" ;;
    ko)                                     # Korean
      echo "Noto Serif CJK KR:Noto Sans Mono" ;;
    zh|zh-cn|zh-tw)                         # Chinese
      echo "Noto Serif CJK SC:Noto Sans Mono" ;;
    *)                                      # Latin-script (en-us, vi, pt-br, de, fr, …)
      echo "${latin_main}:${mono}" ;;
  esac
}

# ── RTL detection ──────────────────────────────────────────────────────────────
is_rtl() {
  case "$1" in
    he|ar|fa|ur|yi) return 0 ;;
    *)              return 1 ;;
  esac
}

# ── Build one language ─────────────────────────────────────────────────────────
build_lang() {
  local lang="$1"
  local chapters_dir="$CHAPTERS_ROOT/$lang"

  if [[ ! -d "$chapters_dir" ]]; then
    echo "  WARNING: chapters/$lang/ not found — skipping."
    return 0
  fi

  local file_count
  file_count=$(find "$chapters_dir" -maxdepth 1 -name "*.md" | wc -l | tr -d ' ')
  if [[ "$file_count" -eq 0 ]]; then
    echo "  WARNING: chapters/$lang/ has no .md files — skipping."
    return 0
  fi

  # Language-specific assets, fall back to English defaults
  local front_matter metadata
  front_matter=$( [[ -f "$ASSETS/$lang/front-matter.md" ]] && echo "$ASSETS/$lang/front-matter.md" || echo "$ASSETS/front-matter.md" )
  metadata=$(     [[ -f "$ASSETS/$lang/metadata.yaml"   ]] && echo "$ASSETS/$lang/metadata.yaml"   || echo "$ASSETS/metadata.yaml"   )

  local epub_out="$BUILD/epub/lets-build-on-aws-together-${lang}.epub"
  local pdf_out="$BUILD/pdf/lets-build-on-aws-together-${lang}.pdf"
  local manuscript="$BUILD/manuscript-${lang}.md"

  echo "════════════════════════════════════════"
  echo " $lang  ($file_count chapters)"
  echo "════════════════════════════════════════"

  # ── Assemble manuscript ──────────────────────────────────────────────────────
  echo "→ Assembling manuscript..."
  cat "$front_matter" > "$manuscript"
  while IFS= read -r -d '' f; do
    printf '\n' >> "$manuscript"
    cat "$f"    >> "$manuscript"
    printf '\n' >> "$manuscript"
  done < <(find "$chapters_dir" -maxdepth 1 -name "*.md" -print0 | sort -z)
  echo "  Lines: $(wc -l < "$manuscript")  Words: $(wc -w < "$manuscript")"

  # ── EPUB ─────────────────────────────────────────────────────────────────────
  echo "→ Generating EPUB..."
  pandoc "$manuscript" \
    --from markdown+smart \
    --to epub3 \
    --output "$epub_out" \
    --metadata-file "$metadata" \
    --css "$STYLES/kindle.css" \
    --epub-cover-image "$COVER_PNG" \
    --toc --toc-depth=2 --split-level=1 \
    --highlight-style=tango \
    --standalone
  echo "  EPUB: $epub_out ($(du -sh "$epub_out" | cut -f1))"

  # ── EPUB patch ───────────────────────────────────────────────────────────────
  echo "→ Patching EPUB..."
  python3 - "$epub_out" "$lang" << 'PYEOF'
import sys, zipfile, shutil, os, re as _re

epub_path = sys.argv[1]
lang      = sys.argv[2]
tmp_dir   = epub_path + ".patch_tmp"

if os.path.exists(tmp_dir):
    shutil.rmtree(tmp_dir)
os.makedirs(tmp_dir)

with zipfile.ZipFile(epub_path, "r") as z:
    z.extractall(tmp_dir)

# nav.xhtml patches — English only (strings are language-specific)
if lang == "en-us":
    nav_path = os.path.join(tmp_dir, "EPUB", "nav.xhtml")
    with open(nav_path, "r", encoding="utf-8") as f:
        nav = f.read()
    # Use Unicode escape for the right single quotation mark (U+2019)
    nav = nav.replace(
        ">Let’s Build on AWS Together</a></li>",
        ">Copyright</a></li>", 1)
    bodymatter = (
        "\n    <li>\n      "
        "<a href=\"text/ch003.xhtml\" epub:type=\"bodymatter\">Start Reading</a>\n    </li>"
    )
    nav = nav.replace(
        "\n    <li>\n      <a href=\"text/title_page.xhtml\" epub:type=\"titlepage\">",
        bodymatter + "\n    <li>\n      <a href=\"text/title_page.xhtml\" epub:type=\"titlepage\">",
        1)
    with open(nav_path, "w", encoding="utf-8") as f:
        f.write(nav)
    print("  nav.xhtml patched")

# Accessibility: add scope="col" to all <th> elements
text_dir = os.path.join(tmp_dir, "EPUB", "text")
for xhtml in os.listdir(text_dir):
    if not xhtml.endswith(".xhtml"):
        continue
    fpath = os.path.join(text_dir, xhtml)
    with open(fpath, encoding="utf-8") as f:
        content = f.read()
    def add_scope(m):
        tag = m.group(0)
        return tag.replace("<th", "<th scope=\"col\"", 1) if "scope=" not in tag else tag
    new_content = _re.sub(r"<th(?=[\s>])[^>]*>", add_scope, content)
    if new_content != content:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)

# Repack (mimetype must be first and uncompressed per EPUB spec)
out_path = epub_path + ".new"
with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zout:
    zout.write(os.path.join(tmp_dir, "mimetype"), "mimetype",
               compress_type=zipfile.ZIP_STORED)
    for root, _dirs, files in os.walk(tmp_dir):
        for fname in files:
            full = os.path.join(root, fname)
            arc  = os.path.relpath(full, tmp_dir)
            if arc == "mimetype":
                continue
            zout.write(full, arc)
shutil.move(out_path, epub_path)
shutil.rmtree(tmp_dir)
print("  th[scope] accessibility fix applied")
PYEOF

  # ── PDF ──────────────────────────────────────────────────────────────────────
  echo "→ Generating PDF..."

  # Resolve fonts for this language
  local fonts
  fonts=$(get_fonts "$lang")
  local main_font="${fonts%%:*}"
  local mono_font="${fonts##*:}"
  echo "  Fonts: $main_font / $mono_font"

  # RTL flag
  local rtl_flag=""
  if is_rtl "$lang"; then
    rtl_flag="--variable=dir:rtl"
  fi

  pandoc "$manuscript" \
    --from markdown+smart \
    --to pdf \
    --output "$pdf_out" \
    --metadata-file "$metadata" \
    --pdf-engine=tectonic \
    --include-in-header "$STYLES/pdf-header.tex" \
    --toc --toc-depth=2 \
    --top-level-division=chapter \
    --highlight-style=tango \
    --standalone \
    --variable=documentclass:book \
    --variable=classoption:openany \
    --variable=fontsize:11pt \
    --variable=linestretch:1.45 \
    --variable=mainfont:"$main_font" \
    --variable=monofont:"$mono_font" \
    --variable=monofontoptions:"Scale=0.85" \
    --variable=geometry:"paperwidth=6in,paperheight=9in,top=0.875in,bottom=0.875in,inner=0.875in,outer=0.625in" \
    --variable=colorlinks:true \
    --variable=linkcolor:blue \
    --variable=urlcolor:blue \
    --variable=graphics:true \
    ${rtl_flag:+"$rtl_flag"}

  echo "  PDF:  $pdf_out ($(du -sh "$pdf_out" | cut -f1))"

  # Clean up manuscript temp file
  rm -f "$manuscript"
  echo ""
}

# ── Run all languages ─────────────────────────────────────────────────────────
FAILED=()
for lang in "${LANGS[@]}"; do
  if ! build_lang "$lang"; then
    FAILED+=("$lang")
    echo "  FAILED: $lang"
    echo ""
  fi
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo "════════════════════════════════════════"
echo " Summary"
echo "════════════════════════════════════════"
echo ""
echo "EPUBs:"
ls -lh "$BUILD/epub"/lets-build-on-aws-together-*.epub 2>/dev/null \
  | awk '{print "  " $NF "  " $5}' || echo "  (none)"
echo ""
echo "PDFs:"
ls -lh "$BUILD/pdf"/lets-build-on-aws-together-*.pdf 2>/dev/null \
  | awk '{print "  " $NF "  " $5}' || echo "  (none)"

if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo ""
  echo "FAILED languages: ${FAILED[*]}"
  exit 1
fi

echo ""
echo "✅ All languages built successfully."
