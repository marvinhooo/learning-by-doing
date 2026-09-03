# Activity

Iteration Counter: 1

## 2026-07-14 - Interaktiver CS336-Lernbegleiter (manueller Run)

- Status: abgeschlossen
- Quelleninventur abgeschlossen: 15 Lecture-PDFs sowie 6 Assignment-PDFs.
- Acht zunaechst fehlerhafte Lecture-Dateien wurden durch den Nutzer als echte PDFs ersetzt und anschliessend verifiziert.
- `/Users/martin/tafelwerk.html` als UX-Referenz geprueft.
- Scope um einen vollstaendigen Symbol- und Formelkatalog erweitert.
- Ergebnis: `cs336-lernwerk.html` als offline-faehige interaktive Einzeldatei erstellt.
- Umfang: 12 Lernmodule, 43 Konzepte, 52 Formeln, 47 Symboleintraege, 54 Glossarbegriffe, 11 Labs, Diagnose und Quiz sowie Assignment-Coaches fuer A1 bis A5.
- Verifiziert: JavaScript-Parsing, globale und lokale Suche, Formeldetails, kontextsensitive Symbolsuche, BPE- und GRPO-Labs, Diagnose-Dialog, gestufte Hinweisfreigabe, Theme-Wechsel sowie mobile Navigation bei 390 x 844 Pixeln.
- Browserkonsole: keine Fehler oder Warnungen. PDF-Stichproben fuer Attention und RMSNorm visuell mit den hinterlegten Quellen abgeglichen.
- Der Iteration Counter wurde nicht erhoeht, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-14 - Supabase, GitHub Pages und mobile PWA (manueller Run)

- Status: technisch vorbereitet; externe Projektkonfiguration offen.
- Produktentscheidung: bestehender Supabase-Account beziehungsweise dieselbe Organisation, aber ein separates Projekt `CS336-Lernwerk` statt Wiederverwendung des Immo-Checker-Projekts.
- `index.html` als kanonischen Einstieg eingerichtet; der bisherige Dateiname leitet kompatibel weiter.
- E-Mail-/Passwort-Login ohne oeffentliche Registrierung, benutzerspezifische lokale Speicherung und Offline-first-Synchronisation mit Konfliktzusammenfuehrung implementiert.
- Privaten Bucket `cs336-pdfs`, Row Level Security (RLS; zeilenbasierte Zugriffskontrolle) und minimale Datenbankrechte in `supabase/setup.sql` vorbereitet.
- PDFs durch `.gitignore` vom GitHub-Deployment ausgeschlossen; lokales Upload-Skript mit Service-Role-Umgebungsvariable angelegt.
- PWA-Manifest, Service Worker, App-Icons, Safe-Area-Unterstuetzung und mobile Touch-/Eingabeanpassungen fuer iPhone und iPad ergaenzt.
- GitHub-Actions-Workflow und reproduzierbaren `_site`-Build angelegt; Publishable Key wird erst im Deployment aus Repository-Variablen erzeugt.
- Verifiziert: HTML-JavaScript, Service Worker und Manifest parsen; lokaler Modus, Login-Oberflaeche, Quellenbuttons und Notiz-Autosave wurden ohne Browser-Konsolenfehler geprueft. Der Build enthaelt weder PDFs noch Service-Role-Key.
- Offen: Supabase-Projekt, Auth-Benutzer, GitHub-Repository und Repository-Variablen extern anlegen; danach PDF-Upload, Live-Login, RLS- und Geraete-Ende-zu-Ende-Test.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-14 - Secret-Key-Kompatibilitaet beim PDF-Upload (manueller Run)

- Root Cause: Der neue opaque Supabase-Secret-Key `sb_secret_...` wurde zusaetzlich als Bearer-JWT gesendet; Storage antwortete deshalb mit `Invalid Compact JWS`.
- Fix: Neue Secret Keys werden nur noch im `apikey`-Header gesendet; nur der alte JWT-basierte `service_role`-Key erhaelt weiterhin einen `Authorization: Bearer`-Header.
- Der Upload bleibt durch `x-upsert` wiederholbar und ueberschreibt gleichnamige Dateien kontrolliert.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-14 - GitHub-Pages-Produktivsetzung (manueller Run)

- Status: erfolgreich veroeffentlicht.
- Leeres Repository `marvinhooo/learning-by-doing` als `origin` eingetragen und `main` ohne PDFs gepusht.
- GitHub-Actions-Run 29343090502 inklusive Build, Artifact-Upload und Pages-Deployment erfolgreich abgeschlossen.
- Produktions-URL: `https://marvinhooo.github.io/learning-by-doing/`.
- Verifiziert: Startseite HTTP 200, Manifest HTTP 200, bekannte PDF auf GitHub Pages HTTP 404 und derselbe Pfad ueber den oeffentlichen Supabase-Storage-Endpunkt HTTP 400; der Bucket ist damit nicht oeffentlich auslieferbar.
- Der produktive Build enthaelt die konfigurierte Supabase Project URL und ausschliesslich den oeffentlichen Publishable Key.
- Offen bleibt der authentifizierte Ende-zu-Ende-Test mit dem echten Benutzer; Passwort oder Secret Key werden dafuer nicht an Codex uebermittelt.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-14 - UX-Verdichtung mit Akkordeons (manueller Run)

- Status: abgeschlossen und erfolgreich veroeffentlicht.
- Formeln, Symbole und Glossar von Kachelrastern auf kompakte native Akkordeons umgestellt; mehrere Eintraege koennen gleichzeitig offen bleiben und ihr Zustand ueberlebt Filter- und Lesezeichen-Renderings.
- Formeln bleiben geschlossen vollstaendig sichtbar, brechen auf schmalen Displays um und zeigen aufgeklappt Zweck, Lesart, Dimensionen, Intuition, Beispiel, Fehlerbild, Selbstcheck, Variablen und Quellen.
- Dashboard, Lernpfad, Konzepte, Labs und Assignments in scanbare Listen beziehungsweise Timeline-Akkordeons verdichtet; redundante Karten und tote Chevron-Aktionsflaechen entfernt.
- Mobile Navigation bis 900 Pixel als Offcanvas-Menue mit `inert`, `aria-hidden`, Escape-Schliessen, Fokusuebergabe und Fokuswiederherstellung umgesetzt.
- Verifiziert: Inline-JavaScript und Hilfsskripte parsen, `git diff --check` ist sauber, Formel-Entities werden korrekt angezeigt, Lesezeichen behalten Fokus und Offen-Zustand, und die Ansichten laufen bei 390 x 844, 768 x 1024 sowie 1280 x 720 Pixeln ohne horizontales Ueberlaufen. Zentrale Touch-Ziele sind mindestens 44 Pixel hoch.
- Zwei unabhaengige Read-only-Code-Reviews fanden nach den Korrekturen keine verbleibenden High- oder Medium-Blocker.
- Commit `49a261b` wurde gepusht; GitHub-Actions-Run 29349877544 schloss erfolgreich ab. Die Produktionsseite antwortete mit HTTP 200 und enthielt die neuen Akkordeon- und Mobile-Navigationsmarker.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-14 - UX- und Accessibility-Audit nach aktuellen Standards (manueller Run)

- Status: Umsetzung und statische Verifikation abgeschlossen; Produktionspruefung nach Deployment ausstehend.
- Abgleich mit WCAG 2.2, WAI-ARIA Authoring Practices und aktuellen Apple-Vorgaben fuer iPhone/iPad durchgefuehrt.
- Light-Theme-Kontraste, Fokusindikatoren und Form-Control-Grenzen auf AA-taugliche Werte angehoben; Skip-Link und dynamische Seitentitel ergaenzt.
- Hauptnavigation auf semantische Links umgestellt; Browser-Zurueck/-Vorwaerts, iOS-Swipe und Scrollpositionswiederherstellung implementiert.
- Dialog und mobiler Drawer mit Hintergrund-Inertheit, Fokusbegrenzung, Escape, Scrim und Fokuswiederherstellung vervollstaendigt; Offcanvas-Breakpoint auf 1180 Pixel angehoben.
- Globale Suche als zugängliche Combobox mit Listbox, Ergebnismeldung und Pfeiltastensteuerung umgesetzt.
- Dateiimport, Kompetenzwahl, Filter, Assignment-Hinweise und relevante Statusmeldungen tastatur- und screenreaderfreundlich nachgebessert.
- Detailseiten von wiederholten Panel-Kacheln zu einem ruhigeren Lesefluss verdichtet; Attention-Matrix als echte Tabelle und Lab-Diagramme ohne winzige SVG-Beschriftungen umgesetzt.
- Service-Worker-Cleanup auf eigene `cs336-shell-*`-Caches begrenzt, damit andere GitHub-Pages-Projekte auf demselben Origin unberuehrt bleiben.
- Verifiziert: Inline-JavaScript, Service Worker, Build- und Upload-Skripte parsen; `git diff --check` ist sauber; der reproduzierbare Site-Build enthaelt weder PDFs noch Notebooks.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Glossar-Akkordeons mit echtem Zusatznutzen (manueller Run)

- Geschlossene Glossareintraege zeigen Begriff, Kategorie und vollstaendige Kurzdefinition; beim Oeffnen erscheint eine deutlich ausfuehrlichere, beginner-freundliche Erklaerung.
- Das Glossar umfasst nun 55 Eintraege einschliesslich `Linear Layer / Projection`, das den in LLM-Texten gebraeuchlichen Begriff Projection als gelernte lineare Abbildung erklaert.
- Verifiziert: Alle Glossarbegriffe besitzen Kurz- und Langdefinition; Inline-JavaScript, `git diff --check` und der reproduzierbare Site-Build sind sauber.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Beginner-first Erklaerungen und aufklappbare Lernantworten (manueller Run)

