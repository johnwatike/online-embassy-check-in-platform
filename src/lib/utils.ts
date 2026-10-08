export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  const date = typeof value === "string"
    ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value)
    : value;
  if (Number.isNaN(date.getTime())) return "Date not set";
  return new Intl.DateTimeFormat("en", options ?? { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function formatDateTime(value: string, timeZone?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

export function dateTimeInputInZone(value: string, timeZone: string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

export function zonedDateTimeToIso(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  let instant = wallClockAsUtc;

  // Iteratively resolve the mission-local wall clock into a UTC instant,
  // accounting for the timezone's current daylight-saving offset.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(instant));
    const part = (type: string) => Number(parts.find((item) => item.type === type)?.value ?? 0);
    const viewedWallClockAsUtc = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"));
    const adjustment = wallClockAsUtc - viewedWallClockAsUtc;
    instant += adjustment;
    if (adjustment === 0) break;
  }
  return new Date(instant).toISOString();
}

export function relativeDate(value: string) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "Recently";
  const days = Math.round((time - Date.now()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === -1) return "Yesterday";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `In ${days} days`;
}

export function makeId(prefix = "ec") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36).slice(-4)}`;
}
