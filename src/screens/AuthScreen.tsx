import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabase';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles'; 

export default function AuthScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = getGlobalStyles(theme);
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
          text: 'Compte créé ! Vérifie tes e-mails pour confirmer ton compte, ou désactive la confirmation dans Supabase.', 
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
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Créer un compte' : 'Connexion'}</Text>

      {message && (
        <View style={[styles.messageBox, message.isError ? styles.errorBox : styles.successBox]}>
          <Text style={[styles.messageText, message.isError ? styles.errorText : styles.successText]}>
            {message.text}
          </Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe (6 caractères min.)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={loading ? 'Chargement...' : isSignUp ? "S'inscrire" : 'Se connecter'}
        onPress={handleAuth}
        disabled={loading}
      />

      <TouchableOpacity 
        onPress={() => { setIsSignUp(!isSignUp); setMessage(null); }} 
        style={styles.toggleContainer}
      >
        <Text style={styles.toggleText}>
          {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas encore de compte ? S'inscrire"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

