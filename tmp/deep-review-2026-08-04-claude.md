# Deep Review 2026-08-04 — Die zwei Zeilen zwischen Modell und Text (v60)

## Auftrag

Geplanter Lauf des Standing Brief: „nimm mal das aktuelle Repo und schaue was kannst du nochmal deutlich
verbessern … wird sich wirklich an den Vorlesungen und den Assignments entlang gehangelt?" Unbeaufsichtigt.
Gestapelt auf `8fb9736` (v59), wie in der Memory festgehalten; neuer Branch `claude/deep-review-v60`.
Keine parallele Codex-Session aktiv (letzte Änderung im Haupt-Worktree: 2026-07-29 00:59).

## Audit

Diesmal wurde **jedes einzelne der 124 Handout-Probleme gegen die Labs gezählt, die es erreichen können** –
nicht die Missionen wie beim letzten Lauf, sondern die Probleme selbst. Zwei Befunde, beide unabhängig
voneinander belegt.

### Befund 1 — 80 Punkte ohne Konzeptzuordnung

Seit `f354ea3` (v48) nennt jedes Assignment-Problem die Konzepte, an denen es hängt. Fünf taten es nicht,
darunter das **größte Problem des ganzen Kurses**:

| Problem | Punkte | Zustand vorher |
|---|---|---|
| `a3:scaling_laws` | **50** | keine Konzepte – zeigte je nach Themenblock unterschiedliche Fallbacks |
| `a4:quality_classifier` | 15 | keine Konzepte |
| `a3:chinchilla_isoflops` | 5 | keine Konzepte |
| `a5:prompting_baselines` | 5 | keine Konzepte |
| `a5:baseline_calcs` | 5 | keine Konzepte |

Der Effekt war nicht nur eine fehlende Zeile: `problemDecidingConcepts` fällt ohne Eintrag auf die
Konzepte der *Mission* zurück, und `a3:scaling_laws` steht in drei Missionen. Dasselbe 50-Punkte-Problem
zeigte also in „Budgetledger", „Fit & Residuen" und „Zielkonfiguration" **drei verschiedene
Konzeptlisten**. Jetzt nennt es überall dieselben drei, und alle 124 Probleme haben eine Zuordnung.

### Befund 2 — A1 `decoding` hatte kein Objekt, das rechnet

Die A1-Mission `generation-experiments` trägt 20 Punkte und zitierte genau zwei Labs: `attention` und die
`evaluation` Design Clinic. Keines davon berührt Decoding. Gegenprobe im Repo, vor v60 jeweils **0 Treffer**
in `index.html` und `i18n-en.js`: `top-p` (klein), „Nucleus" (groß), „greedy", „Softmax-Temperatur".
Das Konzept `sampling` beschreibt Temperatur und Top-p in Prosa vollständig korrekt – nachrechnen ließ sich
davon nichts.

Das ist teuer, weil diese Stelle doppelt trägt:

