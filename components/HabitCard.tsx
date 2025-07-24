import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { CircleCheck as CheckCircle, Circle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Habit, HabitLog, HabitStreak } from '../types/habit';
import { getColors } from '../constants/colors';
import { HabitUtils } from '../utils/habitUtils';
import { useTheme } from '../contexts/ThemeContext';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  streak: HabitStreak;
  onToggleComplete: (habit: Habit) => void;
  onPress?: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  logs,
  streak,
  onToggleComplete,
  onPress,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const isCompleted = HabitUtils.isHabitCompletedToday(habit.id, logs);
  const completionRate = HabitUtils.getCompletionRate(habit.id, logs, 30);

  const handleToggle = () => {
    onToggleComplete(habit);
  };

  const handlePress = () => {
    onPress?.(habit);
  };

  const getHabitTypeDescription = () => {
    switch (habit.habitType) {
      case 'daily':
        return 'Daily habit';
      case 'weekly':
        return `${habit.targetFrequency || 3} times per week`;
      case 'quantity':
        return `Target: ${habit.targetValue || 1} per day`;
      default:
        return 'Daily habit';
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <LinearGradient
        colors={isDark ? ['#1C1C1E', '#2C2C2E'] : ['#FFFFFF', '#F8F9FA']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={[styles.colorIndicator, { backgroundColor: habit.color }]} />
              <View style={styles.textContainer}>
                <Text style={styles.title}>{habit.name}</Text>
                <Text style={styles.typeDescription}>{getHabitTypeDescription()}</Text>
                {habit.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {habit.description}
                  </Text>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.checkButton, isCompleted && styles.checkButtonCompleted]}
              onPress={handleToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isCompleted ? (
                <CheckCircle size={32} color={colors.success} />
              ) : (
                <Circle size={32} color={colors.systemGray2} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak.currentStreak}</Text>
              <Text style={styles.statLabel}>Current</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak.longestStreak}</Text>
              <Text style={styles.statLabel}>Best</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>30-Day</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[habit.color + '80', habit.color]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${completionRate}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{completionRate}% this month</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  colorIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 4,
    lineHeight: 22,
  },
  typeDescription: {
    fontSize: 14,
    color: colors.labelSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.labelTertiary,
    lineHeight: 20,
  },
  checkButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.systemGray6,
  },
  checkButtonCompleted: {
    backgroundColor: colors.success + '20',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: colors.systemGray6,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.systemGray4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.labelSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.systemGray5,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: colors.labelSecondary,
    fontWeight: '500',
  },
});