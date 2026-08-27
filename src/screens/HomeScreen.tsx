// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Button } from 'react-native';
import { supabase } from '../services/supabase';
import { Aliment } from '../types/nutrition';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// On définit le typage pour la navigation (on ajoutera d'autres écrans plus tard)
type RootStackParamList = {
  Home: undefined;
  Search: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const [aliments, setAliments] = useState<Aliment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAliments() {
      const { data, error } = await supabase.from('aliments').select('*');
      if (!error) setAliments(data || []);
      setLoading(false);
    }
    fetchAliments();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Planning</Text>
        <Button title="Ajouter un repas" onPress={() => navigation.navigate('Search')} />
      </View>

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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  card: { padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  name: { fontWeight: '600', marginBottom: 4 },
});