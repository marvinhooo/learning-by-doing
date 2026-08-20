# Deep Review 2026-08-20b — Die drei offenen Hebel aus v78 (v79)

Basis `2cf1729` (v78). Kein neues Lab, sondern die drei Hebel, mit denen der v78-Report
geschlossen hat. Einer war eine Fehlannahme, zwei sind erledigt, einer bleibt offen —
in dieser Reihenfolge unten.

## Hebel 3 war zur Hälfte eine Fehlannahme

v78 hatte gezählt: **sieben von 52 Labs sind von keiner Lecture-Seite erreichbar**, und daraus
geschlossen, wer den Lernpfad Lecture für Lecture geht, begegne ihnen nie. Als 13-%-Loch im
Lernpfad klang das nach dem wichtigsten der drei Hebel.

Beim Registrieren schlug ein bestehender Guard an:

```
microbatch-denominator: no lecture guide may list this lab,
no lecture PDF teaches gradient accumulation for the RLVR loss
```

Eine frühere Version hatte den Fall bereits entschieden und die Entscheidung festgehalten.
Die Suche nach dem Mechanismus dahinter führte zu einer expliziten Liste:

```js
const selfStudyConcepts = ["lm-objective", "causal-mask", "cross-entropy", "adamw", "clipping", "sampling"];
```

Sechs Konzepte, die **keine Lecture lehrt**. Die App führt sie nicht heimlich auf einer
Lecture-Seite mit, sondern zeigt sie auf der Assignment-Seite als Voraussetzung an
(`assignment self-study OK: 5 concepts no lecture teaches, surfaced on 2 assignment pages`).
Damit war die Bilanz eine andere:

| Lab | Konzept | Urteil |
|---|---|---|
| `optimizer` | `adamw` | absichtlich off-path |
| `loss-and-clip` | `cross-entropy`, `clipping` | absichtlich off-path |
| `decode-sampling` | `sampling` | absichtlich off-path |
| `microbatch-denominator` | — | absichtlich off-path, seit einer früheren Version geguardet |
| `resources` | `resource-accounting` (l02) | Modul `gpu` zitiert l02 nicht — bleibt |
| **`shapes`** | **`shapes` (l02)** | **echte Lücke → l02** |
| **`scaling`** | **`isoflops` (l09)** | **echte Lücke → l09** |

Nur zwei der sieben waren Lücken, und beide sind vom selben Typ: **eine Lecture kuratiert ein
Konzept, bietet aber kein Lab an, mit dem man es übt.** l02 kuratiert `shapes` und hatte acht
Labs, keines davon der Shape-Tracer; l09 kuratiert `isoflops` und hatte nur `scaling-fit`.

Beide sind jetzt registriert, und **alle sieben Entscheidungen sind geguardet** — auch die
fünf Nicht-Platzierungen. Der Guard nennt je Lab das Konzept, das es entscheidet, und schlägt
an, sobald dieses Konzept die Self-Study-Liste verlässt: dann muss die Platzierung neu
entschieden werden, statt still falsch zu bleiben.

Die Lehre gehört zu `cs336-metric-is-a-suspicion` und ist dort ergänzt: **bevor eine Zählung
eine Lücke belegt, nachsehen, ob das Repo den Fall schon entschieden hat.** Ein bestehender
Guard oder eine benannte Ausnahmeliste ist der schnellste Ort dafür — und war hier schneller
als jede Quellenprüfung.

## Hebel 2 — offen seit v76, jetzt geschlossen

Die App druckte **gruppierte Ganzzahlen sprachbewusst und Dezimalzahlen nicht**: `toLocaleString`
für die einen, `toFixed` für die anderen. Im deutschen Modus stand deshalb in derselben Tabelle

```
1.200        ← zwölfhundert, Punkt als Tausendertrennung
20.4545 %    ← ein Fünftel, Punkt als Dezimaltrennung
```

Für ein Lab, dessen Beobachtungstext „lies 20,4545 % in jener Spalte“ sagt, ist das kein
Schönheitsfehler: der Lernende sucht eine Zeichenkette, die dort nicht steht.

