# Remediation-Entwurf: Lectures 12–17 und A4/A5

Dieser Text ist als Rohmaterial für neue Concept-Seiten, Formel-Akkordeons, Labs und Retrieval Checks gedacht. Er erklärt Mechanismen und verwendet bewusst kleine, isomorphe Beispiele. Er enthält weder Assignment-Code noch abgabefertige Antworten auf Handout-Aufgaben. Safety-Beispiele bleiben abstrakt und enthalten keine operativen Anleitungen für schädliches Verhalten.

Quellenkürzel: `L12` bis `L17` bezeichnen Lecture-PDFs, `A4` das Data-Assignment, `A5` das Reasoning-RL-Assignment und `A5S` das optionale SFT/DPO-Supplement.

## 1. Evaluation Landscape & Safety

### Warum und wo?

Evaluation beantwortet nie allgemein die Frage „Welches Modell ist besser?“. Sie prüft eine konkrete Behauptung über ein Modell oder ein vollständiges System. „Modell A löst Multiple-Choice-Fragen besser“ ist eine andere Behauptung als „System A unterstützt Ärztinnen zuverlässig“, „Agent A behebt Softwarefehler“ oder „Modell A verweigert riskante Anfragen, ohne harmlose Anfragen unnötig abzulehnen“.

Ein belastbarer Evaluationsvertrag hat vier Teile:

1. **Inputs:** Welche Nutzer, Aufgaben, Sprachen, Schwierigkeitsgrade und seltenen Randfälle sind vertreten?
2. **Model invocation:** Welches Prompt-Template, Zero-/Few-shot-Setup, Samplingbudget, Tool, Retrieval-Augmented Generation (RAG; Abruf zusätzlicher Dokumente) oder Agent-Scaffolding wird verwendet?
3. **Scoring:** Gibt es Ground Truth, Unit Tests, einen Parser, menschliche Präferenzen oder ein Judge Model? Welche Fehler sind besonders teuer?
4. **Interpretation:** Was behauptet der Score wirklich, wie groß ist seine Unsicherheit, welche Kosten wurden verursacht und wurde ein Modell, eine Methode oder ein ganzes System verglichen?

Das ist wichtig, weil derselbe Weight-Checkpoint mit anderem Prompt, mehr Samples, Tools oder einem besseren Parser einen anderen Score erreicht. Der Score gehört zum gesamten Protokoll. [L12, S. 5–6 und S. 21–22]

### Landscape: Was wird gemessen?

| Bereich | Typische Frage | Beispiel aus der Lecture | Zentrale Grenze |
|---|---|---|---|
| Likelihood | Wie gut sagt das Modell echte nächste Tokens voraus? | Perplexity | Nur bei gleichem Tokenizer, Korpus und Kontextprotokoll vergleichbar. |
| Knowledge | Kennt das Modell Fakten und Fachwissen? | MMLU, MMLU-Pro, GPQA, Humanity's Last Exam | Prompting, Kontamination und Benchmark-Sättigung können den Score verzerren. |
| Instruction Following | Befolgt es offene oder formale Anweisungen? | Chatbot Arena, IFEval, AlpacaEval, WildBench | Automatisch prüfbare Constraints testen nicht zwingend Semantik; Judges besitzen Bias. |
| Agents | Kann ein System über Zeit Tools benutzen und Zwischenergebnisse verarbeiten? | SWE-Bench, CyBench, MLEBench | Gemessen wird Modell plus Scaffolding, Toolzugriff, Budget und Umgebung. |
| Pure Reasoning | Kann es aus neuartigen Mustern Regeln ableiten? | ARC-AGI | Vollständig von Wissen isoliertes Reasoning ist schwer zu konstruieren. |
| Safety | Welche gefährlichen Fähigkeiten und welche Nutzungsneigung zeigt das System? | HarmBench, AIR-Bench, Jailbreak- und Pre-deployment-Tests | Safety ist kontextabhängig und darf nicht auf „verweigert oft“ reduziert werden. |

[L12, S. 7–19]

### Safety: Capability ist nicht Propensity

**Capability** bedeutet, dass ein System etwas grundsätzlich ausführen kann. **Propensity** bedeutet, wie wahrscheinlich es dieses Verhalten unter einem realistischen Aufruf tatsächlich zeigt. Bei einer kontrollierten Programmierschnittstelle kann die Propensity durch Prompting, Policy und Monitoring entscheidend sein. Bei frei veränderbaren Open Weights bleibt Capability besonders relevant, weil eine oberflächliche Verweigerung entfernt werden kann.

Safety und Capability sind außerdem nicht immer Gegensätze. Weniger Halluzinationen in einem medizinischen System können es zugleich nützlicher und sicherer machen. Eine Cybersecurity-Fähigkeit kann defensiv oder missbräuchlich genutzt werden. Darum braucht eine Safety-Evaluation mindestens:

- eine klare Risikotaxonomie,
- Tests für Capability und Propensity,
- harmlose Kontrollfälle gegen Over-refusal,
- realistische Nutzungssituationen,
- qualitative Prüfung einzelner Ausgaben,
- dokumentierte Zugriffs- und Schutzmaßnahmen.

Realismus erzeugt einen weiteren Trade-off: echte Nutzeranfragen sind relevanter als Prüfungsfragen, können aber private oder sensible Informationen enthalten. „Asking“ — der Nutzer kennt die Antwort nicht — ist näher an realer Nutzung als „Quizzing“, bei dem der Nutzer das System nur testet. Reale Daten dürfen deshalb nicht unkritisch in Evaluationen kopiert werden. [L12, S. 17–20]

### Formeln und Symbole

Für `k` korrekte von `n` ungefähr unabhängigen binären Aufgaben gilt

\[
\hat p=\frac{k}{n},\qquad SE(\hat p)\approx\sqrt{\frac{\hat p(1-\hat p)}{n}}.
\]

`SE` ist der Standard Error, also die grobe Stichprobenunsicherheit. Er erfasst nicht automatisch Prompt-, Sampling-, Judge- oder Subgruppenunsicherheit.

Wenn Fehler asymmetrische Kosten besitzen, ist Accuracy allein ungeeignet. Eine einfache entscheidungsbezogene Größe ist

