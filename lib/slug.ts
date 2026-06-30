/** URL-safe slug for state/district names, e.g. "Andaman & Nicobar Islands" -> "andaman-and-nicobar-islands". */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/&/g, ' and ')
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'other'
  );
}
