# Adressformate je Lieferland

Stand 2026-11-02, Branch `feat/address-formats`. **Umgesetzt** (Kasse, Mein Konto, Registrierung), mit
Testbestellungen und DHL-Etiketten geprüft (Abschnitt 8). Unsichere Punkte sind mit ⚠ markiert.

## 1. Ist-Zustand

### Formulare im Shop

| Stelle                  | Komponente (Original)                    | Felder heute                                                                                                                     |
| ----------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Kasse, Lieferadresse    | `AddressFormShipping`                    | Vorname, Nachname, (Firma, USt-IdNr.), Straße, Hausnummer, PLZ, Ort, **Land zuletzt**                                            |
| Kasse, Rechnungsadresse | `AddressFormBilling`                     | wie Lieferadresse                                                                                                                |
| Mein Konto, Adressen    | `AddressForm` (über `AddressesList`)     | Vorname, Nachname, Telefon (optional), Land, Straße, Hausnummer, Ort, Bundesland (optional, falls PlentyONE eine Liste hat), PLZ |
| Registrierung           | `pages/register.vue` + `useRegisterForm` | Adresse wie Kasse                                                                                                                |

- Für **alle** Länder gilt das deutsche Muster: Straße und Hausnummer getrennt, beide Pflicht
  (`useAddressForm`, Schema `streetName`/`apartment` required).
- PLZ ist für alle Länder Pflicht; hat PlentyONE für das Land einen PLZ-Regex, wird er streng geprüft
  (Fehlertext ist der Packstation-Text „PLZ ungültig“). Länder ohne PLZ (Hongkong, VAE, Macau, Panama,
  Jamaika) können nur mit erfundener PLZ bestellen.
- **Bundesstaat fehlt in der Kasse ganz.** PlentyONE meldet für USA und Kanada `isCountryStateMandatory: true`;
  US-/Kanada-Adressen aus der Kasse haben also keinen Bundesstaat – für DHL-Etiketten ein Fehlerrisiko.
- Telefon gibt es in der Kasse nicht (nur im Konto, optional).
- Ein Adresszusatz (address3) wird vom Shop-Paket übertragen, aber in keinem Formular abgefragt.
- Packstation/Postfiliale (nur DE) schreibt „Packstation“/„Postfiliale“ in `streetName` und die Nummer in
  `apartment` (`usePackstationAddress`).
- Die Kasse belegt das Land einer neuen Lieferadresse mit dem Lieferland des Warenkorbs vor (Modul,
  `plugins/checkoutCountry.ts`); die Länderliste ist alphabetisch sortiert (`plugins/shippingCountriesOrder.ts`).

### Übergabe an PlentyONE

Das Shop-Paket (`@plentymarkets/shop-api` 0.188.0, `mapAddressForServer`/`mapAddressForClient`) speichert über
`/rest/storefront/contact/addresses`:

| Formularfeld (`Address`)       | PlentyONE-Feld             | Bedeutung in PlentyONE                          |
| ------------------------------ | -------------------------- | ----------------------------------------------- |
| `companyName`                  | `name1`                    | Firma                                           |
| `firstName`                    | `name2`                    | Vorname                                         |
| `lastName`                     | `name3`                    | Nachname                                        |
| –                              | `name4`                    | Namenszusatz (nicht genutzt, geht nicht an DHL) |
| `streetName`                   | `address1`                 | Straße (bzw. „Packstation“)                     |
| `apartment`                    | `address2`                 | Hausnummer (bzw. Packstationsnummer)            |
| `additionalAddressInformation` | `address3`                 | Adresszusatz                                    |
| –                              | `address4`                 | Adressfeld 4 (nicht genutzt, geht nicht an DHL) |
| `zipCode`                      | `postalCode`               | PLZ                                             |
| `city`                         | `town`                     | Ort                                             |
| `state`                        | `stateId`                  | Bundesland/-staat (ID aus der PlentyONE-Liste)  |
| `country`                      | `countryId`                | Land (PlentyONE-ID)                             |
| `phoneNumber`                  | `telephone` → Option Typ 4 | Telefon                                         |
| `postNumber`                   | Option Typ 6               | DHL-Postnummer                                  |
| `vatNumber`                    | `vatNumber`                | USt-IdNr.                                       |

Eine neue Datenstruktur ist also **nicht** nötig: alle benötigten Felder kommen schon heute bei PlentyONE an.

**Versand:** nur DHL (FedEx ist im Shop nicht verfügbar). Laut Shopbetreiber überträgt PlentyONE an DHL Straße
(`address1`), Hausnummer (`address2`) und Adresszusatz (`address3`); Namenszusatz (`name4`) und Adressfeld 4
(`address4`) gehen **nicht** an DHL. Das Konzept nutzt deshalb nur `address1`–`address3`.
Auf dem DHL-Etikett steht der Adresszusatz **über** Straße und Hausnummer. Das passt zu den Postmustern: c/o,
Hinterhaus (DE), Flat/Gebäudename (GB), Apt/Suite (US, laut USPS über der Zustellzeile zulässig), Gebäude/Zimmer
(JP) stehen dort ebenfalls über oder vor der Straßenzeile.
Der Bundesstaat (`stateId`) wird an DHL übertragen und ist für die USA dort Pflicht (Shopbetreiber, 2026-11-01).
Hausnummer und PLZ verlangt PlentyONE selbst (außer GB), siehe Abschnitt 2. Eine britische Zeile mit leerem
`address2` nimmt DHL an (Etikettentest, Abschnitt 8).

### Aktive Lieferländer