- **A1 Problem (decoding), 3 Punkte + `generate`, 1 Punkt.** Das Handout verlangt wörtlich Gleichung (23)
  (Temperaturskalierung) und Gleichung (24) (Nucleus Sampling mit „smallest set … such that Σ ≥ p").
- **Der gesamte A5-Rollout-Pfad.** Das A5-Handout schreibt `sampling_temperature = 1.0`, `top_p = 1.0` und
  `group_size = 8` vor. Das v59-Lab `answer-parsing` zeigt sechs Rollouts „bei Temperatur 1,0" – ohne dass
  irgendwo stand, was diese 1,0 tut.
- Und es ist genau die Zone, in der ein Lernpfad ohne Vorlesungen am stärksten exponiert ist: **keine der
  17 Lectures behandelt Temperatur oder Top-p.** Gegen die PDFs geprüft – L02, L03 und L10 haben null
  Treffer für „temperature"/„top-p"; die elf `sampling`-Treffer in L10 gehören alle zu *speculative*
  sampling. Die Plattform sagt das an den betroffenen Stellen schon ehrlich („anderes behandelt keine
  Lecture und steht nur als Konzeptseite bereit"). Nur gab es dort bisher nichts zum Rechnen.

## Was gebaut wurde — Lab #35 `decode-sampling`

„Decoding: Temperatur, Top-p und der stille Fehler". Modul `training` (dort, wo `sampling` sitzt),
registriert in der A1-Mission `generation-experiments` und der A5-Mission `prompting`. Wie `optimizer` und
`loss-and-clip` steht es bewusst **auf keiner Lecture-Seite** – es gehört zu den fünf Labs, deren Stoff der
Kurs im Handout und nicht in der Vorlesung verlangt.

Aufbau wie bei `norm-and-ffn` und `rope-rotation`: **vier Kontexte × fünf Temperaturen × vier Schwellen ×
fünf Implementierungen**, davon eine korrekte und vier, die nichts werfen. Die acht Logits je Kontext sind
konstruiert und im Lab als solche ausgewiesen; Softmax, Nucleus, Renormalisierung, Entropie und Abstand
laufen wirklich.

### Die vier Kontexte, eine Schwelle

Korrekte Implementierung, p = 0,8, τ = 1,0 – nur der Kontext wechselt:

| Kontext | \|V(p)\| | behaltene Masse | Entropie |
|---|---|---|---|
| „The capital of France is" | **1** von 8 | 0,957 | 0,00 bit |
| „The dog ran into the" | **3** | 0,859 | 1,32 bit |
| „In the morning he" | **5** | 0,811 | 2,21 bit |
| „She said that" | **7** | 0,905 | 2,80 bit |

Dieselbe Zeile Code, vier Mengengrößen. Das ist der ganze Unterschied zwischen Top-p und Top-k, und es
steht als nachrechenbare Spalte da statt als Merksatz.

### Die vier stillen Fehler

1. **Temperatur nach dem Softmax** (`probs / τ`, dann renormalisieren). Der Faktor kürzt sich vollständig
   weg: für **jedes** τ kommen exakt die Zahlen von τ = 1,0 heraus, auf zwölf Nachkommastellen geprüft.
   Der Regler existiert nicht mehr, nichts stürzt ab, und eine Ablation über vier Temperaturen misst
   viermal denselben Lauf.
2. **Off-by-one in V(p)** (abbrechen, *bevor* die Schwelle erreicht ist). Im sicheren Kontext bleibt die
   Menge bei τ ≤ 1,0 und p ≤ 0,9 **leer** – `torch.multinomial` bekommt einen Nullvektor. Der Fehler trifft
   genau dann, wenn das Modell sich sicher ist, also mit fortschreitendem Training immer häufiger. Und bei
   p = 1,0, wo Top-p laut A5 gar nichts tun soll, verliert er in jedem Kontext still genau ein Token.
3. **Renormalisierung vergessen.** Abstand zur korrekten Verteilung: **0,0000** in allen 80 Zuständen –
   `torch.multinomial` normalisiert intern, das Sampling ist unverändert richtig. Falsch ist nur die Zahl:
   die Ausgabe summiert sich zur behaltenen Masse, und jede Log-Wahrscheinlichkeit ist um −ln(Masse)
   verschoben. Im Kontext „In the morning he" bei τ = 1,0 / p = 0,9 sind das 0,0523 nat pro Token – über
   die 512 Tokens einer A5-Antwort 26,8 nat in `get_response_log_probs`.
4. **Reihenfolge vertauscht** (Top-p auf der ungeskalierten Verteilung, dann Temperatur). Bei τ = 1,0 in
   allen Kontexten und Schwellen auf die letzte Stelle identisch mit der korrekten Version – deshalb so
   schwer zu finden. Für jedes andere τ hängt die Mengengröße nicht mehr von der Temperatur ab.

### Die Kopplung beider Regler

Kontext „The dog ran into the", p fest bei 0,9, nur τ wechselt: \|V(p)\| = **2 → 3 → 4 → 6** für
τ = 0,5 / 0,8 / 1,0 / 1,5. Temperatur und Top-p sind keine unabhängigen Knöpfe; die Temperatur verändert
die Verteilung, auf der V(p) gebildet wird.

### Die Brücke zu A5

Jeder Zustand zeigt „Wahrscheinlichkeit, dass alle 8 Rollouts hier dasselbe Token wählen" = p_max^G.
Im sicheren Kontext: **70,2 %** bei τ = 1,0 und **100,0 %** bei τ → 0. Daraus fällt die Antwort auf die
Transferfrage: identische Rollouts → identische Rewards → Gruppenmittel gleich dem gemeinsamen Reward →
jede Abweichung null → **jeder Advantage null, jeder Gradient null**. Die Gruppe hat acht Rollouts gekostet
und trägt nichts bei. Das ist der Grund, aus dem im A5-Handout `sampling_temperature = 1.0` steht und nicht
Greedy – und dieselbe Rechnung erklärt, warum ein immer richtig oder immer falsch beantworteter Prompt aus
der Gruppenstatistik verschwindet.

## Verifikation

- **Unabhängige Referenz.** Softmax, Nucleus und Renormalisierung wurden zweimal getrennt aus den
  Gleichungen (23) und (24) des A1-Handouts getippt: einmal im Browser-Prüfskript, einmal in
  `scripts/check-i18n.mjs`. Beide teilen keinen Code mit der App; die App-Funktionen werden per
  `sliceDeclaration` aus `index.html` gezogen und gegen die Nachrechnung gestellt.
- **Echtes DOM, alle 400 Zustände, beide Sprachen.** 4 Kontexte × 5 Temperaturen × 4 Schwellen ×
  5 Implementierungen durchgeschaltet und jede angezeigte Zahl zeichengenau verglichen – jede der acht
  Ledgerzeilen (q, kumulierte Masse, V(p)-Zugehörigkeit, Ausgabe), alle sieben Kennzahlen und die
  Vier-Kontexte-Tabelle. **17.088 verglichene Werte je Sprache, 0 Abweichungen in DE, 0 in EN.**
  Nach dem Versionssprung mit frischem Cache wiederholt: 15.488 Werte je Sprache, 0 Abweichungen.
- **Definitionseigenschaft statt Zahlenvergleich.** Für die korrekte Variante prüft der Guard in allen
  80 Zuständen nicht nur Werte, sondern die Eigenschaft aus Gleichung (24): die Menge erreicht p, ist
  minimal (ohne ihr letztes Token fällt sie darunter), ist nie leer, summiert sich auf eins, und bei
  p = 1,0 enthält sie das ganze Vokabular.
- **Transfer-Kurzcheck vollständig.** Alle 27 Kombinationen durchgespielt: genau eine besteht, die
  übrigen 26 liefern „Noch nicht." und persistieren nichts. Nach echtem Reload stellt `restorePassedLab`
  alle drei Selects und das Erfolgsmarkup wieder her (geprüft).
- **Layout.** Alle 400 Zustände bei 375 px und bei 360 px in beiden Sprachen: `scrollWidth === clientWidth`,
  kein Element über die Kante, alle Selects und Buttons ≥ 44 px, H1 343 px bei 375 px Viewport.
  Konsole leer.
- **Sprachrückstände.** EN-Modus über alle 400 Zustände plus statischen Labtext gescannt: 0 deutsche
  Rückstände. 91 neue `ui`-Paare, vollständiger EN-Lab-Eintrag inklusive `transferAnswer`.
- **24 neue Drift-Guards, alle 24 negativ getestet** – jede Mutation einzeln in `index.html` eingespielt,
  `check-i18n.mjs` musste sie fangen: verschobene Nucleus-Schwelle, weggefallenes Grenztoken, Temperatur
  als Faktor statt Divisor, verlorener Greedy-Zweig, entfernte Renormalisierung, heimlich doch
  normalisierende `noRenorm`-Variante, wirksam gewordene `tempAfterSoftmax`-Variante, auf der skalierten
  Verteilung gebildete `truncBeforeTemp`-Menge, geänderte Gruppengröße, umsortierte Kontexte, verschobener
  Logit, Entropie in nat statt bit, falscher Exponent, Vorzeichenverlust beim Log-Versatz, nicht mehr
  normalisierender Abstand, Modulwechsel, Verlust der Registrierung in A1 und A5, Renderer ohne Abstand /
  ohne Ausgabesumme / ohne Rollout-Kollaps, Vier-Kontexte-Tabelle mit der falschen Variante, Formelkarte
  ohne Top-p-Bedingung, auseinanderlaufende Bundle-Version.

## Ein Fund am Rand

Der erste Guard-Durchlauf ließ **sechs von 23 Mutationen durch**, und die Auswertung war lehrreich:

- Zwei davon waren gar keine Guard-Lücken, sondern **wirkungslose Mutationen**: `>=` zu `>` in der
  Nucleus-Schleife und ein Greedy-Pfad über τ = 1e−12 ändern mit diesen Zahlen kein einziges Bit. Beide
  wurden durch Mutationen ersetzt, die wirklich etwas verschieben – und der Greedy-Fall zusätzlich durch
  einen Quellcode-Guard abgesichert, weil „rechnet zufällig richtig" nicht dasselbe ist wie „ist als
  eigener Fall behandelt", was das Handout an dieser Stelle verlangt.
- Vier waren echte Lücken, und alle vier folgten demselben Muster: **der Guard prüfte, dass die App die
  Zahl berechnet, nicht dass sie sie anzeigt.** `decodeDrift(...)` stand weiterhin im Renderer, während die
  Anzeige durch einen Bindestrich ersetzt war. Behoben, indem die Guards jetzt die konkreten
  Anzeige-Ausdrücke verlangen (`decodeNumber(drift,4)` statt `decodeDrift(...)`). Und Entropie war
  überhaupt nicht gegen die Referenz gestellt – sie ist es jetzt.

Das ist dieselbe Lehre wie am 2026-08-02 und 2026-08-03, einmal mehr bestätigt: **verglichen werden muss,
was auf dem Bildschirm steht.**

## Getroffene Entscheidungen (unbeaufsichtigt)

- **Kein Lecture-Eintrag für das Lab.** Naheliegend wäre L10 (Inference) gewesen, aber L10 spricht über
  speculative Sampling, nicht über Temperatur und Top-p. Ein Lecture-Eintrag hätte behauptet, die Lecture
  behandele diesen Stoff. Das Lab steht deshalb im Modul und in den beiden Missionen – genau wie
  `optimizer`, `loss-and-clip`, `shapes`, `resources` und `scaling`, für die dasselbe gilt.
- **Konstruierte Logits, ausdrücklich deklariert.** Es gibt keine echten Modell-Logits im Repo. Die acht
  Werte je Kontext sind so gewählt, dass jede Verteilungsform einmal vorkommt, und im Lab, im Report und im
  `misconception`-Text als konstruiert benannt. Gerechnet wird echt.
- **Vier falsche Varianten statt drei.** Die vierte (`truncBeforeTemp`) ist bei τ = 1,0 von der korrekten
  ununterscheidbar. Genau das ist ihr Wert: sie zeigt, dass die A5-Standardeinstellung ein Fehler dieser
  Art gar nicht sichtbar machen kann.
- **`a3:scaling_laws` bekam drei Konzepte, nicht fünf.** Ein bestehender Guard begrenzt auf ein bis drei –
  die Regel ist sinnvoll (mehr wäre keine Entscheidungshilfe mehr) und wurde nicht aufgeweicht.
- **Bundle-Version begradigt.** `sw.js` hat `i18n-en.js?v=55` vorgehalten, während `index.html`
  `?v=58` anforderte – der Service Worker cachte also eine Datei, die niemand abruft. Beide stehen jetzt
  auf 60, und ein Guard hält sie zusammen.
- **Keine Zeit-, Termin- oder Streak-Mechanik.** Wie festgehalten.

## Nächster offener Hebel

Unverändert die **AlpacaEval-Win-Rate samt Judge-Bias** (8 A5-Punkte; „winrate", „Position Bias",
„length bias" weiterhin 0 Treffer im Repo) – vom Lauf am 2026-08-03 zurückgestellt und immer noch einen
eigenen Lauf wert. Daneben ist `evaluation` weiterhin das einzige Lab von A4 `quality-classifier` und
`tokenize-train`; die neue Konzeptzuordnung dieser Probleme macht die Lücke jetzt sichtbar, schließt sie
aber nicht.

## Stand

- Commit `180d018` „feat: v60 …", gestapelt auf `8fb9736` (v59), Branch `claude/deep-review-v60`.
- Geändert: `index.html`, `i18n-en.js`, `scripts/check-i18n.mjs`, `sw.js` (Cache `cs336-shell-v60`,
  Bundle `?v=60`), `README.md` (35 Labs, Version 60).
- **Achtung beim Testen:** nach dem Versionssprung `getRegistrations().unregister()` + `caches.delete()`,
  sonst zeigt der Browser den alten Stand.