\[
\widehat{Risk}=\frac1n\sum_{i=1}^{n} c(y_i,\hat y_i),
\]

wobei `c` jedem Fehlertyp seine Anwendungskosten zuordnet. Die Kosten müssen vor dem Modellvergleich festgelegt werden.

### Worked Micro-example

Zwei Systeme bearbeiten 100 Fälle. System A löst 92 Fälle korrekt, System B 90. Für A ist `SE≈sqrt(0,92·0,08/100)≈0,027`; für B `SE≈0,030`. Der Abstand von zwei Prozentpunkten ist kleiner als die grobe Unsicherheit eines einzelnen Scores. Eine seriöse Aussage ist deshalb nicht „A ist sicher besser“, sondern: Mehr Daten, gepaarte Auswertung und Fehleranalyse sind nötig.

Nun sind zwei der acht Fehler von A seltene, aber sehr teure Falschfreigaben, während B zehn weniger schwere Formatfehler macht. Bei hohen Kosten für Falschfreigaben kann B trotz niedrigerer Accuracy die bessere Einsatzentscheidung sein. Die Metrik muss zur Behauptung passen.

### Typischer Pitfall

Ein Benchmark-Name wird wie eine unveränderliche Einheit behandelt. Tatsächlich können Prompt, Chat-Template, Anzahl Samples, Stop-Regel, Parser, Judge, Toolbudget und Kosten das Ergebnis verändern. Zwei gleich beschriftete Scores sind ohne Protokoll keine faire Vergleichsbasis.

### Retrieval Questions

1. **Warum ist ein Agent-Score keine reine Eigenschaft der Modellgewichte?**

   **Lösung:** Weil Scaffolding, Tools, Umgebung, Iterationsbudget, Prompting und Fehlerbehandlung zum beobachteten System gehören. Änderungen an diesen Komponenten können den Score bei identischen Gewichten verändern.

2. **Warum kann häufiges Verweigern sowohl Safety verbessern als auch verschlechtern?**

   **Lösung:** Es kann riskante Ausgaben reduzieren, aber zugleich harmlose oder wichtige Anfragen unnötig blockieren. Safety braucht deshalb Risk-Tests und harmlose Kontrollfälle; eine reine Refusal Rate ist kein vollständiger Safety-Score.

### Objektiver Transfer Check

Gegeben sind drei Behauptungen: `(a)` bessere Next-Token-Modellierung, `(b)` zuverlässigeres Beheben realer Repository-Issues, `(c)` weniger riskante Ausgaben ohne mehr Over-refusal. Der Lernende muss für jede Behauptung Inputs, Invocation, Scorer, mindestens eine Failure Mode und eine Kosten-/Unsicherheitsgröße angeben.

**Bestehenskriterium:** Alle drei Verträge unterscheiden Modell von System; `(a)` fixiert Tokenizer und Kontext, `(b)` nennt ausführbare Tests und Agentbudget, `(c)` kombiniert Risk- und harmlose Kontrollfälle. Ein bloßer Benchmarkname reicht nicht.

**Quellen:** [L12, S. 1–22], [A5S, S. 3–8 und S. 12–14]

## 2. Data Lifecycle, Provenance & Governance

### Warum und wo?

Trainingsdaten sind keine neutrale Rohstoffmenge. Jede Auswahl und Transformation verändert, welche Sprachen, Domänen, Stile, Fakten und Risiken ein Modell häufig sieht. Eine gute Pipeline produziert deshalb nicht nur Text, sondern eine nachvollziehbare Begründung dafür, wie dieser Text entstanden ist.

### Lifecycle

Ein typischer Datenfluss lautet:

`Live service → raw snapshot → extracted text → filtered/deduplicated documents → source mixture → token stream → training run`

- Ein **Live service** ist etwa eine Website oder Plattform.
- Ein **raw snapshot** bewahrt den Zustand zu einem Zeitpunkt, beispielsweise HTTP-Antworten in Web ARChive (WARC)-Dateien.
- **Extracted text** entsteht durch Encoding-Erkennung und HTML-to-text-Konvertierung. Web Extracted Text (WET) ist bereits verlustbehaftet.
- **Processed data** wurde durch Language Identification, Quality-, Personally Identifiable Information (PII; personenbezogene identifizierende Information)-, Harm- und Deduplication-Schritte verändert.
- Ein **aggregated dataset** mischt mehrere Quellen und deren Policies.
- Die **Tokenisierung** definiert Dokumentgrenzen und die tatsächlich trainierten Einheiten.

Auch der Trainings-Lifecycle hat Stufen:

1. **Pretraining:** sehr große Mengen relativ breiter Daten.
2. **Midtraining:** kleinere, gezieltere Datenmischungen für Fähigkeiten wie Long Context, Code oder Reasoning.
3. **Post-training:** Instruction-Daten, Präferenzen oder Reinforcement Learning für sichtbares Verhalten.

Die Grenzen sind unscharf; wichtig ist die Richtung von „viel und breit“ zu „weniger und gezielter“. [L13, S. 1–4]

### Datenquellen und ihre Biases

| Quelle | Stärke | Typisches Risiko |
|---|---|---|
| Human annotation | Zielgerichtete, überprüfbare Demonstrationen | teuer, Richtlinien- und Demografie-Bias |
| Real users | realistische Prompts und Sprache | Privacy, Zustimmung, unkontrollierte Qualität |
| Curated Web data | große Vielfalt | Copyright, Boilerplate, Duplikate, toxische Inhalte |
| Distillation | starke Antworten eines Teacher Models | Teacher-Fehler und Stil werden übernommen |
| Self-distillation | günstige Skalierung mit demselben Modell | Fehler können sich selbst verstärken |

Kein Source-Label garantiert Qualität. Selbst Wikipedia-Dumps können kurzfristige Manipulation enthalten; eine positiv kuratierte Quelle kann außerdem informelle oder minorisierte Sprache systematisch unterrepräsentieren. [L13, S. 4–12]

### Provenance-Vertrag

Pro Dokument sollte die Auditspur mindestens enthalten:

