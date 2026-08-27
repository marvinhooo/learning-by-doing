#!/usr/bin/env python3
"""Recompute every arithmetic claim made inside a concept's term examples.

Each term definition ends with a worked example, and many of those examples state a
calculation outright: "6 · 16 + 1 = 97", "512 / 8 = 64", "10.000 − 256 − 1 = 9.743".
Nothing else checks those numbers -- `concept-terms.py apply` only checks that an example
is present, and the i18n guard never looks inside the prose. With hundreds of definitions
that is the one rule no reviewer can hold by hand, so it is held here instead.

The two languages write numbers differently (German "10.000" and "0,576" against English
"10,000" and "0.576"), so each side is parsed under its own convention.

    python3 scripts/check-term-examples.py            # every concept
    python3 scripts/check-term-examples.py bpe rope   # only these

Exit code 1 if any stated equation does not hold.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

OPERATORS = {"+": 1, "−": 1, "-": 1, "·": 2, "×": 2, "*": 2, "/": 2, ":": 2}
# A number in either convention, e.g. 1.234,5 or 1,234.5 or 97 or 0.45
NUMBER = r"\d[\d.,]*"
TOKEN = re.compile(rf"({NUMBER}|[+−\-·×*/:=])")


def parse_number(text, locale):
    """German: '.' groups thousands, ',' is the decimal point. English: the reverse."""
    if locale == "de":
        text = text.replace(".", "\x00").replace(",", ".").replace("\x00", "")
    else:
        text = text.replace(",", "")
    return float(text)


def evaluate(tokens, locale):
    """Left-to-right with the usual precedence; returns None if the shape is not an expression."""
    values, ops = [], []

    def reduce_once():
        if len(values) < 2 or not ops:
            raise ValueError
        b, a, op = values.pop(), values.pop(), ops.pop()
        if op in "+":
            values.append(a + b)
        elif op in "−-":
            values.append(a - b)
        elif op in "·×*":
            values.append(a * b)
        else:
            if b == 0:
                raise ValueError
            values.append(a / b)

    for token in tokens:
        if token in OPERATORS:
            while ops and OPERATORS[ops[-1]] >= OPERATORS[token]:
                reduce_once()
            ops.append(token)
        else:
            values.append(parse_number(token, locale))
    while ops:
        reduce_once()
    if len(values) != 1:
        raise ValueError
    return values[0]


# A magnitude word after the result scales it: "50.000 · 512 = 25,6 Millionen".
MAGNITUDES = {"tausend": 1e3, "thousand": 1e3, "mio": 1e6, "million": 1e6, "millionen": 1e6,
              "millions": 1e6, "mrd": 1e9, "milliarde": 1e9, "milliarden": 1e9,
              "billion": 1e9, "billions": 1e9}
EQUATION = re.compile(
    rf"({NUMBER}(?:\s*[+−\-·×*/:]\s*{NUMBER})+)\s*=\s*({NUMBER})\s*([A-Za-zäöü]+)?")


def claims(text, locale):
    """Yield (tokens, stated_result) for every contiguous 'a op b = c' in the text.

    Matching a contiguous run rather than tokenising a whole sentence matters: a sentence
    often mentions several unrelated numbers, and collecting all of them into one
    expression produced nonsense that silently failed to evaluate.
    """
    for match in EQUATION.finditer(text):
        tokens = TOKEN.findall(match.group(1))
        if len(tokens) < 3 or tokens[0] in OPERATORS or tokens[-1] in OPERATORS:
            continue
        scale = MAGNITUDES.get((match.group(3) or "").lower().rstrip(","), 1.0)
        yield tokens, match.group(2), scale


# Only an "=" whose left side actually computes something is a calculation. "D = 512"
# and "decode(encode(text)) = text" are statements, not claims to be recomputed.
CALCULATION = re.compile(rf"{NUMBER}\s*[+−\-·×*/:]\s*[\d(]|\)\s*[+−\-·×*/:]")


def skipped(text):
    """Calculations this checker cannot parse -- parentheses, powers, symbols."""
    stated = sum(1 for part in text.split("=")[:-1] if CALCULATION.search(part[-40:]))
    return stated - len(list(EQUATION.finditer(text)))


def concepts_with_terms(src, key_pattern):
    out = {}
    for m in re.finditer(key_pattern, src):
        # The English pattern matches the key line, the German one the opening brace.
        # Balancing has to start at the brace either way, or the slice is not JSON --
        # which silently left the entire English half unchecked.
        lo = src.index("{", m.start())
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
        if d.get("terms"):
            out[m.group(1)] = d["terms"]
    return out


def main(only):
    de_src = (ROOT / "index.html").read_text(encoding="utf-8")
    en_src = (ROOT / "i18n-en.js").read_text(encoding="utf-8")
    en_src = en_src[en_src.index('"concepts"'):en_src.index('"conceptOrientations"')]
    german = concepts_with_terms(de_src, r'\{\s*\n\s+"id": "([a-z0-9_-]+)"')
    english = concepts_with_terms(en_src, r'\n    "([a-z0-9_-]+)": \{')

    checked = failed = unparsed = 0
    for locale, table in (("de", german), ("en", english)):
        for cid, terms in sorted(table.items()):
            if only and cid not in only:
                continue
            for name, text in terms:
                unparsed += max(0, skipped(text))
                for expression, stated, scale in claims(text, locale):
                    try:
                        value = evaluate(expression, locale)
                        want = parse_number(stated, locale) * scale
                    except (ValueError, ZeroDivisionError):
                        continue
                    checked += 1
                    tolerance = max(abs(want), 1) * 1e-6
                    if abs(value - want) > tolerance:
                        failed += 1
                        shown = " ".join(expression)
                        print(f"  WRONG  {locale}/{cid} · {name}")
                        print(f"         states  {shown} = {stated}")
                        print(f"         but it is {value:g}")
    print(f"\n{checked} stated calculations recomputed, {failed} wrong.")
    if unparsed:
        print(f"{unparsed} further '=' claims were not in a form this checker can parse "
              f"(parentheses, powers, symbols) -- those still need reading.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(set(sys.argv[1:])))
