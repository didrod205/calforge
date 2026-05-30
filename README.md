<div align="center">

# 📅 calforge

### Make a real "Add to Calendar" link & `.ics` file — locally, in milliseconds.

[![npm version](https://img.shields.io/npm/v/@didrod2539/calforge.svg?color=success)](https://www.npmjs.com/package/@didrod2539/calforge)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@didrod2539/calforge?label=gzip)](https://bundlephobia.com/package/@didrod2539/calforge)
[![CI](https://github.com/didrod205/calforge/actions/workflows/ci.yml/badge.svg)](https://github.com/didrod205/calforge/actions/workflows/ci.yml)
[![types](https://img.shields.io/npm/types/@didrod2539/calforge.svg)](https://www.npmjs.com/package/@didrod2539/calforge)
[![license](https://img.shields.io/npm/l/@didrod2539/calforge.svg)](./LICENSE)

**[🌐 Try the free web app →](https://didrod205.github.io/calforge/)** &nbsp;·&nbsp; fill in an event, get an `.ics` + provider links. No sign-up, nothing tracked.

</div>

---

That "Add to Calendar" button in marketing emails and event pages? It's almost
always powered by a **paid, tracking third-party service** (AddEvent, AddToCalendar,
…). And rolling your own is deceptively hard: the `.ics` format (RFC 5545) has
strict rules — `CRLF` line endings, **75-octet line folding**, escaping `,`, `;`
and `\`, exact UTC timestamps, `UID`, `DTSTAMP` — and one mistake makes Apple
Calendar or Outlook silently refuse the file.

**calforge** generates a spec-correct `.ics` **and** the deep-links for Google,
Outlook and Yahoo from one event object — with **zero dependencies**, **no
service**, **no tracking**, running entirely **in your browser or any JS
runtime**.

> 📸 _Screenshot / demo GIF:_ `./web/screenshot.png` — record the [live app](https://didrod205.github.io/calforge/) filling an event and clicking each calendar button.

## Why it exists

- **AI can't do this reliably.** RFC 5545's folding/escaping/timestamp rules are
  exact and unforgiving — a chatbot will happily produce an `.ics` that won't
  import. A small, tested, deterministic library gets it right every time.
- **No third party.** "Add to Calendar" widgets phone home and track opens.
  calforge runs on your machine; the only thing that leaves is the link *you*
  share.
- **One event in, everything out.** A downloadable `.ics` (Apple Calendar,
  Outlook desktop) **plus** Google/Outlook/Yahoo deep-links — from a single call.

## Who it's for

**Marketers** (event invites, webinars, launches), **creators** (streams, drops,
AMAs), **operators** (maintenance windows, on-call), **event organizers**, and
**developers** who want a tiny library to power an "Add to Calendar" button
without a SaaS.

## Install

**No install —** just open the **[web app](https://didrod205.github.io/calforge/)**.

For the library:

```bash
npm install @didrod2539/calforge
```

> Published on npm under the `@didrod2539` scope (`@didrod2539/calforge`). The
> import name matches the package name; everything else is identical.

Zero dependencies. ESM + CJS + TypeScript types. Runs in the browser, Node, Deno and Bun.

## Usage

### Generate an `.ics`

```ts
import { toICS } from "@didrod2539/calforge";

const ics = toICS({
  title: "Product launch 🚀",
  start: "2026-06-01T17:00:00Z",
  durationMinutes: 60,            // or pass `end`
  location: "Zoom",
  description: "Join us for the reveal.",
  alarmMinutes: 30,               // reminder
});
// → valid VCALENDAR text; write it to a .ics file or offer it as a download.
```

### Get "Add to Calendar" links

```ts
import { links } from "@didrod2539/calforge";

const l = links({
  title: "Team offsite",
  start: "2026-09-10T09:00:00Z",
  end: "2026-09-10T17:00:00Z",
  location: "Lisbon",
});

l.google;       // https://calendar.google.com/calendar/render?...
l.outlook;      // https://outlook.live.com/calendar/...
l.yahoo;        // https://calendar.yahoo.com/?...
l.icsDataUri;   // data: URI for an <a download> (Apple / Outlook desktop)
l.ics;          // the raw .ics text
```

### All-day & recurring

```ts
toICS({ title: "Launch day", start: "2026-12-25", allDay: true });
toICS({ title: "Standup", start: "2026-06-01T09:00:00Z", rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" });
```

### Browser download

```ts
const ics = toICS(event);
const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
// <a href={url} download="event.ics">Add to Calendar</a>
```

## API

| Function | Description |
| -------- | ----------- |
| `toICS(event \| event[])` | Build a complete `.ics` (VCALENDAR) string. |
| `links(event)` | `{ ics, icsDataUri, google, outlook, office365, yahoo }`. |
| `googleUrl` / `outlookUrl` / `office365Url` / `yahooUrl(event)` | Individual provider links. |
| `icsDataUri(icsText)` | A `data:` URI for downloads. |
| `normalize(event)` | The resolved event (dates, defaults, derived UID). |

`EventInput`: `title`, `start`, `end?` / `durationMinutes?`, `allDay?`,
`description?`, `location?`, `url?`, `organizer?`, `geo?`, `alarmMinutes?`,
`rrule?`, `status?`, `uid?`, `dtstamp?`.

## FAQ

**Does it phone home or track anyone?**
No. Generation is 100% local — no server, no telemetry, works offline. Provider
links open the user's own calendar.

**Will the `.ics` actually import into Apple Calendar / Outlook?**
Yes — output follows RFC 5545 (CRLF, 75-octet folding, TEXT escaping, UTC
`DTSTART`/`DTEND`, `UID`, `DTSTAMP`), the things that make pickier clients accept it.

**What time zone are events in?**
Timed events are serialized in **UTC** (`…Z`), which every calendar interprets
correctly. All-day events use floating `VALUE=DATE`. (Named-VTIMEZONE output is on
the roadmap.)

**Can I put multiple events in one file?**
Yes — pass an array to `toICS`.

**How is this different from the `ics` / `ical-generator` npm packages?**
calforge is zero-dependency and browser-first, and it bundles the provider
**deep-links** + a ready `data:` URI for an "Add to Calendar" UI — not just file
generation.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md).

```bash
git clone https://github.com/didrod205/calforge.git
cd calforge
npm install
npm test          # run the suite
npm run dev       # run the web app locally
```

## 💖 Sponsor

calforge is free, MIT-licensed, and built in spare time. If it saved you a
SaaS subscription (or a debugging afternoon), please consider supporting it:

- ⭐ **Star this repo** — free, and it genuinely helps others find it.
- 🍋 **[Sponsor via Lemon Squeezy](https://elab-studio.lemonsqueezy.com/checkout/buy/5d059b89-51d0-456b-b33a-ed56994f7010)** — one-time or recurring support.

**Where your support goes:** named time-zone (VTIMEZONE) output, attendees &
RSVP, a copy-paste "Add to Calendar" web component, recurrence helpers, more
providers, keeping the free web app online, and fast issue responses.

## License

[MIT](./LICENSE) © calforge contributors
