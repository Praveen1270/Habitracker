export const LightColors = {
  // Primary green palette for dot visualization
  dotColors: {
    empty: '#f0f0f0',
    level1: '#c6e48b', // 1-25%
    level2: '#7bc96f', // 26-50%
    level3: '#239a3b', // 51-75%
    level4: '#196127', // 76-100%
  },
  
  // Main app colors
  primary: '#196127',
  secondary: '#7bc96f',
  accent: '#ffd700',
  
  // Background colors
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',
  
  // Text colors
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  textLight: '#ffffff',
  
  // Status colors
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',
  
  // Habit category colors
  categories: {
    Health: '#e74c3c',
    Productivity: '#3498db',
    Learning: '#9b59b6',
    Relationships: '#e91e63',
    Finance: '#2ecc71',
    Creativity: '#f39c12',
  },
  
  // Additional colors for customization
  habitColors: [
    '#196127', '#e74c3c', '#3498db', '#9b59b6',
    '#e91e63', '#2ecc71', '#f39c12', '#34495e',
    '#16a085', '#8e44ad', '#2980b9', '#27ae60'
  ]
};

export const DarkColors = {
  // Primary green palette for dot visualization (adjusted for dark mode)
  dotColors: {
    empty: '#2d3748',
    level1: '#68d391', // 1-25%
    level2: '#48bb78', // 26-50%
    level3: '#38a169', // 51-75%
    level4: '#2f855a', // 76-100%
  },
  
  // Main app colors
  primary: '#48bb78',
  secondary: '#68d391',
  accent: '#ffd700',
  
  // Background colors
  background: '#1a202c',
  surface: '#2d3748',
  card: '#2d3748',
  
  // Text colors
  textPrimary: '#f7fafc',
  textSecondary: '#a0aec0',
  textLight: '#ffffff',
  
  // Status colors
  success: '#48bb78',
  warning: '#ed8936',
  error: '#f56565',
  info: '#4299e1',
  
  // Habit category colors (adjusted for dark mode)
  categories: {
    Health: '#fc8181',
    Productivity: '#63b3ed',
    Learning: '#b794f6',
    Relationships: '#f687b3',
    Finance: '#68d391',
    Creativity: '#f6ad55',
  },
  
  // Additional colors for customization
  habitColors: [
    '#48bb78', '#fc8181', '#63b3ed', '#b794f6',
    '#f687b3', '#68d391', '#f6ad55', '#718096',
    '#4fd1c7', '#9f7aea', '#4299e1', '#38a169'
  ]
};

export const getCompletionColor = (percentage: number, isDark: boolean = false): string => {
  const colors = isDark ? DarkColors : LightColors;
  if (percentage === 0) return colors.dotColors.empty;
  if (percentage <= 25) return colors.dotColors.level1;
  if (percentage <= 50) return colors.dotColors.level2;
  if (percentage <= 75) return colors.dotColors.level3;
  return colors.dotColors.level4;
};

// Dynamic color getter based on theme
export const getColors = (isDark: boolean) => isDark ? DarkColors : LightColors;