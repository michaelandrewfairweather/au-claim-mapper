// Employment: which route? Compares the federal routes (Fair Work Commission,
// Australian Human Rights Commission, courts) with the state bodies in Victoria
// and Western Australia, with each route's time limit, what choosing it can
// close off, and its costs risk.
//
// Verified against: Fair Work Act 2009 (Cth) compilation C2026C00355;
// Australian Human Rights Commission Act 1986 (Cth) compilation C2026C00416;
// Sex Discrimination Act 1984 (Cth) compilation C2025C00597;
// Equal Opportunity Act 2010 (Vic) version 032; VCAT Act 1998 (Vic) version 145;
// Equal Opportunity Act 1984 (WA) and Industrial Relations Act 1979 (WA) as
// retrieved 7 September 2026. Anything marked "to-verify" is not yet checked.

import { addDays, addYears, minDate, daysBetween, fmt } from "../core/dates.js";

const C = (source, section, check = "verified") => ({ source, section, check });
const FW = (s, check) => C("cth-fwa", s, check);
const AH = (s, check) => C("cth-ahrca", s, check);

export const meta = {
  id: "employment-routes",
  title: "Employment problems: which route?",
  question: "Something went wrong at work. Where can I take it, and by when?",
  jurisdiction: "Cth + VIC, WA",
  area: "employment",
  sources: ["cth-fwa", "cth-ahrca", "cth-sda", "cth-aia", "vic-eoa", "vic-vcat", "wa-eoa", "wa-ira"],
};

const URGENT_DAYS = 183;

// Rules about the routes themselves (not tied to one route).
export const RULES = [
  { id: "E1", text: "\"Within 21 days after\" a dismissal does not count the day it took effect, so the last day is the dismissal date plus 21 days.", cites: [C("cth-aia", "s 36(1), table item 6")] },
  { id: "E2", text: "After a dismissal, only one of these can usually be pursued: unfair dismissal, a general protections dismissal claim, or a complaint under another law (such as the AHRC or a state body) about the dismissal.", cites: [FW("s 725"), FW("ss 727–732")] },
  { id: "E3", text: "If you are still employed and make a discrimination complaint (federal or state), you generally cannot also bring a general protections court case about the same conduct.", cites: [FW("s 734")] },
  { id: "E4", text: "Unfair dismissal needs a minimum period of employment: 6 months, or 1 year if the employer has fewer than 15 employees.", cites: [FW("s 382(a)"), FW("s 383"), FW("s 23(1)")] },
  { id: "E5", text: "Unfair dismissal is also only open if an award or enterprise agreement covers you, or your earnings are under the high income threshold (an amount set by regulation and indexed each year).", cites: [FW("s 382(b)"), C("cth-fwa", "high income threshold amount: Fair Work Regulations 2009", "to-verify")] },
  { id: "E6", text: "The federal Fair Work system covers employees of companies, the Commonwealth and some others. In Western Australia, employees of sole traders, partnerships and trusts are usually in the state system instead.", cites: [FW("s 14(1)"), C("wa-ira", "WA did not refer its industrial powers (to confirm)", "to-verify")] },
];
const RULE = Object.fromEntries(RULES.map((r) => [r.id, r]));

