# Deep Review v110 — 2026-09-13 — der verlorene Zweig: der Backward Pass

Fortsetzung von [v109](deep-review-2026-09-12b-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v109** (`4b9fcce`, Branch `claude/deep-review-v109`,
Worktree `ecstatic-sammet-48cf7f`) — per `git merge --ff-only` aufgeholt, neuer Branch
`claude/deep-review-v110`. Kein Codex aktiv: der Kopf-Worktree wurde zuletzt am 12. September
13:18 geschrieben, der Haupt-Checkout traegt Zeitstempel aus dem Juli. `origin/main` steht
weiter auf `2ed21e7`; **v100 bis v110 sind ungepusht.**

Auftrag unverändert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments lösen
können.

## Die Wahl: die Ahnenpruefung vor dem Inhalt

[[cs336-parallel-codex-edits]] verlangt vor jedem Lauf die Pruefung
`git merge-base --is-ancestor`, weil der juengste Commit nicht der Kettenkopf sein muss. Diesmal
hat die Pruefung nicht nur den Kopf bestaetigt, sondern **einen Befund geliefert**. Von allen
Branch-Spitzen des Repos lag genau eine **nicht** im Kettenkopf:

```
claude/brave-joliot-9862a6 -> 454630e 2026-08-14 feat: v72 — der Backward Pass hört auf, ein Satz Prosa zu sein
```

Ein **zweites v72**, parallel zu dem, das die Kette aufgenommen hat (`6d043f3`, der
Schrittzaehler) — dieselbe Verzweigung wie am 2026-09-03, nur ist diese hier nie vereinigt
worden. `grep -c "ffn-backward"` gab auf dem Kettenkopf **0**: 536 Zeilen verifizierter Arbeit,
seit dem 14. August lautlos verloren.

## Warum das kein Buchhaltungsfehler war

Die Zahl war der Verdacht, nicht der Befund ([[cs336-metric-is-a-suspicion]]) — also zuerst in
die Handouts.

**A2 §8.2 druckt den FFN-Backward als Gleichungen (24)–(30)** und laesst sie **dreimal**
wiederverwenden:

| Problem | Punkte | was es aus §8.2 braucht |
| --- | --- | --- |
| `data_parallel_calcs` (a) | 3 | „How many FLOPs are required to compute the backward pass" — mit Begruendung |
| `tp_calcs` (a), (b) | 4 | „A series of equations describing the backward pass" — woertlich: *„Feel free to reference the non-sharded backward pass in Section 8.2 and modify it"* |
| `gradient_checkpointing` | 4 | welche der Gleichungen eine gespeicherte Aktivierung liest |

Und **Lecture 2 rechnet den Faktor selbst vor**, Term fuer Term:

```
num_backward_flops += 2 * B * D * K      # w2.grad
num_backward_flops += 2 * B * D * K      # h1.grad
num_backward_flops += (2 + 2) * B * D * D  # w1 (though don't need x.grad)
  Forward pass: 2 (# data points) (# parameters) FLOPs
  Backward pass: 4
  Total: 6
```

**Was die Plattform dem gegenueberstellte:**

| | Kettenkopf v109 |
| --- | --- |
| Treffer fuer `dx₁`, `dx₂`, `W₃ᵀ`, `f'(` | **je 0** |
| Labs, die einen Gradienten rechnen | **0** |
| Stellen, die 6ND benutzen | **38** |
| Herleitung des Faktors 2 | **ein Nebensatz**: „etwa 2ND_tokens fuer den Forward Pass und etwa doppelt so viel zusaetzlich fuer den Backward Pass" |
| Labs am Konzept `gradients` | **1** (`pytorch-debugger`, ein Debugger) |

Dazu die schaerfste Stelle: das Lab `comm-crossover` rechnet seine Schranken mit

```js
const flops=(pass==="fwd"?6:12)*c.B*c.D*c.DFF/N;
```

Die **12 ist fest eingetippt** — also genau die Zahl, die `data_parallel_calcs` (a) herleiten
laesst. Ein Lernender, der den Pfad der Plattform geht, kommt bei `tp_calcs` (a) an, ohne die
sieben Gleichungen je gesehen zu haben, und soll sharden, was er nie geschrieben hat.

## Was gebaut wurde: geborgen statt neu

Der Merge von `454630e` in den Kettenkopf, 11 Konflikte, alle an den aus
[[cs336-parallel-codex-edits]] bekannten Stellen:

- **README, `sw.js`, `?v=`** — reine Versionskollisionen, HEAD gewinnt, danach Bump auf **v90**.
- **`i18n-en.js` und `scripts/check-i18n.mjs`** — Anhaenge an dasselbe Dateiende, also
  Vereinigung. Anders als am 2026-09-04 endete die HEAD-Seite hier **mit** ihrer schliessenden
  Klammer und die Gegenseite ist ein Block auf oberster Ebene: es fehlte keine.
- **`index.html`, sechs Huenke** — HEAD war in **allen sechs** die Obermenge. Die Gegenseite
  steuerte nur `ffn-backward` in zwei Listen bei (`a3:synthetic-isoflops`, `OBJECTIVE_LAB_IDS`).

### Drei Integrationsluecken, die erst die juengeren Guards sahen

Das Lab ist 37 Commits aelter als der Kopf und verletzte drei Zusicherungen, die es zu seiner
Zeit nicht gab — jede wurde von einem Guard gefangen, nicht von mir:

1. `fbNumber` formatierte mit `toFixed` statt `fixedNum`; der deutsche Render haette Dezimal-
   **punkte** gedruckt (Guard `decimal separator`, aus dem Sweep in [[cs336-german-decimal-sweep]]).
2. `LAB_CONCEPTS` hatte keinen Eintrag — das Lab waere von **keiner** Konzeptseite aus
   angeboten worden (`ffn-backward` haengt jetzt an `gradients` und `resource-accounting`).
3. Ein `aria-label` blieb fuer den englischen Leser deutsch (Guard `attribute i18n`, seit v92).

Dazu **eine, die kein Guard sah**: `fbExp` druckte die Abweichung mit `toExponential`, dessen
Punkt der deutsche Sweep nie erreicht hat. Jetzt locale-bewusst — siehe offener Hebel 1.

### Was das Lab rechnet

**Modus A** laeuft die sieben Gleichungen an einem 2×3×4-Fall und prueft **jeden der vier
Gradienten gegen eine zentrale Differenz auf dem Forward Pass allein** — die numerische Probe
weiss nichts vom Backward Pass und kann ihn deshalb widerlegen (Uebereinstimmung 2,71e−11).

Die Falle sitzt genau dort, wo [[cs336-flash-backward-gate]] sie schon einmal gefunden hat: der
Regelsatz `noBranch` — der zweite Pfad in Gleichung (27) vergessen — laesst

| Gradient | Abweichung | Probe |
| --- | --- | --- |
| dx | 3,412e−1 | **faellt durch** |
| dW₁ | 2,710e−11 | besteht |
| dW₂ | 5,746e−12 | besteht |
| dW₃ | 3,970e−12 | besteht |

**Wer nur `W.grad` testet, sieht gruen** und liefert einen kaputten Backward Pass ab.

**Modus B** listet die Matmuls einzeln — 2 vorwaerts, 4 rueckwaerts — und liefert auf allen
fuenf Rechenfaellen **2,0000 / 4,0000 / 6,0000** je Parameter je Token. C ≈ 6ND ist damit
**gerechnet statt zitiert**. Dazu der Aktivierungssatz (x, h₁) gegen `checkpoint` bei
+33,33 % Compute (das ist `gradient_checkpointing`) und Lecture 2s eigene 70B-Frage:
47,98 / 95,95 / **143,93 Tage**. Ehrlich bleibt das Lab auch an der Kante: bei der ersten
Schicht wird dx nirgends gebraucht, „die beruehmte 6 ist an dieser Stelle eine Konvention und
keine Zaehlung".

| | vorher (v109) | nachher (v110) |
| --- | --- | --- |
| Labs | 63 | **64** |
| Guard-Bloecke | 61 | **62** |
| `lab render sweep` | 60 von 63 | **61 von 64** |
| Labs am Konzept `gradients` | 1 | **2** |

## Prüfung

- **Guard-Suite 62 Bloecke gruen**, Exit 0. Cache-Bump auf **v90** (4 Stellen), README auf 64 Labs.
  Die v109-Zusicherung „alle Labs von einer Formelkarte erreichbar" haelt bei **64 von 64**.
- **Mutationstest gegen die Schlankfassung** ([[cs336-guard-suite-slim-harness]]: Setup bis
  `englishFormulas` plus nur der geborgene Block, **0,29 s je Lauf**): **10 Mutationen, 10
  gefangen, 0 entkommen, 0 inert**, Kontrolle vor und nach dem Lauf gruen. Mutiert wurden die
  Gleichungen selbst (fehlendes Transponat in (24), f statt f′ in (26), fehlender x₂-Faktor,
  fehlender zweiter Pfad in (27), f(x₁)→x₁ in (25), dW₂ aus dx₁ in (29), SiLU→Sigmoid), die
  FLOP-Zaehlung (2mkn→mkn, dx-Matmul aus dem Ledger) und die Bytebreite. Die ersten drei Anlaeufe
  waren **inert, weil meine Anker falsch waren** — nach [[cs336-guard-suite-slim-harness]] wurde
  jede Mutation gegen den unveraenderten Text gezaehlt und erst bei Trefferzahl 1 gefahren.
- **Kein Browsertest** — in geplanten Laeufen gesperrt ([[cs336-unattended-no-preview]]). Ersatz:
  alle **26 Zustaende** (4 Regelsaetze × 4 Gradienten, 5 Rechenfaelle × 2 Regeln) in **beiden
  Sprachen** headless gerendert (52 Renders), geprueft auf `undefined`/`NaN`, uninterpolierte
  Platzhalter, Tag-Balance und deutsche Rueckstaende. Unabhaengig davon deckt der bestehende
  `lab render sweep` das Lab ueber `labMarkup` + `initLab` mit ab (+26 Renders).
- **Der Scanner wurde als sehend belegt — und die erste Fassung fiel dabei durch.** Probe 1
  (eine Uebersetzung entfernen) blieb stumm: die Wortliste kannte „Zuerst Lecture 2s eigenes
  Beispiel" nicht. Genau der blinde Fleck aus [[cs336-mutation-test-blind-spots]] — ein
  musterbasierter Guard schweigt ueber jede Schreibweise, die er nicht kennt. Die
  Rueckstandspruefung liest seitdem **die Uebersetzungsmap selbst**; danach fing sie Probe 1
  (16 Zustaende) und Probe 2 (`fbNumber` → `undefined`, 52 Zustaende), Kontrolle gruen.

## Was offen bleibt

1. **`toExponential` ist der halb gelaufene Zwilling des Dezimal-Sweeps.** Der Sweep hat
   `toFixed` → `fixedNum` vollstaendig erledigt und wird von einem Guard gehalten; bei
   `toExponential` sind **nur 2 von 12** Fundstellen locale-bewusst (`index.html:10453`, `:10645`,
   und seit diesem Lauf `fbExp`). Die uebrigen — `rcExp`, `dhExp`, `rbSci`, `tcSci`, `rpSci`,
   `ccSci`, `cmSci` und zwei inline — drucken dem deutschen Leser „1.342e+8". Kein Guard sieht
   das, weil der bestehende nur nach `.toFixed(` greppt, **ohne zu zaehlen, wie viele Fundstellen
   er erwartet**. Groesster verbliebener Hebel, und ein zaehlender Guard gehoert dazu.
2. **Der Rueckweg im Akkordeon** (aus v108/v109 unveraendert): `formulaAccordion` bietet weiter
   nur „Vollstaendig oeffnen"; der Uebungsknopf steht nur auf der Detailseite.
3. **`embedding-params` haengt weiter an einem Fallback** und hat keine Lecture, die `V·D`
   herleitet (Lecture 3s Parameterbilanz oder A1 §7.2.1 waeren der Ort).
4. **`l13` hat keine eigenen Karten fuer Qualitaetsregeln**, obwohl Gopher-Schwellen zaehlbar
   sind — derselbe Inhaltshebel wie v109.
5. **Drei Labs ohne rechnende Flaeche**: `policy-loss-tracer` 1 Punkt, `scaling-transfer` 0,
   `moe-routing` 0. Unveraendert.
6. Der Browsertest steht seit v71 aus; beim naechsten beaufsichtigten Lauf fuer `ffn-backward`,
   die Tokenisierungs-Kategorie und die zuletzt gebauten Flaechen nachholen, 360 px, DE und EN.
7. `origin/main` steht auf `2ed21e7`; **v100 bis v110 sind ungepusht.**
