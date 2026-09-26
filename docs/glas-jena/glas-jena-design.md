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

| Verwendung                                                                         | Farbe                                                |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Schieferblau – Logo-Feld, Box „Wussten Sie schon“                                  | `#4B6A82`                                            |
| Mittelblau – Warenkorb-Button, Topseller-Balken, Box „Unser hitzebeständiges Glas“ | `#6E9BBF`                                            |
| Zartgrün – Werksverkauf, Textblock „trendglas® in Jena“                            | `#DDEBC8`                                            |
| Kachel Tee & Kaffee                                                                | `#A9C9E3`                                            |
| Kachel Küche & Helfer                                                              | `#D6E1EA`                                            |
| Kachel Gesundheitshelfer                                                           | `#D4C8E8` (Überschrift darin violett, ca. `#9B6FB5`) |
| Header-Iconfelder (Konto, Sprache, Suche)                                          | Hellgrau, ca. `#F0F0F0` / `#E6E6E6`                  |
| Footer oben                                                                        | Fast schwarz-blau, ca. `#253038`                     |
| Footer unten (Copyright-Zeile)                                                     | Sehr helles Grau, ca. `#F7F7F7`                      |
| Fließtext                                                                          | Dunkelgrau, ca. `#444444`                            |
| Links (z. B. „Versandkosten“)                                                      | Mittelblau `#6E9BBF`                                 |

---

## 3. Typografie

- Schrift: **Source Sans Pro** (bzw. Nachfolger _Source Sans 3_), Fallback `sans-serif`.
- Überschriften: groß, **Light** (Schriftstärke 300), viel Luft.
- Fließtext: Regular, gut lesbar, großzügige Zeilenhöhe.
- Preise: kräftig (Semibold/Bold), Sternchen-Hinweis klein darunter.

---

## 4. Gestaltungsprinzipien

- **Flat und eckig:** keine abgerundeten Ecken, keine Schatten.
- **Geboxtes Layout:** Inhalt auf feste Maximalbreite zentriert, mit Rand links und rechts (Desktop).
- **Farbflächen als Gestaltungsmittel:** Inhalte stehen in vollflächig gefärbten Kacheln.
- **„Mehr“-Buttons:** halbtransparente helle Fläche unten rechts in der jeweiligen Kachel, Schrift Light.

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
- Rechts als gleich große Blöcke: Konto (hellgrau), Sprachwechsel „English“ (hellgrau), Suche (hellgrau), **Warenkorb (Mittelblau)**.
- **Suchleiste** (Klick auf die Such-Kachel) wie im LTS: dunkler Balken direkt unter dem Header, der den Seiteninhalt überlagert statt ihn nach unten zu schieben (Header auf Ebene `z-dropdown` wie der Original-Header), genau so hoch wie der Überstand des Logos (`--gj-logo-overhang`, 47 px), sodass Balken und Logo unten bündig abschließen. Eingabefeld 34 px hoch, mittig, ab 620 px rechts neben dem Logo-Feld (gleiche Breite wie das Logo-Feld plus Abstand), damit es das überstehende Logo nicht verdeckt; unter 620 px über die volle Breite (zwischen etwa 540 und 575 px verdeckt es dabei die unteren 7 px des Logos, bewusst so belassen); die Suchvorschläge klappen darunter auf.
- Der Sprachwechsel wechselt bei nur einer weiteren Sprache per Klick direkt, ohne das Sprachwahl-Feld aufzuklappen (ebenso im mobilen Menü). Nur bei mehreren weiteren Sprachen öffnet er die Auswahl.
- **SEO:** Der Sprachwechsel ist ein echter Link auf die andere Sprachversion (`<a href="/en" hreflang="en" lang="en">`, im mobilen Menü ebenso), damit Crawler ihm folgen können; ein normaler Klick wechselt weiterhin über `switchLocale`, Strg-/Mittelklick öffnet die Sprachversion in einem neuen Tab. Der Alt-Text des Logos kommt aus der Umgebungsvariable `NAME` (`NAME="GLAS IN JENA"`, auch im Live-Shop setzen), sonst steht dort „PlentyONE GmbH logo“.
- Handy: Burger-Menü, Logo kompakt, Warenkorb bleibt sichtbar.
- **Checkout:** wie im LTS-Shop derselbe Header wie auf allen anderen Seiten (Kategorien, Konto, Sprache, Suche, Warenkorb), darunter der Banner „Kasse“ – kein reduzierter Checkout-Header. `GlasJenaSimplifiedHeader.vue` ersetzt dafür den vereinfachten Header des Checkout-Layouts (auch Angebotsseiten); im Shop-Editor bleibt der Original-Header.
- Der Glas-Jena-Header (`GlasJenaHeaderBlocks.vue`) läuft auf allen Geräten. Nur im Shop-Editor wird der Original-Header angezeigt, damit er dort konfigurierbar bleibt. Auf dem Handy entfällt damit auch die untere Navigationsleiste des Original-Headers (wie im LTS-Shop), auch auf den Login-/Registrierungsseiten (`GlasJenaNavbarBottom.vue`). Cookie- und Vorschau-Button rücken auf dem Handy entsprechend nach unten (`glas-jena.css`).

