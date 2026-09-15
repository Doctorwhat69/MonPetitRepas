import React, { useState, useContext } from 'react';
import { Platform, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import ProfileModal from '../components/ProfileModal';
import SearchFoodModal from '../components/SearchFoodModal';
import SaveMealModal from '../components/SaveMealModal';
import SelectMealModal from '../components/SelectMealModal';
import EditQuantityModal from '../components/EditQuantityModal';
import MealGroupCard from '../components/MealGroupCard';
import WeeklyCalendar from '../components/WeeklyCalendar';
import ProgressBar from '../components/ProgressBar';
import { useJournal, useSupprimerConsommation } from '../hooks/useJournal';
import { useProfile } from '../hooks/useProfile';

// Conversion locale YYYY-MM-DD sans décalage UTC
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SECTIONS = [
  { key: 'petit_dejeuner', titre: '🌅 Petit-déjeuner', label: 'Petit-déjeuner' },
  { key: 'dejeuner', titre: '☀️ Déjeuner', label: 'Déjeuner' },
  { key: 'collation', titre: '🍎 Collations', label: 'Collation' },
  { key: 'diner', titre: '🌙 Dîner', label: 'Dîner' },
];

export default function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = getGlobalStyles(theme);

  // États de l'interface
  const [dateJournal, setDateJournal] = useState(new Date());
  const [profileVisible, setProfileVisible] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<
    'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation' | null
  >(null);
  const [selectedMomentForRecipe, setSelectedMomentForRecipe] = useState<
    'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation' | null
  >(null);
  const [selectedMealForSave, setSelectedMealForSave] = useState<{
    momentLabel: string;
    items: any[];
  } | null>(null);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<any | null>(null);

  const dateString = formatLocalDate(dateJournal);

  // Hooks React Query
  const { profile } = useProfile();
  const { data: journal = [], isLoading } = useJournal(dateString);
  const supprimerMutation = useSupprimerConsommation();

  // Détection date future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateNormalized = new Date(dateJournal);
  selectedDateNormalized.setHours(0, 0, 0, 0);
  const isFuture = selectedDateNormalized > today;

  // Objectifs dynamiques (issues du profil Supabase)
  const objectifs = {
    calories: profile?.calories_cible || 2000,
    proteines: profile?.proteines_cible || 140,
    glucides: profile?.glucides_cible || 200,
    lipides: profile?.lipides_cible || 65,
  };

  // Calculs des totaux
  const categoriserJournal = (moment: string) => journal.filter((item) => item.moment === moment);
  const totalCalories = journal.reduce((acc, item) => acc + Number(item.calories || 0), 0);
  const totalProteines = journal.reduce((acc, item) => acc + Number(item.proteines || 0), 0);
  const totalGlucides = journal.reduce((acc, item) => acc + Number(item.glucides || 0), 0);
  const totalLipides = journal.reduce((acc, item) => acc + Number(item.lipides || 0), 0);

  const supprimerElement = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous retirer cet aliment de votre journal ?')) {
        supprimerMutation.mutate({ id, date: dateString });
      }
    } else {
      Alert.alert('Supprimer', 'Voulez-vous retirer cet aliment de votre journal ?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => supprimerMutation.mutate({ id, date: dateString }),
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>{isFuture ? 'Planification' : 'Mon Journal'}</Text>
        <TouchableOpacity onPress={() => setProfileVisible(true)} style={styles.chip}>
          <Text style={styles.chipText}>Profil</Text>
        </TouchableOpacity>
      </View>

      <WeeklyCalendar currentDate={dateJournal} onChangeDate={setDateJournal} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Bilan du jour */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bilan de la journée</Text>

          <View style={{ marginVertical: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.primary }}>
              {Math.round(totalCalories)}{' '}
              <Text style={{ fontSize: 16, color: theme.textSecondary }}>/ {objectifs.calories} kcal</Text>
            </Text>
          </View>

          <ProgressBar label="Protéines" actuel={totalProteines} objectif={objectifs.proteines} couleur="#E53935" />
          <ProgressBar label="Glucides" actuel={totalGlucides} objectif={objectifs.glucides} couleur="#FB8C00" />
          <ProgressBar label="Lipides" actuel={totalLipides} objectif={objectifs.lipides} couleur="#1E88E5" />
        </View>

        {/* Repas */}
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          SECTIONS.map((section) => {
            const alimentsDuRepas = categoriserJournal(section.key);
            const calRepas = alimentsDuRepas.reduce((acc, item) => acc + Number(item.calories || 0), 0);

            return (
              <View key={section.key} style={{ marginBottom: 20 }}>
                <View style={[styles.rowBetween, { marginBottom: 10, alignItems: 'center' }]}>
                  <Text style={styles.sectionTitle}>{section.titre}</Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={styles.textSecondary}>{Math.round(calRepas)} kcal</Text>

                    {alimentsDuRepas.length > 0 && (
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedMealForSave({
                            momentLabel: section.label,
                            items: alimentsDuRepas,
                          })
                        }
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                      >
                        <Ionicons name="bookmark-outline" size={16} color={theme.primary} />
                        <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>Sauvegarder</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Structure de regroupement des aliments */}
                {(() => {
                  const groupesMap = new Map<string, { nom: string; items: any[] }>();
                  const isoles: any[] = [];

                  alimentsDuRepas.forEach((aliment) => {
                    if (aliment.repas_groupe_id) {
                      if (!groupesMap.has(aliment.repas_groupe_id)) {
                        groupesMap.set(aliment.repas_groupe_id, {
                          nom: aliment.repas_nom || 'Plat composé',
                          items: [],
                        });
                      }
                      groupesMap.get(aliment.repas_groupe_id)!.items.push(aliment);
                    } else {
                      isoles.push(aliment);
                    }
                  });

                  return (
                    <>
                      {/* Cartes de plats groupés */}
                      {Array.from(groupesMap.entries()).map(([groupeId, groupe]) => (
                        <MealGroupCard
                          key={groupeId}
                          repasGroupeId={groupeId}
                          nom={groupe.nom}
                          items={groupe.items}
                          dateString={dateString}
                          onEditItem={(aliment) => setSelectedItemForEdit(aliment)}
                        />
                      ))}

                      {/* Aliments isolés */}
                      {isoles.map((aliment) => (
                        <View key={aliment.id} style={styles.itemCard}>
                          <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={() => setSelectedItemForEdit(aliment)}
                          >
                            <View style={styles.itemInfo}>
                              <Text style={styles.itemName}>{aliment.aliment_nom}</Text>
                              <Text style={styles.itemDetails}>
                                {aliment.quantite}g | P: {aliment.proteines}g G: {aliment.glucides}g L: {aliment.lipides}g
                              </Text>
                            </View>
                          </TouchableOpacity>
                          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                            <Text style={styles.caloriesText}>{aliment.calories} kcal</Text>
                            <TouchableOpacity onPress={() => supprimerElement(aliment.id)}>
                              <Text style={styles.deleteButton}>X</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </>
                  );
                })()}

                {/* Boutons d'ajout côte à côte */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.card,
                      { flex: 1, alignItems: 'center', backgroundColor: 'transparent', borderStyle: 'dashed', marginBottom: 0 },
                    ]}
                    onPress={() => setSelectedMoment(section.key as any)}
                  >
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>+ Aliment</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.card,
                      { flex: 1, alignItems: 'center', backgroundColor: 'transparent', borderStyle: 'dashed', marginBottom: 0 },
                    ]}
                    onPress={() => setSelectedMomentForRecipe(section.key as any)}
                  >
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>+ Recette</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modales */}
      <ProfileModal visible={profileVisible} onClose={() => setProfileVisible(false)} />

      <SearchFoodModal
        visible={selectedMoment !== null}
        moment={selectedMoment}
        dateString={dateString}
        onClose={() => setSelectedMoment(null)}
      />

      <SelectMealModal
        visible={selectedMomentForRecipe !== null}
        moment={selectedMomentForRecipe}
        dateString={dateString}
        onClose={() => setSelectedMomentForRecipe(null)}
      />

      <SaveMealModal
        visible={!!selectedMealForSave}
        onClose={() => setSelectedMealForSave(null)}
        items={selectedMealForSave?.items || []}
        defaultNom={selectedMealForSave ? `Mon ${selectedMealForSave.momentLabel}` : ''}
      />

      <EditQuantityModal
        visible={!!selectedItemForEdit}
        item={selectedItemForEdit}
        dateString={dateString}
        onClose={() => setSelectedItemForEdit(null)}
      />
    </View>
  );
}