export const QUESTIONS = [
  { id: "state", type: "select", label: "Where do (or did) you work?", options: [
    ["VIC", "Victoria"], ["WA", "Western Australia"], ["NSW", "New South Wales"], ["QLD", "Queensland"],
    ["SA", "South Australia"], ["TAS", "Tasmania"], ["ACT", "ACT"], ["NT", "Northern Territory"],
  ] },
  { id: "dismissed", type: "yesno", label: "Have you lost your job (been dismissed, or forced to resign)?" },
  { id: "dismissalDate", type: "date", label: "When did the dismissal take effect?", showIf: (i) => i.dismissed },
  { id: "monthsEmployed", type: "number", label: "How many months did you work there?", hint: "Leave blank if you're not sure.", showIf: (i) => i.dismissed },
  { id: "smallEmployer", type: "tri", label: "Did the employer have fewer than 15 employees?", showIf: (i) => i.dismissed },
  { id: "awardOrUnderThreshold", type: "tri", label: "Were you covered by an award or enterprise agreement, or paid under about $185,000 a year?", hint: "Check the current high income threshold: it changes each 1 July.", showIf: (i) => i.dismissed },
  { id: "employerType", type: "select", label: "What kind of employer is it?", showIf: (i) => i.state === "WA", options: [
    ["unknown", "I'm not sure"], ["company", "A company (Pty Ltd or Ltd)"], ["unincorporated", "A sole trader, partnership or trust"], ["government", "A government body"],
  ] },
  { id: "attribute", type: "yesno", label: "Was it because of something like your sex, pregnancy, race, disability, age, or family or carer's duties?" },
  { id: "workplaceRight", type: "yesno", label: "Was it after you complained, asked about pay or conditions, or took leave you were entitled to?" },
  { id: "sexualHarassment", type: "yesno", label: "Is it about sexual harassment (by anyone at work, including a customer or client)?" },
  { id: "bullying", type: "yesno", label: "Is it about repeated unreasonable behaviour (bullying) that affects your health or safety?" },
  { id: "underpayment", type: "yesno", label: "Is it about being underpaid, or not paid wages, super or leave?" },
  { id: "stillEmployed", type: "yesno", label: "Are you still working there?", showIf: (i) => !i.dismissed },
  { id: "lastIncident", type: "date", label: "When did the last incident happen?", hint: "Leave blank if you're not sure.", showIf: (i) => !i.dismissed || i.attribute || i.sexualHarassment },
  { id: "underpaymentFrom", type: "date", label: "When did the underpayment start?", showIf: (i) => i.underpayment },
];

export const DEFAULTS = {
  state: "VIC", dismissed: false, attribute: false, workplaceRight: false, sexualHarassment: false,
  bullying: false, underpayment: false, stillEmployed: true, employerType: "unknown",
  smallEmployer: null, awardOrUnderThreshold: null, monthsEmployed: null,
};

// Which industrial system the employer is in, as far as we can tell.
function system(i) {
  if (i.state !== "WA") return "national"; // the other states referred powers or are territories (to confirm per state)
  if (i.employerType === "company") return "national";
  if (i.employerType === "unincorporated") return "state-likely";
  return "unknown"; // government bodies in WA and unknowns need a lawyer's view
}

function route(r) {
  return { open: "yes", deadline: null, extension: "", closes: "", ...r };
}

