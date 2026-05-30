/**
 * Formats an ISO date string (yyyy-mm-dd) using the machine's locale.
 * Passes through non-date strings like "Actual" or "Próximamente" unchanged.
 */
export function formatDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00`);
  return date.toLocaleDateString();
}
