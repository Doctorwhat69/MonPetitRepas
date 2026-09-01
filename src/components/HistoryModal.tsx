import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/supabase';
import NutriScoreBadge from './NutriScoreBadge';

interface RepasHistorique {
  id: string;
  created_at: string;
  total_calories: number;
  total_proteines: number;
  total_glucides: number;
  total_lipides: number;
  nutriscore: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function HistoryModal({ visible, onClose }: Props) {
  const [historique, setHistorique] = useState<RepasHistorique[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMeal, setEditingMeal] = useState<RepasHistorique | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) chargerHistorique();
  }, [visible]);

  const chargerHistorique = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('repas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHistorique(data);
    }
    setLoading(false);
  };

  const confirmerSuppression = async () => {
    if (!deletingId) return;

    const { error } = await supabase.from('repas').delete().eq('id', deletingId);

    if (!error) {
      setHistorique((prev) => prev.filter((item) => item.id !== deletingId));
      setDeletingId(null);
    } else {
      Alert.alert('Erreur', error.message || 'Impossible de supprimer ce repas.');
      setDeletingId(null);
    }
  };

  const SauvegarderModification = async () => {
    if (!editingMeal) return;

    const { error } = await supabase
      .from('repas')
      .update({
        total_calories: Number(editingMeal.total_calories),
        total_proteines: Number(editingMeal.total_proteines),
        total_glucides: Number(editingMeal.total_glucides),
        total_lipides: Number(editingMeal.total_lipides),
      })
      .eq('id', editingMeal.id);

    if (!error) {
      setHistorique((prev) =>
        prev.map((item) => (item.id === editingMeal.id ? editingMeal : item))
      );
      setEditingMeal(null);
    } else {
      Alert.alert('Erreur', 'Échec de la mise à jour.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Historique des repas</Text>
          <Button title="Fermer" onPress={onClose} color="#d32f2f" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={historique}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const date = new Date(item.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.dateText}>{date}</Text>
                    <NutriScoreBadge score={item.nutriscore} />
                  </View>

                  <Text style={styles.caloriesText}>{item.total_calories} kcal</Text>
                  <Text style={styles.macrosText}>
                    P: {item.total_proteines}g | G: {item.total_glucides}g | L: {item.total_lipides}g
                  </Text>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => setEditingMeal(item)}>
                      <Text style={styles.editBtn}>Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDeletingId(item.id)}>
                      <Text style={styles.deleteBtn}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>Aucun repas enregistré pour le moment.</Text>
            }
          />
        )}

        {/* Modale de confirmation de suppression */}
        {deletingId && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.dialogCard}>
                <Text style={styles.dialogTitle}>Supprimer ce repas ?</Text>
                <Text style={styles.dialogSub}>Cette action est irréversible.</Text>
                <View style={styles.editButtons}>
                  <Button title="Annuler" color="#777" onPress={() => setDeletingId(null)} />
                  <Button title="Supprimer" color="#d32f2f" onPress={confirmerSuppression} />
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Modale d'édition */}
        {editingMeal && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.editCard}>
                <Text style={styles.editTitle}>Modifier le repas</Text>

                <Text style={styles.label}>Calories (kcal) :</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(editingMeal.total_calories)}
                  onChangeText={(v) => setEditingMeal({ ...editingMeal, total_calories: Number(v) })}
                />

                <Text style={styles.label}>Protéines (g) :</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(editingMeal.total_proteines)}
                  onChangeText={(v) => setEditingMeal({ ...editingMeal, total_proteines: Number(v) })}
                />

                <View style={styles.editButtons}>
                  <Button title="Annuler" color="#777" onPress={() => setEditingMeal(null)} />
                  <Button title="Valider" color="#4CAF50" onPress={SauvegarderModification} />
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 13, color: '#666', fontWeight: '500' },
  caloriesText: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  macrosText: { fontSize: 13, color: '#444' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 10 },
  editBtn: { color: '#007AFF', fontWeight: '600' },
  deleteBtn: { color: '#d32f2f', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', marginTop: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  editCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  dialogCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  dialogTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  dialogSub: { fontSize: 14, color: '#666', marginBottom: 16 },
  editTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  label: { fontSize: 13, color: '#555', marginBottom: 4 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 10 },
  editButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});