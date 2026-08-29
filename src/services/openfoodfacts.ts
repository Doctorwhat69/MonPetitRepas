import { Aliment } from '../types/nutrition';

export async function chercherAlimentsAPI(query: string): Promise<Aliment[]> {
  if (!query.trim()) return [];

  const url = `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    query
  )}&search_simple=1&action=process&json=1&page_size=30&fields=code,product_name,brands,image_front_small_url,nutriments,nutriscore_grade`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.products) return [];

    const produitsTraites: Aliment[] = [];
    const nomsVus = new Set<string>();

    for (const p of data.products) {
      if (!p.product_name || !p.nutriments) continue;

      const nomNettoye = p.product_name.trim().toLowerCase();
      const marqueNettoye = (p.brands || '').trim().toLowerCase();
      const cleUnique = `${nomNettoye}-${marqueNettoye}`;

      // Évite les doublons exacts (nom + marque)
      if (nomsVus.has(cleUnique)) continue;
      nomsVus.add(cleUnique);

      produitsTraites.push({
        id: p.code,
        nom: p.product_name,
        marque: p.brands ? p.brands.split(',')[0] : undefined,
        image_url: p.image_front_small_url,
        calories: Math.round(p.nutriments['energy-kcal_100g'] ?? 0),
        proteines: Number((p.nutriments.proteins_100g ?? 0).toFixed(1)),
        glucides: Number((p.nutriments.carbohydrates_100g ?? 0).toFixed(1)),
        lipides: Number((p.nutriments.fat_100g ?? 0).toFixed(1)),
        nutriscore: (p.nutriscore_grade || 'C').toUpperCase(),
      });
    }

    return produitsTraites;
  } catch (error) {
    console.error('Erreur API Open Food Facts :', error);
    return [];
  }
}