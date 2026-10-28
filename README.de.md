# ZIEGLER LAB V9

## Deutsch: ZIEGLER LAB V9 – Ausführliche Anleitung

### 1. Lieferumfang und Verbindungsgrenzen

V9 erhält die sechs Agents, drei Oberflächensprachen, unabhängige Verhandlungs-/Coach-Sprache, beide einklappbaren Seitenleisten, Lernpfade, Pläne, Auswertung und lokales Gedächtnis. Neu sind ein SAP-/Microsoft-365-Arbeitsraum, eine gemeinsame Aktionsplanung und ein separates Node.js-Gateway.

Es wird angenommen, dass die Organisation SAP- und Microsoft-365-Zugriff erlaubt. Mandant, Geheimnisse, SAP-Version und echte Geschäftsdaten sind nicht enthalten. Standard ist eine klar markierte Simulation. Konfigurierte Fähigkeiten beweisen keine erfolgreich geprüfte Berechtigung.

Drei Ausgaben:
- GitHub-Pages-Codepaket: Frontend, gemeinsamer Simulationskern, Deployment-Workflow, vorgebautes `site/`, Frontend-Tests und ausführliche dreisprachige README. Kein echtes Gateway und keine Unternehmensgeheimnisse.
- Komplettpaket: zusätzlich Gateway, Authentifizierung, SAP-/Graph-Adapter, Umgebungsbeispiel, Schnittstellendokumentation, Tests, Starter und Offline-HTML.
- Einzelne HTML-Datei: ohne Installation lokal starten; die README ist über die obere Schaltfläche eingebettet. Aus `file://` ist kein echtes Gateway erlaubt. Dafür das Frontend über HTTP(S) bereitstellen.

### 2. Sofort demonstrieren

HTML herunterladen und in Edge oder Chrome öffnen, nicht nur in der Anhangsvorschau. Alternativ das Komplettpaket entpacken und `START_DEMO.cmd` starten. Sprache oben rechts wählen. Pfeile klappen beide Leisten unabhängig ein; `Alt+[` links und `Alt+]` rechts. Eine eingeklappte Gesprächsleiste löscht die Sitzung nicht.

Mit „Demo: sauberer Ablauf“ beginnen: BANF manuell prüfen, lokalen Bestellentwurf erstellen, AB vergleichen, Teilzugänge ansehen und Rechnung abgleichen. Danach Preis-/Mengenabweichung und verspätete Lieferung zeigen. Alle Beispiele sind fiktiv.

Im Bereich „SAP & Microsoft 365“:
1. Lokale Schnittstellen-Simulation beibehalten und verbinden.
2. Bestellungen, Outlook-Posteingang und SharePoint-/OneDrive-Dateien laden.
3. Eine Bestellung als lokalen Prüffall übernehmen. Quelle bleibt unverändert; Prüfmarkierungen werden zurückgesetzt.
4. BANF, Bestellung oder Outlook-Entwurf als Aktion wählen.
5. Unveränderlichen Plan mit vollständigen Nutzdaten, ID, Hash und Ablaufzeit erzeugen.
6. Ziel und Inhalt prüfen, Kontrollkästchen bestätigen, genehmigen und erst dann ausführen.
7. Nicht autorisiert, Drosselung, Konflikt oder Schreib-Timeout simulieren. Unklare Ergebnisse sperren erneute Ausführung und werden nicht automatisch wiederholt.

### 3. Die sechs Agents

- Negotiation Training: zwölf fiktive Szenarien, drei Modi, Coach, manuelle Ereignisse, belegbasierte Auswertung, Lernen und Vergleich. Regelbasiert, kein Live-Modell oder Echtzeit-Avatar.
- BANF: Anforderer, Kostenstelle, PSP, Standort, Begründung, Währung und Positionen; Pflichtfelder, Mengen, Preise, Termine und doppelte Materialien prüfen; Textentwurf exportieren.
- Bestellung anlegen: gemeinsame BANF-Daten, Lieferant, E-Mail, Zahlungsbedingung und zehnstellige Nummer mit 4500 prüfen. Diese Nummernregel ist eine Demo-Konvention, keine allgemeine SAP-Regel.
- Auftragsbestätigung: manuelle oder strukturierte Eingabe; Bezug, Währung, Menge, Preis, Termin sowie fehlende/unbekannte Positionen vergleichen. Dokumentierte Prüfung akzeptiert keine Abweichungen.
- Liefertermin: Versand, Tracking, Lieferschein, Teilzugänge und Restmenge. Früh positiv, spät negativ: Wunschdatum minus Zugangsdatum. Abschluss ist das erste Datum mit kumulativ ausreichender Menge.
- Rechnung: Bestellung/Wareneingang/Rechnung abgleichen, Mengenüberschreitungen und Preis-/Währungs-/Referenzabweichungen blockieren, lokale Dubletten erkennen. Manuell erfasste Steuer ist nur Rechenhilfe; keine Zahlung.

### 4. GitHub Pages bereitstellen

GitHub Pages ist statisches Hosting; das Gateway muss separat betrieben werden.[S1]

