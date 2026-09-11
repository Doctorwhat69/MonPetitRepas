export interface ProfileData {
  sexe: 'homme' | 'femme';
  age: number;
  poids: number; // en kg
  taille: number; // en cm
  activite: 'sedentaire' | 'leger' | 'modere' | 'actif' | 'tres_actif';
  objectif: 'perte' | 'maintien' | 'prise';
}

export function calculerObjectifs(params: ProfileData) {
  const { sexe, age, poids, taille, activite, objectif } = params;

  // 1. Métabolisme de base (BMR - Mifflin-St Jeor)
  let bmr = 10 * poids + 6.25 * taille - 5 * age;
  bmr = sexe === 'homme' ? bmr + 5 : bmr - 161;

  // 2. Facteur d'activité (TDEE)
  const facteursActivite = {
    sedentaire: 1.2,
    leger: 1.375,
    modere: 1.55,
    actif: 1.725,
    tres_actif: 1.9,
  };
  let tdee = bmr * (facteursActivite[activite] || 1.55);

  // 3. Ajustement selon l'objectif
  if (objectif === 'perte') tdee *= 0.85; // Déficit de 15%
  if (objectif === 'prise') tdee *= 1.15; // Surplus de 15%

  const caloriesCible = Math.round(tdee);

  // 4. Répartition des macronutriments
  const proteinesCible = Math.round(poids * 2); // 2g par kg
  const lipidesCible = Math.round(poids * 1); // 1g par kg

  // Le reste des calories va aux glucides (1g glucides = 4 kcal)
  const calProteines = proteinesCible * 4;
  const calLipides = lipidesCible * 9;
  const calGlucidesRestantes = caloriesCible - (calProteines + calLipides);
  const glucidesCible = Math.max(0, Math.round(calGlucidesRestantes / 4));

  return {
    calories_cible: caloriesCible,
    proteines_cible: proteinesCible,
    glucides_cible: glucidesCible,
    lipides_cible: lipidesCible,
  };
}