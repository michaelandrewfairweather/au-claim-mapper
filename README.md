# AU Claim Mapper

A browser-only tool that helps people in Australia with injuries, workplace problems, estates and other legal problems see which routes may be open to them, the usual time limits, the costs risks, and when to hand over to a lawyer.

It gives **legal information, not legal advice**. Every rule cites the Act and section it comes from, and says whether it has been checked against the authorised text. It is a personal project and is not tied to any law firm.

## What it covers so far

| Module | Covers | Law |
|---|---|---|
| Personal injury time limits: Victoria | Adults, minors (including injury by a parent or close associate), child abuse (no limit, and reopening earlier settlements), schemes outside Part IIA, deaths, pre-2003 acts, incapacity | Limitation of Actions Act 1958 (Vic) Part IIA, version 113 |
| Employment problems: which route? | Unfair dismissal, general protections (dismissal and not), stop bullying, sexual harassment disputes, AHRC complaints, unpaid wages; state bodies for Victoria (VEOHRC, VCAT) and WA (Equal Opportunity Commission, WAIRC) | Fair Work Act 2009, AHRC Act 1986, Sex Discrimination Act 1984, Equal Opportunity Acts (Vic, WA), Industrial Relations Act 1979 (WA) |

See [docs/VERIFICATION.md](docs/VERIFICATION.md) for exactly what was checked, and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it is built.

## Run it

It is static HTML and ES modules with no build step. Serve the folder with any static server and open it:

```bash
python -m http.server 8790
```

Then open http://localhost:8790. (Opening `index.html` straight from disk doesn't work, because browsers block ES modules on `file://`.)

## Test it

```bash
npm install
```

```bash
npm test
```

The runner checks each module's worked cases, then scores the 50-scenario intake suite in [tests/intake-suite.yaml](tests/intake-suite.yaml) on what the modules can decide: status, deadline, that the verified law is cited, and safe wording. Conversational behaviours (tone, safety handling, follow-up questions) are listed but not scored. `npm test -- --verbose` shows every scenario.

## Deploy to Cloudflare Pages

The site is static files with relative paths and no build step, so Cloudflare Pages serves the repository as it is.

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**, and authorise the GitHub account that owns this repository (`michaelandrewfairweather`). Choose `au-claim-mapper`.
2. Build settings:
   - **Production branch:** `main`
   - **Framework preset:** None
   - **Build command:** leave empty
   - **Build output directory:** `/`
3. Save and deploy. Each push to `main` redeploys; other branches get preview URLs.
4. To add the custom domain: open the Pages project → **Custom domains → Set up a custom domain**, enter the domain, and follow the DNS steps (automatic if the domain's DNS is on Cloudflare).

Notes:
- `_headers` sets a strict Content Security Policy (everything from this site only; no network calls), `no-referrer`, and `noindex` on `/docs/` and `/tests/`.
- With output `/`, **every file in the repository is publicly reachable** on the site, including `docs/`, `tests/` and `package.json`. Nothing in them is secret, but if you'd rather publish only the app, move `index.html` and `src/` into a `public/` folder and set the output directory to `public`.
- After deploying, check the page loads with no console errors (the CSP will block anything not served from the site).

## Principles

- Never say "too late" or "no claim": courts and tribunals can often extend time.
- Use the earliest plausible date. Being early is cheap; being late can lose a claim.
- Hand over whenever the answer turns on judgement.
- Always give a next step, including free help when no lawyer is engaged.
- Nothing typed into the page leaves the browser.

## Licence of legal sources

Commonwealth legislation (Federal Register of Legislation) and Western Australian legislation are used under CC BY 4.0. Victorian legislation is © State of Victoria and not openly licensed; this project cites and paraphrases it and reproduces no text.
