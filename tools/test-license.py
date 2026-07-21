#!/usr/bin/env python3
"""License / disclaimer test for all language front matters.

Asserts, for every language, that assets/[<lang>/]front-matter.md:
  POSITIVE  — carries the free-culture disclaimer: the CC BY-NC-SA 4.0 license,
              the three companion links (repository, study game, videos), and
              the dual-license pointer (LICENSE-CONTENT + AGPL-3.0).
  NEGATIVE  — no longer carries any legacy "all rights reserved" wording that
              would contradict the free license.

Run:  python3 tools/test-license.py
Exit: 0 if every language passes, 1 otherwise.

This file is safe to publish: it hardcodes only this project's own public
identifiers (its repository, site, and videos) plus generic copyright wording.
"""
import os
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(REPO, "assets")

# en-us lives at assets/front-matter.md; every other language at assets/<lang>/front-matter.md
LANGS = ["en-us", "ar", "bn", "de", "es", "fr", "he", "hi", "id",
         "it", "ja", "ko", "pt", "ru", "sw", "th", "tr", "ur", "vi", "zh"]


def path_for(lang):
    if lang == "en-us":
        return os.path.join(ASSETS, "front-matter.md")
    return os.path.join(ASSETS, lang, "front-matter.md")


# Must appear in every language (URLs and license IDs are language-neutral).
MUST_HAVE = [
    "github.com/AI2M2IA/book-lets-build-on-aws-together",   # repository
    "ai2m2ia.github.io/book-lets-build-on-aws-together",     # study game
    "youtube.com/playlist?list=PL9jytbqPPUEgTdZvVIdHxtXahX8922oYN",  # videos
    "CC BY-NC-SA 4.0",
    "LICENSE-CONTENT",
    "AGPL-3.0",
]

# Legacy "all rights reserved" signatures per language — must be GONE.
RIGHTS_RESERVED = {
    "en-us": ["All rights reserved", "No part of this publication"],
    "ar": ["جميع الحقوق محفوظة"],
    "bn": ["সর্বস্বত্ব সংরক্ষিত"],
    "de": ["Alle Rechte vorbehalten"],
    "es": ["Todos los derechos reservados"],
    "fr": ["Tous droits réservés"],
    "he": ["כל הזכויות שמורות"],
    "hi": ["सर्वाधिकार सुरक्षित"],
    "id": ["Semua hak dilindungi"],
    "it": ["Tutti i diritti riservati"],
    "ja": ["All rights reserved", "複製・配布・送信することはできません"],
    "ko": ["All rights reserved", "No part of this publication"],
    "pt": ["Todos os direitos reservados"],
    "ru": ["Все права защищены"],
    "sw": ["Haki zote zimehifadhiwa"],
    "th": ["สงวนลิขสิทธิ์ทั้งหมด"],
    "tr": ["Tüm hakları saklıdır"],
    "ur": ["جملہ حقوق محفوظ ہیں"],
    "vi": ["Bảo lưu mọi quyền"],
    "zh": ["保留所有权利"],
}


def check(lang):
    p = path_for(lang)
    fails = []
    if not os.path.exists(p):
        return [f"missing file: {p}"]
    txt = open(p, encoding="utf-8").read()
    low = txt.lower()

    for needle in MUST_HAVE:
        if needle.lower() not in low:
            fails.append(f"MISSING required: {needle!r}")

    for phrase in RIGHTS_RESERVED.get(lang, []):
        if phrase in txt:
            fails.append(f"LEFTOVER rights-reserved: {phrase!r}")

    return fails


def main():
    all_ok = True
    for lang in LANGS:
        fails = check(lang)
        if fails:
            all_ok = False
            print(f"FAIL  {lang}")
            for f in fails:
                print(f"        - {f}")
        else:
            print(f"ok    {lang}")
    print()
    if all_ok:
        print(f"PASS: all {len(LANGS)} languages carry the free-license "
              f"disclaimer with no rights-reserved leftovers.")
        return 0
    print("FAILURES found — see above.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
