# GLAS IN JENA – Design- und Arbeitsvorgaben für die plentyShop PWA

Diese Datei beschreibt, wie die PWA aussehen soll und nach welchen Regeln daran gearbeitet wird.
Vorbild ist der bisherige plentyShop-LTS-Shop **www.glas-jena.de**.
Screenshots der Desktop-Ansicht liegen im selben Ordner (`docs/glas-jena/`).

---

## 1. Arbeitsregeln (bitte immer einhalten)

1. **Shop-Editor zuerst:** Was sich über die Einstellungen des Shop-Editors lösen lässt (Farben, Schriften, Blöcke, Texte), wird dort gelöst und nicht programmiert.
2. **Eigene Komponenten statt Originaldateien ändern:** Neue Funktionen und Layouts kommen in eigene Dateien, bevorzugt mit `npx plentyshop generate component`. Originaldateien von plentymarkets nur minimal und nur wenn unvermeidbar ändern und die Änderung im Commit begründen. Ziel: Updates aus `plentymarkets/plentyshop-pwa` sollen sich per „Sync fork“ möglichst konfliktfrei übernehmen lassen.
3. **Die mitgelieferte `CLAUDE.md` nicht verändern.** Sie gehört zum Original-Repository.
4. **Keine Zugangsdaten committen:** `apps/web/.env` (API-Endpunkt, Security-Token) und GitHub-Tokens dürfen nie ins Repository. Der Fork ist öffentlich.
5. **Nicht live schalten:** In PlentyONE nur den Vorschau-Modus nutzen. „Live-Modus aktivieren“ erst nach ausdrücklicher Freigabe durch den Shopbetreiber. Der LTS-Shop läuft bis dahin weiter.
6. Commits nach Conventional Commits (wird vom Projekt per commitlint erzwungen).
   **Updates prüfen:** Der Test `apps/web/modules/glas-jena/runtime/__tests__/upstreamContract.spec.ts` prüft, worauf sich das Modul in den Originaldateien verlässt (Test-IDs aus `glas-jena.css`, ersetzte Komponenten wie Header, Footer und Cookie-Banner, Routen und Übersetzungen des Seitenbanners, Aufbau der Layouts). Er läuft in der CI bei jedem Pull Request und jedem Push auf `main`, also auch nach „Sync fork“. Schlägt er nach einem Update fehl, nennt er die Stelle, die im Modul anzupassen ist. Neue Abhängigkeiten von Originaldateien dort ergänzen.
7. Jede Anpassung muss auf Desktop **und** Handy funktionieren.

---

## 2. Farben

Die Werte sind aus Screenshots geschätzt. **Vor der Umsetzung mit dem CSS des LTS-Shops abgleichen** und hier korrigieren.

| Verwendung                                                                      | Farbe                                                |
| ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Schieferblau – Logo-Feld, Box „Wussten Sie schon“                               | `#4B6A82`                                            |
| Mittelblau – Warenkorb-Button, Box „Unser hitzebeständiges Glas“                | `#6E9BBF`                                            |
| Leistenblau – Balken „Unsere Topseller“, „Ersatzteile“, „Zubehör“ (Weiß 3,23:1) | `#6A94B4` (`--gj-bar-blue`)                          |
| Zartgrün – Werksverkauf, Textblock „trendglas® in Jena“                         | `#DDEBC8`                                            |
| Kachel Tee & Kaffee                                                             | `#A9C9E3`                                            |
| Kachel Küche & Helfer                                                           | `#D6E1EA`                                            |
| Kachel Gesundheitshelfer                                                        | `#D4C8E8` (Überschrift darin violett, ca. `#9B6FB5`) |
| Header-Iconfelder (Konto, Sprache, Suche)                                       | Hellgrau, ca. `#F0F0F0` / `#E6E6E6`                  |
| Footer                                                                          | Fast schwarz-blau `#263238` (gemessen)               |
| Fließtext                                                                       | Dunkelgrau, ca. `#444444`                            |
| Textlinks (Textblöcke, Rechtstexte, Cookie-Banner)                              | Dunkelblau `#2C5572`, unterstrichen (siehe unten)    |

**Barrierefreiheit vor LTS-Treue:** Jede übernommene LTS-Formatierung wird auf WCAG 2.1 AA und gängige Empfehlungen geprüft und bei Bedarf angepasst; die Abweichung steht im CSS-Kommentar. Beispiel Linkfarbe: Das LTS-Mittelblau `#6E9BBF` hat auf Weiß nur 2,96:1 (nötig 4,5:1). Textlinks nutzen deshalb `--gj-link` (`#2C5572`, mindestens 4,59:1 auf Weiß und allen Kachelfarben) und sind immer unterstrichen, weil sich die Farbe allein kaum vom Fließtext abhebt.

---

## 3. Typografie

- Schrift: **Source Sans Pro** (bzw. Nachfolger _Source Sans 3_), Fallback `sans-serif`.
- Überschriften: groß, **Light** (Schriftstärke 300), viel Luft.
- Fließtext: Regular, gut lesbar, großzügige Zeilenhöhe.
- Preise: kräftig (Semibold/Bold), Sternchen-Hinweis klein darunter.
- Rechtstexte aus dem plentymarkets-System (Impressum, AGB, Datenschutz, Widerruf, Barrierefreiheit): wie im LTS (`.my-legal`) Überschriften normal, Absätze und h4 leicht eingerückt, Größenverhältnisse des LTS auf 16 px Grundschrift; abweichend Zeilenhöhe 1,5 und unterstrichene Links in `--gj-link` (`glas-jena.css`). Das Inhaltsverzeichnis der AGB springt wie im LTS zum Paragraphen (`runtime/utils/legalAnchors.ts`), anders als dort auf allen Bildschirmbreiten, ohne Animation bei „Bewegung reduzieren“ und mit dem Fokus auf dem Ziel.
- Widerruf `/cancellation-rights/`: wie die LTS-Seite „Widerrufsbelehrung & Widerrufsformular“ (Banner-Titel ebenso, eigener Modul-Text über `OWN_PAGE_BANNER_TITLE_KEYS`) der im System hinterlegte Text zum Widerrufsformular (Rechtstext-Typ `WithdrawalForm`), darunter mit 24 px Abstand das Widerrufsformular der PWA (Name, Auftrags-Nr., E-Mail, Grund). Das Modul ersetzt dafür die Seitendatei (`PAGE_OVERRIDES` in `index.ts`, `runtime/pages/GlasJenaCancellationRights.vue`, Formular `GlasJenaCancellationForm.vue` mit der Logik von `useCancellationForm`). Das Formular braucht im Editor die „Cancellation Form Email“ und den Cloudflare-Turnstile-Spamschutz (Doku `docs/guide/themes/bot-protection.md`), sonst erscheint ein Hinweis statt der Felder.
- Kontakt `/contact/`: wie die LTS-Kontaktseite oben zentriert die Einleitung (zwei Sätze, Hinweis auf www.trendglas-jena.com für gewerbliche Anfragen) mit feiner Linie darunter, dann ab 768 px links die Kontaktdaten mit Symbolen (Adresse, Telefon, Fax, E-Mail; fest in `runtime/utils/contactForm.ts`, die Shop-Schnittstelle liefert sie nicht) und rechts das Kontaktformular der PWA im Stil `gj-form` (Name und E-Mail nebeneinander, Betreff, Auftragsnummer, Nachricht, Datenschutz-Bestätigung; ohne „Alles löschen“). Ersetzte Seitendatei `runtime/pages/GlasJenaContact.vue`, Formular `GlasJenaContactForm.vue`, Prüfregeln wie im Original (`createContactValidationSchema`).

