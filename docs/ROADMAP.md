# Roadmap and open questions

## Next modules (suggested order)

Chosen by what the intake suite shows people most need and what has short or harsh deadlines.

1. **NSW road injury** (Motor Accident Injuries Act 2017): the 28-day claim step (suite C05).
2. **Queensland personal injury pre-court notices** (Personal Injuries Proceedings Act 2002; Motor Accident Insurance Act 1994 s 37) and limitation (Limitation of Actions Act 1974 s 11) (A07, C03, D02).
3. **Family provision time limits** in VIC, NSW, QLD (H01–H03): 6 months from probate (Vic), 12 months from death (NSW), notice and 9 months (Qld).
4. **Victorian WorkCover and TAC**: claim lodgement, the 130-week weekly payments cliff and the 2024 mental injury changes (B01–B03, C01, C02).
5. **Dust diseases** (E01): urgency of a terminal diagnosis, survival of damages.
6. **Employment for other states**: NSW, QLD, SA, TAS, ACT, NT anti-discrimination bodies and time limits.
7. **Safety and out-of-scope routing** (E04, J01–J08): needs the conversational layer; the structured modules cannot score these.

Intake suite coverage today: 17 scenarios scored (all pass), 2 partial, 31 not covered.

## Questions for Michael

1. **Repository**: settled (private, michaelandrewfairweather/au-claim-mapper; site served from `public/` on Cloudflare Pages).
2. **Domain**: settled: doihavetime.org (public name "Do I Have Time?").
3. **Counting the last day**: show the exact last day, or a "file by" date a week earlier so nobody files on the last day?
4. **"Ought to have known"** (Vic s 27F): the tool shows both dates and treats the earlier as the one to beat. Too alarming for late-discovered medical injuries?
5. **Close associates** (Vic s 27I(2)): ask about it at all, or always hand over when a minor was hurt by someone in the household?
6. **Does a s 27J suspension also stop the 12-year long-stop?** The tool hands these over rather than guess.
7. **WA employer type**: ask the user for the employer's ABN and look up its entity type (ABN Lookup is public), or keep asking in plain words?

## Captured for later: client, lawyer and AI in one conversation

A three-way model where the client, a lawyer and the AI share one thread. To settle before building:

- **Whom the AI speaks for**: the client's helper, the firm's intake, or a neutral information service. It changes what it may say and to whom.
- **Supervision**: does a lawyer approve AI replies before the client sees them once a lawyer has joined? Which replies (all, or only those touching on the client's case)?
- **Privilege**: what is privileged before a lawyer joins (probably nothing: an AI chat with no lawyer is not a lawyer–client communication) and after (communications for the dominant purpose of legal advice). How to tell the client the difference honestly.
- **Professional rules**: supervision of non-lawyers, conflicts checks before the lawyer sees details, costs disclosure timing, advertising rules, and the Uniform Law's rules on who may give legal advice.
- **Staying information, not advice**: the AI keeps giving general information; advice comes only from the lawyer, and the thread shows which is which.