- Status: Umsetzung und Verifikation abgeschlossen.
- Alle 52 Konzeptseiten auf weniger vorausgesetztes Vorwissen umgeschrieben und vertieft: jeweils mentales Modell, drei schrittweise Erklaerabschnitte, typische Fehlannahmen sowie zwei begruendete Selbstcheck-Antworten; insgesamt 156 Vertiefungsabschnitte und 104 Musterloesungen.
- Standardbegriffe wie `Linear Layer`, `Attention Head`, `Forward Pass` und `Backward Pass` repo-weit beibehalten beziehungsweise vereinheitlicht; missverstaendliche Woertlich-Uebersetzungen entfernt. `Projection` bleibt nur im erklaerenden Glossareintrag erhalten.
- Fuer alle 52 Formel-Abrufchecks, 20 Readiness-Fragen der Assignments und 11 Lab-Transferfragen standardmaessig geschlossene Antworten beziehungsweise Loesungsideen ergaenzt. Assignment-Antworten bleiben konzeptuell und enthalten keinen Abgabecode.
- Jede Konzeptseite endet mit einer klaren Weiter-Aktion; nach dem letzten der 52 Konzepte fuehrt sie zur Konzeptuebersicht. Vertiefte Texte und Antworten sind in lokaler und globaler Suche enthalten.
- Quellenabgleich gegen die jeweils verknuepften Lecture- und Assignment-PDFs durchgefuehrt; Formelantworten und Lab-Loesungsideen wurden zusaetzlich unabhaengig fachlich geprueft.
- Verifiziert: JavaScript-Parsing und Dateninvarianten, 52/52 Konzepte und Formeln, 55/55 Glossareintraege, 20/20 Assignment-Antworten und 11/11 Lab-Antworten, `git diff --check`, Hilfsskripte sowie reproduzierbarer `_site`-Build ohne PDFs, Notebooks oder Temporaerdateien.
- Browserpruefung ohne Konsolenfehler: Selbstcheck-, Formel-, Assignment-, Lab- und Glossar-Akkordeons sowie erste und letzte Konzeptnavigation funktionieren. Bei 390 x 844, 768 x 1024 und 1280 x 800 Pixeln trat kein horizontales Ueberlaufen auf; zentrale Touch-Ziele blieben mindestens 44 Pixel hoch.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Vollstaendige Englisch-/Deutsch-Umschaltung und ehrliche Diagnoseoption (manueller Run)

- Status: abgeschlossen und fuer das Deployment vorbereitet.
- Englisch als Standardsprache eingerichtet; ein 44 Pixel grosser Umschalter wechselt vollstaendig zu Deutsch und speichert die Praeferenz geraetelokal, getrennt vom synchronisierten Lernstand.
- Vollstaendige ID-basierte englische Sprachschicht fuer 12 Module, 52 Konzepte, 52 Formeln mit 167 Variablenerklaerungen, 5 Assignment-Coaches, 11 Labs, 12 Diagnosefragen, 12 Quizfragen, 55 Glossarbegriffe und 48 Symbole ergaenzt. Ein automatischer Paritaetscheck prueft diese Abdeckung und 465 statische beziehungsweise dynamische Oberflaechentexte bei jedem Build.
- Jede der 12 Diagnosefragen besitzt nun zusaetzlich `I don't know` beziehungsweise `Ich weiss es nicht`. Die Option zaehlt bewusst nicht als richtige Antwort und bleibt Teil des Nenners, damit die Lernreihenfolge echte Wissensluecken priorisiert; das regulaere Quiz bleibt unveraendert.
- Der Sprachwechsel behaelt aktuelle Ansicht, Filter, Formulare, Akkordeons, Scrollposition und den laufenden BPE-Merge-Zustand. Der Service-Worker-Cache wurde auf `cs336-shell-v5` angehoben, damit installierte iPhone-/iPad-Apps die neue Sprachdatei sicher erhalten.
- Verifiziert: Locale-Paritaet, JavaScript-Syntax, reproduzierbarer `_site`-Build ohne PDFs oder Notebooks und bytegleiche Quell-/Build-Dateien. Browserpruefungen deckten Diagnose, Account-Dialog, dynamisches BPE-Lab, Sprachwechsel und 24 Routen ab; die Konsole blieb ohne Fehler oder Warnungen.
- Bei 390 x 844, 768 x 1024 und 1280 x 800 Pixeln trat kein horizontales Ueberlaufen auf; zentrale Touch-Ziele einschliesslich Sprachumschalter und Diagnoseoptionen sind mindestens 44 Pixel hoch.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Lernpfad und Konzepte zu einer Kursstruktur zusammengefuehrt (manueller Run)

- Status: abgeschlossen und lokal verifiziert.
- Redundanten Top-Level-Menuepunkt `Konzepte` sowie die zweite Konzeptuebersicht entfernt. Der Lernpfad ist nun die einzige Kursuebersicht; jedes Modul zeigt aufgeklappt direkt seine geordneten Konzepte und zugehoerigen Labs.
- Konzeptsuche in den Lernpfad integriert. Suchtreffer reduzieren die sichtbaren Module und Konzeptzeilen, oeffnen passende Module automatisch und blenden fuer einen fokussierten Scan die Lablisten aus.
- Optionale Moduldetailseite auf Voraussetzungen, Quellen, Lernziel und Fortschritt begrenzt. Dashboard-Karten oeffnen das zugehoerige Modul im Lernpfad; `Lernen fortsetzen` fuehrt direkt zum naechsten offenen Konzept.
- Konzeptfortsetzung folgt explizit `MODULES[].concepts`: innerhalb eines Moduls zum naechsten Konzept, an der Grenze zum ersten Konzept des naechsten Moduls und am Kursende zur Lernpfaduebersicht.
- Alte `#concepts`-Hashes und gespeicherte `lastView: "concepts"` werden nach `#path` migriert. Modul- und Konzeptdetails markieren den Lernpfad als aktiven Navigationskontext; Zurueck/Vorwaerts erhaelt das geoeffnete Modul.
- Verifiziert: Inline-JavaScript, Locale-Paritaet mit 469 Oberflaechentexten, reproduzierbarer Site-Build und Service-Worker-Cache `cs336-shell-v6`. Browsertests fuer beide Sprachen, Legacy-Route, Suche, Modulgrenzen, Kursabschluss und History liefen ohne Konsolenfehler.
- Bei 320 x 700, 390 x 844 und 768 x 1024 Pixeln trat kein horizontales Ueberlaufen auf; Menue- und Sprachbutton blieben 44 x 44 Pixel gross.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Beginner-first Labs und erklaerender Shape Ledger (manueller Run)

- Status: Umsetzung und lokale Verifikation abgeschlossen.
- Alle elf Labs um einen bereits geschlossen sichtbaren Formel-Refresher erweitert. Jedes Lab nennt Mental Model, Kernformel oder Entscheidungsregel, verwendete Symbole, konkrete Beobachtungsaufgabe und typische Fehlannahme; alle Felder sind ID-basiert auf Englisch und Deutsch gepflegt und werden vom Locale-Paritaetscheck erzwungen.
- Tensor Shape Tracer von vier unbeschrifteten Ergebniswerten zu einer sechsstufigen Rechenkette umgebaut: Token-IDs, Embedding-Lookup und `X`, drei Linear Layers fuer `Q/K/V`, Head-Aufteilung mit `d_head=D/H`, rohe `QK^T`-Compatibility-Scores, Maske und Softmax sowie Value-Mischung, Head-Concat und `W_O`. Jede Shape benennt alle Achsen; auch das Sofortergebnis zeigt `[B,H,T,d_head]` beziehungsweise `[B,H,T_query,T_key]`. Regleraenderungen erklaeren die betroffene Achse und ihre Invarianten.
- BPE als Unicode-Zeichen-Toy-Modell gegenueber echtem Byte-level BPE abgegrenzt; Attention zeigt Score-, Masken-, Temperatur-, Softmax- und Value-Schritt; Optimizer, Ressourcen, Roofline, Scaling, Datenpipeline und GRPO zeigen Formeln mit aktuell eingesetzten Werten.
- Roofline-Plot auf eine konsistente logarithmische Arithmetic-Intensity-Achse korrigiert. DDP unterscheidet nun Speicher pro Rank und replizierten Clusterzustand; Scaling bezeichnet den berechneten Punkt korrekt als compute-kompatible Aufteilung statt als gemessenes Optimum; `D_model` und `D_tokens` sind getrennt.
- Verifiziert: Inline-JavaScript, Locale-Paritaet mit 594 Oberflaechentexten, `git diff --check` und reproduzierbarer Site-Build. Alle elf Labs wurden auf 390 Pixel Breite ohne horizontales Ueberlaufen gerendert; ab 760 Pixel bleiben Regler und Ergebnis auf dem iPad zweispaltig. Shape-Regler, BPE-Merge, Attention-Maske, Roofline-Klassifikation und GRPO-Nullsignal reagierten korrekt. Formel-Akkordeon und Sprachwechsel behalten Regler- und Offen-Zustand; dynamische Attention-, Parallelism- und Datenpipeline-Ausgaben wurden in beiden Sprachen geprueft.
- Service-Worker-Cache auf `cs336-shell-v7` und die Sprachdatei auf eine versionierte URL angehoben, damit bestehende Installationen die neuen englischen Labtexte ohne Zwischenzustand laden.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Lecture-Abdeckung, Assignment-Readiness und objektive Lernkontrolle (manueller Run)

- Status: inhaltliche und technische Ueberarbeitung lokal abgeschlossen; noch nicht committed oder deployed.
- Alle 16 vorhandenen Lecture-PDFs und sechs Assignment-Handouts erneut gegen die Plattformstruktur auditiert. Eine abgeleitete Lecture Coverage Map zeigt je Vorlesung die verknuepften Concepts, Formeln, Labs und Assignments; 29 Missions enthalten alle 124 Problem-IDs der Handouts.
- Bestand auf 13 Module, 62 Concepts, 65 Formeln, 67 Symbole, 55 Glossarbegriffe und 18 Labs erweitert. Lecture 10, moderne Architekturentscheidungen und Mixture of Experts (MoE; Expertenmischung) sind nun in Lernpfad, Quellen und Formeln integriert.
- Prerequisite Sprint fuer Python-, PyTorch-, Tensor-, Wahrscheinlichkeits-, Logarithmus-, Gradienten- und Ressourcenvertraege geschaerft. Die Diagnose umfasst weiterhin 12 Auswahlfragen und jetzt vier angewandte Kurzherleitungen; das Kursquiz umfasst 17 Fragen.
- Terminiertes Retrieval-Training ergaenzt: `Again`, `Hard` und `Good` planen Wiederholungen; der hoechste Concept-Level verlangt einen zeitversetzten erfolgreichen Abruf und wird durch ein spaeteres `Again` wieder entzogen.
- Drei besonders assignmentnahe Lernkontrollen neu beziehungsweise objektiv gemacht: Tensor Shape Tracer mit festem Shape-Transfer, PyTorch Contract Debugger mit fuenf isomorphen Failure Traces sowie Policy Loss Tracer fuer Shift, Response Mask, Gather, Vorzeichen und Reduction. Zusammen mit Triton, Online Softmax, Scaling Fit, Dedup und GRPO sind acht Labs fachlich gegated.
- Assignment-Missions koennen nicht mehr durch einen einzelnen Haken abgeschlossen werden: Alle verknuepften Concepts muessen mindestens erklaert, alle verknuepften Labs angewandt und mindestens 30 Zeichen eigener Nachweis gespeichert sein. Semantische Checks erzwingen Scope, Evidence, Failure Spur sowie Concept- und Lab-Verknuepfungen in beiden Sprachen.
- Wiederaufnahme bestandener Labs korrigiert: Erfolgsstatus und sichtbare korrekte Antwortspur bleiben konsistent. Lange BPE-Tokens und Code umbrechen; die Jaccard-Tabelle besitzt Caption und Header-Semantik; grosse slidergetriebene Bereiche verursachen keine Screenreader-Meldungsflut.
- Verifiziert: Locale- und Semantikcheck fuer 62 Concepts, 65 Formeln, 67 Symbole, 55 Glossareintraege, 18 Labs, 29 Missions und 1052 UI-Texte; Inline-JavaScript, Sprachbundle und Service Worker parsen; reproduzierbarer `_site`-Build ist quellgleich und enthaelt weder PDFs noch Notebooks.
- Browsertests in Englisch und Deutsch: Lecture Coverage Map, Mission-Gates, Objective Checks, Sprachwechsel und persistierte Lab-Erfolge. Bei 390 x 844, 768 x 1024 und 1024 x 768 Pixeln trat kein horizontales Ueberlaufen auf; alle sichtbaren Controls waren mindestens 44 Pixel hoch. Labs stapeln bis 899 Pixel Breite und bleiben im iPad-Landscape zweispaltig. Die Browserkonsole blieb leer.
- Service-Worker-Cache und Sprachbundle auf Version 18 angehoben. Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Erklaerungstiefe am Beispiel Linear Layer / Projection (manueller Run)