---

## 4. Gestaltungsprinzipien

- **Flat und eckig:** keine abgerundeten Ecken, keine Schatten.
- **Geboxtes Layout:** Inhalt auf feste Maximalbreite zentriert, mit Rand links und rechts (Desktop).
- **Farbflächen als Gestaltungsmittel:** Inhalte stehen in vollflächig gefärbten Kacheln.
- **Listen mit Haken:** Aufzählungen in Textblöcken (Rich Text, Bild mit Text) stehen wie im LTS-Shop mit mittelblauen Haken ✓ statt Punkten, 40 px eingerückt (`glas-jena.css`, gilt für den angezeigten Text, nicht für das Eingabefeld im Editor). Nummerierte Listen bleiben nummeriert. Im Editor einfach eine normale Aufzählung anlegen. Für Bedingungen statt Vorteile (z. B. Versandseite) Punkte wie im LTS: im HTML-Modus `<ul class="gj-list-dots">`.
- **Tabellen in Textblöcken** (nur im HTML-Modus, der normale Texteditor kennt keine Tabellen und würde sie beim Bearbeiten entfernen): volle Breite, feine Trennlinien wie im LTS. Zeilenbeschriftungen als `<th scope="row">` (Bankdaten auf „Vorkasse / Überweisung“), Spaltenköpfe als `<thead>` mit `<th scope="col">` und ggf. `<caption>` – solche Tabellen sind nur so breit wie ihr Inhalt (DHL-Preise auf der Versandseite). Ausrichtung im HTML-Modus je Element per `style="text-align: left;"`, da neue Textblöcke zentriert sind.
- **Versandseite** `/shipping/`: Inhalt direkt als Editor-Blöcke auf der Seite (keine Kategorie-Verknüpfung nötig). Listen stehen dort immer mit Punkten und linksbündig (CSS über `data-gj-route="shipping"` am Seitenbanner), auch wenn der Text im normalen Rich-Text-Modus gespeichert wurde. Die DHL-Preistabelle übersteht das nicht: Block nur im HTML-Modus bearbeiten.
- **„Mehr“-Buttons:** halbtransparente helle Fläche unten rechts in der jeweiligen Kachel, Schrift Light.
- **Formulare** (einheitlich für alle Formulare des Shops, `glas-jena.css`): Beschriftung halbfett über dem Feld, Eingabefelder, Textfelder und Auswahllisten mit 1 px Rahmen `#858585` (3,69:1), 44 px hoch, 16 px Text; Fokus 2 px in der Linkfarbe, Fehler roter Rahmen `#b91c1c` plus Meldung; Absende-Knopf Schieferblau `#4B6A82` mit weißer Schrift (5,70:1), 44 px hoch. Nötig, weil der flache Look alle Schatten entfernt und damit auch die Feldrahmen der Storefront-UI-Felder (`ring-*`). Gilt für Anmeldung, Registrierung, Gast-Login, Passwort-Seiten, Konto, Adressen in der Kasse, Newsletter, „Benachrichtigen“, Kontakt und Widerruf. Ausgenommen: Suche im Header und Kaufbereich der Produktseite (eigenes Layout); der Preisfilter behält seinen Knopf. Die eigenen Formularseiten des Moduls (Klasse `gj-form`: Kontakt, Widerruf) sind zusätzlich höchstens 36rem breit.

---

## 5. Komponenten

### Header

- Links das **Logo-Feld** in Schieferblau (Haus-Symbol, Teekannen-Grafik, Schriftzug „GLAS IN JENA“). Es ragt nach unten über die Header-Unterkante hinaus.
- **Maße wie im LTS-Shop** (dort nachgemessen): Header überall **92 px** hoch. Das Logo-Bild (136 × 139 px, mit eigenem blauem Hintergrund) füllt die Breite des Logo-Felds:
  - Fensterbreite ab 992 px: Feld und Bild 136 × 139 px, ragt 47 px über den Header hinaus;
  - darunter: Feld 15 % der Header-Breite, das Bild höchstens 136 px breit, seitlich füllt das Logo-Blau (z. B. 991 px → Feld 146 px, Bild 136 px; 900 px → 133 px; 700 px → 105 px);
  - unter 576 px: 18 % der Breite (z. B. 575 px → 104 px, 375 px → 68 px).
  - Die Umschaltpunkte gelten wie im LTS-Shop für die **Fensterbreite** inklusive Scrollbalken (Media-Query), nicht für die Breite des Shop-Containers. Ist das Bild niedriger als der Header, ist das Feld bis zur Header-Unterkante im Blau des Bildes (`--gj-logo-blue`, `#4a677c`) gefüllt und das Logo sitzt unten.
