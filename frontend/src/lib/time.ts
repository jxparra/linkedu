const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

/** "hace 5 min", "hace 2 días"… Las fechas sin zona horaria se tratan como UTC (así las guarda SQLite). */
export function timeAgo(iso: string): string {
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  const s = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(s);
  if (abs < 60) return "ahora";
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(s / 86400), "day");
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
