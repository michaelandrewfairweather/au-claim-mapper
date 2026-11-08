// Victoria: personal injury time limits.
// Limitation of Actions Act 1958 (Vic) Part IIA, authorised version 113
// (in force from 2 October 2026). Every rule below was checked against that
// version; each cites the section it comes from.

import { addYears, minDate, maxDate, daysBetween, fmt } from "../core/dates.js";

const V = (section) => ({ source: "vic-loaa", section, check: "verified" });

export const meta = {
  id: "vic-pi-time-limit",
  title: "Personal injury time limits: Victoria",
  question: "Do I still have time to make a personal injury claim in Victoria?",
  jurisdiction: "VIC",
  area: "personal injury",
  sources: ["vic-loaa"],
};

// Part IIA started on 21 May 2003 (s 27N(4) caps acts before then at the old law).
const PART_IIA_START = "2003-05-21";
const URGENT_DAYS = 183; // under six months to go

// The rules, in the order they are applied. The first that settles the answer stops.
export const RULES = [
  { id: "R1", when: "Injury from physical or sexual abuse while a minor (not a death claim)",
    then: "No limitation period. Say so gently, with no deadline pressure.", cites: [V("s 27O"), V("s 27P")] },
  { id: "R1A", when: "A child abuse claim was settled before (a release was signed)",
    then: "Hand over. A court may set aside a settlement made before 1 July 2018 (or between 13 November 2024 and the start of the 2026 amendments) if just and reasonable; National Redress Scheme deeds are excluded.",
    cites: [V("s 27OA"), V("s 27QA(2), (3)"), V("s 27QD"), V("s 27QE")] },
  { id: "R2", when: "WorkCover common law claim, transport accident claim, dust-related condition, or tobacco-related",
    then: "Part IIA does not apply. Hand over: another scheme or rule sets the time.", cites: [V("s 27B(2)")] },
  { id: "R3", when: "The claim concerns someone who has died",
    then: "Hand over. Survivor and Wrongs Act Part III claims have their own discoverability and long-stop rules.",
    cites: [V("s 27F(4)"), V("s 27G"), V("s 27H"), V("s 27Q")] },
  { id: "R4", when: "The act or omission was before 21 May 2003",
    then: "Hand over. Part IIA cannot give a longer period than the old law would have.", cites: [V("s 27N(4)")] },
  { id: "R4A", when: "The act or omission was on or after 21 May 2003",
    then: "Part IIA applies in full; the old-law cap does not.", cites: [V("s 27N(4)")] },
  { id: "R5", when: "A minor not in the custody of a capable parent or guardian, or incapacity of 28 days or more",
    then: "Hand over. The period may be suspended.", cites: [V("s 27J")] },
  { id: "R6", when: "A minor injured by a parent, guardian or close associate of one",
    then: "Discoverable no earlier than age 25; 6 years from discoverability (a minor is under a disability); long-stop 12 years from age 25. Earlier date applies.",
    cites: [V("s 3(2)"), V("s 27A"), V("s 27E(2)(a)"), V("s 27F"), V("s 27I(1), (2)")] },
  { id: "R7", when: "A minor in the custody of a capable parent or guardian",
    then: "6 years from discoverability (the parent's knowledge counts), or 12 years from the act, whichever is earlier.",
    cites: [V("s 3(2)"), V("s 27E"), V("s 27F"), V("s 27J(3)")] },
  { id: "R8", when: "Otherwise (an adult)",
    then: "3 years from discoverability, or 12 years from the act, whichever is earlier. Discoverable means when the person knew, or ought to have known, of the injury, its cause and its seriousness.", cites: [V("s 27D"), V("s 27F")] },
  { id: "R9", when: "Any date calculated above",
    then: "A court may extend it, even after it has expired, if just and reasonable. Never tell anyone it is too late.",
    cites: [V("s 27K"), V("s 27L"), V("s 27M")] },
];
const RULE = Object.fromEntries(RULES.map((r) => [r.id, r]));

