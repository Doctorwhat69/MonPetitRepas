export function calculerBmrEtMacros(
  poids: number,
  taille: number,
  age: number,
  genre: 'homme' | 'femme',
  activite: string,
  objectifPoids: string
) {
  // 1. Calcul du BMR (Mifflin-St Jeor)
  const bmr = 10 * poids + 6.25 * taille - 5 * age + (genre === 'femme' ? -161 : 5);

  // 2. Facteur d'activité (TDEE)
  const facteursActivite: Record<string, number> = {
    sedentaire: 1.2,
    leger: 1.375,
    modere: 1.55,
    actif: 1.725,
    tres_actif: 1.9,
  };
  const tdee = bmr * (facteursActivite[activite] || 1.55);

  // 3. Ajustement selon l'objectif de poids
  const ajustements: Record<string, number> = {
    perte_rapide: -500,
    perte_douce: -250,
    maintien: 0,
    prise_douce: 250,
    prise_rapide: 500,
  };
  const calories = Math.max(1200, Math.round(tdee + (ajustements[objectifPoids] || 0)));

  // 4. Répartition des macronutriments : Protéines (2g/kg), Lipides (1g/kg), Reste en Glucides
  const proteines = Math.round(poids * 2);
  const lipides = Math.round(poids * 1);
  const caloriesRestantes = calories - (proteines * 4 + lipides * 9);
  const glucides = Math.max(0, Math.round(caloriesRestantes / 4));

  return { calories, proteines, glucides, lipides };
}