- stabile Dokument-ID und sichere Raw-Referenz,
- Snapshot, Quelle, Abrufzeit und Lizenz-/Policy-Metadaten,
- Extractor- und Pipelineversion,
- Sprach-, Quality- und Risk-Scores,
- angewendete Transformationen und Reason Codes,
- Keep/Mask/Drop-Entscheidung,
- Dedup-Cluster und Repräsentantenregel,
- Tokenzahl sowie Zugehörigkeit zu Train/Development/Test.

Sensible Originalwerte gehören nicht noch einmal in offene Logs. Provenance bedeutet Nachvollziehbarkeit, nicht unnötige Replikation privater Daten.

### Governance

Copyright schützt typischerweise konkrete Ausdrucksformen, nicht abstrakte Ideen. Eine Lizenz ist eine vertragliche Erlaubnis unter bestimmten Bedingungen. Public Domain und Creative Commons sind nicht dasselbe; auch Terms of Service können zusätzliche Einschränkungen enthalten. In den USA betrachtet Fair Use vier Faktoren: Zweck/Transformativität, Art des Werks, verwendeter Anteil und Marktauswirkung. Das ist keine mechanische Checkliste und keine Rechtsberatung. Technische Teams müssen Herkunft, Policy und rechtliche Prüfung getrennt dokumentieren. [L13, S. 12–13]

Privacy, Copyright, Qualität und Repräsentation sind verschiedene Achsen. Ein Dokument kann hochwertig und dennoch ungeeignet zur Nutzung sein; ein lizenziertes Dokument kann PII enthalten; ein Safety-Filter kann marginalisierte Sprache überproportional entfernen.

### Formeln und Einheiten

Für Pipeline-Stufe `k` mit `N_{k-1}` Eingabedokumenten und `N_k` Ausgabedokumenten:

\[
r_k^{doc}=\frac{N_k}{N_{k-1}},\qquad
r_k^{tok}=\frac{T_k}{T_{k-1}}.
\]

Dokument- und Token-Retention unterscheiden sich, weil Dokumente verschieden lang sind. Zusätzlich sollten `r_k` nach Sprache, Domäne und Länge geschichtet werden.

Ein Quality Classifier mit Score `q(d)` und Threshold `τ` realisiert eine Policy

\[
keep(d)=\mathbf{1}[q(d)\ge\tau].
\]

Der Score ist Ähnlichkeit zur gelabelten Zieldefinition, kein objektiver Wahrheitswert.

### A4 Validation Nuance

Das A4-Handout erlaubt ausdrücklich, die Paloma-C4-100-Validation beim Entwerfen von Filtern oder Classifiers zu verwenden. Verboten ist, Validation-Text wörtlich in die Trainingsdaten zu kopieren. Daraus folgen drei getrennte Aussagen:

1. **Erlaubt im Assignment:** Validation-Beispiele oder -Statistiken beeinflussen die Filterentwicklung.
2. **Verboten:** identischer Validation-Text landet als Trainingsbeispiel im Korpus.
3. **Methodische Folge:** Der Validation-Loss ist nach wiederholter Auswahl eine Development-Metrik. Für eine unabhängige Generalisierungsaussage wäre ein unangetasteter Test nötig.

„Validation zur Auswahl benutzt“ und „Validation in Training kopiert“ dürfen nicht beide pauschal als dasselbe Leakage bezeichnet werden. [A4, S. 12–13]

### Worked Micro-example

Eine Pipeline startet mit 1.000 Dokumenten und 2.000.000 Tokens. Language Filtering behält 800 Dokumente und 1.700.000 Tokens. Quality Filtering behält 400 Dokumente und 1.200.000 Tokens. Die zweite Stufe hat Dokument-Retention `400/800=0,5`, aber Token-Retention `1,2M/1,7M≈0,706`. Sie entfernt also überwiegend kürzere Dokumente. Das ist weder automatisch gut noch schlecht; es ist eine messbare Verteilungsverschiebung, die nach Domäne und Qualität auditiert werden muss.

### Typischer Pitfall

Nur der finale Korpus wird gespeichert. Dann lässt sich später nicht unterscheiden, ob ein fehlendes Themengebiet durch Crawling, Encoding, HTML Extraction, Language ID, Quality Threshold oder Deduplication verloren ging.

### Retrieval Questions

1. **Warum muss die Extractor-Version Teil der Provenance sein?**

   **Lösung:** HTML-to-text ist eine verlustbehaftete Modellierungsentscheidung. Verschiedene Versionen können Haupttext und Boilerplate anders trennen und dadurch alle nachfolgenden Scores und Filterentscheidungen verändern.

2. **Warum sind Dokument-Retention und Token-Retention getrennt zu berichten?**

   **Lösung:** Dokumente sind unterschiedlich lang. Ein Filter kann wenige sehr lange oder viele sehr kurze Dokumente entfernen und damit Datenmenge und Domänenmix anders verändern, als eine einzelne Dokumentquote vermuten lässt.

### Objektiver Transfer Check

Der Lernende erhält Stage Counts nach Dokumenten und Tokens für zwei Sprachen sowie drei anonymisierte Kept/Rejected-Beispiele. Er muss `(a)` die erste disproportionale Stufe identifizieren, `(b)` zwei plausible Ursachen entlang des Lifecycles unterscheiden und `(c)` eine zusätzliche sichere Auditspur nennen.

**Bestehenskriterium:** Ursache und Beobachtung werden getrennt; es wird nicht aus einer Retention Rate direkt auf Qualität geschlossen; die vorgeschlagene Auditspur enthält keine unmaskierte PII.

**Quellen:** [L13, S. 1–15], [A4, S. 2–16]

## 3. GRPO Variants: Standard GRPO, Dr. GRPO, RFT & MaxRL

### Warum und wo?

Group Relative Policy Optimization (GRPO) ist nicht nur „Reward normalisieren und Backpropagation ausführen“. Drei Entscheidungen verändern, welche Prompts, Sequenzen und Tokens den größten Einfluss erhalten:

1. Welche Baseline wird abgezogen?
2. Wodurch wird der Advantage normalisiert?
3. Wie wird der Token-Loss über Sequenzen reduziert?

