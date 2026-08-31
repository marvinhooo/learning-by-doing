# Deep Review v89 — 2026-08-31 — die Formelkarte, zu der der Weg nicht führt

Kettenkopf war wieder **nicht** der zugewiesene Worktree: dieser stand auf `4067294`
(Antigravitys Begriffslisten), der Kopf auf `01764fe` (v88) in `nice-chatelet-c0f663`.
`git merge-base --is-ancestor` sagte, dass v88 den Ast bereits enthält — also sauberer
Fast-Forward statt Merge ([[cs336-parallel-codex-edits]]). Keine fremde Session aktiv:
`index.html` und `i18n-en.js` zuletzt am 30.08. um 07:32 angefasst, der Lauf begann am
31.08. um 07:11.

## Zwei Gegenproben, bevor irgendetwas gebaut wurde

**Die erste Kennzahl war keine Lücke.** Der Guard meldet „124 problems, … 50 with
adapter/test handles". Das klang nach 74 Problemen ohne Prüfweg. Gemessen: von den 124
sind **58 Code-Probleme, davon tragen 48 die Handles**; die zehn übrigen sind Skript- und
Experimentprobleme (`training_together`, `decoding`, `benchmarking_script`, `filter_data`,
`tokenize_data`, fünf aus A5), für die die Handouts selbst keinen Adapter drucken.
Kein Loch. Wieder [[cs336-metric-is-a-suspicion]].

**Der offene Hebel Nr. 1 aus v87/v88 war richtig einsortiert.** `lm-objective` ist das
einzige Selbststudium-Konzept ohne Lab. Gegenprobe über `PROBLEM_CONCEPTS`: es entscheidet
**0 der 124 Probleme**. Die Vorgängerreports hatten es aus genau diesem Grund hinten
einsortiert; das bleibt so.

## Der Befund: elf Formelkarten, an denen der Lernpfad vorbeiführt

Eine Formelkarte ist die Stelle, an der aus einer Gleichung eine verstandene Regel wird:
Zweck, benannte Größen, ein klein gerechneter Fall, dann erst die allgemeine Form. Zwei
Flächen stellen einem Leser, der L1 bis L17 geht, eine solche Karte hin:

1. die **Lecture-Seite** druckt ihre kuratierte Liste (`guide.formulas.map(...)`),
2. die **Konzeptseite** druckt die Formeln des Konzepts, gefiltert auf dieselbe Liste —

```js
function conceptFormulaIds(c,lectureId){
  if(!lectureId)return [...c.formulas];
  const curated=LECTURE_GUIDES[lectureId]?.formulas||[];
  return c.formulas.filter(id=>curated.includes(id));
}
```

— und fällt, wenn die Lecture **keine** Formel dieses Konzepts kuratiert, auf die erste
Formel des Konzepts zurück (`curatedFormulaId||c.formulas?.[0]`).

Was außerhalb beider Flächen liegt, existiert — aber der Weg führt nicht hin. Man findet es
nur über das Tafelwerk oder über die Assignment-Seite, also **am Problem statt davor**.

**Gemessen über alle 17 Lectures und ihre 106 Lernseiten: 68 der 79 Karten sind erreichbar.
Elf nie.** Darunter:

| Karte | entscheidet Probleme | Punkte |
| --- | --- | --- |
| `mfu` | 14 | 56 |
| `fasttext-filter` | 3 | 27 |
| `importance-resampling` | 3 | 27 |
| `softmax` | 3 | 15 |
| `causal-attention` | 2 | 10 |
| `linear-map` | 4 | 8 |

## Die Gegenprobe an den Quellen, Karte für Karte

Eine fehlende Karte ist noch kein Fehler — sie kann bewusst weggelassen sein, weil die
Lecture das Thema nicht führt. Also wurden alle siebzehn Quell-PDFs im Volltext geprüft
(`pdftotext`, 25.540 Zeilen). Neun der elf Karten werden von der Lecture, die ihr Konzept
führt, **wörtlich hergeleitet**:

