export const LightColors = {
  // Apple-inspired primary colors
  primary: '#007AFF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051D5',
  
  // Sophisticated greens for habit tracking
  success: '#34C759',
  successLight: '#30D158',
  successDark: '#248A3D',
  
  // Premium backgrounds
  background: '#F2F2F7',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  
  // Apple's refined grays
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',
  
  // Text hierarchy
  label: '#000000',
  labelSecondary: '#3C3C43',
  labelTertiary: '#3C3C4399',
  labelQuaternary: '#3C3C432E',
  
  // Semantic colors
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  green: '#34C759',
  mint: '#00C7BE',
  teal: '#30B0C7',
  cyan: '#32D2FF',
  blue: '#007AFF',
  indigo: '#5856D6',
  purple: '#AF52DE',
  pink: '#FF2D92',
  brown: '#A2845E',
  
  // Habit category colors (Apple-inspired)
  categories: {
    Health: '#FF3B30',
    Productivity: '#007AFF',
    Learning: '#5856D6',
    Relationships: '#FF2D92',
    Finance: '#34C759',
    Creativity: '#FF9500',
  },
  
  // Dot visualization colors
  dotColors: {
    empty: '#E5E5EA',
    level1: '#C6F7D0',
    level2: '#7DD87A',
    level3: '#39D353',
    level4: '#26A641',
  },
  
  // Premium habit colors
  habitColors: [
    '#007AFF', '#FF3B30', '#34C759', '#FF9500',
    '#5856D6', '#AF52DE', '#FF2D92', '#00C7BE',
    '#30B0C7', '#32D2FF', '#A2845E', '#8E8E93'
  ]
};

export const DarkColors = {
  // Apple dark mode colors
  primary: '#0A84FF',
  primaryLight: '#64D2FF',
  primaryDark: '#0040DD',
  
  // Dark mode greens
  success: '#30D158',
  successLight: '#32D74B',
  successDark: '#248A3D',
  
  // Dark backgrounds
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  
  // Dark mode grays
  systemGray: '#8E8E93',
  systemGray2: '#636366',
  systemGray3: '#48484A',
  systemGray4: '#3A3A3C',
  systemGray5: '#2C2C2E',
  systemGray6: '#1C1C1E',
  
  // Dark text hierarchy
  label: '#FFFFFF',
  labelSecondary: '#EBEBF5',
  labelTertiary: '#EBEBF599',
  labelQuaternary: '#EBEBF52E',
  
  // Dark semantic colors
  red: '#FF453A',
  orange: '#FF9F0A',
  yellow: '#FFD60A',
  green: '#30D158',
  mint: '#63E6E2',
  teal: '#40CBE0',
  cyan: '#64D2FF',
  blue: '#0A84FF',
  indigo: '#5E5CE6',
  purple: '#BF5AF2',
  pink: '#FF375F',
  brown: '#AC8E68',
  
  // Dark habit category colors
  categories: {
    Health: '#FF453A',
    Productivity: '#0A84FF',
    Learning: '#5E5CE6',
    Relationships: '#FF375F',
    Finance: '#30D158',
    Creativity: '#FF9F0A',
  },
  
  // Dark dot colors
  dotColors: {
    empty: '#2C2C2E',
    level1: '#0D4F1C',
    level2: '#26A641',
    level3: '#39D353',
    level4: '#7DD87A',
  },
  
  // Dark habit colors
  habitColors: [
    '#0A84FF', '#FF453A', '#30D158', '#FF9F0A',
    '#5E5CE6', '#BF5AF2', '#FF375F', '#63E6E2',
    '#40CBE0', '#64D2FF', '#AC8E68', '#8E8E93'
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

export const getColors = (isDark: boolean) => isDark ? DarkColors : LightColors;