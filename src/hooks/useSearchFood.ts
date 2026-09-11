import { useQuery } from '@tanstack/react-query';
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

export function useSearchFood(query: string) {
  return useQuery({
    queryKey: ['searchFood', query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) return [];

      const cleanQuery = query.trim();

      // 1. Recherche dans la base CIQUAL
      const ciqualPromise = supabase
        .from('aliments_ciqual')
        .select('id, nom, calories, proteines, glucides, lipides')
        .ilike('nom', `%${cleanQuery}%`)
        .limit(15);

      // 2. Recherche dans la table personnalisée
      const customPromise = supabase
        .from('aliments_custom')
        .select('id, nom, calories, proteines, glucides, lipides')
        .ilike('nom', `%${cleanQuery}%`)
        .limit(10);

      const [ciqualRes, customRes] = await Promise.all([ciqualPromise, customPromise]);

      if (ciqualRes.error) throw ciqualRes.error;
      if (customRes.error) throw customRes.error;

      const customItems: AlimentItem[] = (customRes.data || []).map((item) => ({
        ...item,
        isCustom: true,
      }));

      const ciqualItems: AlimentItem[] = (ciqualRes.data || []).map((item) => ({
        ...item,
        isCustom: false,
      }));

      // Les aliments personnalisés apparaissent en premier
      return [...customItems, ...ciqualItems];
    },
    enabled: query.trim().length >= 2,
  });
}