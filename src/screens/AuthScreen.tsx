import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles'; 

export default function AuthScreen() {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleAuth = async () => {
    setMessage(null);

    if (!email || !password) {
      setMessage({ text: 'Remplis tous les champs.', isError: true });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: 'Le mot de passe doit contenir au moins 6 caractères.', isError: true });
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ text: error.message, isError: true });
      } else if (data.session) {
        setMessage({ text: 'Compte créé et connecté !', isError: false });
      } else {
        setMessage({ 
          text: 'Compte créé ! Vérifie tes e-mails pour confirmer ton compte.', 
          isError: false 
        });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ text: error.message, isError: true });
      }
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={globalStyles.container}
    >
      <View style={styles.innerContainer}>
        
        {/* En-tête / Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="leaf" size={40} color="#FFF" />
          </View>
          <Text style={[globalStyles.title, { fontSize: 26, marginTop: 16, marginBottom: 4 }]}>
            MonPetitRepas
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 30 }}>
            {isSignUp ? 'Créez votre compte pour commencer.' : 'Heureux de vous revoir !'}
          </Text>
        </View>

        {/* Message d'erreur ou succès */}
        {message && (
          <View style={[globalStyles.messageBox, message.isError ? globalStyles.errorBox : globalStyles.successBox]}>
            <Text style={[globalStyles.messageText, message.isError ? globalStyles.errorText : globalStyles.successText]}>
              {message.text}
            </Text>
          </View>
        )}

        {/* Formulaire */}
        <Text style={globalStyles.label}>Adresse e-mail</Text>
        <TextInput
          style={[globalStyles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="votre@email.com"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[globalStyles.label, { marginTop: 8 }]}>Mot de passe</Text>
        <TextInput
          style={[globalStyles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="6 caractères min."
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Bouton d'action personnalisé */}
        <TouchableOpacity 
          style={[globalStyles.button, { marginTop: 20 }]} 
          onPress={handleAuth} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={globalStyles.buttonText}>
              {isSignUp ? "S'inscrire" : 'Se connecter'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Bouton bascule (Connexion <-> Inscription) */}
        <TouchableOpacity 
          onPress={() => { setIsSignUp(!isSignUp); setMessage(null); }} 
          style={globalStyles.toggleContainer}
        >
          <Text style={globalStyles.toggleText}>
            {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas encore de compte ? S'inscrire"}
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40, // Remonte légèrement le contenu pour l'esthétique
  },
  logoSection: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // Ombre douce pour l'icône
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  }
});