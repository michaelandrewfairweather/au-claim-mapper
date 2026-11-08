// Date arithmetic on ISO strings (YYYY-MM-DD). Pure functions; no time zones.

export function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

// The anniversary n years on. A 29 February that doesn't exist moves back to
// 28 February: the cautious (earlier) choice.
export function addYears(iso, n) {
  let [y, m, d] = iso.split("-").map(Number);
  y += n;
  if (m === 2 && d === 29 && !isLeap(y)) d = 28;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Same day n months on; if that day doesn't exist, the last day of the month
// (the cautious choice).
export function addMonths(iso, n) {
  let [y, m, d] = iso.split("-").map(Number);
  m += n;
  y += Math.floor((m - 1) / 12);
  m = ((m - 1) % 12 + 12) % 12 + 1;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  d = Math.min(d, last);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// "Within N days after" an event: the day of the event is not counted
// (Acts Interpretation Act 1901 (Cth) s 36(1), table item 6), so the last day
// is event + N. We ignore the weekend/holiday roll-forward in s 36(2): the
// earlier date is the cautious one to show.
export function addDays(iso, n) {
  const t = Date.parse(iso + "T00:00:00Z") + n * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

export const minDate = (a, b) => (a < b ? a : b);
export const maxDate = (a, b) => (a > b ? a : b);
export const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

export function fmt(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