### Mein Konto

- Startseite von „Mein Konto“ ist in der PWA `/my-account/personal-data/` (`paths.account`); alle Konto-Links im Shop führen dorthin.
- **Weiterleitung** (`runtime/middleware/accountRedirect.ts`, global): `/my-account` – die Konto-Adresse des LTS-Shops aus alten Lesezeichen und E-Mails – leitet in jeder Sprache auf die Startseite weiter (301). Kontoseiten ohne Schrägstrich am Ende bekommen ihn wie alle Shop-Links (PlentyONE-Einstellung „Trailing slash“). Ohne das zeigt das Original-Layout auf dem Handy nur eine leere Überschrift mit „Zurück“ statt des Menüs.
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

- **Desktop (ab 992 px Fensterbreite, wie im LTS-Shop):** Hauptkategorien gleich breit und zentriert in einer Zeile, Kategorien mit Unterkategorien mit ⌄-Pfeil. Zwischen 992 und 1199 px wie im LTS ohne seitlichen Innenabstand der Kategorie-Links und mit schmaler Sprach-Kachel (Textbreite plus 7 px je Seite), damit auch „Gesundheitshelfer“ passt und alle Kategorien gleich breit bleiben. Header-Links sind nicht unterstrichen.
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
- Nach einer Trennlinie in Hellblau (`#abcae4`): **Konto** (Anmelden, Account erstellen, Mein Konto bzw. Mein Konto und Ausloggen) und **Language / Sprache** (alle Shopsprachen in ihrem eigenen Namen). Wie im LTS bleiben die Kategorien dabei stehen: Ein Klick auf Konto oder Sprache wechselt nur den Bereich unter der Trennlinie (mit ‹ zurück zu Konto / Sprache); die Pfadleiste zeigt weiter nur den Kategoriepfad. Auch diese zweite Ebene ist hellblau (`#abcae4`) wie Konto und Sprache; die aktive Sprache ist halbfett und hat rechts einen Haken ✓ (für Screenreader `aria-current`).
- **SEO:** Alle Ebenen werden immer gerendert und nur ausgeblendet, so stehen alle Kategorie-Links auch im Server-HTML für Handys („mobile first“-Indexierung).
- **Header mit Burger-Menü** (unter 992 px Fensterbreite, Handy und Tablet) wie im LTS: Logo-Feld (Breite siehe Header), daneben Menü, Suche und Warenkorb als drei gleich breite Kacheln über die volle Breite. Konto und Sprache stehen im Menü. Ab 992 px kommen Hauptnavigation, Konto und Sprache in den Header.

### Startseite (Reihenfolge)

1. **Hero:** links großes Stimmungsbild (Teekanne mit Gläsern), rechts Box „Wussten Sie schon, dass…“ in Schieferblau mit Fragezeichen-Symbol und Pfeilen zum Durchblättern mehrerer Fakten. Beispiel: „… alle unsere hitzebeständigen Artikel vor dem Verpacken auf ca. 600 °C aufgeheizt und langsam abgekühlt werden. Damit werden Spannungen im Glas vermieden.“
2. **Überschrift:** „GLAS IN JENA – Der Spezialist für Hitzebeständiges Glas“ (groß, Light, zentriert; „IN“ hochgestellt).
3. **Zwei Kacheln nebeneinander:**
   - _Werksverkauf_ (Zartgrün): „Deutschlands größte Auswahl an Hitzebeständigem Glas“, „Kristallglas – **Made in Germany**“, Adresse GLAS IN JENA, Westbahnhofstraße 8, 07745 Jena, Deutschland; Öffnungszeiten Mo–Fr 10:00–18:00 Uhr, Sa 10:00–13:00 Uhr; Link „» Zur Kartenansicht“; Produktbild Karaffe; „Mehr“-Button.
   - _Unser hitzebeständiges Glas_ (Mittelblau, weiße Schrift): Häkchen-Liste mit den Vorteilen (Lebensmittelzubereitung, porenfrei und hygienisch, Backen/Garen/Servieren/Kühlen/Einfrieren bis -35 °C, hitzebeständig bis 450 °C, mikrowellen- und spülmaschinengeeignet, ofentauglich, resistent gegen Temperaturwechsel bis 150 °C); „Mehr“-Button.