- **Beim Scrollen** bleibt der Header ab 992 px Fensterbreite immer oben stehen (sticky); das Logo behält dabei seine Größe und ragt weiter über den Inhalt, eine geöffnete Suchleiste bleibt mit oben. Darunter scrollt er mit, außer im Shop-Editor ist beim Header „sticky“ eingeschaltet – dann bleibt er auf allen Breiten oben. Sprünge zu Ankern und fokussierten Formularfeldern halten dabei Abstand zu Header und überstehendem Logo (`scroll-padding-top`, 139 px), damit das Ziel nicht darunter verschwindet. Beim Wechsel auf eine andere Seite schließt sich eine offene Suchleiste; Filter auf derselben Seite lassen sie offen.
- Daneben die Hauptnavigation auf Weiß: Tee & Kaffee ▾, Küche & Helfer ▾, Diverses, Gesundheitshelfer, Ersatzteile ▾ (Kategorien kommen aus PlentyONE).
- Rechts als gleich große Blöcke: Konto (hellgrau), Sprachwechsel „English“ (hellgrau), Suche (hellgrau), **Warenkorb (Mittelblau)**. Ab 1200 px ist jede Kachel ein Zwölftel der Header-Breite (100 px bei 1200 px), die vier zusammen also genau so breit wie die Box „Wussten Sie schon“ darunter; zwischen 992 und 1199 px je 68 px, damit die Kategorien Platz haben (Wunsch des Shopbetreibers; im LTS 88 px und schmalere Sprach-Kachel).
- **Symbole** im Header (Menü, Konto, Suche/Schließen, Warenkorb) als dünne Linien-Symbole wie im LTS (`GlasJenaLineIcon.vue`, 28 px, 1,5 px Linien) statt der gefüllten Material-Symbole. Der Sprachwechsel steht in der Schrift der Navigation (14 px, normal, `#263238`).
- **Konto-Kachel** (ab 992 px; darunter „Anmelden“ im Burger-Menü) wie im Original-Header der PWA: nicht angemeldet öffnet ein Klick das Anmeldefenster (Anmelden mit Umschalter „Registrieren“; nach der Anmeldung öffnet sich „Mein Konto“ – Wunsch des Shopbetreibers, im Original lädt die Seite neu); die Kachel bleibt ein Link auf `/login/?redirect=/my-account` (Strg-Klick öffnet die Anmeldeseite in neuem Tab, die danach ebenfalls ins Konto führt; ohne `redirect` führt sie zur Startseite). Angemeldet klappt direkt unter der Kachel (bündig mit ihrer linken Kante) ein Menü mit Mein Konto, Meine Bestellungen und Abmelden auf, gestaltet wie die Untermenüs der Navigation (14 px Text, 36 px hohe Einträge, Rahmen Graublau, aktuelle Seite graublau hinterlegt). Zusätzlich zum Original: Das Fenster ist ein benannter Dialog, der Fokus springt ins erste Feld (Tab bleibt im Fenster, Esc schließt) und kehrt danach dorthin zurück, wo es geöffnet wurde (Kachel bzw. Menü-Knopf). Unter 640 px füllt das Fenster den Bildschirm, darüber steht es mittig (höchstens 512 px breit); Überschrift und Einleitung beginnen bündig mit den Feldern (im Original 32 px eingerückt), und das Cookie-Symbol ist ausgeblendet, solange irgendein Fenster (Anmelden, Adressen, Passwort …) offen ist.
- **Ausloggen** (Kontomenü im Header, mobiles Menü, Konto-Seite) führt auf die Startseite (Wunsch des Shopbetreibers; im Original lädt die aktuelle Seite neu), `logOutToHomePage` in `utils/accountMenu.ts`.
- **Suchleiste** (Klick auf die Such-Kachel) wie im LTS: dunkler Balken direkt unter dem Header, der den Seiteninhalt überlagert statt ihn nach unten zu schieben (Header auf Ebene `z-dropdown` wie der Original-Header), genau so hoch wie der Überstand des Logos (`--gj-logo-overhang`, 47 px), sodass Balken und Logo unten bündig abschließen. Eingabefeld 34 px hoch, mittig, ab 620 px rechts neben dem Logo-Feld (gleiche Breite wie das Logo-Feld plus Abstand), damit es das überstehende Logo nicht verdeckt; unter 620 px über die volle Breite (zwischen etwa 540 und 575 px verdeckt es dabei die unteren 7 px des Logos, bewusst so belassen); die Suchvorschläge klappen darunter auf.
- Der Sprachwechsel wechselt bei nur einer weiteren Sprache per Klick direkt, ohne das Sprachwahl-Feld aufzuklappen (ebenso im mobilen Menü). Nur bei mehreren weiteren Sprachen öffnet er die Auswahl.
- **SEO:** Der Sprachwechsel ist ein echter Link auf die andere Sprachversion (`<a href="/en" hreflang="en" lang="en">`, im mobilen Menü ebenso), damit Crawler ihm folgen können; ein normaler Klick wechselt weiterhin über `switchLocale`, Strg-/Mittelklick öffnet die Sprachversion in einem neuen Tab. Der Alt-Text des Logos kommt aus der Umgebungsvariable `NAME` (`NAME="GLAS IN JENA"`, auch im Live-Shop setzen), sonst steht dort „PlentyONE GmbH logo“.
- Handy: Burger-Menü, Logo kompakt, Warenkorb bleibt sichtbar.
- **Checkout:** wie im LTS-Shop derselbe Header wie auf allen anderen Seiten (Kategorien, Konto, Sprache, Suche, Warenkorb), darunter der Banner „Kasse“ – kein reduzierter Checkout-Header. `GlasJenaSimplifiedHeader.vue` ersetzt dafür den vereinfachten Header des Checkout-Layouts (auch Angebotsseiten); im Shop-Editor bleibt der Original-Header.
- Der Glas-Jena-Header (`GlasJenaHeaderBlocks.vue`) läuft auf allen Geräten. Nur im Shop-Editor wird der Original-Header angezeigt, damit er dort konfigurierbar bleibt. Auf dem Handy entfällt damit auch die untere Navigationsleiste des Original-Headers (wie im LTS-Shop), auch auf den Login-/Registrierungsseiten (`GlasJenaNavbarBottom.vue`). Cookie- und Vorschau-Button rücken auf dem Handy entsprechend nach unten (`glas-jena.css`).

### Mein Konto

- **Eigenes Konto-Layout** (`runtime/layouts/GlasJenaAccountLayout.vue`, ersetzt `layouts/account.vue` über `LAYOUT_OVERRIDES` in `index.ts`; Wunsch des Shopbetreibers): Unter 768 px hat das Kontomenü eine eigene Seite `/my-account/` – auch die Konto-Adresse des LTS-Shops. Jeder Unterpunkt, auch „Persönliche Daten“, blendet das Menü aus; oben links führt „← Mein Konto“ zur Menü-Seite zurück, darunter steht der Name des Unterpunkts. Abweichend vom Original („Zurück“ rechts neben der Überschrift) wie von Apple, Material Design und Nielsen Norman Group empfohlen: Zurück oben links, nach dem Ziel benannt (auch WCAG 2.4.4 „Linkzweck“), 44 px hoch. Im Original ist „Persönliche Daten“ zugleich die Startseite und zeigt auf dem Handy das Menü über den Daten ohne Weg zurück. Ab 768 px bleibt es wie im Original: Menü links, Inhalt rechts; die Menü-Seite öffnet dann die Startseite `/my-account/personal-data/` (`paths.account`). Im Menü fehlen Wunschliste und Retouren. Im ganzen Kontobereich (einschließlich der Adress- und Passwort-Fenster) behalten Überschriften die Schriftstärken des Originals (fett/halbfett); die leichten LTS-Überschriften (300) gelten dort nicht, weil sie bei 18–24 px zu dünn wirken (`glas-jena.css`, Typografie). Die Fenster des Kontos (Name, Passwort, Adressen) verhalten sich wie das Anmeldefenster: unter 640 px bildschirmfüllend, darüber mittig und 600 px breit (Original: bildschirmfüllend bis 767 px). „Ändern“ (z. B. beim Passwort), „Bearbeiten“, „Löschen“ und „Als Standard festlegen“ bei den Adressen sehen aus wie die übrigen Links (bei den Adressen 12 px unter der letzten Zeile statt 20 px): Linkfarbe, unterstrichen, 16 px, 44 px hohe Klickfläche (Original: kleine Knöpfe, 14 px, ohne Unterstreichung). „Neue Rechnungsadresse“/„Neue Lieferadresse“ und „Ausloggen“ im Kontomenü sind Knöpfe mit Rahmen: weiß, Rahmen und Schrift Schieferblau (5,70:1), 44 px hoch – im Original zeichnet der flache Look den Rahmen (Schatten) weg, „Ausloggen“ ist dort ein anklickbarer Listeneintrag statt eines per Tastatur erreichbaren Knopfs. Zwischen den Adressen etwa 24 px statt 49 px. Handy- oder Breitansicht richtet sich durchgehend nach der Fensterbreite (768 px); das Original mischt Fenster- und Inhaltsbreite, sodass bei 768–783 px weder Menü noch Zurück-Link zu sehen waren. Ebenso die Seitentitel rechts neben dem Menü (`account-orders-heading`): ab 768 px Fensterbreite immer sichtbar, darunter nie – im Original hing das von der Scrollleiste ab (kurze Seiten mit, lange ohne Titel). Die Abschnitte („Kontoeinstellungen“, „Bestellungen …“) haben echte Überschriften (h2, fett, 18 px), die sich klar von den Links darunter (16 px, normal, 16 px weiter eingerückt als der Überschriftentext) abheben; im Original sind sie nur Listeneinträge in mittlerer Schriftstärke.
- „Mein Konto“ im mobilen Menü führt auf die Menü-Seite, im Kontomenü des Headers (ab 992 px) auf die Startseite.
- **Weiterleitung** (`runtime/middleware/accountRedirect.ts`, global): Kontoseiten ohne Schrägstrich am Ende bekommen ihn wie alle Shop-Links (PlentyONE-Einstellung „Trailing slash“, 301), sonst erkennt das Layout die aktuelle Seite nicht.
- Ausgeloggt führt der Login danach direkt auf die korrigierte Adresse.

