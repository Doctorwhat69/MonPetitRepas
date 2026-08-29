import React, { useEffect, useState } from 'react';
import { Modal, View, Text, FlatList, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';
import NutriScoreBadge from './NutriScoreBadge';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface RepasSaved {
  id: string;
  created_at: string;
  total_calories: number;
  total_proteines: number;
  total_glucides: number;
  total_lipides: number;
  nutriscore: string;
}

export default function HistoryModal({ visible, onClose }: Props) {
  const [repasList, setRepasList] = useState<RepasSaved[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchRepas();
    }
  }, [visible]);

  const fetchRepas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('repas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRepasList(data);
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Historique des repas</Text>
          <Button title="Fermer" onPress={onClose} color="#d32f2f" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <FlatList
            data={repasList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.headerRow}>
                  <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <NutriScoreBadge score={item.nutriscore} />
                </View>
                <Text style={styles.calories}>{item.total_calories} kcal</Text>
                <Text style={styles.macros}>
                  Prot : {item.total_proteines} g | Gluc : {item.total_glucides} g | Lip : {item.total_lipides} g
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucun repas enregistré pour le moment.</Text>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  date: { fontSize: 13, color: '#666', fontWeight: '500' },
  calories: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  macros: { fontSize: 12, color: '#777', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 30 },
});