4. **Drei Kategorie-Kacheln:** Tee & Kaffee (Hellblau), Küche & Helfer (Blaugrau), Gesundheitshelfer (Flieder); je Überschrift, Produktbild, „Mehr“-Button.
5. **Topseller:** Balken „Unsere Topseller“ in Mittelblau, darunter Karussell mit Pfeilen links/rechts, 4 Artikel auf Desktop.
6. **Textblock „trendglas® in Jena“** (Zartgrün): SEO-Text links, Bild mit gestapelten Glasdosen rechts. Text aus dem LTS-Shop übernehmen.

### Artikelkarte

- Weißer Hintergrund, Produktbild freigestellt.
- Oben rechts eine **Dreieck-Ecke** in Blaugrau mit Warenkorb-Symbol (In-den-Warenkorb).
- Darunter Artikelname, Preis groß mit „\*“, Hinweis „\* inkl. ges. MwSt. zzgl. Versandkosten“ (Versandkosten als Link).
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
- Abschnitt „Wunschliste“ im Menü von „Mein Konto“ und der Vorteil „Wunschliste“ im Registrierungsformular sind per CSS ausgeblendet (`glas-jena.css`; der Menü-Link wird mit und ohne Schrägstrich am Ende erkannt). Dafür gibt es keine Editor-Einstellung: Das Kontomenü ist im Original-Layout `layouts/account.vue` fest programmiert.
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

- Obere Zeile dunkel (`#253038`): Links AGB, Widerruf, Datenschutz, Versand, Kontakt, Impressum; rechts Versandlogos (DHL, DPD) und Zahlungsarten (Sofort, Kreditkarte, Vorkasse) als helle Rahmen-Icons.
- Untere Zeile hell: „© [aktuelles Jahr] GLAS IN JENA“ (Jahr automatisch), rechts „webdesign by 3W FUTURE“.
- Button „Nach oben“ unten rechts (hellblau, eckig).

### Tablet-Ansicht (ca. 768–1279 px)

- Header: Logo-Feld unter 992 px Fensterbreite 15 % breit (Bild höchstens 136 px) und steht über. Unter 992 px Hauptnavigation als Burger-Menü; daneben nur Suche und Warenkorb, Konto und Sprache stehen im Menü.
- Hero: Bild und „Wussten Sie schon“-Box nebeneinander (etwa 60/40); im Hochformat untereinander.
- Werksverkauf und „Unser hitzebeständiges Glas“: untereinander, jeweils volle Breite.
- Kategorie-Kacheln: zu dritt nebeneinander (im Hochformat notfalls 2 + 1).
- Topseller-Karussell: 3 Artikel pro Ansicht, wischbar und mit Pfeilen.
- Textblock „trendglas® in Jena“: Bild neben dem Text im Querformat, darunter im Hochformat.
- Footer: Links in einer Zeile, Versand- und Zahlungslogos darunter.
- Alle Schaltflächen und Iconfelder groß genug für Finger (mindestens 44 × 44 px).

### Handy-Ansicht (unter 768 px)

- Header: Logo-Feld schmal (15–18 % der Breite); ab etwa 600 px steht es wie im LTS-Shop leicht über. Burger-Menü links oder rechts, Warenkorb immer sichtbar, Suche als Symbol.
- Kacheln stapeln sich untereinander (volle Breite).
- Hero: Bild oben, „Wussten Sie schon“-Box darunter.
- Topseller-Karussell mit 1–2 Artikeln pro Ansicht, wischbar.
- Footer: Links untereinander, Logos in einer umbrechenden Reihe.

### Test

Jede Seite in diesen vier Breiten prüfen: ca. 390 px (Handy), 820 px (Tablet hoch), 1180 px (Tablet quer) und 1440 px (Desktop).

---

## 6. Offene Punkte

- [ ] Exakte Farbwerte und Schrift aus dem LTS-CSS übernehmen.
- [ ] Artikeldaten prüfen: Viele Artikel zeigen „1 Milliliter“ als Einheit – vermutlich falsche Inhalts-/Grundpreis-Einheit in PlentyONE (betrifft PWA und LTS gleichermaßen).
- [ ] Copyright-Jahr im Footer automatisch setzen.
- [ ] Alle „Wussten Sie schon“-Fakten aus dem LTS-Shop sammeln.
- [ ] Englische Texte für den Sprachwechsel prüfen.
- [x] SEO mobil: Das Server-HTML für Handys enthält jetzt alle Kategorie-Links (mobiles Menü, siehe oben).