### Seitenbanner (wie im LTS-Shop)

Umgesetzt in `GlasJenaPageBanner.vue` (Titel: `usePageBanner`, Zuordnung in `utils/pageBanner.ts`); wird direkt unter dem Header ausgegeben – von `GlasJenaHeaderBlocks.vue` auch im Checkout (siehe Header); nicht im Shop-Editor.

- Alle Seiten außer **Startseite und Artikelseiten** haben unter dem Header einen Banner mit unscharfem Hintergrundbild (`runtime/assets/page-banner.jpg`, aus dem LTS-Shop) und dem Titel mittig: Höhe 12 % der Fensterbreite (70–120 px), so breit wie die Header-Box, 28 px Abstand nach unten; das Logo ragt links hinein, der Titel hält dessen Breite auf beiden Seiten frei.
- Titel als **`<h1>`**, Light, `#555`, 40 px (unter 992 px 36, unter 768 px 32, unter 576 px 30, unter 480 px 24 px wie im LTS). Lange Titel brechen um, der Banner wächst mit.
- Titel: Kategorieseiten der Kategoriename, Suche und Tags „Suchergebnisse für …“, alle Kontoseiten „Mein Konto“, Checkout „Kasse“, Fehlerseiten wie im LTS „Fehler 404“ bzw. „Fehler 500“ (eigener Text im Banner, „Error …“ auf Englisch), sonst der feste Seitenname (Warenkorb, Kontakt, AGB, Impressum, Anmelden …). Neue Seiten mit festem Titel in `PAGE_BANNER_TITLE_KEYS` eintragen.
- Die Überschriften der Original-Seiten, die den Titel wiederholen (Kategoriename im Block „Category Data“, Suchergebnisse, Warenkorb/Kasse, Kontakt, „Mein Konto“, Passwort-Seiten), sind bei sichtbarem Banner per CSS ausgeblendet (`glas-jena.css`). Die Rechtstexte behalten ihre eigenen Überschriften.
- **Brotkrumen-Leiste:** auf Artikelseiten immer sichtbar, auf Kategorieseiten nur unter 992 px Fensterbreite (dort ist die Kategorienavigation im Burger-Menü), auf allen anderen Seiten (z. B. Mein Konto) ausgeblendet (`glas-jena.css`, erkennt Kategorieseiten an der Klasse `gj-page-banner--category` des Banners).

### Hauptnavigation (wie im LTS-Shop)

Umgesetzt in `apps/web/modules/glas-jena/runtime/components/GlasJenaNavigation.vue` (Hauptleiste) und `GlasJenaNavigationMenu.vue` (Dropdown-Ebenen).

- **Desktop (ab 992 px Fensterbreite, wie im LTS-Shop):** Hauptkategorien gleich breit und zentriert in einer Zeile, Kategorien mit Unterkategorien mit ⌄-Pfeil. Zwischen 992 und 1199 px wie im LTS ohne seitlichen Innenabstand der Kategorie-Links, damit auch „Gesundheitshelfer“ passt. Header-Links sind nicht unterstrichen.
- **Hover** öffnet eine schmale Liste der 2. Ebene direkt unter der Kategorie (kein Mega-Menü über die ganze Breite).
- Unterkategorien mit ›-Pfeil klappen beim Hovern als **Flyout nach rechts** auf, bis zur 4. Ebene (z. B. Tee & Kaffee → Teekannen → mit Glasfilter → kleiner 1 L). Droht ein Flyout rechts aus dem Bild zu ragen, öffnet es sich nach links.
- **Hover-Verzögerung** (`NAVIGATION_HOVER_DELAY_MS`, 200 ms): Ist ein Flyout offen, übernimmt ein anderer Eintrag erst, wenn die Maus kurz darauf verweilt. Wer schräg ins Flyout fährt und dabei einen Nachbareintrag streift, verliert es nicht. Beim Verlassen der Navigation schließt das Menü ebenfalls erst nach dieser Zeit. Entlang der Hauptleiste wechseln die Dropdowns sofort.
- **Klick** auf eine Kategorie führt immer direkt zur Kategorieseite; das Menü schließt sich danach.
- **Aktueller Pfad** blaugrau hinterlegt (`--gj-tile-grey-blue`): die aktuelle Kategorie und alle übergeordneten Kategorien in allen Ebenen, auch auf Artikelseiten darunter (z. B. auf „mit Glasfilter“: Tee & Kaffee, Teekannen und mit Glasfilter). Hover hellgrau (`#f8f9fa`); eckig, ohne Schatten. Die Hauptleiste schließt unten mit einer Linie in derselben Farbe wie der Dropdown-Rahmen ab; die Oberkante des Dropdowns liegt genau darauf.
- **SEO:** Alle Ebenen werden immer gerendert und nur ausgeblendet. Damit stehen alle Kategorie-Links im Server-HTML, wie im LTS-Shop.
- **Touch-Geräte** (z. B. Tablet quer): erstes Antippen öffnet die Unterkategorien, zweites Antippen öffnet die Kategorie. Antippen außerhalb schließt das Menü.
- **Tastatur** (Muster einer WAI-ARIA-Menüleiste): In der Hauptleiste wechseln ←/→ die Kategorie; Fokus (auch per Tab) öffnet das Dropdown, ↓ springt hinein. Im Dropdown bewegen ↑/↓ innerhalb der Ebene, → öffnet das Flyout und springt hinein, ← schließt es und geht eine Ebene zurück. Enter öffnet die Kategorie, Escape schließt das Menü und springt zur Hauptkategorie zurück.
- Umschaltpunkt Navigation ↔ Burger-Menü: eigener nuxt-viewport-Breakpoint `gjDesktopNavigation` (992 px), vom Modul ergänzt; der Shop-Breakpoint `lg` (1024 px) bleibt unverändert.
- Die Kategorien kommen aus dem Block „Navigation“ im Header bzw. aus dem Kategoriebaum von PlentyONE (`useGlasJenaCategoryTree`, gemeinsam für Desktop und Handy).