- Status: lokal abgeschlossen; noch nicht committed oder deployed.
- `Linear Layer / Projection` wird nun konsistent als gelernter Feature-Mixer erklaert: Bedeutung eines Features, einzelne gewichtete Summe, Bias, Lernen durch Backpropagation, Shape-Vertrag, Abgrenzung zwischen positionsweise und kontextfrei sowie die konkreten Rollen in Q/K/V, `W_O`, MLP und LM Head.
- Das Tafelwerk enthaelt eine neue, vollstaendige Formelkarte mit Zahlenbeispiel, Variablen, Shape-Folgen, PyTorch-Gewichtskonvention, Affinitaet bei Bias und Abgrenzung zur geometrischen Projection. Concept, Glossar, Symboltabelle und Tensor Shape Tracer verweisen auf dasselbe mentale Modell.
- Die Inhaltspruefung erzwingt in Deutsch und Englisch eine Mindesttiefe: mindestens drei Concept-Details, zwei Fehlerbilder, zwei beantwortete Selbstchecks, erklaerte Formelvariablen, substanzielle Formelantworten und Glossarvertiefungen. Diese Strukturpruefung ergaenzt den manuellen fachlichen Audit, ersetzt ihn aber nicht.
- Verifiziert: 62 Concepts, 65 Formeln, 67 Symbole, 55 Glossareintraege, 18 Labs, 29 Assignment-Missions und 1052 UI-Texte sind sprachlich und semantisch konsistent; Inline-JavaScript, Sprachbundle und Service Worker parsen; `_site` ist reproduzierbar und enthaelt weder PDFs/Notebooks noch administrative Secret-Marker.
- Browserpruefung in Deutsch und Englisch: Concept, Formel-Akkordeon, aufklappbare Musterloesung, Glossarvertiefung und dynamischer Shape-Tracer zeigen die neue Erklaerung. Bei 390 x 844 und 768 x 1024 Pixeln gab es kein horizontales Ueberlaufen; sichtbare Controls blieben mindestens 44 Pixel hoch und die Browserkonsole leer.
- Service-Worker-Cache und Sprachbundle auf Version 20 angehoben, damit bestehende Installationen die vertiefte englische Fassung sicher neu laden. Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Erklaerungsstandard auf weitere Kernbegriffe ausgeweitet (manueller Run)

- Status: lokal abgeschlossen und verifiziert; noch nicht committed oder deployed.
- Den bei `Linear Layer / Projection` eingefuehrten Erklaerungsstandard auf weitere haeufige Black Boxes ausgeweitet: Embedding Lookup, Kettenregel und Backpropagation, Softmax und Cross-Entropy, Q/K/V und Attention, RMSNorm, Residual Stream, SwiGLU, RoPE, KV-Cache, AdamW, Gradient Clipping, GQA/MQA, Mixture of Experts sowie DPO, GRPO, PPO und zentrale Distributed Collectives. Die Texte verbinden nun Input und Output, Mechanismus, gelernte beziehungsweise feste Teile, Shapes, Zweck, Einsatzort, Beispiel und Fehlannahme.
- Das Tafelwerk umfasst jetzt 66 Formeln; die neue `Token Embedding Lookup`-Karte und vertiefte Kernkarten besitzen vollstaendige Variablen-, Shape-, Beispiel- und Abruferklaerungen in Englisch und Deutsch. Die Notation wurde vereinheitlicht: `H` beziehungsweise `H_q` bezeichnet die Head-Anzahl, `d_head` die Featurebreite eines Heads.
- Das Glossar umfasst jetzt 66 Begriffe. Neu hinzugekommen sind eigenstaendige Eintraege fuer Embedding, Softmax, Cross-Entropy, Backpropagation, Query/Key/Value, Attention, Causal Mask, Broadcasting, AdamW, Parameter/Buffer sowie Stride/Contiguous; weitere zentrale bestehende Eintraege wurden substanziell vertieft.
- Optimizer-, Ressourcen-, Parallelismus- und Inference-Labs erklaeren nun die Zwischenschritte ihrer Rechnungen: Adam-Momente und Bias Correction, Herkunft der Faktoren 12 und 16, Datenbewegung bei All-Reduce/Reduce-Scatter/All-Gather sowie alle KV-Cache-Achsen, Faktor 2 und das Wachstum von `S`. Ein doppelter dynamischer Sprachersatz von `Bytes` zu `bytess` wurde dabei gefunden und an der Regex-Grenze behoben.
- Der Inhaltscheck erzwingt fuer 13 Kernformeln feldweise Mindesttiefe und fuer 33 grundlegende Glossarbegriffe substanzielle Langfassungen in beiden Sprachen. Verifiziert: 62 Concepts, 66 Formeln, 67 Symbole, 66 Glossareintraege, 18 Labs, 29 Missions und 1083 UI-Texte; Inline-JavaScript, Sprachbundle und Service Worker parsen; der reproduzierbare `_site`-Build ist quellgleich und enthaelt weder PDFs/Notebooks noch administrative Secret-Marker.
- Browserpruefung in Englisch und Deutsch: Glossarvorschau und -vertiefung, Embedding-Formel und Musterloesung, Embedding-Concept mit drittem Selbstcheck sowie Optimizer-, Ressourcen-, KV-Cache- und Parallelismus-Labs funktionieren. Bei 390 x 844, 768 x 1024 und 1024 x 768 Pixeln gab es kein horizontales Ueberlaufen; sichtbare Controls blieben mindestens 44 Pixel gross, iPad-Portrait stapelt die Labspalten und iPad-Landscape zeigt sie zweispaltig. Die Browserkonsole blieb leer.
- Service-Worker-Cache und Sprachbundle wurden auf Version 24 angehoben. Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Seitengenauer Deep Audit auf Lecture-Paritaet (manueller Run)

- Status: Review abgeschlossen; Lecture-Paritaet und vollstaendige Assignment-Readiness sind noch nicht erreicht. Es wurden in diesem Review keine Produktinhalte als abgeschlossen markiert.
- Quellenbasis: alle 16 vorhandenen Lecture-PDFs mit zusammen 617 Seiten und alle sechs Assignment-Handouts mit zusammen 176 Seiten. Relevante Formel-, Algorithmus-, System- und Pipeline-Seiten wurden zusaetzlich visuell geprueft. Eine Lecture-14-PDF ist im Ordner nicht vorhanden.
- Bewertungsstandard verschaerft: Eine Lecture-Quelle an einem Concept, einer Formel oder einer Mission ist nur Rueckverfolgbarkeit. Inhaltliche Abdeckung verlangt drei getrennte Nachweise: beginner-verstaendliche Erklaerung, nachvollziehbare Mechanik beziehungsweise Herleitung und Transfer auf einen neuen Fall.
- Staerken: Dense-Transformer-Datenfluss, Attention und Shapes, BPE-Kern, Cross-Entropy/AdamW, Roofline/Online Softmax, KV-Cache/Serving, MinHash/LSH, SFT/RLHF/DPO sowie Policy Gradient/GRPO-Grundmechanik sind bereits substanziell aufbereitet. Lecture 10 ist der derzeit am vollstaendigsten abgebildete Lecture-Block.
- Groesste Lecture-Luecken: Lecture 4 (MoE-Varianten, Routertraining, Capacity/Overflow und Systeme), Lecture 8 (Process Groups, NCCL/Gloo, DDP-Buckets, Async/Deadlocks und Codepfade), Lecture 11 (muP-Herleitung, parameterrollenspezifische Skalierung und WSD) sowie Lecture 16 (PPO/RLVR-Systeme, R1/Kimi/Qwen und Rollout-Infrastruktur).
- Assignment-Urteil: A1 ist wegen Initialisierung, exaktem RoPE, komponentengenauem Accounting und Streaming noch nicht vollstaendig vorbereitet; A2 wegen zweidimensionalem Triton, FlashAttention-Backward und exaktem Distributed Accounting nicht; A3 wegen `D_opt(C)`, Loss-Prognose und muP-Transfer nicht; A4 ist stark bei Dedup/Filtering, aber besitzt eine falsche Validation-Nuance; A5/A5-Supplement fehlen insbesondere Dr. GRPO/RFT/MaxRL/GSPO und ein objektiver SFT-zu-DPO-Systemtransfer.
- Klarer Korrektheitsbefund: A4 erlaubt die Nutzung der Paloma-Validation zur Filterentwicklung. Dadurch wird sie zur Development-Metrik; Kontamination ist insbesondere die woertliche Uebernahme in den Trainingskorpus. Die aktuelle Plattform vermischt diese Faelle und darf vor der Korrektur keine A4-Readiness behaupten.
- Der Deep Audit bestaetigt keine weiteren schwerwiegenden fachlichen Falschaussagen in den zentralen deutsch- oder englischsprachigen Erklaerungen. Die bestehenden Struktur- und Wortzaehlchecks messen Erklaerungstiefe, nicht Lecture-Vollstaendigkeit.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Lecture 14 vollstaendig integriert (manueller Run)

