import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export interface AlimentItem {
  id: string;
  nom: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  isCustom?: boolean;
}

export function useSearchFood(searchQuery: string) {
  return useQuery({
    queryKey: ['searchFood', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return [];

      const queryTerm = `%${searchQuery.trim()}%`;

      // 1. Recherche dans CIQUAL
      const { data: ciqualData, error: ciqualError } = await supabase
        .from('aliments_ciqual')
        .select('id, nom, calories, proteines, glucides, lipides')
        .ilike('nom', queryTerm)
        .limit(25);

      if (ciqualError) throw ciqualError;

      // 2. Recherche dans les aliments perso de l'utilisateur
      const { data: customData, error: customError } = await supabase
        .from('aliments_custom')
        .select('id, nom, calories, proteines, glucides, lipides')
        .ilike('nom', queryTerm)
        .limit(10);

      if (customError) throw customError;

      const customResults: AlimentItem[] = (customData || []).map((item) => ({
        ...item,
        calories: Number(item.calories) || 0,
        proteines: Number(item.proteines) || 0,
        glucides: Number(item.glucides) || 0,
        lipides: Number(item.lipides) || 0,
        isCustom: true,
      }));

      const ciqualResults: AlimentItem[] = (ciqualData || []).map((item) => ({
        ...item,
        calories: Number(item.calories) || 0,
        proteines: Number(item.proteines) || 0,
        glucides: Number(item.glucides) || 0,
        lipides: Number(item.lipides) || 0,
        isCustom: false,
      }));

      // Les aliments perso remontent en premier
      return [...customResults, ...ciqualResults];
    },
    enabled: searchQuery.trim().length >= 2,
  });
}

// Mutation pour créer un nouvel aliment personnalisé
export function useCreerAlimentCustom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nouvelAliment: {
      nom: string;
      calories: number;
      proteines: number;
      glucides: number;
      lipides: number;
    }) => {
      const { data, error } = await supabase
        .from('aliments_custom')
        .insert(nouvelAliment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchFood'] });
    },
  });
}