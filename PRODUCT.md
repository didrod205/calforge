# calforge — Product & Strategy

Why calforge exists, who it's for, how it's positioned, and how it could sustain itself.

## 1. Why this idea

"Add to Calendar" is everywhere — webinar emails, event pages, product launches,
streams. Yet almost every one of those buttons is powered by a **paid,
tracking, third-party SaaS** (AddEvent, AddToCalendar, …). The reason people
reach for a service is that doing it yourself is deceptively hard: the `.ics`
format (RFC 5545) is strict — CRLF endings, **75-octet line folding**, escaping
`, ; \`, exact UTC timestamps, `UID`, `DTSTAMP` — and one slip makes Apple
Calendar or Outlook silently reject the file.

calforge removes the need for the service: give it an event, get a spec-correct
`.ics` **and** Google/Outlook/Yahoo links, generated **locally**. It's a "why
didn't I know this?" tool that saves a subscription and stops the tracking.

It satisfies every constraint: **AI can't reliably replace it** (RFC folding/
escaping is exact and unforgiving), **no server**, **no API key**, **runs in the
browser or any JS runtime**, immediate value, broad audience.

## 2. Competitor analysis

| Tool | What it does | Gaps calforge fills |
| ---- | ------------ | ------------------- |
| AddEvent / AddToCalendar (SaaS) | Hosted "Add to Calendar" buttons | Paid tiers, **tracking**, external dependency, branding |
| `ics` / `ical-generator` (npm) | Generate `.ics` | Node-oriented; no provider deep-links; not a ready "button" toolkit |
| Hand-rolled `.ics` strings | DIY | Easy to get folding/escaping/timestamps wrong → silent import failures |
| Google "create event" link copy-paste | One provider | Only Google; manual; no `.ics` for Apple/Outlook |

**Nobody** offers a zero-dependency, browser-first library that emits a
**correct `.ics` + all provider deep-links + a ready `data:` URI** for an "Add to
Calendar" UI, with a free local web app on top.

## 3. Differentiation

1. **Local-first, no SaaS, no tracking.**
2. **One event → everything** — `.ics` for Apple/Outlook desktop *and* Google/
   Outlook/Yahoo deep-links.
3. **RFC-correct & tested** — folding, escaping, UTC timestamps, deterministic UID.
4. **Library + app from one core** — devs embed it; everyone uses the studio.
5. **Zero dependencies**, runs anywhere JS does.

## 4. Folder structure

```
calforge/
├─ src/        ics.ts (RFC 5545) · links.ts (providers) · index.ts (model + API)
├─ test/       deterministic .ics + link tests (fixed uid/dtstamp)
├─ web/        Vite "Add to Calendar" generator → docs/ (GitHub Pages)
├─ .github/    ci · release · pages workflows, templates, FUNDING
└─ README · LICENSE · CONTRIBUTING · CODE_OF_CONDUCT · CHANGELOG · PRODUCT
```

## 9. GitHub Topics

```
ics, icalendar, ical, add-to-calendar, calendar, rfc5545, google-calendar,
outlook, event, vevent, calendar-link, zero-dependency
```

## 10. Product Hunt launch copy

**Tagline:** Make a real "Add to Calendar" link & .ics — locally, no SaaS, no tracking.

**Description:**
> Every "Add to Calendar" button you've clicked was probably a paid, tracking
> third-party widget. calforge lets you generate the real thing yourself: fill in
> an event and get a downloadable .ics (Apple Calendar, Outlook) plus
> Add-to-Calendar links for Google, Outlook and Yahoo — built entirely in your
> browser. No sign-up, nothing tracked.
>
> There's also a zero-dependency npm library so developers can drop an "Add to
> Calendar" button into any site without a SaaS.
>
> Free & open-source (MIT). 📅

**First comment (maker):** "I needed an 'Add to Calendar' button and every option
was a tracking SaaS with a paid tier. The `.ics` spec is finicky, so I built a
tiny, correct generator that runs locally — and added the provider links too."

## 11. npm package name

- **Primary:** `calforge` (brandable, clearly "calendar", available).
- Discoverability via keyword topics & SEO below.

## 12. SEO keyword strategy

Intent-rich queries:

- "add to calendar link generator", "create ics file"
- "ics generator javascript", "icalendar generator"
- "google calendar add event link", "outlook add to calendar link"
- "add to calendar button without service", "free add to calendar"
- "rfc 5545 javascript", "generate vevent"

Tactics: descriptive `<title>`/meta on the app (done), README phrasing,
per-provider docs, GitHub topics, and the GitHub Pages app as an indexable
landing page.

## 13. Monetization (without breaking the free, local promise)

Core stays free, open-source, local forever.

1. **Sponsorship** — Lemon Squeezy (wired up), with a clear "where it goes" note.
2. **Pro / integrations** — a drop-in "Add to Calendar" **web component** with
   themes, a hosted (optional) RSVP/landing builder, a Figma-to-event plugin, or
   a Pro CLI for bulk event generation.
3. **Funded features** — orgs sponsor named-timezone support, attendees/RSVP, or
   marketing-platform integrations.

Guardrails: never add tracking, never require an account for the core, never
paywall existing generation features.