- Status: fachliche Integration und lokale Verifikation abgeschlossen; noch nicht committed oder deployed.
- Die neue 14-seitige PDF `Trace - lecture_14.pdf` wurde seitenweise per Text- und visueller PDF-Pruefung auditiert. Der Quellenbestand umfasst nun 17 Lectures mit zusammen 631 Seiten sowie sechs Assignment-Handouts mit 176 Seiten.
- Lecture 14 ist nicht nur verlinkt: KenLM und n-Gram-Perplexity, Kneser-Ney Smoothing, fastText, Data Selection via Importance Resampling (DSIR), Language Identification, Quality- und Toxicity-Filtering, exakte und approximative Deduplizierung, Bloom Filter sowie Jaccard, MinHash und Locality-Sensitive Hashing (LSH) wurden in Lernpfad, Concepts, Formeln, Symbolen, Glossar, Quiz, Coverage Map und Assignment-4-Bruecken integriert.
- Zwei objektiv gegatete Labs ergaenzt: `KenLM vs fastText vs DSIR` trennt Target-Likelihood, Class Probability und Density Ratio an denselben Toy-Dokumenten; der `Bloom Filter Simulator` leitet Bitbelegung, False-Positive-Wahrscheinlichkeit und die optimale Hashzahl her. Beide wiederholen Formel und Symbolbedeutung direkt im Anwendungskontext.
- Fachliche Fallstricke explizit korrigiert: KenLM liefert Logarithmen zur Basis 10; die Standard-False-Positive-Rate eines Bloom Filters wird ueber negative Queries definiert; ein Hash-Fingerprint beweist wegen moeglicher Kollisionen keine Identitaet; Assignment 4 unterscheidet exakte Line-Deduplication von repraesentativer Dokument-Deduplication; Validation darf fuer Filterentwicklung genutzt werden und ist dann eine Development-Metrik, waehrend ein unangetasteter Test fuer eine unabhaengige Schlussaussage erforderlich bleibt.
- Aktueller Bestand: 13 Module, 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossarbegriffe, 20 Labs, 19 Quizfragen und 29 Assignment-Missions mit allen 124 Problem-IDs. Deutsch und Englisch besitzen stabile IDs, damit bestehender Lernfortschritt durch die Erweiterung nicht verschoben wird.
- Verifiziert: Locale- und Semantikcheck fuer 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossareintraege, 20 Labs, 29 Missions und 1142 UI-Texte; JavaScript-Syntax, `git diff --check`, reproduzierbarer `_site`-Build und bytegleiche zentrale Build-Dateien. Der Build enthaelt weder PDFs/Notebooks noch administrative Secret-Marker.
- Browserpruefung in Deutsch und Englisch: beide neuen Labs, Methodenwechsel, Bloom-FPR jenseits des Optimums und Lecture-14-Quelle funktionieren. Bei 390 x 844, 768 x 1024 und 1024 x 768 Pixeln trat kein horizontales Ueberlaufen auf; alle sichtbaren Controls waren mindestens 44 Pixel hoch. iPhone und iPad-Portrait stapeln die Labspalten, iPad-Landscape zeigt sie zweispaltig; die Browserkonsole blieb ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle wurden auf Version 25 angehoben. Der lokale PDF-Link funktioniert; der Upload in den privaten Supabase-Bucket wurde nicht ausgefuehrt, weil `SUPABASE_URL` und `SUPABASE_SECRET_KEY` im Codex-Prozess nicht gesetzt waren.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-16 - Geplanter Deep Review des lokalen Version-12-Stands

- Status: Review abgeschlossen; keine App-Dateien geaendert. Vollstaendiger Report: `tmp/deep-review-2026-07-16.md`.
- Verifiziert: JavaScript-Syntax, Locale- und Semantikcheck fuer 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossareintraege, 20 Labs, 29 Missions und 1142 UI-Texte sowie Browser-Smoke-Test ohne Konsolenfehler.
- Lecture 14 ist mit 17 von 17 Lectures integriert. Das Bloom-Filter-Lab liefert fuer `m=100`, `n=10`, `k=7` eine exakte False-Positive-Rate von 0,839 Prozent; das objektive Transfer-Gate schaltet erst nach drei richtigen Antworten frei.
- Drei Empfehlungen des Vortags sind umgesetzt: Modul-00-Fragen im Quiz, lesbare Diagnose-Labels und sichtbarer Original-Handout-Scope pro Mission.
- P0-Befund: Das neue Abruftraining widerspricht der dokumentierten Kein-Termindruck-Entscheidung. Faelligkeits-Gate, Tagesanzeigen und Intervallversprechen werden durch jederzeit startbare, nach Lernbedarf priorisierte Sitzungen ersetzt. Zeitabstand bleibt ausschliesslich Evidenzkriterium fuer den hoechsten Concept-Level; ein spaeteres `Noch nicht` entzieht diesen Nachweis weiterhin.
- P1-Befund: Die Lecture Coverage Map zeigt weiterhin nur Zaehler und Links statt der drei getrennten Nachweise `erklaert`, `hergeleitet beziehungsweise mechanisch nachvollzogen` und `transfergeprueft`.
- Inhaltliche Reihenfolge des offenen Rests: zuerst A1-Initialisierung, exaktes RoPE, komponentengenaues Accounting und Streaming; danach Lecture 8/A2, Lecture 11/A3, Lecture 4/MoE und Lecture 16/A5.
- Der lokale Stand bleibt mit 4048 Insertions und 798 Deletions gegen `5c99f36` uncommitted und nicht deployed. Weitere App-Edits sollen deshalb eng abgegrenzt und vor einem Commit vollstaendig verifiziert werden.
- Der Iteration Counter wurde auf 1 erhoeht, weil dieser Review ueber einen geplanten Task gestartet wurde.

## 2026-07-16 - Pull-basiertes Abruftraining umgesetzt

- Status: P0 lokal umgesetzt und verifiziert; kein Commit und kein Deployment ausgefuehrt.
- Das Faelligkeits-Gate ist entfernt. Sobald mindestens ein Concept erklaert ist, kann jederzeit eine Sitzung mit bis zu zehn Karten gestartet werden. Die Reihenfolge ist jetzt fest: nie abgerufen, zuletzt `Noch nicht`, danach am laengsten ohne erfolgreichen Abruf. Alte `dueAt`-Werte bleiben wirkungslos.
- Dashboard und Abrufansicht zeigen neutralen Kartenbestand und Retention-Fortschritt. Deutsche und englische Bewertungsbuttons enthalten keine Minuten- oder Tagesversprechen mehr. Ohne erklaertes Concept fuehrt ein Inline-Hinweis direkt zum naechsten offenen Concept.
- Der Stufe-4-Nachweis bleibt erhalten: Der erste erfolgreiche Abruf setzt einen Evidenzanker; erst ein weiterer erfolgreicher Abruf nach mindestens 24 Stunden qualifiziert. Fruehes Ueben verschiebt den Anker nicht, `Schwer` erzeugt keine neue Evidenz und `Noch nicht` entzieht vorhandene Evidenz.
- Verifiziert: Locale- und Semantikcheck fuer 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossareintraege, 20 Labs, 29 Missions und 1139 UI-Texte; feste Regressionstests fuer Priorisierung, 24-Stunden-Grenze, Legacy-Daten und Evidenzentzug; JavaScript-Syntax, sauberer Diff und reproduzierbarer `_site`-Build.
- Browserpruefung in Englisch und Deutsch: Erstnutzer-Link, aktivierter Sitzungsstart, qualitative Bewertungsbuttons und sofortiger erneuter Sitzungsstart nach zwei `Gewusst`-Antworten funktionieren. Beide Browserzustaende blieben ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle wurden auf Version 27 angehoben. Der Iteration Counter bleibt 1, da diese Umsetzung manuell/interaktiv gestartet wurde.

## 2026-07-16 - Stufe 4 auf Sitzungen statt Uhr umgestellt

- Status: Nutzerentscheidung lokal umgesetzt und verifiziert. Der zuvor dokumentierte 24-Stunden-Anker ist vollstaendig supersediert; es gibt keine Mindestwartezeit mehr.
- Jede Abrufsitzung erhaelt eine eigene Sitzungs-ID. Eine Concept-Frage kann pro Sitzung hoechstens einmal mit `Gewusst` gutgeschrieben werden; zwei verschiedene selbst gestartete Sitzungen reichen auch dann, wenn sie unmittelbar nacheinander stattfinden. Zeitstempel dienen nur Sortierung und Verlauf.
- `Schwer` erhoeht den Abrufnachweis nicht und erhaelt den vorhandenen Stand. `Noch nicht` setzt den Nachweis der Karte zurueck und stuft ein zuvor bestaetigtes Concept effektiv wieder auf Stufe 3 herab. Legacy-Zustaende mit `streak` oder `retainedAt` bleiben kompatibel; alte `dueAt`- und `retentionAnchorAt`-Felder werden beim naechsten Bewerten entfernt.
- Die sichtbare Stufe 4 heisst jetzt `Abruf bestaetigt` beziehungsweise `Retrieval confirmed`. Dashboard, Concept-Seite, Abruftraining und Abschlussdialog erklaeren in Deutsch und Englisch: Sitzungen koennen direkt nacheinander stattfinden und haben keine Mindestwartezeit.
- Verifiziert: erstes `Gewusst` in Sitzung A bleibt bei einem Nachweis; ein doppelter Aufruf derselben Sitzung zaehlt nicht; Sitzung B schaltet auch bei identischem Zeitstempel frei; `Schwer`, `Noch nicht`, Legacy-Daten und Priorisierung besitzen feste Regressionstests.
- Browserpruefung auf frischem Profil: Sitzung 1 liess Stufe 4 gesperrt, die unmittelbar gestartete Sitzung 2 schaltete `Retrieval confirmed` frei, und ein anschliessendes `Again` entzog den Nachweis wieder. Deutsche und englische Texte waren korrekt; die Browserkonsole blieb ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle wurden auf Version 28 angehoben. Kein Commit und kein Deployment ausgefuehrt. Der Iteration Counter bleibt 1, da diese Korrektur manuell/interaktiv gestartet wurde.

## 2026-07-16 - Reale Sitzungsabstaende als reine Verlaufsinformation ergaenzt

