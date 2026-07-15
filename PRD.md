# CS336 Lernwerk - Product Requirements

## Ziel

Eine offline-first, interaktive zweisprachige Lernhilfe, die einen Lernenden mit Erfahrung in neuronalen Netzen, aber Luecken in Mathematik und Systemgrundlagen, durch Stanford CS336 "Language Models from Scratch" fuehrt. Englisch ist die Standardsprache; Deutsch ist jederzeit per Umschalter verfuegbar. Die App funktioniert lokal und kann als private, geraeteuebergreifend synchronisierte Web-App genutzt werden.

## Primaere Quellen

- Alle Lecture-PDFs unter `CS336 lectures/`
- Assignment-PDFs 1 bis 5 im Projektordner
- `/Users/martin/tafelwerk.html` als UX-Referenz, nicht als technische Vorlage

## Didaktische Leitplanken

- Aktives Abrufen, Herleiten und Experimentieren vor passivem Lesen.
- Gestufte Hinweise statt abgabefertiger Assignment-Loesungen.
- Abkuerzungen werden bei erster Verwendung erklaert.
- Erklaerungen setzen weniger Vorwissen voraus als der Kurs: neue Begriffe beginnen mit Alltagssprache oder einem konkreten Bild und fuehren erst danach die formale Kursnotation ein.
- Im deutschen Modus bleiben etablierte englische Fachbegriffe wie `Linear Layer`, `Forward Pass` oder `Attention Head` erhalten und werden bei der ersten Verwendung knapp erklaert; ungewoehnliche Woertlich-Uebersetzungen werden vermieden.
- Jede groessere Aussage ist zu Lecture oder Assignment rueckverfolgbar.
- Fortschritt und eigene Notizen werden zuerst lokal im Browser gespeichert und nach einer Anmeldung optional ueber Supabase synchronisiert.

## Scope der ersten vollstaendigen Version

1. Wissensdiagnose und personalisierter Lernpfad.
2. Kurslandkarte von Grundlagen bis Alignment.
3. Durchsuchbare Konzeptbibliothek mit mentalen Modellen, Details, Fehlerbildern und Selbstchecks.
4. Interaktive Labs fuer BPE, Tensorformen, Attention, Ressourcen, Lernrate, GPU-Roofline, Parallelismus, Scaling, Datenpipeline, Evaluation und GRPO.
5. Assignment-Coach fuer A1 bis A5 mit Voraussetzungen, Meilensteinen, gestuften Hinweisen und Definition of Done.
6. Eigenstaendiger Tafelwerk-Bereich fuer Symbole und Formeln inklusive Variablen, Dimensionen, Intuition, typischen Fehlern und Quellen.
7. Quiz, Glossar, Notizen, Lesezeichen und lokaler Fortschritt.
8. Offline-faehige lokale Nutzung ohne Build-Schritt.
9. GitHub-Pages-Deployment als Progressive Web App (PWA; installierbare Web-App) fuer Desktop, iPhone und iPad.
10. E-Mail-/Passwort-Anmeldung, private PDF-Ablage und Synchronisation von Lernstand, Notizen und Lesezeichen ueber ein eigenes Supabase-Projekt.
11. Vollstaendige englische und deutsche Darstellung aller Lerninhalte und Bedienelemente mit einem persistenten Sprachumschalter.

## Nicht-Ziele

- Keine Implementierung von Assignment-Code.
- Keine abgabefertigen Antworten auf benotete Aufgaben.
- Kein Ersatz fuer das eigenstaendige Lesen, Rechnen, Profiling und Experimentieren.
- Kein eigener App-Server; Cloud-Funktionen bleiben auf Supabase Auth, Datenbank und privaten Dateispeicher begrenzt.
- Keine oeffentliche Registrierung; Benutzer werden bewusst im Supabase-Dashboard angelegt und freigeschaltet.

## Akzeptanzkriterien