export function evaluate(input, today) {
  const i = { ...DEFAULTS, ...input };
  const trace = [];
  const note = (id, text) => trace.push({ rule: id, text: text ?? RULE[id].text, cites: RULE[id]?.cites ?? [] });
  const routes = [];
  const sys = system(i);
  const discrimination = i.attribute || i.sexualHarassment;

  if (i.dismissed && !i.dismissalDate) {
    return { module: meta.id, status: "error", handover: true, trace, routes, message: "Enter the date the dismissal took effect." };
  }
  if (i.dismissalDate && i.dismissalDate > today) {
    return { module: meta.id, status: "error", handover: true, trace, routes, message: "The dismissal date can't be in the future." };
  }

  // ---- Dismissal routes -------------------------------------------------
  if (i.dismissed) {
    const fw21 = addDays(i.dismissalDate, 21);
    note("E1");
    {
      // Federal routes. In WA they apply only if the employer is in the federal system.
      const federalMaybe = sys !== "national";
      // Unfair dismissal eligibility
      const minMonths = i.smallEmployer === true ? 12 : 6;
      let open = "yes", why = "";
      if (i.monthsEmployed != null && i.monthsEmployed < 6) { open = "no"; why = "You worked there for less than the minimum period (6 months, or 1 year for an employer with fewer than 15 employees)."; }
      else if (i.monthsEmployed != null && i.monthsEmployed < 12 && i.smallEmployer !== false) {
        open = i.smallEmployer === true ? "no" : "maybe";
        why = i.smallEmployer === true ? "A small business employer (fewer than 15 employees) needs 1 year of employment." : "Open only if the employer had 15 or more employees (otherwise 1 year is needed).";
      }
      if (open !== "no" && i.awardOrUnderThreshold === false) { open = "no"; why = "Not covered by an award or agreement and paid above the high income threshold."; }
      if (open === "yes" && i.awardOrUnderThreshold == null) { open = "maybe"; why = "Depends on award or agreement coverage, or earnings under the high income threshold."; }
      if (open !== "no" && federalMaybe) { open = "maybe"; why = (why ? why + " " : "") + "Only if the employer is in the federal system (for example, a company)."; }
      note("E4");
      routes.push(route({
        id: "fwc-ud", body: "Fair Work Commission", name: "Unfair dismissal",
        what: "Asks the FWC to find the dismissal harsh, unjust or unreasonable. Remedies are getting the job back or capped compensation.",
        deadline: fw21, deadlineText: `Within 21 days after the dismissal took effect: by ${fmt(fw21)}.`,
        extension: "Late applications are accepted only in exceptional circumstances.",
        costs: "Each side usually pays its own costs. Costs can be ordered against a party who acted unreasonably or whose case had no reasonable prospect of success.",
        closes: "Choosing this generally rules out a general protections claim or a discrimination complaint about the same dismissal.",
        open, why, minMonths,
        cites: [FW("s 394(2)"), FW("s 394(3)"), FW("ss 382, 383"), FW("s 611"), FW("s 400A"), FW("ss 725, 729")],
      }));
      routes.push(route({
        id: "fwc-gp-dismissal", body: "Fair Work Commission, then the Federal Court or Federal Circuit and Family Court",
        name: "General protections (dismissal)",
        what: "For a dismissal because of a protected attribute (such as sex, pregnancy, age or disability), a complaint, a request about pay or conditions, or taking leave. No minimum period of employment and no income cap.",
        deadline: fw21, deadlineText: `Within 21 days after the dismissal took effect: by ${fmt(fw21)}. If it doesn't settle at the FWC, a court case must start within 14 days after the FWC's certificate.`,
        extension: "Late applications are accepted only in exceptional circumstances.",
        costs: "At the FWC each side usually pays its own costs. In court, costs are ordered against you only if you started the case vexatiously or without reasonable cause, or acted unreasonably.",
        closes: "Choosing this generally rules out unfair dismissal or a discrimination complaint about the same dismissal.",
        open: (i.attribute || i.workplaceRight) && !federalMaybe ? "yes" : "maybe",
        why: [i.attribute || i.workplaceRight ? "" : "Open only if the dismissal was for a protected reason.", federalMaybe ? "Only if the employer is in the federal system (for example, a company)." : ""].filter(Boolean).join(" "),
        cites: [FW("s 340"), FW("s 351"), FW("ss 365, 366"), FW("s 370"), FW("s 570"), FW("s 611"), FW("ss 725, 727, 728")],
      }));
      note("E2");
    }
    if (i.state === "WA" && sys !== "national") {
      const wa28 = addDays(i.dismissalDate, 28);
      routes.push(route({
        id: "wairc-ud", body: "WA Industrial Relations Commission", name: "Unfair dismissal (WA state system)",
        what: "For employees of employers outside the federal system in WA (often sole traders, partnerships and trusts). Covers harsh, oppressive or unfair dismissal.",
        deadline: wa28, deadlineText: `No later than 28 days after the employment ended: by ${fmt(wa28)}.`,
        extension: "A late referral can be accepted if it would be unfair not to.",
        costs: "Costs rules not yet checked.",
        closes: "The WAIRC cannot decide the claim if you have applied to the Fair Work Commission about the same dismissal.",
        open: sys === "state-likely" ? "yes" : "maybe",
        why: sys === "state-likely" ? "Which system applies depends on the employer's legal structure: a lawyer should confirm it." : "Only if the employer is outside the federal system.",
        cites: [C("wa-ira", "s 29(1)(c)"), C("wa-ira", "s 29(2)(a)"), C("wa-ira", "s 29(3)"), C("wa-ira", "s 29AA(1)"), C("wa-ira", "costs", "to-verify")],
      }));
      note("E6");
    }
  }

  // ---- Still employed: adverse action, bullying, sexual harassment ---------
  if (!i.dismissed && (i.attribute || i.workplaceRight)) {
    const sixYears = i.lastIncident ? addYears(i.lastIncident, 6) : null;
    routes.push(route({
      id: "fwc-gp-nondismissal", body: "Fair Work Commission (conference), then the Federal Court or Federal Circuit and Family Court",
      name: "General protections (not dismissal)",
      what: "For adverse action short of dismissal (such as demotion, cut hours, being treated worse) because of a protected attribute or a workplace right. The FWC conference needs both sides to agree to take part.",
      deadline: sixYears, deadlineText: sixYears ? `A court case within 6 years after the conduct: by ${fmt(sixYears)}.` : "A court case within 6 years after the conduct.",
      costs: "In court, costs are ordered against you only if you started the case vexatiously or without reasonable cause, or acted unreasonably.",
      closes: "A discrimination complaint (federal or state) about the same conduct generally rules out a general protections court case.",
      cites: [FW("s 340"), FW("s 351"), FW("s 372"), FW("s 544"), FW("s 570"), FW("s 734")],
    }));
    note("E3");
  }

  if (i.bullying) {
    const atWork = !i.dismissed && i.stillEmployed !== false;
    routes.push(route({
      id: "fwc-bullying", body: "Fair Work Commission", name: "Order to stop bullying",
      what: "Orders to stop the bullying. It cannot award compensation. It is for workers still at work, where there is a risk the bullying will continue; reasonable management action is not bullying.",
      deadlineText: "No fixed time limit, but the bullying must be continuing to be a risk.",
      costs: "Each side usually pays its own costs.",
      closes: "Doesn't stop you using other routes.",
      open: atWork ? "yes" : "no",
      why: atWork ? "" : "Not available once you have left: orders only prevent future bullying at work.",
      cites: [FW("s 789FC"), FW("s 789FD"), FW("s 789FF(1)"), FW("s 611")],
    }));
    routes.push(route({
      id: "whs-regulator", body: "The work health and safety regulator in your state (for example SafeWork NSW or WorkSafe Victoria)",
      name: "Report a health and safety risk",
      what: "Employers must manage risks to psychological health, including bullying. The regulator can inspect and require changes. It does not award compensation.",
      deadlineText: "No deadline to report.", costs: "Free.", closes: "Doesn't stop you using other routes.",
      cites: [C("state", "Work Health and Safety Act of your state or territory", "to-verify")],
    }));
  }

  if (i.sexualHarassment) {
    const due = i.lastIncident ? addYears(i.lastIncident, 2) : null;
    routes.push(route({
      id: "fwc-sh", body: "Fair Work Commission, then court", name: "Sexual harassment dispute",
      what: "The FWC can make orders to stop sexual harassment and help resolve the dispute (including compensation if both sides agree to arbitration, or later in court).",
      deadline: due, deadlineText: due ? `Within 24 months after the last incident: by ${fmt(due)}. After that, the FWC may dismiss it.` : "Within 24 months after the last incident; after that, the FWC may dismiss it.",
      extension: "After the FWC issues a certificate, a court case must start within 60 days.",
      costs: "At the FWC each side usually pays its own costs. Court costs rules for this route not yet checked.",
      closes: "Choosing FWC arbitration generally rules out a court case against the other side.",
      cites: [FW("s 527D"), FW("s 527F"), FW("s 527G"), FW("s 527T(3)(a)"), FW("s 611"), FW("s 734A", "to-verify"), FW("s 570 (court costs)", "to-verify")],
    }));
  }

  if (discrimination) {
    const due = i.lastIncident ? addYears(i.lastIncident, 2) : null;
    routes.push(route({
      id: "ahrc", body: "Australian Human Rights Commission, then the Federal Court or Federal Circuit and Family Court",
      name: "Discrimination or sexual harassment complaint (federal)",
      what: "A free complaint, usually resolved by conciliation. If it doesn't resolve, you can go to court. Employers have a positive duty to prevent sexual harassment, including by customers and clients.",
      deadline: due, deadlineText: due ? `Lodge within 24 months after the last incident: by ${fmt(due)}. Later complaints may be ended by the Commission. A court case must start within 60 days after the Commission's termination notice.` : "Lodge within 24 months after the last incident; a court case within 60 days after the termination notice.",
      costs: "Strong costs protection in court: you generally cannot be ordered to pay the other side's costs, unless you acted vexatiously or unreasonably, or the other side has no power or resources advantage over you. If you win, they must generally pay your costs.",
      closes: i.dismissed ? "A complaint about the dismissal generally rules out unfair dismissal and general protections about it." : "Rules out a general protections court case about the same conduct. You usually cannot run the same complaint under federal and state law.",
      cites: [AH("s 46P"), AH("s 46PH(1)(b)"), AH("s 46PO(2)"), AH("s 46PSA"), C("cth-sda", "s 28B"), C("cth-sda", "s 47C"), C("cth-sda", "federal/state election (s 10, s 11)", "to-verify")],
    }));

    if (i.state === "VIC") {
      const due12 = i.lastIncident ? addYears(i.lastIncident, 1) : null;
      routes.push(route({
        id: "vic-veohrc", body: "Victorian Equal Opportunity and Human Rights Commission, or VCAT directly",
        name: "Discrimination or sexual harassment (Victoria)",
        what: "Free dispute resolution at VEOHRC, or an application straight to VCAT, which can order compensation.",
        deadline: due12, deadlineText: due12 ? `VEOHRC may decline matters more than 12 months old: bring it by ${fmt(due12)}. The Act sets no fixed deadline for going straight to VCAT, but delay can count against you.` : "VEOHRC may decline matters more than 12 months old. No fixed deadline for VCAT in the Act.",
        costs: "At VCAT each side usually pays its own costs; VCAT can order costs if it is fair, such as for unreasonable conduct or a claim with no tenable basis.",
        closes: "You usually cannot run the same complaint under federal and state law.",
        cites: [C("vic-eoa", "s 116(a)"), C("vic-eoa", "ss 122, 123"), C("vic-vcat", "s 109"), C("vic-eoa", "federal/state election", "to-verify")],
      }));
    }
    if (i.state === "WA") {
      const due12 = i.lastIncident ? addYears(i.lastIncident, 1) : null;
      routes.push(route({
        id: "wa-eoc", body: "WA Equal Opportunity Commission, then the State Administrative Tribunal",
        name: "Discrimination or sexual harassment (WA)",
        what: "A free complaint to the Commissioner, usually resolved by conciliation; unresolved complaints can go to the State Administrative Tribunal.",
        deadline: due12, deadlineText: due12 ? `Within 12 months after the last incident: by ${fmt(due12)}.` : "Within 12 months after the last incident.",
        extension: "The Commissioner may accept a later complaint if good cause is shown.",
        costs: "Costs rules at the Tribunal not yet checked.",
        closes: "You usually cannot run the same complaint under federal and state law.",
        cites: [C("wa-eoa", "s 83(4)"), C("wa-eoa", "s 83(5)"), C("wa-eoa", "referral to the Tribunal; costs", "to-verify")],
      }));
      if (i.sexualHarassment && sys !== "national") {
        routes.push(route({
          id: "wairc-sh", body: "WA Industrial Relations Commission", name: "Sexual harassment (WA state system)",
          what: "For workers in the WA state system, the WAIRC can deal with sexual harassment in connection with work.",
          deadlineText: "Time limit not yet checked.", costs: "Not yet checked.",
          open: sys === "state-likely" ? "yes" : "maybe", why: "Only if the employer is outside the federal system.",
          cites: [C("wa-ira", "s 29(1)(f)"), C("wa-ira", "time limit and costs", "to-verify")],
        }));
      }
    }
    if (!["VIC", "WA"].includes(i.state)) {
      routes.push(route({
        id: "state-body", body: `The ${i.state} anti-discrimination or human rights body`, name: "State discrimination complaint",
        what: "Each state has its own body and time limit. This tool has not checked them yet.",
        deadlineText: "Not yet checked: assume it could be as short as 12 months.", costs: "Not yet checked.", open: "maybe",
        cites: [C("state", `${i.state} anti-discrimination law`, "to-verify")],
      }));
    }
  }

  if (i.underpayment) {
    const from = i.underpaymentFrom;
    const oldest = from ? addYears(from, 6) : null;
    routes.push(route({
      id: "fwo", kind: "help", body: "Fair Work Ombudsman", name: "Help recovering unpaid wages",
      what: "A free service that can help you and your employer resolve underpayments, and can investigate.",
      deadlineText: "No deadline to ask for help, but the court time limit below keeps running.",
      costs: "Free.", closes: "Doesn't stop you going to court.",
      cites: [C("cth-fwa", "Fair Work Ombudsman functions", "to-verify")],
    }));
    routes.push(route({
      id: "small-claims", body: "Federal Circuit and Family Court, or a state or territory magistrates court", name: "Small claims for unpaid wages",
      what: "A simpler court process for smaller amounts owed under the Fair Work Act, an award or agreement. (The upper limit is set separately.)",
      deadline: oldest, deadlineText: oldest ? `Each underpayment can be claimed for 6 years. The oldest ones start running out on ${fmt(oldest)}.` : "Each underpayment can be claimed for 6 years after it happened.",
      costs: "Costs are ordered against you only if you started the case vexatiously or without reasonable cause, or acted unreasonably.",
      cites: [FW("s 544"), FW("s 548"), FW("s 570"), FW("small claims limit", "to-verify")],
    }));
  }

  // ---- Status ---------------------------------------------------------------
  const live = routes.filter((r) => r.open !== "no" && r.kind !== "help");
  const dated = live.filter((r) => r.deadline);
  const earliest = dated.reduce((m, r) => (m ? minDate(m, r.deadline) : r.deadline), null);
  let status;
  if (i.dismissed) {
    const dismissalRoutes = live.filter((r) => ["fwc-ud", "fwc-gp-dismissal", "wairc-ud"].includes(r.id));
    const latest = dismissalRoutes.reduce((m, r) => (m && m > r.deadline ? m : r.deadline), null);
    if (latest && latest < today) status = "passed";
    else if (sys !== "national") status = "route_choice"; // WA: which system applies needs confirming
    else status = "urgent";
  } else if (live.length >= 2) {
    status = "route_choice";
  } else if (live.length === 1) {
    const d = live[0].deadline;
    status = !d ? "handover" : d < today ? "passed" : daysBetween(today, d) < URGENT_DAYS ? "urgent" : "intime";
  } else {
    status = "handover";
  }

  const longer = live.filter((r) => !["fwc-ud", "fwc-gp-dismissal", "wairc-ud"].includes(r.id));
  return {
    module: meta.id, status, handover: status !== "intime", trace, routes, system: sys,
    deadline: earliest, earliestDeadline: earliest,
    longerRoutes: longer.map((r) => r.id),
  };
}

