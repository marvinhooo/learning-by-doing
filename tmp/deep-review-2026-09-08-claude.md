# Deep Review v104 — 2026-09-08 — der Test, den PyTorch selbst nicht bestehen lässt

Fortsetzung von [v103](deep-review-2026-09-07-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v103** (`90c76c2`, Branch
`claude/nostalgic-rubin-6ddab0`) — Fast-Forward, kein Merge. Kein Codex aktiv (Haupt-Checkout
zuletzt im Juli geschrieben). `origin/main` steht weiter auf `2ed21e7`; **v100 bis v104 sind
ungepusht**.

Auftrag unverändert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments lösen
können.

## Die Wahl

v103 hinterließ eine geordnete Liste: sechs Labs ohne rechnende Fläche, und als nächstes
`pytorch-debugger`. Beide Begründungen wurden nachgerechnet statt übernommen:

| Prüfung | Ergebnis |
| --- | --- |
| Punkte auf `pytorch-state` | a1:linear 1 · a1:embedding 1 · a1:checkpointing 1 · a1:training_together 4 · a5:aggregate_loss… 0,5 · a5:grpo_train_step… 5 · a5:sft_script 4 → **16,5** |
| Gegenprobe nach der v100-Regel | **negativ** — kein anderes Lab führt `pytorch-state` |
| Zustand des Labs | fünf Auswahlfragen, kein Regler, keine gerechnete Zeile |

## Der Befund

Die Konzeptseite sagte den Sachverhalt bereits — „Nur registrierte Parameter erscheinen in
parameters() und state_dict()" — und nannte **keine Zahl dazu**. Die Zahl ist der Punkt, denn
sie ist **null**: der Unterschied im Forward Pass.

Ein Untermodul, das in einer gewöhnlichen Python-Liste statt in einer `nn.ModuleList` liegt,
rechnet im Forward Pass mit. Es fehlt **allein in der Inventur**. Fünf Speichervarianten, die
dieselben Zahlen in denselben Matrizen tragen und sich ausschließlich darin unterscheiden, was
registriert ist, an acht Prüfungen:

| Prüfung | fängt von 4 Fehlern |
| --- | --- |
| Ausgabewerte gegen eine Referenz | **0** |
| Optimizer lässt sich bauen | **0** |
| jeder Parameter hat einen Gradienten | **0** |
| der Loss sinkt über die Schritte | **0** |
| **`load_state_dict(strict=True)`** | **0** |
| Parameterzahl gegen die Formel P | 3 |
| `.to(device)` bewegt wirklich alles | 4 |
| Speichern, neu starten, laden, **Werte** vergleichen | 4 |

Vier Dinge daran:

1. **`strict=True` ist blind, und zwar aus einem strukturellen Grund.** strict vergleicht zwei
   Schlüsselmengen. Wenn ein Untermodul nicht registriert ist, schreibt es beim Speichern
   keinen Schlüssel — und der frisch gebaute Empfänger erwartet auch keinen. Beide Seiten sind
   auf dieselbe Weise falsch. *Ein Schlüssel, den niemand schreibt, fehlt niemandem.* Echtes
   PyTorch meldet dazu wörtlich `<All keys matched successfully>`.
2. **„Es trainiert doch" ist kein Beleg.** Die kaputte Variante senkt den Loss um 67,3865 %
   gegen 72,9513 % der korrekten — sichtbar gesund, nur schlechter. Bei A1s eigener
   Konfiguration §7.2.1 stehen dabei **12.455.936 von 22.696.448 Parametern still, also
   54,8806 %**, weil Embedding und Ausgabeprojektion allein genug Kapazität tragen.
3. **Autograd füllt `.grad` trotzdem.** Die stillgelegten Tensoren stehen im Graphen und
   bekommen Gradienten; nur liest der Optimizer sie nie. Wer `p.grad is not None` prüft, prüft
   nichts.
4. **Die Prüfung, die alles fängt, ist die, die lokal nicht läuft.** `.to(device)` fängt alle
   vier — braucht aber ein zweites Gerät, das ein lokaler Testlauf nicht hat. Übrig bleibt der
   Werte-Rundlauf: speichern, neu starten, laden, **die Ausgaben vergleichen** statt der
   Schlüssel.

**Der schärfste der vier Fälle ist der harmloseste.** Eine Konstante als nacktes Tensorattribut
statt als `register_buffer` hat die **richtige** Parameterzahl (ein Buffer ist ohnehin kein
Parameter) und einen Trainingslauf, der **Bit für Bit** der des korrekten Modells ist. Von jeder
wertförmigen Beobachtung ist dieser Fehler ununterscheidbar; es trennen ihn allein die beiden
Zustandsprüfungen. Diese Aussage stand zuerst falsch im Guard — als „jede kaputte Variante
trainiert schlechter" — und der Guard hat sie widerlegt.

## Was gebaut wurde

`pytorch-debugger` behält seine fünf Failure Traces und die Debugging-Leiter und bekommt eine
rechnende Fläche in zwei Modi.

**Modus A — acht Prüfungen an einem wertgleichen Modell.** Fünf Speichervarianten, für jede die
Inventur (registrierte Tensoren, Parameterskalare, Tensoren in keiner Inventur), der größte
Betrag `|y − y_korrekt|`, der Trainingsverlauf und der Rundlauf-Fehler, dazu die acht Prüfungen
einzeln und eine Übersicht aller fünf nebeneinander.

**Modus B — wie viel Modell dabei stillsteht.** Dieselbe A1-Formel wie im Transformer-Ledger,
`P = 2VD + L(4D²+3DF+2D) + D`, aufgeteilt in registrierte und stillgelegte Gruppen, über drei
Konfigurationen (der Toy-Fall des Ledgers, A1 §7.2.1 TinyStories, A1 OpenWebText) und vier
Gruppen. Die Gruppe der RMSNorm-Gains ist dabei die Gegenprobe: sie ist **unter einem Prozent**
des Modells — genau der Fall, den eine Prüfung auf „ungefähr die richtige Parameterzahl"
vollständig übersieht.

Der Kurzcheck hat zwei neue Fragen, beide auf den Befund: welche Prüfungen trotzdem bestehen,
und welche einzige alle vier fängt und dabei ohne zweites Gerät läuft.

**Prosa in beiden Sprachen korrigiert.** Die Konzeptseite `pytorch-state` trägt jetzt ein
viertes `details`-Element und einen vierten Pitfall, die die Blindheit von `strict=True`
ausschreiben.

## Gegen echtes PyTorch gehalten

Das Lab rechnet in JavaScript. Damit seine Zahlen nicht bloß in sich stimmig sind, wurde
dasselbe Modell in **PyTorch 2.11** gebaut — dieselben fünf Varianten, dieselben Gewichte,
dieselbe Schrittzahl, mit einem nackten Tensorattribut als tatsächlich unregistriertem Gewicht:

| Variante | Skalare | Loss₀ | Loss₁₂₀ | Reduktion (JS) | Reduktion (PyTorch) |
| --- | --- | --- | --- | --- | --- |
| korrekt | 64 | 0,729308 | 0,197268 | 72,9513 % | 72,9513 % |
| Python-Liste | 32 | 0,729308 | 0,237852 | 67,3865 % | 67,3865 % |
| Python-Dict | 32 | 0,729308 | 0,237852 | 67,3865 % | 67,3865 % |
| nacktes Gewicht | 48 | 0,729308 | 0,225658 | 69,0587 % | 69,0587 % |
| nackter Buffer | 64 | 0,729308 | 0,197268 | 72,9513 % | 72,9513 % |

Übereinstimmung auf sechs Nachkommastellen bei jeder Variante, und der Forward Pass in PyTorch
bitgleich zur Referenz. Ebenfalls direkt in PyTorch belegt: `load_state_dict(strict=True)`
akzeptiert **alle** Varianten, und `.to()` lässt genau die unregistrierten Tensoren zurück.

## Prüfung

- **Guard-Suite 55 → 56 Blöcke grün**, Build grün, Cache-Bump auf **v84** (4 Stellen),
  `LR_NO_STAGE` 7 → **6**, **`lab render sweep` 56 → 57 von 63 Labs**, `lab prose anchors`
  56 → 57 Karten. Laborzahl unverändert 63 — es kam kein Lab dazu, eines wurde rechnend.
- Neuer Block **`state contract`** (286 Checks) auf einem **anderen Rechenweg als die App**:
  jeder Gradient des Trainingslaufs wird durch **zentrale finite Differenzen** neu gebildet, wo
  die App die geschlossene Form nimmt (Übereinstimmung besser als 1e−7 über 64 Gewichte, und
  der Vergleich wird nachweislich als scheiternd gezeigt); die A1-Parametersumme wird aus einer
  **Stückliste Matrix für Matrix** gebaut statt aus der geschlossenen Formel; die Verdikttabelle
  wird aus der Definition jeder einzelnen Prüfung neu abgeleitet statt aus `ptVerdicts` gelesen.
- **Mutationstest: 20 Mutationen, 18 gefangen, 2 inert mit gemessenem Grund.** Der erste Lauf
  ließ vier entkommen; **zwei davon waren echte Lücken**:
  - **Der Guard las seine eigene Erwartung aus dem mutierten Feld.** Er leitete ab, was eine
    Variante registrieren müsste, aus `variant.registered` — und verglich das gegen eine App,
    die dasselbe Feld liest. Eine Mutation verschob beide Seiten gleichzeitig und lief grün
    durch. Was jede Variante demonstrieren soll, steht jetzt namentlich im Guard; drei weitere
    Mutationen dieser Familie werden seither gefangen.
  - **Der Schlüsselmengenvergleich ließ sich auf einen Längenvergleich abschwächen**, ohne dass
    irgendeine Variante das gezeigt hätte — alle fünf tragen gleich lange Mengen. Der Vergleich
    ist jetzt eine eigene Funktion und wird mit einem gleich langen Paar **verschiedener**
    Schlüssel direkt geprüft.
  - Die **zwei inerten** Mutationen sind gemessen, nicht angenommen: `<` gegen `<=` in der
    Abstiegsprüfung kann kein Verdikt ändern, weil keine Variante dort endet, wo sie anfing;
    und Tensoren statt Skalare zu zählen kann keines ändern, weil Registrierung hier ganze
    Tensoren betrifft. Beide Eigenschaften werden über alle Varianten zugesichert, und die
    Zahl, die der Leser gegen P hält, bleibt durch den Anker auf den Skalaren festgenagelt.
  - Kontrolle vor und nach allen Läufen grün.
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]).

## Was offen bleibt

1. **Sechs Labs ohne rechnende Fläche**, neu gemessen nach entschiedenen Punkten auf Konzepten,
   die sonst kein Lab führt: `distributed-runtime` **10**, `transformer-ledger` **8**,
   `rlvr-system-transfer` **2,5**, `policy-loss-tracer` **1**. `scaling-transfer` und
   `moe-routing` entscheiden **null** — beide sind damit keine Lücke, sondern erledigt.
   Der nächste Hebel ist `distributed-runtime`.
2. Die drei Konzepte ohne Lab entscheiden weiterhin **null** Probleme.
3. `renderFormulaDetail` bleibt eine Sackgasse: 79 Formelkarten ohne Konzept- oder Labknopf.
4. `origin/main` steht auf `2ed21e7`; **v100 bis v104 sind ungepusht**.
