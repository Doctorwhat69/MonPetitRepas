import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useSupprimerGroupeConsommation, useModifierPortionGroupe } from '../hooks/useJournal';

interface Props {
  repasGroupeId: string;
  nom: string;
  items: any[];
  dateString: string;
  onEditItem: (item: any) => void;
}

const PORTIONS = [0.5, 1, 1.5, 2];

export default function MealGroupCard({ repasGroupeId, nom, items, dateString, onEditItem }: Props) {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const [expanded, setExpanded] = useState(false);

  const supprimerGroupeMutation = useSupprimerGroupeConsommation();
  const modifierPortionMutation = useModifierPortionGroupe();

  const portionActuelle = Number(items[0]?.portion_factor || 1.0);

  // Totaux du groupe
  const totalCalories = items.reduce((acc, i) => acc + Number(i.calories || 0), 0);
  const totalProteines = items.reduce((acc, i) => acc + Number(i.proteines || 0), 0);
  const totalGlucides = items.reduce((acc, i) => acc + Number(i.glucides || 0), 0);
  const totalLipides = items.reduce((acc, i) => acc + Number(i.lipides || 0), 0);

  const handleSupprimerGroupe = () => {
    const msg = `Voulez-vous retirer le plat « ${nom} » et tous ses ingrédients ?`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        supprimerGroupeMutation.mutate({ repasGroupeId, date: dateString });
      }
    } else {
      Alert.alert('Supprimer le plat', msg, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => supprimerGroupeMutation.mutate({ repasGroupeId, date: dateString }),
        },
      ]);
    }
  };

  const handleChangerPortion = (nouvellePortion: number) => {
    if (nouvellePortion === portionActuelle) return;
    modifierPortionMutation.mutate({
      repasGroupeId,
      date: dateString,
      nouveauFacteur: nouvellePortion,
      ancienFacteur: portionActuelle,
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.primary }]}>
      {/* En-tête de la sous-carte */}
      <View style={styles.header}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setExpanded(!expanded)}>
          <View style={styles.titleRow}>
            <Ionicons name={expanded ? 'chevron-down' : 'chevron-forward'} size={18} color={theme.primary} />
            <Text style={[styles.nomRepas, { color: theme.text }]}>{nom}</Text>
          </View>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2, marginLeft: 22 }}>
            P: {Math.round(totalProteines)}g | G: {Math.round(totalGlucides)}g | L: {Math.round(totalLipides)}g
          </Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={globalStyles.caloriesText}>{Math.round(totalCalories)} kcal</Text>
          <TouchableOpacity onPress={handleSupprimerGroupe} style={{ marginTop: 4 }}>
            <Ionicons name="trash-outline" size={16} color="#E53935" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sélecteur de portions rapides */}
      <View style={[styles.portionsContainer, { borderTopColor: theme.border }]}>
        <Text style={{ color: theme.textSecondary, fontSize: 11, marginRight: 6 }}>Portion :</Text>
        {PORTIONS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.portionChip,
              { borderColor: theme.border },
              portionActuelle === p && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => handleChangerPortion(p)}
          >
            <Text
              style={[
                styles.portionText,
                { color: portionActuelle === p ? '#FFF' : theme.textSecondary },
              ]}
            >
              x{p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Accordéon : Ingrédients détaillés */}
      {expanded && (
        <View style={[styles.ingredientsList, { borderTopColor: theme.border }]}>
          {items.map((aliment) => (
            <TouchableOpacity
              key={aliment.id}
              style={[styles.ingredientRow, { borderBottomColor: theme.border }]}
              onPress={() => onEditItem(aliment)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontSize: 13, fontWeight: '500' }}>{aliment.aliment_nom}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                  {aliment.quantite}g | P: {aliment.proteines}g G: {aliment.glucides}g L: {aliment.lipides}g
                </Text>
              </View>
              <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
                {aliment.calories} kcal
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nomRepas: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  portionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  portionChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  portionText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  ingredientsList: {
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 1,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
});