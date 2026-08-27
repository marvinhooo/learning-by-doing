#!/usr/bin/env python3
"""Add hand-written term lists ("Begriffe vor dem ersten Schritt") to concept pages.

A concept without its own `terms` falls back to an automatic keyword match against a shared
pool. For most pages that pool finds one or two entries, and for 18 of them it finds none --
so the box that is supposed to explain the vocabulary before the text begins is empty exactly
where the text is hardest. This tool writes real lists into both language files.

Three subcommands:

    python3 scripts/concept-terms.py todo
        Lists every concept that still has no hand-written terms: first the ones a
        lecture references, in lecture order, then the nine self-study prerequisites
        that belong to no lecture and are reached from the assignment pages.

    python3 scripts/concept-terms.py check <concept-id> [...]
        For each concept: which abbreviations the page uses without expanding them first.
        Those MUST appear among the terms -- the automatic pool used to cover them, and a
        hand-written list replaces that pool completely.

    python3 scripts/concept-terms.py apply <file.json>
        Writes the terms into index.html (German) and i18n-en.js (English).
        Format: {"concept-id": {"de": [["Begriff","Erklärung. Beispiel: …"], …],
                                "en": [["term","Explanation. Example: …"], …]}}

Rules the tool enforces, because a guard enforces them too:
  * German and English must have the same number of entries.
  * 8 to 12 entries; only the first 12 are ever rendered.
  * Every definition must contain a worked example ("Beispiel:" / "Example:").
  * Every abbreviation reported by `check` must appear in the term names.
After applying, run `node scripts/check-i18n.mjs` -- it must stay green. It needs Node 24+.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DE_FILE, EN_FILE = ROOT / "index.html", ROOT / "i18n-en.js"
MAX_TERMS = 12
MIN_TERMS = 8


# ---- locating and editing one entry, without ever touching its neighbours ----------------

def entry_span(text, marker, start=0):
    i = text.index(marker, start)
    j = text.index("{", i)
    depth, k, quote, esc = 0, j, "", False
    while k < len(text):
        c = text[k]
        if quote:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == quote:
                quote = ""
        elif c in "\"'":
            quote = c
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i, k + 1
        k += 1
    raise ValueError(f"unbalanced entry for {marker!r}")


def _value_end(entry, start):
    depth, k, quote, esc = 0, start, "", False
    while k < len(entry):
        c = entry[k]
        if quote:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == quote:
                quote = ""
        elif c == '"':
            quote = c
        elif c in "[{":
            depth += 1
        elif c in "]}":
            if depth == 0:
                return k
            depth -= 1
        elif c == "," and depth == 0:
            return k
        k += 1
    raise ValueError("value never ends")


def set_terms(text, marker, terms, after, indent, start=0):
    """Replace the entry's `terms`, or insert it after `after` when it has none yet."""
    lo, hi = entry_span(text, marker, start)
    entry = text[lo:hi]
    key = f'\n{indent}"terms": '
    dumped = json.dumps(terms, ensure_ascii=False)
    pos = entry.find(key)
    if pos != -1:
        stop = _value_end(entry, pos + len(key))
        entry = entry[:pos] + key + dumped + entry[stop:]
    else:
        akey = f'\n{indent}"{after}": '
        apos = entry.index(akey)
        stop = _value_end(entry, apos + len(akey))
        entry = entry[:stop] + "," + key + dumped + entry[stop:]
    return text[:lo] + entry + text[hi:]


# ---- reading the data --------------------------------------------------------------------

def concepts(src):
    out = {}
    for m in re.finditer(r'\{\s*\n\s+"id": "([a-z0-9_-]+)"', src):
        lo = m.start()
        depth, j, quote, esc = 0, lo, "", False
        while j < len(src):
            c = src[j]
            if quote:
                if esc:
                    esc = False
                elif c == "\\":
                    esc = True
                elif c == quote:
                    quote = ""
            elif c == '"':
                quote = c
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        try:
            d = json.loads(src[lo:j + 1])
        except Exception:
            continue
        if "details" in d:
            out[d["id"]] = d
    return out


def prose(d):
    parts = []
    for k in ["title", "summary", "context", "why", "mental", "details", "pitfalls", "checks", "answers"]:
        v = d.get(k)
        if isinstance(v, list):
            parts += [" ".join(x) if isinstance(x, list) else str(x) for x in v]
        elif v:
            parts.append(str(v))
    return " ".join(parts)


def contracts():
    guard = (ROOT / "scripts" / "check-i18n.mjs").read_text(encoding="utf-8")
    block = guard[guard.index("const abbreviationContracts = {"):]
    return dict(re.findall(r'"?([A-Za-zμ0-9]+)"?\s*:\s*"([^"]+)"', block[:block.index("\n};")]))


def missing_abbreviations(d):
    text, need = prose(d), []
    for abbr, expansion in contracts().items():
        m = re.search(rf"(^|[^\w]){re.escape(abbr)}($|[^\w])", text)
        if not m:
            continue
        idx = text.lower().find(expansion.lower())
        if 0 <= idx < m.start():
            continue
        need.append((abbr, expansion))
    return need


