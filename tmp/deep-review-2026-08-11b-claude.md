# Deep Review 2026-08-11 (zweiter Lauf des Tages) — v69

Basis: `d24b29e` (v68, Branch `claude/brave-saha-7f2404`). Worktree
`agitated-mirzakhani-eb6d79` per `git merge --ff-only` auf die Kettenspitze gehoben statt
auf das veraltete `main` (v50). Ergebnis-Commit `6f68421`, **nicht gepusht**.

Codex-Parallelität geprüft: `index.html`/`i18n-en.js`/`sw.js`/`check-i18n.mjs` zuletzt am
29. Juli geändert, keine laufende Session — Edits waren erlaubt.

## Wahl des Hebels

Die von v68 notierten nächsten Hebel waren `a4:pipeline-audit` / `a4:tokenize-train` und
`a1:checkpointing`. Beide sind überwiegend Schreib- und Messaufgaben. Statt der Kennzahl
zu folgen wurde nach der Regel aus `cs336-metric-is-a-suspicion` gefragt: **welche konkrete
Zahl verlangt das Material, die die Plattform nirgends rechnet?**

Trefferzählung nach den Bezeichnern der Rechnung, nicht nach Themenwörtern:

| Bezeichner | Treffer in `index.html` |
|---|---|
| `minhash` / `jaccard` / `lsh` (Prosa) | 52 / 55 / 59 |
| `num_bands`, `num_hashes`, `n_bands` | **0** |
| `candidateProb`, `sCurve` | **0** |
| `Math.pow(1-` | 1 — und der liegt in `batch-windows` |

Klassisches Muster „Formel nur gedruckt": die Formelkarte `lsh` rendert
`P(candidate|s)=1−(1−sʳ)ᵇ` als Zeichenkette, ausgewertet wurde sie nie. Dasselbe Muster wie
`parallelism` vor v65 und `rlvr-system-transfer` vor v66.

Gegenprobe, ob ein bestehendes Objekt die Lücke schon deckt: `dedup-pipeline` ist ein
Sieben-Schritt-Durchlauf über vier feste Dokumente mit **fest verdrahteter** Kandidatenmenge
(`dedupCandidates = new Set(["AB","BC","AD"])`), fixem b = 3 / r = 2 und einem einzigen
τ-Regler. Es lehrt die **Stufen**, nicht die **Parameter**. Kein Duplikat.

**Der eigentliche Fund war schärfer als erwartet:** Lecture 14 rechnet die Kurve in ihrem
eigenen Trace (Zeilen 624–627):

```
def get_prob_collision(sim, b, r):
    prob_match = sim ** r
    prob_collision = 1 - (1 - prob_match) ** b
```

und inspiziert sie für `(b=5, r=10)` sowie die drei Vergleichsstände `(10,10)`, `(10,20)`,
`(20,20)` über `sims = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.98]`. Die Lecture *rechnet*, die
Plattform *druckte*. Und A4 `minhash_deduplication` (8 P.) verlangt vom Leser genau diese
Wahl — Deliverable (b) Zahl der Hashes, (c) Zahl der Bänder, (d) n-Gramm-Länge — mit einem
einzigen Satz Anleitung: „increasing the number of bands will increase recall and decrease
precision."

## Gebaut: Lab #44 `lsh-bands`

Modul `data`, 15 min, registriert in `LECTURE_GUIDES.l14` (PDF-treu, die Lecture rechnet es
selbst), im Modul `data` und an **erster Stelle** der A4-Mission `dedup`.
153 Zustände in zwei Modi.

### Modus A — was die Bandstruktur entscheidet

b ∈ {2,4,5,10,20,25,50} × r ∈ {2,4,5,10,20,25,50} × τ ∈ {0,7 / 0,8 / 0,9}. Gezeigt werden
`s^r` und `P = 1−(1−s^r)^b` für zehn Ähnlichkeiten (die sieben der Lecture sind markiert),
dazu k = b·r, s\* = (1/b)^(1/r) und P(s\*).

Daneben steht, was die Wahl auf einem Korpus kostet — konstruiertes Ähnlichkeitsprofil über
1000 Dokumente / 499500 Paare, als konstruiert deklariert, mit Erwartungswerten statt
Ausbeuten. **Bei festem k = 100 und τ = 0,8:**

| b | r | s\* | Recall | erwartet übersehen | Kandidatenpaare |
|---|---|---|---|---|---|
| 2 | 50 | 0,986233 | 13,61 % | 116,63 von 135 | 18,37 |
| 4 | 25 | 0,946058 | 33,24 % | 90,12 | 45,12 |
| 10 | 10 | 0,794328 | 94,58 % | 7,32 | 164,87 |
| 50 | 2 | 0,141421 | 100,00 % | 0,00 | **198086,99** |