### Mobiles Menü (unter 992 px, wie im LTS-Shop)

Umgesetzt in `GlasJenaMobileNavigation.vue`, geöffnet über den Burger im Header (bzw. alles, was `useMegaMenu().open()` aufruft).

- **Vollbild, dunkel** (`#2e3233`, weiße Schrift), liegt über der ganzen Seite (per Teleport in `<body>`, Ebene `z-modal-backdrop`); die Seite dahinter scrollt nicht mit.
- Öffnet auf der **Ebene der aktuellen Kategorie**: deren Unterkategorien, bei Kategorien ohne Unterkategorien die Geschwister. Ohne aktive Kategorie die Hauptkategorien.
- **Pfadleiste** oben (weiß): 🏠 / Tee & Kaffee / Teekannen – jedes Glied springt auf diese Ebene; rechts ✕ zum Schließen.
- Beim Ebenenwechsel **gleitet** die neue Ebene herein (200 ms): tiefer von rechts, zurück von links. Bei „Bewegung reduzieren“ im Betriebssystem ohne Animation.
- **Zurück-Taste** (Android, Wischgeste bei iOS) schließt das Menü, statt die Seite zu verlassen (`useMenuHistoryEntry`: solange das Menü offen ist, gibt es einen Verlaufseintrag mit derselben URL). Nach einem Link aus dem Menü führt ein Zurück direkt zur vorherigen Seite.
- **Fokus:** Beim Öffnen springt der Fokus auf ✕, beim Schließen zurück auf den Menü-Button; Tab bleibt im Menü.
- Darunter ‹ („eine Ebene hoch“, Gegenstück zum › der Unterkategorien), dann die Kategorien: Name öffnet die Kategorie, › zeigt die Unterkategorien. Kategorien auf dem Pfad zur aktuellen Seite sind halbfett.
- Nach einer Trennlinie in Hellblau (`#abcae4`), in dieser Reihenfolge (Wunsch des Shopbetreibers): **Language / Sprache** (alle Shopsprachen in ihrem eigenen Namen), dann für Gäste **Anmelden** und **Konto erstellen** – beide öffnen das Anmeldefenster des Headers, auf dem Handy bildschirmfüllend, „Konto erstellen“ gleich mit der Registrierung; sie bleiben Links auf `/login/` bzw. `/register/`. Angemeldet stehen dort direkt dieselben Einträge wie im Kontomenü des Headers: **Mein Konto** (hier die Menü-Seite `/my-account/`, siehe „Mein Konto“), **Meine Bestellungen** und **Ausloggen**, ohne Untermenü. Wie im LTS bleiben die Kategorien stehen: Ein Klick auf Sprache wechselt nur den Bereich unter der Trennlinie (mit ‹ zurück); die Pfadleiste zeigt weiter nur den Kategoriepfad. Auch die Sprachliste ist hellblau (`#abcae4`); die aktive Sprache ist halbfett und hat rechts einen Haken ✓ (für Screenreader `aria-current`).
- **SEO:** Alle Ebenen werden immer gerendert und nur ausgeblendet, so stehen alle Kategorie-Links auch im Server-HTML für Handys („mobile first“-Indexierung).
- **Header mit Burger-Menü** (unter 992 px Fensterbreite, Handy und Tablet) wie im LTS: Logo-Feld (Breite siehe Header), daneben Menü, Suche und Warenkorb als drei gleich breite Kacheln über die volle Breite. Konto und Sprache stehen im Menü. Ab 992 px kommen Hauptnavigation, Konto und Sprache in den Header.

### Startseite (Reihenfolge)

**Umsetzung (bis „Unser hitzebeständiges Glas“):** Editor-Blöcke auf der Startseite, jeweils in einem Raster (MultiGrid) mit Abstand „None“, Rand unten 0 und „Full width“ (Box-Breite 1200 px); Tablet-Spaltenbreiten wie auf dem Desktop (8/4, 12, 6/6); unter 992 px Fensterbreite stehen die Spalten wie im LTS untereinander (`glas-jena.css`, für Raster mit Titelbild oder Kacheln; der Raster-Block selbst schaltet bei 768 und 1024 px, im Editor nach dem Geräte-Umschalter).