- Status: Die nachgereichte Transparenzanforderung ist lokal umgesetzt und statisch vollstaendig verifiziert; kein Commit und kein Deployment ausgefuehrt.
- Pro Concept-Selbstcheck werden Zeitpunkt und Sitzungs-ID des ersten `Gewusst`-Nachweises eingefroren. Das zweite `Gewusst` aus einer anderen selbst gestarteten Sitzung setzt den Bestaetigungszeitpunkt; spaetere erfolgreiche Uebung verschiebt keinen der beiden Evidenzzeitpunkte.
- Ein bestaetigtes Concept zeigt auf seiner Detailseite einen neutralen `Lernverlauf` beziehungsweise `Learning history` mit dem tatsaechlich beobachteten Abstand je Selbstcheck in Minuten, Stunden oder Tagen. Der Abstand ist nur Information und weder Mindestwert noch Gate; direkt aufeinanderfolgende Sitzungen erscheinen ehrlich als `unter 1 Minute` beziehungsweise `under 1 minute`.
- Legacy-Zustaende uebernehmen einen gueltigen `retentionAnchorAt` als ersten Erfolgszeitpunkt. Fehlt bei einem aelteren bestaetigten Nachweis einer der beiden Zeitpunkte, zeigt die Oberflaeche `Abstand nicht gespeichert`, statt einen Wert aus `firstAt` oder `lastGoodAt` zu schaetzen. `Noch nicht` loescht Nachweis und Verlauf weiterhin vollstaendig.
- Die Session-Grenze ist fail-closed: Ohne echte Sitzungs-ID erzeugt auch ein beliebig grosser Zeitabstand keinen Nachweis. Regressionen decken dieselbe Sitzung nach zwei Tagen, eine andere Sitzung bei identischem Zeitpunkt, eingefrorene Anker, `Schwer`, `Noch nicht`, Legacy-Migration, unbekannte oder rueckwaerts laufende Zeitpunkte sowie deutsche und englische Formatierung ab.
- Verifiziert: Locale- und Semantikcheck fuer 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossareintraege, 20 Labs, 29 Missions und 1139 UI-Texte; Inline-JavaScript, Sprachbundle, Testskript und Service Worker parsen; `git diff --check` ist sauber; der reproduzierbare `_site`-Build ist bei allen kopierten Kernassets bytegleich und enthaelt keine PDFs oder Notebooks.
- Ein erneuter interaktiver Browserlauf fuer die neue Abstandsanzeige war in diesem Run extern blockiert: Der lokale Server durfte wegen des erreichten Freigabe-Limits keinen Port oeffnen, und die direkte `file://`-Vorschau wurde von der Browser-URL-Richtlinie abgelehnt. Der zuvor erfolgreich gepruefte v28-Sitzungsflow bleibt unveraendert; die neue v29-Darstellung ist deshalb in diesem Run statisch, nicht erneut visuell, verifiziert.
- Service-Worker-Cache und Sprachbundle wurden auf Version 29 angehoben. Der Iteration Counter bleibt 1, da diese Umsetzung manuell/interaktiv gestartet wurde.

## 2026-07-16 - A1-Initialisierung, exaktes RoPE und Memory-Mapped Tokenbatches

- Status: Die drei spezifizierten A1-Inhaltsluecken sind lokal umgesetzt und im Browser verifiziert; kein Commit und kein Deployment ausgefuehrt.
- Der vom Nutzer auf frischem Profil nachgeholte v29-Browsernachweis schliesst den vorherigen statischen Rest: zwei unmittelbar aufeinanderfolgende Sitzungen schalten `Retrieval confirmed` ohne Wartezeit frei, `observed gap under 1 minute` bleibt reine Information und `Again` entzieht den Nachweis. Das Termindruck-Thema ist damit fachlich und interaktiv abgeschlossen.
- Ein neues Concept `Parameterinitialisierung fuer A1` und die Formelkarte `A1-Parameterinitialisierung` erklaeren die Handout-Regeln aus Abschnitt 3.3.1: Linear-Varianz `2/(d_in+d_out)` wird vor `trunc_normal_` zur Standardabweichung gewurzelt und auf `[-3sigma,3sigma]` begrenzt; Embeddings verwenden `std=1` und `[-3,3]`; der RMSNorm-Gain startet bei eins. Die Texte warnen davor, nach Truncation eine exakt empirische Varianz zu erwarten.
- RoPE ist jetzt A1-exakt: `theta_(i,k)=i/Theta^((2k-2)/d)`, benachbarte Paare `(2k-1,2k)` beziehungsweise `[0,1],[2,3],...`, Q/K vor `QK^T`, V unveraendert. Half-Split wird als testbrechende andere Konvention benannt; ein einziges geteiltes Modul haelt Sinus/Kosinus als `register_buffer(..., persistent=False)` und besitzt dafuer keine lernbaren Parameter.
- Das bestehende Python-Concept und die neue Formelkarte fuer Next-Token-Batches decken flache Token-Arrays, B zufaellige Starts aus `{0,...,n-m-1}`, die Slices `X=x[s:s+m]` und `Y=x[s+1:s+m+1]`, `np.memmap` beziehungsweise `np.load(..., mmap_mode='r')`, exakten gespeicherten dtype, Vokabular-Sanity-Checks und den exklusiven Off-by-one-Rand `n-m` ab. Die A1-Missions `tensor-primitives` und `training-state` verknuepfen diese Nachweise explizit.
- Regressionen in `scripts/check-i18n.mjs` schuetzen beide Sprachen gegen semantischen Drift bei Standardabweichung/Varianz, Initialisierungsgrenzen, RoPE-Division, Adjacent- statt Half-Split-Pairing, Shared-Buffer-Lifecycle, Memory Mapping, dtype, Startindex und Targetverschiebung. Der Bestand umfasst nun 65 Concepts und 72 Formeln; 71 Symbole, 70 Glossareintraege, 20 Labs und 29 Missions bleiben unveraendert.
- Verifiziert: `node scripts/check-i18n.mjs`, JavaScript-Syntax, `git diff --check` und reproduzierbarer `_site`-Build sind gruen. Browserpruefungen zeigen alle drei Inhalte auf Deutsch und Englisch, erhalten die geoeffnete Seite beim Sprachwechsel und erzeugen bei mobiler Breite weder Seiten- noch Formelueberlauf; die Konsole blieb ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle wurden auf Version 30 angehoben. Der Iteration Counter bleibt 1, da diese Umsetzung manuell/interaktiv gestartet wurde.

## 2026-07-16 - Coverage-Nachweise und restliche Assignment-Cluster geschlossen

- Status: Die konkret offenen Luecken fuer Coverage Map, A1, A2, A3, MoE und A5 sind lokal umgesetzt und verifiziert; kein Commit und kein Deployment ausgefuehrt.
- Die Coverage Map zeigt fuer jede der 17 Lectures genau drei explizite, direkt oeffnende Nachweise: beginner-freundliche Erklaerung, Formel beziehungsweise Mechanik und objektiven Transfer. Jeder Eintrag nennt den seitengenauen Lecture-Anker; die alten Concept-, Formel- und Lab-Zaehler sind entfernt und regressionsgeschuetzt.
- A1 ergaenzt das vollstaendige Parameter- und Forward-FLOP-Ledger. Das feste Gate prueft fuer `V=1000`, `D=64`, `F=192`, `L=3`, `T=32` exakt `288192` Parameter, `3670016` FLOPs pro Block und `15106048` Gesamt-FLOPs.
- A2 ergaenzt zweidimensionale Triton-Grid-, Masken- und Partial-Buffer-Vertraege, FlashAttention-Backward mit `Drow`, `P`, `dS`, `dQ`, `dK`, `dV` und Zeilensummen-Invariante sowie Distributed Runtime mit Process Groups, World Size, Global Batch, Async-Lifetime, Collective-Reihenfolge, Ring-Volumen und overlap-bewusstem Critical Path.
- A3 ergaenzt `N_opt(C)`, `D_opt(C)` und `L_opt(C)` mit Offset-Fit und Sensitivitaet, die Lecture-11-Rollenregeln der Maximum Update Parametrization (muP) sowie die Finalitaetsgrenze von Warmup-Stable-Decay (WSD). MoE trennt Top-k-Normalisierung, Expert Capacity, Overflow, Auxiliary Loss und Device-Auslastung.
- A5 unterscheidet Standard-, Constant-, Dr.-GRPO-, Reinforce-Like Fine-Tuning- und MaxRL-Varianten, exakte Sequenzgewichte und den stabileren Group-Sequence-Policy-Optimization-Surrogate (GSPO), erklaert den RLVR-Systemzyklus und prueft Response-Masken sowie die vier Policy-/Reference-Log-Probabilities von Direct Preference Optimization (DPO).
- Verifiziert: `scripts/check-i18n.mjs` schuetzt 17 Lecture-Einheiten, sechs neue objektive Gates, feste Antwortschluessel und numerische Invarianten in beiden Sprachen. Der Browser belegte Lecture 2 und Lecture 16 mit den drei Nachweisarten, bestand die A1- und A5-Gates, erhielt Antworten und Ergebnis beim Sprachwechsel, zeigte bei 390 x 844 Pixeln keinen horizontalen Ueberlauf und meldete keine Fehler oder Warnungen.
- Der Bestand umfasst 71 Concepts, 79 Formeln, 71 Symbole, 70 Glossareintraege, 26 Labs, 29 Missions und 1139 UI-Texte. Service-Worker-Cache und Sprachbundle stehen auf Version 31. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-07-16 - Deep Review und Coverage-Quellenfehler korrigiert

