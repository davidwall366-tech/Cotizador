// Case- and accent-insensitive: "José", "jose", "JOSÉ" all match "jose".
// Strips combining diacritical marks (U+0300-U+036F) left behind by NFD
// decomposition, by code point rather than a regex range literal.
export function normalize(s: string): string {
  return Array.from(s.normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x300 || code > 0x36f;
    })
    .join("")
    .toLowerCase();
}