export const HELP = {
  all: [
    { name: "Fair Work Ombudsman (13 13 94)", note: "free information on pay and workplace rights" },
    { name: "Fair Work Commission", note: "help with lodging forms, and a free legal advice service for some unfair dismissal and general protections matters" },
    { name: "Australian Human Rights Commission (1300 656 419)", note: "information about discrimination and sexual harassment complaints" },
    { name: "Your union, if you're a member", note: "can advise and represent you" },
  ],
  VIC: [
    { name: "JobWatch", note: "free employment law information for Victorian workers" },
    { name: "Victorian Equal Opportunity and Human Rights Commission", note: "enquiry line" },
  ],
  WA: [
    { name: "Circle Green Community Legal", note: "free employment law help in WA" },
    { name: "Working Women's Centre WA", note: "free help for women, including with sexual harassment" },
    { name: "WA Equal Opportunity Commission", note: "enquiry line" },
  ],
};

export function clientText(res) {
  const open = res.routes.filter((r) => r.open !== "no" && r.kind !== "help");
  const d = res.earliestDeadline ? fmt(res.earliestDeadline) : "";
  switch (res.status) {
    case "urgent": return { heading: "Act quickly: the main dismissal routes have a 21-day limit",
      body: `On your answers, the earliest time limit ends on ${d}. The two main routes have different requirements, and choosing one can close others.`,
      next: "Please get advice now, before you lodge anything." };
    case "passed": return { heading: "The usual 21-day window may have passed, but don't give up",
      body: `The usual time limit for the main dismissal routes ended on ${fmt(res.routes.find((r) => r.id === "fwc-ud" || r.id === "fwc-gp-dismissal" || r.id === "wairc-ud")?.deadline)}. Late applications are accepted in exceptional circumstances.${res.longerRoutes.length ? " Some other routes below have longer time limits." : ""}`,
      next: "Please get advice now about an extension and the other routes." };
    case "route_choice": return { heading: `There ${open.length === 1 ? "is 1 route" : `are ${open.length} possible routes`}, and choosing one can affect the others`,
      body: d ? `Each route has its own time limit; the earliest on your answers ends on ${d}.` : "Each route has its own time limit, counted from the last incident.",
      next: "Talk to a lawyer, union or community legal centre before choosing." };
    case "intime": return { heading: "You appear to have time",
      body: d ? `On your answers, the earliest time limit ends on ${d}.` : "",
      next: "Free help is available; talk to a lawyer if the amount is large." };
    case "handover": return { heading: "Your situation needs a closer look",
      body: "Your answers don't match the routes this tool covers yet.", next: "Please talk to a lawyer, union or community legal centre." };
    default: return { heading: "We need a bit more information", body: res.message || "", next: "" };
  }
}

