# Adressformate je Lieferland (Konzept)

Stand 2026-11-01, Branch `feat/address-formats`. **Entwurf zur Freigabe – noch nichts umgesetzt.**
Unsichere Punkte sind mit ⚠ markiert; die offenen Fragen stehen in Abschnitt 10.

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
⚠ Noch offen: ob DHL eine vollständige Zeile in `address1` bei leerem `address2` annimmt (die DHL-API erlaubt
das für internationale Sendungen) und ob der Bundesstaat übertragen wird. → Etikettentest, siehe Abschnitt 8.

### Aktive Lieferländer

125 Lieferländer (Abruf `getAggregatedCountries` auf glas-jena.de, 2026-10-31), darunter die
Sondergebiete Helgoland (255), Büsingen (256), Balearen (65), Kanaren (37), Ceuta (42), Melilla (43).
PlentyONE führt Bundesstaat-Listen für 15 Länder (AR, AU, BR, CA, CH, CN, DE, ID, IN, IT, JP, MX, NL, TH, US)
und PLZ-Regex für 37 Länder. Die Rechnungsländer (30, EU/EWR) sind eine Teilmenge.

## 2. Gruppen

Alle Gruppen beginnen mit **Land**, danach Vorname | Nachname und der Firmen-Umschalter (Firma, USt-IdNr.)
wie heute. Unterschiede gibt es nur im Adressteil:

### A – Straße und Hausnummer getrennt (DE, AT, CH, NL; DE-Sondergebiete)

| Feld         | DE / EN                                       | Pflicht | PlentyONE            |
| ------------ | --------------------------------------------- | ------- | -------------------- |
| Straße       | Straße / Street                               | ja      | `address1`           |
| Hausnummer   | Hausnr. / House no.                           | ja      | `address2`           |
| Adresszusatz | Adresszusatz / Additional address information | nein    | `address3`           |
| PLZ \| Ort   | PLZ / Postcode · Ort / City                   | ja      | `postalCode`, `town` |

Wie heute; neu sind nur Land oben und der optionale Adresszusatz. Packstation/Postfiliale bleibt unverändert.
NL: Hausnummer mit Zusatz („123-2“, „12 A“) ins Feld Hausnr.

### B – Straße und Hausnummer in einem Feld, Nummer hinten (übriges Europa, Lateinamerika u. a.)

| Feld                  | DE / EN                                                      | Pflicht    | PlentyONE                |
| --------------------- | ------------------------------------------------------------ | ---------- | ------------------------ |
| Straße und Hausnummer | Straße und Hausnummer / Street and house number              | ja         | `address1` (vollständig) |
| Adresszusatz          | Adresszusatz (Wohnung, Stockwerk …) / Apartment, floor, etc. | nein       | `address3`               |
| PLZ \| Ort            | wie A                                                        | je Tabelle | `postalCode`, `town`     |
| Provinz               | Provinz / Province (bzw. „Bundesstaat“/„State“ bei BR, MX)   | je Tabelle | `stateId`                |

`address2` bleibt leer, die Zeile wird **nicht** in Straße und Nummer zerlegt.

### C – Hausnummer vor der Straße, ein Feld (US, CA, AU, NZ, GB, IE, FR, LU, ZA, SG …)

| Feld          | DE / EN                                                                    | Pflicht    | PlentyONE                |
| ------------- | -------------------------------------------------------------------------- | ---------- | ------------------------ |
| Adresszeile 1 | Hausnummer und Straße / Street address                                     | ja         | `address1` (vollständig) |
| Adresszeile 2 | Wohnung, Suite, Gebäude / Apt, suite, unit, building                       | nein       | `address3`               |
| Ort           | Ort / City (GB: Town/City)                                                 | ja         | `town`                   |
| Bundesstaat   | Bundesstaat/Provinz / State, Province                                      | je Tabelle | `stateId`                |
| PLZ           | PLZ / ZIP code (US), Postal code (CA), Postcode (GB, AU, NZ), Eircode (IE) | je Tabelle | `postalCode`             |

Reihenfolge Ort – Bundesstaat – PLZ wie auf dem Brief („Springfield, IL 62704“).

### D – Gebietsbasiert (JP, KR, CN)

| Feld              | DE / EN                                                                            | Pflicht   | PlentyONE                |
| ----------------- | ---------------------------------------------------------------------------------- | --------- | ------------------------ |
| PLZ               | Postleitzahl / Postal code (JP mit 〒-Hinweis)                                     | ja        | `postalCode`             |
| Präfektur/Provinz | Präfektur / Prefecture (JP), Provinz / Province (CN); KR: keine Liste in PlentyONE | JP, CN ja | `stateId`                |
| Ort               | Stadt, Bezirk / City, ward (KR: Stadt/Provinz)                                     | ja        | `town`                   |
| Adresse           | Stadtteil, Chōme-Ban-Gō / District, block, building no.                            | ja        | `address1` (vollständig) |
| Gebäude, Zimmer   | Gebäude, Zimmer / Building, room                                                   | nein      | `address3`               |

Eingabe in lateinischer Schrift (Hinweis unter dem Formular, siehe 3.5). Beispiel Japan:
PLZ 100-0005, Präfektur Tokyo, Ort Chiyoda-ku, Adresse 1-2-3 Marunouchi.

