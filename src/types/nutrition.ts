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
  objectif_calories: number;
}