- Die Lernhilfe laesst sich direkt als HTML-Datei oeffnen.
- Navigation, globale Suche, Themenfilter und mobile Darstellung funktionieren.
- Diagnose bietet bei jeder Frage explizit `I don't know` beziehungsweise `Ich weiss es nicht`; diese ehrliche Unsicherheit wird als Wissensluecke gewertet und erzeugt nachvollziehbare Lernempfehlungen.
- Ohne gespeicherte Praeferenz startet die App auf Englisch. Der Sprachumschalter wechselt alle Lerninhalte und Bedienelemente vollstaendig zwischen Englisch und Deutsch, behaelt die Wahl lokal und verliert weder Ansicht noch Eingaben oder Lab-Zustand.
- Mindestens zehn interaktive Lernexperimente reagieren korrekt auf Eingaben.
- Formeln und Symbole sind such- und filterbar und erklaeren Notation sowie Dimensionen.
- Formeln bleiben bereits im geschlossenen Akkordeon vollstaendig sichtbar, brechen ohne internes horizontales Scrollen um und lassen sich fuer Kontext, Variablen und Selbstcheck aufklappen.
- Formeln, Symbole, Glossar, Konzepte, Labs, Assignments und Lernpfad verwenden kompakte Listen beziehungsweise native Akkordeons statt schwer scannbarer Kachelraster.
- Jeder Glossarbegriff zeigt geschlossen Begriff, Kategorie und eine vollstaendige Kurzdefinition; geoeffnet erscheint zusaetzlich eine deutlich ausfuehrlichere, beginner-freundliche Erklaerung.
- Alle 52 Konzeptseiten erklaeren Zweck, Mechanik, Begriffe und mindestens ein konkretes Beispiel beziehungsweise eine wichtige Konsequenz, ohne unerlaeutertes Kursvorwissen vorauszusetzen.
- Jeder Konzept-Selbstcheck besitzt fuer jede Frage eine standardmaessig geschlossene, aufklappbare Musterloesung; Formel-, Lab- und Assignment-Selbstchecks bieten ebenfalls eine fachliche Antwort beziehungsweise einen loesungsorientierten Lernhinweis innerhalb der Assignment-KI-Richtlinie.
- Jede Konzeptseite endet mit einer klar beschrifteten Navigation zum naechsten Konzept; nach dem letzten Konzept fuehrt die Aktion zur Konzeptuebersicht.
- Glossar-Vertiefungen und vertiefte Konzepterklaerungen sind ueber lokale und globale Suche auffindbar.
- Assignment-Bereiche verlinken auf die lokalen PDFs und bleiben innerhalb der KI-Richtlinie.
- Fortschritt, Notizen und Lesezeichen ueberleben ein Neuladen via `localStorage`.
- Ohne Netz bleiben Lerninhalte und lokale Aenderungen nutzbar; nach Wiederverbindung werden ausstehende Aenderungen synchronisiert.
- Angemeldete Benutzer koennen ausschliesslich ihren eigenen Lernstand lesen und schreiben.
- PDFs werden nicht mit GitHub Pages veroeffentlicht, sondern nur fuer aktive Mitglieder ueber zeitlich begrenzte URLs aus dem privaten Supabase-Bucket geoeffnet.
- Die App ist auf iPhone und iPad ohne horizontales Ueberlaufen bedienbar, respektiert Safe Areas und bietet Touch-Ziele von mindestens 44 Pixeln fuer zentrale Bedienelemente.
- Zentrale Interaktionen entsprechen WCAG 2.2 AA: sichtbare Fokusindikatoren und Kontrollkontraste, Skip-Link, semantische Navigation, dynamische Seitentitel sowie bedienbare Dialog-, Drawer- und Combobox-Muster.
- Browser-Zurueck/-Vorwaerts und iOS-Swipe-Navigation stellen Ansicht und vorherige Scrollposition wieder her; interne Zurueck-Aktionen erzeugen keine Navigationsschleifen.
- JavaScript laeuft ohne Konsolenfehler; zentrale Flows sind per Browser-Test verifiziert.

