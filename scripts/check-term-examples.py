#!/usr/bin/env python3
"""Recompute every arithmetic claim made inside a concept's term examples.

Each term definition ends with a worked example, and many state a calculation outright.
Nothing else checks those numbers: `concept-terms.py apply` only checks that an example is
present, and the i18n guard never looks inside the prose. With hundreds of definitions that
is the one rule no reviewer can hold by hand, so it is held here.

Three things a first version got wrong, each turning correct prose into a false alarm and
burying the real errors underneath:

  * Chains. "1·4 + 3·2 = 4 + 6 = 10" states two equalities. Taking the first number after
    the first "=" reads it as "= 4" and calls correct arithmetic wrong.
  * Parentheses. "2·(4-1)·100 / 4 = 150" holds, but reading only the tail "100 / 4" does not.
  * Rounding. "0.6/0.85 = 70.6 %" is how a person writes 70.5882 %, so the comparison has
    to allow the precision the text actually shows.

German and English write numbers differently ("10.000" / "0,576" against "10,000" / "0.576"),
so each side is parsed under its own convention.

    python3 scripts/check-term-examples.py            # every concept
    python3 scripts/check-term-examples.py bpe rope   # only these

Exit code 1 if any stated equality does not hold.
"""
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UNPARSED = []
UNCHECKED = []

NUMBER = r"\d[\d.,]*"
SCALES = {"tausend": 1e3, "thousand": 1e3, "mio": 1e6, "million": 1e6, "millionen": 1e6,
          "millions": 1e6, "mrd": 1e9, "milliarde": 1e9, "milliarden": 1e9,
          "billion": 1e9, "billions": 1e9, "%": 0.01}
SUPERSCRIPT = {"\u2070":0,"\u00b9":1,"\u00b2":2,"\u00b3":3,"\u2074":4,"\u2075":5,"\u2076":6,"\u2077":7,"\u2078":8,"\u2079":9}
FUNCS = ("log2", "log", "ln", "exp", "sqrt")
TOKEN = re.compile(rf"({NUMBER}|log2|log|ln|exp|sqrt|[+\u2212\u00b7\u00d7*/()=^\u221a-]|[\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079]+|%|[A-Za-z\u00e4\u00f6\u00fc\u00df]+)")
MULT = "·×*"
MINUS = "−-"


def parse_number(text, locale):
    if locale == "de":
        text = text.replace(".", "\x00").replace(",", ".").replace("\x00", "")
    else:
        text = text.replace(",", "")
    return float(text)


def shown_decimals(text, locale):
    """Decimal places the literal displays -- the precision to compare at."""
    sep = "," if locale == "de" else "."
    if sep not in text:
        return 0
    tail = text.rsplit(sep, 1)[1]
    if not tail.isdigit():
        return 0
    # A three-digit tail after the *grouping* separator is not a decimal.
    group = "." if locale == "de" else ","
    if sep == group:
        return 0
    return len(tail)