### E – Fallback: zwei freie Adresszeilen (alle übrigen Länder und unsichere Fälle)

| Feld          | DE / EN                                                  | Pflicht                | PlentyONE            |
| ------------- | -------------------------------------------------------- | ---------------------- | -------------------- |
| Adresszeile 1 | Adresse / Address line 1                                 | ja                     | `address1`           |
| Adresszeile 2 | Adresszeile 2 / Address line 2                           | nein                   | `address3`           |
| PLZ \| Ort    | Postleitzahl / Postal code · Ort / City                  | PLZ je Tabelle, Ort ja | `postalCode`, `town` |
| Region        | Region / State, region (nur wo PlentyONE eine Liste hat) | je Tabelle             | `stateId`            |

## 3. Gemeinsame Regeln

### 3.1 Land zuerst

Die Länderauswahl steht oben; Vorbelegung bleibt das Lieferland des Warenkorbs. Wechselt der Kunde das Land,
baut sich das Formular neu auf. Eingaben bleiben erhalten (Name, Firma, Ort, PLZ). Von A nach B/C/E werden
Straße und Hausnummer **sichtbar** zu einer Zeile zusammengesetzt (B/E: „Straße Nr.“, C: „Nr. Straße“), der
Kunde sieht das Ergebnis vor dem Speichern. Von B/C/D/E nach A wird nichts zerlegt: die Zeile steht im Feld
Straße, die Hausnummer muss der Kunde eintragen.

### 3.2 Bundesstaat/Provinz

Auswahlliste aus PlentyONE (`stateId`). Sichtbar, wenn PlentyONE eine Liste hat **und** der Staat laut
libaddressinput zur Postanschrift gehört (bei DE, CH, NL also nicht). Pflicht, wenn PlentyONE ihn verlangt
(US, CA) oder libaddressinput ihn verlangt (AU, BR, CN, ID, IN, IT, JP, MX); sonst optional (AR, TH).

### 3.3 PLZ

- Normalisieren vor Prüfung und Speichern: Leerzeichen am Rand entfernen, Buchstaben groß
  („sw1a 2aa“ → „SW1A 2AA“; der NL-Regex von PlentyONE ist sonst bei Kleinbuchstaben falsch).
- PlentyONE-Regex vorhanden: **streng** (blockiert), wie heute – PlentyONE prüft vermutlich serverseitig
  dasselbe ⚠.
- Nur libaddressinput-Muster: **Warnung**, Bestellung bleibt möglich.
- Pflicht nur, wo libaddressinput die PLZ verlangt (bzw. ohne libaddressinput-Daten, wo PlentyONE einen Regex
  hat). Länder ohne PLZ-System: Feld ausgeblendet, `postalCode` leer ⚠ (ob PlentyONE leer annimmt, prüft der
  Test).

### 3.4 Telefon

⚠ Entscheidung offen (Frage 3). Ohne FedEx verlangt kein Versandweg eine Telefonnummer. Möglich: in der Kasse
für Länder außer DE als optionales Feld (Speicherung über die vorhandene Option Typ 4) oder wie heute weglassen.

### 3.5 Warnungen statt Blockaden

Gelb, nicht blockierend:

- PLZ passt nicht zum libaddressinput-Muster.
- Nicht-lateinische Zeichen (z. B. Kanji, Kyrillisch): „Bitte in lateinischen Buchstaben, damit das
  Versandetikett lesbar ist.“
- Gruppe C: Adresszeile 1 ohne Ziffer („Hausnummer vergessen?“).
- Adresszeile 1 länger als 50 Zeichen (Grenze des DHL-Straßenfelds ⚠).

Blockierend bleiben nur: Pflichtfelder, PlentyONE-PLZ-Regex, Bundesstaat bei Pflicht-Ländern.

### 3.6 Browser-Autofill

Jedes Feld bekommt das passende `autocomplete` (`address-line1`, `address-line2`, `address-level1` für den
Staat, `address-level2` für den Ort, `postal-code`, `country`, `tel`). In Gruppe A bleibt die Hausnummer
ohne `address-line2`, damit der Browser dort keinen Zusatz einträgt.

## 4. Länder

Erzeugt aus den PlentyONE-Länderdaten des Shops und den libaddressinput-Daten (Abruf 2026-10-31).
„Bundesstaat/Provinz“: Pflicht/optional mit Anzahl der Einträge in PlentyONE, „–“ = kein Feld.
„streng“ = PlentyONE-Regex (blockiert), „Warnung“ = libaddressinput-Muster (nur Hinweis).
Gruppenzuordnung: A–D nach libaddressinput-Format und den Postmustern des Landes; Länder ohne
libaddressinput-Eintrag oder mit uneinheitlichen Adressen (Landmarken, Gebäudenamen, digitale Adressen)
→ E.

