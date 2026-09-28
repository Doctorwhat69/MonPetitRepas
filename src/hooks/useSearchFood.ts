import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Aliment } from '../types/nutrition';

export function useSearchFood(searchQuery: string) {
  return useQuery<Aliment[]>({
    queryKey: ['aliments', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data, error } = await supabase
        .from('aliments')
        .select('*')
        .ilike('nom', `%${searchQuery.trim()}%`)
        .limit(20);

      if (error) throw error;
      return data as Aliment[];
    },
    enabled: searchQuery.trim().length >= 2,
  });
}