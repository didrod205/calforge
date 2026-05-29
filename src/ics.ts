/**
 * RFC 5545 (iCalendar) serialization — the fiddly, correctness-critical part:
 * CRLF line endings, 75-octet line folding, TEXT escaping, and the exact
 * date/time formats. Get any of these wrong and calendars silently reject the
 * file.
 */

import type { NormalizedEvent } from "./index.js";

const enc = new TextEncoder();
const pad = (n: number, len = 2): string => String(n).padStart(len, "0");

/** `YYYYMMDDTHHMMSSZ` in UTC. */
export function toUtcStamp(d: Date): string {
  return (
    `${pad(d.getUTCFullYear(), 4)}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** `YYYYMMDD` in UTC (for all-day VALUE=DATE). */
export function toDateStamp(d: Date): string {
  return `${pad(d.getUTCFullYear(), 4)}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

/** Escape a TEXT value per RFC 5545 §3.3.11. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold a content line so no physical line exceeds 75 octets (continuations get a leading space). */
export function foldLine(line: string): string {
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const cb = enc.encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines reserve 1 octet for the leading space
    if (bytes + cb > limit) {
      out.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += cb;
  }
  out.push(cur);
  return out.map((l, i) => (i === 0 ? l : " " + l)).join("\r\n");
}

function prop(name: string, value: string): string {
  return foldLine(`${name}:${value}`);
}

function eventLines(e: NormalizedEvent): string[] {
  const lines: string[] = ["BEGIN:VEVENT", prop("UID", e.uid), prop("DTSTAMP", toUtcStamp(e.dtstamp))];

  if (e.allDay) {
    lines.push(prop("DTSTART;VALUE=DATE", toDateStamp(e.start)));
    lines.push(prop("DTEND;VALUE=DATE", toDateStamp(e.end)));
  } else {
    lines.push(prop("DTSTART", toUtcStamp(e.start)));
    lines.push(prop("DTEND", toUtcStamp(e.end)));
  }

  lines.push(prop("SUMMARY", escapeText(e.title)));
  if (e.description) lines.push(prop("DESCRIPTION", escapeText(e.description)));
  if (e.location) lines.push(prop("LOCATION", escapeText(e.location)));
  if (e.url) lines.push(prop("URL", e.url));
  if (e.geo) lines.push(prop("GEO", `${e.geo.lat};${e.geo.lon}`));
  if (e.organizer) {
    const cn = e.organizer.name ? `;CN=${e.organizer.name}` : "";
    lines.push(prop(`ORGANIZER${cn}`, `mailto:${e.organizer.email}`));
  }
  if (e.status) lines.push(prop("STATUS", e.status));
  if (e.rrule) lines.push(prop("RRULE", e.rrule));

  for (const minutes of e.alarms) {
    lines.push(
      "BEGIN:VALARM",
      prop("ACTION", "DISPLAY"),
      prop("DESCRIPTION", escapeText(e.title)),
      prop("TRIGGER", `-PT${minutes}M`),
      "END:VALARM",
    );
  }

  lines.push("END:VEVENT");
  return lines;
}

/** Serialize one or more normalized events into a complete VCALENDAR string. */
export function serialize(events: NormalizedEvent[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//calforge//calforge//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const e of events) lines.push(...eventLines(e));
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