def lecture_order(src):
    order, seen = [], set()
    seg = src[src.index("const LECTURE_GUIDES"):]
    for m in re.finditer(r"\n      (l\d\d):\{", seg):
        nxt = seg.find("\n      l", m.end())
        block = seg[m.start(): nxt if nxt > 0 else m.start() + 9000]
        con = re.search(r"concepts:\[([^\]]*)\]", block)
        if not con:
            continue
        for cid in [x.strip().strip('"') for x in con.group(1).split(",") if x.strip()]:
            if cid not in seen:
                seen.add(cid)
                order.append((m.group(1), cid))
    return order


def auto_terms(src, d):
    i = src.index("const CONCEPT_PRIMER_TERMS")
    lo = src.index("de:[", i)
    pool = re.findall(r'\["((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)"\]', src[lo:src.index("\n      ],", lo)])
    text, n = prose(d), 0
    for term, _ in pool:
        name = term.split(" / ")[0]
        flags = 0 if len(re.findall(r"[A-Z]", name)) >= 2 else re.I
        if re.search(rf"(^|[^\w]){re.escape(name)}($|[^\w])", text, flags):
            n += 1
    return n


# ---- subcommands -------------------------------------------------------------------------

def cmd_todo():
    # Nine concepts belong to no lecture -- they are the self-study prerequisites the
    # assignment pages point at (matmul, probability, logs, cross-entropy, adamw, ...).
    # Listing only what the lecture guides reference would call the job finished while
    # the most basic pages in the course still had no terms, so they are listed too.
    src = DE_FILE.read_text(encoding="utf-8")
    data = concepts(src)
    ordered = [cid for _, cid in lecture_order(src)]
    lectures = {cid: lid for lid, cid in lecture_order(src)}
    open_ids = [cid for cid in data if not data[cid].get("terms")]
    in_lecture = [cid for cid in ordered if cid in open_ids]
    outside = sorted(cid for cid in open_ids if cid not in lectures)
    print(f"{len(open_ids)} concepts still without a hand-written term list.\n")
    print(f"{len(in_lecture)} of them appear in a lecture, in lecture order:\n")
    for cid in in_lecture:
        n = auto_terms(src, data[cid])
        print(f"  L{lectures[cid][1:]}  {cid:30} automatic fallback finds {n}{'   <-- shows nothing today' if n == 0 else ''}")
    if outside:
        print(f"\n{len(outside)} belong to no lecture -- self-study prerequisites reached from the")
        print("assignment pages. They are the most basic pages in the course, so do these FIRST:\n")
        for cid in outside:
            n = auto_terms(src, data[cid])
            print(f"  --   {cid:30} automatic fallback finds {n}{'   <-- shows nothing today' if n == 0 else ''}")


def cmd_check(ids):
    data = concepts(DE_FILE.read_text(encoding="utf-8"))
    for cid in ids:
        if cid not in data:
            print(f"{cid:30} UNKNOWN concept id")
            continue
        need = missing_abbreviations(data[cid])
        have = "has terms" if data[cid].get("terms") else "no terms yet"
        listed = ", ".join(f"{a} ({e})" for a, e in need) or "none"
        print(f"{cid:30} [{have}]  must define: {listed}")


def cmd_apply(path):
    batch = json.loads(Path(path).read_text(encoding="utf-8"))
    de, en = DE_FILE.read_text(encoding="utf-8"), EN_FILE.read_text(encoding="utf-8")
    data = concepts(de)
    for cid, langs in batch.items():
        terms_de, terms_en = langs["de"], langs["en"]
        if cid not in data:
            sys.exit(f"{cid}: unknown concept id")
        if len(terms_de) != len(terms_en):
            sys.exit(f"{cid}: {len(terms_de)} German terms against {len(terms_en)} English")
        if not MIN_TERMS <= len(terms_de) <= MAX_TERMS:
            sys.exit(f"{cid}: {len(terms_de)} terms, allowed is {MIN_TERMS}-{MAX_TERMS}")
        for name, text in terms_de:
            if "Beispiel" not in text:
                sys.exit(f"{cid}: German term {name!r} carries no 'Beispiel:'")
        for name, text in terms_en:
            if "Example" not in text:
                sys.exit(f"{cid}: English term {name!r} carries no 'Example:'")
        names = " ".join(n for n, _ in terms_de) + " " + " ".join(n for n, _ in terms_en)
        for abbr, expansion in missing_abbreviations(data[cid]):
            if not re.search(rf"(^|[^\w]){re.escape(abbr)}($|[^\w])", names):
                sys.exit(f"{cid}: the page uses {abbr} without expanding it, so a term has to define {abbr} ({expansion})")
        de = set_terms(de, f'"id": "{cid}"', terms_de, after="summary", indent=" " * 8)
        en = set_terms(en, f'"{cid}": {{', terms_en, after="summary", indent=" " * 6,
                       start=en.index('"concepts"'))
    DE_FILE.write_text(de, encoding="utf-8")
    EN_FILE.write_text(en, encoding="utf-8")
    print(f"terms written for: {', '.join(batch)}")
    print("now run: node scripts/check-i18n.mjs")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    command = sys.argv[1]
    if command == "todo":
        cmd_todo()
    elif command == "check":
        cmd_check(sys.argv[2:])
    elif command == "apply":
        cmd_apply(sys.argv[2])
    else:
        sys.exit(__doc__)
