import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { CircleCheck as CheckCircle, Circle } from 'lucide-react-native';
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

  const styles = createStyles(colors);

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={[styles.colorIndicator, { backgroundColor: habit.color }]} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{habit.name}</Text>
              <Text style={styles.typeDescription}>{getHabitTypeDescription()}</Text>
              {habit.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {habit.description}
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.checkButton}
            onPress={handleToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isCompleted ? (
              <CheckCircle size={28} color={colors.primary} />
            ) : (
              <Circle size={28} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streak.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streak.longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completionRate}%</Text>
            <Text style={styles.statLabel}>30-Day Rate</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${completionRate}%`,
                backgroundColor: habit.color 
              }
            ]} 
          />
        </View>
      </View>
    </Pressable>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  typeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkButton: {
    padding: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});