Ein gemeinsamer Helfer entscheidet das jetzt an genau einer Stelle:

```js
function fixedNum(value,digits){
  return Number(value).toLocaleString(localeCode(),
    {minimumFractionDigits:digits,maximumFractionDigits:digits,useGrouping:false});}
```

**149 Anzeigestellen und 11 Lab-Helfer** gehen durch ihn. Zwei Stellen behalten `toFixed`
bewusst: `rcSame` vergleicht zwei Lernraten auf zwölf Stellen, und ein Vergleichsschlüssel darf
nicht an der Anzeigesprache hängen. Ein Guard erzwingt beide Richtungen — kein `toFixed` mehr
in einer Anzeige, und `toFixed` weiterhin in `rcSame`.

### Warum das sicher war

Jede der fünf Guard-Sandboxes nagelt `localeCode` auf `"en-US"` fest. Damit verhält sich der
sprachbewusste Helfer unter jedem Guard **exakt wie das `toFixed`, das er ersetzt** — und
`check-i18n` mit unveränderten Werten in allen 18 Lab-Guards ist der Beweis, dass die
Umstellung unter Englisch ein byteweiser No-op ist. Das war das eigentliche Sicherheitsnetz für
149 mechanische Änderungen in einer 1,2-MB-Datei.

Das Umschreiben selbst lief über einen Rückwärtsscanner für den Empfängerausdruck, mit zwei
Zusicherungen je Stelle. Die erste — „Empfänger plus `.toFixed(N)` ergibt genau den ersetzten
Text“ — **war zu schwach und ließ einen echten Fehler durch**: bei

```js
${[0,0.3,0.8,1][i].toFixed(2)}
```

brach der Scanner nach `[i]` ab, und `[i].toFixed(2)` erfüllt die Zusicherung, weil jedes
Suffix sie erfüllt. Herausgekommen wäre `${[0,0.3,0.8,1]fixedNum([i],2)}`. Gefangen hat es erst
`node --check`. Die zweite Zusicherung prüft seitdem, dass **das Zeichen vor dem Empfänger eine
echte Grenze ist** — kein Bezeichner, keine schließende Klammer —, mit `return(x)` als einziger
erlaubter Ausnahme, weil dort ein Schlüsselwort und kein Aufgerufenes davorsteht.

### Was gemessen wurde

Über fünf headless renderbare Labs, jeweils deutsch und englisch gerendert und **paarweise
Zahl für Zahl** verglichen:

| Lab | Zahlenpaare | davon auf Dezimalkomma |
|---|---|---|
| ablation-controls | 219 | 60 |
| position-signal | 386 | 106 |
| pipeline-yield | 248 | 69 |
| stability-edge | 3 | 0 |
| decay-horizon | 311 | 53 |
| **gesamt** | **1.167** | **288** |

0 Abweichungen im Wert, und im deutschen Render trägt **keine einzige Dezimalzahl mehr einen
Punkt**.

### Was dabei auffiel und bewusst so bleibt

- **Sieben ältere Helfer waren längst sprachbewusst** (`batchDecimal`, `parsePercent`,
  `decodeNumber`, `decodePercent`, `winrateNumber`, `winratePercent`, `winrateSigned`) — aber
  **mit** Gruppierung. `fixedNum` gruppiert nicht, damit der englische Render byteweise das
  bleibt, was `toFixed` gedruckt hat. Sichtbar wird der Unterschied nur bei Werten mit
  Tausenderteil, und davon gibt es über die fünf geprüften Labs **zwei** (`1365,3333`, zweimal
  gedruckt). Gruppierung einzuschalten wäre die typografisch bessere, aber deutlich größere
  Änderung — sie verschiebt auch den englischen Render und damit die Erwartungswerte mehrerer
  Guards. Bewusst nicht in diesem Durchgang.
- **Sieben Lab-Helfer tragen unerreichbare Defaults** (`digits===undefined?6:digits`, obwohl
  keine Aufrufstelle die Stellenzahl weglässt). Sechs davon sind vorbestehend und bleiben
  unangetastet; der siebte war `dhNum` aus v78 und ist entfallen — nach der Umstellung war er
  nur noch ein Alias, seine 19 Aufrufe gehen jetzt direkt an `fixedNum`.

