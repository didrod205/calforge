# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0]

### Added

- Initial release.
- `toICS(event | events[])` — RFC 5545-correct `.ics`: CRLF, 75-octet line
  folding, TEXT escaping, UTC `DTSTART`/`DTEND`, `UID`, `DTSTAMP`, `VALARM`
  reminders, all-day (`VALUE=DATE`), `RRULE`, `STATUS`, `GEO`, `ORGANIZER`.
- `links(event)` — `.ics` + `data:` URI + Google/Outlook/Office365/Yahoo deep-links.
- Individual builders: `googleUrl`, `outlookUrl`, `office365Url`, `yahooUrl`, `icsDataUri`.
- Deterministic, content-derived `UID` (override supported).
- Free, local-only web app ("Add to Calendar" generator) deployed to GitHub Pages.
- Zero runtime dependencies; ESM + CJS + TypeScript types.

[Unreleased]: https://github.com/didrod205/calforge/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/didrod205/calforge/releases/tag/v0.1.0