def evaluate(tokens, locale):
    """Recursive-descent over + - * / and parentheses. Raises on anything else."""
    pos = 0

    def atom():
        nonlocal pos
        if pos < len(tokens) and tokens[pos] in FUNCS:
            name = tokens[pos]
            pos += 1
            value = atom()
            if name == "exp":
                return math.exp(value)
            if name == "sqrt":
                return math.sqrt(value)
            if name == "log2":
                return math.log2(value)
            return math.log(value)          # this material writes log for the natural log
        if pos < len(tokens) and tokens[pos] == "\u221a":
            pos += 1
            return math.sqrt(atom())
        if pos < len(tokens) and tokens[pos] == "(":
            pos += 1
            value = expression()
            if pos >= len(tokens) or tokens[pos] != ")":
                raise ValueError
            pos += 1
            return value
        if pos < len(tokens) and tokens[pos] in MINUS:
            pos += 1
            return -atom()
        if pos >= len(tokens) or not re.fullmatch(NUMBER, tokens[pos]):
            raise ValueError
        pos += 1
        return parse_number(tokens[pos - 1], locale)

    def power():
        nonlocal pos
        value = atom()
        if pos < len(tokens) and tokens[pos] and tokens[pos][0] in SUPERSCRIPT:
            digits = "".join(str(SUPERSCRIPT[c]) for c in tokens[pos])
            pos += 1
            return value ** int(digits)
        if pos < len(tokens) and tokens[pos] == "^":
            pos += 1
            return value ** power()
        return value

    def product():
        nonlocal pos
        value = power()
        while pos < len(tokens) and (tokens[pos] in MULT or tokens[pos] == "/"):
            op = tokens[pos]
            pos += 1
            right = power()
            if op == "/":
                if right == 0:
                    raise ValueError
                value /= right
            else:
                value *= right
        return value

    def expression():
        nonlocal pos
        value = product()
        while pos < len(tokens) and tokens[pos] in "+" + MINUS:
            op = tokens[pos]
            pos += 1
            value = value + product() if op == "+" else value - product()
        return value

    value = expression()
    if pos != len(tokens):
        raise ValueError
    return value


# The principled version of "do not mis-evaluate what you cannot read": a sentence is only
# checked if every character in it is either consumed by the tokenizer or is ordinary prose
# punctuation. Greek letters, sub- and superscripts, roots, carets, brackets and function
# names all signal notation this parser does not model -- and dropping them does not fail,
# it evaluates a DIFFERENT expression and reports correct prose as wrong.
# Underscores and Greek letters are parts of variable names (d_h, alpha_max) and change
# no arithmetic. Superscripts, subscripts, roots and carets do, so they stay disqualifying.
HARMLESS = set(" \t\n,.;:!?\"'()[]„“”‘’…-–—/%&#_^\u00a0\u221a")
HARMLESS |= set(SUPERSCRIPT)
HARMLESS |= {chr(c) for c in range(0x0370, 0x0400)}          # Greek
HARMLESS |= set("\u2192\u2190\u21d2\u2264\u2265\u2248\u00d7")   # arrows and relations
FUNCTIONS = re.compile(r"\b(?:sin|cos|max|min|softmax|logsumexp|sigma|argmax)\s*\(")
# Scientific notation like "1e-4" is not modelled; refuse rather than misread it.
SCIENTIFIC = re.compile(r"\d\s*e\s*[+\u2212-]?\s*\d")
# Any name applied to a bracket is a function. The ones this checker evaluates are
# listed in FUNCS; every other -- sigma(2.0), P(Match), J(A,B) -- would have its name
# dropped and its argument read as a bare value, so the sentence is refused instead.
# No space before the bracket: "sigma(2.0)" is application, "...ab (auf 9.999)" is
# ordinary prose and must not disqualify the sentence.
APPLIED = re.compile(r"([A-Za-z\u0370-\u03ff][A-Za-z0-9_\u0370-\u03ff]*)\(")


def readable(sentence):
    consumed = "".join(TOKEN.findall(sentence))
    leftover = sentence
    for piece in sorted(set(TOKEN.findall(sentence)), key=len, reverse=True):
        leftover = leftover.replace(piece, " ")
    if FUNCTIONS.search(sentence) or SCIENTIFIC.search(sentence):
        return False
    if any(name not in FUNCS for name in APPLIED.findall(sentence)):
        return False
    return all(c in HARMLESS for c in leftover)