| ID  | ISO | Land                         | Gruppe | Bundesstaat/Provinz | PLZ                                                        | Quelle          | Hinweis                                                                                                   |
| --- | --- | ---------------------------- | ------ | ------------------- | ---------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| 256 | DE  | Büsingen, Deutschland        | A      | –                   | Pflicht, streng: `^\d{5}$`                                 | libaddressinput | Packstation/Postfiliale nutzen dieselben Felder (address1 = „Packstation“, address2 = Nummer)             |
| 1   | DE  | Deutschland                  | A      | –                   | Pflicht, streng: `^\d{5}$`                                 | libaddressinput | Packstation/Postfiliale nutzen dieselben Felder (address1 = „Packstation“, address2 = Nummer)             |
| 255 | DE  | Helgoland, Deutschland       | A      | –                   | Pflicht, streng: `^\d{5}$`                                 | libaddressinput | Packstation/Postfiliale nutzen dieselben Felder (address1 = „Packstation“, address2 = Nummer)             |
| 21  | NL  | Niederlande                  | A      | –                   | Pflicht, streng: `^\d{4}[ ]?[A-Z]{2}$`                     | libaddressinput | Hausnummer mit Zusatz („123-2“, „12 A“) im Feld Nr.                                                       |
| 2   | AT  | Österreich                   | A      | –                   | Pflicht, streng: `^(?!0)\d{4}$`                            | libaddressinput |                                                                                                           |
| 4   | CH  | Schweiz                      | A      | –                   | Pflicht, streng: `^\d{4}$`                                 | libaddressinput | auch frz./ital. Landesteile: Nummer hinter der Straße                                                     |
| 52  | AL  | Albanien                     | B      | –                   | optional, Warnung: `\d{4}`                                 | libaddressinput |                                                                                                           |
| 71  | AD  | Andorra                      | B      | –                   | optional, Warnung: `AD[1-7]0\d`                            | libaddressinput |                                                                                                           |
| 76  | AR  | Argentinien                  | B      | optional (24)       | optional, Warnung: `[A-HJ-NP-Z]\d{4}[A-Z]{3}`              | libaddressinput |                                                                                                           |
| 51  | AM  | Armenien                     | B      | –                   | optional, Warnung: `(?:37)?\d{4}`                          | libaddressinput |                                                                                                           |
| 78  | AZ  | Aserbaidschan                | B      | –                   | optional, Warnung: `\d{4}`                                 | libaddressinput |                                                                                                           |
| 3   | BE  | Belgien                      | B      | –                   | Pflicht, streng: `^\d{4}$`                                 | libaddressinput | frz. Schreibweise ebenfalls „Rue de la Loi 16“                                                            |
| 88  | BA  | Bosnien und Herzegowina      | B      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 39  | BR  | Brasilien                    | B      | Pflicht (27)        | Pflicht, Warnung: `\d{5}-?\d{3}`                           | libaddressinput | Bairro in Zeile 2                                                                                         |
| 44  | BG  | Bulgarien                    | B      | –                   | optional, streng: `^\d{4}$`                                | libaddressinput |                                                                                                           |
| 42  | EA  | Ceuta                        | B      | –                   | optional                                                   | –               | kein Eintrag bei libaddressinput; spanisches Muster (Correos)                                             |
| 101 | CL  | Chile                        | B      | –                   | optional, Warnung: `\d{7}`                                 | libaddressinput |                                                                                                           |
| 7   | DK  | Dänemark                     | B      | –                   | Pflicht, streng: `^\d{4}$`                                 | libaddressinput |                                                                                                           |
| 9   | EE  | Estland                      | B      | –                   | Pflicht, streng: `^\d{5}$`                                 | libaddressinput |                                                                                                           |
| 122 | FO  | Färöer                       | B      | –                   | optional, Warnung: `\d{3}`                                 | libaddressinput |                                                                                                           |
| 11  | FI  | Finnland                     | B      | –                   | Pflicht, streng: `^(FI-\|AX-)?\d{5}$`                      | libaddressinput |                                                                                                           |
| 129 | GE  | Georgien                     | B      | –                   | optional, Warnung: `\d{4}`                                 | libaddressinput |                                                                                                           |
| 13  | GR  | Griechenland                 | B      | –                   | Pflicht, streng: `^\d{3}[ ]?\d{2}$`                        | libaddressinput |                                                                                                           |
| 132 | GL  | Grönland                     | B      | –                   | Pflicht, Warnung: `39\d{2}`                                | libaddressinput |                                                                                                           |
| 144 | IS  | Island                       | B      | –                   | optional, Warnung: `\d{3}`                                 | libaddressinput |                                                                                                           |
| 59  | IL  | Israel                       | B      | –                   | optional, Warnung: `\d{5}(?:\d{2})?`                       | libaddressinput | Nummer hinter der Straße (hebr. Schreibweise)                                                             |
| 15  | IT  | Italien                      | B      | Pflicht (107)       | Pflicht, streng: `^\d{5}$`                                 | libaddressinput | Provinz laut libaddressinput Pflicht (Kandidat für „nur Warnung“)                                         |
| 37  | IC  | Kanarische Inseln            | B      | –                   | optional                                                   | –               | kein Eintrag bei libaddressinput; spanisches Muster (Correos)                                             |
| 47  | KZ  | Kasachstan                   | B      | –                   | optional, Warnung: `\d{6}`                                 | libaddressinput |                                                                                                           |
| 45  | XK  | Kosovo                       | B      | –                   | optional, Warnung: `[1-7]\d{4}`                            | libaddressinput |                                                                                                           |
| 54  | HR  | Kroatien                     | B      | –                   | optional, streng: `^(HR-)?\d{5}$`                          | libaddressinput |                                                                                                           |
| 18  | LV  | Lettland                     | B      | –                   | Pflicht, streng: `^(LV-)?\d{4}$`                           | libaddressinput |                                                                                                           |
| 34  | LI  | Liechtenstein                | B      | –                   | Pflicht, Warnung: `948[5-9]\|949[0-8]`                     | libaddressinput |                                                                                                           |
| 33  | LT  | Litauen                      | B      | –                   | Pflicht, streng: `^(LT-)?\d{5}$`                           | libaddressinput |                                                                                                           |
| 43  | EA  | Melilla                      | B      | –                   | optional                                                   | –               | kein Eintrag bei libaddressinput; spanisches Muster (Correos)                                             |
| 36  | MX  | Mexico                       | B      | Pflicht (32)        | Pflicht, Warnung: `\d{5}`                                  | libaddressinput | Colonia in Zeile 2                                                                                        |
| 175 | MD  | Moldavien (Moldau)           | B      | –                   | optional, Warnung: `\d{4}`                                 | libaddressinput |                                                                                                           |
| 177 | ME  | Montenegro                   | B      | –                   | optional, Warnung: `8\d{4}`                                | libaddressinput |                                                                                                           |
| 164 | MK  | Nordmazedonien               | B      | –                   | optional, Warnung: `\d{4}`                                 | libaddressinput |                                                                                                           |
| 20  | NO  | Norwegen                     | B      | –                   | Pflicht, streng: `^\d{4}$`                                 | libaddressinput |                                                                                                           |
| 198 | PY  | Paraguay                     | B      | –                   | optional, Warnung: `\d{6}`                                 | libaddressinput |                                                                                                           |
| 199 | PE  | Peru                         | B      | –                   | optional, Warnung: `(?:LIMA \d{1,2}\|CALLAO 0?\d)\|[0-2]…` | libaddressinput |                                                                                                           |
| 23  | PL  | Polen                        | B      | –                   | Pflicht, streng: `^\d{2}-\d{3}$`                           | libaddressinput |                                                                                                           |
| 22  | PT  | Portugal                     | B      | –                   | Pflicht, streng: `^\d{4}([\-]\d{3})?$`                     | libaddressinput |                                                                                                           |
| 41  | RO  | Rumänien                     | B      | –                   | Pflicht, streng: `^\d{6}$`                                 | libaddressinput |                                                                                                           |
| 40  | RU  | Russland                     | B      | –                   | Pflicht, Warnung: `\d{6}`                                  | libaddressinput |                                                                                                           |
| 212 | SM  | San Marino                   | B      | –                   | Pflicht, Warnung: `4789\d`                                 | libaddressinput |                                                                                                           |
| 24  | SE  | Schweden                     | B      | –                   | Pflicht, streng: `^(SE-)?\d{3}[ ]?\d{2}$`                  | libaddressinput |                                                                                                           |
| 216 | RS  | Serbien                      | B      | –                   | optional, Warnung: `\d{5,6}`                               | libaddressinput |                                                                                                           |
| 26  | SK  | Slowakische Republik         | B      | –                   | Pflicht, streng: `^\d{3}[ ]?\d{2}$`                        | libaddressinput |                                                                                                           |
| 27  | SI  | Slowenien                    | B      | –                   | optional, streng: `^(SI-)?\d{4}$`                          | libaddressinput |                                                                                                           |
| 8   | ES  | Spanien                      | B      | –                   | Pflicht, streng: `^(?:0[1-9]\|[1-4]\d\|5[0-2])\d{3}$`      | libaddressinput | Stockwerk/Tür („3º B“) im selben Feld                                                                     |
| 65  | ES  | Spanien, Balearen            | B      | –                   | Pflicht, streng: `^(?:0[1-9]\|[1-4]\d\|5[0-2])\d{3}$`      | libaddressinput | Stockwerk/Tür („3º B“) im selben Feld                                                                     |
| 6   | CZ  | Tschechische Republik        | B      | –                   | Pflicht, streng: `^\d{3}[ ]?\d{2}$`                        | libaddressinput |                                                                                                           |
| 63  | TR  | Türkei                       | B      | –                   | Pflicht, Warnung: `\d{5}`                                  | libaddressinput |                                                                                                           |
| 241 | UA  | Ukraine                      | B      | –                   | Pflicht, Warnung: `\d{5}`                                  | libaddressinput |                                                                                                           |
| 14  | HU  | Ungarn                       | B      | –                   | Pflicht, streng: `^\d{4}$`                                 | libaddressinput |                                                                                                           |
| 243 | UY  | Uruguay                      | B      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 48  | BY  | Weißrussland                 | B      | –                   | optional, Warnung: `\d{6}`                                 | libaddressinput |                                                                                                           |
| 5   | CY  | Zypern                       | B      | –                   | optional, streng: `^\d{4}$`                                | libaddressinput |                                                                                                           |
| 29  | AU  | Australien                   | C      | Pflicht (8)         | Pflicht, Warnung: `\d{4}`                                  | libaddressinput | Labels „Postcode“, „State“                                                                                |
| 10  | FR  | Frankreich                   | C      | –                   | Pflicht, streng: `^\d{2}[ ]?\d{3}$`                        | libaddressinput | Nummer vorn („12 rue de la Paix“)                                                                         |
| 124 | GF  | Französisch Guayana          | C      | –                   | Pflicht, Warnung: `9[78]3\d{2}`                            | libaddressinput |                                                                                                           |
| 131 | GI  | Gibraltar                    | C      | –                   | optional, Warnung: `GX11 1AA`                              | libaddressinput |                                                                                                           |
| 12  | GB  | Großbritannien               | C      | –                   | Pflicht, streng: `^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]…`     | libaddressinput | Labels „Postcode“, „Town/City“; Gebäudename in Zeile 1 oder 2                                             |
| 61  | GP  | Guadeloupe                   | C      | –                   | Pflicht, Warnung: `9[78][01]\d{2}`                         | libaddressinput |                                                                                                           |
| 148 | IM  | Insel Man (Isle of Man)      | C      | –                   | Pflicht, Warnung: `IM\d[\dA-Z]? ?\d[ABD-HJLN-UW-Z]{2}`     | libaddressinput |                                                                                                           |
| 16  | IE  | Irland                       | C      | –                   | optional, streng: `^([AC-FHKNPRTV-Y][0-9]{2}\|D6W)[ -]…`   | libaddressinput | Eircode optional; County nicht als Liste in PlentyONE                                                     |
| 150 | JE  | Jersey                       | C      | –                   | Pflicht, Warnung: `JE\d[\dA-Z]? ?\d[ABD-HJLN-UW-Z]{2}`     | libaddressinput |                                                                                                           |
| 30  | CA  | Kanada                       | C      | Pflicht (13)        | Pflicht, Warnung: `[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPR…`    | libaddressinput | PlentyONE: Provinz Pflicht; Labels „Postal code“, „Province“                                              |
| 17  | LU  | Luxemburg                    | C      | –                   | Pflicht, streng: `^(L-)?\d{4}$`                            | libaddressinput | frz. Muster, Nummer vorn („12 rue …“)                                                                     |
| 56  | MY  | Malaysia                     | C      | –                   | Pflicht, Warnung: `\d{5}`                                  | libaddressinput |                                                                                                           |
| 173 | YT  | Mayotte                      | C      | –                   | Pflicht, Warnung: `976\d{2}`                               | libaddressinput |                                                                                                           |
| 35  | MC  | Monaco                       | C      | –                   | optional, Warnung: `980\d{2}`                              | libaddressinput | frz. Muster                                                                                               |
| 66  | NZ  | Neuseeland                   | C      | –                   | Pflicht, Warnung: `\d{4}`                                  | libaddressinput | Suburb laut libaddressinput Pflicht → Zeile 2 (Hinweis, keine Blockade)                                   |
| 200 | PH  | Philippinen                  | C      | –                   | optional, Warnung: `\d{4}`                                 | libaddressinput |                                                                                                           |
| 204 | RE  | Réunion                      | C      | –                   | Pflicht, Warnung: `9[78]4\d{2}`                            | libaddressinput |                                                                                                           |
| 25  | SG  | Singapur                     | C      | –                   | Pflicht, Warnung: `\d{6}`                                  | libaddressinput |                                                                                                           |
| 221 | ZA  | Südafrika                    | C      | –                   | Pflicht, Warnung: `\d{4}`                                  | libaddressinput |                                                                                                           |
| 235 | TT  | Trinidad und Tobago          | C      | –                   | optional, Warnung: `\d{6}`                                 | libaddressinput |                                                                                                           |
| 28  | US  | USA                          | C      | Pflicht (63)        | Pflicht, Warnung: `(\d{5})(?:[ \-](\d{4}))?`               | libaddressinput | PlentyONE: State Pflicht; Labels „ZIP code“, „State“                                                      |
| 31  | CN  | China                        | D      | Pflicht (34)        | Pflicht, Warnung: `\d{6}`                                  | libaddressinput | Provinz Pflicht (PlentyONE 34 Einträge); Bezirk + Straße + Nr. in Zeile 1                                 |
| 32  | JP  | Japan                        | D      | Pflicht (47)        | Pflicht, Warnung: `\d{3}-?\d{4}`                           | libaddressinput | Präfektur Pflicht (PlentyONE 47 Einträge, lateinisch); Chōme-Ban-Gō in Zeile 1, Gebäude/Zimmer in Zeile 2 |
| 155 | KR  | Südkorea                     | D      | –                   | Pflicht, Warnung: `\d{5}`                                  | libaddressinput | Provinz (do/si) nicht in PlentyONE → mit Ort angeben                                                      |
| 53  | EG  | Ägypten                      | E      | –                   | optional, Warnung: `\d{7}\|\d{5}`                          | libaddressinput |                                                                                                           |
| 69  | DZ  | Algerien                     | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 87  | BO  | Bolivien                     | E      | –                   | optional                                                   | –               | kein Eintrag bei libaddressinput                                                                          |
| 109 | CR  | Costa Rica                   | E      | –                   | optional, Warnung: `\d{4,5}\|\d{3}-\d{4}`                  | libaddressinput | Adressen oft mit Landmarken („200 m norte de …“)                                                          |
| 115 | DO  | Dominikanische Republik      | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 116 | EC  | Ecuador                      | E      | –                   | optional, Warnung: `\d{6}`                                 | libaddressinput |                                                                                                           |
| 117 | SV  | El Salvador                  | E      | –                   | optional, Warnung: `[1-3][1-7][0-2]\d`                     | libaddressinput |                                                                                                           |
| 130 | GH  | Ghana                        | E      | –                   | optional                                                   | –               | kein Eintrag bei libaddressinput; digitale Adressen (GhanaPostGPS)                                        |
| 57  | HK  | Hongkong                     | E      | –                   | keine PLZ                                                  | libaddressinput | keine PLZ; Gebiet (HK Island/Kowloon/NT) nicht in PlentyONE → im Ort                                      |
| 38  | IN  | Indien                       | E      | Pflicht (36)        | Pflicht, Warnung: `\d{6}`                                  | libaddressinput | freie Zeilen üblich (Haus, Straße, Locality)                                                              |
| 145 | ID  | Indonesien                   | E      | Pflicht (41)        | optional, Warnung: `\d{5}`                                 | libaddressinput | Provinz laut libaddressinput Pflicht, PlentyONE hat 41 Einträge                                           |
| 147 | IQ  | Irak                         | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 146 | IR  | Iran                         | E      | –                   | optional, Warnung: `\d{5}-?\d{5}`                          | libaddressinput |                                                                                                           |
| 149 | JM  | Jamaika                      | E      | –                   | keine PLZ                                                  | libaddressinput |                                                                                                           |
| 151 | JO  | Jordanien                    | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 98  | KY  | Kaimaninseln                 | E      | –                   | optional, Warnung: `KY\d-\d{4}`                            | libaddressinput |                                                                                                           |
| 95  | KH  | Kambodscha                   | E      | –                   | optional, Warnung: `\d{5,6}`                               | libaddressinput |                                                                                                           |
| 97  | CV  | Kap Verde                    | E      | –                   | optional, Warnung: `\d{4}`                                 | libaddressinput |                                                                                                           |
| 203 | QA  | Katar                        | E      | –                   | optional                                                   | –               | kein Eintrag bei libaddressinput; keine PLZ                                                               |
| 104 | CO  | Kolumbien                    | E      | –                   | optional, Warnung: `\d{6}`                                 | libaddressinput | Sondermuster „Calle 26 # 13-19“                                                                           |
| 112 | CU  | Kuba                         | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 156 | KW  | Kuwait                       | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 159 | LB  | Libanon                      | E      | –                   | optional, Warnung: `(?:\d{4})(?: ?(?:\d{4}))?`             | libaddressinput |                                                                                                           |
| 161 | LR  | Liberia                      | E      | –                   | optional, Warnung: `\d{4}`                                 | libaddressinput |                                                                                                           |
| 162 | LY  | Libyen                       | E      | –                   | optional                                                   | –               | kein Eintrag bei libaddressinput                                                                          |
| 163 | MO  | Macau                        | E      | –                   | keine PLZ                                                  | libaddressinput | keine PLZ                                                                                                 |
| 55  | MV  | Malediven                    | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 19  | MT  | Malta                        | E      | –                   | optional, streng: `^[A-Z]{3}\s?\d{4}$`                     | libaddressinput | Hausname/Nummer uneinheitlich                                                                             |
| 50  | MA  | Marokko                      | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 183 | NP  | Nepal                        | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 192 | OM  | Oman                         | E      | –                   | optional, Warnung: `(?:PC )?\d{3}`                         | libaddressinput |                                                                                                           |
| 193 | PK  | Pakistan                     | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 196 | PA  | Panama                       | E      | –                   | keine PLZ                                                  | libaddressinput |                                                                                                           |
| 214 | SA  | Saudi Arabien                | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput | National Address (Gebäudenr. + Straße + Bezirk) uneinheitlich                                             |
| 223 | LK  | Sri Lanka                    | E      | –                   | optional, Warnung: `\d{5}`                                 | libaddressinput |                                                                                                           |
| 60  | TW  | Taiwan                       | E      | –                   | Pflicht, Warnung: `\d{3}(?:\d{2,3})?`                      | libaddressinput | gebietsbasiert, aber nicht in Gruppe D verlangt → Fallback                                                |
| 62  | TH  | Thailand                     | E      | optional (79)       | optional, Warnung: `\d{5}`                                 | libaddressinput | Provinz optional (PlentyONE 79 Einträge)                                                                  |
| 236 | TN  | Tunesien                     | E      | –                   | optional, Warnung: `\d{4}`                                 | libaddressinput |                                                                                                           |
| 245 | VE  | Venezuela                    | E      | –                   | optional, Warnung: `\d{4}`                                 | libaddressinput |                                                                                                           |
| 254 | AE  | Vereinigte Arabische Emirate | E      | –                   | keine PLZ                                                  | libaddressinput | keine PLZ; Emirat nicht in PlentyONE → im Ort                                                             |
| 246 | VN  | Vietnam                      | E      | –                   | optional, Warnung: `\d{5}\d?`                              | libaddressinput |                                                                                                           |