- Raster 8/4: links Block **„Hero image (GLAS IN JENA)“** (`GlasJenaHeroImage`, Modul), rechts **„Did you know“** (Fakten aus dem LTS, Autoplay 6 s, Hintergrund `#4a677c`, Innenabstand 30 px; auf Wunsch des Shopbetreibers Überschrift 26 px und feine Linienpfeile 2,75rem (44 px), 96 px auseinander, `glas-jena.css`). Das Titelbild füllt seine Spalte und wird von oben beschnitten: neben der Box 391 px wie im LTS (die Box ist ab 992 px fest 391 px hoch, Abstände enger, Überschrift 22–26 px und Fakten 14–16 px je nach Fensterbreite, Zeilenhöhe 1,35; so wird das Bild nur über die Breite skaliert und nie vergrößert), untereinander 47 % der Fensterbreite (höchstens 440 px). **Bildfolge** (Wunsch des Shopbetreibers): Der Block zeigt mehrere Bilder nacheinander (Vorlage „Image sequence“). Es sind die acht Bilder im Webspace-Ordner `layout/Grafiken/slider` (`slider-01` bis `slider-08`), je in 500, 800 und 1000 px (`-501`, `-801`, `-1001.jpg`). Jedes Bild steht 20 Sekunden (im Editor einstellbar, mindestens 3), dann blendet das nächste in 2 s über ihm ein. Der Browser wählt die Bildgröße per `srcset` nach Fensterbreite und Bildschirmschärfe. Nur das erste Bild gehört zur Seite, jedes weitere wird einen Schritt vorher geladen. Screenreader bekommen nur den Alternativtext des sichtbaren Bildes. Bei „Bewegung reduzieren“ bleibt das erste Bild stehen, in einem verdeckten Browser-Tab wird nicht weitergeschaltet. Ältere Blockdaten mit einem einzelnen Bild (`image`) werden als ein Bild der Folge gelesen.
- Raster 12: Textblock im **HTML-Modus** mit `<h1 class="gj-home-headline"><span class="gj-home-headline__name">GLAS <span class="gj-home-headline__in">in</span> JENA</span><span class="gj-home-headline__dash"> - </span><span class="gj-home-headline__claim">Der Spezialist für hitzebeständiges Glas</span></h1>` (einzige h1 der Seite; Größen in `glas-jena.css`). Einzeilig, wo es passt; sonst Umbruch zwischen Name und „Der Spezialist …“ ohne Bindestrich (Wunsch des Shopbetreibers, Container-Abfrage in `glas-jena.css`). Im Raster, weil nur dort der automatische Blockabstand entfällt (LTS: 20 px über und unter der Überschrift).
- Raster 6/6: zweimal Block **„Tile (GLAS IN JENA)“** (`GlasJenaTile`, Modul) mit den Vorlagen „Werksverkauf“ und „Unser hitzebeständiges Glas“: Titel (h2), Text (Rich Text), Bild am rechten Rand (Karaffe), Listenpunkte in Light (300, Wunsch des Shopbetreibers), „Mehr“-Link unten rechts (leer = kein Knopf; Werksverkauf auf www.glas-in-jena.de in neuem Tab). Nebeneinander mindestens 388 px und gleich hoch; unter 992 px Fensterbreite zugeklappt wie im LTS, der Titel ist dann ein Knopf mit Pfeil (`aria-expanded`), der Text bleibt im HTML.
- Raster 4/4/4 (Kategorie-Kacheln, noch nicht im Editor angelegt): dreimal **„Tile (GLAS IN JENA)“** mit den Vorlagen „Tee & Kaffee“, „Küche & Helfer“, „Gesundheitshelfer“: Titel in eigener Farbe, Bild mittig unter dem Titel (höchstens 228 px hoch, unten bündig in einer gleich hohen Fläche, damit die Bilder nebeneinander auf einer Linie stehen), die ganze Kachel ist der Link zur Kategorie (ein Link „Mehr“, dessen Fläche die Kachel abdeckt; Fokusrahmen um die Kachel), beim Überfahren wächst das Bild um 6 % (ab 576 px, nicht bei „Bewegung reduzieren“), nicht zuklappbar; auf dem Handy (unter 768 px) niedriger: 244 statt 378 px, Bild höchstens 152 px hoch (Wunsch des Shopbetreibers). Bilder aus dem LTS (Hintergrund in der Kachelfarbe eingefärbt; Artikelfotos mit per CSS eingefärbtem Hintergrund wurden probiert und verworfen). Hintergründe wie im LTS (`#abcae4`, `#d6e3ed`, `#d1c4e9`), Titel abgedunkelt auf mindestens 3:1 (`#4d6f89`, `#5681ab`, `#8a5c99`; LTS 2,2–2,6:1).
- Raster 12 „Unsere Topseller“: Block **„Item carousel (GLAS IN JENA)“** (`GlasJenaProductCarousel`, Modul) mit der versteckten PlentyONE-Kategorie „Topseller“ (ID 385, nicht in der Navigation, Robots noindex; 26 Artikel aus dem LTS). Blaue Leiste mit der Überschrift (h2, 28 px Light, `#6a94b4` statt LTS `#6e9abb`: Weiß 3,23:1 statt 2,999:1), darunter das Karussell der PWA (`ProductSlider`, Artikelkarten des Shops, ohne Bewertungssterne: die Editor-Einstellung „Item card“ gilt nur für Kategorieseiten) mit vier Artikeln pro Ansicht, drei unter 992 px, zwei unter 576 px, feine Linienpfeile wie in der Box „Wussten Sie schon“ (2,75rem, Leistenblau) links und rechts im Rand, immer beide sichtbar, Blättern im Kreis wie im LTS und an den Kartenkanten einrastend, auf dem Handy ohne Pfeile (Wischen); Preis-Hinweis 8 px unter den Karten und über dem nächsten Block (Wunsch des Shopbetreibers). Reihenfolge zufällig wie im LTS (dort bei jedem Laden anders), bis zu 50 Artikel; die Artikel werden auf dem Server geladen (Links im HTML für Suchmaschinen). Der PWA-Block „Empfohlene Artikel“ taugt nicht: höchstens 20 Artikel, fest nach Preis sortiert, erst im Browser geladen.
- Raster 9/3 „trendglas® in Jena“ (SEO-Text) mit grünem Raster-Hintergrund `#dcedc8`: links Textblock im HTML-Modus `<div class="gj-home-seo"><h2>…</h2><p>…</p></div>` in zwei Absätzen (Glas und Rohstoffe, Herstellung) mit internen Links (hitzebeständiges Glas → „Unser hitzebeständiges Glas“, Glasgefäße → „Küche & Helfer“), rechts Textblock `<p class="gj-home-seo-image"><img …></p>` mit dem Glasdosen-Bild des LTS (in der Editor-Bildverwaltung hochgeladen, 230 × 266 px, beschreibender Alternativtext; mittig zur Texthöhe, Innenabstand des Bildblocks oben/unten 25, links/rechts 30 px). Unter 992 px untereinander.
- **Suchmaschinen (Titel, Beschreibung):** Im Editor unter SEO » Meta data defaults und Social Media » Open Graph. Gespeichert sind Titel „Hitzebeständiges Glas aus Jena“, eine Beschreibung von etwa 140 Zeichen, die Keywords aus dem LTS und das Titelbild als Vorschaubild beim Teilen. Der Open-Graph-Titel „OnlineMarket -GLAS in JENA-“ hängt als Shopname hinter jedem Seitentitel. Diese Editor-Werte gelten für alle Sprachen. Für die englische Startseite setzt das Modul deshalb eigene Texte (`HOME_SEO_TEXTS` in `utils/home.ts`, Plugin `homeSeo`, mit hoher Priorität vor den Werten aus `app.vue`). Deutsch nutzt die Editor-Werte.
- **Abweichungen für Barrierefreiheit:** Text 16 statt 14 px (Kacheln und Box werden dadurch etwas höher als im LTS); blaue Kachel `#4b7aa0` statt `#6e9abb` (weiße Schrift 4,57:1 statt 3,00:1); „Mehr“ mit dunkler Schrift `#263238` auf 45 % Weiß (11,7:1 bzw. 6,3:1 statt 1,0:1 und 2,0:1); Pfeil zum Aufklappen in der Textfarbe statt Hellblau (1,38:1); Links in den Kacheln unterstrichen in der Textfarbe; Alternativtext des Titelbilds beschreibend statt „banner-startseite“.

1. **Hero:** links großes Stimmungsbild (Teekanne mit Gläsern), rechts Box „Wussten Sie schon, dass…“ in Schieferblau mit Fragezeichen-Symbol und Pfeilen zum Durchblättern mehrerer Fakten. Beispiel: „… alle unsere hitzebeständigen Artikel vor dem Verpacken auf ca. 600 °C aufgeheizt und langsam abgekühlt werden. Damit werden Spannungen im Glas vermieden.“
2. **Überschrift:** „GLAS IN JENA – Der Spezialist für Hitzebeständiges Glas“ (groß, Light, zentriert; „IN“ hochgestellt).
3. **Zwei Kacheln nebeneinander:**
   - _Werksverkauf_ (Zartgrün): „Deutschlands größte Auswahl an hitzebeständigem Glas“, „Kristallglas – **Made in Germany**“, Adresse GLAS IN JENA, Westbahnhofstraße 8, 07745 Jena, Deutschland; Öffnungszeiten Mo–Fr 10:00–18:00 Uhr, Sa 10:00–13:00 Uhr; Link „» Zur Kartenansicht“; Produktbild Karaffe; „Mehr“-Button.
   - _Unser hitzebeständiges Glas_ (Mittelblau, weiße Schrift): Häkchen-Liste mit den Vorteilen (Lebensmittelzubereitung, porenfrei und hygienisch, gibt keine Inhaltsstoffe ab – für Allergiker (zusätzlich zum LTS, Wunsch des Shopbetreibers), Backen/Garen/Servieren/Kühlen/Einfrieren bis -35 °C, hitzebeständig bis 450 °C, mikrowellen- und spülmaschinengeeignet, ofentauglich, resistent gegen Temperaturwechsel bis 150 °C); „Mehr“-Button.