| Lecture | Karte | Beleg in der Quelle selbst |
| --- | --- | --- |
| L02 | `mfu` | eigene Abschnittsüberschrift „Model FLOPs utilization (MFU)"; `mfu = actual_flop_per_sec / promised_flop_per_sec`; „Usually, MFU of >= 0.5 is quite good" |
| L02 | `training-flops` | „Putting it togther: … Total: 6 (# data points) (# parameters) FLOPs" |
| L02 | `linear-params` | „(D K) is the number of parameters"; `actual_num_flops = 2 * B * D * K` |
| L02 | `linear-map` | baut `nn.Linear` und zählt seine Operationen (`tensor_operations_flops`) |
| L03 | `softmax` | „Recall the softmax calculation"; „Softmaxes – can be ill-behaved due to exponentials / divison by zero" |
| L10 | `mlp-arithmetic-intensity` | `assert flops == 2*B*D*F`, `assert bytes_transferred == 2*B*D + 2*D*F + 2*B*F`, `intensity = (flops / bytes_transferred)` |
| L10 | `attention-arithmetic-intensity` | `assert intensity == S*T / (S + T)` — die Karte ist `AI_attn = S·T_q/(S+T_q)` |
| L10 | `ssm-recurrence` | Abschnitt „State-space models", S4 |
| L10 | `diffusion-generation` | Abschnitt „Diffusion models" |
| L14 | `ngram-filter` | „Algorithmic tools: n-gram models (KenLM), classifiers (fastText), importance resampling (DSIR)" |
| L14 | `fasttext-filter` | Abschnitt `fasttext_main()`, „fastText classifier: bag of word embeddings" |
| L14 | `importance-resampling` | Abschnitt `dsir_main()`, „Fit target distribution p … Do importance resampling with p, q, and raw samples" |

**Die restlichen zwei gehören nicht auf den Pfad, und die Quellen sagen das selbst:**
`gradient-clip` hat in **allen siebzehn PDFs null Treffer** für Clipping, `causal-attention`
gehört `causal-mask` — beides Konzepte, die keine Lecture führt und die die
Selbststudium-Sektion der Assignment-Seite bereits ausweist.

## Die unabhängige Bestätigung, die ich nicht gesucht hatte

Nachdem die Platzierung aus den PDFs feststand, habe ich das `sources`-Feld der Karten
gelesen — die eigene Quellenangabe der App, an der ich nichts geändert habe:

**Alle zwölf Karten nannten längst genau die Lecture, auf die die PDFs sie legen.**
`mfu` → `[l02,a2]`, `attention-arithmetic-intensity` → `[l10]`, `fasttext-filter` →
`[l14,a4]`, `softmax` → `[a1,l03]`, und so weiter. Die beiden off-path-Karten nennen
`[a1]` — **keine Lecture**. Die App wusste, wo die Karten hingehören; nur die Kuratierung
der Lecture hat sie nie aufgeführt. Umgekehrt widerspricht **keine** der 55 vorher schon
kuratierten Karten ihrer eigenen Quellenangabe (0 Abweichungen).

## Was geändert wurde

Vier Zeilen — die kuratierten Formellisten von L02, L03, L10 und L14:

| Lecture | vorher | nachher |
| --- | --- | --- |
| L02 | 4 Formeln | 8 |
| L03 | 8 | 9 |
| L10 | 3 | 7 |
| L14 | 4 | 7 |

**Erreichbar auf dem Pfad: 68 → 77 von 79.** Nichts verliert Erreichbarkeit (geprüft in
beide Richtungen). Die übrigen zwei sind die beiden deklariert off-path.

### Drei Arbeitsbeispiele wechseln — genannt, nicht verschwiegen

Weil der Primer die **erste kuratierte** Formel in der Reihenfolge des Konzepts nimmt,
verschiebt eine neue Karte in drei Fällen das gerechnete Beispiel der Seite. Jedes wandert
auf die Gleichung, die die Lecture wirklich herleitet:

| Seite | vorher | nachher |
| --- | --- | --- |
| L02 · `resource-accounting` | `transformer-params` (12·L·d²) | `training-flops` (6ND) |
| L02 · `training-loop` | `global-batch` | `mfu` |
| L03 · `probability` | `mean-var` | `softmax` |

Der erste ist der interessante: **12·n_layer·d_model² steht nirgends in einer Lecture** —
es ist A3s eigene Angabe („To estimate the number of non-embedding parameters …, use
12𝑛layer 𝑑model²", A3 §3.3). L02 dagegen leitet 6ND wörtlich her. Die Seite zeigte bisher
über den Fallback die Handout-Formel als Beispiel der Lecture; jetzt zeigt sie die der
Lecture. `transformer-params` bleibt über `transformer-block` (L03), das Tafelwerk und die
A3-Seite erreichbar.

Die übrigen drei Primer, die sich hätten verschieben können, wurden bewusst stabil
gehalten, indem die jeweils frühere Karte mitkuratiert wurde — `ngram-filter` (L14) und
`ssm-recurrence` (L10) haben denselben Quellenbeleg wie ihre Nachbarn.

## Der Guard: `lecture formulas`

Der neue Block rechnet die Erreichbarkeit **mit den Funktionen der App selbst** nach —
`LECTURE_GUIDES`, `lectureLearningPages` und `conceptFormulaIds` werden per
`sliceDeclaration` aus `index.html` geschnitten und in einem VM-Kontext ausgeführt, nicht
nachgetippt ([[cs336-guard-verification-lessons]]: eine Prüfung muss lesen, was die App
wirklich tut). Er hält:

* **beide Renderflächen**: die Lecture-Seite muss `guide.formulas.map(...)` weiter drucken,
  die Konzeptseite weiter durch `conceptFormulaIds(c,lectureId)` filtern, und der Primer
  muss seinen Fallback `curatedFormulaId||c.formulas?.[0]` behalten — ohne ihn wäre die
  ganze Erreichbarkeitsrechnung eine Aussage über einen Renderer, den es nicht mehr gibt;
* **jede kuratierte ID existiert**, keine Lecture führt dieselbe Karte zweimal;
* **77 von 79 erreichbar**; jede unerreichbare Karte, die nicht deklariert ist, lässt den
  Lauf fehlschlagen — mit der Aufforderung, sie dort zu kuratieren, wo ihre Quelle sie
  lehrt, oder sie mit Begründung off-path zu setzen;
* die **zwei deklarierten Ausnahmen** binden an eine Tatsache, die die App selbst berechnet:
  `causal-attention` und `gradient-clip` dürfen nur off-path bleiben, solange `causal-mask`
  bzw. `clipping` Konzepte sind, die **keine Lecture führt**. Nimmt eine Lecture Clipping
  auf, schlägt der Guard fehl und die Platzierung muss neu entschieden werden — die Ausnahme
  kann nicht stillschweigend überleben;
* die **zwölf zurückgeholten Karten** bleiben auf der Lecture, deren Quelle sie herleitet,
  jede mit ihrem Beleg als Kommentar;
* **sechs Arbeitsbeispiele sind festgenagelt** (die drei gewechselten und drei bewusst
  stabil gehaltenen), damit ein späterer Edit sie nicht unbemerkt verschiebt.

### Die Richtung, die schon geprüft war — und die, die fehlte

Der Mutationstest hat eine Sache sichtbar gemacht, die den Befund erst richtig erklärt.
Die Mutation „`gradient-clip` auf L02 kuratieren" wurde **nicht** vom neuen Block gefangen,
sondern von einem, den es längst gibt:

```
Error: lecture guides.l02.formulas: gradient-clip does not cite l02
```

Das Repo prüfte also bereits die eine Richtung: *wenn* eine Lecture eine Karte kuratiert,
muss die Karte diese Lecture als Quelle nennen. Nie geprüft war die Gegenrichtung: *wenn*
eine Karte eine Lecture nennt, muss der Pfad sie auch zeigen. Genau in dieser Lücke saßen
die elf.

## Prüfung

* **Guard-Suite 36 → 37 Blöcke, grün.** Neuer Block `lecture formulas`.
* **Mutationstest: 13 echte Mutationen, 0 entkommen**, Kontrolle (nur ein Kommentar
  geändert) grün geblieben, Arbeitsbaum nach jedem Lauf nachweislich wiederhergestellt.

| Mutation | gefangen von |
| --- | --- |
| `mfu` verlässt L02 | `lecture formulas` (unerreichbar) |
| `fasttext-filter` verlässt L14 | `lecture formulas` |
| `ngram-filter` verlässt L14 | `lecture formulas` |
| `softmax` verlässt L03 | `lecture formulas` |
| `ssm-recurrence` verlässt L10 | `lecture formulas` |
| `mlp-arithmetic-intensity` verlässt L10 | `lecture formulas` |
| Kuratierungsfilter abgeschaltet | `lecture formulas` (off-path-Karte wurde erreichbar) |
| Lecture-Seite druckt ihre Formeln nicht mehr | `lecture formulas` (Renderfläche) |
| `gradient-clip` auf L02 kuratiert | `lecture guides` (zitiert L02 nicht) |
| unbekannte Formel-ID kuratiert | `lecture guides` |
| dieselbe Karte zweimal in einer Liste | `lecture guides` |
| Primer-Fallback entfernt | `concept primer` |
| Konzeptseite filtert nicht mehr | `concept renderer` |
| *Kontrolle: nur ein Kommentar geändert* | *grün geblieben* |

* **Alle zwölf neu kuratierten Karten sind inhaltlich vollständig** — kein leeres Feld,
  gerechnetes Beispiel vorhanden (73 bis 315 Zeichen), englische Fassung vorhanden. Es
  landet nichts Halbfertiges auf dem Pfad.
* **Kein Verlust in die Gegenrichtung:** vor und nach der Änderung wurde die
  Erreichbarkeitsmenge vollständig berechnet und verglichen — 0 Karten verlieren ihre
  Erreichbarkeit.
* Beide Snapshots (vorher/nachher) wurden **aus `git show HEAD:index.html` rekonstruiert**
  statt aus dem Arbeitsbaum gelesen, weil währenddessen der Mutationsrunner lief.

### Zwei Fehlversuche, die im Protokoll bleiben

Der Mutationsrunner wurde **zweimal von einem Zwei-Minuten-Timeout mitten im Lauf
abgeschossen** und ließ dabei jedes Mal eine Mutation im Arbeitsbaum stehen (einmal
`renderLectureDetail` ohne Formelliste, einmal L10 ohne `mlp-arithmetic-intensity`).
Beide wurden sofort bemerkt, weil nach jedem Lauf `git diff` gegen die vier beabsichtigten
Zeilen geprüft wurde, und beide wurden zurückgesetzt. Das ist dieselbe Lehre wie in v85,
diesmal von der anderen Seite: nicht gleichzeitige Edits, sondern ein **abgebrochener**
Runner. Ein Mutationslauf gehört in den Hintergrund, nicht in ein Vordergrund-Timeout.

Außerdem wurde eine Messung verworfen: eine Zwischenauswertung las `index.html`, **während**
der Runner die Datei tauschte, und meldete dadurch `mfu` als weiterhin unerreichbar. Die
Zahl war ein Artefakt des Lesezeitpunkts, nicht ein Befund — deshalb die Rekonstruktion
aus dem Git-Objektspeicher oben.

## Was ich nicht gemacht habe

* **Kein Browsertest.** In geplanten Läufen ist `preview_start` gesperrt
  ([[cs336-unattended-no-preview]]). Ersatz ist hier, dass der Guard beide Renderflächen
  im Quelltext festhält und die Erreichbarkeit mit den Funktionen der App selbst rechnet.
* **`transformer-params` nicht künstlich auf L02 gehalten.** 12·L·d² ist A3s Formel, keine
  Lecture leitet sie her; sie bleibt über L03, das Tafelwerk und die A3-Seite erreichbar.
* **`lm-objective` weiterhin ohne Lab** — gemessen: entscheidet 0 der 124 Probleme.

## Nächste Hebel

1. **Die Quellenangaben der Karten, die keine Lecture stützt.** Nach dieser Änderung nennen
   noch vier Karten eine Lecture, auf der der Pfad sie nicht zeigt — und drei davon zu Recht,
   weil das `sources`-Feld überzieht: `cross-entropy` nennt L02, aber „cross entropy" hat in
   L02 **null Treffer** (es ist ein Selbststudium-Konzept); `embedding-params` nennt L03, das
   nur Positions-Embeddings führt; `transformer-params` nennt L02, gehört aber A3. Die
   vierte, `memory-state`, ist echt: L02 rechnet
   `total_memory = 4 * (num_parameters + num_activations + num_gradients + num_optimizer_states)`
   und die Karte gehört auf L02. Der Hebel ist, `sources` zu einer geprüften Aussage zu
   machen statt zu einer Behauptung.
2. **Die restlichen Labs render-fähig machen** (offen seit v82): `english render` erreicht
   12 von 57.
3. **Attribut-i18n** (`aria-label`, `title`, `placeholder`) — offen seit v81.
4. **Tausendergruppierung vereinheitlichen** — offen seit v79.
5. **Sechs unerreichbare Defaults** in den Lab-Helfern — offen seit v79.
