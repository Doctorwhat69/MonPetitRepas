import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export interface Consommation {
 id: string;
  user_id?: string;
  date_consommation: string;
  moment: 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation';
  aliment_nom: string;
  quantite: number;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  // Champs de regroupement des repas :
  repas_groupe_id?: string | null;
  repas_nom?: string | null;
  portion_factor?: number | null;
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
      const { data, error } = await supabase
        .from('journal_consommations')
        .delete()
        .eq('id', id)
        .select(); // Renvoie les lignes effectivement effacées

      if (error) {
        console.error("Erreur Supabase lors de la suppression :", error.message);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("0 ligne supprimée : vérifie la politique RLS ou le user_id de la ligne");
        throw new Error("Aucune ligne supprimée.");
      }

      return data;
    },
    onError: (error: Error) => {
      console.error("Échec de la suppression :", error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date] });
    },
  });
}

// Modifier la quantité d'une consommation
export function useModifierConsommation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      date,
      nouvelleQuantite,
      ancienneQuantite,
      calories,
      proteines,
      glucides,
      lipides,
    }: {
      id: string;
      date: string;
      nouvelleQuantite: number;
      ancienneQuantite: number;
      calories: number;
      proteines: number;
      glucides: number;
      lipides: number;
    }) => {
      const ratio = nouvelleQuantite / (ancienneQuantite || 1);

      const { error } = await supabase
        .from('journal_consommations')
        .update({
          quantite: nouvelleQuantite,
          calories: Math.round(calories * ratio),
          proteines: Number((proteines * ratio).toFixed(1)),
          glucides: Number((glucides * ratio).toFixed(1)),
          lipides: Number((lipides * ratio).toFixed(1)),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date] });
    },
  });
}

// Supprimer un groupe complet de repas
export function useSupprimerGroupeConsommation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ repasGroupeId, date }: { repasGroupeId: string; date: string }) => {
      const { error } = await supabase
        .from('journal_consommations')
        .delete()
        .eq('repas_groupe_id', repasGroupeId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date] });
    },
  });
}

// Modifier la portion globale d'un groupe de repas (ex: x1.5)
export function useModifierPortionGroupe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      repasGroupeId,
      date,
      nouveauFacteur,
      ancienFacteur,
    }: {
      repasGroupeId: string;
      date: string;
      nouveauFacteur: number;
      ancienFacteur: number;
    }) => {
      // 1. Récupérer les items du groupe
      const { data: items, error: fetchErr } = await supabase
        .from('journal_consommations')
        .select('*')
        .eq('repas_groupe_id', repasGroupeId);

      if (fetchErr) throw fetchErr;
      if (!items || items.length === 0) return;

      const ratio = nouveauFacteur / (ancienFacteur || 1);

      // 2. Mettre à jour chaque aliment avec les nouvelles valeurs
      for (const item of items) {
        const nouvelleQuantite = Math.round(Number(item.quantite) * ratio);
        const nouvellesCalories = Math.round(Number(item.calories) * ratio);
        const nouvellesProteines = Number((Number(item.proteines) * ratio).toFixed(1));
        const nouveauxGlucides = Number((Number(item.glucides) * ratio).toFixed(1));
        const nouveauxLipides = Number((Number(item.lipides) * ratio).toFixed(1));

        const { error: updateErr } = await supabase
          .from('journal_consommations')
          .update({
            quantite: nouvelleQuantite,
            calories: nouvellesCalories,
            proteines: nouvellesProteines,
            glucides: nouveauxGlucides,
            lipides: nouveauxLipides,
            portion_factor: nouveauFacteur,
          })
          .eq('id', item.id);

        if (updateErr) throw updateErr;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date] });
    },
  });
}