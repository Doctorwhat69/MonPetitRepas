export interface Aliment {
  id: string;
  nom: string;
  marque?: string;
  image_url?: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  nutriscore: string;
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