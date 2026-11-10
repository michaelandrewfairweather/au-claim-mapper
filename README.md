# Do I Have Time?

Public site: doihavetime.org (planned). Repository and code name: AU Claim Mapper.

A browser-only tool that helps people in Australia with injuries, workplace problems, estates and other legal problems see which routes may be open to them, the usual time limits, the costs risks, and when to hand over to a lawyer.

It gives **legal information, not legal advice**. Every rule cites the Act and section it comes from, and says whether it has been checked against the authorised text. It is a personal project and is not tied to any law firm.

## What it covers so far

On the public site, only the Victorian check is released (`public/src/modules/released.js`). The employment comparison is built and tested but shows as "coming soon" until every rule it cites is verified; 13 citations are still marked "to-verify". Before enabling Cloudflare Web Analytics, update the privacy line in the About section, which says the site uses no analytics.

| Module | Covers | Law |
|---|---|---|
| Personal injury time limits: Victoria | Adults, minors (including injury by a parent or close associate), child abuse (no limit, and reopening earlier settlements), schemes outside Part IIA, deaths, pre-2003 acts, incapacity | Limitation of Actions Act 1958 (Vic) Part IIA, version 113 |
| Employment problems: which route? | Unfair dismissal, general protections (dismissal and not), stop bullying, sexual harassment disputes, AHRC complaints, unpaid wages; state bodies for Victoria (VEOHRC, VCAT) and WA (Equal Opportunity Commission, WAIRC) | Fair Work Act 2009, AHRC Act 1986, Sex Discrimination Act 1984, Equal Opportunity Acts (Vic, WA), Industrial Relations Act 1979 (WA) |

See [docs/VERIFICATION.md](docs/VERIFICATION.md) for exactly what was checked, and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it is built.

## Run it

It is static HTML and ES modules with no build step. The site is everything in `public/`; serve that folder with any static server and open it:

```bash
python -m http.server 8790 --directory public
```

Then open http://localhost:8790. (Opening `public/index.html` straight from disk doesn't work, because browsers block ES modules on `file://`.)

## Test it

```bash
npm install
```

```bash
npm test
```

The runner checks each module's worked cases, then scores the 50-scenario intake suite in [tests/intake-suite.yaml](tests/intake-suite.yaml) on what the modules can decide: status, deadline, that the verified law is cited, and safe wording. Conversational behaviours (tone, safety handling, follow-up questions) are listed but not scored. `npm test -- --verbose` shows every scenario.

## Live site (GitHub Pages)

https://michaelandrewfairweather.github.io/au-claim-mapper/

`.github/workflows/pages.yml` runs the tests on every push to `main` and, if they pass, publishes `public/` to GitHub Pages. GitHub Pages ignores `public/_headers`, so the security headers apply only on Cloudflare.

## Deploy to Cloudflare Pages

The site is the static files in `public/`, with relative paths and no build step. Only that folder is published; `docs/`, `tests/` and `package.json` stay in the repository.

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**, and authorise the GitHub account that owns this repository (`michaelandrewfairweather`). Choose `au-claim-mapper`.
2. Build settings:
   - **Production branch:** `main`
   - **Framework preset:** None
   - **Build command:** leave empty
   - **Build output directory:** `public`
3. Save and deploy. Each push to `main` redeploys; other branches get preview URLs.
4. To add the custom domain: open the Pages project → **Custom domains → Set up a custom domain**, enter `doihavetime.org` (and `www.doihavetime.org` if wanted, redirecting to the bare domain), and follow the DNS steps (automatic if the domain's DNS is on Cloudflare).

Notes:
- `public/_headers` sets a strict Content Security Policy (everything from this site only; no network calls), `no-referrer` and `nosniff`.
- Cloudflare may run `npm install` because of `package.json` at the root. That's harmless: nothing outside `public/` is published.
- After deploying, check the page loads with no console errors (the CSP will block anything not served from the site).

## Principles

- Never say "too late" or "no claim": courts and tribunals can often extend time.
- Use the earliest plausible date. Being early is cheap; being late can lose a claim.
- Hand over whenever the answer turns on judgement.
- Always give a next step, including free help when no lawyer is engaged.
- Nothing typed into the page leaves the browser.

## Licence of legal sources

Commonwealth legislation (Federal Register of Legislation) and Western Australian legislation are used under CC BY 4.0. Victorian legislation is © State of Victoria and not openly licensed; this project cites and paraphrases it and reproduces no text.
