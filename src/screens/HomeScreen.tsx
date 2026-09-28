import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useProfile } from '../hooks/useProfile';
import { useJournal } from '../hooks/useJournal';
import { useGenererSemaine } from '../hooks/useMeals';
import WeeklyCalendar from '../components/WeeklyCalendar';
import SearchFoodModal from '../components/SearchFoodModal';
import SelectMealModal from '../components/SelectMealModal';

type MomentType = 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation';

export default function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const { showToast } = useToast();
  const globalStyles = getGlobalStyles(theme);

  // Date sélectionnée
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateStr = selectedDate.toISOString().split('T')[0];

  // Modales d'ajout
  const [choiceMoment, setChoiceMoment] = useState<MomentType | null>(null);
  const [foodModalMoment, setFoodModalMoment] = useState<MomentType | null>(null);
  const [mealModalMoment, setMealModalMoment] = useState<MomentType | null>(null);

  // Données
  const { profile } = useProfile();
  const { data: journalEntries = [], isLoading: loadingJournal } = useJournal(dateStr);
  const genererSemaineMutation = useGenererSemaine();

  // Objectifs profil
  const targetCal = profile?.calories_cible || 2200;
  const targetProt = profile?.proteines_cible || 140;
  const targetGluc = profile?.glucides_cible || 220;
  const targetLip = profile?.lipides_cible || 75;

  // Consommations
  const currentCal = journalEntries.reduce((acc, i) => acc + Number(i.calories || 0), 0);
  const currentProt = journalEntries.reduce((acc, i) => acc + Number(i.proteines || 0), 0);
  const currentGluc = journalEntries.reduce((acc, i) => acc + Number(i.glucides || 0), 0);
  const currentLip = journalEntries.reduce((acc, i) => acc + Number(i.lipides || 0), 0);

  const pctCal = Math.min(Math.round((currentCal / targetCal) * 100), 100);

  const mealsByMoment = (['petit_dejeuner', 'dejeuner', 'collation', 'diner'] as MomentType[]).map((momentKey) => {
    const items = journalEntries.filter((i) => i.moment === momentKey);
    const totalCals = items.reduce((acc, i) => acc + Number(i.calories || 0), 0);
    const totalP = items.reduce((acc, i) => acc + Number(i.proteines || 0), 0);
    const totalG = items.reduce((acc, i) => acc + Number(i.glucides || 0), 0);
    const totalL = items.reduce((acc, i) => acc + Number(i.lipides || 0), 0);

    const labels: Record<string, { title: string; time: string }> = {
      petit_dejeuner: { title: 'PETIT-DÉJEUNER', time: '08:00' },
      dejeuner: { title: 'DÉJEUNER', time: '12:30' },
      collation: { title: 'COLLATION', time: '16:00' },
      diner: { title: 'DÎNER', time: '19:45' },
    };

    return {
      key: momentKey,
      label: labels[momentKey]?.title || momentKey.toUpperCase(),
      defaultTime: labels[momentKey]?.time || '',
      items,
      totalCals,
      totalP,
      totalG,
      totalL,
      repasNom: items[0]?.repas_nom || items[0]?.aliment_nom || 'Aucun repas enregistré',
      imageUrl: items[0]?.image_url || null,
    };
  });

  const handleGenererSemaine = () => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));

    genererSemaineMutation.mutate(
      { mondayDate: monday },
      {
        onSuccess: () => {
          showToast('Votre semaine a été générée avec succès !', 'success');
        },
        onError: (err: any) => {
          showToast(err.message || 'Erreur lors de la génération', 'error');
        },
      }
    );
  };

  const dateFormatted = selectedDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const dateHeader = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Header Utilisateur */}
      <View style={styles.topHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/100' }}
            style={styles.avatarHeader}
          />
          <View>
            <Text style={styles.greetingText}>Bonjour {profile?.prenom || 'Thomas'}</Text>
            <Text style={[styles.subDateText, { color: theme.textSecondary }]}>{dateHeader}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.iconCircle, { borderColor: theme.border }]}>
          <Ionicons name="notifications-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* 2. Calendrier Horizontal */}
      <View style={{ marginVertical: 12 }}>
        <WeeklyCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </View>

      {/* 3. Carte Objectif Journalier */}
      <View style={[globalStyles.card, { padding: 18 }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Objectif Journalier</Text>
          <View style={[styles.pctBadge, { backgroundColor: '#E8F5E9' }]}>
            <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 12 }}>{pctCal}%</Text>
          </View>
        </View>

        <Text style={[styles.calNumbers, { color: theme.text }]}>
          {Math.round(currentCal)} <Text style={{ fontSize: 16, color: theme.textSecondary }}>/ {targetCal} kcal</Text>
        </Text>

        <View style={[globalStyles.progressBackground, { height: 10, borderRadius: 5, marginVertical: 12 }]}>
          <View
            style={[
              globalStyles.progressBar,
              { width: `${pctCal}%`, backgroundColor: theme.primary, borderRadius: 5 },
            ]}
          />
        </View>

        <View style={styles.macrosWrap}>
          <View style={styles.macroTag}>
            <View style={[styles.dot, { backgroundColor: theme.protein }]} />
            <Text style={[styles.macroTagText, { color: theme.textSecondary }]}>
              <Text style={{ fontWeight: 'bold', color: theme.text }}>{Math.round(currentProt)}</Text>/{targetProt}g Prot
            </Text>
          </View>

          <View style={styles.macroTag}>
            <View style={[styles.dot, { backgroundColor: theme.carbs }]} />
            <Text style={[styles.macroTagText, { color: theme.textSecondary }]}>
              <Text style={{ fontWeight: 'bold', color: theme.text }}>{Math.round(currentGluc)}</Text>/{targetGluc}g Gluc
            </Text>
          </View>

          <View style={styles.macroTag}>
            <View style={[styles.dot, { backgroundColor: theme.fat }]} />
            <Text style={[styles.macroTagText, { color: theme.textSecondary }]}>
              <Text style={{ fontWeight: 'bold', color: theme.text }}>{Math.round(currentLip)}</Text>/{targetLip}g Lip
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Bannière "Générer ma semaine" */}
      <TouchableOpacity
        style={[styles.genererBanner, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={handleGenererSemaine}
        disabled={genererSemaineMutation.isPending}
      >
        <View style={[styles.wandCircle, { backgroundColor: '#E8F5E9' }]}>
          {genererSemaineMutation.isPending ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Ionicons name="sparkles" size={20} color={theme.primary} />
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.bannerTitle, { color: theme.text }]}>Générer ma semaine</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
            Créez instantanément vos repas équilibrés adaptés à vos objectifs.
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* 5. Section Repas d'aujourd'hui */}
      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>Repas d'aujourd'hui</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 14 }}>
          Suivez vos apports repas par repas
        </Text>

        {loadingJournal ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
        ) : (
          mealsByMoment.map((m) => (
            <View key={m.key} style={[styles.repasCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {m.imageUrl ? (
                <Image source={{ uri: m.imageUrl }} style={styles.mealThumb} />
              ) : (
                <View style={[styles.mealThumb, styles.placeholderThumb, { backgroundColor: theme.border }]}>
                  <Ionicons name="restaurant-outline" size={22} color={theme.textSecondary} />
                </View>
              )}

              <View style={{ flex: 1, paddingLeft: 12 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.momentBadgeText}>{m.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 11, color: theme.textSecondary }}>{m.defaultTime}</Text>

                    {/* Clique sur + ouvre la modale de choix */}
                    <TouchableOpacity
                      style={[styles.quickAddBtn, { backgroundColor: theme.primary + '18' }]}
                      onPress={() => setChoiceMoment(m.key)}
                    >
                      <Ionicons name="add" size={16} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.mealTitle, { color: theme.text }]} numberOfLines={1}>
                  {m.repasNom}
                </Text>

                <Text style={[styles.mealSubText, { color: theme.textSecondary }]}>
                  <Text style={{ fontWeight: 'bold', color: theme.text }}>{Math.round(m.totalCals)} kcal</Text>
                  {'  '}•{'  '}P: {Math.round(m.totalP)}g{' '}
                  <Text style={{ color: theme.carbs }}>G: {Math.round(m.totalG)}g</Text>{' '}
                  <Text style={{ color: theme.fat }}>L: {Math.round(m.totalL)}g</Text>
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* --- MODALE DE CHOIX (Aliment vs Recette) --- */}
      <Modal visible={choiceMoment !== null} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.choiceOverlay}
          activeOpacity={1}
          onPress={() => setChoiceMoment(null)}
        >
          <View style={[styles.choiceContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.choiceTitle, { color: theme.text }]}>Que souhaitez-vous ajouter ?</Text>

            <TouchableOpacity
              style={[styles.choiceOption, { borderColor: theme.border, backgroundColor: theme.background }]}
              onPress={() => {
                const mom = choiceMoment;
                setChoiceMoment(null);
                setFoodModalMoment(mom);
              }}
            >
              <View style={[styles.choiceIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="nutrition-outline" size={22} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 14 }}>Un aliment seul</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Rechercher un ingrédient brut ou produit</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceOption, { borderColor: theme.border, backgroundColor: theme.background }]}
              onPress={() => {
                const mom = choiceMoment;
                setChoiceMoment(null);
                setMealModalMoment(mom);
              }}
            >
              <View style={[styles.choiceIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="restaurant-outline" size={22} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 14 }}>Une recette / Un repas complet</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Choisir parmi mes recettes enregistrées</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modale recherche d'aliment seul */}
      <SearchFoodModal
        visible={foodModalMoment !== null}
        moment={foodModalMoment}
        dateString={dateStr}
        onClose={() => setFoodModalMoment(null)}
      />

      {/* Modale de sélection d'une recette complète */}
      <SelectMealModal
        visible={mealModalMoment !== null}
        moment={mealModalMoment}
        dateString={dateStr}
        onClose={() => setMealModalMoment(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subDateText: {
    fontSize: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  calNumbers: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 6,
  },
  macrosWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  macroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroTagText: {
    fontSize: 11,
  },
  genererBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  wandCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  repasCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  mealThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
  },
  placeholderThumb: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  momentBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  mealSubText: {
    fontSize: 11,
  },
  quickAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  choiceContainer: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  choiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  choiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  choiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});