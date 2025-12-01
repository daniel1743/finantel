export function extractDescription(text: string): string {
  if (!text) return "Transacción";

  let clean = text;

  clean = clean.replace(/(\$)?\s?\d[\d.,kK]*/g, "");

  const verbs = [
    "compré", "compre", "gasté", "gaste",
    "pagué", "pague", "me", "en", "el",
    "la", "un", "una", "al", "por"
  ];

  for (const v of verbs) {
    clean = clean.replace(new RegExp("\\b" + v + "\\b", "gi"), "");
  }

  clean = clean.replace(/\s+/g, " ").trim();

  if (clean.length < 2) return "Transacción";

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
