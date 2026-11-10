// The Acts this tool relies on. `version` is the authorised version the
// verified rules were checked against. Texts were read from the official
// registers (copies held in Legalese Commons); no encodings are reused.

export const SOURCES = {
  state: {
    title: "State or territory law (not yet identified or checked)",
    short: "State law:",
    version: "n/a",
    url: "",
    licence: "",
  },
  "vic-loaa": {
    title: "Limitation of Actions Act 1958 (Vic)",
    short: "LAA (Vic)",
    version: "Authorised version 113",
    url: "https://www.legislation.vic.gov.au/in-force/acts/limitation-actions-act-1958",
    licence: "© State of Victoria (Government Printer); not openly licensed: cited and paraphrased here, no text reproduced",
  },
  "vic-eoa": {
    title: "Equal Opportunity Act 2010 (Vic)",
    short: "EOA (Vic)",
    version: "Authorised version 032 (from 15 April 2026)",
    url: "https://www.legislation.vic.gov.au/in-force/acts/equal-opportunity-act-2010",
    licence: "© State of Victoria (Government Printer); not openly licensed: cited and paraphrased here, no text reproduced",
  },
  "vic-vcat": {
    title: "Victorian Civil and Administrative Tribunal Act 1998 (Vic)",
    short: "VCAT Act",
    version: "Authorised version 145",
    url: "https://www.legislation.vic.gov.au/in-force/acts/victorian-civil-and-administrative-tribunal-act-1998",
    licence: "© State of Victoria (Government Printer); not openly licensed: cited and paraphrased here, no text reproduced",
  },
  "cth-fwa": {
    title: "Fair Work Act 2009 (Cth)",
    short: "FW Act",
    version: "Compilation C2026C00355",
    url: "https://www.legislation.gov.au/C2009A00028/latest/text",
    licence: "Federal Register of Legislation, Commonwealth of Australia, CC BY 4.0",
  },
  "cth-ahrca": {
    title: "Australian Human Rights Commission Act 1986 (Cth)",
    short: "AHRC Act",
    version: "Compilation C2026C00416",
    url: "https://www.legislation.gov.au/C2004A03366/latest/text",
    licence: "Federal Register of Legislation, Commonwealth of Australia, CC BY 4.0",
  },
  "cth-sda": {
    title: "Sex Discrimination Act 1984 (Cth)",
    short: "SDA",
    version: "Compilation C2025C00597",
    url: "https://www.legislation.gov.au/C2004A02868/latest/text",
    licence: "Federal Register of Legislation, Commonwealth of Australia, CC BY 4.0",
  },
  "cth-aia": {
    title: "Acts Interpretation Act 1901 (Cth)",
    short: "AIA",
    version: "Compilation C2026C00117",
    url: "https://www.legislation.gov.au/C1901A00002/latest/text",
    licence: "Federal Register of Legislation, Commonwealth of Australia, CC BY 4.0",
  },
  "wa-eoa": {
    title: "Equal Opportunity Act 1984 (WA)",
    short: "EOA (WA)",
    version: "Text retrieved 7 September 2026 (check for later amendments before relying on it)",
    url: "https://www.legislation.wa.gov.au/legislation/statutes.nsf/law_a253.html",
    licence: "© State of Western Australia, CC BY 4.0",
  },
  "wa-ira": {
    title: "Industrial Relations Act 1979 (WA)",
    short: "IR Act (WA)",
    version: "Text retrieved 7 September 2026 (check for later amendments before relying on it)",
    url: "https://www.legislation.wa.gov.au/legislation/statutes.nsf/law_a380.html",
    licence: "© State of Western Australia, CC BY 4.0",
  },
};

// A citation: { source: key of SOURCES, section: "s 27D(1)(a)", check: "verified" | "to-verify" }
export function citeText(c) {
  const s = SOURCES[c.source];
  return `${s ? s.short : c.source} ${c.section}`;
}
