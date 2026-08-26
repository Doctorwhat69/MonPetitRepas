import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from './src/services/supabase';
import { Aliment } from './src/types/nutrition';

export default function App() {
  const [aliments, setAliments] = useState<Aliment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAliments() {
      const { data, error } = await supabase.from('aliments').select('*');
      if (error) {
        console.error('Erreur Supabase :', error.message);
      } else {
        setAliments(data || []);
      }
      setLoading(false);
    }
    fetchAliments();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MonPetitRepas - Base Aliments</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={aliments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.nom} (Nutri-Score {item.nutriscore})</Text>
              <Text>{item.calories} kcal | P: {item.proteines}g | G: {item.glucides}g | L: {item.lipides}g</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  name: { fontWeight: '600', marginBottom: 4 },
});