import { links, type EventInput } from "../src/index";

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const val = (id: string): string => ($(id) as HTMLInputElement | HTMLTextAreaElement).value.trim();

const out = $<HTMLPreElement>("out");
const dl = $<HTMLAnchorElement>("dl");
const allday = $<HTMLInputElement>("allday");

function buildInput(): EventInput | null {
  const title = val("title");
  if (!title) return null;

  if (allday.checked) {
    const start = val("startDate");
    if (!start) return null;
    const end = val("endDate");
    const input: EventInput = { title, start, allDay: true };
    if (end) input.end = end;
    return withExtras(input);
  }

  const start = val("start");
  if (!start) return null;
  const input: EventInput = { title, start: new Date(start) };
  const end = val("end");
  if (end) input.end = new Date(end);
  return withExtras(input);
}

function withExtras(input: EventInput): EventInput {
  const location = val("location");
  const description = val("description");
  const url = val("url");
  const alarm = ($("alarm") as HTMLSelectElement).value;
  if (location) input.location = location;
  if (description) input.description = description;
  if (url) input.url = url;
  if (alarm) input.alarmMinutes = Number(alarm);
  return input;
}

function update(): void {
  const input = buildInput();
  if (!input) {
    out.textContent = "Fill in a title and start time…";
    return;
  }
  const l = links(input);
  out.textContent = l.ics;
  dl.href = l.icsDataUri;
  dl.download = input.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40) + ".ics";
  ($("google") as HTMLAnchorElement).href = l.google;
  ($("outlook") as HTMLAnchorElement).href = l.outlook;
  ($("yahoo") as HTMLAnchorElement).href = l.yahoo;
}

function toggleAllDay(): void {
  const isAll = allday.checked;
  $("times").hidden = isAll;
  $("dates").hidden = !isAll;
  update();
}

// Prefill with a sensible default (next hour, +1h).
function prefill(): void {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const local = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  ($("start") as HTMLInputElement).value = local(now);
  ($("end") as HTMLInputElement).value = local(new Date(now.getTime() + 3600000));
  const day = (d: Date) => local(d).slice(0, 10);
  ($("startDate") as HTMLInputElement).value = day(now);
  ($("endDate") as HTMLInputElement).value = day(new Date(now.getTime() + 86400000));
}

$("form").addEventListener("input", update);
allday.addEventListener("change", toggleAllDay);
$("copy").addEventListener("click", (e) => {
  navigator.clipboard.writeText(out.textContent ?? "");
  const b = e.currentTarget as HTMLButtonElement;
  const t = b.textContent;
  b.textContent = "Copied!";
  setTimeout(() => (b.textContent = t), 1100);
});

prefill();
update();