## 5. Abwärtskompatibilität

- **Speicherung:** gleiche Felder wie heute (Abschnitt 1) – keine Migration in PlentyONE.
- **Bestellungen:** Bestelladressen sind eigene Kopien in PlentyONE und werden nicht verändert. Die Anzeige im
  Konto (`OrderAddressData`: `address1` + `address2`) funktioniert auch mit leerem `address2`.
- **Gruppe A:** unverändert, bestehende Adressen bleiben wie sie sind.
- **Bestehende Adressen in B/C/D/E mit gefüllter Hausnummer** (Altformat aus LTS oder aus der PWA bis heute):
  Vorschlag „Altformat“ – beim Bearbeiten zeigt das Formular für **diese** Adresse weiter Straße | Hausnr.
  (dazu die neuen Felder wie Bundesstaat), es wird nichts zusammengesetzt oder zerlegt. Erst wenn der Kunde
  das Feld Hausnummer leert, gilt das neue Format. Alternative: beim Öffnen sichtbar zu einer Zeile
  zusammensetzen (Frage 5).
- **US-/CA-Adressen ohne Bundesstaat:** werden beim nächsten Bearbeiten nach dem Staat gefragt. ⚠ Ob gespeicherte
  Adressen ohne Staat beim Bestellen schon heute Probleme machen, zeigt die Bestandsaufnahme (Frage 7).

