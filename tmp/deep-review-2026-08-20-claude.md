# Deep Review 2026-08-20 — Der Decay-Horizont T_c hört auf, eine versteckte Konstante zu sein (v78)

Basis `c923159` (v77, Branch `claude/deep-review-v77`). Der zugewiesene Worktree
`festive-kalam-e08d8c` stand wie üblich auf `1461c41` (v50, 27 Commits alt) — die Kette lag
auf `deep-review-v77` im Worktree `quirky-lumiere-d7549c`. Per `git merge --ff-only`
aufgeholt, neuer Branch `claude/deep-review-v78`. **Nicht gepusht.**

Keine Codex-Aktivität seit ~24 Stunden (letzte Dateiänderung 2026-08-19 07:40), also gebaut
statt nur berichtet.

## Der erste Hebel aus v77 war schon zu

v77 nannte als nächsten Hebel die Zeilenprüfung `split("<tr>")`, die `class="is-active"`-Zeilen
übersieht, und vermutete den blinden Fleck „in weiteren Labs, die dieses Muster kopiert haben".
Nachgezählt: **`split("<tr>")` kommt im ganzen Repo null mal vor.** Die einzige Zeilenprüfung
im Checker ist die von v77 selbst reparierte, und sie splittet bereits auf `"<tr"`. Die anderen
Labs parsen ihre Tabellen gar nicht zeilenweise. Der Hebel war eine Vermutung über fremden
Code, kein Befund — dieselbe Lehre wie in `cs336-metric-is-a-suspicion`, diesmal über eine
vermutete Kopie statt über eine Kennzahl. Ich habe die neue Zeilenprüfung dieses Labs von
Anfang an auf `"<tr"` gebaut.

Damit blieb Hebel 3: das `optimizer`-Lab mit dem zweizweigigen Schedule, seit v72 offen.

## Was das `optimizer`-Lab wirklich behauptete

A1 4.4 zählt **fünf** Parameter auf — `t`, `α_max`, `α_min`, `T_w`, `T_c` — und definiert
**drei** Zweige:

```
t < T_w          α_t = (t/T_w)·α_max
T_w ≤ t ≤ T_c    α_t = α_min + ½(1+cos(π(t−T_w)/(T_c−T_w)))(α_max−α_min)
t > T_c          α_t = α_min
```

Die Funktion, die das Lab zeichnete, hatte drei Parameter und zwei Zweige:

```js
function schedule(step,warm,max,min=.1){
  if(step<warm)return max*step/warm;
  const p=(step-warm)/(100-warm);
  return min*max+.5*(max-min*max)*(1+Math.cos(Math.PI*p))
}
```

Drei getrennte Defekte in einer Zeile:

1. **Der dritte Zweig existierte nicht.** Nach `T_c` läuft der Kosinus weiter, statt auf
   `α_min` zu bleiben.
2. **`T_c` war die Breite der Zeichenfläche.** Die `100` im Nenner ist der Maximalwert des
   Step-Reglers. Der Regler „Warmup-Steps" wurde deshalb auf `99` geklemmt — nicht wegen einer
   fachlichen Grenze, sondern damit der Nenner nicht null wird.
3. **`α_min` war unsichtbar.** Sie stand auf `0,1·α_max` und tauchte in keiner Anzeige auf,
   obwohl die Formelzeile darunter `η_min + ½(η_max−η_min)(1+cos(πp))` schrieb — eine Formel
   mit einem Symbol, dessen Wert der Lernende nirgends nachschlagen konnte.

Der Punkt ist nicht die Unvollständigkeit, sondern der **Widerspruch zur App selbst**. Der
objektive Kurzcheck von `resume-contract` fragt seit v72:

> „Du prüfst deinen Scheduler bei t = 0, bei T_w, in der Mitte und bei T_c. Welcher Fehler
> besteht alle vier Prüfungen?" → **„Der fehlende dritte Zweig; er zeigt sich erst für t über T_c"**

Die App prüfte den Lernenden also auf einen Zweig, den das Lab daneben nicht zeichnen konnte.

## Wie das Ziel gewählt wurde

