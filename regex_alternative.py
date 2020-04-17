#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Für Erläuterung der Regex siehe README.md
p = re.compile(r""" # Die Regex wird in p kompiliert
(§+|Art|Artikel)\.?\s*
(?P<norm>\d+(?:\w\b)?)\s*
(?:Abs\.\s*(?P<absatz>\d+(?:\w\b)?))?\s*
(?:S\.\s*(?P<satz>\d+))?\s*
(?:Nr\.\s*(?P<nr>\d+(?:\w\b)?))?\s*
(?:lit\.\s*(?P<lit>[a-z]?))?
.{0,10}?
(?P<gesetz>zpo|versg|egzpo)(?![\w-])
""", re.IGNORECASE | re.VERBOSE)

Teststring = """Hier zu überprüfenden Text einfügen"""

alle_treffer = p.finditer(Teststring) #Gibt einen Iterator zurück, der Match-Objekte auswirft
liste_der_treffer = ""
liste_der_gesetze = {} #Dictionary, sodass jedes Gesetz nur einmal erfasst wird

for treffer in alle_treffer:
    liste_der_treffer = liste_der_treffer + "\t" + treffer.group() + "\n" #Group gibt ohne Argumente das gesamte Match zurück
    liste_der_gesetze[treffer.group('gesetz')] = 0 # Wir brauchen nur das Gesetz als Key, Value kann 0 sein



print(f"Folgende Treffer gibt es:\n {liste_der_treffer}")
print(f"Im Einzelnen konnten die folgenden Gesetze erkannt werden:")

for x in liste_der_gesetze:
    print(x + ' ')
