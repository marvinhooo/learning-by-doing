# CS336 Lernwerk - Product Requirements

## Ziel

Eine offline-first, interaktive deutschsprachige Lernhilfe, die einen Lernenden mit Erfahrung in neuronalen Netzen, aber Luecken in Mathematik und Systemgrundlagen, durch Stanford CS336 "Language Models from Scratch" fuehrt. Sie funktioniert lokal und kann als private, geräteübergreifend synchronisierte Web-App genutzt werden.

## Primaere Quellen

- Alle Lecture-PDFs unter `CS336 lectures/`
- Assignment-PDFs 1 bis 5 im Projektordner
- `/Users/martin/tafelwerk.html` als UX-Referenz, nicht als technische Vorlage

## Didaktische Leitplanken

- Aktives Abrufen, Herleiten und Experimentieren vor passivem Lesen.
- Gestufte Hinweise statt abgabefertiger Assignment-Loesungen.
- Abkuerzungen werden bei erster Verwendung erklaert.
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

## Nicht-Ziele

- Keine Implementierung von Assignment-Code.
- Keine abgabefertigen Antworten auf benotete Aufgaben.
- Kein Ersatz fuer das eigenstaendige Lesen, Rechnen, Profiling und Experimentieren.
- Kein eigener App-Server; Cloud-Funktionen bleiben auf Supabase Auth, Datenbank und privaten Dateispeicher begrenzt.
- Keine oeffentliche Registrierung; Benutzer werden bewusst im Supabase-Dashboard angelegt und freigeschaltet.

## Akzeptanzkriterien

- Die Lernhilfe laesst sich direkt als HTML-Datei oeffnen.
- Navigation, globale Suche, Themenfilter und mobile Darstellung funktionieren.
- Diagnose erzeugt nachvollziehbare Lernempfehlungen.
- Mindestens zehn interaktive Lernexperimente reagieren korrekt auf Eingaben.
- Formeln und Symbole sind such- und filterbar und erklaeren Notation sowie Dimensionen.
- Assignment-Bereiche verlinken auf die lokalen PDFs und bleiben innerhalb der KI-Richtlinie.
- Fortschritt, Notizen und Lesezeichen ueberleben ein Neuladen via `localStorage`.
- Ohne Netz bleiben Lerninhalte und lokale Aenderungen nutzbar; nach Wiederverbindung werden ausstehende Aenderungen synchronisiert.
- Angemeldete Benutzer koennen ausschliesslich ihren eigenen Lernstand lesen und schreiben.
- PDFs werden nicht mit GitHub Pages veroeffentlicht, sondern nur fuer aktive Mitglieder ueber zeitlich begrenzte URLs aus dem privaten Supabase-Bucket geoeffnet.
- Die App ist auf iPhone und iPad ohne horizontales Ueberlaufen bedienbar, respektiert Safe Areas und bietet Touch-Ziele von mindestens 44 Pixeln fuer zentrale Bedienelemente.
- JavaScript laeuft ohne Konsolenfehler; zentrale Flows sind per Browser-Test verifiziert.

## Umsetzungsstatus

- Version 1 ist am 2026-07-14 als `cs336-lernwerk.html` abgeschlossen.
- Enthalten sind 12 Lernmodule, 43 Konzepte, 52 Formelkarten, 47 kontextspezifische Symboleintraege, 54 Glossarbegriffe, 11 interaktive Labs, 12 Diagnosefragen, 12 Quizfragen sowie Coaches fuer A1 bis A5.
- Statische JavaScript-Pruefung, Desktop- und Mobilansicht sowie die zentralen Interaktionspfade wurden erfolgreich verifiziert; die Browserkonsole blieb ohne Fehler oder Warnungen.
- Version 2 ist unter `https://marvinhooo.github.io/learning-by-doing/` veroeffentlicht: `index.html` ist der Einstieg, Supabase-Schema und private Storage-Regeln, Offline-/Konfliktsynchronisation, PWA-Dateien, mobile Safe-Area-Anpassungen sowie das GitHub-Actions-Deployment sind enthalten.

## Offener Rest

- Inhaltliche Erweiterungen nach realen Lernfragen und bearbeiteten Assignments.
- Optional spaeter: terminierte Spaced-Repetition-Wiederholungen; Import und Export des lokalen Lernstands sind bereits enthalten.
- Offen: Login, signierter PDF-Aufruf und Geraetesynchronisation mit dem echten Benutzer auf iPhone/iPad Ende-zu-Ende pruefen.
- Die neu hinzugefuegte Lecture 10 ist privat hochladbar, aber noch nicht inhaltlich in Quellenkarten und Lernmodule eingearbeitet.