Diese Entscheidungen können den optimierten Surrogate verändern. Sie sind keine rein numerischen Details. [L16, S. 30–36], [A5, S. 10–13 und S. 27–31]

### Notation und Shapes

- `B`: Prompts pro Batch.
- `G`: Rollouts pro Prompt.
- `T`: maximale Tokenlänge.
- `R_{ij}`: Reward von Rollout `j` für Prompt `i`, Shape `[B,G]`.
- `m_{ijt}`: Response Mask, Shape `[B,G,T]`.
- `n_{ij}=Σ_t m_{ijt}`: Zahl gültiger Response Tokens.
- `ℓ_{ijt}=−log π_θ(y_{ijt}|x_i,y_{ij,<t})`: Token-NLL, Shape `[B,G,T]`.
- `μ_i=(1/G)Σ_j R_{ij}`: Group Mean, Shape `[B,1]`.
- `s_i`: Group Standard Deviation, Shape `[B,1]`.

Die Lecture-Herleitung verwendet oft die Population Standard Deviation. Das A5-Implementierungsprotokoll verlangt dagegen PyTorchs standardmäßige Sample Standard Deviation mit Bessel-Korrektur. Das ist ein expliziter Contract, kein Detail zum Erraten. [A5, S. 11]

### Gemeinsamer Rahmen

Ein Advantage-artiges Gewicht lässt sich schreiben als

\[
A_{ij}=\frac{R_{ij}-b_i}{c_i+\epsilon}.
\]

`b_i` ist eine promptlokale Baseline; `c_i` ist ein Stop-Gradient-Normalizer. Der maskierte Token-Loss lautet schematisch

\[
L=-\sum_{i,j,t} w_{ijt}\,A_{ij}\,m_{ijt}\log\pi_\theta(y_{ijt}|x_i,y_{ij,<t}).
\]

Die Varianten unterscheiden sich in `b_i`, `c_i` und `w_{ijt}`:

| Variante | Baseline `b_i` | Advantage-Normalizer `c_i` | Loss-Normalisierung | Effekt |
|---|---:|---:|---|---|
| Standard GRPO | Group Mean | Group Std | erst je Sequenz durch `n_ij` | ähnliche Gesamtmasse pro Antwort; Tokens langer Antworten werden schwächer |
| GRPO constant | Group Mean | Group Std | fixer Nenner `Z` | lange Antworten tragen mehr Tokens bei |
| Dr. GRPO | Group Mean | keiner | fixer Nenner `Z` | entfernt Std- und Längen-Reweighting |
| Rejection Fine-Tuning (RFT) | keine | keiner | fixer Nenner `Z` | bei binärem Reward tragen nur erfolgreiche Rollouts positiv bei |
| MaxRL | Group Mean | Group Mean | fixer Nenner `Z` | verstärkt Gruppen mit niedrigem mittleren Erfolg; nahe null ist Stabilisierung kritisch |

„Kein Normalizer“ bedeutet `c_i=1`. Bei RFT mit binärem Reward ist das Gewicht direkt `R_{ij}` statt `R_{ij}-μ_i`. RFT ähnelt SFT auf selbst erzeugten erfolgreichen Antworten, aber die Datenverteilung bewegt sich mit der Policy.

### Difficulty Reweighting logisch verstehen

Sei

\[
\eta(x)=\mathbb E_{y\sim\pi_\theta(\cdot|x)}[R(x,y)]
\]

die aktuelle Erfolgswahrscheinlichkeit eines Prompts. Für eine aktionsunabhängige Baseline verschwindet deren erwarteter Policy-Gradient-Beitrag. Ein zusätzlicher promptabhängiger Stop-Gradient-Normalizer `c(x)` bleibt jedoch als Faktor erhalten:

\[
g_c(x)=\frac{1}{c(x)}\,
\mathbb E[(R-b(x))\nabla_\theta\log\pi_\theta(y|x)].
\]

Die zentrale Ableitungsregel lautet daher: **Ein Normalizer induziert inverses Promptgewicht.** Um die Handout-Varianten selbst herzuleiten, setzt der Lernende die zugehörige Funktion von `η(x)` oder ihrer Streuung für `c(x)` ein. Diese Regel erklärt, warum Standard Deviation und Group Mean nicht neutrale Skalierungen sind, ohne die Assignment-Herleitung vorwegzunehmen.

### Worked Micro-example

Zwei Promptgruppen haben je vier binäre Rewards:

- Gruppe A: `[1,0,0,0]`, `μ_A=0,25`.
- Gruppe B: `[1,1,0,0]`, `μ_B=0,5`.

Ohne Std-Normalisierung sind die centered Rewards:

- A: `[0,75,−0,25,−0,25,−0,25]`.
- B: `[0,5,0,5,−0,5,−0,5]`.

Dr. GRPO lässt diese Skalen bestehen. Standard GRPO teilt zusätzlich durch die jeweilige Streuung und verändert damit das relative Gewicht beider Promptgruppen. MaxRL teilt durch den Group Mean und verstärkt in diesem Toy die Gruppe A stärker als B. RFT gibt nur den erfolgreichen Antworten positives Gewicht; falsche Antworten liefern keinen direkten negativen Update.

Sind die erfolgreichen Antworten 20 Tokens und die falschen 5 Tokens lang, neutralisiert Sequence Normalization einen großen Teil des Längeneffekts. Constant Normalization lässt dagegen mehr Tokenbeiträge der langen Antworten in den Batch-Loss eingehen.

### Typischer Pitfall

„Alle Varianten verwenden dieselben Rewards, also optimieren sie dasselbe.“ Falsch: Promptnormalizer und Tokennenner verändern die Gewichtung. Selbst bei identischen Rollouts können Gradientrichtung pro Sample, Gesamtgewicht pro Prompt und Längenbias unterschiedlich sein.

### Retrieval Questions

1. **Warum ist das Abziehen eines promptabhängigen Group Means grundsätzlich anders als das Teilen durch die Group Standard Deviation?**

   **Lösung:** Eine aktionsunabhängige Baseline hat im Erwartungswert einen Nullbeitrag und kann Varianz senken. Die Division durch eine promptabhängige Streuung bleibt als Gewichtungsfaktor erhalten und reweightet Prompts.

