export function classify(desc: string): string {
  desc = desc.toLowerCase();

  const categories: Record<string, string[]> = {
    "Alimentación": ["arroz", "pan", "pollo", "carne", "verdura", "sushi"],
    "Restaurantes": ["pizza", "domino", "mcdonald", "kfc"],
    "Transporte": ["uber", "taxi", "gasolina"],
    "Hogar": ["luz", "agua", "internet"],
  };

  for (const [cat, words] of Object.entries(categories)) {
    if (words.some(w => desc.includes(w))) return cat;
  }

  return "Otros";
}
