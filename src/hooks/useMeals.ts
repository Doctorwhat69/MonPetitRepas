import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export interface RepasFavori {
  id: string;
  user_id: string;
  nom: string;
  description?: string;
  auteur_nom?: string;
  is_public: boolean;
  items: Array<{
    aliment_nom: string;
    quantite_g: number;
    calories: number;
    proteines: number;
    glucides: number;
    lipides: number;
  }>;
  total_calories: number;
  total_proteines: number;
  total_glucides: number;
  total_lipides: number;
}

// 1. Récupérer mes repas favoris
export function useMyMeals() {
  return useQuery({
    queryKey: ['myMeals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('repas_favoris')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RepasFavori[];
    },
  });
}

// 2. Récupérer les repas de la communauté
export function useCommunityMeals() {
  return useQuery({
    queryKey: ['communityMeals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('repas_favoris')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as RepasFavori[];
    },
  });
}

// 3. Injecter tous les aliments d'un repas dans le journal du jour
export function useAddMealToJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meal, date, moment }: { meal: RepasFavori; date: string; moment: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // On prépare les lignes pour journal_consommations
      const entries = meal.items.map((item) => ({
        user_id: user.id,
        date_consommation: date,
        moment,
        aliment_nom: item.aliment_nom,
        quantite_g: item.quantite_g,
        calories: item.calories,
        proteines: item.proteines,
        glucides: item.glucides,
        lipides: item.lipides,
      }));

      const { error } = await supabase.from('journal_consommations').insert(entries);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalide le cache du journal pour recharger automatiquement le journal du jour
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date] });
    },
  });
}

export function useSaveMealAsFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nom,
      description,
      is_public,
      items,
    }: {
      nom: string;
      description?: string;
      is_public: boolean;
      items: Array<{
        aliment_nom: string;
        quantite_g: number;
        calories: number;
        proteines: number;
        glucides: number;
        lipides: number;
      }>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const total_calories = items.reduce((acc, i) => acc + Number(i.calories || 0), 0);
      const total_proteines = items.reduce((acc, i) => acc + Number(i.proteines || 0), 0);
      const total_glucides = items.reduce((acc, i) => acc + Number(i.glucides || 0), 0);
      const total_lipides = items.reduce((acc, i) => acc + Number(i.lipides || 0), 0);

      const { error } = await supabase.from('repas_favoris').insert({
        user_id: user.id,
        nom,
        description,
        is_public,
        items,
        total_calories,
        total_proteines,
        total_glucides,
        total_lipides,
        auteur_nom: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonyme',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMeals'] });
      queryClient.invalidateQueries({ queryKey: ['communityMeals'] });
    },
  });
}