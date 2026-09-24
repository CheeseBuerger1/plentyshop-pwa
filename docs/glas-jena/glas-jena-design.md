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
- Daneben die Hauptnavigation auf Weiß: Tee & Kaffee ▾, Küche & Helfer ▾, Diverses, Gesundheitshelfer, Ersatzteile ▾ (Kategorien kommen aus PlentyONE).
- Rechts als gleich große Blöcke: Konto (hellgrau), Sprachwechsel „English“ (hellgrau), Suche (hellgrau), **Warenkorb (Mittelblau)**.
- Handy: Burger-Menü, Logo kompakt, Warenkorb bleibt sichtbar.

### Hauptnavigation (wie im LTS-Shop)

Umgesetzt in `apps/web/modules/glas-jena/runtime/components/GlasJenaNavigation.vue` (Hauptleiste) und `GlasJenaNavigationMenu.vue` (Dropdown-Ebenen).

- **Desktop (ab 1024 px):** Hauptkategorien gleich breit und zentriert in einer Zeile, Kategorien mit Unterkategorien mit ⌄-Pfeil.
- **Hover** öffnet eine schmale Liste der 2. Ebene direkt unter der Kategorie (kein Mega-Menü über die ganze Breite).
- Unterkategorien mit ›-Pfeil klappen beim Hovern als **Flyout nach rechts** auf, bis zur 4. Ebene (z. B. Tee & Kaffee → Teekannen → mit Glasfilter → kleiner 1 L). Droht ein Flyout rechts aus dem Bild zu ragen, öffnet es sich nach links.
- **Hover-Verzögerung** (`NAVIGATION_HOVER_DELAY_MS`, 200 ms): Ist ein Flyout offen, übernimmt ein anderer Eintrag erst, wenn die Maus kurz darauf verweilt. Wer schräg ins Flyout fährt und dabei einen Nachbareintrag streift, verliert es nicht. Beim Verlassen der Navigation schließt das Menü ebenfalls erst nach dieser Zeit. Entlang der Hauptleiste wechseln die Dropdowns sofort.
- **Klick** auf eine Kategorie führt immer direkt zur Kategorieseite; das Menü schließt sich danach.
- **Aktueller Pfad** blaugrau hinterlegt (`--gj-tile-grey-blue`): die aktuelle Kategorie und alle übergeordneten Kategorien in allen Ebenen, auch auf Artikelseiten darunter (z. B. auf „mit Glasfilter“: Tee & Kaffee, Teekannen und mit Glasfilter). Hover hellgrau (`#f8f9fa`); eckig, ohne Schatten.
- **SEO:** Alle Ebenen werden immer gerendert und nur ausgeblendet. Damit stehen alle Kategorie-Links im Server-HTML, wie im LTS-Shop.
- **Touch-Geräte** (z. B. Tablet quer): erstes Antippen öffnet die Unterkategorien, zweites Antippen öffnet die Kategorie. Antippen außerhalb schließt das Menü.
- **Tastatur:** Tab öffnet die Ebenen der fokussierten Kategorie, Escape schließt und springt zurück zur Hauptkategorie.
- **Unter 1024 px:** Burger-Menü mit dem Drawer der PWA (Ebene für Ebene mit Zurück-Button) – entspricht der mobilen LTS-Navigation.
- Die Kategorien kommen aus dem Block „Navigation“ im Header bzw. aus dem Kategoriebaum von PlentyONE.

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

### Footer

- Obere Zeile dunkel (`#253038`): Links AGB, Widerruf, Datenschutz, Versand, Kontakt, Impressum; rechts Versandlogos (DHL, DPD) und Zahlungsarten (Sofort, Kreditkarte, Vorkasse) als helle Rahmen-Icons.
- Untere Zeile hell: „© [aktuelles Jahr] GLAS IN JENA“ (Jahr automatisch), rechts „webdesign by 3W FUTURE“.
- Button „Nach oben“ unten rechts (hellblau, eckig).

### Tablet-Ansicht (ca. 768–1279 px)

- Header: Logo-Feld etwas kleiner, darf weiterhin überstehen. Hauptnavigation als Burger-Menü, sobald die Kategorien nicht mehr in eine Zeile passen. Konto, Suche und Warenkorb bleiben als Blöcke sichtbar, „English“ darf ins Menü wandern.
- Hero: Bild und „Wussten Sie schon“-Box nebeneinander (etwa 60/40); im Hochformat untereinander.
- Werksverkauf und „Unser hitzebeständiges Glas“: untereinander, jeweils volle Breite.
- Kategorie-Kacheln: zu dritt nebeneinander (im Hochformat notfalls 2 + 1).
- Topseller-Karussell: 3 Artikel pro Ansicht, wischbar und mit Pfeilen.
- Textblock „trendglas® in Jena“: Bild neben dem Text im Querformat, darunter im Hochformat.
- Footer: Links in einer Zeile, Versand- und Zahlungslogos darunter.
- Alle Schaltflächen und Iconfelder groß genug für Finger (mindestens 44 × 44 px).

### Handy-Ansicht (unter 768 px)

- Header: Logo-Feld kompakt im Header, **nicht überstehend**. Burger-Menü links oder rechts, Warenkorb immer sichtbar, Suche als Symbol.
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
- [ ] SEO mobil: Mit Handy-User-Agent (Google indexiert „mobile first“) enthält das Server-HTML keine Kategorie-Links in der Navigation – unter 768 px läuft der Original-Header, dessen Drawer erst beim Öffnen gerendert wird. Prüfen, ob das für die Indexierung der Unterkategorien reicht.
