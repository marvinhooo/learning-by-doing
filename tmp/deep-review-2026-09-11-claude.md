# Deep Review v107 — 2026-09-11 — zwei Skalen unter einem Argumentnamen

Fortsetzung von [v106](deep-review-2026-09-10-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v106** (`76da558`, Branch
`claude/gracious-spence-d2e4d4`) — Fast-Forward, kein Merge. Kein Codex aktiv (Kopf-Worktree
zuletzt am 10. September geschrieben, Arbeitsbaum sauber; der einzige jüngere Zeitstempel,
`happy-hypatia`, war ein sauberer Checkout ohne Änderungen). `origin/main` steht weiter auf
`2ed21e7`; **v100 bis v107 sind ungepusht**.

Auftrag unverändert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments lösen
können.

## Die Wahl, und die Vorprüfung

v106 nannte `rlvr-system-transfer` (2,5 Punkte) als nächsten Hebel. Die Zahl hält: das Lab ist
das einzige des Konzepts `rlvr-systems`, und das entscheidet genau ein Problem,
`a5:grpo_train_step_off_policy` (2,5). Nach der Regel aus
[[cs336-metric-is-a-suspicion]] war die Kennzahl aber nur der Verdacht. Die Frage war: welche
Zahl gibt das Handout vor, die die App nirgends rechnet?

A5 §6.4 gibt vier vor, und die Trefferzählung nach **den Zahlen selbst**, nicht nach den
Wörtern, ergab:

| Vorgabe aus §6.4 | Treffer vorher |
| --- | --- |
| `cliprange = 3e-4` für `offpolicy_gspo` | **0** (die eine Fundstelle „3e-4“ ist eine SFT-Lernrate) |
| die **Clip Fraction** loggen und zwischen beiden Methoden vergleichen | **0** gerechnet (nur ein Glossareintrag) |
| `train_batch_size = 8`, 32 Schritte je Inferenzbatch | nirgends gerechnet |
| `old_log_probs` einmal je Rollout-Batch einfrieren | nur Prosa |

Das Lab selbst war ein Zuordnungsquiz mit drei Auswahlfragen — Dr. GRPO, GSPO und die DPO-
Eingänge auf Etiketten gelegt, die `advantage-normalizers`, `offpolicy-clip` und `dpo-loss`
längst ausrechnen. Und daneben stand eine stille Schieflage: das Lab `offpolicy-clip` führt
GSPO mit ε = 0,1 bis 0,3 vor und schreibt zu ε nur „PPO verwendet 0,2“. Ein Lernender, der von
dort kommt, reicht denselben Wert an GSPO weiter.

Gegenprobe der Quelle: das GSPO-Paper (Zheng et al. 2025, arXiv 2507.18071, §5.2) nennt die
Clipbereiche 3e-4/4e-4 für GSPO gegen 0,2/0,27 für GRPO und berichtet, dass GSPO **zwei
Größenordnungen mehr Token clippt** als GRPO — trotz des schmaleren Bandes. Das Handout
übernimmt 3e-4 symmetrisch „taken from the original papers“.

## Was die Rechnung zeigt

### A · Der Plan, exakt aus dem Handout

| | on-policy (§4.3) | 32-fach (§6.4) |
| --- | --- | --- |
| train_batch_size | 256 | 8 |
| Optimizer-Schritte je Rollout-Batch | 1 | 32 |
| gradient_accumulation_steps | 32 | 1 |
| Promptgruppen je Schritt | 32 | **1** |
| Optimizer-Schritte über 200 Rollout-Schritte | 200 | 6.400 |
| Forward+Backward-Mikrobatches je Rollout-Batch | 32 | 32 |
| Schritte mit Ratio ≡ 1 | 100 % | 3,1250 % |
| Staleness | 0 | 0 bis 31, im Mittel 15,5 |

Drei Dinge daran sind nicht offensichtlich:

1. **Jeder der 32 Schritte ist genau eine Promptgruppe.** `repeated_prompts` wiederholt jeden
   Prompt `group_size`-mal hintereinander, und 8 = 8. Mit `baseline = "mean"` summieren sich
   die Advantages eines Schritts deshalb exakt zu null, und eine Gruppe mit acht gleichen
   Rewards macht den ganzen Schritt leer: bei p = 0,9 sind das p⁸ + (1−p)⁸ = 43,0467 %, also
   **13,7750 von 32 Schritten ohne Policy-Gradienten** — und `optimizer.step()` läuft trotzdem,
   weil AdamW mit β₁ = 0,9 aus seinem Momentum weiterzieht. On-policy ist ein Schritt erst leer,
   wenn alle 32 Gruppen einheitlich sind.
2. **Kein Mischen, kein train_batch_size unter group_size.** `grpo_train_step` normalisiert die
   Rewards selbst, Gruppe für Gruppe. Wer die 256 Antworten vor dem Zerschneiden mischt oder
   train_batch_size = 4 wählt, normalisiert über Gruppen, die keine sind.
3. **Kein On-Policy-Lauf kann die vier Methoden unterscheiden.** Bei einem Schritt je Batch ist
   jedes Ratio exakt eins; `noclip`, `grpo` und `gspo` rechnen dort denselben Gradienten wie
   `none`. Die zusätzlichen Forward-Mikrobatches für `old_log_probs` kosten dabei +33,3333 %
   Trainingsrechenzeit (Forward : Backward = 1 : 2) und bringen nichts.

### B · Die Clip Fraction, an einem ausgewiesenen Modell

Eine feste Gruppe (Rewards [1,1,1,0,0,0,0,0], Längen 96 bis 384, zusammen 1.826 Token), deren
Tokenlogratios mit jedem Update linear weiterwandern: δ = (k−1)·σ·z, z fest mit Seed 336. Das
Modell passt zu §6.4, weil dort jede Antwort in genau einen Schritt eingeht — was ihr Ratio
bewegt, sind die Updates auf den *anderen* Gruppen. Die Bänder im Logspace:

| | obere Grenze | untere Grenze |
| --- | --- | --- |
| Token, ε = 0,2 | δ > 0,182322 | δ < −0,223144 |
| GSPO, ε = 3·10⁻⁴ | Σδ/L > 2,9996·10⁻⁴ | Σδ/L < −3,0005·10⁻⁴ |

Was der Logger je Rollout-Batch zeigen würde (Mittel über die 32 Schritte):

| Drift σ je Update | grpo | gspo | Verhältnis |
| --- | --- | --- | --- |
| 0,002 | 0,0017 % | 27,64 % | ~16.000× |
| **0,003** (Voreinstellung) | **0,2071 %** | **28,60 %** | **138×** |
| 0,004 | 0,9721 % | 28,60 % | 29× |

Die Prozentwerte sind Modell. Was sich unabhängig davon hält und im Guard in beiden Richtungen
geprüft wird:

- An **Schritt 1** ist jede Clip Fraction null, bei jeder Drift und jedem Vertrag.
- **GSPO clippt ganze Antworten**: seine Tokenzahl ist immer eine Summe ganzer Längen.
- **Derselbe cliprange = 0,2 an GSPO** hält dessen Clip Fraction bei **jedem** Schritt auf null,
  während grpo unverändert clippt — GSPO rechnet dann ungeclippt, und kein Test merkt es.
- **Neu gerechnete old_log_probs** halten beide auf null, und damit alle vier Methoden auf
  `offpolicy_naive`.
- „Außerhalb des Bandes“ ist nicht „geclippt“: bei σ = 0,004 und k = 32 liegen 9,2004 % der
  Token außerhalb, aber das min clippt nur 4,9288 % — die andere Hälfte liegt auf der Seite, die
  das einseitige Clipping offen lässt. Wer die Clip Fraction als `|w − 1| > ε` loggt, zählt sie mit.

Daraus folgt die Diagnose, die jetzt als Transferfrage im Lab steht: zeigt der Logger für gspo
exakt null und für grpo einen positiven Wert, sind `old_log_probs` richtig eingefroren, und die
Ursache ist ein geteilter cliprange.

## Was gebaut wurde

- **`rlvr-system-transfer`** verliert das Quiz und bekommt eine rechnende Fläche in zwei Modi.
  Modus A: train_batch_size (256, 64, 32, 8, 4) × Methode × p, mit der Weigerung bei 4.
  Modus B: Schritt k (1, 2, 4, 8, 16, 32) × Drift × Vertrag (Handout, geteilter cliprange,
  neu gerechnete old_log_probs), acht Antwortzeilen, beide Clip Fractions, die Leiter über die
  32 Schritte und das geloggte Mittel. Drei neue Kurzcheckfragen, alle drei auf die Befunde.
  Lab-Karte, Transferfrage und -antwort neu, in beiden Sprachen.
- **Konzeptseite `rlvr-systems`** in beiden Sprachen um ein `details`-Element (der Plan aus
  §6.4, die zwei Skalen von cliprange, der Befund des GSPO-Papers), einen Pitfall (geteilter
  cliprange) und eine Check-Frage samt Antwort erweitert.
- **`offpolicy-clip`**: das Symbol ε nennt jetzt die GSPO-Vorgabe 3·10⁻⁴ und verweist auf das
  neue Lab — eine Zeile, weil die ε-Werte des Labs den Mechanismus zeigen, nicht die Vorgabe.

## Prüfung

- **Guard-Suite 58 → 59 Blöcke grün**, Cache-Bump auf **v87** (4 Stellen), `LR_NO_STAGE`
  4 → **3**, **`lab render sweep` 59 → 60 von 63 Labs**, `lab prose anchors` 400 → **407
  Zahlen**, `panel i18n` 58 → **59 Panels**. Laborzahl unverändert 63.
- Neuer Block **`clip fraction`** (12.694 Checks) auf einem **anderen Rechenweg als die App**: der Plan durch
  Ablaufen der `repeated_prompts`-Liste Schnitt für Schnitt (die App teilt); die leeren
  Schritte durch alle 256 Reward-Ausgänge einer Gruppe, jeweils durch die Advantage-Formel mit
  allen drei Normalisierern geschickt (die App schreibt p⁸ + (1−p)⁸); ein echter AdamW-Schritt
  mit Gradient null nach einem mit Gradient ungleich null; die Clip Fraction durch Auswerten
  **beider Terme des min** an jedem Token (die App vergleicht Logratios mit ln(1 ± ε)), GSPOs s
  als **Produkt** der Tokenratios (die App nimmt exp des Mittels), und das Rauschen aus Seed 336
  neu gezogen und elementweise verglichen.
- **Der Antwortschlüssel wird als Behauptung geprüft**: der akzeptierte Dreier wird aus dem
  Checker gelesen, jede der drei Antworten gegen die Rechnung gehalten, die Auflösung muss
  denselben Dreier vorbelegen, und die Optionslisten sind gezählt.
- **Jede angezeigte Zelle ist an ihren Ausdruck gebunden** — Plan in 100 Zuständen, Modus B in
  54, Ankertypen gezählt, damit eine überzählige Zeile auffällt; die Zeilenbeschriftungen
  (r, A, L) und Σδ/L eingeschlossen.
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]).
  Ersatz: der `lab render sweep` rendert alle Zustände beider Modi in beiden Sprachen headless
  und prüft Tag-Balance, `undefined` und deutsche Rückstände im englischen Render.
