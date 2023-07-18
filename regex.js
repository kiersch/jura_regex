const regexPattern = /(?<norm_type>§+|Art|Artikel)\.?\s*(?<norm>\d+(?:\w\b)?)\s*(?:Absatz|Abs\.\s*(?<absatz>\d+(?:\w\b)?))?\s*(?:Satz|S\.\s*(?<satz>\d+))?\s*(?:Nummer|Nr\.\s*(?<nr>\d+(?:\w\b)?))?\s*(?:Buchstabe|Buchst\.|lit\.\s*(?<lit>[a-z]?))?.{0,10}?(?<gesetz>\b[A-Z][A-Za-z]*[A-Z](?:(?<buch>(?:\s|\b)[XIV]+)?))/g;

// Helper function to transform the law object back to a string.
function createLawObj(matchGroups) {
  return {
    norm_type: matchGroups.norm_type,
    norm: matchGroups.norm,
    absatz: matchGroups.absatz ? `Absatz ${matchGroups.absatz}` : undefined,
    satz: matchGroups.satz ? `Satz ${matchGroups.satz}` : undefined,
    nr: matchGroups.nr ? `Nummer ${matchGroups.nr}` : undefined,
    lit: matchGroups.lit ? `Buchst. ${matchGroups.lit}` : undefined,
    gesetz: matchGroups.buch ? `${matchGroups.gesetz} ${matchGroups.buch}` : matchGroups.gesetz,
  };
}

// Main function
function getLaws(query) {
  const data = [];
  const uniqueLaws = new Set();
  let match;
  
  // Matching with the regex pattern
  while ((match = regexPattern.exec(query)) !== null) {
    const lawObj = createLawObj(match.groups);
    const lawString = Object.values(lawObj).filter(Boolean).join(' ');

    // Prevent duplicate laws
    if (!uniqueLaws.has(lawString)) {
      uniqueLaws.add(lawString);
      data.push({match, law_obj: lawObj, law_string: lawString});
    }

    // Prevent infinite loops with zero-length matches
    if (regexPattern.lastIndex === match.index) {
      regexPattern.lastIndex++;
    }
  }

  return data;
}

// Example
query = "Gemäß §1 BGB und §1 BGB, sowie §2 Abs. 2 UStG, §3 Abs. 3 Satz 4 EstG, Artikel 1 GG, usw...";
for (law of getLaws(query)) {
  console.log(law.law_string);
}
