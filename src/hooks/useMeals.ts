import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { genererJourneeGlouton, RecettePlan } from '../utils/mealPlanner';
import { useProfile } from './useProfile';

export interface RepasFavori {
  id: string;
  user_id: string;
  nom: string;
  description?: string;
  auteur_nom?: string;
  is_public: boolean;
  moment_cible?: 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation' | string;
  
  // NOUVEAUX CHAMPS FIGMA
  image_url?: string;
  temps_prep?: number;
  tags?: string[];
  
  items: Array<{
    aliment_nom: string;
    quantite: number;
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

      const repasGroupeId = crypto.randomUUID();

      const entries = meal.items.map((item: any) => ({
        user_id: user.id,
        date_consommation: date,
        moment,
        aliment_nom: item.aliment_nom,
        quantite: Number(item.quantite || item.quantite_g || 100),
        calories: Number(item.calories || 0),
        proteines: Number(item.proteines || 0),
        glucides: Number(item.glucides || 0),
        lipides: Number(item.lipides || 0),
        repas_groupe_id: repasGroupeId,
        repas_nom: meal.nom,
        portion_factor: 1.0,
      }));

      const { error } = await supabase.from('journal_consommations').insert(entries);
      if (error) {
        console.error('Erreur Supabase lors de l\'ajout du repas :', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date] });
    },
  });
}

// 4. Sauvegarder un ensemble d'aliments comme Repas Favori
export function useSaveMealAsFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nom,
      description,
      is_public,
      items,
      moment_cible,
    }: {
      nom: string;
      description?: string;
      is_public: boolean;
      items: Array<any>;
      moment_cible?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const cleanedItems = items.map((i) => ({
        aliment_nom: i.aliment_nom,
        quantite: Number(i.quantite || i.quantite_g || 100),
        calories: Number(i.calories || 0),
        proteines: Number(i.proteines || 0),
        glucides: Number(i.glucides || 0),
        lipides: Number(i.lipides || 0),
      }));

      const total_calories = cleanedItems.reduce((acc, i) => acc + i.calories, 0);
      const total_proteines = cleanedItems.reduce((acc, i) => acc + i.proteines, 0);
      const total_glucides = cleanedItems.reduce((acc, i) => acc + i.glucides, 0);
      const total_lipides = cleanedItems.reduce((acc, i) => acc + i.lipides, 0);

      const { data: repasCreated, error } = await supabase
        .from('repas_favoris')
        .insert({
          user_id: user.id,
          nom,
          description,
          is_public,
          moment_cible,
          items: cleanedItems,
          total_calories,
          total_proteines,
          total_glucides,
          total_lipides,
          auteur_nom: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonyme',
        })
        .select()
        .single();

      if (error) throw error;

      // Insertion dans la table relationnelle repas_favoris_aliments pour l'algorithme glouton
      if (repasCreated && cleanedItems.length > 0) {
        const alimentsEntries = cleanedItems.map((item) => ({
          repas_favori_id: repasCreated.id,
          aliment_nom: item.aliment_nom,
          quantite: item.quantite,
          calories: item.calories,
          proteines: item.proteines,
          glucides: item.glucides,
          lipides: item.lipides,
        }));

        await supabase.from('repas_favoris_aliments').insert(alimentsEntries);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMeals'] });
      queryClient.invalidateQueries({ queryKey: ['communityMeals'] });
    },
  });
}

// 5. Supprimer une recette favorie
export function useDeleteMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('repas_favoris').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMeals'] });
      queryClient.invalidateQueries({ queryKey: ['communityMeals'] });
    },
  });
}

// 6. Générer automatiquement le menu de la semaine
export function useGenererSemaine() {
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  return useMutation({
    mutationFn: async ({ mondayDate }: { mondayDate: Date }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');
      if (!profile) throw new Error('Profil introuvable');

      const { data: repasData, error: repasErr } = await supabase
        .from('repas_favoris')
        .select(`
          id,
          nom,
          moment_cible,
          repas_favoris_aliments (
            aliment_nom,
            quantite,
            calories,
            proteines,
            glucides,
            lipides
          )
        `)
        .eq('user_id', user.id);

      if (repasErr) throw repasErr;

      const recettesDisponibles: RecettePlan[] = (repasData || []).map((r) => {
        const items = r.repas_favoris_aliments || [];
        return {
          id: r.id,
          nom: r.nom,
          moment: r.moment_cible || 'diner',
          calories: items.reduce((acc: number, item: any) => acc + Number(item.calories || 0), 0),
          proteines: items.reduce((acc: number, item: any) => acc + Number(item.proteines || 0), 0),
          glucides: items.reduce((acc: number, item: any) => acc + Number(item.glucides || 0), 0),
          lipides: items.reduce((acc: number, item: any) => acc + Number(item.lipides || 0), 0),
          items: items,
        };
      });

      if (recettesDisponibles.length < 4) {
        throw new Error("Pas assez de repas favoris pour générer une semaine. Sauvegardez au moins un Petit-déjeuner, un Déjeuner et un Dîner.");
      }

      const objectif = {
        calories: profile.calories_cible || 2000,
        proteines: profile.proteines_cible || 140,
        glucides: profile.glucides_cible || 200,
        lipides: profile.lipides_cible || 65,
      };

      const planningSemaine = [];
      const datesToInvalidate: string[] = [];

      for (let i = 0; i < 7; i++) {
        const dateJour = new Date(mondayDate);
        dateJour.setDate(mondayDate.getDate() + i);
        const dateStr = dateJour.toISOString().split('T')[0];
        datesToInvalidate.push(dateStr);

        const journeeGeneree = genererJourneeGlouton(objectif, recettesDisponibles);

        for (const recette of journeeGeneree.repas) {
          const repasGroupeId = crypto.randomUUID();

          const entries = recette.items.map((item) => ({
            user_id: user.id,
            date_consommation: dateStr,
            moment: recette.moment,
            aliment_nom: item.aliment_nom,
            quantite: item.quantite,
            calories: item.calories,
            proteines: item.proteines,
            glucides: item.glucides,
            lipides: item.lipides,
            repas_groupe_id: repasGroupeId,
            repas_nom: recette.nom,
            portion_factor: 1.0,
          }));

          planningSemaine.push(...entries);
        }
      }

      const startStr = datesToInvalidate[0];
      const endStr = datesToInvalidate[6];

      const { error: deleteErr } = await supabase
        .from('journal_consommations')
        .delete()
        .eq('user_id', user.id)
        .gte('date_consommation', startStr)
        .lte('date_consommation', endStr);

      if (deleteErr) throw deleteErr;

      const { error: insertErr } = await supabase
        .from('journal_consommations')
        .insert(planningSemaine);

      if (insertErr) throw insertErr;

      return datesToInvalidate;
    },
    onSuccess: (datesToInvalidate) => {
      datesToInvalidate.forEach((dateStr) => {
        queryClient.invalidateQueries({ queryKey: ['journal', dateStr] });
      });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}