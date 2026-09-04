import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const themeClair = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#212121',
  textSecondary: '#666666',
  border: '#E0E0E0',
  primary: '#00BCD4',       // Cyan (30 %)
  primaryDark: '#00838F',
  accent: '#FF6F61',        // Corail Orange (10 %)
  danger: '#D32F2F',
  isDark: false,
};

export const themeSombre = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#F5F5F5',
  textSecondary: '#AAAAAA',
  border: '#333333',
  primary: '#00BCD4',       
  primaryDark: '#00838F',
  accent: '#FF6F61',
  danger: '#FF5252',
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