import { Aliment } from '../types/nutrition';
import { supabase } from './supabase';

const nettoyerTexte = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// Algorithme de pertinence universel
function calculerScorePertinence(nomAliment: string, recherche: string): number {
  const nom = nettoyerTexte(nomAliment);
  const q = nettoyerTexte(recherche);

  // 1. Match exact (ex: "Pomme" pour "pomme")
  if (nom === q) return 1000;

  // 2. Le nom commence par la recherche (ex: "Pomme fraîche")
  if (nom.startsWith(q)) {
    return 500 - nom.length; // Moins il y a de mots en plus, plus le score est haut
  }

  // 3. Le mot recherché est présent en tant que mot isolé (ex: "Jus de pomme")
  const mots = nom.split(/[\s,.'(-]+/);
  if (mots.includes(q)) {
    return 300 - nom.length;
  }

  // 4. Simple sous-chaîne
  if (nom.includes(q)) {
    return 100 - nom.length;
  }

  return 0;
}

export async function chercherAlimentsAPI(query: string): Promise<Aliment[]> {
  const queryNettoyee = nettoyerTexte(query.trim());
  if (queryNettoyee.length < 2) return [];

  const tousLesResultats: Aliment[] = [];
  const idsVus = new Set<string>();

  // 1. Recherche Supabase (CIQUAL)
  try {
    const { data } = await supabase
      .from('aliments_ciqual')
      .select('*')
      .ilike('nom', `%${query.trim()}%`)
      .limit(50);

    if (data) {
      data.forEach((item) => {
        idsVus.add(nettoyerTexte(item.nom));
        tousLesResultats.push({
          id: item.id,
          nom: item.nom,
          marque: item.categorie || 'Aliment brut',
          calories: Number(item.calories),
          proteines: Number(item.proteines),
          glucides: Number(item.glucides),
          lipides: Number(item.lipides),
          nutriscore: item.nutriscore || 'A',
        });
      });
    }
  } catch (e) {
    console.error('Erreur Supabase :', e);
  }

  // 2. Recherche Open Food Facts
  try {
    const url = `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      query.trim()
    )}&search_simple=1&action=process&json=1&page_size=40&fields=code,product_name,product_name_fr,brands,image_front_small_url,nutriments,nutriscore_grade`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.products) {
      for (const p of data.products) {
        if (!p.nutriments) continue;
        const nom = (p.product_name_fr || p.product_name || '').trim();
        if (!nom) continue;

        const marque = p.brands ? p.brands.split(',')[0].trim() : '';
        const cle = nettoyerTexte(`${nom} ${marque}`);

        if (idsVus.has(cle)) continue;
        idsVus.add(cle);

        tousLesResultats.push({
          id: p.code,
          nom,
          marque: marque || undefined,
          image_url: p.image_front_small_url,
          calories: Math.round(p.nutriments['energy-kcal_100g'] ?? 0),
          proteines: Number((p.nutriments.proteins_100g ?? 0).toFixed(1)),
          glucides: Number((p.nutriments.carbohydrates_100g ?? 0).toFixed(1)),
          lipides: Number((p.nutriments.fat_100g ?? 0).toFixed(1)),
          nutriscore: (p.nutriscore_grade || 'C').toUpperCase(),
        });
      }
    }
  } catch (e) {
    console.error('Erreur OFF :', e);
  }

  // 3. Tri global par le score de pertinence
  return tousLesResultats.sort((a, b) => {
    const scoreA = calculerScorePertinence(a.nom, queryNettoyee);
    const scoreB = calculerScorePertinence(b.nom, queryNettoyee);
    return scoreB - scoreA;
  });
}