## 6. Umsetzung (nach Freigabe)

Alles im Modul `apps/web/modules/glas-jena`, keine Originaldatei wird geändert:

1. `runtime/utils/addressFormats.ts` – Konfiguration: Gruppen (Felder, Reihenfolge, Labels, Zuordnung) und
   Länderliste (ISO-Code → Gruppe, Staat, PLZ-Pflicht, Muster, Label-Varianten) als Daten; Länder ohne
   Eintrag → E. Dazu reine Funktionen: Format eines Landes, Schema-Regeln, Warnungen, PLZ-Normalisierung,
   Altformat-Erkennung, Zusammensetzen beim Länderwechsel.
2. `runtime/components/GlasJenaAddressFields.vue` – gemeinsamer Adressteil (Land, Adresszeilen, PLZ, Ort,
   Staat, Telefon, Warnungen), genutzt von:
3. Ersatz-Komponenten (`COMPONENT_OVERRIDES`): `AddressFormShipping`, `AddressFormBilling`, `AddressForm` –
   Kopien der Originale, nur der Adressteil ersetzt; Registrierung per Seiten-Override (`PAGE_OVERRIDES`).
4. `useAddressForm` und `useRegisterForm` per `IMPORT_OVERRIDES`: Schema je Land (Hausnummer nur in A Pflicht,
   PLZ/Staat je Tabelle).
