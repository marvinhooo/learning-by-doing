# Memory

## Stabile Produktentscheidungen

- Die CS336-Lernhilfe ist zweisprachig und offline-first: Englisch ist die Standardsprache, Deutsch ist per Umschalter verfuegbar. Sie bleibt lokal ohne Build-Schritt nutzbar und kann als Progressive Web App (PWA; installierbare Web-App) ueber GitHub Pages bereitgestellt werden.
- Sie folgt der Assignment-KI-Richtlinie: Konzepterklaerungen und gestufte Hinweise sind erlaubt; Assignment-Implementierungen und abgabefertige Antworten sind ausgeschlossen.
- Der Lernfluss priorisiert Diagnose, aktives Abrufen, interaktive Experimente und Selbstpruefung.
- Erklaerungen sind dauerhaft beginner-first: Sie beginnen mit einem konkreten mentalen Modell, erklaeren neue Begriffe und Shapes in Alltagssprache und fuehren erst danach die formale Kursnotation ein. Im deutschen Modus bleiben etablierte Fachbegriffe wie `Linear Layer`, `Attention Head`, `Forward Pass` und `Backward Pass` auf Englisch.
- Die Sprachpraeferenz bleibt geraetelokal und wird nicht ueber Supabase synchronisiert; ein Sprachwechsel darf Ansicht, Eingaben, Akkordeons, Scrollposition oder Lab-Zustand nicht verlieren.
- Jede Diagnosefrage besitzt explizit `I don't know` beziehungsweise `Ich weiss es nicht`. Diese Antwort zaehlt als Wissensluecke mit null Punkten und bleibt im Nenner, damit die Diagnose die Lernreihenfolge ehrlich priorisiert; das regulaere Quiz erhaelt keine zusaetzliche Option.
- Lernfragen in Konzepten, Formeln, Labs und Assignments besitzen standardmaessig geschlossene, aufklappbare Antworten; der eigene Erklaerversuch bleibt der erste Schritt. Assignment-Antworten bleiben konzeptuell und enthalten weder Implementierung noch Abgabecode.
- Der Lernpfad ist die einzige kanonische Kurs- und Konzeptuebersicht. Module zeigen in ihren Akkordeons direkt die geordneten Konzepte und zugehoerigen Labs; einen separaten Top-Level-Menuepunkt `Konzepte` gibt es nicht. Alte `#concepts`-Links und gespeicherte Konzeptansichten werden auf `#path` migriert.
- Konzeptfortsetzung folgt der expliziten Reihenfolge in `MODULES[].concepts`, kennzeichnet Modulwechsel und fuehrt am Kursende zur Lernpfaduebersicht. Moduldetails sind nur fuer Voraussetzungen, Quellen, Lernziel und Fortschritt zustaendig.
- Symbole und Formeln erhalten einen eigenstaendigen, durchsuchbaren Tafelwerk-Bereich mit Dimensionen, Intuition, Fehlerbildern und Quellen.
- Wiederholte Referenzsammlungen werden dauerhaft als kompakte Listen mit nativen Akkordeons dargestellt; Karten bleiben auf klar begrenzte Arbeits- und Fokusflaechen beschraenkt. Formeln sind schon geschlossen vollstaendig sichtbar und umbrechen ohne internes horizontales Scrollen.
- Labs sind dauerhaft beginner-first aufgebaut: Vor jedem Experiment bleiben Mental Model und Kernformel sichtbar; das Formel-Akkordeon ergaenzt Symbolerklärungen und eine typische Fehlannahme. Dynamische Rechnungen wiederholen Beziehung, eingesetzte Werte und Ergebnis direkt am Output. Tensor-Shapes werden nie als unbeschriftete Zahlenfolgen gezeigt, sondern mit allen Achsennamen, Herkunft und einer kausalen Erklaerung der letzten Regleraenderung.
- Im iPad-Hochformat nutzt die Hauptnavigation ein Offcanvas-Menue mit Fokusmanagement; zentrale Touch-Ziele bleiben auf iPhone und iPad mindestens 44 Pixel gross.
- Die responsive Hauptnavigation nutzt bis 1180 Pixel einen beschrifteten modalen Drawer; Browser-History, interne Zurueck-Aktionen und Scrollpositionswiederherstellung bleiben Teil des Navigationsvertrags.
- Dialoge, Drawer und die globale Combobox folgen dauerhaft den WAI-ARIA-Interaktionsmustern mit Fokusbegrenzung, Escape, Fokuswiederherstellung und stabilen Statusmeldungen.
- Service Worker duerfen beim Aktivieren ausschliesslich eigene Caches mit dem Praefix `cs336-shell-` bereinigen, weil mehrere GitHub-Pages-Repositories denselben Origin teilen.
- Browser-Fortschritt, Notizen und Lesezeichen werden sofort benutzerspezifisch lokal gespeichert und nach Login optional ueber Supabase synchronisiert; Darstellungsmodus und zuletzt geoeffnete Ansicht bleiben geraetespezifisch.
- Fuer Cloud-Funktionen wird derselbe Supabase-Account beziehungsweise dieselbe Organisation wie beim Immo-Checker genutzt, aber dauerhaft ein separates Projekt `CS336-Lernwerk`.
- Die Anmeldung nutzt E-Mail und Passwort ohne oeffentliche Registrierung; aktive Benutzer werden per Membership-Tabelle freigeschaltet.
- Kurs-PDFs bleiben aus GitHub ausgeschlossen und liegen in einem privaten, nur lesbaren Supabase-Bucket; der administrative Secret Key beziehungsweise alte Service-Role-Key darf nie im Browser oder Repository stehen.
- Beim direkten Storage-Upload wird ein neuer `sb_secret_...`-Key nur als `apikey` gesendet; lediglich der alte JWT-basierte `service_role`-Key darf zusaetzlich als Bearer-Token verwendet werden.
- GitHub Pages liefert nur statische Dateien und einen Publishable Key aus; Row Level Security (RLS; zeilenbasierte Zugriffskontrolle) schützt Lernstand und PDFs.
- `index.html` ist ab Version 2 der kanonische Einstieg; `cs336-lernwerk.html` bleibt als Weiterleitung erhalten. Der Quellenbestand umfasst seit Lecture 10 insgesamt 16 Lecture-PDFs und die sechs Assignment-PDFs zu A1 bis A5 inklusive A5-Supplement.
- Das Produktions-Repository ist `https://github.com/marvinhooo/learning-by-doing`; GitHub Pages ist unter `https://marvinhooo.github.io/learning-by-doing/` erreichbar.
- Das Supabase-Projekt wird produktiv ueber die Project URL `https://uvivqobunkdeuosgxhvn.supabase.co` angesprochen; im GitHub-Build wird nur der oeffentliche Publishable Key verwendet.
