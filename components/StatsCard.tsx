import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  color,
  icon,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const displayColor = color || colors.primary;
  
  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#1C1C1E', '#2C2C2E'] : ['#FFFFFF', '#F8F9FA']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: displayColor + '15' }]}>
                {icon}
              </View>
            )}
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          </View>
          
          <Text style={[styles.value, { color: displayColor }]}>{value}</Text>
          
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.labelSecondary,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 13,
    color: colors.labelTertiary,
    fontWeight: '500',
  },
});