2. **Warum können Sequence und Constant Normalization bei denselben Advantages verschiedene Updates erzeugen?**

   **Lösung:** Sequence Normalization teilt jede Antwort durch ihre Zahl gültiger Tokens und gibt Antworten ähnlich viel Gesamtmasse. Constant Normalization teilt durch einen batchweiten festen Wert, sodass längere Antworten mehr Tokenbeiträge liefern.

### Objektiver Transfer Check

Gegeben werden zwei Gruppen mit Rewards, Maskenlängen und bereits berechneten Token-NLLs. Der Lernende berechnet für Standard GRPO, Dr. GRPO und RFT jeweils `(a)` die Samplegewichte, `(b)` das relative Gesamtgewicht jeder Antwort und `(c)` das Vorzeichen der gewünschten Logprob-Änderung.

**Bestehenskriterium:** Group Mean wird nur innerhalb eines Prompts gebildet; gleiche Rewards liefern nach Centering kein Signal; Prompt-/Paddingtokens erhalten Gewicht null; Sequence und Constant Normalization werden nicht verwechselt.

**Quellen:** [L16, S. 30–36], [L17, S. 2–11], [A5, S. 8–13 und S. 27–31]

## 4. Off-policy Surrogates, Prefix-/Suffix-Bias & GSPO

### Warum und wo?

On-policy bedeutet: Die Policy, die Rollouts erzeugt, ist dieselbe Policy, deren erwarteten Reward der Gradient beschreibt. Nach mehreren Updates stammen gespeicherte Antworten jedoch von einer älteren Behavior Policy `π_0`. Sie sind off-policy. Mehrere Updates pro Inference Batch sparen teure Rollout-Inferenz, erzeugen aber Distribution Shift.

### Exact Sequence Importance Sampling

Für eine Antwort `y=(y_1,…,y_T)` ist das Token Ratio

\[
\rho_t=\frac{\pi_\theta(y_t|x,y_{<t})}{\pi_0(y_t|x,y_{<t})}
=\exp(\log\pi_\theta-\log\pi_0).
\]

Das exakte Sequence Importance Weight ist

\[
W(y)=\prod_{t:m_t=1}\rho_t
=\exp\left(\sum_{t:m_t=1}[\log\pi_\theta-\log\pi_0]\right).
\]

Unter gemeinsamen Support kann `W` die Verteilung prinzipiell korrigieren. Bei langen Antworten ist es aber ein Produkt vieler Faktoren und kann extreme Varianz besitzen. Deshalb wird in Logspace summiert und erst spät exponentiert. Shapes: Current und old Logprobs `[B,G,T]`, Response Mask `[B,G,T]`, `W` `[B,G]`.

### Warum token-level Reweighting biased ist

PPO/GRPO verwenden häufig nur das lokale `ρ_t` am Token `t`. Das senkt Varianz, korrigiert aber nicht die gesamte Trajektorie:

- Der Prefix `y_<t`, der den Zustand definiert, wurde unter `π_0` erzeugt.
- Nur die beobachtete Aktion `y_t` wird lokal auf `π_θ` umgewichtet.
- Der Suffix `y_>t`, von dem ein Outcome-Reward abhängen kann, stammt weiter aus `π_0`.

Das lokale Objective ist deshalb ein Surrogate: Es optimiert eine gemischte Verteilung, nicht exakt den On-policy-Erwartungswert unter `π_θ`. Je weiter `π_θ` und `π_0` auseinanderliegen, desto stärker können Prefix-/Suffix-Bias und Ratio-Varianz werden. [A5, S. 32–35]

### Clipping

Der PPO/GRPO-Term lautet

\[
L_t=-\min\big(\rho_t A,\operatorname{clip}(\rho_t,1-\epsilon,1+\epsilon)A\big).
\]

Für `A>0` wird zusätzliches Hochgewichten oberhalb `1+ε` nicht belohnt. Für `A<0` wird weiteres Heruntergewichten unterhalb `1−ε` begrenzt. Clipping senkt den Einfluss extremer Ratios, ist aber keine exakte Importance-Korrektur und keine harte Garantie für kleine globale Policy-Distanz.

### GSPO: geometric-mean Sequence Ratio

Group Sequence Policy Optimization (GSPO) teilt die Differenz der Response-Logprobs zunächst durch die Zahl gültiger Response Tokens:

\[
s(y)=\exp\left(\frac{1}{n_y}\sum_{t:m_t=1}
[\log\pi_\theta(y_t|s_t)-\log\pi_0(y_t|s_t)]\right).
\]

`s` ist der geometrische Mittelwert der Token Ratios und hat Shape `[B,G]`. Dasselbe Sequence Ratio wird auf alle Response Tokens einer Antwort angewandt. Gegenüber dem exakten Produkt reduziert die Wurzel beziehungsweise Längennormalisierung extreme Werte. Es ist damit stabiler, aber nicht mehr die exakte Sequence-Importance-Korrektur. Wird die äußere Loss-Normalisierung von sequence-basiert zu constant geändert, muss geprüft werden, ob die eingebaute Längenskalierung noch zum gewünschten Objective passt; eine Formel darf nicht blind zwischen Rezepten kopiert werden. [A5, S. 36–38]

### Worked Micro-example

Eine Antwort besitzt zwei gültige Tokens mit Ratios `[2,0,5]`.

- Exaktes Sequence Weight: `W=2·0,5=1`.
- Token-local: erstes Token erhält Faktor `2`, zweites `0,5`.
- GSPO: `s=sqrt(2·0,5)=1`, also derselbe Sequence-Faktor an beiden Tokens.

Obwohl das gesamte Sequence Weight eins ist, erzeugt token-local Reweighting asymmetrische Tokenupdates. Das Beispiel zeigt, warum „alle Ratios mitteln sich aus“ für ein tokenweises Surrogate falsch sein kann.

### Typische Pitfalls