125 Lieferländer (Abruf `getAggregatedCountries` auf glas-jena.de, 2026-10-31), darunter die
Sondergebiete Helgoland (255), Büsingen (256), Balearen (65), Kanaren (37), Ceuta (42), Melilla (43).
PlentyONE führt Bundesstaat-Listen für 15 Länder (AR, AU, BR, CA, CH, CN, DE, ID, IN, IT, JP, MX, NL, TH, US)
und PLZ-Regex für 37 Länder. Die Rechnungsländer (30, EU/EWR) sind eine Teilmenge.

### Bestandsaufnahme der Aufträge (2026-11-01, nur lesend)

REST `GET /rest/orders?with[]=addresses&countryId=…` (Lieferadresse = Adressbeziehung Typ 2), je Land bis zu
1.500 neueste Aufträge, DE nur die letzten 500. 36.744 Aufträge gesamt, davon 31.511 nach DE; Aufträge in 68
Lieferländern. Ausgewertet wurden nur Zählwerte und Muster, keine Namen oder Adressen.

| Land            | Aufträge | `address2` nur Nr. | `address2` leer | `address1` beginnt mit Ziffer | `address3` gefüllt | Bundesstaat gesetzt | Telefon |
| --------------- | -------- | ------------------ | --------------- | ----------------------------- | ------------------ | ------------------- | ------- |
| DE (letzte 500) | 500      | 496                | 0               | 0                             | 37                 | 157                 | 127     |
| AT              | 1.207    | 1.175              | 4               | 1                             | 207                | 3                   | 583     |
| CH              | 925      | 917                | 3               | 2                             | 66                 | 508                 | 466     |
| US              | 797      | 659                | 15              | 260                           | 168                | 734                 | 477     |
| GB              | 385      | 212                | 67              | 96                            | 140                | –                   | 251     |
| FR              | 245      | 226                | 2               | 27                            | 64                 | –                   | 172     |
| IT              | 177      | 163                | 3               | 0                             | 42                 | 126                 | 112     |
| NL              | 161      | 150                | 0               | 0                             | 19                 | 87                  | 97      |
| AU              | 111      | 97                 | 0               | 15                            | 34                 | 21                  | 79      |
| CA              | 83       | 71                 | 0               | 23                            | 15                 | 77                  | 57      |
| KR              | 31       | 17                 | 2               | 13                            | 23                 | –                   | 21      |
| JP              | 20       | 13                 | 1               | 8                             | 14                 | 18                  | 15      |
| HK              | 14       | 5                  | 0               | 8                             | 11                 | –                   | 10      |
| AE              | 7        | 3                  | 1               | 1                             | 4                  | –                   | 5       |

Ergebnisse:

- **Altbestand ist durchweg im deutschen Muster gespeichert** (Straße in `address1`, Nummer in `address2`), auch
  in US, GB, FR, JP. Das bestätigt die Entscheidung „Altformat“ (Abschnitt 5).
- **Das deutsche Muster passt im Ausland schlecht:** In den USA beginnt `address1` bei 260 von 797 Aufträgen mit
  der Hausnummer („123 Main St“), in GB bei 96 von 385, in Kanada bei 23 von 83 – die Kunden haben die ganze
  Zeile in „Straße“ geschrieben und ins Nummernfeld etwas Zweites (Nummer doppelt, Apt) oder nichts.
- **Leere Hausnummer kommt bei DHL schon vor:** 67 GB-Aufträge haben ein leeres `address2`. ⚠ Dass diese über
  DHL verschickt wurden, ist nicht geprüft; der Etikettentest bleibt.
- **Bundesstaat:** Unter LTS fast immer gesetzt (US 734 von 797, CA 77 von 83, JP 18 von 20). Von den zwei
  US-Aufträgen über die PWA (seit 2026-10-23) hat **einer keinen Bundesstaat** – der Fehler aus Abschnitt 1 tritt
  also tatsächlich auf.
- **Adresszusatz und Telefon wurden unter LTS rege genutzt** (`address3` z. B. US 168, GB 140, AT 207; Telefon
  bei gut der Hälfte der Aufträge). Die PWA-Kasse fragt beides heute nicht ab – das Konzept holt beides zurück.
- **Namenszusatz und Adressfeld 4** sind praktisch leer (`name4` in 19, `address4` in 25 Auslandsaufträgen) –
  kein Bedarf.
- **Leere PLZ in Aufträgen:** Aufträge aus Hongkong (5 von 14) und den VAE (4 von 7) haben keine PLZ. Die
  Adress-Schnittstelle des Shops nimmt eine leere PLZ heute aber nicht an (Test 2026-11-02), daher „0“ (3.3).

## 2. Gruppen

**Grundregel von PlentyONE (Test 2026-11-02):** Außer für Großbritannien verlangt PlentyONE beim Speichern einer
Adresse eine Hausnummer (`address2`) und eine PLZ; ohne sie antwortet es mit `address.validationFailed`. Das ist
keine Einstellung – die Pflichtfeld-Listen der Shop-Einstellungen (plentyShop LTS im Plugin-Set „PWA-Plugin-Set“:
`billing_address.require`, `delivery_address.require`, `….en.require`) sind leer. Nur das englische Formular (GB)
nimmt eine Zeile ohne Hausnummer. Deshalb sind Straße und Hausnummer in allen Ländern außer GB **zwei Felder** in
der Reihenfolge des Landes (Entscheidung 2026-11-02, statt einer einzigen Adresszeile); der Kunde trägt beides
selbst ein, nichts wird zerlegt.

