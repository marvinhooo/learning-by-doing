# Deep Review 2026-09-23 — v120

Branch `claude/deep-review-v120`, gebaut auf dem Kettenkopf v119 (`6cdb460`).
Ahnenprüfung **vor** dem Lauf: der zugewiesene Worktree stand auf v99 (`2ed21e7`),
**21 Commits hinter dem Kopf**; die Prüfung über alle Spitzen fand v100–v119 als
zusammenhängende Kette, kein verlorener Zweig. Auf v119 zurückgesetzt, dort gearbeitet.
Ahnenprüfung **nach** dem Lauf: jede Branch-Spitze im Kopf enthalten.
Codex-Prüfung: der Haupt-Checkout ist seit Juli unberührt, keine aktive Sitzung.

Baseline: 72 Guard-Blöcke grün, 77 s. Danach: **73 grün**, 79 s.

## Der geschlossene Hebel: offener Hebel 2

Die Liste sagte: „Tausendergruppierung im deutschen Render (`43200` statt `43.200`),
legitime Ausnahmen unklassifiziert. **Jetzt der größte offene Hebel.**"

Die Gruppierung selbst war seit v92 in Ordnung — `fixedNum` gruppiert, und der
Guard hält das fest. Der offene Teil war die andere Hälfte derselben Frage: **welche
Zahlen erreichen den Leser, ohne je einen Helfer zu passieren?**

Und da lag die Fläche, die zwei Sweeps übersprungen hatten.

## Was zwei Sweeps nicht gesehen haben

Der Dezimal-Sweep (v92) und der Exponential-Sweep (v110) prüfen beide die **Bühne** —
das Markup, das `initLab` schreibt. Dort geht jede Zahl durch `fixedNum` oder `expNum`.

Keiner hat je ins **Bedienfeld** gesehen: `labMarkup`, die Fläche, auf der der Leser
steht, *bevor* er einen Regler anfasst. Dort stehen die Zahlen von Hand im Template.

Gemessen über alle 64 Bedienfelder: **115 Zahlen mit einem Punkt zwischen Ziffern.**
Jede einzeln beurteilt:

| Klasse | Treffer | Urteil |
|---|---|---|
| gruppierte Tausender | 66 | legitim (`10.000.000`, `3.651,31`, `[1.344, 512]`) |
| Handout-Verweise | 47 | legitim (`A1 §7.2.1`, `§3.2.1`) |
| Produktversion | 1 | legitim (`Llama 3.1 8B`) |
| Dotted Quad | 1 | legitim (`1.2.3.4`, mask-pii) |
| **Leck** | **23** | **der deutsche Leser sieht einen Punkt** |
| inert | 8 | `<output>`-Literale, die `initLab` überschreibt |

## Die 23 Lecks, und warum sie mehr als kosmetisch sind

Auf Deutsch ist der Punkt der **Tausendertrenner**. `1.000000` liest sich nicht
bloß fremd — es liest sich als eine Million.

- **quality-threshold** (8): „zeigen alle drei die Precision 1.000000" — während das
  Panel daneben `1,000000` rechnet. Dazu `35.93 %`, `20.96 %`, `8.38 %`, `0.571429`.
- **compression-ratio** (6): „Bei 327.68 M Tokens" — auf Deutsch 32768, in einem Lab,
  dessen Thema die Größenordnung ist. Dazu `0.616 GiB`, `0.451 GiB`, `26.81 %`.
- **ablation-controls** (4): die vier Optionslabels `c = 0.25` … `c = 2.00`.
- **online-softmax-kata** (2): `e⁻¹ ≈ 0.368`, unmittelbar neben `${fixedNum(1.368,3)}`,
  das im selben Fieldset `1,368` druckt.
- **dedup-pipeline** (3): `J > 0.3 / 0.5 / 0.7`.

**Drei standen im selben Satz wie eine korrekt geschriebene deutsche Zahl:**
„1. τ = 0,50, τ = 0,80 und τ = 0,95 zeigen alle drei die Precision 1.000000."
Das ist die Form, die der Leser bemerkt und sich nicht erklären kann.