- Status: Review, Korrektur und lokale Verifikation abgeschlossen; fuer Commit und Push freigegeben.
- Der Review fand fuenf konkrete Traceability-Verletzungen in drei Lecture-Zeilen: Das Lecture-2-Accounting-Lab zeigte seine Lecture-2-Quelle nicht; Lecture 13 verwendete faelschlich die erst in Lecture 14 behandelte DSIR-Formel; und die drei DPO-Nachweise fuer Lecture 15 nannten Lecture 15 nicht beziehungsweise oeffneten ein allgemeines Evaluation-Lab.
- PDF-Abgleich: Lecture 13, Seiten 5 bis 7 behandeln Crawl-, CCNet-, C4- und GPT-3-Filterpipelines, nicht DSIR. Lecture 15, Seiten 54 bis 56 fuehren von Alternativen zu PPO direkt in DPO und dessen RLHF-Herleitung.
- Korrektur: Lecture 13 zeigt nun Webdaten-Pipeline, Quality-Filtering-Mechanik und Datenpipeline-Transfer auf Seiten 1 bis 7. Lecture 15 verknuepft DPO-Concept, DPO-Formel und den vorhandenen DPO-Systemtransfer. Die betroffenen Module, das DPO-Concept und die DPO-Formel nennen die jeweiligen Lectures sichtbar als Quellen.
- `scripts/check-i18n.mjs` prueft jetzt fail-closed, dass jeder der 51 Coverage-Nachweise seine behauptete Lecture als Quelle fuehrt. Objektive Labs pruefen zusaetzlich eindeutige und zwischen Deutsch und Englisch identische Option-IDs.
- Verifiziert: Locale-/Semantikcheck, JavaScript-Syntax, sauberer Diff und Browser-Smoke fuer alle sechs neuen Gates. Die Coverage Map besitzt 17 Zeilen und 51 aufloesbare Nachweisbuttons; die korrigierten Lecture-2-, Lecture-13- und Lecture-15-Ziele zeigen ihre Quelle im Browser. Desktop und 390-Pixel-Ansicht laufen ohne horizontalen Ueberlauf, die Browserkonsole bleibt ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle stehen auf Version 32. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-07-16 - Beginner-first Orientierung und aufgeteilte Datenpipeline

- Status: Die beanstandete fehlende Einordnung der Concept-Texte ist lokal systemisch korrigiert und statisch sowie im Browser verifiziert; Commit, Push und Deployment stehen noch aus.
- Alle 72 Concepts beginnen nun vor Mental Model und Schrittfolge mit drei direkt sichtbaren Antworten: Worum geht es, wo liegt das Thema in der gesamten Lern- oder Ausfuehrungskette, und welche konkrete Fehlfolge verhindert das Wissen. Direkte Deep Links setzen keinen vorherigen Seitenbesuch voraus.
- Der ueberladene Python-Block wurde getrennt: `Python-Datenvertraege` fuehrt von Rohdokumenten ueber `str`, UTF-8-Bytes und Streaming bis zur verlaesslichen Tokenizer-Eingabe; das neue Concept `token-array-loading` beginnt erst bei den gespeicherten Token-IDs und endet bei den um eins verschobenen PyTorch-Batches. Counter und reguläre Ausdruecke nennen jetzt ihre konkrete Rolle beim Paarzaehlen und bei der Pretokenisierung.
- Explizite Primer erklaeren auf der Beispielseite unter anderem Byte-Pair Encoding (BPE), Unicode, UTF-8, Iterator/Generator, Counter, regulaere Ausdruecke und Input/Output (I/O). Das Batch-Concept definiert Token-ID, Batch, Kontextlaenge, Input/Target, Memory Mapping, NPY, dtype und `torch.long`, bevor Formeln oder Slices erscheinen.
- Die vorherige automatische Glossarsuche ueber beliebige Teilwoerter ist entfernt. Eine kontrollierte zweisprachige Abkuerzungsliste und lokale Concept-Begriffe speisen die sichtbaren maximal acht Primer; das Matching ist bei Akronymen gross-/kleinschreibungssensitiv. Dadurch kann `Zero-shot` nicht mehr den unpassenden `ZeRO`-Eintrag ausloesen.
- Der Token-Dateivertrag ist fachlich nachgeschaerft: dtype und Byte-Reihenfolge gehoeren zum Rohformat, `V-1<=np.iinfo(dtype).max` wird vor dem Cast geprueft, und ein bereits als `uint16` ueberlaufener Wert wird nicht faelschlich durch einen spaeteren Range-Check als sicher bewertet. Ein noetiger Vollscan erfolgt bewusst stueckweise; `min(x)` und `max(x)` werden nicht im normalen Batchpfad ausgefuehrt. Die Slice-Invariante ist eindeutig pro Beispiel als `Y_b[:-1]=X_b[1:]` notiert.
- Vier vorhandene Lernpfad-Reihenfolgen folgen nun ihren Voraussetzungen: Kernel-Vertraege vor FlashAttention, Distributed Runtime vor Collectives, Skalierungsoptima vor praktischer Skalierung sowie Off-Policy-Grundlagen vor GRPO-Varianten.
- Verifiziert: Locale-/Semantikcheck fuer 72 Concepts, 79 Formeln, 71 Symbole, 70 Glossareintraege, 26 Labs, 29 Missions und 1144 UI-Texte; JavaScript-Syntax, sauberer Diff und reproduzierbarer `_site`-Build. Browserchecks belegen Deutsch und Englisch, direkte Concept-Routen, Sprachwechsel ohne Routenverlust, korrekte Primer, 390-Pixel-Layout ohne horizontalen Ueberlauf und keine unpassende `ZeRO`-Erklaerung bei `Zero-shot`.
- Service-Worker-Cache und Sprachbundle stehen auf Version 35. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-07-17 - Lecture-first-Neukonzeption ohne Schein-Evidence (manueller Run)

- Status: Die Neukonzeption und lokale Verifikation sind abgeschlossen.
- Der kanonische Lernweg folgt jetzt Lectures 1 bis 17 statt 13 internen Modulen. Jede Lecture besitzt eine eigene zweisprachige Seite mit einfacher Einordnung, konkreter Relevanz, Lernzielen, lokal erklaerten Voraussetzungen, kuratierten Kernkonzepten, Formeln samt Symbolen und Beispielen, passenden Experimenten sowie dem Original-PDF mit korrigiertem Seitenanker.
- Freitext-Evidence, Mission- und Modul-Gates, manuelle Concept-Level, pauschale Lab-Haken, Hypothesen-Freischaltungen und der sichtbare `Learn -> Recall -> Apply`-Vertrag sind entfernt. Alte Zustandsfelder bleiben ausschliesslich zur verlustfreien Synchronisations- und Downgrade-Kompatibilitaet erhalten und werden nicht mehr als Kompetenz ausgewertet oder angezeigt.
- Assignment 1 bis 5 zeigen die 29 Handout-Zuordnungen als erklaerende Themenbloecke mit Original-Scope, benoetigter Idee, Pruefstrategie, Fehlerspur, Meilensteinen und direkt zugaenglichen Hinweisen. Es gibt keine Zeichenlaengen- oder Checkbox-Readiness mehr.
- Der optionale Grundlagencheck verwendet nur feste Multiple-Choice-Antworten, schaltet nichts frei und empfiehlt lediglich Auffrischungen. Abrufbewertungen sortieren nur weitere Uebungskarten. Labs ohne festen Antwortschluessel behaupten keinen Abschluss; objektive Kurzchecks bleiben lokales Feedback fuer genau die gepruefte Aufgabe.
- Der fachliche Quellenabgleich korrigiert insbesondere die Lecture-Anker fuer Lectures 1, 5, 7, 9, 13, 14, 15 und 16, entfernt FlashAttention-Backward aus Lecture 5 und ergaenzt das Alignment-Symbol `beta`. Lecture 16 erklaert Policy Gradient lokal als Voraussetzung, statt dieses Vorwissen stillschweigend anzunehmen.
- Verifiziert: `scripts/check-i18n.mjs` prueft 17 vollstaendige zweisprachige Lecture-Guides, 72 Concepts, 79 Formeln, 72 Symbole, 70 Glossareintraege, 26 Labs, 29 Handout-Zuordnungen und 1047 aktive UI-Texte. Inline-JavaScript, reproduzierbarer `_site`-Build und `git diff --check` sind sauber. Der Browser oeffnet alle 17 Lecture-Seiten mit Kontext, Relevanz, Lernzielen und erklaerten Voraussetzungen; direkte Voraussetzung- und Concept-Links behalten den jeweiligen Lecture-Kontext. Deutsch und Englisch, Lecture 5 ohne FlashAttention-Backward, der reine Multiple-Choice-Grundlagencheck, optionale Notizen ohne Wertung sowie 390 x 844 Pixel ohne horizontalen Ueberlauf sind geprueft. Die Konsole blieb ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle stehen auf Version 38. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-07-17 - Beispiel-vor-Formel-Redesign (manueller Run)

- Status: Der didaktische Darstellungsvertrag und die vollstaendige lokale Abschlussverifikation sind abgeschlossen; Commit, Push und Produktionspruefung erfolgen unmittelbar in diesem Run.
- Formelerklaerungen folgen verbindlich der Reihenfolge `konkretes Problem und praktischer Zweck -> Namen und Symbole in Alltagssprache -> kleines vollstaendig gerechnetes Zahlenbeispiel -> allgemeine Formel -> Intuition und Fallstrick`. Damit kann die Kursnotation nicht mehr vor ihrer Bedeutung und einem nachvollziehbaren Fall erscheinen.
- Geschlossene Formelkarten zeigen Titel, sofortige Abkuerzungserklaerungen und den praktischen Zweck, aber keine Gleichung. Geoeffnete Formelvertiefungen und Lab-Primer stellen Erklaerung und Zahlenbeispiel vor die allgemeine Formel.
- Conceptseiten ohne kuratierte Formel beginnen vor den technischen Details mit einer konkreten Frage und ihrer nachvollziehbaren Erklaerung; damit faellt der Beispielschritt auch in prozesslastigen Lectures nicht leer aus.
- Conceptseiten im Kontext einer Lecture zeigen nur die fuer diese Lecture kuratierten Formeln. Verknuepfte Concepts koennen dadurch keine weiteren, fuer die Lecture nicht ausgewaehlten Gleichungen einschleusen.
- Assignment 1 bis 5 erklaeren ihre Voraussetzungen vor den Themenbloecken in einfachen Worten und mit Beispielen. Konzept- und Formelwege stehen vor der technischen Aufgabenreferenz; der rohe Handout-Scope erscheint zuletzt.
- Die in der Lecture-first-Neukonzeption entfernte Freitext-Evidence bleibt entfernt. Freie Eingaben, Seitenaufrufe, Klicks und manuelle Haken erzeugen weiterhin weder Kompetenznachweis noch Readiness.
- Verifiziert: Alle 79 Formelkarten besitzen in beiden Sprachen einen Zahlenfall mit sichtbarer Rechnung und Ergebnis; der Regressionstest deckt Reihenfolge, Symbolerklaerungen, geschlossene Karten, Lecture-Kuratierung und alle 29 Assignment-Themen ab. Im Browser folgen Parameterinitialisierung und Assignment 1 dem neuen Erklaerpfad, enthalten keine Schein-Evidence und laufen bei 390 x 844 Pixeln ohne horizontalen Ueberlauf; die Konsole blieb ohne Fehler oder Warnungen.
- Ein abschliessender Sprachreview fand noch stillschweigend vorausgesetzte Operatoren sowie vier zu knapp gerechnete Beispiele. Die zentrale Notationshilfe erklaert nun unter anderem `~`, `N(...)`, `∈` und `√` vor der Regel; Parameterinitialisierung zeigt die vollstaendige Einsetzung `2/(d_in+d_out)=2/(2+6)=2/8`, und Linear Layer, Residualupdate sowie MFU rechnen jeden Schritt sichtbar aus. Geschlossene Karten schreiben alle im Zweck verwendeten erkannten Abkuerzungen aus.
- Service-Worker-Cache und Sprachbundle werden auf Version 41 angehoben. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-07-29 - Vollstaendige Seitenposition innerhalb einer Lecture (manueller Run)

