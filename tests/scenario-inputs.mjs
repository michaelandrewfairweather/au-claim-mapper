// Maps intake-suite scenarios to module inputs. A scenario not listed here is
// "not covered yet". `coverage: "partial"` means the module decides part of
// the answer (for example, that another scheme applies) but the suite expects
// more than it can give; partial scenarios are reported but not scored.

export const SCENARIO_INPUTS = {
  // Victorian personal injury time limits
  A01: { module: "vic-pi-time-limit", i: { dob: "1985-06-01", act: "2026-03-06", know: "2026-03-06" } },
  A02: { module: "vic-pi-time-limit", i: { dob: "1960-02-02", act: "2023-10-01", know: "2023-10-01" } },
  A03: { module: "vic-pi-time-limit", i: { dob: "1990-09-09", act: "2024-02-20", know: "2024-02-20" } },
  A04: { module: "vic-pi-time-limit", i: { dob: "2009-01-15", act: "2021-03-10", know: "2021-03-10", custody: true, byParent: false } },
  A05: { module: "vic-pi-time-limit", i: { dob: "1996-05-01", act: "2004-07-01", know: "2004-07-01", byParent: true } },
  A06: { module: "vic-pi-time-limit", i: { dob: "1970-05-05", act: "2015-03-01", know: "2026-01-15" } },
  D01: { module: "vic-pi-time-limit", i: { dob: "1975-04-04", act: "2023-03-01", know: "2025-05-10" } },
  D03: { module: "vic-pi-time-limit", coverage: "partial", i: { dob: "1938-01-01", act: "2026-10-01", incapacity: true },
    note: "Hands over for incapacity (s 27J); aged care complaint routes are not covered yet." },
  E01: { module: "vic-pi-time-limit", coverage: "partial", i: { cause: "dust", dob: "1952-01-01", act: "1975-01-01" },
    note: "Recognises dust-related conditions are outside Part IIA; the urgency of a terminal diagnosis needs a dust disease module." },
  E02: { module: "vic-pi-time-limit", i: { cause: "childAbuse" } },
  E03: { module: "vic-pi-time-limit", i: { cause: "childAbuse", priorSettlement: true } },

  // Employment routes
  G01: { module: "employment-routes", i: { state: "VIC", dismissed: true, dismissalDate: "2026-10-27", monthsEmployed: 36, smallEmployer: false, awardOrUnderThreshold: true } },
  G02: { module: "employment-routes", i: { state: "VIC", dismissed: true, dismissalDate: "2026-10-07" } },
  G03: { module: "employment-routes", i: { state: "WA", sexualHarassment: true, attribute: true, stillEmployed: true, employerType: "unknown" } },
  G04: { module: "employment-routes", i: { state: "VIC", attribute: true, stillEmployed: true, lastIncident: "2026-10-15" } },
  G05: { module: "employment-routes", i: { state: "NSW", bullying: true, stillEmployed: true } },
  G06: { module: "employment-routes", i: { state: "QLD", underpayment: true, underpaymentFrom: "2024-06-01", stillEmployed: false } },
  G07: { module: "employment-routes", i: { state: "WA", dismissed: true, dismissalDate: "2026-10-31", monthsEmployed: 5, smallEmployer: true, employerType: "unincorporated" } },
  G08: { module: "employment-routes", i: { state: "QLD", sexualHarassment: true, stillEmployed: true } },
};