- `old_log_probs` werden nach dem Update mit der aktuellen Policy neu berechnet. Dann erscheinen Ratios künstlich als eins und die Behavior Policy ist verloren.
- Durch `π_0` oder `π_ref` wird versehentlich differenziert. Beide müssen für den betrachteten Update fest sein.
- Prompt- oder Paddingpositionen gehen in Sequence Ratio oder Nenner ein.
- Wahrscheinlichkeitsprodukte werden direkt statt in Logspace berechnet.
- Niedrige Clip Fraction wird automatisch als gute Policy interpretiert; sie kann auch bedeuten, dass kaum gelernt wird.

### Retrieval Questions

1. **Welche beiden Teile einer Trajektorie korrigiert ein lokales Token Ratio nicht?**

   **Lösung:** Den unter der alten Policy erzeugten Prefix vor der Aktion und den ebenfalls unter der alten Policy erzeugten Suffix danach. Darum ist der lokale Ausdruck ein biased Surrogate.

2. **Warum reduziert GSPO typischerweise Ratio-Varianz gegenüber dem exakten Sequence-Produkt?**

   **Lösung:** Es verwendet den geometrischen Mittelwert, also den Mittelwert der Logratios vor dem Exponentieren. Die Größe wächst dadurch nicht als ungebremstes Produkt mit der Sequenzlänge.

### Objektiver Transfer Check

Gegeben sind `current_logp`, `old_logp`, `response_mask`, `A` und `ε` für zwei kurze Antworten. Der Lernende berechnet Token Ratios, exact Sequence Weight und GSPO-Weight, markiert geclippte Tokens für positives und negatives Advantage und erklärt eine beobachtete Abweichung.

**Bestehenskriterium:** Nur Response Tokens zählen; old Logprobs bleiben konstant; Summe der Logratio wird nicht mit Summe der Ratios verwechselt; das Vorzeichen des Advantage bestimmt die relevante Clip-Seite.

**Quellen:** [L16, S. 17–36], [L17, S. 3–10], [A5, S. 32–38]

## 5. SFT → DPO Systems Pipeline

### Warum und wo?

Supervised Fine-Tuning (SFT) und Direct Preference Optimization (DPO) benutzen beide Language-Model-Logprobs, aber sie beantworten verschiedene Datenfragen:

- SFT fragt: „Kann das Modell diese gewünschte Antwort imitieren?“
- DPO fragt: „Erhöht die Policy eine bevorzugte Antwort relativ zu einer abgelehnten Antwort stärker als die feste Reference Policy?“

Die mathematischen Losses funktionieren nur, wenn Template, Token Shift, Masken, Sequenzgrenzen und Modellrollen konsistent sind.

### SFT-Datenfluss

1. Ein Beispiel enthält `instruction` und `response`.
2. Ein festes Template serialisiert Rollen, Trennzeichen und Antwort.
3. Ein End-of-Sequence-Token (EOS) markiert den Abschluss.
4. Token IDs werden optional zu längeren konstanten Sequenzen gepackt.
5. `input_ids=tokens[:,:−1]`, `labels=tokens[:,1:]`.
6. Ein Loss Contract legt fest, ob alle Tokens oder nur Response Tokens beitragen.

Shapes bei Batchgröße `B`, Sequenzlänge `T` und Vokabular `V`:

- `input_ids`, `labels`, `loss_mask`: `[B,T]`.
- `logits`: `[B,T,V]`.
- unreduzierter Token-Loss: `[B,T]`.
- reduzierter SFT-Loss: Skalar.

Ein typischer response-masked Loss ist

\[
L_{SFT}=-\frac{\sum_{b,t}m_{bt}\log\pi_\theta(y_{bt}|x_b,y_{b,<t})}
{\sum_{b,t}m_{bt}}.
\]

Das A5-Supplement verwendet ein konkretes Packing- und Labelprotokoll. Dieses Protokoll hat Vorrang vor allgemeinen Gewohnheiten. „Prompttokens immer maskieren“ ist ebenso falsch wie „Prompttokens immer trainieren“; beides sind Rezeptentscheidungen. [A5S, S. 8–11]

Bei Gradient Accumulation müssen Microbatch-Losses so gewichtet sein, dass ihr Gradient dem gesamten effektiven Batch entspricht. Gleich große Microbatches können durch die Zahl Accumulation Steps geteilt werden. Bei ungleichen Größen oder unterschiedlichen gültigen Tokenzahlen muss der tatsächliche globale Nenner erhalten bleiben.

### Evaluation vor und nach SFT

Ein fairer Vergleich fixiert Benchmarkversion, Promptformat, Generationseinstellungen, Stop-Regel, Parser und Judge. Nur das für den jeweiligen Checkpoint korrekte Chat-/SFT-Template darf bewusst wechseln; dieser Wechsel muss als Teil des Systems dokumentiert sein. Zusätzlich werden Rohoutputs und Fehlertypen geprüft. [A5S, S. 3–14]

### DPO-Datenfluss

Ein Preference-Beispiel besteht aus demselben Prompt `x`, einer chosen Response `y_w` und einer rejected Response `y_l`. Nach identischer Serialisierung werden nur die vorgesehenen Response Tokens zu vier Sequenz-Logprobs summiert:

\[
\log\pi_\theta(y_w|x),\quad \log\pi_\theta(y_l|x),\quad
\log\pi_{ref}(y_w|x),\quad \log\pi_{ref}(y_l|x).
\]

Alle vier Größen haben pro Beispiel Shape `[B]`. Die Reference Policy ist eine eingefrorene Kopie des SFT-Ausgangsmodells und kann auf einem anderen Device liegen. Durch sie wird nicht differenziert.

Definiere

\[
z=\beta\left[
(\log\pi_\theta(y_w|x)-\log\pi_{ref}(y_w|x))
-(\log\pi_\theta(y_l|x)-\log\pi_{ref}(y_l|x))
\right].
\]

Dann gilt

\[
L_{DPO}=-\log\sigma(z).
\]

`β` skaliert die relative Policy-to-Reference-Marge und ist nicht bloß eine zweite Learning Rate. DPO benötigt während des Trainings keine neuen Rollouts, übernimmt aber Biases der Preference-Paare. [L15, S. 55–62], [L16, S. 3–10], [A5S, S. 15–18]