- Status: lokal umgesetzt und verifiziert; kein Commit, Push oder Deployment ausgefuehrt.
- Produktionsdiagnose: Commit `be6b6c7` und Service-Worker-Version 51 waren bereits live, zaehlten aber nur die drei Kernkonzepte von Lecture 1. Vorgeschaltete Lernseiten konnten deshalb weiterhin ohne Seitenzahl erscheinen.
- Die Seitenfolge umfasst nun alle navigierbaren Konzeptseiten einer Lecture: zuerst Voraussetzungskonzepte, die nicht ohnehin Kernkonzept sind, danach die kuratierten Kernkonzepte ohne Duplikate. Jede Seite zeigt direkt in der Kopfzeile `Lecture N · Seite X / Y · Level`.
- Ein kompakter segmentierter Streifen wiederholt die Seitenzahl und markiert genau die aktuelle Seite, ohne vorherige Seiten als abgeschlossen darzustellen. Der Weiter-Button nennt die kommende Seitenzahl, beispielsweise `Naechste Seite · 3 / 4`.
- Deutsch und Englisch sind vollstaendig abgedeckt. Ein Regressionstest sichert die deduplizierte Lecture-Seitenfolge, Kopfzeile, Positionsstreifen, aktuelle Segmentmarkierung und Seitenzahl im Weiter-Button.
- Verifiziert: Locale- und Semantikcheck fuer 75 Concepts, 79 Formeln, 72 Symbole, 70 Glossareintraege, 27 Labs, 29 Missions und 1102 UI-Texte; Inline-JavaScript und Service Worker parsen; reproduzierbarer `_site`-Build und `git diff --check` sind sauber.
- Browserpruefung: Lecture 1 zeigt im vollstaendigen Ablauf korrekt `1 / 4`, `2 / 4`, `3 / 4` und `4 / 4`; der Weiter-Button wechselt von der vorgeschalteten Seite 1 auf Seite 2. Deutsch und Englisch, 390 x 844 Pixel ohne horizontalen Ueberlauf und eine leere Fehler-/Warnungskonsole wurden geprueft.
- Service-Worker-Cache und Sprachbundle stehen auf Version 52. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-08-27 - Der Test, den A1 nennt, hat nie jemand laufen lassen (geplanter Deep Review, v85)

- Gegenprobe zum vermuteten Hebel aus v84: alle 375 numerischen Strings deutsch gegen englisch geprueft, genau eine echte Abweichung gefunden. Der Hebel war praeventiv, nicht kurativ.
- Befund stattdessen ueber die eigenen Guards: 11 der 124 Probleme werden ueber den Lecture-Pfad nie erreichbar, 9 davon in A1. `causal-mask` entscheidet zwei der groessten A1-Probleme, wird von keiner Lecture gelehrt und war das einzige Selbststudium-Konzept ohne Lab.
- Neues Lab `causal-invariance`: fuenf Maskenvarianten gegen drei Tests. Der Test, den A1s Mission selbst nennt, findet eine von vier; "nach Softmax maskiert" ist vollkommen kausal, und die vergessene Diagonale mit endlichem Platzhalter ist nur bei voller Testtiefe zu sehen (12 von 15 Sondenpositionen sind fuer die enge Lesart blind). Grund hergeleitet: softmax(x+c) = softmax(x), also gibt eine voll maskierte Zeile die unmaskierte Verteilung zurueck.
- Modus B rechnet die bisher nur behauptete Leakage-Folge: die korrekte Maske hat bei jeder Sequenzlaenge den hoechsten Loss aller fuenf Varianten. Der Loss ordnet frische Implementierungen falsch.
- Selbststudium-Abschnitt bietet jetzt zu fuenf von sechs Konzepten das Lab an, das sie durchrechnet.
- Repo-weiter Guard `english numerals` ueber Ziffernfolgen: 372 Strings, 1.293 Folgen beidseitig identisch.
- Pruefung: alle Guards gruen (41 s), render coverage 6.757 auf 7.657 Zustaende ueber 12 Labs, beide Sprachen headless ueber 420 Zustaende, 612 DOM-IDs ohne Duplikat. Mutationstest 19 Mutationen; der erste Lauf war durch gleichzeitige Edits ungueltig und wurde wiederholt, die eine Entkommene (Invarianzschwelle) als inert nachgewiesen und ihre Marge direkt geguardet.

## 2026-08-31 - Die Formelkarte, zu der der Weg nicht fuehrt (geplanter Deep Review, v89)

- Kettenkopf war nicht der zugewiesene Worktree: dieser stand auf `4067294`, der Kopf auf `01764fe` (v88). Fast-Forward statt Merge, keine fremde Session aktiv.
- Zwei Gegenproben ohne Befund: die Guard-Zeile "50 of 124 with adapter/test handles" ist kein Loch (48 der 58 Code-Probleme tragen sie, die zehn uebrigen sind Skript-/Experimentprobleme ohne Adapter im Handout), und `lm-objective` entscheidet laut `PROBLEM_CONCEPTS` 0 der 124 Probleme, bleibt also zu Recht hinten einsortiert.
- Befund: Wer Lecture 1 bis 17 durchgeht, erreicht nur 68 der 79 Formelkarten. Elf liegen ausserhalb beider Renderflaechen (Lecture-Seite und gefilterte Konzeptseite) und sind nur ueber Tafelwerk oder Assignment-Seite zu finden - also am Problem statt davor. Darunter `mfu`, an dem 14 Handout-Probleme mit 56 Punkten haengen, und die gesamte Filter-Haelfte von Lecture 14.
- Ursache: `conceptFormulaIds` filtert die Formeln eines Konzepts auf die kuratierte Liste der Lecture; vier Lectures fuehrten eine unvollstaendige Liste. Die Karten selbst waren vollstaendig und zweisprachig vorhanden.
- Alle 17 Quell-PDFs im Volltext geprueft: neun der elf Karten werden von der Lecture, die ihr Konzept fuehrt, woertlich hergeleitet (L02 hat fuer MFU eine eigene Abschnittsueberschrift, L10 rechnet `intensity == S*T / (S + T)`, L14 hat die Abschnitte `fasttext_main()` und `dsir_main()`). Die restlichen zwei gehoeren nicht auf den Pfad: "gradient clip" hat in allen siebzehn PDFs null Treffer.
- Unabhaengige Bestaetigung aus den Daten der App: alle zwoelf Karten nannten in ihrem eigenen `sources`-Feld bereits genau die Lecture, auf die die PDFs sie legen; die beiden off-path-Karten nennen `a1` und keine Lecture.
- Geaendert: die kuratierten Formellisten von L02 (4 auf 8), L03 (8 auf 9), L10 (3 auf 7) und L14 (4 auf 7). Erreichbar auf dem Pfad jetzt 77 von 79, ohne dass eine Karte ihre Erreichbarkeit verliert.
- Drei Arbeitsbeispiele wechseln dadurch auf die Gleichung, die ihre Lecture wirklich herleitet: L02 `resource-accounting` von 12*L*d^2 (A3s Formel, in keiner Lecture) auf 6ND, L02 `training-loop` auf `mfu`, L03 `probability` auf `softmax`.
- Neuer Guard-Block `lecture formulas`: rechnet die Erreichbarkeit mit `lectureLearningPages` und `conceptFormulaIds` der App selbst (per `sliceDeclaration` geschnitten, nicht nachgetippt), haelt beide Renderflaechen und den Primer-Fallback im Quelltext fest, bindet die zwei Ausnahmen daran, dass `causal-mask` und `clipping` Konzepte ohne Lecture bleiben, und nagelt sechs Arbeitsbeispiele fest.
- Der Mutationstest zeigte, dass das Repo die eine Richtung laengst prueft ("wer kuratiert, muss zitieren"); die fehlende Gegenrichtung - "wer eine Lecture zitiert, muss auf dem Pfad erscheinen" - schliesst dieser Block.
- Pruefung: Guard-Suite 36 auf 37 Bloecke, gruen. Mutationstest 13 echte Mutationen, 0 entkommen, Kontrolle gruen. Alle zwoelf neu kuratierten Karten inhaltlich vollstaendig und zweisprachig. Zwei abgeschossene Vordergrund-Mutationslaeufe liessen je eine Mutation im Arbeitsbaum stehen; beide wurden per `git diff` sofort bemerkt und zurueckgesetzt.
- Kein Cache-Bump noetig: `index.html` wird network-first ausgeliefert, `i18n-en.js` ist unveraendert.

## 2026-09-02 - Die Voraussetzung, die auf einen Link zeigte, den es nicht gab (geplanter Deep Review, v91)

