# Deep Review 2026-07-28 — Encoding & `encode_iterable` als interaktives Lab (v52)

## Auftrag
Geplanter Lauf des Standing Brief: „nimm mal das aktuelle Repo und schaue was kannst du nochmal deutlich
verbessern … wird sich wirklich an den Vorlesungen und den Assignments entlang gehangelt?" Unbeaufsichtigt,
also selbst suchen, entscheiden, bauen, Bericht schreiben.

## Audit — wo klafft nach v51 noch eine Lücke?

Kriterium wie immer: hilft es, die Assignments zu bestehen und den Stoff zu verstehen? Nichts anderes.

Durchgezählt wurde diesmal nicht der Lecture-Pfad (nach v49/v50 dicht), sondern die **Abdeckung der
Assignment-Probleme durch interaktive Objekte**. Ergebnis:

| Problem | Punkte | Adapter | interaktives Objekt vor v52 |
|---|---|---|---|
| `a1:train_bpe` | 15 | `run_train_bpe` | Lab `bpe` (Training) |
| **`a1:tokenizer`** | **15** | **`get_tokenizer`** | **keins** |
| `a1:transformer_lm` | 15 | `run_transformer_lm` | Labs `attention`, `shapes` |
| `a1:adamw` | 10 | `get_adamw_cls` | Lab `optimizer` |

`a1:tokenizer` ist mit 15 Punkten eines der teuersten Probleme in A1 und war das einzige unter den Top-4,
für das die Plattform kein Objekt hatte, an dem man die Sache tatsächlich rechnen sieht. Das bestehende
Lab `bpe` deckt ausschließlich das **Training** ab (welches Paar wird als nächstes verschmolzen).
Gegenprobe im Repo: `encode_iterable` — der Begriff, an dem in `tests/test_tokenizer.py` mehrere Tests
hängen — kam vor v52 **0×** in der gesamten Plattform vor.

Das ist keine kosmetische Lücke: Trainieren und Anwenden sind zwei verschiedene Algorithmen, und genau
diese Verwechslung ist der klassische Grund, warum `run_train_bpe` grün ist und `get_tokenizer` rot bleibt.

## Was gebaut wurde — Lab #29 `bpe-encode`

Ein **bespoke interaktives Lab** (rechnet wirklich, kein Quiz-Wrapper), Modul `tokenization`, registriert
in Lecture 1, im Modul und an der A1-Mission `text-tokenizer`.

**Toy-Tokenizer** (aus einem eigenen Trainingslauf im Scratchpad abgeleitet, nicht ausgedacht):
Korpus `"he he ate that at"`, 5 Merges in Erzeugungsreihenfolge
`(a,t) (h,e) (␠,at) (t,h) (th,at)`, Vokabular `[␠ a e h t at he ␠at th that]`.

### Modus A — vier Encode-Strategien nebeneinander
Drei Testsätze × vier Strategien, Token für Token und als ID-Folge:

- `ranked` (korrekt: Rang für Rang, jeder Rang an **allen** Fundstellen eines Pretokens)
- `byFrequency` (die Trainingsregel fälschlich beim Anwenden weiterbenutzt)
- `longestMatch` (der „greedy längster Treffer"-Reflex aus WordPiece-Denke)
- `firstHitOnly` (jeder Merge nur einmal pro Pretoken)

Das didaktische Design-Kriterium: **jede falsche Strategie ist auf mindestens einem Satz harmlos und auf
mindestens einem verräterisch.** Genau das ist der Punkt — ein selbstgeschriebener Test auf einem gutartigen
Satz beweist gar nichts. Beispiele aus der Verifikation:
`overlap/ranked → [4,6,0,9]` vs. `overlap/byFrequency → [8,2,0,9]`, `repeat/firstHitOnly → [6,3,2,0,4,6]`.

Die Kopfzeilen-Einsicht des Labs: `the` zerlegt sich korrekt in `[t][he]`, **nicht** `[th][e]` — obwohl `th`
im Vokabular steht und exakt gleich lang ist. Allein weil `(h,e)` Rang 2 ist und `(t,h)` Rang 4.

### Modus B — `encode_iterable`
Text `"he ate that<|endoftext|>the hat at"` (34 Zeichen), vier Streaming-Varianten mit Peak-Speicher und
erster abweichender Position gegen die Referenz „ganze Datei am Stück":

- `wholeFile` — exakt, Peak 34 (die Referenz; sprengt bei echten Dateien den RAM)
- `fixed` — Chunkgröße frei 4…34; **Chunkgröße 26 liefert exakt gleich viele Tokens, aber ab Index 6
  andere IDs** — die eingebaute Demonstration stiller Korruption
- `docBoundary` — exakt **und** speicherbeschränkt (Peak 11). Die einzige Variante, die beides ist.
- `noSpecial` — Special Token nicht herausgeschnitten, weicht ab Index 5 ab

Die Transferfrage zielt genau darauf: warum ein fester Blockschnitt selbst dann falsch ist, wenn zufällig
gleich viele Tokens herauskommen.

## Verifikation

- `node --check` auf dem extrahierten Inline-Script und auf `i18n-en.js`: sauber.
- `node scripts/check-i18n.mjs`: grün — `29 labs, 29 missions, 1251 UI strings`, 124 Probleme, 523 Punkte.
- **Unabhängige Referenzimplementierung** in `scratchpad/lab.js` (in Node, getrennt geschrieben) gegen die
  Browserausgabe verglichen: alle 12 Encode-Kombinationen und alle Chunkgrößen 4–34 (Tokenfolge, Anzahl,
  Peak, erste Abweichung) **exakt identisch**.
- Transfercheck: falsches Tripel → „Noch nicht.", keine Persistenz. Richtiges Tripel (`t-he`/`order`/`doc`)
  → Erfolgs-Callout, `labChecks["bpe-encode"] === true` in `localStorage`; nach Reload stellt
  `restorePassedLab` alle drei Selects und das Erfolgs-Markup wieder her.
- Deutsch und Englisch vollständig durchgeklickt (76 neue `ui`-Paare + kompletter EN-Lab-Eintrag).
- Layout 375×812: `scrollWidth === clientWidth === 375`, kein überlaufendes Element in beiden Modi.
- Konsole bei 1280 px: leer.

## Neue Drift-Guards in `scripts/check-i18n.mjs`

Damit die Lücke nicht stillschweigend zurückkommt:

1. A1-Mission `text-tokenizer` muss `bpe-encode` führen (sonst hätte `a1:tokenizer` wieder kein Objekt).
2. `bpe-encode` muss im Modul `tokenization` liegen, damit Lecture 1 es zitieren kann.
3. `encode_iterable` muss irgendwo in der Plattform vorkommen.
4. `mental` und `misconception` müssen den Erzeugungs**rang** benennen — der Kern der ganzen Sache.

## Getroffene Entscheidungen (unbeaufsichtigter Lauf)

- **Eigenes Lab statt Erweiterung von `bpe`.** Training und Encoding sind zwei Algorithmen; sie in eine
  Karte zu quetschen hätte genau die Verwechslung zementiert, die das Lab auflösen soll.
- **Toy-Vokabular statt Byte-Level.** 10 Einträge sind vollständig im Kopf haltbar; bei Byte-Level wäre die
  Rangreihenfolge in Zahlenrauschen untergegangen. Preis: Zeichen außerhalb des Mini-Vokabulars haben keine
  ID. Statt `-1` zeigt das Lab `?` und erklärt im Verdict, dass ein echtes Byte-Level-Vokabular hier IDs
  hätte — aber keine bessere Zerlegung.
- **Keine Zeit-/Ersparnis-Metrik**, keine Termin- oder Streak-Mechanik. Wie festgehalten.

## Stolperstein für den nächsten Lauf

Der Browser servierte hartnäckig 27 Lab-Karten. Ursache war kein Cache, sondern ein liegengebliebener
`python3 -m http.server 8899` aus einem **anderen** Worktree, der den Port besetzt hielt. Diagnose mit
`lsof -d cwd`. Faustregel: bevor man am Service Worker zweifelt, prüfen, aus welchem Verzeichnis der Server
überhaupt liefert.

## Stand

- Commit `feat: v52 …` auf `claude/vigilant-allen-97c980`, gestapelt auf `5f999a3` (v51).
- Geändert: `index.html`, `i18n-en.js`, `scripts/check-i18n.mjs`, `sw.js` (Cache `cs336-shell-v52`),
  `README.md` (29 Labs).
- **Achtung beim Testen:** nach dem Versionssprung `getRegistrations().unregister()` + `caches.delete()`,
  sonst zeigt der Browser den alten Stand.