Alle Gruppen beginnen mit **Land**, danach Vorname | Nachname und der Firmen-Umschalter (Firma, USt-IdNr.)
wie heute. Einen eigenen Ansprechpartner bei Firmen gibt es nicht (wie bisher im Shop): wer einen nennen will,
trägt ihn bei Vorname/Nachname ein (Entscheidung 2026-11-01). Nach dem Adressteil folgt das optionale
Telefonfeld (3.4). Straße und Hausnummer stehen in einer eigenen Zeile, die Nummer schmal (120 px).

| Gruppe | Länder (Beispiele)                   | Straße / Nummer                                          | Zeile 2 (`address3`)    | Ort, Staat, PLZ                        |
| ------ | ------------------------------------ | -------------------------------------------------------- | ----------------------- | -------------------------------------- |
| A      | DE, AT, CH, NL                       | Straße \| Hausnummer                                     | Adresszusatz            | PLZ \| Ort                             |
| B      | übriges Europa, IL, Lateinamerika    | Straße \| Hausnummer                                     | Adresszusatz            | PLZ \| Ort, darunter Provinz           |
| C      | US, CA, AU, NZ, IE, FR, LU, ZA, SG … | Hausnummer \| Straße                                     | Wohnung, Suite, Gebäude | Ort \| Staat \| PLZ                    |
| C, GB  | Großbritannien                       | eine Zeile „Hausnummer und Straße“                       | Wohnung, Suite, Gebäude | Ort \| Postcode                        |
| D      | JP, KR, CN                           | Stadtteil, Straße \| Nummer (JP: „Block (Chōme-Ban-Gō)“) | Gebäude, Zimmer         | zuerst PLZ \| Präfektur, Stadt, Bezirk |
| E      | alle übrigen                         | Straße \| Hausnummer                                     | Adresszusatz            | PLZ \| Ort, darunter Region            |

Zuordnung zu PlentyONE in allen Gruppen: Straße `address1`, Hausnummer `address2`, Zeile 2 `address3` (DHL druckt
ihn über Straße und Hausnummer), PLZ `postalCode`, Ort `town`, Staat `stateId`, Telefon Option Typ 4.

Beschriftungen DE / EN: Straße / Street, Hausnummer / House number, Hausnummer und Straße / Street address,
Stadtteil, Straße / District, street, Block (Chōme-Ban-Gō) / Block (chōme-ban-gō), Adresszusatz / Additional address
information, Wohnung, Suite, Gebäude / Apt, suite, unit, building, Gebäude, Zimmer / Building, room, Ort / City,
Stadt, Bezirk / City, ward; PLZ als Postleitzahl / Postal code, ZIP-Code / ZIP code (US), Postleitzahl / Postcode
(GB, AU, NZ, IM, JE, GI), Eircode (IE); Staat als Bundesstaat / State, Provinz / Province, Präfektur / Prefecture,
Region / State, region.

Packstation/Postfiliale (DE) bleibt unverändert. NL: Hausnummer mit Zusatz („123-2“, „12 A“) ins Feld Hausnummer.

## 3. Gemeinsame Regeln

### 3.1 Land zuerst

Die Länderauswahl steht oben; Vorbelegung bleibt das Lieferland des Warenkorbs. Wechselt der Kunde das Land,
baut sich das Formular neu auf, die Eingaben bleiben stehen. Nur beim Wechsel nach Großbritannien werden Straße
und Hausnummer **sichtbar** zu einer Zeile zusammengesetzt („10 Downing Street“); der Kunde sieht das Ergebnis vor
dem Speichern. Von Großbritannien in ein anderes Land wird nichts zerlegt: die Zeile steht im Feld Straße, die
Hausnummer muss der Kunde eintragen. Ein Bundesstaat des alten Landes wird geleert.

### 3.2 Bundesstaat/Provinz

Auswahlliste aus PlentyONE (`stateId`). Sichtbar, wenn PlentyONE eine Liste hat **und** der Staat laut
libaddressinput zur Postanschrift gehört (bei DE, CH, NL also nicht). Pflicht, wenn PlentyONE ihn verlangt
(US, CA) oder libaddressinput ihn verlangt (AU, BR, CN, IN, JP, MX); sonst optional ohne Hinweis (AR, ID, IT, TH;
Entscheidung 2026-11-01). In den USA, Kanada und Australien zeigt die Liste die Kürzel („IL“, „ON“, „NSW“,
PlentyONE `isoCode3166`) alphabetisch (Wunsch 2026-11-02: die langen Namen sahen im schmalen Feld seltsam aus);
sonst die Namen in der Reihenfolge von PlentyONE (Japans Präfekturen von Nord nach Süd). PlentyONE überträgt den
Staat an DHL, für die USA ist er dort Pflicht.

### 3.3 PLZ

- Pflicht in allen Ländern (PlentyONE verlangt sie).
- Normalisieren vor Prüfung und Speichern: Leerzeichen am Rand entfernen, Buchstaben groß
  („sw1a 2aa“ → „SW1A 2AA“; der NL-Regex von PlentyONE ist sonst bei Kleinbuchstaben falsch).
- PlentyONE-Regex vorhanden: **streng** (blockiert), wie bisher. Kein eigenes Muster darüber hinaus.
- Länder ohne PLZ-System (HK, AE, MO, PA, JM): Feld ausgeblendet, der Shop schickt unsichtbar „0“
  (Entscheidung 2026-11-02). Eine gespeicherte Adresse behält ihre PLZ.

### 3.4 Telefon

Optionales Feld in allen Adressformularen (Kasse Liefer- und Rechnungsadresse, Konto, Registrierung) und für
alle Länder, wie bisher schon im Konto (Entscheidung 2026-11-01). DE / EN: „Telefon (optional)“ /
„Phone (optional)“, `type="tel"`, `autocomplete="tel"`. Speicherung über die vorhandene Option Typ 4
(`telephone`). Keine Formatprüfung, nur Länge 7–18 Zeichen wie im Konto-Formular.