## Hebel 1 bleibt offen — und der Befund ist größer als gedacht

Der Hebel hieß „die Aufruf-Lücke in fremden Labs suchen“: Guards, die eine Funktion prüfen,
aber nicht, ob der Renderer sie richtig aufruft. Die Bestandsaufnahme über alle 18 Guard-Blöcke:

| Guard-Block | rendert? |
|---|---|
| lsh-bands, pipeline-yield, decay-horizon, quality-threshold, position-signal, ablation-controls, stability-edge, shard-ledger, compression-ratio, resume-contract | ja |
| **winrate-lc, batch-windows, mixed-precision, checkpoint-segments, offpolicy-clip, advantage-normalizers, microbatch-denominator** | **nein** |

Sieben Guards rendern nie und lesen auch den Renderer nicht. Der Grund ist struktureller als
eine falsche Aufrufstelle: **ihre Markup-Funktionen lesen die Regler selbst aus dem DOM**
(`document.getElementById("offMode").value`) und sind deshalb ohne DOM-Stub gar nicht
aufrufbar. Geprüft ist bei ihnen, was das Lab ausrechnet — **nicht, ob es das Ausgerechnete
überhaupt anzeigt.**

Ein Teil davon ist billig zu schließen: **sieben Stage-Renderer sind rein** und heute schon
headless aufrufbar — `offGspoStage`, `offClipStage`, `ckptNestingStage`, `advWeightStage`,
`advVariantStage`, `mbdBaselineStage`, `mbdLedgerStage`. Nur die dünnen Wrapper darüber lesen
das DOM. Ein generischer Harness dafür ist an der Abhängigkeitsauflösung gescheitert (die
transitive Hülle zieht Deklarationen mit, die der Slicer nicht sauber schneidet); der Weg, der
im Repo funktioniert, sind explizite Namenslisten je Lab, so wie es die zehn rendernden
Guard-Blöcke machen. Das sind sieben kleine, gleichförmige Arbeiten — **in diesem Durchgang
nicht erledigt**, und ich sage das lieber, als es halb zu machen.

## Verifikation

- `check-i18n` grün, **alle 18 Lab-Guards mit unveränderten Werten** — der Beweis, dass die
  Zahlenumstellung unter Englisch nichts bewegt.
- **1.167 Zahlenpaare** über fünf Labs deutsch/englisch verglichen, 0 Abweichungen,
  288 auf Dezimalkomma umgestellt, 0 deutsche Dezimalzahlen mit Punkt.
- `decay-horizon` weiterhin **41 Zustände × 2 Sprachen**, 145.115 identische Ziffern,
  identische Zahlenfolgen, 0 Strings ohne englischen Eintrag.
- `node --check` auf Inline-Script, `i18n-en.js` und `check-i18n.mjs`; **0 doppelte DOM-IDs**
  (541 IDs); **0 rohe `toFixed`** außerhalb von `rcSame`.
- Mutationstests: **7/7** für das Trennzeichen, **3/3** für die Lab-Platzierungen,
  **73/73** für v78 erneut (0 escaped, 0 inert).

## Nächste Hebel

1. **Renderabdeckung für die sieben Guards ohne Render** (oben beschrieben). Sieben reine
   Stage-Renderer sind sofort erreichbar; die fünf Wrapper, die das DOM lesen, brauchen
   entweder einen Regler-Stub oder eine Signaturänderung, die die Reglerwerte übergibt.
2. **Gruppierung vereinheitlichen.** `fixedNum` gruppiert nicht, die sieben älteren Helfer
   schon. Betrifft nur Werte mit Tausenderteil, verschiebt aber auch den englischen Render und
   braucht deshalb einen eigenen Durchgang mit angepassten Guard-Erwartungen.
3. **Sechs unerreichbare Defaults** in den Lab-Helfern. Mechanisch, aber jede Entfernung
   braucht den Nachweis, dass wirklich keine Aufrufstelle die Stellenzahl weglässt.
