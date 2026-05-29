# Contributing to calforge

Thanks for taking the time to contribute! 🎉 calforge implements a spec
(RFC 5545), so **correctness** is the priority. Contributions are reviewed with
that in mind.

## Getting started

```bash
git clone https://github.com/didrod205/calforge.git
cd calforge
npm install
```

| Command | What it does |
| ------- | ------------ |
| `npm test` | Run the test suite (Vitest). |
| `npm run test:watch` | Re-run tests on change. |
| `npm run typecheck` | Type-check without emitting. |
| `npm run build` | Build the library (`dist/`). |
| `npm run build:web` | Build the web app (`docs/`). |
| `npm run dev` | Run the web app locally (`vite`). |

## Good contributions

- **Named time zones** (`VTIMEZONE` + `TZID`) instead of UTC-only.
- **Attendees / RSVP** (`ATTENDEE` with `PARTSTAT`).
- **More providers** or improved all-day handling for existing ones.
- **A copy-paste "Add to Calendar" web component.**

## Rules of the road

1. Every change needs a test, with **fixed `uid` and `dtstamp`** so output is
   deterministic. Assert exact `.ics` lines where formatting matters.
2. Respect RFC 5545: CRLF, 75-octet folding, TEXT escaping. Don't regress these.
3. `npm run typecheck` and `npm test` must pass.
4. Keep the public API small and the package **zero-dependency**.

## Reporting bugs

Open an issue with the event input, the generated `.ics` (or link), the calendar
client, and what you expected vs. got.

By contributing you agree your contributions are licensed under the project's
[MIT License](./LICENSE).