### 3.5 Hinweise statt Blockaden

Nur zwei gelbe Hinweise, die die Bestellung nie verhindern (Auswahl des Shopbetreibers, 2026-11-01):

- Nicht-lateinische Zeichen (z. B. Kanji, Kyrillisch): „Bitte verwenden Sie lateinische Buchstaben, damit das
  Versandetikett lesbar ist.“
- Straße (bzw. die Zeile in GB) länger als 50 Zeichen, die Grenze des DHL-Straßenfelds ⚠.

Blockierend sind nur: Pflichtfelder, PlentyONE-PLZ-Regex, Bundesstaat in den Pflicht-Ländern.

### 3.6 Browser-Autofill

Jedes Feld bekommt das passende `autocomplete` (`address-line1` für die Straße, `address-line2` für Zeile 2,
`address-level1` für den Staat, `address-level2` für den Ort, `postal-code`, `country-name`, `tel`). Die
Hausnummer bekommt keins, damit der Browser dort keinen Zusatz einträgt; ihr Eingabefeld heißt weiter
`streetNumber` wie im Original.

## 4. Länder

Erzeugt aus den PlentyONE-Länderdaten des Shops (Abruf 2026-10-31) und den Listen in `utils/addressFormats.ts`.
„Straße/Nr.“: Reihenfolge der Felder. „Bundesstaat/Provinz“: Pflicht/optional mit Anzahl der Einträge in PlentyONE,
„–“ = kein Feld. „streng“ = PlentyONE-Regex (blockiert). Gruppenzuordnung nach libaddressinput-Format und den
Postmustern des Landes; Länder ohne libaddressinput-Eintrag oder mit uneinheitlichen Adressen → E.

