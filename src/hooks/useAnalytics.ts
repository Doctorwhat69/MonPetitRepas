import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export interface DailyStat {
  date: string;
  label: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: ['weeklyStats'],
    queryFn: async () => {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);

      const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startDate = formatDate(sevenDaysAgo);
      const endDate = formatDate(today);

      const { data, error } = await supabase
        .from('journal_consommations')
        .select('date_consommation, calories, proteines, glucides, lipides')
        .gte('date_consommation', startDate)
        .lte('date_consommation', endDate);

      if (error) throw error;

      // Initialisation des 7 jours à 0
      const statsMap: Record<string, DailyStat> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);
        const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short' });

        statsMap[dateStr] = {
          date: dateStr,
          label: dayLabel.toUpperCase(),
          calories: 0,
          proteines: 0,
          glucides: 0,
          lipides: 0,
        };
      }

      // Cumul des données
      (data || []).forEach((row) => {
        const dateKey = row.date_consommation;
        if (statsMap[dateKey]) {
          statsMap[dateKey].calories += Number(row.calories || 0);
          statsMap[dateKey].proteines += Number(row.proteines || 0);
          statsMap[dateKey].glucides += Number(row.glucides || 0);
          statsMap[dateKey].lipides += Number(row.lipides || 0);
        }
      });

      return Object.values(statsMap);
    },
  });
}