def chains(text):
    """Yield (list_of_token_lists, trailing_scale) for each '... = ... = ...' run.

    Anything that is not a number, an operator, a bracket or '=' ends the chain -- not
    just words. "alpha = 0,001, lambda = 0,1" is two statements, and treating the comma
    and the Greek letter as invisible glued them into one bogus equality.
    """
    for sentence in re.split(r"(?<=[.;:])\s", text):
        if "=" in sentence and not readable(sentence):
            UNCHECKED.append(sentence.strip()[:110])
            continue
        parts, current, cursor = [], [], 0

        def flush(scale):
            nonlocal parts, current
            parts.append(current)
            result = (parts, scale) if len(parts) >= 2 else None
            parts, current = [], []
            return result

        pending = []
        for match in TOKEN.finditer(sentence):
            gap = sentence[cursor:match.start()]
            cursor = match.end()
            token = match.group(0)
            if gap.strip():
                done = flush(1.0)
                if done:
                    pending.append(done)
            if token == "=":
                parts.append(current)
                current = []
            elif (re.fullmatch(NUMBER, token) or token in "+/()^" or token in MULT
                  or token in MINUS or token in FUNCS or token == "\u221a"
                  or token[0] in SUPERSCRIPT):
                if re.fullmatch(NUMBER, token):
                    token = token.rstrip(".,")
                    if not token:
                        continue
                current.append(token)
            else:
                done = flush(SCALES.get(token.lower().rstrip(",."), 1.0))
                if done:
                    pending.append(done)
        done = flush(1.0)
        if done:
            pending.append(done)
        for item in pending:
            yield item


def mismatches(text, locale):
    """Compare each stated equality in the units the text states it in.

    Only the right-hand side can be rounded -- the left is computed exactly from the
    literals written there. So the tolerance comes from the precision the right side
    shows, and the comparison happens before any magnitude word is applied: "= 70.6 %"
    is checked as 70.5882 against 70.6 at one decimal, not as 0.705882 against 0.706.
    """
    for parts, trailing in chains(text):
        values = []
        for tokens in parts:
            try:
                value = evaluate(tokens, locale) if tokens else None
                places = max((shown_decimals(t, locale) for t in tokens
                              if re.fullmatch(NUMBER, t)), default=0)
            except (ValueError, IndexError, ZeroDivisionError):
                value, places = None, 0
                if tokens and all(re.fullmatch(NUMBER, t) or t in "+/()" + MULT + MINUS
                                  for t in tokens) and any(re.fullmatch(NUMBER, t) for t in tokens):
                    UNPARSED.append(" ".join(tokens))
            values.append((tokens, value, places))
        for index, ((lt, lv, _), (rt, rv, rp)) in enumerate(zip(values, values[1:])):
            if lv is None or rv is None:
                continue
            # the magnitude word belongs to the final member only
            scale = trailing if index == len(values) - 2 else 1.0
            stated_units = lv / scale
            tolerance = 0.5 * 10 ** -rp + max(abs(rv), 1.0) * 1e-9
            if abs(stated_units - rv) > tolerance:
                yield " ".join(lt), " ".join(rt), stated_units, rv


def concepts_with_terms(src, key_pattern, brace_before):
    out = {}
    for m in re.finditer(key_pattern, src):
        lo = src.rindex("{", 0, m.start() + 1) if brace_before else src.index("{", m.start())
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
    tables = (("de", concepts_with_terms(de_src, r'\{\s*\n\s+"id": "([a-z0-9_-]+)"', True)),
              ("en", concepts_with_terms(en_src, r'\n    "([a-z0-9_-]+)": \{', False)))

    pages = failed = 0
    for locale, table in tables:
        for cid, terms in sorted(table.items()):
            if only and cid not in only:
                continue
            pages += 1
            for name, text in terms:
                for left, right, lv, rv in mismatches(text, locale):
                    failed += 1
                    print(f"  WRONG  {locale}/{cid} · {name}")
                    print(f"         {left}  =  {right}")
                    print(f"         left is {lv:g}, right is {rv:g}")
    print(f"\n{pages} term lists checked, {failed} stated equalities do not hold.")
    if UNPARSED:
        print(f"{len(UNPARSED)} arithmetic segments could not be parsed and were NOT checked.")
    if UNCHECKED:
        print(f"{len(UNCHECKED)} sentences use powers, roots or functions this checker does")
        print("not model, so they were NOT checked and still need reading:")
        for item in UNCHECKED[:8]:
            print(f"    {item}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(set(sys.argv[1:])))
