import { describe, expect, it } from "vitest";
import { googleUrl, links, normalize, toICS } from "../src/index.js";

const DTSTAMP = new Date("2026-05-01T00:00:00Z");
const base = {
  title: "Launch",
  start: "2026-06-01T09:00:00Z",
  end: "2026-06-01T10:00:00Z",
  uid: "fixed@calforge",
  dtstamp: DTSTAMP,
} as const;

const lines = (ics: string) => ics.split("\r\n");
const byteLen = (s: string) => new TextEncoder().encode(s).length;

describe("toICS — structure", () => {
  const ics = toICS(base);

  it("emits a well-formed VCALENDAR/VEVENT with CRLF", () => {
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("\r\n");
    expect(ics.endsWith("\r\n")).toBe(true);
  });

  it("formats UID, DTSTAMP and timed DTSTART/DTEND in UTC", () => {
    expect(ics).toContain("UID:fixed@calforge");
    expect(ics).toContain("DTSTAMP:20260501T000000Z");
    expect(ics).toContain("DTSTART:20260601T090000Z");
    expect(ics).toContain("DTEND:20260601T100000Z");
    expect(ics).toContain("SUMMARY:Launch");
  });

  it("derives end from durationMinutes when end is omitted", () => {
    const ics2 = toICS({ title: "Sync", start: "2026-06-01T09:00:00Z", durationMinutes: 30, dtstamp: DTSTAMP });
    expect(ics2).toContain("DTEND:20260601T093000Z");
  });
});

describe("toICS — RFC details", () => {
  it("escapes TEXT values (comma, semicolon, backslash, newline)", () => {
    const ics = toICS({ ...base, title: "A, B; C\\D\nE" });
    expect(ics).toContain("SUMMARY:A\\, B\\; C\\\\D\\nE");
  });

  it("formats all-day events as VALUE=DATE with an exclusive end", () => {
    const ics = toICS({ title: "Holiday", start: "2026-12-25", allDay: true, dtstamp: DTSTAMP });
    expect(ics).toContain("DTSTART;VALUE=DATE:20261225");
    expect(ics).toContain("DTEND;VALUE=DATE:20261226");
  });

  it("folds lines so none exceeds 75 octets; continuations start with a space", () => {
    const ics = toICS({ ...base, description: "x".repeat(300) });
    const physical = lines(ics);
    for (const l of physical) expect(byteLen(l)).toBeLessThanOrEqual(75);
    // the long DESCRIPTION must have produced at least one continuation line
    expect(physical.some((l) => l.startsWith(" "))).toBe(true);
  });

  it("adds a VALARM reminder", () => {
    const ics = toICS({ ...base, alarmMinutes: 15 });
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT15M");
    expect(ics).toContain("END:VALARM");
  });

  it("supports multiple events in one calendar", () => {
    const ics = toICS([base, { ...base, uid: "second@calforge", title: "Party" }]);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("SUMMARY:Party");
  });
});

describe("deterministic UID", () => {
  it("derives the same UID for identical events", () => {
    const a = toICS({ title: "Repeat", start: "2026-06-01T09:00:00Z", dtstamp: DTSTAMP });
    const b = toICS({ title: "Repeat", start: "2026-06-01T09:00:00Z", dtstamp: DTSTAMP });
    const uid = (s: string) => lines(s).find((l) => l.startsWith("UID:"));
    expect(uid(a)).toBe(uid(b));
    expect(uid(a)).toMatch(/^UID:[0-9a-f]+@calforge$/);
  });
});

describe("calendar links", () => {
  it("builds a Google Calendar URL", () => {
    const url = googleUrl(normalize(base));
    expect(url).toContain("calendar.google.com");
    expect(url).toContain("text=Launch");
    expect(url).toContain("dates=20260601T090000Z%2F20260601T100000Z");
  });

  it("links() returns ics + all providers", () => {
    const l = links(base);
    expect(l.ics).toContain("BEGIN:VCALENDAR");
    expect(l.icsDataUri.startsWith("data:text/calendar")).toBe(true);
    expect(l.google).toContain("calendar.google.com");
    expect(l.outlook).toContain("outlook.live.com");
    expect(l.office365).toContain("outlook.office.com");
    expect(l.yahoo).toContain("calendar.yahoo.com");
  });
});
