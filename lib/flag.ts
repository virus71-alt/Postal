/** ISO country code -> flag emoji, e.g. 'IN' -> 🇮🇳. Falls back to a globe. */
export function countryFlag(code: string): string {
  const cc = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return '🌐';
  return String.fromCodePoint(
    ...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

/** English country name from ISO code, e.g. 'IN' -> 'India'. */
export function countryName(code: string): string {
  try {
    return (
      new Intl.DisplayNames(['en'], { type: 'region' }).of(
        code.toUpperCase()
      ) ?? code.toUpperCase()
    );
  } catch {
    return code.toUpperCase();
  }
}