Die Reparatur allein wäre eine Zeile gewesen. Die Frage war, was der Horizont **kostet** —
und die stellt A1 selbst, in §5, in einem Satz, der leicht überlesen wird:

> „When using 𝑁 training steps, we suggest adjusting the cosine learning rate decay schedule
> to terminate its decay (i.e., reach the minimum learning rate) **at precisely step 𝑁**."
> (A1.txt 2100–2102)

Trefferzählung vor dem Lab:

```
"terminate its decay"  0    Lauflänge      1    n²              0
"T_c = N"              0    Schrittbudget  0    from scratch    0
Skalierungskurve       0    Stützstelle    0    Neustart        0
```

`T_c` kam 52 mal vor — **nie variiert**. `Lauflänge` traf genau einmal, und zwar in einem
falschen Variantentext von `resume-contract`. Und L11 zieht aus derselben Eigenschaft einen
Satz, den die App zwar zitiert, aber nie rechnet:

> „**This turns the cost of fitting a scaling law from n to n².. Can we avoid this?**
> (partial) solution in miniCPM – WSD learning rate." (L11.txt 127–130)
> „For chinchilla-style analysis, can restart the run at the end of the stable phase. …
> **Decay ~ 10%.**" (L11.txt 136–137)

WSD ist in der App elfmal benannt, mit einem eigenen Select-Gate in `scaling-transfer`, das
korrekt sagt, dass ein Stable-Checkpoint kein fertiger Endpunkt ist. **Warum** es WSD gibt,
rechnet nichts. Dasselbe Muster wie bei `lsh`, den Ablationen, NoPE und der Filterkaskade:
benannt, nie gerechnet.

Kein bestehendes Lab überschneidet sich. `resume-contract` prüft **feste Schritte gegen fünf
Implementierungen** bei festem `T_c = 5.000` — es fragt, welcher Code A1s Tests besteht.
Es fragt nie, welcher Horizont der richtige ist. `scaling-transfer` und `scaling-fit`
rechnen Fit und μP, keine Erhebungskosten.

## Repariert: `schedule()` folgt jetzt A1 4.4

Fünf Parameter, drei Zweige, `T_c` als eigener Regler (20–100), `α_min` in der Formelzeile
ausgeschrieben. Der Warmup wird gegen `T_c − 1` geklemmt statt gegen `99`. Zieht man `T_c`
unter 100, erscheint der flache dritte Zweig, den `resume-contract` abfragt.

**Ein zweiter Fehler fiel dabei auf:** `α_min` ist ein Zehntel von `α_max`, und der
`η_max`-Regler beginnt bei `0,0001`. Mit vier Nachkommastellen hätte die Formelzeile am
unteren Reglerende `η_min = 0.0000` gedruckt — ausgerechnet die Zahl, an der die Formel hängt.
Sie steht jetzt exponentiell da (`1.00e-5`), und ein Guard hält fest, dass sie nicht mit
`toFixed(4)` gedruckt wird.

## Gebaut: Lab #52 `decay-horizon`

Modul `training`, 15 min, registriert in **l02** neben `resume-contract` (ein Guard hält
fest, dass beide Labs denselben Lauf beschreiben — sonst sind ihre Zahlen nicht vergleichbar)
sowie in `a1:optimization` an erster Stelle, in `a1:training-state` und in `a3:budget-design`.
41 Zustände, zwei Modi.

