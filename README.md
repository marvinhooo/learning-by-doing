# CS336 Lernwerk

Inoffizielle, zweisprachige Lernplattform für Stanford CS336 „Language Models from Scratch“. Englisch ist die Standardsprache, Deutsch lässt sich jederzeit zuschalten. Das Projekt ist nicht mit Stanford verbunden und erzeugt keine Assignment-Lösungen.

Der Lernpfad folgt direkt den 17 Lectures. Jede Lecture beginnt mit einer einfachen Einordnung: Worum geht es, warum ist das wichtig und welches Vorwissen wird vorausgesetzt? Danach folgen die wichtigsten Konzepte, die für diese Lecture kuratierten Formeln, passende Experimente und der seitengenaue Link zur Originalquelle. Jede Formelerklärung beginnt mit einer konkreten Frage, erklärt Namen, Symbole und ungewohnte Operatoren in Alltagssprache, setzt einen kleinen Zahlenfall vollständig ein und rechnet ihn vor; erst danach erscheint die allgemeine Gleichung. Vertiefend stehen 75 Konzepte, 79 Formeln, 72 Symbole, 70 Glossarbegriffe und 48 interaktive Labs bereit.

## Empfohlener Lernfluss

1. Lecture 1 öffnen und zuerst Kontext, Nutzen und erklärte Voraussetzungen lesen.
2. Die ausgewählten Kernkonzepte in der angegebenen Reihenfolge durcharbeiten; unbekannte Abkürzungen und Symbole werden bei ihrer ersten Verwendung erklärt.
3. Formeln in der vorgegebenen Reihenfolge durcharbeiten: Problem und Zweck, Namen, Symbole und Operatoren, vollständig eingesetztes und gerechnetes kleines Beispiel, allgemeine Formel, Intuition und Fallstrick. Geschlossene Formelkarten zeigen bewusst noch keine Gleichung und schreiben alle dort benötigten erkannten Abkürzungen direkt aus.
4. Am Ende einer Lecture zeigt „Welche Assignment-Probleme das jetzt öffnet“, welche Handout-Probleme damit vollständig auf abgedecktem Stoff stehen und welche Konzepte den übrigen noch fehlen. Das ist Orientierung für den nächsten Schritt, kein Gate.
5. Selbstchecks und Labs als Feedback nutzen. Nur fest auswertbare Fragen zeigen einen lokalen Bestanden-Status; dieser ist keine Kompetenzwertung.
6. Im Assignment Coach zuerst die einfach erklärten Voraussetzungen samt Beispiel lesen. Direkt darunter steht unter „Was dieses Assignment braucht, aber keine Lecture liefert“, welche Konzepte keine der 17 Lectures auflistet, obwohl Probleme daran hängen; diese Konzeptseiten gehören vor das jeweilige Problem. Danach folgen Konzepte, Formelwege, Prüfstrategie und typische Fehler; der rohe Scope-Wortlaut des Handouts steht zuletzt als Referenz. Dort trägt jedes Problem zusätzlich die Konzepte, die genau dieses Problem entscheiden, und – wo das Handout sie nennt – den Adapter-Hook und den Testbefehl. Hinweise sind direkt zugänglich und enthalten keinen Abgabecode.
7. Diagnose und Abrufkarten nur bei Bedarf verwenden. Sie sortieren Auffrischungen beziehungsweise Übungskarten, schalten aber nichts frei und erzeugen kein Mastery-Level.

Freitext, Selbsteinstufungen, Seitenaufrufe und manuelle Haken zählen nirgends als Nachweis. Persönliche Notizen sind optional und bleiben getrennt vom Lernstatus.

Die Plattform spart Lecture-Nacharbeit und Suchzeit, ersetzt aber nicht das eigenständige Implementieren, Testen, Profiling oder die exakten Schnittstellen und Regeln der Handouts.

## Architektur

- GitHub Pages veröffentlicht ausschließlich die statische Lernhilfe.
- Supabase Auth schützt den persönlichen Lernstand und die privaten Kurs-PDFs.
- `localStorage` speichert Änderungen sofort auf dem Gerät; Supabase synchronisiert sie nach dem Login.
- Eine Progressive Web App (PWA) ermöglicht die Installation auf iPhone und iPad.
- Service-Worker-Cache und Sprachbundle verwenden aktuell Version 74.
- Die PDFs werden durch `.gitignore` vom öffentlichen Repository ausgeschlossen.
- Auf iPhone und iPad besitzen zentrale Controls mindestens 44 Pixel große Touch-Ziele; Labs stapeln im Portrait-Modus für lesbare Erklärungen und Antwortoptionen.

## Supabase einrichten

1. Im bestehenden Supabase-Account ein neues Projekt `CS336-Lernwerk` anlegen.
2. Unter **Authentication → Providers → Email** E-Mail/Passwort aktivieren und öffentliche Registrierung deaktivieren.
3. Unter **Authentication → Users** den persönlichen Benutzer manuell anlegen und bestätigen.
4. `supabase/setup.sql` im SQL Editor ausführen.
5. Die UUID des Benutzers in die am Ende von `setup.sql` dokumentierte `insert`-Anweisung einsetzen und ausführen.
6. Unter **Project Settings → API** die Project URL und den Publishable Key kopieren. Der Publishable Key darf im Browser stehen; niemals Secret- oder `service_role`-Keys veröffentlichen.

## PDFs einmalig privat hochladen

Der Upload läuft lokal mit einem temporär gesetzten Secret Key (`sb_secret_...`). Der Schlüssel wird weder gespeichert noch ausgegeben. Der alte `service_role`-Key wird aus Kompatibilitaetsgruenden ebenfalls akzeptiert:

```bash
SUPABASE_URL="https://PROJECT.supabase.co" \
SUPABASE_SECRET_KEY="sb_secret_..." \
node scripts/upload-pdfs.mjs
```

Danach die Shell schließen beziehungsweise die Variablen entfernen. Der Browser erhält ausschließlich Leserechte für angemeldete aktive Mitglieder.

## GitHub Pages

Im Repository unter **Settings → Secrets and variables → Actions → Variables** anlegen:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Unter **Settings → Pages → Source** `GitHub Actions` auswählen. Jeder Push auf `main` veröffentlicht anschließend automatisch die Seite. Die PDFs sind nicht Teil des Deployments.

## Lokal testen

Ohne Supabase-Konfiguration funktioniert die Lernhilfe weiterhin lokal und öffnet die vorhandenen PDFs direkt:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Dann `http://127.0.0.1:8765/` öffnen.
