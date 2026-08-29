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