// The questions, for the form and for any conversational layer.
export const QUESTIONS = [
  { id: "cause", type: "select", label: "How were you hurt?", options: [
    ["general", "Another way (a fall, a product, medical care…)"],
    ["work", "At work, or doing something for work"],
    ["transport", "In a road, rail or tram accident"],
    ["childAbuse", "Physical or sexual abuse when I was under 18"],
    ["dust", "Asbestos or other dust exposure"],
    ["tobacco", "Smoking or tobacco smoke"],
  ] },
  { id: "priorSettlement", type: "yesno", label: "Did you settle a claim about this before, and sign a release?", showIf: (i) => i.cause === "childAbuse" },
  { id: "death", type: "yesno", label: "Is this about someone who has died?", yes: "Yes, a family member died", no: "No, it's about my own injury" },
  { id: "dob", type: "date", label: "Your date of birth" },
  { id: "act", type: "date", label: "When did the thing that hurt you happen?", hint: "If it happened over time, use the date it started." },
  { id: "know", type: "date", label: "When did you first realise all three: you were hurt, someone else may be to blame, and it was serious enough to do something about?", hint: "If you're not sure, leave this as the date it happened." },
  { id: "byParent", type: "yesno", label: "Was the person responsible your parent or guardian, or someone close to them?", showIf: (i) => isMinorAtAct(i) },
  { id: "custody", type: "yesno", label: "At the time, were you living in the care of a parent or guardian?", yes: "Yes", no: "No, or I'm not sure", default: true, showIf: (i) => isMinorAtAct(i) },
  { id: "incapacity", type: "yesno", label: "Since it happened, has there been a time when you couldn't manage your own affairs because of an illness or injury?", yes: "Yes, or I'm not sure" },
];

export const DEFAULTS = { cause: "general", death: false, byParent: false, custody: true, incapacity: false, priorSettlement: false };

function isMinorAtAct(i) {
  return Boolean(i.dob && i.act && i.act < addYears(i.dob, 18));
}

export function evaluate(input, today) {
  const i = { ...DEFAULTS, ...input };
  const trace = [];
  const step = (id, text) => trace.push({ rule: id, text: text ?? RULE[id].then, cites: RULE[id].cites });
  const out = (status, extra = {}) => ({ module: meta.id, status, handover: status !== "intime" && status !== "nolimit", trace, ...extra });

  if (i.cause === "childAbuse" && !i.death) {
    if (i.priorSettlement) { step("R1A"); return out("handover"); }
    step("R1");
    return out("nolimit");
  }
  if (!i.act || !i.dob) return out("error", { message: "Enter your date of birth and the date it happened." });
  const know = i.know || i.act;
  if (know < i.act) return out("error", { message: "The date you found out can't be before the date it happened." });
  if (i.act > today) return out("error", { message: "The date it happened can't be in the future." });
  const minor = isMinorAtAct(i);

  if (i.cause === "childAbuse") { // death claim founded on child abuse
    step("R3", "Death claim founded on child abuse: 3 years from discoverability, no long-stop");
    return out("handover");
  }
  const schemes = {
    work: "WorkCover common law claim: outside Part IIA (s 27B(2)(a), (b))",
    transport: "Transport accident claim: outside Part IIA (s 27B(2)(c))",
    dust: "Dust-related condition: outside Part IIA (s 27B(2)(d))",
    tobacco: "Tobacco-related injury: outside Part IIA (s 27B(2)(e))",
  };
  if (schemes[i.cause]) { step("R2", schemes[i.cause]); return out("scheme"); }
  if (i.death) { step("R3"); return out("handover"); }
  if (i.act < PART_IIA_START) { step("R4"); return out("handover"); }
  step("R4A");
  if ((minor && i.custody === false) || i.incapacity) {
    step("R5", minor && i.custody === false
      ? "Minor not in the custody of a capable parent or guardian: the period may be suspended"
      : "Incapacity of 28 days or more: the period may be suspended");
    return out("handover");
  }

  let deadline, earliest, disc, longstop, ruleId;
  if (minor && i.byParent) {
    ruleId = "R6";
    const t25 = addYears(i.dob, 25);
    disc = maxDate(t25, know);
    longstop = addYears(t25, 12);
    step(ruleId, `Minor injured by a parent, guardian or close associate: discoverable no earlier than age 25 (${fmt(t25)}); 6 years from then; long-stop 12 years from age 25`);
    deadline = minDate(addYears(disc, 6), longstop);
    earliest = minDate(addYears(t25, 6), longstop);
  } else if (minor) {
    ruleId = "R7";
    disc = know;
    longstop = addYears(i.act, 12);
    step(ruleId, "Injured as a minor in a capable parent's care: 6 years from discoverability (counting what the parent knew); long-stop 12 years from the act");
    deadline = minDate(addYears(disc, 6), longstop);
    earliest = minDate(addYears(i.act, 6), longstop);
  } else {
    ruleId = "R8";
    disc = know;
    longstop = addYears(i.act, 12);
    step(ruleId, "Adult: 3 years from discoverability; long-stop 12 years from the act");
    deadline = minDate(addYears(disc, 3), longstop);
    earliest = minDate(addYears(i.act, 3), longstop);
  }
  step(ruleId, deadline === longstop ? "The long-stop ends first, so it sets the date" : "The discoverability period ends first, so it sets the date");
  step("R9");

  const extra = { deadline, earliestDeadline: earliest, discoverable: disc, longstop };
  if (deadline < today) return out("passed", extra);
  if (earliest < today) return out("atrisk", extra);
  if (daysBetween(today, earliest) < URGENT_DAYS) return out("urgent", extra);
  return out("intime", extra);
}

