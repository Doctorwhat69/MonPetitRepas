import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useProfile } from '../hooks/useProfile';
import { ProfileData, calculerObjectifs } from '../utils/bmr';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileModal({ visible, onClose }: Props) {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const { profile, updateProfile, isUpdating } = useProfile();

  const [sexe, setSexe] = useState<'homme' | 'femme'>('homme');
  const [age, setAge] = useState('25');
  const [poids, setPoids] = useState('70');
  const [taille, setTaille] = useState('175');
  const [activite, setActivite] = useState<'sedentaire' | 'leger' | 'modere' | 'actif' | 'tres_actif'>('modere');
  const [objectif, setObjectif] = useState<'perte' | 'maintien' | 'prise'>('maintien');

  useEffect(() => {
    if (profile) {
      setSexe(profile.sexe);
      setAge(String(profile.age));
      setPoids(String(profile.poids));
      setTaille(String(profile.taille));
      setActivite(profile.activite);
      setObjectif(profile.objectif);
    }
  }, [profile]);

  // Aperçu en temps réel
  const currentParams: ProfileData = {
    sexe,
    age: parseFloat(age) || 25,
    poids: parseFloat(poids) || 70,
    taille: parseFloat(taille) || 175,
    activite,
    objectif,
  };
  const preview = calculerObjectifs(currentParams);

  const handleSave = async () => {
    await updateProfile(currentParams);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[globalStyles.sectionTitle, { marginBottom: 16 }]}>Mon Profil & Objectifs</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sexe */}
            <Text style={[styles.label, { color: theme.text }]}>Sexe</Text>
            <View style={styles.rowBtn}>
              <TouchableOpacity
                style={[styles.segmentBtn, sexe === 'homme' && { backgroundColor: theme.primary }]}
                onPress={() => setSexe('homme')}
              >
                <Text style={{ color: sexe === 'homme' ? '#FFF' : theme.textSecondary, fontWeight: 'bold' }}>Homme</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, sexe === 'femme' && { backgroundColor: theme.primary }]}
                onPress={() => setSexe('femme')}
              >
                <Text style={{ color: sexe === 'femme' ? '#FFF' : theme.textSecondary, fontWeight: 'bold' }}>Femme</Text>
              </TouchableOpacity>
            </View>

            {/* Mensurations */}
            <View style={styles.rowInput}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text }]}>Âge</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text }]}>Poids (kg)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  keyboardType="numeric"
                  value={poids}
                  onChangeText={setPoids}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text }]}>Taille (cm)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  keyboardType="numeric"
                  value={taille}
                  onChangeText={setTaille}
                />
              </View>
            </View>

            {/* Objectif */}
            <Text style={[styles.label, { color: theme.text, marginTop: 10 }]}>Objectif</Text>
            <View style={styles.rowBtn}>
              <TouchableOpacity
                style={[styles.segmentBtn, objectif === 'perte' && { backgroundColor: theme.primary }]}
                onPress={() => setObjectif('perte')}
              >
                <Text style={{ color: objectif === 'perte' ? '#FFF' : theme.textSecondary, fontSize: 12, fontWeight: 'bold' }}>Perte</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, objectif === 'maintien' && { backgroundColor: theme.primary }]}
                onPress={() => setObjectif('maintien')}
              >
                <Text style={{ color: objectif === 'maintien' ? '#FFF' : theme.textSecondary, fontSize: 12, fontWeight: 'bold' }}>Maintien</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, objectif === 'prise' && { backgroundColor: theme.primary }]}
                onPress={() => setObjectif('prise')}
              >
                <Text style={{ color: objectif === 'prise' ? '#FFF' : theme.textSecondary, fontSize: 12, fontWeight: 'bold' }}>Prise</Text>
              </TouchableOpacity>
            </View>

            {/* Aperçu des cibles calculées */}
            <View style={[styles.previewCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>Besoins calculés :</Text>
              <Text style={{ color: theme.primary, fontSize: 20, fontWeight: 'bold' }}>
                {preview.calories_cible} kcal / jour
              </Text>
              <Text style={{ color: theme.text, fontSize: 12, marginTop: 4 }}>
                P: {preview.proteines_cible}g | G: {preview.glucides_cible}g | L: {preview.lipides_cible}g
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.border }]} onPress={onClose}>
              <Text style={{ color: theme.text, fontWeight: 'bold' }}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 0, flex: 1 }]}
              onPress={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={globalStyles.buttonText}>Enregistrer</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    maxHeight: '85%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  rowInput: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  rowBtn: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  previewCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});