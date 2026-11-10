# Architecture (proposal, 8 November 2026)

AU Claim Mapper (public name: Do I Have Time?, doihavetime.org) helps a person in Australia see which legal routes may be open to them, the time limits, the costs risks, and when to hand over to a lawyer. It gives legal information, not advice.

This is a proposal for Michael to accept or change. The first slice (below) is built to it, so changes are cheap now.

## Principles

1. **Rules as data, one module per jurisdiction and claim type.** Each module has a rule table: an id, the rule in plain words, the citation (Act, section, version) and a verification status. The evaluator is a small pure function that walks those rules and returns which ones fired. The client wording and the lawyer's trace are both generated from the same rules, so they cannot drift apart.
2. **Every rule cites the Act and says whether it is verified.** `verified` means checked against the named authorised version on the official register. `to-verify` means taken from memory or a secondary source. Unverified rules are shown as such in the lawyer's trace and the client sees a stronger caveat.
3. **Browser-only.** Static HTML and ES modules, no build step, no server, no client data leaving the page. It can be opened from disk or served from any static host.
4. **Tests are the spec.** Each module carries its own worked cases. A test runner (`node tests/run.mjs`) also scores the 50-scenario intake suite (`tests/intake-suite.yaml`) on what the structured modules can decide: status, deadline, the verified law cited, and safe language. Behaviours that need a conversational layer (tone, safety handling, follow-up questions) are listed, not scored.
5. **Fail safe.** When a rule turns on judgement, the module hands over rather than guesses. It never says "too late" or "no claim"; it uses the earliest plausible date; it tells people where free help is when no lawyer is engaged.

## Layout

```
public/index.html                app shell: pick a topic, answer questions, see result + trace
public/src/core/dates.js         date arithmetic (anniversaries, "within N days after")
public/src/core/render.js        shared client-view and trace rendering
public/src/law/sources.js        the Acts used: title, jurisdiction, version, URL, licence attribution
public/src/modules/<m>.js        rule table + evaluate(inputs, today) + client wording
tests/run.mjs                    unit cases for each module + intake-suite scoring
tests/scenario-inputs.mjs        maps each suite scenario to module inputs (or "not covered yet")
tests/intake-suite.yaml          the 50 scenarios (copied in; firm-neutral)
docs/                            architecture, verification log, open questions
```

## Module contract

```
evaluate(inputs, today) -> {
  status: intime | urgent | atrisk | passed | nolimit | scheme | route_choice | handover | refer | error,
  handover: boolean,
  deadline?, earliestDeadline?,          // ISO dates, as answered and earliest plausible
  routes?: [ { id, body, what, deadline, deadlineText, costs, open: bool, why, cites } ],
  trace: [ { rule, text, cites: [ { source, section } ] } ],
}
```

The same function is the tool contract for any AI layer later: the model asks the questions and explains the answer, but never does the date arithmetic or picks the rule itself.

## First slice

1. **Victorian personal injury time limits** (Limitation of Actions Act 1958 (Vic) Part IIA, authorised version 113): the earlier prototype, generalised: firm-neutral wording, rules as data, plus previously settled child abuse claims (ss 27QA, 27QD, 27QE).
2. **Employment: which route?** Compares the Fair Work Commission (unfair dismissal, general protections, stop bullying, stop sexual harassment), the Australian Human Rights Commission, and the state bodies for Victoria (VEOHRC, VCAT) and Western Australia (Equal Opportunity Commission, WA Industrial Relations Commission). Shows each route's time limit, whether choosing it can close others, and its costs risk.

## Later (captured, not built)

- More jurisdictions and claim types, in the order of `docs/ROADMAP.md`.
- A three-way conversation where client, lawyer and AI share one thread. Questions to settle before building: whom the AI speaks for; how a lawyer supervises and approves AI replies; privilege before and after a lawyer joins; professional conduct rules; staying legal information, not advice.