5. Übersetzungen DE/EN in `runtime/lang`.
6. Vertragstest `upstreamContract.spec.ts`: neue Abhängigkeiten (Feldnamen, Test-IDs, Komponenten, Composables).

Kleine Commits in dieser Reihenfolge; gepusht wird erst auf deine Ansage.

## 7. Autovervollständigung (nur Vorschlag)

Nicht umsetzen. Dienste wie Google Places, Loqate oder HERE kosten je Abfrage, übertragen jede Tastatureingabe
an Dritte (Google: USA) und brauchen dafür Einwilligung bzw. eine Abwägung nach DSGVO. Für die Bestellmengen
eines Glas-Fachhandels steht das in keinem Verhältnis. Das Browser-Autofill (3.6) deckt den häufigsten Fall
kostenlos ab. Falls später gewünscht: selbst gehostete Lösung auf OpenStreetMap-Basis (z. B. Photon) prüfen.

## 8. Tests

### Unit-Tests (Vitest)

- Jede der 125 PlentyONE-Länder-IDs ergibt ein Format; unbekannte → E.
- Je Beispiel unten: Formularwerte → `Address` → `mapAddressForServer` ergibt die erwarteten PlentyONE-Felder.
- Schema: Pflichtfelder, strenge PLZ, Warnungen, PLZ-Normalisierung, Altformat, Länderwechsel A ↔ C.
- Komponenten: Formular baut sich je Land um (A, C, D, E).

