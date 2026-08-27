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

// Calcule les valeurs nutritionnelles réelles selon le poids en grammes
export function calculerValeursPortion(aliment: Aliment, quantiteEnGrams: number): TotauxNutritionnels {
  const ratio = quantiteEnGrams / 100;
  return {
    calories: Math.round(aliment.calories * ratio),
    proteines: Number((aliment.proteines * ratio).toFixed(1)),
    glucides: Number((aliment.glucides * ratio).toFixed(1)),
    lipides: Number((aliment.lipides * ratio).toFixed(1)),
  };
}

// Calcule le total pour une liste de portions
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