import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export interface Consommation {
  id: string;
  date_consommation: string;
  moment: 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation';
  aliment_nom: string;
  quantite: number;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

// Récupère les consommations pour une date précise (format YYYY-MM-DD)
export function useJournal(date: string) {
  return useQuery({
    queryKey: ['journal', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_consommations')
        .select('*')
        .eq('date_consommation', date)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as Consommation[]) || [];
    },
  });
}

// Ajoute un aliment au journal
export function useAjouterConsommation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nouvelleConsommation: Omit<Consommation, 'id'>) => {
      const { data, error } = await supabase
        .from('journal_consommations')
        .insert(nouvelleConsommation)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalide le cache pour la date concernée afin d'actualiser la vue immédiatement
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date_consommation] });
    },
  });
}

// Supprime un aliment du journal
export function useSupprimerConsommation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      // Supabase a besoin d'un ID valide, on sécurise
      if (!id) throw new Error("ID manquant pour la suppression");

      const { data, error } = await supabase
        .from('journal_consommations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erreur Supabase lors de la suppression :", error);
        throw error;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidation stricte du cache
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date] });
    },
  });
}