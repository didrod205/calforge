/**
 * "Add to Calendar" provider deep-links. These build the URLs each web calendar
 * expects; combined with the `.ics` (for Apple Calendar / Outlook desktop) they
 * cover every major calendar — with no third-party service in between.
 */

import { toDateStamp, toUtcStamp } from "./ics.js";
import type { NormalizedEvent } from "./index.js";

const isoDate = (d: Date): string => d.toISOString().slice(0, 10); // YYYY-MM-DD

/** `data:` URI of an `.ics` string, ready for `<a download>`. */
export function icsDataUri(ics: string): string {
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
}

export function googleUrl(e: NormalizedEvent): string {
  const dates = e.allDay
    ? `${toDateStamp(e.start)}/${toDateStamp(e.end)}`
    : `${toUtcStamp(e.start)}/${toUtcStamp(e.end)}`;
  const p = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates });
  if (e.description) p.set("details", e.description);
  if (e.location) p.set("location", e.location);
  if (e.rrule) p.set("recur", `RRULE:${e.rrule}`);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function outlookBase(host: string, e: NormalizedEvent): string {
  const p = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: e.title,
    startdt: e.allDay ? isoDate(e.start) : e.start.toISOString(),
    enddt: e.allDay ? isoDate(e.end) : e.end.toISOString(),
  });
  if (e.allDay) p.set("allday", "true");
  if (e.description) p.set("body", e.description);
  if (e.location) p.set("location", e.location);
  return `https://${host}/calendar/0/deeplink/compose?${p.toString()}`;
}

export const outlookUrl = (e: NormalizedEvent): string => outlookBase("outlook.live.com", e);
export const office365Url = (e: NormalizedEvent): string => outlookBase("outlook.office.com", e);

export function yahooUrl(e: NormalizedEvent): string {
  const p = new URLSearchParams({ v: "60", title: e.title });
  if (e.allDay) {
    p.set("st", toDateStamp(e.start));
    p.set("dur", "allday");
  } else {
    p.set("st", toUtcStamp(e.start));
    p.set("et", toUtcStamp(e.end));
  }
  if (e.description) p.set("desc", e.description);
  if (e.location) p.set("in_loc", e.location);
  return `https://calendar.yahoo.com/?${p.toString()}`;
}

/** All provider links plus the `.ics` data URI. */
export function calendarLinks(
  e: NormalizedEvent,
): { google: string; outlook: string; office365: string; yahoo: string } {
  return {
    google: googleUrl(e),
    outlook: outlookUrl(e),
    office365: office365Url(e),
    yahoo: yahooUrl(e),
  };
}