4. **Drei Kategorie-Kacheln:** Tee & Kaffee (Hellblau), Küche & Helfer (Blaugrau), Gesundheitshelfer (Flieder); je Überschrift, Produktbild, „Mehr“-Button.
5. **Topseller:** Balken „Unsere Topseller“ in Mittelblau, darunter Karussell mit Pfeilen links/rechts, 4 Artikel auf Desktop.
6. **Textblock „trendglas® in Jena“** (Zartgrün): SEO-Text links, Bild mit gestapelten Glasdosen rechts. Text aus dem LTS-Shop übernehmen.

### Artikelkarte

- Weißer Hintergrund, Produktbild freigestellt.
- Oben rechts eine **Dreieck-Ecke** in Blaugrau mit Warenkorb-Symbol (In-den-Warenkorb); das Symbol sitzt 7,2 px von oberer und rechter Kante, gut im Dreieck (Wunsch des Shopbetreibers, `glas-jena.css`).
- Darunter Artikelname (16 px), Preis groß und rechtsbündig (20 px, direkt unter dem Namen, darunter 4 px Abstand; Wünsche des Shopbetreibers, `glas-jena.css`) mit „\*“, Hinweis „\* inkl. ges. MwSt. zzgl. Versandkosten“ (Versandkosten als Link).
- **Kein Herz / keine Wunschliste** (siehe unten).

### Keine Wunschliste

Der Shop bietet keine Wunschliste (wie der LTS-Shop).

**Im Shop-Editor abschalten** (Regel „Shop-Editor zuerst“). Kategorie- und Artikelseiten haben je **eine gemeinsame Vorlage** für alle Kategorien bzw. Artikel; die Einstellung wird dort einmal gesetzt, nicht auf einzelnen Seiten:

1. Linke Leiste, oberstes Symbol (Seiten, „Open pages drawer“) → ganz unten Abschnitt **„Page Layouts“**.
2. **„Product category page“ → „Edit page“**: Block mit der Artikelliste anklicken → Bereich **„Item card“** → **„Show wishlist button“** aus.
3. **„Product detail page“ → „Edit page“**: Block **Price Card** anklicken → Feld **„Add to wishlist“** aus.
4. Nur im Vorschau-Modus speichern.

Außerdem im Header, Block **Utility Bar**, Aktionen: „Wishlist“ aus (wirkt nur im Editor, der Shop nutzt den Glas-Jena-Header).

**Im Modul erledigt** (Stellen ohne Editor-Einstellung, in Originaldateien):

- Die Seiten `/wishlist` und `/my-account/wishlist` sind entfernt (`pages:extend` in `modules/glas-jena/index.ts`); alte Links landen auf der 404-Seite.
- Das Kontomenü (`GlasJenaAccountLayout.vue`) hat keinen Abschnitt „Wunschliste“; der Vorteil „Wunschliste“ im Registrierungsformular ist per CSS ausgeblendet (`glas-jena.css`, dafür gibt es keine Editor-Einstellung).
- **Keine Retouren über den Shop:** Die Seiten `/my-account/returns/` und `/my-account/new-return/…` sind entfernt (404, `REMOVED_PAGE_FILES` in `index.ts`), „Retouren“ fehlt im Kontomenü, „Zurücksenden“ bei den Bestellungen ist per CSS ausgeblendet, der Knopf „Artikel zurücksenden“ auf der Bestellbestätigung ersetzt (`GlasJenaNoReturns.vue`). Ob eine Bestellung retournierbar ist, liefert PlentyONE; dort lassen sich Retouren zusätzlich abschalten.
- **„Meine Bestellungen“ als eigene Seite** (`GlasJenaMyOrders.vue`, ersetzt `pages/my-account/my-orders.vue`; Wunsch des Shopbetreibers): Das Original zeigt auf dem Handy eine lange Liste und ab 768 px eine Tabelle, die neben dem Kontomenü abgeschnitten wird (seitlich scrollbar, aber ohne sichtbare Leiste). Stattdessen ein Aufbau für alle Breiten, der sich nach der Breite des Inhaltsbereichs richtet (Container-Abfrage): ab 40rem eine Zeile je Bestellung unter Spaltenköpfen (Auftrags-ID, Auftragsdatum, Summe rechtsbündig, Lieferdatum, Status, Details), schmaler zwei Spalten mit Beschriftung über jedem Wert. Auftrags-ID und Summe brechen nie um. Ohne Drei-Punkte-Menü („Erneut kaufen“, „Zurücksenden“ – beides gibt es im Shop nicht). „Details“ ist ein Link (Linkfarbe `#2c5572`, unterstrichen). Für Screenreader eine Liste mit Begriff/Wert-Paaren je Bestellung. Spaltenbeschriftung „Summe“ statt „Anzahl“ im Übersetzungs-Editor (`account.ordersAndReturns.amount`). Auf der Bestellbestätigung (zugleich die Detailseite einer Bestellung) fehlen ebenfalls „Erneut kaufen“ und „Einkauf fortsetzen“ (per CSS). An dieser Stelle steht für angemeldete Kunden der Knopf „Zurück zur Übersicht“ zu „Meine Bestellungen“ (`OrderAgainButton` ersetzt durch `GlasJenaOrderBackLink.vue`). Gäste haben keine Übersicht und sehen dort keinen Knopf.
- **Auftragsdatum ohne Uhrzeit** (Wunsch des Shopbetreibers), in der Bestellliste, den Bestelldetails und auf der Bestellbestätigung: `orderGetters.getDate` liefert Datum und Uhrzeit; das Plugin `orderDate` ersetzt den Getter durch `formatOrderDate` (`utils/orderDate.ts`), damit die Originalseiten nicht kopiert werden müssen.
- Die untere Navigationsleiste (mit Wunschliste) ist auch auf den Login-/Registrierungsseiten ersetzt (`GlasJenaNavbarBottom.vue`, rendert nichts) – das Handy sieht dort aus wie im restlichen Shop.

### Cookie-Banner

Umgesetzt in `GlasJenaCookiebar.vue` (ersetzt die Original-Komponente `Cookiebar`). Neu ist nur die Oberfläche; Einwilligung, Cookie-Gruppen und Speicherung kommen unverändert aus `useCookieBar` von plentymarkets. Die Gruppen und Cookies selbst werden in PlentyONE bzw. in der Cookie-Konfiguration des Shops gepflegt.

