// Runs each module's worked cases, then scores the intake suite.
// Usage: node tests/run.mjs [--verbose]

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { MODULES, citesOf } from "../public/src/modules/index.js";
import { SOURCES } from "../public/src/law/sources.js";
import { SCENARIO_INPUTS } from "./scenario-inputs.mjs";

const verbose = process.argv.includes("--verbose");
let failures = 0;
const line = (s = "") => console.log(s);

// ---------- 1. Module worked cases ----------
line("Module worked cases");
for (const m of Object.values(MODULES)) {
  let pass = 0;
  for (const c of m.CASES) {
    const res = m.evaluate({ ...m.DEFAULTS, ...c.i }, m.CASES_TODAY);
    const problems = [];
    if (res.status !== c.status) problems.push(`status ${res.status}, expected ${c.status}`);
    if (c.deadline && res.deadline !== c.deadline) problems.push(`deadline ${res.deadline}, expected ${c.deadline}`);
    for (const [id, want] of Object.entries(c.open || {})) {
      const r = (res.routes || []).find((x) => x.id === id);
      if (!r) problems.push(`route ${id} missing`);
      else if (r.open !== want) problems.push(`route ${id} open=${r.open}, expected ${want}`);
    }
    if (problems.length) { failures++; line(`  FAIL ${m.meta.id} #${c.id} ${c.facts}: ${problems.join("; ")}`); }
    else pass++;
  }
  line(`  ${m.meta.id}: ${pass}/${m.CASES.length} pass`);
}

// ---------- 2. Intake suite ----------
const suitePath = fileURLToPath(new URL("./intake-suite.yaml", import.meta.url));
const suite = yaml.load(readFileSync(suitePath, "utf8"));
const today = String(suite.test_date instanceof Date ? suite.test_date.toISOString().slice(0, 10) : suite.test_date);
const iso = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d == null ? undefined : String(d));

// Universal must_not, checkable on the client text.
const UNSAFE = [/too late/i, /\bno claim\b/i, /guarantee/i];

// Does the result cite the verified law the scenario depends on?
function actFor(sourceText) {
  return Object.entries(SOURCES).find(([, s]) => s.title && sourceText.startsWith(s.title.replace(/ \((Cth|Vic|WA)\)$/, "")));
}
function sectionsIn(text) {
  const out = [];
  const m = text.match(/\bss? ([0-9][0-9A-Z]*(?:\([^)]*\))*(?:(?:, | and |–)[0-9][0-9A-Z]*(?:\([^)]*\))*)*)/);
  if (m) for (const part of m[1].split(/, | and |–/)) out.push(part.replace(/\(.*$/, ""));
  return out;
}
function citesLaw(res, law) {
  const sources = law.source.split(/; /);
  return sources.every((src) => {
    const act = actFor(src);
    if (!act) return false;
    const [key] = act;
    const cites = citesOf(res).filter((c) => c.source === key);
    if (!cites.length) return false;
    const wanted = sectionsIn(src);
    if (!wanted.length) return true; // a Part or the whole Act: the Act being cited is enough
    const have = cites.map((c) => c.section).join(" ");
    return wanted.every((s) => new RegExp(`\\b${s}\\b`).test(have));
  });
}

line();
line(`Intake suite (${suite.suite}, today ${today})`);
const tally = { scored: 0, pass: 0, partial: 0, notCovered: [] };
let verifiedRefs = 0, verifiedHit = 0;
for (const sc of suite.scenarios) {
  const map = SCENARIO_INPUTS[sc.id];
  if (!map) { tally.notCovered.push(sc.id); continue; }
  const m = MODULES[map.module];
  const res = m.evaluate({ ...m.DEFAULTS, ...map.i }, today);
  const exp = sc.expected;
  const problems = [];
  if (res.status !== exp.status) problems.push(`status ${res.status}, expected ${exp.status}`);
  if (exp.deadline && res.deadline !== iso(exp.deadline)) problems.push(`deadline ${res.deadline}, expected ${iso(exp.deadline)}`);
  const missingLaw = [];
  for (const law of exp.law || []) {
    if (law.check !== "verified") continue;
    verifiedRefs++;
    if (citesLaw(res, law)) verifiedHit++;
    else missingLaw.push(law.source);
  }
  if (missingLaw.length) problems.push(`does not cite: ${missingLaw.join(" | ")}`);
  const t = m.clientText(res);
  const words = [t.heading, t.body, t.next].join(" ");
  const unsafe = UNSAFE.filter((re) => re.test(words));
  if (unsafe.length) problems.push(`unsafe wording: ${unsafe.join(", ")}`);
  if (!t.next) problems.push("no next step");

  if (map.coverage === "partial") {
    tally.partial++;
    line(`  PART ${sc.id} ${sc.title}: ${map.note}${problems.length ? ` [${problems.join("; ")}]` : ""}`);
    continue;
  }
  tally.scored++;
  if (problems.length) { failures++; line(`  FAIL ${sc.id} ${sc.title}: ${problems.join("; ")}`); }
  else { tally.pass++; if (verbose) line(`  pass ${sc.id} ${sc.title} -> ${res.status}${res.deadline ? " " + res.deadline : ""}`); }
  if (verbose && (exp.must || exp.must_not)) line(`       not scored (conversational): ${(exp.must || []).length} must, ${(exp.must_not || []).length} must_not`);
}
line(`  Scored ${tally.pass}/${tally.scored} pass; ${tally.partial} partial (reported, not scored); ${tally.notCovered.length} not covered yet.`);
line(`  Verified law references cited: ${verifiedHit}/${verifiedRefs}.`);
if (verbose) line(`  Not covered yet: ${tally.notCovered.join(", ")}`);
line();
line(failures ? `${failures} failure(s).` : "All checks pass.");
process.exit(failures ? 1 : 0);