### Worked Micro-example

Für ein Preference-Paar seien die response-only Sequenz-Logprobs:

- Policy: chosen `−10`, rejected `−12`.
- Reference: chosen `−9`, rejected `−10`.

Die Policy-to-Reference-Änderungen sind `−1` für chosen und `−2` für rejected. Die DPO-Marge vor `β` ist daher `1`: Relativ zur Reference wurde rejected stärker abgesenkt als chosen. Bei `β=0,1` ist `z=0,1` und `L≈−log σ(0,1)≈0,644`.

Wichtig: Die absoluten Policy-Logprobs sind beide kleiner als bei der Reference. DPO beurteilt die relative Differenz zwischen chosen und rejected, nicht ob jede Antwort einzeln wahrscheinlicher wurde.

### Safety und Alignment Tax

Nach SFT oder DPO werden nicht nur Preference Win Rate und Safety-Proxies geprüft, sondern auch zuvor vorhandene Fähigkeiten. Ein Alignment Tax liegt vor, wenn gewünschtes Verhalten steigt, während etwa Wissen oder Reasoning sinkt. Red Teaming soll Failure Modes finden, nicht schädliche Anleitungen sammeln. Sichere Übungsfälle verwenden abstrakte Kategorien, kontrollierten Zugriff und dokumentieren Judge-Fehler sowie Over-refusal. [A5S, S. 12–18]

### Typische Pitfalls

- Training und Evaluation verwenden unbemerkt verschiedene Templates.
- Packing überschreitet Dokumentgrenzen ohne EOS oder passenden Mask Contract.
- Prompt-, Padding- und Response-Tokens werden in Policy und Reference unterschiedlich summiert.
- chosen und rejected werden vertauscht.
- Die Reference erhält Gradienten oder wird zusammen mit der Policy aktualisiert.
- Vorher/Nachher-Scores werden mit verschiedenen Generationseinstellungen verglichen.

### Retrieval Questions

1. **Warum braucht DPO vier Sequenz-Logprobs statt nur Policy(chosen) und Policy(rejected)?**

   **Lösung:** Die feste Reference definiert, wie stark die Policy beide Antworten relativ zum Ausgangsmodell verändert hat. Ohne Reference entsteht ein anderes Objective ohne diese relative Regularisierung.

2. **Warum kann ein korrektes DPO-Resultat entstehen, obwohl beide Antworten unter der Policy absolut unwahrscheinlicher als unter der Reference sind?**

   **Lösung:** Entscheidend ist die Differenz der Policy-to-Reference-Änderungen. Wenn rejected stärker abgesenkt wurde als chosen, wächst die gewünschte Präferenzmarge.

### Objektiver Transfer Check

Der Lernende erhält zwei kurze tokenisierte Preference-Paare mit Padding, Response Masks und Policy-/Reference-Tokenlogprobs. Er muss die vier Sequenzwerte, den DPO-Logit und die gewünschte Update-Richtung bestimmen sowie einen Template- oder Maskenfehler diagnostizieren.

**Bestehenskriterium:** Prompt/Padding zählen nicht zum response-only Score; Reference bleibt fixed; chosen/rejected und Policy/Reference werden nicht vertauscht; die Aussage wird anschließend mit identischem Eval-Protokoll geprüft.

**Quellen:** [L15, S. 6–29 und S. 31–66], [L16, S. 3–13], [A5S, S. 3–18]

## 6. PPO/RLVR Systems & R1/Kimi/Qwen Comparative Pipeline

### Warum und wo?

Reinforcement Learning from Verifiable Rewards (RLVR) ist gleichzeitig ein Lernalgorithmus und ein verteiltes Inference-/Training-System. Gute Resultate entstehen nicht aus dem Namen „GRPO“, sondern aus Base Model, Promptverteilung, Reward, Sampling, Staging, Datenfilterung, Optimizer und Infrastruktur.

### Rollen im PPO-/RLVR-System

- `π_θ`: trainierbare Policy.
- `π_old`: eingefrorene Policy, die den aktuellen Rolloutbatch erzeugt hat.
- `π_ref`: längerfristig feste Reference gegen Capability Drift.
- Reward Model oder Verifier: bewertet die Antwort.
- Value Model/Critic: schätzt erwarteten Return; bei GRPO oft durch Group Baseline ersetzt.
- Rollout Engine/Workers: erzeugen Antworten effizient, etwa mit KV Cache.
- Trainer Workers: berechnen Logprobs, Loss und Updates.

Ein Iterationszyklus:

1. Aktuelle Policyweights an Rollout Workers synchronisieren.
2. Prompts sampeln und mehrere Antworten generieren.
3. Outputs parsen, verifizieren und Rewards berechnen.
4. old Logprobs und Masken unveränderlich speichern.
5. Advantage beziehungsweise Group-relative Weight berechnen.
6. Mehrere Microbatch-Updates mit Ratio/Clip/KL ausführen.
7. Reward, Validation, Entropy, Length, KL, Ratio, Clip Fraction, Grad Norm und Throughput loggen.

On-policy Rollouts sind langsam; Training und Generation nutzen häufig verschiedene Frameworks; lange Chain-of-Thought (CoT)-Antworten erzeugen ungleich große Batches. Weight Sync, Scheduling und Multi-model Memory sind daher Teil der fachlichen Korrektheit, nicht bloß Deploymentdetails. [L16, S. 17–31 und S. 57–58], [L17, S. 3–10]

### PPO und Advantage

PPO nutzt ein Value Model und häufig Generalized Advantage Estimation (GAE):

\[
\delta_t=r_t+\gamma V(s_{t+1})-V(s_t),\qquad
A_t^{GAE}=\sum_{l\ge0}(\gamma\lambda)^l\delta_{t+l}.
\]

Bei einem Outcome-Reward liegt der externe Reward meist am Ende. In einem vereinfachten Banditblick mit kompletter Antwort als Aktion fallen `Q` und Outcome `R` zusammen; dennoch kann ein tokenweises Value Model eine Baseline liefern. PPO kombiniert dieses Advantage mit old/current Ratios und Clipping. Ein per-token KL-Term zur Reference plus finaler Outcome-Reward ist Reward Shaping und muss mit klarer Skala dokumentiert werden. [L16, S. 21–28]