- **Mutationstest: 48 Mutationen, 48 gefangen, 0 entkommen, 0 inert** — gegen die volle Suite.
  Weil die Suite beim ersten Fehler stoppt und viele Mutationen schon von den generischen
  Blöcken (`lab prose anchors`, `content numerals`, `renderer i18n`) gefangen wurden, lief
  derselbe Satz ein zweites Mal **gegen den neuen Block allein**: 47 von 48 gefangen. Die eine,
  die er nicht sieht — ein gelöschter englischer Eintrag —, ist mit Absicht Sache von
  `renderer i18n`, das sie in der vollen Suite fängt; der Grund ist also gemessen, nicht
  vermutet. Eine Mutation (`render_mean`) traf im ersten Lauf ihren Anker nicht, wurde
  korrigiert und dann gefangen. Kontrolle vor und nach beiden Läufen grün.
  - Zwei Lücken fand die eigene Durchsicht **vor** dem Mutationslauf und schloss sie: die
    Zeilenbeschriftungen (r, A, L) und der Wert Σδ/L jeder Antwortzeile waren an nichts
    gebunden, ebenso drei Planzellen (Promptgruppen, Akkumulation, Mikrobatches).
  - Und die erste Fassung des Antwortschlüssel-Checks für Frage 2 prüfte eine Nebenbedingung
    („s bleibt im Intervall 0,99 bis 1,01“), die bei starker Drift schlicht falsch war, statt
    der Behauptung der Antwort. Jetzt wird geprüft, was die Antwort sagt: ln s ist die Summe
    der Logratios geteilt durch L und nicht die Summe selbst, und |ln s| liegt bei jeder
    Antwort weit unter der Streuung ihrer eigenen Tokenlogratios.

## Was offen bleibt

1. **Drei Labs ohne rechnende Fläche**, nach entschiedenen Punkten: `policy-loss-tracer` **1**,
   `scaling-transfer` **0**, `moe-routing` **0**. Keines trägt mehr ein ganzes Problem.
2. `renderFormulaDetail` bleibt eine Sackgasse: 79 Formelkarten ohne Konzept- oder Labknopf.
   Das ist jetzt mit Abstand der größte strukturelle Posten — und der nächste Hebel.
3. Der Browsertest steht seit v71 aus; er sollte beim nächsten beaufsichtigten Lauf für die
   zuletzt gebauten Labs (`kernel-contracts`, `distributed-runtime`, `transformer-ledger`,
   `rlvr-system-transfer`) nachgeholt werden, 360 px und beide Sprachen.
4. `origin/main` steht auf `2ed21e7`; **v100 bis v107 sind ungepusht**.
