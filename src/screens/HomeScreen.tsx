import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import ProfileModal from '../components/ProfileModal';
import SearchFoodModal from '../components/SearchFoodModal';
import { useJournal, useSupprimerConsommation } from '../hooks/useJournal';
import WeeklyCalendar from '../components/WeeklyCalendar';

// Helper pour éviter le décalage UTC
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SECTIONS = [
  { key: 'petit_dejeuner', titre: '🌅 Petit-déjeuner' },
  { key: 'dejeuner', titre: '☀️ Déjeuner' },
  { key: 'collation', titre: '🍎 Collations' },
  { key: 'diner', titre: '🌙 Dîner' },
];

export default function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = getGlobalStyles(theme);

  const [dateJournal, setDateJournal] = useState(new Date());
  const [profileVisible, setProfileVisible] = useState(false);

  const [selectedMoment, setSelectedMoment] = useState<
  'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation' | null
>(null);

  // Format YYYY-MM-DD local
  const dateString = formatLocalDate(dateJournal);

  const { data: journal = [], isLoading } = useJournal(dateString);
  const supprimerMutation = useSupprimerConsommation();

  // Comparaison de la date sans l'heure
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateNormalized = new Date(dateJournal);
  selectedDateNormalized.setHours(0, 0, 0, 0);
  const isFuture = selectedDateNormalized > today;

  const categoriserJournal = (moment: string) => {
    return journal.filter((item) => item.moment === moment);
  };

  const totalCalories = journal.reduce((acc, item) => acc + Number(item.calories), 0);
  
// fonction pour supprimer les elements 
  const supprimerElement = (id: string) => {
  console.log("Tentative de suppression, ID:", id, "Date:", dateString);
  
  Alert.alert('Supprimer', 'Voulez-vous retirer cet aliment de votre journal ?', [
    { text: 'Annuler', style: 'cancel' },
    {
      text: 'Supprimer',
      style: 'destructive',
      onPress: () => supprimerMutation.mutate({ id, date: dateString }),
    },
  ]);
};

  return (
    <View style={styles.container}>
      {/* En-tête avec profil */}
      <View style={styles.header}>
        <Text style={styles.title}>{isFuture ? 'Planification' : 'Mon Journal'}</Text>
        <TouchableOpacity onPress={() => setProfileVisible(true)} style={styles.chip}>
          <Text style={styles.chipText}>Profil</Text>
        </TouchableOpacity>
      </View>

      <WeeklyCalendar currentDate={dateJournal} onChangeDate={setDateJournal} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Résumé de la journée */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Calories consommées</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF' }}>
            {Math.round(totalCalories)} kcal
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          SECTIONS.map((section) => {
            const alimentsDuRepas = categoriserJournal(section.key);
            const calRepas = alimentsDuRepas.reduce((acc, item) => acc + Number(item.calories), 0);

            return (
              <View key={section.key} style={{ marginBottom: 20 }}>
                {/* En-tête de section */}
                <View style={[styles.rowBetween, { marginBottom: 10 }]}>
                  <Text style={styles.sectionTitle}>{section.titre}</Text>
                  <Text style={styles.textSecondary}>{Math.round(calRepas)} kcal</Text>
                </View>

                {/* Liste des aliments mangés à ce repas */}
                {alimentsDuRepas.map((aliment) => (
                  <View key={aliment.id} style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{aliment.aliment_nom}</Text>
                      <Text style={styles.itemDetails}>
                        {aliment.quantite}g | P: {aliment.proteines}g G: {aliment.glucides}g L: {aliment.lipides}g
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.caloriesText}>{aliment.calories} kcal</Text>
                      <TouchableOpacity onPress={() => supprimerElement(aliment.id)}>
                        <Text style={styles.deleteButton}>X</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Bouton Ajouter pour ce repas */}
                <TouchableOpacity
  style={[styles.card, { alignItems: 'center', backgroundColor: 'transparent', borderStyle: 'dashed' }]}
  onPress={() => setSelectedMoment(section.key as any)}
>
  <Text style={{ color: theme.primary, fontWeight: 'bold' }}>+ Ajouter un aliment</Text>
</TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <ProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        onProfileUpdated={(cal) => console.log('Objectif mis à jour :', cal)}
      />
      <SearchFoodModal
  visible={selectedMoment !== null}
  moment={selectedMoment}
  dateString={dateString}
  onClose={() => setSelectedMoment(null)}
/>
    </View>
  );
  <SearchFoodModal
  visible={selectedMoment !== null}
  moment={selectedMoment}
  dateString={dateString}
  onClose={() => setSelectedMoment(null)}
/>
}