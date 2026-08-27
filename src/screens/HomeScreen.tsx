import React, { useContext } from 'react';
import { StyleSheet, Text, View, FlatList, Button, TouchableOpacity } from 'react-native';
import { MealContext } from '../context/MealContext';
import { calculerTotauxRepas, calculerValeursPortion, calculerNutriscoreMoyen } from '../utils/nutrition';
import NutriScoreBadge from '../components/NutriScoreBadge';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { portions, removePortion } = useContext(MealContext);

  // Calcul dynamique des totaux du repas
  const totaux = calculerTotauxRepas(portions);
const nutriScoreGlobal = calculerNutriscoreMoyen(portions);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Repas</Text>
        <Button title="+ Ajouter" onPress={() => navigation.navigate('Search')} />
      </View>

      {/* Résumé nutritionnel du repas */}
      <View style={styles.summaryCard}>
     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
       <Text style={styles.summaryTitle}>Bilan Nutritionnel</Text>
       <NutriScoreBadge score={nutriScoreGlobal} />
     </View>
     <Text style={styles.caloriesText}>{totaux.calories} kcal</Text>
     <View style={styles.macrosRow}>
       <Text style={styles.macro}>Prot : {totaux.proteines} g</Text>
       <Text style={styles.macro}>Gluc : {totaux.glucides} g</Text>
       <Text style={styles.macro}>Lip : {totaux.lipides} g</Text>
     </View>
   </View>

      {/* Liste des aliments du repas */}
      <Text style={styles.subtitle}>Aliments ajoutés ({portions.length})</Text>
      
      <FlatList
        data={portions}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          const vals = calculerValeursPortion(item.aliment, item.quantiteEnGrams);
          return (
            <View style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.aliment.nom} ({item.quantiteEnGrams} g)
                </Text>
                <Text style={styles.itemDetails}>
                  {vals.calories} kcal | P: {vals.proteines}g | G: {vals.glucides}g | L: {vals.lipides}g
                </Text>
              </View>
              <TouchableOpacity onPress={() => removePortion(index)}>
                <Text style={styles.deleteButton}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aucun aliment dans ce repas. Clique sur "+ Ajouter" pour commencer.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  summaryCard: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, marginBottom: 20 },
  summaryTitle: { color: '#fff', fontSize: 14, opacity: 0.9 },
  caloriesText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginVertical: 4 },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  macro: { color: '#fff', fontSize: 13, fontWeight: '500' },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  itemCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600' },
  itemDetails: { fontSize: 12, color: '#666', marginTop: 2 },
  deleteButton: { color: '#d32f2f', fontWeight: 'bold', marginLeft: 10 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 30 },
});