Dazu drei Lecks in den **Kartenfeldern** (nicht in `labMarkup`, also von diesem
Guard nicht abgedeckt — als Fläche benannt): `decay-horizon`s observe-Prosa hieß den
Leser `0.000000e+0` suchen, während `expNum` `0,000000e+0` druckt; `mixed-precision`
nannte `10.000133514404297`, dessen führendes `10.000` wie eine Gruppierung aussieht;
`dedup-pipeline` schrieb `J>0.5` und `τ=0.5` an fünf Stellen.

## Zwei Reparaturwege, und warum die Wahl nicht kosmetisch ist

Der englische Leser bekommt Bedienfeldtext über **zwei verschiedene** Wege, und
davon hängt ab, was eine Reparatur anrichtet:

1. **Kein Übersetzungsschlüssel am String** → `fixedNum` entscheidet das Trennzeichen.
   Beide Richtungen nachgesehen: de `0,368`, en `0.368`. Kein Schlüssel nötig.
2. **Ein Schlüssel hängt daran** (der DOM-Lauf übersetzt die ganze Zeichenkette) →
   der deutsche Text wird geändert **und der Schlüssel im Pack in einem Zug
   mitgezogen**. Der Editor läuft dafür als Token-Strom über `i18n-en.js` und
   schreibt nur, was von einem `:` gefolgt wird — **nur Schlüssel, nie Werte.**
   Alle 15 betroffenen Schlüssel danach einzeln nachgesehen: englischer Wert
   unverändert in Punktschreibweise.

Der erste Versuch hat diese Unterscheidung selbst erzwungen: `${fixedNum(0.5,1)}`
in „Welche Kanten überleben J > 0.5?" gesetzt — woraufhin der `panel i18n`-Guard
abbrach. Er hatte recht: `panelStaticText` schneidet Interpolationen heraus, es blieb
„Welche Kanten überleben J > ?", und dafür gibt es keine Übersetzung. Eine
Interpolation mitten in einem deutschen **Satz** zerstört dessen Schlüssel. Zurück
auf ein Literal mit Komma, Schlüssel nachgezogen.

## Der Guard klassifiziert nach Struktur, nicht nach Schreibweisen

Die allgemeine Behauptung — jeder Punkt zwischen Ziffern, den ein deutscher Leser
sieht, ist ein Tausendertrenner — ist in dieser App falsch, und zwar absichtlich.
Vier Klassen überleben die Übersetzung, jede an ihrer **Struktur** erkannt statt an
einer Liste. Jede wird gezählt und in beiden Richtungen gehalten: eine Klasse, die
nicht mehr vorkommt, ist selbst ein Fehler — sonst winkt ein Klassifizierer, der
nichts mehr trifft, alles durch.

## Die Klausel, die zählt: keine führende Null

Gruppierung beginnt nie mit einer führenden Null. Ohne diese Klausel liest der
Klassifizierer `0.368` als `\d{1,3}\.\d{3}` — eine Tausendergruppe — und lässt es
durch. Genau das ist im ersten Messlauf passiert: vier Lecks (`0.368`, `0.135`,
`0.616`, `0.451`) standen als „legitim" in der Tabelle.

Das ist als **Paar** gemessen, nicht behauptet:

| Mutation | Ergebnis |
|---|---|
| M1 `Precision 1.000000` zurück | gefangen |
| M2 `c = 0.25`-Label zurück | gefangen |
| M3 `+36.63 %` zurück | gefangen |
| M4 `0.368` als Literal zurück | gefangen |
| **M4b dasselbe, Klausel gelockert** | **entkommen** — die Klausel ist tragend |
| M5 `<output>`-Erkennung zerstört | gefangen (Untergrenze) |
| M6 Gruppierungsklasse entfernt | gefangen (64 Treffer werden Lecks) |
| M7 Verweisklasse entfernt | gefangen (47 Treffer werden Lecks) |
| *Kontrolle:* Punkt in einem Attribut | bleibt grün |
| *Kontrolle:* unverändert | bleibt grün |