// Free and low-cost help in Victoria, for when no lawyer is engaged yet.
export const HELP = [
  { name: "Law Institute of Victoria: Legal Referral Service", note: "finds a lawyer who practises in this area" },
  { name: "Victoria Legal Aid", note: "free legal information" },
  { name: "Federation of Community Legal Centres (Vic)", note: "free legal help near you" },
];

export function clientText(res) {
  const d = res.deadline ? fmt(res.deadline) : "";
  const e = res.earliestDeadline ? fmt(res.earliestDeadline) : "";
  switch (res.status) {
    case "intime": return { heading: "You appear to be within the time limit",
      body: `On your answers, the usual time limit would end on ${d}. That gives you time, but evidence is easier to gather early.`,
      next: "Talk to a lawyer when you're ready." };
    case "urgent": return { heading: "Time may be running short",
      body: `On your answers, the time limit could end as early as ${e}. That is less than six months away.`,
      next: "Please talk to a lawyer this week." };
    case "atrisk": return { heading: "You may still have time, but it needs a lawyer's view",
      body: `Counting from when you found out, the limit would end on ${d}. But if a court decided you ought to have known sooner, it could have ended on ${e}.`,
      next: "Please talk to a lawyer now. Don't assume the time has run out." };
    case "passed": return { heading: "The usual time limit may have passed, but don't give up",
      body: `On your answers, the usual time limit ended on ${d}. Courts can extend the time in some cases, and other rules may apply to you.`,
      next: "Please talk to a lawyer now. Only a lawyer can tell you where you stand." };
    case "nolimit": return { heading: "There is no time limit for this kind of claim",
      body: "In Victoria, claims about physical or sexual abuse suffered as a child can be brought at any time. Thank you for telling us.",
      next: "You can talk to a lawyer whenever you're ready, in confidence. If you'd like support now, Blue Knot (1300 657 380) and Lifeline (13 11 14) are there." };
    case "scheme": return { heading: "A different set of rules applies to you",
      body: "Injuries at work, in transport accidents, from dust such as asbestos, or from tobacco have their own time limits and steps. Some of them are short.",
      next: "Please talk to a lawyer soon so you don't miss a step." };
    case "handover":
      if (res.trace.some((t) => t.rule === "R1A")) return { heading: "The law may now let a court reopen an earlier settlement",
        body: "Victorian law lets a court set aside some earlier settlements of child abuse claims, if it is just and reasonable to do so. Whether that applies to you needs a lawyer's view.",
        next: "You can talk to a lawyer whenever you're ready, in confidence." };
      return { heading: "Your situation needs a lawyer to work out the time limit",
        body: "Your answers point to rules that depend on details only a lawyer can weigh. The time limit may be longer or shorter than usual.",
        next: "Please talk to a lawyer soon." };
    default: return { heading: "We need a bit more information", body: res.message || "", next: "" };
  }
}

