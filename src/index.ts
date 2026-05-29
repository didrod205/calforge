/**
 * calforge — turn event details into a valid `.ics` file and "Add to Calendar"
 * links (Google, Outlook, Yahoo), entirely locally. No third-party service, no
 * tracking, no API key.
 */

import { serialize } from "./ics.js";
import { calendarLinks, googleUrl, outlookUrl, office365Url, yahooUrl, icsDataUri } from "./links.js";

export { serialize } from "./ics.js";
export { calendarLinks, googleUrl, outlookUrl, office365Url, yahooUrl, icsDataUri } from "./links.js";

export interface Organizer {
  name?: string;
  email: string;
}

export interface EventInput {
  title: string;
  /** Start time: a `Date`, an ISO string, or `YYYY-MM-DD` for all-day. */
  start: Date | string;
  /** End time. If omitted, uses `durationMinutes` (timed) or +1 day (all-day). */
  end?: Date | string;
  /** Used when `end` is omitted for a timed event. Default `60`. */
  durationMinutes?: number;
  allDay?: boolean;
  description?: string;
  location?: string;
  url?: string;
  organizer?: Organizer;
  geo?: { lat: number; lon: number };
  /** Reminder(s), in minutes before the start. */
  alarmMinutes?: number | number[];
  /** A raw RFC 5545 recurrence rule, e.g. `"FREQ=WEEKLY;BYDAY=MO"`. */
  rrule?: string;
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
  /** Override the generated UID (otherwise derived deterministically from the event). */
  uid?: string;
  /** Override DTSTAMP (defaults to now). Useful for reproducible output/tests. */
  dtstamp?: Date;
}

export interface NormalizedEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
  location?: string;
  url?: string;
  organizer?: Organizer;
  geo?: { lat: number; lon: number };
  alarms: number[];
  rrule?: string;
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
  uid: string;
  dtstamp: Date;
}

const DAY_MS = 86_400_000;

function toDate(v: Date | string): Date {
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) throw new TypeError(`calforge: invalid date "${String(v)}"`);
  return d;
}

/** Deterministic UID from event content (FNV-1a), so identical events get identical UIDs. */
function deriveUid(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${(h >>> 0).toString(16)}@calforge`;
}

export function normalize(input: EventInput): NormalizedEvent {
  if (!input.title) throw new TypeError("calforge: event title is required");
  const allDay = input.allDay ?? false;
  const start = toDate(input.start);
  const end = input.end
    ? toDate(input.end)
    : new Date(start.getTime() + (allDay ? DAY_MS : (input.durationMinutes ?? 60) * 60_000));

  const alarms =
    input.alarmMinutes == null
      ? []
      : Array.isArray(input.alarmMinutes)
        ? input.alarmMinutes
        : [input.alarmMinutes];

  const uid = input.uid ?? deriveUid(`${input.title}|${start.toISOString()}|${end.toISOString()}`);

  return {
    title: input.title,
    start,
    end,
    allDay,
    description: input.description,
    location: input.location,
    url: input.url,
    organizer: input.organizer,
    geo: input.geo,
    alarms,
    rrule: input.rrule,
    status: input.status,
    uid,
    dtstamp: input.dtstamp ?? new Date(),
  };
}

/** Build a complete `.ics` (VCALENDAR) string from one or more events. */
export function toICS(input: EventInput | EventInput[]): string {
  const events = (Array.isArray(input) ? input : [input]).map(normalize);
  return serialize(events);
}

export interface CalendarLinks {
  /** The raw `.ics` text (for Apple Calendar / Outlook desktop / download). */
  ics: string;
  /** A `data:` URI of the `.ics`, ready for an `<a download>`. */
  icsDataUri: string;
  google: string;
  outlook: string;
  office365: string;
  yahoo: string;
}

/** Everything you need for an "Add to Calendar" UI: an `.ics` plus provider deep-links. */
export function links(input: EventInput): CalendarLinks {
  const e = normalize(input);
  const ics = serialize([e]);
  return {
    ics,
    icsDataUri: icsDataUri(ics),
    google: googleUrl(e),
    outlook: outlookUrl(e),
    office365: office365Url(e),
    yahoo: yahooUrl(e),
  };
}