- **Flache Leiste unten:** weiß über die ganze Fensterbreite, oben eine 3-px-Linie in Schieferblau von ganz links bis ganz rechts, kein Schatten, eckig. Der Inhalt steht in der Breite der Header-Box (1200 px).
- **Erste Ebene:** Überschrift „Ihre Privatsphäre“ (Light), kurzer Text, Links zu Datenschutzerklärung und Impressum; drei Buttons: „Alle akzeptieren“ und „Ablehnen“ gleich groß in Schieferblau, „Einstellungen“ hellgrau. Ab 768 px Text links, Buttons rechts in einer Reihe; darunter Akzeptieren und Ablehnen nebeneinander, Einstellungen darunter (auf dem Handy ca. 37 % der Bildschirmhöhe).
- **Einstellungen:** „Cookie-Einstellungen“ mit den Gruppen; optionale Gruppen mit Schalter (ein Schalter schaltet alle Cookies der Gruppe), notwendige mit „Immer aktiv“. „Mehr Informationen“ zeigt Anbieter, Zweck, Laufzeit und Datenschutz-Link je Cookie (externe Links in neuem Tab). Buttons: „Auswahl speichern“, „Alle akzeptieren“, „Zurück“.
- **Cookie-Symbol** unten links (Schieferblau, 44 × 44 px) öffnet den Banner jederzeit wieder, damit die Einwilligung geändert oder widerrufen werden kann.
- **Texte:** Die Kurztexte (Deutsch/Englisch) stehen in der Komponente (`<i18n>`), Gruppennamen und Cookie-Details aus den Shop-Übersetzungen. **Kurztext vor dem Livegang von der Datenschutzberatung freigeben lassen.**
- **Rechtlich:** „Ablehnen“ auf der ersten Ebene gleichwertig zu „Akzeptieren“; optionale Gruppen nicht vorab einschalten.

### Footer

Umgesetzt in `GlasJenaFooterBlocks.vue` (Links in `utils/footer.ts`); im Shop-Editor bleibt der Original-Footer.

- **Eine dunkle Leiste** wie im LTS-Shop (`#263238`, 80 px hoch, über die ganze Fensterbreite; Links und Copyright stehen in der Breite der Header-Box): links AGB, Widerruf, Datenschutz, Versand, Kontakt, Impressum (weiß, Regular statt Light des LTS – auf dunklem Grund besser lesbar); **rechts die Zahlungssymbole** PayPal, Kreditkarte, Vorkasse, Apple Pay, Google Pay wie im LTS (weiße, leicht abgetönte Piktogramme; Liste in `utils/footer.ts`, SVGs in `assets/payment`) **und dahinter das Copyright** „© [aktuelles Jahr] GLAS IN JENA“ (Jahr automatisch). Keine helle Zeile darunter, kein „webdesign by“.
- **Links wie im LTS:** jeder Link eine Fläche über die volle Leistenhöhe (28 px oben/unten, 18 px seitlich, 992–1199 px: 10 px); beim Hover wird die Fläche heller (`#37474f`, deutlich sichtbar; das dunklere `#1f282d` des LTS war kaum zu erkennen), keine Unterstreichung. Ein Link bricht nie um, die Links stehen ab 768 px in einer Zeile (Deutsch und Englisch). Passen Zahlungssymbole und Copyright nicht mehr daneben, rutschen sie gemeinsam in eine eigene Zeile, dann steht alles mittig, getrennt durch eine feine Linie über die ganze Fensterbreite wie auf dem Handy (die Komponente misst das, weil die Texte je Sprache verschieden lang sind). Englische Linktexte: T&Cs, Cancellation, Privacy policy, Shipping, Contact, Legal disclosure.
- Handy (unter 768 px): Links als zentrierte Flächen in **zwei Spalten** über die volle Breite (25 px oben/unten, feine Trennlinien, etwa halb so hoch wie die eine Spalte des LTS), Zahlungssymbole und Copyright zentriert darunter.
- Die festen Knöpfe unten (Cookie-Symbol links, „Nach oben“ rechts) verdecken am Seitenende nichts: Die Leiste hält ihre Breite frei. Vorschau- und Editor-Knöpfe sehen Kunden nicht; auf sie nimmt das Design keine Rücksicht.
- **„Nach oben“:** ab 768 px ein schwebender Knopf unten rechts im Aussehen des Cookie-Knopfs (44 × 44 px, Schieferblau, weißes Symbol, 8 px vom Rand), erscheint nach 300 px Scrollen – auch mit der Editor-Oberfläche, in der nur der Seitenbereich scrollt. Auf dem Handy stattdessen wie im LTS eine Leiste (45 px) mit Pfeil über die ganze Breite am Ende der Seite, abweichend vom hellblauen LTS (`#abcae4`) in Mittelblau wie die Warenkorb-Kachel im Header (`#6E9BBF`; weißer Pfeil 2,96:1 statt 1,71:1).

### Tablet-Ansicht (ca. 768–1279 px)

- Header: Logo-Feld unter 992 px Fensterbreite 15 % breit (Bild höchstens 136 px) und steht über. Unter 992 px Hauptnavigation als Burger-Menü; daneben nur Suche und Warenkorb, Konto und Sprache stehen im Menü.
- Hero: Bild und „Wussten Sie schon“-Box nebeneinander (etwa 60/40); im Hochformat untereinander.
- Werksverkauf und „Unser hitzebeständiges Glas“: untereinander, jeweils volle Breite.
- Kategorie-Kacheln: zu dritt nebeneinander (im Hochformat notfalls 2 + 1).
- Topseller-Karussell: 3 Artikel pro Ansicht, wischbar und mit Pfeilen.
- Textblock „trendglas® in Jena“: Bild neben dem Text im Querformat, darunter im Hochformat.
- Footer: Links in einer Zeile, Zahlungssymbole und Copyright rechts.
- Alle Schaltflächen und Iconfelder groß genug für Finger (mindestens 44 × 44 px).

### Handy-Ansicht (unter 768 px)

- Header: Logo-Feld schmal (15–18 % der Breite); ab etwa 600 px steht es wie im LTS-Shop leicht über. Burger-Menü links oder rechts, Warenkorb immer sichtbar, Suche als Symbol.
- Kacheln stapeln sich untereinander (volle Breite).
- Hero: Bild oben, „Wussten Sie schon“-Box darunter.
- Topseller-Karussell mit 1–2 Artikeln pro Ansicht, wischbar.
- Footer: Links in zwei Spalten, Zahlungssymbole und Copyright zentriert darunter.

### Test

Jede Seite in diesen vier Breiten prüfen: ca. 390 px (Handy), 820 px (Tablet hoch), 1180 px (Tablet quer) und 1440 px (Desktop).

---

## 6. Offene Punkte

- [ ] Exakte Farbwerte und Schrift aus dem LTS-CSS übernehmen.
- [ ] Artikeldaten prüfen: Viele Artikel zeigen „1 Milliliter“ als Einheit – vermutlich falsche Inhalts-/Grundpreis-Einheit in PlentyONE (betrifft PWA und LTS gleichermaßen).
- [x] Copyright-Jahr im Footer automatisch setzen.
- [x] Alle „Wussten Sie schon“-Fakten aus dem LTS-Shop sammeln (14 deutsche und 14 englische; gehören in den Block „Did you know“ der Startseite).
- [ ] Englische Texte für den Sprachwechsel prüfen.
- [x] SEO mobil: Das Server-HTML für Handys enthält jetzt alle Kategorie-Links (mobiles Menü, siehe oben).