| Gruppe | Eingabe                                       | `address1`                           | `address2` | `address3` | `postalCode` | `town`      | `stateId` |
| ------ | --------------------------------------------- | ------------------------------------ | ---------- | ---------- | ------------ | ----------- | --------- |
| A DE   | Hauptstraße / 12a, 07743 Jena                 | Hauptstraße                          | 12a        |            | 07743        | Jena        |           |
| A NL   | Keizersgracht / 123-2, 1015cj Amsterdam       | Keizersgracht                        | 123-2      |            | 1015CJ ¹     | Amsterdam   |           |
| A AT   | Mariahilfer Straße / 1/3/12, 1060 Wien        | Mariahilfer Straße                   | 1/3/12     |            | 1060         | Wien        |           |
| B IT   | Via Roma 12, 00184 Roma, Provinz Roma         | Via Roma 12                          |            |            | 00184        | Roma        | Roma      |
| B ES   | Calle Mayor 5, 3º B, 28013 Madrid             | Calle Mayor 5, 3º B                  |            |            | 28013        | Madrid      |           |
| C US   | 221 Baker St, Apt 4B, Springfield, IL 62704   | 221 Baker St                         |            | Apt 4B     | 62704        | Springfield | Illinois  |
| C GB   | 10 Downing Street, London, sw1a 2aa           | 10 Downing Street                    |            |            | SW1A 2AA     | London      |           |
| C FR   | 12 rue de la Paix, 75002 Paris                | 12 rue de la Paix                    |            |            | 75002        | Paris       |           |
| C CA   | 24 Sussex Dr, Ottawa, ON K1M 1M4              | 24 Sussex Dr                         |            |            | K1M 1M4      | Ottawa      | Ontario   |
| D JP   | 1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005  | 1-2-3 Marunouchi                     |            |            | 100-0005     | Chiyoda-ku  | Tokyo     |
| E HK   | Flat A, 12/F, 1 Queen's Road Central, Central | Flat A, 12/F, 1 Queen's Road Central |            |            | (leer)       | Central     |           |
| Alt US | gespeichert: Baker St / 221                   | Baker St                             | 221        |            | unverändert  |             |           |