export const CASES_TODAY = "2026-11-06";
export const CASES = [
  { id: 1, facts: "VIC company, dismissed 27 Oct 2026 after 3 years", i: { state: "VIC", dismissed: true, dismissalDate: "2026-10-27", monthsEmployed: 36, smallEmployer: false, awardOrUnderThreshold: true }, status: "urgent", deadline: "2026-11-17", open: { "fwc-ud": "yes", "fwc-gp-dismissal": "maybe" } },
  { id: 2, facts: "VIC, dismissed 7 Oct 2026, 21 days passed", i: { state: "VIC", dismissed: true, dismissalDate: "2026-10-07" }, status: "passed" },
  { id: 3, facts: "VIC, 4 months' service: unfair dismissal closed, general protections open", i: { state: "VIC", dismissed: true, dismissalDate: "2026-11-01", monthsEmployed: 4, workplaceRight: true }, status: "urgent", open: { "fwc-ud": "no", "fwc-gp-dismissal": "yes" } },
  { id: 4, facts: "Small business, 8 months' service", i: { state: "VIC", dismissed: true, dismissalDate: "2026-11-01", monthsEmployed: 8, smallEmployer: true }, status: "urgent", open: { "fwc-ud": "no" } },
  { id: 5, facts: "Paid above the threshold, no award", i: { state: "VIC", dismissed: true, dismissalDate: "2026-11-01", monthsEmployed: 24, smallEmployer: false, awardOrUnderThreshold: false }, status: "urgent", open: { "fwc-ud": "no" } },
  { id: 6, facts: "WA partnership dismissed 31 Oct 2026: state system likely, federal still possible", i: { state: "WA", dismissed: true, dismissalDate: "2026-10-31", monthsEmployed: 5, employerType: "unincorporated" }, status: "route_choice", open: { "wairc-ud": "yes", "fwc-ud": "no", "fwc-gp-dismissal": "maybe" }, deadline: "2026-11-21" },
  { id: 15, facts: "WA company: federal system only", i: { state: "WA", dismissed: true, dismissalDate: "2026-10-31", monthsEmployed: 24, smallEmployer: false, awardOrUnderThreshold: true, employerType: "company" }, status: "urgent", open: { "fwc-ud": "yes" } },
  { id: 7, facts: "WA, employer type unknown, dismissed: both systems shown", i: { state: "WA", dismissed: true, dismissalDate: "2026-10-31" }, status: "route_choice", deadline: "2026-11-21" },
  { id: 8, facts: "VIC pregnancy demotion 15 Oct 2026, still employed", i: { state: "VIC", attribute: true, lastIncident: "2026-10-15" }, status: "route_choice", open: { "fwc-gp-nondismissal": "yes", ahrc: "yes", "vic-veohrc": "yes" }, deadline: "2027-10-15" },
  { id: 9, facts: "WA sexual harassment, still employed, employer unknown", i: { state: "WA", sexualHarassment: true, lastIncident: "2026-11-01" }, status: "route_choice", open: { "fwc-sh": "yes", ahrc: "yes", "wa-eoc": "yes", "wairc-sh": "maybe" }, deadline: "2027-11-01" },
  { id: 10, facts: "NSW bullying, still employed", i: { state: "NSW", bullying: true }, status: "route_choice", open: { "fwc-bullying": "yes", "whs-regulator": "yes" } },
  { id: 11, facts: "Bullying after leaving: stop-bullying orders not open", i: { state: "VIC", bullying: true, stillEmployed: false }, status: "handover", open: { "fwc-bullying": "no" } },
  { id: 12, facts: "QLD underpayment from 1 Jun 2024", i: { state: "QLD", underpayment: true, underpaymentFrom: "2024-06-01" }, status: "intime", open: { fwo: "yes", "small-claims": "yes" }, deadline: "2030-06-01" },
  { id: 13, facts: "Dismissal date missing", i: { state: "VIC", dismissed: true }, status: "error" },
  { id: 14, facts: "Dismissed 30 Dec 2025 (year-end counting)", i: { state: "VIC", dismissed: true, dismissalDate: "2025-12-30" }, status: "passed", deadline: "2026-01-20" },
];