- Kettenkopf war wieder nicht der zugewiesene Worktree: dieser stand auf `4067294`, der Kopf auf `276dcb9` (v90). Fast-Forward statt Merge, keine fremde Session aktiv, Baseline 38 Guard-Bloecke gruen.
- Gegenprobe ohne Befund: die vier reinen Rechenaufgaben aus A2 §8 (`data_parallel_calcs`, `fsdp_calcs`, `tp_calcs`, `fsdp_tp_calcs`, zusammen 16 Punkte bei null GPU-Stunden) rechnet `comm-crossover` vollstaendig durch, inklusive 2D-Schranke als Produkt der Einzelschranken und dem Viertel davon bei geteilter Leitung.
- Befund, schaerfer als die Kennzahl aus v90: die Assignment-Seite verspricht im eigenen Fliesstext „Oeffne ein verknuepftes Konzept nur, wenn du mehr Details brauchst" - und `assignmentPrerequisitesMarkup` rendert kein einziges `data-open-concept`. 18 von 18 Karten ohne Link, waehrend 45 von 45 Lecture-Voraussetzungen ihn tragen.
- Gebaut: 39 Konzeptlinks auf 33 Konzeptseiten, in der Reihenfolge, in der die Karte ihre Ideen nennt. Jeder Link traegt ein Wort, das Karte und Konzeptseite woertlich teilen (`state_dict`, `All-Reduce`, `Speicherhierarchie`, `MinHash`, `Lograum`, `Kettenregel`, `Residu`, `Unsicherheit`). Wo kein Anker existierte, wurde nicht verlinkt: „Holdout", „Confounder" und „Multiprocessing" haben in keinem der 75 Konzepte einen Treffer und bleiben in der Kartenprosa erklaert.
- Jeder Knopf sagt zusaetzlich, wo die Idee zu Hause ist: `Lecture N`, `Modul 00` oder `Selbststudium` - 31 / 7 / 1. Das ist die Zeitersparnis: wer den Pfad gegangen ist, geht an 31 der 39 vorbei. Die Dreiteilung ist genau die, die der Selbststudium-Abschnitt derselben Seite schon benutzt.
- Neuer Guard-Block `assignment prerequisites` (298 Checks): beide Richtungen der Zuordnung, alle 78 Knoepfe als vollstaendiges Markup-Fragment aus dem echten Render zurueckgelesen (beide Sprachen), Reihenfolge, `accordion-actions`-Zeile als Kasten, Ortsschild fuer alle 75 Konzepte zweitens hergeleitet, alle drei Zweige muessen vorkommen, Ziffern und geschriebene Shapes beidseitig.
- Die Deutscherkennung laeuft hier ohne Umlautklasse, weil die a1-Karte „ä" absichtlich als Beispiel fuer ein Zeichen mit zwei UTF-8-Bytes zitiert; der Guard prueft vorher, dass die Klasse in der geteilten Regex noch am Anfang steht, und beweist per deutschem Kontrollrender, dass der Rest noch Deutsch sieht.
- Mutationstest: 24 echte Mutationen, 0 entkommen, Kontrolle in allen fuenf Laeufen gruen. Drei Entkommene aus fruehen Runden wurden behandelt: Knoepfe ausserhalb der Aktionszeile (Guard verschaerft), geaenderte Ziffer im englischen Kartentext (v84s Ziffernregel jetzt auch hier, erweitert um Shapes wie `[B,T,D]`), und ein Synonymtausch im englischen `explain` als bewusste Grenze dokumentiert - Uebersetzungstreue hat im Repo keinen Pruefer, ausgeschriebene Zahlen braeuchten ein Woerterbuch.
- Pruefung: Guard-Suite 38 auf 39 Bloecke, gruen (46 s), `node scripts/build-site.mjs` gruen. Kein Cache-Bump noetig, `i18n-en.js` unveraendert.
- Neuer groesster offener Hebel, dabei gemessen: eine Konzeptseite bietet kein einziges Experiment an. `data-open-lab` kommt im ganzen Markup viermal vor, `renderConceptDetail` ist keine dieser Stellen. Genau deshalb baut sich der Selbststudium-Abschnitt seinen eigenen Uebungsknopf ueber `SELF_STUDY_LABS`. `LABS` traegt kein `concepts`-Feld; das ist die Datenluecke, die zuerst zu schliessen ist.

## 2026-09-03 - Zwei Loader in einem Assignment, und die Konzeptseite beschrieb den falschen (geplanter Deep Review, v94)

- Kettenkopf war wieder nicht der zugewiesene Worktree: dieser stand auf `4067294`, der Kopf auf `b056c10` (v93) in `lucid-turing-e88a7f`. Fast-Forward statt Merge; die fremde Session war zuletzt am 02.09. aktiv, ihr Arbeitsbaum traegt eine ungebundene Aenderung, die nicht angefasst wurde. Baseline 43 Guard-Bloecke gruen (50 s).
- Gegenprobe zuerst: alle 124 Handout-Probleme gegen `PROBLEM_CONCEPTS` und `LAB_CONCEPTS`. Nur drei Probleme haben ueberhaupt kein Lab (`a4:mask_pii`, `a5:look_at_sft`, `a5:sft`), zusammen 13 Punkte - davon 10 auf dem Konzept `sft`, an dem ausserdem `a5:data_loading` und alles Nachgelagerte bis DPO haengt.
- Befund im Handout selbst (A5-Supplement §4.2.1, per `pdftotext` gelesen): der SFT-Loader verkettet alle Dokumente zu einem Tokenstrom, trennt mit dem Endetoken, schneidet Bloecke der Laenge m und wirft den unvollstaendigen Rest weg. `__getitem__` gibt genau `input_ids` und `labels` zurueck - kein Maskenfeld -, und der Trainingscode ist `F.cross_entropy` ueber alles. Die Konzeptseite `sft` beschrieb daneben das Lehrbuchrezept: Antwortmaske und blockdiagonale Aufmerksamkeit, woertlich "ohne dass sich die Gespraeche gegenseitig beeinflussen". Beides stand nebeneinander, keine Zahl dazu.
- Die response_mask der App gehoert nachweislich zum anderen Loader: `tokenize_prompt_and_output` aus A5 §5 (RLVR) verlangt sie ausdruecklich. Zwei Loader, dasselbe Assignment.
- Neues Lab `sft-packing` (Modul `alignment`, 17 min, zwei Modi). Modus A rechnet die Lossmasse: im Beispiel der Konzeptseite selbst (500 Prompt-, 100 Antworttokens) entfallen 84,0442 % der Zielpositionen auf Template und Prompt, Verhaeltnis 5,2673 zu 1, waehrend ein maskierter Loss ueber 101 Positionen liefe. Der Anteil ist eine Eigenschaft des Korpus, nicht des Verfahrens (41,1207 % bei UltraChat-Laengen) und haengt mit hoechstens 4,0582 Punkten an der Templategroesse.
- Der strukturelle Teil von Modus A: es gibt kein Maskenfeld in der vorgeschriebenen Rueckgabe, und die Prompt-Antwort-Grenze traegt im Tokenstrom kein eigenes Zeichen - das Endetoken trennt Dokumente, nicht Prompt von Antwort. Eine Antwortmaske ist in dieser Schnittstelle also nicht implementierbar, ohne genau das zu aendern, was `test_packed_sft_dataset` prueft.
- Modus B rechnet das Packen. `__len__` ist `⌊(n − 1)/m⌋` und nicht `⌊n/m⌋`, weil die Labels eines Blocks ein Token weiter reichen; die beiden Regeln unterscheiden sich genau dann, wenn m die Zahl n teilt. Das Beispiel des Handouts (token_ids [0 … 10], seq_length 4) gibt unter beiden Regeln zwei Bloecke zurueck und kann die Frage deshalb nicht klaeren - ebenso wenig wie eine der neun Einstellungen, die das Lab anbietet. Ein Schalter kuerzt den Strom auf ein Vielfaches von m: dann trennen alle neun.
- Jede Zielposition faellt in genau eine von drei disjunkten Klassen: fremdes Dokument im Kontext, ohne den eigenen Anfang, oder das eigene Dokument von vorn und allein. Bei m = 512 und UltraChat-Laengen sind das 48,1771 % / 40,7118 % / 11,1111 %. Kurze Bloecke tauschen die erste Klasse gegen die zweite (bei m = 64: 4,9167 % / 92,4167 %), und die dritte bleibt in jedem Fall klein, weil ein Block nur dann sauber beginnt, wenn seine Grenze auf einen Dokumentanfang faellt.
- Die Konzeptseite `sft` sagt jetzt, was die Maske entscheidet und dass A5 §4.2.1 keine verlangt; die alte Behauptung ist raus, und ein Guard haelt beide Richtungen in beiden Sprachen fest.
- Neuer Guard-Block `sft packing` (16.177 Checks): Dokumentmodell, beide Laengenregeln und die drei Kontextklassen sind aus den Definitionen neu getippt statt aus der App gelesen; die Teilbarkeitsaussage ist ueber 15.561 Paare brute-force bewiesen; das Zitat der Korpusnote muss woertlich auf der Konzeptseite stehen; 54 Einstellungen pruefen die Partition; die 12,5000-%-Schranke wird nach oben und nach unten gehalten, damit sie nicht ueberzeichnet.
- Zweiter, repo-weiter Guard `content numerals`: `english numerals` (v85) sieht nur Strings, die durch `tr()` laufen - die Inhaltspakete (Labkarten, Konzeptbegriffe, Formelantworten) pruefte auf Zahlen nichts. Der neue Block vergleicht die Ziffernfolgen aller 840 numerischen uebersetzten Felder, nachdem Gruppierungs- und Dezimaltrenner zwischen Ziffern entfernt sind, und vergleicht die **Mengen** statt der Multimengen, damit eine Wiederholung in der Uebersetzung kein Fehlalarm ist.
- Er fand acht bestehende Stellen, an denen der englische Leser - und Englisch ist die Standardsprache - andere Zahlen sieht als der deutsche: `data-pipeline` zeigte ein anderes Unicode-Beispiel (U+0065/U+0301 statt U+0061/U+0308), `bloom-filters`, `dedup` und `benchmark-validity` liessen die Zwischenschritte der vorgerechneten Beispiele weg (darunter genau die, die `1e71662` auf der deutschen Seite ergaenzt hatte), `kv-serving` und `rlvr-systems` liessen je eine Zahl fallen, `roofline` nannte einen Datentyp nur englisch, und `formulas.importance-resampling` liess im Englischen den ganzen Schlusssatz mit den normalisierten Gewichten weg. Alle acht sind repariert.
- Mutationstest: 24 echte Mutationen in drei Laeufen, 0 entkommen, Kontrolle jedes Mal gruen, Arbeitsbaum nach jedem Lauf per `git status` geprueft. Drei Entkommene aus Runde eins wurden behandelt statt weggeschrieben: die Konzeptseiten-Pruefung suchte ein Wort statt der Aussage (jetzt drei Aussagen plus eine verbotene), eine geaenderte englische Zahl in einer Labkarte fand niemand (jetzt `content numerals`), und die dritte Mutation war nachweislich inert - sie las eine Steuerung, ohne ihren Wert je auszugeben; die nicht-inerte Fassung derselben Mutation wird gefangen.
- Pruefung: Guard-Suite 43 auf 45 Bloecke, gruen. `render coverage` 8.617 auf 9.589 Zustaende ueber 14 Labs, `english render` dieselben 9.589 ohne deutschen Rest, `panel i18n` 49 auf 50 Panels, `renderer i18n` 1.831 auf 1.901 Strings. Cache-Bump auf v76, weil `i18n-en.js` sich geaendert hat; README auf 59 Labs und Version 76 nachgezogen.
