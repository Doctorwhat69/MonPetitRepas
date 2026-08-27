import { Aliment } from '../types/nutrition';

export interface PortionAliment {
  aliment: Aliment;
  quantiteEnGrams: number;
}

export interface TotauxNutritionnels {
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

// 1. Calcule les valeurs nutritionnelles réelles selon le poids en grammes
export function calculerValeursPortion(aliment: Aliment, quantiteEnGrams: number): TotauxNutritionnels {
  const ratio = quantiteEnGrams / 100;
  return {
    calories: Math.round(aliment.calories * ratio),
    proteines: Number((aliment.proteines * ratio).toFixed(1)),
    glucides: Number((aliment.glucides * ratio).toFixed(1)),
    lipides: Number((aliment.lipides * ratio).toFixed(1)),
  };
}

// 2. Calcule le total pour une liste de portions
export function calculerTotauxRepas(portions: PortionAliment[]): TotauxNutritionnels {
  return portions.reduce(
    (acc, item) => {
      const valeurs = calculerValeursPortion(item.aliment, item.quantiteEnGrams);
      return {
        calories: acc.calories + valeurs.calories,
        proteines: Number((acc.proteines + valeurs.proteines).toFixed(1)),
        glucides: Number((acc.glucides + valeurs.glucides).toFixed(1)),
        lipides: Number((acc.lipides + valeurs.lipides).toFixed(1)),
      };
    },
    { calories: 0, proteines: 0, glucides: 0, lipides: 0 }
  );
}

// 3. Calcul dynamique du Nutri-Score
const nutriScoreToNumber: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };
const numberToNutriScore: Record<number, string> = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E' };

export function calculerNutriscoreMoyen(portions: PortionAliment[]): string {
  if (portions.length === 0) return '-';

  let totalPoints = 0;
  let totalPoids = 0;

  portions.forEach((portion) => {
    const points = nutriScoreToNumber[portion.aliment.nutriscore];
    if (points) {
      totalPoints += points * portion.quantiteEnGrams;
      totalPoids += portion.quantiteEnGrams;
    }
  });

  if (totalPoids === 0) return '-';

  // On calcule la moyenne et on arrondit à l'entier le plus proche
  const moyenne = Math.round(totalPoints / totalPoids);
  
  // On s'assure que le résultat reste entre 1 et 5
  const index = Math.max(1, Math.min(5, moyenne));

  return numberToNutriScore[index];
}