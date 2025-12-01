export function extractAmount(text: string): number | null {
  if (!text) return null;

  // 1. Internacional → 1,500 o $1,500
  const intl = text.match(/(?:\$)?(\d{1,3}(?:,\d{3})+)/);
  if (intl) return parseInt(intl[1].replace(/,/g, ""), 10);

  // 2. Chileno → 1.500 o $1.500
  const cl = text.match(/(?:\$)?(\d{1,3}(?:\.\d{3})+)/);
  if (cl) return parseInt(cl[1].replace(/\./g, ""), 10);

  // 3. Notación simple → 1500
  const pure = text.match(/\b(\d{3,})\b/);
  if (pure) return parseInt(pure[1], 10);

  // 4. Notación k → 1k
  const k = text.match(/(\d+)\s*k/i);
  if (k) return parseInt(k[1], 10) * 1000;

  return null;
}
