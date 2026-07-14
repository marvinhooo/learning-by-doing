# Memory

## Stabile Produktentscheidungen

- Die CS336-Lernhilfe ist deutschsprachig und offline-first; sie bleibt lokal ohne Build-Schritt nutzbar und kann als PWA ueber GitHub Pages bereitgestellt werden.
- Sie folgt der Assignment-KI-Richtlinie: Konzepterklaerungen und gestufte Hinweise sind erlaubt; Assignment-Implementierungen und abgabefertige Antworten sind ausgeschlossen.
- Der Lernfluss priorisiert Diagnose, aktives Abrufen, interaktive Experimente und Selbstpruefung.
- Symbole und Formeln erhalten einen eigenstaendigen, durchsuchbaren Tafelwerk-Bereich mit Dimensionen, Intuition, Fehlerbildern und Quellen.
- Wiederholte Referenzsammlungen werden dauerhaft als kompakte Listen mit nativen Akkordeons dargestellt; Karten bleiben auf klar begrenzte Arbeits- und Fokusflaechen beschraenkt. Formeln sind schon geschlossen vollstaendig sichtbar und umbrechen ohne internes horizontales Scrollen.
- Im iPad-Hochformat nutzt die Hauptnavigation ein Offcanvas-Menue mit Fokusmanagement; zentrale Touch-Ziele bleiben auf iPhone und iPad mindestens 44 Pixel gross.
- Browser-Fortschritt, Notizen und Lesezeichen werden sofort benutzerspezifisch lokal gespeichert und nach Login optional ueber Supabase synchronisiert; Darstellungsmodus und zuletzt geoeffnete Ansicht bleiben geraetespezifisch.
- Fuer Cloud-Funktionen wird derselbe Supabase-Account beziehungsweise dieselbe Organisation wie beim Immo-Checker genutzt, aber dauerhaft ein separates Projekt `CS336-Lernwerk`.
- Die Anmeldung nutzt E-Mail und Passwort ohne oeffentliche Registrierung; aktive Benutzer werden per Membership-Tabelle freigeschaltet.
- Kurs-PDFs bleiben aus GitHub ausgeschlossen und liegen in einem privaten, nur lesbaren Supabase-Bucket; der administrative Secret Key beziehungsweise alte Service-Role-Key darf nie im Browser oder Repository stehen.
- Beim direkten Storage-Upload wird ein neuer `sb_secret_...`-Key nur als `apikey` gesendet; lediglich der alte JWT-basierte `service_role`-Key darf zusaetzlich als Bearer-Token verwendet werden.
- GitHub Pages liefert nur statische Dateien und einen Publishable Key aus; Row Level Security (RLS; zeilenbasierte Zugriffskontrolle) schützt Lernstand und PDFs.
- `index.html` ist ab Version 2 der kanonische Einstieg; `cs336-lernwerk.html` bleibt als Weiterleitung erhalten. Der Quellenbestand umfasst seit Lecture 10 insgesamt 16 Lecture-PDFs und die sechs Assignment-PDFs zu A1 bis A5 inklusive A5-Supplement.
- Das Produktions-Repository ist `https://github.com/marvinhooo/learning-by-doing`; GitHub Pages ist unter `https://marvinhooo.github.io/learning-by-doing/` erreichbar.
- Das Supabase-Projekt wird produktiv ueber die Project URL `https://uvivqobunkdeuosgxhvn.supabase.co` angesprochen; im GitHub-Build wird nur der oeffentliche Publishable Key verwendet.
