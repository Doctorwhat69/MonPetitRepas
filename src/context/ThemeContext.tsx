import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const themeClair = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#2D8C60',       // Vert Figma principal
  primaryDark: '#1E6142',
  accent: '#FF6F61',        // Corail Orange
  danger: '#EF4444',
  
  // NOUVEAU : Couleurs des macros du design Figma
  protein: '#2D8C60',      // Vert
  carbs: '#E58E26',        // Orange / Jaune
  fat: '#E55039',          // Rouge / Corail
  
  isDark: false,
};

export const themeSombre = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#F5F5F5',
  textSecondary: '#AAAAAA',
  border: '#333333',
  primary: '#34A853',       // Vert lisible en mode sombre
  primaryDark: '#2D8C60',
  accent: '#FF6F61',
  danger: '#FF5252',
  
  protein: '#34A853',
  carbs: '#F39C12',
  fat: '#FF5252',
  
  isDark: true,
};

export type Theme = typeof themeClair;

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: themeClair,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? themeSombre : themeClair;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};