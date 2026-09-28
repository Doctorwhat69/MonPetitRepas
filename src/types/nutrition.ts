export type NutriScoreGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Aliment {
  id: number;
  nom: string;
  categorie: string;
  portion_description: string;
  portion_poids_g: number;
  calories: number;
  proteines: number;
  lipides: number;
  glucides: number;
  sucres: number;
  nutriscore: NutriScoreGrade;
}
export interface Profil {
  id?: string;
  user_id?: string;
  age: number;
  genre: 'homme' | 'femme';
  poids: number;
  taille: number;
  activite: 'sedentaire' | 'leger' | 'modere' | 'actif' | 'tres_actif';
  objectif_poids: 'perte_rapide' | 'perte_douce' | 'maintien' | 'prise_douce' | 'prise_rapide';
  objectif_calories: number;
  objectif_proteines: number;
  objectif_glucides: number;
  objectif_lipides: number;
  avatar_url?: string;
}