Empfohlener Workflow:
1. Repository anlegen und den entpackten Paketinhalt direkt ins Repository-Stammverzeichnis legen. `.github/workflows/pages.yml` erhalten, keine zusätzliche Verzeichnisebene.
2. Auf `main` pushen.
3. Settings → Pages → Build and deployment → Source: GitHub Actions.
4. In Actions prüfen. Der Workflow führt `npm ci`, `npm test`, `npm run build` aus und veröffentlicht nur `dist/`, niemals Server oder `.env`.
5. Relative Ressourcenpfade unterstützen Projekt-Unterpfade. Interne Zustandsnavigation benötigt keine Rewrite-Regeln.

Ohne Build: gesamten Inhalt von `site/` in ein separates Veröffentlichungs-Repository kopieren und `main`/Root als Quelle wählen. Die Entwicklungs-`index.html` im Paketstamm ist kein vorgebauter Einstieg; sie referenziert Quellcode.

Pages kann öffentlich sichtbar sein. Keine echten Bestellungen, Personendaten, Geheimnisse oder vertraulichen Daten veröffentlichen. Privates Repository bedeutet nicht automatisch private Website.[S2] Es wurde kein Repository für Sie erstellt oder eine öffentliche Website veröffentlicht.

### 5. Entwicklung und Einzeldatei

Nur für Entwicklung kompatibles Node.js und npm installieren; `package.json` nennt die Engine-Anforderung. Die Offline-Demo benötigt beides nicht.

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd test
npm.cmd run html
```

Der letzte Befehl erzeugt `dist/` und `ZIEGLER_LAB_V9_DE_EN_ZH.html`. Beide Codepakete sind neu baubar. `npm ci` benötigt Netzwerkzugriff; `node_modules` ist nicht enthalten.

### 6. Separates Sandbox-Gateway testen

Nur im Komplettpaket: in Terminal 1 `npm.cmd run dev`, in Terminal 2:

```powershell
npm.cmd run gateway:sandbox
```

Der Starter bindet `127.0.0.1:8787` und zeigt ein zufälliges temporäres Token. Im HTTP-Frontend den Gateway-Modus wählen, Adresse und Token eingeben. CORS erlaubt standardmäßig lokale Port-5173-Ursprünge; bei anderem Vite-Port `ALLOWED_ORIGINS` anpassen.

Dies testet echte Browser-/Gateway-HTTP-Kommunikation, aber weiterhin nur simulierte Daten. Das temporäre Token ist keine Produktionsanmeldung.

### 7. Echte Systeme konfigurieren

Details in `docs/INTEGRATION.md`:
1. Gateway separat hinter TLS betreiben, `LAB_MODE=gateway` setzen.
2. `ENTRA_TENANT_ID` und `ENTRA_AUDIENCE` konfigurieren. Entra-v2-Zugriffstoken für dieses Gateway verwenden. RS256-Signatur, Mandant, Issuer, Audience, Ablauf und `lab.read`/`lab.plan`/`lab.approve`/`lab.execute` werden geprüft.
3. Browser-Token bleiben im Arbeitsspeicher. Die manuelle Eingabe dient kontrollierten Integrationstests; vollständige MSAL-Anmeldung, Refresh, Logout und Conditional-Access-Interaktion fehlen noch.
4. Graph nutzt serverseitige Client Credentials: `M365_TENANT_ID`, `M365_CLIENT_ID`, `M365_CLIENT_SECRET`, feste `M365_MAILBOX` und `M365_DRIVE_ID`. Geheimnisse nie im Browser oder Repository speichern.[S6]
5. Mail-Lesen mit bodyPreview benötigt passende Leserechte, Entwurfserstellung Mail.ReadWrite; Dateilisten benötigen passende Datei-/Site-Leserechte. Administratoren müssen die Ressourcen einschränken, nicht pauschal unbeschränkte Mandantenrechte vergeben.[S3][S4][S5]
6. `ENABLE_GRAPH_DRAFT=false` ist Standard. Aktivierung erlaubt nur genehmigte Entwürfe, keinen Versand.[S3]
7. SAP benötigt `SAP_BASE_URL`, `SAP_BEARER_TOKEN`, `SAP_MAPPING_FILE`. Alle Beispielpfade sind Platzhalter. Gegen genehmigte API-Metadaten ersetzen und Pflichtfelder wie Einkaufsorganisation, Gruppe, Werk, Geschäftspartner-ID, Preiseinheit und Datumsformat ergänzen. Lieferantenanzeigenamen sind keine universellen SAP-IDs.
8. `ENABLE_SAP_WRITES=false` bleibt bis zur Abnahme im Testsystem. Adapter unterstützt konfigurierte POST-Anlage, CSRF-Token und Sitzungscookies, keine PATCH-/ETag-Aktualisierung.[S7]
9. `ALLOWED_ORIGINS` enthält den exakten Frontend-Origin, z.B. `https://YOUR-ORG.github.io`, ohne Repository-Pfad und ohne Wildcard. Kein `file://`.

