export interface Aliment {
  id: string;
  nom: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  nutriscore: 'A' | 'B' | 'C' | 'D' | 'E';
  created_at?: string;
}