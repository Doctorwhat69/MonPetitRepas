import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useProfile } from '../hooks/useProfile';
import { ProfileData, calculerObjectifs } from '../utils/bmr';
import { supabase } from '../services/supabase';

const ACTIVITES = [
  { key: 'sedentaire', label: 'Sédentaire' },
  { key: 'leger', label: 'Légèrement actif' },
  { key: 'modere', label: 'Modérément actif' },
  { key: 'actif', label: 'Actif' },
  { key: 'tres_actif', label: 'Très actif' },
];

export default function ProfileScreen() {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
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
      setSexe(profile.sexe || 'homme');
      setAge(String(profile.age || 25));
      setPoids(String(profile.poids || 70));
      setTaille(String(profile.taille || 175));
      setActivite(profile.activite || 'modere');
      setObjectif(profile.objectif || 'maintien');
    }
  }, [profile]);

  // Aperçu des besoins calculés
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
    try {
      await updateProfile(currentParams);
      const msg = 'Profil et objectifs mis à jour !';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Succès', msg);
    } catch (err: any) {
      const msg = err.message || 'Erreur lors de la sauvegarde';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Erreur', msg);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <ScrollView style={[globalStyles.container, { paddingTop: 50 }]} showsVerticalScrollIndicator={false}>
      <Text style={[globalStyles.title, { marginBottom: 16 }]}>Mon Profil</Text>

      {/* 1. Carte En-tête Profil */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {profile?.prenom ? `${profile.prenom}` : 'Thomas Dubois'}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              {profile?.email || 'thomas.dubois@email.com'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Carte Informations Personnelles */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Informations Personnelles</Text>

        {/* Sélecteur Sexe */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Sexe</Text>
        <View style={styles.rowBtn}>
          <TouchableOpacity
            style={[styles.segmentBtn, { borderColor: theme.border }, sexe === 'homme' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setSexe('homme')}
          >
            <Text style={{ color: sexe === 'homme' ? '#FFF' : theme.textSecondary, fontWeight: 'bold', fontSize: 12 }}>
              Homme
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, { borderColor: theme.border }, sexe === 'femme' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setSexe('femme')}
          >
            <Text style={{ color: sexe === 'femme' ? '#FFF' : theme.textSecondary, fontWeight: 'bold', fontSize: 12 }}>
              Femme
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grille Mensurations */}
        <View style={styles.rowInput}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Âge</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Poids (kg)</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              keyboardType="numeric"
              value={poids}
              onChangeText={setPoids}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Taille (cm)</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              keyboardType="numeric"
              value={taille}
              onChangeText={setTaille}
            />
          </View>
        </View>

        {/* Niveau d'activité */}
        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 10 }]}>Niveau d'activité</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {ACTIVITES.map((act) => {
              const isSelected = activite === act.key;
              return (
                <TouchableOpacity
                  key={act.key}
                  style={[
                    styles.chip,
                    { borderColor: theme.border, backgroundColor: theme.background },
                    isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setActivite(act.key as any)}
                >
                  <Text style={{ color: isSelected ? '#FFF' : theme.textSecondary, fontSize: 11, fontWeight: '600' }}>
                    {act.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 3. Carte Objectifs Nutritionnels */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Objectifs Nutritionnels</Text>

        {/* Choix Objectif */}
        <View style={[styles.rowBtn, { marginTop: 8 }]}>
          {(['perte', 'maintien', 'prise'] as const).map((obj) => {
            const isSelected = objectif === obj;
            const labels = { perte: 'Perte', maintien: 'Maintien', prise: 'Prise de masse' };
            return (
              <TouchableOpacity
                key={obj}
                style={[
                  styles.segmentBtn,
                  { borderColor: theme.border },
                  isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => setObjectif(obj)}
              >
                <Text style={{ color: isSelected ? '#FFF' : theme.textSecondary, fontSize: 11, fontWeight: 'bold' }}>
                  {labels[obj]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Résultat calculé / Jauges Figma */}
        <View style={[styles.targetSummary, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.rowBetween}>
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>Cible Calorique</Text>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>
              {preview.calories_cible} kcal
            </Text>
          </View>

          {/* Barres des Macros */}
          <View style={{ marginTop: 14, gap: 10 }}>
            {/* Protéines */}
            <View>
              <View style={styles.rowBetween}>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Protéines (25%)</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>{preview.proteines_cible}g</Text>
              </View>
              <View style={styles.macroTrack}>
                <View style={[styles.macroBar, { width: '25%', backgroundColor: theme.protein }]} />
              </View>
            </View>

            {/* Glucides */}
            <View>
              <View style={styles.rowBetween}>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Glucides (45%)</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>{preview.glucides_cible}g</Text>
              </View>
              <View style={styles.macroTrack}>
                <View style={[styles.macroBar, { width: '45%', backgroundColor: theme.carbs }]} />
              </View>
            </View>

            {/* Lipides */}
            <View>
              <View style={styles.rowBetween}>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Lipides (30%)</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>{preview.lipides_cible}g</Text>
              </View>
              <View style={styles.macroTrack}>
                <View style={[styles.macroBar, { width: '30%', backgroundColor: theme.fat }]} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Mode sombre toggle & Bouton enregistrer */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 100 }]}>
        <TouchableOpacity style={styles.rowBetween} onPress={toggleTheme}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color={theme.primary} />
            <Text style={{ color: theme.text, fontWeight: '600', fontSize: 14 }}>Mode sombre</Text>
          </View>
          <Ionicons name={isDarkMode ? 'toggle' : 'toggle-outline'} size={28} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.button, { marginTop: 16 }]}
          onPress={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={globalStyles.buttonText}>Enregistrer les modifications</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
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
    borderRadius: 8,
    borderWidth: 1,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  targetSummary: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  macroBar: {
    height: '100%',
    borderRadius: 3,
  },
});