export function detectType(text: string): "income" | "expense" {
  const t = text.toLowerCase();

  if (t.includes("compr") || t.includes("gast") || t.includes("pagu"))
    return "expense";

  return "income";
}
