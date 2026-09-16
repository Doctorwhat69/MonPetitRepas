import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { useGenererSemaine } from '../hooks/useMeals';

interface Props {
  currentDate: Date;
  onChangeDate: (date: Date) => void;
}

export default function WeeklyCalendar({ currentDate, onChangeDate }: Props) {
  const { theme } = useContext(ThemeContext);
  const genererMutation = useGenererSemaine();

  // Helper pour trouver le Lundi de la semaine de la date sélectionnée
  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const monday = getMonday(currentDate);

  // Génération des 7 jours fixes (Lundi à Dimanche)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const today = new Date();

  // Navigation de semaine (-7 jours / +7 jours)
  const changeWeek = (offsetDays: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offsetDays);
    onChangeDate(newDate);
  };

  const handlePlanifierSemaine = () => {
    const msg = 'Voulez-vous générer un menu pour toute cette semaine ? (Cela remplacera vos repas actuels sur ces 7 jours)';
    
    const executerGeneration = () => {
      genererMutation.mutate(
        { mondayDate: monday },
        {
          onError: (error: any) => {
            if (Platform.OS === 'web') {
              alert(error.message);
            } else {
              Alert.alert('Impossible de générer', error.message);
            }
          }
        }
      );
    };

    if (Platform.OS === 'web') {
      if (window.confirm(msg)) executerGeneration();
    } else {
      Alert.alert('Planifier la semaine', msg, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Générer', style: 'default', onPress: executerGeneration },
      ]);
    }
  };

  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];
  const joursNoms = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthLabel = `${moisNoms[monday.getMonth()]} ${monday.getFullYear()}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* En-tête : Mois/Année + Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeWeek(-7)} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onChangeDate(new Date())}>
          <Text style={[styles.monthText, { color: theme.text }]}>{monthLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changeWeek(7)} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Grille Lundi - Dimanche */}
      <View style={styles.daysRow}>
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, currentDate);
          const isToday = isSameDay(day, today);

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[
                styles.dayCard,
                isSelected && { backgroundColor: theme.primary },
                !isSelected && isToday && { borderWidth: 1, borderColor: theme.primary },
              ]}
              onPress={() => onChangeDate(day)}
            >
              <Text style={[styles.dayName, { color: isSelected ? '#FFF' : theme.textSecondary }]}>
                {joursNoms[index]}
              </Text>
              <Text style={[styles.dayNumber, { color: isSelected ? '#FFF' : theme.text }]}>
                {day.getDate()}
              </Text>
              <View style={[styles.dot, { backgroundColor: isSelected ? '#FFF' : 'transparent' }]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bandeau de génération magique */}
      <TouchableOpacity
        style={[styles.generateBtn, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
        onPress={handlePlanifierSemaine}
        disabled={genererMutation.isPending}
      >
        {genererMutation.isPending ? (
          <ActivityIndicator color={theme.primary} size="small" />
        ) : (
          <>
            <Ionicons name="color-wand-outline" size={18} color={theme.primary} />
            <Text style={[styles.generateText, { color: theme.primary }]}>
              Planifier cette semaine
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navBtn: { padding: 4 },
  monthText: { fontSize: 15, fontWeight: 'bold' },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  dayName: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  dayNumber: { fontSize: 14, fontWeight: 'bold' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },
  
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  generateText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});