| ID  | ISO | Land                         | Gruppe | Straße/Nr.       | Bundesstaat/Provinz  | PLZ                                                     | Quelle          | Hinweis                                                                                       |
| --- | --- | ---------------------------- | ------ | ---------------- | -------------------- | ------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| 256 | DE  | Büsingen, Deutschland        | A      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{5}$`                              | libaddressinput | Packstation/Postfiliale nutzen dieselben Felder (address1 = „Packstation“, address2 = Nummer) |
| 1   | DE  | Deutschland                  | A      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{5}$`                              | libaddressinput | Packstation/Postfiliale nutzen dieselben Felder (address1 = „Packstation“, address2 = Nummer) |
| 255 | DE  | Helgoland, Deutschland       | A      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{5}$`                              | libaddressinput | Packstation/Postfiliale nutzen dieselben Felder (address1 = „Packstation“, address2 = Nummer) |
| 21  | NL  | Niederlande                  | A      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{4}[ ]?[A-Z]{2}$`                  | libaddressinput | Hausnummer mit Zusatz („123-2“, „12 A“) im Feld Nr.                                           |
| 2   | AT  | Österreich                   | A      | Straße \| Nr.    | –                    | Pflicht, streng: `^(?!0)\d{4}$`                         | libaddressinput |                                                                                               |
| 4   | CH  | Schweiz                      | A      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{4}$`                              | libaddressinput | auch frz./ital. Landesteile: Nummer hinter der Straße                                         |
| 52  | AL  | Albanien                     | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 71  | AD  | Andorra                      | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 76  | AR  | Argentinien                  | B      | Straße \| Nr.    | optional (24)        | Pflicht                                                 | libaddressinput |                                                                                               |
| 51  | AM  | Armenien                     | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 78  | AZ  | Aserbaidschan                | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 3   | BE  | Belgien                      | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{4}$`                              | libaddressinput | frz. Schreibweise ebenfalls „Rue de la Loi 16“                                                |
| 88  | BA  | Bosnien und Herzegowina      | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 39  | BR  | Brasilien                    | B      | Straße \| Nr.    | Pflicht (27)         | Pflicht                                                 | libaddressinput | Bairro im Adresszusatz                                                                        |
| 44  | BG  | Bulgarien                    | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{4}$`                              | libaddressinput |                                                                                               |
| 42  | EA  | Ceuta                        | B      | Straße \| Nr.    | –                    | Pflicht                                                 | –               | kein Eintrag bei libaddressinput; spanisches Muster (Correos)                                 |
| 101 | CL  | Chile                        | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 7   | DK  | Dänemark                     | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{4}$`                              | libaddressinput |                                                                                               |
| 9   | EE  | Estland                      | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{5}$`                              | libaddressinput |                                                                                               |
| 122 | FO  | Färöer                       | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 11  | FI  | Finnland                     | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^(FI-\|AX-)?\d{5}$`                   | libaddressinput |                                                                                               |
| 129 | GE  | Georgien                     | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 13  | GR  | Griechenland                 | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{3}[ ]?\d{2}$`                     | libaddressinput |                                                                                               |
| 132 | GL  | Grönland                     | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 144 | IS  | Island                       | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 59  | IL  | Israel                       | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput | Nummer hinter der Straße (hebr. Schreibweise)                                                 |
| 15  | IT  | Italien                      | B      | Straße \| Nr.    | optional (107)       | Pflicht, streng: `^\d{5}$`                              | libaddressinput | Provinz laut libaddressinput Pflicht, im Shop optional ohne Hinweis                           |
| 37  | IC  | Kanarische Inseln            | B      | Straße \| Nr.    | –                    | Pflicht                                                 | –               | kein Eintrag bei libaddressinput; spanisches Muster (Correos)                                 |
| 47  | KZ  | Kasachstan                   | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 45  | XK  | Kosovo                       | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 54  | HR  | Kroatien                     | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^(HR-)?\d{5}$`                        | libaddressinput |                                                                                               |
| 18  | LV  | Lettland                     | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^(LV-)?\d{4}$`                        | libaddressinput |                                                                                               |
| 34  | LI  | Liechtenstein                | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 33  | LT  | Litauen                      | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^(LT-)?\d{5}$`                        | libaddressinput |                                                                                               |
| 43  | EA  | Melilla                      | B      | Straße \| Nr.    | –                    | Pflicht                                                 | –               | kein Eintrag bei libaddressinput; spanisches Muster (Correos)                                 |
| 36  | MX  | Mexico                       | B      | Straße \| Nr.    | Pflicht (32)         | Pflicht                                                 | libaddressinput | Colonia im Adresszusatz                                                                       |
| 175 | MD  | Moldavien (Moldau)           | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 177 | ME  | Montenegro                   | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 164 | MK  | Nordmazedonien               | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 20  | NO  | Norwegen                     | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{4}$`                              | libaddressinput |                                                                                               |
| 198 | PY  | Paraguay                     | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 199 | PE  | Peru                         | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 23  | PL  | Polen                        | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{2}-\d{3}$`                        | libaddressinput |                                                                                               |
| 22  | PT  | Portugal                     | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{4}([\-]\d{3})?$`                  | libaddressinput |                                                                                               |
| 41  | RO  | Rumänien                     | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{6}$`                              | libaddressinput |                                                                                               |
| 40  | RU  | Russland                     | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 212 | SM  | San Marino                   | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 24  | SE  | Schweden                     | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^(SE-)?\d{3}[ ]?\d{2}$`               | libaddressinput |                                                                                               |
| 216 | RS  | Serbien                      | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 26  | SK  | Slowakische Republik         | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{3}[ ]?\d{2}$`                     | libaddressinput |                                                                                               |
| 27  | SI  | Slowenien                    | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^(SI-)?\d{4}$`                        | libaddressinput |                                                                                               |
| 8   | ES  | Spanien                      | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^(?:0[1-9]\|[1-4]\d\|5[0-2])\d{3}$`   | libaddressinput | Stockwerk/Tür („3º B“) im Adresszusatz                                                        |
| 65  | ES  | Spanien, Balearen            | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^(?:0[1-9]\|[1-4]\d\|5[0-2])\d{3}$`   | libaddressinput | Stockwerk/Tür („3º B“) im Adresszusatz                                                        |
| 6   | CZ  | Tschechische Republik        | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{3}[ ]?\d{2}$`                     | libaddressinput |                                                                                               |
| 63  | TR  | Türkei                       | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 241 | UA  | Ukraine                      | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 14  | HU  | Ungarn                       | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{4}$`                              | libaddressinput |                                                                                               |
| 243 | UY  | Uruguay                      | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 48  | BY  | Weißrussland                 | B      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 5   | CY  | Zypern                       | B      | Straße \| Nr.    | –                    | Pflicht, streng: `^\d{4}$`                              | libaddressinput |                                                                                               |
| 29  | AU  | Australien                   | C      | Nr. \| Straße    | Pflicht (8), Kürzel  | Pflicht                                                 | libaddressinput | Labels „Postcode“, „State“                                                                    |
| 10  | FR  | Frankreich                   | C      | Nr. \| Straße    | –                    | Pflicht, streng: `^\d{2}[ ]?\d{3}$`                     | libaddressinput | Nummer vorn („12 rue de la Paix“)                                                             |
| 124 | GF  | Französisch Guayana          | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 131 | GI  | Gibraltar                    | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 12  | GB  | Großbritannien               | C      | eine Zeile       | –                    | Pflicht, streng: `^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]…`  | libaddressinput | PlentyONE nimmt eine Zeile ohne Hausnummer (englisches Formular); Label „Postcode“            |
| 61  | GP  | Guadeloupe                   | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 148 | IM  | Insel Man (Isle of Man)      | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 16  | IE  | Irland                       | C      | Nr. \| Straße    | –                    | Pflicht, streng: `^([AC-FHKNPRTV-Y][0-9]{2}\|D6W)[ -]…` | libaddressinput | County nicht als Liste in PlentyONE                                                           |
| 150 | JE  | Jersey                       | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 30  | CA  | Kanada                       | C      | Nr. \| Straße    | Pflicht (13), Kürzel | Pflicht                                                 | libaddressinput | PlentyONE: Provinz Pflicht; Label „Province“                                                  |
| 17  | LU  | Luxemburg                    | C      | Nr. \| Straße    | –                    | Pflicht, streng: `^(L-)?\d{4}$`                         | libaddressinput | frz. Muster, Nummer vorn („12 rue …“)                                                         |
| 56  | MY  | Malaysia                     | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 173 | YT  | Mayotte                      | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 35  | MC  | Monaco                       | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput | frz. Muster                                                                                   |
| 66  | NZ  | Neuseeland                   | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput | Suburb im Adresszusatz                                                                        |
| 200 | PH  | Philippinen                  | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 204 | RE  | Réunion                      | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 25  | SG  | Singapur                     | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 221 | ZA  | Südafrika                    | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 235 | TT  | Trinidad und Tobago          | C      | Nr. \| Straße    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 28  | US  | USA                          | C      | Nr. \| Straße    | Pflicht (63), Kürzel | Pflicht                                                 | libaddressinput | PlentyONE und DHL: State Pflicht; Labels „ZIP code“, „State“                                  |
| 31  | CN  | China                        | D      | Stadtteil \| Nr. | Pflicht (34)         | Pflicht                                                 | libaddressinput | Provinz Pflicht (PlentyONE 34 Einträge)                                                       |
| 32  | JP  | Japan                        | D      | Stadtteil \| Nr. | Pflicht (47)         | Pflicht                                                 | libaddressinput | Präfektur Pflicht (PlentyONE 47 Einträge, lateinisch); „Block (Chōme-Ban-Gō)“ als Nummer      |
| 155 | KR  | Südkorea                     | D      | Stadtteil \| Nr. | –                    | Pflicht                                                 | libaddressinput | Provinz (do/si) nicht in PlentyONE → mit Ort angeben                                          |
| 53  | EG  | Ägypten                      | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 69  | DZ  | Algerien                     | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 87  | BO  | Bolivien                     | E      | Straße \| Nr.    | –                    | Pflicht                                                 | –               | kein Eintrag bei libaddressinput                                                              |
| 109 | CR  | Costa Rica                   | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput | Adressen oft mit Landmarken („200 m norte de …“)                                              |
| 115 | DO  | Dominikanische Republik      | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 116 | EC  | Ecuador                      | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 117 | SV  | El Salvador                  | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 130 | GH  | Ghana                        | E      | Straße \| Nr.    | –                    | Pflicht                                                 | –               | kein Eintrag bei libaddressinput; digitale Adressen (GhanaPostGPS)                            |
| 57  | HK  | Hongkong                     | E      | Straße \| Nr.    | –                    | keine – unsichtbar „0“                                  | libaddressinput | Gebiet (HK Island/Kowloon/NT) nicht in PlentyONE → im Ort                                     |
| 38  | IN  | Indien                       | E      | Straße \| Nr.    | Pflicht (36)         | Pflicht                                                 | libaddressinput | Haus/Gebäude als Nummer, Locality im Adresszusatz                                             |
| 145 | ID  | Indonesien                   | E      | Straße \| Nr.    | optional (41)        | Pflicht                                                 | libaddressinput | Provinz laut libaddressinput Pflicht, im Shop optional ohne Hinweis                           |
| 147 | IQ  | Irak                         | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 146 | IR  | Iran                         | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 149 | JM  | Jamaika                      | E      | Straße \| Nr.    | –                    | keine – unsichtbar „0“                                  | libaddressinput |                                                                                               |
| 151 | JO  | Jordanien                    | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 98  | KY  | Kaimaninseln                 | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 95  | KH  | Kambodscha                   | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 97  | CV  | Kap Verde                    | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 203 | QA  | Katar                        | E      | Straße \| Nr.    | –                    | Pflicht                                                 | –               | kein Eintrag bei libaddressinput                                                              |
| 104 | CO  | Kolumbien                    | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput | Sondermuster „Calle 26 # 13-19“                                                               |
| 112 | CU  | Kuba                         | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 156 | KW  | Kuwait                       | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 159 | LB  | Libanon                      | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 161 | LR  | Liberia                      | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 162 | LY  | Libyen                       | E      | Straße \| Nr.    | –                    | Pflicht                                                 | –               | kein Eintrag bei libaddressinput                                                              |
| 163 | MO  | Macau                        | E      | Straße \| Nr.    | –                    | keine – unsichtbar „0“                                  | libaddressinput |                                                                                               |
| 55  | MV  | Malediven                    | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 19  | MT  | Malta                        | E      | Straße \| Nr.    | –                    | Pflicht, streng: `^[A-Z]{3}\s?\d{4}$`                   | libaddressinput | Hausname/Nummer uneinheitlich                                                                 |
| 50  | MA  | Marokko                      | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 183 | NP  | Nepal                        | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 192 | OM  | Oman                         | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 193 | PK  | Pakistan                     | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 196 | PA  | Panama                       | E      | Straße \| Nr.    | –                    | keine – unsichtbar „0“                                  | libaddressinput |                                                                                               |
| 214 | SA  | Saudi Arabien                | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput | National Address (Gebäudenr. + Straße + Bezirk) uneinheitlich                                 |
| 223 | LK  | Sri Lanka                    | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 60  | TW  | Taiwan                       | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput | gebietsbasiert, aber nicht in Gruppe D verlangt                                               |
| 62  | TH  | Thailand                     | E      | Straße \| Nr.    | optional (79)        | Pflicht                                                 | libaddressinput |                                                                                               |
| 236 | TN  | Tunesien                     | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 245 | VE  | Venezuela                    | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |
| 254 | AE  | Vereinigte Arabische Emirate | E      | Straße \| Nr.    | –                    | keine – unsichtbar „0“                                  | libaddressinput | Emirat nicht in PlentyONE → im Ort                                                            |
| 246 | VN  | Vietnam                      | E      | Straße \| Nr.    | –                    | Pflicht                                                 | libaddressinput |                                                                                               |

## 5. Abwärtskompatibilität

- **Speicherung:** gleiche Felder wie bisher (Abschnitt 1) – keine Migration in PlentyONE.
- **Bestellungen:** Bestelladressen sind eigene Kopien in PlentyONE und werden nicht verändert.
- **Bestehende Adressen:** Der Altbestand ist überall im deutschen Muster gespeichert (Straße, Nummer) und passt
  damit in die zwei Felder aller Länder außer GB.
- **Britische Adressen mit Hausnummer** (aus LTS oder bis 2026-11): „Altformat“ (Entscheidung 2026-11-01) – beim
  Bearbeiten zeigt das Formular für **diese** Adresse weiter Straße | Hausnummer (Nummer optional), es wird nichts
  zusammengesetzt oder zerlegt.
- **US-/CA-Adressen ohne Bundesstaat:** werden beim nächsten Bearbeiten nach dem Staat gefragt. Laut
  Bestandsaufnahme betrifft das bisher einen US-Auftrag über die PWA; Altadressen aus LTS haben den Staat fast immer.

## 6. Umsetzung

Alles im Modul `apps/web/modules/glas-jena`, keine Originaldatei geändert:

1. `runtime/utils/addressFormats.ts` – Länderdaten als Listen (Gruppen, GB als einzeiliges Land, Staaten
   Pflicht/optional/Kürzel, Länder ohne PLZ, Beschriftungen) und reine Funktionen: Format eines Landes, Felder und
   Zeilen in Reihenfolge, Auswahl der Staaten, PLZ-Normalisierung, Altformat, Zusammensetzen beim Wechsel nach GB,
   Hinweise. Länder ohne Eintrag → E.
2. `runtime/components/GlasJenaAddressCountry.vue` (Land oben) und `GlasJenaAddressFields.vue` (Adressteil mit
   Telefon und Hinweisen).
3. Ersatz-Komponenten (`COMPONENT_OVERRIDES`): `GlasJenaAddressFormShipping.vue`, `GlasJenaAddressFormBilling.vue`
   (Kasse), `GlasJenaAddressForm.vue` (Mein Konto); Registrierung `pages/GlasJenaRegister.vue` (`PAGE_OVERRIDES`).
   Kopien der Originale, erzeugt mit den Ersetzungen in `__tests__/addressFormCopy.ts`.
4. `composables/useGlasJenaAddressForm.ts` (Prüfschema der Kasse, hüllt das Original ein) und
   `composables/useGlasJenaRegisterForm.ts` (Kopie für die Registrierung).
5. Übersetzungen DE/EN im i18n-Block von `GlasJenaAddressFields.vue`, Fehlertext Telefon in `runtime/lang`.
6. Vertragstest `__tests__/upstreamContractAddress.spec.ts`: die Kopien müssen die Originale mit genau den
   Ersetzungen sein; außerdem die Felder des Original-Schemas und die Feldzuordnung des Shop-Pakets.

## 7. Autovervollständigung (nur Vorschlag)

Nicht umsetzen. Dienste wie Google Places, Loqate oder HERE kosten je Abfrage, übertragen jede Tastatureingabe
an Dritte (Google: USA) und brauchen dafür Einwilligung bzw. eine Abwägung nach DSGVO. Für die Bestellmengen
eines Glas-Fachhandels steht das in keinem Verhältnis. Das Browser-Autofill (3.6) deckt den häufigsten Fall
kostenlos ab. Falls später gewünscht: selbst gehostete Lösung auf OpenStreetMap-Basis (z. B. Photon) prüfen.

## 8. Tests

### Unit-Tests (Vitest)

- `utils/__tests__/addressFormats.spec.ts`: Gruppen, Format je Land, Felder und Zeilen in Reihenfolge (DE, US, GB,
  GB-Altformat, JP, HK, IT), Kürzel der Staaten, PLZ-Normalisierung, Zusammensetzen, Hinweise.
- `components/__tests__/GlasJenaAddressFields.spec.ts`: Formular je Land, Altformat, Wechsel nach GB, Staat
  leeren, unsichtbare PLZ „0“, Hinweise, PLZ beim Verlassen des Feldes.
- `__tests__/upstreamContractAddress.spec.ts`: Vertragstest (Abschnitt 6).

### Im Browser (lokal gegen PlentyONE, 2026-11-02)

Gastsitzung im lokalen Dev-Server, Adressen über das Formular gespeichert und die Antwort von PlentyONE geprüft:

| Land | Eingabe                                          | `address1`           | `address2` | `address3`   | `postalCode` | `town`      | `stateId`     | Telefon         |
| ---- | ------------------------------------------------ | -------------------- | ---------- | ------------ | ------------ | ----------- | ------------- | --------------- |
| US   | 221 \| Baker St, Apt 4B, Springfield, IL, 62704  | Baker St             | 221        | Apt 4B       | 62704        | Springfield | 30 (Illinois) | +1 217 555 0100 |
| HK   | 1 \| Queen's Road Central, Flat A, 12/F, Central | Queen's Road Central | 1          | Flat A, 12/F | 0            | Central     | –             | –               |
| GB   | 10 Downing Street (eine Zeile), London, SW1A 2AA | 10 Downing Street    | –          | –            | SW1A 2AA     | London      | –             | –               |

Abgelehnt (422 `address.validationFailed`): US und IT ohne Hausnummer, HK ohne PLZ. Geprüft außerdem: Layout
Desktop und Handy (Kasse, Registrierung), Länderwechsel US → HK → GB → JP.

### Testbestellung und Etiketten (2026-11-02)

Drei Gastbestellungen über den lokalen Dev-Server gegen PlentyONE, Vorkasse (dafür vorübergehend für US, GB, JP
freigeschaltet), Paketversand; DHL-Übertragung durch den Shopbetreiber, danach storniert (Status 8).

| Auftrag | Land | Empfänger auf dem DHL-Etikett (Paket International)                           |
| ------- | ---- | ----------------------------------------------------------------------------- |
| 55069   | GB   | 10 Downing Street · London · SW1A 2AA · UNITED KINGDOM                        |
| 55070   | US   | Apt 4B · 221 Baker St · Springfield IL 62704 · UNITED STATES OF AMERICA (USA) |
| 55071   | JP   | Marunouchi Building 12F · Marunouchi 1-2-3 · 100-0005 Chiyoda-ku · JAPAN      |

Ergebnisse: DHL nimmt die britische Zeile ohne Hausnummer an; in den USA setzt DHL die Hausnummer selbst nach vorn und
druckt den Staat als Kürzel; der Adresszusatz (`address3`) steht über der Straße. ⚠ Die Präfektur Japans (`stateId`)
druckt DHL nicht – die Adresse ist über die PLZ eindeutig, wäre aber über den Ort ergänzbar („Chiyoda-ku, Tokyo“); Entscheidung des Shopbetreibers
(2026-11-03): so lassen. Die
Telefonnummer steht nur im Auftrag, nicht auf dem Etikett („Receiver contact“ leer).

## 9. Abdeckung

- 125 Lieferländer: A 6, B 54, C 21, D 3, E 41.
- Bundesstaat-Auswahl in 12 Ländern, Pflicht in 8, als Kürzel in 3.
- Nicht abgedeckt: Landessprachliche Labels (nur DE/EN, die Shop-Sprachen); Anzeige von Adressen im Länderformat
  (Konto, Kasse, Bestätigung) bleibt wie bisher („Baker St 221“, ohne Adresszusatz und Staat); Postfach/PO Box ohne
  eigenes Feld.

### Bekannte Grenze: Telefonnummer lässt sich nicht leeren

Test 2026-11-02 (Gastadresse über `doSaveAddress`, dieselbe Adresse mehrfach gespeichert): Eine neue Telefonnummer
übernimmt PlentyONE, eine leere (`''`, `null`, Leerzeichen) übergeht es – die alte Nummer bleibt. Adresszusatz
(`address3`) und Bundesstaat (`stateId`) lassen sich dagegen leeren. Ursache: Telefon ist eine Option der Adresse
(Typ 4), kein Adressfeld; die Shop-Schnittstelle (`/rest/storefront/contact/addresses`) entfernt leere Optionen beim
Aktualisieren nicht. Das Formular schickt den leeren Wert korrekt (`telephone: ''` über `mapAddressForServer`). Das
gilt genauso für das Original-Formular im Konto und vermutlich für die anderen Optionen (E-Mail, DHL-Postnummer). Die
Nummer steht nur im Auftrag, nicht auf dem DHL-Etikett. Entscheidung des Shopbetreibers (2026-11-02): so lassen; wer die Nummer
gelöscht haben will, dem entfernt sie der Shopbetreiber im Backend.

## 10. Entscheidungen und Annahmen

1. ~~Gruppe A nur DE/AT/CH/NL?~~ Geklärt (2026-11-01): ja, DE (mit Helgoland, Büsingen), AT, CH, NL; übrige Länder in B bzw. C.
2. ~~Zeile 2 → `address3`?~~ Geklärt (2026-11-01): `address3` geht an DHL, `name4`/`address4` nicht.
3. ~~Telefon?~~ Geklärt (2026-11-01): optionales Feld; kein eigener Ansprechpartner bei Firmen.
4. ~~Bundesstaat Pflicht?~~ Geklärt (2026-11-01): Pflicht in US, CA, AU, BR, CN, IN, JP, MX; IT und ID optional ohne Hinweis.
5. ~~Altadressen?~~ Geklärt (2026-11-01): Altformat beim Bearbeiten beibehalten, nichts zusammensetzen.
6. ~~Tests mit dem echten PlentyONE?~~ Geklärt (2026-11-01): Gastbestellungen im Online-Shop freigegeben.
7. ~~Bestandsaufnahme?~~ Geklärt (2026-11-01): Einblick ins Backend freigegeben (lesend), Anmeldung durch den
   Shopbetreiber.
8. ~~FedEx-Anbindung?~~ Geklärt (2026-11-01): kein FedEx, nur DHL.
9. ~~Labels nur DE/EN?~~ Geklärt (2026-11-01): ja, die Shop-Sprachen; landesübliche Begriffe (ZIP code, Postcode, Eircode, Province, Prefecture) innerhalb von DE/EN.
10. **Hausnummer und PLZ sind in PlentyONE Pflicht** (außer GB, Test 2026-11-02): zwei Felder Straße/Nummer in
    allen Ländern außer GB (Entscheidung 2026-11-02, statt einer Zeile); Länder ohne PLZ schicken unsichtbar „0“.
11. **Staaten als Kürzel** in US, CA, AU (Wunsch 2026-11-02).
12. **Hinweise:** nur nicht-lateinische Schrift und Straße über 50 Zeichen (Auswahl 2026-11-01).

## Quellen

- PlentyONE-Länderdaten des Shops (`/plentysystems/getAggregatedCountries` auf www.glas-jena.de): Länder, IDs,
  Bundesstaat-Listen, `zipCodeRegex`, `isCountryStateMandatory` – abgerufen 2026-10-31.
- Google libaddressinput / Chromium i18n address data, `https://chromium-i18n.appspot.com/ssl-address/data/<ISO>`
  (`fmt`, `require`, `zip`, `state_name_type`, `zip_name_type`) – abgerufen 2026-10-31; ohne Eintrag: BO, GH,
  IC, EA, LY, QA.
- `@plentymarkets/shop-api` 0.188.0, `mapAddressForServer`/`mapAddressForClient` (Feldzuordnung).
- UPU-Länderdatenblätter (Postal addressing systems) wurden nicht einzeln geöffnet; die Gruppenzuordnung
  stützt sich auf libaddressinput und die Hinweise in der Tabelle.
- DHL-Feldverwendung: Angabe des Shopbetreibers (2026-11-01), Etiketten der Testaufträge 55069–55071 (Abschnitt 8).
- Pflichtfelder von PlentyONE: Speichertests über die Shop-Schnittstelle am 2026-11-02 (Abschnitt 8) und
  Konfiguration des Plugin-Sets „PWA-Plugin-Set“ (Ceres, lesend über die REST-Schnittstelle).
