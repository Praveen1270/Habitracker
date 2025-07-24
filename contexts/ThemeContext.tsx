import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  setSystemTheme: (useSystem: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@ConsistTracker:theme';
const SYSTEM_THEME_KEY = '@ConsistTracker:useSystemTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (isSystemTheme) {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, isSystemTheme]);

  const loadThemePreference = async () => {
    try {
      const [savedTheme, savedSystemTheme] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(SYSTEM_THEME_KEY),
      ]);

      const useSystemTheme = savedSystemTheme !== 'false';
      setIsSystemTheme(useSystemTheme);

      if (useSystemTheme) {
        setIsDark(systemColorScheme === 'dark');
      } else if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      setIsSystemTheme(false);
      
      await Promise.all([
        AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light'),
        AsyncStorage.setItem(SYSTEM_THEME_KEY, 'false'),
      ]);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setSystemTheme = async (useSystem: boolean) => {
    try {
      setIsSystemTheme(useSystem);
      await AsyncStorage.setItem(SYSTEM_THEME_KEY, useSystem.toString());
      
      if (useSystem) {
        setIsDark(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error saving system theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, isSystemTheme, setSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};