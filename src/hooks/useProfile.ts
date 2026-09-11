import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { ProfileData, calculerObjectifs } from '../utils/bmr';

export interface UserProfile extends ProfileData {
  id: string;
  calories_cible: number;
  proteines_cible: number;
  glucides_cible: number;
  lipides_cible: number;
}

export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Si le profil n'existe pas encore, on en crée un par défaut
      if (!data) {
        const defaultParams: ProfileData = {
          sexe: 'homme',
          age: 25,
          poids: 70,
          taille: 175,
          activite: 'modere',
          objectif: 'maintien',
        };
        const targets = calculerObjectifs(defaultParams);

        const newProfile = {
          id: user.id,
          ...defaultParams,
          ...targets,
        };

        await supabase.from('profiles').insert(newProfile);
        return newProfile as UserProfile;
      }

      return data as UserProfile;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (params: ProfileData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      const targets = calculerObjectifs(params);
      const profileToUpdate = {
        id: user.id,
        ...params,
        ...targets,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(profileToUpdate);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}