**7 von 7 gefangen, 0 unerklärt inert, 2 grüne Kontrollen.**

Der erste Lauf des Mutationstests meldete *alles* als gefangen — **auch die
Kontrolle**. Das war der Beweis, dass die Testumgebung kaputt war und nicht der
Guard. Ohne die grüne Kontrolle wäre daraus „10 von 10 gefangen" geworden.

## Die 8 inerten, mit gemessenem Grund

Acht `<output>`-Literale (`attention` `1.00`, `optimizer` `0.0030/0.60/0.10`,
`roofline` `2.0`, `scaling` `0.40`, `data-pipeline` `0.55`, `inference-budget` `3.35`)
sind toter Text: `initLab` ruft die Update-Funktion beim Öffnen einmal auf, und die
schreibt den Wert über `fixedNum` neu, bevor der Leser das Panel sieht. Sie sind
**nicht repariert**, weil sie kein Defekt sind — aber die Maskierung ist an die
gemessene Bedingung gebunden: nur ein `id`, den die App nachweislich über einen
Zahlenhelfer neu schreibt, wird maskiert, und fällt die Zahl unter 8, bricht der
Guard. Hörte ein Panel auf, seinen Output zu überschreiben, wäre der Text wieder live.

Dass `inference-budget` dazugehört, hat der erste Klassifizierer **falsch** gehabt:
seine Zuweisung ist ein Template-Literal (`` `${fixedNum(bw,2)} TB/s` ``), und das
Muster verlangte `fixedNum` direkt hinter dem `=`. Beinahe hätte dieser Lauf eine
inerte Stelle „repariert" und als Fund gezählt.

## Offene Hebel

1. **Erledigt:** das Bedienfeld ist als Fläche geschlossen und wird gezählt gehalten.
2. **Die Formelkarten-Beispiele — jetzt der größte offene Hebel, und ein
   musterbasierter Sweep kann ihn nicht fahren.** Gemessen: 29 skalare Stellen und
   33 in eckigen Klammern, über 11 Karten in `FORMULAS`/`CONCEPTS`, und sie stehen
   **in denselben Sätzen**. Zwei Gründe, warum das Handarbeit mit einer
   Notationsentscheidung ist:
   - In `[0.849,1.131]` ist das Komma bereits Listentrenner. Deutsch schreibt hier
     `[0,849; 1,131]` — das ändert die mathematische Notation des Tafelwerks und ist
     eine Inhaltsentscheidung, keine Reparatur. Nur die Skalare zu ändern erzeugt
     Sätze, die in sich widersprüchlich sind (`0,55` neben `[0.75,0.25]`).
   - **Der Klassifizierer ist auf dieser Fläche systematisch blind:** `1.368`,
     `1.503`, `2.924`, `3.536` sind Dezimalzahlen, die exakt wie eine deutsche
     Tausendergruppe aussehen. Auf den Bedienfeldern gab es diesen Konflikt nicht
     (alle 66 Gruppierungen waren echt); hier lässt er sich ohne Bedeutung des Satzes
     nicht auflösen. Die 29/33 sind deshalb eine **Untergrenze**.
   Empfehlung: pro Karte von Hand, Komma als Dezimaltrenner und Semikolon als
   Listentrenner, `FORMULAS` ist id-geschlüsselt — der englische Pack bricht nicht.
3. `l13` fehlt eine Formelkarte für die Gopher-Qualitätsregeln.
4. Der Korpus-Detektor läuft an 5 Flächen; Konzept- und Lecture-Seiten könnten
   denselben Scan bekommen. Der neue Punkt-Scan ebenso — er läuft nur auf `labMarkup`,
   und drei der diesmal reparierten Lecks lagen in Kartenfeldern, die er nicht sieht.
5. Browsertest steht seit v71 aus (in geplanten Läufen gesperrt).
6. `origin/main` auf `2ed21e7`; **v100–v120 ungepusht.**