Der Lauf ist A1s eigener: `N = 5.000` steht in A1 §5 („32 × 5000 × 256 = 40,960,000 tokens"),
`T_w = 200`, `α_max = 1e-3`, `α_min = 1e-4` — identisch mit `resume-contract`.

### Modus A — was der Horizont am Ende übrig lässt

**Der Befund ist, dass A1s Tipp kein Stilhinweis ist, sondern ein Optimum unter einer
Nebenbedingung.**

Zuerst die Falle. Der Warmup-Zweig hängt nur an `T_w` — er kennt `T_c` gar nicht:

| t | 2.500 | 4.000 | 5.000 | 6.250 | 10.000 |
|---|---|---|---|---|---|
| 0 | 0.000000e+0 | 0.000000e+0 | 0.000000e+0 | 0.000000e+0 | 0.000000e+0 |
| 200 | 1.000000e-3 | 1.000000e-3 | 1.000000e-3 | 1.000000e-3 | 1.000000e-3 |
| 2.500 | 1.000000e-4 | 4.038852e-4 | 5.794314e-4 | 7.154388e-4 | 8.831251e-4 |
| 5.000 | 1.000000e-4 | 1.000000e-4 | 1.000000e-4 | 1.915144e-4 | 5.644232e-4 |

Ein falscher Horizont ist **an genau den Stellen unsichtbar, an denen man einen Scheduler
zuerst prüft**. Ein Guard prüft für jedes `t ≤ T_w`, dass alle fünf Werte gleich sind, und für
`t = T_w + 1`, dass alle fünf verschieden sind. Bei `t = 2.500` liegt zwischen kürzestem und
längstem Horizont der Faktor **8,831251**.

Dann die zwei Spalten, die gegeneinander ziehen:

| T_c | endet bei | Schritte im dritten Zweig | Decay durchlaufen | Σ α_t gegen T_c = N |
|---|---|---|---|---|
| 2.500 | **α_min** | 2.500 | 100 % | 0,589424 |
| 4.000 | **α_min** | 1.000 | 100 % | 0,835769 |
| **5.000 = N** | **α_min** | **0** | **100 %** | **1,000000** |
| 6.250 | 1,915144 × α_min | 0 | 79,338843 % | 1,191190 |
| 10.000 | 5,644232 × α_min | 0 | 48,979592 % | 1,512128 |

Zwei Aussagen, beide per Brute Force über jeden Horizont von `T_w+1` bis `3N` geprüft, nicht
behauptet:

1. **Der Lauf endet genau dann exakt auf `α_min`, wenn `T_c ≤ N`.**
2. **Σ α_t wächst streng monoton mit `T_c`** — das Budget allein würde also sagen „so lang
   wie möglich".

Zusammen bleibt genau ein Punkt übrig: **`T_c = N` ist der Horizont mit dem größten
Schrittweitenbudget unter allen, die am Ende auf dem Boden landen.** Ein Guard rechnet dieses
Argmax über das ganze Gitter nach und prüft, dass `N` herauskommt. Damit ist A1s Satz nicht
zitiert, sondern belegt.

Beide Fehlerrichtungen bekommen ihre Zahl: `T_c = 2N` kauft **51,2128 % mehr Budget** und
hinterlässt ein Modell, das bei **5,644232 × α_min** aufhört; `T_c = 0,8N` landet sauber und
verschenkt **16,4231 % des Budgets** an 1.000 Schritte mit der kleinsten Lernrate.

### Modus B — was dieselbe Eigenschaft über viele Läufe kostet

Die Brücke ist **genau die letzte Zeile aus Modus A**. Bei Schritt 5.000 eines Laufs, der für
10.000 geplant war, steht die Lernrate auf 5,644232 × α_min, und 48,979592 % des geplanten
Decays haben stattgefunden. Dieser Zwischenstand ist kein 5.000-Schritt-Lauf, sondern ein
halbfertiger 10.000-Schritt-Lauf. Wer ihn als Punkt einer Skalierungskurve einträgt, misst
den Horizont mit.

Eine Leiter aus `K` gleich weit gestuften Lauflängen `N_i = i · 2.000`, drei Wege:

| K | ein Lauf | Cosine (K Läufe) | WSD (d = 10 %) | Cosine/Lauf | WSD/Lauf | Cosine/WSD |
|---|---|---|---|---|---|---|
| 2 | 4.000 | 6.000 | 4.200 | 1,500000 | 1,050000 | 1,428571 |
| 5 | 10.000 | 30.000 | 12.000 | 3,000000 | 1,200000 | 2,500000 |
| 10 | 20.000 | 110.000 | 29.000 | **5,500000** | 1,450000 | 3,793103 |
| 20 | 40.000 | 420.000 | 78.000 | 10,500000 | 1,950000 | 5,384615 |
| 100 | 200.000 | 10.100.000 | 1.190.000 | 50,500000 | 5,950000 | 8,487395 |

**Die vierte Spalte ist exakt `(K+1)/2`** — L11s „n zu n²" als geschlossene Formel. Ein Guard
prüft die Identität für jedes `K` von 1 bis 400 und für alle drei Abschlusslängen.

**Und der Befund, den ich nicht erwartet hatte:** die vierte Spalte hängt **gar nicht an `d`**.
Stellt man die Abschlussphase auf 5 % oder 20 %, bewegt sie sich um keine Stelle. Die Länge
der Decay-Phase entscheidet nur darüber, wie viel WSD zurückholt — nicht darüber, wie teuer
Cosine ist. Ein Guard hält das fest, indem er über die drei Einstellungen prüft, dass die
Spalte eine einzige Zeichenkette bleibt.

**Der zweite unerwartete Befund korrigiert L11s eigenen Satz.** Der WSD-Weg besteht aus einem
gemeinsamen Rumpf `(1−d)·N_K`, der linear in `K` wächst, und `K` Abschlussphasen, die zusammen
`d` mal genau das kosten, was der ganze Cosine-Weg kostet. **WSD trägt denselben quadratischen
Term, nur durch `d` geteilt.** Daraus folgt eine Schranke:

```
Cosine/WSD  =  ((K+1)/2) / ((1−d) + d·(K+1)/2)   →   1/d   für K → ∞
```

d = 10 %:  K=10 → 3,793103 · K=100 → 8,487395 · K=1000 → 9,823356 · **Grenze exakt 10**
d = 5 %:   K=100 → 14,532374 · **Grenze exakt 20**
d = 20 %:  K=100 → 4,633028 · **Grenze exakt 5**

Ein Guard prüft für jedes `K` bis 400 und jedes `d`, dass der Vorteil **steigt und die Schranke
`1/d` nie erreicht**, und für sehr großes `K`, dass er sich ihr wirklich nähert statt an einer
kleineren Zahl hängenzubleiben. „WSD macht aus n² ein n" ist damit zu großzügig gelesen und
steht so auch im Lab: **WSD kauft einen Faktor, keine Ordnung** — bei den ein bis zwei Dutzend
Stützstellen, die eine Chinchilla-artige Erhebung wirklich benutzt, trotzdem der Unterschied
zwischen machbar und nicht machbar.

### Was das Lab bewusst nicht behauptet

Beide Modi sagen es in einem eigenen Absatz, und Guards halten beide Absätze fest.

Modus A: **Σ α_t ist keine Fortschrittsgröße.** Ein Schritt mit doppelter Lernrate senkt den
Loss nicht um das Doppelte, und ab einer Grenze gar nicht mehr — das rechnet `stability-edge`,
und der Absatz verweist dorthin. Die Summe taugt nur als monotones Maß dafür, wie großzügig
ein Horizont ist, damit die Nebenbedingung eine Richtung hat. Der Modus sagt auch nicht, dass
ein längerer Horizont schlechter trainiert, sondern dass er einen anderen Endzustand hinterlässt.

Modus B: Gezählt werden **Optimizer-Schritte, nicht Stunden** — die `K` Abschlussphasen können
parallel laufen. Der Rumpf braucht selbst einen Warmup, der nicht mitgezählt ist. Die Leiter
ist gesetzt. Und der wichtigste Vorbehalt ist keiner der Rechnung: dass ein Stable-Checkpoint
plus Decay ungefähr so gut ist wie ein durchgehender Cosine-Lauf, ist eine **empirische**
Beobachtung, die L11 vorsichtig formuliert („Generally seems to match performance of cosine
learning rates").

## Nebenbefund: Prosa und Tabelle druckten verschiedene Zahlen

Beim zweisprachigen Rendern fiel auf, dass die deutsche Prosa `1,191190` schreibt, während die
Tabelle daneben `1.191190` druckt — `toFixed` kennt keine Sprache. Für ein Lab, dessen ganze
Methode „lies genau diese Zahl in jener Spalte" ist, ist das kein Schönheitsfehler: der
Lernende sucht eine Zeichenkette, die dort nicht steht.

Der Zahlenformatierer dieses Labs benutzt deshalb `toLocaleString` mit fester
Nachkommastellenzahl und ohne Tausendertrennung. Deutsch: Prosa und Tabelle beide `1,191190`.
Englisch: beide `1.191190`. Zwei Guards prüfen beide Sprachen, ein dritter fängt den Rückbau
auf `toFixed`. Die übrigen 51 Labs sind unverändert — das ist weiterhin der repo-weite Hebel
aus v76/v77, und dieses Lab ist jetzt die Vorlage dafür.

## Verifikation

- **7.773 Guard-Werte**; zusätzlich **66 App-Werte gegen eine unabhängig getippte
  Python-Referenz** — **0 Abweichungen**.
- Die Referenz entstand **vor** dem App-Code, aus A1.txt 1718–1728 / 2100–2102 und L11.txt
  127–137, mit exakten Brüchen via `Fraction`. Alle Kennzahlen (8,831251 / 1,915144 /
  5,644232 / 16,4231 / 5,500000 / 3,793103 / die Grenze 1/d) stammen dort her und wurden in JS
  unabhängig reproduziert.
- **41 Zustände × 2 Sprachen headless gerendert**: **145.115 Ziffern je Sprache, identisch**,
  und darüber hinaus **identische Zahlenfolgen** Element für Element — 0 `undefined`/`NaN`,
  keine unaufgelösten Template-Literale, keine deutschen Reste im englischen Render.
- **Übersetzungen laufzeitgeprüft** statt gegrept: `localizedUi` instrumentiert plus die
  Textknoten und übersetzbaren Attribute des Bedienfelds aus dem ausgewerteten Markup gezogen
  — **103 neue Strings, 0 ohne englischen Eintrag**.
- `check-i18n` grün: **52 Labs, 3.430 UI-Strings** (vorher 51 / 3.327).
- `node --check` auf dem extrahierten Inline-Script, auf `i18n-en.js` und auf `check-i18n.mjs`.
- **0 doppelte DOM-IDs** repo-weit (541 IDs) und **0 Mehrfachdeklarationen** unter den
  25 neuen Bezeichnern.
- **Mutationstest 73/73 — 0 escaped, 0 inert**, vom verifiziert sauberen Baseline aus.
- Kein Browsertest — `preview_start` ist in unbeaufsichtigten Läufen gesperrt (siehe
  `cs336-unattended-no-preview`). Ersatz ist das headless Rendern aller Zustände in beiden Sprachen.

### Was die Mutationsläufe über die eigenen Guards verrieten

Der erste Lauf meldete **10 escaped**. Sieben waren echte Lücken, drei stellten sich als
**äquivalente Mutationen** heraus — und beide Gruppen waren lehrreich.

**Die echten Lücken:**

1. **Die Leiter und die Abschlusslängen waren ungebunden.** `DH_LADDERS` von `100` auf `50`
   und `d` von 5 % auf 6 % zu ändern blieb unentdeckt: die Struktursätze `(K+1)/2` und `< 1/d`
   gelten für jede Leiter und jedes `d`. Unentdeckt blieben damit aber die drei Zahlen, die der
   Beobachtungstext dem Lernenden zum Mitverfolgen nennt (4,489796 / 3,793103 / 2,894737) —
   ein Guard bindet jetzt Leiter, Abschlusslängen und diese drei Werte.
2. **Die Probenschritte waren ungebunden.** `t = T_w` auf `t = T_w+1` zu verschieben blieb
   unentdeckt, obwohl der Callout daneben behauptet, in dieser Spalte stünden fünfmal
   `1.000000e-3`. Der Guard hält jetzt fest, dass `t = 0`, `t = T_w` und `t = N` wirklich
   Spalten sind und nicht Schritte daneben.
3. **Die reparierte Funktion war geprüft, ihre Aufrufe nicht.** `schedule()` folgte A1 4.4,
   aber beide Aufrufstellen wieder auf `100` zurückzudrehen blieb grün — die Kurve wäre die
   alte gewesen, während die Funktion korrekt ist. Der Guard schneidet jetzt `updateOptimizer`
   aus der Quelle und prüft, dass es genau zwei `schedule(`-Aufrufe gibt und **beide** den
   gewählten Horizont und `α_min` weiterreichen. *Dieselbe Klasse wie v77s Befund Nr. 2: die
   Rechnung prüfen und das Gerenderte vergessen.*
4. Zwei Sätze der Prosa (die Schranke „erreicht diesen Wert nie" und der Satz darüber, dass der
   gedeckelte Faktor trotzdem etwas wert ist) und die Bindung `α_min = 0,1·α_max` an den Satz,
   der sie im Bedienfeld ankündigt.

**Die drei äquivalenten Mutationen** waren `t<w` → `t<=w`, `t>tc` → `t>=tc` und
`ideal` → `nK`. Alle drei ändern **kein einziges Byte** in allen 41 Zuständen — nachgemessen,
identischer SHA über den gesamten Render. Bei den ersten beiden ist das kein Zufall, sondern
**genau die Stetigkeitseigenschaft, die A1s Definition an beiden Zweiggrenzen garantiert** und
die dieses Lab in zwei eigenen Guards festhält (bei `T_w` liefern beide Zweige exakt `α_max`,
bei `T_c` exakt `α_min`). Eine Mutation, die nichts ändert, ist trotzdem kein bestandener Test;
alle drei wurden durch beobachtbare Varianten an derselben Stelle ersetzt (`t<w-1`, `t>tc+1`,
`ideal → cosine`), und die werden gefangen.

## Bewusst nicht

- **Das Lab in Lecture 11 registrieren.** Modus B ist L11s Argument, aber ein Lab erbt seine
  Quellen vom Modul, und `training` zitiert `a1` und `l02`. Statt das Modul zu wechseln (und
  damit Modus A von A1 abzuhängen) bleibt es in l02 neben `resume-contract`; die L11/A3-Seite
  trägt der Missionslink `a3:budget-design`.
- **`α_min` im `optimizer`-Lab zum Regler machen.** Der Defekt war der fehlende Zweig und der
  verdrahtete Horizont. `α_min` bleibt didaktisch bei `0,1·α_max`, wird aber jetzt genannt und
  ausgeschrieben — mehr Regler hätte aus einem 12-min-Lab ein zweites `decay-horizon` gemacht.
- **Die deutsche Zahlenformatierung repo-weit anfassen** — seit v76 offen. Dieses Lab löst es
  für sich und liefert die Vorlage.
- **Eine Verlustkurve behaupten.** Das Lab rechnet Lernraten, Schrittzahlen und Kosten. Was ein
  Horizont für den Loss bedeutet, misst man, und das sagen beide Ehrlichkeitsabsätze.

## Nächste Hebel

1. **Dezimaltrennzeichen im deutschen Render, repo-weit** (aus v76, jetzt mit Vorlage): Der
   Formatierer von `decay-horizon` zeigt die Bauform. Betroffen sind alle gleichnamigen
   `*Num`/`*Pct`-Helfer neben Prosa mit Dezimalkomma. Braucht einen Mutationstest je berührtem
   Lab, weil die Guards der Labs auf den erzeugten Zeichenketten sitzen.
2. **Die Aufruf-Lücke aus dem Mutationstest in fremden Labs suchen.** Der Befund Nr. 3 oben —
   Funktion geprüft, Aufrufstelle nicht — ist keine Eigenheit des `optimizer`-Labs. Ein
   gezielter Durchgang: für jedes Lab prüfen, ob seine Guards die Argumente der Renderaufrufe
   binden oder nur die Funktionen dahinter.
3. **Sieben Labs sind von keiner Lecture-Seite erreichbar** (`shapes`, `optimizer`,
   `loss-and-clip`, `resources`, `scaling`, `decode-sampling`, `microbatch-denominator`). Sie
   stehen in der Labs-Übersicht und in Missionen, aber wer den Lernpfad Lecture für Lecture
   geht, begegnet ihnen nie. Zu prüfen ist je Lab, ob das Absicht ist oder eine Lücke — bei
   `optimizer` und `decode-sampling` sieht es nach Lücke aus.
