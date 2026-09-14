import React, { useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useMyMeals, useAddMealToJournal, RepasFavori } from '../hooks/useMeals';

interface Props {
  visible: boolean;
  moment: 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation' | null;
  dateString: string;
  onClose: () => void;
}

export default function SelectMealModal({ visible, moment, dateString, onClose }: Props) {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const { data: myMeals = [], isLoading } = useMyMeals();
  const addMealMutation = useAddMealToJournal();

  const handleSelectMeal = (meal: RepasFavori) => {
    if (!moment) return;

    addMealMutation.mutate(
      { meal, date: dateString, moment },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          const errMsg = err.message || "Erreur lors de l'ajout de la recette";
          if (Platform.OS === 'web') {
            window.alert(errMsg);
          } else {
            Alert.alert('Erreur', errMsg);
          }
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <Text style={globalStyles.title}>Ajouter une recette</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={myMeals}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={[globalStyles.card, { alignItems: 'center', paddingVertical: 20 }]}>
                <Ionicons name="bookmark-outline" size={32} color={theme.primary} style={{ marginBottom: 8 }} />
                <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 4 }}>
                  Aucune recette enregistrée
                </Text>

                <Text style={{ color: theme.textSecondary, textAlign: 'center', fontSize: 13 }}>
                  Pour créer une recette, ajoute ses aliments dans un repas de ton journal, puis clique sur le bouton « Sauvegarder ».
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[globalStyles.card, { marginBottom: 12 }]}
                onPress={() => handleSelectMeal(item)}
                disabled={addMealMutation.isPending}
              >
                <View style={styles.rowBetween}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>{item.nom}</Text>
                  <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
                    {Math.round(item.total_calories)} kcal
                  </Text>
                </View>

                {item.description ? (
                  <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>
                    {item.description}
                  </Text>
                ) : null}

                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8 }}>
                  P : {Math.round(item.total_proteines)}g | G : {Math.round(item.total_glucides)}g | L : {Math.round(item.total_lipides)}g
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeBtn: {
    padding: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});