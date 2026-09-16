import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Consommation } from './useJournal';

export interface BilanJour {
  date: string;
  jourNom: string;
  totalCalories: number;
  totalProteines: number;
  totalGlucides: number;
  totalLipides: number;
}

export function useStats(mondayDate: Date) {
  // Calcul de la plage Lundi -> Dimanche
  const start = new Date(mondayDate);
  const end = new Date(mondayDate);
  end.setDate(end.getDate() + 6);

  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['stats', startStr, endStr],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('journal_consommations')
        .select('*')
        .eq('user_id', user.id)
        .gte('date_consommation', startStr)
        .lte('date_consommation', endStr);

      if (error) throw error;

      const items: Consommation[] = data || [];
      const joursNoms = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const semaine: BilanJour[] = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];

        const itemsJour = items.filter((item: Consommation) => item.date_consommation === dateStr);

        semaine.push({
          date: dateStr,
          jourNom: joursNoms[i],
          totalCalories: itemsJour.reduce((acc: number, item: Consommation) => acc + Number(item.calories || 0), 0),
          totalProteines: itemsJour.reduce((acc: number, item: Consommation) => acc + Number(item.proteines || 0), 0),
          totalGlucides: itemsJour.reduce((acc: number, item: Consommation) => acc + Number(item.glucides || 0), 0),
          totalLipides: itemsJour.reduce((acc: number, item: Consommation) => acc + Number(item.lipides || 0), 0),
        });
      }

      return semaine;
    },
  });
}