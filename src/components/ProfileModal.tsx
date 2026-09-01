import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/supabase';
import { calculerBmrEtMacros } from '../utils/bmr';

interface Props {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated: (calories: number) => void;
}

const DEFAULT_AVATAR = 'https://www.noelshack.com/2026-36-2-1788259018-photo-de-profil-par-d-fault.jpg';

export default function ProfileModal({ visible, onClose, onProfileUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [modeAuto, setModeAuto] = useState(true);

  // Données physiques
  const [age, setAge] = useState('25');
  const [genre, setGenre] = useState<'homme' | 'femme'>('homme');
  const [poids, setPoids] = useState('70');
  const [taille, setTaille] = useState('175');
  const [activite, setActivite] = useState('modere');
  const [objectifPoids, setObjectifPoids] = useState('maintien');

  // Objectifs cibles
  const [calories, setCalories] = useState('2000');
  const [proteines, setProteines] = useState('140');
  const [glucides, setGlucides] = useState('200');
  const [lipides, setLipides] = useState('65');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    if (visible) chargerProfil();
  }, [visible]);

  // Recalcul automatique si changement de métriques en mode automatique
  useEffect(() => {
    if (modeAuto) {
      const p = parseFloat(poids) || 0;
      const t = parseFloat(taille) || 0;
      const a = parseInt(age, 10) || 0;

      if (p > 0 && t > 0 && a > 0) {
        const res = calculerBmrEtMacros(p, t, a, genre, activite, objectifPoids);
        setCalories(res.calories.toString());
        setProteines(res.proteines.toString());
        setGlucides(res.glucides.toString());
        setLipides(res.lipides.toString());
      }
    }
  }, [poids, taille, age, genre, activite, objectifPoids, modeAuto]);

  const chargerProfil = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('profils')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setAge(String(data.age || 25));
        setGenre(data.genre || 'homme');
        setPoids(String(data.poids || 70));
        setTaille(String(data.taille || 175));
        setActivite(data.activite || 'modere');
        setObjectifPoids(data.objectif_poids || 'maintien');
        setCalories(String(data.objectif_calories || 2000));
        setProteines(String(data.objectif_proteines || 140));
        setGlucides(String(data.objectif_glucides || 200));
        setLipides(String(data.objectif_lipides || 65));
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      }
    }
    setLoading(false);
  };

  const Sauvegarder = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const payload = {
        user_id: user.id,
        age: parseInt(age, 10),
        genre,
        poids: parseFloat(poids),
        taille: parseFloat(taille),
        activite,
        objectif_poids: objectifPoids,
        objectif_calories: parseInt(calories, 10),
        objectif_proteines: parseInt(proteines, 10),
        objectif_glucides: parseInt(glucides, 10),
        objectif_lipides: parseInt(lipides, 10),
        avatar_url: avatarUrl,
      };

      const { error } = await supabase
        .from('profils')
        .upsert(payload, { onConflict: 'user_id' });

      if (!error) {
        onProfileUpdated(payload.objectif_calories);
        onClose();
      } else {
        Alert.alert('Erreur', 'Impossible de sauvegarder le profil.');
      }
    }
    setLoading(false);
  };

  const calJour = parseInt(calories, 10) || 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mon Profil Nutritionnel</Text>
          <Button title="Fermer" onPress={onClose} color="#d32f2f" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#00BCD4" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.content}>
            {/* Photo de profil */}
            <View style={styles.avatarSection}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <TextInput
                style={styles.inputAvatar}
                placeholder="Lien d'image d'avatar (URL)..."
                value={avatarUrl}
                onChangeText={setAvatarUrl}
              />
            </View>

            {/* Informations Physiques */}
            <Text style={styles.sectionTitle}>1. Données Personnelles</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.badge, genre === 'homme' && styles.badgeActive]}
                onPress={() => setGenre('homme')}
              >
                <Text style={genre === 'homme' ? styles.textActive : styles.textInactive}>Homme</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.badge, genre === 'femme' && styles.badgeActive]}
                onPress={() => setGenre('femme')}
              >
                <Text style={genre === 'femme' ? styles.textActive : styles.textInactive}>Femme</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.grid2}>
              <View style={styles.field}>
                <Text style={styles.label}>Âge :</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Taille (cm) :</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={taille} onChangeText={setTaille} />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Poids actuel (kg) :</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={poids} onChangeText={setPoids} />
            </View>

            {/* Niveau d'activité */}
            <Text style={styles.label}>Niveau d'activité physique :</Text>
            <View style={styles.wrapRow}>
              {[
                { id: 'sedentaire', label: 'Sédentaire' },
                { id: 'leger', label: 'Légère (1-2x/sem)' },
                { id: 'modere', label: 'Modérée (3-5x/sem)' },
                { id: 'actif', label: 'Intensive (6-7x/sem)' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chip, activite === item.id && styles.chipActive]}
                  onPress={() => setActivite(item.id)}
                >
                  <Text style={activite === item.id ? styles.chipTextActive : styles.chipText}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Objectif de Poids */}
            <Text style={styles.sectionTitle}>2. Objectif de Poids</Text>
            <View style={styles.wrapRow}>
              {[
                { id: 'perte_rapide', label: 'Perte rapide (-500 kcal)' },
                { id: 'perte_douce', label: 'Perte douce (-250 kcal)' },
                { id: 'maintien', label: 'Maintien' },
                { id: 'prise_douce', label: 'Prise de masse (+250 kcal)' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chip, objectifPoids === item.id && styles.chipActive]}
                  onPress={() => setObjectifPoids(item.id)}
                >
                  <Text style={objectifPoids === item.id ? styles.chipTextActive : styles.chipText}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Calcul & Macronutriments */}
            <View style={styles.calcHeader}>
              <Text style={styles.sectionTitle}>3. Objectifs Quotidiens</Text>
              <TouchableOpacity onPress={() => setModeAuto(!modeAuto)}>
                <Text style={styles.toggleAuto}>
                  {modeAuto ? 'Mode : Auto' : 'Mode : Manuel'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Équivalences temporelles de calories */}
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>Jour : {calJour} kcal</Text>
              <Text style={styles.timeText}>Semaine : {(calJour * 7).toLocaleString('fr-FR')} kcal</Text>
              <Text style={styles.timeText}>Mois : {(calJour * 30).toLocaleString('fr-FR')} kcal</Text>
            </View>

            <View style={styles.grid3}>
              <View style={styles.field}>
                <Text style={styles.label}>Prot (g) :</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  editable={!modeAuto}
                  value={proteines}
                  onChangeText={setProteines}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Gluc (g) :</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  editable={!modeAuto}
                  value={glucides}
                  onChangeText={setGlucides}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Lip (g) :</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  editable={!modeAuto}
                  value={lipides}
                  onChangeText={setLipides}
                />
              </View>
            </View>

            <View style={{ marginTop: 20, marginBottom: 40 }}>
              <Button title="Enregistrer le profil" onPress={Sauvegarder} color="#00BCD4" />
            </View>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { gap: 10 },
  avatarSection: { alignItems: 'center', marginBottom: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8, borderWidth: 2, borderColor: '#00BCD4' },
  inputAvatar: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 6, fontSize: 12, width: '100%' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#00838F', marginTop: 10 },
  row: { flexDirection: 'row', gap: 10, marginVertical: 6 },
  badge: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#e0e0e0', alignItems: 'center' },
  badgeActive: { backgroundColor: '#00BCD4' },
  textActive: { color: '#fff', fontWeight: 'bold' },
  textInactive: { color: '#444' },
  grid2: { flexDirection: 'row', gap: 10 },
  grid3: { flexDirection: 'row', gap: 8 },
  field: { flex: 1 },
  label: { fontSize: 13, color: '#555', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, fontSize: 15 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 },
  chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: '#00BCD4', borderColor: '#00BCD4' },
  chipText: { fontSize: 12, color: '#444' },
  chipTextActive: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  calcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  toggleAuto: { fontSize: 13, color: '#00838F', fontWeight: 'bold' },
  timeBox: { backgroundColor: '#E0F7FA', padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  timeText: { fontSize: 11, color: '#006064', fontWeight: '600' },
});