Im echten Gateway müssen Ersteller und Prüfer verschieden sein. Prüfer lädt die Plan-ID mit eigenem Token und genehmigt; Ersteller aktualisiert den Status und führt aus. Lokales Kontrollkästchen und BANF-Markierung ersetzen keine Unternehmensfreigabe. Nur eingefrorene Nutzdaten werden ausgeführt.

### 8. Gedächtnis, Backup und Grenzen

Ohne Zustimmung bleiben Beschaffungsdaten im Arbeitsspeicher. Zustimmung speichert Sprache, Leistenstatus, Fälle und lokale Prüfnotizen. Ausschalten löscht die persistente Kopie, nicht die aktuelle Ansicht. Training hat separate Speicher-/Löschzustimmung; private Notizen und Medien werden nicht gespeichert.

JSON-Schema bleibt 8 für V8-Kompatibilität; V9 hat eigene Browser-Schlüssel. V8 exportieren und V9 importieren; Import ersetzt Fälle und setzt Prüfungen zurück. Grenzen: 100 Fälle, 100 Positionen je Dokument, 500 Zugänge, 2 MB Import.

Token, Verbindungsdaten, Aktionspläne und geladene Mail-/Dateilisten sind nicht im Beschaffungsbackup. Kopierte Unternehmensbestellungen werden lokale Fälle und können bei aktivem Gedächtnis gespeichert werden; vorher Erlaubnis prüfen. Browserspeicher ist unverschlüsselt.

Pläne gelten fünf Minuten, maximal 300 Pläne und 500 Ereignisse im Speicher. Idempotenz gilt nur im selben laufenden Prozess, nicht über Neustarts oder mehrere Instanzen. Unklare Ergebnisse im Quellsystem abgleichen, nicht mit neuem Plan blind wiederholen. Dauerhafte Idempotenz, Audit, Wiederherstellung, Parallelitätskontrolle und Monitoring sind vor Produktion zu ergänzen.

Je Fall eine AB und Rechnung. Keine kumulierten Mehrfachrechnungen, Gutschriften, FX, Frachtverteilung, Steuerregeln, Bankprüfung, Zahlung, PDF/OCR, Anhangdownloads, Teams-/Kalenderschreibzugriffe oder Live-KI. Graph liest maximal 20 Mails/Dateimetadaten, SAP maximal 20 Bestellungen; keine automatische Seitennavigation. Echte AB-, Zugangs- und Rechnungslese-Adapter fehlen; diese Daten werden lokal erfasst.

Sprache ist browser-/anbieterabhängig und nicht garantiert offline. Reales Windows, Unternehmensmandant, SAP und Hardware wurden nicht getestet. Testberichte sind keine Produktionszertifizierung.

### 9. Fehlerbehebung

- npm fehlt: HTML verwenden; für Entwicklung Node.js über IT installieren und Terminal neu öffnen.
- Pages leer: Verzeichnisebene, Actions-Log und vollständige `dist/`-Ressourcen prüfen; keine Entwicklungs-index.html allein hochladen.
- 401: Tokenablauf, Audience und Mandant prüfen. Ein Graph-Token ist kein Gateway-Token.
- 403: Rollen, getrennten Prüfer, CORS und Ressourcenrechte prüfen.
- 429: warten und Lesen manuell wiederholen; Schreiben nie automatisch wiederholen.
- Mappingfehler: Metadaten, Sammlung, Positionen, Pflichtstammdaten und Ergebnis-ID prüfen.
- Unklares Schreiben: zuerst Quellsystem prüfen, nicht erneut ausführen oder nur die Seite aktualisieren.
- Gedächtnis weg: Zustimmung und Browserspeicher prüfen; Dateiumbenennung/-verschiebung kann den Speicherbereich ändern. JSON-Migration nutzen.

### 10. Tests und Struktur

`npm test` prüft Kern, Zustandsmaschine, Gateway und Adapter; das Pages-Paket nur die enthaltenen Frontend-/Shared-Tests. Browserregression: `tests/browser_smoke.py`, im Komplettpaket zusätzlich `tests/browser_enterprise.py`. Ergebnisse in `docs/TEST_REPORT.md`.

`src/` Frontend, `shared/` Aktionskern, `server/` Gateway (Komplettpaket), `scripts/` Build, `.github/workflows/` Deployment, `dist/` Ausgabe, `site/` vorgebaute Pages-Ausgabe, `examples/` fiktive Daten, `docs/` Anleitung und Testbelege.

## Official references / Offizielle Quellen / 官方参考

- [S1] GitHub Pages static hosting: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
- [S2] Creating a Pages site and visibility warning: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- [S3] Microsoft Graph create draft, Mail.ReadWrite: https://learn.microsoft.com/en-us/graph/api/user-post-messages?view=graph-rest-1.0
- [S4] Microsoft Graph list messages: https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0
- [S5] Microsoft Graph drive children: https://learn.microsoft.com/en-us/graph/api/driveitem-list-children?view=graph-rest-1.0
- [S6] Microsoft identity platform client credentials: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow
- [S7] SAP Cloud SDK CSRF handling: https://sap.github.io/cloud-sdk/docs/js/features/connectivity/csrf

References checked for this delivery. SAP example mappings are illustrative and not certified against your system.
