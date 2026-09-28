import React, { useState, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabase';
import { NutriScoreGrade } from '../types/nutrition';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NUTRISCORES: NutriScoreGrade[] = ['A', 'B', 'C', 'D', 'E'];

export default function AddCustomFoodModal({ visible, onClose, onSuccess }: Props) {
  const { theme } = useContext(ThemeContext);
  const { showToast } = useToast();

  const [nom, setNom] = useState('');
  const [portionDesc, setPortionDesc] = useState('1 portion');
  const [portionPoids, setPortionPoids] = useState('100');
  const [calories, setCalories] = useState('');
  const [proteines, setProteines] = useState('');
  const [glucides, setGlucides] = useState('');
  const [lipides, setLipides] = useState('');
  const [nutriscore, setNutriscore] = useState<NutriScoreGrade>('C');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!nom.trim()) {
      showToast('Veuillez renseigner le nom de l’aliment.', 'info');
      return;
    }

    const cal = parseFloat(calories.replace(',', '.')) || 0;
    const prot = parseFloat(proteines.replace(',', '.')) || 0;
    const gluc = parseFloat(glucides.replace(',', '.')) || 0;
    const lip = parseFloat(lipides.replace(',', '.')) || 0;
    const poidsG = parseFloat(portionPoids.replace(',', '.')) || 100;

    if (cal <= 0) {
      showToast('Les calories doivent être supérieures à 0.', 'info');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('aliments').insert([
        {
          nom: nom.trim(),
          categorie: 'Personnalisé',
          portion_description: portionDesc.trim() || '1 portion',
          portion_poids_g: poidsG,
          calories: Math.round(cal),
          proteines: Number(prot.toFixed(1)),
          glucides: Number(gluc.toFixed(1)),
          lipides: Number(lip.toFixed(1)),
          nutriscore,
        },
      ]);

      if (error) throw error;

      showToast('Aliment personnalisé créé avec succès !', 'success');

      // Réinitialisation
      setNom('');
      setPortionDesc('1 portion');
      setPortionPoids('100');
      setCalories('');
      setProteines('');
      setGlucides('');
      setLipides('');
      setNutriscore('C');

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création de l’aliment.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Créer un aliment</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={26} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: theme.text }]}>Nom de l'aliment</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Ex : Muesli maison"
              placeholderTextColor={theme.textSecondary}
              value={nom}
              onChangeText={setNom}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text }]}>Description portion</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="Ex : 1 bol"
                  placeholderTextColor={theme.textSecondary}
                  value={portionDesc}
                  onChangeText={setPortionDesc}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text }]}>Poids portion (g)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="100"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={portionPoids}
                  onChangeText={setPortionPoids}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.text, marginTop: 6 }]}>
              Valeurs nutritionnelles (pour la portion)
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Calories (kcal)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Protéines (g)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={proteines}
                  onChangeText={setProteines}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Glucides (g)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={glucides}
                  onChangeText={setGlucides}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Lipides (g)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={lipides}
                  onChangeText={setLipides}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.text, marginTop: 6 }]}>Nutri-Score estimé</Text>
            <View style={styles.scoreRow}>
              {NUTRISCORES.map((score) => {
                const selected = nutriscore === score;
                return (
                  <TouchableOpacity
                    key={score}
                    style={[
                      styles.scoreBtn,
                      { borderColor: theme.border },
                      selected && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setNutriscore(score)}
                  >
                    <Text style={{ color: selected ? '#FFF' : theme.text, fontWeight: 'bold' }}>
                      {score}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Créer l'aliment</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  scoreBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  submitBtn: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});