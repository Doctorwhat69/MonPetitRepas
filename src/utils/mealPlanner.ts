export interface RecettePlan {
  id: string;
  nom: string;
  moment: 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation';
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  items: any[]; // Les aliments qui composent la recette
}

export interface ObjectifJournalier {
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

// Répartition standard d'une journée (modulable par la suite)
const REPARTITION = {
  petit_dejeuner: 0.25, // 25% des calories
  dejeuner: 0.35,       // 35%
  collation: 0.10,      // 10%
  diner: 0.30,          // 30%
};

/**
 * Algorithme Glouton pour générer une journée de repas
 */
export function genererJourneeGlouton(
  objectif: ObjectifJournalier,
  recettesDisponibles: RecettePlan[]
): {
  repas: RecettePlan[];
  totalCalories: number;
  ecartPourcentage: number;
} {
  const repasChoisis: RecettePlan[] = [];
  let caloriesRestantes = objectif.calories;

  // Ordre de sélection (on garde le dîner pour la fin afin de corriger le tir)
  const ordreMoments: ('petit_dejeuner' | 'dejeuner' | 'collation' | 'diner')[] = [
    'petit_dejeuner',
    'dejeuner',
    'collation',
    'diner',
  ];

  for (const moment of ordreMoments) {
    // Filtrer les recettes correspondant au moment (ex: que les petits-déj)
    const recettesMoment = recettesDisponibles.filter((r) => r.moment === moment);

    if (recettesMoment.length === 0) continue;

    // Calcul de la cible calorique pour ce repas précis
    let cibleRepas = objectif.calories * REPARTITION[moment];

    // Si on est au dernier repas (dîner), la cible devient TOUT ce qu'il reste
    if (moment === 'diner') {
      cibleRepas = caloriesRestantes;
    }

    // Trouver la recette la plus proche de la cible (Choix Glouton)
    let meilleureRecette = recettesMoment[0];
    let differenceMin = Math.abs(meilleureRecette.calories - cibleRepas);

    for (const recette of recettesMoment) {
      const diff = Math.abs(recette.calories - cibleRepas);
      // On introduit un tout petit peu d'aléatoire pour ne pas toujours manger la même chose
      // Si la recette est presque aussi bonne (+/- 20 kcal), on a 50% de chance de la prendre
      if (diff < differenceMin || (Math.abs(diff - differenceMin) < 20 && Math.random() > 0.5)) {
        meilleureRecette = recette;
        differenceMin = diff;
      }
    }

    repasChoisis.push(meilleureRecette);
    caloriesRestantes -= meilleureRecette.calories;
  }

  // Calcul du bilan final
  const totalCalories = repasChoisis.reduce((acc, r) => acc + r.calories, 0);
  const ecartPourcentage = Math.abs((totalCalories - objectif.calories) / objectif.calories) * 100;

  return {
    repas: repasChoisis,
    totalCalories,
    ecartPourcentage,
  };
}