Drei Befunde:

1. **b und r sind keine Performance-Regler, sondern eine zweite Schwelle.** s\* = (1/b)^(1/r)
   steht nirgends im Code, entscheidet aber, welche Paare die exakte Verification überhaupt
   zu sehen bekommt. Neben dem τ, das man bewusst wählt, steht eines, das man nur indirekt
   wählt.
2. **s\* ist keine Grenze.** P(s\*) liegt über das ganze Gitter zwischen 0,635 und 0,750 —
   die Kurve ist steil, aber sie ist eine Kurve. Ein Guard hält das Intervall.
3. **Eine schlechte Wahl erzeugt keinen Fehlerzustand.** Die Kandidatensuche liefert
   weniger Paare, die exakte Prüfung bleibt auf diesen korrekt, das Ausgabeverzeichnis wird
   geschrieben. Die übersehenen Duplikate stehen danach unauffällig im Korpus. Umgekehrt
   kostet 100 % Recall hier 198087 vollständige Jaccard-Berechnungen für 135 Duplikate —
   Recall und Prüfaufwand sind ein Paar und nie einzeln zu lesen.

### Modus B — wovon die Ähnlichkeit eine Ähnlichkeit ist

Vier Dokumentpaare, exaktes Jaccard über echte Strings für n ∈ {1,2,3,5}, mit und ohne den
Normalisierungsvertrag aus §3.2 (lowercase, NFD, Akzentmarken entfernen, Satzzeichen zu
Leerzeichen, Whitespace kollabieren).

| Paar | n=1 | n=2 | n=3 | n=5 |
|---|---|---|---|---|
| zwei Lizenzdateien aus derselben Vorlage | 0,837838 | 0,826087 | 0,787234 | 0,777778 |
| ein Wort eingefügt | 0,933333 | 0,812500 | 0,687500 | 0,437500 |
| dieselben Wörter, andere Reihenfolge | **1,000000** | 0,636364 | 0,333333 | **0,000000** |
| derselbe Text, andere Schreibung (normalisiert) | 1,000000 | 1,000000 | 1,000000 | 1,000000 |
| derselbe Text, andere Schreibung (ohne Normalisierung) | 0,117647 | 0,000000 | 0,000000 | 0,000000 |

Kernpointe: **das Lizenzpaar — genau das Beispiel, mit dem das Handout die Fuzzy-Dedup
begründet — ist bei τ = 0,8 mit n = 1 und n = 2 ein Duplikat und mit n = 3 und n = 5
keines.** Dieselbe Schwelle, dasselbe Paar, gegensätzliche Entscheidung. τ legt also allein
nichts fest; n, Normalisierung und τ sind eine einzige Entscheidung. Eine reine
Wortpermutation ist bei n = 1 exakt 1,0 (identische Wortmenge, gegensätzliche Aussage) und
bei n = 5 exakt 0,0. Und die eine Zeile Normalisierung, die das Handout verlangt, ist der
Unterschied zwischen 1,0 und 0,117647 auf einem Paar, das dasselbe Dokument ist.

Der Transfer-Kurzcheck (3 Fragen, `user.labChecks`) fragt genau diese drei Ebenen ab.

## Verifikation

- **3036 Werte** gegen eine unabhängig aus dem Lecture-Trace und dem Handout getippte
  Referenz — 0 Abweichungen. Die Referenz wurde vor dem Lab geschrieben.
- **8790 gerenderte Zahlen je Sprache** über alle 153 Zustände aus dem echten DOM gezogen
  und gegen die Referenz gehalten: 147/147 Kurven-Zustände zeichengenau, die 6
  n-Gramm-Zustände zellenweise (Jaccard, Schnitt/Vereinigung, Verdikt). **DE == EN,
  0 Abweichungen.**
- **4251 Textknoten** im EN-Modus über 24 Zustände gescannt: **0 deutsche Rückstände**.
- Kein `toFixed`-Ergebnis benutzt ein Dezimalkomma (Hausregel: Prosa Komma, Rechnung Punkt).
- **27/27 Kurzcheck-Kombinationen**: genau eine akzeptiert, 0 Leckage. Die
  Persistenzprüfung hat vorher belegt, dass sie reale Daten liest
  (`cs336-lernwerk-v2:guest`), und setzt vor jedem Versuch zurück — der erste Lauf meldete
  einen Scheinleck aus genau diesem Grund.
