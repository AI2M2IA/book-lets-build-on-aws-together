#!/usr/bin/env python3
"""
wrap.py — Wraps a pandoc-converted chapter HTML in a styled book template.

Usage:
    python3 build/wrap.py <chapter-slug> [lang]

Examples:
    python3 build/wrap.py 01-why-the-cloud
    python3 build/wrap.py 01-why-the-cloud th

Output:
    build/<chapter-slug>.html
"""

import re
import sys
import subprocess
from pathlib import Path

REPO = Path(__file__).parent.parent
BUILD = REPO / "build"
CHAPTERS = REPO / "chapters"


def get_args(args):
    if len(args) < 2:
        print("Usage: python3 build/wrap.py <chapter-slug> [lang]")
        print("Example: python3 build/wrap.py 01-why-the-cloud")
        sys.exit(1)
    slug = args[1]
    lang = args[2] if len(args) > 2 else "en-us"
    return slug, lang


def convert_markdown(slug, lang):
    md_path = CHAPTERS / lang / f"{slug}.md"
    if not md_path.exists():
        print(f"ERROR: Chapter not found: {md_path}")
        sys.exit(1)
    temp_html = BUILD / "temp.html"
    result = subprocess.run(
        ["pandoc", str(md_path), "-o", str(temp_html), "--highlight-style=tango"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f"ERROR: pandoc failed:\n{result.stderr}")
        sys.exit(1)
    return temp_html


def fix_mermaid(match):
    code = match.group(1)
    code = code.replace("&quot;", '"')
    code = code.replace("&amp;", "&")
    code = code.replace("&lt;", "<")
    code = code.replace("&gt;", ">")
    code = code.replace("&#39;", "'")
    return f'<pre class="mermaid">{code}</pre>'


def wrap(slug, lang):
    temp_html = convert_markdown(slug, lang)

    with open(temp_html, "r", encoding="utf-8") as f:
        content = f.read()

    content = re.sub(
        r'<pre\s+class="mermaid"><code>(.*?)</code></pre>',
        fix_mermaid,
        content,
        flags=re.DOTALL,
    )

    title_words = slug.split("-")[1:]
    title = " ".join(w.capitalize() for w in title_words)
    full_title = f"Let's Build on AWS Together — {title}"
    lang_attr = "he" if lang in ("he", "ar", "ur") else "en"
    dir_attr = 'dir="rtl"' if lang in ("he", "ar", "ur") else ""

    html = f"""<!DOCTYPE html>
<html lang="{lang_attr}" {dir_attr}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{full_title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {{
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
        }}
        pre, code {{ font-family: 'Fira Code', monospace; }}
        .prose {{
            max-width: 48rem;
            margin: 0 auto;
            padding: 3rem 1.5rem;
            background: #ffffff;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            border-radius: 0.75rem;
        }}
        pre.sourceCode {{
            background-color: #1e293b !important;
            color: #f8fafc !important;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1.5rem 0;
            font-size: 0.875rem;
        }}
        pre.sourceCode code {{ background: transparent !important; color: inherit !important; padding: 0 !important; }}
        code {{
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
        }}
        .mermaid {{
            display: flex;
            justify-content: center;
            margin: 2rem 0;
            background-color: #ffffff;
            padding: 1.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
        }}
        h1 {{ font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.75rem; }}
        h2 {{ font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }}
        h3 {{ font-size: 1.25rem; font-weight: 600; color: #1e293b; margin-top: 1.5rem; margin-bottom: 0.75rem; }}
        p {{ margin-bottom: 1.25rem; line-height: 1.75; }}
        ul {{ list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }}
        ol {{ list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }}
        li {{ margin-bottom: 0.5rem; line-height: 1.6; }}
        blockquote {{
            border-left: 4px solid #f97316;
            background-color: #fff7ed;
            padding: 1rem 1.5rem;
            margin: 1.5rem 0;
            border-radius: 0.375rem;
            color: #7c2d12;
            font-style: italic;
        }}
        blockquote p {{ margin-bottom: 0; }}
        table {{ width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }}
        th {{ background-color: #f1f5f9; padding: 0.75rem 1rem; text-align: left; font-weight: 600; border: 1px solid #e2e8f0; }}
        td {{ padding: 0.625rem 1rem; border: 1px solid #e2e8f0; }}
        tr:nth-child(even) td {{ background-color: #f8fafc; }}
        hr {{ margin: 3rem 0; border: 0; border-top: 1px solid #e2e8f0; }}
        @media print {{
            body {{ background-color: #ffffff; }}
            .prose {{ box-shadow: none; padding: 0; max-width: 100%; }}
            pre.sourceCode {{ background-color: #f8fafc !important; color: #0f172a !important; border: 1px solid #e2e8f0; page-break-inside: avoid; }}
            .mermaid, blockquote, table {{ page-break-inside: avoid; }}
        }}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({{ startOnLoad: true, theme: 'neutral', securityLevel: 'loose', flowchart: {{ useWidth: true }} }});
    </script>
</head>
<body class="py-8 px-4 sm:px-6 lg:px-8">
    <article class="prose">
        {content}
    </article>
</body>
</html>
"""

    out_path = BUILD / f"{slug}.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Wrapped HTML generated at {out_path}")


if __name__ == "__main__":
    slug, lang = get_args(sys.argv)
    wrap(slug, lang)
