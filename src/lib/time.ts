// Dates and times. The subdivision is in the Philippines, so everything a
// person sees or types is Philippine time (UTC+8, no daylight saving), whatever
// the time zone of their phone or of the server.

const MANILA = "Asia/Manila";
const OFFSET_MS = 8 * 60 * 60 * 1000;

// "2026-11-21" and "14:00" become the exact moment, ready for the database.
export function manilaToIso(date: string, time: string) {
  return `${date}T${time.slice(0, 5)}:00+08:00`;
}

// The Philippine calendar date of a moment, as "2026-11-21".
export function manilaDate(value: string | Date) {
  return new Date(new Date(value).getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

// Minutes since midnight, Philippine time. 14:30 is 870.
export function manilaMinutes(value: string | Date) {
  const shifted = new Date(new Date(value).getTime() + OFFSET_MS);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

export function todayInManila() {
  return manilaDate(new Date());
}

// Adds days to a "2026-11-21" date.
export function addDays(date: string, days: number) {
  const moment = new Date(`${date}T00:00:00Z`);
  moment.setUTCDate(moment.getUTCDate() + days);
  return moment.toISOString().slice(0, 10);
}

// "08:00:00" from the database becomes 480.
export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// 870 becomes "14:30".
export function minutesToTime(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// "14:30" or "14:30:00" becomes "2:30 PM".
export function formatClock(time: string) {
  const total = timeToMinutes(time);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const shown = hours % 12 === 0 ? 12 : hours % 12;
  return `${shown}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: MANILA,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: MANILA,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return `${formatDate(value)}, ${formatTime(value)}`;
}

// "Sat, Nov 21, 2026, 2:00 PM to 6:00 PM"
export function formatRange(start: string, end: string) {
  return `${formatDate(start)}, ${formatTime(start)} to ${formatTime(end)}`;
}

// First and last moment of a month given as "2026-11".
export function monthBounds(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const next = monthNumber === 12 ? `${year + 1}-01` : `${year}-${String(monthNumber + 1).padStart(2, "0")}`;
  return {
    start: `${month}-01T00:00:00+08:00`,
    end: `${next}-01T00:00:00+08:00`,
    firstDay: `${month}-01`,
    nextFirstDay: `${next}-01`,
  };
}

export function formatMonth(month: string) {
  return new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", month: "long", year: "numeric" }).format(
    new Date(`${month}-01T00:00:00Z`),
  );
}

export function isValidMonth(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}

export function isValidDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)));
}

// Has this moment already passed?
export function isPast(value: string | Date) {
  return new Date(value).getTime() < Date.now();
}
