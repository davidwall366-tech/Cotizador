/** Splits a comma/semicolon-separated string of emails into a clean, deduped list. */
export function parseEmailList(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}
