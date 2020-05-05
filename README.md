# Jura  Regex
*Regex to find German laws. Can be used to automatically link to legal databases etc. Documentation in German.*

[Regulärer Ausdruck](https://de.wikipedia.org/wiki/Regul%C3%A4rer_Ausdruck) (*Regex*) zum Filtern von Paragraphen und Artikeln aus Texten. Gesetze
werden anhand ihrer Kurzbezeichnung (z. B. "BGB") erkannt. Es gibt eine flexible Version, die Gesetze allgemein an einem Muster erkennt.
Alternativ kann auch eine vorgegebene Liste von Gesetzen genutzt werden. Die gefundenen Normen können dann z. B. aufgelistet oder
automatisch verlinkt werden etc.

## Dateien
Datei|Beschreibung
---|---
regex.py|Beispielsskript mit flexibler Regex
regex_alternative.py|Beispielsskript mit alternativer Regex
gesetze.py|Liste mit Kurzbezeichnungen für Bundesgesetze
verlinker.py|Skript mit automatischer Verlinkung nach https://gesetze-im-internet.de

## Benutzung/Kompatibilität
Die Regexes verwenden die Python-Syntax und können unmittelbar in Python-Skripte eingebunden werden. Sie funktionieren unverändert auch in Perl 5.30.

Das Modul `re` muss importiert werden.

Es sollte die Flag `re.VERBOSE` bzw. `x` gesetzt werden, damit die Regex übersichtlich in mehreren Zeilen und ggf. mit Kommentaren
eingebunden werden kann.

## Beschreibung der Regex
Der reguläre Ausdruck findet zuverlässig Rechtsnormen, die mit "§", "Art." oder "Artikel" eingeleitet werden.

Erfasst wird der gesamte Textabschnitt ab dem einleitenden "§" bzw. Artikel bis einschließlich der Kurzbezeichnung des Gesetzes. In
benannten Untergruppen (named captures) werden jeweils die Paragraphenzahl (auch mit Buchstaben, z.B. 305c), soweit vorhanden der
Absatz/Satz/Nr./lit, und die Gesetzesbezeichnung festgehalten.


> § 58 Abs. 3 Nr. 2 LFGB gewährleiste auch nicht die abstrakte Erkennbarkeit der Strafbarkeit, weil die Entsprechungsformeln nicht nur nicht
 geeignet seien, das Bestimmtheitsgebot zu beachten, sondern diesem sogar entgegenstünden.
>
> Der Anwendungszusammenhang des § 62 Abs. 1 Nr. 1 LFGB potenziere die verfassungsrechtlichen Probleme. Die Vorschriften verstießen auch
gegen Art. 80 Abs. 1 Satz 2 GG. Die Anwendbarkeit des Gesetzes hänge davon ab, ob der Verordnungsgeber von seiner Ermächtigung Gebrauch
gemacht habe.

In diesem Text (aus [ECLI:DE:BVerfG:2020:ls20200311.2bvl000517](http://www.bverfg.de/e/ls20200311_2bvl000517.html)) werden
* § 58 Abs. 3 Nr. 2 LFGB,
* § 62 Abs. 1 Nr. 1 LFGB und
* Art. 80 Abs. 1 Satz 2 GG erkannt.


### Regulärer Ausdruck

Die Regex lautet wie folgt:

```
(§+|Art|Artikel)\.?\s*
(?P<norm>\d+(?:\w\b)?)\s*
(?:Abs\.\s*(?P<absatz>\d+(?:\w\b)?))?\s*
(?:S\.\s*(?P<satz>\d+))?\s*
(?:Nr\.\s*(?P<nr>\d+(?:\w\b)?))?\s*
(?:lit\.\s*(?P<lit>[a-z]?))?
.{0,10}?
(?P<gesetz>\b[A-Z][A-Za-z]*[A-Z](?:(?P<buch>(?:\s|\b)[XIV]+)?))
```
#### Erläuterung der einzelnen Zeilen

```
(§+|Art|Artikel)\.?\s*
```
Eine Rechtsnorm wird mit "§", "Art" oder "Artikel" eingeleitet. Darauf folgt optional ein Punkt und beliebig viel Leerraum (Whitespace).

```
(?P<norm>\d+(?:\w\b)?)\s*
```
In einer separat auswertbaren benannten Untergruppe namens `norm` wird die Paragraphen- bzw. Artikelzahl erfasst. Diese kann aus beliebig
vielen Ziffern bestehen. Optional kann (in einer non-capturing group) auch EIN Buchstabe folgen, wenn darauf ein Wortende folgt: 312g wird
erfasst, 312gg nicht. Auf die Norm folgt beliebig viel Leerraum.

```
(?:Abs\.\s*(?P<absatz>\d+))?\s*
```
In der benannten Untergruppe "absatz" wird die Nummer des Absatzes erfasst, sofern dieser angegeben wird. Dafür muss der Absatz im Text mit
"Abs." eingeleitet werden. Es folgt beliebig viel Leeraum. Wie auch bei der §§-Zahl, kann auch ein Buchstabe auf die Zahl folgen
(z.B. Abs. 1a).

```
(?:S\.\s*(?P<satz>\d+))?\s*
(?:Nr\.\s*(?P<nr>\d+(?:\w\b)?))?\s*
(?:lit\.\s*(?P<lit>[a-z]?))?
```
Diese Zeilen erfassen analog zur vorhergehenden den Satz, die Nr. und die lit., sofern angegeben. Ein Satz darf nur aus Ziffern bestehen,
eine lit. nur aus Buchstaben. Bei der Nr. ist wie bei Absatz und §§-Zahl auch eine Mischung aus Ziffern/Buchstaben vorgesehen.

```
.{0,10}?
```
Vor der Gesetzesbezeichnung folgen beliebige Zeichen, allerdings maximal 10 und so wenige wie möglich. Die Begrenzung auf 10 Zeichen
(weniger funktioniert idR auch) verhindert, dass z. B. in  "§ 1 der Verordnung der Versammlungsbehörde für die Ausübung des durch
§ 15 Abs. 1 VersG eingeräumten Ermessens" statt "§ 15 VersG" "1 VersG" erfasst wird.

```
(?P<gesetz>\b[A-Z][A-Za-z]*[A-Z](?:(?P<buch>(?:\s|\b)[XIV]+)?))
```
In der benannten Untergruppe `gesetz` wird die Kurzbezeichnung des Gesetzes erfasst. Die Erkennung beruht darauf, dass jede Kurzbezeichnung
eines Gesetzes mit einem Großbuchstaben beginnt und mit einem Großbuchstaben endet. Dazwischen können beliebig viele Buchstaben (groß/klein)
 liegen.
***
⚠️ Die Gestaltung der letzen Zeile ist darauf ausgerichtet, möglichst viele potentielle Gesetze zu erkennen. Diese Flexibilität führt
allerdings auch dazu, dass etwa "§ 44 BluBB" oder "Artikel 1 CAPSLOCK" als Treffer erkannt werden. Alternativ dazu kann eine vorgegebene
Liste an erlaubten Gesetzen vorgegeben werden. Dies wird [unten](#Alternative_Version) erläutert.
***
Die auf `gesetz` folgende optionale named capture `buch` ist für Gesetzesabkürzungen wie SGB II erforderlich, bei denen das jeweilige
Gesetzbuch durch ein Leerzeichen getrennt in römischen Ziffern ausgedrückt wird. Gibt es hier einen entsprechenden Treffer, so ist das
Leerzeichen in der Gruppe `Buch` enthalten. Die Verwendung eines named capture für `buch` ist an sich unnötig, da diese Gruppe komplett in `gesetz`
enthalten ist. Sie hilft jedoch, den Sinn dieser Gruppe direkt zu erinnern.


Für den obigen Beispielstext ergeben sich damit die folgenden Matches:

Nr. | Ganzes Match          | Norm | Abs. | S.  | Nr. | lit. | gesetz | buch
--- | ---                   | ---  | ---  | --- | --- | ---  | ---    | ---
1   |§ 58 Abs. 3 Nr. 2 LFGB | 58   | 3    | –   | 2   | –    | LFGB   | –
2   |§ 62 Abs. 1 Nr. 1 LFGB | 62   | 1    | –   | 1   | –    | LFGB   | –
3   |Art. 80 Abs. 1 Satz 2 GG| 80  | 1    | 2   | –   | –    | GG     | –

### Grenzen der Erkennung
***
⚠️ Die Erkennung verlässt sich darauf, dass für jede Norm die Gesetzesabkürzung genannt wird. Bei Nennung mehrerer Normen aus dem gleichen
Gesetz direkt hintereinander (§§-Ketten) wird die gesamte Kette als Match gewertet, dabei aber nur die jeweils erste Norm erfasst. Auch sind
keine römischen Absatznummerierungen vorgesehen.


> Anspruch auf Kaufpreisrückzahlung aus §§ 346 I, 437 Nr. 2 Alt. 1, 440, 326
V, 323, 434, 433 BGB

ergibt daher

 Ganzes Match          | Norm | Abs. | S.  | Nr. | lit. | gesetz | buch
 ---                   | ---  | ---  | --- | --- | ---  | ---    | ---
§§ 346 I, 437 Nr. 2 Alt. 1, 440, 326 V, 323, 434, 433 BGB | 346   | –    | –   | –   | –    | BGB   | –

### Overlapping Matches
Die vorgenannten Grenzen der Erkennung können jedoch in Bezug auf §§-Ketten, bei denen die einzelnen Normen jeweils mit einem §-Zeichen/Art. eingeleitet werden, mittels overlapping matches umgangen werden. Dies wird in Python nur bei Verwendung des Moduls `regex` statt `re` unterstützt. Hier gibt es beispielsweise für `regex.findall` die Option `overlapped=True`.



### Alternative Version
Wenn nur vorgegebene Gesetze erkannt werden sollen, bietet es sich an, die möglichen Gesetze direkt in die Regex zu integrieren.

Die geschieht in der letzten Zeile in der Untergruppe ``norm``. Die einzelnen zu erkennenden Abkürzungen werden mit einem ``|`` getrennt.
Die flexible Fassung

```
(?P<gesetz>\b[A-Z][A-Za-z]*[A-Z](?:(?P<buch>(?:\s|\b)[XIV]+)?))
```

kann z. B. durch

```
((?P<gesetz>BGB|StGB)(?![\w-]))
```

ersetzt werden.

Bei vielen Gesetzen wird dies schnell übersichtlich, sodass es sich empfiehlt, die Gesetzesabkürzungen in einem getrennten String zu sammeln
und diesen in die Regex einzubinden.

Beispiel in Python mit String-Interpolation:

```
p = re.compile(r"""
(§+|Art|Artikel)\.?\s*
(?P<norm>\d+(?:\w\b)?)\s*
(?:Abs\.\s*(?P<absatz>\d+(?:\w\b)?))?\s*
(?:S\.\s*(?P<satz>\d+))?\s*
(?:Nr\.\s*(?P<nr>\d+(?:\w\b)?))?\s*
(?:lit\.\s*(?P<lit>[a-z]?))?
.{0,10}?
(?P<gesetz>%s)(?![\w-])
""" % gesetze_string, re.IGNORECASE | re.VERBOSE)

```
Der Platzhalter ``%s`` wird mit dem Inhalt von ``gesetze_string`` gefüllt. Da die möglichen Gesetze bereits feststehen und die Erkennung
nicht von Groß-/Kleinschreibung abhängt, kann zusätzlich die Flag ``re.IGNORECASE`` gesetzt werden (wenn "BGB" in der Liste steht, wird auch
"bgb" erkannt).

In der Datei ``gesetze.py`` ist ein dictionary enthalten, dessen keys die derzeit bei https://gesetze-im-internet.de vorhandenen
Bundesgesetze enthalten. Der erste Value-Eintrag ist jeweils die korrekt formatierte Gesetzesabkürzung, der zweite Eintrag enthält die
Information, wie die jeweiligen Gesetze auf der Website in URLs verwendet werden. Damit kann ein simpler Verlinker von erkannten Normen
gebaut werden, wie in ``verlinker.py`` gezeigt.


## Lizenz
Ich räume jedermann unentgeltlich ein einfaches Nutzungsrecht für alle Nutzungsarten ein.