- Reload-Restore: Kurzcheck-Zustand und alle drei Antworten überleben.
- Kein Overflow @375 px (18 Zustände) und @1280 px; Tabelle 520 px in einer 563-px-Bühne;
  alle sichtbaren Controls ≥ 44 px. Der Modusschalter versteckt b/r im n-Gramm-Modus und
  die Normalisierung im Kurvenmodus — die Felder liegen in schlichten `<div>`s, damit der
  bekannte `.field { display: grid }`-Fallstrick nicht greift.
- Konsole leer, `?v=69` lädt 200.
- `check-i18n` grün: **44 Labs, 2540 UI-Strings**.

**66 Guard-Mutationen, alle 66 gefangen, 0 escaped, 0 inert.** Im ersten Lauf entkamen drei:

1. `duplicate:value.j>tau` → `>=tau` änderte kein Bit, weil kein Zellwert zufällig auf einer
   Schwelle lag — also eine untaugliche Mutation und zugleich eine unbelegte Behauptung.
   Jetzt setzt ein Guard τ **absichtlich** auf einen berechneten Jaccard-Wert und verlangt,
   dass die Zelle dort **kein** Duplikat ist (das Handout schreibt „exceed").
2. `reports.map` kam fünfmal in der Datei vor — der Guard blieb grün, obwohl die
   Tabellenzeilen-Erzeugung ersetzt war. **Muster (5) „Vorkommen statt Ort", zum vierten
   Mal.** Jetzt verlangt der Guard das vollständige Markup-Fragment inklusive
   `data-pair="${report.pair.key}"`.
3. Die dritte war eine untaugliche Mutation im Harness selbst (sie benannte einen
   `symbols`-Schlüssel um, statt eine zweite Lecture das Lab beanspruchen zu lassen) —
   ersetzt durch die echte Variante gegen `l13`.

Zwei weitere Mutationen wurden anfangs als `INERT` gemeldet, beide wegen mehrdeutiger Anker
(3 bzw. 2 Treffer). Der Harness zählt Treffer statt blind zu ersetzen, sonst hätte er die
falsche Stelle mutiert und den Guard fälschlich für stark gehalten.

**Eigene tote Daten vor der Verifikation gesucht und gefunden:** `lshSelection()` gab
`tauEntry` zurück, das kein Renderer las; `LSH_CORPUS_DOCS` war deklariert, während „1000"
nur als Prosa in einer Überschrift stand; `LSH_DOC_PAIRS[].key` erreichte das DOM nie. Alle
drei behoben — die Korpusgröße und die Paarsumme stehen jetzt als zwei Zeilen nebeneinander
(ein Guard rechnet nach, dass die Summe exakt C(N,2) ist), und `key` ist als `data-pair`
adressierbar, was die DOM-Verifikation zellenweise erst möglich gemacht hat.

## Bewusst nicht gemacht

- **Kein Eintrag in weiteren Lecture-Guides.** Nur L14 rechnet die Kollisionskurve; ein
  Guard verbietet jeder anderen Lecture, das Lab zu führen, und die Mutation dagegen wurde
  gefangen.
- **Keine Aussage darüber, was `test_minhash_deduplication` prüft.** Die Testdatei liegt
  nicht im Repo. Das Lab argumentiert ausschließlich über Zahlen, die es selbst rechnet.
- **Kein echtes MinHash-Sampling.** Die Signaturschätzung ist eine zweite Fehlerquelle, aber
  die Entscheidung, um die es geht, hängt an der Bandstruktur; ein Sampling-Modus hätte
  Rauschen über die Aussage gelegt. Dass die Zahlen Erwartungswerte sind, steht im Lab.
- **`dedup-pipeline` nicht angefasst.** Es lehrt die Stufen und tut das gut; das neue Lab
  steht daneben, nicht darüber.

## Nächste Hebel

1. `a4:quality_classifier` (15 P., das teuerste A4-Problem) — `filtering-mechanics` deckt
   KenLM/fastText/DSIR qualitativ; **vorher prüfen**, ob Threshold, Precision und Recall
   irgendwo als Zahl gerechnet werden oder nur als Begriffe vorkommen.
2. `a4:gopher_quality_filters` (3 P., aber exakter Zahlenvertrag) — `mean_word_length`,
   `alphabetic`, `stop word` haben je **0 Treffer**, obwohl das Handout fünf exakte
   Schwellen nennt. Kleiner Punktwert, sauber prüfbarer Vertrag.
3. `a4:pipeline-audit` / `a4:tokenize-train` (je 10 P.).
4. `a1:checkpointing` / Resume-Vertrag (seit v57 offen, 1 Punkt, aber echter Testvertrag).