### Comparative Pipeline

| Rezept | Ausgangspunkt und Staging | Reward/Data-Idee | Wichtige Lehre |
|---|---|---|---|
| DeepSeek R1-Zero | Base Model → verifiable RL | Accuracy- und Format-Rewards; keine Reasoning-SFT-Initialisierung | RL kann längere Reasoning-Traces erzeugen, aber „Aha“-Narrative müssen gegen Base-Fähigkeit und Objective-Bias geprüft werden. |
| DeepSeek R1 | Reasoning SFT → GRPO → weitere SFT/RLHF | Language Consistency, später auch non-verifiable Daten; anschließende Distillation | Staging kombiniert Bootstrapping, verifizierbare Verbesserung und allgemeines Post-training. |
| Kimi K1.5 | Difficulty-curated Data → Long-CoT SFT → eigener baselined RL-Loss | Curriculum, unsolved-problem Sampling, Length Control und domänenspezifische Verifier | Promptverteilung, Length Reward und Infrastruktur sind Teil des Objectives. |
| Qwen3 | SFT/Reasoning RL → allgemeines Post-training | Difficulty/quality filtering, kleine gezielte RL-Menge, Thinking-/Non-thinking-Fusion und kontrolliertes Beenden | Wenige kuratierte RL-Aufgaben können reichen; Test-time Mode und Alignment Tax müssen separat evaluiert werden. |

[L16, S. 37–66]

Die Fallstudien sind keine faire Rangliste der Algorithmen. Sie unterscheiden sich in Base Model, Daten, Compute, Rewards und Evaluation. Übertragbar sind die Designfragen:

- Welche Fähigkeit ist bereits im Base Model vorhanden?
- Welche Aufgaben liefern zuverlässige Verifier?
- Muss SFT Exploration erst bootstrappen?
- Welche Reward-Komponenten können gehackt werden?
- Welche Längen- oder Sprachbiases erzeugt das Objective?
- Wann werden Reasoning-Traces destilliert?
- Welche Fähigkeit sinkt nach allgemeinem RLHF?

### Worked Micro-example

Ein Base Model erzielt selten korrekte Mathematikantworten, hält aber das verlangte Format ein. Reines RLVR liefert fast nur Nullreward; die Policy erhält kaum Kontraste. Ein kleiner, geprüfter Reasoning-SFT-Schritt kann die Erfolgsrate so erhöhen, dass mehrere Rollouts pro Prompt gemischte Rewards erzeugen und GRPO ein Signal sieht.

Nach RL steigt Accuracy, aber Antworten werden länger und wechseln unerwartet zwischen Sprachen. Das ist kein automatischer Beweis für tieferes Reasoning. Man prüft getrennt: echte Correctness, Antwortlänge, Language Consistency, Base-vs-posttraining, Objective-Normalisierung und unabhängige Testfälle. Eine Language- oder Length-Komponente darf erst nach dieser Diagnose hinzugefügt und anschließend auf Nebenwirkungen geprüft werden.

### Typischer Pitfall

Ein Resultat wird allein dem Algorithmusnamen zugeschrieben. Tatsächlich kann der Unterschied aus besserem Base Model, SFT-Initialisierung, Prompt Difficulty, Verifierqualität, Test-time Budget, Distillation oder Infrastruktur stammen.

### Retrieval Questions

1. **Warum ist Weight Sync zwischen Trainer und Rollout Engine fachlich wichtig?**

   **Lösung:** Ohne Sync stammen Antworten und old Logprobs nicht von der Policyversion, die der Trainingsloop annimmt. On-/Off-policy-Status und Ratios werden dann falsch interpretiert.

2. **Warum kann Reasoning SFT vor RLVR nützlich sein, obwohl RL selbst neue Antworten erzeugt?**

   **Lösung:** Bei extrem seltenen Erfolgen sieht der Verifier fast nur identische Nullrewards. SFT kann die Policy in einen Bereich bringen, in dem Sampling unterschiedliche, teilweise erfolgreiche Rollouts erzeugt und ein Policy-Gradient-Signal entsteht.

### Objektiver Transfer Check

Der Lernende erhält drei hypothetische Trainingsläufe mit denselben Algorithmuslabels, aber unterschiedlichen Base Models, Rewardmischungen, Sync-Frequenzen, Antwortlängen und Evalbudgets. Er muss mindestens vier Confounder markieren, den ersten technischen Diagnosepunkt wählen und ein kontrolliertes Ablation-Design formulieren.

**Bestehenskriterium:** Algorithmusname wird nicht als Ursache vorausgesetzt; Policyversionen und Weight Sync werden geprüft; Reward, Length, Entropy und unabhängige Correctness werden gemeinsam betrachtet; das Ablation-Design ändert jeweils nur einen Faktor.

**Quellen:** [L15, S. 49–66], [L16, S. 14–67], [L17, S. 1–11], [A5, S. 8–38]

## Integrationshinweis für die Plattform

Die sechs Bereiche sollten nicht als passive Lecture-Zusammenfassung eingebaut werden. Eine effiziente Struktur wäre:

- sechs Concept-Seiten mit den Mechanismen oben,
- eine kompakte Evaluation-/Data-/RLVR Case Atlas-Ansicht für Namen und historische Beispiele,
- neue Formula Cards für Risk, GRPO-Varianten, Sequence Importance Sampling, GSPO, GAE und DPO,
- drei objektive Labs: `evaluation-contract`, `grpo-variant-tracer`, `off-policy-and-sft-dpo-tracer`,
- Retrieval Questions erst geschlossen, Lösungen aufklappbar,
- Missions verlinken auf die neuen Concepts/Labs, statt deren Existenz nur im Scope-Text zu behaupten.

Eine Lecture gilt erst als transferfähig abgedeckt, wenn der Lernende nicht nur Begriffe erkennt, sondern mit einem neuen Toy-Fall Protokoll, Shapes, Gewichtung, Gradientrichtung und Failure Mode korrekt bestimmen kann.