¹ Leerzeichen bleibt, wie eingegeben („1015 CJ“ bleibt „1015 CJ“), nur Großschreibung.

### Im Browser (lokal gegen PlentyONE)

Gastsitzung im lokalen Dev-Server, je Gruppe eine Adresse speichern und die Antwort von PlentyONE
(`mapAddressForClient`) gegen die Tabelle prüfen. ⚠ Das legt Gast-Adressen im echten PlentyONE an – nur nach
deiner Freigabe (Frage 6).

### Testbestellung und Etiketten

Nur nach deiner Freigabe und in der von dir gewählten Form (Frage 6): z. B. je eine Bestellung US/GB/JP mit
Vorkasse, im Backend prüfen (Auftragsadresse, DHL-Etikett), danach stornieren. Etiketten
erzeugst du selbst bzw. gibst sie frei, damit keine echte Sendung entsteht.

## 9. Abdeckung

- 125 Lieferländer: A 6, B 54, C 21, D 3, E 41.
- Bundesstaat-Auswahl in 12 Ländern, Pflicht in 10.
- Nicht abgedeckt: Landessprachliche Labels (nur DE/EN, die Shop-Sprachen); Anzeige von Adressen im Länderformat
  (Konto, Bestätigung) bleibt wie heute; Postfach/PO Box ohne eigenes Feld (geht in Adresszeile 1).

## 10. Offene Fragen und Annahmen

1. **Gruppe A** nur DE/AT/CH/NL (wie in deiner Vorgabe)? BE, LU, LI, DK usw. stehen in B bzw. C.
2. ~~Zeile 2 → `address3`?~~ Geklärt (2026-11-01): `address3` geht an DHL, `name4`/`address4` nicht.
3. **Telefon:** optional für Länder außer DE oder weiter weglassen?
4. **Bundesstaat Pflicht** in US, CA, AU, BR, CN, ID, IN, IT, JP, MX – oder bei IT/ID nur Warnung?
5. **Altadressen:** Altformat beim Bearbeiten beibehalten (Empfehlung) oder sichtbar zusammensetzen?
6. **Tests mit dem echten PlentyONE:** Gast-Adressen anlegen in Ordnung? Testbestellungen – Zahlungsart,
   Storno, wer erzeugt Etiketten?
7. **Bestandsaufnahme (nur lesend):** Darf ich im Backend per REST zählen, wie Adressen/Aufträge aus US, GB,
   JP usw. heute aussehen (Hausnummer in `address1` oder `address2`, US mit/ohne `stateId`)? Dafür müsstest du
   dich in meinem Tab anmelden.
8. ~~FedEx-Anbindung?~~ Geklärt (2026-11-01): kein FedEx, nur DHL.
9. **Annahme:** Labels nur auf DE/EN, nicht in der Landessprache.

## Quellen

- PlentyONE-Länderdaten des Shops (`/plentysystems/getAggregatedCountries` auf www.glas-jena.de): Länder, IDs,
  Bundesstaat-Listen, `zipCodeRegex`, `isCountryStateMandatory` – abgerufen 2026-10-31.
- Google libaddressinput / Chromium i18n address data, `https://chromium-i18n.appspot.com/ssl-address/data/<ISO>`
  (`fmt`, `require`, `zip`, `state_name_type`, `zip_name_type`) – abgerufen 2026-10-31; ohne Eintrag: BO, GH,
  IC, EA, LY, QA.
- `@plentymarkets/shop-api` 0.188.0, `mapAddressForServer`/`mapAddressForClient` (Feldzuordnung).
- UPU-Länderdatenblätter (Postal addressing systems) wurden nicht einzeln geöffnet; die Gruppenzuordnung
  stützt sich auf libaddressinput und die Hinweise in der Tabelle.
- DHL-Feldverwendung: Angabe des Shopbetreibers (2026-11-01); Etikett ⚠ noch nicht getestet, siehe Abschnitt 8.