## Umsetzungsstatus

- Version 1 ist am 2026-07-14 als `cs336-lernwerk.html` abgeschlossen.
- Enthalten sind 12 Lernmodule, 52 Konzepte, 52 Formeln, 47 kontextspezifische Symboleintraege, 54 Glossarbegriffe, 11 interaktive Labs, 12 Diagnosefragen, 12 Quizfragen sowie Coaches fuer A1 bis A5.
- Statische JavaScript-Pruefung, Desktop- und Mobilansicht sowie die zentralen Interaktionspfade wurden erfolgreich verifiziert; die Browserkonsole blieb ohne Fehler oder Warnungen.
- Version 2 ist unter `https://marvinhooo.github.io/learning-by-doing/` veroeffentlicht: `index.html` ist der Einstieg, Supabase-Schema und private Storage-Regeln, Offline-/Konfliktsynchronisation, PWA-Dateien, mobile Safe-Area-Anpassungen sowie das GitHub-Actions-Deployment sind enthalten.
- Version 3 ist unter derselben Produktions-URL veroeffentlicht und verdichtet die Oberflaeche: Referenzsammlungen sind kompakte Listen mit nativen Akkordeons, Formeln umbrechen vollstaendig, Dashboard und Lernpfad zeigen Informationen ohne redundante Karten, und die Navigation arbeitet im iPad-Hochformat als zugaengliches Offcanvas-Menue.
- Version 4 setzt den aktuellen UX- und Accessibility-Audit um: WCAG-2.2-konforme Kontraste und Fokusfuehrung, vollstaendige Tastaturbedienung fuer Dialoge, mobile Navigation und globale Suche, robuste Browser-History, dynamische Seitentitel, ruhigere Leseseiten sowie besser lesbare mobile Diagramme. Die technische Umsetzung und statischen Pruefungen sind abgeschlossen; die Produktionspruefung folgt direkt nach dem Deployment.
- Version 5 vertieft alle 52 Konzeptseiten fuer Lernende mit weniger Vorwissen: 156 schrittweise Erklaerabschnitte, 104 aufklappbare Konzeptloesungen, 52 Formelantworten, 20 konzeptuelle Assignment-Antworten und 11 Lab-Loesungsideen. Das Glossar umfasst 55 Begriffe mit sichtbarer Kurzdefinition und separater Vertiefung; jede Konzeptseite endet mit einer Weiter- beziehungsweise Abschlussnavigation. Standardbegriffe wie `Linear Layer`, `Attention Head`, `Forward Pass` und `Backward Pass` bleiben auf Englisch und werden im Kontext erklaert.
- Version 6 ist vollstaendig zweisprachig: Englisch ist der Default, Deutsch bleibt ueber einen persistenten 44-Pixel-Umschalter erreichbar. Uebersetzt sind alle 12 Module, 52 Konzepte, 52 Formeln mitsamt 167 Variablenerklaerungen, 5 Assignment-Coaches, 11 Labs, 12 Diagnosefragen, 12 Quizfragen, 55 Glossarbegriffe, 48 Symbole sowie 465 statische und dynamische Oberflaechentexte. Jede Diagnosefrage besitzt zusaetzlich eine ausdrueckliche Unwissenheitsoption; der Sprachwechsel erhaelt Ansicht, Eingaben und BPE-Merge-Zustand.

## Offener Rest

- Inhaltliche Erweiterungen nach realen Lernfragen und bearbeiteten Assignments.
- Optional spaeter: terminierte Spaced-Repetition-Wiederholungen; Import und Export des lokalen Lernstands sind bereits enthalten.
- Offen: Login, signierter PDF-Aufruf und Geraetesynchronisation mit dem echten Benutzer auf iPhone/iPad Ende-zu-Ende pruefen.
- Die neu hinzugefuegte Lecture 10 ist privat hochladbar, aber noch nicht inhaltlich in Quellenkarten und Lernmodule eingearbeitet.
