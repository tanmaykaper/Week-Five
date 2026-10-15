/**
 * Calendar files (.ics) built on the device: no server, no account. Times are "floating"
 * (local wall-clock time), so 08:00 stays 08:00 wherever the phone is. Phase 5's pause
 * restart uses one event; Phase 8 adds the full set of reminders.
 */

export interface CalendarEvent {
  uid: string;
  title: string;
  description?: string;
  /** Local date and time. */
  start: Date;
  minutes?: number;
}

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

/** RFC 5545 text: backslash, semicolon, comma and newline escaped. */
export const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Lines longer than 75 octets are folded with a leading space (kept simple: by characters). */
function fold(line: string): string {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 73) parts.push((i ? " " : "") + line.slice(i, i + 73));
  return parts.join("\r\n");
}

export function icsCalendar(events: CalendarEvent[], now = new Date()): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Week Five//On this phone//EN", "CALSCALE:GREGORIAN"];
  for (const e of events) {
    const end = new Date(e.start.getTime() + (e.minutes ?? 15) * 60_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@week-five.local`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${stamp(e.start)}`,
      `DTEND:${stamp(end)}`,
      fold(`SUMMARY:${escapeText(e.title)}`),
      ...(e.description ? [fold(`DESCRIPTION:${escapeText(e.description)}`)] : []),
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

/** Hands the file to the browser as a download. */
export function downloadIcs(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