// Worked cases. "Today" is fixed so the answers never change.
export const CASES_TODAY = "2026-11-06";
export const CASES = [
  { id: 1, facts: "Adult, fall in a shop, 10 Mar 2025, knew at once", i: { dob: "1985-06-01", act: "2025-03-10" }, status: "intime", deadline: "2028-03-10" },
  { id: 2, facts: "Adult, injured 15 Jan 2023, knew at once", i: { dob: "1980-01-01", act: "2023-01-15" }, status: "passed", deadline: "2026-01-15" },
  { id: 3, facts: "Adult, injured 1 Mar 2024: under six months left", i: { dob: "1990-09-09", act: "2024-03-01" }, status: "urgent", deadline: "2027-03-01" },
  { id: 4, facts: "Adult, surgery 1 Feb 2016, found out 1 Jun 2025: long-stop bites", i: { dob: "1970-05-05", act: "2016-02-01", know: "2025-06-01" }, status: "atrisk", deadline: "2028-02-01" },
  { id: 5, facts: "Adult, act 10 Jan 2012, found out 1 Jan 2024: long-stop passed", i: { dob: "1975-02-02", act: "2012-01-10", know: "2024-01-01" }, status: "passed", deadline: "2024-01-10" },
  { id: 6, facts: "Child aged 10, in parents' care, injured 1 Jul 2020", i: { dob: "2010-03-15", act: "2020-07-01" }, status: "passed", deadline: "2026-07-01" },
  { id: 7, facts: "Child injured by a parent (not abuse), born 2 Apr 2005, act 1 Jun 2015", i: { dob: "2005-04-02", act: "2015-06-01", byParent: true }, status: "intime", deadline: "2036-04-02" },
  { id: 8, facts: "Sexual abuse as a child in 1998", i: { cause: "childAbuse", dob: "1988-01-01", act: "1998-06-01" }, status: "nolimit" },
  { id: 9, facts: "Injured at work", i: { cause: "work", dob: "1980-01-01", act: "2025-01-01" }, status: "scheme" },
  { id: 10, facts: "Car accident", i: { cause: "transport", dob: "1980-01-01", act: "2025-01-01" }, status: "scheme" },
  { id: 11, facts: "Asbestos exposure", i: { cause: "dust", dob: "1950-01-01", act: "1975-01-01" }, status: "scheme" },
  { id: 12, facts: "Family member died after a fall", i: { death: true, dob: "1950-01-01", act: "2025-01-01" }, status: "handover" },
  { id: 13, facts: "Adult, injured 1 Aug 2001", i: { dob: "1970-01-01", act: "2001-08-01" }, status: "handover" },
  { id: 14, facts: "Adult, incapacitated for months after the injury", i: { dob: "1970-01-01", act: "2025-01-01", incapacity: true }, status: "handover" },
  { id: 15, facts: "Child not in the care of a parent or guardian", i: { dob: "2012-01-01", act: "2020-01-01", custody: false }, status: "handover" },
  { id: 16, facts: "Found-out date before the injury date", i: { dob: "1980-01-01", act: "2025-01-01", know: "2024-12-01" }, status: "error" },
  { id: 17, facts: "Adult, injured 29 Feb 2024", i: { dob: "1980-01-01", act: "2024-02-29" }, status: "urgent", deadline: "2027-02-28" },
  { id: 18, facts: "Child abuse claim settled in 2005 with a release", i: { cause: "childAbuse", priorSettlement: true }, status: "handover" },
  { id: 19, facts: "Abuse disclosed with no dates given", i: { cause: "childAbuse" }, status: "nolimit" },
];
